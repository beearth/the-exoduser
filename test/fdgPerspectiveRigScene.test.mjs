import test from 'node:test';
import assert from 'node:assert/strict';
import { RigSceneRuntime } from '../engine/fdg/rig-scene-runtime.js';
import { createDefaultRigProject } from '../engine/fdg/rig-project.js';
import { evaluateRig } from '../engine/fdg/rig.js';
import { createWorldProjection, WORLD_CAMERA_DEFAULTS } from '../engine/fdg/world-camera.js';

const near=(actual,expected,epsilon=1e-7)=>assert.ok(Math.abs(actual-expected)<=epsilon,`${actual} != ${expected}`);
function scene(rig=createDefaultRigProject()) {
  return {version:1,resources:[{id:'model',name:'검사 리그',project:rig}],nodes:[{id:'node',name:'검사 노드',resourceId:'model',position:[4020,4020,10],scale:48,visible:true,materialId:'iron',clipId:null,time:0}],
    camera:{x:4020,y:4020,follow:false,yaw:.2,pitch:.1}};
}
function context() {
  const calls=[],stack=[],ctx={globalAlpha:.75};
  for(const method of ['beginPath','moveTo','lineTo','closePath','fill','stroke','clip','transform'])ctx[method]=(...args)=>calls.push({method,args,color:ctx.fillStyle,alpha:ctx.globalAlpha});
  ctx.save=()=>stack.push({globalAlpha:ctx.globalAlpha});ctx.restore=()=>Object.assign(ctx,stack.pop());
  ctx.drawImage=(image,...args)=>calls.push({method:'drawImage',src:image.src,args,alpha:ctx.globalAlpha});
  return {ctx,calls};
}
const projection=()=>createWorldProjection(WORLD_CAMERA_DEFAULTS,{x:4020,y:4020},{width:640,height:480});

test('missing shared camera preserves exact legacy model projection, face order and capture format',()=>{
  const config=scene();config.camera.yaw=0;config.camera.pitch=0;
  const runtime=new RigSceneRuntime(config,{worldToScreen:()=>({x:200,y:150})});
  const snapshot=runtime.getNodeSnapshot('node');assert.deepEqual(snapshot.anchor,{x:200,y:150});assert.equal(snapshot.depth,4020);
  assert.deepEqual(snapshot.screenVertices[0],{x:176,y:140,z:-19.200000000000003});
  assert.equal(Object.hasOwn(snapshot,'worldVertices'),false);assert.equal(Object.hasOwn(snapshot,'projection'),false);
  assert.deepEqual(runtime.capture({x:10,y:20}).camera,{...config.camera,x:10,y:20});
  const {ctx,calls}=context();assert.equal(runtime.drawNode(ctx,'node'),56);assert.equal(calls.filter(call=>call.method==='fill').length,28);runtime.dispose();
});

test('actual rig Y-up/Z-front rotates into world XYZ and uses the same owner perspective without altering LBS input',()=>{
  const config=scene(),before=structuredClone(config),camera=projection(),runtime=new RigSceneRuntime(config,{getProjection:()=>camera});
  const snapshot=runtime.getNodeSnapshot('node'),[x,y,z]=snapshot.vertices[12],cy=Math.cos(.2),sy=Math.sin(.2),cp=Math.cos(.1),sp=Math.sin(.1);
  const rx=cy*x+sy*z,rz=-sy*x+cy*z,expected=[4020+rx*48,4020+(sp*y+cp*rz)*48,10+(cp*y-sp*rz)*48];
  expected.forEach((value,index)=>near(snapshot.worldVertices[12][index],value));const screen=camera.project(...expected);
  near(snapshot.screenVertices[12].x,screen.x);near(snapshot.screenVertices[12].y,screen.y);near(snapshot.screenVertices[12].z,screen.depth);
  assert.deepEqual(snapshot.vertices,evaluateRig(config.resources[0].project,{clipId:null,time:0,materialId:'iron'}).vertices);assert.deepEqual(config,before);
  near(snapshot.depth,camera.project(4020,4020,10).depth);assert.equal(snapshot.projection,'shared-world-camera');
  snapshot.worldVertices[0][0]=0;assert.notEqual(runtime.getNodeSnapshot('node').worldVertices[0][0],0);
  runtime.dispose();assert.equal(runtime._getProjection,null);
});

test('near-crossing textured triangle clips interpolated UV into two real source draws instead of dropping or fabricating a face',()=>{
  const rig=createDefaultRigProject();rig.mesh.vertices=[[-1,0,0],[1,0,0],[0,1,4]];rig.mesh.triangles=[[0,1,2]];rig.mesh.weights=rig.mesh.vertices.map(()=>[{boneId:'root',weight:1}]);rig.mesh.uvs=[[0,0],[1,0],[.5,1]];
  rig.materials[0].texture={src:'qa/rig-near.png',width:16,height:16};
  const config=scene(rig);config.nodes[0].position=[4020,6000,0];config.camera.yaw=0;config.camera.pitch=0;
  const before=structuredClone(config),camera=projection(),image={src:'qa/rig-near.png',naturalWidth:16,naturalHeight:16};
  const runtime=new RigSceneRuntime(config,{getProjection:()=>camera,getImage:()=>image}),snapshot=runtime.getNodeSnapshot('node');
  assert.equal(snapshot.screenVertices.filter(point=>point.visible).length,2);
  const clipped=camera.clipPolygon(snapshot.cameraVertices);assert.equal(clipped.length,4);assert.ok(clipped.every(point=>point.v<1));assert.ok(clipped.some(point=>point.v>0&&point.v<1));
  const {ctx,calls}=context();assert.equal(runtime.drawNode(ctx,'node'),2);assert.equal(runtime.getNodeSnapshot('node').textureDraws,2);
  assert.equal(calls.filter(call=>call.method==='drawImage').length,2);assert.ok(calls.filter(call=>call.method==='transform').every(call=>call.args.every(Number.isFinite)));
  assert.ok(calls.filter(call=>call.method==='drawImage').every(call=>call.alpha===.75&&call.args.join(',')==='0,0,16,16'));
  assert.deepEqual(config,before);runtime.dispose();
});

test('authored face layers survive camera depth sort; wholly near-hidden geometry produces no substitute',()=>{
  const rig=createDefaultRigProject();rig.mesh.vertices=[[-1,0,0],[1,0,0],[0,1,0],[-1,0,1],[1,0,1],[0,1,1]];rig.mesh.triangles=[[0,1,2],[3,4,5]];rig.mesh.weights=rig.mesh.vertices.map(()=>[{boneId:'root',weight:1}]);rig.mesh.faceColors=['#aa0000','#00aa00'];rig.mesh.drawOrder=[5,-5];
  const config=scene(rig),runtime=new RigSceneRuntime(config,{getProjection:projection}),{ctx,calls}=context();runtime.evaluate();
  assert.equal(runtime.drawNode(ctx,'node'),2);assert.deepEqual(calls.filter(call=>call.method==='fill').map(call=>call.color),['#00aa00','#aa0000']);
  runtime._nodes.get('node').position[1]=7500;runtime.evaluate();calls.length=0;assert.equal(runtime.drawNode(ctx,'node'),0);assert.equal(calls.length,0);runtime.dispose();
});

test('projection changes do not advance clips, modify saved pose or acquire another clock; invalid callbacks reject clearly',()=>{
  const config=scene();config.nodes[0].clipId='sway';let camera=projection();const runtime=new RigSceneRuntime(config,{getProjection:()=>camera});
  runtime.update(1/60);const before=runtime.getNodeSnapshot('node');camera=createWorldProjection({...WORLD_CAMERA_DEFAULTS,yaw:.8,zoom:.7},{x:4020,y:4020},{width:640,height:480});
  const after=runtime.getNodeSnapshot('node');assert.equal(after.time,before.time);assert.deepEqual(after.vertices,before.vertices);assert.deepEqual(after.bonePositions,before.bonePositions);assert.notDeepEqual(after.screenVertices,before.screenVertices);
  assert.deepEqual(runtime.capture().resources,config.resources);assert.equal(runtime.snapshot().ownedRaf,0);assert.equal(runtime.snapshot().ownedListeners,0);runtime.dispose();
  assert.throws(()=>new RigSceneRuntime(config,{getProjection:42}),/getProjection/);
  const invalid=new RigSceneRuntime(config,{getProjection:()=>({})});assert.throws(()=>invalid.evaluate(),/Shared projection/);invalid.dispose();
});
