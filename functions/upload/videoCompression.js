/**
 * 视频压缩工具
 *
 * 设计目标：
 * 1. 默认关闭，且只对视频文件生效，原有图片/普通文件上传行为完全不变；
 * 2. 压缩结果重新写回 formdata.get('file')，后续仍走原有渠道上传逻辑；
 * 3. Worker 运行时不能执行 ffmpeg，因此压缩引擎做成可插拔：
 *    - Docker/Node 部署：env.VIDEO_PROCESSOR（deploy/server/videoProcessor.js，调用本机 ffmpeg）；
 *    - Workers/Pages 部署：VIDEO_COMPRESS_ENDPOINT 指向外部 ffmpeg 转码服务；
 *    - 两者都没有配置时给出明确提示，而不是静默上传原文件。
 *
 * 配置优先级：单次请求的 URL 参数 > 环境变量 > 系统配置(manage@sysConfig@upload.videoCompression) > 默认值。
 */
import { getFileExtension, getFileTypeCategory, normalizeMimeType } from '../utils/mimeTypes.js';

const MB = 1024 * 1024;

// 支持转码的输入格式（扩展名）
const SUPPORTED_INPUT_EXTENSIONS = new Set(['mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi']);
// 常见的视频扩展名，用于识别「不受支持」的视频，避免把 .flv 之类当成普通文件静默跳过
const KNOWN_VIDEO_EXTENSIONS = new Set([
    ...SUPPORTED_INPUT_EXTENSIONS,
    'flv', 'f4v', 'wmv', 'ts', 'm2ts', 'mts', '3gp', 'mpg', 'mpeg', 'ogv', 'vob', 'rmvb', 'rm', 'asf', 'divx'
]);
const SUPPORTED_INPUT_MIMES = new Set([
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-msvideo'
]);
const OUTPUT_FORMATS = new Map([
    ['mp4', 'video/mp4'],
    ['webm', 'video/webm'],
]);

export const DEFAULT_VIDEO_COMPRESSION_CONFIG = Object.freeze({
    enabled: false,
    // 0-100，数值越大画质越好、压缩率越低；内部映射为 ffmpeg 的 CRF 或编码器 preset
    quality: 70,
    // 目标文件大小（MB），0 表示只按 quality 压缩
    targetSizeMB: 0,
    // 输入上限，默认与 Cloudflare Workers 100MB 请求体上限对齐
    maxInputMB: 100,
    format: 'mp4',
    endpoint: '',
    token: '',
    timeoutMs: 600000,
});

/** 带 HTTP 状态码的压缩错误，processFileUpload 会直接把 message 返回给客户端 */
export class VideoCompressionError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'VideoCompressionError';
        this.status = status;
    }
}

/**
 * 判断是否需要进入视频压缩流程。
 * 图片、音频、文档等一律返回 false，保证原有上传行为不受影响。
 */
export function isVideoCompressionCandidate(fileName, fileType) {
    const ext = getFileExtension(fileName);
    return KNOWN_VIDEO_EXTENSIONS.has(ext) || getFileTypeCategory(fileType) === 'video';
}

function readBoolean(value, fallback) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    return fallback;
}

function readNumber(value, fallback, paramName, min, max) {
    if (value === undefined || value === null || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        throw new VideoCompressionError(`Invalid video compression parameter ${paramName}: "${value}" is not a number`, 400);
    }
    if (parsed < min || parsed > max) {
        throw new VideoCompressionError(`Invalid video compression parameter ${paramName}: must be between ${min} and ${max} (received ${parsed})`, 400);
    }
    return parsed;
}

/** 读取并校验视频压缩配置，参数异常时抛出可直接返回给用户的错误 */
export function readVideoCompressionConfig(context = {}) {
    const { env = {}, url, uploadConfig = {} } = context;
    const params = url?.searchParams;
    const stored = uploadConfig.videoCompression || {};
    const defaults = DEFAULT_VIDEO_COMPRESSION_CONFIG;

    const format = String(params?.get('videoFormat') || env.VIDEO_COMPRESS_FORMAT || stored.format || defaults.format).trim().toLowerCase();
    if (!OUTPUT_FORMATS.has(format)) {
        throw new VideoCompressionError(`Unsupported video output format "${format}", supported formats: mp4, webm`, 400);
    }

    return {
        enabled: readBoolean(params?.get('videoCompress') ?? undefined,
            readBoolean(env.VIDEO_COMPRESS_ENABLED, readBoolean(stored.enabled, defaults.enabled))),
        quality: readNumber(params?.get('videoQuality') ?? env.VIDEO_COMPRESS_QUALITY ?? stored.quality,
            defaults.quality, 'videoQuality', 0, 100),
        targetSizeMB: readNumber(params?.get('videoTargetSizeMB') ?? env.VIDEO_COMPRESS_TARGET_SIZE_MB ?? stored.targetSizeMB,
            defaults.targetSizeMB, 'videoTargetSizeMB', 0, 1024),
        maxInputMB: readNumber(params?.get('videoMaxInputMB') ?? env.VIDEO_COMPRESS_MAX_INPUT_MB ?? stored.maxInputMB,
            defaults.maxInputMB, 'videoMaxInputMB', 1, 4096),
        format,
        endpoint: String(env.VIDEO_COMPRESS_ENDPOINT || stored.endpoint || defaults.endpoint).trim(),
        token: String(env.VIDEO_COMPRESS_TOKEN || stored.token || defaults.token).trim(),
        timeoutMs: readNumber(env.VIDEO_COMPRESS_TIMEOUT_MS ?? stored.timeoutMs,
            defaults.timeoutMs, 'VIDEO_COMPRESS_TIMEOUT_MS', 1000, 600000),
    };
}

/** 校验输入格式与大小，给出明确的 415 / 413 提示 */
export function validateVideoInput(file, fileName, fileType, config) {
    const ext = getFileExtension(fileName);
    // 扩展名已知时以扩展名为准；没有扩展名时才按 MIME 判断
    const supported = KNOWN_VIDEO_EXTENSIONS.has(ext)
        ? SUPPORTED_INPUT_EXTENSIONS.has(ext)
        : SUPPORTED_INPUT_MIMES.has(normalizeMimeType(fileType));
    if (!supported) {
        throw new VideoCompressionError(
            `Unsupported video format "${ext || fileType || 'unknown'}". Video compression supports mp4, m4v, mov, webm, mkv, avi; ` +
            'turn off video compression (videoCompress=false) to upload the original file.',
            415
        );
    }

    const maxBytes = config.maxInputMB * MB;
    if (!file.size) {
        throw new VideoCompressionError('The video file is empty, please select a valid video', 400);
    }
    if (file.size > maxBytes) {
        throw new VideoCompressionError(
            `Video file is too large (${(file.size / MB).toFixed(1)} MB), the compression input limit is ${config.maxInputMB} MB. ` +
            'Raise VIDEO_COMPRESS_MAX_INPUT_MB (Docker/self-hosted) or upload a smaller video.',
            413
        );
    }
}

/** 调用外部 ffmpeg 转码服务；请求体为原始视频字节，响应体为压缩后的视频字节 */
async function compressViaService(inputBuffer, source, config) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
        const headers = {
            'Content-Type': source.fileType || 'application/octet-stream',
            'X-Video-Compress-Quality': String(config.quality),
            'X-Video-Compress-Target-Size-MB': String(config.targetSizeMB),
            'X-Video-Compress-Format': config.format,
            'X-Video-Compress-Filename': encodeURIComponent(source.fileName || 'video'),
        };
        if (config.token) headers.Authorization = `Bearer ${config.token}`;

        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: inputBuffer,
            signal: controller.signal,
        });

        if (!response.ok) {
            const detail = (await response.text()).trim().slice(0, 300);
            throw new VideoCompressionError(
                `Video compression service returned HTTP ${response.status}${detail ? `: ${detail}` : ''}`,
                502
            );
        }

        const outputType = normalizeMimeType(response.headers.get('content-type') || '');
        const extensionHeader = response.headers.get('x-video-output-extension') || '';
        if (!outputType.startsWith('video/') && !extensionHeader) {
            throw new VideoCompressionError('Video compression service returned an invalid response (expected a video/* body)', 502);
        }
        const data = await response.arrayBuffer();
        return {
            data,
            extension: extensionHeader || (outputType.includes('webm') ? 'webm' : ''),
        };
    } finally {
        clearTimeout(timer);
    }
}

function replaceExtension(fileName, extension) {
    const base = String(fileName || 'video').split('/').pop().replace(/\.[^.]+$/, '');
    return `${base}.${extension}`;
}

/**
 * 上传流程入口：未开启压缩或非视频时原样返回。
 * @returns {{compressed: boolean, file: File, fileName: string, fileType: string, originalSize?: number}}
 */
export async function maybeCompressVideo(context, file, fileName, fileType) {
    const passthrough = { compressed: false, file, fileName, fileType };
    const config = readVideoCompressionConfig(context);
    if (!config.enabled || !isVideoCompressionCandidate(fileName, fileType)) {
        return passthrough;
    }

    validateVideoInput(file, fileName, fileType, config);

    const processor = context.env?.VIDEO_PROCESSOR;
    if (!processor && !config.endpoint) {
        throw new VideoCompressionError(
            'Video compression is enabled but no compression backend is available. ' +
            'Use the Docker image (built-in ffmpeg) or configure VIDEO_COMPRESS_ENDPOINT for Workers/Pages deployments.',
            503
        );
    }

    let inputBuffer;
    try {
        inputBuffer = await file.arrayBuffer();
    } catch (error) {
        throw new VideoCompressionError(`Failed to read the video file: ${error.message}`, 400);
    }

    let output;
    try {
        output = processor
            ? await processor.compress(inputBuffer, { ...config, sourceFileName: fileName, sourceType: fileType })
            : await compressViaService(inputBuffer, { fileName, fileType }, config);
    } catch (error) {
        if (error instanceof VideoCompressionError) throw error;
        if (error?.name === 'AbortError') {
            throw new VideoCompressionError(
                `Video compression timed out after ${config.timeoutMs} ms, try a lower compression rate or a smaller video`,
                504
            );
        }
        throw new VideoCompressionError(
            `Video compression failed: ${error.message || 'unknown error'}. The original file was NOT uploaded; ` +
            'retry with videoCompress=false or adjust the compression settings.',
            502
        );
    }

    const data = output?.data;
    if (!data || !data.byteLength) {
        throw new VideoCompressionError('Video compression produced an empty file, please check the compression settings', 502);
    }
    if (data.byteLength >= file.size) {
        // 压缩后反而更大时不替换，避免浪费带宽；原文件仍按原有流程上传
        console.warn(`Video compression skipped for ${fileName}: output (${data.byteLength}) is not smaller than input (${file.size})`);
        return { ...passthrough, reason: 'output-not-smaller' };
    }

    const extension = OUTPUT_FORMATS.has(output.extension) ? output.extension : config.format;
    const outputType = OUTPUT_FORMATS.get(extension);
    const outputName = replaceExtension(fileName, extension);
    const compressedFile = new File([data], outputName, { type: outputType });

    return {
        compressed: true,
        file: compressedFile,
        fileName: outputName,
        fileType: outputType,
        originalSize: file.size,
        outputSize: compressedFile.size,
    };
}
