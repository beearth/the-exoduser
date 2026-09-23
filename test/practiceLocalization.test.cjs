const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fixture}=require('../tools/test-parry-lesson.cjs');
function setup(lang){
 const c=fixture();c.OPT={lang};c._L=(ko,en,values={})=>(c.OPT.lang==='ko'?ko:en).replace(/\{(\w+)\}/g,(m,k)=>values[k]??m);
 c._dashHold=0;c._dashTier=1;c.pGuardAbsorb=()=>.3;
 vm.runInContext(fs.readFileSync('resource-practice.js','utf8'),c);
 const l=c.window._parryLesson;l.tick();return {c,l,r:c.window._resourcePractice};
}
function text(node){return [node.textContent||'',...(node.children||[]).filter(n=>!n.removed).map(text)].join('\n');}
test('English combat practice translates instructions and dynamic counters for all stages',()=>{
 const {c,l}=setup('en');
 for(const step of [-3,-2,-1,0,1,2,3,4,5,6,7,8]){
  l.step=step;l.phase='practice';
  if(step===4)l.chainPractice={target:1,completed:[],feedback:''};
  l.render();
  assert.doesNotMatch(text(l.panel),/[가-힣]/,'combat step '+step);
  assert.doesNotMatch(text(l.rageZoom),/[가-힣]/);
 }
 c.P.rage=37;l.updateRage();assert.match(l.rageText.textContent,/37%/);
});
test('English resource practice translates every active and retained step',()=>{
 const {l,r}=setup('en');r.start(l);
 for(const step of [0,1,2,3,4,5,6,7,8,9,10]){
  l.step=step;l.phase='practice';r.enter(l);l.render();
  assert.doesNotMatch(text(l.panel),/[가-힣]/,'resource step '+step);
 }
});
test('changing locale during paused practice preserves checks and current stage',()=>{
 const {c,l,r}=setup('ko');r.start(l);l.checks[0]=true;l.step=1;l.render();
 c.G.paused=true;c.OPT.lang='en';l.tick();
 assert.doesNotMatch(text(l.panel),/[가-힣]/);
 assert.equal(l.step,1);assert.equal(l.checks[0],true);
 c.OPT.lang='ko';l.tick();assert.match(l.title.textContent,/[가-힣]/);
});
