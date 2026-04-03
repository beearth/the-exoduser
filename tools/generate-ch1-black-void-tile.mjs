import sharp from 'sharp';

const TAU = Math.PI * 2;
const inputPath = 'assets/map/ch1/ground_dark_soil.png';
const outputPath = 'assets/map/ch1/wall_black_void_tile.png';
const previewPath = 'assets/map/ch1/wall_black_void_tile_preview.png';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function wave(x, y, width, height, ax, ay, phase = 0) {
  return Math.sin(TAU * (x / width * ax + y / height * ay) + phase);
}

function field(x, y, width, height) {
  const a = wave(x, y, width, height, 2, 3, 0.35);
  const b = wave(x, y, width, height, -5, 4, 1.1);
  const c = Math.cos(TAU * (x / width * 7 - y / height * 6) + 2.15);
  const d = Math.sin(TAU * (x / width * 11 + y / height * 9) + 0.6);
  return clamp(0.5 + a * 0.18 + b * 0.14 + c * 0.1 + d * 0.06, 0, 1);
}

function patchField(x, y, width, height) {
  const p1 = Math.sin(TAU * (x / width * 1 + y / height * 1) + 0.8);
  const p2 = Math.cos(TAU * (x / width * 3 - y / height * 2) + 1.7);
  const p3 = Math.sin(TAU * (x / width * 4 + y / height * 5) + 2.3);
  return clamp(0.5 + p1 * 0.22 + p2 * 0.16 + p3 * 0.08, 0, 1);
}

async function generate() {
  const { data, info } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * channels);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const lum = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
      const redVein = clamp((r - g * 0.72 - b * 0.62) / 255, 0, 1);
      const n = field(x, y, width, height);
      const p = patchField(x, y, width, height);

      const detail = lum * 0.18;
      const cloud = Math.pow(n, 1.65);
      const patches = Math.pow(p, 2.2);
      const tealGlow = clamp((cloud - 0.45) * 1.6, 0, 1) * (0.45 + patches * 0.55);
      const pit = Math.pow(1 - n, 2.6);
      const veinGlow = Math.pow(redVein, 1.25) * 0.35;

      let rr = 3 + detail * 8 + pit * 5 + veinGlow * 6;
      let gg = 5 + detail * 10 + pit * 6 + tealGlow * 11 + veinGlow * 3;
      let bb = 8 + detail * 15 + pit * 9 + tealGlow * 18 + patches * 4 + veinGlow * 7;

      const edgeDim = 0.88 + Math.min(
        Math.min(x, width - 1 - x),
        Math.min(y, height - 1 - y)
      ) / Math.min(width, height) * 0.1;

      rr = clamp(rr * edgeDim, 0, 255);
      gg = clamp(gg * edgeDim, 0, 255);
      bb = clamp(bb * edgeDim, 0, 255);

      out[idx] = rr;
      out[idx + 1] = gg;
      out[idx + 2] = bb;
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .png()
    .toFile(outputPath);

  await sharp({
    create: {
      width: width * 2,
      height: height * 2,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([
      { input: outputPath, top: 0, left: 0 },
      { input: outputPath, top: 0, left: width },
      { input: outputPath, top: height, left: 0 },
      { input: outputPath, top: height, left: width },
    ])
    .png()
    .toFile(previewPath);

  console.log(`generated ${outputPath}`);
  console.log(`generated ${previewPath}`);
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
