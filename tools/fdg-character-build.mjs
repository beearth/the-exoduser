#!/usr/bin/env node
/** Extract real decoded video frames. No frame generation, interpolation, or game integration. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'assets/fdg/character-reference');
const cell = { width: 768, height: 432, columns: 6, rows: 4, frames: 24, fps: 24 };
const sources = [
  {
    id: 'transmuter', name: '변성술사',
    video: 'assets/video-tests/seedance-20260928/01-transmuter-gauntlet-idle.mp4',
    reference: 'assets/video-bases/20260928/12-transmuter-gauntlet-scythe-v4.png',
    reviewStatus: 'pending',
    designLocks: ['원화 v4의 얼굴·갑옷·색·실루엣을 보존한다.', '큰 푸른 구형 코어와 발톱형 장갑이 주무기다. 장갑·코어의 크기와 연결을 보존한다.', '여성의 낫은 날·자루·그립 전체가 순수 에너지이며 장갑에서 형성된다. 물리 금속 자루로 바꾸지 않는다.', '남성의 푸른 활 원형을 보존한다.', '첫 1초의 대기 참고 영상이며 전투 공격·8방향·3D 모델 승인이 아니다.'],
  },
  {
    id: 'hell_hunter', name: '헬 헌터',
    video: 'assets/video-tests/seedance-20260928/02-hell-hunter-idle.mp4',
    reference: 'assets/video-bases/20260928/13-hell-hunter-restrained-cloth-v3.png',
    reviewStatus: 'pending',
    designLocks: ['원화 v3의 얼굴·실린더 총기·갑옷과 절제된 붉은 천을 보존한다.', '견착과 양손 그립을 유지하며 손·총기 연결의 일관성을 검수한다.', '총구는 평시 닫힌 작살형이다. 발사 시 4날개가 열리고 중앙 단일 포구에서 발사한 뒤 닫힌다.', '첫 1초의 대기 참고 영상은 발사·총구 개폐 구현의 증거가 아니며 전투 공격·8방향·3D 모델 승인이 아니다.'],
  },
  {
    id: 'arcane_lancer', name: '아케인 랜서',
    video: 'assets/video-tests/hailuo-20260928/08-arcane-lancer-thrust.mp4',
    reference: 'assets/video-tests/hailuo-20260928/08-arcane-lancer-source.png',
    reviewStatus: 'retouch',
    designLocks: ['은발 여성·얼굴·후드·검은 갑옷과 원화의 노출 범위를 보존한다.', '긴 가는 직선 창대·금속 창끝·브론즈 궤도 고리와 양손 잡기를 보존한다. 창은 하나로 연결된 단일 축이다.', '양발이 보이도록 프레임과 발 접지를 검수한다.', '기존 RETOUCH 판정을 유지한다. 효과에 가려진 창끝·고리·손의 정밀 검수는 미승인이다.', '첫 1초는 에너지 충전·준비 참고 구간이며 찌르기 완성 클립이 아니다.'],
  },
];

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const publicPath = name => `assets/fdg/character-reference/${name}`;
const help = `FDG character reference build\n\nUsage:\n  node tools/fdg-character-build.mjs --source-root <existing-assets-root> [options]\n\nOptions:\n  --source-root <directory>       Defaults to this checkout; never auto-loads product R.\n  --playwright-module <file>      Optional existing Playwright module path.\n  --chrome-executable <file>      Optional existing Chrome executable.\n  --base-url <loopback URL>       Existing Node server, default http://localhost:3333.\n  --help                         Show this help; no assets are read or written.\n\nOutputs: assets/fdg/character-reference/* and engine/fdg/character-drafts.js\nThree source videos must contain constant-rate 24 FPS video. Extracts display\nframes 0..23 with requestVideoFrameCallback metadata; no duplicated/interpolated\nposes, alpha removal, game writes, server startup, or external generation.\n`;

function parseArguments(argv) {
  const options = { sourceRoot: projectRoot, baseURL: 'http://localhost:3333' };
  const names = { '--source-root': 'sourceRoot', '--playwright-module': 'playwrightModule', '--chrome-executable': 'chromeExecutable', '--base-url': 'baseURL' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') return { help: true };
    if (!names[argument] || !argv[index + 1] || argv[index + 1].startsWith('--')) throw new Error(`Unknown or incomplete argument: ${argument}`);
    options[names[argument]] = argv[++index];
  }
  options.sourceRoot = path.resolve(options.sourceRoot);
  const url = new URL(options.baseURL);
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || !['http:', 'https:'].includes(url.protocol)) throw new Error('--base-url must be an existing loopback server');
  options.baseURL = url.origin;
  return options;
}

function boxes(bytes, start = 0, end = bytes.length) {
  const result = [];
  for (let offset = start; offset < end;) {
    assert.ok(offset + 8 <= end, 'Incomplete MP4 box');
    let size = bytes.readUInt32BE(offset), header = 8;
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    if (size === 1) { size = Number(bytes.readBigUInt64BE(offset + 8)); header = 16; }
    if (size === 0) size = end - offset;
    assert.ok(Number.isSafeInteger(size) && size >= header && offset + size <= end, `Invalid MP4 ${type} box`);
    result.push({ type, start: offset + header, end: offset + size });
    offset += size;
  }
  return result;
}

function child(bytes, parent, type) {
  const found = boxes(bytes, parent.start, parent.end).find(box => box.type === type);
  assert.ok(found, `Missing MP4 ${type}`);
  return found;
}

function videoTiming(bytes) {
  const moov = boxes(bytes).find(box => box.type === 'moov');
  assert.ok(moov, 'Missing MP4 moov');
  for (const track of boxes(bytes, moov.start, moov.end).filter(box => box.type === 'trak')) {
    const media = child(bytes, track, 'mdia');
    const handler = child(bytes, media, 'hdlr');
    if (bytes.toString('ascii', handler.start + 8, handler.start + 12) !== 'vide') continue;
    const mdhd = child(bytes, media, 'mdhd');
    const version = bytes[mdhd.start];
    assert.ok(version === 0 || version === 1, 'Unsupported MP4 mdhd version');
    const timeOffset = mdhd.start + (version === 1 ? 20 : 12);
    const timescale = bytes.readUInt32BE(timeOffset);
    const duration = version === 1 ? Number(bytes.readBigUInt64BE(timeOffset + 4)) : bytes.readUInt32BE(timeOffset + 4);
    const stts = child(bytes, child(bytes, child(bytes, media, 'minf'), 'stbl'), 'stts');
    const entryCount = bytes.readUInt32BE(stts.start + 4);
    assert.ok(stts.start + 8 + entryCount * 8 <= stts.end, 'Invalid MP4 stts length');
    let frameCount = 0;
    const durations = new Set();
    for (let index = 0; index < entryCount; index += 1) {
      const offset = stts.start + 8 + index * 8;
      const count = bytes.readUInt32BE(offset), delta = bytes.readUInt32BE(offset + 4);
      assert.ok(count > 0 && delta > 0, 'Invalid MP4 sample timing');
      frameCount += count; durations.add(delta);
    }
    assert.equal(durations.size, 1, 'Variable-frame-rate video is unsupported; do not interpolate it');
    const sampleDuration = [...durations][0];
    const fps = timescale / sampleDuration;
    assert.equal(fps, cell.fps, `Source FPS must be ${cell.fps}; do not duplicate or skip frames`);
    assert.ok(frameCount >= cell.frames, 'Source contains fewer than 24 frames');
    return { timescale, sampleDuration, frameCount, fps, duration: duration / timescale };
  }
  throw new Error('No MP4 video track');
}

function pngSize(bytes) {
  assert.ok(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Reference is not a PNG');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'Missing PNG IHDR');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

async function extract(page, url, timing) {
  return page.evaluate(async ({ url, timing, cell }) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
    const blobURL = URL.createObjectURL(await response.blob());
    const video = document.createElement('video');
    video.muted = true; video.preload = 'auto'; video.playsInline = true;
    video.style.width = '768px'; video.style.height = '432px';
    document.body.append(video);
    const timeout = promise => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Video decode/seek timed out')), 15_000);
      promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
    });
    const frameCallback = () => new Promise(resolve => video.requestVideoFrameCallback((_, metadata) => resolve(metadata)));
    const firstFrame = frameCallback();
    const loaded = new Promise((resolve, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', () => reject(new Error(video.error?.message || 'Video decode error')), { once: true });
    });
    video.src = blobURL;
    await timeout(loaded);
    const initial = await timeout(firstFrame);
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = cell.width; frameCanvas.height = cell.height;
    const context = frameCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
    const atlas = document.createElement('canvas');
    atlas.width = cell.width * cell.columns; atlas.height = cell.height * cell.rows;
    const atlasContext = atlas.getContext('2d', { alpha: false });
    const ratio = Math.min(cell.width / video.videoWidth, cell.height / video.videoHeight);
    const drawRect = { x: (cell.width - video.videoWidth * ratio) / 2, y: (cell.height - video.videoHeight * ratio) / 2, width: video.videoWidth * ratio, height: video.videoHeight * ratio };
    const metadata = [];
    try {
      for (let index = 0; index < cell.frames; index += 1) {
        let decoded = initial;
        const requestedTime = index === 0 ? 0 : (index + .25) / timing.fps;
        if (index > 0) {
          const displayed = frameCallback();
          const seeked = new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }));
          video.currentTime = requestedTime;
          await timeout(seeked); decoded = await timeout(displayed);
        }
        const displayFrameIndex = Math.round(decoded.mediaTime * timing.fps);
        if (displayFrameIndex !== index || Math.abs(decoded.mediaTime - index / timing.fps) > .01 / timing.fps) {
          throw new Error(`Requested source frame ${index}, decoder returned mediaTime=${decoded.mediaTime} (frame ${displayFrameIndex})`);
        }
        context.fillStyle = '#000000'; context.fillRect(0, 0, cell.width, cell.height);
        context.drawImage(video, drawRect.x, drawRect.y, drawRect.width, drawRect.height);
        atlasContext.drawImage(frameCanvas, index % cell.columns * cell.width, Math.floor(index / cell.columns) * cell.height);
        const pixels = context.getImageData(0, 0, cell.width, cell.height).data;
        const digest = await crypto.subtle.digest('SHA-256', pixels);
        const pixelSha = [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
        metadata.push({ index, sourceFrameIndex: displayFrameIndex, mediaTime: decoded.mediaTime, requestedTime, pixelSha });
      }
      return { dataURL: atlas.toDataURL('image/png'), frames: metadata, videoWidth: video.videoWidth, videoHeight: video.videoHeight, videoDuration: video.duration, drawRect };
    } finally { video.remove(); URL.revokeObjectURL(blobURL); }
  }, { url, timing, cell });
}

function draftsModule(drafts) {
  return `/** Generated by tools/fdg-character-build.mjs. Reference motion only; no gameplay/3D integration. */\nconst drafts = ${JSON.stringify(drafts, null, 2)};\n\n/** Returns isolated JSON drafts, never shared mutable catalog data. */\nexport function createCharacterDrafts() {\n  return JSON.parse(JSON.stringify(drafts));\n}\n`;
}

async function build(options) {
  // All sources are validated before launching Chrome or writing an output file.
  const inputs = await Promise.all(sources.map(async source => {
    const [video, reference] = await Promise.all([readFile(path.join(options.sourceRoot, source.video)), readFile(path.join(options.sourceRoot, source.reference))]);
    return { source, video, reference, timing: videoTiming(video), referenceSize: pngSize(reference), sourceSha: sha256(video), referenceSha: sha256(reference) };
  }));
  const server = await fetch(`${options.baseURL}/tools/fdg-studio/`, { method: 'HEAD', signal: AbortSignal.timeout(5_000) });
  assert.ok(server.ok, 'Existing Node server is unavailable; this tool does not start a server');
  const moduleSpecifier = options.playwrightModule ? pathToFileURL(path.resolve(options.playwrightModule)).href : 'playwright';
  const { chromium } = await import(moduleSpecifier);
  const browser = await chromium.launch({ headless: true, ...(options.chromeExecutable ? { executablePath: path.resolve(options.chromeExecutable) } : { channel: 'chrome' }) });
  const drafts = [], artifacts = [];
  try {
    const context = await browser.newContext({ viewport: { width: 800, height: 500 }, deviceScaleFactor: 1 });
    const shellURL = `${options.baseURL}/__fdg_character_build__/shell`;
    const media = new Map(inputs.map(input => [`${options.baseURL}/__fdg_character_build__/${input.source.id}.mp4`, input.video]));
    await context.route('**/*', route => {
      const url = route.request().url();
      if (url === shellURL) return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>FDG reference frame extraction</title>' });
      if (media.has(url)) return route.fulfill({ status: 200, contentType: 'video/mp4', body: media.get(url) });
      return route.abort();
    });
    const page = await context.newPage();
    await page.goto(shellURL);
    for (const input of inputs) {
      const { source } = input;
      const decoded = await extract(page, `${options.baseURL}/__fdg_character_build__/${source.id}.mp4`, input.timing);
      const atlas = Buffer.from(decoded.dataURL.split(',')[1], 'base64');
      assert.deepEqual(pngSize(atlas), { width: cell.width * cell.columns, height: cell.height * cell.rows });
      const clipName = `${source.id}.motion24.png`, referenceName = `${source.id}.reference.png`;
      const draft = {
        id: source.id, name: source.name, referenceSrc: publicPath(referenceName),
        clip: { src: publicPath(clipName), frameWidth: cell.width, frameHeight: cell.height, columns: cell.columns, rows: cell.rows, frames: cell.frames, fps: cell.fps },
        designLocks: source.designLocks,
        provenance: {
          sourceVideo: source.video, sourceSha: input.sourceSha, sourceFrames: decoded.frames,
          sourceFps: input.timing.fps, sourceFrameCount: input.timing.frameCount,
          sourceReference: source.reference, sourceReferenceSha: input.referenceSha,
          scope: 'reference-motion', reviewStatus: source.reviewStatus,
          gameplayApplied: false, modelAvailable: false, alpha: false, backgroundIncluded: true,
          extraction: 'decoded display frames 0..23; no interpolation; aspect-preserving contain with black letterbox',
        },
      };
      drafts.push(draft);
      artifacts.push({
        id: source.id, draft, sourceTiming: input.timing,
        sourceDimensions: { width: decoded.videoWidth, height: decoded.videoHeight }, sourceDuration: decoded.videoDuration,
        referenceDimensions: input.referenceSize, drawRect: decoded.drawRect,
        atlas: { src: draft.clip.src, sha: sha256(atlas), bytes: atlas.length, ...pngSize(atlas) },
        reference: { src: draft.referenceSrc, sha: input.referenceSha, bytes: input.reference.length, ...input.referenceSize },
        pixelDistinctFrameCount: new Set(decoded.frames.map(frame => frame.pixelSha)).size,
        _atlasBytes: atlas, _referenceBytes: input.reference,
      });
      console.log(`${source.id}: decoded source frames 0..23 at ${input.timing.fps} FPS (${decoded.videoWidth}x${decoded.videoHeight})`);
    }
    // Write only after every source decoded the complete expected sequence.
    await mkdir(outputDirectory, { recursive: true });
    for (const artifact of artifacts) {
      await writeFile(path.join(projectRoot, artifact.atlas.src), artifact._atlasBytes);
      await writeFile(path.join(projectRoot, artifact.reference.src), artifact._referenceBytes);
      delete artifact._atlasBytes; delete artifact._referenceBytes;
    }
    const generatedModule = draftsModule(drafts);
    await writeFile(path.join(projectRoot, 'engine/fdg/character-drafts.js'), generatedModule);
    const manifest = {
      schemaVersion: 1, scope: 'reference-motion', gameplayApplied: false, modelAvailable: false,
      pipeline: { tool: 'tools/fdg-character-build.mjs', toolSha: sha256(await readFile(fileURLToPath(import.meta.url))), decoder: 'HTMLVideoElement/requestVideoFrameCallback', encoder: 'Canvas2D PNG', browserVersion: browser.version(), cell, rowOrder: 'left-to-right then top-to-bottom', sourceRoot: options.sourceRoot, sourceTimeWindow: '[0,1) seconds', interpolation: false, poseDuplication: false, alpha: false, backgroundIncluded: true },
      reproduction: { sourceRoot: options.sourceRoot, playwrightModule: options.playwrightModule || 'playwright', chromeExecutable: options.chromeExecutable || 'channel:chrome', baseURL: options.baseURL },
      draftModule: { src: 'engine/fdg/character-drafts.js', sha: sha256(generatedModule) }, artifacts,
      limitations: ['Pixel-distinct frames do not prove 24 distinct poses or motion quality.', 'Opaque cinematic background/title remain; these are reference clips, not transparent playable sprites.', 'First-second Arcane Lancer clip is preparation/energy gathering, not the later thrust.', 'No 8-direction set, 3D mesh, skeleton, rig, combat animation, or gameplay import is supplied.'],
    };
    const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`;
    await writeFile(path.join(outputDirectory, 'manifest.json'), manifestBytes);
    await writeFile(path.join(outputDirectory, 'manifest.sha256'), `${sha256(manifestBytes)}  manifest.json\n`);
    console.log(`Wrote ${artifacts.length} reference atlases and original PNG copies; manifest: assets/fdg/character-reference/manifest.json`);
  } finally { await browser.close(); }
}

const options = parseArguments(process.argv.slice(2));
if (options.help) console.log(help);
else await build(options);
