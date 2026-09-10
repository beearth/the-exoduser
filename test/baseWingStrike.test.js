import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const chargeCode = `switch(P.s){${html.slice(html.indexOf("case 'sDraw':{"), html.indexOf("case 'sBlock':{", html.indexOf("case 'sDraw':{")))}}`;
function chargeContext() {
  const noop = () => {};
  const ctx = vm.createContext({
    P: {s:'kiGather',_kgChg:80,_kgTier:1,chargeStocks:2,maxChargeStocks:3,chargeCd:0,
      skills:{chargeBoost:1,bladeDash:1},x:0,y:0,r:15,speed:4,facing:0,mp:100,iframes:0}, G:{cam:{y:0}},
    sp:1, held:true, charge:true, _harpActive:false,_dashActive:false,_HARP_SPD:20,
    _harpGauge:100,_HARP_GAUGE_COST:[0,10],_HARP_GAUGE_MAX:100,VH:720,EL:{L:4},
    isHeld:()=>ctx.held,isAct:k=>k==='charge'?ctx.charge:k==='right', useStPct:()=>true,
    canMv:()=>true,canMvBlink:()=>true,_harpDistTier:()=>300,
    SFX:{slash:noop,charge:noop},playSample:noop,_r:()=>1,addTxt:noop,_T:x=>x,_L:x=>x,
    _addSkProf:noop,shake:noop,doHitFlash:noop,poolPart:noop,addParts:noop,showPH:noop,
    magicRef:()=>1,statInt:()=>1,pMagicMul:()=>1,_skMul:()=>1,_isFused:()=>false,
    _kgRelease:(tier,mul)=>{ctx.released={tier,mul};ctx.P.s='sBash';ctx.P.st2=20;},
  });
  return ctx;
}

test('Shift starts movement without erasing E charge, and E releases during travel', () => {
  const ctx=chargeContext();
  vm.runInContext(chargeCode,ctx);
  assert.equal(ctx.P.s,'kiGather');
  assert.equal(ctx.P._kgChg,82);
  assert.equal(ctx._harpActive,true);
  assert.equal(ctx.P.chargeStocks,1);
  ctx._dashActive=true;ctx.held=false;
  vm.runInContext(chargeCode,ctx);
  assert.equal(ctx.P.s,'sBash');
  assert.equal(ctx._dashActive,true);
  assert.ok(ctx.released.mul>1.5);
  assert.equal(ctx.P.chargeStocks,1,'no repeated movement cost while in flight');
});

test('blade movement preserves E charge and continues through release to its landing', () => {
  const ctx=chargeContext();ctx.charge=false;
  vm.runInContext(fn('activateBladeDash'),ctx);
  ctx.activateBladeDash(3);
  assert.equal(ctx.P.s,'kiGather');
  assert.equal(ctx.P._kgChg,80);
  vm.runInContext(fn('_tickBladeDash'),ctx);
  for(let frame=0;frame<12;frame++){
    ctx._tickBladeDash(1);
    if(frame<3)vm.runInContext(chargeCode,ctx);
    if(frame===3){ctx.held=false;vm.runInContext(chargeCode,ctx);assert.equal(ctx.P.s,'sBash');}
  }
  assert.equal(ctx.P.s,'sBash','landing must not replace the E parry state');
  assert.equal(ctx.P.st2,20,'movement timer must not consume the E parry window');
  assert.ok(Math.abs(ctx.P.x-250)<1e-6,'preserve the pre-charge-refactor travel distance');
  assert.equal(ctx.G._fireZones.length,1);
  assert.equal(ctx.P.mp,93);
});

test('E physical projectile parries remain active during movement invulnerability', () => {
  for(const prefix of ['if(_physicalMouth&&!_pHit', 'if(p.titanEye&&!_pHit', 'if(p.bwBean&&!_pHit']){
    const start=html.indexOf(prefix),end=html.indexOf('){',start);
    const condition=html.slice(start+3,end);
    const ctx={P:{iframes:40,_ioActive:false},p:{titanEye:true,bwBean:true,noParry:false},
      _physicalMouth:true,_pHit:false,_pDist:10,_rbDeflR:110,_normalR:100,_sbActive:true};
    assert.equal(vm.runInNewContext(condition,ctx),true,prefix);
    ctx._sbActive=false;
    assert.equal(vm.runInNewContext(condition,ctx),false,'invulnerability must not create a parry outside E release');
  }
});

test('ordinary blade dash still lands and restores a held skill', () => {
  const ctx=chargeContext();ctx.P.s='sBlock';ctx.charge=false;
  ctx.isAct=k=>k==='parry';
  vm.runInContext(fn('activateBladeDash')+fn('_tickBladeDash'),ctx);
  ctx.activateBladeDash(3);
  assert.equal(ctx.P.s,'bladeDash');
  for(let i=0;i<12;i++)ctx._tickBladeDash(1);
  assert.equal(ctx.P.s,'sBlock');assert.equal(ctx.P._bdMoveT,0);
  assert.equal(ctx.G._fireZones.length,1);
});

test('Flash Step travels its original 250 units once, including fractional final updates',()=>{
  for(const sp of [1,.35,2]){
    const ctx=chargeContext();ctx.P.s='idle';ctx.charge=false;ctx.isAct=()=>false;
    vm.runInContext(fn('activateBladeDash')+fn('_tickBladeDash'),ctx);ctx.activateBladeDash(3);
    let ticks=0;while(ctx.P._bdMoveT>0&&ticks++<100)ctx._tickBladeDash(sp);
    assert.ok(Math.abs(ctx.P.x-250)<1e-6,'distance at step '+sp);
    assert.equal(ctx.G._fireZones.length,1);assert.equal(ctx.P.mp,93);
    ctx._tickBladeDash(sp);assert.ok(Math.abs(ctx.P.x-250)<1e-6,'completed dash cannot move again');
    assert.equal(ctx.G._fireZones.length,1);
  }
});
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
    _harpActive: false, _dashActive: false,
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

test('level-one Wing Strike fires without shoulder equipment and respects cooldown', () => {
  const noop = () => {};
  const ctx = vm.createContext({
    G: {}, INV: { equipped: { shield: null } },
    pShieldMul: () => 1, statStr: () => 1, _fuseMul: () => 1,
    _addSkProf: noop, shake: noop, poolPart: noop,
  });
  vm.runInContext(['mkP', 'sh', '_isFused', '_wingStrikeLevel', '_eSkillRangeMul', '_autoShieldThrow'].map(fn).join('\n'), ctx);
  ctx.P = ctx.mkP();
  ctx._autoShieldThrow();
  assert.equal(ctx.G._stProjs?.length, 1, 'base fusion must fire with an empty equipment slot');
  assert.equal(ctx.G._stProjs[0].wave, true);
  assert.ok(ctx.G._stProjs[0].dmg > 0);
  assert.equal(ctx.P._stWingT, 40);
  assert.equal(ctx.P._stCd, 705);
  ctx._autoShieldThrow();
  assert.equal(ctx.G._stProjs.length, 1, 'cooldown must still prevent repeated waves');
});

test('charged E release enlarges the actual fused wave hit area, including skill growth', () => {
  const noop = () => {};
  const ctx = vm.createContext({
    G: {}, INV: { equipped: { shield: null } }, _charIdx: 0,
    pShieldMul: () => 1, statStr: () => 1, _fuseMul: () => 1,
    _addSkProf: noop, shake: noop, poolPart: noop,
    _startSilvertailAttackMotion: noop, _playSwordBack: noop, playSample: noop, _r: () => 1,
  });
  vm.runInContext(['mkP', 'sh', '_isFused', '_wingStrikeLevel', '_eSkillRangeMul', '_autoShieldThrow', '_kgRelease'].map(fn).join('\n'), ctx);
  for (const lv of [1, 5]) {
    const sizes = [];
    for (const charge of [1, 1.5, 2, 3]) {
      ctx.P = ctx.mkP(); ctx.P.skills.maliceSwipe = ctx.P.skills.shieldThrow = lv;
      ctx.G = {};
      ctx._kgRelease(3, charge);
      const wave = ctx.G._stProjs[0], scale = (1 + (lv - 1) * .05) * charge;
      assert.equal(wave.maxDist, 210 * scale);
      assert.equal(wave.r, 50 * scale);
      assert.equal(wave.w, 95 * scale);
      sizes.push(wave);
    }
    // Run the game's enemy collision predicate against an enemy outside tap width.
    const hit = html.match(/if\((along>-st\.r&&along<st\.r\+20&&Math\.abs\(perp\)<_wvHW\+e\.r)\)/)[1];
    const target = { along: 0, perp: 100, e: { r: 10 } };
    assert.equal(vm.runInNewContext(hit, { ...target, st: sizes[0], _wvHW: sizes[0].w / 2 }), false);
    assert.equal(vm.runInNewContext(hit, { ...target, st: sizes[3], _wvHW: sizes[3].w / 2 }), true);
  }
});
