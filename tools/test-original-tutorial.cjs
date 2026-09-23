const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {fixture}=require('./test-parry-lesson.cjs');
const root=path.join(__dirname,'..');
for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  assert.equal(/skill-tutorial\.(?:js|css)|_skillTutorial|skillTutorial:/.test(html),false,'unrequested skill guide must not load, run or save');
  const c=fixture(0,'');
  c.G.on=true;c.INV={bag:[],equipped:{}};c.keyName=key=>key;
  for(const script of ['resource-practice.js','system-lesson.js'])vm.runInContext(fs.readFileSync(path.join(root,script),'utf8'),c);
  const start=html.indexOf('function update(){'),end=html.indexOf('  if(_EDITOR_MODE)',start);
  assert.ok(end>start);
  vm.runInContext(html.slice(start,end)+'}\nupdate();',c);
  const lesson=c.window._parryLesson;
  assert.equal(lesson.active,true,'default first frame starts original combat tutorial');
  assert.equal(lesson.chapter,1);
  assert.equal(lesson.phase,'intro');
  assert.equal(c.window._systemLesson.active,false);
  lesson.phase='done';lesson.transitionTicks=1;c.update();
  assert.equal(lesson.active,true);
  assert.equal(lesson.chapter,2,'original resource tutorial follows combat');
  assert.equal(lesson.title.textContent,'자원 소개 · 해골눈');
  assert.equal(c.window._systemLesson.active,false);
}
console.log('PASS: both entrypoints start the original chapter 1, continue into chapter 2, and contain no added skill popup hooks.');
