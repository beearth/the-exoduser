import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function setup(){
  const music=[],recycled=[];
  const ctx=vm.createContext({_DEMO_MODE:true,_DEMO_LAST_STAGE:3,_EDITOR_MODE:false,_gpActive:false,
    G:{stage:3,_bossArena:true,cam:{x:2000,y:2000},_camZoom:.5,_lavaPools:[{}],_druidOrbs:[{}]},
    P:{x:2000,y:2300},VW:1280,VH:720,mouse:{x:0,y:0,_screenX:700,_screenY:400},
    _CODEX_BOSS:{3:{dw:9.3,dh:14.1}},window:{_btScaleMul:4,_btOffsetY:0},
    projs:[],_recycleProj:p=>recycled.push(p),BGM:{play:k=>music.push(k)},
    playVFXAng(){},_addBlastLight(){},shake(){},_bossCine:{active:false}});
  vm.runInContext(html.slice(html.indexOf('// [DRUID-FINALE]'),html.indexOf('// [/DRUID-FINALE]')),ctx);
  return {ctx,music,recycled};
}
const boss=(extra={})=>({ib:true,alive:true,x:2000,y:2000,r:44,s:'idle',...extra});
test('finale framing contains full standing sprite and player at common viewport sizes',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleFrame,'function');
  for(const [w,h] of [[1280,720],[1600,900],[1920,1080]])for(const [dx,dy] of [[0,400],[400,0],[-400,0],[0,-400],[0,650]]){
    const e=boss(),p={x:e.x+dx,y:e.y+dy},f=ctx._druidFinaleFrame(e,p.x,p.y,w,h,{});
    const top=h/2+(e.y-24-e.r*14.1*.86-f.y)*f.zoom;
    const foot=h/2+(p.y+80-f.y)*f.zoom;
    assert.ok(top>=90-1,`head ${top} at ${w}x${h}`);
    assert.ok(foot<=h-145+1,`player ${foot} at ${w}x${h}`);
    assert.ok(f.zoom>=.3&&f.zoom<=.8);
  }
});
test('framing leaves distant arena approach on normal player camera',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._druidFinaleFrame,'function');
  assert.equal(ctx._druidFinaleFrame(boss(),2000,4000,1280,720,{}),null);
  ctx._DEMO_MODE=false;assert.equal(ctx._druidFinaleFrame(boss(),2000,2300,1280,720,{}),null);
});
test('pointer inverse projection stays on the visible target as finale zoom changes',()=>{
  const {ctx}=setup();assert.equal(typeof ctx._syncDruidFinaleMouse,'function');
  for(const z of [.4,.6,.8,1]){ctx.G._camZoom=z;ctx._syncDruidFinaleMouse();assert.equal(ctx.mouse.x,640+60/z);assert.equal(ctx.mouse.y,360+40/z);}
  ctx._gpActive=true;ctx.mouse.x=123;ctx._syncDruidFinaleMouse();assert.equal(ctx.mouse.x,123,'controller world aim is unchanged');
  ctx._gpActive=false;ctx.G.stage=0;ctx._syncDruidFinaleMouse();assert.equal(ctx.mouse.x,700);
});
test('victory waits for final revival resolution and fires once',()=>{
  const {ctx,music,recycled}=setup();assert.equal(typeof ctx._finishDruidFinale,'function');
  const e=boss();assert.equal(ctx._finishDruidFinale(e),false);
  e.alive=false;e._reviveTimer=120;assert.equal(ctx._finishDruidFinale(e),false);
  assert.equal(music.length,0);assert.equal(ctx.G._lavaPools.length,1);
  e._reviveTimer=0;
  const hostile={_druidPoison:true,friendly:false},friendly={_druidPoison:true,friendly:true},other={};ctx.projs.push(hostile,friendly,other);
  assert.equal(ctx._finishDruidFinale(e),true);assert.equal(ctx._finishDruidFinale(e),false);
  assert.deepEqual(music,['victory']);assert.deepEqual(recycled,[hostile]);assert.equal(ctx.projs.length,2);
  assert.equal(ctx.G._lavaPools.length,0);assert.equal(ctx.G._druidOrbs.length,0);
  assert.equal(ctx.G._druidVictory.t,0);
});
test('finale suppresses inventory chatter while preserving urgent survival dialogue',()=>{
  const {ctx}=setup();ctx.G._bossRef=boss();ctx.G.bossAlive=true;
  Object.assign(ctx,{_petBubble:{t:0},_petDlgCD:{},_petTierOf:()=>1,_PET_SURV_W:{hp_critical:100},_T:s=>s,_petBubbleShow(){},_petSfx(){}});
  const a=html.indexOf('function _petSay('),b=html.indexOf('\n}',a)+2;vm.runInContext(html.slice(a,b),ctx);
  assert.equal(ctx._petSay('tut_keyK','crow','inventory hint',5),false);
  assert.equal(ctx._petSay('hp_critical','crow','danger',3),true);
});
test('room completion still finds the defeated boss after the HUD clears its live reference',()=>{
  const {ctx}=setup();ctx.G._bossRef=null;ctx.G._druidFinaleBoss=boss({alive:false,_reviveTimer:0,etype:3});ctx.G._killedBosses=[];ctx.findBoss=()=>null;
  const a=html.indexOf('      const _dBoss=G._bossRef'),b=html.indexOf('\n      addTxt',a);
  vm.runInContext(html.slice(a,b),ctx);assert.ok(ctx.G._druidVictory);
});
test('victory text fits the actual WebGL text atlas instead of treating font weight as size',()=>{
  const {ctx}=setup();ctx.G._druidVictory={boss:boss({alive:false}),t:60};ctx._ssaa=1;ctx._L=s=>s;
  const fonts=[];const draw=new Proxy({font:''},{get:(o,k)=>k==='fillText'?()=>fonts.push(o.font):k in o?o[k]:()=>{}});
  ctx._drawDruidFinaleVictory(draw);
  assert.equal(fonts.length,3);assert.ok(fonts.every(font=>(parseFloat(font)||14)*1.6+8<=512),fonts.join(', '));
});
