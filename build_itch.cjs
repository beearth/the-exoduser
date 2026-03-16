// build_itch.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = __dirname;
const DIST = path.join(__dirname, 'dist_itch2');
const ZIP_NAME = 'EXODUSER_itch.zip';

// 포함할 항목
const INCLUDE = [
  { src: 'game.html', dst: 'index.html' },  // 리네임
  { src: 'img',       dst: 'img' },
  { src: 'bgm',       dst: 'bgm' },
  { src: 'impact',    dst: 'impact' },
];
// atlas 파일 (루트 레벨 png/json)
const ATLAS_PATTERNS = [
  'atlas_player.png',  'atlas_player.json',
  'atlas_enemies.png', 'atlas_enemies.json',
  'atlas_bosses.png',  'atlas_bosses.json',
];

// 1. dist 초기화
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(DIST);

// 2. 파일/폴더 복사 함수 (불필요한 폴더 제외)
const SKIP_DIRS = ['animations','_raw','rotations','_new'];
const SKIP_SUFFIX = '_raw';
function shouldSkip(name) {
  return SKIP_DIRS.includes(name) || name.endsWith(SKIP_SUFFIX);
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) {
    console.warn('[SKIP] 없음:', src);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) {
    const s = path.join(src, f);
    const d = path.join(dst, f);
    if (fs.statSync(s).isDirectory()) {
      if (shouldSkip(f)) { console.log('[SKIP]', s); continue; }
      copyDir(s, d);
    } else fs.copyFileSync(s, d);
  }
}

// 3. 복사 실행
for (const item of INCLUDE) {
  const s = path.join(SRC, item.src);
  const d = path.join(DIST, item.dst);
  if (fs.statSync(s).isDirectory()) copyDir(s, d);
  else fs.copyFileSync(s, d);
  console.log('[COPY]', item.src, '→', item.dst);
}

// 4. atlas 파일
for (const f of ATLAS_PATTERNS) {
  const s = path.join(SRC, f);
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, path.join(DIST, f));
    console.log('[COPY]', f);
  } else {
    console.warn('[SKIP] 없음:', f);
  }
}

// 5. zip 생성 (PowerShell)
const zipPath = path.join(__dirname, ZIP_NAME);
if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
execSync(
  `powershell Compress-Archive -Path "${DIST}\\*" -DestinationPath "${zipPath}"`,
  { stdio: 'inherit' }
);

// 6. 크기 출력
const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1);
console.log(`\n✅ 완료: ${ZIP_NAME} (${sizeMB} MB)`);
console.log('→ itch.io 업로드 준비 완료');
