import test from 'node:test';
import assert from 'node:assert/strict';
import { attachSourcePreviewGround, validateSourcePreview, SOURCE_PREVIEW_GROUND_URL } from '../engine/fdg/source-preview.js';
import { createMapSourcePreview } from '../engine/fdg/map-source-adapter.js';

import { makeSourceGroundFixture as fixture, makeSourceGroundLayout as layout, SOURCE_GROUND_CANONICAL as SOIL } from './fdg-source-ground-fixture.mjs';
const copy = value => JSON.parse(JSON.stringify(value));

test('optional soil recipe preserves old no-ground schema, current XY/native85/nav and exact53 corner authority without dimensions', () => {
  const { scene, options } = fixture(), before = JSON.stringify(scene), inputBefore = JSON.stringify(options);
  assert.equal(validateSourcePreview(scene).ok, true);
  const result = attachSourcePreviewGround(scene, options); assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.pending.length, 1); assert.equal(result.pending[0].status, 'RUNTIME_PENDING');
  const next = result.sourcePreview, p = next.provenance, layer = next.groundLayers[0];
  assert.equal(p.groundRuntimeStatus, 'RUNTIME_PENDING'); assert.deepEqual(p.groundImageObservations, []);
  assert.equal(Object.hasOwn(layer, 'sourceRect'), false); assert.equal(layer.sourceRectMode, 'decoded-full');
  assert.deepEqual(layer.origin, [0, 0]); assert.deepEqual(layer.tileWorldSize, [1024, 1024]);
  assert.equal(layer.brightness, 0.85); assert.equal(layer.saturation, 0.48); assert.equal(layer.opacity, 1);
  assert.equal(layer.nativeUV, 'UNKNOWN'); assert.equal(layer.role, 'engine-authored-ground-repeat');
  assert.deepEqual(next.groundClip.polygon, scene.provenance.sourceSnapshot.boundaryPolygon.data);
  assert.equal(next.groundClip.tileSize, 40); assert.equal(next.groundClip.convention, 'source-tile-corners');
  for (const key of ['actor', 'camera', 'imageLayers', 'nav', 'grid', 'status']) assert.deepEqual(next[key], scene[key]);
  assert.equal(next.imageLayers[0].brightness, 1.08); assert.equal(next.imageLayers[84].depthY, 8300);
  assert.equal(p.actualObjectColliderCount, null); assert.equal(p.productionAdopted, false); assert.equal(p.nativeAnchor, 'UNKNOWN');
  assert.deepEqual(p.engineAuthoredInputSnapshot, scene.provenance.engineAuthoredInputSnapshot);
  assert.deepEqual(p.groundEngineAuthoredInputSnapshot, options); assert.deepEqual(p.generatedGroundLayers, next.groundLayers);
  assert.deepEqual(p.unusedGroundMaterials.map(value => [value.key, value.used, value.status]), [['mask', false, 'PENDING'], ['litter', false, 'PENDING'], ['commonSkin', false, 'PENDING']]);
  assert.equal(p.unusedGroundMaterials.some(value => value.key === 'collisionChanges'), false);
  assert.equal(JSON.stringify(scene), before); assert.equal(JSON.stringify(options), inputBefore);
  assert.equal(Object.isFrozen(p), true); assert.equal(Object.isFrozen(next.groundLayers[0]), true);
  assert.equal(validateSourcePreview(JSON.parse(JSON.stringify(next))).ok, true);
});

test('first intrinsic observation seals full source crop and independently saved generated ground records, while native UV/physics remain pending', () => {
  const { scene, options } = fixture(), pending = attachSourcePreviewGround(scene, options).sourcePreview;
  const observation = { canonicalAbsolutePath: SOIL, src: SOURCE_PREVIEW_GROUND_URL, intrinsicWidth: 1536, intrinsicHeight: 1024,
    observedBy: 'runtime-image-decode', status: 'ready', runtimeExtra: { preserve: true } };
  const result = attachSourcePreviewGround(pending, { ...options, groundObservations: [observation] });
  assert.equal(result.ok, true, result.errors.join('\n')); assert.deepEqual(result.pending, []);
  const next = result.sourcePreview;
  assert.equal(next.provenance.groundRuntimeStatus, 'READY'); assert.deepEqual(next.groundLayers[0].sourceRect, [0, 0, 1536, 1024]);
  assert.deepEqual(next.provenance.groundImageObservations, [observation]); assert.equal(next.provenance.groundImageObservationRole, 'runtime-decoded-intrinsic');
  assert.notEqual(next.provenance.generatedGroundLayers, next.groundLayers); assert.deepEqual(next.provenance.generatedGroundLayers, next.groundLayers);
  assert.equal(next.provenance.groundNativeUV, 'UNKNOWN'); assert.equal(next.provenance.productionAdopted, false);
  assert.deepEqual(next.status, scene.status); assert.equal(Object.hasOwn(next, 'height'), false); assert.equal(Object.hasOwn(next.actor, 'z'), false);
  assert.equal(pending.provenance.groundRuntimeStatus, 'RUNTIME_PENDING'); assert.equal(Object.hasOwn(pending.groundLayers[0], 'sourceRect'), false);
  assert.equal(validateSourcePreview(JSON.parse(JSON.stringify(next))).ok, true);
});

test('ground contract rejects unapproved aliases/colors, invented clip/size, adoption and unsafe JSON without invoking getters', () => {
  const { scene, options } = fixture();
  const rejectOptions = change => { const candidate = copy(options); change(candidate); assert.equal(attachSourcePreviewGround(scene, candidate).ok, false); };
  rejectOptions(value => { value.resourceBindings[SOIL] = '/assets/ground_dark_soil.png'; });
  rejectOptions(value => { value.groundLayout.materialKey = 'commonSkin'; });
  rejectOptions(value => { value.groundLayout.origin[0] = 0.5; });
  rejectOptions(value => { value.groundLayout.authoredBy = ''; });
  rejectOptions(value => { value.groundObservations = [{ canonicalAbsolutePath: SOIL, src: SOURCE_PREVIEW_GROUND_URL, intrinsicWidth: 32769, intrinsicHeight: 10 }]; });
  rejectOptions(value => { value.groundObservations = [{ canonicalAbsolutePath: '/unit/other.png', src: SOURCE_PREVIEW_GROUND_URL, intrinsicWidth: 10, intrinsicHeight: 10 }]; });
  const wrongNative = copy(scene); wrongNative.provenance.manifestSnapshot.groundMaterials.items[0].values.brightness = 1;
  assert.equal(attachSourcePreviewGround(wrongNative, options).ok, false);
  const missingBoundary = copy(scene); delete missingBoundary.provenance.sourceSnapshot.boundaryPolygon;
  assert.equal(attachSourcePreviewGround(missingBoundary, options).ok, false);
  const valid = attachSourcePreviewGround(scene, options).sourcePreview;
  const rejectScene = change => { const candidate = copy(valid); change(candidate); assert.equal(validateSourcePreview(candidate).ok, false); };
  rejectScene(value => { value.groundClip.polygon[0][0] += 0.5; });
  rejectScene(value => { value.groundLayers[0].sourceRect = [0, 0, 1024, 1024]; value.provenance.generatedGroundLayers = copy(value.groundLayers); });
  rejectScene(value => { value.provenance.groundRuntimeStatus = 'READY'; });
  rejectScene(value => { value.provenance.unusedGroundMaterials[0].status = 'READY'; });
  rejectScene(value => { value.groundLayers[0].brightness = 1; value.provenance.generatedGroundLayers = copy(value.groundLayers); });
  rejectScene(value => { value.provenance.productionAdopted = true; });
  let calls = 0; const unsafe = { ...options }; Object.defineProperty(unsafe, 'groundObservations', { enumerable: true, get() { calls++; return []; } });
  assert.equal(attachSourcePreviewGround(scene, unsafe).ok, false); assert.equal(calls, 0);
  const oversized = { ...options, unknown: 'x'.repeat(4194304) }; assert.equal(attachSourcePreviewGround(scene, oversized).ok, false);
});

test('adapter consumes optional authored ground request and stops on invalid original binding before a project can be adopted', () => {
  const { inspection, observations, authoring } = fixture();
  const previewProject = { characters: [], skills: [], vfx: [], preview: {} };
  const result = createMapSourcePreview(inspection, { observations, previewProject,
    engineAuthored: { ...authoring, groundLayout: layout(), resourceBindings: { ...authoring.resourceBindings, [SOIL]: 'assets/fake-soil.png' } } });
  assert.equal(result.ok, false); assert.match(result.errors.join('\n'), /exact original soil binding/);
  assert.equal(result.candidateProject, null); assert.equal(result.project, null); assert.equal(result.world, null);
  assert.equal(result.adoption, 'UNADOPTED');
});
