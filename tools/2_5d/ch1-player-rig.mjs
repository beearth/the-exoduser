/* ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007
 * Main body-only display adapter. Caller owns P/G, movement, phase and the existing
 * body-local X transform. Returned rectangles are relative to the calibrated foot (0,0).
 * This is directional artwork on a skinned plane, not a full 3D player model.
 */
import * as THREE from '../../assets/vendor/three-r160/build/three.module.js';
import {createCharacterRig} from './character-rigs.mjs';
import {CHARACTER_RIG_CATALOG,characterRigFrame} from './character-rig-catalog.mjs';

export const CH1_PLAYER_RIG=Object.freeze({
  completionId:'ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007',stage:0,rigHeight:1,
  paddingLocal:2,maxBackingDimension:2048,maxBackingScale:4,maxDelta:.05,
  ownsRAF:false,ownsSimulation:false,mainPlayableAccepted:false
});
const MODES=Object.freeze(['idle','walk','run','attack']);
const FRAME_FIELDS=Object.freeze(['path','x','y','w','h','anchorX','anchorY','referenceHeight']);
const INPUT_FIELDS=Object.freeze(['stage','map','actor','id','mode','direction','phase','heightWorld','backingScale','dt']);
const PACKED_FIELDS=Object.freeze(['generation','mode','direction','index','count','x','y','w','h','anchorX','anchorY','referenceHeight']);
const PACKED_INPUTS=Object.freeze(['borrowedAtlas','sourceFrame','animator','frameMap']);
const PACKED_DIRECTIONS=Object.freeze(['s','se','e','ne','n','nw','w','sw']);
const PACKED_PATH='borrowed:silvertail-main-atlas';
const bump=(object,key)=>{object[key]=Math.min(Number.MAX_SAFE_INTEGER,object[key]+1);};
function own(object,key){
  if(object===null||(typeof object!=='object'&&typeof object!=='function'))return undefined;
  const descriptor=Object.getOwnPropertyDescriptor(object,key);
  return descriptor&&Object.hasOwn(descriptor,'value')?descriptor.value:undefined;
}
function plain(object){
  if(!object||typeof object!=='object')return false;
  const prototype=Object.getPrototypeOf(object);return prototype===Object.prototype||prototype===null;
}
function canvasSize(image){
  for(const Constructor of [globalThis.HTMLCanvasElement,globalThis.OffscreenCanvas]){
    if(typeof Constructor!=='function'||!(image instanceof Constructor))continue;
    const read=key=>{
      const descriptor=Object.getOwnPropertyDescriptor(Constructor.prototype,key);
      if(descriptor&&typeof descriptor.get==='function'){
        if(Object.getOwnPropertyDescriptor(image,key))return undefined;
        return descriptor.get.call(image);
      }
      // Controlled CPU ports may provide a canvas brand with own-data dimensions.
      return own(image,key);
    };
    const width=read('width'),height=read('height');
    return Number.isSafeInteger(width)&&width>0&&Number.isSafeInteger(height)&&height>0?{width,height}:null;
  }
  return null;
}
function packedCurrent(record,input){
  try{
    if(!input||!input.packed||!plain(input.atlasOwner)||!plain(input.frameOwner))return false;
    if(PACKED_INPUTS.some(key=>own(input.inputOwner,key)!==input.owners[key]))return false;
    const atlas=input.borrowedAtlas,source=input.sourceFrame,size=canvasSize(record.image);
    if(!size||size.width!==record.imageWidth||size.height!==record.imageHeight)return false;
    if(own(input.atlasOwner,'image')!==record.image||own(input.atlasOwner,'generation')!==record.atlasGeneration||own(input.atlasOwner,'width')!==record.imageWidth||own(input.atlasOwner,'height')!==record.imageHeight)return false;
    if(atlas.image!==record.image||atlas.generation!==record.atlasGeneration||atlas.width!==record.imageWidth||atlas.height!==record.imageHeight)return false;
    if(input.animator!==record.animator||input.frameMap!==record.frameMap||own(record.actor,'_sa')!==record.animator||own(record.animator,'img')!==record.image||own(record.animator,'fm')!==record.frameMap)return false;
    const native=input.native;
    if(!native||own(record.animator,'anim')!==source.mode||own(record.animator,'f')!==source.index||own(record.frameMap,native.key)!==native.frames||!Array.isArray(native.frames)||own(native.frames,'length')!==source.count||own(native.frames,String(source.index))!==native.cell)return false;
    if(!plain(native.cell)||!['x','y','w','h'].every(key=>own(native.cell,key)===source[key]))return false;
    return PACKED_FIELDS.every(key=>own(input.frameOwner,key)===source[key]);
  }catch(_){return false;}
}
function capture(input){
  try{
    const value={};for(const key of INPUT_FIELDS)value[key]=own(input,key);
    if(value.stage!==0||!Array.isArray(value.map)||value.map.length!==200||!value.actor||typeof value.actor!=='object')return null;
    if((value.id!=='warrior'&&value.id!=='silvertail')||!MODES.includes(value.mode)||!Number.isInteger(value.direction)||value.direction<0||value.direction>7)return null;
    if(typeof value.phase!=='number'||!Number.isFinite(value.phase)||value.phase<0||value.phase>1)return null;
    if(typeof value.heightWorld!=='number'||!Number.isFinite(value.heightWorld)||value.heightWorld<=0)return null;
    if(typeof value.backingScale!=='number'||!Number.isFinite(value.backingScale)||value.backingScale<=0||value.backingScale>CH1_PLAYER_RIG.maxBackingScale)return null;
    if(typeof value.dt!=='number'||!Number.isFinite(value.dt)||value.dt<0)return null;
    const owners={};let packed=false;
    for(const key of PACKED_INPUTS){
      const descriptor=Object.getOwnPropertyDescriptor(input,key);
      if(descriptor&&!Object.hasOwn(descriptor,'value'))return null;
      owners[key]=descriptor?.value;if(owners[key]!==undefined)packed=true;
    }
    value.packed=packed;
    if(packed){
      const atlasOwner=owners.borrowedAtlas,frameOwner=owners.sourceFrame;
      if(value.id!=='silvertail'||value.heightWorld!==45||!['idle','walk','run'].includes(value.mode)||!plain(atlasOwner)||!plain(frameOwner))return null;
      const borrowedAtlas={image:own(atlasOwner,'image'),width:own(atlasOwner,'width'),height:own(atlasOwner,'height'),generation:own(atlasOwner,'generation')};
      if(!borrowedAtlas.generation||typeof borrowedAtlas.generation!=='object'||!owners.animator||typeof owners.animator!=='object'||!owners.frameMap||typeof owners.frameMap!=='object')return null;
      const size=canvasSize(borrowedAtlas.image);
      if(!size||size.width!==borrowedAtlas.width||size.height!==borrowedAtlas.height)return null;
      const sourceFrame={};for(const key of PACKED_FIELDS)sourceFrame[key]=own(frameOwner,key);
      const count=value.mode==='idle'?2:4,index=Math.min(count-1,Math.floor(value.phase*count));
      if(sourceFrame.generation!==borrowedAtlas.generation||sourceFrame.mode!==value.mode||sourceFrame.direction!==value.direction||sourceFrame.index!==index||sourceFrame.count!==count)return null;
      if(!['x','y','w','h'].every(key=>Number.isSafeInteger(sourceFrame[key]))||sourceFrame.x<0||sourceFrame.y<0||sourceFrame.w!==48||sourceFrame.h!==48||sourceFrame.x+48>size.width||sourceFrame.y+48>size.height)return null;
      if(sourceFrame.anchorX!==24||sourceFrame.anchorY!==47||sourceFrame.referenceHeight!==45)return null;
      const key=value.mode+'_'+PACKED_DIRECTIONS[value.direction],frames=own(owners.frameMap,key),cell=own(frames,String(index));
      const native=Object.freeze({key,frames,cell});
      Object.assign(value,{borrowedAtlas:Object.freeze(borrowedAtlas),sourceFrame:Object.freeze(sourceFrame),animator:owners.animator,frameMap:owners.frameMap,
        inputOwner:input,atlasOwner,frameOwner,owners:Object.freeze(owners),native});
      const record={actor:value.actor,image:borrowedAtlas.image,imageWidth:size.width,imageHeight:size.height,atlasGeneration:borrowedAtlas.generation,animator:value.animator,frameMap:value.frameMap};
      if(!packedCurrent(record,value))return null;
    }
    value.dt=Math.min(CH1_PLAYER_RIG.maxDelta,value.dt);return Object.freeze(value);
  }catch(_){return null;}
}
function publication(rig,input){
  const state=rig.snapshot(),pose=own(state,'posePublication');
  if(!pose||!Object.isFrozen(pose)||own(pose,'mode')!==input.mode||own(pose,'direction')!==input.direction||own(pose,'normalizedPhase')!==input.phase)return null;
  if(input.packed){
    const source=own(pose,'source');
    if(own(state,'sourceKind')!=='borrowed-main-atlas'||own(state,'sourcePath')!==PACKED_PATH||own(pose,'frame')!==input.sourceFrame.index||!Number.isFinite(own(pose,'elapsed'))||!source||!Object.isFrozen(source)||own(source,'path')!==PACKED_PATH)return null;
    return PACKED_FIELDS.every(key=>own(source,key)===input.sourceFrame[key])?pose:null;
  }
  const count=CHARACTER_RIG_CATALOG[input.id].frames[input.mode],index=Math.min(count-1,Math.floor(input.phase*count));
  if(own(pose,'frame')!==index||!Number.isFinite(own(pose,'elapsed')))return null;
  const source=own(pose,'source'),expected=characterRigFrame(input.id,input.mode,input.direction,index);
  if(!source||!Object.isFrozen(source)||FRAME_FIELDS.some(key=>own(source,key)!==expected[key]))return null;
  return pose;
}

export function createCh1PlayerRig(){
  if(THREE.REVISION!=='160')throw new Error('CH1 player requires local Three r160');
  const canvas=document.createElement('canvas'),scene=new THREE.Scene();
  const releasedRigs=new WeakSet(),releasedRenderers=new WeakSet();
  const stats={renderAttempts:0,frames:0,fallbacks:0,loadStarts:0,loadCompletes:0,loadFailures:0,lateRigReleases:0,
    rigDisposeAttempts:0,rigDisposes:0,rendererCreates:0,rendererDisposeAttempts:0,rendererDisposes:0,cleanupFailures:0};
  let disposed=false,failed=false,lost=false,shaderFailed=false,renderer=null,camera=null,current=null;
  let generation=0,token={},renderJob=null,frame=null,lastFrame=null,reason='awaiting-main-body';
  function nextToken(){token={};generation=Math.min(Number.MAX_SAFE_INTEGER,generation+1);renderJob=null;frame=null;lastFrame=null;}
  function releaseRig(rig,late=false){
    if(!rig||releasedRigs.has(rig))return;
    releasedRigs.add(rig);bump(stats,'rigDisposeAttempts');if(late)bump(stats,'lateRigReleases');
    try{if(rig.object3d?.parent===scene)scene.remove(rig.object3d);}catch(_){bump(stats,'cleanupFailures');}
    try{rig.dispose();bump(stats,'rigDisposes');}catch(_){bump(stats,'cleanupFailures');}
  }
  function releaseRenderer(){
    const owned=renderer;renderer=null;camera=null;
    if(!owned||releasedRenderers.has(owned))return;
    releasedRenderers.add(owned);bump(stats,'rendererDisposeAttempts');
    try{owned.dispose();bump(stats,'rendererDisposes');}catch(_){bump(stats,'cleanupFailures');}
  }
  function retire(why){
    const old=current;current=null;nextToken();reason=why;
    const retiredToken=token;
    if(old){old.state='closed';const rig=old.rig;old.rig=null;releaseRig(rig);}
    return retiredToken;
  }
  function owns(record,job){return !disposed&&!failed&&!lost&&current===record&&record.token===token&&(!job||renderJob===job);}
  function isCurrent(record,job){
    if(!owns(record,job))return false;
    if(record.packed&&!packedCurrent(record,job?.input||record.input))return false;
    if(record.packed&&job?.pose){
      if(own(record.rig.snapshot(),'posePublication')!==job.pose)return false;
      if(!packedCurrent(record,job.input))return false;
    }
    return owns(record,job);
  }
  function matches(record,input){
    if(!record||record.map!==input.map||record.actor!==input.actor||record.id!==input.id||record.packed!==input.packed)return false;
    return !input.packed||(record.animator===input.animator&&record.frameMap===input.frameMap&&record.image===input.borrowedAtlas.image&&record.atlasGeneration===input.borrowedAtlas.generation&&record.imageWidth===input.borrowedAtlas.width&&record.imageHeight===input.borrowedAtlas.height);
  }
  function reject(why){bump(stats,'fallbacks');reason=why;return null;}
  function fatal(why,record,job){
    if(disposed||current!==record||record.token!==token||(job&&renderJob!==job))return null;
    if(record.packed&&!packedCurrent(record,job?.input||record.input))return null;
    failed=true;retire(why);releaseRenderer();return null;
  }
  function onLost(){
    if(disposed)return;
    // Revoke publication inside the event, but let the render stack unwind before release.
    lost=true;nextToken();reason='context-lost';
  }
  canvas.addEventListener('webglcontextlost',onLost);
  function begin(input){
    const retiredToken=retire('rig-loading');
    if(disposed||failed||lost||token!==retiredToken)return null;
    const record={token,id:input.id,map:input.map,actor:input.actor,state:'loading',rig:null,packed:input.packed,input,
      animator:input.animator,frameMap:input.frameMap,image:input.borrowedAtlas?.image,atlasGeneration:input.borrowedAtlas?.generation,
      imageWidth:input.borrowedAtlas?.width,imageHeight:input.borrowedAtlas?.height};current=record;
    bump(stats,'loadStarts');
    try{
      createCharacterRig(input.id,{THREE,height:CH1_PLAYER_RIG.rigHeight,...(input.packed?{borrowedAtlas:input.borrowedAtlas}:{})}).then(rig=>{
        if(!isCurrent(record)){if(owns(record))retire('packed-owner-changed');releaseRig(rig,true);return;}
        try{
          record.rig=rig;scene.add(rig.object3d);
          if(!isCurrent(record)){if(owns(record))retire('packed-owner-changed');releaseRig(rig,true);return;}
          record.state='ready';bump(stats,'loadCompletes');reason='rig-ready';
        }catch(_){
          releaseRig(rig);record.rig=null;
          if(isCurrent(record)){record.state='error';bump(stats,'loadFailures');reason='rig-load-failed';}
        }
      },()=>{if(isCurrent(record)){record.state='error';bump(stats,'loadFailures');reason='rig-load-failed';}});
    }catch(_){if(isCurrent(record)){record.state='error';bump(stats,'loadFailures');reason='rig-load-failed';}}
    return record;
  }
  function ensureRenderer(){
    if(renderer)return;
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true,powerPreference:'default'});
    bump(stats,'rendererCreates');renderer.debug.checkShaderErrors=true;renderer.debug.onShaderError=()=>{shaderFailed=true;};
    renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);
    camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,100);
  }
  function boundsFor(record,job){
    const root=record.rig.object3d,meshes=[];root.updateMatrixWorld(true);
    if(!isCurrent(record,job))return null;
    root.traverse(object=>{if(object.isSkinnedMesh&&object.visible)meshes.push(object);});
    if(meshes.length!==1||!root.visible)return null;
    const mesh=meshes[0],positions=mesh.geometry.getAttribute('position'),vector=new THREE.Vector3();
    if(!positions||!Number.isSafeInteger(positions.count)||positions.count<1)return null;
    const box=new THREE.Box3();
    for(let i=0;i<positions.count;i++){
      mesh.getVertexPosition(i,vector);
      if(!isCurrent(record,job))return null;
      vector.applyMatrix4(mesh.matrixWorld);
      if(![vector.x,vector.y,vector.z].every(Number.isFinite))return null;
      box.expandByPoint(vector);
    }
    if(!isCurrent(record,job)||box.isEmpty()||box.max.x<=box.min.x||box.max.y<=box.min.y)return null;
    return {box,vertices:positions.count};
  }
  function render(input){
    bump(stats,'renderAttempts');frame=null;
    if(disposed)return reject('disposed');
    if(lost){retire('context-lost');releaseRenderer();return reject('context-lost');}
    if(failed)return reject('renderer-failed');
    const value=capture(input);
    if(!value){retire('unsupported-main-body');return reject('unsupported-main-body');}
    let record=current;
    if(!matches(record,value))record=begin(value);
    if(!record||!owns(record))return null;
    record.input=value;
    if(!isCurrent(record))return null;
    if(record.state==='loading')return reject('rig-loading');
    if(record.state!=='ready'||!record.rig)return reject('rig-load-failed');
    const job={input:value};renderJob=job;
    try{
      record.rig.update(value.dt,{mode:value.mode,direction:value.direction,phase:value.phase,...(value.packed?{sourceFrame:value.sourceFrame}:{})});
      if(!isCurrent(record,job))return null;
      const pose=publication(record.rig,value);
      if(!isCurrent(record,job))return null;
      if(!pose)return fatal('pose-publication-unavailable',record,job);
      if(value.packed)job.pose=pose;
      const bounds=boundsFor(record,job);
      if(!isCurrent(record,job))return null;
      if(!bounds)return fatal('deformed-bounds-unavailable',record,job);
      if(publication(record.rig,value)!==pose)return fatal('pose-publication-changed',record,job);
      if(!isCurrent(record,job))return null;
      const {min,max}=bounds.box,padding=CH1_PLAYER_RIG.paddingLocal;
      const left=min.x*value.heightWorld-padding,top=-max.y*value.heightWorld-padding;
      const width=(max.x-min.x)*value.heightWorld+2*padding,height=(max.y-min.y)*value.heightWorld+2*padding;
      const pixelWidth=Math.ceil(width*value.backingScale),pixelHeight=Math.ceil(height*value.backingScale);
      if(![left,top,width,height,pixelWidth,pixelHeight].every(Number.isFinite)||pixelWidth<1||pixelHeight<1||pixelWidth>CH1_PLAYER_RIG.maxBackingDimension||pixelHeight>CH1_PLAYER_RIG.maxBackingDimension)return reject('backing-budget');
      ensureRenderer();if(!isCurrent(record,job))return null;
      if(canvas.width!==pixelWidth||canvas.height!==pixelHeight)renderer.setSize(pixelWidth,pixelHeight,false);
      if(!isCurrent(record,job))return null;
      const sceneWidth=width/value.heightWorld,sceneHeight=height/value.heightWorld;
      const centerX=(min.x+max.x)/2,centerY=(min.y+max.y)/2;
      camera.left=-sceneWidth/2;camera.right=sceneWidth/2;camera.top=sceneHeight/2;camera.bottom=-sceneHeight/2;
      camera.near=.01;camera.far=Math.max(100,max.z-min.z+20);camera.position.set(centerX,centerY,max.z+10);
      camera.up.set(0,1,0);camera.lookAt(centerX,centerY,min.z);camera.updateProjectionMatrix();
      if(!isCurrent(record,job))return null;
      renderer.render(scene,camera);
      if(!isCurrent(record,job))return null;
      const gl=renderer.getContext();
      if(shaderFailed||lost||gl.isContextLost()||gl.getError()!==gl.NO_ERROR)return fatal(shaderFailed?'shader-failed':'renderer-failed',record,job);
      if(!isCurrent(record,job))return null;
      if(publication(record.rig,value)!==pose)return fatal('pose-publication-changed',record,job);
      if(!isCurrent(record,job))return null;
      canvas._glVer=(canvas._glVer||0)+1;bump(stats,'frames');reason='ready';
      lastFrame=Object.freeze({id:value.id,mode:value.mode,direction:value.direction,phase:value.phase,frame:own(pose,'frame'),elapsed:own(pose,'elapsed'),
        left,top,width,height,pixelWidth,pixelHeight,vertices:bounds.vertices,heightLocal:value.heightWorld,backingScale:value.backingScale,delta:value.dt,posePublicationMatched:true,
        sourceKind:value.packed?'borrowed-main-atlas':'catalog-assets',sourcePath:value.packed?PACKED_PATH:own(own(pose,'source'),'path'),
        packedSource:value.packed?Object.freeze({path:PACKED_PATH,...value.sourceFrame}):null});
      frame=Object.freeze({canvas,left,top,width,height});return frame;
    }catch(_){return fatal('rig-render-failed',record,job);}
    finally{
      if(renderJob===job)renderJob=null;
      if(lost&&current===record){retire('context-lost');releaseRenderer();}
    }
  }
  function suspend(){if(disposed)return false;retire('inactive-main-body');return true;}
  function snapshot(){return Object.freeze({...stats,ready:reason==='ready'&&!!frame&&!disposed&&!failed&&!lost,reason,disposed,failed,lost,generation,
    loadState:current?.state||'none',id:current?.id||null,rigReady:!!current?.rig,renderOwnerActive:!!renderJob,lastFrame,
    sourceKind:current?(current.packed?'borrowed-main-atlas':'catalog-assets'):null,sourcePath:current?.packed?PACKED_PATH:null,
    borrowedPixelsGenerationRequired:!!current?.packed,borrowedSameCanvasPixelMutationAccepted:false,
    groundHeight:0,heightSpace:'parent-body-local-reference',ownsRAF:false,ownsSimulation:false,ownsImages:false,
    actualReliefAccepted:false,full3DPlayerAccepted:false,mainPlayableAccepted:false});}
  function dispose(){
    if(disposed)return false;disposed=true;retire('disposed');
    try{canvas.removeEventListener('webglcontextlost',onLost);}catch(_){bump(stats,'cleanupFailures');}
    releaseRenderer();return true;
  }
  return Object.freeze({canvas,render,suspend,snapshot,dispose});
}
