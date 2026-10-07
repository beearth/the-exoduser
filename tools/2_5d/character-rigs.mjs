import { CHARACTER_RIG_CATALOG as CATALOG, CHARACTER_RIG_CONFIG as C, characterRigFrame } from './character-rig-catalog.mjs';

// Share decoded originals; each rig owns its own Texture transforms and GPU resources.
const imageCache=new Map();
function acquireImage(info){
  let entry=imageCache.get(info.path);
  if(!entry){
    entry={refs:0,promise:null};
    entry.promise=new Promise((resolve,reject)=>{
      const image=new Image();
      image.onload=()=>image.naturalWidth===info.width&&image.naturalHeight===info.height
        ?resolve(image):reject(new Error(`원자료 크기 불일치: ${info.path}`));
      image.onerror=()=>reject(new Error(`캐릭터 원자료를 읽지 못했습니다: ${info.path}`));
      image.src=new URL(`../../${info.path}`,import.meta.url).href;
    });
    imageCache.set(info.path,entry);
  }
  entry.refs++;
  return {path:info.path,promise:entry.promise,release(){entry.refs--;if(entry.refs===0&&imageCache.get(info.path)===entry)imageCache.delete(info.path);}};
}

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const boneSpecs=Object.freeze([
  ['root',null,0,0],['waist','root',0,0.35],['torso','waist',0,0.55],['head','torso',0,0.82],
  ['arm-left','torso',-0.18,0.63],['arm-right','torso',0.18,0.63],
  ['forearm-left','arm-left',-0.25,0.43],['forearm-right','arm-right',0.25,0.43],
  ['robe-left','root',-0.13,0.30],['robe-right','root',0.13,0.30],
  ['foot-left','root',-0.10,0.07],['foot-right','root',0.10,0.07],
]);

// Optional ready main atlas: scalar wrappers are copied, never the borrowed canvas/token.
const PACKED_PATH='borrowed:silvertail-main-atlas';
const PACKED_COUNTS=Object.freeze({idle:2,walk:4,run:4});
const PACKED_FRAME_KEYS=Object.freeze(['generation','mode','direction','index','count','x','y','w','h','anchorX','anchorY','referenceHeight']);
function ownFields(value,keys){
  if(!value||typeof value!=='object')throw new Error('빌린 아틀라스 own-data 계약 오류');
  const proto=Object.getPrototypeOf(value);
  if(proto!==Object.prototype&&proto!==null)throw new Error('빌린 아틀라스 plain wrapper가 필요합니다.');
  const result={};
  for(const key of keys){
    const descriptor=Object.getOwnPropertyDescriptor(value,key);
    if(!descriptor||!Object.hasOwn(descriptor,'value'))throw new Error('빌린 아틀라스 own-data 필드 누락');
    result[key]=descriptor.value;
  }
  return result;
}
function canvasSize(image){
  if(!image||typeof image!=='object')throw new Error('준비된 canvas가 필요합니다.');
  for(const Type of [globalThis.HTMLCanvasElement,globalThis.OffscreenCanvas]){
    if(typeof Type!=='function'||!(image instanceof Type))continue;
    const dimensions=[];
    for(const key of ['width','height']){
      const descriptor=Object.getOwnPropertyDescriptor(Type.prototype,key);
      if(descriptor&&typeof descriptor.get==='function'){
        if(Object.getOwnPropertyDescriptor(image,key))throw new Error('canvas 크기 shadow 필드는 허용되지 않습니다.');
        dimensions.push(descriptor.get.call(image));
      }else{
        const own=Object.getOwnPropertyDescriptor(image,key);
        if(!own||!Object.hasOwn(own,'value'))throw new Error('canvas 실제 크기를 읽지 못했습니다.');
        dimensions.push(own.value);
      }
    }
    return dimensions;
  }
  throw new Error('HTMLCanvasElement 또는 OffscreenCanvas가 필요합니다.');
}
function readBorrowedAtlas(id,value){
  if(id!=='silvertail')throw new Error('빌린 본편 아틀라스는 실버테일 전용입니다.');
  const record=ownFields(value,['image','width','height','generation']);
  const token=record.generation;
  if(!token||typeof token!=='object'||![Object.prototype,null].includes(Object.getPrototypeOf(token))||Object.getOwnPropertyDescriptor(token,'then'))throw new Error('아틀라스 객체 세대 토큰이 필요합니다.');
  if(!Number.isSafeInteger(record.width)||record.width<=0||!Number.isSafeInteger(record.height)||record.height<=0)throw new Error('아틀라스 크기 계약 오류');
  const size=canvasSize(record.image);
  if(size[0]!==record.width||size[1]!==record.height)throw new Error('아틀라스 실제 크기 불일치');
  return Object.freeze(record);
}
function readPackedFrame(value,atlas,mode,direction,index,count){
  const frame=ownFields(value,PACKED_FRAME_KEYS);
  if(frame.generation!==atlas.generation||frame.mode!==mode||frame.direction!==direction||frame.index!==index||frame.count!==count)throw new Error('빌린 프레임 세대/모션/방향/phase 계약 오류');
  if(!Number.isInteger(frame.index)||!Number.isInteger(frame.count)||!Number.isInteger(frame.direction)||frame.w!==48||frame.h!==48||frame.anchorX!==24||frame.anchorY!==47||frame.referenceHeight!==45)throw new Error('실버테일 packed 셀/발 기준 계약 오류');
  if(!Number.isSafeInteger(frame.x)||frame.x<0||!Number.isSafeInteger(frame.y)||frame.y<0||frame.x>atlas.width-frame.w||frame.y>atlas.height-frame.h)throw new Error('빌린 프레임 아틀라스 경계 오류');
  const size=canvasSize(atlas.image);
  if(size[0]!==atlas.width||size[1]!==atlas.height)throw new Error('아틀라스 크기가 변경되었습니다.');
  return Object.freeze({path:PACKED_PATH,...frame});
}

export async function createCharacterRig(id,{THREE,height=2.2,borrowedAtlas}={}){
  const entry=CATALOG[id];
  if(!entry)throw new Error(`지원하지 않는 캐릭터: ${id}`);
  if(!THREE?.SkinnedMesh||!THREE?.Bone||!THREE?.Skeleton)throw new Error('Three.js 스킨 리깅 런타임이 필요합니다.');
  if(!Number.isFinite(height)||height<=0||height>20)throw new Error('캐릭터 높이 범위 오류');
  const packed=borrowedAtlas===undefined?null:readBorrowedAtlas(id,borrowedAtlas);
  const assetInfos=packed?[{path:PACKED_PATH,width:packed.width,height:packed.height,sampling:'nearest'}]:entry.assets;
  const leases=packed?[]:entry.assets.map(acquireImage),textures=new Map();
  let geometry=null,material=null,skeleton=null,disposed=false;
  try{
    const images=packed?[packed.image]:await Promise.all(leases.map(lease=>lease.promise));
    images.forEach((image,i)=>{
      const texture=new THREE.Texture(image);
      if(packed)textures.set(PACKED_PATH,texture);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.generateMipmaps=false;
      texture.magFilter=id==='dark-druid'||assetInfos[i].sampling==='linear'?THREE.LinearFilter:THREE.NearestFilter;
      texture.minFilter=texture.magFilter;
      texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;
      texture.needsUpdate=true;textures.set(assetInfos[i].path,texture);
    });
    geometry=new THREE.PlaneGeometry(1,1,C.columns,C.rows);
    const positions=geometry.getAttribute('position'),count=positions.count;
    const normalized=new Float32Array(count*2),skinIndices=new Uint16Array(count*4),skinWeights=new Float32Array(count*4);
    for(let i=0;i<count;i++){normalized[i*2]=positions.getX(i)+0.5;normalized[i*2+1]=positions.getY(i)+0.5;}
    // BufferAttribute retains these exact typed arrays; typed convenience constructors would copy them.
    geometry.setAttribute('skinIndex',new THREE.BufferAttribute(skinIndices,4));
    geometry.setAttribute('skinWeight',new THREE.BufferAttribute(skinWeights,4));
    const object3d=new THREE.Group();object3d.name=`directional-rig-${id}`;
    const bones=[],byName=new Map();
    for(const [name,parent,x,y]of boneSpecs){
      const bone=new THREE.Bone();bone.name=`${id}-${name}`;
      const parentSpec=parent?boneSpecs.find(spec=>spec[0]===parent):null;
      bone.position.set((x-(parentSpec?.[2]||0))*height,(y-(parentSpec?.[3]||0))*height,0);
      bones.push(bone);byName.set(name,bone);
      if(parent)byName.get(parent).add(bone);
    }
    if(bones.length!==C.boneCount||bones.some(bone=>!Number.isFinite(bone.position.x)||!Number.isFinite(bone.position.y)))throw new Error('본 계층/좌표 계약 오류');
    material=new THREE.MeshBasicMaterial({map:textures.get(assetInfos[0].path),alphaTest:C.alphaTest,side:THREE.DoubleSide,depthWrite:true,transparent:false,toneMapped:false});
    const mesh=new THREE.SkinnedMesh(geometry,material);mesh.name=`${id}-original-art-skin`;mesh.frustumCulled=false;
    mesh.add(bones[0]);skeleton=new THREE.Skeleton(bones);mesh.bind(skeleton);object3d.add(mesh);
    object3d.visible=false;
    const rest=bones.map(bone=>({position:bone.position.clone(),rotation:bone.rotation.clone()}));
    let elapsed=0,lastFrameKey='',frameInfo=null,lastMode='idle',lastDirection=0,frameIndex=0;
    let weightChecks=0,maxWeightError=0,posePublication=null,updateJob=null,updateDepth=0;

    function setGeometry(frame){
      const pixelScale=height/frame.referenceHeight;
      for(let i=0;i<count;i++){
        const x=(normalized[i*2]*frame.w-frame.anchorX)*pixelScale;
        const y=(normalized[i*2+1]*frame.h-(frame.h-frame.anchorY))*pixelScale;
        positions.setXYZ(i,x,y,0);
        // Weak deformation regions follow the body, while far-out equipment remains mostly root bound.
        const nx=x/height,ny=y/height,side=nx<0?0:1;
        let index=2,influence=0.45;
        if(ny>0.78){index=3;influence=clamp((ny-0.7)/0.15,0,0.75);}
        else if(ny<0.15){index=10+side;influence=ny<0?0:0.25;}
        else if(ny<0.42){index=8+side;influence=0.45;}
        else if(Math.abs(nx)>0.12&&Math.abs(nx)<0.4&&ny>0.42&&ny<0.75){index=ny>0.56?4+side:6+side;influence=0.35;}
        if(Math.abs(nx)>0.60){index=2;influence=0.15;}
        skinIndices[i*4]=0;skinIndices[i*4+1]=index;skinIndices[i*4+2]=0;skinIndices[i*4+3]=0;
        skinWeights[i*4]=1-influence;skinWeights[i*4+1]=influence;skinWeights[i*4+2]=0;skinWeights[i*4+3]=0;
        const error=Math.abs(skinWeights[i*4]+skinWeights[i*4+1]-1);
        maxWeightError=Math.max(maxWeightError,error);
        if(!Number.isFinite(x)||!Number.isFinite(y)||index>=bones.length||error>0.000001)throw new Error('스킨 geometry/가중치 계약 오류');
      }
      weightChecks++;
      positions.needsUpdate=true;geometry.getAttribute('skinIndex').needsUpdate=true;geometry.getAttribute('skinWeight').needsUpdate=true;
      geometry.computeBoundingBox();geometry.computeBoundingSphere();
    }
    function setFrame(mode,direction,index,packedFrame){
      const frame=packedFrame||characterRigFrame(id,mode,direction,index),key=`${frame.path}|${frame.x}|${frame.y}|${frame.w}|${frame.h}`;
      if(packed){
        // Calibration and semantic source freshness cannot be hidden by equal crop UVs.
        if(!frameInfo||frame.w!==frameInfo.w||frame.h!==frameInfo.h||frame.anchorX!==frameInfo.anchorX||frame.anchorY!==frameInfo.anchorY||frame.referenceHeight!==frameInfo.referenceHeight)setGeometry(frame);
        if(key!==lastFrameKey){
          const texture=textures.get(PACKED_PATH),inset=C.uvInsetPixels;
          texture.repeat.set((frame.w-inset*2)/packed.width,(frame.h-inset*2)/packed.height);
          texture.offset.set((frame.x+inset)/packed.width,1-(frame.y+frame.h-inset)/packed.height);
          texture.updateMatrix();material.map=texture;
        }
        frameInfo=frame;lastFrameKey=key;return;
      }
      if(key===lastFrameKey)return;
      const info=entry.assets.find(asset=>asset.path===frame.path),texture=textures.get(frame.path),inset=C.uvInsetPixels;
      texture.repeat.set((frame.w-inset*2)/info.width,(frame.h-inset*2)/info.height);
      texture.offset.set((frame.x+inset)/info.width,1-(frame.y+frame.h-inset)/info.height);
      texture.updateMatrix();material.map=texture;
      // Geometry only changes when cell dimensions or calibration do, not for every pose.
      if(!frameInfo||frame.w!==frameInfo.w||frame.h!==frameInfo.h||frame.anchorX!==frameInfo.anchorX||frame.anchorY!==frameInfo.anchorY||frame.referenceHeight!==frameInfo.referenceHeight)setGeometry(frame);
      frameInfo=frame;lastFrameKey=key;
    }
    function pose(mode,time,phase){
      bones.forEach((bone,i)=>{bone.position.copy(rest[i].position);bone.rotation.copy(rest[i].rotation);});
      const cycle=mode==='run'?11:mode==='walk'?7:mode==='attack'?6:2.4;
      const wave=Math.sin(time*cycle),counter=Math.cos(time*cycle),strength=C.poseStrength;
      byName.get('torso').rotation.z=wave*strength*(mode==='idle'?0.32:1);
      byName.get('head').rotation.z=-wave*strength*0.55;
      byName.get('waist').position.y+=Math.abs(wave)*height*strength*(mode==='idle'?0.12:0.45);
      byName.get('robe-left').rotation.z=wave*strength;byName.get('robe-right').rotation.z=-counter*strength;
      byName.get('arm-left').rotation.z=counter*strength*0.7;byName.get('arm-right').rotation.z=-counter*strength*0.7;
      byName.get('forearm-left').rotation.z=wave*strength*0.5;byName.get('forearm-right').rotation.z=-wave*strength*0.5;
      if(mode==='walk'||mode==='run'){
        byName.get('foot-left').position.y+=Math.max(0,wave)*height*strength*0.45;
        byName.get('foot-right').position.y+=Math.max(0,-wave)*height*strength*0.45;
      }
      if(mode==='attack'){
        const hit=Math.sin(Math.PI*phase);
        byName.get('torso').rotation.z+=hit*strength*1.4;
        byName.get('arm-left').rotation.z+=hit*strength*1.8;
        byName.get('arm-right').rotation.z-=hit*strength*1.8;
      }
    }
    function update(dt,options={}){
      updateDepth++;
      // Revoke the prior pose before reading any caller option accessor.
      posePublication=null;
      if(packed)object3d.visible=false;
      const job={};updateJob=job;
      try{
        if(disposed)throw new Error('해제된 캐릭터 리깅입니다.');
        const {mode='idle',direction=0,phase,speed}=options;
        if(disposed||updateJob!==job)return object3d;
        if(!['idle','walk','run','attack'].includes(mode)||!Number.isInteger(direction)||direction<0||direction>7)throw new Error('모션/8방향 계약 오류');
        if(packed&&(!Object.hasOwn(PACKED_COUNTS,mode)||!Number.isFinite(phase)||phase<0||phase>1))throw new Error('실버테일 packed 모션/명시 phase 계약 오류');
        const delta=Number.isFinite(dt)?clamp(dt,0,C.maxDelta):0;
        const phaseProvided=Number.isFinite(phase);
        if(mode!==lastMode)elapsed=0;
        elapsed+=delta;
        const interval=id==='dark-druid'&&mode!=='idle'?C.druidFrameInterval:C.frameInterval[mode];
        const frameCount=packed?PACKED_COUNTS[mode]:entry.frames[mode];
        const duration=interval*frameCount;
        const normalizedPhase=phaseProvided?clamp(phase,0,1):(elapsed%duration)/duration;
        frameIndex=Math.min(frameCount-1,Math.floor(normalizedPhase*frameCount));
        let packedFrame;
        if(packed){
          const descriptor=Object.getOwnPropertyDescriptor(options,'sourceFrame');
          if(!descriptor||!Object.hasOwn(descriptor,'value'))throw new Error('packed sourceFrame own-data가 필요합니다.');
          packedFrame=readPackedFrame(descriptor.value,packed,mode,direction,frameIndex,frameCount);
          if(disposed||updateJob!==job)return object3d;
        }
        setFrame(mode,direction,frameIndex,packedFrame);
        if(disposed||updateJob!==job)return object3d;
        pose(mode,elapsed,normalizedPhase);
        if(disposed||updateJob!==job)return object3d;
        lastMode=mode;lastDirection=direction;
        // No movement, damage, save, camera or caller transform is modified here. speed is observational.
        object3d.userData.motionSpeed=Number.isFinite(speed)?speed:0;
        if(disposed||updateJob!==job)return object3d;
        mesh.updateMatrixWorld(true);
        if(disposed||updateJob!==job)return object3d;
        skeleton.update();
        if(disposed||updateJob!==job)return object3d;
        if(packed){
          const size=canvasSize(packed.image);
          if(size[0]!==packed.width||size[1]!==packed.height)throw new Error('게시 전 아틀라스 크기 불일치');
          if(disposed||updateJob!==job)return object3d;
        }
        if(updateDepth===1){
          posePublication=Object.freeze({normalizedPhase,mode,direction,frame:frameIndex,elapsed,source:frameInfo});
          if(packed)object3d.visible=true;
        }
        return object3d;
      }catch(error){
        posePublication=null;throw error;
      }finally{
        updateDepth--;
        // A resumed outer update can have changed a successful inner pose.
        if(updateJob!==job)posePublication=null;
        else updateJob=null;
        if(packed&&!posePublication)object3d.visible=false;
      }
    }
    function snapshot(){
      const sample={};
      for(const key of ['torso','head','arm-left','robe-left','foot-left']){
        const bone=byName.get(key);sample[key]=Object.freeze({position:Object.freeze(bone.position.toArray()),quaternion:Object.freeze(bone.quaternion.toArray())});
      }
      return Object.freeze({id,name:entry.name,kind:entry.kind,height,mode:lastMode,direction:lastDirection,frame:frameIndex,
        elapsed,disposed,posePublication,vertices:count,triangles:geometry.index.count/3,boneCount:bones.length,meshCount:1,
        weightChecks,maxWeightError,source:Object.freeze({...frameInfo}),samples:Object.freeze(sample),
        assets:Object.freeze((packed?[]:entry.assets).map(info=>Object.freeze({path:info.path,sha256:info.sha256,bytes:info.bytes,sampling:info.sampling}))),
        metadata:Object.freeze((packed?[]:(entry.metadata||[])).map(info=>Object.freeze({...info}))),
        ...(packed?{sourceKind:'borrowed-main-atlas',sourcePath:PACKED_PATH}:{}),
        limits:'원화 평면 스킨 / 정사영 카메라향 billboard 필요 / 완전 3D 인체 아님 / 전투·저장 미연결'});
    }
    function dispose(){
      posePublication=null;updateJob=null;
      if(disposed)return;disposed=true;object3d.visible=false;object3d.removeFromParent();
      geometry.dispose();material.dispose();skeleton.dispose();textures.forEach(texture=>texture.dispose());
      textures.clear();leases.forEach(lease=>lease.release());leases.length=0;
    }
    if(!packed){update(0,{mode:'idle',direction:0});object3d.visible=true;}
    return Object.freeze({object3d,update,snapshot,dispose});
  }catch(error){
    geometry?.dispose();material?.dispose();skeleton?.dispose();textures.forEach(texture=>texture.dispose());
    leases.forEach(lease=>lease.release());throw error;
  }
}
