import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const i=src.indexOf('function '+name+'(');assert.ok(i>=0,name);return src.slice(i,parseExpressionAt(src,i,{ecmaVersion:'latest'}).end);};
 const start=src.indexOf('    const _ps=Math.max(1.2,Math.min(4.0,');
 const end=src.indexOf('    // ── 무지개탄:',start);
 test(file+': every physical flying variant renders a readable mouth, not a dot',()=>{
  for(const props of [{redBean:true},{swordWave:true,redBean:true},{swordWave:true},{pierce:true},{fast:true},{phantomSword:true},{el:1,parryClass:'physical'}]){
   const draws=[];const X=new Proxy({}, {get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
   const p={x:100,y:100,vx:5,vy:0,sz:3,r:5,dmg:10,el:0,...props};const before=JSON.stringify(p);
   const c=vm.createContext({X,p,Math,_now:0,fa:1,EL:{P:0},ELC:['#fff'],_drawPhysMouth:(...a)=>(draws.push(a),true)});
   vm.runInContext(fn('_projectileParryClass')+fn('_physicalProjectileMultiplier')+'for(let once=0;once<1;once++){'+src.slice(start,end)+'}',c);
   assert.equal(draws.length,1);assert.ok(Math.abs(draws[0][2]*2-135.828)<1e-8,'mouth width is 55% of the former 246.96px');
   delete p._eyeSkin;assert.equal(JSON.stringify(p),before,'render must not change combat data');
  }
 });
 test(file+': unloaded mouth images still render opaque directional teeth',()=>{
  const calls=[];const X=new Proxy({}, {get:(t,k)=>t[k]||((...a)=>calls.push([k,...a])),set:(t,k,v)=>(t[k]=v,true)});
  const c=vm.createContext({X,Math,_physMouthReady:false,_gameFrame:0,_PHYS_MOUTH_N:[8,6,6],_PHYS_MOUTH_FW:768,_PHYS_MOUTH_FH:384});
  vm.runInContext(fn('_drawPhysMouth'),c);
  const result=c._drawPhysMouth(100,100,80,0,1,0);
  assert.equal(result,true,'fallback must remain a visible projectile');
  assert.ok(calls.filter(c=>c[0]==='fill').length>=2,'solid body and teeth');
  assert.equal(calls.some(c=>c[0]==='arc'),false,'no spinning circle fallback');
 });
}
