// EXODUSER: generated art -> fixed-grid candidate atlases + review media.
// Does not modify game.html, source atlases, saves or the shared Git index.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(await fs.readFile(new URL('./dota_vfx_pack_20261102.json', import.meta.url), 'utf8'));
const dest = path.join(root, 'assets/vfx/dota-reference-20261102');
const out = process.argv.find(v => v.startsWith('--out='))?.slice(6) || 'I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1';
await fs.mkdir(dest, { recursive: true });
await fs.mkdir(path.join(out, 'sources'), { recursive: true });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const baselineNames = ['assets/vfx/ki_slash_silver_sheet.png', 'assets/vfx/giant_slam_impact_sheet.png', 'assets/vfx/inferno_slam_impact_sheet.png', 'game.html'];
const baselines = Object.fromEntries(await Promise.all(baselineNames.map(async p => [p, sha(await fs.readFile(path.join(root, p)))])));
const manifest = { date: config.date, service: config.service, model: config.model, sourceHead: config.sourceHead, stage: 'CANDIDATE_NOT_INTEGRATED', baselines, assets: [], rejected: config.rejected.map(({ file, reason }) => ({ file, reason })) };

for (const asset of config.assets) {
  const source = await fs.readFile(asset.raw);
  await fs.writeFile(path.join(out, 'sources', path.basename(asset.raw)), source);
  const m = await sharp(source).metadata();
  assert.equal(m.width % asset.columns, 0, `${asset.id}: source grid width`);
  assert.equal(m.height % asset.rows, 0, `${asset.id}: source grid height`);
  const sw = m.width / asset.columns, sh = m.height / asset.rows;
  assert.equal(sw, sh, `${asset.id}: square cells`);
  assert.equal(m.hasAlpha, true, `${asset.id}: source alpha`);
  const side = Math.floor(asset.cell * asset.paddingScale / 2) * 2;
  const pad = (asset.cell - side) / 2;
  const layers = [];
  for (let n = 0; n < asset.frames; n++) {
    const input = await sharp(source).extract({ left: (n % asset.columns) * sw, top: Math.floor(n / asset.columns) * sh, width: sw, height: sh }).resize(side, side).png().toBuffer();
    layers.push({ input, left: (n % asset.columns) * asset.cell + pad, top: Math.floor(n / asset.columns) * asset.cell + pad });
  }
  const width = asset.columns * asset.cell, height = asset.rows * asset.cell;
  const packed = await sharp({ create: { width, height, channels: 4, background: '#00000000' } }).composite(layers).png().toBuffer();
  const raw = await sharp(packed).raw().toBuffer();
  const frameMetrics = [];
  for (let n = 0; n < asset.frames; n++) {
    let count = 0, opacity = 0, minX = asset.cell, minY = asset.cell, maxX = -1, maxY = -1, edge = 0;
    const fx = (n % asset.columns) * asset.cell, fy = Math.floor(n / asset.columns) * asset.cell;
    for (let y = 0; y < asset.cell; y++) for (let x = 0; x < asset.cell; x++) {
      const a = raw[((fy + y) * width + fx + x) * 4 + 3];
      opacity += a / 255;
      if (a > 16) { count++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
      if ((x < 8 || y < 8 || x >= asset.cell - 8 || y >= asset.cell - 8) && a > 0) edge++;
    }
    assert.ok(count > 0, `${asset.id}: nonempty frame ${n}`);
    assert.equal(edge, 0, `${asset.id}: clear outer gutter ${n}`);
    assert.ok(count < asset.cell ** 2 * 0.8, `${asset.id}: transparent negative space ${n}`);
    frameMetrics.push({ frame: n, alphaBounds: [minX, minY, maxX, maxY], coverage: +(count / asset.cell ** 2).toFixed(4), opacityArea: +(opacity / asset.cell ** 2).toFixed(4), outer8pxAlphaPixels: edge });
  }
  await fs.writeFile(path.join(dest, asset.file), packed);
  manifest.assets.push({ id: asset.id, file: asset.file, width, height, columns: asset.columns, rows: asset.rows, frameWidth: asset.cell, frameHeight: asset.cell, frames: asset.frames, anchor: asset.anchor, paddingScale: asset.paddingScale, playback: 'row-major, no per-frame recentering/rescaling', previewDurationMs: asset.previewDurationMs, previewTimingIsGameplayContract: false, intendedBlend: asset.id === 'ki-slash' ? 'normal dark layer + additive silver layer (adapter required)' : 'source-over dust; separate contact core if used', sha256: sha(packed), sourceSha256: sha(source), sourceFile: path.basename(asset.raw), sourceReference: asset.reference, prompt: asset.prompt, metrics: frameMetrics });
}
for (const entry of config.rejected) {
  const sourceDir = path.dirname(config.assets[0].raw);
  await fs.copyFile(path.join(sourceDir, entry.file), path.join(out, 'sources', entry.file));
}
await fs.writeFile(path.join(out, 'generation-receipt.json'), JSON.stringify(config, null, 2));

// Offline review GIFs. Neutral backdrop, original H5 player sprite, atlas layers only.
// These do not claim to reproduce the full game renderer or gameplay.
const hero = await sharp(path.join(root, 'img/exoduser_warrior/east.png')).extract({ left: 0, top: 0, width: 48, height: 48 }).resize(96, 96, { kernel: 'nearest' }).png().toBuffer();
const svg = (heading) => Buffer.from(`<svg width="960" height="400" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="g"><stop stop-color="#302c27"/><stop offset="1" stop-color="#121417"/></radialGradient></defs><rect width="960" height="400" fill="#101113"/><text x="28" y="34" fill="#e3d6be" font-size="21" font-family="Malgun Gothic">${heading}</text><text x="28" y="62" fill="#9b9488" font-size="12" font-family="Malgun Gothic">시트 움직임 비교 · 중립 배경 · 게임 적용 전</text><rect x="18" y="78" width="450" height="302" rx="7" fill="url(#g)"/><rect x="492" y="78" width="450" height="302" rx="7" fill="url(#g)"/><text x="34" y="105" fill="#a59f94" font-size="13" font-family="Malgun Gothic">현재 H5 시트</text><text x="508" y="105" fill="#dfc18a" font-size="13" font-family="Malgun Gothic">레퍼런스 반영 시안</text><path d="M34 305 H452 M508 305 H926" stroke="#444039" stroke-width="1"/></svg>`);
const baseBuffers = {};
for (const asset of manifest.assets) {
  const currentFile = asset.id === 'ki-slash' ? 'assets/vfx/ki_slash_silver_sheet.png' : 'assets/vfx/inferno_slam_impact_sheet.png';
  const previous = await sharp(path.join(root, currentFile)).metadata();
  baseBuffers[asset.id] = { previous, currentFile };
}
for (const asset of manifest.assets) {
  const framesDir = path.join(out, `${asset.id}-frames`);
  await fs.mkdir(framesDir, { recursive: true });
  const isKi = asset.id === 'ki-slash';
  const title = isKi ? '기검참 · 전방 검격 / 잔상' : '전사 강타 · 중심 접점 / 지면 충격';
  const bg = await sharp(svg(title)).png().toBuffer();
  const old = baseBuffers[asset.id];
  const oldCols = isKi ? 3 : 2, oldCount = isKi ? 9 : 4;
  const oldW = old.previous.width / oldCols, oldH = old.previous.height / oldCols;
  const oldSprites = [], newSprites = [];
  const size = isKi ? 220 : 350;
  for (let n = 0; n < oldCount; n++) oldSprites.push(await sharp(path.join(root, old.currentFile)).extract({ left: (n % oldCols) * oldW, top: Math.floor(n / oldCols) * oldH, width: oldW, height: oldH }).resize(size, size).png().toBuffer());
  for (let n = 0; n < asset.frames; n++) newSprites.push(await sharp(path.join(dest, asset.file)).extract({ left: (n % asset.columns) * asset.frameWidth, top: Math.floor(n / asset.columns) * asset.frameHeight, width: asset.frameWidth, height: asset.frameHeight }).resize(size, size).png().toBuffer());
  for (let i = 0; i < 45; i++) {
    const t = i * 40 - 160, progress = t / asset.previewDurationMs;
    const layers = [];
    for (const [panel, sprites, blend] of [[0, oldSprites, 'screen'], [1, newSprites, isKi ? 'screen' : 'over']]) {
      const px = 18 + panel * 474;
      if (progress >= 0 && progress < 1) {
        const n = Math.min(sprites.length - 1, Math.floor(progress * sprites.length));
        const cx = isKi ? px + 172 + progress * 115 : px + 225;
        layers.push({ input: sprites[n], left: Math.round(cx - size / 2), top: 252 - size / 2, blend });
      }
      layers.push({ input: hero, left: px + (isKi ? 76 : 177), top: 201 });
    }
    const frame = await sharp(bg).composite(layers).png().toBuffer();
    await fs.writeFile(path.join(framesDir, `${String(i).padStart(3, '0')}.png`), frame);
    if (i === (isKi ? 8 : 10)) await fs.writeFile(path.join(out, `${asset.id}-comparison.png`), frame);
  }
  const gif = path.join(out, `${asset.id}-comparison.gif`);
  const ff = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '25', '-i', path.join(framesDir, '%03d.png'), '-filter_complex', '[0:v]split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', gif], { windowsHide: true, encoding: 'utf8' });
  if (ff.error) throw ff.error;
  assert.equal(ff.status, 0, `ffmpeg: ${ff.stderr}`);
}
for (const p of baselineNames) assert.equal(sha(await fs.readFile(path.join(root, p))), baselines[p], `baseline unchanged: ${p}`);
manifest.validation = { allFramesNonempty: true, outer8pxGuttersClear: true, baselineBytesUnchanged: true, reviewedInGame: false, denseCombatReviewed: false, visualVerdict: 'RETOUCH', notes: ['Atlas preview only; 4-frame ground-shock transitions and in-game contact integration need review. Old H5 giantSlam currently chooses inferno sheet via vfxKind.', 'Existing auxiliary lava/flash/ring/crack passes are not part of the isolated preview.', 'Raw generated cells have no per-frame realignment. Uniform 0.8 packing scale across every frame.'] };
await fs.writeFile(path.join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2));
await fs.writeFile(path.join(out, 'asset-validation.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ dest, out, assets: manifest.assets.map(a => ({ file: a.file, size: [a.width, a.height], frames: a.frames, sha256: a.sha256 })), validation: manifest.validation }, null, 2));
