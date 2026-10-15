import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMapWorldPilot } from '../engine/fdg/map-world-pilot.js';
import { validateWorldProject } from '../engine/fdg/world-project.js';
import { WorldRuntime } from '../engine/fdg/world-runtime.js';

const connections = { stages: { ch1_1: { stageId: 'si0/stage0', scene: 'source/composition.json' }, ch1_2: { stageId: 'si1/stage1 (_CH1S1)', name: '뒤틀린 숲길', scene_resource: { basin: { cx: 100, cy: 122 } } } }, entranceExit: { ch1_1_to_ch1_2: { via: 'boss arena -> nextStage -> si1', ch1_2_arrival: { basinCenter: [100,122], entrance: '정확 tile 미명시' } } }, ch1_1_regionGraph: { support: 'DERIVED proposal' }, unknown: { retained: true } };
const height = { sourcePreserved: { highGround: { center: [147,98], heightReturn: '0..1 (물리단위 미확정)' } } };
const refs = { connectionsRef: 'world-connections.corrected-v2.json', heightRef: 'ch1-1-height-ground-nav.corrected-v2.json' };

test('MAP normalization preserves source strings/data without invented production edges or arrival', () => {
  const before = JSON.stringify({ connections, height });
  const world = normalizeMapWorldPilot(connections, height, refs);
  assert.equal(validateWorldProject(world).ok, true);
  assert.equal(world.scope, 'MAP_PILOT');
  assert.deepEqual(world.areas.map(area => area.stageRef), ['si0/stage0', 'si1/stage1 (_CH1S1)']);
  assert.ok(world.areas.every(area => area.areaKey !== area.stageRef && area.entrances[0].position === null));
  assert.ok(world.scenes.every(scene => scene.project === null));
  assert.equal(world.transitions.length, 0);
  assert.equal(world.metadata.normalization.productionRegistration, 0);
  assert.deepEqual(world.metadata.sourceDocuments, { connections, height });
  world.metadata.sourceDocuments.connections.unknown.retained = false;
  assert.equal(JSON.stringify({ connections, height }), before);
});

test('Pending MAP opening fails before pausing or replacing the existing engine scene', async () => {
  const calls = [];
  const owner = { enterScene: () => calls.push('enter'), captureSceneState: () => calls.push('capture'), pause: () => calls.push('pause') };
  const runtime = new WorldRuntime(owner, normalizeMapWorldPilot(connections, height, refs));
  assert.equal((await runtime.open()).reason, 'unresolved-scene');
  assert.deepEqual(calls, []);
  assert.equal(runtime.world.state.regions.map_reference_stage0.visits, 0);
  runtime.dispose();
});

test('Missing MAP stage or source-reference input is rejected', () => {
  assert.throws(() => normalizeMapWorldPilot({}, height, refs), TypeError);
  assert.throws(() => normalizeMapWorldPilot(connections, height), TypeError);
});
