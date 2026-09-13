const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
for (const name of ['game.html', 'game-easy-test.html']) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  for (const [, attrs, code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/src\s*=|importmap|application\/json/i.test(attrs) || !code.trim()) continue;
    if (/type\s*=\s*["']module/.test(attrs)) new vm.SourceTextModule(code);
    else new vm.Script(code, { filename: name });
  }
}
class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.style = {}; }
  append(...children) { this.children.push(...children); }
  prepend(child) { this.children.unshift(child); }
  setAttribute() {}
  addEventListener() {}
  remove() { this.removed = true; }
  blur() {}
  after(node) { this.afterNode=node; }
}
function fixture(stage = 0, search = '') {
  const c = vm.createContext({ window: {}, document: { createElement: tag => new Element(tag), getElementById: () => null, body: new Element('body') }, URLSearchParams, location: { search },
    BINDS: { weapon:'mouse0',beam:'mouse2',parry: 'KeyQ', shield: 'KeyE', charge:'ShiftLeft',bow:'Space',up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD' }, BINDS2:{}, SKILL_SLOTS:[null,null,null,null,'customRage'],_harpGauge:24,_HARP_GAUGE_MAX:180,_harpActive:false,_dashActive:false, K: {}, KH: {}, MB: {}, _dtSp: 1,
    _EDITOR_MODE: false, _bossTestReq: -1, _MAP_QA_MODE: false, _saving: false,
    G: { stage, spawnHoles: [{}], rifts: [{}], _bonfire: { t: 300 } },
    P: { skills:{bladeDash:0},_fused:{existing:true},rage:17,parryBank:4,hp: 81, mhp: 100, mp: 42, mmp: 100, st: 51, mst: 100, shield: 9, iframes: 30, x: 500, y: 500, activeQSk: 'peaceShield', kb: { x: 0, y: 0 } },
    ens: [{}], projs: [{}], pProjs: [{}], worldItems: [{}], EL: { P:0,F:1,I:2,D:3,L:4,H:5 }, _stopShieldLoop() {}, _recycleProj() {},
    addParts() {}, doHitFlash() {}, shake() {}, playSample() {}, addTxt() {},
    _addBoom() {}, _spawnSmoke() {},
    playVFXAng() {}, _addBloodSplat() {},
    mkEn(x,y) { return {x,y,hp:100,mhp:100,alive:true,kb:{x:0,y:0}}; },
  });
  c.spawnProj = props => { const shot = { ...props }; c.projs.push(shot); return shot; };
  vm.runInContext(fs.readFileSync(path.join(root, 'parry-lesson.js'), 'utf8'), c);
  return c;
}
function walk(c) {
  const l=c.window._parryLesson;
  assert.equal(l.step,-3);assert.equal(l.allowKey('KeyQ'),false);
  assert.equal(l.allowKey('KeyW'),true);assert.equal(l.allows('up'),true);
  for(let i=0;i<30;i++)l.tick();assert.equal(l.movementDone,false);assert.equal(l.shot,null);
  for(let i=0;i<4;i++){c.P.y-=30;l.tick();}
  assert.equal(l.movementDone,true);l.releaseKey('KeyW');
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,-2);
  assert.equal(l.allows('weapon'),true);assert.equal(l.allows('beam'),false);
  c.MB[0]=true;l.tick();assert.equal(l.leftClickDone,false);
  c.P.s='wSwing';l.tick();assert.equal(l.leftClickDone,true);
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,-1);
  assert.equal(l.allows('beam'),true);assert.equal(l.allows('weapon'),false);
  c.MB[2]=true;l.tick();assert.equal(l.rightClickDone,false);
  c.P.s='magicCast';l.tick();assert.equal(l.rightClickDone,true);
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,0);
  assert.equal(l.allows('left'),true);
  c.P.x+=20;const x=c.P.x;l.tick();assert.equal(c.P.x,x);
}
for (const [stage, search] of [[1, ''], [0, '?tutorial=0'], [0, '?projectilelab=1']]) {
  const c = fixture(stage, search); assert.equal(c.window._parryLesson.tick(), false); assert.equal(c.window._parryLesson.active, false);
}
const c = fixture(), lesson = c.window._parryLesson;
const original = { ens: c.ens, projs: c.projs, pProjs: c.pProjs, worldItems: c.worldItems, holes: c.G.spawnHoles, fire: c.G._bonfire };
c.G._intro = true; assert.equal(lesson.tick(), false); c.G._intro = false;
assert.equal(lesson.tick(), true); assert.equal(c.ens.length, 0); assert.equal(c.G.spawnHoles.length, 0);
assert.equal(lesson.allows('weapon'), false); assert.equal(lesson.allows('parry'), false);
lesson.button.onclick(); walk(c); for (let i = 0; i < 45; i++) lesson.tick();
assert.ok(lesson.shot); const first = lesson.shot;
lesson.hit(first, 'physical'); assert.equal(lesson.checks[0], false);
lesson.hit({}, 'magic'); assert.equal(lesson.checks[0], false);
c.projs.length = 0; lesson.tick(); assert.equal(lesson.checks[0], false);
for (let i = 0; i < 60; i++) lesson.tick(); assert.ok(lesson.shot); assert.notEqual(lesson.shot, first);
const reflected = lesson.shot;
lesson.hit(reflected, 'magic'); assert.equal(lesson.tick(), false); assert.equal(lesson.rows[0].checked, true); assert.equal(lesson.phase, 'success');
assert.equal(lesson.shot, reflected); assert.equal(lesson.button.hidden, true);
for (let i = 0; i < 89; i++) assert.equal(lesson.tick(), false);
assert.equal(lesson.phase, 'practice'); assert.equal(lesson.step, 1);
for (let i = 0; i < 45; i++) lesson.tick();
// Failing E retries E without clearing the completed Q checkbox.
c.projs.length = 0; lesson.tick(); assert.equal(lesson.checks[0], true); assert.equal(lesson.step, 1);
for (let i = 0; i < 60; i++) lesson.tick();
lesson.hit(lesson.shot, 'physical'); assert.equal(lesson.tick(), false); assert.equal(lesson.phase, 'success'); assert.equal(lesson.rows[1].checked, true);
for (let i = 0; i < 89; i++) assert.equal(lesson.tick(), false);
assert.equal(lesson.step,2);assert.equal(c.projs.length,0);
// Hold/release alone cannot pass: require three distinct native parry events in one release.
c.P.s='sBlock';c.P._sbHoldT=1;lesson.tick();assert.equal(lesson.volley.length,5);
const firstWave=lesson.volley.slice();
assert.equal(new Set(firstWave.map(p=>p._lessonKind)).size,5);
assert.ok(firstWave.every(p=>p.parryClass==='magic'));
assert.ok(firstWave.some(p=>p.fireMagic)&&firstWave.some(p=>p.waterBean)&&firstWave.some(p=>p.gbBean)&&firstWave.some(p=>p.blackBean));
lesson.hit(firstWave[0],'magic');assert.equal(lesson.volleyHits.size,0); // before release
lesson.holdRelease('magic',40);lesson.tick();assert.equal(lesson.checks[2],false);
for(let i=0;i<60;i++)lesson.tick();
c.P.s='sBlock';c.P._sbHoldT=120;lesson.tick();const wave=lesson.volley.slice();
lesson.holdRelease('magic',120);c.P.s='idle';c.P._sbReleaseR=300;c.P._sbParryT=12;lesson.tick();assert.equal(lesson.checks[2],false);
lesson.hit(firstWave[0],'magic');assert.equal(lesson.volleyHits.size,0); // old volley is invalid
lesson.hit(wave[0],'physical');assert.equal(lesson.volleyHits.size,0);
lesson.hit(wave[0],'magic');lesson.hit(wave[0],'magic');assert.equal(lesson.volleyHits.size,1);
lesson.hit(wave[1],'magic');assert.equal(lesson.checks[2],false);
lesson.hit(wave[2],'magic');assert.equal(lesson.checks[2],true);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,3);
c.P.s='kiGather';c.P._kgChg=180;lesson.tick();assert.equal(lesson.volley.length,5);
assert.deepEqual(Array.from(lesson.volley,p=>p._lessonKind),['이빨입탄','혈안탄','관통탄','물리 검기파','물리 환영검']);
for(const name of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(path.join(root,name),'utf8');
 const start=source.indexOf('function _projectileParryClass(p){');
 const end=source.indexOf('\n}',start)+2;
 vm.runInContext(source.slice(start,end),c);
 for(const shot of lesson.volley){
  assert.equal(shot.parryClass,undefined,'physical classification must come from the engine, not a forced lesson override');
  assert.equal(c._projectileParryClass(shot),'physical',shot._lessonKind);
  assert.equal(shot.homing,true);
  assert.ok(Math.abs(Math.hypot(shot.vx,shot.vy)-6.4)<1e-10);
 }
}
assert.equal(lesson.volley[1].el,c.EL.F,'red eye preserves its original fire element and physical parry identity');
assert.equal(lesson.volley[2].pierce,true);
assert.equal(lesson.volley[3].swordWave,true);
assert.equal(lesson.volley[4].phantomSword,true);

lesson.holdRelease('physical',180);c.P.s='sBash';c.P._sBashChgMul=3;
// Two hits time out; another release cannot accumulate them into a success.
lesson.hit(lesson.volley[0],'physical');lesson.hit(lesson.volley[1],'physical');
for(let i=0;i<24;i++)lesson.tick();assert.equal(lesson.checks[3],false);assert.equal(lesson.volleyHits.size,0);
for(let i=0;i<60;i++)lesson.tick();c.P.s='kiGather';c.P._kgChg=180;lesson.tick();
lesson.holdRelease('physical',180);c.P.s='sBash';c.P._sBashChgMul=3;
for(const shot of lesson.volley.slice(0,3)){
 shot.friendly=true;shot.parryBlueBean=true;shot.parryClass='physical';lesson.physicalParry(shot.x,shot.y);
}
assert.equal(lesson.checks[3],true);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,4);
assert.equal(lesson.allowKey('Space'),false);assert.equal(lesson.allowKey('ShiftLeft'),true);
lesson.tick();assert.equal(lesson.checks[4],false);c._harpActive=true;lesson.tick();assert.equal(lesson.checks[4],true);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,5);
c.P._bdMoveT=6;lesson.tick();assert.equal(lesson.checks[5],false); // dash alone is not the requested combination
c.KH.ArrowUp=true;assert.equal(lesson.allowKey('Space'),true);lesson.tick();assert.equal(lesson.checks[5],true);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,6);
for(let i=0;i<45;i++)lesson.tick();assert.equal(lesson.volley.length,10);
assert.equal(c.P.rage,0); // Spawning must never grant rage.
const rageVolley=lesson.volley.slice();
assert.ok(rageVolley.every(p=>p.parryClass==='magic'&&p.homing));
assert.equal(new Set(rageVolley.map(p=>p._lessonKind)).size,5);
lesson.hit({},'magic');assert.equal(lesson.rageParried,false);
for(const shot of rageVolley.slice(0,3)){shot.friendly=true;lesson.hit(shot,'magic');c.P.rage+=10;}
lesson.hit(rageVolley[0],'magic');assert.equal(lesson.volleyHits.size,3);
for(let i=0;i<110;i++)lesson.tick();assert.equal(lesson.checks[6],false);
assert.equal(lesson.volley[0],rageVolley[0]); // Partial reflection must not clear incoming shots.
for(const shot of rageVolley.slice(3)){shot.friendly=true;lesson.hit(shot,'magic');c.P.rage+=10;}
lesson.tick();assert.equal(lesson.checks[6],true);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,7);assert.equal(lesson.rageZoom.hidden,false);assert.equal(lesson.allowKey('Space'),false);
for(let i=0;i<150;i++)lesson.tick();assert.equal(lesson.rageZoom.hidden,true);
c.KH.KeyW=true;assert.equal(lesson.allowKey('Space'),false);lesson.rageCast(100);assert.equal(lesson.checks[7],false);
c.KH.KeyW=false;assert.equal(lesson.allowKey('KeyW'),true);assert.equal(lesson.allowKey('Space'),false);lesson.releaseKey('KeyW');assert.equal(lesson.allowKey('Space'),true);lesson.rageCast(0);assert.equal(lesson.checks[7],false);
lesson.rageCast(100);assert.equal(lesson.tick(),false);assert.equal(lesson.phase,'done');
for(let i=0;i<89;i++)lesson.tick();assert.equal(lesson.active,false);
assert.equal(c.P.rage,17);assert.equal(c.P.skills.bladeDash,0);assert.equal(c.P._fused.existing,true);assert.equal(c.SKILL_SLOTS[4],'customRage');assert.equal(c._harpGauge,24);assert.equal(c.BINDS2.up,undefined);
for (const key of ['ens', 'projs', 'pProjs', 'worldItems']) assert.equal(c[key], original[key]);
assert.equal(c.G.spawnHoles, original.holes); assert.equal(c.G._bonfire, original.fire);
assert.equal(c.P.mp, 42); assert.equal(c.P.hp, 81); assert.equal(c.P.activeQSk, 'peaceShield');
assert.equal(lesson.tick(), false); // no repeat during the same stage visit
const skip = fixture(); skip.window._parryLesson.tick(); skip.window._parryLesson.finish();
assert.equal(skip.window._parryLesson.checks.some(Boolean), false);
assert.equal(skip.P.st, 51);
// Exercise the actual collision gate expressions from both integration sites.
const html = fs.readFileSync(path.join(root, 'game.html'), 'utf8');
const gates = [
  ["if(p.redBean&&_parryClass==='physical'&&!_pHit", { p: { redBean: true }, _parryClass: 'physical', _pHit: false, _pDist: 70, _rbDeflR: 110, _sbActive: true }, '_sbActive'],
  ["if(_qParryActive&&_parryClass==='magic'){ // 마법탄", { _qParryActive: true, _parryClass: 'magic' }, '_qParryActive'],
];
for (const [start, vars, active] of gates) {
  const offset = html.indexOf(start); assert.ok(offset > 0);
  const expression = html.slice(offset + 3, html.indexOf('){', offset));
  assert.equal(vm.runInNewContext(expression, vars), true);
  assert.equal(vm.runInNewContext(expression, { ...vars, [active]: false }), false);
  assert.equal(vm.runInNewContext(expression, { ...vars, _parryClass: vars._parryClass === 'magic' ? 'physical' : 'magic' }), false);
}
const failure = fixture(), fl = failure.window._parryLesson;
fl.tick();fl.button.onclick();walk(failure);for(let i=0;i<45;i++)fl.tick();
let blasts=0, spriteBlasts=0;failure.addParts=()=>blasts++;failure._addBoom=()=>spriteBlasts++;
fl.miss(fl.shot);assert.equal(failure.P.hp,71);assert.equal(blasts,1);
assert.equal(spriteBlasts,1);
let bloodHits=0, fireSmoke=0;failure.playVFXAng=(id)=>{assert.equal(id,'death_blood');bloodHits++;};failure._spawnSmoke=()=>fireSmoke++;
fl.explode({el:failure.EL.P,x:0,y:0,vx:1,vy:0});
assert.equal(bloodHits,1);assert.equal(spriteBlasts,1);assert.equal(fireSmoke,0);
fl.miss(fl.shot);assert.equal(failure.P.hp,71);
assert.equal(spriteBlasts,1);
fl.hit(fl.shot,'magic');assert.equal(fl.checks[0],false);
for(let i=0;i<59;i++)fl.tick();assert.equal(failure.P.hp,71);
fl.tick();assert.equal(failure.P.hp,81);assert.equal(fl.step,0);
failure.P.hp=3;fl.miss({_lessonShot:true,x:0,y:0});assert.equal(failure.P.hp,1);
fl.finish();assert.equal(failure.P.hp,81);
const retry=fixture(), rl=retry.window._parryLesson;
rl.tick();rl.button.onclick();rl.step=2;rl.fireVolley();
let retryBlasts=0;retry._addBoom=()=>retryBlasts++;
rl.volley[0].friendly=true;rl.retryVolley();assert.equal(retryBlasts,4);assert.equal(retry.projs.length,0);
for(const file of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const reflect=source.match(/function _eCanReflectProjectile\(p\)\{[\s\S]*?\n\}/)[0];
  const rc=vm.createContext({P:{s:'sBash',_stWingT:0},_projectileParryClass:p=>p.parryClass,_isBigEnergy:p=>!!p.fbEnergy,_isFused:()=>true});
  vm.runInContext(reflect,rc);
  assert.equal(rc._eCanReflectProjectile({parryClass:'magic'}),false);
  assert.equal(rc._eCanReflectProjectile({parryClass:'physical'}),true);
  rc.P._stWingT=40;assert.equal(rc._eCanReflectProjectile({parryClass:'magic'}),true);
  assert.equal(rc._eCanReflectProjectile({parryClass:'magic',blackBean:true}),false);
  assert.equal(rc._eCanReflectProjectile({parryClass:'magic',fbEnergy:true}),false);
  assert.equal(rc._eCanReflectProjectile({parryClass:'forbidden'}),false);
  const offset=source.indexOf("if(_qZone==='absorb'");
  const body=source.slice(offset,source.indexOf('// 대형 에너지탄 전용',offset));
  const target={_lessonShot:true,friendly:false};let misses=0,recycled=0;
  vm.runInNewContext('for(const p of shots){'+body+'}',{shots:[target],_qZone:'absorb',P:{},window:{_parryLesson:{miss(){misses++}}},_recycleProj(){recycled++}});
  assert.equal(misses,1);assert.equal(recycled,1);assert.equal(target.life,0);
}
const crowd=fixture(), cl=crowd.window._parryLesson;
const focusChanges=[];crowd.document.getElementById=id=>id==='skBar'?{classList:{toggle(name,on){focusChanges.push([name,on]);}}}:null;
cl.tick();cl.step=7;cl.spawnRageEnemies();assert.equal(crowd.ens.length,24);
cl.setRageFocus(true);assert.equal(cl.rageZoom.hidden,false);assert.deepEqual(focusChanges.at(-1),['lesson-rage-focus',true]);
assert.ok(crowd.ens.every(e=>Math.hypot(e.x-crowd.P.x,e.y-crowd.P.y)<=281));
cl.hurtEnemy(crowd.ens[0],100);assert.equal(crowd.ens[0].alive,true);
crowd.P.s='gSlamWindup';for(const e of crowd.ens)cl.hurtEnemy(e,100);
assert.ok(crowd.ens.every(e=>!e.alive));cl.finish();assert.equal(crowd.ens.length,1);
assert.deepEqual(focusChanges.at(-1),['lesson-rage-focus',false]);
// The arrow stays aligned to the live HUD slot, including narrow viewports.
{
  const c=fixture(), lesson=c.window._parryLesson;
  let rect={left:1000,width:220,top:800};
  c.window.innerWidth=1440;c.window.innerHeight=1000;
  c.document.getElementById=id=>id==='skSlot1'?{getBoundingClientRect:()=>rect}:null;
  lesson.tick();lesson.step=7;lesson.render();lesson.setRageFocus(true);
  assert.equal(lesson.rageBox.hidden,true);
  assert.equal(lesson.rageZoom.style.left,'970px');
  assert.equal(lesson.rageZoom.style.bottom,'234px');
  assert.equal(lesson.rageArrow.style.left,'140px');
  c.window.innerWidth=390;c.window.innerHeight=800;rect={left:260,width:80,top:600};
  lesson.positionRageFocus();
  assert.equal(lesson.rageZoom.style.left,'98px');
  assert.equal(lesson.rageArrow.style.left,'202px');
  assert.equal(parseFloat(lesson.rageZoom.style.left)+parseFloat(lesson.rageArrow.style.left),300);
  lesson.setRageFocus(false);assert.equal(lesson.rageZoom.hidden,true);
}
// Rage practice retries a whole volley and preserves only earned rage.
{
  const c=fixture(), l=c.window._parryLesson;
  l.tick();l.button.onclick();l.step=6;l.cooldown=0;l.tick();
  const first=l.volley.slice();
  first[0].friendly=true;l.hit(first[0],'magic');c.P.rage=10;
  for(const p of first.slice(1))p.life=0;
  for(let i=0;i<44;i++)l.tick();assert.equal(l.volley[0],first[0]);
  for(let i=0;i<61;i++)l.tick();assert.equal(l.volley.length,10);
  assert.notEqual(l.volley[0],first[0]);assert.equal(c.P.rage,10);
  l.miss(l.volley[0]);assert.equal(c.P.hp,71);
  for(let i=0;i<105;i++)l.tick();assert.equal(c.P.hp,81);
  assert.equal(l.volley.length,10);assert.equal(c.P.rage,10);assert.equal(l.checks[6],false);
  l.finish();assert.equal(c.P.rage,17);
}
console.log('PASS: HTML syntax; eleven stages; left/right attack states; charged volleys; movement; rage zoom/cast; 24 practice enemies and slam kills; miss explosion, HP loss, duplicate protection, recovery; retry/skip and restoration; live parry gates.');
module.exports={fixture};

for(const file of ['game.html','game-easy-test.html']){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const turn=html.slice(html.indexOf('function _enemyHomingTurnRate('),html.indexOf('function _isBigEnergy('));
 const context=vm.createContext({_projectileParryClass:p=>p.parryClass||'magic'});vm.runInContext(turn,context);
 for(const flags of [{},{blackBean:true},{phantomSword:true},{parryClass:'physical'},{titanEye:true},{waterBean:true},{pierce:true}]){
  assert.equal(context._enemyHomingTurnRate({...flags,_lessonShot:true}),100*Math.PI/180/60);
 }
 assert.equal(context._enemyHomingTurnRate({parryClass:'physical'}),.00436332);
 assert.equal(context._enemyHomingTurnRate({blackBean:true}),.02325);
 assert.equal(context._enemyHomingTurnRate({_lessonShot:true,friendly:true,blackBean:true}),.02325);
 assert.ok(html.includes('const _vsT=!p._lessonShot&&'));
 assert.ok(html.includes('const _ancT=!p._lessonShot&&!p.blackBean?'));
}
console.log('PASS: all hostile tutorial projectile types turn at 100 degrees/second; normal and reflected profiles are preserved; practice targets player.');
