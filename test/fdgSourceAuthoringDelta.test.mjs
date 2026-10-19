import test from 'node:test';
import assert from 'node:assert/strict';
import { compileSourceHeightProgram, resampleSourceHeightProgram, SOURCE_HEIGHT_PROGRAM_LIMITS } from '../engine/fdg/source-height-program.js';
import { adaptMapSourceScene } from '../engine/fdg/map-source-adapter.js';

// New synthetic contract data only; no old bundle, image, game, save or old test imports.
const constant = value => ({ op: 'constant', value });
const op = (name, ...args) => ({ op: name, args });
const evaluator = expression => ({ version: 1, coordinates: 'tile-center-space', expression, unitMetadata: { preserved: true } });
const xGradient = () => evaluator(op('div', { op: 'x' }, constant(200)));
function fixture() {
  const source = { completionId: 'UNIT-delta', control: 'UNIT-only', kind: 'UNIT source', scope: 'stage0 only',
    nativeContract: { symbol: 'CH1_1_PRODUCTION', version: '20260916-finish-1', stage: 0, size: [200, 200], tileSize: 40 },
    bounds: { gridTiles: [200, 200], tileSizePx: 40, worldSizePx: [8000, 8000], worldRangePx: [0, 8000], chunkSizePx: 1024, geometryHash: 'b'.repeat(64) },
    boundaryPolygon: { units: 'tile index', points: 3, data: [[0, 0], [200, 0], [100, 200]] },
    nav: { format: 'RLE row-major (value,count) pairs; 1=walkable(polygon 내부), 0=non-walkable(외부)', rlePairs: 1, walkableTiles: 40000, totalTiles: 40000, data: [1, 40000] },
    start: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] },
    gateExit: { bossCx: 100, gateY: 5, gateTiles: { x: [99, 101], y: 5, value: 3 }, exitY: 7, exitTiles: { x: [99, 101], y: 7, value: 2 }, clearRegion: { x: [88, 112], y: [2, 35], value: 0 } },
    collision: { objectColliders: { count: 1, pointer: 'UNIT historical VISUAL pointer' }, altarCliffBand: { rule: 'UNIT source pending metadata' }, mergedRuntimeCollision: 'PENDING_SOURCE_EXPORT' },
    units: { rawTile: '정수 tile index', centerTile: 'rawTile+0.5 (tile)', worldPx: 'centerTile*40 (px, 0..8000)' },
    executionData: { version: 1, logicalHeight: { source: 'UNIT explicit formula only', evaluator: xGradient() },
      objectColliderCount: 0, objectColliders: [], boundaryColliders: [{ id: 'unit-boundary', kind: 'circle', center: [2000, 2000], radius: 10 }],
      placements: [{ file: 'floor/unit.png', x: 100, y: 185, scale: 1, opacity: 1, brightness: 1, saturation: 1 }] },
    unknownSource: { nativeRuntimeSymbol: 'UNKNOWN', preserve: true } };
  const manifest = { completionId: 'UNIT-delta', control: 'UNIT-only', kind: 'UNIT manifest',
    sourceAssets: { count: 1, resolved: 1, items: [{ relative: 'floor/unit.png', canonicalAbsolutePath: '/UNIT/approved/floor/unit.png', exists: true, role: 'UNIT approved original reference' }] },
    groundMaterials: { items: [{ key: 'soil', file: 'materials/soil.png', canonicalAbsolutePath: '/UNIT/approved/materials/soil.png', exists: true, role: 'UNIT material' }] },
    placements: { count: 1, pointer: 'UNIT VISUAL pointer' } };
  const authored = { startAuthority: { kind: 'design-start', stage: 0, centerTile: [100.5, 185.5], worldPx: [4020, 7420], tileSizePx: 40, source: 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3', approvedBy: 'ROOT', runtimeSymbol: 'UNKNOWN' },
    heightMapping: { kind: 'engine-authored-linear', scalePx: 64, offsetPx: 0, authoredBy: 'UNIT engine author' },
    camera: { x: 4020, y: 7420, follow: true }, settings: { maxStep: 16, maxSlope: 0.75 },
    resourceBindings: { '/UNIT/approved/floor/unit.png': 'assets/unit-delta.png' },
    imageLayers: [{ id: 'unit-ground', canonicalAbsolutePath: '/UNIT/approved/floor/unit.png', sourceRect: [0, 0, 64, 64], worldRect: [0, 0, 8000, 8000], opacity: 1, layer: 'ground', depthY: 8000, authoredBy: 'UNIT engine layout author', unknownLayout: 'preserved' }],
    executionContract: { id: 'fdg-source-scene-v1', version: 1, stage: 0, sourceSymbol: 'CH1_1_PRODUCTION', sourceVersion: '20260916-finish-1', loadDraw: 'same-origin-source-image-layers', authoredBy: 'UNIT engine author' } };
  const animation = { row: 0, start: 0, frames: 24, fps: 24, loop: true };
  const previewProject = { characters: [{ id: 'unit-char', name: 'UNIT character', speed: 120, radius: 12,
    sprite: { src: 'assets/unit-char.png', frameWidth: 1, frameHeight: 1, columns: 24, rows: 1, frames: 24, fps: 24, scale: 1, anchorX: 0.5, anchorY: 1 }, animations: { idle: { ...animation }, walk: { ...animation } } }],
    skills: [{ id: 'unit-skill', name: 'UNIT skill', cooldown: 0, cost: 0, range: 100, damage: 0, vfx: 'unit-vfx' }],
    vfx: [{ id: 'unit-vfx', name: 'UNIT effect', kind: 'burst', color: '#abcdef', count: 1, life: 0.2, speed: 1, size: 1, spread: 0 }],
    preview: { characterId: 'unit-char', skillId: 'unit-skill', vfxId: 'unit-vfx', resourceMax: 100, resourceRegen: 0 } };
  return { source, manifest, authored, previewProject };
}
const adapt = ({ source, manifest, authored, previewProject }) => adaptMapSourceScene(source, manifest, { engineAuthored: authored, previewProject });

test('explicit normalized AST math evaluates supported operations without a formula default', () => {
  const expressions = [
    [op('add', constant(0.1), constant(0.2)), 0.3], [op('sub', constant(0.6), constant(0.2)), 0.4],
    [op('mul', constant(0.5), constant(0.5)), 0.25], [op('div', constant(1), constant(4)), 0.25],
    [op('min', constant(0.2), constant(0.7)), 0.2], [op('max', constant(0.2), constant(0.7)), 0.7],
    [op('abs', constant(-0.2)), 0.2], [op('sqrt', constant(0.25)), 0.5], [op('hypot', constant(0.3), constant(0.4)), 0.5],
    [op('clamp', constant(2), constant(0), constant(1)), 1], [op('smoothstep', constant(0), constant(1), constant(0.5)), 0.5],
    [op('div', op('add', { op: 'x' }, { op: 'y' }), constant(400)), 0.5],
  ];
  for (const [expression, expected] of expressions) {
    const input = evaluator(expression), before = structuredClone(input), compiled = compileSourceHeightProgram(input);
    assert.equal(compiled.ok, true); const result = compiled.program.evaluate(100, 100);
    assert.equal(result.ok, true); assert.ok(Math.abs(result.value - expected) < 1e-12); assert.deepEqual(input, before);
    assert.equal(compiled.program.expressionSnapshot.unitMetadata.preserved, true);
  }
  assert.equal(compileSourceHeightProgram({ version: 1, coordinates: 'tile-center-space' }).ok, false);
});

test('AST safety/domain/CPU bounds reject bad input and classify unsupported engine math separately', () => {
  for (const expression of [op('div', constant(1), constant(0)), op('sqrt', constant(-1)), op('clamp', constant(0.5), constant(1), constant(0)), op('smoothstep', constant(1), constant(1), constant(0.5)), op('mul', constant(1e308), constant(1e308)), constant(-0.1), constant(1.1)]) {
    const compiled = compileSourceHeightProgram(evaluator(expression)); assert.equal(compiled.ok, true); assert.equal(compiled.program.evaluate(100, 100).ok, false);
  }
  assert.equal(compileSourceHeightProgram(evaluator({ op: 'add', args: [constant(0)] })).ok, false);
  assert.equal(compileSourceHeightProgram(evaluator({ op: 'constant' })).ok, false);
  let hooks = 0; const accessor = evaluator(constant(0.5)); Object.defineProperty(accessor.expression, 'value', { enumerable: true, get() { hooks++; return 0.5; } });
  assert.equal(compileSourceHeightProgram(accessor).ok, false); assert.equal(hooks, 0);
  const reserved = JSON.parse('{"version":1,"coordinates":"tile-center-space","expression":{"op":"constant","value":0.5},"constructor":{}}');
  assert.equal(compileSourceHeightProgram(reserved).ok, false);
  const sparse = evaluator({ op: 'add', args: new Array(2) }); assert.equal(compileSourceHeightProgram(sparse).ok, false);
  let deep = constant(0.5); for (let i = 0; i < 33; i++) deep = op('abs', deep);
  assert.equal(compileSourceHeightProgram(evaluator(deep)).ok, false);
  const tree = depth => depth ? op('add', tree(depth - 1), tree(depth - 1)) : constant(0);
  assert.equal(compileSourceHeightProgram(evaluator(tree(8))).ok, false);
  const large = evaluator(constant(0.5)); large.unknown = 'x'.repeat(65536); assert.equal(compileSourceHeightProgram(large).ok, false);
  const unsupported = compileSourceHeightProgram(evaluator({ op: 'eval', args: [] }));
  assert.equal(unsupported.ok, false); assert.deepEqual(unsupported.errors, []); assert.equal(unsupported.pending[0].classification, 'ENGINE_IMPLEMENTATION');
  assert.equal(SOURCE_HEIGHT_PROGRAM_LIMITS.resampleOperations, 40000 * 256);
});

test('AST authoring-time resample uses exact row-major tile centers and preserves evaluator provenance', () => {
  const input = xGradient(), before = structuredClone(input), result = resampleSourceHeightProgram(input);
  assert.equal(result.ok, true); assert.equal(result.samples.length, 40000);
  assert.equal(result.samples[0], 0.5 / 200); assert.equal(result.samples[199], 199.5 / 200); assert.equal(result.samples[20100], 100.5 / 200);
  assert.equal(result.provenance.kind, 'engine-derived-logical-grid'); assert.equal(result.provenance.sourcePhysicalZClaim, false);
  assert.deepEqual(result.provenance.sourceEvaluator, input); assert.deepEqual(input, before);
  const invalid = resampleSourceHeightProgram(evaluator(op('div', constant(1), op('sub', { op: 'x' }, constant(0.5)))));
  assert.equal(invalid.ok, false); assert.equal(invalid.samples, null); assert.equal(invalid.provenance, null);
});

test('ROOT design START plus explicit AST/layout creates only a candidate with UNKNOWN native authority retained', () => {
  const data = fixture(), before = structuredClone(data.source), result = adapt(data);
  assert.deepEqual(result.errors, []); assert.deepEqual(result.pending, []); assert.equal(result.ok, true);
  assert.equal(result.project, null); assert.equal(result.world, null);
  const scene = result.candidateProject.sourceScene;
  assert.equal(scene.actor.startAuthority.symbol, 'FDG_AUTHORED_CH1_1_START'); assert.equal(scene.provenance.nativeStartRuntimeSymbol, 'UNKNOWN');
  assert.equal(scene.provenance.startAuthorityRole, 'engine-authored-design-start');
  assert.deepEqual(scene.actor.sourceStart.rawTile, [100, 185]); assert.deepEqual(scene.actor.position.slice(0, 2), [4020, 7420]);
  assert.ok(Math.abs(scene.actor.position[2] - 32.16) < 1e-12); assert.equal(scene.height.samplingProvenance.kind, 'engine-derived-logical-grid');
  assert.equal(scene.height.samplingProvenance.sourceEvaluator.unitMetadata.preserved, true);
  assert.equal(scene.imageLayers[0].layoutRole, 'engine-authored-layout'); assert.equal(scene.imageLayers[0].nativeAnchor, 'UNKNOWN');
  assert.equal(scene.imageLayers[0].sourcePhysicalLayoutClaim, false); assert.equal(scene.imageLayers[0].unknownLayout, 'preserved');
  assert.deepEqual(scene.imageLayers[0].engineDrawDefaults, { layer: false, depthY: false });
  assert.equal(result.candidateProject.provenance.productionRegistered, false); assert.deepEqual(data.source, before);
});

test('native START/samples/image inputs retain precedence over engine authoring fallbacks', () => {
  const data = fixture(); data.source.executionData.startAuthority = { symbol: 'UNIT_NATIVE_START', source: 'UNIT exported runtime authority' };
  data.source.executionData.logicalHeight = { source: 'UNIT exported samples', samples: new Array(40000).fill(0.4) };
  data.source.executionData.imageLayers = [{ id: 'unit-source-image', canonicalAbsolutePath: '/UNIT/approved/floor/unit.png', sourceRect: [0, 0, 16, 16], worldRect: [0, 0, 8000, 8000], opacity: 1, layer: 'ground' }];
  data.authored.startAuthority = { kind: 'unused-invalid-engine-option' }; data.authored.imageLayers = [{ invalid: true }];
  const result = adapt(data); assert.deepEqual(result.errors, []); assert.equal(result.ok, true);
  const scene = result.candidateProject.sourceScene;
  assert.equal(scene.actor.startAuthority.symbol, 'UNIT_NATIVE_START'); assert.equal(scene.provenance.nativeStartRuntimeSymbol, 'UNIT_NATIVE_START');
  assert.equal(scene.height.logicalSamples[0], 0.4); assert.equal(Object.hasOwn(scene.height, 'samplingProvenance'), false);
  assert.equal(Object.hasOwn(scene.imageLayers[0], 'layoutRole'), false); assert.equal(scene.imageLayers[0].depthY, 8000);
});

test('missing design START/layout stays engine authoring, while descriptive hill parameters cannot invent a formula', () => {
  const data = fixture(); delete data.authored.startAuthority; delete data.authored.imageLayers; delete data.source.executionData.logicalHeight;
  data.source.logicalHeight = { range: '0..1(smoothstep,logical)', hill: { center: [147, 98], radius: [18, 9], westRamp: 'x125->135 @ y98' }, source: 'UNIT descriptive metadata only' };
  const result = adapt(data); assert.equal(result.ok, false); assert.equal(result.candidateProject, null);
  assert.ok(result.engineAuthoredFields.some(item => item.field === 'engineAuthored.startAuthority'));
  assert.ok(result.engineAuthoredFields.some(item => item.field === 'engineAuthored.imageLayers'));
  assert.ok(result.sourceRequired.some(item => item.field === 'executionData.logicalHeight'));
  assert.ok(!result.sourceRequired.some(item => item.field === 'executionData.startAuthority' || item.field === 'executionData.imageLayers'));
  assert.equal(Object.hasOwn(result.inspection, 'logicalHeightResolution'), false);
  data.source.executionData.logicalHeight = { source: 'UNIT future op', evaluator: evaluator({ op: 'pow', args: [constant(0.5), constant(2)] }) };
  const unsupported = adapt(data); assert.ok(unsupported.pending.some(item => item.classification === 'ENGINE_IMPLEMENTATION' && item.field.includes('evaluator.expression.op')));
});

test('engine START cannot move original coordinates and image layout cannot use materials or omitted crop/anchor authoring', () => {
  for (const mutate of [data => { data.authored.startAuthority.worldPx[0]++; }, data => { data.authored.startAuthority.approvedBy = 'UNKNOWN'; },
    data => { data.authored.imageLayers[0].canonicalAbsolutePath = '/UNIT/approved/materials/soil.png'; }, data => { delete data.authored.imageLayers[0].sourceRect; },
    data => { delete data.authored.imageLayers[0].authoredBy; }, data => { delete data.authored.imageLayers[0].depthY; }, data => { delete data.authored.imageLayers[0].layer; },
    data => { data.authored.imageLayers[0].worldRect = [0, 0, 8193, 8000]; }]) {
    const data = fixture(); mutate(data); const result = adapt(data);
    assert.equal(result.ok, false); assert.equal(result.candidateProject, null); assert.ok(result.errors.length);
  }
  const data = fixture(); data.authored.resourceBindings = {};
  const result = adapt(data); assert.equal(result.candidateProject, null); assert.ok(result.engineAuthoredFields.some(item => item.field === 'engineAuthored.resourceBindings'));
});
