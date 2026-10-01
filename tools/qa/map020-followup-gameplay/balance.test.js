import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { parseExpressionAt } from 'acorn';
import { files, sources, functionSource, between, noop } from './source.mjs';

function rhs(source, anchor) {
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, 'ANCHOR_FAIL ' + anchor);
  const node = parseExpressionAt(source, start + anchor.length, { ecmaVersion: 'latest' });
  return source.slice(node.start, node.end);
}
function setup(source, { mats = 0, sp = 1, level = 100, skillLevel = 1 } = {}) {
  const math = Object.create(Math); math.random = () => 0;
  const env = {
    Math: math, G: { mats }, P: { sp, lv: level, skills: { kiSlash: skillLevel }, x: 0, y: 0 },
    SFX: { levelup: noop, forge: noop, hurt: noop }, _T: x => x, _L: x => x,
    showPH: noop, addTxt: noop, poolPart: noop, notify: noop,
    renderSkillPanel: noop, updateSkSlot: noop, updateQS: noop,
    dbSaveForce: noop, dbSaveNow: noop, renderForge: noop, enhColor: () => 'white',
    _FUSE_PAIRS: {}, _isFused: () => false, it: { enh: 0, rarity: 2 }
  };
  const context = vm.createContext(env);
  vm.runInContext(`const _MALICE_COST_MUL=${rhs(source, 'const _MALICE_COST_MUL=')};`, context);
  for (const name of ['_malCost', '_skillUpSpCost', '_fuseUpSpCost', 'enhCostRaw', 'enhRate', '_itemEconomyRarity', 'enhCost', 'salvageVal', '_skillBatchUp'])
    vm.runInContext(functionSource(source, name), context);
  const data = vm.runInContext(rhs(source, 'const SKILL_LIST='), context);
  const sk = data.find(sk => sk.id === 'kiSlash'); assert.ok(sk && sk.up);
  env.SKILL_LIST = [sk]; env.sk = sk;
  env.slv = skillLevel; env.learned = skillLevel > 0; env._skMaxLv = 20;
  env._skLvLock = Math.min(20, Math.trunc(level / 50) + 1);
  env._singleUpSp = context._skillUpSpCost(skillLevel); env._isFuseUp = false; env._fuseCanUp = false;
  const gate = rhs(source, 'const canUp=');
  const manual = between(source, 'if(slv>=_skMaxLv||slv>=_skLvLock)', 'SFX.levelup();const nlv');
  const clickMarker = "d.onclick=()=>{\n          const {rate:r2,cost:c2}=enhCost(it.enh||0,it.rarity);";
  const clickStart = source.indexOf(clickMarker);
  assert.ok(clickStart >= 0, 'ANCHOR_FAIL exact equipment click handler');
  const click = rhs(source.slice(clickStart), 'd.onclick=');
  return { env, data, context, gate: () => vm.runInContext(gate, context),
    manual: () => vm.runInContext(`(function(){${manual}})()`, context),
    batch: () => context._skillBatchUp(), equipment: () => vm.runInContext(`(${click})()`, context) };
}

for (const file of files) {
  const source = sources[file];
  test(`${file}: actual skill data/free malice gate and exact SP cost`, () => {
    const run = setup(source);
    assert.ok(run.data.filter(sk => sk.up).every(sk => sk.upMat === 0));
    assert.equal(run.context._malCost(0), 0);
    assert.equal(run.context._skillUpSpCost(1), 1);
    assert.equal(run.env.sk.upSp, 5, 'legacy data field is not the current cost function');
    assert.equal(run.gate(), true);
    run.manual();
    assert.deepEqual({ ...run.env.P.skills }, { kiSlash: 2 });
    assert.equal(run.env.G.mats, 0); assert.equal(run.env.P.sp, 0);
  });
  test(`${file}: zero/below/exact SP and manual level lock`, () => {
    for (const sp of [0, 1]) {
      const run = setup(source, { sp });
      assert.equal(run.gate(), sp === 1); run.manual();
      assert.equal(run.env.P.skills.kiSlash, sp === 1 ? 2 : 1);
      assert.equal(run.env.P.sp, 0); assert.equal(run.env.G.mats, 0);
    }
    const locked = setup(source, { level: 49, sp: 100 });
    assert.equal(locked.gate(), false); locked.manual();
    assert.equal(locked.env.P.skills.kiSlash, 1); assert.equal(locked.env.P.sp, 100);
  });
  test(`${file}: actual batch zero malice/sp exhaustion/level boundary`, () => {
    for (const [sp, expectedLevel, expectedSp] of [[0, 1, 0], [1, 2, 0], [2, 3, 0], [100, 3, 98]]) {
      const run = setup(source, { sp }); run.batch();
      assert.equal(run.env.P.skills.kiSlash, expectedLevel);
      assert.equal(run.env.P.sp, expectedSp); assert.equal(run.env.G.mats, 0);
    }
  });
  test(`${file}: exact equipment onclick rejects 0/14999 and spends 15000`, () => {
    for (const mats of [0, 14999, 15000]) {
      const run = setup(source, { mats });
      assert.equal(run.context.enhCost(0, 2).cost, 15000);
      run.equipment();
      assert.equal(run.env.G.mats, mats < 15000 ? mats : 0);
      assert.equal(run.env.it.enh, mats < 15000 ? 0 : 1);
    }
  });
  test(`${file}: exact raw cost and legacy refund discrepancy preserved`, () => {
    const run = setup(source);
    assert.equal(run.context.enhCostRaw(1000), 5280000);
    let spent = 0; for (let n = 0; n < 10; n++) spent += run.context.enhCost(n, 2).cost;
    const refund = run.context.salvageVal({ enh: 10, rarity: 2 }) - run.context.salvageVal({ enh: 0, rarity: 2 });
    assert.equal(spent, 268125); assert.equal(refund, 15);
    assert.notEqual(refund, Math.floor(spent / 2));
    console.log(JSON.stringify({ file, upSpData: run.env.sk.upSp, actualUpSp: run.context._skillUpSpCost(1), spent, refund }));
  });
}
