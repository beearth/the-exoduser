import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { WORLD_CAMERA_DEFAULTS } from '../engine/fdg/world-camera.js';
import { validateProject } from '../engine/fdg/project.js';
import { createDefaultRigProject } from '../engine/fdg/rig-project.js';
import { createRigScene } from '../engine/fdg/rig-scene-project.js';

const near=(actual,expected,epsilon=1e-7)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} != ${expected}`);
class Events {
  constructor(){this.listeners=new Map();}
  addEventListener(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);}
  removeEventListener(name,fn){this.listeners.get(name)?.delete(fn);}
  fire(name,event={}){for(const fn of this.listeners.get(name)||[])fn({preventDefault(){},...event});}
}
function surface(width=640,height=480) {
  const calls=[],stack=[],context={globalAlpha:1,globalCompositeOperation:'source-over'},window=new Events(),document=new Events(),canvas=new Events(),frames=new Map(),requests=[];
  for(const method of ['setTransform','fillRect','beginPath','moveTo','lineTo','closePath','stroke','strokeRect','fillText','ellipse','fill','arc','rect','clip','transform','translate','scale'])context[method]=(...args)=>calls.push({method,args,color:context.fillStyle,stroke:context.strokeStyle,font:context.font,alpha:context.globalAlpha});
  context.save=()=>stack.push({globalAlpha:context.globalAlpha,fillStyle:context.fillStyle,strokeStyle:context.strokeStyle});
  context.restore=()=>Object.assign(context,stack.pop());
  context.drawImage=(image,...args)=>calls.push({method:'drawImage',src:image.path,args,alpha:context.globalAlpha});
  let frameId=0;
  Object.assign(window,{devicePixelRatio:1,requestAnimationFrame(fn){const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},
    Image:class {set src(path){this.path=path.replace(/^\//,'');requests.push(this.path);this.naturalWidth=this.path.includes('soil')?1024:this.path.includes('actor')?32:64;this.naturalHeight=this.path.includes('soil')?1024:this.path.includes('actor')?16:96;queueMicrotask(()=>this.onload?.());}removeAttribute(){}},
  });
  document.defaultView=window;
  const attributes=new Map();Object.assign(canvas,{ownerDocument:document,getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width,height}),
    hasAttribute:key=>attributes.has(key),setAttribute:(key,value)=>attributes.set(key,value),removeAttribute:key=>attributes.delete(key),focus(){}});
  return {canvas,context,calls,window,document,frames,requests,clear(){calls.length=0;}};
}
function project(camera={...WORLD_CAMERA_DEFAULTS}) {
  return {schemaVersion:1,id:'perspective-unit-fixture',name:'원근 단위 검사',map:{width:200,height:200,tileSize:40,tiles:Array(40000).fill(1),start:{x:100,y:100},exit:{x:100,y:90},objects:[],groundSrc:'qa/perspective-soil.png',unknownCollision:{kept:true}},
    characters:[{id:'actor',name:'검사 캐릭터',radius:12,speed:156,sprite:{src:'qa/perspective-actor.png',frameWidth:16,frameHeight:16,columns:2,rows:1,frames:2,fps:24,scale:2,anchorX:.5,anchorY:1},
      animations:{idle:{row:0,start:0,frames:1,fps:24,loop:true},walk:{row:0,start:1,frames:1,fps:24,loop:true}}}],
    skills:[{id:'skill',name:'검사 스킬',damage:5,cost:1,cooldown:1,range:1000,vfx:'effect'}],vfx:[{id:'effect',name:'검사 효과',kind:'burst',color:'#abcdef',count:1,life:1,speed:0,size:8,spread:0}],
    preview:{characterId:'actor',skillId:'skill',vfxId:'effect',resourceMax:100,resourceRegen:1},unknownGameplay:{locked:true},...(camera?{viewCamera:camera}:{})};
}
const object=(id,x,y,layer='world')=>({id,name:id,x,y,src:`qa/${id}.png`,scale:1,layer,collision:false});
async function runtimeFor(t,config=project(),width=640,height=480){const ui=surface(width,height),runtime=new FDGRuntime(ui.canvas,config);t.after(()=>runtime.dispose());await runtime.load();ui.clear();return {ui,runtime};}

test('absent viewCamera keeps the legacy flat map, exact sprite/shadow draw and asset set',async t=>{
  const {ui,runtime}=await runtimeFor(t,project(null),320,240);runtime.renderOnce();
  assert.deepEqual(runtime.worldToScreen(4020,4020,999),{x:160,y:120});assert.deepEqual(runtime.screenToWorld(160,120),{x:4020,y:4020});
  const actor=ui.calls.find(call=>call.method==='drawImage'&&call.src.includes('actor'));
  assert.deepEqual(actor.args,[0,0,16,16,144,88,32,32]);
  assert.deepEqual(ui.calls.find(call=>call.method==='ellipse').args,[160,120,12,6,0,0,Math.PI*2]);
  assert.ok(ui.calls.some(call=>call.method==='strokeRect'&&call.args.join(',')==='148,108,24,24'));
  assert.equal(runtime.stats.visibleTiles,63);assert.equal(ui.requests.includes('qa/perspective-soil.png'),false);
  assert.equal(Object.hasOwn(runtime.stats,'viewCamera'),false);assert.equal(Object.hasOwn(runtime.captureSceneState(),'viewCamera'),false);
});

test('authored camera projects bounded soil tiles with continuous world1024 UV seams and isolated snapshots',async t=>{
  const config=project(),before=structuredClone(config);assert.equal(validateProject(config,{geometry:false}).ok,true);
  const {ui,runtime}=await runtimeFor(t,config);runtime.setCamera(4100,4100);ui.clear();runtime.renderOnce();
  const soil=ui.calls.filter(call=>call.method==='drawImage'&&call.src.includes('soil'));
  assert.ok(soil.length>0);assert.ok(runtime.stats.groundTileCandidates<4000,'frustum must not query all40000 tiles');
  assert.equal(runtime.stats.groundTextureDraws,soil.length);assert.ok(soil.every(call=>call.args.join(',')==='0,0,1024,1024'));
  const transforms=ui.calls.filter(call=>call.method==='transform');assert.ok(transforms.every(call=>call.args.every(Number.isFinite)));
  assert.ok(transforms.some(call=>Math.abs(call.args[0])>.5),'soil original world texels must not shrink an entire1024 image into40px');
  assert.equal(transforms.length,soil.length);
  const seamUV=[];
  for(let index=0;index<ui.calls.length;index++)if(ui.calls[index].method==='transform') {
    const [a,b,c,d,e,f]=ui.calls[index].args,det=a*d-b*c,triangle=ui.calls.slice(index-6,index).filter(call=>call.method==='moveTo'||call.method==='lineTo');
    assert.equal(triangle.length,3);
    for(const call of triangle){const [sx,sy]=call.args,world=runtime.screenToWorld(sx,sy),u=((sx-e)*d-(sy-f)*c)/det;
      if(Math.abs(world.x-4096)<1e-6)seamUV.push(u);
    }
  }
  assert.ok(seamUV.some(u=>Math.abs(u)<1e-6)&&seamUV.some(u=>Math.abs(u-1024)<1e-6),'the same4096world seam must meet source right1024 and left0 edges');
  assert.deepEqual(config,before);assert.equal(ui.requests.filter(src=>src.includes('soil')).length,1);
  const captured=runtime.captureSceneState();assert.deepEqual(captured.viewCamera,WORLD_CAMERA_DEFAULTS);assert.deepEqual(captured.project.unknownGameplay,{locked:true});
  captured.viewCamera.distance=2000;const stats=runtime.stats;stats.viewCamera.zoom=2;assert.equal(runtime.stats.viewCamera.zoom,1);
});

test('shared distance scales native billboard and contact shadow without changing frame or actor position',async t=>{
  const {ui,runtime}=await runtimeFor(t);runtime.player.y=4120;const before={x:runtime.player.x,y:runtime.player.y};ui.clear();runtime.renderOnce();
  const point=runtime.worldToScreen(before.x,before.y),actor=ui.calls.find(call=>call.method==='drawImage'&&call.src.includes('actor'));
  assert.ok(point.scale>1);near(actor.args[6],32*point.scale);near(actor.args[7],32*point.scale);near(actor.args[4],point.x-16*point.scale);near(actor.args[5],point.y-32*point.scale);
  assert.deepEqual(actor.args.slice(0,4),[0,0,16,16]);assert.deepEqual({x:runtime.player.x,y:runtime.player.y},before);
  const shadowPath=ui.calls.find(call=>call.method==='moveTo'&&call.color==='#00000066');const shadowPoint=runtime.worldToScreen(before.x+12,before.y,0);
  near(shadowPath.args[0],shadowPoint.x);near(shadowPath.args[1],shadowPoint.y);assert.equal(ui.calls.some(call=>call.method==='ellipse'),false);
  const recovered=runtime.screenToWorld(point.x,point.y);near(recovered.x,before.x);near(recovered.y,before.y);
});

test('world objects use camera depth at rotated yaw while explicit BACK/FRONT layers stay intact',async t=>{
  const config=project({...WORLD_CAMERA_DEFAULTS,yaw:Math.PI/2});config.map.objects=[object('near',102,100),object('far',98,100),object('back',102,100,'back'),object('front',98,100,'front')];
  const {ui,runtime}=await runtimeFor(t,config);runtime.renderOnce();
  assert.deepEqual(ui.calls.filter(call=>call.method==='drawImage'&&!call.src.includes('soil')).map(call=>call.src),['qa/back.png','qa/far.png','qa/perspective-actor.png','qa/near.png','qa/front.png']);
  const far=runtime.worldToScreen(3940,4020),nearer=runtime.worldToScreen(4100,4020);assert.ok(nearer.depth>far.depth);assert.ok(nearer.scale>far.scale);
});

test('pointer ground inverse agrees with draw and rejects horizon clicks instead of casting at a fabricated target',async t=>{
  const {ui,runtime}=await runtimeFor(t);runtime.start();const point=runtime.worldToScreen(4180,4120);
  ui.canvas.fire('pointermove',{clientX:point.x,clientY:point.y});near(runtime._pointerTarget.x,4180);near(runtime._pointerTarget.y,4120);
  ui.canvas.fire('pointerdown',{clientX:point.x,clientY:point.y,button:0});assert.equal(runtime.stats.casts,1);
  for(let i=0;i<61;i++)runtime.step(FIXED_STEP);assert.equal(runtime.skills.getState('skill').cooldown,0);
  const casts=runtime.stats.casts;assert.equal(runtime.screenToWorld(320,-100000),null);
  ui.canvas.fire('pointerdown',{clientX:320,clientY:-100000,button:0});ui.canvas.fire('keydown',{code:'Space'});assert.equal(runtime._pointerTarget,null);assert.equal(runtime.stats.casts,casts);
  runtime.pause();assert.equal(ui.frames.size,0);
});

test('ground markers, scene exits and effects share projection while owner60Hz gameplay state remains unchanged',async t=>{
  const {ui,runtime}=await runtimeFor(t);runtime._sceneExits=[{id:'qa-exit',position:[4100,4100,0],radius:20,open:true}];
  runtime.triggerVfx('effect',{x:4020,y:4220});ui.clear();runtime.renderOnce();
  const effectPoint=runtime.worldToScreen(4020,4220),arc=ui.calls.find(call=>call.method==='arc'&&call.color==='#abcdef');
  near(arc.args[0],effectPoint.x);near(arc.args[1],effectPoint.y);near(arc.args[2],8*effectPoint.scale);
  const exit=ui.calls.find(call=>call.method==='fillText'&&call.args[0]==='출구'),exitPoint=runtime.worldToScreen(4100,4100,0);near(exit.args[1],exitPoint.x);assert.equal(exit.font,`${11*exitPoint.scale}px sans-serif`);
  assert.ok(ui.calls.some(call=>call.method==='fillText'&&call.args[0]==='START'));
  const before=structuredClone(runtime.project),startX=runtime.player.x;runtime._keys.add('KeyD');runtime.step(FIXED_STEP);near(runtime.player.x-startX,156/60);assert.equal(runtime.stats.updateSteps,1);assert.deepEqual(runtime.project,before);
});

test('near-hidden actors never draw fallback geometry and extreme valid lenses keep tile queries finite',async t=>{
  const {ui,runtime}=await runtimeFor(t);runtime.player.y=7400;ui.clear();runtime.renderOnce();
  assert.equal(runtime.worldToScreen(runtime.player.x,runtime.player.y).visible,false);assert.equal(ui.calls.some(call=>call.method==='drawImage'&&call.src.includes('actor')),false);assert.equal(ui.calls.some(call=>call.color==='#00000066'&&call.method==='fill'),false);
  const config=project({...WORLD_CAMERA_DEFAULTS,pitch:.35,zoom:.25,distance:600,near:128});delete config.map.groundSrc;await runtime.setProject(config);ui.clear();runtime.renderOnce();
  assert.ok(Number.isFinite(runtime.stats.groundTileCandidates));assert.ok(runtime.stats.groundTileCandidates<=40000);
  assert.ok(ui.calls.every(call=>call.args.filter(value=>typeof value==='number').every(Number.isFinite)));
  const legacy=project(null);await runtime.setProject(legacy);assert.equal(runtime._getWorldProjection(),null);assert.deepEqual(runtime.worldToScreen(4020,4020),{x:320,y:240});
});

test('FDGRuntime supplies its live shared camera to rig vertices and saves lens separately from authored model rotation',async t=>{
  const config=project();config.rigScene=createRigScene(createDefaultRigProject(),{position:[4020,4060,20]});
  Object.assign(config.rigScene.camera,{x:4020,y:4020,follow:false,yaw:0,pitch:0});config.rigScene.nodes[0].clipId=null;
  const {runtime}=await runtimeFor(t,config),id=config.rigScene.nodes[0].id,first=runtime.getRigNodeSnapshot(id);
  assert.equal(first.projection,'shared-world-camera');const point=runtime.worldToScreen(...first.worldVertices[0]);near(first.screenVertices[0].x,point.x);near(first.screenVertices[0].y,point.y);near(first.depth,runtime.worldToScreen(4020,4060,20).depth);
  runtime.setCamera(4100,3960);const moved=runtime.getRigNodeSnapshot(id),movedPoint=runtime.worldToScreen(...moved.worldVertices[0]);near(moved.screenVertices[0].x,movedPoint.x);near(moved.screenVertices[0].y,movedPoint.y);assert.deepEqual(moved.vertices,first.vertices);assert.notDeepEqual(moved.screenVertices,first.screenVertices);
  runtime.setRigView(.3,.2);const rotated=runtime.getRigNodeSnapshot(id);assert.deepEqual(rotated.vertices,first.vertices);assert.notDeepEqual(rotated.worldVertices,first.worldVertices);
  const saved=runtime.captureSceneState();assert.deepEqual(saved.project.viewCamera,WORLD_CAMERA_DEFAULTS);assert.equal(saved.project.rigScene.camera.yaw,.3);assert.equal(saved.project.rigScene.camera.pitch,.2);assert.equal(saved.project.rigScene.camera.x,4100);assert.equal(saved.project.rigScene.nodes[0].time,0);
  await runtime.setProject(JSON.parse(JSON.stringify(saved.project)));const reopened=runtime.getRigNodeSnapshot(id);assert.deepEqual(reopened.worldVertices,rotated.worldVertices);assert.deepEqual(reopened.screenVertices,rotated.screenVertices);
});

test('near-hidden rig foot uses actual clipped visible depth before world painter sorting and keeps derived state out of saved JSON',async t=>{
  const config=project({...WORLD_CAMERA_DEFAULTS,yaw:0,pitch:.35,zoom:.25,distance:600,near:128});delete config.map.groundSrc;
  config.map.objects=[object('far-occluder',100,112)];
  config.rigScene=createRigScene(createDefaultRigProject(),{position:[4020,4524,0]});
  Object.assign(config.rigScene.camera,{x:4020,y:4020,follow:false,yaw:0,pitch:0});config.rigScene.nodes[0].clipId=null;
  const before=structuredClone(config),{ui,runtime}=await runtimeFor(t,config,1090,750),id=config.rigScene.nodes[0].id;
  const snapshot=runtime.getRigNodeSnapshot(id),farDepth=runtime.worldToScreen(4020,4500,0).depth;
  assert.equal(snapshot.anchorVisible,false);assert.equal(snapshot.depthSource,'clipped-visible-geometry');
  assert.ok(snapshot.screenVertices.some(point=>point.visible&&point.x>0&&point.x<1090&&point.y>0&&point.y<750));
  assert.ok(snapshot.depth>farDepth,'remaining near-plane geometry must not use invisible foot depth0');
  ui.clear();runtime.renderOnce();
  const objectDraw=ui.calls.findIndex(call=>call.method==='drawImage'&&call.src==='qa/far-occluder.png');
  const rigDraw=ui.calls.findIndex(call=>call.method==='fill'&&call.color?.startsWith('rgb('));
  assert.ok(objectDraw>=0&&rigDraw>objectDraw,'farther world billboard must draw before remaining visible rig faces');
  const captured=runtime.captureSceneState(),saved=captured.project.rigScene.nodes[0];
  assert.equal(Object.hasOwn(saved,'anchorVisible'),false);assert.equal(Object.hasOwn(saved,'depthSource'),false);assert.equal(Object.hasOwn(saved,'depth'),false);
  assert.deepEqual(config,before);
  runtime.setCamera(4020,4524);const visible=runtime.getRigNodeSnapshot(id);
  assert.equal(visible.anchorVisible,true);assert.equal(visible.depthSource,'anchor');near(visible.depth,runtime.worldToScreen(4020,4524,0).depth);
  runtime.setCamera(0,4020);const outside=runtime.getRigNodeSnapshot(id);
  assert.equal(outside.anchorVisible,false);assert.equal(outside.depthSource,'hidden');assert.equal(outside.depth,0);
  ui.clear();runtime.renderOnce();assert.equal(ui.calls.some(call=>call.method==='fill'&&call.color?.startsWith('rgb(')),false);
});
