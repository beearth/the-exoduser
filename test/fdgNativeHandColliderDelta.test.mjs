import test from 'node:test';
import assert from 'node:assert/strict';
import { makeSourceHeightFixture } from './fdg-source-height-fixture.mjs';
import { attachSourcePreviewCollision, canMoveSourcePreview } from '../engine/fdg/source-preview.js';
import { validateProject } from '../engine/fdg/project.js';
import { applyMapSourceHandColliderDelta, MAP_HAND_COLLIDER_BINDING } from '../engine/fdg/map-source-adapter.js';

// Synthetic contract inputs only. Data factory imports no completed suite, native input file or PNG.
const copy = value => JSON.parse(JSON.stringify(value));
const scope = () => ({ kind:'hand-authored-stage0-subset',coverage:'PARTIAL',source:'UNIT explicit v6 plus v7',
  authoredBy:'UNIT engine partial scope',unresolved:['UNIT full assembly UNKNOWN'],unknownScope:{keep:true} });
function makeProject() {
  const { scene } = makeSourceHeightFixture();
  const colliders=Array.from({length:13},(_,index)=>({id:`UNIT-base-${index}`,nativeType:`UNIT-type-${index}`,
    kind:index<11?'circle':'ellipse',center:[500+index*200,2000],
    ...(index<11?{radius:20+index}:{radii:[30,20],yaw:0}),unknownCollider:{index}}));
  const sourceExecutionData={completionId:'UNIT-v6-producer',control:'UNIT-v6-control',kind:'engine-normalized-native-hand-colliders',
    nativeExecutionSnapshot:{completionId:'UNIT-v6-producer',control:'UNIT-v6-control',executionData:{objectColliderCount:13},
      unknownNative:{keep:['raw','v6']}},normalizationBinding:{...MAP_HAND_COLLIDER_BINDING},
    executionData:{objectColliderCount:13,objectColliders:colliders},unknownEnvelope:{keep:true}};
  const attached=attachSourcePreviewCollision(scene,{sourceExecutionData,scope:scope()});
  assert.equal(attached.ok,true,attached.errors.join('\n'));
  const sprite={src:'assets/UNIT-character.png',frameWidth:96,frameHeight:96,columns:24,rows:1,frames:24,fps:24,
    scale:1,anchorX:.5,anchorY:.85};
  return {schemaVersion:1,id:'UNIT-v7-delta',name:'UNIT v7 delta candidate',
    map:{width:200,height:200,tileSize:40,tiles:[...attached.sourcePreview.nav.tiles],start:{x:100,y:185},exit:{x:100,y:7},objects:[]},
    characters:[{id:'character',name:'UNIT character',speed:180,radius:12,sprite,
      animations:{idle:{row:0,start:0,frames:24,fps:24,loop:true},walk:{row:0,start:0,frames:24,fps:24,loop:true}}}],
    skills:[{id:'skill',name:'UNIT skill',cooldown:1,cost:1,range:1,damage:1,vfx:'vfx'}],
    vfx:[{id:'vfx',name:'UNIT vfx',kind:'burst',color:'#ffffff',count:1,life:1,speed:1,size:1,spread:0}],
    preview:{characterId:'character',skillId:'skill',vfxId:'vfx',resourceMax:100,resourceRegen:1},
    sourcePreview:attached.sourcePreview,unknownProject:{keep:true}};
}
function makeDelta() {
  return {completionId:'UNIT-v6-producer',control:'UNIT-v7-resolution',kind:'UNIT two-type native meta delta',
    baseRef:{v6:'/UNIT/not-fetched-v6.json'},partialStatus:'UNIT PARTIAL source only',unknownDelta:{keep:true},
    resolution:{corpse:{finalMeta:{sz:40},source:'UNIT source corpse',col:0,collision:false,noCol:false,
      physics:'EXCLUDED',placements:2,placementTiles:[[124,179],[78,37]],unknownCorpse:'keep'},
    pit_poison:{finalMeta:{sz:200,collision:true,colW:80,colH:58,colOy:7},source:'UNIT source pit',col:0,collision:true,noCol:false,
      colParts:false,colW:80,colH:58,colOy:7,colSz:null,physics:'INCLUDED',shape:'ellipse',
      colliderDim:{colW:80,colH:58,colOy:7,formula:'UNIT explicit radii80x58 and offset7',unit:'px radii; colOy px offset'},placements:1,
      rawTile:[162,139],onFloor:true,effectiveWorld:[6500,5580]}},
    oldNew:{addedCollider:{type:'pit_poison',shape:'ellipse',colW:80,colH:58,colOy:7,rawTile:[162,139],onFloor:true,effectiveWorld:[6500,5580]}},
    finalHandSubset:{objectColliderCount:14,breakdown:{circle:11,ellipse:3,rotatedParts:0},scope:'UNIT PARTIAL hand subset'}};
}

test('v7 appends only the explicit pit and preserves scene, base raw delta and authored scope through JSON reopen',()=>{
  const project=makeProject(),delta=makeDelta(),authoredScope=scope(),before=copy({project,delta,authoredScope});
  const out=applyMapSourceHandColliderDelta(project,{delta,scope:authoredScope});
  assert.equal(out.ok,true,out.errors.join('\n')); assert.equal(out.project,null); assert.equal(out.world,null);
  assert.equal(out.adoption,'UNADOPTED'); assert.deepEqual({project,delta,authoredScope},before);
  const next=out.candidateProject,oldScene=project.sourcePreview,newScene=next.sourcePreview;
  const oldCollision=oldScene.collisionPreview,newCollision=newScene.collisionPreview;
  assert.deepEqual(newCollision.colliders.slice(0,13),oldCollision.colliders);
  const added=newCollision.colliders[13];
  assert.deepEqual({id:added.id,kind:added.kind,center:added.center,radii:added.radii,yaw:added.yaw},
    {id:'native-hand-13-pit_poison',kind:'ellipse',center:[6500,5587],radii:[80,58],yaw:0});
  assert.equal(Object.hasOwn(added,'radius'),false);
  assert.equal(out.inspection.circleCount,11); assert.equal(out.inspection.ellipseCount,3);
  assert.deepEqual(out.inspection.addedCollider,{id:added.id,type:'pit_poison',center:[6500,5587],radii:[80,58],yaw:0,units:'world-px'});
  assert.equal(Object.hasOwn(added,'nativeScale'),false); assert.equal(newCollision.colliders.some(c=>c.nativeType==='corpse'),false);
  for(const key of ['map','characters','skills','vfx','preview','unknownProject'])assert.deepEqual(next[key],project[key]);
  for(const key of Object.keys(oldScene).filter(k=>!['collisionPreview','provenance'].includes(k)))assert.deepEqual(newScene[key],oldScene[key]);
  assert.deepEqual(newCollision.sourceExecutionSnapshot.nativeExecutionSnapshot,oldCollision.sourceExecutionSnapshot.nativeExecutionSnapshot);
  assert.deepEqual(newCollision.sourceExecutionSnapshot.baseSourceExecutionSnapshot,oldCollision.sourceExecutionSnapshot);
  assert.deepEqual(newCollision.sourceExecutionSnapshot.nativeDeltaSnapshot,delta);
  assert.deepEqual(newCollision.scope,authoredScope);
  assert.equal(newScene.provenance.actualObjectColliderCount,null); assert.equal(newScene.provenance.productionAdopted,false);
  assert.equal(newScene.provenance.supportedSourceObjectColliderCount,14);
  assert.equal(newCollision.fullObjectColliderCount,null); assert.equal(newCollision.sourcePhysicalZClaim,false);
  assert.equal(newCollision.engineDerived.coverage,'PARTIAL');
  const reopened=JSON.parse(JSON.stringify(next));
  assert.equal(validateProject(reopened).ok,true); assert.deepEqual(reopened.sourcePreview,newScene);
});

test('MAP-021 ellipse consumes full-foot sweeps at all four rims and opens the old northern circle strip',()=>{
  const out=applyMapSourceHandColliderDelta(makeProject(),{delta:makeDelta(),scope:scope()});
  assert.equal(out.ok,true,out.errors.join('\n')); const scene=out.sourcePreview;
  assert.equal(canMoveSourcePreview(scene,{x:6594,y:5580},{x:6594,y:5580},12,{validated:true}).ok,true);
  const blocked=canMoveSourcePreview(scene,{x:6594,y:5580},{x:6584,y:5580},12,{validated:true});
  assert.equal(blocked.ok,false); assert.equal(blocked.reason,'collider:native-hand-13-pit_poison');
  // Old circle blocked this strip; current ellipse starts at y=5529 (5580+7-58).
  assert.equal(canMoveSourcePreview(scene,{x:6500,y:5501},{x:6500,y:5514},12,{validated:true}).ok,true);
  for(const [from,to] of [
    [{x:6500,y:5514},{x:6500,y:5520}],
    [{x:6500,y:5660},{x:6500,y:5650}],
    [{x:6405,y:5587},{x:6415,y:5587}],
    [{x:6595,y:5587},{x:6585,y:5587}],
  ]) {
    const rim=canMoveSourcePreview(scene,from,to,12,{validated:true});
    assert.equal(rim.ok,false); assert.equal(rim.reason,'collider:native-hand-13-pit_poison');
  }
  for(const [x,y] of [[4980,7180],[3140,1500]])assert.equal(canMoveSourcePreview(scene,{x,y},{x,y},12,{validated:true}).ok,true);
});

test('inconsistent dimensions, centers, corpse flags, subset count and full coverage fail without changing inputs',()=>{
  const mutations=[d=>d.oldNew.addedCollider.colW=160,d=>d.oldNew.addedCollider.colH=80,d=>d.oldNew.addedCollider.colOy=0,
    d=>d.oldNew.addedCollider.shape='circle',d=>d.oldNew.addedCollider.effectiveWorld[1]=5587,
    d=>d.resolution.pit_poison.finalMeta.colH=80,d=>d.resolution.pit_poison.colOy=0,
    d=>d.resolution.pit_poison.colliderDim.colW=160,d=>d.resolution.pit_poison.colliderDim.colOy=0,
    d=>d.resolution.pit_poison.shape='circle',d=>d.resolution.pit_poison.colW=null,
    d=>d.resolution.corpse.collision=true,d=>d.finalHandSubset.objectColliderCount=15,
    d=>d.finalHandSubset.breakdown={circle:12,ellipse:2,rotatedParts:0}];
  for(const mutate of mutations){const project=makeProject(),delta=makeDelta();mutate(delta);const before=copy({project,delta});
    const out=applyMapSourceHandColliderDelta(project,{delta,scope:scope()});assert.equal(out.ok,false);assert.equal(out.candidateProject,null);
    assert.deepEqual({project,delta},before);}
  const full=scope();full.coverage='FULL';assert.equal(applyMapSourceHandColliderDelta(makeProject(),{delta:makeDelta(),scope:full}).ok,false);
  const occupied=makeProject();occupied.sourcePreview.actor.position=[6500,5580];occupied.sourcePreview.camera={x:6500,y:5580,follow:true};
  assert.equal(validateProject(occupied).ok,true);
  const rejected=applyMapSourceHandColliderDelta(occupied,{delta:makeDelta(),scope:scope()});
  assert.equal(rejected.ok,false);assert.equal(rejected.candidateProject,null);assert.deepEqual(occupied.sourcePreview.actor.position,[6500,5580]);
});

test('raw JSON bounds, producer mismatch, absent explicit scope and repeated delta fail closed',()=>{
  const project=makeProject(),delta=makeDelta();
  let getterCalls=0;
  const accessors={scope:scope()};Object.defineProperty(accessors,'delta',{enumerable:true,get(){getterCalls++;return delta;}});
  assert.equal(applyMapSourceHandColliderDelta(project,accessors).ok,false);assert.equal(getterCalls,0);
  assert.equal(applyMapSourceHandColliderDelta(project,{delta:'{"__proto__":{}}',scope:scope()}).ok,false);
  const unsafe=makeDelta();unsafe.unknownDelta.value=NaN;assert.equal(applyMapSourceHandColliderDelta(project,{delta:unsafe,scope:scope()}).ok,false);
  const mismatch=makeDelta();mismatch.completionId='UNIT other producer';assert.equal(applyMapSourceHandColliderDelta(project,{delta:mismatch,scope:scope()}).ok,false);
  assert.equal(applyMapSourceHandColliderDelta(project,{delta}).ok,false);
  const first=applyMapSourceHandColliderDelta(JSON.stringify(project),{delta:JSON.stringify(delta),scope:scope()});
  assert.equal(first.ok,true,first.errors.join('\n'));
  const replay=applyMapSourceHandColliderDelta(first.candidateProject,{delta,scope:scope()});
  assert.equal(replay.ok,false);assert.equal(replay.candidateProject,null);assert.match(replay.errors.join('\n'),/replay/);
});
