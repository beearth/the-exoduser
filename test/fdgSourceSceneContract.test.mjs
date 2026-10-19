import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateSourceScene, sampleSourceHeight, canMoveSourceScene } from '../engine/fdg/source-scene.js';
import { adaptMapSourceScene } from '../engine/fdg/map-source-adapter.js';

// Synthetic contract data only: no completed MAP bundle, PNG, game or old suite input.
function makeScene() {
  return { schemaVersion: 1, stage: 0, grid: { width: 200, height: 200, tileSize: 40 },
    nav: { tiles: new Array(40000).fill(1), scope: 'polygon-plus-source-colliders' },
    height: { logicalSamples: new Array(40000).fill(0.4), source: 'UNIT logical samples', interpolation: 'bilinear-cell-centers', heightMapping: { kind: 'engine-authored-linear', scalePx: 100, offsetPx: 20, authoredBy: 'UNIT engine author' } },
    colliders: [], imageLayers: [], actor: { position: [4020, 7420, 60], startAuthority: { symbol: 'UNIT_RUNTIME_START', source: 'UNIT source authority' }, sourceStart: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] } },
    camera: { x: 4020, y: 7420, follow: true }, settings: { maxStep: 64, maxSlope: 1 }, provenance: { unitOnly: true, nativePhysicalZClaim: false } };
}
const query = (scene, from, to, radius = 12) => canMoveSourceScene(scene, { x: from[0], y: from[1], z: from[2] ?? 60 }, { x: to[0], y: to[1] }, radius, { validated: true });

function makeBase() {
  const source = { completionId: 'UNIT-completion', control: 'UNIT-base', kind: 'UNIT source export', scope: 'stage0 only',
    nativeContract: { symbol: 'CH1_1_PRODUCTION', version: '20260916-finish-1', stage: 0, size: [200, 200], tileSize: 40 },
    bounds: { gridTiles: [200, 200], tileSizePx: 40, worldSizePx: [8000, 8000], worldRangePx: [0, 8000], chunkSizePx: 1024, geometryHash: 'a'.repeat(64) },
    boundaryPolygon: { units: 'tile index', points: 3, data: [[0, 0], [200, 0], [100, 200]] },
    nav: { format: 'RLE row-major (value,count) pairs; 1=walkable(polygon 내부), 0=non-walkable(외부)', rlePairs: 1, walkableTiles: 40000, totalTiles: 40000, data: [1, 40000] },
    start: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] },
    gateExit: { bossCx: 100, gateY: 5, gateTiles: { x: [99, 101], y: 5, value: 3 }, exitY: 7, exitTiles: { x: [99, 101], y: 7, value: 2 }, clearRegion: { x: [88, 112], y: [2, 35], value: 0 } },
    collision: { objectColliders: { count: 1, pointer: 'UNIT placements pointer; historical VISUAL count' }, altarCliffBand: { rule: '.84<=d<=1.04' }, mergedRuntimeCollision: 'PENDING_SOURCE_EXPORT' },
    logicalHeight: { range: '0..1', pending: 'source samples not supplied' },
    units: { rawTile: '정수 tile index', centerTile: 'rawTile+0.5 (tile)', worldPx: 'centerTile*40 (px, 0..8000)' }, unknownSource: { keep: 'UNIT metadata' } };
  const manifest = { completionId: 'UNIT-completion', control: 'UNIT-base', kind: 'UNIT manifest',
    sourceAssets: { count: 1, resolved: 1, items: [{ relative: 'floor/source.png', canonicalAbsolutePath: '/UNIT/approved/floor/source.png', exists: true, role: 'UNIT original source image' }] },
    groundMaterials: { items: [{ key: 'collisionChanges', file: null, values: { raw: false } }] },
    placements: { count: 1, pointer: 'UNIT placements pointer' }, unknownManifest: { keep: false } };
  return { source, manifest };
}

function makePreview() {
  const animation = { row: 0, start: 0, frames: 24, fps: 24, loop: true };
  return { characters: [{ id: 'unit-character', name: 'UNIT character', speed: 120, radius: 12,
    sprite: { src: 'assets/unit-character.png', frameWidth: 1, frameHeight: 1, columns: 24, rows: 1, frames: 24, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 },
    animations: { idle: { ...animation }, walk: { ...animation } } }],
  skills: [{ id: 'unit-skill', name: 'UNIT skill', cooldown: 0, cost: 0, range: 100, damage: 0, vfx: 'unit-vfx' }],
  vfx: [{ id: 'unit-vfx', name: 'UNIT VFX', kind: 'burst', color: '#abcdef', count: 1, life: 0.2, speed: 1, size: 1, spread: 0 }],
  preview: { characterId: 'unit-character', skillId: 'unit-skill', vfxId: 'unit-vfx', resourceMax: 100, resourceRegen: 0 } };
}

function makeAuthoring() {
  return { heightMapping: { kind: 'engine-authored-linear', scalePx: 100, offsetPx: 20, authoredBy: 'UNIT engine author' },
    camera: { x: 4020, y: 7420, follow: true }, settings: { maxStep: 64, maxSlope: 1 },
    resourceBindings: { '/UNIT/approved/floor/source.png': 'assets/unit-source-ground.png' },
    executionContract: { id: 'fdg-source-scene-v1', version: 1, stage: 0, sourceSymbol: 'CH1_1_PRODUCTION', sourceVersion: '20260916-finish-1', loadDraw: 'same-origin-source-image-layers', authoredBy: 'UNIT engine author' } };
}

function addExecution(source) {
  source.executionData = { version: 1, startAuthority: { symbol: 'UNIT_RUNTIME_START', source: 'UNIT source authority' },
    logicalHeight: { samples: new Array(40000).fill(0.4), source: 'UNIT logical samples' },
    objectColliderCount: 0, objectColliders: [],
    boundaryColliders: [{ id: 'unit-boundary', kind: 'ellipse-band', center: [3000, 3000], radii: [100, 50], yaw: 0, innerRatio: 0.84, outerRatio: 1.04 }],
    placements: [{ file: 'floor/source.png', x: 100, y: 185, scale: 1, opacity: 1, brightness: 1, saturation: 1 }],
    imageLayers: [{ id: 'unit-ground', canonicalAbsolutePath: '/UNIT/approved/floor/source.png', sourceRect: [0, 0, 64, 64], worldRect: [0, 0, 8000, 8000], opacity: 1, layer: 'ground' }] };
}

function makeRevisions(sourceRaw, manifestRaw) {
  const reference = (path, raw) => ({ path, bytes: Buffer.byteLength(raw), sha256: createHash('sha256').update(raw).digest('hex') });
  const sourceRevision = { completionId: 'UNIT-completion', control: 'UNIT-revision', kind: 'native-field overlay UNIT', baseRef: reference('/UNIT/base-source.json', sourceRaw), changes: {
    '/collision/objectColliders': { new: { placementsExpanded: { units: 'x,y=tile index; opacity/brightness/saturation descriptive0..1', count: 1, byFile: { 'floor/source.png': [{ x: 207, y: 185, scale: 1.2, opacity: 1, brightness: 1.08, saturation: 0.65 }] }, source: 'UNIT native VISUAL records' }, status: 'VISUAL; real colliders PENDING_SOURCE_EXPORT', realObjectColliderSource: 'UNIT MAP_OBJS/_OBJ_META pending' } },
    '/start/sourceAuthority': { new: { units: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420], tileSizePx: 40 }, runtimeStartSymbol: 'PENDING_SOURCE_EXPORT' } },
    '/collision/altarCliffBand': { new: { rule: '.84<=d<=1.04', center: [147, 98], radiusTiles: [18, 9] } },
    '/logicalHeight': { status: 'unchanged logical0..1' }, unknownChange: { preserve: true },
  } };
  const manifestRevision = { completionId: 'UNIT-completion', control: 'UNIT-revision', kind: 'native-field overlay UNIT resources', baseRef: reference('/UNIT/base-manifest.json', manifestRaw), changes: {
    '/sourceAssets/usage': { new: { perAssetPlacementCounts: { 'floor/source.png': 1 } } },
    '/groundMaterials/flagSeparation': { new: { materialPaths: { resolved: '0/0', items: [] }, metadataFlag: { collisionChanges: false, type: 'boolean' } } },
  } };
  return { sourceRevision, manifestRevision };
}

test('source schema permits captured actor away from native START and rejects unsafe/missing authoring', () => {
  const scene = makeScene(); scene.actor.position = [4500, 7000, 60];
  assert.equal(validateSourceScene(scene).ok, true);
  assert.deepEqual(scene.actor.sourceStart.worldPx, [4020, 7420]);
  for (const mutate of [value => { delete value.height.heightMapping.offsetPx; }, value => { value.actor.position[2] = 0; }, value => { value.nav.tiles[0] = 2; }, value => { value.unknown = NaN; }, value => { value.height.logicalSamples.length = 39999; }]) {
    const invalid = makeScene(); mutate(invalid); assert.equal(validateSourceScene(invalid).ok, false);
  }
  let hooks = 0; const accessor = makeScene(); Object.defineProperty(accessor, 'unknown', { enumerable: true, get() { hooks++; return 1; } });
  assert.equal(validateSourceScene(accessor).ok, false); assert.equal(hooks, 0);
  const tooLarge = makeScene(); tooLarge.unknown = 'x'.repeat(4194304);
  assert.ok(validateSourceScene(tooLarge).errors.some(error => error.includes('4194304')));
});

test('source logical cell-center interpolation, explicit scale/offset and gradient remain separate', () => {
  const scene = makeScene(); scene.height.logicalSamples = Array.from({ length: 40000 }, (_, index) => (index % 200) / 199);
  scene.actor.position[2] = sampleSourceHeight(scene, 4020, 7420, { validated: true }).height;
  assert.equal(validateSourceScene(scene).ok, true);
  const sample = sampleSourceHeight(scene, 40, 20);
  assert.ok(Math.abs(sample.logicalHeight - 0.5 / 199) < 1e-12);
  assert.ok(Math.abs(sample.height - (20 + 50 / 199)) < 1e-12);
  assert.ok(Math.abs(sample.slope - 100 / (199 * 40)) < 1e-12);
  assert.equal(sample.surfaceId, 'source-ground');
  assert.equal(sampleSourceHeight(scene, 8000, 20).height, 120);
  assert.equal(sampleSourceHeight(scene, 8000, 20).slope, 0);
  assert.ok(Number.isNaN(sampleSourceHeight(scene, 8001, 20).height));
  assert.equal(scene.height.logicalSamples[0], 0);
});

test('full-circle nav/bounds and swept movement block crossed walls without mutating source cells', () => {
  const scene = makeScene(); scene.nav.tiles[25 * 200 + 25] = 0;
  const before = [...scene.nav.tiles];
  assert.equal(query(scene, [950, 1020], [1100, 1020]).reason, 'nav');
  assert.equal(query(scene, [20, 20], [10, 20], 19).reason, 'bounds');
  assert.equal(query(scene, [100, 100], [200, 100]).ok, true);
  assert.deepEqual(scene.nav.tiles, before);
});

test('real circle, rotated box and ellipse footprints block the swept actor circle', () => {
  for (const collider of [
    { id: 'unit-circle', kind: 'circle', center: [1000, 1000], radius: 20 },
    { id: 'unit-box', kind: 'box', center: [1000, 1000], size: [20, 200], yaw: Math.PI / 2 },
    { id: 'unit-ellipse', kind: 'ellipse', center: [1000, 1000], radii: [100, 20], yaw: Math.PI / 2 },
  ]) {
    const scene = makeScene(); scene.colliders = [collider];
    assert.equal(validateSourceScene(scene).ok, true);
    assert.equal(query(scene, [850, 1000], [1200, 1000], 5).reason, `collider:${collider.id}`);
    assert.equal(query(scene, [850, 1200], [1200, 1200], 5).ok, true);
  }
});

test('source ellipse-band hole and only explicitly exported full-circle exceptions are respected', () => {
  const scene = makeScene(), band = { id: 'unit-band', kind: 'ellipse-band', center: [2000, 2000], radii: [100, 50], yaw: 0, innerRatio: 0.8, outerRatio: 1 };
  scene.colliders = [band];
  assert.equal(query(scene, [2000, 2000], [2050, 2000], 10).ok, true);
  assert.equal(query(scene, [2050, 2000], [2120, 2000], 5).reason, 'collider:unit-band');
  band.exceptions = [{ id: 'unit-gap', kind: 'box', center: [2085, 2000], size: [90, 40], yaw: 0 }];
  assert.equal(query(scene, [2050, 2000], [2120, 2000], 5).ok, true);
  band.exceptions[0].size[1] = 5;
  assert.equal(query(scene, [2050, 2000], [2120, 2000], 5).reason, 'collider:unit-band');
});

test('engine slope/step gates and exact from-ground contact reject movement without snapping', () => {
  const scene = makeScene();
  assert.equal(query(scene, [1000, 1000, 0], [1040, 1000]).reason, 'ground-contact');
  scene.height.logicalSamples = Array.from({ length: 40000 }, (_, index) => (index % 200) <= 24 ? 0 : (index % 200) === 25 ? 0.2 : 0.4);
  scene.settings.maxStep = 1;
  assert.equal(query(scene, [940, 1000, 20], [1040, 1000]).reason, 'step');
  scene.settings.maxStep = 64; scene.settings.maxSlope = 0.1;
  assert.equal(query(scene, [940, 1000, 20], [1040, 1000]).reason, 'slope');
  scene.settings.maxSlope = 1;
  const moved = query(scene, [940, 1000, 20], [1040, 1000]);
  assert.equal(moved.ok, true); assert.ok(moved.height > 20); assert.ok(moved.logicalHeight > 0);
});

test('source inputs and engine authoring pending stay classified, with no source physical Z or fixture candidate', () => {
  const { source, manifest } = makeBase(), result = adaptMapSourceScene(source, manifest, { previewProject: makePreview() });
  assert.equal(result.ok, false); assert.equal(result.candidateProject, null); assert.equal(result.project, null); assert.equal(result.world, null);
  assert.equal(result.sourceRequired.length, 6); assert.equal(result.engineAuthoredFields.length, 5);
  assert.ok(result.pending.every(item => ['SOURCE_INPUT', 'ENGINE_AUTHORING', 'ENGINE_IMPLEMENTATION'].includes(item.classification)));
  assert.ok(!result.sourceRequired.some(item => item.field.includes('physicalZ') || item.field.includes('resourceBindings') || item.field.includes('executionContract')));
  assert.deepEqual(result.inspection.sourceSnapshot, source);
});

test('complete synthetic export plus explicit engine authoring produces only a validated candidate', () => {
  const { source, manifest } = makeBase(); addExecution(source);
  const before = JSON.stringify({ source, manifest }), authoring = makeAuthoring();
  const result = adaptMapSourceScene(source, manifest, { previewProject: makePreview(), engineAuthored: authoring });
  assert.deepEqual(result.errors, []); assert.deepEqual(result.pending, []); assert.equal(result.ok, true);
  assert.equal(result.project, null); assert.equal(result.world, null);
  assert.equal(result.candidateProject.sourceScene.actor.position[2], 60);
  assert.equal(result.candidateProject.sourceScene.height.heightMapping.authoredBy, 'UNIT engine author');
  assert.equal(result.candidateProject.sourceScene.imageLayers[0].depthY, 8000);
  assert.deepEqual(result.candidateProject.sourceScene.imageLayers[0].engineDrawDefaults, { layer: false, depthY: true });
  assert.equal(result.candidateProject.provenance.productionRegistered, false);
  assert.deepEqual(result.candidateProject.map.tiles, result.inspection.tiles);
  assert.equal(JSON.stringify({ source, manifest }), before);
  assert.equal(Object.hasOwn(result.candidateProject, 'rigScene'), false); assert.equal(Object.hasOwn(result.candidateProject, 'terrainScene'), false);
  delete authoring.heightMapping.offsetPx;
  const missing = adaptMapSourceScene(source, manifest, { previewProject: makePreview(), engineAuthored: authoring });
  assert.equal(missing.ok, false); assert.equal(missing.candidateProject, null);
});

test('native-v2 raw-byte overlay preserves VISUAL placement207/brightness1.08 without fabricating collider/START', () => {
  const { source, manifest } = makeBase(), sourceRaw = JSON.stringify(source), manifestRaw = JSON.stringify(manifest), revisions = makeRevisions(sourceRaw, manifestRaw);
  const result = adaptMapSourceScene(sourceRaw, manifestRaw, { previewProject: makePreview(), ...revisions });
  assert.deepEqual(result.errors, []); assert.equal(result.ok, false); assert.equal(result.candidateProject, null);
  assert.equal(result.inspection.visualPlacementMetadata.role, 'VISUAL');
  assert.equal(result.inspection.visualPlacements.length, 1);
  assert.equal(result.inspection.visualPlacements[0].x, 207);
  assert.equal(result.inspection.visualPlacements[0].brightness, 1.08);
  const authored = makeAuthoring(); authored.resourceBindings = {};
  const enginePending = adaptMapSourceScene(sourceRaw, manifestRaw, { previewProject: makePreview(), ...revisions, engineAuthored: authored });
  assert.ok(enginePending.engineAuthoredFields.some(item => item.field === 'engineAuthored.resourceBindings'));
  assert.ok(!result.sourceRequired.some(item => item.field === 'executionData.placements'));
  assert.ok(result.sourceRequired.some(item => item.field === 'executionData.objectColliders'));
  assert.ok(result.sourceRequired.some(item => item.field === 'executionData.startAuthority'));
  assert.deepEqual(result.inspection.sourceSnapshot, source);
  assert.equal(result.inspection.sourceRevisionSnapshot.changes.unknownChange.preserve, true);
  assert.equal(result.inspection.materialFlags.metadataFlag.collisionChanges, false);
  revisions.manifestRevision.changes['/sourceAssets/usage'].new.perAssetPlacementCounts['floor/source.png'] = 2;
  assert.ok(adaptMapSourceScene(sourceRaw, manifestRaw, { ...revisions }).errors.some(error => error.includes('count')));
});

test('native overlay needs exact raw base authority and rejects mismatched bytes without fetching baseRef', () => {
  const { source, manifest } = makeBase(), sourceRaw = JSON.stringify(source), manifestRaw = JSON.stringify(manifest), revisions = makeRevisions(sourceRaw, manifestRaw);
  const objectBase = adaptMapSourceScene(source, manifest, revisions);
  assert.ok(objectBase.sourceRequired.some(item => item.field === 'sourceRevision.baseRef.rawBytes'));
  assert.equal(objectBase.candidateProject, null);
  revisions.sourceRevision.baseRef.sha256 = '0'.repeat(64);
  const mismatch = adaptMapSourceScene(sourceRaw, manifestRaw, revisions);
  assert.ok(mismatch.errors.some(error => error.includes('baseRef')));
  assert.equal(mismatch.ok, false); assert.equal(mismatch.candidateProject, null);
});
