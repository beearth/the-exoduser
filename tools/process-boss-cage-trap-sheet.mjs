import sharp from 'sharp';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] || 'assets/vfx/boss/source/boss_cageTrap_source_20260903_193333.png');
const outputs = (process.argv.length > 3
  ? process.argv.slice(3)
  : ['assets/vfx/boss/boss_cageTrap.webp', 'boss_cageTrap.webp'])
  .map((path) => resolve(path));

// 새 원본은 1448×1086의 투명 3×2 콜라주다. 열 너비는 483/483/482px이며,
// 각 행의 반대편 39px 여백을 제외한 504px 높이를 공통 crop으로 사용한다.
// 프레임별 독립 trim/확대는 성장 단계의 상대 크기를 망가뜨리므로 사용하지 않는다.
const columnLeft = [0, 483, 966];
const columnWidth = [483, 483, 482];
const frames = Array.from({ length: 6 }, (_, frame) => ({
  left: columnLeft[frame % 3],
  top: frame < 3 ? 39 : 543,
  width: columnWidth[frame % 3],
  height: 504,
}));

const cells = await Promise.all(frames.map((frame) => sharp(input)
  .extract(frame)
  .resize({ width: 488, height: 488, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()));
const composites = cells.map((cell, frame) => {
  const cellX = (frame % 3) * 512;
  const cellY = Math.floor(frame / 3) * 512;
  return {
    input: cell,
    left: cellX + 12,
    top: cellY + 12,
  };
});

const sheet = await sharp({
  create: {
    width: 1536,
    height: 1024,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .webp({ quality: 95, alphaQuality: 100, smartSubsample: true })
  .toBuffer();

await Promise.all(outputs.map((output) => sharp(sheet).toFile(output)));
console.log(`normalized 6-frame cage trap ${input} -> ${outputs.join(', ')} (1536x1024, 3x2, RGBA)`);
