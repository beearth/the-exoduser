import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
import { attachSourcePreviewCollision, canMoveSourcePreview, validateSourcePreview } from '../engine/fdg/source-preview.js';
import { attachMapSourcePreviewCollision, normalizeMapSourceHandColliders, MAP_HAND_COLLIDER_BINDING } from '../engine/fdg/map-source-adapter.js';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { FDGRuntime } from '../engine/fdg/runtime.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';

// New synthetic UNIT cases only. No completed suite, native JSON, PNG or HTTP read.
const copy = value => structuredClone(value);
const options = () => ({ sourceExecutionData: { completionId:'UNIT-new-subset',control:'UNIT-new-consumption',unknown:{keep:true},
  executionData:{objectColliderCount:3,objectColliders:[
    {id:'UNIT-circle',kind:'circle',center:[4020,7300],radius:30},
    {id:'UNIT-rotated-ellipse',kind:'ellipse',center:[4100,7100],radii:[40,8],yaw:Math.PI/2},
    {id:'UNIT-expanded-part',kind:'box',center:[4300,7200],size:[80,8],yaw:Math.PI/4},
  ]}},scope:{kind:'hand-authored-stage0-subset',coverage:'PARTIAL',source:'UNIT explicit world geometry',
    authoredBy:'UNIT scope author',unresolved:['UNIT full native assembly is unknown']}});
function baseScene(position=[3970,7300]) {
  const scene=copy(makeSourceHeightFixture().scene);scene.actor.position=position;
  scene.camera={x:position[0],y:position[1],follow:true};return scene;
}
function sceneAt(position) {
  const result=attachSourcePreviewCollision(baseScene(position),options());
  assert.equal(result.ok,true,result.errors.join('\n'));return result.sourcePreview;
}
function projectWith(scene) {
  const project=createDefaultProject();project.sourcePreview=scene;project.map.tiles=[...scene.nav.tiles];
  project.map.start={x:100,y:185};return project;
}
class Context {
  globalAlpha=1;filter='none';stack=[];
  save(){this.stack.push([this.globalAlpha,this.filter]);}restore(){[this.globalAlpha,this.filter]=this.stack.pop();}
  beginPath(){}rect(){}moveTo(){}lineTo(){}closePath(){}clip(){}drawImage(){}transform(){}translate(){}
  setTransform(){}fillRect(){}fillText(){}fill(){}stroke(){}arc(){}strokeRect(){}ellipse(){}
}
function canvas() { const context=new Context();return {width:1000,height:600,clientWidth:1000,clientHeight:600,getContext:()=>context,
  getBoundingClientRect:()=>({left:0,top:0,width:1000,height:600}),addEventListener(){},removeEventListener(){},setAttribute(){},removeAttribute(){},
  ownerDocument:{createElement:()=>canvas(),defaultView:{devicePixelRatio:1,addEventListener(){},removeEventListener(){}}}}; }
function seed(instance,project) {
  for(const layer of project.sourcePreview.imageLayers) instance.assets.set(layer.src,{status:'ready',image:{naturalWidth:layer.sourceRect[2],naturalHeight:layer.sourceRect[3]}});
  const ground=project.sourcePreview.groundLayers[0];instance.assets.set(ground.src,{status:'ready',image:{naturalWidth:1024,naturalHeight:1024}});
  for(const resource of [...project.characters,...project.vfx]) for(const src of new Set([resource.sprite?.src,...Object.values(resource.sprite?.directions||{})].filter(Boolean)))
    instance.assets.set(src,{status:'ready',image:{naturalWidth:4096,naturalHeight:4096}});
}

test('new swept foot gate blocks source circle, rotated ellipse and expanded part, without tunnelling or changing rejected XY/Z',()=>{
  const scene=sceneAt(), consumer=new SourcePreviewRuntime(scene,undefined,{canvasFactory:()=>canvas()});
  const player={x:3970,y:7300,z:0,radius:12},before=copy(player);
  assert.equal(consumer.move(player,3980,7300),false);assert.equal(consumer.blockedReason,'collider:UNIT-circle');assert.deepEqual(player,before);
  assert.equal(consumer.move(player,3970,7290),true);assert.deepEqual([player.x,player.y,player.z],[3970,7290,0]);
  assert.equal(canMoveSourcePreview(scene,{x:3950,y:7300},{x:4090,y:7300},12).colliderId,'UNIT-circle');
  assert.equal(canMoveSourcePreview(scene,{x:4100,y:7040},{x:4100,y:7050},12).colliderId,'UNIT-rotated-ellipse');
  assert.equal(canMoveSourcePreview(scene,{x:4060,y:7100},{x:4060,y:7130},12).ok,true);
  assert.equal(canMoveSourcePreview(scene,{x:4260,y:7160},{x:4270,y:7170},12).colliderId,'UNIT-expanded-part');
  assert.equal(canMoveSourcePreview(scene,{x:4240,y:7240},{x:4250,y:7250},12).ok,true);
  consumer.dispose();
});

test('adapter attaches an explicit partial subset and preserves prior scene authoring while missing or corrupt source has no candidate',()=>{
  const base=baseScene(),project=projectWith(base),before=copy(project),input=options();
  project.unitUnknown={retain:true};const attached=attachMapSourcePreviewCollision(project,input);
  assert.equal(attached.ok,true,attached.errors.join('\n'));assert.equal(attached.adoption,'UNADOPTED');
  assert.equal(attached.project,null);assert.equal(attached.world,null);assert.deepEqual(attached.candidateProject.unitUnknown,{retain:true});
  const scene=attached.sourcePreview;
  for(const key of ['nav','imageLayers','groundLayers','groundClip','heightPreview','actor','camera'])assert.deepEqual(scene[key],before.sourcePreview[key]);
  assert.deepEqual(scene.collisionPreview.sourceExecutionSnapshot,input.sourceExecutionData);
  assert.deepEqual(scene.provenance.collisionEngineAuthoredInputSnapshot,{scope:input.scope});
  assert.equal(scene.status.collision,'SOURCE_SUBSET_CONSUMED');assert.equal(scene.provenance.supportedSourceObjectColliderCount,3);
  assert.equal(scene.provenance.actualObjectColliderCount,null);assert.equal(scene.provenance.productionAdopted,false);
  assert.equal(scene.collisionPreview.sourcePhysicalZClaim,false);assert.equal(validateSourcePreview(JSON.parse(JSON.stringify(scene))).ok,true);
  const missing=options();delete missing.sourceExecutionData.executionData.objectColliderCount;
  const waiting=attachMapSourcePreviewCollision(project,missing);assert.equal(waiting.candidateProject,null);
  assert.ok(waiting.pending.some(row=>row.classification==='SOURCE_INPUT'));
  const stale=copy(scene);stale.collisionPreview.colliders[0].radius=31;assert.equal(validateSourcePreview(stale).ok,false);
  const inside=copy(scene);inside.actor.position=[4020,7300];assert.equal(validateSourcePreview(inside).ok,false);
  const native={completionId:'UNIT raw producer',control:'UNIT radii',unknown:{retain:true},
    transform:{rotation:'handProps 회전 입력 없음(0)',worldFormula:'x=(_nearFloor(H.x,H.y).x+.5)*T, y=(..y+.5)*T; T=40; +.5=YES(center)'},
    executionData:{objectColliderCount:2,units:'rawTile=tile index; effectiveWorld=px; colW/colH/colSz=px(scale 적용); colOy=px offset',objectColliders:[
      {type:'UNIT-source-circle',rawTile:[100,100],scale:2,onFloor:true,effectiveWorldIfOnFloor:[4020,4020],shape:'circle',colSz:24},
      {type:'UNIT-source-ellipse',rawTile:[110,110],scale:3,onFloor:true,effectiveWorldIfOnFloor:[4420,4420],shape:'ellipse',colW:60,colH:30,colOy:-7},
    ]}};
  const normalized=normalizeMapSourceHandColliders(native);assert.equal(normalized.ok,true,normalized.errors.join('\n'));
  assert.deepEqual(normalized.sourceExecutionData.nativeExecutionSnapshot,native);
  assert.deepEqual(normalized.sourceExecutionData.normalizationBinding,MAP_HAND_COLLIDER_BINDING);
  const [circle,ellipse]=normalized.sourceExecutionData.executionData.objectColliders;
  assert.equal(circle.radius,24);assert.deepEqual(ellipse.radii,[60,30]);assert.deepEqual(ellipse.center,[4420,4413]);assert.equal(ellipse.yaw,0);
  assert.equal(attachMapSourcePreviewCollision(project,{sourceExecutionData:normalized.sourceExecutionData,scope:input.scope}).ok,true);
  const offFloor=copy(native);offFloor.executionData.objectColliders[0].onFloor=false;
  assert.equal(normalizeMapSourceHandColliders(offFloor).sourceExecutionData,null);
  assert.ok(normalizeMapSourceHandColliders(offFloor).pending.some(row=>row.classification==='SOURCE_INPUT'));
  const rawParts=copy(native);rawParts.executionData.objectColliders[0].shape='colParts';
  assert.ok(normalizeMapSourceHandColliders(rawParts).pending.some(row=>row.classification==='ENGINE_IMPLEMENTATION'));
});

test('owner public 10px movement consumes object collision and captures/reopens the partial scope and camera',async()=>{
  const project=projectWith(sceneAt()),instance=new FDGRuntime(canvas(),project);seed(instance,project);await instance.load();
  assert.equal(instance.sourcePreviewReady,true);const before=instance.captureSceneState();
  assert.equal(instance.moveSourcePreview(10,0),false);assert.equal(instance.getSourcePreviewSnapshot().blockedReason,'collider:UNIT-circle');
  assert.deepEqual(instance.captureSceneState().actorPosition,before.actorPosition);assert.deepEqual(instance.camera,before.camera);
  assert.equal(instance.moveSourcePreview(0,-10),true);const saved=instance.captureSceneState();
  assert.deepEqual(saved.actorPosition,[3970,7290]);assert.deepEqual(saved.camera,{x:3970,y:7290,follow:true});
  assert.equal(saved.height,null);assert.equal(saved.actorPosition.length,2);
  const reopenedProject=JSON.parse(JSON.stringify(saved.project)),reopened=new FDGRuntime(canvas(),reopenedProject);
  seed(reopened,reopenedProject);await reopened.load();
  const snapshot=reopened.getSourcePreviewSnapshot();assert.equal(snapshot.collisionCoverage,'PARTIAL');
  assert.equal(snapshot.supportedSourceObjectColliderCount,3);assert.equal(snapshot.fullObjectColliderCount,null);
  assert.deepEqual(snapshot.sourcePending,['collision-assembly']);assert.deepEqual(snapshot.collisionScope,options().scope);
  assert.deepEqual(snapshot.position,[3970,7290]);assert.deepEqual(snapshot.camera,saved.camera);
  assert.equal(reopened.moveSourcePreview(10,0),false);instance.dispose();reopened.dispose();
});

test('scene replacement retires the old collision consumer, and disposal releases the new subset with no owned input loop',async()=>{
  const project=projectWith(sceneAt()),instance=new FDGRuntime(canvas(),project);seed(instance,project);await instance.load();
  const previous=instance._sourcePreview;
  const replacement=projectWith(baseScene());seed(instance,replacement);await instance.setProject(replacement);
  assert.equal(previous.disposed,true);assert.equal(previous.scene,null);assert.equal(previous.move({x:3970,y:7300,radius:12},3980,7300),false);
  assert.equal(instance.getSourcePreviewSnapshot().collisionCoverage,undefined);assert.equal(instance.moveSourcePreview(10,0),true);
  const next=projectWith(sceneAt());seed(instance,next);await instance.setProject(next);
  const current=instance._sourcePreview;assert.equal(instance.moveSourcePreview(10,0),false);
  const snapshot=current.snapshot(instance.player,instance.camera);
  assert.deepEqual([snapshot.ownedRaf,snapshot.ownedListeners,snapshot.ownedTimers,snapshot.ownedImages,snapshot.ownedGpu],[0,0,0,0,0]);
  instance.dispose();assert.equal(current.scene,null);assert.equal(current.disposed,true);assert.equal(current.capture({x:3970,y:7300}),null);
  assert.equal(instance.getSourcePreviewSnapshot(),null);assert.equal(instance.moveSourcePreview(0,-10),false);
});
