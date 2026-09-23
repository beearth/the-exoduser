const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {fixture}=require('./test-parry-lesson.cjs');
for(const query of ['', '?resourceTutorial=0', '?resourceTutorial=1']){
  const c=fixture(0,query);c.G.on=true;c.INV={bag:[],equipped:{}};c.keyName=code=>code;
  c.P.activeCtSk='iceOrb';
  for(const file of ['resource-practice.js','system-lesson.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c);
  const l=c.window._parryLesson,s=c.window._systemLesson;
  l.tick();s.tick();assert.equal(s.active,false,'system guide waits for combat practice');
  l.phase='done';l.transitionTicks=90;
  for(let tick=0;tick<89;tick++)l.tick();
  assert.equal(l.active,true,'retain combat success display');
  l.tick();s.tick();
  if(query!=='?resourceTutorial=0'){
    assert.equal(l.active,true);assert.equal(l.chapter,2);assert.equal(s.active,false);
    assert.equal(l.title.textContent,'자원 소개 · 해골눈');
    l.phase='done';l.transitionTicks=1;l.tick();s.tick();
    assert.equal(l.active,false);assert.equal(s.active,true,'system guide waits until resource practice finishes');
  }else{
    assert.equal(l.active,false,'only explicit opt-out skips resource practice');
    assert.equal(l.chapter,1);assert.equal(s.active,true,'system guide follows combat directly');
    assert.equal(c.P.hp,81);assert.equal(c.P.mp,42);assert.equal(c.P.st,51);
    assert.equal(c.P.activeCtSk,'iceOrb');assert.equal(c.P.skills.ghostWalk,undefined);
  }
}
console.log('PASS: default combat -> resources -> system guide; 90-tick transition and original restoration; explicit opt-out and direct opt-in retained.');
