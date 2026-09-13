const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('game.html','utf8');
class Element{
  constructor(){this.children=[];this.style={};this.hidden=false;}
  append(...items){this.children.push(...items)}
  replaceChildren(...items){this.children=items}
  setAttribute(){} addEventListener(){} blur(){}
}
function fixture(){
  const c={window:{},P:{skills:{kiSlash:1},hp:100},PASSIVES:{},G:{on:true,paused:false},
    document:{createElement:()=>new Element(),body:new Element(),addEventListener(){}},
    BINDS:{weapon:'mouse0',beam:'mouse2',shield:'KeyE',parry:'KeyQ',skillCycle:'KeyL'},
    SKILL_SLOTS:[null,null,null,null,null,null],ULT_SLOT:null,
    keyName:x=>x,_L:(a)=>a,_isAbsorbed:()=>false,_getAllAbsorbed:()=>[],
    dbSaveNow(){c.saved++},saved:0};
  vm.createContext(c);
  for(const name of ['SKILL_LIST','PASSIVE_DEF','SKILL_SLOT_DEFS']){
    const re=name==='SKILL_SLOT_DEFS'?/const SKILL_SLOT_DEFS=(\{[\s\S]*?\n\});/:new RegExp('const '+name+'=(\\[[\\s\\S]*?\\n\\]);');
    const m=html.match(re);assert.ok(m,name);vm.runInContext('var '+name+'='+m[1],c);
  }
  c._skById=id=>c.SKILL_LIST.find(s=>s.id===id);
  vm.runInContext(fs.readFileSync('skill-tutorial.js','utf8'),c);
  return c;
}
const c=fixture(),t=c.window._skillTutorial;
let before=t.snapshot();c.P.skills.ghostWalk=1;c.P.skills.holyDome=1;c.PASSIVES.pAtk=1;t.record(before);
assert.deepEqual(Array.from(t.state().queue),['ghostWalk','holyDome','passive:pAtk']);
before=t.snapshot();c.P.skills.ghostWalk=2;c.PASSIVES.pAtk=2;t.record(before);
assert.equal(t.state().queue.length,3,'upgrades do not enqueue tutorials');
c.G.paused=true;t.tick();assert.equal(t.current,null,'wait until learning panel closes');
c.G.paused=false;t.tick();assert.equal(t.current,'ghostWalk');
t.used('ghostWalk');assert.equal(t.state().done.length,0,'reading is not practice');
t.begin();t.used('holyDome');assert.equal(t.current,'ghostWalk','wrong skill does not pass');
t.used('ghostWalk');assert.equal(t.phase,'success');assert.ok(t.state().done.includes('ghostWalk'));
t.next();t.tick();assert.equal(t.current,'holyDome');
t.defer();t.tick();assert.equal(t.current,'passive:pAtk');t.confirm();assert.ok(t.state().done.includes('passive:pAtk'));
const saved=JSON.parse(JSON.stringify(t.serialize()));
assert.ok(saved.queue.includes('holyDome'),'later keeps unfinished tutorial in character save');
const d=fixture(),u=d.window._skillTutorial;d.P.skills.holyDome=1;u.restore(saved);u.tick();assert.equal(u.current,'holyDome');
before=u.snapshot();d.P.skills.holyDome=0;u.record(before);u.tick();assert.equal(u.current,null,'unlearned queued skill cannot block queue');
// Temporary practice grants must never be persisted or announced.
d.window._parryLesson={active:true};before=u.snapshot();d.P.skills.fireBeam=1;u.record(before);assert.ok(!u.state().queue.includes('fireBeam'));
d.window._parryLesson.active=false;
// Every currently defined skill and passive has its own usable guide.
for(const sk of d.SKILL_LIST){const g=u.guide(sk.id);assert.ok(g&&g.title&&g.effect&&g.task,sk.id);assert.ok(['practice','explain'].includes(g.mode),sk.id);}
for(const pd of d.PASSIVE_DEF){assert.equal(u.guide('passive:'+pd.key).mode,'explain');}
// Opening an aim indicator cannot pass a placement tutorial.
d.P.skills.iceStorm=1;u.learned('iceStorm');u.tick();u.begin();d.P._isAiming=true;u.used('iceStorm');assert.equal(u.phase,'practice');
d.P._isAiming=false;u.used('iceStorm');assert.equal(u.phase,'success');
u.next();d.P.skills.ghostWalk=1;u.replay('ghostWalk');u.begin();d.G.paused=true;u.used('ghostWalk');assert.equal(u.phase,'practice');
const bad=fixture().window._skillTutorial;bad.restore({queue:['missing','ghostWalk','ghostWalk'],done:['missing','holyDome']});assert.deepEqual(Array.from(bad.state().queue),['ghostWalk']);
for(const id of ['venomBlade','maliceHunt','ltnChaser','timeWarp','burstLoop']){
  const f=fixture(),a=f.window._skillTutorial;f.P.skills[id]=1;a.learned(id);a.tick();a.begin();
  a.used(id);assert.equal(a.phase,'practice',id+' dispatcher/charge alone is not success');
  a.used(id,true);assert.equal(a.phase,'success',id+' committed cast completes practice');
}
// Execute the real automatic learning transaction, including its companion grant.
const f=fixture(),a=f.window._skillTutorial;
Object.assign(f,{_malCost:x=>x,_findAutoSkillSlot:()=>-1});f.P.sp=100;f.G.mats=100;
vm.runInContext(html.match(/function _learnSkillAuto\(sk\)\{[\s\S]*?\n\}/)[0],f);
f._learnSkillAuto(f._skById('chainAssault'));
assert.deepEqual(Array.from(a.state().queue),['chainAssault','chainSlam']);
const stable=JSON.stringify(a.serialize());f.P.sp=0;f._learnSkillAuto(f._skById('ghostWalk'));assert.equal(JSON.stringify(a.serialize()),stable);
// New characters receive their starting-skill lessons after introductory practice.
const fresh=fixture();fresh.P.lv=1;fresh.window._parryLesson={active:true};fresh.window._skillTutorial.tick();assert.equal(fresh.P._skillTutorial,undefined);
fresh.window._parryLesson.active=false;fresh.window._skillTutorial.tick();assert.equal(fresh.window._skillTutorial.current,'kiSlash');
console.log(`PASS skill tutorials: ${d.SKILL_LIST.length} skills + ${d.PASSIVE_DEF.length} passives, first acquisition, ordered queue, upgrades, saves, deferral, practice isolation and successful use.`);
module.exports={fixture};
