/**
 * Docker / Node 部署下的视频压缩实现
 *
 * 与 imageProcessor.js 的思路一致：把运行时相关的能力注入 env，
 * functions/ 里的 Worker 代码只调用 env.VIDEO_PROCESSOR.compress()，
 * 因此同一份上传逻辑可同时运行在 Cloudflare Workers 与本机 Node 上。
 */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AUDIO_BITRATE_KBPS = 96;
const MIN_VIDEO_BITRATE_KBPS = 120;
const DEFAULT_TIMEOUT_MS = 600000;

const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobePath = process.env.FFPROBE_PATH || 'ffprobe';
const threads = String(readPositiveInteger(process.env.VIDEO_COMPRESS_THREADS, 2));

function readPositiveInteger(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/** 执行子进程，限制超时并保留最近的错误输出，便于给出可读的失败提示 */
function runCommand(command, args, timeoutMs) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';
        let settled = false;

        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            finish(new Error(`Command timed out after ${timeoutMs} ms`));
        }, timeoutMs);

        const finish = (error, result) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(result);
        };

        child.stdout.on('data', chunk => { stdout = (stdout + chunk).slice(-4000); });
        child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-8000); });
        child.on('error', error => finish(new Error(`Cannot start ${command}: ${error.message}. Install ffmpeg or set FFMPEG_PATH.`)));
        child.on('close', code => finish(null, { code, stdout, stderr }));
    });
}

/** 读取时长，用于把「目标文件大小」换算成目标码率；探测失败时退回 CRF 模式 */
async function probeDuration(inputPath) {
    try {
        const { code, stdout } = await runCommand(ffprobePath, [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            inputPath,
        ], 15000);
        if (code !== 0) return 0;
        const duration = Number(stdout.trim().split('\n')[0]);
        return Number.isFinite(duration) && duration > 0 ? duration : 0;
    } catch (error) {
        console.warn('Video duration probe failed, falling back to CRF mode:', error.message);
        return 0;
    }
}

function buildFfmpegArgs(inputPath, outputPath, options, duration) {
    const quality = clamp(Number(options.quality ?? 70), 0, 100);
    // 画质 100 -> CRF 18（几乎无损），画质 0 -> CRF 40（高压缩率）
    const crf = Math.round(18 + (100 - quality) * 0.22);
    const targetSizeMB = Math.max(0, Number(options.targetSizeMB) || 0);
    const isWebm = options.format === 'webm';

    const args = ['-y', '-hide_banner', '-loglevel', 'error', '-i', inputPath,
        '-map', '0:v:0', '-map', '0:a:0?', '-threads', threads];

    if (isWebm) {
        args.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '5', '-pix_fmt', 'yuv420p');
        args.push('-c:a', 'libopus', '-b:a', `${AUDIO_BITRATE_KBPS}k`);
    } else {
        args.push('-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p');
        args.push('-c:a', 'aac', '-b:a', `${AUDIO_BITRATE_KBPS}k`, '-movflags', '+faststart');
    }

    if (targetSizeMB > 0 && duration > 0) {
        // 目标总码率(kbps) = 目标体积(MB) * 8 * 1024 / 时长(s)，再扣掉音频码率
        const totalKbps = (targetSizeMB * 8 * 1024) / duration;
        const videoKbps = Math.max(MIN_VIDEO_BITRATE_KBPS, Math.floor(totalKbps - AUDIO_BITRATE_KBPS));
        args.push('-b:v', `${videoKbps}k`, '-maxrate', `${Math.ceil(videoKbps * 1.2)}k`, '-bufsize', `${videoKbps * 2}k`);
    } else if (isWebm) {
        // VP9 使用 CRF 时必须显式关闭目标码率
        args.push('-b:v', '0', '-crf', String(crf));
    } else {
        args.push('-crf', String(crf));
    }

    args.push(outputPath);
    return args;
}

export const dockerVideoProcessor = {
    /**
     * @param {ArrayBuffer|Uint8Array} input - 原始视频字节
     * @param {Object} options - readVideoCompressionConfig() 的输出
     * @returns {{data: Buffer, extension: string, type: string}}
     */
    async compress(input, options = {}) {
        const format = options.format === 'webm' ? 'webm' : 'mp4';
        const timeoutMs = readPositiveInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS);
        const workDir = await mkdtemp(join(tmpdir(), 'imgbed-video-'));
        // 保留原始扩展名，便于 ffmpeg 正确识别 mov/mkv/avi 容器
        const sourceExt = /\.([a-z0-9]+)$/i.exec(String(options.sourceFileName || ''))?.[1]?.toLowerCase();
        const inputExt = /^[a-z0-9]{1,5}$/.test(sourceExt || '') ? sourceExt : (format === 'webm' ? 'webm' : 'mp4');
        const inputPath = join(workDir, `input.${inputExt}`);
        const outputPath = join(workDir, `output.${format}`);

        try {
            await writeFile(inputPath, Buffer.from(input));
            const duration = await probeDuration(inputPath);
            const args = buildFfmpegArgs(inputPath, outputPath, { ...options, format }, duration);
            const { code, stderr } = await runCommand(ffmpegPath, args, timeoutMs);
            if (code !== 0) {
                throw new Error(`ffmpeg exited with code ${code}${stderr ? `: ${stderr.trim().slice(-500)}` : ''}`);
            }
            const data = await readFile(outputPath);
            if (!data.byteLength) {
                throw new Error('ffmpeg produced an empty output file');
            }
            return { data, extension: format, type: `video/${format}` };
        } finally {
            await rm(workDir, { recursive: true, force: true });
        }
    },
};
