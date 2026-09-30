// CH1-1 boundary edge (ch1-boundary-edge.js, MAP-020) contracts.
// - visual only: never writes to the tile map
// - shade curve: floor AO 0 at the open floor, AO_MAX at the wall line, forest recess up to RECESS_MAX
// - gates: other stages, boss arena and ?edgeShade=0 draw nothing and never build
// - wiring in both builds and in the package list
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=fs.readFileSync(path.join(ROOT,'ch1-boundary-edge.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const easySrc=fs.readFileSync(path.join(ROOT,'game-easy-test.html'),'utf8');
const buildSrc=fs.readFileSync(path.join(ROOT,'build-nwjs.mjs'),'utf8');

function load(search=''){
  let created=0;
  const ctx={performance:{now:()=>0},location:{search},Image:function(){},requestIdleCallback(){throw new Error('no build expected');},
    document:{createElement(){created++;throw new Error('no canvas expected');}}};
  ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);
  return{edge:ctx.Ch1BoundaryEdge,created:()=>created};
}

test('boundary edge: constants and shade curve',()=>{
  const {edge}=load();
  const c=edge._consts;
  assert.deepStrictEqual({S:c.S,AO_MAX:c.AO_MAX,RECESS_MAX:c.RECESS_MAX,AO_BLUR:c.AO_BLUR,RECESS_BLUR:c.RECESS_BLUR,ROOT_GAP:c.ROOT_GAP,ROOT_SCALE:c.ROOT_SCALE},
    {S:4,AO_MAX:.30,RECESS_MAX:.70,AO_BLUR:5,RECESS_BLUR:14,ROOT_GAP:92,ROOT_SCALE:.42});
  assert.strictEqual(edge._shadeAlpha(0,0,false),0,'open floor is untouched');
  assert.ok(Math.abs(edge._shadeAlpha(.5,.5,false)-.30)<1e-9,'floor AO peaks at the wall line');
  assert.ok(edge._shadeAlpha(.25,.25,false)<.30&&edge._shadeAlpha(.25,.25,false)>0);
  assert.ok(Math.abs(edge._shadeAlpha(.5,.5,true)-.30)<1e-9,'no step across the wall line');
  assert.ok(Math.abs(edge._shadeAlpha(1,.8,true)-.70)<1e-9,'forest recess reaches RECESS_MAX');
  for(let v=0;v<=1;v+=.05){assert.ok(edge._shadeAlpha(v,v,false)<=.30+1e-9);assert.ok(edge._shadeAlpha(1,v,true)<=.70+1e-9);}
});

test('boundary edge: never writes the tile map',()=>{
  assert.doesNotMatch(src,/\.map\[[^\]]+\]\s*(\[[^\]]+\])?\s*=[^=]/,'no assignment into g.map');
});

test('boundary edge: gates draw nothing and never build',()=>{
  const map=[[0]];let draws=0;const ctx={drawImage(){draws++;},save(){},restore(){},translate(){},rotate(){},scale(){}};
  let m=load();
  m.edge.draw(ctx,{stage:1,map,mw:1,mh:1,cam:{x:0,y:0}},0,1600,900);
  m.edge.draw(ctx,{stage:0,_bossArena:true,map,mw:1,mh:1,cam:{x:0,y:0}},0,1600,900);
  assert.strictEqual(draws,0);assert.strictEqual(m.created(),0);
  m=load('?edgeShade=0');
  m.edge.draw(ctx,{stage:0,map,mw:1,mh:1,cam:{x:0,y:0}},0,1600,900);
  assert.strictEqual(draws,0);assert.strictEqual(m.created(),0);assert.strictEqual(m.edge.qa().mode,'0');
  assert.strictEqual(load('?edgeShade=a').edge.qa().mode,'a');
  assert.strictEqual(load('').edge.qa().mode,'b','default = shadow + roots');
});

test('boundary edge: wiring in both builds and the package list',()=>{
  assert.match(gameSrc,/<script src="ch1-boundary-edge\.js\?v=\d{8}-\d+"><\/script>/);
  for(const s of [gameSrc,easySrc])
    assert.match(s,/Ch1BorderForeground\.drawBack\(X,G,_now,VW,VH\);[^\n]*\n\s*if\(globalThis\.Ch1BoundaryEdge\)Ch1BoundaryEdge\.draw\(X,G,_now,VW,VH\);/);
  assert.match(buildSrc,/'ch1-boundary-edge\.js'/);
});
