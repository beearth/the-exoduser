import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSourceImageLayers, collectSourceImagePaths,
  validateReadySourceImages, drawSourceImageLayers,
} from '../engine/fdg/source-image-layers.js';

const layer = (changes = {}) => ({
  id: 'approved-ground', src: 'assets/maps/approved-ground.png',
  sourceRect: [12, 8, 100, 80], worldRect: [4000, 7200, 200, 160], opacity: .5,
  ...changes,
});
const image = (width = 128, height = 96) => ({ naturalWidth: width, naturalHeight: height });
const ready = (value = image()) => ({ status: 'ready', image: value });
function surface(assets = new Map(), changes = {}) {
  const context = {
    globalAlpha: .8, calls: [], clips: [], stack: [],
    save() { this.stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = this.stack.pop(); },
    beginPath() {}, rect(...args) { this.clips.push(args); }, clip() {},
    drawImage(...args) { this.calls.push({ args, alpha: this.globalAlpha }); },
  };
  const owner = { assets, camera: { x: 4100, y: 7300 }, width: 400, height: 300, ...changes };
  return { context, owner };
}

test('valid normalized layers preserve exact paths, padded world extent, and authored rectangles', () => {
  const layers = [layer(), layer({ id: 'second-crop', sourceRect: [0, 0, 20, 20] }),
    layer({ id: 'root-path', src: '/assets/maps/approved-ground.png', worldRect: [8000, 8000, 192, 192] })];
  const before = structuredClone(layers);
  assert.equal(validateSourceImageLayers(layers).ok, true);
  assert.deepEqual([...collectSourceImagePaths(layers)], ['assets/maps/approved-ground.png', '/assets/maps/approved-ground.png']);
  assert.deepEqual(layers, before);
  assert.deepEqual(validateSourceImageLayers([]), { ok: true, errors: [] });
  assert.deepEqual([...collectSourceImagePaths([])], []);
});

test('malformed paths, duplicate ids, oversized arrays and nonfinite or out-of-world rectangles are rejected', () => {
  for (const src of ['https://example.com/ground.png', '../ground.png', '//outside/ground.png', 'assets/%2e.png', 'assets/ground.png?x=1', 'assets/ground\\a.png']) {
    assert.equal(validateSourceImageLayers([layer({ src })]).ok, false, src);
  }
  for (const change of [
    { id: '__proto__' }, { id: 'bad\u0000id' }, { id: '' },
    { opacity: NaN }, { opacity: -1 }, { opacity: 1.01 }, { opacity: undefined },
    { sourceRect: [0, 0, 0, 1] }, { sourceRect: [-1, 0, 1, 1] },
    { sourceRect: [0, 0, Infinity, 1] }, { sourceRect: [Number.MAX_VALUE, 0, Number.MAX_VALUE, 1] },
    { worldRect: [8192, 0, 1, 1] }, { worldRect: [0, 8191, 1, 2] },
    { worldRect: [0, 0, 1] }, { worldRect: [0, , 1, 1] },
  ]) assert.equal(validateSourceImageLayers([layer(change)]).ok, false);
  assert.match(validateSourceImageLayers([layer(), layer()]).errors.join('\n'), /duplicate/);
  assert.equal(validateSourceImageLayers(Array.from({ length: 129 }, (_, i) => layer({ id: `layer-${i}` }))).ok, false);
  for (const invalid of [null, {}, [null], Array(1)]) assert.equal(validateSourceImageLayers(invalid).ok, false);
  assert.throws(() => collectSourceImagePaths([layer({ src: '../ground.png' })]), TypeError);
});

test('required images reject missing, loading, failed and empty records even when a loader promise resolved', async () => {
  const layers = [layer()];
  const before = structuredClone(layers);
  for (const record of [undefined, { status: 'loading', image: image() },
    await Promise.resolve({ status: 'error', image: null }), ready(image(0, 96)),
    ready(image(128, Infinity)), { status: 'ready', image: null }]) {
    const assets = new Map(record === undefined ? [] : [[layers[0].src, record]]);
    const result = validateReadySourceImages(layers, assets);
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
    assert.equal(assets.get(layers[0].src), record);
  }
  assert.equal(validateReadySourceImages(layers, {}).ok, false);
  assert.equal(validateReadySourceImages([], new Map()).ok, true);
  assert.deepEqual(layers, before);
});

test('decoded dimensions must contain every crop sharing one exact source path', () => {
  const layers = [layer({ sourceRect: [12, 8, 116, 88] }),
    layer({ id: 'overflow-crop', sourceRect: [12, 8, 117, 88] })];
  const assets = new Map([[layers[0].src, ready()]]);
  assert.equal(validateReadySourceImages(layers.slice(0, 1), assets).ok, true);
  const result = validateReadySourceImages(layers, assets);
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /layers\[1\].*sourceRect/);
  const record = assets.get(layers[0].src);
  record.image.naturalWidth = 129;
  assert.equal(validateReadySourceImages(layers, assets).ok, true);
  layers[1].sourceRect[3] = 89;
  assert.match(validateReadySourceImages(layers, assets).errors.join('\n'), /sourceRect/);
});

test('draw uses the exact nine-argument crop with CSS camera placement, clipping, and restored caller alpha', () => {
  const layers = [layer()], decoded = image();
  const assets = new Map([[layers[0].src, ready(decoded)]]);
  const { context, owner } = surface(assets), before = structuredClone(layers);
  const counts = drawSourceImageLayers(context, layers, owner);
  assert.deepEqual(counts, { drawCalls: 1, drawn: 1, missing: 0 });
  assert.deepEqual(context.calls[0].args, [decoded, 12, 8, 100, 80, 100, 50, 200, 160]);
  assert.equal(context.calls[0].args.length, 9);
  assert.equal(context.calls[0].alpha, .4);
  assert.equal(context.globalAlpha, .8);
  assert.deepEqual(context.clips, [[0, 0, 400, 300]]);
  assert.equal(context.stack.length, 0);
  assert.deepEqual(layers, before);
});

test('draw preserves input order, clips partial images, and counts only visible missing images', () => {
  const layers = [
    layer({ id: 'partial', worldRect: [3850, 7150, 100, 100], opacity: 1 }),
    layer({ id: 'touching-left', worldRect: [3800, 7150, 100, 100] }),
    layer({ id: 'touching-right', worldRect: [4300, 7150, 100, 100] }),
    layer({ id: 'touching-top', worldRect: [4000, 7050, 100, 100] }),
    layer({ id: 'touching-bottom', worldRect: [4000, 7450, 100, 100] }),
    layer({ id: 'transparent', src: 'assets/missing.png', opacity: 0 }),
    layer({ id: 'visible-missing', src: 'assets/missing.png' }),
    layer({ id: 'visible-bad-crop', sourceRect: [127, 95, 2, 2] }),
    layer({ id: 'last', sourceRect: [0, 0, 20, 20], opacity: .25 }),
  ];
  const { context, owner } = surface(new Map([[layers[0].src, ready()]]));
  assert.deepEqual(drawSourceImageLayers(context, layers, owner, { layersValidated: true }),
    { drawCalls: 2, drawn: 2, missing: 2 });
  assert.deepEqual(context.calls.map(call => call.args.slice(1, 5)), [[12, 8, 100, 80], [0, 0, 20, 20]]);
  assert.deepEqual(context.calls[0].args.slice(5), [-50, 0, 100, 100]);
  assert.equal(context.calls[1].alpha, .2);
  assert.equal(context.globalAlpha, .8);
});

test('draw restores alpha and clip state when Canvas drawing fails, and rejects malformed input before drawing', () => {
  const layers = [layer()];
  const { context, owner } = surface(new Map([[layers[0].src, ready()]]));
  context.drawImage = () => { throw new Error('canvas failure'); };
  assert.throws(() => drawSourceImageLayers(context, layers, owner), /canvas failure/);
  assert.equal(context.globalAlpha, .8);
  assert.equal(context.stack.length, 0);
  assert.throws(() => drawSourceImageLayers(context, [layer({ opacity: 2 })], owner), /opacity/);
  assert.throws(() => drawSourceImageLayers(context, layers, { ...owner, camera: { x: NaN, y: 0 } }), TypeError);
});

test('empty layers and zero-size CSS viewports allocate no image and submit no Canvas draw', () => {
  const { context, owner } = surface();
  assert.deepEqual(drawSourceImageLayers(context, [], owner), { drawCalls: 0, drawn: 0, missing: 0 });
  assert.deepEqual(drawSourceImageLayers(context, [layer()], { ...owner, width: 0 }), { drawCalls: 0, drawn: 0, missing: 0 });
  assert.deepEqual(context.calls, []);
  assert.deepEqual(context.clips, []);
  assert.deepEqual(owner.assets, new Map());
});
