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

function _quant(v) {
  return Math.round(v / 8) * 8;
}

function _buildBgPalette(data, width, height) {
  const counts = new Map();
  const pushColor = (x, y) => {
    const i = (y * width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a === 0) return;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;
    const lum = (r + g + b) / 3;
    if (sat > 18 || lum < 12 || lum > 90) return;
    const key = `${_quant(r)},${_quant(g)},${_quant(b)}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  };
  for (let x = 0; x < width; x++) {
    pushColor(x, 0);
    pushColor(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    pushColor(0, y);
    pushColor(width - 1, y);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key]) => key.split(',').map(Number));
}

function _isBgPixel(data, width, x, y, palette) {
  const i = (y * width + x) * 4;
  const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
  if (a === 0) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  const lum = (r + g + b) / 3;
  if (sat > 18 || lum < 12 || lum > 90) return false;
  let best = Infinity;
  for (const [pr, pg, pb] of palette) {
    const d = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
    if (d < best) best = d;
  }
  return best <= 28;
}

async function _removeCheckerBackground(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const palette = _buildBgPalette(data, width, height);
  const seen = new Uint8Array(width * height);
  const queue = [];
  const tryPush = (x, y) => {
    const idx = y * width + x;
    if (seen[idx]) return;
    if (!_isBgPixel(data, width, x, y, palette)) return;
    seen[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    const di = idx * 4;
    data[di + 3] = 0;
    if (x > 0) tryPush(x - 1, y);
    if (x + 1 < width) tryPush(x + 1, y);
    if (y > 0) tryPush(x, y - 1);
    if (y + 1 < height) tryPush(x, y + 1);
  }

  return sharp(data, { raw: info }).png().toBuffer();
}

async function sliceTriptych(src, startIndex) {
  const meta = await sharp(src).metadata();
  if (!meta.width || !meta.height) throw new Error(`Invalid image: ${src}`);
  const third = Math.floor(meta.width / 3);

  for (let i = 0; i < 3; i++) {
    const left = i * third;
    const width = i === 2 ? meta.width - left : third;
    const outFile = path.join(outDir, `provided_gore_0${startIndex + i}.png`);
    const extracted = await sharp(src)
      .extract({ left, top: 0, width, height: meta.height })
      .ensureAlpha()
      .png()
      .toBuffer();
    const bgRemoved = await _removeCheckerBackground(extracted);
    const trimmed = await sharp(bgRemoved)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
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
