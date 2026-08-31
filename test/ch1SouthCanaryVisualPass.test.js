import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GAME = fs.readFileSync(path.join(ROOT, 'game.html'), 'utf8');
const OUT = path.join(ROOT, 'assets', 'map', 'ch1', 'baked_spike', 'south_visual_pass');
const EXPECTED = [
  ...[5, 6].flatMap(y => Array.from({ length: 8 }, (_, x) => `${x},${y}`)),
  '3,4', '4,4', '3,7', '4,7',
].sort();

test('SOUTH canary keeps the existing opt-in loader and registers only the 20 approved SOUTH chunks', () => {
  const block = GAME.match(/\/\/ CH1 PAINTED START SPIKE BEGIN([\s\S]*?)\/\/ CH1 PAINTED START SPIKE END/)?.[1] || '';
  assert.match(block, /get\('ch1BakedSpike'\)\s*===\s*'1'/);
  assert.match(block, /stage:\s*1/);
  const registered = [...block.matchAll(/'(\d+),(\d+)'\s*:\s*'assets\/map\/ch1\/baked_spike\/south_visual_pass\/chunk_\d+_\d+\.png'/g)]
    .map(match => `${match[1]},${match[2]}`).sort();
  assert.deepEqual(registered, EXPECTED);
});

test('visual-only suppression is an additional opt-in draw decision, not a MAP_OBJS or collision mutation', () => {
  assert.match(GAME, /function _ch1BakedSuppressVisualEnabled\(\)/);
  assert.match(GAME, /get\('ch1BakedSuppressVisual'\)\s*===\s*'1'/);
  assert.match(GAME, /function _ch1ShouldSuppressSouthVisualProp\(mo\)/);
  assert.match(GAME, /if\(_ch1ShouldSuppressSouthVisualProp\(mo\)\)continue;/);
  assert.doesNotMatch(GAME, /ch1BakedSuppressVisual[\s\S]{0,500}MAP_OBJS\.(?:splice|filter)/);
});

test('composition manifest records asymmetric three-depth masses and the protected center', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT, 'composition.json'), 'utf8'));
  assert.deepEqual(manifest.masterBounds, { x: 0, y: 4096, width: 8192, height: 4096 });
  assert.equal(manifest.chunkSize, 1024);
  assert.equal(manifest.bleed, 1);
  assert.deepEqual([...manifest.chunks].sort(), EXPECTED);
  assert.deepEqual(manifest.left.depthLayers, ['BACK', 'MID', 'FRONT']);
  assert.deepEqual(manifest.right.depthLayers, ['BACK', 'MID', 'FRONT']);
  assert.equal(manifest.left.grammar, 'low-wide-horizontal');
  assert.equal(manifest.right.grammar, 'high-twisted-vertical');
  assert.equal(manifest.left.sourceComposites.length, 3);
  assert.equal(manifest.right.sourceComposites.length, 4);
  assert.deepEqual(manifest.left.overlapRange, [0.3, 0.5]);
  assert.deepEqual(manifest.right.overlapRange, [0.3, 0.5]);
  assert.ok(manifest.protectedCenter.minX < manifest.protectedCenter.maxX);
  assert.equal(manifest.geometrySource, 'assets/map/ch1/geometry/ch1_si1_geometry.js');
  assert.equal(manifest.walkableTreatment, 'transparent-runtime-ground');
  assert.equal(manifest.geometryEdgeBlendPx, 20);
});

test('SOUTH painted master follows the canonical geometry instead of covering walkable space', async () => {
  const image = sharp(path.join(OUT, 'CH1_SOUTH_MASTER.png')).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const alphaAtTile = (x, y) => {
    const px = Math.max(0, Math.min(info.width - 1, Math.round(x * 40)));
    const py = Math.max(0, Math.min(info.height - 1, Math.round(y * 40 - 4096)));
    return data[(py * info.width + px) * 4 + 3];
  };
  for (const [id, point] of Object.entries({ south:[115,158], toxic:[49,151], cocoon:[151,136], start:[100,185] })) {
    assert.ok(alphaAtTile(...point) <= 8, `${id} walkable ground must remain transparent`);
  }
  assert.ok(alphaAtTile(10,151) >= 240, 'west non-walkable mass must remain opaque');
  assert.ok(alphaAtTile(190,151) >= 240, 'east non-walkable mass must remain opaque');
});

test('SOUTH master and all extracted chunks have the authored dimensions', async () => {
  const master = await sharp(path.join(OUT, 'CH1_SOUTH_MASTER.png')).metadata();
  assert.deepEqual([master.width, master.height], [8192, 4096]);
  for (const id of EXPECTED) {
    const [x, y] = id.split(',');
    const meta = await sharp(path.join(OUT, `chunk_${x}_${y}.png`)).metadata();
    assert.deepEqual([meta.width, meta.height], [1026, 1026], id);
  }
});

test('adjacent SOUTH chunks carry matching one-pixel bleed at every registered seam', async () => {
  const images = new Map();
  for (const id of EXPECTED) {
    const [x, y] = id.split(',');
    images.set(id, await sharp(path.join(OUT, `chunk_${x}_${y}.png`)).ensureAlpha().raw().toBuffer());
  }
  const pixel = (buffer, x, y) => buffer.subarray((y * 1026 + x) * 4, (y * 1026 + x) * 4 + 4);
  const registered = new Set(EXPECTED);
  for (const id of EXPECTED) {
    const [x, y] = id.split(',').map(Number);
    const current = images.get(id);
    const rightId = `${x + 1},${y}`;
    if (registered.has(rightId)) {
      const right = images.get(rightId);
      for (let py = 0; py < 1026; py++) {
        assert.deepEqual(pixel(current, 1025, py), pixel(right, 1, py), `${id} → ${rightId} right bleed`);
        assert.deepEqual(pixel(current, 1024, py), pixel(right, 0, py), `${id} → ${rightId} left bleed`);
      }
    }
    const downId = `${x},${y + 1}`;
    if (registered.has(downId)) {
      const down = images.get(downId);
      for (let px = 0; px < 1026; px++) {
        assert.deepEqual(pixel(current, px, 1025), pixel(down, px, 1), `${id} → ${downId} bottom bleed`);
        assert.deepEqual(pixel(current, px, 1024), pixel(down, px, 0), `${id} → ${downId} top bleed`);
      }
    }
  }
});
