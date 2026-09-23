import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiabloFieldBlueprint, decodeFieldRle } from '../src/diabloFieldBlueprint.js';

test('builds a deterministic south-to-north field with broad combat basins', () => {
  const a = buildDiabloFieldBlueprint(6);
  const b = buildDiabloFieldBlueprint(6);
  assert.deepEqual(a, b);
  assert.equal(a.width, 200);
  assert.equal(a.height, 200);
  assert.deepEqual(a.regions.map(({ role }) => role), ['start', 'combat', 'travel', 'combat', 'pocket', 'boss']);
  assert.equal(a.rooms.filter(({ type }) => type === 'start').length, 1);
  assert.equal(a.rooms.filter(({ type }) => type === 'boss').length, 1);
  assert.ok(a.regions.filter(({ role }) => role === 'combat').every(({ rx, ry }) => rx >= 24 && ry >= 18));

  const floorCount = decodeFieldRle(a.tileRLE, 200 * 200).filter(Boolean).length;
  assert.ok(floorCount > 15000);
  assert.ok(floorCount < 30000);
});

test('keeps the 6 o’clock start and 12 o’clock boss approach open', () => {
  const field = buildDiabloFieldBlueprint(0);
  const floor = decodeFieldRle(field.tileRLE, field.width * field.height);
  const at = (x, y) => floor[y * field.width + x];
  assert.equal(at(Math.round(field.start.x), Math.round(field.start.y)), 1);
  assert.equal(at(Math.round(field.bossGate.x), Math.round(field.bossGate.y)), 1);
  for (let y = 12; y <= 38; y++) assert.equal(at(100, y), 1, `north approach blocked at y=${y}`);
});
