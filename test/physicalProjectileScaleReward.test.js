import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createCanvas, loadImage } from 'canvas';
import { fileURLToPath } from 'node:url';

const source = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function fn(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  let depth = 0;
  for (let i = source.indexOf('{', start); i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  assert.fail(`incomplete ${name}`);
}
function runtime() {
  const noop = () => {};
  const ctx = vm.createContext({
    EL: { P: 0 }, ELC: [],
    P: { x: 0, y: 0, s: 'sBash', skills: {}, iframes: 0,
      hp: 0, mp: 0, st: 0, mhp: 10000, mmp: 10000, mst: 10000, rage: 0, poise: 0 },
    G: { mats: 0 }, OPT: { shake: 100, hitStop: 100 }, _HS: { parry: 1 }, PASSIVES: {},
    _harpGauge: 0, _HARP_GAUGE_MAX: 1000, _rageMax: () => 1000,
    _eqAffix: () => 0, _uEq: () => 0, _skyCrusherChargeCount: () => 3,
    _petOnParry: noop, playSample: noop, _r: () => 1, _gpVibrate: noop,
    _petSayCD: noop, addTxt: noop, _T: x => x, window: {},
    _TVFX2_COMBOS: [null, null, { layers: [] }], _tvfx2Imgs: {},
    _addBoom: noop, _rainbowImpact: noop, _dark02Impact: noop,
    SFX: { deflect: noop }, doHitFlash: noop, poolPart: noop, showPH: noop,
  });
  vm.runInContext(fn('_projectileParryClass') + fn('_physicalProjectileMultiplier') + fn('doParry'), ctx);
  return ctx;
}

test('hostile physical bodies are 2x, including piercing and element-colored titan eyes', () => {
  const ctx = runtime();
  const expression = source.match(/const _sSc=([^;]+);/)[1];
  for (const p of [{ el: 0 }, { el: 0, redBean: true }, { el: 0, pierce: true },
    { el: 1, titanEye: true }, { bwBean: true }, { el: 1, parryClass: 'physical' }]) {
    ctx.p = p; ctx._ps = 2;
    assert.equal(vm.runInContext(expression, ctx), 4);
    assert.equal(p.sz, undefined, 'rendering must not change the collision size');
  }
  for (const p of [{ el: 1, redBean: true }, { el: 0, blackBean: true },
    { el: 0, fbEnergy: true }, { el: 0, trap: true },
    { friendly: true, parryClass: 'physical', blueBean: true }]) {
    ctx.p = p; ctx._ps = 2;
    assert.equal(vm.runInContext(expression, ctx), 2);
  }
});

for (const [label, el, expected, gauge, mats] of [
  ['red physical', 'red', 45, 15, 1500], ['ordinary physical', 0, 90, 30, 3000],
]) test(`${label} parry triples HP/MP/ST, harp, rage and malice`, () => {
  const ctx = runtime();
  ctx.doParry(10, 0, 0, false, el, ctx._physicalProjectileMultiplier({ el: 0 }));
  assert.deepEqual([ctx.P.hp, ctx.P.mp, ctx.P.st], [expected, expected, expected]);
  assert.equal(ctx._harpGauge, gauge);
  assert.equal(ctx.P.rage, gauge);
  assert.equal(ctx.G.mats, mats);
  assert.equal(ctx.P.poise, 1);
});

test('resource caps and existing gear/passive multiplication still apply', () => {
  const ctx = runtime();
  ctx.PASSIVES.pRegen = 2;
  ctx._eqAffix = key => key === 'parryBonus' ? 0.5 : 0;
  ctx.doParry(10, 0, 0, false, 0, 3);
  assert.equal(ctx.P.hp, Math.trunc(30 * 1.5 * 1.4 * 3));
  ctx.P.hp = ctx.P.mhp - 1; ctx.P.mp = ctx.P.mmp - 1; ctx.P.st = ctx.P.mst - 1;
  ctx.P.rage = 999; ctx._harpGauge = 999;
  ctx.doParry(10, 0, 0, false, 'red', 3);
  assert.deepEqual([ctx.P.hp, ctx.P.mp, ctx.P.st], [10000, 10000, 10000]);
  assert.equal(ctx.P.rage, 1000); assert.equal(ctx._harpGauge, 1000);
});

test('melee, magic Q and large energy rewards retain their existing values', () => {
  for (const [isQ, el, mul, expected] of [[false, 0, undefined, 30],
    [true, 1, undefined, 50], [true, 'rainbow', undefined, 75], [true, 1, 10, 500]]) {
    const ctx = runtime();
    ctx.doParry(10, 0, 0, isQ, el, mul);
    assert.equal(ctx.P.hp, expected);
  }
});

test('druid skin doubles only the original physical projectile, not magic or mines', () => {
  const ctx = runtime();
  const sizes = [];
  ctx._fdFlyImg = { complete: true, naturalWidth: 400 };
  ctx._druidPoisonFly = { width: 400, height: 400 };
  ctx.performance = { now: () => 0 };
  ctx.X = { save() {}, restore() {}, drawImage(...args) { sizes.push(args.slice(-2)); } };
  vm.runInContext(fn('_drawDruidPoisonShot'), ctx);
  for (const parryClass of ['physical', 'magic']) {
    ctx._drawDruidPoisonShot({ x: 0, y: 0, sz: 4, _druidPoison: true, parryClass }, 1);
  }
  ctx._drawDruidPoisonShot({ x: 0, y: 0, sz: 4, _druidMine: true, mine: true }, 1);
  assert.deepEqual(sizes, [[192, 192], [96, 96], [240, 240]]);
});

test('actual mouth and titan sprite draw calls grow both dimensions by exactly 2', async () => {
  const ctx = runtime();
  ctx._physMouthImg = await loadImage(fileURLToPath(new URL('../img/proj_phys_mouth.png', import.meta.url)));
  ctx._titanEyeImg = await loadImage(fileURLToPath(new URL('../img/proj_titan_eye.png', import.meta.url)));
  Object.assign(ctx, { _physMouthReady: true, _titanEyeReady: true, _gameFrame: 0,
    _PHYS_MOUTH_FW: 768, _PHYS_MOUTH_FH: 384, _PHYS_MOUTH_N: [8, 6, 6], _now: 0, fa: 1 });
  const canvas = createCanvas(800, 400), X = canvas.getContext('2d'), sizes = [];
  const draw = X.drawImage.bind(X);
  X.drawImage = (...args) => { sizes.push(args.slice(-2)); draw(...args); };
  ctx.X = X;
  vm.runInContext(fn('_drawPhysMouth'), ctx);
  const start = source.indexOf('const _ps=Math.max(1.2,Math.min(4.0,(p.sz||1)*1.5))*.7;');
  const end = source.indexOf('if(p.blackBean){', start);
  const render = `for(const p of bullets){${source.slice(start, end)}}`;
  const multiplier = ctx._physicalProjectileMultiplier;
  for (const titanEye of [false, true]) {
    const p = { x: 300, y: 200, vx: 5, vy: 0, sz: 2, r: 4, dmg: 10, el: 0, redBean: true, titanEye };
    ctx.bullets = [p];
    ctx._physicalProjectileMultiplier = () => 1;
    vm.runInContext(render, ctx);
    ctx._physicalProjectileMultiplier = multiplier;
    vm.runInContext(render, ctx);
    const [before, after] = sizes.splice(0);
    after.forEach((value, i) => assert.ok(Math.abs(value / before[i] - 2) < 1e-12));
    assert.deepEqual([p.sz, p.r, p.dmg, p.vx], [2, 4, 10, 5]);
  }
});
