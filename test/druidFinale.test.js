import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const a=html.indexOf('function '+name+'(');assert.ok(a>=0,`${name} exists`);return html.slice(a,html.indexOf('\n}',a)+2);}
function setup(demo=true,stage=3){
  const hits=[],shots=[];
  const ctx=vm.createContext({_DEMO_MODE:demo,_DEMO_LAST_STAGE:3,G:{stage,frame:0},P:{x:100,y:200,facing:0,iframes:0,s:'idle',kb:{}},
    BOSS_PHASES:{0:{teleM:.75},1:{hp:[.6,.8]},2:{hp:[.4,.6]},3:{hp:[.2,.4]},4:{hp:[0,.2],teleM:.25}},BOSS_MOVES:[],
    _BOSS_PHASE_AURA:[],_HS:{bossPhase:6},OPT:{hitStop:100},EL:{P:0,F:1},
    _T:s=>s,_L:(a)=>a,addTxt(){},poolPart(){},addParts(){},SFX:new Proxy({},{get:()=>()=>{}}),
    hurtP:n=>hits.push(n),_spawnBossProjectile:(e,p)=>{shots.push(p);return p},
    canMv:()=>true,safePt:(x,y)=>({x,y}),dst:(x,y,a,b)=>Math.hypot(x-a,y-b),
    _addBlastLight(){},_addTpSmoke(){},_addTpImpact(){},_addTpBolt(){},_reviveVFX(){},shake(){},setTimeout(){},_bossSfx:()=>null,
    playVFXAng(){},playSample(){},_r:()=>1});
  const begin=html.indexOf('// [DRUID-FINALE]');
  const end=html.indexOf('// [/DRUID-FINALE]',begin);
  if(begin>=0&&end>begin)vm.runInContext(html.slice(begin,end),ctx);
  vm.runInContext(fn('_druidParryVolleySpec')+'\n'+fn('_bossPhaseCheck'),ctx);
  return {ctx,hits,shots};
}
function boss(extra={}){return {ib:true,alive:true,x:100,y:100,r:44,hp:590,mhp:1000,atk:100,speed:1,maxPoise:100,poise:70,bossPatCd:100,_bossPhase:0,s:'idle',stunned:0,kb:{x:0,y:0},...extra};}

test('demo finale phase crossing never teleports onto or damages the player',()=>{
  const {ctx,hits,shots}=setup();const e=boss();ctx._bossPhaseCheck(e,1);
  assert.equal(hits.length,0);assert.equal(shots.length,0);
  assert.equal(e.x,100);assert.equal(e.y,100);assert.equal(e._bossPhase,2);
  assert.equal(e.hp,600,'existing threshold HP correction is preserved');
  assert.equal(e.atk,130,'existing phase stat scaling is preserved');
});
test('regular stage 3 retains its existing phase transition',()=>{
  const {ctx,hits}=setup(false);ctx._bossPhaseCheck(boss(),1);assert.ok(hits.length>0);
});
test('finale scope is demo/bic last-stage boss only',()=>{
  for(const [demo,stage,ib,want] of [[true,3,true,true],[true,0,true,false],[false,3,true,false],[true,3,false,false]]){
    const {ctx}=setup(demo,stage);assert.equal(typeof ctx._isDruidFinale,'function');assert.equal(ctx._isDruidFinale(boss({ib})),want);
  }
});
test('three acts select the signature volley, charge and burrow in sequence',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleNextMove,'function');
  const e=boss({_bossPhase:4});
  assert.deepEqual(Array.from({length:3},()=>ctx._druidFinaleNextMove(e,250)),['druidVolley','charge','burrowStrike']);
  e._bossPhase=0;assert.equal(ctx._druidFinaleNextMove(e,250),'druidVolley','phase reset restarts the opening');
});
test('finale volleys stay Q magic and expire before the burrow punish window',()=>{
  const {ctx,shots}=setup();assert.equal(typeof ctx._druidFinaleVolley,'function');
  ctx._druidFinaleVolley(boss({_bossPhase:4}));
  assert.equal(shots.length,9);assert.ok(shots.every(p=>p.fireMagic&&p._druidParryVolley&&p.life===90&&!p.blackBean&&!p.redBean));
});
test('burrow locks the target with thirty frames still available before impact',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleTrackBurrow,'function');
  const e=boss({s:'bossDruidUnder',st2:22,_diveTx:80,_diveTy:90});
  ctx._druidFinaleTrackBurrow(e,1);const x=e._diveTx,y=e._diveTy;
  ctx.P.x=800;ctx.P.y=900;e.st2=12;ctx._druidFinaleTrackBurrow(e,1);
  assert.equal(e._diveTx,x);assert.equal(e._diveTy,y);assert.equal(e._druidTargetLocked,true);
});
test('big attack recovery remains 96 frames and is not restarted every update',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleUpdate,'function');
  const e=boss({s:'recover',st2:30,_druidRest:96});
  assert.equal(ctx._druidFinaleUpdate(e,1),true);assert.equal(e.s,'bossDruidRest');assert.equal(e.st2,96);
  e.st2=42;ctx._druidFinaleUpdate(e,1);assert.equal(e.st2,42);
  e.st2=0;ctx._druidFinaleUpdate(e,1);assert.equal(e.s,'idle');
});
test('burrow damage stays on the locked marker if body separation moves the boss',()=>{
  const {ctx,hits}=setup();ctx.e=boss({x:1000,y:1000,s:'bossDruidErupt',st2:32,_eruptMax:40,_diveTx:100,_diveTy:200});
  Object.assign(ctx,{isPWin:()=>false,elMul:()=>1,ar:()=>({el:0})});
  const a=html.indexOf("  case'bossDruidErupt':{");
  const b=html.indexOf("  case'bossSlashWind':",a);
  vm.runInContext("switch(e.s){"+html.slice(a,b)+'}',ctx);
  assert.equal(hits.length,1,'the locked marker remains the actual damage center');
});
test('generic enemy tracking cannot overwrite the finale charge lock',()=>{
  const {ctx}=setup();ctx.e=boss({s:'bossChargeWind',st2:16,facing:.5,_alerted:true});ctx.d=300;ctx.sp=1;
  const a=html.indexOf('  const _druidAimLocked=');assert.ok(a>=0);
  const b=html.indexOf('\n  //',a);
  vm.runInContext(html.slice(a,b),ctx);
  assert.equal(ctx.e.facing,.5);
});
test('demo finale continue button goes to the ending without another difficulty prompt',()=>{
  for(const [demo,stage,wantEnd] of [[true,3,true],[true,0,false],[false,3,false]]){
    const next={style:{}};let ended=0,prompted=0;
    const ctx=vm.createContext({$:()=>next,_DEMO_MODE:demo,_DEMO_LAST_STAGE:3,G:{stage},SI_TO_HELL:[0,0,0,0],nextStage:()=>ended++,_showNextDiffPop:()=>prompted++});
    const a=html.indexOf("$('nextBtn').onclick=()=>{");const b=html.indexOf('\n};',a)+3;
    vm.runInContext(html.slice(a,b),ctx);next.onclick();
    assert.equal(ended,wantEnd?1:0);assert.equal(prompted,wantEnd?0:1);
  }
});
