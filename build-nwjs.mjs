// HELL: EXODUSER 정식 — NW.js 빌드 스크립트
// 기반: G:\hell-ea\build-nwjs.mjs

import nwbuild from 'nw-builder';
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';

const DIST = 'dist';
const OUT  = 'out/EXODUSER-win64';
const CODEC_DLL = 'vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll';
const CODEC_SHA256 = 'be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500';
if (createHash('sha256').update(readFileSync(CODEC_DLL)).digest('hex') !== CODEC_SHA256) {
  throw new Error('NW.js 0.111.2 media codec checksum mismatch');
}

// ── 1. dist/ 스테이징 폴더 초기화 ──────────────────────────────────────────
console.log('[build] dist/ 초기화...');
if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// ── 2. 단일 파일 복사 ────────────────────────────────────────────────────────
const FILES = [
  'index.html', 'game.html', 'credits.html',
  'stat-panel-ui.js', 'stat-panel-ui.css',
  'localization-runtime.js', 'localization-data.js', 'localization.css',
  'lobby-stage-info.js', 'character-story-player.js', 'level-up-vfx.js',
  'world-intro-player.js', 'world-intro-subtitles-data.js', 'world-intro-subtitles.js',
  'cin-enter-engraved.css', 'cin-logo-art.js',
  'GLTFLoader.js', 'three.min.js',
  'maps_data.js', 'lobby_i18n.js',
  'favicon.ico',
  'proj_atlas.png', 'prefabs/registry.json',
  'output/imagegen/exoduser-hell-lord-logo-api-v1.png', 'output/imagegen/enter-gothic-api-v1.png',
  'output/fdg_reference_1280x720.png',
  'output/imagegen/forge-icon-sheet-v1.png', 'output/imagegen/forge-icon-sheet-v3.png',
];
for (const f of FILES) {
  if (existsSync(f)) {
    mkdirSync(dirname(`${DIST}/${f}`), { recursive: true });
    cpSync(f, `${DIST}/${f}`);
  }
  else console.warn(`[build] 파일 없음 (건너뜀): ${f}`);
}

// ── 2b. package.json 정리 (NW.js 런타임용 — type:module/scripts/deps 제거) ──
{
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const nwPkg = {
    name: pkg.name,
    version: pkg.version,
    main: pkg.main,
    'node-main': pkg['node-main'],
    'node-remote': pkg['node-remote'],
    window: pkg.window,
    'chromium-args': pkg['chromium-args'],
  };
  writeFileSync(`${DIST}/package.json`, JSON.stringify(nwPkg, null, 2), 'utf8');
  console.log('[build] package.json 정리 완료 (type:module 제거)');
}

// ── 3. lang 파일 복사 (lang_*.js 27개, 말레이어 포함) ────────────────────────
for (const f of readdirSync('.').filter(f => f.startsWith('lang_') && f.endsWith('.js'))) {
  cpSync(f, `${DIST}/${f}`);
}

// ── 4. 아틀라스 파일 복사 (atlas_*.json, atlas_*.png) ────────────────────────
for (const f of readdirSync('.').filter(f => f.startsWith('atlas_'))) {
  cpSync(f, `${DIST}/${f}`);
}

// ── 5. node-main.js 복사 ────────────────────────────────────────────────────
if (existsSync('node-main.js')) {
  cpSync('node-main.js', `${DIST}/node-main.js`);
  console.log('[build] node-main.js 포함');
} else {
  console.warn('[build] node-main.js 없음!');
}

// ── 6. 에셋 폴더 복사 ────────────────────────────────────────────────────────
const DIRS = ['assets', 'img', 'sprites', 'bgm', 'sfx', 'video', 'localization',
  'output/imagegen/item-skins', 'output/imagegen/forge-tabs-v3', 'output/imagegen/forge-tabs-v4'];
for (const d of DIRS) {
  if (existsSync(d)) {
    console.log(`[build] ${d}/ 복사 중...`);
    cpSync(d, `${DIST}/${d}`, { recursive: true });
  } else {
    console.warn(`[build] 폴더 없음 (건너뜀): ${d}/`);
  }
}

// ── 7. nwbuild ────────────────────────────────────────────────────────────────
let useTemp = false;
if (existsSync(OUT)) {
  try {
    rmSync(OUT, { recursive: true, force: true });
  } catch {
    console.log('[build] 출력 폴더 잠김 — package.nw만 교체합니다.');
    useTemp = true;
  }
}

const buildDir = useTemp ? 'out/_tmp_build' : OUT;
if (useTemp && existsSync(buildDir)) rmSync(buildDir, { recursive: true, force: true });

console.log('[build] nwbuild 시작 (첫 실행 시 NW.js 다운로드, 수 분 소요)...');
await nwbuild({
  srcDir: DIST,
  mode: 'build',
  version: '0.111.2',
  flavor: 'normal',
  platform: 'win',
  arch: 'x64',
  outDir: buildDir,
  glob: false,
  zip: false,
  app: {
    name: 'EXODUSER',
    version: '1.0.0',
    icon: 'favicon.ico',
  },
}).catch((e) => {
  console.error('[build] nwbuild 오류:', e);
  process.exit(1);
});

// ── 8. package.nw 교체 (잠긴 경우) ──────────────────────────────────────────
if (useTemp && existsSync(`${buildDir}/package.nw`)) {
  if (existsSync(`${OUT}/package.nw`)) rmSync(`${OUT}/package.nw`, { recursive: true, force: true });
  cpSync(`${buildDir}/package.nw`, `${OUT}/package.nw`, { recursive: true });
  rmSync(buildDir, { recursive: true, force: true });
  console.log('[build] 완료: package.nw 교체');
} else {
  console.log(`[build] 완료: ${OUT}/`);
}

// Stock NW.js can show H.264 while silently dropping AAC. Keep the matching decoder in every build.
cpSync(CODEC_DLL, `${OUT}/ffmpeg.dll`);
console.log('[build] NW.js 0.111.2 AAC/H.264 codec installed');
