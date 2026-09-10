import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function fn(name) {
  const start = html.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  let depth = 0;
  for (let i = html.indexOf('{', start); i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  assert.fail(name);
}

test('level-one characters start with Wing Strike equipped and fused for free', () => {
  const p = vm.runInNewContext(`${fn('mkP')};mkP()`);
  assert.equal(p.lv, 1);
  assert.equal(p.skills.maliceSwipe, 1);
  assert.equal(p.skills.shieldThrow, 1);
  assert.equal(p._fused.shieldFuse, true);
  assert.equal(p.activeRMBSk, 'maliceSwipe');
  assert.equal(p.sp, 0);
});

test('old saves gain the base skill without downgrading learned skills or spending resources', () => {
  const ensure = vm.runInNewContext(`${fn('_ensureBaseWingStrike')};_ensureBaseWingStrike`);
  for (const p of [{ skills: {}, sp: 5 }, { skills: { maliceSwipe: 7, shieldThrow: 3 }, _fused: { boneStorm: true }, sp: 99 }]) {
    const before = structuredClone(p);
    ensure(p); ensure(p);
    assert.equal(p.skills.maliceSwipe, before.skills.maliceSwipe || 1);
    assert.equal(p.skills.shieldThrow, before.skills.shieldThrow || 1);
    assert.equal(p._fused.shieldFuse, true);
    assert.equal(p.sp, before.sp);
    if (before._fused) assert.equal(p._fused.boneStorm, true);
  }
});

test('save normalization restores the default fusion and keeps other saved state', () => {
  const ctx = vm.createContext({ P: { skills: { maliceSwipe: 4 }, sp: 7, ap: 3 }, G: { mats: 9 },
    _FUSE_GEM_GROUPS: { shieldFuse: { skills: ['maliceSwipe', 'shieldThrow'] } } });
  vm.runInContext(fn('_ensureBaseWingStrike') + fn('_sanitizeCoreState'), ctx);
  ctx._sanitizeCoreState();
  assert.equal(ctx.P.skills.maliceSwipe, 4);
  assert.equal(ctx.P.skills.shieldThrow, 1);
  assert.equal(ctx.P._fused.shieldFuse, true);
  assert.deepEqual([ctx.P.sp, ctx.P.ap, ctx.G.mats], [7, 3, 9]);
});

test('each E skill level adds 5% of the level-one range and charge multiplies it', () => {
  const ctx = vm.createContext({ P: { lv: 99, skills: {} }, sh: () => ({ bonusRange: 0 }) });
  vm.runInContext(fn('_wingStrikeLevel') + fn('_eSkillRangeMul') + fn('_eSwingRadius'), ctx);
  for (const [lv, mul] of [[1, 1], [2, 1.05], [5, 1.2], [10, 1.45]]) {
    ctx.P.skills = { maliceSwipe: lv, shieldThrow: lv };
    assert.equal(ctx._eSkillRangeMul(), mul);
    assert.equal(ctx._eSwingRadius(1), Math.trunc(70 * mul));
    assert.equal(ctx._eSwingRadius(3), Math.trunc(70 * mul * 3));
  }
  ctx.P.skills = { maliceSwipe: 7, shieldThrow: 3 };
  assert.equal(ctx._eSkillRangeMul(), 1.1, 'fusion level follows the lower component');
});

test('level growth reaches E collision range while Q retains its original range', () => {
  const ctx = vm.createContext({ P: { s: 'sBash', _sBashChgMul: 3,
    skills: { maliceSwipe: 5, shieldThrow: 5 } } });
  vm.runInContext(fn('_wingStrikeLevel') + fn('_eSkillRangeMul'), ctx);
  const expr = html.match(/const _chgMP=([^;]+);/)[1];
  assert.equal(vm.runInContext(expr, ctx), 3 * 1.2);
  ctx.P.s = 'sBlock';
  assert.equal(vm.runInContext(expr, ctx), 1);
});

test('E hold reaches charge stages at 0.5/1/1.5 seconds and releases at 1.55', () => {
  const start = html.indexOf("case 'sDraw':{");
  const end = html.indexOf("case 'sBlock':{", start);
  const code = `switch(P.s){${html.slice(start, end)}}`;
  const noop = () => {};
  const ctx = vm.createContext({
    P: { s: 'sDraw', skills: {}, speed: 0, x: 0, y: 0, r: 15 }, sp: 1,
    isHeld: () => true, isAct: () => false, useStPct: () => true, canMv: () => true,
    playSample: noop, addTxt: noop, _T: x => x, shake: noop, doHitFlash: noop,
    poolPart: noop, _kgRelease: (tier, mul) => { ctx.released = { tier, mul }; ctx.P.s = 'sBash'; },
  });
  for (let frame = 1; frame <= 93; frame++) {
    vm.runInContext(code, ctx);
    if ([30, 60, 90].includes(frame)) {
      assert.equal(ctx.P._kgTier, frame / 30);
      assert.equal(ctx.released, undefined);
    }
    if (frame === 92) assert.equal(ctx.released, undefined);
  }
  assert.deepEqual(ctx.released, { tier: 3, mul: 3 });
});

test('a fresh character casts a wave; level growth enlarges its distance and width', () => {
  const noop = () => {};
  const ctx = vm.createContext({
    P: {}, G: {}, INV: { equipped: { shield: {} } },
    sh: () => ({ atk: 3 }), pShieldMul: () => 1, statStr: () => 1, _fuseMul: () => 1,
    _addSkProf: noop, shake: noop, poolPart: noop,
  });
  vm.runInContext(fn('mkP') + fn('_isFused') + fn('_wingStrikeLevel') + fn('_eSkillRangeMul') + fn('_autoShieldThrow'), ctx);
  const waves = [];
  for (const lv of [1, 2, 10]) {
    ctx.P = ctx.mkP(); ctx.P.skills.maliceSwipe = ctx.P.skills.shieldThrow = lv;
    ctx._autoShieldThrow();
    waves.push(ctx.G._stProjs.at(-1));
  }
  for (const [i, mul] of [[0, 1], [1, 1.05], [2, 1.45]]) {
    assert.equal(waves[i].wave, true);
    assert.equal(waves[i].maxDist, 210 * mul);
    assert.equal(waves[i].w, 95 * mul);
    assert.equal(waves[i].r, 50 * mul);
  }
});

test('base Wing Strike reset refunds only upgrades and keeps its free level', () => {
  const ctx = vm.createContext({ P: {}, _skillUpSpCost: () => 1 });
  vm.runInContext(fn('_fuseUpSpCost') + fn('_wingStrikeLevel') + fn('_resetWingStrikeUpgrades'), ctx);
  ctx.P = { skills: { maliceSwipe: 3, shieldThrow: 3 }, _fused: { shieldFuse: true }, sp: 0 };
  assert.equal(ctx._resetWingStrikeUpgrades(), 4);
  assert.equal(ctx.P.sp, 4);
  assert.equal(ctx.P.skills.maliceSwipe, 1);
  assert.equal(ctx.P.skills.shieldThrow, 1);
  assert.equal(ctx.P._fused.shieldFuse, true);
  assert.equal(ctx._resetWingStrikeUpgrades(), 0);
  assert.equal(ctx.P.sp, 4, 'repeated resets cannot create SP from the free starter skill');
});
