const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('pngjs');
const repo=path.resolve(__dirname,'..'),scenePath=path.join(repo,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const sceneBytes=fs.readFileSync(scenePath),source=JSON.parse(sceneBytes),clone=v=>JSON.parse(JSON.stringify(v));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
let createRiftGroundDetail,RIFT_GROUND_DETAIL;
test.before(async()=>({createRiftGroundDetail,RIFT_GROUND_DETAIL}=await import('./map-scene-rift-ground-detail.mjs')));
const identity=()=>({a:1,b:0,c:0,d:1,e:0,f:0});
class Canvas {
  constructor(){this.width=1;this.height=1;this.ctx=new Context(this);}
  getContext(){return this.ctx;}
}
class Context {
  constructor(canvas){this.canvas=canvas;this.matrix=identity();this.stack=[];this.log=[];this.globalAlpha=1;this.globalCompositeOperation='source-over';this.imageSmoothingEnabled=true;this.imageSmoothingQuality='low';this.fillStyle='black';this.depth=0;this.throwDraw=null;this.pixels=null;}
  state(){return {matrix:{...this.matrix},globalAlpha:this.globalAlpha,globalCompositeOperation:this.globalCompositeOperation,imageSmoothingEnabled:this.imageSmoothingEnabled,imageSmoothingQuality:this.imageSmoothingQuality,fillStyle:this.fillStyle};}
  save(){this.stack.push(this.state());this.depth++;this.log.push({op:'save'});}
  restore(){assert.ok(this.stack.length,'unbalanced restore');Object.assign(this,this.stack.pop());this.depth--;this.log.push({op:'restore'});}
  setTransform(a,b,c,d,e,f){this.matrix={a,b,c,d,e,f};this.log.push({op:'setTransform',matrix:{...this.matrix}});}
  getTransform(){return {...this.matrix};}
  translate(x,y){const m=this.matrix;this.matrix={...m,e:m.a*x+m.c*y+m.e,f:m.b*x+m.d*y+m.f};this.log.push({op:'translate',x,y});}
  scale(x,y){const m=this.matrix;this.matrix={a:m.a*x,b:m.b*x,c:m.c*y,d:m.d*y,e:m.e,f:m.f};this.log.push({op:'scale',x,y});}
  clearRect(...args){this.log.push({op:'clearRect',args,state:this.state()});}
  fillRect(...args){this.log.push({op:'fillRect',args,state:this.state()});}
  drawImage(...args){this.log.push({op:'drawImage',args,state:this.state()});if(this.throwDraw?.(...args))throw new Error('canvas failure');}
  createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)};}
  putImageData(data,x,y){this.pixels={width:data.width,height:data.height,data:new Uint8ClampedArray(data.data)};this.log.push({op:'putImageData',x,y});}
  createPattern(image,repetition){const pattern={image,repetition,transform:null,setTransform(m){this.transform={...m};}};this.log.push({op:'createPattern',pattern});return pattern;}
}
const image=(spec=RIFT_GROUND_DETAIL)=>({src:spec.src,naturalWidth:spec.width,naturalHeight:spec.height,complete:true});
function harness(options={}){
  const created=[],makeCanvas=()=>{const c=new Canvas();created.push(c);return c;};let loads=0,notifications=0;
  const module=createRiftGroundDetail({makeCanvas,loadImage:async()=>{loads++;return image();},onReady:()=>{notifications++;},...options});
  return {module,created,get loads(){return loads;},get notifications(){return notifications;}};
}
function target(width=900,height=600,matrix={a:2.4,b:0,c:0,d:2.4,e:-9000,f:-15000}){const c=new Canvas();c.width=width;c.height=height;c.ctx.matrix={...matrix};return c.ctx;}
const alpha=(surface,index)=>surface.ctx.pixels.data[index*4+3];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);

test('actual source pins admit v2 and consume only the approved240crop with four mirrored quadrants',async()=>{
  const bytes=fs.readFileSync(path.join(repo,RIFT_GROUND_DETAIL.src)),png=PNG.sync.read(bytes);
  assert.equal(hash(bytes),RIFT_GROUND_DETAIL.sha256);assert.deepEqual([png.width,png.height],[1024,1536]);
  assert.equal(hash(sceneBytes),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  const p=clone(source),before=JSON.stringify(p),h=harness();assert.equal(await h.module.prepare(p),true);
  assert.equal(h.loads,1);assert.equal(h.notifications,1);
  const pattern=h.created.find(c=>c.width===480&&c.height===480),paint=pattern.ctx.log.filter(e=>e.op==='drawImage');assert.equal(paint.length,4);
  for(const e of paint)assert.deepEqual(e.args.slice(1),[320,1120,240,240,0,0,240,240]);
  assert.deepEqual(paint.map(e=>[e.state.matrix.a,e.state.matrix.d,e.state.matrix.e,e.state.matrix.f]),[[1,1,0,0],[-1,1,480,0],[1,-1,0,480],[-1,-1,480,480]]);
  assert.ok(paint.every(e=>e.state.imageSmoothingEnabled===false));assert.equal(pattern.ctx.depth,0);
  const s=h.module.snapshot();assert.equal(s.worldPeriod,320);assert.equal(s.alpha,.4);assert.deepEqual(s.patternSize,{width:480,height:480});assert.equal(JSON.stringify(p),before);
});

test('unsupported scenes, changed registered sources and hidden required layers fail before loading',async()=>{
  const mutations=[p=>p.sourcePins.cleanPlate='bad',p=>p.assets.find(a=>a.id==='east-0').crop.w++,p=>p.layers.find(l=>l.id==='foot').visible=false,
    p=>p.layers.find(l=>l.id==='abyss').visible=false,p=>p.world.tileSize=41,p=>p.start.x++,p=>p.walkable=[],p=>p.productionStatus='ADOPTED'];
  for(const mutate of mutations){const p=clone(source);mutate(p);const h=harness();assert.equal(await h.module.prepare(p),false);assert.equal(h.loads,0);assert.equal(h.module.draw(target(),p,{enabled:true}),0);}
  const baked=JSON.parse(fs.readFileSync(path.join(repo,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json'),'utf8'));
  for(const p of [baked,{},null]){const h=harness();assert.equal(await h.module.prepare(p),false);assert.equal(h.loads,0);}
});

test('cached200mask covers exactly1192walkable cells and its inward feather never marks a nonwalkable cell',async()=>{
  const p=clone(source),h=harness();assert.equal(await h.module.prepare(p),true);
  const hard=h.created[0],soft=h.created[1];assert.deepEqual([hard.width,hard.height,soft.width,soft.height],[200,200,200,200]);
  let hardCells=0,edge=0,interior=0;
  for(let i=0;i<40000;i++){assert.equal(alpha(hard,i),p.walkable[i]?255:0);if(p.walkable[i]){hardCells++;assert.ok([128,255].includes(alpha(soft,i)));if(alpha(soft,i)===128)edge++;else interior++;}else assert.equal(alpha(soft,i),0);}
  assert.equal(hardCells,1192);assert.ok(edge>0&&interior>0);assert.equal(h.module.snapshot().navCells,1192);
  const ctx=target();assert.equal(h.module.draw(ctx,p,{enabled:true}),1);const out=h.created.find(c=>c.width===900&&c.height===600),clips=out.ctx.log.filter(e=>e.op==='drawImage');
  assert.equal(clips.length,2);assert.equal(clips[0].args[0],soft);assert.equal(clips[1].args[0],hard);
  assert.ok(clips.every(e=>e.state.globalCompositeOperation==='destination-in'));assert.equal(clips[0].state.imageSmoothingEnabled,true);assert.equal(clips[1].state.imageSmoothingEnabled,false);
});

test('steady draw performs zero navcell reads and rebuilds only after reference change or explicit invalidation',async()=>{
  const p=clone(source);let reads=0;const nav=p.walkable;p.walkable=new Proxy(nav,{get(a,k){if(typeof k==='string'&&/^\d+$/.test(k))reads++;return Reflect.get(a,k);}});
  const h=harness();await h.module.prepare(p);assert.ok(reads>=40000);reads=0;const ctx=target();
  for(let i=0;i<4;i++)assert.equal(h.module.draw(ctx,p,{enabled:true}),1);assert.equal(reads,0);assert.equal(h.module.snapshot().maskBuilds,1);
  assert.equal(h.created.filter(c=>c.width===900).length,1);const out=h.created.find(c=>c.width===900);assert.equal(out.ctx.log.filter(e=>e.op==='createPattern').length,1);
  p.walkable=[...nav];assert.equal(h.module.draw(ctx,p,{enabled:true}),1);assert.equal(h.module.snapshot().maskBuilds,2);
  const index=p.walkable.indexOf(1);p.walkable[index]=0;h.module.invalidate();assert.equal(h.module.draw(ctx,p,{enabled:true}),1);assert.equal(h.module.snapshot().maskBuilds,3);assert.equal(h.module.snapshot().navCells,1191);
});

test('pattern density and world origin remain fixed across cameraDPR transforms and PNGscale',async()=>{
  const p=clone(source),h=harness();await h.module.prepare(p);
  for(const ctx of [target(),target(900,600,{a:1.2,b:0,c:0,d:1.2,e:-4200,f:-7200}),target(2048,2048,{a:.256,b:0,c:0,d:.256,e:0,f:0})]){
    const matrix=ctx.getTransform();assert.equal(h.module.draw(ctx,p,{enabled:true}),1);
    const out=h.created.findLast(c=>c.width===ctx.canvas.width&&c.height===ctx.canvas.height),fill=out.ctx.log.filter(e=>e.op==='fillRect').at(-1);
    assert.deepEqual(fill.state.matrix,matrix);assert.deepEqual(fill.args,[0,0,8000,8000]);near(fill.state.fillStyle.transform.a,2/3);near(fill.state.fillStyle.transform.d,2/3);assert.equal(fill.state.fillStyle.transform.e,0);assert.equal(fill.state.fillStyle.transform.f,0);
    const composite=ctx.log.findLast(e=>e.op==='drawImage');assert.deepEqual(composite.state.matrix,identity());assert.equal(composite.state.globalCompositeOperation,'soft-light');assert.equal(composite.state.globalAlpha,1);assert.deepEqual(ctx.getTransform(),matrix);
  }
});

test('normal and thrown composite preserve target state and balance every saved context',async()=>{
  const p=clone(source),h=harness();await h.module.prepare(p);const ctx=target();ctx.globalAlpha=.73;ctx.globalCompositeOperation='multiply';ctx.fillStyle='red';ctx.imageSmoothingEnabled=false;const before=ctx.state();
  assert.equal(h.module.draw(ctx,p,{enabled:true}),1);assert.deepEqual(ctx.state(),before);assert.equal(ctx.depth,0);
  ctx.throwDraw=()=>true;assert.equal(h.module.draw(ctx,p,{enabled:true}),0);assert.deepEqual(ctx.state(),before);assert.equal(ctx.depth,0);assert.equal(h.module.snapshot().failures,1);
  for(const c of h.created)assert.equal(c.ctx.depth,0);
  ctx.throwDraw=null;const out=h.created.find(c=>c.width===900);out.ctx.throwDraw=()=>true;assert.equal(h.module.draw(ctx,p,{enabled:true}),0);assert.equal(out.ctx.depth,0);assert.deepEqual(ctx.state(),before);
});

test('disabledflags, invalid output or missing methods never touch the target or allocate framebuffers',async()=>{
  const p=clone(source),h=harness();await h.module.prepare(p);const originalCanvasCount=h.created.length;
  const forbidden=new Proxy({}, {get(){throw new Error('disabled should not inspect scene');}});
  for(const enabled of [false,undefined,null,1,'true'])assert.equal(h.module.draw(target(),forbidden,{enabled}),0);
  for(const ctx of [null,{},target(0,1),target(900,600,{a:0,b:0,c:0,d:0,e:0,f:0}),target(900,600,{a:Infinity,b:0,c:0,d:1,e:0,f:0}),target(8192,8192)])assert.equal(h.module.draw(ctx,p,{enabled:true}),0);
  assert.equal(h.created.length,originalCanvasCount);assert.equal(h.module.snapshot().draws,0);
});

test('loader failures, mismatched source dimensions or URL and invalid descriptors fail safely',async()=>{
  const p=clone(source);
  for(const im of [{...image(),naturalWidth:1023},{...image(),naturalHeight:1024},{...image(),src:'assets/map/ch1/wrong.png'},{...image(),complete:false},null]){const h=harness({loadImage:async()=>im});assert.equal(await h.module.prepare(p),false);assert.equal(h.module.draw(target(),p,{enabled:true}),0);assert.equal(h.module.snapshot().ready,false);}
  const rejected=harness({loadImage:async()=>{throw new Error('missing');}});assert.equal(await rejected.module.prepare(p),false);assert.equal(rejected.module.snapshot().failures,1);
  for(const texture of [null,{...RIFT_GROUND_DETAIL,src:'https://bad/image.png'},{...RIFT_GROUND_DETAIL,crop:{x:320,y:1400,w:240,h:240}},{...RIFT_GROUND_DETAIL,alpha:.9}]){const h=harness({texture});assert.equal(await h.module.prepare(p),false);assert.equal(h.loads,0);}
  const notify=harness({onReady(){throw new Error('consumer callback');}});assert.equal(await notify.module.prepare(p),true);assert.equal(notify.module.draw(target(),p,{enabled:true}),1);
});

test('live cropbody changes fail closed and restored or reimported valid scenes reenable without source reload',async()=>{
  const p=clone(source),h=harness(),ctx=target();await h.module.prepare(p);assert.equal(h.module.draw(ctx,p,{enabled:true}),1);
  const o=p.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-haran');o.rotation=1;assert.equal(h.module.draw(ctx,p,{enabled:true}),0);assert.equal(h.module.snapshot().supported,false);
  o.rotation=0;assert.equal(h.module.draw(ctx,p,{enabled:true}),1);assert.equal(h.loads,1);
  const next=clone(source);assert.equal(await h.module.prepare(next),true);assert.equal(h.module.draw(ctx,next,{enabled:true}),1);assert.equal(h.loads,1);assert.equal(h.module.snapshot().navCells,1192);
});

test('snapshots are detached and all source/nav/feet/history fields remain byteexact with no timers',async()=>{
  const p=clone(source),before=JSON.stringify(p),h=harness();await h.module.prepare(p);h.module.draw(target(),p,{enabled:true});h.module.invalidate();h.module.draw(target(),p,{enabled:true});
  assert.ok(Object.isFrozen(h.module));assert.deepEqual(Object.keys(h.module),['prepare','draw','invalidate','snapshot']);
  const a=h.module.snapshot(),b=h.module.snapshot();assert.notStrictEqual(a.texture,b.texture);a.texture.crop.x=0;a.maskSize.width=0;a.patternSize.width=0;a.enabled=false;
  assert.equal(h.module.snapshot().texture.crop.x,320);assert.equal(h.module.snapshot().maskSize.width,200);assert.equal(h.module.snapshot().patternSize.width,480);
  assert.equal(JSON.stringify(p),before);assert.equal(hash(fs.readFileSync(scenePath)),hash(sceneBytes));
});

test('stale asynchronous prepare cannot enable a replaced unsupported scene',async()=>{
  let resolve;const promise=new Promise(r=>resolve=r),h=harness({loadImage:()=>promise}),p=clone(source),pending=h.module.prepare(p);
  await Promise.resolve();assert.equal(await h.module.prepare({}),false);resolve(image());assert.equal(await pending,false);assert.equal(h.module.snapshot().supported,false);assert.equal(h.module.snapshot().ready,false);assert.equal(h.notifications,0);
  assert.equal(await h.module.prepare(p),true);assert.equal(h.notifications,1);assert.equal(h.module.draw(target(),p,{enabled:true}),1);
});

test('malformed or empty nav cannot paint while explicit valid local texture descriptors remain factoryonly',async()=>{
  for(const value of ['1',true,NaN]){const p=clone(source);p.walkable[p.walkable.indexOf(1)]=value;const h=harness();assert.equal(await h.module.prepare(p),false);assert.equal(h.module.draw(target(),p,{enabled:true}),0);}
  const p=clone(source);p.walkable.fill(0);const h=harness();assert.equal(await h.module.prepare(p),true);assert.equal(h.module.draw(target(),p,{enabled:true}),0);assert.equal(h.module.snapshot().reason,'empty-nav');
  const texture={...RIFT_GROUND_DETAIL,src:'assets/map/hell_rift/resolution_detail_20261006/approved-alternate.png',crop:{...RIFT_GROUND_DETAIL.crop}},alt=harness({texture,loadImage:async()=>image(texture)});
  const valid=clone(source),before=JSON.stringify(valid);assert.equal(await alt.module.prepare(valid),true);assert.equal(alt.module.draw(target(),valid,{enabled:true}),1);assert.equal(JSON.stringify(valid),before);assert.equal(valid.assets.some(a=>a.src===texture.src),false);
});
