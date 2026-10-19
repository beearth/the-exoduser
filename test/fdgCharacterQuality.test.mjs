import test from 'node:test';
import assert from 'node:assert/strict';
import { QUALITY_TARGET, MAX_CHARACTER_PIXELS, draftFrame, frameIndex, inspectCharacterPixels } from '../engine/fdg/character-quality.js';

const clip = (overrides = {}) => ({ frameWidth: 3, frameHeight: 3, columns: 6, rows: 4, frames: 24, fps: 24, ...overrides });
const image = definition => ({ width: definition.frameWidth * definition.columns, height: definition.frameHeight * definition.rows,
  data: new Uint8ClampedArray(definition.frameWidth * definition.columns * definition.frameHeight * definition.rows * 4) });
function pixel(sheet, definition, frame, x, y, rgba) {
  const rect = draftFrame(definition, frame);
  sheet.data.set(rgba, ((rect.sy + y) * sheet.width + rect.sx + x) * 4);
}
function fillFrame(sheet, definition, frame, rgba) {
  for (let y = 0; y < definition.frameHeight; y += 1) for (let x = 0; x < definition.frameWidth; x += 1) pixel(sheet, definition, frame, x, y, rgba);
}
function distinctTransparentFixture(definition = clip()) {
  const sheet = image(definition);
  for (let index = 0; index < definition.frames; index += 1) pixel(sheet, definition, index, 1, 1, [index + 1, 50, 100, 255]);
  return sheet;
}
const near = (actual, expected, epsilon = 1e-12) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} should equal ${expected}`);

test('24-frame draft cells use row-major rectangles through cell 23', () => {
  assert.deepEqual(QUALITY_TARGET, { frames: 24, fps: 24 });
  assert.equal(Object.isFrozen(QUALITY_TARGET), true);
  assert.deepEqual(draftFrame(clip({ frameWidth: 320, frameHeight: 180 }), 23), { sx: 1600, sy: 540, sw: 320, sh: 180 });
  assert.deepEqual(draftFrame(clip(), 6), { sx: 0, sy: 3, sw: 3, sh: 3 });
  assert.throws(() => draftFrame(clip(), 24), RangeError);
  assert.throws(() => draftFrame(clip(), -1), RangeError);
  assert.throws(() => draftFrame(clip(), 1.5), RangeError);
});

test('24FPS timing clamps to frame 23 and only loops when explicitly requested', () => {
  assert.equal(frameIndex(0), 0);
  assert.equal(frameIndex(1 / 24), 1);
  assert.equal(frameIndex(23 / 24), 23);
  assert.equal(frameIndex(1), 23);
  assert.equal(frameIndex(1000), 23);
  assert.equal(frameIndex(1, { loop: true }), 0);
  assert.equal(frameIndex(1 + 1 / 24, { loop: true }), 1);
  assert.equal(frameIndex(10, { frames: 1, fps: 24, loop: true }), 0);
  for (const value of [NaN, Infinity, -1]) assert.throws(() => frameIndex(value), RangeError);
  assert.throws(() => frameIndex(1, { loop: 1 }), TypeError);
});

test('distinct transparent frames report facts without subjectively approving the art', () => {
  const definition = clip(), sheet = distinctTransparentFixture(definition);
  const original = Uint8ClampedArray.from(sheet.data), originalClip = { ...definition };
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.technical.status, 'pass');
  assert.equal(result.subjectiveStatus, 'unreviewed');
  assert.equal(result.distinctFrameCount, 24);
  assert.equal(result.target.distinctFramesMet, true);
  assert.equal(result.summary.duration, 1);
  assert.equal(result.adjacent.length, 23);
  assert.equal(result.loop.from, 23); assert.equal(result.loop.to, 0);
  assert.deepEqual(result.perFrame[23].alphaBounds, { x: 1, y: 1, width: 1, height: 1 });
  assert.equal(result.perFrame[23].visiblePixels, 1);
  assert.equal(result.perFrame[23].transparentPixels, 8);
  assert.equal(result.perFrame[23].touchesBorder, false);
  assert.deepEqual(sheet.data, original, 'Input pixels remain untouched.');
  assert.deepEqual(definition, originalClip, 'Clip is not mutated.');
});

test('24 duplicated cells report one actual distinct frame and never claim 24 unique frames', () => {
  const definition = clip(), sheet = image(definition);
  for (let index = 0; index < 24; index += 1) pixel(sheet, definition, index, 1, 1, [5, 6, 7, 255]);
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.declaredFrames, 24);
  assert.equal(result.distinctFrameCount, 1);
  assert.equal(result.target.distinctFramesMet, false);
  assert.equal(result.technical.status, 'review');
  assert.deepEqual(result.duplicateGroups[0].indices, Array.from({ length: 24 }, (_, index) => index));
  assert.equal(result.perFrame[23].duplicateOf, 0);
  assert.equal(result.adjacent.every(delta => delta.changedPixels === 0), true);
  assert.equal(result.loop.exact, true);
});

test('real FNV32 collisions are confirmed against RGBA bytes before duplicate grouping', () => {
  const definition = clip({ frameWidth: 2, frameHeight: 1 }), sheet = image(definition);
  const a = [108, 160, 10, 255, 193, 1, 126, 255];
  const b = [174, 190, 101, 255, 86, 239, 220, 255];
  for (let index = 0; index < 24; index += 1) {
    const bytes = index === 1 ? b : a;
    pixel(sheet, definition, index, 0, 0, bytes.slice(0, 4));
    pixel(sheet, definition, index, 1, 0, bytes.slice(4));
  }
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.perFrame[0].hash, '1557511f');
  assert.equal(result.perFrame[1].hash, '1557511f');
  assert.equal(result.distinctFrameCount, 2);
  assert.equal(result.perFrame[1].duplicateOf, null);
  assert.equal(result.duplicateGroups[0].indices.includes(1), false);
  assert.equal(result.adjacent[0].changedPixels, 2);
});

test('empty alpha and all four crop borders are identified without treating opaque backgrounds as failure', () => {
  const definition = clip(), sheet = distinctTransparentFixture(definition);
  fillFrame(sheet, definition, 0, [0, 0, 0, 0]);
  pixel(sheet, definition, 1, 0, 1, [255, 1, 1, 255]);
  pixel(sheet, definition, 2, 2, 1, [255, 1, 1, 255]);
  pixel(sheet, definition, 3, 1, 0, [255, 1, 1, 255]);
  pixel(sheet, definition, 4, 1, 2, [255, 1, 1, 255]);
  fillFrame(sheet, definition, 5, [40, 50, 60, 255]);
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.technical.status, 'fail');
  assert.deepEqual(result.summary.emptyFrames, [0]);
  assert.equal(result.perFrame[0].alphaBounds, null);
  assert.deepEqual(result.summary.cropBorderFrames, [1, 2, 3, 4]);
  assert.equal(result.perFrame[5].cropBorder, false);
  assert.equal(result.technical.warnings.some(warning => warning.code === 'opaque-background'), true);
  const opaqueSheet = image(definition);
  for (let index = 0; index < 24; index += 1) fillFrame(opaqueSheet, definition, index, [index, index, index, 255]);
  const opaque = inspectCharacterPixels(opaqueSheet, definition);
  assert.equal(opaque.technical.status, 'review');
  assert.equal(opaque.technical.errors.length, 0);
  assert.equal(opaque.summary.cropBorderFrames.length, 0);
  assert.equal(opaque.distinctFrameCount, 24);
});

test('partial alpha, luminance and exact adjacent/loop differences use normalized units', () => {
  const definition = clip({ frameWidth: 1, frameHeight: 1 }), sheet = image(definition);
  for (let index = 0; index < 24; index += 1) fillFrame(sheet, definition, index, [0, 0, 0, 255]);
  fillFrame(sheet, definition, 23, [255, 255, 255, 128]);
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.perFrame[23].partialAlphaPixels, 1);
  near(result.perFrame[23].normalizedLuminance, 128 / 255);
  near(result.perFrame[23].normalizedAlpha, 128 / 255);
  assert.equal(result.loop.changedPixels, 1);
  near(result.loop.changingPixels, 1);
  near(result.loop.normalizedRgbaDifference, (3 * 255 + 127) / (4 * 255));
  near(result.loop.luminanceDifference, 128 / 255);
  near(result.loop.alphaDifference, 127 / 255);
  assert.equal(result.adjacent[0].exact, true);
  assert.equal(result.adjacent[22].exact, false);
});

test('hidden RGB differences remain exact data differences even when both frames are visibly empty', () => {
  const definition = clip(), sheet = image(definition);
  pixel(sheet, definition, 23, 1, 1, [255, 0, 0, 0]);
  const result = inspectCharacterPixels(sheet, definition);
  assert.equal(result.distinctFrameCount, 2);
  assert.equal(result.summary.emptyFrames.length, 24);
  assert.equal(result.loop.changedPixels, 1);
  near(result.loop.luminanceDifference, 0);
  near(result.perFrame[23].normalizedLuminance, 0);
});

test('unused atlas cells and Uint8Array view offsets do not corrupt inspected metrics', () => {
  const definition = clip({ columns: 5, rows: 5 }), sheet = distinctTransparentFixture(definition);
  // The unassigned twenty-fifth cell is fully opaque; only declared cells are inspected.
  for (let y = 12; y < 15; y += 1) for (let x = 12; x < 15; x += 1) sheet.data.set([255, 255, 255, 255], (y * sheet.width + x) * 4);
  const backing = new Uint8Array(sheet.data.length + 16);
  backing.set(sheet.data, 8);
  const result = inspectCharacterPixels({ ...sheet, data: backing.subarray(8, 8 + sheet.data.length) }, definition);
  assert.equal(result.distinctFrameCount, 24);
  assert.equal(result.summary.opaqueFrames.length, 0);
  assert.equal(result.summary.cropBorderFrames.length, 0);
});

test('numeric target mismatch is reported, while malformed clips, image dimensions and unsafe buffers reject', () => {
  const one = clip({ columns: 1, rows: 1, frames: 1, fps: 12 });
  const singleton = image(one);
  fillFrame(singleton, one, 0, [20, 30, 40, 255]);
  const result = inspectCharacterPixels(singleton, one);
  assert.equal(result.technical.status, 'fail');
  assert.equal(result.target.declaredFramesMet, false);
  assert.equal(result.target.fpsMet, false);
  assert.equal(result.adjacent.length, 0);
  assert.equal(result.loop.exact, true);
  for (const overrides of [{ frameWidth: 0 }, { frameHeight: 1.5 }, { columns: Infinity }, { rows: NaN },
    { frames: 25 }, { columns: 257, rows: 1 }, { fps: 0 }, { fps: 121 }]) {
    assert.throws(() => inspectCharacterPixels(image(clip()), clip(overrides)), RangeError);
  }
  assert.throws(() => inspectCharacterPixels({ width: 18, height: 13, data: new Uint8Array(18 * 13 * 4) }, clip()), RangeError);
  assert.throws(() => inspectCharacterPixels({ width: 18, height: 12, data: new Uint8Array(1) }, clip()), RangeError);
  assert.throws(() => inspectCharacterPixels({ width: 18, height: 12, data: Array(18 * 12 * 4).fill(0) }, clip()), TypeError);
  assert.throws(() => inspectCharacterPixels({ width: MAX_CHARACTER_PIXELS + 1, height: 1, data: new Uint8Array(0) }, clip()), RangeError);
  assert.throws(() => draftFrame(clip({ frameWidth: Number.MAX_SAFE_INTEGER }), 0), RangeError);
  if (typeof SharedArrayBuffer !== 'undefined') {
    assert.throws(() => inspectCharacterPixels({ width: 18, height: 12, data: new Uint8Array(new SharedArrayBuffer(18 * 12 * 4)) }, clip()), TypeError);
  }
});
