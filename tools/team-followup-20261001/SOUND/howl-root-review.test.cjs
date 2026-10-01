const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function load() {
  const c = vm.createContext({console, performance, module:{exports:{}}});
  vm.runInContext(fs.readFileSync(__dirname+'/'+(process.env.SOUND_IMPL || 'howl-observer.cjs'),'utf8'),c);
  return c.module.exports.createHowlObserver;
}
test('observer state reader failure must not suppress original arena call',()=>{
  let calls=0;const result={},scope={playSample(){},_enterBossArena(){calls++;return result}};
  load()({scope,getG(){throw Error('observation failed')}});
  assert.equal(scope._enterBossArena(),result);assert.equal(calls,1);
});
test('missing phase and retry evidence must stay UNKNOWN',()=>{
  const scope={G:{},playSample(){},_enterBossArena(){scope.playSample('boss_howl')}};
  const h=load()({scope});scope._enterBossArena();
  assert.equal(h.report().counts.UNKNOWN,1);assert.equal(h.judge().direct.length,0);
});
test('one early seal before phase4 is incomplete, not a PASS',()=>{
  const scope={G:{_bossLoadPhase:2},playSample(){},_enterBossArena(){scope.playSample('boss_howl')}};
  const h=load()({scope});scope._enterBossArena();
  assert.notEqual(h.judge().bossdoor[0].verdict,'PASS');
});
test('episode storage must be bounded along with event storage',()=>{
  const scope={G:{_bossLoadPhase:0},playSample(){},_enterBossArena(){scope.playSample('boss_howl')}};
  const h=load()({scope,maxEvents:3});for(let i=0;i<8;i++)scope._enterBossArena();
  assert.ok(h.report().episodes.length<=3);
});
test('invalid capacities fail before installing any wrapper',()=>{
  for(const key of ['maxEvents','maxEpisodes']) for(const value of [-1,0,1.5,Infinity,NaN,4097]){
    const original=()=>{};const scope={playSample:original,_enterBossArena:original};
    assert.throws(()=>load()({scope,[key]:value}),/capacities/);
    assert.equal(scope.playSample,original);assert.equal(scope._enterBossArena,original);
  }
});
test('nonzero or nonfinite phase is not proof of direct entry',()=>{
  for(const phase of [1,3,NaN,Infinity]){
    const scope={G:{_bossLoadPhase:phase},playSample(){},_enterBossArena(){scope.playSample('boss_howl')}};
    const h=load()({scope});scope._enterBossArena();
    assert.equal(h.report().counts.UNKNOWN,1);assert.equal(h.judge().direct.length,0);
  }
});
