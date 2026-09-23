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
function exerciseChainTiers(c,l) {
  l.tick();assert.equal(l.checks[4],false);
  const savedCharge=c.BINDS.charge;c.BINDS.charge='mouse0';
  assert.equal(l.allowKey('ShiftLeft'),true,'saved custom charge bindings must not block the live Left Shift handler');
  c.BINDS.charge=savedCharge;
  // A held key and an active flag without resource consumption cannot complete a tier.
  c._harpActive=true;l.tick();assert.equal(l.checks[4],false);
  c._harpActive=false;l.tick();
  // Starting with a full charge must not skip the requested tap exercise.
  c._harpTier=3;c._harpGauge-=150;c._harpActive=true;l.tick();
  c._harpActive=false;l.tick();assert.equal(l.checks[4],false);
  assert.equal(l.chainPractice.target,1);
  // A cancelled shot or wall-blocked pull cannot be counted as movement.
  c._harpTier=1;c._harpGauge-=45;c._harpActive=true;l.tick();
  c._harpActive=false;l.tick();assert.equal(l.chainPractice.target,1);
  assert.equal(l.chainPractice.completed.length,0);assert.equal(c._harpGauge,c._HARP_GAUGE_MAX);
  for(const tier of [1,2,3]){
    c._harpTier=tier;c._harpGauge-=c._HARP_GAUGE_COST[tier];
    c._harpActive=true;c.KH.ShiftLeft=true;l.tick();
    const spent=c._harpGauge;
    for(let i=0;i<95;i++)l.tick();
    assert.equal(l.step,4,'never advance while the chain is still flying');
    assert.equal(l.checks[4],false);assert.equal(c._harpGauge,spent,'keep consumption visible during flight');
    c._harpActive=false;c._dashActive=true;c.P.x+=50;l.tick();
    c._dashActive=false;l.tick();assert.equal(l.checks[4],false,'release Shift before advancing');
    c.KH.ShiftLeft=false;l.tick();
    assert.equal(l.checks[4],tier===3,'all three tiers are required');
    assert.equal(l.chainPractice.completed.length,tier);
    if(tier<3){assert.equal(l.chainPractice.target,tier+1);assert.equal(c._harpGauge,c._HARP_GAUGE_MAX);}
  }
}
function fixture(stage = 0, search = '') {
  const c = vm.createContext({ window: {}, document: { createElement: tag => new Element(tag), getElementById: () => null, body: new Element('body') }, URLSearchParams, location: { search },
    BINDS: { weapon:'mouse0',beam:'mouse2',parry: 'KeyQ', shield: 'KeyE', charge:'ShiftLeft',bow:'Space',up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD' }, BINDS2:{}, SKILL_SLOTS:[null,null,null,null,'customRage'],_harpGauge:24,_HARP_GAUGE_MAX:180,_HARP_TIER_F:[0,1,6,12],_HARP_GAUGE_COST:[0,45,98,150],_harpDistTier:t=>[0,300,500,700][t],_harpTier:0,_harpActive:false,_dashActive:false, K: {}, KH: {}, MB: {}, _dtSp: 1,
    _EDITOR_MODE: false, _bossTestReq: -1, _MAP_QA_MODE: false, _saving: false,
    G: { stage, spawnHoles: [{}], rifts: [{}], _bonfire: { t: 300 } },
    P: { skills:{bladeDash:0},_fused:{existing:true},rage:17,parryBank:4,hp: 81, mhp: 100, mp: 42, mmp: 100, st: 51, mst: 100, shield: 9, iframes: 30, x: 500, y: 500, activeQSk: 'peaceShield', kb: { x: 0, y: 0 } },
    ens: [{}], projs: [{}], pProjs: [{}], worldItems: [{}], EL: { P:0,F:1,I:2,D:3,L:4,H:5 }, _stopShieldLoop() {}, _recycleProj() {},
    _spikeTrapDmg:()=>10,_spikeTrapSlowPct:()=>.91,_malCost:n=>n,_ffMoveE(e,sp,mul=1){e.y+=sp*mul;}, addParts() {}, doHitFlash() {}, shake() {}, playSample() {}, addTxt() {},
    _addBoom() {}, _spawnSmoke() {},
    playVFXAng() {}, _addBloodSplat() {},
    deaths:[],corpses:[],deathImpacts:[],gore:[],
    deathFX(...args){c.deaths.push(args);},_addCorpse(...args){c.corpses.push(args);},_addDeathImpact(...args){c.deathImpacts.push(args);},_addGorePiece(...args){c.gore.push(args);},
    mkEn(x,y) { return {x,y,r:12,etype:0,col:'#ff0000',hp:100,mhp:100,alive:true,kb:{x:0,y:0}}; },
  });
  c.spawnProj = props => { const shot = { ...props }; c.projs.push(shot); return shot; };
  vm.runInContext(fs.readFileSync(path.join(root, 'parry-lesson.js'), 'utf8'), c);
  return c;
}
function walk(c) {
  const l=c.window._parryLesson;
  assert.equal(c.P.activeLMBSk,'kiSlash','the tutorial must use Ki Slash as its basic attack');
  assert.ok(c.P.skills.kiSlash>=1);
  assert.equal(l.step,-3);assert.equal(l.allowKey('KeyQ'),false);
  assert.equal(l.allowKey('KeyW'),true);assert.equal(l.allows('up'),true);
  for(let i=0;i<30;i++)l.tick();assert.equal(l.movementDone,false);assert.equal(l.shot,null);
  for(let i=0;i<4;i++){c.P.y-=30;l.tick();}
  assert.equal(l.movementDone,true);l.releaseKey('KeyW');
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,-2);
  assert.equal(l.allows('weapon'),true);assert.equal(l.allows('beam'),false);
  c.MB[0]=true;l.tick();assert.equal(l.leftClickDone,false);
  c.P.s='wSwing';l.tick();assert.equal(l.leftClickDone,false,'swinging in the air is not a kill');
  assert.equal(l.attackEnemies.length,3);
  l.hurtEnemy(l.attackEnemies[0],10,0,{magic:true,fireball:true});assert.equal(l.leftKills,0);
  for(const [i,e] of l.attackEnemies.entries()){
    // A travelling Ki Slash can land after the swing animation has finished.
    c.P.s=i===0?'wSwing':'idle';
    const opts={_lessonAttack:i===0?'weapon':'kiSlash'};
    l.hurtEnemy(e,10,0,opts);l.hurtEnemy(e,10,0,opts);
    assert.equal(l.leftKills,i+1);assert.equal(l.leftClickDone,i===2);
  }
  assert.equal(c.deaths.length,3);assert.equal(c.corpses.length,3);
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,-1);
  assert.equal(l.allows('beam'),true);assert.equal(l.allows('weapon'),false);
  c.MB[2]=true;l.tick();assert.equal(l.rightClickDone,false);
  c.P.s='magicCast';l.tick();assert.equal(l.rightClickDone,false,'casting in the air is not a kill');
  assert.equal(l.attackEnemies.length,3);
  l.hurtEnemy(l.attackEnemies[0],10,0,{magic:true,fireball:true,_fromTurret:true});assert.equal(l.rightKills,0);
  c.P.s='idle'; // A launched projectile may hit after the casting state ends.
  for(const [i,e] of l.attackEnemies.entries()){
    l.hurtEnemy(e,10,0,{magic:true,fireball:true});l.hurtEnemy(e,10,0,{magic:true,fireball:true});
    assert.equal(l.rightKills,i+1);assert.equal(l.rightClickDone,i===2);
  }
  assert.equal(c.deaths.length,6);assert.equal(c.corpses.length,6);assert.equal(c.deathImpacts.length,6);
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,8);
  assert.equal(l.allowKey('Digit1'),true);assert.equal(l.allowKey('Digit2'),false);
  assert.equal(l.trapEnemies.length,10);assert.equal(c.SKILL_SLOTS[0],'spikeTrap');
  l.tick();assert.equal(l.spikeTrapDone,false,'a key press or chase alone cannot complete the trap exercise');
  const zone={x:c.P.x,y:c.P.y,r:300,t:0,maxT:600,type:'spikeTrap'};
  c.G._fireZones.push(zone);l.tick();
  for(const [index,e] of l.trapEnemies.entries()){
    l.hurtEnemy(e,10,0,{magic:true,fireball:true});assert.equal(e.alive,true);
    for(let i=0;i<5+index;i++)l.hurtEnemy(e,10,0,{dot:true,_lessonAttack:'spikeTrap'});
    l.hurtEnemy(e,10,0,{dot:true,_lessonAttack:'spikeTrap'});
  }
  assert.equal(l.trapKills,10);assert.equal(l.spikeTrapDone,false,'must also retreat after placing the trap');
  l.heldDirections.add('KeyS');c.P.y+=130;l.tick();l.heldDirections.clear();
  assert.equal(l.spikeTrapDone,true);
  for(let i=0;i<90;i++)l.tick();assert.equal(l.step,0);
  assert.equal(c.SKILL_SLOTS[0],null);assert.equal(c.G._fireZones.length,0);
  assert.equal(l.allows('left'),true);
  c.P.x+=20;const x=c.P.x;l.tick();assert.equal(c.P.x,x);
}
// Importers use the lesson fixture without running the unrelated full combat suite.
if(require.main!==module){module.exports={fixture,exerciseChainTiers,exerciseDashFive};return;}
for (const [stage, search] of [[1, ''], [0, '?tutorial=0'], [0, '?projectilelab=1']]) {
  const c = fixture(stage, search); assert.equal(c.window._parryLesson.tick(), false); assert.equal(c.window._parryLesson.active, false);
}
const c = fixture(), lesson = c.window._parryLesson;
const original = { ens: c.ens, projs: c.projs, pProjs: c.pProjs, worldItems: c.worldItems, holes: c.G.spawnHoles, fire: c.G._bonfire };
c.G._intro = true; assert.equal(lesson.tick(), false); c.G._intro = false;
assert.equal(lesson.tick(), true); assert.equal(c.ens.length, 0); assert.equal(c.G.spawnHoles.length, 0);
assert.equal(lesson.allows('weapon'), false); assert.equal(lesson.allows('parry'), false);
function waitForShot(l){for(let i=0;i<240&&!l.shot;i++)l.tick();assert.ok(l.shot,'a completed charge ring must fire');}
function killByReflection(c,l,kind){
  const p=l.shot;l.hit(p,kind);assert.equal(l.checks[l.step],false,'parrying alone is not completion');
  p.friendly=true;p.parryBlueBean=true;
  l.hurtEnemy(l.parryEnemy,10,0,{parryBlueBean:true,_lessonParryShot:p});
}
lesson.button.onclick(); walk(c);
assert.ok(lesson.parryEnemy?.alive,'a visible monster must preview the single shot');
for(let i=0;i<45;i++)lesson.tick();
assert.equal(lesson.shot,null,'the ring must finish before a projectile appears');
assert.ok(lesson.parryEnemy._projChargeT>0);
waitForShot(lesson);
assert.ok(lesson.shot); const first = lesson.shot;
lesson.hit(first, 'physical'); assert.equal(lesson.checks[0], false);
lesson.hit({}, 'magic'); assert.equal(lesson.checks[0], false);
c.projs.length = 0; lesson.tick(); assert.equal(lesson.checks[0], false);
waitForShot(lesson);assert.notEqual(lesson.shot, first);
const reflected = lesson.shot;
killByReflection(c,lesson,'magic'); assert.equal(lesson.tick(), false); assert.equal(lesson.rows[0].checked, true); assert.equal(lesson.phase, 'success');
assert.equal(lesson.shot, reflected); assert.equal(lesson.button.hidden, true);
for (let i = 0; i < 89; i++) assert.equal(lesson.tick(), false);
assert.equal(lesson.phase, 'practice'); assert.equal(lesson.step, 1);
waitForShot(lesson);
// Failing E retries E without clearing the completed Q checkbox.
c.projs.length = 0; lesson.tick(); assert.equal(lesson.checks[0], true); assert.equal(lesson.step, 1);
waitForShot(lesson);
killByReflection(c,lesson,'physical'); assert.equal(lesson.tick(), false); assert.equal(lesson.phase, 'success'); assert.equal(lesson.rows[1].checked, true);
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
exerciseChainTiers(c,lesson);
for(let i=0;i<90;i++)lesson.tick();assert.equal(lesson.step,5);
exerciseDashFive(c,lesson);
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
fl.tick();fl.button.onclick();walk(failure);waitForShot(fl);
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
assert.equal(crowd.deaths.length,24,'rage kills play the common death sound/VFX');
assert.equal(crowd.corpses.length,24,'rage kills create corpses immediately');
assert.ok(crowd.deaths.every(args=>args[5]===false),'death sounds are not muted');
assert.equal(crowd.deathImpacts.length,24);assert.equal(crowd.gore.length,24);
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
console.log('PASS: HTML syntax; twelve stages including trap retreat and ten kills; left/right attack states; charged volleys; movement; rage zoom/cast; 24 practice enemies and slam kills; miss explosion, HP loss, duplicate protection, recovery; retry/skip and restoration; live parry gates.');
for(const code of ['KeyW','KeyA','KeyS','KeyD']){
  const c=fixture(),l=c.window._parryLesson;l.tick();
  assert.equal(l.phase,'intro');assert.equal(l.allowKey('KeyQ'),false);
  assert.equal(l.phase,'intro','unrelated keys do not start practice');
  assert.equal(l.allowKey(code),true);
  assert.equal(l.phase,'practice','any WASD key starts the lesson');
  assert.equal(l.button.hidden,true);assert.equal(l.directionHeld(),true);
  c.K[code]=true;c.KH[code]=true;
  l.allowKey(code);assert.equal(c.KH[code],true,'repeated keydown must not reset held input');
  assert.equal(l.step,-3);assert.equal(l.movementDone,false,'starting is not completing the movement exercise');
  l.releaseKey(code);c.KH[code]=false;assert.equal(l.directionHeld(),false);
}
console.log('PASS: every WASD key starts the intro once, preserves movement input and does not auto-complete the exercise.');
// Run the actual travelling-crescent collision code from both game entrypoints.
for(const name of ['game.html','game-easy-test.html']){
  const c=fixture(),l=c.window._parryLesson;
  c.P.activeLMBSk='whirlwind';c.P.skills.kiSlash=7;const originalSkills=c.P.skills;
  l.tick();assert.equal(c.P.activeLMBSk,'kiSlash');assert.equal(c.P.skills.kiSlash,7);
  l.step=-2;l.phase='practice';l.spawnAttackEnemies();
  const e=l.attackEnemies[0];c.P.s='idle';
  const crescent={active:true,life:20,x:e.x-14,y:e.y,vx:14,vy:0,_th:0,trail:Array.from({length:5},()=>({})),r:55,_hitSet:new Set(),dmg:10,el:0,step:1,ang:0};
  let crescentImpacts=0;
  Object.assign(c,{_CRES_MAX:1,_crescents:[crescent],isW:()=>false,shQuery:()=>[e],dst:(x,y,a,b)=>Math.hypot(x-a,y-b),hasLOS:()=>true,_hurtFieldMobs:()=>false,_playKiSlashHit:()=>crescentImpacts++,
    hurtE:(enemy,dmg,ang,quiet,opts)=>l.hurtEnemy(enemy,dmg,ang,opts)});
  const html=fs.readFileSync(path.join(root,name),'utf8');
  vm.runInContext(html.slice(html.indexOf('function updateCrescents(sp){'),html.indexOf('function poolUpdate(sp){')),c);
  c.updateCrescents(1);assert.equal(l.leftKills,1,'Ki Slash projectile kills count after wSwing ends');
  c.updateCrescents(1);assert.equal(l.leftKills,1,'duplicate hits cannot add kills');
  assert.equal(crescentImpacts,1,'the live hit effect fires once for the accepted collision');
  l.finish();assert.equal(c.P.activeLMBSk,'whirlwind');assert.equal(c.P.skills,originalSkills);
}
console.log('PASS: Ki Slash is the tutorial basic attack; live crescent collisions count once and original skill selection/levels restore.');
function exerciseDashFive(c,l,resource=false){
  const step=l.step;
  c.P._bdMoveT=6;l.tick();assert.equal(l.checks[step],false,'movement without a fresh directional Space input does not count');
  c.P._bdMoveT=0;l.tick();l.allowKey('KeyW');
  for(let i=1;i<=5;i++){
    assert.equal(l.allowKey('Space'),true);l.tick();assert.equal(l.checks[step],false,'input alone never completes');
    c.P._bdMoveT=6;
    if(resource){l.tick();assert.equal(l.dashPractice.count,i-1,'each resource dash needs MP and mobility cost');c.P.mp-=7;l.tick();assert.equal(l.dashPractice.count,i-1);c._harpGauge-=31.5;}
    l.tick();assert.equal(l.checks[step],i===5,'five distinct activations are required');assert.equal(l.dashPractice.count,i);
    assert.match(resource?l.resourceReadout.textContent:l.hint.textContent,new RegExp(`${i}/5`));
    if(i===5)break;
    const mp=c.P.mp,gauge=c._harpGauge;
    for(let t=0;t<12;t++)l.tick();assert.equal(l.dashPractice.count,i,'one active dash cannot count more than once');
    l.allowKey('Space');l.tick();assert.equal(l.dashPractice.count,i,'key repeat during a dash cannot count again');
    if(resource){assert.equal(c.P.mp,mp);assert.equal(c._harpGauge,gauge,'no refill during movement');}
    c.P._bdMoveT=0;l.tick();assert.equal(l.dashPractice.flight,true,'wait for Space release');
    l.releaseKey('Space');l.tick();assert.equal(l.dashPractice.flight,false);
    assert.equal(c.P.mp,c.P.mmp);assert.equal(c._harpGauge,c._HARP_GAUGE_MAX);
  }
}
module.exports={fixture,exerciseChainTiers,exerciseDashFive};

// Native warning rendering and reflection attribution for both single-shot lessons.
for(const name of ['game.html','game-easy-test.html'])for(const step of [0,1]){
  const c=fixture(),l=c.window._parryLesson;l.tick();l.beginPractice();l.step=step;l.cooldown=1;l.tick();
  const e=l.parryEnemy;assert.ok(e.alive);assert.equal(e._projChargeT,60);assert.equal(l.shot,null);
  assert.equal(e._spawnT,0,'the lesson shooter must be visible immediately');
  for(let t=0;t<30;t++)l.tick();assert.equal(e._projChargeT,30);assert.equal(l.shot,null);
  const source=fs.readFileSync(path.join(root,name),'utf8');
  const rings=[];Object.assign(c,{_drawShootCharge:(...args)=>rings.push(args),_gameFrame:0});
  const classifierStart=source.indexOf('function _projectileParryClass(p){');
  vm.runInContext(source.slice(classifierStart,source.indexOf('\n}',classifierStart)+2),c);
  vm.runInContext(source.slice(source.indexOf('function _drawEnemyShotWarnings(){'),source.indexOf('function radialProjs(')),c);
  c._drawEnemyShotWarnings();assert.equal(rings.length,1);assert.equal(rings[0][3],.5);assert.equal(rings[0][4],step===0?'#b26dff':'#f4f4f4');
  vm.runInContext(source.slice(source.indexOf('function _parryHomingTarget(){'),source.indexOf('let _deadPool=')),c);
  assert.equal(c._parryHomingTarget(),e,'reflections must target the lesson shooter');
  c.G.paused=true;l.tick();assert.equal(e._projChargeT,30);c.G.paused=false;
  for(let t=0;t<29;t++)l.tick();assert.equal(l.shot,null);
  l.tick();const shot=l.shot;assert.equal(shot.x,e.x);assert.equal(shot.y,e.y);assert.equal(e._projChargeT,0);
  assert.ok(Math.abs(Math.hypot(shot.vx,shot.vy)-3)<1e-10);
  l.hurtEnemy(e,10,0,{_lessonAttack:'kiSlash'});assert.equal(e.alive,true);
  shot.friendly=true;shot.parryBlueBean=true;
  l.hurtEnemy(e,10,0,{_lessonParryShot:shot});assert.equal(e.alive,true,'reflection without the matching parry event cannot kill');
  l.hit(shot,step===0?'magic':'physical');assert.equal(l.checks[step],false);
  l.hurtEnemy(e,10,0,{_lessonParryShot:{...shot}});assert.equal(e.alive,true,'another projectile cannot count');
  // Execute the actual reflected-projectile splash damage call, preserving its provenance.
  const hitLine=source.split('\n').find(line=>line.includes('hurtE(be,~~(_blD*(.8+bf*.2))'));
  Object.assign(c,{be:e,p:shot,_blD:10,bf:1,ba:0,hurtE:(target,dmg,ang,quiet,opts)=>l.hurtEnemy(target,dmg,ang,opts)});
  vm.runInContext(hitLine,c);assert.equal(e.alive,false);assert.equal(l.checks[step],true);
  const deaths=c.deaths.length;vm.runInContext(hitLine,c);assert.equal(c.deaths.length,deaths);
  l.finish();assert.equal(l.parryEnemy,null);assert.equal(e._projChargeT,0);
}

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
