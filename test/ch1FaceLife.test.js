// CH1-1 pass 97: baked bio-tree face-life contracts.
// - anchor table integrity (JSON == embedded table == placement/feature transform)
// - sway displacement formula stays in lockstep with ch1-forest-sway.js
// - game.html wiring (script tag, draw call after sway, chunk cache key)
// - runtime behavior on a stub canvas: camera culling, idle build, blink desync
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const FIN=path.join(ROOT,'assets/map/ch1/production_finish');
const anchorsDoc=JSON.parse(fs.readFileSync(path.join(FIN,'outer90_sources/face-anchors.json'),'utf8'));
const placements=JSON.parse(fs.readFileSync(path.join(FIN,'outer90_sources/placements.json'),'utf8'));
const features=JSON.parse(fs.readFileSync(path.join(FIN,'outer90_sources/features.json'),'utf8'));
const moduleSrc=fs.readFileSync(path.join(ROOT,'ch1-face-life.js'),'utf8');
const swaySrc=fs.readFileSync(path.join(ROOT,'ch1-forest-sway.js'),'utf8');
const gameSrc=fs.readFileSync(path.join(ROOT,'game.html'),'utf8');
const SIZE=8192;

test('face anchors: version, bounds and kinds are valid',()=>{
  assert.strictEqual(anchorsDoc.version,'20260930-rotforest-97');
  assert.strictEqual(anchorsDoc.bakeToWorld,1000/1024);
  assert.ok(anchorsDoc.anchors.length>=100,'expected a substantial anchor set');
  for(const a of anchorsDoc.anchors){
    assert.ok(['eye','mouth','tumor'].includes(a.k));
    assert.ok(a.x>=0&&a.x<SIZE&&a.y>=0&&a.y<SIZE);
    assert.ok(a.rx>0&&a.ry>0&&a.rx<200&&a.ry<200);
    assert.ok(a.f>=0.5,'anchors below boundary fade 0.5 must be dropped');
  }
});

test('face anchors: every anchor comes from the placement x feature transform',()=>{
  const candidates=[];
  for(const [tx,ty,variant,width,flip] of placements.massPlacements){
    const height=Math.round(width*1152/2048),sx=width/2048,sy=height/1152;
    const x0=Math.round(tx*SIZE/200-width/2),y0=Math.round(ty*SIZE/200-height*.72);
    for(const f of features[`mass_0${variant}`]){
      let fx=f.cx*sx;if(flip)fx=width-1-fx;
      candidates.push([f.kind,x0+fx,y0+f.cy*sy]);
    }
  }
  for(const [tx,ty,variant,scale] of placements.placements){
    const side=Math.round(410*scale),s=side/1024;
    const x0=Math.round(tx*SIZE/200-side/2),y0=Math.round(ty*SIZE/200-side*.74);
    for(const f of features[`tree_0${variant}`])candidates.push([f.kind,x0+f.cx*s,y0+f.cy*s]);
  }
  for(const a of anchorsDoc.anchors){
    const hit=candidates.some(([k,x,y])=>k===a.k&&Math.abs(x-a.x)<=1.1&&Math.abs(y-a.y)<=1.1 /* python banker rounding vs Math.round */);
    assert.ok(hit,`anchor ${a.k}@${a.x},${a.y} has no source placement/feature`);
  }
});

test('embedded anchor table matches face-anchors.json',()=>{
  const m=moduleSrc.match(/\/\*ANCHORS-BEGIN 20260930-rotforest-97\*\/(.*?)\/\*ANCHORS-END\*\//s);
  assert.ok(m,'embedded table markers missing');
  const raw=JSON.parse(m[1]);
  assert.strictEqual(raw.length,anchorsDoc.anchors.length);
  raw.forEach((row,i)=>{
    const a=anchorsDoc.anchors[i];
    assert.deepStrictEqual(row,[a.k[0],a.x,a.y,a.rx,a.ry]);
  });
});

test('displacement formula stays identical to ch1-forest-sway.js',()=>{
  const grab=src=>{
    const m=src.match(/function displacement\(now,wx,wy\)\{\s*return ([^;]+);/s);
    assert.ok(m,'displacement not found');
    return m[1].replace(/\s+/g,'');
  };
  assert.strictEqual(grab(moduleSrc),grab(swaySrc));
});

test('game.html wiring: script tag, draw order and chunk cache key',()=>{
  assert.ok(gameSrc.includes('<script src="ch1-face-life.js?v=20260930-97"></script>'));
  const sway=gameSrc.indexOf('Ch1ForestSway.draw(X,G,_now');
  const face=gameSrc.indexOf('Ch1FaceLife.draw(X,G,_now');
  assert.ok(sway>0&&face>sway,'face life must draw after forest sway');
  assert.ok(face-sway<400,'face life draw call should sit right after the sway call');
  assert.strictEqual((gameSrc.match(/Ch1FaceLife\.draw\(/g)||[]).length,1);
  assert.ok(gameSrc.includes("'20260930-rotforest-97'"),'production chunk cache key must be pass-96 bake key 97');
});

// ---- runtime behavior on stubs ----
function makeCtx(){
  const grad={addColorStop(){}};
  return{
    canvas:null,drawImage(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
    createLinearGradient:()=>grad,createRadialGradient:()=>grad,
    save(){},restore(){},beginPath(){},ellipse(){},clip(){},fillRect(){},
    moveTo(){},quadraticCurveTo(){},stroke(){},translate(){},scale(){},
    set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},
    set globalCompositeOperation(v){},set globalAlpha(v){}
  };
}
function loadModule(){
  const timeouts=[];
  const sandboxGlobal={
    document:{createElement:()=>{const c={width:0,height:0,getContext:()=>makeCtx()};return c;}},
    performance:{now:()=>Date.now()},
    console:{warn:()=>{}},
    setTimeout:(fn)=>{timeouts.push(fn);return timeouts.length;},
    Math,JSON,Object,Array,Uint8ClampedArray
  };
  const fn=new Function('globalThis',moduleSrc+'\nreturn globalThis.Ch1FaceLife;');
  const api=fn(sandboxGlobal);
  return{api,flush(){while(timeouts.length)timeouts.shift()(null);}};
}
function fakeWorld(){
  const map=[];for(let y=0;y<200;y++){map.push(new Array(200).fill(1));}
  for(let y=60;y<140;y++)for(let x=60;x<140;x++)map[y][x]=0;
  const chunkCache={};
  for(let x=0;x<8;x++)for(let y=0;y<8;y++)chunkCache[x+','+y]={status:'ready',img:{complete:true,naturalWidth:1026}};
  const g={stage:0,_bossArena:false,_fieldRebuildQA:false,map,cam:{x:0,y:0},_camZoom:1};
  return{g,chunkCache};
}

test('runtime: culling, idle build and unsynchronized blinks',async()=>{
  const {api,flush}=loadModule();
  assert.strictEqual(api.qa().version,'20260930-rotforest-97');
  assert.strictEqual(api.qa().anchors,anchorsDoc.anchors.length);
  assert.ok(api.debugBlink(anchorsDoc.anchors.findIndex(a=>a.k==='eye'),500));
  assert.strictEqual(api.debugBlink(anchorsDoc.anchors.findIndex(a=>a.k==='tumor')),false);
  const {g,chunkCache}=fakeWorld();
  const ctx=makeCtx();
  // camera far outside any anchor: nothing builds
  g.cam.x=-40000;g.cam.y=-40000;
  api.draw(ctx,g,1000,chunkCache,[],1000,'assets/map/ch1/production_finish',1600,900);
  flush();
  assert.strictEqual(api.qa().builds,0,'culled anchors must not build patches');
  // camera over a dense anchor area: idle queue builds visible patches only
  const target=anchorsDoc.anchors[0];
  g.cam.x=target.x*1000/1024;g.cam.y=target.y*1000/1024;
  let now=2000;
  for(let i=0;i<30;i++){api.draw(ctx,g,now+=60,chunkCache,[],1000,'assets/map/ch1/production_finish',1600,900);flush();}
  const qa=api.qa();
  assert.ok(qa.builds>0,'visible anchors must build');
  assert.ok(qa.builds<=qa.visible+4,'builds stay near the visible set');
  // step time and log blink starts per eye: they must not be synchronized
  const eyes=api.debugAnchors().filter(a=>a.k==='e'&&a.status==='ready').map(a=>a.i);
  const firstBlink=new Map();
  for(let t=0;t<40000;t+=50){
    api.draw(ctx,g,now+t,chunkCache,[],1000,'assets/map/ch1/production_finish',1600,900);
    for(const a of api.debugAnchors()){
      if(a.k==='e'&&a.blinking&&!firstBlink.has(a.i))firstBlink.set(a.i,t);
    }
  }
  if(eyes.length>=2){
    const times=[...firstBlink.values()];
    assert.ok(times.length>=2,'at least two eyes must blink within 40s');
    assert.ok(new Set(times).size>1,'blink starts must be desynchronized');
  }
  assert.ok(api.qa().meanDrawMs>=0);
});
