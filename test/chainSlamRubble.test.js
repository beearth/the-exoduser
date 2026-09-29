import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
  const at=html.indexOf('function '+name+'(');
  assert.ok(at>=0,`${name}: moving earth slabs are missing`);
  return html.slice(at,parseExpressionAt(html,at,{ecmaVersion:'latest'}).end);
}
function runtime(){
  const shapes=[];
  const s={Math,_chainCleaveRubbleImg:{complete:false},X:{save(){},restore(){},beginPath(){s.points=[]},moveTo(x,y){s.points.push([x,y])},lineTo(x,y){s.points.push([x,y])},closePath(){},fill(){assert.ok(s.points.length<=4);shapes.push({points:s.points,alpha:s.X.globalAlpha,color:s.X.fillStyle})}}};
  vm.runInNewContext(source('_chainSlamCleaveLift')+'\n'+source('_drawChainSlamCleaveRubble'),s);
  return {s,shapes};
}
function wave(t){return {x:100,y:200,ang:0,maxR:450,halfW:36,t,maxT:32};}

test('earth slabs rise only after the advancing rupture reaches them and settle afterwards',()=>{
  const {s}=runtime();
  assert.equal(s._chainSlamCleaveLift(3,5),0);
  assert.equal(s._chainSlamCleaveLift(5,5),0);
  assert.ok(s._chainSlamCleaveLift(11,5)>0.7);
  assert.equal(s._chainSlamCleaveLift(28,5),0);
});

test('rubble uses cached bounded geometry and cannot reveal unreached terrain',()=>{
  const {s,shapes}=runtime(),w=wave(0);
  s._drawChainSlamCleaveRubble(w,1);
  assert.equal(shapes.length,0);
  const cache=w._cleaveRubble;
  assert.ok(cache.length>0&&cache.length<=48);
  w.t=5;s._drawChainSlamCleaveRubble(w,1);
  assert.equal(w._cleaveRubble,cache);
  assert.ok(shapes.length>0);
  for(const piece of cache)assert.ok(piece.at>=0&&piece.at<=10);
  const partial=shapes.length;shapes.length=0;
  w.t=10;s._drawChainSlamCleaveRubble(w,1);
  assert.ok(shapes.length>partial);
  shapes.length=0;w.t=32;s._drawChainSlamCleaveRubble(w,0);
  assert.equal(shapes.length,0);
});

test('loaded fissure artwork includes moving rubble rather than returning with static scratches',()=>{
  const draws=[];const {s,shapes}=runtime();
  s._chainCleaveImg={complete:true,naturalWidth:2688,naturalHeight:1152};
  Object.assign(s.X,{translate(){},rotate(){},drawImage:(...a)=>draws.push(a)});
  vm.runInNewContext(source('_drawChainSlamCleave'),s);
  const w=wave(10);s._drawChainSlamCleave(w);
  assert.ok(shapes.length>0,'successful image loading must retain earth slab animation');
  assert.ok(draws.every(a=>a[8]>=w.halfW*8),'torn terrain must be wider than the old narrow scratch strip');
});

test('loaded rock atlas crops bounded independent shards and retains motion without brick artwork',()=>{
  const draws=[];const {s}=runtime();
  const png=fs.readFileSync(new URL('../img/vfx/chain_earth_rubble.png',import.meta.url));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.equal(width%4,0);assert.equal(height%2,0);assert.equal(png[25],6);
  s._chainCleaveRubbleImg={complete:true,naturalWidth:width,naturalHeight:height};
  s.X.drawImage=(...a)=>draws.push(a);
  const w=wave(10);s._drawChainSlamCleaveRubble(w,1);
  assert.equal(draws.length,42);
  assert.ok(new Set(draws.map(a=>`${a[1]},${a[2]}`)).size>=6);
  for(const a of draws){assert.equal(a[0],s._chainCleaveRubbleImg);assert.equal(a[3],width/4);assert.equal(a[4],height/2);assert.ok(a[1]+a[3]<=width&&a[2]+a[4]<=height);}
});
