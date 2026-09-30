import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function upgradeCosts(file) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const maliceStart = source.indexOf('const _MALICE_COST_MUL=');
  const maliceEnd = source.indexOf('function enhCostRaw(', maliceStart);
  assert.ok(maliceStart >= 0 && maliceEnd > maliceStart, `${file}: live malice cost exists`);
  const malCost = new Function(`${source.slice(maliceStart, maliceEnd)}; return _malCost;`)();

  const manualGate = source.match(/^    const canUp=(.+);$/m)?.[1];
  const autoGate = source.match(/const _matGate=([^;]+);/m)?.[1];
  const autoCharge = source.match(/const _matChg=([^;]+);/m)?.[1];
  const clickCharge = source.match(/,_upMat=([^;]+);if\(P\.sp</m)?.[1];
  assert.ok(manualGate && autoGate && autoCharge && clickCharge,
    `${file}: both upgrade gates and charges exist`);

  return {
    malCost,
    manual(sk, mats) {
      const evaluate = new Function('sk', 'G', '_malCost', 'learned', 'slv', '_skMaxLv',
        '_skLvLock', 'P', '_singleUpSp', '_isFuseUp', '_fuseCanUp', `return ${manualGate};`);
      return evaluate(sk, {mats}, malCost, true, 1, 20, 20, {sp: 100}, 5, false, false);
    },
    automatic(sk) {
      const evaluate = expression => new Function('sk', '_malCost', `return ${expression};`)(sk, malCost);
      return {gate: evaluate(autoGate), charge: evaluate(autoCharge)};
    },
    clickCharge(sk) {
      return new Function('sk', '_malCost', `return ${clickCharge};`)(sk, malCost);
    },
  };
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: zero-malice skill upgrade remains available with zero malice`, () => {
    const costs = upgradeCosts(file);
    const free = {up: true, upMat: 0};
    assert.equal(costs.clickCharge(free), 0);
    assert.deepEqual(costs.automatic(free), {gate: 0, charge: 0});
    assert.equal(costs.manual(free, 0), true);
  });

  test(`${file}: paid upgrade gates match actual charge at the boundary`, () => {
    const costs = upgradeCosts(file);
    const paid = {up: true, upMat: 100};
    const charge = costs.clickCharge(paid);
    assert.equal(charge, 50);
    assert.deepEqual(costs.automatic(paid), {gate: charge, charge});
    assert.equal(costs.manual(paid, charge - 1), false);
    assert.equal(costs.manual(paid, charge), true);
  });
}
