import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function readUseSoftFloorEdge(stage, extras = {}) {
  const match = gameHtml.match(/function _useSoftFloorEdge\(\)\{[\s\S]*?\n\}/);
  assert.ok(match, 'walkable maps need a soft floor-edge gate');
  const G = { stage, _bossArena: false, _mapPaint: false, _pathImgTerrain: false, ...extras };
  return vm.runInNewContext(`(()=>{const G=${JSON.stringify(G)};function _isMapPaint(){return false}function _isPlateMap(){return false}function _isVistaMap(){return false};${match[0]};return _useSoftFloorEdge})()`)();
}

test('CH1-style walkable maps fade floor edges with a blurred occupancy mask, not 40px tile clips', () => {
  assert.match(gameHtml, /function _useSoftFloorEdge\(\)/,
    'soft floor-edge rendering must be an explicit opt-in helper');
  assert.match(gameHtml, /function _ensureFloorSoftMask\(/,
    'the occupancy mask must be built once per map, not per tile');
  assert.match(gameHtml, /function _blitSoftFloor\(/,
    'floor caches must blit through the blurred mask instead of rect-clipping each tile');
  assert.match(gameHtml, /function _boxBlurU8\(src,w,h,radius\)/,
    'the occupancy mask must be box-blurred in pixel space so stair-steps become a continuous falloff');
  assert.match(gameHtml, /destination-in/,
    'soil texture must keep its tiling and only inherit the blurred alpha');
  assert.match(gameHtml, /_FLOOR_SOFT_SCALE=4/,
    'mask resolution must be fine enough to round 40px tile stairs');
  assert.match(gameHtml, /_FLOOR_SOFT_BLUR=5/,
    'fade is about 1.5 tiles after dilate so soil tucks under forest');
  assert.match(gameHtml, /_dilateU8\(occ,W,H,_FLOOR_SOFT_SCALE\)/,
    'soil occupancy dilates one tile into walls so forest covers the contact');
  assert.doesNotMatch(gameHtml, /_erodeU8\(occ,W,H,_FLOOR_SOFT_SCALE\)/,
    'erode opened a dark moat between soil and forest');
});

test('soft floor edge is on for CH1-1 and off for CH2 authored organic floors', () => {
  assert.equal(readUseSoftFloorEdge(0), true, 'CH1-1 forest boundary must use the blurred floor edge');
  assert.equal(readUseSoftFloorEdge(1), true, 'other soil maps share the same visual edge treatment');
  assert.equal(readUseSoftFloorEdge(4), false, 'CH2-1 keeps its authored organic floor mask');
  assert.equal(readUseSoftFloorEdge(0, { _bossArena: true }), false, 'boss arenas must not inherit the field-edge fade');
});

test('streamed, deferred, and synchronous soil caches all use the soft blit on non-CH2 maps', () => {
  const calls = gameHtml.match(/_blitSoftFloor\(/g) || [];
  assert.ok(calls.length >= 4,
    'helper definition plus deferred, synchronous, and streamed caches must share the same blit');
  assert.match(gameHtml, /if\(_useSoftFloorEdge\(\)\)\{\s*_blitSoftFloor\(/);
  assert.equal((gameHtml.match(/_traceCh2AuthoredFloor\(c,/g) || []).length, 4,
    'CH2 organic mask call sites must stay untouched');
});

test('dilate grows occupancy one cell into walls so soil tucks under forest', () => {
  const match = gameHtml.match(/function _dilateU8\(src,w,h,rad\)\{[\s\S]*?return out;\n\}/);
  assert.ok(match, 'pixel-space dilate helper must exist');
  const dilate = vm.runInNewContext(`${match[0]}\n_dilateU8`);
  const w = 8, h = 8, src = new Uint8Array(w * h);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) src[y * w + x] = 255;
  const out = dilate(src, w, h, 1);
  assert.equal(out[0], 255, 'interior floor stays occupied');
  assert.equal(out[4], 255, 'grows one cell right into wall');
  assert.equal(out[4 * w], 255, 'grows one cell down into wall');
  assert.equal(out[5], 0, 'does not jump two cells');
});

test('box blur turns a 40px-style occupancy stair into intermediate alphas', () => {
  const match = gameHtml.match(/function _boxBlurU8\(src,w,h,radius\)\{[\s\S]*?return dst;\n\}/);
  assert.ok(match, 'pixel-space box blur helper must exist');
  const blur = vm.runInNewContext(`${match[0]}\n_boxBlurU8`);
  const w = 16, h = 16, src = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const cut = 8 - (y >> 1);
    for (let x = 0; x < w; x++) if (x < cut) src[y * w + x] = 255;
  }
  const out = blur(src, w, h, 3);
  const contact = out[8 + 8 * w];
  assert.ok(contact > 16 && contact < 240,
    `stair contact must be a soft falloff, got ${contact}`);
  assert.ok(out[1 + 1 * w] > 200, 'deep floor remains nearly opaque');
  assert.ok(out[14 + 14 * w] < 40, 'deep wall remains nearly transparent');
});

test('CH1-1 baked forest is scaled inward on X so it hugs the walkable edge', () => {
  assert.match(gameHtml, /_CH1_OUTER_HUG_X=0\.965/,
    'left/right forest pulls about 3 tiles toward the playable field');
  const draw = gameHtml.match(/function _drawCh1StartOuter\(ctx\)\{[\s\S]*?\n\}/);
  assert.ok(draw, 'baked outer draw path must exist');
  assert.match(draw[0], /ctx\.scale\(_CH1_OUTER_HUG_X,1\)/,
    'only X is hugged; north EXIT and south START stay unscaled');
});

test('soft floor contact must not stroke a dirty black tile stair', () => {
  assert.doesNotMatch(gameHtml, /4\*t\*\(1-t\)\*70/,
    'black occupancy rim overlay is the dirty boundary line');
  assert.doesNotMatch(gameHtml, /_drawCh1BakedSpike\(X\);\s*_drawCh1Hill\(X\);\s*_drawSoftFloorRim\(X\)/,
    'rim must not paint on top of forest/soil contact');
  const nearFill = gameHtml.match(/_useSoftFloorEdge\(\)\s*\{[\s\S]{0,280}fillStyle='#050507'[\s\S]{0,220}_nearSoftFloor/g) || [];
  assert.equal(nearFill.length, 0,
    'near-floor wall tiles must not be stamped as 40px #050507 stairs');
  assert.match(gameHtml, /_SOFT_FLOOR_BACKDROP/,
    'contact void is a single dark backdrop, not per-tile black rects');
});

test('soft floor edge never mutates collision, forestBoundary, or CH2 soil-edge alpha', () => {
  assert.match(gameHtml, /forestBoundary:1/);
  assert.match(gameHtml, /var MAP_ALL_FLOOR=false;/);
  assert.match(gameHtml, /function isW\(px,py,skipBone\)/);
  const soilEdge = gameHtml.match(/function _soilEdgeA[\s\S]*?(?=const _FLOOR_SOFT_SCALE)/);
  assert.ok(soilEdge, 'shared soil-edge alpha helper must remain');
  assert.match(soilEdge[0], /if\(typeof G!=='undefined'&&G\.stage===4\)return 1;/);
  assert.doesNotMatch(soilEdge[0], /_ensureFloorSoftMask|_blitSoftFloor/,
    'the per-tile alpha helper is not the soft-edge implementation');
  assert.doesNotMatch(gameHtml, /function _ensureFloorSoftMask[\s\S]{0,800}map\[[^\]]+\]\s*=/,
    'mask build must be render-only');
});
