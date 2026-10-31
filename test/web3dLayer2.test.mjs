import test from 'node:test';
import assert from 'node:assert/strict';
import * as layout from '../web3d/living-layout.mjs';

const hill={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3};
test('wet ground never receives terrestrial clumps, including a plant whose leaves overhang the bank',()=>{
  assert.equal(typeof layout.plantHabitat,'function');
  const x=(147+18*.94)*40,y=98*40;
  assert.deepEqual(layout.plantHabitat(x,y,hill,40),{wet:true,shore:true,variant:0});
  assert.equal(layout.plantHabitat(147*40,98*40,hill,40).wet,false);
  assert.equal(layout.plantHabitat((147-18*.94)*40,98*40,hill,40).wet,false);
});
test('boundary groups increase density without occupying the central combat floor or using native RNG',()=>{
  const map=Array.from({length:45},(_,y)=>Array.from({length:60},(_,x)=>x<4||x>55||y<4||y>40?1:0));
  const before=JSON.stringify(map),a=layout.foliageLayout(map,40,123);
  assert.ok(a.length>=90,'boundary vegetation must form 2-3 plant groups');
  assert.ok(new Set(a.map(p=>p.variant)).size>=3,'mixed terrestrial species');
  assert.deepEqual(a,layout.foliageLayout(map,40,123));
  assert.equal(JSON.stringify(map),before);
  assert.ok(a.every(p=>p.x<300||p.x>2100||p.y<300||p.y>1450));
});
test('height projection fixes the root and leaves the native world and hero coordinates untouched',()=>{
  assert.equal(typeof layout.objectRelief,'function');
  const object={type:'tree',x:100,y:200,scale:1},meta={sz:500,occ:1,footYF:.45};
  const original=JSON.stringify(object),pose=layout.objectRelief(object,meta,{x:130,y:260},4);
  assert.equal(pose.foot,425);
  assert.ok(pose.shear!==0&&Math.abs(pose.shear)<.035);
  assert.ok(pose.lift>1&&pose.lift<=1.06);
  assert.equal(layout.objectRelief({type:'pool',x:100,y:200},{sz:500},{x:130,y:260},4),null);
  assert.equal(JSON.stringify(object),original);
});
