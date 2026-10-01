import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoredD10TooltipConsumer, mountStoredD10Tooltip } from './binding-tooltip.mjs';
import { describeD10Tooltip } from '../../../unique-item-project/d10-tooltip.js';

const item = Object.freeze({ uniqueId: 'UI-10', slot: 'armor', name: '사용자 저장 이름', uniqueSpecial: Object.freeze({ old: 7 }) });
function descriptor(stored) {
  return Object.freeze({ kind: 'proposal', uniqueId: 'UI-10', effectId: 'U-D10', stored });
}
function assertFallback(result, kind) {
  assert.equal(result.kind, kind);
  assert.equal(result.tooltip, null);
  assert.equal(result.active, false);
  assert.doesNotMatch(result.text, /10~20%|Hell Slam|지옥강타|복원|restore/);
}

test('opaque instance reader port consumes stored values and reuses real D10 tooltip without choosing save fields', () => {
  const before = JSON.stringify(item);
  for (let raw = 10; raw <= 20; raw++) {
    let reads = 0;
    const reader = createStoredD10TooltipConsumer(received => {
      assert.equal(received, item);
      reads++;
      return descriptor(raw / 100);
    });
    for (const language of ['ko', 'en']) {
      const result = reader(item, language);
      assert.equal(result.kind, 'proposal');
      assert.equal(result.active, false);
      assert.deepEqual(result.tooltip, describeD10Tooltip(raw, language));
      assert.ok(result.text.includes(`${raw}%`));
      assert.doesNotMatch(result.text, /0\.1|0\.2/);
    }
    assert.equal(reads, 2);
  }
  assert.equal(JSON.stringify(item), before);
});

test('missing dependency has explicit pending status and never falls back to default midpoint 15', () => {
  assertFallback(createStoredD10TooltipConsumer()(item), 'dependency-pending');
  assert.throws(() => createStoredD10TooltipConsumer(null), TypeError);
});

test('legacy and malformed instances never call binding reader or display normal D10 effect', () => {
  let reads = 0;
  const consume = createStoredD10TooltipConsumer(() => { reads++; return descriptor(0.15); });
  for (const legacy of [{}, { rarity: 5, uniqueSpecial: { old: 8 } }, { slot: 'ossuary', unique: true }]) {
    const before = JSON.stringify(legacy);
    assertFallback(consume(legacy), 'legacy');
    assert.equal(JSON.stringify(legacy), before);
  }
  for (const invalid of [null, undefined, [], 3, { uniqueId: null }, { uniqueId: '' }, { uniqueId: 'UI-99', slot: 'armor' }, { uniqueId: 'UI-09', slot: 'bracelet' }, { uniqueId: 'UI-10', slot: 'weapon' }]) assertFallback(consume(invalid), 'invalid');
  assert.equal(reads, 0);
});

test('reader missing/invalid/legacy statuses and invalid descriptors are fail-closed', () => {
  for (const kind of ['legacy', 'missing', 'invalid']) {
    for (const language of ['ko', 'en']) assertFallback(createStoredD10TooltipConsumer(() => ({ kind }))(item, language), kind);
  }
  for (const binding of [null, undefined, {}, [], Promise.resolve(descriptor(0.15)), { ...descriptor(0.15), kind: 'active' }, { ...descriptor(0.15), uniqueId: 'UI-11' }, { ...descriptor(0.15), effectId: 'U-D11' }]) assertFallback(createStoredD10TooltipConsumer(() => binding)(item), 'invalid');
  assertFallback(createStoredD10TooltipConsumer(() => { throw new Error('reader unavailable'); })(item), 'invalid');
});

test('noncanonical stored values and values missing from binding cannot become a default normal roll', () => {
  for (const stored of [undefined, null, '', '0.15', 15, 0.09, 0.21, 0.105, NaN, Infinity, -Infinity, 0.15000000000000002]) {
    for (const language of ['ko', 'en']) assertFallback(createStoredD10TooltipConsumer(() => descriptor(stored))(item, language), 'invalid');
  }
});

test('JSON roundtrip fixture consumes unchanged instance without RNG, mutation or save field inference', () => {
  const saved = JSON.stringify(item);
  const loaded = JSON.parse(saved);
  const storedBindings = new WeakMap([[loaded, descriptor(0.2)]]);
  const consume = createStoredD10TooltipConsumer(instance => storedBindings.get(instance));
  assert.equal(consume(loaded).tooltip.raw, 20);
  assert.equal(JSON.stringify(loaded), saved);
  assertFallback(consume(item), 'invalid');
});

test('leaf consumer includes inactive proposal disclaimer and does not replace parent DOM', () => {
  const consume = createStoredD10TooltipConsumer(() => descriptor(0.1));
  const leaf = { children: [], textContent: '', setAttribute(name, value) { this[name] = value; } };
  mountStoredD10Tooltip(leaf, consume(item));
  assert.match(leaf.textContent, /10%.*미채택·비활성.*게임 효과가 아닙/);
  assert.doesNotMatch(leaf.textContent, /0\.1/);
  assert.equal(leaf['data-binding-state'], 'proposal');
  mountStoredD10Tooltip(leaf, createStoredD10TooltipConsumer()(item));
  assert.doesNotMatch(leaf.textContent, /10%|15%|20%/);
  assert.throws(() => mountStoredD10Tooltip({ children: [{}] }, consume(item)), TypeError);
});

test('unsupported language is rejected explicitly', () => {
  assert.throws(() => createStoredD10TooltipConsumer()(item, 'fr'), RangeError);
});
