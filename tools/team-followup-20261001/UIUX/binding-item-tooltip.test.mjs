import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'acorn';
import { createNewIdentifiedD10Instance, readD10Binding, restoreD10Instance } from '../ITEM/binding-ports.mjs';
import { D10_BINDING_SCHEMA } from '../ITEM/binding-d10.mjs';
import { describeItemBoundD10Tooltip } from './binding-item-tooltip.mjs';
import { mountStoredD10Tooltip } from './binding-tooltip.mjs';
import { describeD10Tooltip } from '../../../unique-item-project/d10-tooltip.js';
import { lookupRoll } from '../../../unique-item-project/roll-values.js';

const base = { uniqueId: 'UI-10', slot: 'armor', name: '새 제안 흉갑', rarity: 5, uniqueSpecial: null, affixes: [{ value: 0.375 }] };
const proposal = lookupRoll('UI-10');
function leaf() {
  return { children: [], textContent: '', setAttribute(name, value) { this[name] = value; } };
}
function assertRejected(item, kind) {
  const before = structuredClone(item);
  const binding = readD10Binding(item);
  assert.equal(binding.kind, kind);
  for (const language of ['ko', 'en']) {
    const result = describeItemBoundD10Tooltip(item, language);
    assert.equal(result.kind, kind);
    assert.equal(result.tooltip, null);
    assert.equal(result.active, false);
    const target = leaf();
    mountStoredD10Tooltip(target, result);
    assert.doesNotMatch(target.textContent, /10~20%|10%|15%|20%|지옥강타|Hell Slam|복원|restore/);
  }
  assert.deepEqual(item, before);
}

for (let raw = 10; raw <= 20; raw++) test(`actual ITEM create -> JSON -> restore -> read -> tooltip: roll ${raw}, KO/EN, RNG1`, () => {
  let calls = 0;
  const before = structuredClone(base);
  const count = proposal.max - proposal.min + 1;
  const created = createNewIdentifiedD10Instance(base, () => {
    calls++;
    return (raw - proposal.min + 0.5) / count;
  });
  assert.equal(calls, 1);
  assert.deepEqual(base, before);
  const serialized = JSON.stringify(created);
  const loaded = JSON.parse(serialized);
  const restored = restoreD10Instance(loaded);
  assert.equal(restored, loaded);
  Object.freeze(restored[D10_BINDING_SCHEMA.field]);
  Object.freeze(restored);
  const binding = readD10Binding(restored);
  assert.equal(binding.kind, 'proposal');
  assert.equal(binding.version, D10_BINDING_SCHEMA.version);
  assert.equal(binding.runtimeReady, false);
  assert.equal(binding.stored, raw / 100);
  for (let repeat = 0; repeat < 3; repeat++) {
    for (const language of ['ko', 'en']) {
      const result = describeItemBoundD10Tooltip(restored, language);
      assert.equal(result.kind, 'proposal');
      assert.equal(result.active, false);
      assert.deepEqual(result.tooltip, describeD10Tooltip(raw, language));
      const target = leaf();
      mountStoredD10Tooltip(target, result);
      assert.ok(target.textContent.includes(`${raw}%`));
      assert.doesNotMatch(target.textContent, /0\.1|0\.2/);
      assert.match(target.textContent, language === 'ko' ? /미채택·비활성.*게임 효과가 아닙/ : /unaccepted and inactive.*not an active game effect/);
    }
  }
  assert.equal(calls, 1);
  assert.equal(JSON.stringify(restored), serialized);
});

test('actual ITEM reader classifies legacy/missing instances; tooltip never invents a midpoint roll', () => {
  for (const legacy of [{}, { slot: 'armor', rarity: 5, uniqueSpecial: { value: 0.2 } }, { slot: 'ossuary', unique: true, uniqueSpecial: null }]) assertRejected(legacy, 'legacy');
  assertRejected({ uniqueId: 'UI-10', slot: 'armor', name: '저장 롤 없는 제안' }, 'missing');
});

test('actual API rejects schema version/unit/status-shape violations without showing a normal effect', () => {
  const good = createNewIdentifiedD10Instance(base, () => 0.5);
  const field = D10_BINDING_SCHEMA.field;
  for (const patch of [
    { version: D10_BINDING_SCHEMA.version + 1 }, { version: 0 }, { version: '1' },
    { unit: 'percent' }, { unit: null }, { effectId: 'U-D11' }, { stat: 'wrong' }
  ]) assertRejected({ ...good, [field]: { ...good[field], ...patch } }, 'invalid');
  for (const binding of [null, [], 'proposal', { status: D10_BINDING_SCHEMA.status }]) assertRejected({ ...good, [field]: binding }, 'invalid');
});

test('actual API rejects invalid stored values/identity/slot and does not mutate legacy saves', () => {
  const good = createNewIdentifiedD10Instance(base, () => 0.5);
  const field = D10_BINDING_SCHEMA.field;
  for (const storedValue of [undefined, null, '0.15', 15, 0.09, 0.21, 0.105, NaN, Infinity, 0.15000000000000002]) assertRejected({ ...good, [field]: { ...good[field], storedValue } }, 'invalid');
  for (const patch of [{ uniqueId: 'UI-99' }, { uniqueId: '' }, { uniqueId: 10 }, { uniqueId: 'UI-09', slot: 'bracelet' }, { slot: 'weapon' }]) assertRejected({ ...good, ...patch }, 'invalid');
  const onlyOldStat = { uniqueId: 'UI-10', slot: 'armor', _uSlamEmberRage: 0.2 };
  assertRejected(onlyOldStat, 'missing');
});

test('production adapter directly imports ITEM API with no persistence/schema inference or enabling', () => {
  const source = readFileSync(new URL('./binding-item-tooltip.mjs', import.meta.url), 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  assert.deepEqual(ast.body.filter(node => node.type === 'ImportDeclaration').map(node => node.source.value), ['../ITEM/binding-ports.mjs', './binding-tooltip.mjs']);
  assert.match(source, /createStoredD10TooltipConsumer\(readD10Binding\)/);
  assert.doesNotMatch(source, /uniqueRoll|version|fraction|status|Math\.random|localStorage|enabled|createNew/);
});
