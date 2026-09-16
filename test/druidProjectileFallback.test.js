import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const i=src.indexOf('function '+name+'(');assert.ok(i>=0);return src.slice(i,parseExpressionAt(src,i,{ecmaVersion:'latest'}).end);};
 test(file+': druid shots and tracking mines remain visible when the image cannot load',()=>{
  for(const props of [{parryClass:'physical'},{parryClass:'magic'},{_druidMine:true,parryClass:'forbidden'}]){
   const calls=[];
   const X=new Proxy({}, {get:(t,k)=>t[k]||((...a)=>calls.push([k,...a])),set:(t,k,v)=>(t[k]=v,true)});
   const c=vm.createContext({X,Math,_fdFlyImg:{complete:true,naturalWidth:0},_druidPoisonFly:null,EL:{P:0}});
   vm.runInContext(fn('_projectileParryClass')+fn('_physicalProjectileMultiplier')+fn('_drawDruidPoisonShot'),c);
   const p={x:100,y:200,sz:4,r:13,el:0,vx:5,vy:0,dmg:10,...props},before=JSON.stringify(p);
   assert.equal(c._drawDruidPoisonShot(p,.65),true);
   assert.ok(calls.some(a=>a[0]==='fill'),'visible body instead of invisible early return');
   assert.ok(calls.some(a=>a[0]==='stroke'),'contrast boundary');
   assert.equal(JSON.stringify(p),before,'fallback cannot change collision or parry data');
  }
 });
}
