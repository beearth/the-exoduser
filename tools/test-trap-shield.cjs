const assert=require('node:assert/strict');
const {fixture}=require('./test-parry-lesson.cjs');
function setup(){
  const c=fixture(),create=c.mkEn;
  // Real mkEn supplies a scaled shield; the old fixture omitted it and hid the bug.
  c.mkEn=(...args)=>({...create(...args),eShield:99999,eShieldMax:99999});
  const l=c.window._parryLesson;l.start();l.beginPractice();l.step=8;l.startTrapPractice();
  return {c,l,e:l.trapEnemies[0]};
}
const hit={dot:true,shieldHit:true,_lessonAttack:'spikeTrap'};
{
  const {l,e}=setup();e.hp=e.mhp=20;e.eShield=e.eShieldMax=30;
  l.hurtEnemy(e,20,0,hit);
  assert.equal(e.eShield,10,'trap DOT must deplete shield first');
  assert.equal(e.hp,20,'shield absorption must protect HP');assert.equal(e.alive,true);assert.equal(l.trapKills,0);
  l.hurtEnemy(e,15,0,hit);
  assert.equal(e.eShield,0);assert.equal(e.hp,15,'only the five damage overflow reaches HP');
  l.hurtEnemy(e,15,0,hit);assert.equal(e.hp,0);assert.equal(e.alive,false);assert.equal(l.trapKills,1);
  l.hurtEnemy(e,999,0,hit);assert.equal(l.trapKills,1,'death counts once');l.finish();
}
{
  const {c,l}=setup();
  for(const [i,e] of l.trapEnemies.entries()){
    assert.equal(e.eShield,e.hp,'practice shield must track practice HP, not inherited stage HP');
    assert.equal(e.eShieldMax,e.mhp);
    assert.equal(e.hp+e.eShield,10*(5+i),'retain five to fourteen total damage ticks');
  }
  const deaths=[];
  for(let tick=1;tick<=14;tick++)for(const e of l.trapEnemies){
    const alive=e.alive,shield=e.eShield,hp=e.hp;l.hurtEnemy(e,10,0,hit);
    if(alive&&shield>=10)assert.equal(e.hp,hp);
    if(alive&&!e.alive){assert.equal(e.eShield,0);deaths.push(tick);}
  }
  assert.deepEqual(deaths,[5,6,7,8,9,10,11,12,13,14]);
  assert.equal(l.trapKills,10);assert.equal(l.spikeTrapDone,false,'retreat remains mandatory');
  assert.equal(c.deaths.length,10);l.finish();
}
for(const shield of [0,5,20]){
  const {l,e}=setup();e.hp=e.mhp=10;e.eShield=shield;e.eShieldMax=20;
  const before={hp:e.hp,shield:e.eShield};
  l.hurtEnemy(e,1000,0,{dot:true,shieldHit:true});
  assert.deepEqual({hp:e.hp,shield:e.eShield},before,'non-trap DOT cannot affect practice enemies');
  l.hurtEnemy(e,1000,0,hit);assert.equal(e.eShield,0);assert.equal(e.hp,0);assert.equal(e.alive,false);l.finish();
}
console.log('PASS: trap practice drains shield before HP, overflow only, valid source gating, stage-independent durability, staggered deaths, and no duplicate kills.');
