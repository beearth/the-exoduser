/**
 * 보스 si0 (숲의 감시자) 방향별 아틀라스 빌드
 * 레이아웃: 4행(S,E,N,W) × 32열 × 64px
 * 상태: idle(0-3), walk(4-7), attack(8-13), hit(14-19), death(20-25), windup(26-31)
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const CELL = 64;
const COLS = 32; // 총 열 수 (idle4 + walk4 + attack6 + hit6 + death6 + windup6)
const ROWS = 4;  // S, E, N, W
const W = COLS * CELL; // 2048
const H = ROWS * CELL; // 256

const BASE = path.join(__dirname, '..', 'img', 'pixellab_all', '보스35', '23_si0_숲의감시자', 'animations');
const OUT = path.join(__dirname, '..', 'img', 'mobs', 'atlas_boss_si0_dir.png');

// 방향 순서: row 0=south, 1=east, 2=north, 3=west
const DIRS = ['south', 'east', 'north', 'west'];

// 상태별 매핑: { folder, count, fallbackDir }
// fallbackDir: 해당 방향이 없을 때 미러할 방향 (east↔west, south↔north)
const STATES = [
  { name: 'idle',   folder: 'fight-stance-idle-8-frames', need: 4, mirrorMap: {} },
  { name: 'walk',   folder: 'walking-4-frames',           need: 4, mirrorMap: { south: 'east' } },
  { name: 'attack', folder: 'cross-punch',                need: 6, mirrorMap: {} },
  { name: 'hit',    folder: 'taking-punch',               need: 6, mirrorMap: { west: 'east' } },
  { name: 'death',  folder: 'falling-back-death',         need: 6, mirrorMap: { north: 'south' } },
  { name: 'windup', folder: 'fireball',                   need: 6, mirrorMap: { east: 'west' } },
];

async function loadFrame(folderPath, frameIdx) {
  const fname = `frame_${String(frameIdx).padStart(3, '0')}.png`;
  const fpath = path.join(folderPath, fname);
  if (!fs.existsSync(fpath)) return null;
  // 64x64로 리사이즈 (원본이 다를 수 있음)
  return sharp(fpath).resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).raw().toBuffer();
}

async function loadFrameMirrored(folderPath, frameIdx) {
  const fname = `frame_${String(frameIdx).padStart(3, '0')}.png`;
  const fpath = path.join(folderPath, fname);
  if (!fs.existsSync(fpath)) return null;
  return sharp(fpath).resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).flop().raw().toBuffer();
}

async function build() {
  // RGBA 빈 캔버스
  const canvas = Buffer.alloc(W * H * 4, 0);

  function blitFrame(buf, col, row) {
    const dstX = col * CELL;
    const dstY = row * CELL;
    for (let y = 0; y < CELL; y++) {
      const srcOff = y * CELL * 4;
      const dstOff = ((dstY + y) * W + dstX) * 4;
      buf.copy(canvas, dstOff, srcOff, srcOff + CELL * 4);
    }
  }

  let colOffset = 0;

  for (const state of STATES) {
    console.log(`[${state.name}] col ${colOffset}-${colOffset + state.need - 1}`);

    for (let rowIdx = 0; rowIdx < DIRS.length; rowIdx++) {
      const dir = DIRS[rowIdx];
      const dirFolder = path.join(BASE, state.folder, dir);
      const hasDirFolder = fs.existsSync(dirFolder);

      // 미러 필요?
      const mirrorFrom = state.mirrorMap[dir];
      const useMirror = !hasDirFolder && mirrorFrom;
      const srcDir = useMirror ? mirrorFrom : dir;
      const srcFolder = path.join(BASE, state.folder, srcDir);

      if (!fs.existsSync(srcFolder)) {
        console.warn(`  WARN: ${dir} → no source (${srcDir} folder missing), filling empty`);
        continue;
      }

      for (let fi = 0; fi < state.need; fi++) {
        const buf = useMirror
          ? await loadFrameMirrored(srcFolder, fi)
          : await loadFrame(srcFolder, fi);
        if (buf) {
          blitFrame(buf, colOffset + fi, rowIdx);
        } else {
          // 프레임 부족 시 마지막 프레임 반복
          if (fi > 0) {
            const lastBuf = useMirror
              ? await loadFrameMirrored(srcFolder, fi - 1)
              : await loadFrame(srcFolder, fi - 1);
            if (lastBuf) blitFrame(lastBuf, colOffset + fi, rowIdx);
          }
        }
      }
      console.log(`  ${dir}${useMirror ? ' (mirror from ' + mirrorFrom + ')' : ''}: OK`);
    }
    colOffset += state.need;
  }

  // PNG 출력
  await sharp(canvas, { raw: { width: W, height: H, channels: 4 } })
    .png()
    .toFile(OUT);

  console.log(`\nDone! → ${OUT}`);
  console.log(`Size: ${W}x${H} (${COLS} cols × ${ROWS} rows × ${CELL}px)`);
}

build().catch(e => { console.error(e); process.exit(1); });
