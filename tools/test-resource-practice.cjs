const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {fixture,exerciseChainTiers,exerciseDashFive}=require('./test-parry-lesson.cjs');
function setup(){
  const c=fixture();c.P.poise=2;c.P.maxPoise=4;c.P.poiseR=17;c.P.activeCtSk='iceOrb';c.G.mats=123;c.pGuardAbsorb=()=>.3;
  c._HARP_TIER_F=[0,1,6,12];c._HARP_GAUGE_COST=[0,45,98,150];c._harpDistTier=t=>[0,300,500,700][t];c._harpTier=1;
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../resource-practice.js'),'utf8'),c);
  const l=c.window._parryLesson;l.tick();l.phase='done';l.transitionTicks=1;l.tick();
  assert.equal(l.chapter,2);assert.equal(l.phase,'practice');assert.equal(l.button.hidden,true);assert.equal(l.labels.length,11);
  assert.equal(l.active,true,'chapter handoff must keep other tutorial popups blocked');
  return {c,l,r:c.window._resourcePractice};
}
const {c,l,r}=setup();
assert.equal(l.resourceGuide.hidden,false);
for(const [i,key]of ['Q','E','Shift'].entries())assert.ok(l.resourceGuideRows[i].textContent.includes(key),'skull-eye introduction pairs every resource with a skill');
assert.ok(!r.labels.some(label=>label.includes('녹색 스태미나 소모')));
function shot(){r.fire(l);return l.shot;}
function collide(){const p=shot();l.miss(p);c.projs.splice(c.projs.indexOf(p),1);}
function next(){for(let i=0;i<91;i++)l.tick();}
collide();assert.equal(c.P.poise,3);assert.equal(c.P.hp,90);assert.equal(l.checks[0],true);
next();assert.equal(l.step,1);assert.equal(c.P.poise,3);
// Natural recovery cannot pass a parry task. The real collision signal plus reward is required.
c.P.poise=4;l.tick();assert.equal(l.checks[1],false);c.P.poise=3;
l.hit(shot(),'magic');c.P.poise=4;l.tick();assert.equal(l.checks[1],true);
next();assert.equal(l.step,2);
for(let i=0;i<4;i++){collide();assert.equal(c.P.poise,3-i);}
assert.equal(c.P.s,'pStun');assert.equal(l.checks[2],true);
next();assert.equal(l.step,3);assert.equal(c.P.s,'pStun');
for(let i=0;i<500;i++)l.tick();assert.equal(l.checks[3],false);
assert.equal(l.allowKey('ShiftLeft'),true,'all escape methods are available from the start');
assert.match(l.resourceReadout.textContent,/0\/4/);
for(const [i,code,state] of [[0,'Space','gSlamWindup'],[1,'ShiftLeft','idle'],[2,'Space','bladeDash'],[3,'ControlLeft','ghostWalk']]){
  if(i===1)c.BINDS.charge='mouse0';
  if(i===2)l.allowKey('KeyW');
  assert.equal(l.allowKey(code),true);
  l.tick();assert.equal(l.checks[3],false,'input without an escape cannot complete the task');
  c.P.s=state;c.P.poise=4;
  if(i===2){c.P._bdMoveT=6;c.P.mp-=7;c._harpGauge-=31.5;}
  if(i===3){c.P._gwActive=true;c.P._gwCd=1200;}
  l.tick();assert.equal(l.checks[3],i===3,'all four different escapes are required');
  assert.match(l.resourceReadout.textContent,new RegExp(`${i+1}/4`));
  if(i<3){
    for(let t=0;t<90;t++)l.tick();
    assert.equal(l.step,3);assert.equal(l.checks[3],false);
    assert.equal(c.P.s,'pStun');assert.equal(c.P.poise,0);
    assert.equal(c.P.mp,c.P.mmp);assert.equal(c._harpGauge,c._HARP_GAUGE_MAX);
    assert.equal(c.P._gslCd,0);assert.equal(c.P._gwCd,0);
  }
}
next();assert.equal(l.step,10);assert.equal(l.allowKey('KeyF'),true);
const area={type:'holyDome',x:c.P.x,y:c.P.y,r:520,t:1,maxT:750};c.G._fireZones.push(area);c.P._hdCd=1800;
c.P.hp+=1;c.P.mp+=1;c.P.st+=1;l.tick();assert.equal(l.checks[10],true);
next();assert.equal(l.step,7);assert.equal(c.G._fireZones.includes(area),false);c.P.s='sBlock';c.P._sbHoldT=50;
for(let i=0;i<60;i++)l.tick();
assert.equal(r.burstSpawned,3);assert.equal(r.burstShots.length,3);
assert.equal(new Set(r.burstShots).size,3);
assert.equal(r.burstShots[0].y,c.P.y-800);assert.equal(r.burstShots[2].y,c.P.y-848);
for(let i=0;i<3;i++){
 const p=r.burstShots[i];l.miss(p);l.miss(p);
 assert.equal(r.hits,i+1,'each unique collision counts exactly once');
 assert.equal(l.checks[7],i===2,'all 3 hits are required');
 assert.equal(c.P.s,'sBlock');assert.equal(c.P.poise,1);
 c.projs.splice(c.projs.indexOf(p),1);
}
assert.equal(c.P.hp,97);assert.match(r.feedback,/3\/3/);

next();assert.equal(l.step,8);assert.equal(l.allowKey('ControlLeft'),true);assert.equal(l.allowKey('KeyQ'),false);
l.tick();assert.equal(l.checks[8],false);c.P._gwActive=true;c.P._gwCd=1200;l.tick();assert.equal(l.checks[8],true);
next();assert.equal(l.step,9);assert.equal(c.P.hp,40);assert.equal(c.P.st,40);assert.equal(c.P.mp,40);
l.hit(shot(),'magic');c.P.st+=30;c.P.mp+=30;c._harpGauge+=10;c.G.mats+=1000;l.tick();assert.equal(l.checks[9],false);c.P.hp+=30;l.tick();assert.equal(l.checks[9],true);
next();assert.equal(l.active,false);assert.equal(c.P.hp,81);assert.equal(c.P.poise,2);assert.equal(c.P.poiseR,17);assert.equal(c.P.activeCtSk,'iceOrb');assert.equal(c.G.mats,123);assert.equal(c.P.skills.ghostWalk,undefined);
// Skipping restores the same original state, including fields absent on entry.
const skip=setup();skip.c.P._gwActive=true;skip.c.P._gwPath=[{}];skip.l.finish();
assert.equal(skip.c.P._gwActive,undefined);assert.equal(skip.c.P._gwPath,undefined);assert.equal(skip.c.P.activeCtSk,'iceOrb');
console.log('PASS: chapter handoff, eight ordered live-state exercises, damage/poise, groggy escape, real resource consumption and parry rewards, guard resistance, Ctrl activation, no per-frame refill, complete/skip restoration.');
const direct=fixture(0,'?practice=2');
vm.runInContext(fs.readFileSync(path.join(__dirname,'../resource-practice.js'),'utf8'),direct);
assert.equal(direct.window._parryLesson.tick(),false);assert.equal(direct.window._parryLesson.chapter,2);direct.window._parryLesson.finish();
const burst=setup();burst.l.step=2;burst.r.enter(burst.l);
for(let i=0;i<59;i++)burst.l.tick();assert.equal(burst.c.projs.length,0);
burst.l.tick();assert.equal(burst.c.projs.length,1);
for(let i=0;i<72;i++)burst.l.tick();assert.equal(burst.c.projs.length,4);
for(const p of burst.c.projs.slice()){burst.l.miss(p);burst.l.miss(p);}
assert.equal(burst.r.hits,4);assert.equal(burst.c.P.poise,0);assert.equal(burst.l.checks[2],true);burst.l.finish();
const pointers=setup();
const escape=setup();escape.l.step=3;escape.r.enter(escape.l);escape.r.render(escape.l);
escape.l.allowKey('KeyW');assert.equal(escape.l.allowKey('Space'),true,'direction plus Space is an available escape');
escape.l.releaseKey('KeyW');assert.equal(escape.l.allowKey('Space'),true);
escape.c.P.s='bladeDash';escape.c.P._bdMoveT=6;escape.l.tick();
assert.equal(escape.r.escapeChecks.some(Boolean),false,'a different escape cannot satisfy the requested method');
for(let i=0;i<90;i++)escape.l.tick();
assert.equal(escape.r.escapeChecks.some(Boolean),false);assert.equal(escape.c.P.s,'pStun','wrong-method escape retries without getting stuck');
escape.r.enter(escape.l);escape.c.P.s='gSlamWindup';escape.l.tick();
assert.equal(escape.r.escapeChecks.some(Boolean),false,'state without user input is not success');
for(let i=0;i<90;i++)escape.l.tick();
escape.c.P.s='pStun';escape.l.allowKey('Space');escape.c.P.s='gSlamWindup';escape.l.tick();
for(let i=0;i<89;i++)escape.l.tick();
assert.equal(escape.r.escapeChecks.filter(Boolean).length,1,'one escape cannot count repeatedly');
assert.equal(escape.l.allowKey('Space'),false,'transition blocks escape inputs');
escape.l.tick();assert.equal(escape.r.escapeAttempt,-1);assert.equal(escape.l.allowKey('ControlLeft'),true);
escape.r.enter(escape.l);assert.equal(escape.r.escapeChecks.some(Boolean),false,'a new practice starts from zero');
escape.l.finish();
const positions={};const classes=new Set();
for(const [i,id] of ['hpEyeL','hpEyeR','mpEyeL','mpEyeR'].entries())positions[id]={getBoundingClientRect:()=>({left:100+i*20,top:500,width:7,height:7})};
for(const id of ['globeHP','globeMP'])positions[id]={classList:{toggle(key,on){on?classes.add(key):classes.delete(key)},remove(key){classes.delete(key)}}};
pointers.c.document.getElementById=id=>positions[id];pointers.r.eyeFocus(pointers.l);
assert.equal(pointers.r.eyeMarkers.length,4);assert.equal(pointers.r.eyeMarkers[0].marker.style.left,'103.5px');assert.equal(classes.has('lesson-eye-focus'),true);
pointers.l.step=4;pointers.r.eyeFocus(pointers.l);assert.equal(pointers.r.eyeOverlay,null);assert.equal(classes.size,0);pointers.l.finish();assert.equal(pointers.r.eyeOverlay,null);

// Breaking the hold, reflecting, losing a projectile, and partial spawns never pass the guard task.
function guardSetup(){const f=setup();f.l.step=7;f.r.enter(f.l);f.c.P.s='sBlock';f.c.P._sbHoldT=50;return f;}
for(const failure of ['release','reflect','expire','lost']){
 const f=guardSetup();f.r.fireGuardBurst(f.l);
 f.l.miss(f.r.burstShots[0]);assert.equal(f.r.hits,1);
 if(failure==='release')f.c.P.s='idle';
 if(failure==='reflect'){f.l.hit(f.r.burstShots[1],'magic');assert.equal(f.r.retryTicks,75);}
 if(failure==='expire')f.r.burstShots[1].life=0;
 if(failure==='lost')f.c.projs.splice(f.c.projs.indexOf(f.r.burstShots[1]),1);
 f.l.tick();assert.equal(f.l.checks[7],false);assert.ok(f.r.retryTicks>0);
 for(let i=0;i<75;i++)f.l.tick();assert.equal(f.r.hits,0);assert.equal(f.r.burstSpawned,0);assert.equal(f.c.projs.length,0);
 assert.equal(f.c.P.hp,100);assert.equal(f.c.P.poise,1);f.l.finish();
}
const spawnFail=guardSetup();spawnFail.c.spawnProj=()=>null;spawnFail.r.fireGuardBurst(spawnFail.l);assert.equal(spawnFail.r.retryTicks,75);assert.equal(spawnFail.l.checks[7],false);spawnFail.l.finish();
const flight=guardSetup();flight.r.fireGuardBurst(flight.l);
let first=-1,last=-1;
for(let frame=0;frame<600&&!flight.l.checks[7];frame++){
 flight.l.tick();
 for(const p of flight.c.projs.slice()){
  p.y+=p.vy;p.life--;
  if(p.y>=flight.c.P.y-20){
   assert.ok(p.life>0);flight.l.miss(p);flight.c.projs.splice(flight.c.projs.indexOf(p),1);
   if(first<0)first=frame;last=frame;
  }
 }
}
assert.equal(flight.r.hits,3);assert.equal(last-first,12,'3 impacts arrive at six-tick intervals');
assert.equal(flight.l.checks[7],true);flight.l.finish();
console.log('PASS: chapter 2 guard requires 3 unique absorbed hits; early release/reflection/lost shots retry; six-tick impact cadence, nonlethal damage, and restoration.');
// Item + passive absorption uses the live helper from each entry point and affects real practice damage.
for(const name of ['game.html','game-easy-test.html']){
 const f=guardSetup();const source=fs.readFileSync(path.join(__dirname,'..',name),'utf8');
 const start=source.indexOf('function pGuardAbsorb(){');assert.ok(start>0);
 const helper=source.slice(start,source.indexOf('\n',start));
 let itemBonus=0;f.c.PASSIVES={pGuard:0};f.c._eqAffix=id=>id==='shieldBlockDR'?itemBonus:0;
 vm.runInContext(helper,f.c);
 for(const [level,bonus,expected] of [[0,0,.3],[1,0,.32],[0,.04,.34],[0,.22,.5],[5,.07,.47],[10,.22,.5]]){
  f.c.PASSIVES.pGuard=level;itemBonus=bonus;
  assert.ok(Math.abs(f.c.pGuardAbsorb()-expected)<1e-10,`${name}: passive ${level}, gear ${bonus}`);
 }
 f.c.PASSIVES.pGuard=0;f.c.P.mhp=1000;
 for(const [bonus,expectedDamage] of [[0,22],[.04,20],[.22,19]]){
  itemBonus=bonus;f.r.enter(f.l);f.c.P.s='sBlock';f.c.P._sbHoldT=50;f.r.fireGuardBurst(f.l);
  f.l.miss(f.r.burstShots[0]);assert.equal(f.c.P.hp,1000-expectedDamage);
 }
 f.r.readout(f.l);assert.match(f.l.resourceReadout.textContent,/현재 보호막 흡수율 50% · 이번 홀딩 적용 25%/);
 f.l.finish();
}
console.log('PASS: live base/passive/item absorption, 50% cap, 25% hold cap, item reduction of practice damage, and current-rate description.');

{
 const {c,l,r}=setup();
 for(const step of [0,1,2,4,5,6,7,8,9]){
  l.step=step;r.enter(l);assert.equal(l.allowKey('KeyA'),true);assert.equal(l.allows('left'),true);
  c.P.x+=10;const x=c.P.x;l.tick();assert.equal(c.P.x,x);
 }
 l.step=2;r.enter(l);for(let i=0;i<4;i++)r.fire(l);c.projs=[];l.tick();assert.equal(r.retryTicks,75);
console.log('PASS: resource steps allow movement, preserve position, and retry a dodged four-shot lesson.');
}
{
 const {c,l,r}=setup();l.step=5;r.enter(l);
 c.P.s='sBlock';c.P.mp-=10;l.tick();assert.equal(r.resourceChecks.some(Boolean),false,'resource loss without input is not a completed skill');
 r.enter(l);l.allowKey('KeyQ');c.P.s='sBlock';c.P.mp-=10;l.tick();
 assert.equal(r.resourceChecks.filter(Boolean).length,1);assert.equal(l.allowKey('KeyE'),false,'transition cannot start the next skill early');
 for(let i=0;i<89;i++)l.tick();assert.equal(r.resourceChecks.filter(Boolean).length,1,'one activation never counts more than once');
 l.tick();assert.equal(r.resourceIndex,1);assert.equal(c.P.mp,c.P.mmp);
 r.enter(l);assert.equal(r.resourceChecks.some(Boolean),false,'restarting clears the complete set');
 l.finish();assert.equal(c.P.mp,42);assert.equal(c.P.st,51);
 console.log('PASS: skull-eye introduction includes Q/E/Shift resource pairs; all three live activations required, no input-only or cost-only completion, no duplicate credit, retry resets, skip restores.');
}
