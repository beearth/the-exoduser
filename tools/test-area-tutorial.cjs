const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');
for(const htmlPath of ['game.html','game-easy-test.html']){
  const c=fixture(0,'?practice=2');c.pGuardAbsorb=()=>.3;
  c.SKILL_SLOTS[5]='weakMag';c.P._hdCd=123;c.P.skills.holyDome=0;
  const originalZones=[{type:'holyDome',x:0,y:0,r:10,t:0,maxT:10}];c.G._fireZones=originalZones;
  Object.assign(c,{_T:x=>x,_isFused:()=>false,_fuseMul:()=>1,sp:1,addParts(){},SFX:{pickup(){}},dst:(x,y,a,b)=>Math.hypot(x-a,y-b)});
  const html=fs.readFileSync(htmlPath,'utf8');
  vm.runInContext(html.match(/function activateHolyDome\(\)\{[\s\S]*?\n\}/)[0],c);
  vm.runInContext(fs.readFileSync('resource-practice.js','utf8'),c);
  const l=c.window._parryLesson,r=c.window._resourcePractice;l.tick();
  assert.ok(r.stepOrder.includes(10),'F area exercise is in the starting tutorial');
  l.step=10;r.enter(l);l.render();
  assert.equal(c.SKILL_SLOTS[5],'holyDome');assert.equal(c.P.skills.holyDome,1);assert.equal(c.P._hdCd,0);
  assert.match(l.hint.textContent,/버프/);assert.match(l.hint.textContent,/너프/);
  assert.equal(l.allowKey('KeyQ'),false);assert.equal(l.allowKey('KeyF'),true);
  l.tick();assert.equal(l.checks[10],false,'input alone does not pass');
  c.activateHolyDome();l.tick();assert.equal(l.checks[10],false,'installation without recovery does not pass');
  let zone=c.G._fireZones.find(z=>z.type==='holyDome');
  const heal=html.slice(html.indexOf('  let _inHolyDome=false'),html.indexOf('  const _mpr=',html.indexOf('  let _inHolyDome=false')));
  c.P.x=zone.x+zone.r+1;vm.runInContext('{'+heal+'}',c);l.tick();assert.equal(l.checks[10],false,'outside the area cannot pass');
  zone.t=zone.maxT;l.tick();assert.equal(c.P._hdCd,0,'expired area readies another F attempt');
  assert.equal(l.checks[10],false);l.allowKey('KeyF');c.activateHolyDome();zone=c.G._fireZones.find(z=>z.type==='holyDome');
  c.P.x=zone.x;c.P.y=zone.y;vm.runInContext('{'+heal+'}',c);l.tick();
  assert.equal(l.checks[10],true,'actual recovery inside the placed domain completes practice');
  assert.equal(l.pending,'success','F exercise must continue to Q hold, not finish chapter two');
  for(let i=0;i<91;i++)l.tick();
  assert.equal(l.step,7);assert.equal(c.G._fireZones.includes(zone),false,'practice domain cannot heal later resource exercises');
  l.finish();assert.equal(c.SKILL_SLOTS[5],'weakMag');assert.equal(c.P._hdCd,123);assert.equal(c.P.skills.holyDome,0);assert.equal(c.G._fireZones,originalZones);
  // Skipping during the area exercise restores the original F slot and cooldown too.
  l.seen=false;l.start();l.step=10;r.enter(l);l.allowKey('KeyF');c.activateHolyDome();l.finish();
  assert.equal(c.SKILL_SLOTS[5],'weakMag');assert.equal(c.P._hdCd,123);assert.equal(c.G._fireZones,originalZones);
}
console.log('PASS: F input, real domain placement/healing, outside/no-input rejection, successor, zone cleanup, and slot/skill/cooldown/world restoration in both games.');
