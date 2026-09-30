// HELL: EXODUSER 정식 — NW.js 빌드 스크립트
// 기반: G:\hell-ea\build-nwjs.mjs

import nwbuild from 'nw-builder';
import { cpSync, existsSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';

// An integration build uses fresh, isolated paths so existing releases and profiles survive.
const integrationArg = process.argv.slice(2).find(arg => arg.startsWith('--integration-id='));
if (process.argv.length > 2 && (process.argv.length !== 3 || !integrationArg)) {
  throw new Error('Usage: node build-nwjs.mjs [--integration-id=YYYYMMDD-HHMMSS]');
}
const integrationId = integrationArg?.slice('--integration-id='.length);
if (integrationArg && !/^\d{8}-\d{6}$/.test(integrationId)) {
  throw new Error('Integration ID must be YYYYMMDD-HHMMSS');
}
const DIST = integrationId ? `dist-integration-${integrationId}` : 'dist';
const OUT = integrationId ? `out/EXODUSER-integration-${integrationId}` : 'out/EXODUSER-win64';
if (integrationId && (existsSync(DIST) || existsSync(OUT))) {
  throw new Error(`Integration paths already exist: ${DIST}, ${OUT}`);
}
const CODEC_DLL = 'vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll';
const CODEC_SHA256 = 'be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500';
if (createHash('sha256').update(readFileSync(CODEC_DLL)).digest('hex') !== CODEC_SHA256) {
  throw new Error('NW.js 0.111.2 media codec checksum mismatch');
}

// ── 1. dist/ 스테이징 폴더 초기화 ──────────────────────────────────────────
console.log('[build] dist/ 초기화...');
if (!integrationId && existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

// ── 2. 단일 파일 복사 ────────────────────────────────────────────────────────
const FILES = [
  'index.html', 'game.html', 'credits.html',
  'game-easy-test.html', 'game-guide.html',
  'player-attack-remaster.js',
  'warrior-bat-swing.js',
  'warrior-dash-flight.js',
  'ch1-living-detail.js',
  'ch1-forest-sway.js',
  'ch1-face-life.js',
  'ch1-altar-moat.js',
  'parry-lesson.js', 'parry-lesson.css', 'resource-practice.js',
  'system-lesson.js', 'system-lesson.css',
  'tutorial-badges.js', 'tutorial-badges.css',
  'stat-panel-ui.js', 'stat-panel-ui.css',
  'growth-tree-detail.css', 'growth-tree-fixed-background.css', 'growth-tree-information.css',
  'ui-foundation.css',
  'ui-refinement.css',
  'inventory-gems.css',
  'inventory-gems-finish.css',
  'inventory-space.css',
  'inventory-paperdoll.js', 'knight-portrait.css',
  'inventory-oss-balance.css', 'inventory-gems-balance.css',
  'skill-workspace.css',
  'ui-panels.js',
  'localization-runtime.js', 'localization-data.js', 'localization.css',
  'lobby-stage-info.js', 'character-story-player.js', 'level-up-vfx.js',
  'lobby-ancestor-art.css', 'lobby-ancestor-sprite.js',
  'world-intro-player.js', 'world-intro-subtitles-data.js', 'world-intro-subtitles.js',
  'cin-enter-engraved.css', 'cin-logo-art.js',
  'GLTFLoader.js', 'three.min.js', 'three-runtime.js',
  'maps_data.js', 'lobby_i18n.js',
  'favicon.ico',
  'proj_atlas.png', 'prefabs/registry.json',
  'output/imagegen/exoduser-hell-lord-logo-api-v1.png', 'output/imagegen/enter-gothic-api-v1.png',
  'output/fdg_reference_1280x720.png',
  'output/imagegen/forge-icon-sheet-v1.png', 'output/imagegen/forge-icon-sheet-v3.png',
];
const OPTIONAL_FILES = new Set(['credits.html']);
for (const f of FILES) {
  if (existsSync(f)) {
    mkdirSync(dirname(`${DIST}/${f}`), { recursive: true });
    cpSync(f, `${DIST}/${f}`);
  }
  else if (integrationId && !OPTIONAL_FILES.has(f)) throw new Error(`Required build file missing: ${f}`);
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
  if (integrationId) {
    if (!nwPkg.main.includes('localhost:3333') || !nwPkg['chromium-args'].includes('--user-data-dir=./userdata')) {
      throw new Error('Integration package isolation patch failed');
    }
    nwPkg.main = nwPkg.main.replace('localhost:3333', 'localhost:3347');
    nwPkg['node-remote'] = ['http://127.0.0.1:3347', 'http://localhost:3347'];
    nwPkg['chromium-args'] = nwPkg['chromium-args'].replace('--user-data-dir=./userdata', `--user-data-dir=./userdata-integration-${integrationId}`);
  }
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
  if (integrationId) {
    const isolatedServer = readFileSync(`${DIST}/node-main.js`, 'utf8')
      .replace('const PORT = 3333;', 'const PORT = 3347;')
      .replace("path.join(APPDATA, 'EXODUSER-HELL', 'saves')", `path.join(APPDATA, 'EXODUSER-INTEGRATION-${integrationId}', 'saves')`);
    if (!isolatedServer.includes('const PORT = 3347;') || !isolatedServer.includes(`EXODUSER-INTEGRATION-${integrationId}`)) {
      throw new Error('Integration server isolation patch failed');
    }
    writeFileSync(`${DIST}/node-main.js`, isolatedServer, 'utf8');
  }
  console.log('[build] node-main.js 포함');
} else {
  if (integrationId) throw new Error('Required build file missing: node-main.js');
  console.warn('[build] node-main.js 없음!');
}

// ── 6. 에셋 폴더 복사 ────────────────────────────────────────────────────────
const DIRS = ['assets', 'img', 'sprites', 'bgm', 'sfx', 'video', 'localization',
  'output/imagegen/item-skins', 'output/imagegen/forge-tabs-v3', 'output/imagegen/forge-tabs-v4'];
const OPTIONAL_DIRS = new Set(['output/imagegen/forge-tabs-v3']);
for (const d of DIRS) {
  if (existsSync(d)) {
    console.log(`[build] ${d}/ 복사 중...`);
    cpSync(d, `${DIST}/${d}`, { recursive: true });
  } else if (integrationId && !OPTIONAL_DIRS.has(d)) {
    throw new Error(`Required build directory missing: ${d}`);
  } else {
    console.warn(`[build] 폴더 없음 (건너뜀): ${d}/`);
  }
}

// ── 7. nwbuild ────────────────────────────────────────────────────────────────
let useTemp = false;
if (!integrationId && existsSync(OUT)) {
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
