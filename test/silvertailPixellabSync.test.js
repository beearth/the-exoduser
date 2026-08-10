import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SILVERTAIL_DIRECTIONS,
  buildSilvertailFramePlan,
  clockFileForGameDirection,
  pixelLabDirectionForGame,
} from '../src/silvertailPixellabSync.js';

test('Silvertail uses clock-named files while retaining the warrior direction row order', () => {
  assert.deepEqual(SILVERTAIL_DIRECTIONS, [
    'south', 'south-east', 'east', 'north-east',
    'north', 'north-west', 'west', 'south-west',
  ]);
  assert.equal(pixelLabDirectionForGame('south-east'), 'south-west');
  assert.equal(pixelLabDirectionForGame('south-west'), 'south-east');
  assert.equal(pixelLabDirectionForGame('east'), 'east');
  assert.equal(pixelLabDirectionForGame('west'), 'west');
  assert.equal(pixelLabDirectionForGame('north-east'), 'north-east');
  assert.equal(pixelLabDirectionForGame('north-west'), 'north-west');
  assert.deepEqual(SILVERTAIL_DIRECTIONS.map(clockFileForGameDirection), ['6', '5', '3', '1', '12', '11', '9', '7']);
  const plan = buildSilvertailFramePlan('south-east', 8);
  assert.deepEqual(plan.slice(0, 2), [
    { type: 'walk', direction: 'south-west', frame: 0 },
    { type: 'walk', direction: 'south-west', frame: 0 },
  ]);
  assert.deepEqual(plan.slice(2), Array.from({ length: 8 }, (_, frame) => ({ type: 'walk', direction: 'south-west', frame })));

  const eastPlan = buildSilvertailFramePlan('east', 8);
  assert.deepEqual(eastPlan.slice(0, 2), [
    { type: 'walk', direction: 'east', frame: 0 },
    { type: 'walk', direction: 'east', frame: 0 },
  ]);
  assert.deepEqual(eastPlan.slice(2), Array.from({ length: 8 }, (_, frame) => ({ type: 'walk', direction: 'east', frame })));

  const northWestPlan = buildSilvertailFramePlan('north-west', 8);
  assert.deepEqual(northWestPlan.slice(0, 2), [
    { type: 'walk', direction: 'north-west', frame: 0 },
    { type: 'walk', direction: 'north-west', frame: 0 },
  ]);
  assert.deepEqual(northWestPlan.slice(2), Array.from({ length: 8 }, (_, frame) => ({ type: 'walk', direction: 'north-west', frame })));

  const westPlan = buildSilvertailFramePlan('west', 8);
  assert.deepEqual(westPlan.map((frame) => frame.direction), Array(10).fill('west'));
});
