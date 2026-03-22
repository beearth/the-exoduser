/**
 * patch_walk_atlas.cjs
 * PixelLab 다운로드에서 실제 스프라이트를 atlas_walk.png에 패치
 *
 * 레이아웃: 20 cols × 48px (idle4 + walk4 + atk6 + hit6)
 * 방향: south (기본) — 좌우 플립은 렌더러가 처리
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const CELL = 48;
const COLS = 20; // idle(4) + walk(4) + atk(6) + hit(6)
const ATLAS_PATH = path.join(__dirname, '..', 'img', 'mobs', 'atlas_walk.png');
const MONSTERS_DIR = path.join(__dirname, '..', 'img', 'monsters');

// etype → walk atlas row (from _WA_ROW in game.html)
const TARGETS = {
  89: { row: 99, cell: 80 },  // 고통의왕 80px → 48px 다운스케일
  90: { row: 100, cell: 48 }, // 방랑기사
  92: { row: 102, cell: 48 }, // 거울사도
  95: { row: 103, cell: 48 }, // 시간사도
};

// PixelLab 애니메이션 → walk atlas 매핑
const ANIM_MAP = [
  { folder: 'breathing-idle', start: 0, count: 4 },
  { folder: 'walking-4-frames', start: 4, count: 4 },
  { folder: 'cross-punch', start: 8, count: 6 },
  { folder: 'taking-punch', start: 14, count: 6 },
];

async function main() {
  // 백업
  const bakPath = ATLAS_PATH + '.bak_patch';
  if (!fs.existsSync(bakPath)) {
    fs.copyFileSync(ATLAS_PATH, bakPath);
    console.log('Backup:', bakPath);
  }

  const atlas = sharp(ATLAS_PATH);
  const meta = await atlas.metadata();
  console.log(`Atlas: ${meta.width}x${meta.height} (${meta.height / CELL} rows)`);

  // 아틀라스를 raw buffer로 읽기
  const { data, info } = await sharp(ATLAS_PATH)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  const stride = info.width * 4; // RGBA

  let patched = 0;

  for (const [etStr, cfg] of Object.entries(TARGETS)) {
    const et = parseInt(etStr);
    const srcDir = path.join(MONSTERS_DIR, `etype${et}_full`, 'animations');
    if (!fs.existsSync(srcDir)) {
      console.log(`[etype${et}] animations 폴더 없음, 스킵`);
      continue;
    }

    const rowY = cfg.row * CELL;
    if (rowY + CELL > info.height) {
      console.log(`[etype${et}] row ${cfg.row} 아틀라스 범위 초과, 스킵`);
      continue;
    }

    console.log(`[etype${et}] row ${cfg.row} 패치 중...`);

    for (const anim of ANIM_MAP) {
      const animDir = path.join(srcDir, anim.folder, 'south');
      if (!fs.existsSync(animDir)) {
        console.log(`  ${anim.folder}/south 없음`);
        continue;
      }

      const frames = fs.readdirSync(animDir)
        .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
        .sort();

      for (let fi = 0; fi < Math.min(frames.length, anim.count); fi++) {
        const framePath = path.join(animDir, frames[fi]);
        // 프레임을 48x48로 리사이즈 (80px 보스도 축소)
        const frameData = await sharp(framePath)
          .resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .raw()
          .toBuffer();

        const col = anim.start + fi;
        const dstX = col * CELL;
        const dstY = rowY;

        // raw buffer에 복사
        for (let py = 0; py < CELL; py++) {
          const srcOff = py * CELL * 4;
          const dstOff = (dstY + py) * stride + dstX * 4;
          frameData.copy(buf, dstOff, srcOff, srcOff + CELL * 4);
        }
        patched++;
      }
    }
  }

  // 저장
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(ATLAS_PATH);

  console.log(`\n완료: ${patched} 프레임 패치됨 → ${ATLAS_PATH}`);
}

main().catch(e => { console.error(e); process.exit(1); });
