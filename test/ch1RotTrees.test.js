// CH1-1 pass 98: rotten bio-trees as runtime sprites (sway, every eye blinks, tumour pulse).
// - embedded tables == placements.json / features.json / layout.js boundary
// - variety: every visible look (variant x flip) at most twice
// - wind: base fixed, sheared slices continuous, shear decomposition exact
// - wiring in both builds + NW/web packaging
// - runtime on a stub canvas: culling, idle build, desynchronized blinks, erased trees
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const SRC=path.join(ROOT,'assets/map/ch1/production_finish/outer90_sources');
const placements=JSON.parse(fs.readFileSync(path.join(SRC,'placements.json'),'utf8'));
const features=JSON.parse(fs.readFileSync(path.join(SRC,'features.json'),'utf8'));
const moduleSrc=fs.readFileSync(path.join(ROOT,'ch1-rot-trees.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const easySrc=fs.readFileSync(path.join(ROOT,'game-easy-test.html'),'utf8');
const buildSrc=fs.readFileSync(path.join(ROOT,'build-nwjs.mjs'),'utf8');
const layoutCtx={};vm.runInNewContext(fs.readFileSync(path.join(ROOT,'assets/map/ch1/production_finish/layout.js'),'utf8'),layoutCtx);

function makeCtx(log){
  const grad={addColorStop(){}};
  return{
    canvas:null,filter:'none',imageSmoothingEnabled:true,imageSmoothingQuality:'high',
    drawImage(...a){if(log)log.push(a)},getImageData:(x,y,w,h)=>{const d=new Uint8ClampedArray(w*h*4);d.fill(255);return{data:d}},putImageData(){},
    createLinearGradient:()=>grad,createRadialGradient:()=>grad,
    save(){},restore(){},beginPath(){},ellipse(){},clip(){},fillRect(){},
    moveTo(){},quadraticCurveTo(){},stroke(){},translate(){},scale(){},rotate(){},
    set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},
    set globalCompositeOperation(v){},globalAlpha:1
  };
}
function loadModule(){
  const timeouts=[],images=[];
  class Img{constructor(){this.complete=true;this.naturalWidth=1024;this.naturalHeight=1024;this.width=1024;this.height=1024;images.push(this)}}
  const g={
    document:{createElement:()=>({width:0,height:0,getContext:()=>makeCtx()})},
    Image:Img,performance:{now:()=>Date.now()},console:{warn:()=>{}},
    setTimeout:(fn)=>{timeouts.push(fn);return timeouts.length;},
    Math,JSON,Object,Array,Map,Set,Float32Array,Uint8ClampedArray
  };
  const api=new Function('globalThis',moduleSrc+'\nreturn globalThis.Ch1RotTrees;')(g);
  return{api,flush(){let n=0;while(timeouts.length&&n++<100000)timeouts.shift()(null);},images};
}

test('rot trees: embedded tables equal placements.json, features.json and layout boundary',()=>{
  const {api}=loadModule();
  assert.equal(placements.version,'20261008-rotforest-98');
  assert.equal(features.version,'20261008-rotforest-98');
  assert.equal(api._trees.length,36);
  api._trees.forEach(([idx,tx,ty,v,scale,flip],i)=>{
    assert.equal(idx,i);
    assert.deepEqual(placements.placements[i],[tx,ty,v,scale,flip],`T${i}`);
    assert.ok(v>=1&&v<=12&&(flip===0||flip===1));
  });
  for(let v=1;v<=12;v++){
    const key=`tree_${String(v).padStart(2,'0')}`;
    assert.deepEqual(api._feats[v],features[key].map(f=>[f.kind[0],f.cx,f.cy,f.rx,f.ry]),key);
    assert.ok(features[key].some(f=>f.kind==='eye'),`${key} has at least one blinking eye`);
    assert.ok(fs.existsSync(path.join(ROOT,`assets/map/ch1/collision/rotforest_tree_${String(v).padStart(2,'0')}.png`)));
  }
  const m=moduleSrc.match(/\/\*BOUNDARY-BEGIN\*\/(.*?)\/\*BOUNDARY-END\*\//s);
  assert.deepEqual(JSON.parse(m[1]),JSON.parse(JSON.stringify(layoutCtx.CH1_1_PRODUCTION.boundary)));
});

test('rot trees: variety — visible looks (variant x flip) used at most twice, hand trees all different',()=>{
  const {api}=loadModule();
  const uses=new Map();
  // inner trees fully erased by the bake tree_fade do not count (they are never drawn)
  for(const [idx,tx,ty,v,scale,flip] of api._trees){
    const side=Math.round(410*scale),k=1000/1024,cx=tx*40,cy=ty*40-side*k*.25;
    if(api._treeFade(cx,cy)<.05&&api._treeFade(cx,ty*40-side*k*.6)<.05)continue;
    const key=v+'/'+flip;uses.set(key,(uses.get(key)||0)+1);
  }
  for(const [key,n] of uses)assert.ok(n<=2,`look ${key} used ${n} times`);
  const hand=[...gameSrc.matchAll(/\{id:'m_ctree(1[3-9]|20)',file:'rotforest_tree_(\d\d)\.png'/g)].map(m=>m[2]);
  assert.equal(hand.length,8);assert.equal(new Set(hand).size,8,'eight hand-placed infected trees use eight different variants');
});

test('rot trees: wind — base still, top moves, shear decomposition is exact',()=>{
  const {api}=loadModule();
  const it=api._instances()[0];
  for(let t=0;t<30000;t+=777)assert.equal(api._sway(it,t,0),0,'anchor never moves');
  let max=0;for(let t=0;t<30000;t+=37)max=Math.max(max,Math.abs(api._sway(it,t,1)));
  assert.ok(max>2&&max<16,`tip sway ${max.toFixed(1)}px stays subtle`);
  const mul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3]];
  for(const k of [-.3,-.02,0,.01,.25]){
    let M=[1,0,0,1];
    api._shear({rotate(a){M=mul(M,[Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a)])},scale(x,y){M=mul(M,[x,0,0,y])}},k);
    assert.ok(Math.abs(M[0]-1)<1e-9&&Math.abs(M[1])<1e-9&&Math.abs(M[2]-k)<1e-9&&Math.abs(M[3]-1)<1e-9,`shear ${k}`);
  }
});

test('rot trees: bake tree_fade — 0 deep in the walkable floor, 1 deep outside',()=>{
  const {api}=loadModule();
  assert.equal(api._treeFade(4000,4000),0,'arena centre');
  assert.equal(api._treeFade(100,100),1,'map corner');
});

test('rot trees: wiring — game.html tag + ground call + map object hook + start warmup; packaging',()=>{
  assert.match(gameSrc,/<script src="ch1-rot-trees\.js\?v=20261008-98"><\/script>/);
  assert.match(gameSrc,/Ch1FaceLife\.draw\([^\n]*\n\s*if\(globalThis\.Ch1RotTrees\)Ch1RotTrees\.draw\(X,G,_now,_CH1_START_ROOT,VW,VH\);/,'ground pass right after face life');
  for(const s of [gameSrc,easySrc]){
    assert.match(s,/_meta\.rotTree&&globalThis\.Ch1RotTrees&&Ch1RotTrees\.drawObj\(X,mo,_meta\.rotTree,sz,_now\)\)\)X\.drawImage\(_spr,mo\.x-sz\/2,mo\.y-sz\/2,sz,sz\)/,'map object hook keeps the plain drawImage fallback');
    assert.match(s,/_OBJ_META\[_k\]\.rotTree=_rtObj\[_k\]/);
    assert.match(s,/\(globalThis\.Ch1RotTrees\?\.qa\?\.\(\)\.pending\|\|0\)/,'start scene waits for tree builds');
  }
  assert.doesNotMatch(easySrc,/<script src="ch1-rot-trees/,'easy-test keeps the call lines only');
  assert.match(buildSrc,/'ch1-rot-trees\.js',/);
});

test('rot trees: runtime — culling, idle build, erased inner trees, desynchronized blinks',()=>{
  const {api,flush}=loadModule();
  const g={stage:0,_bossArena:false,cam:{x:-40000,y:-40000},_camZoom:1};
  const ctx=makeCtx();
  api.draw(ctx,g,1000,'assets/map/ch1/production_finish',1600,900);flush();
  assert.equal(api.qa().builds,0,'nothing on screen, nothing built');
  assert.equal(api.draw(ctx,{...g,stage:1},1000,'assets/map/ch1/production_finish',1600,900),0,'other stages draw nothing');
  // big outer tree T0 (18,97)
  g.cam.x=18*40;g.cam.y=97*40-300;
  let now=2000;
  for(let i=0;i<40;i++){api.draw(ctx,g,now+=60,'assets/map/ch1/production_finish',1600,900);flush();}
  const qa=api.qa();
  assert.ok(qa.builds>0&&qa.builds<=qa.visible+2,'only visible trees build');
  const it=api._instances().find(t=>t.idx===0);
  assert.ok(it.tex,'T0 built');
  const eyes=it.feats.map((f,i)=>i).filter(i=>it.feats[i].k==='e'&&it.feats[i].pw>0);
  assert.ok(eyes.length>=1,'T0 has drawable eyes');
  const first=new Map();
  for(let t=0;t<30000;t+=40){
    api.draw(ctx,g,now+t,'assets/map/ch1/production_finish',1600,900);
    it.feats.forEach((f,i)=>{if(f.k==='e'&&f.blinkStart>=0&&!first.has(i))first.set(i,t)});
  }
  assert.ok(first.size>=Math.min(1,eyes.length),'every eye blinks within 30s');
  if(first.size>=2)assert.ok(new Set(first.values()).size>1,'blink starts are desynchronized');
});
