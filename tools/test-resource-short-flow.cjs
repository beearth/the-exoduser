const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {fixture}=require('./test-parry-lesson.cjs');
for(const search of ['', '?practice=2']){
  const c=fixture(0,search);c.pGuardAbsorb=()=>.3;
  vm.runInContext(fs.readFileSync('resource-practice.js','utf8'),c);
  const l=c.window._parryLesson,r=c.window._resourcePractice;
  let badge=null;c.window._tutorialBadges={complete(id,checks){badge={id,checks:Array.from(checks)};}};
  l.tick();
  if(l.chapter!==2){l.phase='done';l.transitionTicks=1;l.tick();}
  assert.equal(l.rowLabels.filter(row=>!row.removed).length,7,'only seven tasks appear in chapter two');
  const order=[0,1,2,3,7,8,9];
  for(const [index,step] of order.entries()){
    assert.equal(l.step,step,'excluded movement/resource tasks are never entered');
    assert.match(l.subtitle.textContent,new RegExp(`${index+1} / 7`));
    assert.equal(badge,null,'unfinished required tasks do not award a badge');
    l.completeStep();
    if(step===9){assert.equal(badge.id,'resources');assert.deepEqual(badge.checks,Array(7).fill(true));}
    for(let n=0;n<91;n++)l.tick();
  }
  assert.equal(l.active,false);
  assert.equal(l.checks[4],false,'excluded tasks are not falsely marked complete');
  assert.equal(l.checks[5],false);assert.equal(l.checks[6],false);
  assert.equal(c.P.hp,81,'completion restores original character state');
}
console.log('PASS: seven visible tasks, 0→1→2→3→7→8→9, no excluded task credit, seven-check badge, default/direct entry and restoration.');
