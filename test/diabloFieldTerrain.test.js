import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiabloFieldBlueprint } from '../src/diabloFieldBlueprint.js';
import { buildDiabloTerrainPlan } from '../src/diabloFieldTerrain.js';

test('terrain plan keeps visual terrain separate from NAV and emits streamed master chunks', () => {
  const field = buildDiabloFieldBlueprint(0);
  const terrain = buildDiabloTerrainPlan(field, 'rotten_forest');

  assert.equal(terrain.baseTexture, 'assets/map/shared/diablo_field_base_cold_v1.png');
  assert.deepEqual(terrain.layers.map(({ id }) => id), ['base', 'ground', 'back', 'mid', 'front']);
  assert.equal(terrain.chunks.length, 64);
  assert.ok(terrain.chunks.every(({ core, bleed }) => core === 1024 && bleed === 1));
  assert.ok(terrain.outerMasses.every(({ collision }) => collision === false));
  assert.equal(terrain.navAuthority, 'blueprint.tileRLE');
});
