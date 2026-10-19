import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
import { attachSourcePreviewAppearance, validateSourcePreview, sampleSourcePreviewHeight } from '../engine/fdg/source-preview.js';
import { createSourcePreviewAppearance, validateSourcePreviewAppearance, sourcePreviewActorCutaway,
  sampleSourcePreviewDirectionalBrightness, createSourcePreviewFrontWallProfiles } from '../engine/fdg/source-preview-appearance.js';

const appearance = () => ({ version: 1, kind: 'engine-authored-readability', authoredBy: 'UNIT explicit readability author',
  sourcePhysicalZClaim: false, actorCutaway: { kind: 'projected-ellipse', innerOpacity: 0.24, outerOpacity: 0.62, featherPx: 8 },
  terrainLighting: { kind: 'engine-authored-directional', lightDirection: [-0.45, -0.65, 0.75], ambient: 0.45,
    contrast: 0.65, minBrightness: 0.55, maxBrightness: 1.2 },
  frontWalls: { kind: 'source-height-derived-south', hillSegments: 128, rampSegments: 32, opacity: 1, brightness: 0.55, probePx: 0.5 },
  unknownAuthoredMetadata: { note: 'retain; no source opacity/anchor/collision claim' } });
const copy = value => JSON.parse(JSON.stringify(value));

test('explicit optional appearance preserves source85/soil/nav/height/XY and its independent authored snapshot', () => {
  const { scene } = makeSourceHeightFixture(), before = JSON.stringify(scene), input = appearance();
  assert.equal(validateSourcePreview(scene).ok, true);
  assert.equal(Object.hasOwn(scene, 'appearancePreview'), false);
  const built = attachSourcePreviewAppearance(scene, { appearancePreview: input });
  assert.equal(built.ok, true, built.errors.join('\n'));
  const next = built.sourcePreview;
  assert.equal(JSON.stringify(scene), before);
  for (const key of ['imageLayers', 'groundLayers', 'groundClip', 'heightPreview', 'nav', 'actor', 'camera', 'status']) assert.deepEqual(next[key], scene[key]);
  assert.deepEqual(next.provenance.sourceSnapshot, scene.provenance.sourceSnapshot);
  assert.deepEqual(next.provenance.nativeVisualPlacements, scene.provenance.nativeVisualPlacements);
  assert.equal(next.provenance.nativeAnchor, 'UNKNOWN');
  assert.equal(next.provenance.actualObjectColliderCount, null);
  assert.equal(next.provenance.productionAdopted, false);
  assert.deepEqual(next.appearancePreview, input);
  assert.deepEqual(next.provenance.appearanceEngineAuthoredInputSnapshot, input);
  assert.equal(Object.isFrozen(next.appearancePreview), true);
  assert.equal(Object.isFrozen(next.provenance.appearanceEngineAuthoredInputSnapshot), true);
  input.actorCutaway.innerOpacity = 0.9;
  assert.equal(next.appearancePreview.actorCutaway.innerOpacity, 0.24);
  assert.equal(validateSourcePreview(copy(next)).ok, true);
  const altered = copy(next); altered.appearancePreview.frontWalls.probePx = 0.25;
  assert.equal(validateSourcePreview(altered).ok, false);
});

test('missing authoring, unsupported values and unsafe JSON are rejected without generating settings or invoking getters', () => {
  assert.equal(createSourcePreviewAppearance(undefined).ok, false);
  const missing = appearance(); delete missing.terrainLighting.ambient;
  assert.equal(createSourcePreviewAppearance(missing).appearancePreview, null);
  const invalid = appearance(); invalid.actorCutaway.innerOpacity = 0.8;
  assert.equal(validateSourcePreviewAppearance(invalid).ok, false);
  const nonfinite = appearance(); nonfinite.frontWalls.probePx = NaN;
  assert.equal(validateSourcePreviewAppearance(nonfinite).ok, false);
  const sparse = appearance(); sparse.terrainLighting.lightDirection = [0.2, , 0.8];
  assert.equal(validateSourcePreviewAppearance(sparse).ok, false);
  let reads = 0;
  const accessor = appearance(); Object.defineProperty(accessor, 'unknown', { enumerable: true, get() { reads++; return 1; } });
  assert.equal(validateSourcePreviewAppearance(accessor).ok, false); assert.equal(reads, 0);
  const cycle = appearance(); cycle.unknown = cycle;
  assert.equal(validateSourcePreviewAppearance(cycle).ok, false);
  const reserved = appearance(); reserved.unknown = JSON.parse('{"constructor":1}');
  assert.equal(validateSourcePreviewAppearance(reserved).ok, false);
  const { scene, baseScene } = makeSourceHeightFixture();
  assert.equal(attachSourcePreviewAppearance(scene).ok, false);
  assert.equal(attachSourcePreviewAppearance(baseScene, { appearancePreview: appearance() }).ok, false);
});

test('south render-wall profiles follow exact hill/ramp seams and mapped source heights without filling the native ramp gap', () => {
  const { scene } = makeSourceHeightFixture(), before = JSON.stringify(scene), settings = appearance();
  const params = scene.heightPreview.sourceExecutionSnapshot.executionData.logicalHeight.nativeParams;
  const sample = (x, y) => sampleSourcePreviewHeight(scene, x, y, { validated: true });
  const result = createSourcePreviewFrontWallProfiles(params, sample, settings);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.ok(result.profiles.length > 0 && result.profiles.length <= 96);
  const hill = result.profiles.filter(profile => profile.edge === 'hill-inner-south');
  const ramp = result.profiles.filter(profile => profile.edge === 'ramp-south');
  assert.ok(hill.length > 0 && hill.length <= 64);
  assert.ok(ramp.length > 0 && ramp.length <= 32);
  for (const profile of result.profiles) {
    assert.equal(profile.depthY, (profile.bottom[0][1] - profile.bottom[0][2] + profile.bottom[1][1] - profile.bottom[1][2]) / 2);
    assert.equal(profile.depthRole, 'projected-bottom-midpoint');
    assert.equal(profile.sourcePhysicalZClaim, false);
    for (let i = 0; i < 2; i++) {
      const [x, y, z] = profile.top[i], bottom = profile.bottom[i];
      assert.equal(x, bottom[0]); assert.equal(y, bottom[1]); assert.ok(z >= bottom[2]);
      if (profile.edge === 'hill-inner-south') {
        const dx = x / 40 - params.cx, dy = y / 40 - params.cy;
        assert.ok(y >= params.cy * 40 - 1e-7);
        assert.ok(Math.abs(Math.hypot(dx / params.rx, dy / params.ry) - params.inner) < 1e-12);
        assert.equal(z, 64); assert.equal(bottom[2], 0);
        const nx = dx / (params.rx * params.rx), ny = dy / (params.ry * params.ry), length = Math.hypot(nx, ny);
        assert.ok(sample(x - nx / length * 0.5, y - ny / length * 0.5).ramp < 0);
        assert.ok(sample(x + nx / length * 0.5, y + ny / length * 0.5).ramp < 0);
      } else {
        const t = (x / 40 - params.rampX0) / (params.rampX1 - params.rampX0);
        assert.ok(Math.abs(y / 40 - params.rampY - (params.rampHalf0 + (params.rampHalf1 - params.rampHalf0) * t)) < 1e-12);
        assert.ok(z > 0 && z <= 64);
      }
    }
  }
  assert.equal(result.engineDerived.probePx, 0.5);
  assert.equal(result.engineDerived.sourceGeometryClaim, false);
  assert.equal(JSON.stringify(scene), before);
  const failure = createSourcePreviewFrontWallProfiles(params, () => ({ ok: false }), settings, { validated: true });
  assert.equal(failure.ok, false); assert.deepEqual(failure.profiles, []);
});

test('projected bounds alone select cutaway and lighting derives bounded engine normals with an owner validated fast path', () => {
  const settings = appearance();
  const overlapping = sourcePreviewActorCutaway(settings, [0, 0, 96, 96], [24, 24, 96, 96]);
  assert.equal(overlapping.ok, true); assert.equal(overlapping.intersects, true);
  assert.deepEqual(overlapping.ellipse, { x: 72, y: 72, radiusX: 48, radiusY: 48 });
  assert.equal(overlapping.innerOpacity, 0.24); assert.equal(overlapping.outerOpacity, 0.62); assert.equal(overlapping.featherPx, 8);
  assert.equal(overlapping.nativeOpaqueClaim, false);
  assert.equal(sourcePreviewActorCutaway(settings, [120, 24, 96, 96], [24, 24, 96, 96]).intersects, false);
  const { scene } = makeSourceHeightFixture();
  const sample = (x, y) => sampleSourcePreviewHeight(scene, x, y, { validated: true });
  const flat = sampleSourcePreviewDirectionalBrightness(sample, 4020, 7400, settings);
  const ramp = sampleSourcePreviewDirectionalBrightness(sample, 5230, 3940, settings, { validated: true });
  assert.equal(flat.ok, true); assert.deepEqual(flat.normal, [-0, -0, 1]);
  assert.equal(flat.brightness, 1); assert.equal(flat.normalization, 'engine-render-flat-normal-equals1');
  assert.equal(ramp.ok, true); assert.ok(ramp.normal[0] < 0); assert.ok(ramp.brightness > flat.brightness);
  assert.ok(ramp.brightness >= 0.55 && ramp.brightness <= 1.2); assert.equal(ramp.sourceLightingClaim, false);
  let reads = 0; Object.defineProperty(settings, 'ownerAlreadyValidated', { enumerable: true, get() { reads++; return 1; } });
  assert.equal(sampleSourcePreviewDirectionalBrightness(sample, 5230, 3940, settings, { validated: true }).ok, true);
  assert.equal(reads, 0);
  assert.equal(sampleSourcePreviewDirectionalBrightness(() => ({ ok: false }), 5230, 3940, settings, { validated: true }).ok, false);
});
