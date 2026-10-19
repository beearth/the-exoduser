import test from 'node:test';
import assert from 'node:assert/strict';
import { attachSourcePreviewGround, SOURCE_PREVIEW_GROUND_URL } from '../engine/fdg/source-preview.js';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { makeSourceGroundFixture } from './fdg-source-ground-fixture.mjs';

function setup() {
  const { scene, options } = makeSourceGroundFixture();
  const pending = attachSourcePreviewGround(scene, options);
  assert.equal(pending.ok, true, pending.errors.join('\n'));
  const runtime = new SourcePreviewRuntime(pending.sourcePreview, { width: 200, height: 200, tileSize: 40 });
  const assets = new Map(scene.imageLayers.map(layer => [layer.src, { status: 'ready',
    image: { src: layer.src, naturalWidth: layer.sourceRect[2], naturalHeight: layer.sourceRect[3] } }]));
  assets.set(SOURCE_PREVIEW_GROUND_URL, { status: 'ready',
    image: { src: SOURCE_PREVIEW_GROUND_URL, naturalWidth: 96, naturalHeight: 64 } });
  const owner = { assets, camera: { ...scene.camera }, player: { x: 4020, y: 7410, radius: 10 }, width: 1000, height: 600 };
  return { runtime, owner, pending: pending.sourcePreview };
}

class CanvasProbe {
  globalAlpha = 0.7;
  filter = 'contrast(0.8)';
  stack = [];
  clips = [];
  paths = [];
  events = [];
  save() { this.stack.push({ alpha: this.globalAlpha, filter: this.filter, clips: [...this.clips] }); }
  restore() { const state = this.stack.pop(); this.globalAlpha = state.alpha; this.filter = state.filter; this.clips = state.clips; }
  beginPath() { this.path = []; }
  rect(x, y, w, h) { this.path = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  moveTo(x, y) { this.path.push([x, y]); }
  lineTo(x, y) { this.path.push([x, y]); }
  closePath() {}
  clip() { this.clips.push(this.path.map(point => [...point])); this.paths.push(this.clips.at(-1)); }
  drawImage(image, ...args) {
    if (this.failSoil && image.src === SOURCE_PREVIEW_GROUND_URL) throw new Error('UNIT soil draw failure');
    this.events.push({ src: image.src, args, clips: [...this.clips], alpha: this.globalAlpha, filter: this.filter });
  }
}
function inside(point, polygon) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a[1] > point[1]) !== (b[1] > point[1]) && point[0] < (b[0] - a[0]) * (point[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}

test('first soil decode seals real dimensions; unavailable or changed saved soil leaves scene and physical pending state intact', () => {
  const { runtime, owner, pending } = setup(), before = JSON.stringify(pending);
  assert.equal(runtime.requiredSources().has(SOURCE_PREVIEW_GROUND_URL), true);
  owner.assets.get(SOURCE_PREVIEW_GROUND_URL).status = 'error';
  assert.equal(runtime.validateReady(owner.assets).ok, false);
  assert.equal(runtime.scene.provenance.groundRuntimeStatus, 'RUNTIME_PENDING');
  assert.equal(Object.hasOwn(runtime.scene.groundLayers[0], 'sourceRect'), false);
  owner.assets.get(SOURCE_PREVIEW_GROUND_URL).status = 'ready';
  assert.equal(runtime.validateReady(owner.assets).ok, true);
  assert.deepEqual(runtime.scene.groundLayers[0].sourceRect, [0, 0, 96, 64]);
  assert.equal(runtime.scene.provenance.groundImageObservations[0].observedBy, 'runtime-image-decode');
  assert.equal(runtime.scene.provenance.groundRuntimeStatus, 'READY');
  owner.assets.get(SOURCE_PREVIEW_GROUND_URL).image.naturalWidth = 97;
  assert.equal(runtime.validateReady(owner.assets).ok, false);
  assert.deepEqual(runtime.scene.groundLayers[0].sourceRect, [0, 0, 96, 64]);
  assert.equal(JSON.stringify(pending), before);
  const snap = runtime.snapshot(owner.player, owner.camera);
  assert.equal(snap.height, null); assert.deepEqual(snap.sourcePending, ['collision', 'cliff', 'logicalHeight']);
  assert.equal(runtime.scene.provenance.actualObjectColliderCount, null);
});

test('ground draws before existing props and actor through exact original tile corners; outside polygon never receives soil', () => {
  const { runtime, owner } = setup(); assert.equal(runtime.validateReady(owner.assets).ok, true);
  const ctx = new CanvasProbe();
  const count = runtime.draw(ctx, owner, { drawActor(context) { context.events.push({ src: 'ACTOR', clips: [...context.clips] }); } });
  const soil = ctx.events.filter(event => event.src === SOURCE_PREVIEW_GROUND_URL);
  assert.ok(soil.length > 0); assert.equal(count.groundDrawCalls, soil.length);
  assert.ok(count.visibleObjects > 0); assert.equal(ctx.events.filter(event => event.src === 'ACTOR').length, 1);
  assert.ok(ctx.events.slice(0, soil.length).every(event => event.src === SOURCE_PREVIEW_GROUND_URL));
  const left = owner.camera.x - owner.width / 2, top = owner.camera.y - owner.height / 2;
  const expected = runtime.scene.provenance.sourceSnapshot.boundaryPolygon.data.map(([x, y]) => [x * 40 - left, y * 40 - top]);
  assert.deepEqual(ctx.paths[1], expected); assert.equal(expected.length, 53);
  for (const draw of soil) {
    assert.deepEqual(draw.clips[1], expected); assert.deepEqual(draw.args.slice(0, 4), [0, 0, 96, 64]);
    assert.equal(draw.alpha, 0.7); assert.equal(draw.filter, 'brightness(0.85) saturate(0.48)');
    assert.equal(inside([-left, -top], draw.clips[1]), false);
    assert.equal(inside([4020 - left, 4020 - top], draw.clips[1]), true);
  }
  assert.equal(ctx.events.find(event => event.src === 'ACTOR').clips.length, 1);
  assert.equal(ctx.globalAlpha, 0.7); assert.equal(ctx.filter, 'contrast(0.8)'); assert.equal(ctx.stack.length, 0);
});

test('visible repeat tiles are bounded to64, no offworld soil is submitted, and failed ground draw restores Canvas ownership', () => {
  const { runtime, owner } = setup(); assert.equal(runtime.validateReady(owner.assets).ok, true);
  const huge = { ...owner, width: 20000, height: 20000, camera: { x: 4000, y: 4000 } };
  assert.equal(runtime.draw(new CanvasProbe(), huge).groundDrawCalls, 64);
  assert.equal(runtime.draw(new CanvasProbe(), { ...owner, camera: { x: 20000, y: 20000 } }).groundDrawCalls, 0);
  const ctx = new CanvasProbe(); ctx.failSoil = true;
  assert.throws(() => runtime.draw(ctx, owner), /UNIT soil draw failure/);
  assert.equal(ctx.globalAlpha, 0.7); assert.equal(ctx.filter, 'contrast(0.8)'); assert.equal(ctx.stack.length, 0);
  assert.deepEqual(ctx.clips, []);
});

test('ground capture and JSON reopen retain current XY/camera, source boundary/colors, native UV UNKNOWN and release only consumer state', () => {
  const { runtime, owner } = setup(); assert.equal(runtime.validateReady(owner.assets).ok, true);
  assert.equal(runtime.move(owner.player, 4020, 7400), true); owner.camera.y = 7400;
  const captured = runtime.capture(owner.player, owner.camera);
  const reopened = new SourcePreviewRuntime(JSON.parse(JSON.stringify(captured)));
  assert.equal(reopened.validateReady(owner.assets).ok, true);
  assert.deepEqual(reopened.scene.actor.position, [4020, 7400]);
  assert.deepEqual(reopened.scene.camera, { x: 4020, y: 7400, follow: true });
  assert.deepEqual(reopened.scene.groundClip, captured.groundClip); assert.equal(reopened.scene.imageLayers.length, 85);
  assert.equal(reopened.scene.provenance.groundNativeUV, 'UNKNOWN');
  assert.equal(reopened.scene.provenance.productionAdopted, false);
  assert.deepEqual(reopened.scene.provenance.unusedGroundMaterials.map(row => row.used), [false, false, false]);
  runtime.dispose(); assert.equal(runtime.requiredSources().size, 0); assert.equal(runtime.snapshot(owner.player), null);
  assert.equal(owner.assets.size, 10); assert.equal(reopened.requiredSources().size, 10);
  reopened.dispose();
});
