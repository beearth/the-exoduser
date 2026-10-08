// HELL: EXODUSER 정식 — NW.js 빌드 스크립트
// 기반: G:\hell-ea\build-nwjs.mjs

import nwbuild from 'nw-builder';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { createHash } from 'crypto';
import { execFileSync } from 'node:child_process';
import { createReleaseConfig, runtimeManifest } from './tools/release-target.mjs';

// An integration build uses fresh, isolated paths so existing releases and profiles survive.
const args=Object.fromEntries(process.argv.slice(2).map(arg=>{
 const match=/^--(target|build-id|runtime)=(.+)$/.exec(arg);
 if(!match)throw Error('Usage: node build-nwjs.mjs --target=full|demo --build-id=YYYYMMDD-HHMMSS [--runtime=verified-directory]');
 return [match[1],match[2]];
}));
const release=createReleaseConfig(args.target,args['build-id']);
const integrationId=release.buildId; // strict missing-input checks apply to every release
const DIST=release.dist,OUT=release.out;
if (existsSync(DIST) || existsSync(OUT)) {
  throw new Error(`Integration paths already exist: ${DIST}, ${OUT}`);
}
const CODEC_DLL = 'vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll';
const CODEC_SHA256 = 'be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500';
if (createHash('sha256').update(readFileSync(CODEC_DLL)).digest('hex') !== CODEC_SHA256) {
  throw new Error('NW.js 0.111.2 media codec checksum mismatch');
}

// ── 1. dist/ 스테이징 폴더 초기화 ──────────────────────────────────────────
console.log('[build] dist/ 초기화...');
mkdirSync(DIST, { recursive: true });

// ── 2. 단일 파일 복사 ────────────────────────────────────────────────────────
const FILES = [
  'index.html', 'game.html', 'credits.html',
  'build-target.js',
  'game-easy-test.html', 'game-guide.html',
  'player-attack-remaster.js',
  'warrior-bat-swing.js',
  'warrior-dash-flight.js',
  'ch1-living-detail.js',
  'ch1-forest-sway.js',
  'ch1-face-life.js',
  'ch1-rot-trees.js',
  'ch1-altar-moat.js',
  'ch1-border-foreground.js',
  'ch1-boundary-edge.js',
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
  const nwPkg = runtimeManifest(pkg,release);
  writeFileSync(`${DIST}/package.json`, JSON.stringify(nwPkg, null, 2), 'utf8');
  writeFileSync(`${DIST}/release-config.json`,JSON.stringify(release,null,2));
  writeFileSync(`${DIST}/build-target.js`,`window.EXODUSER_BUILD_TARGET='${release.target}';\n`);
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
const buildDir = OUT;

console.log(args.runtime?'[build] 검증된 로컬 런타임으로 패키징...':'[build] 공식 NW.js 런타임 다운로드/패키징...');
if(args.runtime){
  // Local runtime must already be verified against the official per-file shasums.
  const proof=JSON.parse(readFileSync(`${args.runtime}/runtime-provenance.json`,'utf8'));
  if(proof.version!=='0.111.2'||proof.flavor!=='normal'||proof.platform!=='win-x64'||proof.officialUrl!=='https://dl.nwjs.io/v0.111.2/SHASUMS256.txt')throw Error('Unverified local runtime');
  for(const file of proof.files){
    if(createHash('sha256').update(readFileSync(`${args.runtime}/${file.path}`)).digest('hex')!==file.sha256)throw Error(`Runtime changed: ${file.path}`);
  }
  cpSync(args.runtime,OUT,{recursive:true});
  cpSync(`${OUT}/nw.exe`,`${OUT}/EXODUSER.exe`);
  cpSync(DIST,`${OUT}/package.nw`,{recursive:true});
}else await nwbuild({
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

console.log(`[build] 완료: ${OUT}/`);

// Stock NW.js can show H.264 while silently dropping AAC. Keep the matching decoder in every build.
cpSync(CODEC_DLL, `${OUT}/ffmpeg.dll`);
console.log('[build] NW.js 0.111.2 AAC/H.264 codec installed');
const artifactFiles=[];
function recordArtifact(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    const file=`${dir}/${entry.name}`;
    if(entry.isDirectory()){recordArtifact(file);continue;}
    const bytes=readFileSync(file);
    artifactFiles.push({path:file.slice(OUT.length+1),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
  }
}
recordArtifact(OUT);
writeFileSync(`${OUT}/release-artifact-manifest.json`,JSON.stringify({config:release,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),sourceDirty:execFileSync('git',['status','--porcelain'],{encoding:'utf8',windowsHide:true}),builtAt:new Date().toISOString(),files:artifactFiles},null,2));
