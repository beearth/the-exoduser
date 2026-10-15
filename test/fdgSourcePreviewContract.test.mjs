import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourcePreview, validateSourcePreview, canMoveSourcePreview } from '../engine/fdg/source-preview.js';
import { createMapSourcePreview } from '../engine/fdg/map-source-adapter.js';
import { validateProject } from '../engine/fdg/project.js';

// New synthetic schema data only; no actual source/PNG/old suite imports or IO.
function fixture() {
  const approved9 = Array.from({ length: 9 }, (_, n) => ({ relative: `maps/unit${n}.png`, canonicalAbsolutePath: `/UNIT/approved/maps/unit${n}.png`, exists: true, role: 'UNIT source reference', unknownAsset: n }));
  const observations = approved9.map((asset, n) => ({ canonicalAbsolutePath: asset.canonicalAbsolutePath, src: `fdg-source/ch1-1/unit${n}.png`, intrinsicWidth: 100 + n, intrinsicHeight: 200 + n, observationOnly: true }));
  const authoring = { previewLayout: { anchorConvention: 'bottom-center', pixelsPerSourcePixel: 1, authoredBy: 'UNIT explicit layout author', unknownPolicy: true },
    startAuthority: { kind: 'design-start', stage: 0, centerTile: [100.5, 185.5], worldPx: [4020, 7420], tileSizePx: 40, source: 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3', approvedBy: 'ROOT', runtimeSymbol: 'UNKNOWN' },
    resourceBindings: Object.fromEntries(observations.map(value => [value.canonicalAbsolutePath, value.src])), camera: { x: 4020, y: 7420, follow: true },
    heightMapping: { kind: 'UNUSED-preview-metadata', scalePx: 9999, offsetPx: 8888 }, unknownAuthoring: { preserve: true } };
  const inspection = { stage: 0, gridSize: [200, 200], tileSize: 40, tiles: new Array(40000).fill(1), navScope: 'polygon-only', approved9,
    start: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] }, gateExit: { bossCx: 100, exitY: 7 },
    visualPlacements: Array.from({ length: 85 }, (_, n) => ({ file: approved9[n % 9].relative, x: 100 + n % 9, y: n === 0 ? 207 : 170 + n % 10,
      scale: n === 0 ? 1.5 : 0.75, opacity: 0.7, brightness: n === 0 ? 1.08 : 0.9, saturation: 0.65, unknownNative: n })),
    sourceSnapshot: { unitOnly: true, collision: { objectColliders: { count: 85, pointer: 'UNIT VISUAL only; physical unknown' } }, logicalHeight: 'SOURCE_PENDING' },
    manifestSnapshot: { unitOnly: true, sourceAssets: { items: approved9 }, unknownManifest: false },
    sourceRevisionSnapshot: { unitOnly: true, nativeColliderStatus: 'PENDING_SOURCE_EXPORT' }, manifestRevisionSnapshot: { unitOnly: true } };
  const animation = { row: 0, start: 0, frames: 24, fps: 24, loop: true };
  const previewProject = { characters: [{ id: 'unit-char', name: 'UNIT character', speed: 120, radius: 12,
    sprite: { src: 'assets/unit-char.png', frameWidth: 1, frameHeight: 1, columns: 24, rows: 1, frames: 24, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { ...animation }, walk: { ...animation } } }],
    skills: [{ id: 'unit-skill', name: 'UNIT skill', cooldown: 0, cost: 0, range: 100, damage: 0, vfx: 'unit-vfx' }],
    vfx: [{ id: 'unit-vfx', name: 'UNIT effect', kind: 'burst', color: '#abcdef', count: 1, life: 0.2, speed: 1, size: 1, spread: 0 }],
    preview: { characterId: 'unit-char', skillId: 'unit-skill', vfxId: 'unit-vfx', resourceMax: 100, resourceRegen: 0 },
    map: { unwanted: 'old map' }, rigScene: { unwanted: 'old rig' }, terrainScene: { unwanted: 'old terrain' } };
  return { inspection, observations, authoring, previewProject };
}
const build = data => buildSourcePreview(data.inspection, data.observations, data.authoring);
const candidate = data => createMapSourcePreview(data.inspection, { previewProject: data.previewProject, observations: data.observations, engineAuthored: data.authoring });

test('all85 native pictures use exact9 decoded originals and explicit bottom-center with off-map artwork retained', () => {
  const data = fixture(), original = structuredClone(data), result = build(data);
  assert.deepEqual(result.errors, []); assert.deepEqual(result.pending, []); assert.equal(result.ok, true);
  const scene = result.sourcePreview, first = scene.imageLayers[0];
  assert.equal(scene.imageLayers.length, 85); assert.equal(new Set(scene.imageLayers.map(value => value.src)).size, 9);
  assert.deepEqual(first.sourceRect, [0, 0, 100, 200]); assert.deepEqual(first.worldRect, [3945, 8000, 150, 300]); assert.equal(first.depthY, 8300);
  assert.equal(first.brightness, 1.08); assert.equal(first.opacity, 0.7); assert.equal(first.saturation, 0.65); assert.equal(first.native.scale, 1.5);
  assert.equal(scene.grid.height * scene.grid.tileSize, 8000); assert.deepEqual(scene.actor.position, [4020, 7420]);
  assert.equal(Object.hasOwn(scene, 'height'), false); assert.equal(Object.hasOwn(scene, 'colliders'), false);
  assert.equal(scene.status.logicalHeight, 'SOURCE_PENDING'); assert.equal(scene.status.adoption, 'UNADOPTED');
  assert.equal(scene.provenance.actualObjectColliderCount, null); assert.equal(scene.provenance.productionAdopted, false);
  assert.equal(scene.provenance.nativeCrop, 'UNKNOWN'); assert.equal(first.layout.role, 'engine-authored-preview-layout');
  assert.deepEqual(scene.provenance.generatedEngineImageLayers, scene.imageLayers);
  assert.notEqual(scene.provenance.generatedEngineImageLayers, scene.imageLayers); assert.deepEqual(scene.provenance.engineAuthoredInputSnapshot, data.authoring);
  assert.equal(Object.isFrozen(scene.provenance), true); assert.equal(Object.isFrozen(first.native), true);
  assert.deepEqual(data, original);
});

test('preview validation rejects physical adoption/Z, native count confusion, clamped color and stale source crop', () => {
  const good = build(fixture()).sourcePreview;
  for (const mutate of [scene => { scene.status.adoption = 'PASS'; }, scene => { scene.provenance.actualObjectColliderCount = 85; },
    scene => { scene.actor.position.push(0); }, scene => { scene.actor.z = 0; }, scene => { scene.height = { logicalSamples: new Array(40000).fill(0) }; },
    scene => { scene.colliders = []; }, scene => { scene.imageLayers[0].brightness = 1; }, scene => { scene.imageLayers[0].sourceRect[2]++; },
    scene => { scene.imageLayers[0].worldRect[1] = 7700; }, scene => { scene.provenance.nativeAnchor = 'bottom-center'; }, scene => { scene.provenance.generatedEngineImageLayers.pop(); }]) {
    const invalid = structuredClone(good); mutate(invalid); assert.equal(validateSourcePreview(invalid).ok, false);
  }
  let hooks = 0; const unsafe = structuredClone(good); Object.defineProperty(unsafe, 'unknown', { enumerable: true, get() { hooks++; return 1; } });
  assert.equal(validateSourcePreview(unsafe).ok, false); assert.equal(hooks, 0);
  const sparse = structuredClone(good); delete sparse.nav.tiles[1]; assert.equal(validateSourcePreview(sparse).ok, false);
});

test('builder requires all9 intrinsic observations, exact source route/bindings and explicit layout without fallback', () => {
  const missing = fixture(); missing.observations.pop();
  const pending = build(missing); assert.equal(pending.sourcePreview, null); assert.equal(pending.pending[0].classification, 'ENGINE_IMPLEMENTATION');
  for (const mutate of [data => { data.observations[0].src = 'assets/unit0.png'; data.authoring.resourceBindings[data.observations[0].canonicalAbsolutePath] = 'assets/unit0.png'; },
    data => { data.observations[0].intrinsicWidth = 0; }, data => { data.observations[1] = structuredClone(data.observations[0]); },
    data => { data.authoring.resourceBindings[data.observations[0].canonicalAbsolutePath] = 'fdg-source/ch1-1/other.png'; },
    data => { data.inspection.visualPlacements[0].file = 'materials/soil.png'; }]) {
    const data = fixture(); mutate(data); const result = build(data); assert.equal(result.ok, false); assert.equal(result.sourcePreview, null); assert.ok(result.errors.length);
  }
  const absentPolicy = fixture(); delete absentPolicy.authoring.previewLayout;
  assert.ok(build(absentPolicy).pending.some(value => value.field === 'engineAuthored.previewLayout' && value.classification === 'ENGINE_AUTHORING'));
});

test('preview movement sweeps the whole foot circle against polygon only and never returns a height', () => {
  const scene = structuredClone(build(fixture()).sourcePreview);
  for (let y = 48; y <= 52; y++) scene.nav.tiles[y * 200 + 50] = 0;
  const before = structuredClone(scene);
  const blocked = canMoveSourcePreview(scene, { x: 1960, y: 2000 }, { x: 2120, y: 2000 }, 12, { validated: true });
  assert.equal(blocked.ok, false); assert.equal(blocked.reason, 'polygon-nav');
  const allowed = canMoveSourcePreview(scene, { x: 4020, y: 7420 }, { x: 4030, y: 7420 }, 12, { validated: true });
  assert.deepEqual(allowed, { ok: true, reason: 'polygon-only' }); assert.equal(Object.hasOwn(allowed, 'height'), false);
  assert.equal(canMoveSourcePreview(scene, { x: 4020, y: 7420 }, { x: 7995, y: 7420 }, 12, { validated: true }).ok, false);
  assert.deepEqual(scene, before);
});

test('FDG candidate/save preserves pending provenance and actor XY while separating other scene consumers', () => {
  const data = fixture(), result = candidate(data);
  assert.deepEqual(result.errors, []); assert.equal(result.ok, true); assert.equal(result.project, null); assert.equal(result.world, null);
  const project = result.candidateProject;
  assert.equal(Object.hasOwn(project, 'sourceScene'), false); assert.equal(Object.hasOwn(project, 'rigScene'), false); assert.equal(Object.hasOwn(project, 'terrainScene'), false);
  assert.deepEqual(project.map.tiles, data.inspection.tiles); assert.deepEqual(project.map.start, { x: 100, y: 185 }); assert.deepEqual(project.map.objects, []);
  assert.equal(validateProject(project).ok, true); assert.ok(validateProject(project).warnings.some(value => value.includes('SOURCE_PENDING')));
  const reopened = JSON.parse(JSON.stringify(project)); reopened.sourcePreview.actor.position = [4500, 7000]; reopened.sourcePreview.camera.y = 7000;
  assert.equal(validateProject(reopened).ok, true); assert.deepEqual(reopened.sourcePreview.actor.sourceStart.worldPx, [4020, 7420]);
  assert.equal(reopened.sourcePreview.provenance.imageObservations.length, 9); assert.equal(reopened.sourcePreview.provenance.generatedEngineImageLayers.length, 85);
  for (const mutate of [value => { value.sourceScene = {}; }, value => { value.rigScene = {}; }, value => { value.terrainScene = {}; },
    value => { value.map.tiles[0] = 0; }, value => { value.map.start.y = 184; }, value => { value.extra = 'x'.repeat(4194304); }]) {
    const invalid = structuredClone(project); mutate(invalid); assert.equal(validateProject(invalid, { geometry: false }).ok, false);
  }
  const flat = structuredClone(project); delete flat.sourcePreview; assert.equal(validateProject(flat).ok, true);
});
