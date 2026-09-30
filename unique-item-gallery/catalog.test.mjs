import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ITEMS, getItem, filterItems, UNIQUE_PALETTE } from './catalog.js';

test('22 new items have distinct identities, affix links, and saved art', () => {
  assert.equal(ITEMS.length, 22);
  assert.equal(new Set(ITEMS.map(item => item.id)).size, 22);
  assert.equal(new Set(ITEMS.map(item => item.affixId)).size, 22);
  for (let n = 1; n <= 22; n++) {
    const item = getItem(`UI-${String(n).padStart(2, '0')}`);
    assert.ok(item);
    assert.equal(item.affixId, `U-D${String(n).padStart(2, '0')}`);
    assert.ok(item.name && item.kind && item.effect && item.motif);
    assert.ok(existsSync(fileURLToPath(new URL(item.art, import.meta.url))), `${item.id} missing art`);
  }
  assert.equal(ITEMS.some(item => item.kind === '유골함'), false);
});

test('filters combine category and search without changing the catalog', () => {
  assert.equal(filterItems({ kind: '전체', query: '' }).length, 22);
  assert.equal(filterItems({ kind: '무기', query: '기검참' }).map(item => item.id).join(','), 'UI-03');
  assert.equal(filterItems({ kind: '장신구', query: '존재하지않음' }).length, 0);
  assert.equal(ITEMS.length, 22);
});

test('unique palette is separate from current epic and legendary colors', () => {
  assert.equal(UNIQUE_PALETTE.rarity, 5);
  assert.notEqual(UNIQUE_PALETTE.accent.toLowerCase(), '#bb44ff');
  assert.notEqual(UNIQUE_PALETTE.accent.toLowerCase(), '#ffaa00');
});
