import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseExpressionAt } from 'acorn';

function extract(source, name, constant = false) {
  const anchor = constant ? `const ${name}=` : `function ${name}(`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, anchor);
  const offset = constant ? start + anchor.length : start;
  const end = parseExpressionAt(source, offset, { ecmaVersion: 'latest' }).end;
  return source.slice(start, end) + (constant ? ';' : '');
}

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const pickup = extract(source, 'pickupItem');
  const sounds = ['_EQUIP_SFX_BY_WTYPE', '_EQUIP_SFX_BY_BTYPE', '_PICKUP_SFX_POOL']
    .map(name => extract(source, name, true)).join('\n') + '\n' +
    ['playItemPickupSfx', 'playEquipSfx'].map(name => extract(source, name)).join('\n');

  function runPickup({ full, occupied, rarity = 1, code = pickup }) {
    const existing = { slot: 'weapon', name: 'existing' };
    const item = { slot: 'weapon', rarity, name: 'new' };
    const inventory = { bag: [], equipped: occupied ? { weapon: existing } : {} };
    const calls = [];
    let saves = 0;
    const context = vm.createContext({ INV: inventory, item,
      _itemSz: () => [1, 1], _invFindSpace: () => full ? null : { x: 2, y: 3 },
      notify() {}, _rarName: () => '', _T: x => x, Date: { now: () => 1000 },
      _petSayCD() {}, _petOnFirstLegend() {}, recalcSt() {}, applyStats() {},
      _r: x => x, Math: Object.assign(Object.create(Math), { random: () => 0 }),
      playSample: (...args) => calls.push(args), window: {}, dbSaveForce: () => saves++,
    });
    vm.runInContext(sounds + '\n' + code + '\nglobalThis.result=pickupItem(item);', context);
    return { inventory, item, existing, calls, saves, result: context.result };
  }

  for (const occupied of [false, true]) for (const full of [false, true]) {
    test(`${file}: pickup sound and inventory, occupied=${occupied}, full=${full}`, () => {
      const r = runPickup({ occupied, full });
      const autoEquip = file === 'game-easy-test.html' && !occupied;
      const success = autoEquip || !full;
      assert.equal(r.result, success);
      assert.equal(r.saves, success ? 1 : 0);
      assert.deepEqual(r.calls.map(c => c[0]), success ?
        (autoEquip ? ['pickup_item', 'equip_base'] : ['pickup_item']) : []);
      assert.equal(r.inventory.equipped.weapon, autoEquip ? r.item : occupied ? r.existing : undefined);
      assert.deepEqual(r.inventory.bag, success && !autoEquip ? [r.item] : []);
      if (success && !autoEquip) {
        assert.equal(r.item._gx, 2); assert.equal(r.item._gy, 3); assert.equal(r.item._pickT, 1000);
      } else assert.equal(r.item._gx, undefined);
    });
  }

  test(`${file}: all pickup variants and rarities play once; equipment layers retain volume and pitch`, () => {
    const calls = [];
    let random = 0;
    const context = vm.createContext({ playSample: (...args) => calls.push(args), _r: x => x,
      Math: Object.assign(Object.create(Math), { random: () => random }) });
    vm.runInContext(sounds, context);
    const keys = ['pickup_item', 'pickup_rummage1', 'pickup_rummage2', 'pickup_rummage3', 'pickup_rummage4', 'pickup_rummage5'];
    for (let i = 0; i < keys.length; i++) for (let rarity = 0; rarity <= 5; rarity++) {
      random = (i + 0.5) / keys.length; calls.length = 0;
      context.playItemPickupSfx({ rarity });
      assert.deepEqual(calls, [[keys[i], 0.5, 1]]);
    }
    for (const [item, expected] of [
      [null, []], [{ wtype: 'sword', rarity: 1 }, ['equip_sword']],
      [{ btype: 'crossbow', rarity: 1 }, ['equip_crossbow']],
      [{ wtype: 'unknown', rarity: 1 }, ['equip_base']],
      [{ wtype: 'sword', rarity: 2 }, ['equip_sword', 'equip_rare']],
      [{ rarity: 5 }, ['equip_base', 'equip_rare']],
    ]) {
      calls.length = 0; context.playEquipSfx(item);
      assert.deepEqual(calls, expected.map((key, i) => [key, i ? 0.28 : 0.42, 1]));
    }
  });

  test(`${file}: negative control detects sound played on full-bag refusal`, () => {
    const needle = "INV.bag.pop();notify(_T('가방에 공간이 없습니다!'));return false";
    assert.ok(pickup.includes(needle));
    const mutant = pickup.replaceAll(needle, 'playItemPickupSfx(item);' + needle);
    const r = runPickup({ occupied: true, full: true, code: mutant });
    assert.equal(r.result, false);
    assert.throws(() => assert.deepEqual(r.calls, []), assert.AssertionError);
  });
}
