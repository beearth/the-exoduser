import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildDarkDruidRig, DRUID_SOURCE, DRUID_SOURCE_SHA256, DRUID_UNITS, DRUID_ORIGIN, DRUID_ROIS, DRUID_BONES_PX } from './build-dark-druid-body.mjs';
import { createDefaultProject } from '../../engine/fdg/catalog.js';
import { validateProject } from '../../engine/fdg/project.js';
import { validateRigProject } from '../../engine/fdg/rig-project.js';
import { evaluateRig } from '../../engine/fdg/rig.js';

/** Independent r3 authoring. The frozen source extractor supplies UV silhouette
 * only; no r1/r2 clip, head compensation, weights, or part ownership is adopted. */
export const DRUID_SLAM_IDS = Object.freeze({
  rig:'dark-druid-boss-slam-r3', project:'dark-druid-boss-slam-scene-r3',
  node:'dark-druid-slam-body-r3', resource:'dark-druid-slam-body-r3-resource',
  idle:'dark-druid-slam-idle-r3', attack:'dark-druid-native-slam-r3',
});
export const DRUID_SLAM_PHASES = Object.freeze({windStart:0,windEnd:1,strikeEnd:1.16,recoverEnd:2.6});
export const DRUID_SLAM_TIMES = Object.freeze([0,.15,.45,.75,1,1.06,1.12,1.16,1.26,1.42,1.65,1.95,2.3,2.6]);
export const DRUID_SLAM_REGIONS = {
  // Visible crown/ropes belong to the hand-owned prop. The top/right antlers
  // remain outside this polygon and retain independent head articulation.
  staffCrownAndRopes:[[49,15],[70,25],[86,43],[107,58],[115,83],[114,151],[95,180],[79,202],[72,229],[56,250],[30,273],[4,278],[0,164],[0,62],[15,30]],
  staffShaft:structuredClone(DRUID_ROIS.staffShaft),
  leftHand:structuredClone(DRUID_ROIS.leftHand), leftSleeve:structuredClone(DRUID_ROIS.leftSleeve),
  rightArm:structuredClone(DRUID_ROIS.rightArm),
  coatFront:structuredClone(DRUID_ROIS.coatFront), coatLeft:structuredClone(DRUID_ROIS.coatLeft), coatRight:structuredClone(DRUID_ROIS.coatRight),
  leftBoot:structuredClone(DRUID_ROIS.leftBoot), rightBoot:structuredClone(DRUID_ROIS.rightBoot),
};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const inside=([x,y],polygon)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const[a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;
}return hit;};
const weights=(...pairs)=>pairs.filter(([,weight])=>weight>1e-10).map(([boneId,weight])=>({boneId,weight}));
const sourceXY=uv=>[uv[0]*355,uv[1]*541];
const model=p=>[(p[0]-DRUID_ORIGIN[0])/DRUID_UNITS,(DRUID_ORIGIN[1]-p[1])/DRUID_UNITS,.035];
const source=p=>[p[0]*DRUID_UNITS+DRUID_ORIGIN[0],DRUID_ORIGIN[1]-p[1]*DRUID_UNITS,p[2]];

export function darkDruidSlamPartAt(x,y) {
  const p=[x,y];
  if(inside(p,DRUID_SLAM_REGIONS.leftHand))return 'leftHand';
  if(inside(p,DRUID_SLAM_REGIONS.staffCrownAndRopes)||inside(p,DRUID_SLAM_REGIONS.staffShaft))return 'staff';
  if(inside(p,DRUID_SLAM_REGIONS.leftBoot))return 'leftBoot';
  if(inside(p,DRUID_SLAM_REGIONS.rightBoot))return 'rightBoot';
  if(inside(p,DRUID_SLAM_REGIONS.leftSleeve))return 'leftSleeve';
  if(inside(p,DRUID_SLAM_REGIONS.rightArm))return 'rightArm';
  if(y<154)return 'head';
  if(inside(p,DRUID_SLAM_REGIONS.coatFront))return 'coatFront';
  if(inside(p,DRUID_SLAM_REGIONS.coatLeft))return 'coatLeft';
  if(inside(p,DRUID_SLAM_REGIONS.coatRight))return 'coatRight';
  if(y>292)return 'coatBack';
  return 'body';
}

export function darkDruidSlamWeightsAt(x,y,part) {
  if(part==='staff'||part==='leftHand')return weights(['staff',1]);
  if(part==='leftBoot'||part==='rightBoot')return weights([part,1]);
  if(part==='head'){
    const neck=clamp((y-132)/30);return weights(['head',1-neck],['neck',neck]);
  }
  if(part==='leftUpperSleeve')return weights(['leftUpperArm',1]);
  if(part==='leftForeSleeve')return weights(['leftForearm',1]);
  if(part==='leftSleeve'){
    const shoulder=clamp((x-145)/26),wrist=clamp((128-x)/44),grip=clamp((105-x)/23);
    return weights(['chest',shoulder],['leftUpperArm',(1-shoulder)*(1-wrist)],
      ['leftForearm',(1-shoulder)*wrist*(1-grip)],['leftHand',(1-shoulder)*wrist*grip]);
  }
  if(part==='rightArm'){
    const elbow=clamp((y-220)/75),hand=clamp((y-293)/35);
    return weights(['rightUpperArm',1-elbow],['rightForearm',elbow*(1-hand)],['rightHand',elbow*hand]);
  }
  if(part.startsWith('coat')){
    const drape=.8*clamp((y-286)/110);return weights(['pelvis',1-drape],[part,drape]);
  }
  const neck=clamp((184-y)/42);if(y<=184)return weights(['neck',neck],['chest',1-neck]);
  if(y<=226){const spine=clamp((y-184)/42);return weights(['chest',1-spine],['spine',spine]);}
  const hip=clamp((y-226)/72);return weights(['spine',1-hip],['pelvis',hip]);
}

const LAYERS={coatBack:-2,coatLeft:-1,coatRight:-1,body:0,leftBoot:1,rightBoot:1,coatFront:2,head:3,leftSleeve:4,leftUpperSleeve:4,leftForeSleeve:4,rightArm:4,leftHand:5,staff:6};
const distanceToSegment=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
export function buildDarkDruidSlamClip() {
  const angles={
    pelvis:[0,-.006,-.014,-.026,-.035,-.024,-.002,.014,.024,.016,-.010,-.005,-.002,0],
    spine:[0,.025,.070,.105,.130,.020,-.135,-.170,-.185,-.130,-.035,.040,.012,0],
    chest:[0,.018,.055,.085,.100,.025,-.080,-.110,-.100,-.040,.030,.015,.005,0],
    neck:[0,-.008,-.020,-.030,-.032,.012,.055,.065,.055,.025,-.014,-.012,-.003,0],
    head:[0,-.012,-.035,-.055,-.075,.025,.105,.120,.090,.020,-.040,-.020,-.008,0],
    leftUpperArm:[0,.045,.100,.160,.220,.250,.340,.500,.440,.150,-.035,.030,.008,0],
    leftForearm:[0,.035,.090,.140,.180,-.100,-.600,-.900,-.800,-.320,.050,.025,.007,0],
    leftHand:[0,.008,.022,.035,.045,-.400,-1.100,-1.700,-1.550,-.650,.035,.008,.003,0],
    rightUpperArm:[0,-.025,-.080,-.150,-.210,-.070,.150,.210,.245,.120,-.080,-.025,-.008,0],
    rightForearm:[0,.035,.100,.145,.175,.035,-.180,-.230,-.200,-.070,.070,.025,.008,0],
    coatLeft:[0,.004,.012,.020,.026,.030,.010,-.015,-.065,-.090,-.040,.028,.008,0],
    coatRight:[0,-.003,-.009,-.016,-.023,-.025,-.006,.020,.070,.085,.030,-.020,-.006,0],
    coatFront:[0,.002,.008,.013,.018,.025,.015,.005,-.045,-.060,-.015,.016,.004,0],
    coatBack:[0,.003,.009,.015,.022,.028,.020,.010,-.040,-.075,-.030,.024,.006,0],
  };
  const pelvis=[[0,0,0],[-.008,-.008,0],[-.020,-.022,0],[-.035,-.040,0],[-.045,-.060,0],[.005,-.055,0],[.090,-.030,0],[.115,-.035,0],[.125,-.055,0],[.090,-.060,0],[.025,-.030,0],[-.010,.006,0],[-.003,.002,0],[0,0,0]];
  const spine=[[0,0,0],[-.010,.035,0],[-.045,.100,0],[-.085,.180,0],[-.120,.260,0],[.200,-.050,0],[.630,-.560,0],[.770,-.733,0],[.820,-.780,0],[.390,-.380,0],[.030,-.060,0],[-.025,.025,0],[-.007,.006,0],[0,0,0]];
  const upper=[[0,0,0],[0,.030,0],[-.020,.120,0],[-.040,.200,0],[-.050,.280,0],[.020,.100,0],[.120,-.400,0],[.120,-.550,0],[.130,-.580,0],[.075,-.240,0],[-.015,.020,0],[-.005,.005,0],[0,0,0],[0,0,0]];
  return {id:DRUID_SLAM_IDS.attack,name:'전신 모으기 → 빠른 지팡이 내려찍기 → 외투 후행 → 반동',duration:2.6,fps:24,loop:false,
    tracks:Object.entries(angles).map(([boneId,values])=>({boneId,keys:DRUID_SLAM_TIMES.map((time,i)=>({time,
      translation:boneId==='pelvis'?pelvis[i]:boneId==='spine'?spine[i]:boneId==='leftUpperArm'?upper[i]:[0,0,0],rotation:[0,0,values[i]],
    }))})),provenance:{authority:'ENGINE_AUTHORING',phaseMarkers:{...DRUID_SLAM_PHASES},nativeTimeClaim:false,
      tipProbeSourcePx:[75,82],handProbeSourcePx:[77,242],bodyProbeSourcePx:[224,224],pelvisProbeSourcePx:[222,291],
      footProbesSourcePx:[[150,521],[290,526]],headStaffCommonSkinCompensation:false,staffTracks:0}};
}

/** Offline authoring only: unchanged upper/forearm bind lengths, shoulder T0.
 * The negative-elbow branch matches the original bind. Dense strike keys keep
 * each quaternion interval below pi; no runtime IK or constraint is installed. */
export function bakeDarkDruidSlamArm(rig) {
  const clip=rig.clips.find(c=>c.id===DRUID_SLAM_IDS.attack),track=id=>clip.tracks.find(t=>t.boneId===id);
  const neutral=structuredClone(rig),neutralClip=neutral.clips.find(c=>c.id===clip.id);
  for(const t of neutralClip.tracks)if(['leftUpperArm','leftForearm','leftHand'].includes(t.boneId))for(const k of t.keys){k.translation=[0,0,0];k.rotation=[0,0,0];}
  const upperBone=rig.skeleton.bones.find(b=>b.id==='leftForearm').translation;
  const foreBone=rig.skeleton.bones.find(b=>b.id==='leftHand').translation;
  const l1=Math.hypot(upperBone[0],upperBone[1]),l2=Math.hypot(foreBone[0],foreBone[1]);
  const a1=Math.atan2(upperBone[1],upperBone[0]),a2=Math.atan2(foreBone[1],foreBone[0]);
  const offsets=[[-81,55],[-82,42],[-80,25],[-73,2],[-65,-18],[-18,54],[45,65],[65,63],[69,54],[24,68],[-53,51],[-77,52],[-81,55],[-81,55]];
  const staffWorld=[0,.08,.23,.43,.64,-.25,-1.8,-2.75,-2.6,-1.1,.12,.09,.02,0];
  const receipt=[];let lastUpper=0,lastFore=0;
  const unwrap=(v,last)=>{while(v-last>Math.PI)v-=Math.PI*2;while(v-last< -Math.PI)v+=Math.PI*2;return v;};
  DRUID_SLAM_TIMES.forEach((time,i)=>{
    const pose=evaluateRig(neutral,{clipId:clip.id,time}),chest=pose.boneMatrices.find(b=>b.id==='chest').world;
    const parentR=Math.atan2(chest[1],chest[0]),target=[offsets[i][0]/DRUID_UNITS,-offsets[i][1]/DRUID_UNITS];
    const distance=Math.hypot(...target);if(distance>l1+l2||distance<Math.abs(l1-l2))throw new Error('Explicit r3 hand target exceeds original limb lengths.');
    const elbow=-Math.acos(clamp((distance*distance-l1*l1-l2*l2)/(2*l1*l2),-1,1));
    const linkR=Math.atan2(target[1],target[0])-Math.atan2(l2*Math.sin(elbow),l1+l2*Math.cos(elbow));
    const upper=unwrap(linkR-a1-parentR,lastUpper),fore=unwrap(elbow+a1-a2,lastFore);
    const hand=staffWorld[i]-(parentR+upper+fore);lastUpper=upper;lastFore=fore;
    for(const[id,r]of[['leftUpperArm',upper],['leftForearm',fore],['leftHand',hand]]){
      track(id).keys[i].translation=[0,0,0];track(id).keys[i].rotation=[0,0,r];
    }
    const shoulder=pose.bonePositions.find(b=>b.id==='leftUpperArm').position;
    receipt.push({time,shoulderSourcePx:source(shoulder).slice(0,2),handTargetOffsetSourcePx:offsets[i],handTargetSourcePx:source(shoulder).slice(0,2).map((v,a)=>v+offsets[i][a]),staffWorldR:staffWorld[i],localR:{upper,fore,hand}});
  });
  clip.provenance.armAuthoring={kind:'offline-two-bone-planar-bake',sourceGeometryClaim:false,upperLengthSourcePx:l1*DRUID_UNITS,foreLengthSourcePx:l2*DRUID_UNITS,shoulderLocalTranslation:[0,0,0],branch:'negative elbow matches source bind',keys:receipt};
  return receipt;
}

export function buildDarkDruidBossPattern(image,sourceHash) {
  // This import is frozen UV extraction code, not a regenerated r1/r2 artifact.
  const extracted=buildDarkDruidRig(image,sourceHash), original=extracted.mesh;
  const sourceTriangleCount=extracted.provenance.extraction.originalTriangles;
  const mesh={id:'dark-druid-slam-visible-mesh',skeletonId:'dark-druid-slam-skeleton',vertices:[],triangles:[],weights:[],uvs:[],drawOrder:[],faceColors:[]};
  const index=new Map(),regions=[],triangleRegions=[],copiesByOriginal=new Map(),partCounts={};
  const insert=(old,part)=>{
    const physical=part==='leftHand'?'staff':part,key=`${old}:${physical}`;
    if(index.has(key))return index.get(key);
    const next=mesh.vertices.length,p=sourceXY(original.uvs[old]);index.set(key,next);
    mesh.vertices.push([...original.vertices[old]]);mesh.uvs.push([...original.uvs[old]]);
    mesh.weights.push(darkDruidSlamWeightsAt(...p,physical));regions.push(physical);
    const list=copiesByOriginal.get(old)||[];list.push({index:next,part:physical});copiesByOriginal.set(old,list);
    return next;
  };
  original.triangles.slice(0,sourceTriangleCount).forEach(triangle=>{
    const center=[0,1].map(axis=>triangle.reduce((s,i)=>s+sourceXY(original.uvs[i])[axis],0)/3);
    let part=darkDruidSlamPartAt(...center);
    if(part==='leftSleeve')part=distanceToSegment(center,[158,187],[122,233])<=distanceToSegment(center,[122,233],[77,242])?'leftUpperSleeve':'leftForeSleeve';
    mesh.triangles.push(triangle.map(i=>insert(i,part)));mesh.drawOrder.push(LAYERS[part]);mesh.faceColors.push(null);triangleRegions.push(part);
    partCounts[part]=(partCounts[part]||0)+1;
  });
  // Reuse only the approved short visible right-arm edge finish. No new hidden
  // texture is painted, and its flat colors remain explicitly authored.
  const sideSegments=[];
  original.triangles.slice(sourceTriangleCount).forEach((triangle,j)=>{
    const mapped=triangle.map(i=>insert(i,'rightArm'));mesh.triangles.push(mapped);mesh.drawOrder.push(4);mesh.faceColors.push(original.faceColors[sourceTriangleCount+j]);triangleRegions.push('authored-arm-side');
    sideSegments.push({sourceFace:sourceTriangleCount+j,face:mesh.triangles.length-1});
  });
  // A small socket remains behind the moving sleeve. It is flat authored
  // occluded cloth, not newly recovered source pixels or a whole back shell.
  const socketSegments=12,sockets=[{id:'shoulder',center:[158,187],radius:28,boneId:'chest'},{id:'elbow',center:[122,233],radius:18,boneId:'leftUpperArm'},{id:'wrist',center:[77,242],radius:16,boneId:'leftForearm'}];
  for(const socket of sockets){const start=mesh.vertices.length,region=`authored-${socket.id}-socket`;
    const add=p=>{mesh.vertices.push(model(p));mesh.uvs.push([p[0]/355,p[1]/541]);mesh.weights.push(weights([socket.boneId,1]));regions.push(region);};
    add(socket.center);for(let i=0;i<socketSegments;i++){const a=i*Math.PI*2/socketSegments;add([socket.center[0]+Math.cos(a)*socket.radius,socket.center[1]+Math.sin(a)*socket.radius]);}
    for(let i=0;i<socketSegments;i++){mesh.triangles.push([start,start+1+i,start+1+(i+1)%socketSegments]);mesh.drawOrder.push(3);mesh.faceColors.push('#191815');triangleRegions.push(region);}
  }
  const skeleton=structuredClone(extracted.skeleton);skeleton.id=mesh.skeletonId;
  const idleTimes=[0,.25,.5,.75,1,1.25,1.5,1.75,2],idleAmp={spine:.006,chest:.009,head:-.008,leftUpperArm:.012,leftForearm:-.010,rightUpperArm:-.008,coatLeft:.009,coatRight:-.007,coatFront:.004,coatBack:.005};
  const idle={id:DRUID_SLAM_IDS.idle,name:'대기 · 독립 머리와 외투 호흡',duration:2,fps:24,loop:true,tracks:Object.entries(idleAmp).map(([boneId,a])=>({boneId,keys:idleTimes.map(time=>({time,translation:boneId==='chest'?[0,.004*Math.sin(Math.PI*time),0]:[0,0,0],rotation:[0,0,a*Math.sin(Math.PI*time)]}))}))};
  const splitBoundaries=[...copiesByOriginal.entries()].filter(([,list])=>list.length>1).map(([sourceIndex,copies])=>({sourceIndex,sourcePx:sourceXY(original.uvs[sourceIndex]),copies}));
  const rig={rigVersion:1,id:DRUID_SLAM_IDS.rig,name:'다크드루이드 NORMAL · 전신 내려찍기 r3',skeleton,mesh,
    materials:[{id:'approved-dark-druid',name:'승인 NORMAL f0 원화 · 보이는 표면',meshId:mesh.id,skeletonId:skeleton.id,color:'#b1a28f',texture:{src:DRUID_SOURCE,width:355,height:541}}],clips:[idle,buildDarkDruidSlamClip()],
    preview:{materialId:'approved-dark-druid',clipId:idle.id,time:0,playing:false,pose:{},camera:{yaw:0,pitch:0,zoom:1}},
    provenance:{authority:'ENGINE_AUTHORING',revision:'boss-pattern-r3',subject:'boss-dark-druid-NORMAL',source:DRUID_SOURCE,sourceSha256:sourceHash,sourceSize:[355,541],sourceImageModified:false,
      approvedCanonicalPath:'/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/sprites/boss/boss_dark_druid_f0.png',sourcePxPerModelUnit:DRUID_UNITS,originPx:[...DRUID_ORIGIN],
      sourceRecovered:false,modelKind:'visible-surface-2.5D-skinned',nativeCombatApplied:false,gameplayApplied:false,newFx:false,
      phaseMarkers:{...DRUID_SLAM_PHASES},tipProbeSourcePx:[75,82],handProbeSourcePx:[77,242],bodyProbeSourcePx:[224,224],pelvisProbeSourcePx:[222,291],footProbesSourcePx:[[150,521],[290,526]],
      bossSlam:{authority:'ENGINE_AUTHORING',clipId:DRUID_SLAM_IDS.attack,phaseMarkers:{...DRUID_SLAM_PHASES},tipProbeSourcePx:[75,82],handProbeSourcePx:[77,242],bodyProbeSourcePx:[224,224],headStaffCommonSkinCompensation:false,nativeTimeClaim:false},
      bonesSourcePx:structuredClone(DRUID_BONES_PX),roisSourcePx:structuredClone(DRUID_SLAM_REGIONS),regions,triangleRegions,
      extraction:{...structuredClone(extracted.provenance.extraction),sharedSourceVertex:false,physicalPartBoundariesSplit:true,sourceTrianglesPreserved:sourceTriangleCount,originalExtractedVertices:original.vertices.length,originalExtractedTriangles:original.triangles.length},
      physicalPartSplit:{authority:'ENGINE_AUTHORING',ownership:'triangle centroid in explicit source-pixel polygons; separate index/weights across parts',boundaryDuplicates:splitBoundaries,partTriangleCounts:partCounts,staffCrownFringesOwned:'staff',headAntlersIndependent:true,sourceTextureWritten:false},
      handStaff:{pivotSourcePx:[77,242],coincidentBind:true,staffTracks:0,sharedHandStaffSkinMatrix:true,headStaffCommonSkinCompensation:false},
      footPolicy:{bones:['leftBoot','rightBoot'],parent:'root',animated:false,actorWorldPositionChanged:false},
      depthAuthoringDruid:{...structuredClone(extracted.provenance.depthAuthoringDruid),sideSegments,sideRole:'ENGINE_AUTHORING visible edge finish; not recovered rear surface'},
      sourceGap:'SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보',sourceGapCount:1,fullBackAuthored:false,
      hiddenSurfaceAuthoring:{authority:'ENGINE_AUTHORING',sourceRecovered:false,role:'short occluded joint sockets behind rigid split upper/fore sleeve and hand',sockets:structuredClone(sockets),segmentsPerSocket:socketSegments,color:'#191815',sourceTextureGenerated:false,canonicalHiddenSurfaceClaim:false},
      liveNativeGate:{status:'BLOCKED',reason:'Existing boss test routes mutate shared materials, settings, storage and autosave; live boot deferred pending explicit save isolation'},
    }};
  bakeDarkDruidSlamArm(rig);
  const valid=validateRigProject(rig);if(!valid.ok)throw new Error(valid.errors.join('\n'));
  return rig;
}

export function buildDarkDruidBossPatternScene(rig) {
  const scene=createDefaultProject();scene.id=DRUID_SLAM_IDS.project;scene.name=rig.name;
  scene.rigScene={version:1,resources:[{id:DRUID_SLAM_IDS.resource,name:rig.name,project:structuredClone(rig)}],nodes:[{
    id:DRUID_SLAM_IDS.node,name:'다크드루이드 NORMAL · 전신 slam',resourceId:DRUID_SLAM_IDS.resource,position:[4150,7360,0],scale:80,visible:true,
    materialId:'approved-dark-druid',clipId:DRUID_SLAM_IDS.idle,time:0,transition:null,returnTo:{clipId:DRUID_SLAM_IDS.idle,transitionSeconds:.35},
  }],camera:{x:4150,y:7216,follow:false,yaw:0,pitch:0}};
  scene.provenance.bodyAuthoring={authority:'ENGINE_AUTHORING',subject:'boss-dark-druid-NORMAL',revision:'boss-pattern-r3',fx:0,entryTransitionSeconds:.25,nativeCombatApplied:false,
    phaseMarkers:{...DRUID_SLAM_PHASES},nativePhaseMappingOwnedBy:'explicit renderer bridge; native AI/damage/timers untouched',liveNativeGate:structuredClone(rig.provenance.liveNativeGate)};
  const valid=validateProject(scene,{geometry:false});if(!valid.ok)throw new Error(valid.errors.join('\n'));return scene;
}

function transformed(matrix,p){return[0,1,2].map(row=>matrix[row]*p[0]+matrix[row+4]*p[1]+matrix[row+8]*p[2]+matrix[row+12]);}
export function measureDarkDruidSlam(rig) {
  const times=[0,.75,1,1.06,1.12,1.16,1.26,1.42,1.95,2.6];
  const phases=times.map(time=>{
    const pose=evaluateRig(rig,{clipId:DRUID_SLAM_IDS.attack,time});
    const bone=id=>pose.boneMatrices.find(b=>b.id===id).skin;
    const point=(id,p)=>source(transformed(bone(id),model(p)));
    const bootIndices=rig.provenance.regions.flatMap((part,i)=>part==='leftBoot'||part==='rightBoot'?[i]:[]);
    const bootDrift=Math.max(0,...bootIndices.map(i=>Math.hypot(...pose.vertices[i].map((v,a)=>v-rig.mesh.vertices[i][a]))))*DRUID_UNITS;
    let maximumTriangleEdgeRatio=0,maximumStaffEdgeRatio=0,maximumHeadEdgeRatio=0;
    const stretchByPart={};
    rig.mesh.triangles.forEach((tri,ti)=>{const part=rig.provenance.triangleRegions[ti];if(part==='authored-arm-side')return;
      for(let e=0;e<3;e++){const a=tri[e],b=tri[(e+1)%3];const rest=Math.hypot(...rig.mesh.vertices[a].map((v,k)=>v-rig.mesh.vertices[b][k]));
        if(rest*DRUID_UNITS<1)continue;const ratio=Math.hypot(...pose.vertices[a].map((v,k)=>v-pose.vertices[b][k]))/rest;
        maximumTriangleEdgeRatio=Math.max(maximumTriangleEdgeRatio,ratio);stretchByPart[part]=Math.max(stretchByPart[part]||0,ratio);
        if(part==='staff'||part==='leftHand')maximumStaffEdgeRatio=Math.max(maximumStaffEdgeRatio,ratio);
        if(part==='head')maximumHeadEdgeRatio=Math.max(maximumHeadEdgeRatio,ratio);
      }
    });
    const handStaffSkinDrift=Math.max(...bone('staff').map((v,i)=>Math.abs(v-bone('leftHand')[i])));
    const headStaffSkinDifference=Math.max(...bone('staff').map((v,i)=>Math.abs(v-bone('head')[i])));
    return {time,tipSourcePx:point('staff',[75,82]),handSourcePx:point('staff',[77,242]),headSourcePx:point('head',[223,112]),
      bodySourcePx:point('spine',[224,224]),pelvisSourcePx:point('pelvis',[222,291]),bootDriftSourcePx:bootDrift,handStaffSkinDrift,headStaffSkinDifference,
      maximumTriangleEdgeRatio,maximumStaffEdgeRatio,maximumHeadEdgeRatio,stretchByPart};
  });
  const prep=phases.find(p=>p.time===1),strike=phases.find(p=>p.time===1.16);
  return {authority:'ENGINE_AUTHORING numeric receipt; visual verdict owned by actual public review',phaseMarkers:{...DRUID_SLAM_PHASES},phases,
    prepToStrike:{tipDeltaSourcePx:strike.tipSourcePx.map((v,i)=>v-prep.tipSourcePx[i]),handDeltaSourcePx:strike.handSourcePx.map((v,i)=>v-prep.handSourcePx[i]),
      headDeltaSourcePx:strike.headSourcePx.map((v,i)=>v-prep.headSourcePx[i]),bodyDeltaSourcePx:strike.bodySourcePx.map((v,i)=>v-prep.bodySourcePx[i])},
    counts:{bones:rig.skeleton.bones.length,vertices:rig.mesh.vertices.length,triangles:rig.mesh.triangles.length,materials:rig.materials.length,clips:rig.clips.length,boundarySplits:rig.provenance.physicalPartSplit.boundaryDuplicates.length},
    protected:{pngWritten:false,oldR1R2Written:false,staffTracks:0,headStaffSkinCompensation:false,actorWorldPositionChanged:false,sourceGapCount:1,nativeLive:'BLOCKED'},visualVerdict:'NOT_OBSERVED'};
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  const nodePng=process.env.FDG_PNG_MODULE;if(!nodePng)throw new Error('FDG_PNG_MODULE must point to the installed pngjs module.');
  const pngModule=await import(nodePng),PNG=pngModule.PNG||pngModule.default?.PNG||pngModule.default;
  const bytes=await fs.readFile(DRUID_SOURCE),hash=createHash('sha256').update(bytes).digest('hex');
  if(hash!==DRUID_SOURCE_SHA256)throw new Error('Approved source identity changed; no alternate texture accepted.');
  const image=PNG.sync.read(bytes),rig=buildDarkDruidBossPattern(image,hash),scene=buildDarkDruidBossPatternScene(rig),receipt=measureDarkDruidSlam(rig);
  const out=process.env.FDG_DRUID_BOSS_PATTERN_OUTPUT||path.resolve('out/dark-druid-boss-slam-r3');await fs.mkdir(out,{recursive:true});
  const rigBytes=JSON.stringify(rig),sceneBytes=JSON.stringify(scene);receipt.bytes={rig:Buffer.byteLength(rigBytes),scene:Buffer.byteLength(sceneBytes)};
  await fs.writeFile(path.join(out,'dark-druid-boss-slam-r3.rig.json'),rigBytes+'\n');
  await fs.writeFile(path.join(out,'dark-druid-boss-slam-r3.fdg.json'),sceneBytes+'\n');
  await fs.writeFile(path.join(out,'r3-build-receipt.json'),JSON.stringify(receipt,null,2)+'\n');
  await fs.writeFile('tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json',rigBytes+'\n');
  await fs.writeFile('tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.fdg.json',sceneBytes+'\n');
  console.log(JSON.stringify({ids:DRUID_SLAM_IDS,counts:receipt.counts,bytes:receipt.bytes,prepToStrike:receipt.prepToStrike,phases:receipt.phases.map(p=>({time:p.time,maxStretch:p.maximumTriangleEdgeRatio,staffStretch:p.maximumStaffEdgeRatio,headStretch:p.maximumHeadEdgeRatio,bootDrift:p.bootDriftSourcePx,handStaffDrift:p.handStaffSkinDrift})),output:out},null,2));
}
