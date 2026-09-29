import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
  const start=html.indexOf('function '+name+'(');
  assert.ok(start>=0,`${name}: forward earth cleave is missing`);
  return html.slice(start,parseExpressionAt(html,start,{ecmaVersion:'latest'}).end);
}
function wave(ang=0){return {x:0,y:0,ang,maxR:450,halfW:36,dmg:100,el:0,t:0,maxT:32,hits:[]};}
function geometry(){const s={Math};vm.runInNewContext(source('_chainSlamRayHit'),s);return s._chainSlamRayHit;}
function renderer(){return ['_chainSlamCleaveLift','_drawChainSlamCleaveRubble','_drawChainSlamCleave'].map(source).join('\n');}

test('earth cleave reaches three forward branches, excluding gaps and rear targets',()=>{
  const hit=geometry(),w=wave();
  for(const ang of [-Math.PI/7,0,Math.PI/7])assert.ok(hit({x:400*Math.cos(ang),y:400*Math.sin(ang),r:5},w,450));
  assert.equal(hit({x:400*Math.cos(Math.PI/14),y:400*Math.sin(Math.PI/14),r:5},w,450),false);
  assert.equal(hit({x:-5,y:0,r:50},w,450),false);
  assert.equal(hit({x:480,y:0,r:5},w,450),false);
});
test('cleave rotates with its captured aim and includes enemy size at the edge',()=>{
  const hit=geometry(),w=wave(Math.PI/2);
  assert.ok(hit({x:0,y:400,r:5},w,450));
  assert.equal(hit({x:400,y:0,r:5},w,450),false);
  assert.ok(hit({x:43,y:400,r:8},w,450));
  assert.equal(hit({x:47,y:400,r:8},w,450),false);
});
test('advancing fissures strike each enemy once even where branches overlap',()=>{
  const near={x:20,y:0,r:10,alive:true,kb:{x:0,y:0},stunned:0};
  const far={x:400,y:0,r:10,alive:true,kb:{x:0,y:0},stunned:0};
  const rear={x:-20,y:0,r:10,alive:true,kb:{x:0,y:0},stunned:0};
  const calls=[];
  const s={Math,shQuery:()=>[near,far,rear],elMul:()=>1,hurtE:(e,d)=>calls.push([e,d]),
    _poiseHit(){},addTxt(){},_T:s=>s,poolPart(){},OPT:{parts:0}};
  vm.runInNewContext(source('_chainSlamRayHit')+'\n'+source('_updateChainSlamCleave'),s);
  const w=wave();s._updateChainSlamCleave(w,1);
  assert.deepEqual(calls,[[near,100]]);
  for(let i=0;i<9;i++)s._updateChainSlamCleave(w,1);
  assert.deepEqual(calls,[[near,100],[far,100]]);
  for(let i=0;i<20;i++)s._updateChainSlamCleave(w,1);
  assert.equal(calls.length,2);
  assert.equal(near.stunned,300);
});
test('chain cleave renderer leaves pillar and radial slam artwork out of its branch',()=>{
  const s={Math,paths:0,_chainCleaveImg:{complete:false},_chainCleaveRubbleImg:{complete:false}};
  const ctx={save(){},restore(){},beginPath(){s.paths++;s.points=0;},moveTo(){s.points++;},lineTo(){s.points++;},closePath(){},fill(){assert.ok(s.points<=4,'the live WebGL wrapper fills at most four polygon vertices');},stroke(){},
    drawImage(){assert.fail('cleave must not draw the shared pillar/hero sheet');},arc(){assert.fail('cleave must not draw a radial slam ring');}};
  s.X=ctx;
  vm.runInNewContext(renderer(),s);
  const w=wave();w.t=8;s._drawChainSlamCleave(w);
  assert.ok(s.paths>=3,'all three fissures must be drawn');
});

test('API fissure art reveals along each of the three captured directions',()=>{
  const draws=[],angles=[],image={complete:true,naturalWidth:2688,naturalHeight:1152};
  const s={Math,_chainCleaveImg:image,_chainCleaveRubbleImg:{complete:false},X:{save(){},restore(){},translate(){},rotate:a=>angles.push(a),drawImage:(...a)=>draws.push(a),beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}}};
  vm.runInNewContext(renderer(),s);
  const w=wave(Math.PI/2);w.t=5;s._drawChainSlamCleave(w);
  assert.deepEqual(angles,[Math.PI/2-Math.PI/7,Math.PI/2,Math.PI/2+Math.PI/7]);
  assert.equal(draws.length,21,'each branch has a solid body and six softened leading strips');
  for(let arm=0;arm<3;arm++){const part=draws.slice(arm*7,arm*7+7);assert.equal(part[0][0],image);assert.ok(Math.abs(part.reduce((v,a)=>v+a[3],0)-1344)<1e-6);assert.ok(Math.abs(part.reduce((v,a)=>v+a[7],0)-225)<1e-6);}
});

test('dedicated fissure asset keeps its RGBA dimensions and both runtime renderers match',()=>{
  const png=fs.readFileSync(new URL('../img/vfx/chain_earth_cleave.png',import.meta.url));
  assert.equal(png.readUInt32BE(16),2688);assert.equal(png.readUInt32BE(20),1152);assert.equal(png[25],6);
  const mirror=fs.readFileSync(new URL('../game-easy-test.html',import.meta.url),'utf8');
  const at=mirror.indexOf('function _drawChainSlamCleave(');
  assert.equal(mirror.slice(at,parseExpressionAt(mirror,at,{ecmaVersion:'latest'}).end),source('_drawChainSlamCleave'));
});
