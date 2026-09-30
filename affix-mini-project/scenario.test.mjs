import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseCandidates } from './model.js';
import { SCENARIOS, createRun, advanceRun } from './scenario.js';

const markdown = await readFile(new URL('../docs/7아이템디자인/유니크_어픽스_리스트.md', import.meta.url), 'utf8');
const candidates = new Map(parseCandidates(markdown).map((entry) => [entry.id, entry]));

function complete(id, value) {
  let run = createRun(candidates.get(id), value);
  for (let index = 0; index < SCENARIOS[id].steps.length; index++) run = advanceRun(run);
  return run;
}

test('only the eight prioritized candidate ids have executable loop scenarios', () => {
  assert.deepEqual(Object.keys(SCENARIOS).sort(),
    ['U-D03', 'U-D05', 'U-D09', 'U-D10', 'U-D12', 'U-D13', 'U-D14', 'U-D17'].sort());
});

test('top roll scenarios apply their documented caps and costs once', () => {
  assert.equal(complete('U-D03', 40).metrics.remainingCharge, 80);
  assert.equal(complete('U-D05', 30).metrics.mobility, 27);
  assert.equal(complete('U-D09', 40).metrics.mobility, 87);
  assert.equal(complete('U-D10', 20).metrics.rage, 20);
  assert.equal(complete('U-D12', 120).metrics.domeCooldown, 1500);
  assert.equal(complete('U-D13', 40).metrics.childTick, 40);
  assert.equal(complete('U-D14', 40).metrics.pulseDamage, 40);
  assert.equal(complete('U-D17', 3).metrics.movedZones, 3);
});

test('black repositions selected attack zones but leaves the shock field outside its pool', () => {
  const run = complete('U-D17', 2);
  assert.equal(run.metrics.movedZones, 2);
  assert.equal(run.metrics.shockZones, 1);
  assert.equal(run.metrics.manaCost, 30);
});

test('a completed sequence cannot trigger its affix again', () => {
  const run = complete('U-D13', 40);
  assert.equal(advanceRun(run), run);
  assert.equal(run.events.length, SCENARIOS['U-D13'].steps.length);
});
