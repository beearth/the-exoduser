const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {fixture}=require('./test-parry-lesson.cjs');
function setup(){
  const c=fixture(0,'?practice=2');
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../resource-practice.js'),'utf8'),c);
  const l=c.window._parryLesson;l.tick();
  const r=c.window._resourcePractice;l.step=3;r.enter(l);l.render();
  c.BINDS.charge='mouse0';
  return {c,l,r};
}
function perform(f,id){
  const {c,l}=f;
  if(id===2)l.allowKey('KeyW');
  assert.equal(l.allowKey(['Space','ShiftLeft','Space','ControlLeft'][id]),true,`method ${id} must be available`);
  l.tick();assert.equal(l.checks[3],false,'input alone cannot pass');
  c.P.s=['gSlamWindup','idle','bladeDash','ghostWalk'][id];c.P.poise=4;
  if(id===2)c.P._bdMoveT=6;
  if(id===3){c.P._gwActive=true;c.P._gwCd=1200;}
  l.tick();
}
function ready({c,l}){
  assert.equal(l.allowKey('ShiftLeft'),false,'recovery delay blocks another escape');
  for(let t=0;t<90;t++)l.tick();
  assert.equal(c.P.s,'pStun');assert.equal(c.P.poise,0);
  assert.equal(c.P.mp,c.P.mmp);assert.equal(c.P.st,c.P.mst);
  assert.equal(c._harpGauge,c._HARP_GAUGE_MAX);
  assert.equal(c.P._gslCd,0);assert.equal(c.P._gwCd,0);
}
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];}
for(const order of permutations([0,1,2,3])){
  const f=setup();
  for(const [n,id] of order.entries()){
    perform(f,id);
    assert.equal(f.r.escapeChecks[id],true,`${order}: method ${id} credited`);
    assert.equal(f.r.escapeChecks.filter(Boolean).length,n+1);
    assert.equal(f.l.checks[3],n===3,'all distinct methods required');
    if(n<3)ready(f);
  }
  f.l.finish();
}
for(const id of [0,1,2,3]){
  const f=setup();perform(f,id);ready(f);perform(f,id);
  assert.equal(f.r.escapeChecks.filter(Boolean).length,1,'duplicates never advance progress');
  assert.equal(f.l.checks[3],false);ready(f);
  f.r.enter(f.l);assert.equal(f.r.escapeChecks.some(Boolean),false);
  f.l.finish();
}
{
  const f=setup();f.c.P.s='idle';f.c.P.poise=4;f.l.tick();
  assert.equal(f.r.escapeChecks.some(Boolean),false,'automatic state change cannot pass');
  ready(f);f.l.finish();
}
console.log('PASS: all 24 escape orders, distinct-method completion, duplicate retries, physical Shift binding, resource/cooldown reset, no automatic credit.');
