import path from 'node:path';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const [, , srcA, srcB] = process.argv;

if (!srcA || !srcB) {
  console.error('Usage: node tools/slice-user-ch1-gore.mjs <srcA> <srcB>');
  process.exit(1);
}

const outDir = path.resolve('assets/map/ch1/floor_objects');
await fs.mkdir(outDir, { recursive: true });

async function sliceTriptych(src, startIndex) {
  const meta = await sharp(src).metadata();
  if (!meta.width || !meta.height) throw new Error(`Invalid image: ${src}`);
  const third = Math.floor(meta.width / 3);

  for (let i = 0; i < 3; i++) {
    const left = i * third;
    const width = i === 2 ? meta.width - left : third;
    const outFile = path.join(outDir, `provided_gore_0${startIndex + i}.png`);
    const extracted = sharp(src)
      .extract({ left, top: 0, width, height: meta.height })
      .ensureAlpha()
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
    const trimmed = await extracted.png().toBuffer();
    await sharp(trimmed)
      .extend({
        top: 8,
        right: 8,
        bottom: 8,
        left: 8,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outFile);
  }
}

await sliceTriptych(srcA, 1);
await sliceTriptych(srcB, 4);
