import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiabloFieldStagePlan } from '../src/diabloFieldStagePlan.js';

test('CH1-1 plan is a south-to-north outdoor field with six readable spaces', () => {
  const plan = buildDiabloFieldStagePlan(0);
  assert.equal(plan.startClock, 6);
  assert.equal(plan.exitClock, 12);
  assert.deepEqual(plan.regions.map((region) => region.role), ['start', 'combat', 'travel', 'combat', 'pocket', 'boss']);
  assert.equal(plan.terrain.navAuthority, 'blueprint.tileRLE');
  assert.ok(plan.regions.every((region) => region.collisionAuthority === 'NAV only'));
});
