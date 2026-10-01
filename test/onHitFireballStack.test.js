import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

// BALANCE ITEM-01 diagnostic, not a newly implemented proc or a balance change.
// Executes unmodified extracted hurtE/_eqAffix code in an isolated VM. No browser,
// loop, save, network, or production RNG is touched. Presentation helpers are stubs.
// Current defect: onHitFireball has data but no hit consumer. A zero proc count
// does NOT prove recursion safety. The recursion case stays explicitly skipped.
const officialTiers = [0.04, 0.07, 0.11, 0.16, 0.22];
const sources = ['game.html', 'game-easy-test.html'].map(file => {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  function between(start, end) {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert(a >= 0 && b > a, `${file}: extraction anchors ${start} / ${end}`);
    return source.slice(a, b);
  }
  const row = source.match(/^\s*\{id:'onHitFireball',[^\n]+/m)?.[0].trim().replace(/,$/, '');
  const slots = source.match(/^const SLOT_NAMES=([^;]+);/m)?.[1];
  const slotMap = source.match(/^const _AFSLOT=([^;]+);/m)?.[1];
  assert(row && slots && slotMap, `${file}: actual affix and slot definitions`);
  return { file, source, row, slots, slotMap,
    hash: createHash('sha256').update(source).digest('hex'),
    affixes: between('let _eqAffixCache=null', '// ═══ 테스트용:'),
    hurt: between('function hurtE(', 'function _getTodayStr(') };
});

function item(value, id = 'onHitFireball') {
  return { affixes: [{ id, value }] };
}
function makeHarness(s, equipped = {}, randomValue = 0) {
  assert(randomValue >= 0 && randomValue < 1);
  const c = vm.createContext({ equipped: structuredClone(equipped), randomValue });
  vm.runInContext(`
    const definition=${s.row}, SLOT_NAMES=${s.slots}, slotMap=${s.slotMap};
    const INV={equipped}, window={}, EL={L:4}, _UNDEAD_ET=new Set();
    const P={hp:100,mhp:100,mp:100,mmp:100,st:100,mst:100,x:0,y:0,s:'idle'};
    const G={cam:{x:0,y:0},hitStop:0}, PASSIVES={pBow:0}, OPT={parts:0};
    let _shBufI=0,_hitSfxCd=8,_dpsDmg=0,_txtPerFrame=1000;
    const _TXT_BUDGET=0;
    const evidence={randomCalls:0,hitCalls:0,maxDepth:0,depth:0,affixReads:[],projectiles:[],petAtkCalls:0};
    Math.random=()=>{evidence.randomCalls++;return randomValue};
    const _petOnAtk=()=>{evidence.petAtkCalls++};
    const statStr=()=>1,statCrit=()=>0,statCritDmg=()=>1.5;
    const nc=()=>({}),rg1=()=>({}),rg2=()=>({}),wp=()=>({});
    const _predBonus=()=>0,_hunterMul=()=>1,_uEq=()=>0;
    const shQuery=()=>[],addParts=()=>{},addTxt=()=>{},shake=()=>{},_T=x=>x;
    const poolProj=(...args)=>{const p={args};evidence.projectiles.push(p);return p};
    const projs=evidence.projectiles,ens=[];
    ${s.affixes}
    ${s.hurt}
    const actualAffix=_eqAffix;
    _eqAffix=function(id){evidence.affixReads.push(id);return actualAffix(id)};
    const actualHurt=hurtE;
    hurtE=function(...args){
      evidence.hitCalls++;evidence.depth++;
      evidence.maxDepth=Math.max(evidence.maxDepth,evidence.depth);
      if(evidence.depth>32)throw Error('diagnostic recursion limit exceeded');
      try{return actualHurt(...args)}finally{evidence.depth--}
    };
  `, c, { timeout: 1000 });
  return {
    evaluate(code) { return vm.runInContext(code, c, { timeout: 1000 }); },
    hit({ dot = false } = {}) {
      c.isDotInput = dot;
      vm.runInContext(`
        globalThis.target={alive:true,hp:1000000,mhp:1000000,etype:0,x:10,y:10,s:'idle',st2:0};
        hurtE(target,100,undefined,true,{dot:isDotInput,noKB:true},0);
      `, c, { timeout: 1000 });
      return JSON.parse(vm.runInContext('JSON.stringify({target,evidence,bufferDepth:_shBufI,dps:_dpsDmg})', c));
    }
  };
}

for (const s of sources) {
  test(`${s.file}: official 4/7/11/16/22% and weapon-only roll policy`, () => {
    const h = makeHarness(s);
    assert.deepEqual(Array.from(h.evaluate('definition.tiers')), officialTiers);
    assert.deepEqual(Array.from(h.evaluate('definition.slots')), ['wpn']);
    assert.equal(h.evaluate('definition.unit'), 'prob');
    assert.deepEqual(Array.from(h.evaluate('SLOT_NAMES.filter(slot=>definition.slots.includes(slotMap[slot]))')), ['weapon']);
  });

  test(`${s.file}: actual aggregation for each single tier and forced multi-slot fixture`, () => {
    for (const value of officialTiers) {
      assert.equal(makeHarness(s, { weapon: item(value) }).evaluate('_eqAffix("onHitFireball")'), value);
    }
    // bow is xbow, not wpn: this deliberately injected duplicate is NOT normal loot.
    const h = makeHarness(s, { weapon: item(.22), bow: item(.22) });
    assert.equal(h.evaluate('_eqAffix("onHitFireball")'), .44);
    h.evaluate('delete INV.equipped.bow;_eqAffixCache=null');
    assert.equal(h.evaluate('_eqAffix("onHitFireball")'), .22);
  });

  test(`${s.file}: deterministic normal hits expose missing fireball consumer, not successful proc`, t => {
    const rows = [];
    for (const [label, gear] of [
      ['none', {}], ['single-T4', { weapon: item(.22) }],
      ['forced-double-T4', { weapon: item(.22), bow: item(.22) }]
    ]) for (const random of [0, .219999, .22, .439999, .44, .999999]) {
      const r = makeHarness(s, gear, random).hit();
      assert.equal(r.target.hp, 999900, 'actual hurtE must reach HP damage');
      assert.equal(r.dps, 100);
      assert.equal(r.evidence.petAtkCalls, 1);
      assert.equal(r.evidence.hitCalls, 1);
      assert.equal(r.bufferDepth, 0, 'actual hurtE finally returns query buffer');
      assert.equal(r.evidence.affixReads.includes('onHitFireball'), false);
      assert.equal(r.evidence.projectiles.length, 0);
      rows.push({ gear: label, random, hitCalls: r.evidence.hitCalls,
        fireballReads: 0, projectiles: 0, randomCalls: r.evidence.randomCalls });
    }
    assert.doesNotMatch(s.hurt, /onHitFireball/, 'current diagnostic must be reviewed when the real hook is added');
    t.diagnostic(JSON.stringify({ file: s.file, sha256: s.hash,
      verdict: 'MISSING_HOOK', recursion: 'NOT_REACHED', rows }));
  });

  test(`${s.file}: real fireOnHit positive control consumes deterministic RNG and honors DOT guard`, () => {
    const success = makeHarness(s, { weapon: item(.22, 'fireOnHit') }, .219999).hit();
    assert.equal(success.target.burnT, 180);
    assert.equal(success.target.burnPool, 30);
    assert(success.evidence.affixReads.includes('fireOnHit'));
    const boundary = makeHarness(s, { weapon: item(.22, 'fireOnHit') }, .22).hit();
    assert.equal(boundary.target.burnT, undefined, 'actual strict < threshold');
    const dot = makeHarness(s, { weapon: item(.22, 'fireOnHit') }, 0).hit({ dot: true });
    assert.equal(dot.target.burnT, undefined);
    assert.equal(dot.evidence.affixReads.includes('fireOnHit'), false);
    assert.equal(success.evidence.randomCalls, boundary.evidence.randomCalls);
    assert.equal(success.evidence.randomCalls, dot.evidence.randomCalls + 1);
  });

  test(`${s.file}: fireball-generated hit recursion termination remains unverified`, t => {
    if (!s.hurt.includes('onHitFireball')) {
      t.skip('MISSING_HOOK: no fireball-producing hit exists; zero generated hits cannot prove recursion safety');
      return;
    }
    assert.fail('Actual hook was added: replace missing-hook diagnostic with real produced-projectile/re-hit fixtures; do not infer PASS');
  });
}
