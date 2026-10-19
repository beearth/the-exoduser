import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptMapSourceScene, inspectMapSourceJSON, validateMapSourceOutput, MAP_SOURCE_LIMITS } from '../engine/fdg/map-source-adapter.js';

// Minimal actual-export field fixtures; no production bundle, geometry or asset is copied.
function makeSource() {
  return {
    completionId: 'stage0-source-test', control: 'stage0-source-test-control',
    kind: 'source scene export', scope: 'stage0/si0 only',
    nativeContract: { symbol: 'CH1_1_PRODUCTION', version: '20260916-finish-1', stage: 0, size: [200, 200], tileSize: 40 },
    bounds: { gridTiles: [200, 200], tileSizePx: 40, worldSizePx: [8000, 8000], worldRangePx: [0, 8000], chunkSizePx: 1024, geometryHash: 'a'.repeat(64) },
    boundaryPolygon: { units: 'tile index', points: 3, data: [[0, 0], [200, 0], [100, 200]] },
    nav: { format: 'RLE row-major (value,count) pairs; 1=walkable(polygon 내부), 0=non-walkable(외부)', rlePairs: 2, walkableTiles: 3000, totalTiles: 40000, data: [0, 37000, 1, 3000] },
    start: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420], pending: 'PENDING_SOURCE_EXPORT' },
    gateExit: { bossCx: 100, gateY: 5, gateTiles: { x: [99, 101], y: 5, value: 3 }, exitY: 7, exitTiles: { x: [99, 101], y: 7, value: 2 }, clearRegion: { x: [88, 112], y: [2, 35], value: 0 } },
    collision: { objectColliders: { count: 1, pointer: 'composition.json#/placements' }, mergedRuntimeCollision: 'PENDING_SOURCE_EXPORT', altarCliffBand: { rule: '.84<=d<=1.04 isW' } },
    logicalHeight: { range: '0..1 (smoothstep, logical)', pending: 'PENDING_SOURCE_UNIT' },
    units: { rawTile: '정수 tile index', centerTile: 'rawTile+0.5 (tile)', worldPx: 'centerTile*40 (px, 0..8000)' },
    unknownAuthoredMetadata: { stageId: 'si0', anchor: [147, 97], revision: 'keep-me' },
  };
}

function makeManifest() {
  return {
    completionId: 'stage0-source-test', control: 'stage0-source-test-control', kind: 'source resource manifest',
    sourceAssets: { count: 1, resolved: 1, items: [{ relative: 'floor_objects/source.png', canonicalAbsolutePath: '/approved/assets/map/ch1/floor_objects/source.png', exists: true, role: 'source prop', originAnchorSize: 'PENDING' }] },
    groundMaterials: { resolved: '1/2', items: [
      { key: 'soil', file: 'ground_soil.png', canonicalAbsolutePath: '/approved/assets/map/ch1/ground_soil.png', exists: true, role: 'ground material', values: { brightness: 0.85 } },
      { key: 'collisionChanges', file: null, canonicalAbsolutePath: null, exists: null, values: { raw: false }, pathStatus: 'PENDING_PATH_BASE' },
    ] },
    placements: { count: 1, pointer: 'composition.json#/placements' },
    unknownManifestMetadata: { approvedReference: 'preserve-without-loading', flags: [false, null] },
  };
}

function assertDisabled(result) {
  assert.equal(result.ok, false);
  assert.equal(result.project, null);
  assert.equal(result.world, null);
}

test('partial source inspection preserves unknown JSON and explicit 0/1 nav without authorizing a scene', () => {
  const source = makeSource(), manifest = makeManifest(), before = JSON.stringify({ source, manifest });
  const result = adaptMapSourceScene(source, manifest);
  assertDisabled(result); assert.deepEqual(result.errors, []);
  assert.equal(result.inspection.stage, 0); assert.equal(result.inspection.navScope, 'polygon-only');
  assert.deepEqual(result.inspection.gridSize, [200, 200]); assert.equal(result.inspection.tileSize, 40);
  assert.equal(result.inspection.tiles.length, 40000);
  assert.equal(result.inspection.tiles.filter(value => value === 1).length, 3000);
  assert.equal(result.inspection.tiles[5 * 200 + 100], 0);
  assert.equal(result.inspection.tiles[7 * 200 + 100], 0);
  assert.equal(result.inspection.gateExit.gateTiles.value, 3);
  assert.equal(result.inspection.gateExit.exitTiles.value, 2);
  assert.deepEqual(result.inspection.sourceSnapshot, source);
  assert.deepEqual(result.inspection.manifestSnapshot, manifest);
  assert.notEqual(result.inspection.sourceSnapshot, source);
  assert.equal(JSON.stringify({ source, manifest }), before);
  assert.throws(() => { result.inspection.tiles[0] = 1; }, TypeError);
  source.unknownAuthoredMetadata.revision = 'changed-by-caller';
  assert.equal(result.inspection.sourceSnapshot.unknownAuthoredMetadata.revision, 'keep-me');
  for (const field of ['collision.mergedRuntimeCollision', 'start.authority', 'logicalHeight.physicalZ', 'placements.instances', 'resources.cropWorldRect', 'resources.loadDrawAuthority', 'executionContract'])
    assert.ok(result.pending.some(item => item.field === field));
  assert.ok(result.mapping.length >= 8);
  assert.ok(result.mapping.every(item => typeof item.value !== 'object' && item.status === 'inspection-only'));
});

test('raw JSON and approved preview groups preserve resources while excluding previous map/rig/terrain', () => {
  let oldSceneReads = 0;
  const previewProject = { characters: [{ id: 'approved-character' }], skills: [{ id: 'approved-skill', vfx: 'approved-vfx' }], vfx: [{ id: 'approved-vfx' }], preview: { characterId: 'approved-character', skillId: 'approved-skill', vfxId: 'approved-vfx' } };
  for (const key of ['map', 'rigScene', 'terrainScene']) Object.defineProperty(previewProject, key, { get() { oldSceneReads++; throw new Error('previous scene must not be read'); } });
  const result = adaptMapSourceScene(JSON.stringify(makeSource()), JSON.stringify(makeManifest()), { previewProject });
  assertDisabled(result); assert.deepEqual(result.errors, []); assert.equal(oldSceneReads, 0);
  assert.deepEqual(Object.keys(result.inspection.previewResources), ['characters', 'skills', 'vfx', 'preview']);
  assert.notEqual(result.inspection.previewResources.characters, previewProject.characters);
  assert.ok(!result.pending.some(item => item.field === 'previewProject'));
  previewProject.characters[0].id = 'later-edit';
  assert.equal(result.inspection.previewResources.characters[0].id, 'approved-character');
  const invalid = adaptMapSourceScene(makeSource(), makeManifest(), { previewProject: { characters: [], skills: [], vfx: [], preview: {} } });
  assertDisabled(invalid); assert.ok(invalid.errors.some(error => error.includes('previewProject.characters')));
});

test('RLE code/count/total and START center formula mismatches reject instead of repairing nav', () => {
  const mutations = [
    source => { source.nav.data[0] = 2; },
    source => { source.nav.data[1] = 37001; },
    source => { source.nav.rlePairs = 3; },
    source => { source.nav.walkableTiles = 3001; },
    source => { source.nav.totalTiles = 39999; },
    source => { source.nav.data[1] = 0; },
    source => { source.nav.format = '0=floor;1=wall'; },
    source => { source.start.centerTile[0] = 101; },
    source => { source.start.worldPx[1] = 7400; },
    source => { source.start.rawTile[1] = 5; source.start.centerTile[1] = 5.5; source.start.worldPx[1] = 220; },
  ];
  for (const mutate of mutations) {
    const source = makeSource(); mutate(source);
    const result = adaptMapSourceScene(source, makeManifest());
    assertDisabled(result); assert.ok(result.errors.length > 0);
    assert.ok(!Object.hasOwn(result.inspection, 'tiles'));
  }
});

test('native header/grid/unit/resource cross references are strict and stage1 is rejected', () => {
  const sourceMutations = [
    source => { source.nativeContract.stage = 1; },
    source => { source.nativeContract.size[0] = 199; },
    source => { source.bounds.worldSizePx[0] = 7999; },
    source => { source.bounds.chunkSizePx = 512; },
    source => { source.bounds.geometryHash = 'not-a-source-hash'; },
    source => { source.units.worldPx = 'tile×40'; },
    source => { source.boundaryPolygon.points = 4; },
    source => { source.gateExit.exitTiles.value = 1; },
  ];
  for (const mutate of sourceMutations) {
    const source = makeSource(); mutate(source);
    const result = adaptMapSourceScene(source, makeManifest());
    assertDisabled(result); assert.ok(result.errors.length > 0);
  }
  const manifestMutations = [
    manifest => { manifest.control = 'different-bundle'; },
    manifest => { manifest.placements.count = 2; },
    manifest => { manifest.sourceAssets.count = 2; },
    manifest => { manifest.sourceAssets.resolved = 0; },
    manifest => { manifest.sourceAssets.items[0].canonicalAbsolutePath = '/different/name.png'; },
    manifest => { manifest.sourceAssets.items[0].relative = '../source.png'; },
    manifest => { manifest.sourceAssets.items[0].canonicalAbsolutePath = '/approved/../assets/map/ch1/floor_objects/source.png'; },
  ];
  for (const mutate of manifestMutations) {
    const manifest = makeManifest(); mutate(manifest);
    const result = adaptMapSourceScene(makeSource(), manifest);
    assertDisabled(result); assert.ok(result.errors.length > 0);
  }
});

test('nonasset collisionChanges=false is preserved and never treated as a missing image', () => {
  const result = adaptMapSourceScene(makeSource(), makeManifest());
  assert.deepEqual(result.errors, []); assert.equal(result.inspection.resources.length, 2);
  assert.ok(result.inspection.resources.every(item => item.exists && item.placementReady === false));
  assert.equal(result.inspection.manifestSnapshot.groundMaterials.items[1].values.raw, false);
  assert.ok(!result.pending.some(item => item.field.includes('collisionChanges') || item.field.includes('groundMaterials.items[1]')));
  const manifest = makeManifest(); manifest.sourceAssets.items[0].exists = false; manifest.sourceAssets.resolved = 0;
  const unresolved = adaptMapSourceScene(makeSource(), manifest);
  assertDisabled(unresolved); assert.deepEqual(unresolved.errors, []);
  assert.ok(unresolved.pending.some(item => item.field === 'sourceAssets.items[0].exists'));
});

test('unsafe JSON is rejected before accessors/toJSON hooks execute; safe shared metadata is cloned', () => {
  let hooks = 0;
  const getter = {}; Object.defineProperty(getter, 'value', { enumerable: true, get() { hooks++; return 1; } });
  const toJSON = { toJSON() { hooks++; return {}; } };
  const hidden = {}; Object.defineProperty(hidden, 'value', { value: 1 });
  const symbolic = { [Symbol('unsafe')]: 1 }, cycle = {}; cycle.self = cycle;
  for (const value of [JSON.parse('{"__proto__":{}}'), { nested: { constructor: 1 } }, [1, , 3], { value: NaN }, { value: Infinity }, { value: undefined }, getter, toJSON, hidden, symbolic, cycle, new Date()])
    assert.equal(inspectMapSourceJSON(value).ok, false);
  assert.equal(hooks, 0);
  const shared = Object.assign(Object.create(null), { preserved: ['yes', null, false] });
  const safe = inspectMapSourceJSON({ a: shared, b: shared });
  assert.equal(safe.ok, true); assert.deepEqual(safe.value.a, safe.value.b);
  assert.notEqual(safe.value.a, shared); assert.notEqual(safe.value.a, safe.value.b);
});

test('JSON depth/visits and each raw input UTF-8 budget are bounded', () => {
  const nested = depth => { let value = 0; for (let i = 0; i < depth; i++) value = { child: value }; return value; };
  assert.equal(inspectMapSourceJSON(nested(64)).ok, true);
  assert.equal(inspectMapSourceJSON(nested(65)).ok, false);
  assert.equal(inspectMapSourceJSON(new Array(MAP_SOURCE_LIMITS.maxVisits).fill(0)).ok, false);
  assert.equal(inspectMapSourceJSON('"한글"', { maxBytes: 8 }).ok, true);
  assert.equal(inspectMapSourceJSON('"한글"', { maxBytes: 7 }).ok, false);
  assert.equal(inspectMapSourceJSON('   {}', { maxBytes: 4 }).ok, false);
  assert.equal(inspectMapSourceJSON({ value: '한글' }, { maxBytes: 8 }).ok, false);
  assert.equal(inspectMapSourceJSON('{broken').ok, false);
  const oversizedRaw = ' '.repeat(MAP_SOURCE_LIMITS.inputBytes) + '{}';
  for (const [source, manifest] of [[oversizedRaw, JSON.stringify(makeManifest())], [JSON.stringify(makeSource()), oversizedRaw]]) {
    const result = adaptMapSourceScene(source, manifest);
    assertDisabled(result); assert.ok(result.errors.some(error => error.includes('8388608')));
  }
});

test('missing/unknown source stays pending and output budgets retain 4MiB scene within 8MiB world', () => {
  assert.equal(MAP_SOURCE_LIMITS.projectBytes, 4194304);
  assert.equal(MAP_SOURCE_LIMITS.worldBytes, 8388608);
  const missing = adaptMapSourceScene(undefined, undefined);
  assertDisabled(missing); assert.deepEqual(missing.errors, []);
  assert.ok(missing.pending.some(item => item.field === 'source-format-pending'));
  assert.ok(missing.pending.some(item => item.field === 'resources.loadDrawAuthority'));
  const source = makeSource(); source.nativeContract.version = 'unknown'; source.executionContract = { approved: true };
  const unknown = adaptMapSourceScene(source, makeManifest());
  assertDisabled(unknown); assert.ok(unknown.pending.some(item => item.field === 'source-format-pending'));
  assert.equal(unknown.inspection.sourceSnapshot.executionContract.approved, true);
  const oversizedScene = { payload: 'x'.repeat(MAP_SOURCE_LIMITS.projectBytes) };
  assert.ok(validateMapSourceOutput(oversizedScene, null).errors.some(error => error.includes('4194304')));
  assert.ok(validateMapSourceOutput(null, { scenes: [{ project: oversizedScene }] }).errors.some(error => error.includes('world.scenes[0].project') && error.includes('4194304')));
  assert.ok(validateMapSourceOutput(null, { payload: 'x'.repeat(MAP_SOURCE_LIMITS.worldBytes) }).errors.some(error => error.includes('8388608')));
});
