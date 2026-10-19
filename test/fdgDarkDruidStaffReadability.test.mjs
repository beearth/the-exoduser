import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { evaluateRig } from '../engine/fdg/rig.js';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';
import { buildDarkDruidStaffStrikeClip } from '../tools/fdg-studio/build-dark-druid-body.mjs';

// Only the adopted r2 clip and its own serialization are exercised here.
// This file does not import r1 tests, decode source images, or audit geometry.
const SCENE_PATH=new URL('../tools/fdg-studio/fixtures/dark-druid-normal-body.fdg.json',import.meta.url);
const RIG_PATH=new URL('../tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json',import.meta.url);
const [sceneBytes,rigBytes]=await Promise.all([fs.readFile(SCENE_PATH),fs.readFile(RIG_PATH)]);
const scene=JSON.parse(sceneBytes),rig=JSON.parse(rigBytes);
const NODE='dark-druid-body-node',IDLE='dark-druid-idle',ATTACK='dark-druid-staff-strike';
const TIP=[(75-221)/150,(526-82)/150,.035],HAND=[(77-221)/150,(526-242)/150,.035],EPS=1e-7;
const clone=value=>structuredClone(value),jsonData=value=>JSON.parse(JSON.stringify(value));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const matrixPoint=(m,p)=>[0,1,2].map(a=>m[a]*p[0]+m[a+4]*p[1]+m[a+8]*p[2]+m[a+12]);
const delta=(to,from)=>to.map((n,i)=>n-from[i]);
const vertexDrift=(a,b,indices=a.map((_,i)=>i))=>Math.max(0,...indices.map(i=>distance(a[i],b[i])));
const sample=time=>evaluateRig(rig,{clipId:ATTACK,time});
const sourcePoint=p=>[p[0]*150+221,526-p[1]*150];
const head=e=>sourcePoint(matrixPoint(e.boneMatrices.find(b=>b.id==='staff').skin,TIP));
const angleZ=pose=>2*Math.atan2(pose.rotationQuaternion[2],pose.rotationQuaternion[3]);
const metrics={scope:'Adopted Dark Druid r2 staff-strike motion and own in-memory capture/reload only',oldSuitesExecuted:0,sourceImageReads:0,sourceWrites:0,geometryAudit:false,canvasAudit:false,browserProof:false,gitCommands:0};
const results=[];
function check(name,body) {test(name,async()=>{try{await body();results.push({name,status:'PASS'});}catch(error){results.push({name,status:'FAIL',message:error.message});throw error;}});}

function eventTarget() {
  const listeners=new Map();return {listeners,addEventListener(type,callback){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(callback);},removeEventListener(type,callback){listeners.get(type)?.delete(callback);},listenerCount(){return [...listeners.values()].reduce((sum,set)=>sum+set.size,0);}};
}
function ownerSurface() {
  const noop=()=>{},context={save:noop,restore:noop,beginPath:noop,moveTo:noop,lineTo:noop,closePath:noop,clip:noop,transform:noop,drawImage:noop,fill:noop,stroke:noop,setTransform:noop,fillRect:noop,strokeRect:noop,clearRect:noop,arc:noop,ellipse:noop,fillText:noop,translate:noop,rotate:noop,scale:noop,createRadialGradient:()=>({addColorStop:noop}),createLinearGradient:()=>({addColorStop:noop})};
  const dimensions=new Map(),images=[],raf=new Map(),observers=new Set();let nextRaf=1;
  for(const resource of [...scene.characters,...scene.vfx])if(resource.sprite){const s=resource.sprite;for(const src of new Set([s.src,...Object.values(s.directions||{})]))dimensions.set(src,[s.columns*s.frameWidth,s.rows*s.frameHeight]);}
  for(const resource of scene.rigScene.resources)for(const material of resource.project.materials)if(material.texture)dimensions.set(material.texture.src,[material.texture.width,material.texture.height]);
  const window=Object.assign(eventTarget(),{devicePixelRatio:1,requestAnimationFrame(callback){const id=nextRaf++;raf.set(id,callback);return id;},cancelAnimationFrame(id){raf.delete(id);},Image:class{constructor(){images.push(this);}set src(value){const size=dimensions.get(value.replace(/^\//,''));assert.ok(size,`Unexpected asset ${value}`);[this.naturalWidth,this.naturalHeight]=size;queueMicrotask(()=>this.onload?.());}removeAttribute(){}},ResizeObserver:class{constructor(){observers.add(this);}observe(){}disconnect(){observers.delete(this);}}});
  const document=Object.assign(eventTarget(),{defaultView:window,hidden:false}),attributes=new Map();
  const canvas=Object.assign(eventTarget(),{ownerDocument:document,clientWidth:960,clientHeight:540,width:960,height:540,getContext:()=>context,getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),hasAttribute:key=>attributes.has(key),setAttribute:(key,value)=>attributes.set(key,value),removeAttribute:key=>attributes.delete(key),focus:noop});
  return {canvas,window,document,images,raf,observers};
}

check('adopted r2 staff head reverses preparation into forward down strike and recovers with feet and hand weld fixed',()=>{
  const clip=rig.clips.find(c=>c.id===ATTACK);assert.ok(clip);assert.deepEqual(jsonData(buildDarkDruidStaffStrikeClip()),clip);
  assert.deepEqual([clip.duration,clip.fps,clip.loop,clip.tracks.length],[2.4,24,false,12]);
  const times=[0,.25,.65,.9,1.04,1.1,1.25,1.65,2,2.4];clip.tracks.forEach(track=>assert.deepEqual(track.keys.map(k=>k.time),times));
  const expected=new Map([[0,[75,82]],[.9,[66.54301388253896,77.21874976139787]],[1.04,[99.03741974815254,104.18573968018922]],[1.1,[103.94808931697101,108.38274919430683]],[1.25,[101.76612237691475,113.37718200496482]],[1.65,[75.8621529361503,88.50836855704307]],[2.4,[75,82]]]);
  const phases=[0,.25,.4,.65,.733,.9,.97,1.04,1.1,1.15,1.25,1.45,1.65,1.825,2,2.2,2.4];
  const bind=sample(0),boots=rig.provenance.regions.flatMap((part,i)=>['leftBoot','rightBoot'].includes(part)?[i]:[]);assert.equal(boots.length,115);
  const evaluated=new Map(),samples=[],headStaffKeyErrors=[];let maxFootDrift=0,maxWeldDrift=0,maxSkinError=0,maxExpectedTipError=0;
  for(const time of phases){const pose=sample(time),matrices=new Map(pose.boneMatrices.map(b=>[b.id,b.skin]));evaluated.set(time,pose);
    assert.ok(pose.vertices.every(v=>v.length===3&&v.every(Number.isFinite)));
    const footDrift=vertexDrift(bind.vertices,pose.vertices,boots),skinError=Math.max(...matrices.get('staff').map((v,i)=>Math.abs(v-matrices.get('leftHand')[i]))),weldDrift=distance(matrixPoint(matrices.get('staff'),HAND),matrixPoint(matrices.get('leftHand'),HAND));
    assert.ok(footDrift<=EPS);assert.ok(weldDrift<=EPS);assert.ok(skinError<=EPS);
    if(times.includes(time)){const error=Math.max(...matrices.get('staff').map((v,i)=>Math.abs(v-matrices.get('head')[i])));assert.ok(error<=EPS,`head/staff skin mismatch at authored key ${time}`);headStaffKeyErrors.push({time,error});}
    const tip=head(pose),tipError=expected.has(time)?distance(tip,expected.get(time)):null;if(tipError!==null){assert.ok(tipError<=EPS);maxExpectedTipError=Math.max(maxExpectedTipError,tipError);}
    maxFootDrift=Math.max(maxFootDrift,footDrift);maxWeldDrift=Math.max(maxWeldDrift,weldDrift);maxSkinError=Math.max(maxSkinError,skinError);
    samples.push({time,tipSourceEquivalentPx:tip,footDriftModel:footDrift,handStaffSkinError:skinError,handStaffWeldDriftModel:weldDrift,expectedTipErrorPx:tipError});
  }
  const at=t=>head(evaluated.get(t)),origin=at(0),prep=at(.9),drive=at(1.04),peak=at(1.1),settle=at(1.25),recovery=at(1.65),end=at(2.4);
  const prepVector=delta(prep,origin),driveVector=delta(drive,prep),strikeVector=delta(peak,prep),oppositeDot=prepVector.reduce((sum,n,i)=>sum+n*strikeVector[i],0);
  assert.ok(prepVector[0]<0&&prepVector[1]<0&&driveVector[0]>0&&driveVector[1]>0&&strikeVector[0]>0&&strikeVector[1]>0);assert.ok(oppositeDot<0);
  assert.ok(settle[1]>peak[1]&&settle[0]<peak[0],'settle retains small down travel after forward peak');
  assert.ok(distance(recovery,origin)<distance(peak,origin)*.25);assert.ok(distance(end,origin)<=EPS);
  const prepPose=new Map(evaluated.get(.9).localPose.map(p=>[p.id,p])),peakPose=new Map(evaluated.get(1.1).localPose.map(p=>[p.id,p]));
  for(const id of ['spine','chest','leftUpperArm','leftForearm']){assert.ok(angleZ(prepPose.get(id))>0);assert.ok(angleZ(peakPose.get(id))<0);}
  assert.deepEqual(peakPose.get('leftUpperArm').translation,[.018,-.018,0]);
  assert.deepEqual(peakPose.get('spine').translation,[.135,-.195,0]);assert.deepEqual(peakPose.get('chest').translation,[0,0,0]);
  const chestPeak=evaluated.get(1.1).bonePositions.find(b=>b.id==='chest').position,chestBind=bind.bonePositions.find(b=>b.id==='chest').position,chestForce=delta(chestPeak,chestBind);assert.ok(chestForce[0]>0&&chestForce[1]<0,'chest inherits actual forward/down spine drive');
  const staffWorld=evaluated.get(1.1).boneMatrices.find(b=>b.id==='staff').world,totalStaffAngle=Math.atan2(staffWorld[1],staffWorld[0]);
  const crownEdges=[];for(const triangleIndex of [177,351]){const triangle=rig.mesh.triangles[triangleIndex];for(let edge=0;edge<3;edge++){const a=triangle[edge],b=triangle[(edge+1)%3],factor=distance(evaluated.get(1.1).vertices[a],evaluated.get(1.1).vertices[b])/distance(bind.vertices[a],bind.vertices[b]);assert.ok(Number.isFinite(factor)&&Math.abs(factor-1)<=EPS,'adopted crown fringe remains rigid at peak');crownEdges.push({triangleIndex,edge,factor});}}
  const regionMotion={};for(const part of ['coatLeft','coatRight','coatFront','coatBack']){const ids=rig.provenance.regions.flatMap((r,i)=>r===part?[i]:[]);regionMotion[part]=vertexDrift(bind.vertices,evaluated.get(1.25).vertices,ids);assert.ok(regionMotion[part]>0);assert.ok(Math.abs(angleZ(new Map(evaluated.get(1.25).localPose.map(p=>[p.id,p])).get(part)))<=.024);}
  metrics.motion={phaseCount:phases.length,probeSourcePx:[75,82],axisConvention:{forward:'+X',down:'+Y'},prepVectorPx:prepVector,driveFromPrepPx:driveVector,strikeFromPrepPx:strikeVector,strikeFromPrepScenePxAtScale80:strikeVector.map(n=>n*80/150),oppositeDotSourcePx2:oppositeDot,settleDeltaFromPeakPx:delta(settle,peak),recoveryResidualSourcePx:distance(recovery,origin),endResidualSourcePx:distance(end,origin),peakTotalStaffRotationRad:totalStaffAngle,chestInheritedDriveModel:chestForce,headStaffKeySkinErrors:headStaffKeyErrors,crownPeakEdgeFactors:crownEdges,coatSettleMaxVertexMotionModel:regionMotion,bootVertices:115,maxFootDriftModel:maxFootDrift,maxHandStaffWeldDriftModel:maxWeldDrift,maxHandStaffSkinError:maxSkinError,maxExpectedTipErrorPx:maxExpectedTipError,samples};
});

check('changed clip public capture JSON reload preserves attack pose transition and returns to idle with clock reset and FX zero',async()=>{
  const surface=ownerSurface(),errors=[],owner=new FDGRuntime(surface.canvas,clone(scene),{onError:error=>errors.push(error.message)});
  try{await owner.load();owner.pause();owner.setInputEnabled(false);assert.deepEqual(errors,[]);
    for(let i=0;i<30;i++)assert.equal(owner.step(FIXED_STEP),1);
    const idle=owner.getRigNodeSnapshot(NODE);assert.equal(owner.setRigClip(NODE,ATTACK),true);assert.equal(vertexDrift(idle.vertices,owner.getRigNodeSnapshot(NODE).vertices),0);
    for(let i=0;i<6;i++)owner.step(FIXED_STEP);const before=owner.getRigNodeSnapshot(NODE),saved=owner.captureSceneState().project,serialized=JSON.stringify(saved),reopened=JSON.parse(serialized),imagesBefore=surface.images.length;
    assert.equal(before.clipId,ATTACK);assert.ok(Math.abs(before.time-.1)<1e-12);assert.equal(before.transition.duration,.25);assert.ok(Math.abs(before.transition.elapsed-.1)<1e-12);
    assert.deepEqual(saved.rigScene.resources[0].project.clips.find(c=>c.id===ATTACK),rig.clips.find(c=>c.id===ATTACK));assert.deepEqual(reopened,saved);
    await owner.setProject(reopened);const restored=owner.getRigNodeSnapshot(NODE);
    assert.deepEqual(restored.vertices,before.vertices);assert.deepEqual(restored.bonePositions,before.bonePositions);assert.deepEqual(restored.transition,before.transition);assert.deepEqual(restored.returnTo,{clipId:IDLE,transitionSeconds:.35});assert.deepEqual(owner.captureSceneState().project,reopened);assert.equal(owner.stats.time,0);assert.equal(surface.images.length,imagesBefore);assert.deepEqual(errors,[]);
    const sequence=owner.getRigSequenceSnapshot();assert.equal(sequence.status,'unavailable');assert.equal(sequence.activationId,0);assert.equal(sequence.eventCount,0);assert.equal(sequence.emittedCount,0);assert.deepEqual(sequence.activeFx,[]);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);assert.equal(owner.particles.count,0);
    // The captured attack advances naturally after reopen. No seek, clip edit,
    // atlas event, or runtime reset stands in for the real 2.4s return boundary.
    for(let i=0;i<137;i++)owner.step(FIXED_STEP);assert.equal(owner.getRigNodeSnapshot(NODE).clipId,ATTACK);
    owner.step(FIXED_STEP);const returnStart=owner.getRigNodeSnapshot(NODE);assert.equal(returnStart.clipId,IDLE);assert.equal(returnStart.time,0);assert.equal(returnStart.transition.duration,.35);
    const continuity=vertexDrift(sample(2.4).vertices,returnStart.vertices);assert.ok(continuity<=EPS);
    for(let i=0;i<20;i++)owner.step(FIXED_STEP);assert.notEqual(owner.getRigNodeSnapshot(NODE).transition,null);
    owner.step(FIXED_STEP);const finished=owner.getRigNodeSnapshot(NODE);assert.equal(finished.transition,null);assert.equal(finished.clipId,IDLE);assert.ok(Math.abs(finished.time-.35)<1e-12);assert.deepEqual(owner.getVfxPlaybackSnapshot(),[]);assert.equal(owner.particles.count,0);
    metrics.capture={savedAttackTimeSeconds:before.time,savedTransition:before.transition,serializedBytes:Buffer.byteLength(serialized),restoredVertexDriftModel:vertexDrift(before.vertices,restored.vertices),restoredBoneDriftModel:Math.max(...before.bonePositions.map((b,i)=>distance(b.position,restored.bonePositions[i].position))),ownerClockAfterReload:0,sequenceStatusAfterReload:sequence.status,fxAfterReload:0,remainingAttackTicks:138,returnTicks:21,returnT0ContinuityModel:continuity,finalIdleTimeSeconds:finished.time,finalFx:owner.particles.count,mockImagesBefore:imagesBefore,mockImagesAfter:surface.images.length};
  }finally{owner.dispose();assert.equal(owner.state,'disposed');assert.equal(owner.assets.size,0);assert.equal(surface.raf.size,0);assert.equal(surface.observers.size,0);assert.equal(surface.canvas.listenerCount()+surface.window.listenerCount()+surface.document.listenerCount(),0);}
});

after(async()=>{const E=process.env.FDG_DRUID_STAFF_TEST_EVIDENCE;if(!E)return;await fs.mkdir(E,{recursive:true});const sha=bytes=>createHash('sha256').update(bytes).digest('hex');metrics.shipping={scene:{path:SCENE_PATH.pathname,bytes:sceneBytes.length,sha256:sha(sceneBytes)},rig:{path:RIG_PATH.pathname,bytes:rigBytes.length,sha256:sha(rigBytes)}};await fs.writeFile(`${E}/targeted-dark-druid-staff-metrics.json`,JSON.stringify(metrics,null,2));await fs.writeFile(`${E}/new-tests.json`,JSON.stringify({testFile:'test/fdgDarkDruidStaffReadability.test.mjs',firstRun:true,total:results.length,pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length,oldSuitesExecuted:0,sourceImageReads:0,results,metrics:'targeted-dark-druid-staff-metrics.json'},null,2));});
