const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');

{
  const c=fixture(),l=c.window._parryLesson;
  l.start();l.beginPractice();l.step=8;l.startTrapPractice();
  const deaths=[];
  for(let tick=1;tick<=14;tick++){
    for(const [index,e] of l.trapEnemies.entries()){
      const alive=e.alive;
      l.hurtEnemy(e,10,0,{dot:true,_lessonAttack:'spikeTrap'});
      if(alive&&!e.alive)deaths.push({index,tick});
    }
    assert.equal(l.trapKills,Math.max(0,tick-4),'one enemy dies per DOT tick starting at the fifth tick');
  }
  assert.deepEqual(deaths.map(d=>d.tick),[5,6,7,8,9,10,11,12,13,14]);
  assert.equal(l.spikeTrapDone,false,'retreat is still required after all ten deaths');
  l.finish();
}

for(const hasCd of [false,true]){
  const c=fixture();c.G.mats=7;c.SKILL_SLOTS[0]='customSkill';
  if(hasCd)c.P._gcCd=321;
  const skills=c.P.skills,zones=[{type:'holyDome'}];c.G._fireZones=zones;
  const l=c.window._parryLesson;l.start();l.beginPractice();l.step=8;l.startTrapPractice();l.tick();
  assert.equal(c.P.skills.spikeTrap,1);assert.equal(c.G.mats,10);assert.equal(c.P._gcCd,0);
  let speed;
  c._ffMoveE=e=>{speed=e.speed*e._aSpdM;};
  for(const e of l.trapEnemies){e.x=c.P.x+200;e.y=c.P.y;e._spikeSlow=90;e._spikeSlowLv=1;}
  l.tick();assert.ok(Math.abs(speed-1.6*.09)<1e-10,'apply the real 91% slow once');
  l.finish();
  assert.equal(c.G.mats,7);assert.equal(c.SKILL_SLOTS[0],'customSkill');assert.equal(c.P.skills,skills);
  assert.equal(c.G._fireZones,zones);assert.equal(Object.hasOwn(c.P,'_gcCd'),hasCd);
  if(hasCd)assert.equal(c.P._gcCd,321);
}

for(const file of ['game.html','game-easy-test.html']){
  const c=fixture();const l=c.window._parryLesson;l.start();l.beginPractice();l.step=8;l.startTrapPractice();l.tick();
  Object.assign(c,{_isFused:()=>false,_addSkProf(){},_cdRed:()=>0,_r:()=>1});
  const html=fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8');
  const from=html.indexOf('function activateSpikeTrap()'),to=html.indexOf('// ═══ 공성쇠뇌',from);
  vm.runInContext(html.slice(from,to),c);c.activateSpikeTrap();
  assert.equal(c.G._fireZones.length,1);assert.equal(c.G._fireZones[0].dmg,10);
  assert.equal(c.G.mats,0);assert.equal(c.P._gcCd,600);
  c.activateSpikeTrap();assert.equal(c.G._fireZones.length,1,'cooldown blocks duplicate placement');
  const start=html.indexOf("}else if(fz.type==='spikeTrap'){",html.indexOf('// DOT 틱'));
  const end=html.indexOf("}else if(fz.type==='assaultFlame')",start);
  assert.ok(html.slice(start,end).includes("_lessonAttack:'spikeTrap'"),'only the actual trap DOT carries the completion marker');
  assert.ok(html.includes("const _stDmg=_spikeTrapDmg(_stLv)"),'fusion shares the buffed trap formula');
  l.finish();
}
console.log('PASS: trap skip restores malice/skills/slot/cooldown/world; slow applied once; both HTML casts consume actual costs and use shared DOT/fusion damage.');
