import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import {
    DEFAULT_VIDEO_COMPRESSION_CONFIG,
    VideoCompressionError,
    isVideoCompressionCandidate,
    maybeCompressVideo,
    readVideoCompressionConfig,
    validateVideoInput,
} from '../functions/upload/videoCompression.js';

const MB = 1024 * 1024;

function makeContext({ search = '', env = {}, uploadConfig = {} } = {}) {
    return {
        env,
        url: new URL(`https://test/upload${search}`),
        uploadConfig,
    };
}

function makeFile(name = 'clip.mp4', type = 'video/mp4', size = 1024) {
    return new File([new Uint8Array(size)], name, { type });
}

// 模拟 Docker 的 ffmpeg processor：始终输出原体积的 1/4
const fakeProcessor = {
    async compress(input, options) {
        return {
            data: new Uint8Array(Math.max(1, Math.floor(input.byteLength / 4))),
            extension: options.format,
            type: `video/${options.format}`,
        };
    },
};

describe('video compression', () => {
    it('is disabled by default and only recognizes video-like files', () => {
        const config = readVideoCompressionConfig(makeContext());
        assert.equal(config.enabled, false);
        assert.equal(config.quality, DEFAULT_VIDEO_COMPRESSION_CONFIG.quality);
        assert.equal(config.maxInputMB, 100);
        assert.equal(config.format, 'mp4');

        assert.equal(isVideoCompressionCandidate('photo.png', 'image/png'), false);
        assert.equal(isVideoCompressionCandidate('doc.pdf', 'application/pdf'), false);
        assert.equal(isVideoCompressionCandidate('clip.mp4', 'video/mp4'), true);
        assert.equal(isVideoCompressionCandidate('clip.flv', 'application/octet-stream'), true);
    });

    it('resolves configuration in request > env > stored > default order', () => {
        const context = makeContext({
            search: '?videoCompress=true&videoQuality=25',
            env: { VIDEO_COMPRESS_QUALITY: '60', VIDEO_COMPRESS_TARGET_SIZE_MB: '12' },
            uploadConfig: { videoCompression: { enabled: true, quality: 80, targetSizeMB: 8, format: 'webm' } },
        });
        const config = readVideoCompressionConfig(context);
        assert.equal(config.enabled, true);
        assert.equal(config.quality, 25);
        assert.equal(config.targetSizeMB, 12);
        assert.equal(config.format, 'webm');

        const storedOnly = readVideoCompressionConfig(makeContext({ uploadConfig: { videoCompression: { enabled: true, quality: 33 } } }));
        assert.equal(storedOnly.enabled, true);
        assert.equal(storedOnly.quality, 33);
    });

    it('rejects invalid compression parameters with clear messages', () => {
        assert.throws(
            () => readVideoCompressionConfig(makeContext({ search: '?videoQuality=abc' })),
            error => error instanceof VideoCompressionError && error.status === 400 && /videoQuality/.test(error.message)
        );
        assert.throws(
            () => readVideoCompressionConfig(makeContext({ search: '?videoTargetSizeMB=9999' })),
            error => error.status === 400 && /videoTargetSizeMB/.test(error.message)
        );
        assert.throws(
            () => readVideoCompressionConfig(makeContext({ search: '?videoFormat=avi' })),
            error => error.status === 400 && /Unsupported video output format/.test(error.message)
        );
    });

    it('leaves images and non-video files untouched even when compression is enabled', async () => {
        const context = makeContext({ search: '?videoCompress=true' });
        for (const [name, type] of [['photo.png', 'image/png'], ['doc.pdf', 'application/pdf']]) {
            const file = makeFile(name, type);
            const result = await maybeCompressVideo(context, file, name, type);
            assert.equal(result.compressed, false);
            assert.equal(result.file, file);
        }
    });

    it('reports unsupported video formats and oversized inputs', () => {
        const context = makeContext({ search: '?videoCompress=true' });
        assert.throws(
            () => validateVideoInput(makeFile('clip.flv', 'video/x-flv'), 'clip.flv', 'video/x-flv', readVideoCompressionConfig(context)),
            error => error.status === 415 && /mp4, m4v, mov, webm, mkv, avi/.test(error.message)
        );
        assert.throws(
            () => validateVideoInput(makeFile('clip.mp4', 'video/mp4', 2 * MB), 'clip.mp4', 'video/mp4', readVideoCompressionConfig(makeContext({ search: '?videoMaxInputMB=1' }))),
            error => error.status === 413 && /too large/.test(error.message)
        );
    });

    it('fails clearly when compression is enabled without a backend', async () => {
        const context = makeContext({ search: '?videoCompress=true' });
        await assert.rejects(
            maybeCompressVideo(context, makeFile(), 'clip.mp4', 'video/mp4'),
            error => error.status === 503 && /no compression backend/.test(error.message)
        );
    });

    it('replaces the video with a compressed mp4 through the local processor', async () => {
        const context = makeContext({ search: '?videoCompress=true&videoQuality=40&videoTargetSizeMB=1' });
        context.env.VIDEO_PROCESSOR = fakeProcessor;
        const file = makeFile('screen record.mov', 'video/quicktime', 4 * MB);
        const result = await maybeCompressVideo(context, file, 'screen record.mov', 'video/quicktime');

        assert.equal(result.compressed, true);
        assert.equal(result.fileName, 'screen record.mp4');
        assert.equal(result.fileType, 'video/mp4');
        assert.equal(result.file.size, MB);
        assert.equal(result.originalSize, 4 * MB);
        assert.equal(result.outputSize, MB);
    });

    it('keeps the original when the compressed output is not smaller', async () => {
        const context = makeContext({ search: '?videoCompress=true' });
        context.env.VIDEO_PROCESSOR = {
            async compress(input) { return { data: new Uint8Array(input.byteLength * 2), extension: 'mp4' }; },
        };
        const file = makeFile();
        const result = await maybeCompressVideo(context, file, 'clip.mp4', 'video/mp4');
        assert.equal(result.compressed, false);
        assert.equal(result.reason, 'output-not-smaller');
        assert.equal(result.file, file);
    });

    it('surfaces processor failures without silently uploading the original', async () => {
        const context = makeContext({ search: '?videoCompress=true' });
        context.env.VIDEO_PROCESSOR = {
            async compress() { throw new Error('ffmpeg exited with code 1: Invalid data'); },
        };
        await assert.rejects(
            maybeCompressVideo(context, makeFile(), 'clip.mp4', 'video/mp4'),
            error => error.status === 502 && /Video compression failed/.test(error.message) && /NOT uploaded/.test(error.message)
        );
    });

    describe('external compression service', () => {
        let originalFetch;
        beforeEach(() => { originalFetch = globalThis.fetch; });
        afterEach(() => { globalThis.fetch = originalFetch; });

        it('posts raw bytes and accepts the compressed video response', async () => {
            const context = makeContext({
                search: '?videoCompress=true&videoQuality=30&videoTargetSizeMB=5',
                env: { VIDEO_COMPRESS_ENDPOINT: 'https://compress.invalid/api', VIDEO_COMPRESS_TOKEN: 'secret' },
            });
            let requestHeaders;
            globalThis.fetch = async (url, init) => {
                assert.equal(url, 'https://compress.invalid/api');
                requestHeaders = init.headers;
                return new Response(new Uint8Array(512), {
                    status: 200,
                    headers: { 'Content-Type': 'video/mp4' },
                });
            };
            const result = await maybeCompressVideo(context, makeFile('clip.mkv', 'video/x-matroska', 4 * MB), 'clip.mkv', 'video/x-matroska');
            assert.equal(result.compressed, true);
            assert.equal(result.fileName, 'clip.mp4');
            assert.equal(requestHeaders['X-Video-Compress-Quality'], '30');
            assert.equal(requestHeaders['X-Video-Compress-Target-Size-MB'], '5');
            assert.equal(requestHeaders.Authorization, 'Bearer secret');
        });

        it('reports upstream errors and invalid responses', async () => {
            const context = makeContext({
                search: '?videoCompress=true',
                env: { VIDEO_COMPRESS_ENDPOINT: 'https://compress.invalid/api' },
            });
            globalThis.fetch = async () => new Response('codec not supported', { status: 422 });
            await assert.rejects(
                maybeCompressVideo(context, makeFile('clip.mp4', 'video/mp4', 2 * MB), 'clip.mp4', 'video/mp4'),
                error => error.status === 502 && /HTTP 422/.test(error.message)
            );

            globalThis.fetch = async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
            await assert.rejects(
                maybeCompressVideo(context, makeFile('clip.mp4', 'video/mp4', 2 * MB), 'clip.mp4', 'video/mp4'),
                error => error.status === 502 && /invalid response/.test(error.message)
            );
        });
    });
});
