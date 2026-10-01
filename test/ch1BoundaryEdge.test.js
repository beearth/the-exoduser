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
import {createHash} from 'node:crypto';
import {parseExpressionAt} from 'acorn';
import {createCanvas,Image as CanvasImage} from 'canvas';
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
    assert.match(s,/Ch1BorderForeground\.drawBack\(X,G,_now,VW,VH\);[^\n]*\n\s*if\(globalThis\.Ch1BoundaryEdge\)Ch1BoundaryEdge\.draw\(X,G,_now,VW,VH,_tzoom\);/);
  assert.match(buildSrc,/'ch1-boundary-edge\.js'/);
});

// Seed only the expensive, immutable art cache; exercise the real draw path.
// No test-only hooks are added to the production API.
function preparedDraw(zoom,cam={x:4000,y:4000},anchors=[]){
  const sandbox={performance:{now:()=>0},location:{search:'?edgeShade=b'}};
  sandbox.globalThis=sandbox;vm.createContext(sandbox);
  vm.runInContext(src.replace('  function draw(',
    '  root.seed=(g,list)=>{shade={width:800,height:800};rim=[{},{},{}];pool={};roots=list;mapRef=g.map;};\n  function draw('),sandbox);
  const g={stage:0,map:[[0]],mw:200,mh:200,cam};
  sandbox.seed(g,anchors);
  const images=[],translations=[];
  const ctx={drawImage(...args){images.push(args.slice(1));},translate(...p){translations.push(p);},save(){},restore(){},rotate(){},scale(){}};
  sandbox.Ch1BoundaryEdge.draw(ctx,g,0,1280,800,zoom);
  return{images,translations};
}

test('boundary edge: shade covers the inverse-transformed viewport at all supported zooms',()=>{
  // .04 is the editor minimum; .3 is the gameplay camera bound.
  // Product cases protect the complete transform contract if both factors apply.
  for(const z of [1,.62,.3,.04,4,.5*.62,.04*.3]){
    for(const cam of [{x:2420,y:6600},{x:4000,y:4000},{x:0,y:0},{x:8000,y:8000}]){
      const [sx,sy,sw,sh,x,y,w,h]=preparedDraw(z,cam).images[0];
      const left=Math.max(0,cam.x-640/z),right=Math.min(8000,cam.x+640/z);
      const top=Math.max(0,cam.y-400/z),bottom=Math.min(8000,cam.y+400/z);
      assert.ok(x<=left&&x+w>=right&&y<=top&&y+h>=bottom,`uncovered viewport at ${z}`);
      assert.ok(x>=0&&y>=0&&x+w<=8000&&y+h<=8000,'clip to the map, including extreme zoom');
      assert.deepStrictEqual([sx,sy,sw,sh],[x*.1,y*.1,w*.1,h*.1],'source and world crop stay aligned');
    }
  }
});

test('boundary edge: omitted/invalid zoom preserves exact 1x draw contract',()=>{
  const expected=[328,352,144,96,3280,3520,1440,960];
  for(const z of [undefined,1,0,-1,NaN,Infinity,'0.62'])
    assert.deepStrictEqual(preparedDraw(z).images[0],expected);
});

test('boundary edge: visible roots beyond old 1x bounds survive far-zoom culling',()=>{
  for(const z of [.62,.3,.04,.5*.62]){
    const cam={x:4000,y:4000},half=Math.min(3900,640/z);
    const roots=[{x:cam.x-half+10,y:4000,rot:0,s:.42,flip:false},
      {x:cam.x+half-10,y:4000,rot:0,s:.42,flip:true}];
    assert.strictEqual(preparedDraw(z,cam,roots).translations.length,2,`visible roots culled at ${z}`);
  }
  const outside={x:6200,y:4000,rot:0,s:.42,flip:false};
  assert.strictEqual(preparedDraw(.62,undefined,[outside]).translations.length,0,'do not draw distant offscreen roots');
});

test('boundary edge: both callers pass the exact zoom used by the world transform',()=>{
  for(const s of [gameSrc,easySrc]){
    assert.match(s,/const _tzoom=_ez\*_cz;/);
    assert.match(s,/X\.scale\(_tzoom,_tzoom\)/);
    assert.match(s,/Ch1BoundaryEdge\.draw\(X,G,_now,VW,VH,_tzoom\)/);
  }
});

// Baseline: outputs/map020-variants-20261001/before-boundary.js,
// SHA256 6274c941c790ff9ff34494620393a03824bb1a87406c298f97ac022b601423df.
// Pin the relevant original functions so tests remain portable without that local output.
const digest=s=>createHash('sha256').update(s).digest('hex');
function functionText(source,name){
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'missing function '+name);
  const node=parseExpressionAt(source,start,{ecmaVersion:'latest'});
  return source.slice(node.start,node.end);
}
const legacyBuildRim=`function buildRim(){
    rim=cv(440,120);const rc=rim.getContext('2d');
    rc.drawImage(pool,200,530,440,120,0,0,440,120);
    rc.globalCompositeOperation='destination-in';
    const rh=rc.createLinearGradient(0,0,440,0);rh.addColorStop(0,'rgba(0,0,0,0)');rh.addColorStop(.16,'#000');rh.addColorStop(.84,'#000');rh.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rh;rc.fillRect(0,0,440,120);
    const rv=rc.createLinearGradient(0,0,0,120);rv.addColorStop(0,'rgba(0,0,0,0)');rv.addColorStop(.26,'#000');rv.addColorStop(.9,'#000');rv.addColorStop(1,'rgba(0,0,0,0)');rc.fillStyle=rv;rc.fillRect(0,0,440,120);
    // Darken toward the forest tone so strips sit in the edge shadow.
    rc.globalCompositeOperation='source-atop';rc.fillStyle='rgba(10,7,8,.12)';rc.fillRect(0,0,440,120);
  }`;
const legacyDraw=functionText(src,'draw').replace('ctx.drawImage(rim[rootVariant(r)],-220,-46)','ctx.drawImage(rim,-220,-46)');
const legacySrc=src.replace(functionText(src,'buildRim'),legacyBuildRim).replace(functionText(src,'draw'),legacyDraw);

test('boundary variants: original build/RNG and legacy draw are byte-exact before-source functions',()=>{
  assert.strictEqual(digest(functionText(src,'build')),'412b8e73d89c49377da06f1f2350c2015d290d09027df7c7316f849dd8a60b7c');
  assert.strictEqual(digest(functionText(src,'rng')),'72e8f493a4cc7862047ea7c47d9ba88910611d13304c6a7058dfeaa430195a60');
  assert.strictEqual(digest(legacyDraw),'95adff66ae20a4fae90d485b4daf7f9b69d32ecbd2b251eae1ebce9db20893b0');
  assert.strictEqual(digest(legacyBuildRim),'3192ad961b8d40b8ead17799a306cceade86081584d85e2dbf775d30cdbd5315');
});

// Real raster surfaces and the approved on-disk image, with draw-call observation.
// Node-canvas blur behavior is not a browser visual oracle: equality here protects
// build/anchor/RNG/cache contracts; browser camera quality is verified separately.
function rasterRun(source,mode='b'){
  const created=[],buildDraws=[],idle=[];let imageLoads=0;
  const math=Object.create(Math);math.random=()=>{throw new Error('unexpected unseeded RNG');};
  class PoolImage extends CanvasImage{
    set src(value){imageLoads++;super.src=fs.readFileSync(path.join(ROOT,value));}
  }
  const sandbox={Math:math,performance:{now:()=>0},location:{search:'?edgeShade='+mode},Image:PoolImage,
    __rngCalls:0,requestIdleCallback:fn=>idle.push(fn),
    document:{createElement(tag){
      assert.strictEqual(tag,'canvas');const canvas=createCanvas(1,1);created.push(canvas);
      const context=canvas.getContext('2d'),original=context.drawImage;
      context.drawImage=function(image,...args){buildDraws.push({canvas,image,args});return original.call(this,image,...args);};
      return canvas;
    }}};
  sandbox.globalThis=sandbox;vm.createContext(sandbox);
  const marker='return function(){s=(Math.imul';
  assert.ok(source.includes(marker),'seeded RNG instrumentation anchor');
  vm.runInContext(source.replace(marker,'return function(){root.__rngCalls++;s=(Math.imul'),sandbox);
  const map=Array.from({length:20},(_,y)=>Array.from({length:24},(_,x)=>
    x<3||x>20||y<3||y>16||(x===12&&y>=6&&y<=14)?1:0));
  for(const row of map)Object.freeze(row);Object.freeze(map);
  const g={stage:0,map,mw:24,mh:20,cam:{x:480,y:400}};
  const output=createCanvas(1280,800),ctx=output.getContext('2d');let trace=[];
  for(const name of ['drawImage','save','restore','translate','rotate','scale']){
    const original=ctx[name];ctx[name]=function(...args){trace.push({name,args});return original.apply(this,args);};
  }
  function draw(zoom=1){trace=[];ctx.clearRect(0,0,1280,800);sandbox.Ch1BoundaryEdge.draw(ctx,g,0,1280,800,zoom);return trace.slice();}
  draw();assert.strictEqual(created.length,0,'first draw defers build');
  function flushIdle(){while(idle.length)idle.shift()();}
  flushIdle();
  return{g,draw,created,buildDraws,edge:sandbox.Ch1BoundaryEdge,rngCalls:()=>sandbox.__rngCalls,
    flushIdle,imageLoads:()=>imageLoads,pixels:()=>digest(ctx.getImageData(0,0,1280,800).data)};
}
function anchorTrace(trace){return trace.filter(t=>t.name!=='drawImage').map(t=>({name:t.name,args:t.args}));}

test('boundary variants: real draw selects all three cached crops and reuses textures across frames/map rebuilds',()=>{
  const run=rasterRun(src),first=run.draw();
  const strips=run.created.filter(c=>c.width===440&&c.height===120);
  assert.strictEqual(strips.length,3,'exactly three materialized rim caches');
  const cropCalls=run.buildDraws.filter(call=>strips.includes(call.canvas)&&call.image instanceof CanvasImage);
  assert.deepStrictEqual(cropCalls.map(call=>call.args),[
    [200,530,440,120,0,0,440,120],[370,535,270,90,0,0,440,120],[250,550,310,70,0,0,440,120]]);
  assert.strictEqual(new Set(strips.map(c=>digest(c.getContext('2d').getImageData(0,0,440,120).data))).size,3,'three distinct real image crops');
  const selected=new Set();let position;
  for(const call of first){
    if(call.name==='translate')position=call.args;
    if(call.name==='drawImage'&&strips.includes(call.args[0])){
      const [x,y]=position;
      const expected=((Math.imul(x|0,73856093)^Math.imul(y|0,19349663))>>>0)%3;
      assert.strictEqual(call.args[0],strips[expected],'world anchor selects the correct cache identity');
      assert.deepStrictEqual(call.args.slice(1),[-220,-46]);selected.add(expected);
    }
  }
  assert.deepStrictEqual([...selected].sort(),[0,1,2],'fixture exercises each actual draw branch');
  const count=run.created.length,rng=run.rngCalls(),raster=run.pixels();
  assert.deepStrictEqual(run.draw(),first,'same source images and transforms on the next frame');
  assert.strictEqual(run.created.length,count);assert.strictEqual(run.imageLoads(),1);
  assert.strictEqual(run.rngCalls(),rng,'selection/draw never advances anchor RNG');
  assert.strictEqual(run.pixels(),raster,'same-frame pixels are deterministic');
  run.g.cam={x:440,y:380};run.draw(.62);
  assert.strictEqual(run.created.length,count);assert.strictEqual(run.rngCalls(),rng,'pan/zoom reuse caches');
  run.g.map=run.g.map.map(row=>row.slice());
  assert.deepStrictEqual(run.draw(.62),[],'new map identity waits for its shade build');
  run.flushIdle();const rebuilt=run.draw(.62);
  assert.strictEqual(run.created.length,count+4,'rebuild only creates mask, two blur fields and shade');
  assert.strictEqual(run.imageLoads(),1);assert.strictEqual(run.rngCalls(),rng*2,'same map values repeat the same anchor RNG sequence');
  assert.strictEqual(run.created.filter(c=>c.width===440&&c.height===120).length,3);
  assert.ok(rebuilt.filter(t=>t.name==='drawImage').slice(1).every(t=>strips.includes(t.args[0])),'map rebuild still references the same three rim objects');
});

test('boundary variants: real before/after builds keep every root anchor, rotation, scale and RNG count',()=>{
  const before=rasterRun(legacySrc),after=rasterRun(src);
  const oldTrace=before.draw(),newTrace=after.draw();
  assert.ok(anchorTrace(oldTrace).length>30,'nontrivial generated anchor fixture');
  assert.deepStrictEqual(anchorTrace(newTrace),anchorTrace(oldTrace));
  assert.deepStrictEqual(newTrace[0].args.slice(1),oldTrace[0].args.slice(1),'shade crop preserved');
  assert.strictEqual(after.rngCalls(),before.rngCalls());
  assert.strictEqual(after.edge.qa().roots,before.edge.qa().roots);
  const oldStrip=before.created.find(c=>c.width===440&&c.height===120);
  const newStrip=after.created.find(c=>c.width===440&&c.height===120);
  assert.strictEqual(digest(newStrip.toBuffer('raw')),digest(oldStrip.toBuffer('raw')),'variant 0 retains original masked pixels');
});

test('boundary variants: mode 0 stays dormant and mode A preserves actual shade pixels without loading roots',()=>{
  const zero=rasterRun(src,'0');assert.deepStrictEqual(zero.draw(),[]);
  assert.strictEqual(zero.created.length,0);assert.strictEqual(zero.rngCalls(),0);assert.strictEqual(zero.imageLoads(),0);
  const before=rasterRun(legacySrc,'a'),after=rasterRun(src,'a');
  const oldTrace=before.draw(),newTrace=after.draw();
  assert.strictEqual(newTrace.length,1);assert.strictEqual(newTrace[0].name,'drawImage');
  assert.deepStrictEqual(newTrace[0].args.slice(1),oldTrace[0].args.slice(1));
  assert.strictEqual(after.pixels(),before.pixels());assert.strictEqual(after.rngCalls(),before.rngCalls());
  assert.strictEqual(after.imageLoads(),0);assert.strictEqual(after.created.filter(c=>c.width===440).length,0);
});
