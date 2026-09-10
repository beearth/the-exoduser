import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parse} from 'acorn';

const html=fs.readFileSync('game.html','utf8');
const main=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('function addExp('))[1];
const ast=parse(main,{ecmaVersion:'latest'});
function fn(name){const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);return main.slice(n.start,n.end);}
function fixture(){
  const events=[];
  const P={x:100,y:200,lv:1,exp:0,maxExp:10,sp:0,ap:0,hp:40,mhp:100,st:20,mst:100,mp:10,mmp:100,shield:7,skills:{}};
  const ctx=vm.createContext({P,G:{stage:0},_DEMO_MODE:false,_DEMO_LV_CAP:100,
    nc:()=>({}),_eqAffix:()=>0,_canTransLv:()=>true,_calcMaxExp:()=>10,
    SFX:{levelup(){}},showPH(){},addTxt(){},poolPart(){},_T:s=>s,
    _levelUpVfx:{trigger:(...args)=>events.push(args)},dbSaveForce:()=>events.push('save')});
  vm.runInContext(fn('addExp'),ctx);
  return {P,ctx,events};
}
test('earned levels trigger one visual while keeping SP, AP, recovery and save',()=>{
  const {P,ctx,events}=fixture();ctx.addExp(30,true);
  assert.equal(P.lv,4);assert.equal(P.sp,9);assert.equal(P.ap,2);
  assert.deepEqual([P.hp,P.st,P.mp,P.shield],[60,40,30,7]);
  assert.equal(events.length,2);assert.equal(events[0][0],P);assert.equal(events[0][1],0);assert.equal(events[0][2],3);assert.equal(events[1],'save');
});
test('XP below threshold and demo level cap do not start a visual',()=>{
  const {P,ctx,events}=fixture();ctx.addExp(5,true);assert.equal(events.length,0);
  ctx._DEMO_MODE=true;P.lv=100;ctx.addExp(100,true);assert.equal(events.length,0);assert.equal(P.lv,100);
});
function effect(){
  const path='level-up-vfx.js';assert.ok(fs.existsSync(path),'Level-up effect module must exist');
  const ctx=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path,'utf8'),ctx);
  // Lifecycle is independent of canvas; real rendering is verified in Chromium.
  return ctx.window.LevelUpVfx.create();
}
test('rapid levels share one animation instead of restarting the flash',()=>{
  const fx=effect(),p={x:1,y:2,hp:100};fx.trigger(p,0,1);fx.update(.12,p,0);
  const age=fx.age;fx.trigger(p,0,2);assert.equal(fx.age,age);assert.equal(fx.active,true);
  fx.update(1.4,p,0);assert.equal(fx.active,false);
});
test('effect lifetime uses elapsed seconds at 30, 60 and 120 updates per second',()=>{
  for(const fps of [30,60,120]){const fx=effect(),p={x:1,y:2,hp:100};fx.trigger(p,0,1);
    for(let i=0;i<fps;i++)fx.update(1/fps,p,0);assert.equal(fx.active,true);
    for(let i=0;i<fps*.6;i++)fx.update(1/fps,p,0);assert.equal(fx.active,false);}
});
test('death, stage changes and replacing the character discard the effect',()=>{
  for(const mode of ['death','stage','character']){const fx=effect(),p={x:1,y:2,hp:100};fx.trigger(p,0,1);
    if(mode==='death')p.hp=0;
    fx.update(.01,mode==='character'?{...p}:p,mode==='stage'?1:0);assert.equal(fx.active,false);}
});
test('zero elapsed time keeps a paused effect stationary',()=>{
  const fx=effect(),p={x:1,y:2,hp:100};fx.trigger(p,0,1);fx.update(.2,p,0);const age=fx.age;
  fx.update(0,p,0);assert.equal(fx.age,age);
});
