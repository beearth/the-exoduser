import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';

for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const i=src.indexOf('function '+name+'(');assert.ok(i>=0,name+' exists');return src.slice(i,parseExpressionAt(src,i,{ecmaVersion:'latest'}).end);};
 function fixture(){
  const draws=[];
  const X=new Proxy({}, {get:(t,k)=>t[k]||(()=>{}),set:(t,k,v)=>(t[k]=v,true)});
  const c=vm.createContext({X,Math,EL:{P:0},P:{x:100,y:200,hp:100},G:{stage:1,on:true},_gameFrame:100,_drawPhysMouth:(...a)=>draws.push(a)});
  for(const name of ['_projectileParryClass','_isBitingPhysicalProjectile','_addPhysicalBite','_drawPhysicalBites'])vm.runInContext(fn(name),c);
  return {c,draws};
 }
 test(file+': attached mouth follows the player, expires, and never retains the recycled projectile',()=>{
  const {c,draws}=fixture();const p={el:0,x:50,y:200,vx:5,vy:0,sz:3,dmg:20};
  c._addPhysicalBite(p);assert.equal(c.P._physicalBites.length,1);
  c._drawPhysicalBites();const first=draws.pop();
  p.x=900;p.vx=-4;p.sz=100;c.P.x+=70;c.P.y-=30;
  c._drawPhysicalBites();const moved=draws.pop();
  assert.equal(moved[0]-first[0],70);assert.equal(moved[1]-first[1],-30);
  assert.equal(moved[2],first[2]);assert.equal(moved[3],first[3]);assert.equal(c.P.hp,100);
  c._gameFrame+=48;c._drawPhysicalBites();assert.equal(c.P._physicalBites.length,0);assert.equal(draws.length,0);
 });
 test(file+': magic, reflected, eye and custom druid sprites do not attach; dense hits stay capped',()=>{
  const {c}=fixture();
  for(const props of [{el:1},{el:0,blackBean:true},{el:0,friendly:true},{el:0,titanEye:true},{el:0,_druidPoison:true}]){
   c._addPhysicalBite({x:0,y:0,vx:5,vy:0,sz:3,...props});
   assert.equal(c.P._physicalBites?.length||0,0);
  }
  for(let i=0;i<20;i++)c._addPhysicalBite({el:0,x:0,y:0,vx:5,vy:0,sz:3});
  assert.equal(c.P._physicalBites.length,3);
  c.G.stage++;c._drawPhysicalBites();assert.equal(c.P._physicalBites.length,0);
 });
}
