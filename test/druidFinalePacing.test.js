import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function setup(){
  const calls=[],music=[];
  const ctx=vm.createContext({_DEMO_MODE:true,_DEMO_LAST_STAGE:3,G:{stage:3,_bossArena:true},P:{},
    _preArenaBackup:{map:'field'},_enterBossArena:retry=>calls.push(retry),
    BGM:{play:key=>music.push(key)},projs:[],_recycleProj(){},playVFXAng(){},playSample(){},_L:s=>s,addTxt(){},shake(){}});
  vm.runInContext(html.slice(html.indexOf('// [DRUID-FINALE]'),html.indexOf('// [/DRUID-FINALE]')),ctx);
  return {ctx,calls,music};
}
test('demo HP grows moderately across starter and growth levels and respects difficulty',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleHp,'function');
  const values=[1,30,60].map(lv=>ctx._druidFinaleHp(lv,1));
  assert.equal(values[0],22278);assert.ok(values[1]<90000);assert.ok(values[2]<220000);
  assert.ok(values[2]>values[1]);assert.ok(Math.abs(ctx._druidFinaleHp(30,2)-2*values[1])<=1);
});
test('last stand is limited to one revival and holy power can suppress it entirely',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleReviveChance,'function');
  for(const s of [0,.3,.6,1])assert.equal(ctx._druidFinaleReviveChance({deaths:1,_revPts:10},s),1-s);
  assert.equal(ctx._druidFinaleReviveChance({deaths:2,_revPts:200},0),0);
  assert.equal(ctx._druidFinaleReviveChance({deaths:1,_revPts:0},0),0);
});
test('last stand preserves its telegraphed location, restores 35 percent HP and cannot repeat',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._reviveDruidFinale,'function');
  const e={ib:true,x:200,y:300,r:44,mhp:1000,atk:100,_druidBaseAtk:60,_bossPhase:4,_revPts:10,alive:false,_reviveTimer:0};
  ctx._reviveDruidFinale(e);
  assert.equal(e.hp,350);assert.equal(e.eShield,0);assert.equal(e._bossPhase,3);
  assert.equal(e._revPts,0);assert.equal(e.atk,96);assert.equal(e.st2,90);assert.equal(e.reviveIframes,90);
  assert.equal(e.x,200);assert.equal(e.y,300);assert.equal(e.r,44);assert.equal(e.alive,true);
});
test('direct retry is scoped to the demo arena and preserves the field backup',()=>{
  const {ctx,calls,music}=setup();assert.equal(typeof ctx._retryDruidFinale,'function');
  assert.equal(ctx._retryDruidFinale(),true);assert.deepEqual(calls,[true]);
  ctx.G._bossArena=false;assert.equal(ctx._retryDruidFinale(),false);
  ctx.G._bossArena=true;ctx._DEMO_MODE=false;assert.equal(ctx._retryDruidFinale(),false);
  assert.equal(ctx._preArenaBackup.map,'field');assert.equal(calls.length,1);
  assert.deepEqual(music,['boss'],'retry leaves the death soundtrack');
});
test('retry and initial intro use different durations without hiding HP throughout the fight',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleIntro,'function');
  ctx._bossCine={active:true,maxT:180,_introFill:0};ctx._druidFinaleIntro({ib:true,_druidRetry:true});
  assert.equal(ctx._bossCine.maxT,60);assert.equal(ctx._bossCine._introFill,1);
  ctx._bossCine={active:true,maxT:180,_introFill:0};ctx._druidFinaleIntro({ib:true});
  assert.equal(ctx._bossCine.maxT,180);assert.equal(ctx._bossCine._introFill,0);
});
test('the per-frame attack reset preserves finale phase strength',()=>{
  const {ctx}=setup();ctx.e={ib:true,baseAtk:80,_druidBaseAtk:80,_bossPhase:4};
  const reset=html.split('\n').find(line=>line.includes('// 매 프레임 ATK'));
  assert.ok(reset);vm.runInContext(reset,ctx);assert.equal(ctx.e.atk,128);
  ctx.e._bossPhase=2;vm.runInContext(reset,ctx);assert.equal(ctx.e.atk,100);
  ctx._DEMO_MODE=false;vm.runInContext(reset,ctx);assert.equal(ctx.e.atk,80);
});
test('independent field worms cannot spawn or persist inside the finale arena',()=>{
  const {ctx}=setup();ctx.G.on=true;ctx.G.map=[[]];ctx.G._wmStage=3;ctx.G._worms=[{asleep:true,x:0,y:0}];
  ctx.dst=()=>10000;ctx._WM_WAKE=1000;ctx._pushOutsideBonfire=()=>{};
  const a=html.indexOf('function _wmTick('),b=html.indexOf('\n}',a)+2;
  vm.runInContext(html.slice(a,b),ctx);ctx._wmTick();assert.equal(ctx.G._worms.length,0);
});
