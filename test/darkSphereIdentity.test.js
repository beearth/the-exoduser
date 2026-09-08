import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('flight update cannot recolor an existing physical projectile into a dark sphere',()=>{
 assert.equal(html.includes('if(_tr<.25){p.gbBean=true;'),false);
});
test('dark sphere spawn clears stale physical metadata before classification',()=>{
 const a=html.indexOf('function _prepareDarkSphere('),b=html.indexOf('function _spawnBossProjectile(',a);
 assert.ok(a>=0&&b>a);
 const ctx=vm.createContext({EL:{D:3}});vm.runInContext(html.slice(a,b),ctx);
 const p={gbBean:true,el:0,col:'#ffffff',parryClass:'physical',vx:5,vy:0,dmg:30};
 ctx._prepareDarkSphere(p);
 assert.equal(p.el,3);assert.equal(p.col,'#a44cff');assert.equal(p.parryClass,'');
 assert.equal(p.vx,5);assert.equal(p.dmg,30);
 const other={el:0,parryClass:'physical'};ctx._prepareDarkSphere(other);assert.equal(other.parryClass,'physical');
 const spawn=html.slice(html.indexOf('function spawnProj('),html.indexOf('function _recycleProj('));
 assert.ok(spawn.indexOf('_prepareDarkSphere(p)')<spawn.indexOf('p.parryClass=_projectileParryClass(p)'));
});
test('impact element overrides legacy redBean visuals for every element',()=>{
 const a=html.indexOf('function _projHitFx('),b=html.indexOf('function _waterBeanIceBurst(',a);
 const booms=[],parts=[],flashes=[];
 const ctx=vm.createContext({EL:{P:0,F:1,I:2,D:3,L:4,H:5,E:6},ELC:['gray','red','blue','purple','yellow','pink','green'],_addBoom:(...a)=>booms.push(a),addParts:(...a)=>parts.push(a),doHitFlash:(...a)=>flashes.push(a),shake(){},SFX:{detonate(){}}});
 vm.runInContext(html.slice(a,b),ctx);
 for(const [el,type] of [[0,'physical'],[1,'redbean'],[2,'ice'],[3,'dark'],[4,'lightning'],[5,'holy'],[6,'earth']]){
  ctx._projHitFx(1,2,el,true);assert.equal(booms.at(-1)[4],type);
  if(el!==1)assert.equal(flashes.at(-1)[0],el===0?'#ffffff':ctx.ELC[el]);
  if(el===0)assert.equal(parts.at(-1)[2],'#ffffff');
 }
});
test('physical impact uses only four burst frames from Fire Impact, without smoke',()=>{
 assert.ok(html.includes("physical:['Fire_ImpactFire_Sheet.png']"));
 assert.ok(html.includes("const _sTotal=_bv.col==='physical'?4:_sCols*_sRows"));
 assert.match(html,/_bv.col==='physical'\?_physicalImpactSheet\(_sImg\):_sImg/);
 assert.match(html,/_tintHolyDome\(img,255,255,255\)/);
});
