const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.attrs = {}; this.events = {}; this.classList = { contains: name => name === 'on' && !!this.open }; }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attrs[name] = value; }
  addEventListener(name, fn) { this.events[name] = fn; }
  remove() { this.removed = true; }
}
function fixture(search = '') {
  const panels = Object.fromEntries(['invPanel','statPanel','skillPanel','forge'].map(id => [id, new Element('section')]));
  const c = vm.createContext({ window: { _parryLesson: { seen: true, active: false } }, location: { search }, URLSearchParams,
    document: { body: new Element('body'), createElement: tag => new Element(tag), getElementById: id => panels[id] },
    G: { on: true, stage: 0, mats: 8 }, P: { hp: 80, mhp: 100, lv: 1 }, INV: { bag: [], equipped: {}, selected: null },
    BINDS: { interact:'KeyR', inventory:'Tab', stats:'KeyJ', skill:'KeyK', forge:'KeyG' }, BINDS2: {},
    keyName: code => code.replace('Key',''), _EDITOR_MODE: false, _MAP_QA_MODE: false, _bossTestReq: -1, _saving: false
  });
  vm.runInContext(fs.readFileSync(path.join(root,'system-lesson.js'),'utf8'), c);
  return { c, panels, lesson: c.window._systemLesson };
}
for (const search of ['?tutorial=0','?systemTutorial=0','?projectilelab=1']) {
  const {lesson} = fixture(search); lesson.tick(); assert.equal(lesson.active,false);
}
for (const flag of ['_EDITOR_MODE','_MAP_QA_MODE','_saving']) {
  const {c,lesson} = fixture(); c[flag]=true; lesson.tick(); assert.equal(lesson.active,false);
}
for (const props of [{stage:1},{paused:true},{_intro:true},{on:false}]) {
  const {c,lesson} = fixture(); Object.assign(c.G,props); lesson.tick(); assert.equal(lesson.active,false);
}
{
  const {c,lesson} = fixture(); c._bossTestReq=0; lesson.tick(); assert.equal(lesson.active,false);
}
{
  const {c,lesson} = fixture(); c.window._parryLesson.seen=false; lesson.tick(); assert.equal(lesson.active,false);
  c.window._parryLesson.seen=true; c.window._parryLesson.active=true; lesson.tick(); assert.equal(lesson.active,false);
  c.window._parryLesson.active=false; lesson.tick(); assert.equal(lesson.active,true);
}
const {c,panels,lesson} = fixture();
const before = JSON.stringify([c.G,c.P,c.INV,c.BINDS,c.BINDS2]);
lesson.tick(); assert.equal(lesson.steps.length,7); assert.equal(lesson.checks.size,0);
assert.equal(JSON.stringify([c.G,c.P,c.INV,c.BINDS,c.BINDS2]),before,'onboarding does not mutate game state');
const item={slot:'weapon',name:'test',rarity:0};
lesson.pickedUp(item); assert.equal(lesson.checks.size,0,'failed pickup must not count');
c.INV.equipped.weapon=item; lesson.pickedUp(item); assert.ok(lesson.checks.has('pickup'),'auto-equipped pickup counts');
assert.equal(lesson.checks.has('equipment'),false,'auto-equip alone is not inspection');
c.G.paused=true;panels.invPanel.open=true;lesson.tick();assert.ok(lesson.checks.has('inventory'));
c.INV.selected='eq:weapon';lesson.tick();assert.ok(lesson.checks.has('equipment'),'inspect auto-equipped gear while paused');
for(const [panel,id] of [['statPanel','stats'],['skillPanel','skills'],['forge','forge']]){panels[panel].open=true;lesson.tick();assert.ok(lesson.checks.has(id));}
lesson.recovered({hp:60,mats:8},{hp:80,mats:8,cooldown:10});assert.equal(lesson.checks.has('recovery'),false);
lesson.recovered({hp:60,mats:8},{hp:60,mats:7,cooldown:10});assert.equal(lesson.checks.has('recovery'),false);
lesson.recovered({hp:60,mats:8},{hp:80,mats:7,cooldown:0});assert.equal(lesson.checks.has('recovery'),false);
lesson.recovered({hp:60,mats:8},{hp:80,mats:7,cooldown:420});assert.equal(lesson.checks.size,7);
assert.equal(lesson.current(),undefined);assert.equal(lesson.skip.hidden,true);
assert.equal(lesson.panel.events.keyup,undefined,'keyup must reach the engine');
assert.equal(lesson.panel.events.mouseup,undefined,'mouseup must reach the engine');
{
  const {c,lesson}=fixture();lesson.tick();c.BINDS.interact='KeyV';lesson.tick();assert.match(lesson.hint.textContent,/\[V\]/);
  lesson.toggle.onclick();assert.equal(lesson.body.hidden,true);assert.equal(lesson.toggle.attrs['aria-expanded'],'false');
  lesson.skip.onclick();assert.ok(lesson.skipped.has('pickup'));assert.equal(lesson.checks.has('pickup'),false);
  const item={slot:'weapon'};c.INV.bag.push(item);lesson.pickedUp(item);assert.equal(lesson.checks.has('pickup'),false);
  c.window._parryLesson.active=true;lesson.tick();assert.equal(lesson.panel.hidden,true);lesson.record('stats');assert.equal(lesson.checks.size,0);
  c.window._parryLesson.active=false;c.G.stage=1;lesson.tick();assert.equal(lesson.panel.hidden,false,'continue across stage changes');
  c.G.on=false;lesson.tick();assert.equal(lesson.panel.hidden,true);
  c.G.on=true;c.P.hp=0;lesson.tick();assert.equal(lesson.panel.hidden,true);
  lesson.body.children.at(-1).children[1].onclick();assert.equal(lesson.panel.removed,true);lesson.tick();assert.equal(lesson.active,false);
}
// Run the real success/failure paths in both HTML integrations, with unrelated engine services stubbed.
for (const name of ['game.html','game-easy-test.html']) {
  const html=fs.readFileSync(path.join(root,name),'utf8');
  assert.equal((html.match(/src="system-lesson.js/g)||[]).length,1);
  assert.ok(html.includes('function update(){\n  window._systemLesson?.tick();') || html.includes('function update(){\r\n  window._systemLesson?.tick();'));
  for (const [,attrs,code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/src\s*=|importmap|application\/json/i.test(attrs)||!code.trim())continue;
    if (/type\s*=\s*["']module/.test(attrs))new vm.SourceTextModule(code);else new vm.Script(code);
  }
  const {c,lesson}=fixture();lesson.tick();
  Object.assign(c,{notify(){},_T:x=>x,_L:x=>x,_rarName:()=>'',playItemPickupSfx(){},playEquipSfx(){},recalcSt(){},applyStats(){},dbSaveForce(){},_itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0}),xferCost:()=>100});
  const pickup=html.slice(html.indexOf('function pickupItem(item){'),html.indexOf('function recalcSt(){',html.indexOf('function pickupItem(item){')));
  const equip=html.slice(html.indexOf('function equipItem(item){'),html.indexOf('function unequipItem(slot){'));
  vm.runInContext(pickup+'\n'+equip,c);
  const item={slot:'weapon',name:'test',rarity:0};c.INV.equipped.weapon={slot:'weapon'};
  c._invFindSpace=()=>null;assert.equal(c.pickupItem(item),false);assert.equal(lesson.checks.has('pickup'),false);
  c._invFindSpace=()=>({x:0,y:0});assert.equal(c.pickupItem(item),true);assert.ok(lesson.checks.has('pickup'));
  item.reqLv=99;c.equipItem(item);assert.equal(lesson.checks.has('equipment'),false);
  item.reqLv=1;c.INV.equipped.weapon.enh=1;c.equipItem(item);assert.equal(lesson.checks.has('equipment'),false,'unaffordable transfer fails');
  c.INV.equipped.weapon=null;c.equipItem(item);assert.ok(lesson.checks.has('equipment'));
  const auto=html.slice(html.indexOf('  const _apHealAmt='),html.indexOf('  // ─── [S16c]',html.indexOf('  const _apHealAmt=')));
  assert.ok(auto.length>0&&auto.length<3000);
  Object.assign(c,{autoPotCd:0,potHeal:()=>20,_eqAffix:()=>0,gl:()=>({}),blt:()=>({}),PASSIVES:{pRegen:0},SFX:{potion(){}},addTxt(){}});
  c.P.hp=90;vm.runInContext('{'+auto+'}',c);assert.equal(lesson.checks.has('recovery'),false);
  c.P.hp=60;vm.runInContext('{'+auto+'}',c);assert.ok(lesson.checks.has('recovery'));assert.equal(c.P.hp,80);assert.equal(c.G.mats,7);
}
console.log('PASS: system tutorial gating, real pickup/equip failures and successes, auto-heal conditions, paused panels, remapped keys, skip/close, release events, state preservation, both HTML scripts parse.');
