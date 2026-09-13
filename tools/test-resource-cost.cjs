const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');
for(const scale of [1,3])for(const index of [0,1,2])for(const costFraction of [.01,.8]){
  const c=fixture();
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../resource-practice.js'),'utf8'),c);
  const l=c.window._parryLesson,r=c.window._resourcePractice;
  l.tick();l.phase='done';l.transitionTicks=1;l.tick();
  l.step=5;r.enter(l);r.resourceIndex=index;
  c.P.mmp=100*scale;c.P.mst=100*scale;r.prepareResource(l);
  const before={mp:c.P.mp,st:c.P.st,gauge:c._harpGauge};
  l.allowKey(['KeyQ','KeyE','ShiftLeft'][index]);
  c.P.s=['sBlock','sBash','idle'][index];
  l.tick();
  assert.equal(c.P.mp,before.mp,'state/input alone must not charge practice cost');
  assert.equal(c.P.st,before.st);
  assert.equal(c._harpGauge,before.gauge);
  if(index===0)c.P.mp-=before.mp*costFraction;
  if(index===1)c.P.st-=before.st*costFraction;
  if(index===2){c._harpActive=true;c.P.st-=before.st*costFraction;c._harpGauge-=before.gauge*costFraction;}
  l.tick();
  const remaining=(value)=>Math.min(value*.5,value-value*costFraction);
  assert.equal(c.P.mp,index===0?remaining(before.mp):before.mp,'Q spends at least half MP without refunding a larger cost');
  assert.equal(c.P.st,index>0?remaining(before.st):before.st,'E/Shift spend at least half ST');
  assert.equal(c._harpGauge,index===2?remaining(before.gauge):before.gauge,'Shift spends at least half mobility');
  const after={mp:c.P.mp,st:c.P.st,gauge:c._harpGauge};
  for(let t=0;t<10;t++)l.tick();
  assert.deepEqual({mp:c.P.mp,st:c.P.st,gauge:c._harpGauge},after,'charge only once per successful activation');
  l.finish();assert.equal(c.P.mp,42);assert.equal(c.P.st,51);
}
console.log('PASS: resource practice spends 50% of relevant maxima once, requires a real cost, scales with stats, and restores on exit.');
