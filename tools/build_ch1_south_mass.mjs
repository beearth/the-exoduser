import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1')), '..');
const OUT = path.join(ROOT, 'assets', 'map', 'ch1', 'baked_spike', 'south_visual_pass');
const manifest = JSON.parse(readFileSync(path.join(OUT, 'composition.json'), 'utf8'));
const basePath = path.join(OUT, 'CH1_SOUTH_BASE.png');
const masterPath = path.join(OUT, 'CH1_SOUTH_MASTER.png');
const geometryPath = path.join(ROOT, 'assets', 'map', 'ch1', 'geometry', 'ch1_si1_geometry.js');

const source = relative => path.join(ROOT, ...relative.split('/'));
const layers = [];

const backSvg = Buffer.from(`
<svg width="8192" height="4096" viewBox="0 0 8192 4096" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftDark" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#050708" stop-opacity="0.98"/>
      <stop offset="0.62" stop-color="#111014" stop-opacity="0.91"/>
      <stop offset="1" stop-color="#241822" stop-opacity="0.42"/>
    </linearGradient>
    <linearGradient id="rightDark" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#040607" stop-opacity="0.99"/>
      <stop offset="0.58" stop-color="#100e13" stop-opacity="0.94"/>
      <stop offset="1" stop-color="#21141d" stop-opacity="0.46"/>
    </linearGradient>
    <clipPath id="leftClip"><path fill-rule="evenodd" d="M0 0H2980C3260 270 3040 560 3320 880C3470 1170 3180 1470 3410 1770C3240 2070 3340 2360 3150 2630C2860 2930 3060 3310 2920 3590C3070 3780 3000 3940 2830 4096H0ZM650 1940a760 610 0 1 0 1520 0a760 610 0 1 0-1520 0Z"/></clipPath>
    <clipPath id="rightClip"><path fill-rule="evenodd" d="M8192 0H5450C5220 280 5520 530 5260 810C5120 1080 5390 1360 5150 1600C5000 1910 5260 2160 5060 2440C5230 2700 5050 3020 5240 3290C5060 3550 5200 3820 5380 4096H8192ZM5840 2220a770 650 0 1 0 1540 0a770 650 0 1 0-1540 0Z"/></clipPath>
  </defs>
  <path fill="url(#leftDark)" fill-rule="evenodd" d="M0 0H2980C3260 270 3040 560 3320 880C3470 1170 3180 1470 3410 1770C3240 2070 3340 2360 3150 2630C2860 2930 3060 3310 2920 3590C3070 3780 3000 3940 2830 4096H0ZM650 1940a760 610 0 1 0 1520 0a760 610 0 1 0-1520 0Z"/>
  <path fill="url(#rightDark)" fill-rule="evenodd" d="M8192 0H5450C5220 280 5520 530 5260 810C5120 1080 5390 1360 5150 1600C5000 1910 5260 2160 5060 2440C5230 2700 5050 3020 5240 3290C5060 3550 5200 3820 5380 4096H8192ZM5840 2220a770 650 0 1 0 1540 0a770 650 0 1 0-1540 0Z"/>
  <g clip-path="url(#leftClip)" fill="none" stroke-linecap="round">
    <path d="M-150 430C720 210 990 820 1900 510S2700 310 3350 780" stroke="#32222c" stroke-width="48" opacity=".32"/>
    <path d="M-120 1180C760 1430 1420 980 2240 1340S2980 1390 3450 1710" stroke="#201d20" stroke-width="76" opacity=".45"/>
    <path d="M-80 2830C780 2490 1540 3090 2260 2730S2920 2730 3290 3110" stroke="#39242e" stroke-width="54" opacity=".27"/>
    <path d="M200 3820C980 3330 1680 3950 2990 3510" stroke="#17191a" stroke-width="104" opacity=".58"/>
  </g>
  <g clip-path="url(#rightClip)" fill="none" stroke-linecap="round">
    <path d="M8350 360C7510 720 7100 140 6250 610S5530 560 5150 910" stroke="#34212b" stroke-width="56" opacity=".28"/>
    <path d="M8320 1460C7480 980 6890 1630 6100 1260S5380 1450 5020 1760" stroke="#18191c" stroke-width="92" opacity=".56"/>
    <path d="M8300 2590C7520 2170 6940 2910 6140 2420S5360 2570 5050 2900" stroke="#39232e" stroke-width="62" opacity=".3"/>
    <path d="M8350 3800C7440 3300 6610 3990 5200 3490" stroke="#17181a" stroke-width="112" opacity=".62"/>
  </g>
</svg>`);
layers.push({ input: backSvg, left: 0, top: 0, blend: 'over' });

async function assetLayer({ file, left, top, width, height, rotate = 0, flip = false, brightness = 0.5, saturation = 0.55, opacity = 1, blur = 0 }) {
  let image = sharp(source(file)).ensureAlpha();
  if (flip) image = image.flop();
  if (rotate) image = image.rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } });
  image = image.resize({ width, height, fit: 'fill' }).modulate({ brightness, saturation });
  if (blur > 0) image = image.blur(blur);
  image = image.linear([1, 1, 1, opacity], [0, 0, 0, 0]);
  const cropLeft = Math.max(0, -left);
  const cropTop = Math.max(0, -top);
  const targetLeft = Math.max(0, left);
  const targetTop = Math.max(0, top);
  const cropWidth = Math.min(width - cropLeft, 8192 - targetLeft);
  const cropHeight = Math.min(height - cropTop, 4096 - targetTop);
  image = image.extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight });
  return { input: await image.png().toBuffer(), left: targetLeft, top: targetTop, blend: 'over' };
}

const BACK = [
  { file: 'assets/map/ch1/collision/bound_w.png', left: -240, top: 260, width: 3000, height: 920, rotate: 90, brightness: 0.34, saturation: 0.42, opacity: 0.64, blur: 1.2 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: -120, top: 2420, width: 2700, height: 1500, flip: true, brightness: 0.31, saturation: 0.38, opacity: 0.58, blur: 1.3 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 1260, top: 560, width: 2220, height: 1450, rotate: -5, brightness: 0.35, saturation: 0.44, opacity: 0.61, blur: 1 },
  { file: 'assets/map/ch1/collision/bound_e.png', left: 6660, top: -180, width: 1610, height: 4420, brightness: 0.28, saturation: 0.36, opacity: 0.76, blur: 1.4 },
  { file: 'assets/map/ch1/collision/corner_ne.png', left: 5060, top: 40, width: 2450, height: 1680, flip: true, brightness: 0.31, saturation: 0.4, opacity: 0.62, blur: 1.1 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 5300, top: 2210, width: 2500, height: 1800, flip: true, rotate: 180, brightness: 0.3, saturation: 0.38, opacity: 0.66, blur: 1.2 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: 6020, top: 1050, width: 2080, height: 1780, rotate: 7, brightness: 0.29, saturation: 0.36, opacity: 0.58, blur: 1.4 },
];
for (const item of BACK) layers.push(await assetLayer(item));

const MID = [
  { file: 'assets/map/ch1/collision/corner_sw.png', left: -460, top: 380, width: 2360, height: 1260, rotate: -3, brightness: 0.48, saturation: 0.58, opacity: 0.82 },
  { file: 'assets/map/ch1/collision/bound_w.png', left: 120, top: 2710, width: 2850, height: 980, rotate: 90, flip: true, brightness: 0.43, saturation: 0.53, opacity: 0.8 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: 1730, top: 760, width: 1770, height: 1870, rotate: -8, brightness: 0.44, saturation: 0.5, opacity: 0.78 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 2260, top: -120, width: 1420, height: 1420, rotate: -7, brightness: 0.43, saturation: 0.47, opacity: 0.72 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: 2220, top: 990, width: 1450, height: 1540, flip: true, rotate: 6, brightness: 0.42, saturation: 0.45, opacity: 0.7 },
  { file: 'assets/map/ch1/collision/bound_w.png', left: 2180, top: 2360, width: 1530, height: 970, rotate: 90, brightness: 0.4, saturation: 0.43, opacity: 0.72 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 2260, top: 3000, width: 1430, height: 1190, flip: true, rotate: -4, brightness: 0.41, saturation: 0.44, opacity: 0.7 },
  { file: 'assets/map/ch1/collision/bound_e.png', left: 6890, top: -260, width: 1450, height: 4490, flip: true, brightness: 0.43, saturation: 0.5, opacity: 0.84 },
  { file: 'assets/map/ch1/collision/corner_ne.png', left: 5010, top: 260, width: 2260, height: 1510, rotate: 5, brightness: 0.45, saturation: 0.53, opacity: 0.8 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 5200, top: 2290, width: 2390, height: 1680, rotate: 175, brightness: 0.46, saturation: 0.5, opacity: 0.81 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: 6170, top: 1070, width: 1850, height: 1710, rotate: 10, brightness: 0.42, saturation: 0.48, opacity: 0.72 },
  { file: 'assets/map/ch1/collision/bound_e.png', left: 4640, top: -180, width: 1340, height: 4460, brightness: 0.38, saturation: 0.43, opacity: 0.74 },
  { file: 'assets/map/ch1/collision/corner_ne.png', left: 4690, top: 180, width: 1540, height: 1500, flip: true, rotate: 5, brightness: 0.4, saturation: 0.46, opacity: 0.68 },
  { file: 'assets/map/ch1/collision/corner_sw.png', left: 4670, top: 1450, width: 1600, height: 1650, rotate: 176, brightness: 0.41, saturation: 0.45, opacity: 0.7 },
  { file: 'assets/map/ch1/collision/corner_nw.png', left: 4660, top: 2820, width: 1580, height: 1410, rotate: 8, brightness: 0.4, saturation: 0.44, opacity: 0.68 },
];
for (const item of MID) layers.push(await assetLayer(item));

const FRONT = [
  { file: 'assets/map/ch1/floor_objects/prop_g_root.png', left: 470, top: 1310, width: 1800, height: 1230, rotate: -11, brightness: 0.55, saturation: 0.66, opacity: 0.58 },
  { file: 'assets/map/ch1/floor_objects/prop_g_toxic.png', left: 780, top: 1510, width: 1390, height: 1010, rotate: 8, flip: true, brightness: 0.48, saturation: 0.72, opacity: 0.46 },
  { file: 'assets/map/ch1/floor_objects/prop_s_root.png', left: 2050, top: 1760, width: 760, height: 520, rotate: -24, brightness: 0.58, saturation: 0.56, opacity: 0.68 },
  { file: 'assets/map/ch1/floor_objects/prop_g_corpse.png', left: 5880, top: 1570, width: 1670, height: 1250, rotate: 7, brightness: 0.5, saturation: 0.58, opacity: 0.55 },
  { file: 'assets/map/ch1/floor_objects/prop_s_root.png', left: 5360, top: 1860, width: 800, height: 560, rotate: 28, flip: true, brightness: 0.56, saturation: 0.54, opacity: 0.7 },
  { file: 'assets/map/ch1/floor_objects/prop_s_pod.png', left: 7050, top: 1790, width: 560, height: 480, rotate: -13, brightness: 0.52, saturation: 0.58, opacity: 0.62 },
];
for (const item of FRONT) layers.push(await assetLayer(item));

const organicMaster = await sharp(basePath)
  .composite(layers)
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer();

// Geometry is canonical: painted forest exists only on non-walkable tiles. The
// transparent holes preserve the live floor, combat readability, and exact collision silhouette.
const geometryContext = {};
geometryContext.globalThis = geometryContext;
vm.runInNewContext(readFileSync(geometryPath, 'utf8'), geometryContext, { filename: geometryPath });
const geometryMask = geometryContext.CH1_SI1_GEOMETRY.buildMask();
const rects = [];
for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++) {
  if (geometryMask[y * 200 + x]) continue;
  const left = x * 40;
  const top = y * 40 - 4096;
  if (top >= 4096 || top + 40 <= 0) continue;
  rects.push(`<rect x="${left}" y="${top}" width="40" height="40"/>`);
}
rects.push('<rect x="8000" y="0" width="192" height="4096"/>');
rects.push('<rect x="0" y="3904" width="8192" height="192"/>');
const geometryAlpha = await sharp(Buffer.from(
  `<svg width="8192" height="4096" xmlns="http://www.w3.org/2000/svg"><g fill="#fff">${rects.join('')}</g></svg>`
)).blur(20).png().toBuffer();

await sharp(organicMaster)
  .ensureAlpha()
  .composite([{ input: geometryAlpha, blend: 'dest-in' }])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(masterPath);

const padded = await sharp(masterPath)
  .extend({ top: 1, bottom: 1, left: 1, right: 1, extendWith: 'copy' })
  .png()
  .toBuffer();
for (const id of manifest.chunks) {
  const [x, y] = id.split(',').map(Number);
  await sharp(padded)
    .extract({ left: x * 1024, top: (y - 4) * 1024, width: 1026, height: 1026 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(path.join(OUT, `chunk_${x}_${y}.png`));
}

mkdirSync(path.join(ROOT, 'captures', 'ch1_south_canary_side_mass_20260829', 'AFTER'), { recursive: true });
await sharp(masterPath)
  .resize({ width: 2048 })
  .jpeg({ quality: 88 })
  .toFile(path.join(ROOT, 'captures', 'ch1_south_canary_side_mass_20260829', 'AFTER', 'SOUTH_MASTER_OVERVIEW.jpg'));
const geometryCapture = path.join(ROOT, 'captures', 'ch1_si1_geometry_redesign_20260829', 'PAINTED');
mkdirSync(geometryCapture, { recursive: true });
await sharp(masterPath)
  .flatten({ background: '#050607' })
  .resize({ width: 2048 })
  .jpeg({ quality: 90 })
  .toFile(path.join(geometryCapture, '09_south_master_geometry_aligned.jpg'));
console.log(JSON.stringify({ master: masterPath, chunks: manifest.chunks.length, geometry: geometryPath, layers: { back: BACK.length, mid: MID.length, front: FRONT.length } }));
