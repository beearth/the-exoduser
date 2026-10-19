import test from 'node:test';
import assert from 'node:assert/strict';
import { attachSourcePreviewHeight, validateSourcePreview, sampleSourcePreviewHeight, canMoveSourcePreview } from '../engine/fdg/source-preview.js';
import { sourcePreviewCliffBlocks } from '../engine/fdg/source-preview-height.js';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
const copy = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('optional native logical contract preserves soil/props85/current XY/nav and independently records source-v4 versus engine authoring', () => {
  const { scene, baseScene, sourceExecutionData, options } = makeSourceHeightFixture(), before = JSON.stringify(baseScene), sourceBefore = JSON.stringify(sourceExecutionData), authorBefore = JSON.stringify(options);
  assert.equal(validateSourcePreview(baseScene).ok, true); assert.equal(sampleSourcePreviewHeight(baseScene, 4020, 7400).ok, false);
  const result = attachSourcePreviewHeight(baseScene, options); assert.equal(result.ok, true, result.errors.join('\n')); assert.deepEqual(result.pending, []);
  for (const key of ['actor', 'camera', 'nav', 'grid', 'imageLayers', 'groundLayers', 'groundClip']) assert.deepEqual(result.sourcePreview[key], baseScene[key]);
  assert.deepEqual(scene.heightPreview.sourceExecutionSnapshot, sourceExecutionData);
  assert.notEqual(scene.heightPreview.sourceExecutionSnapshot, sourceExecutionData);
  assert.deepEqual(scene.provenance.heightEngineAuthoredInputSnapshot, { heightMapping: options.heightMapping, movement: options.movement });
  assert.equal(scene.heightPreview.sourcePhysicalZClaim, false); assert.equal(scene.provenance.sourcePhysicalZClaim, false);
  assert.equal(scene.provenance.productionAdopted, false); assert.equal(scene.provenance.actualObjectColliderCount, null);
  assert.deepEqual(scene.status, { adoption: 'UNADOPTED', collision: 'SOURCE_PENDING', cliff: 'SOURCE_CONSUMED', logicalHeight: 'SOURCE_CONSUMED' });
  assert.equal(scene.provenance.groundRuntimeStatus, 'READY'); assert.deepEqual(scene.groundLayers[0].sourceRect, [0, 0, 1024, 1024]);
  assert.equal(scene.imageLayers[0].brightness, 1.08); assert.equal(scene.imageLayers[84].depthY, 8300);
  assert.equal(Object.hasOwn(scene.actor, 'z'), false); assert.equal(Object.hasOwn(scene, 'height'), false);
  assert.equal(Object.isFrozen(scene.heightPreview.sourceExecutionSnapshot), true);
  assert.equal(JSON.stringify(baseScene), before); assert.equal(JSON.stringify(sourceExecutionData), sourceBefore); assert.equal(JSON.stringify(options), authorBefore);
  assert.equal(validateSourcePreview(copy(scene)).ok, true);
});

test('continuous px/T40 exact point math retains ramp edges/native cliffs while mapped height/slope are explicitly engine derived', () => {
  const { scene } = makeSourceHeightFixture();
  const first = sampleSourcePreviewHeight(scene, 126.25 * 40, 98 * 40, { validated: true });
  near(first.ramp, 0.125); near(first.logicalHeight, 0.04296875); near(first.engineFootZ, 2.75);
  assert.equal(first.bandBlocks, false); assert.equal(first.sourcePhysicalZClaim, false);
  const mid = sampleSourcePreviewHeight(scene, 131.25 * 40, 99 * 40, { validated: true });
  near(mid.ramp, 0.625); near(mid.logicalHeight, 0.68359375); near(mid.engineFootZ, 43.75);
  assert.equal(mid.slopeKind, 'engine-mapped-finite-difference'); assert.equal(mid.slopeDifferencePx, 1); assert.ok(mid.slope > 0 && mid.slope < 0.25);
  const end = sampleSourcePreviewHeight(scene, 135 * 40, 98 * 40, { validated: true });
  assert.equal(end.ramp, 1); assert.equal(end.logicalHeight, 1);
  const after = sampleSourcePreviewHeight(scene, (135 + 1e-6) * 40, 98 * 40, { validated: true });
  assert.equal(after.ramp, -1); assert.equal(after.logicalHeight, 1);
  const inside = sampleSourcePreviewHeight(scene, 147 * 40, 105.5 * 40, { validated: true });
  const band = sampleSourcePreviewHeight(scene, 147 * 40, 106.5 * 40, { validated: true });
  assert.equal(inside.logicalHeight, 1); assert.equal(inside.bandBlocks, false); assert.equal(band.logicalHeight, 0); assert.equal(band.bandBlocks, true);
  const changedMapping = copy(scene); changedMapping.heightPreview.heightMapping.offsetPx = 8;
  changedMapping.provenance.heightEngineAuthoredInputSnapshot.heightMapping.offsetPx = 8;
  const mapped = sampleSourcePreviewHeight(changedMapping, 126.25 * 40, 98 * 40);
  near(mapped.logicalHeight, first.logicalHeight); near(mapped.engineFootZ, first.engineFootZ + 8);
  let accessed = 0; const cached = copy(scene);
  Object.defineProperty(cached, 'provenance', { enumerable: true, get() { accessed++; throw new Error('whole-scene inspection forbidden on validated fast path'); } });
  assert.equal(sampleSourcePreviewHeight(cached, 126.25 * 40, 98 * 40, { validated: true }).ok, true); assert.equal(accessed, 0);
  assert.equal(sampleSourcePreviewHeight(cached, 126.25 * 40, 98 * 40).ok, false); assert.equal(accessed, 0);
});

test('full-circle conservative cliff gate and swept authored height gates allow the native ramp round trip and reject cliff tunneling', () => {
  const { scene } = makeSourceHeightFixture(), before = JSON.stringify(scene), outside = { x: 124 * 40, y: 98 * 40 }, summit = { x: 136 * 40, y: 98 * 40 };
  const up = canMoveSourcePreview(scene, outside, summit, 10, { validated: true });
  assert.equal(up.ok, true, up.reason); assert.equal(up.logicalHeight, 1); assert.equal(up.engineFootZ, 64); assert.equal(up.bandBlocks, false);
  const down = canMoveSourcePreview(scene, summit, outside, 10, { validated: true });
  assert.equal(down.ok, true, down.reason); assert.equal(down.logicalHeight, 0); assert.equal(down.engineFootZ, 0);
  const cross = canMoveSourcePreview(scene, { x: 169 * 40, y: 98 * 40 }, { x: 147 * 40, y: 98 * 40 }, 10, { validated: true });
  assert.equal(cross.ok, false); assert.equal(cross.reason, 'source-cliff-band'); assert.equal(typeof cross.engineFootZ, 'number');
  const nearOuter = { x: (147 + 18 * 1.04) * 40 + 5, y: 98 * 40 };
  assert.equal(sampleSourcePreviewHeight(scene, nearOuter.x, nearOuter.y, { validated: true }).bandBlocks, false);
  assert.equal(canMoveSourcePreview(scene, nearOuter, nearOuter, 10, { validated: true }).reason, 'source-cliff-band');
  const rampEdge = sampleSourcePreviewHeight(scene, 130 * 40, 100.3 * 40, { validated: true });
  assert.equal(rampEdge.bandBlocks, false);
  assert.equal(sourcePreviewCliffBlocks(scene.heightPreview, 130 * 40, 100.3 * 40, 10, { validated: true }).blocked, true);
  const authored = (key, value) => { const next = copy(scene); next.heightPreview.movement[key] = value; next.provenance.heightEngineAuthoredInputSnapshot.movement[key] = value; return next; };
  assert.equal(canMoveSourcePreview(authored('maxSlope', 0.1), outside, summit, 10).reason, 'engine-height-slope');
  assert.equal(canMoveSourcePreview(authored('maxStep', 1), outside, summit, 10).reason, 'engine-height-step');
  assert.equal(JSON.stringify(scene), before);
});

test('saved XY height observation is revalidated and source binding/unknown-authoring/unsafe-input failures never invent physical Z', () => {
  const { scene, baseScene, options } = makeSourceHeightFixture();
  const saved = copy(scene); saved.actor.position = [130 * 40, 98 * 40]; saved.camera = { x: 5200, y: 3888, follow: true };
  const exact = sampleSourcePreviewHeight(saved, ...saved.actor.position, { validated: true });
  saved.provenance.heightRuntimeObservation = { worldPx: [...saved.actor.position], logicalHeight: exact.logicalHeight, engineFootZ: exact.engineFootZ,
    ramp: exact.ramp, bandBlocks: exact.bandBlocks, observedBy: 'fdg-source-preview-height-v1', sourcePhysicalZClaim: false };
  assert.equal(validateSourcePreview(saved).ok, true); assert.equal(saved.actor.position.length, 2); assert.equal(Object.hasOwn(saved.actor, 'z'), false);
  const wrongObservation = copy(saved); wrongObservation.provenance.heightRuntimeObservation.engineFootZ += 1;
  assert.equal(validateSourcePreview(wrongObservation).ok, false);
  const wrongXY = copy(saved); wrongXY.actor.position[0] += 5; assert.equal(validateSourcePreview(wrongXY).ok, false);
  const wrongZ = copy(saved); wrongZ.actor.position.push(32); assert.equal(validateSourcePreview(wrongZ).ok, false);
  const physicalClaim = copy(saved); physicalClaim.heightPreview.sourcePhysicalZClaim = true; assert.equal(validateSourcePreview(physicalClaim).ok, false);
  const unsupported = copy(options); unsupported.sourceExecutionData.executionData.logicalHeight.exactEvaluator.heightAt += '; injected expression';
  const pending = attachSourcePreviewHeight(baseScene, unsupported); assert.equal(pending.ok, false);
  assert.ok(pending.pending.some(item => item.classification === 'ENGINE_IMPLEMENTATION')); assert.equal(pending.sourcePreview, null);
  const mislabeled = copy(options); mislabeled.sourceExecutionData.executionData.logicalHeight.samples[0].px[0] -= 20;
  assert.equal(attachSourcePreviewHeight(baseScene, mislabeled).ok, false);
  const missing = copy(options); delete missing.heightMapping.scalePx; assert.equal(attachSourcePreviewHeight(baseScene, missing).ok, false);
  let calls = 0; const accessor = { ...options }; Object.defineProperty(accessor, 'sourceExecutionData', { enumerable: true, get() { calls++; return options.sourceExecutionData; } });
  assert.equal(attachSourcePreviewHeight(baseScene, accessor).ok, false); assert.equal(calls, 0);
});
