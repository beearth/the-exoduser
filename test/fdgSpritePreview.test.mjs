import test from 'node:test';
import assert from 'node:assert/strict';
import { fitSpritePreview, spriteThumbnailPage } from '../engine/fdg/sprite-preview.js';

const viewport = { x: 0, y: 0, width: 960, height: 413 };
const portrait = { cell: { sx: 0, sy: 0, sw: 832, sh: 1248 }, image: { width: 832, height: 1248 }, viewport };
test('large portrait fits completely without changing its aspect or source', () => {
  const result = fitSpritePreview(portrait);
  assert.ok(result.x >= 16 - 1e-9 && result.y >= 16 - 1e-9);
  assert.ok(result.x + result.width <= viewport.width - 16 + 1e-9);
  assert.ok(result.y + result.height <= viewport.height - 16 + 1e-9);
  assert.ok(Math.abs(result.width / result.height - 832 / 1248) < 1e-9);
  assert.equal(result.anchor.y, result.y + result.height);
  assert.equal(portrait.cell.sw, 832);
});
test('small sprites cap fit at four, while detail zoom is relative to fit', () => {
  const params = { cell: { sx: 48, sy: 0, sw: 48, sh: 48 }, image: { width: 96, height: 48 }, viewport };
  assert.equal(fitSpritePreview(params).scale, 4);
  assert.equal(fitSpritePreview({ ...params, zoom: 2 }).scale, 8);
});
test('zoom pan and asymmetric authored anchor use logical canvas coordinates', () => {
  const result = fitSpritePreview({ ...portrait, zoom: 4, focus: { x: .25, y: .75 }, anchor: { x: .2, y: .9 } });
  assert.equal(result.x + result.width * .25, 480);
  assert.equal(result.y + result.height * .75, 206.5);
  assert.equal(result.anchor.x, result.x + result.width * .2);
  assert.equal(result.anchor.y, result.y + result.height * .9);
});
test('invalid or out-of-image cells are rejected rather than shown as valid', () => {
  assert.throws(() => fitSpritePreview({ ...portrait, cell: { sx: 1, sy: 0, sw: 832, sh: 1248 } }), RangeError);
  assert.throws(() => fitSpritePreview({ ...portrait, zoom: NaN }), RangeError);
  assert.throws(() => fitSpritePreview({ ...portrait, viewport: { ...viewport, height: 32 } }), RangeError);
});
test('24 cells include a clickable second row and later pages retain absolute indexes', () => {
  const first = spriteThumbnailPage({ frames: 24, index: 12, width: 960, top: 463 });
  assert.equal(first.cells.length, 24);
  assert.equal(first.cells[12].index, 12);
  assert.equal(first.cells[12].y, 525);
  const last = spriteThumbnailPage({ frames: 256, index: 255, width: 960, top: 463 });
  assert.equal(last.start, 240);
  assert.equal(last.end, 255);
  assert.equal(last.cells.at(-1).index, 255);
  assert.throws(() => spriteThumbnailPage({ frames: 24, index: 24, width: 960, top: 463 }), RangeError);
});
