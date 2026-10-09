/* ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007
 * Main body-only display adapter. Caller owns P/G, movement, phase and the existing
 * body-local X transform. Returned rectangles are relative to the calibrated foot (0,0).
 * Players and the normal Druid boss use their original directional artwork.
 */
import * as THREE from '../../assets/vendor/three-r160/build/three.module.js';
import {createCharacterRig} from './character-rigs.mjs?v=locomotion-phase-20261009-v9';
import {prepareRigMotion} from '../engine/rig-motion.mjs?v=20261009-v1';
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
const SHEET_PATH='borrowed:dark-druid-main-sheet';
const SHEET_FIELDS=Object.freeze(['image','width','height','generation','decodedGeneration','srcSnapshot','currentSrcSnapshot','srcsetSnapshot','sizesSnapshot']);
const SHEET_FRAME_FIELDS=Object.freeze(['generation','lifeGeneration','sheet','mode','direction','index','count','sourceCol','sourceRow','columns','rows','x','y','w','h','anchorX','anchorY','referenceHeight']);
const DRUID_OWNER_FIELDS=Object.freeze(['active','game','enemies','map','actor','lifeGeneration','sheetRecord','imageGeneration','selectedFrame','state','deaths','bossPhase','lastStand','defeated','pending']);
const DRUID_ACTOR_FIELDS=Object.freeze(['ib','alive','hp','s','deaths','_bossPhase','_druidLastStand','_druidDefeated','_reviveTimer','stunned','_isTail','facing','vx','vy','st2','_sweepDir']);
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
function dataRecord(object,fields){
  if(!object||typeof object!=='object')return null;
  const copy={};
  for(const key of fields){
    const descriptor=Object.getOwnPropertyDescriptor(object,key);
    if(descriptor&&!Object.hasOwn(descriptor,'value'))return null;
    copy[key]=descriptor?.value;
  }
  return copy;
}
function imageSheet(image){
  const Constructor=globalThis.HTMLImageElement;
  if(typeof Constructor!=='function'||!(image instanceof Constructor))return null;
  const read=key=>{
    const descriptor=Object.getOwnPropertyDescriptor(Constructor.prototype,key);
    if(descriptor&&typeof descriptor.get==='function'){
      if(Object.getOwnPropertyDescriptor(image,key))return undefined;
      return descriptor.get.call(image);
    }
    return own(image,key);
  };
  const complete=read('complete'),width=read('naturalWidth'),height=read('naturalHeight');
  const srcSnapshot=read('src'),currentSrcSnapshot=read('currentSrc'),srcsetSnapshot=read('srcset'),sizesSnapshot=read('sizes');
  if(complete!==true||!Number.isSafeInteger(width)||width<1||!Number.isSafeInteger(height)||height<1||![srcSnapshot,currentSrcSnapshot,srcsetSnapshot,sizesSnapshot].every(v=>typeof v==='string'))return null;
  return {width,height,srcSnapshot,currentSrcSnapshot,srcsetSnapshot,sizesSnapshot};
}
function druidPose(actor,sourceFrame){
  const a=dataRecord(actor,DRUID_ACTOR_FIELDS);if(!a)return null;
  const number=value=>value===undefined?0:typeof value==='number'&&Number.isFinite(value)?value:null;
  const flag=value=>value===undefined?false:typeof value==='boolean'?value:null;
  const deaths=number(a.deaths),bossPhase=number(a._bossPhase),lastStand=flag(a._druidLastStand),defeated=flag(a._druidDefeated),tail=flag(a._isTail);
  const pending=number(a._reviveTimer),stunned=number(a.stunned),facing=number(a.facing),vx=number(a.vx),vy=number(a.vy),state=a.s;
  if(a.ib!==true||a.alive!==true||typeof a.hp!=='number'||!Number.isFinite(a.hp)||a.hp<=0||typeof state!=='string'||!state||![deaths,bossPhase].every(v=>Number.isSafeInteger(v)&&v>=0)||[lastStand,defeated,tail,pending,stunned,facing,vx,vy].some(v=>v===null)||defeated||pending>0||stunned>0||['eDeath','eHit','eKB','eStagger'].includes(state))return null;
  const bur=state==='bossTelePrep'||state==='bossTeleWarn',dive=['bossDruidDive','bossDruidUnder','bossDruidErupt'].includes(state);
  const chargeWind=state.includes('Wind')&&(state.includes('Charge')||state.includes('Jump')||state.includes('Dash'));
  const charge=!chargeWind&&(state==='bossJump'||state.includes('Charge')||state.includes('charge')||state.includes('Dash')||state.includes('multiDash'));
  if(bur||dive||chargeWind||charge)return null;
  let key='idle';
  if(state.includes('Slam')||state==='bossJump'||state.includes('Meteor'))key='slam';
  else if(tail||['Slash','Sweep','Spin','Charge','Dash'].some(s=>state.includes(s)))key='slash';
  else if(['Wind','Aim','Hold'].some(s=>state.includes(s))||state==='eWindup')key='windup';
  else if(['eWalk','eChase','eApproach','bossRec'].includes(state))key='walk';
  const mode=['slash','slam','windup'].includes(key)||state==='bossDruidVolleyWind'||state==='bossDruidVolley'||(state==='recover'&&sourceFrame?.sheet==='attack'&&[2,3].includes(sourceFrame.index))?'attack':key==='walk'?'walk':'idle';
  const angle=['eWalk','eChase','eApproach'].includes(state)&&(vx||vy)?Math.atan2(vy,vx):facing;
  const nativeDir=[6,7,0,1,2,3,4,5][((Math.round(angle/(Math.PI/4))%8)+8)%8];
  const countdown=number(a.st2),sweepDirection=number(a._sweepDir);
  if(countdown===null||sweepDirection===null)return null;
  const motionPhase=state==='bossSlam'?Math.max(0,Math.min(1,1-countdown/8)):state==='bossSweep'?Math.max(0,Math.min(1,1-countdown/14)):state==='recover'?Math.max(0,Math.min(1,1-countdown/20)):null;
  return {state,deaths,bossPhase,lastStand,defeated,pending:false,mode,nativeDir,motionPhase,windRemaining:['bossSlamWind','bossSweepWind'].includes(state)?countdown:null,sweepDirection:sweepDirection<0?-1:1};
}
function sheetFrameValid(sheet,source,input){
  if(!plain(sheet.generation)||sheet.decodedGeneration!==sheet.generation||!plain(source.lifeGeneration)||source.generation!==sheet.generation||source.mode!==input.mode||source.direction!==input.direction)return false;
  const idle=source.sheet==='base8';
  if((idle?input.mode!=='idle':!['walk','attack'].includes(source.sheet)||input.mode!==source.sheet)||sheet.width!==(idle?1656:887)||sheet.height!==(idle?1240:1774))return false;
  const count=idle?1:4,nativeDir=(8-input.direction)%8;
  if(!Number.isInteger(source.index)||source.index<0||source.index>=count||source.count!==count||input.phase!==(source.index+.5)/count||source.columns!==4||source.rows!==(idle?2:8)||source.sourceCol!==(idle?nativeDir%4:source.index)||source.sourceRow!==(idle?Math.floor(nativeDir/4):nativeDir))return false;
  const x=Math.round(source.sourceCol*sheet.width/4),y=Math.round(source.sourceRow*sheet.height/source.rows);
  const w=Math.round((source.sourceCol+1)*sheet.width/4)-x,h=Math.round((source.sourceRow+1)*sheet.height/source.rows)-y;
  return source.x===x&&source.y===y&&source.w===w&&source.h===h&&source.anchorX===(idle?207:w/2)&&source.anchorY===(idle?603:h)&&source.referenceHeight===(idle?591:h);
}
function sheetCurrent(record,input){
  try{
    if(!input?.sheetBorrowed||!plain(input.sheetOwner)||!plain(input.frameOwner)||!plain(input.owner))return false;
    if(own(input.inputOwner,'borrowedSheet')!==input.sheetOwner||own(input.inputOwner,'sourceFrame')!==input.frameOwner||own(input.inputOwner,'owner')!==record.owner)return false;
    const sheet=input.borrowedSheet,source=input.sourceFrame,owner=dataRecord(record.owner,DRUID_OWNER_FIELDS),game=dataRecord(record.game,['stage','map','mw','mh','on','_bossArena']);
    if(!owner||!game||owner.active!==true||owner.game!==record.game||owner.enemies!==record.enemies||owner.map!==record.map||owner.actor!==record.actor||owner.lifeGeneration!==record.lifeGeneration||owner.imageGeneration!==record.sheetGeneration||owner.sheetRecord!==record.sheetRecord||owner.selectedFrame!==input.frameOwner||owner.state!==input.actorPose.state)return false;
    if(game.stage!==0||game.on!==true||game.map!==record.map)return false;
    const arena=game._bossArena===true;
    if(game._bossArena!==undefined&&typeof game._bossArena!=='boolean')return false;
    if(game.mw!==(arena?128:200)||game.mh!==(arena?108:200)||own(record.map,'length')!==game.mh||own(record.map,'0')===undefined||own(own(record.map,'0'),'length')!==game.mw)return false;
    if(!Array.isArray(record.enemies)||own(record.enemies,String(input.enemyIndex))!==record.actor)return false;
    const pose=druidPose(record.actor,input.sourceFrame);
    if(!pose||pose.state!==input.actorPose.state||pose.mode!==input.mode||pose.nativeDir!==(8-input.direction)%8||['motionPhase','windRemaining','sweepDirection'].some(key=>pose[key]!==input.actorPose[key])||['deaths','bossPhase','lastStand','defeated','pending'].some(key=>pose[key]!==input.actorPose[key]||owner[key]!==pose[key]))return false;
    if(own(record.sheetRecord,'img')!==record.image||own(record.sheetRecord,'ready')!==true)return false;
    if(SHEET_FIELDS.some(key=>own(input.sheetOwner,key)!==sheet[key])||SHEET_FRAME_FIELDS.some(key=>own(input.frameOwner,key)!==source[key]))return false;
    const nativeDir=Object.getOwnPropertyDescriptor(input.frameOwner,'nativeDir');
    if(nativeDir&&(!Object.hasOwn(nativeDir,'value')||nativeDir.value!==pose.nativeDir))return false;
    const actual=imageSheet(record.image);
    return !!actual&&sheet.image===record.image&&sheet.generation===record.sheetGeneration&&source.lifeGeneration===record.lifeGeneration&&['width','height','srcSnapshot','currentSrcSnapshot','srcsetSnapshot','sizesSnapshot'].every(key=>actual[key]===sheet[key]);
  }catch(_){return false;}
}
function captureSheet(input){
  const value={};for(const key of INPUT_FIELDS)value[key]=own(input,key);
  if(value.id!=='dark-druid'||value.stage!==0||!Array.isArray(value.map)||!value.actor||typeof value.actor!=='object'||!['idle','walk','attack'].includes(value.mode)||!Number.isInteger(value.direction)||value.direction<0||value.direction>7||!Number.isFinite(value.phase)||!Number.isFinite(value.heightWorld)||value.heightWorld<=0||!Number.isFinite(value.backingScale)||value.backingScale<=0||value.backingScale>CH1_PLAYER_RIG.maxBackingScale||!Number.isFinite(value.dt)||value.dt<0)return null;
  for(const key of ['borrowedAtlas','animator','frameMap']){
    const descriptor=Object.getOwnPropertyDescriptor(input,key);if(descriptor&&(!Object.hasOwn(descriptor,'value')||descriptor.value!==undefined))return null;
  }
  const sheetOwner=own(input,'borrowedSheet'),frameOwner=own(input,'sourceFrame'),owner=own(input,'owner');
  if(!plain(sheetOwner)||!plain(frameOwner)||!plain(owner))return null;
  const borrowedSheet=dataRecord(sheetOwner,SHEET_FIELDS),sourceFrame=dataRecord(frameOwner,SHEET_FRAME_FIELDS),ownership=dataRecord(owner,DRUID_OWNER_FIELDS),actorPose=druidPose(value.actor,sourceFrame);
  if(!borrowedSheet||!sourceFrame||!ownership||!actorPose||!sheetFrameValid(borrowedSheet,sourceFrame,value)||ownership.selectedFrame!==frameOwner||ownership.actor!==value.actor||ownership.map!==value.map||ownership.lifeGeneration!==sourceFrame.lifeGeneration)return null;
  const enemies=ownership.enemies,length=own(enemies,'length');if(!Array.isArray(enemies)||!Number.isSafeInteger(length))return null;
  let enemyIndex=-1;for(let i=0;i<length;i++)if(own(enemies,String(i))===value.actor){enemyIndex=i;break;}if(enemyIndex<0)return null;
  Object.assign(value,{packed:false,sheetBorrowed:true,borrowedSheet:Object.freeze(borrowedSheet),sourceFrame:Object.freeze(sourceFrame),ownership:Object.freeze(ownership),
    owner,sheetOwner,frameOwner,inputOwner:input,actorPose:Object.freeze(actorPose),enemyIndex});
  const record={owner,game:ownership.game,enemies,map:value.map,actor:value.actor,lifeGeneration:sourceFrame.lifeGeneration,sheetRecord:ownership.sheetRecord,image:borrowedSheet.image,sheetGeneration:borrowedSheet.generation};
  if(!sheetCurrent(record,value))return null;
  value.dt=Math.min(CH1_PLAYER_RIG.maxDelta,value.dt);return Object.freeze(value);
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
    if(!native||own(record.animator,'anim')!==native.anim||own(record.animator,'f')!==source.index||own(record.frameMap,native.key)!==native.frames||!Array.isArray(native.frames)||own(native.frames,'length')!==source.count||own(native.frames,String(source.index))!==native.cell)return false;
    if(!plain(native.cell)||!['x','y','w','h'].every(key=>own(native.cell,key)===source[key]))return false;
    return PACKED_FIELDS.every(key=>own(input.frameOwner,key)===source[key]);
  }catch(_){return false;}
}
function capture(input){
  try{
    if(own(input,'id')==='dark-druid')return captureMotion(input,captureSheet(input));
    const borrowedSheet=Object.getOwnPropertyDescriptor(input,'borrowedSheet');
    if(borrowedSheet&&(!Object.hasOwn(borrowedSheet,'value')||borrowedSheet.value!==undefined))return null;
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
      if(value.id!=='silvertail'||value.heightWorld!==45||!['idle','walk','run','attack'].includes(value.mode)||!plain(atlasOwner)||!plain(frameOwner))return null;
      const borrowedAtlas={image:own(atlasOwner,'image'),width:own(atlasOwner,'width'),height:own(atlasOwner,'height'),generation:own(atlasOwner,'generation')};
      if(!borrowedAtlas.generation||typeof borrowedAtlas.generation!=='object'||!owners.animator||typeof owners.animator!=='object'||!owners.frameMap||typeof owners.frameMap!=='object')return null;
      const size=canvasSize(borrowedAtlas.image);
      if(!size||size.width!==borrowedAtlas.width||size.height!==borrowedAtlas.height)return null;
      const sourceFrame={};for(const key of PACKED_FIELDS)sourceFrame[key]=own(frameOwner,key);
      const attack=value.mode==='attack',count=attack?9:value.mode==='idle'?2:4,cellSize=attack?80:48,index=Math.min(count-1,Math.floor(value.phase*count));
      if(sourceFrame.generation!==borrowedAtlas.generation||sourceFrame.mode!==value.mode||sourceFrame.direction!==value.direction||sourceFrame.index!==index||sourceFrame.count!==count)return null;
      if(!['x','y','w','h'].every(key=>Number.isSafeInteger(sourceFrame[key]))||sourceFrame.x<0||sourceFrame.y<0||sourceFrame.w!==cellSize||sourceFrame.h!==cellSize||sourceFrame.x+cellSize>size.width||sourceFrame.y+cellSize>size.height)return null;
      if(sourceFrame.anchorX!==(attack?40:24)||sourceFrame.anchorY!==(attack?40:47)||sourceFrame.referenceHeight!==45)return null;
      const anim=own(owners.animator,'anim');
      if(attack?!['atk2','atk3'].includes(anim):anim!==value.mode)return null;
      const key=anim+'_'+PACKED_DIRECTIONS[value.direction],frames=own(owners.frameMap,key),cell=own(frames,String(index));
      const native=Object.freeze({anim,key,frames,cell});
      Object.assign(value,{borrowedAtlas:Object.freeze(borrowedAtlas),sourceFrame:Object.freeze(sourceFrame),animator:owners.animator,frameMap:owners.frameMap,
        inputOwner:input,atlasOwner,frameOwner,owners:Object.freeze(owners),native});
      const record={actor:value.actor,image:borrowedAtlas.image,imageWidth:size.width,imageHeight:size.height,atlasGeneration:borrowedAtlas.generation,animator:value.animator,frameMap:value.frameMap};
      if(!packedCurrent(record,value))return null;
    }
    value.dt=Math.min(CH1_PLAYER_RIG.maxDelta,value.dt);return captureMotion(input,Object.freeze(value));
  }catch(_){return null;}
}
function captureMotion(input,value){
  if(!value)return null;
  const descriptor=Object.getOwnPropertyDescriptor(input,'authoredMotion');
  if(descriptor&&!Object.hasOwn(descriptor,'value'))return null;
  const source=descriptor?.value;
  const prepared=prepareRigMotion(source,{height:CH1_PLAYER_RIG.rigHeight,rootTarget:`${value.id}-object`,artworkOnly:!!(value.packed||value.sheetBorrowed)});
  const authoredMotion=prepared?Object.freeze({clip:prepared.sourceClip,authoredHeight:prepared.authoredHeight,time:prepared.time}):undefined;
  return Object.freeze({...value,authoredMotion,motionInput:input,motionOwner:source,motionClip:prepared?own(source,'clip'):undefined});
}
function motionCurrent(input){
  if(!input||own(input.motionInput,'authoredMotion')!==input.motionOwner)return false;
  return !input.authoredMotion||(own(input.motionOwner,'clip')===input.motionClip&&own(input.motionOwner,'time')===input.authoredMotion.time&&own(input.motionOwner,'authoredHeight')===input.authoredMotion.authoredHeight);
}
function publication(rig,input){
  const state=rig.snapshot(),pose=own(state,'posePublication');
  if(!pose||!Object.isFrozen(pose)||own(pose,'mode')!==input.mode||own(pose,'direction')!==input.direction||own(pose,'normalizedPhase')!==input.phase)return null;
  if(input.sheetBorrowed){
    const source=own(pose,'source');
    if(own(state,'sourceKind')!=='borrowed-main-sheet'||own(state,'sourcePath')!==SHEET_PATH||own(pose,'frame')!==input.sourceFrame.index||!Number.isFinite(own(pose,'elapsed'))||!source||!Object.isFrozen(source)||own(source,'path')!==SHEET_PATH)return null;
    return SHEET_FRAME_FIELDS.every(key=>own(source,key)===input.sourceFrame[key])?pose:null;
  }
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
    if(!motionCurrent(job?.input||record.input))return false;
    if(record.packed&&!packedCurrent(record,job?.input||record.input))return false;
    if(record.sheetBorrowed&&!sheetCurrent(record,job?.input||record.input))return false;
    if((record.packed||record.sheetBorrowed)&&job?.pose){
      if(own(record.rig.snapshot(),'posePublication')!==job.pose)return false;
      if(record.packed?!packedCurrent(record,job.input):!sheetCurrent(record,job.input))return false;
    }
    return owns(record,job);
  }
  function matches(record,input){
    if(!record||record.map!==input.map||record.actor!==input.actor||record.id!==input.id||record.packed!==input.packed)return false;
    if(!!record.sheetBorrowed!==!!input.sheetBorrowed)return false;
    if(input.sheetBorrowed)return record.owner===input.owner&&record.game===input.ownership.game&&record.enemies===input.ownership.enemies&&record.sheetRecord===input.ownership.sheetRecord&&record.lifeGeneration===input.sourceFrame.lifeGeneration&&record.sheetName===input.sourceFrame.sheet&&record.sheetGeneration===input.borrowedSheet.generation&&record.image===input.borrowedSheet.image&&SHEET_FIELDS.every(key=>record.borrowedSheet[key]===input.borrowedSheet[key]);
    return !input.packed||(record.animator===input.animator&&record.frameMap===input.frameMap&&record.image===input.borrowedAtlas.image&&record.atlasGeneration===input.borrowedAtlas.generation&&record.imageWidth===input.borrowedAtlas.width&&record.imageHeight===input.borrowedAtlas.height);
  }
  function reject(why){bump(stats,'fallbacks');reason=why;return null;}
  function fatal(why,record,job){
    if(disposed||current!==record||record.token!==token||(job&&renderJob!==job))return null;
    if(record.packed&&!packedCurrent(record,job?.input||record.input))return null;
    if(record.sheetBorrowed&&!sheetCurrent(record,job?.input||record.input))return null;
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
    if(input.sheetBorrowed)Object.assign(record,{sheetBorrowed:true,owner:input.owner,game:input.ownership.game,enemies:input.ownership.enemies,sheetRecord:input.ownership.sheetRecord,
      image:input.borrowedSheet.image,lifeGeneration:input.sourceFrame.lifeGeneration,sheetName:input.sourceFrame.sheet,sheetGeneration:input.borrowedSheet.generation,borrowedSheet:input.borrowedSheet});
    bump(stats,'loadStarts');
    try{
      createCharacterRig(input.id,{THREE,height:CH1_PLAYER_RIG.rigHeight,...(input.packed?{borrowedAtlas:input.borrowedAtlas}:input.sheetBorrowed?{borrowedSheet:input.borrowedSheet}:{})}).then(rig=>{
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
    root.traverseVisible(object=>{if(object.isMesh&&(object.userData.excludeBounds!==true||object.userData.druidVolumeShadow===true))meshes.push(object);});
    if(!meshes.length||(!record.sheetBorrowed&&meshes.length!==1)||!root.visible)return null;
    const vector=new THREE.Vector3(),box=new THREE.Box3();let vertices=0;
    for(const mesh of meshes){
      const positions=mesh.geometry.getAttribute('position');
      if(!positions||!Number.isSafeInteger(positions.count)||positions.count<1)return null;
      vertices+=positions.count;
      if(!mesh.isSkinnedMesh){
        if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
        const part=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        if(![...part.min.toArray(),...part.max.toArray()].every(Number.isFinite)||!isCurrent(record,job))return null;
        box.union(part);continue;
      }
      for(let i=0;i<positions.count;i++){
        mesh.getVertexPosition(i,vector);
        if(!isCurrent(record,job))return null;
        vector.applyMatrix4(mesh.matrixWorld);
        if(![vector.x,vector.y,vector.z].every(Number.isFinite))return null;
        box.expandByPoint(vector);
      }
    }
    if(!isCurrent(record,job)||box.isEmpty()||box.max.x<=box.min.x||box.max.y<=box.min.y)return null;
    return {box,vertices};
  }
  function render(input){
    bump(stats,'renderAttempts');frame=null;
    if(disposed)return reject('disposed');
    if(lost){retire('context-lost');releaseRenderer();return reject('context-lost');}
    if(failed)return reject('renderer-failed');
    const value=capture(input);
    if(!value){retire('unsupported-main-body');return reject('unsupported-main-body');}
    let record=current;
    if(!matches(record,value)){
      const carry=value.sheetBorrowed&&record?.sheetBorrowed&&record.map===value.map&&record.actor===value.actor&&record.owner===value.owner&&record.lifeGeneration===value.sourceFrame.lifeGeneration?record.lastDruidAction:'';
      record=begin(value);if(record&&['bossSlam','bossSweep'].includes(carry))record.lastDruidAction=carry;
    }
    if(!record||!owns(record))return null;
    record.input=value;
    if(!isCurrent(record))return null;
    if(record.state==='loading')return reject('rig-loading');
    if(record.state!=='ready'||!record.rig)return reject('rig-load-failed');
    const job={input:value};renderJob=job;
    try{
      if(value.sheetBorrowed&&value.actorPose.state!=='recover')record.lastDruidAction=['bossSlam','bossSweep'].includes(value.actorPose.state)?value.actorPose.state:'';
      let bossAnticipation=1;
      if(value.sheetBorrowed&&value.actorPose.windRemaining!==null){
        const remaining=value.actorPose.windRemaining;
        if(record.windState!==value.actorPose.state||remaining>record.windRemaining){record.windState=value.actorPose.state;record.windStart=Math.max(1,remaining);}
        record.windRemaining=remaining;bossAnticipation=Math.max(0,Math.min(1,1-remaining/record.windStart));
      }else{record.windState=null;record.windRemaining=null;}
      record.rig.update(value.dt,{mode:value.mode,direction:value.direction,phase:value.phase,authoredMotion:value.authoredMotion,...(value.sheetBorrowed?{bossState:value.actorPose.state,bossPhase:value.actorPose.motionPhase,bossAnticipation,bossRecoveryFrom:value.actorPose.state==='recover'?record.lastDruidAction:'',sweepDirection:value.actorPose.sweepDirection}:{}),...(value.packed||value.sheetBorrowed?{sourceFrame:value.sourceFrame}:{})});
      if(!isCurrent(record,job))return null;
      const pose=publication(record.rig,value);
      if(!isCurrent(record,job))return null;
      if(!pose)return fatal('pose-publication-unavailable',record,job);
      if(value.packed||value.sheetBorrowed)job.pose=pose;
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
        representation:own(pose,'representation'),authoredMotion:own(pose,'authoredMotion'),left,top,width,height,pixelWidth,pixelHeight,vertices:bounds.vertices,heightLocal:value.heightWorld,backingScale:value.backingScale,delta:value.dt,posePublicationMatched:true,
        sourceKind:value.sheetBorrowed?'borrowed-main-sheet':value.packed?'borrowed-main-atlas':'catalog-assets',sourcePath:value.sheetBorrowed?SHEET_PATH:value.packed?PACKED_PATH:own(own(pose,'source'),'path'),
        packedSource:value.packed?Object.freeze({path:PACKED_PATH,...value.sourceFrame}):null,
        sheetSource:value.sheetBorrowed?Object.freeze({path:SHEET_PATH,...value.sourceFrame}):null});
      frame=Object.freeze({canvas,left,top,width,height});return frame;
    }catch(_){return fatal('rig-render-failed',record,job);}
    finally{
      if(renderJob===job)renderJob=null;
      if(lost&&current===record){retire('context-lost');releaseRenderer();}
    }
  }
  function suspend(){if(disposed)return false;retire('inactive-main-body');return true;}
  function snapshot(){return Object.freeze({...stats,ready:reason==='ready'&&!!frame&&!disposed&&!failed&&!lost,reason,disposed,failed,lost,generation,
    volume:current?.sheetBorrowed&&current?.rig?current.rig.snapshot().volume:null,loadState:current?.state||'none',id:current?.id||null,rigReady:!!current?.rig,renderOwnerActive:!!renderJob,lastFrame,
    sourceKind:current?(current.sheetBorrowed?'borrowed-main-sheet':current.packed?'borrowed-main-atlas':'catalog-assets'):null,sourcePath:current?.sheetBorrowed?SHEET_PATH:current?.packed?PACKED_PATH:null,
    borrowedPixelsGenerationRequired:!!current?.packed,borrowedSameCanvasPixelMutationAccepted:false,
    borrowedSheetGenerationRequired:!!current?.sheetBorrowed,borrowedSheetDecodeRequired:!!current?.sheetBorrowed,
    groundHeight:0,heightSpace:'parent-body-local-reference',ownsRAF:false,ownsSimulation:false,ownsImages:false,
    actualReliefAccepted:false,full3DPlayerAccepted:false,mainPlayableAccepted:false});}
  function dispose(){
    if(disposed)return false;disposed=true;retire('disposed');
    try{canvas.removeEventListener('webglcontextlost',onLost);}catch(_){bump(stats,'cleanupFailures');}
    releaseRenderer();return true;
  }
  return Object.freeze({canvas,render,suspend,snapshot,dispose});
}
