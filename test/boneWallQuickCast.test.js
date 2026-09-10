import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){
  const start=source.indexOf(`function ${name}(`);
  let depth=0;
  for(let i=source.indexOf('{',start);i<source.length;i++){
    if(source[i]==='{')depth++;
    if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error(`Missing ${name}`);
}
function runtime(){
  const noop=()=>{};
  const ctx=vm.createContext({
    _MAP_QA_MODE:false,_gpActive:false,SKILL_SLOTS:['boneWall'],
    P:{x:100,y:200,s:'idle',skills:{boneWall:1},_bwStk:2},
    G:{on:true,paused:false,mats:100,cam:{x:300,y:400}},
    VW:1000,VH:800,mouse:{x:600,y:550},MBjust:{},
    _canAssignSkillSlot:()=>true,_isAbsorbed:()=>false,
    _malCost:n=>n,_T:s=>s,showPH:noop,_addSkProf:noop,
    meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>9,
    EL:{D:5},SFX:{magic:noop},playSample:noop,_r:x=>x,shake:noop,
    _gpAutoAim:noop,dst:(x,y,a,b)=>Math.hypot(a-x,b-y),
    console:{error(e){throw Error(e)}},addTxt:noop,
  });
  vm.runInContext(fn('_dispatchSkillSlot')+fn('fireBoneWall'),ctx);
  return ctx;
}
test('skill key creates one tomb at the cursor without a mouse click',()=>{
  const c=runtime();
  c._dispatchSkillSlot(0,'Digit1');
  assert.equal(c.G._boneWalls?.length,1);
  const wall=c.G._boneWalls[0];
  assert.deepEqual([wall.x,wall.y],[400,550]);
  assert.equal(c.P._bwAiming,false);
  assert.equal(c.P._bwStk,1);assert.equal(c.P._bwRech,1500);
  assert.equal(c.G.mats,88);assert.equal(wall.ringR,280);
});
test('quick cast clamps distant cursor to the existing 1000px range',()=>{
  const c=runtime();c.mouse={x:3300,y:4200};
  c._dispatchSkillSlot(0,'Digit1');
  assert.equal(c.G._boneWalls?.length,1);
  const w=c.G._boneWalls[0];
  assert.ok(Math.abs(Math.hypot(w.x-c.P.x,w.y-c.P.y)-1000)<1e-9);
  assert.ok(Math.abs((w.x-100)/ (w.y-200)-3000/4000)<1e-9);
});
test('empty stocks, insufficient malice and blocked states do not cast or spend',()=>{
  for(const block of [c=>c.P._bwStk=0,c=>c.G.mats=11,c=>c.G.paused=true,
    c=>c.P.s='dead',c=>c.P._ioActive=true]){
    const c=runtime();block(c);const mats=c.G.mats,stocks=c.P._bwStk;
    c._dispatchSkillSlot(0,'Digit1');
    assert.equal(c.G._boneWalls,undefined);
    assert.equal(c.G.mats,mats);assert.equal(c.P._bwStk,stocks);
  }
});
test('gamepad retains its existing aim confirmation flow',()=>{
  const c=runtime();c._gpActive=true;
  c._dispatchSkillSlot(0,'Digit1');
  assert.equal(c.P._bwAiming,true);assert.equal(c.G._boneWalls,undefined);
  assert.equal(c.G.mats,100);assert.equal(c.P._bwStk,2);
});
