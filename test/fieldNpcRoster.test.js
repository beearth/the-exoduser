import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCh1FieldNpcRoster, getNpcInteraction } from '../src/fieldNpcRoster.js';

test('CH1 field roster positions three NPCs in distinct readable field roles', () => {
  const roster = buildCh1FieldNpcRoster();
  assert.deepEqual(roster.map((npc) => npc.role), ['merchant', 'survivor', 'guide']);
  assert.ok(roster.every((npc) => npc.collision === false));
  assert.ok(roster[0].y > roster[1].y && roster[1].y > roster[2].y);
});

test('NPC interaction exposes a safe dialogue and declared gameplay hook', () => {
  const roster = buildCh1FieldNpcRoster();
  const merchant = getNpcInteraction(roster, 'ch1-merchant');
  assert.equal(merchant.action, 'open_shop');
  assert.match(merchant.lines[0], /길/);
});
