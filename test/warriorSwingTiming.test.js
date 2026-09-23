import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const entry of ['game.html','game-easy-test.html']){
 const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
 function load(name){
  const start=src.indexOf('function '+name+'(');
  assert.ok(start>=0,name+' exists');
  const ctx=vm.createContext({_charIdx:0,_facingDir8:a=>a});
  vm.runInContext(src.slice(start,src.indexOf('\n}',start)+2),ctx);
  return ctx[name];
 }
 test(entry+': both impact windows show a cutting pose, not anticipation',()=>{
  const frame=load('_warriorAttackFrame');
  assert.equal(frame('wSwing',3,10,16),6);
  assert.equal(frame('sBash',12,10,28),6);
  for(const [state,duration] of [['wSwing',5],['sBash',20]]){
   const frames=Array.from({length:duration+1},(_,i)=>frame(state,duration-i,10,28));
   assert.ok(frames.every((f,i)=>f>=0&&f<=7&&(i===0||f>=frames[i-1])));
   assert.equal(frames.at(-1),7);
  }
 });
 test(entry+': recovery lowers the weapon before returning to idle at any attack speed',()=>{
  const frame=load('_warriorAttackFrame');
  for(const state of ['wRecover','sRecover'])for(const duration of [1,4,16,28,80]){
   assert.equal(frame(state,duration,10,duration),7);
   assert.equal(frame(state,0,10,duration),0);
   const frames=Array.from({length:duration+1},(_,i)=>frame(state,duration-i,10,duration));
   assert.ok(frames.every((f,i)=>i===0||f<=frames[i-1]));
  }
 });
 test(entry+': normal melee sprite follows its fixed hit arc while E still follows aim',()=>{
  const direction=load('_playerSpriteDirection');
  for(const s of ['wWindup','wSwing','wRecover'])assert.equal(direction({s,facing:2,atkArc:0}),0);
  assert.equal(direction({s:'sBash',facing:2,atkArc:0}),2);
 });
}
