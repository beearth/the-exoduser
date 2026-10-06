/* ROOT-ADOPTED special-art consumer, separate from the directional skin catalog.
 * Source: game.html:10439,10535,10558–10585,36465–36471,39341,39728–39736.
 * Raw mapping: BOSS/dark-druid-special-motion-2_5d.candidate.mjs
 * SHA bff23e2b83de0e8cf976bed38dc33769c2d160338092a92b726baf463b176609.
 * Existing PNG pixels only. Native draw-origin .86 is retained as a renderer coefficient,
 * NOT a measured anatomical foot/IK anchor. Height is caller's lab display height.
 * No catalog registration, movement, combat/save writes, RAF, timer or mixer.
 */

const freeze = Object.freeze;
const finite = v => typeof v === 'number' && Number.isFinite(v);
const rootURL = new URL('../../', import.meta.url);
const source = (path,width,height,bytes,sha256) => freeze({path,width,height,bytes,sha256});
const directionCells = freeze([0,7,6,5,4,3,2,1]);

export const BAKED_SPECIAL_SOURCE = freeze({
  dive: source('assets/sprites/boss/boss_dark_druid_dive.png',1774,887,2609546,'4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce'),
  emerge: source('assets/sprites/boss/boss_dark_druid_emerge.png',1774,887,2609546,'4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce'),
  transform: source('assets/sprites/boss/boss_dark_druid_transform.png',2400,724,1634653,'7b329ce2d70b9572144391579405029cc74ac07c479b67d73783bea021dc365d'),
  beast: source('assets/sprites/boss/boss_dark_druid_beast.png',1774,887,1788236,'41cf09b5b90208bf343f13032664bcccbc9d22607a1aa913ab953e257860b8fd')
});
const motion = (sheet,ticks,reverse=false,hidden=false) => freeze({sheet,ticks,reverse,hidden});
export const BAKED_SPECIAL_MOTIONS = freeze({
  dive: motion('dive',50),
  under: motion('dive',45,false,true),
  erupt: motion('dive',40,true),
  'tele-prep': motion('emerge',40),
  'tele-warn': motion('emerge',60,true),
  emerge: motion('emerge',60,true), // alias of the native emerging tele-warn sequence
  transform: motion('transform',45),
  beast: motion('beast',50) // native generic charge window; fixed direction image, not 8 time frames
});
export const BAKED_SPECIAL_LIMITS = freeze({
  sourceTicksPerSecond:60,maxDeltaSeconds:.05,frameCount:8,
  rendererOriginY:.86,aspectAllowance:1.12,nativeEmergeAspect:9.3/14.1,
  footBand:4320,orderBase:30,orderWorldSpan:8000,orderSpan:10,
  footAnchor:'UNKNOWN',referenceHeight:'UNKNOWN',
  scope:'특수동작 원화 시험 · 발 기준 미인수',
  note:'Timing uses source default ticks at 60fps, not a live combat/phase/slow-motion clock.'
});

/** Exact native rounded boundaries; canonical direction is south=0 clockwise through south-east. */
export function bakedSpecialFrame(id,facing,phase=0){
  if(typeof id!=='string'||!Object.hasOwn(BAKED_SPECIAL_MOTIONS,id))throw new Error('지원하지 않는 특수동작');
  if(!Number.isInteger(facing)||facing<0||facing>7||!finite(phase)||phase<0||phase>1)throw new Error('특수동작 방향/진행 범위 오류');
  const spec=BAKED_SPECIAL_MOTIONS[id],info=BAKED_SPECIAL_SOURCE[spec.sheet];
  let frame=id==='under'?7:Math.min(7,Math.floor(phase*8));
  if(spec.reverse)frame=7-frame;
  if(id==='beast')frame=directionCells[facing];
  const cols=spec.sheet==='transform'?8:4,rows=spec.sheet==='transform'?1:2;
  const col=frame%cols,row=Math.floor(frame/cols);
  const x=Math.round(col*info.width/cols),y=Math.round(row*info.height/rows);
  const w=Math.round((col+1)*info.width/cols)-x,h=Math.round((row+1)*info.height/rows)-y;
  if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0||x+w>info.width||y+h>info.height)throw new Error('특수동작 셀 경계 오류');
  return freeze({sheet:spec.sheet,path:info.path,frame,col,row,x,y,w,h,hidden:spec.hidden});
}

async function pinnedBytes(info){
  const response=await globalThis.fetch(new URL(info.path,rootURL));
  if(response?.ok!==true)throw new Error(`특수 원화 HTTP 실패: ${info.path} (${response?.status??'UNKNOWN'})`);
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==info.bytes)throw new Error(`특수 원화 바이트 불일치: ${info.path}`);
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  const sha=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  if(sha!==info.sha256)throw new Error(`특수 원화 SHA256 불일치: ${info.path}`);
  const b=new Uint8Array(bytes),v=new DataView(bytes);
  if(![137,80,78,71,13,10,26,10].every((n,i)=>b[i]===n)||v.getUint32(16)!==info.width||v.getUint32(20)!==info.height)throw new Error(`특수 원화 PNG 크기 불일치: ${info.path}`);
  return bytes;
}

/**
 * setMotion(id,facing=0): starts/restarts one source-default preview; 'none' hides it.
 * update(dt,{x,y}): seconds, finite nonnegative; clamp .05. No world movement is authored.
 * snapshot().active remains true during under/hidden; caller must keep its normal actor hidden.
 * completion hides this consumer and returns active=false/completed=true for caller restoration.
 * facing is a rig direction index 0..7, not a native atan2 angle. Missing/invalid input hides.
 */
export async function createBakedSpecialMotion({THREE,terrain,camera,scene,height=.65}={}){
  for(const name of ['Group','Mesh','PlaneGeometry','MeshBasicMaterial','Texture'])if(typeof THREE?.[name]!=='function')throw new Error('특수 원화 Three 런타임 누락');
  if(typeof scene?.add!=='function'||typeof scene?.remove!=='function'||typeof terrain?.worldToScene!=='function'||!camera?.quaternion)throw new Error('특수 원화 scene/terrain/camera 누락');
  if(!finite(height)||height<=0||height>20)throw new Error('특수 원화 표시 높이 범위 오류');
  if(typeof globalThis.fetch!=='function'||!globalThis.crypto?.subtle||typeof globalThis.createImageBitmap!=='function')throw new Error('특수 원화 fetch/SHA256/PNG 디코더 누락');
  const bitmaps=new Map(),textures=new Map();
  let geometry,material,group,mesh,disposed=false;
  let id=null,facing=0,elapsed=0,active=false,completed=false,reason='neutral',frameSource=null,lastFrameKey='';
  function release(){
    if(group){group.visible=false;group.removeFromParent();}
    geometry?.dispose();material?.dispose();
    for(const texture of textures.values())texture.dispose();
    for(const bitmap of bitmaps.values())bitmap.close();
    textures.clear();bitmaps.clear();
  }
  try{
    // Validate every named source path before decoding/GPU allocation. Identical dive/emerge
    // then share one decoded bitmap and Texture within this consumer's lifetime.
    const entries=Object.entries(BAKED_SPECIAL_SOURCE);
    const bytes=await Promise.all(entries.map(([,info])=>pinnedBytes(info)));
    for(let i=0;i<entries.length;i++){
      const [,info]=entries[i];
      if(bitmaps.has(info.sha256))continue;
      const bitmap=await globalThis.createImageBitmap(new Blob([bytes[i]],{type:'image/png'}),{
        imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'
      });
      if(bitmap.width!==info.width||bitmap.height!==info.height){bitmap.close();throw new Error(`특수 원화 디코드 크기 불일치: ${info.path}`);}
      bitmaps.set(info.sha256,bitmap);
      const texture=new THREE.Texture(bitmap);
      textures.set(info.sha256,texture);
      texture.flipY=false; // bitmap was flipped once during decode; UVs remain native top-origin.
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;
      texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;
      texture.wrapS=THREE.ClampToEdgeWrapping;texture.wrapT=THREE.ClampToEdgeWrapping;
      texture.needsUpdate=true;
    }
    geometry=new THREE.PlaneGeometry(1,1);
    material=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,depthTest:false,side:THREE.DoubleSide,toneMapped:false});
    mesh=new THREE.Mesh(geometry,material);mesh.name='dark-druid-special-baked-art';mesh.frustumCulled=false;
    mesh.position.y=height*(BAKED_SPECIAL_LIMITS.rendererOriginY-.5);
    group=new THREE.Group();group.name='special-art-preview-foot-unaccepted';group.visible=false;group.add(mesh);
    group.userData.scope=BAKED_SPECIAL_LIMITS.scope;
    scene.add(group);

    function hide(why,complete=false){
      active=false;completed=complete;reason=why;group.visible=false;
    }
    function applyFrame(){
      const spec=BAKED_SPECIAL_MOTIONS[id];
      const phase=Math.min(1,elapsed/(spec.ticks/BAKED_SPECIAL_LIMITS.sourceTicksPerSecond));
      const frame=bakedSpecialFrame(id,facing,phase),info=BAKED_SPECIAL_SOURCE[frame.sheet];
      const key=`${frame.sheet}:${frame.frame}`;frameSource=frame;
      if(key!==lastFrameKey){
        const texture=textures.get(info.sha256);
        // Half-texel inset samples within each exact integer source rectangle.
        texture.repeat.set((frame.w-1)/info.width,(frame.h-1)/info.height);
        texture.offset.set((frame.x+.5)/info.width,1-(frame.y+frame.h-.5)/info.height);
        if(material.map!==texture){material.map=texture;material.needsUpdate=true;}
        const width=height*(frame.sheet==='emerge'?BAKED_SPECIAL_LIMITS.nativeEmergeAspect:(frame.w/frame.h)*BAKED_SPECIAL_LIMITS.aspectAllowance);
        mesh.scale.set(width,height,1);lastFrameKey=key;
      }
      mesh.visible=!spec.hidden;
    }
    function setMotion(nextId,nextFacing=0){
      if(disposed)return snapshot();
      if(nextId==='none'){id=null;elapsed=0;frameSource=null;hide('neutral');return snapshot();}
      if(typeof nextId!=='string'||!Object.hasOwn(BAKED_SPECIAL_MOTIONS,nextId)||!Number.isInteger(nextFacing)||nextFacing<0||nextFacing>7){
        id=null;elapsed=0;frameSource=null;hide('unsupported-motion-or-facing');return snapshot();
      }
      id=nextId;facing=nextFacing;elapsed=0;active=true;completed=false;reason='playing';
      group.visible=false;applyFrame();return snapshot();
    }
    function update(dt,player){
      if(disposed)return snapshot();
      if(!finite(dt)||dt<0){hide('invalid-dt');return snapshot();}
      if(!active)return snapshot();
      try{
        const x=player?.x,y=player?.y,q=camera.quaternion;
        if(!finite(x)||!finite(y)||![q.x,q.y,q.z,q.w].every(finite)||q.x*q.x+q.y*q.y+q.z*q.z+q.w*q.w<=0)throw new Error('invalid-player-or-camera');
        const p=terrain.worldToScene(x,y);
        if(!p||![p.x,p.y,p.z].every(finite))throw new Error('invalid-world-transform');
        group.position.copy(p);group.quaternion.copy(q);
        mesh.renderOrder=BAKED_SPECIAL_LIMITS.orderBase+(y-BAKED_SPECIAL_LIMITS.footBand)/BAKED_SPECIAL_LIMITS.orderWorldSpan*BAKED_SPECIAL_LIMITS.orderSpan;
        elapsed=Math.min(BAKED_SPECIAL_MOTIONS[id].ticks/60,elapsed+Math.min(dt,BAKED_SPECIAL_LIMITS.maxDeltaSeconds));
        applyFrame();
        if(elapsed>=BAKED_SPECIAL_MOTIONS[id].ticks/60)hide('completed',true);
        else group.visible=true;
      }catch(error){hide(error instanceof Error?error.message:'invalid-update');}
      return snapshot();
    }
    function snapshot(){
      const spec=id?BAKED_SPECIAL_MOTIONS[id]:null;
      return freeze({id,facing,elapsed,active,completed,visible:!!group.visible&&!!mesh.visible,
        reason,disposed,durationSeconds:spec?spec.ticks/60:null,sourceTicks:spec?.ticks??null,
        frameSource,position:freeze(group.position.toArray()),rendererOriginY:BAKED_SPECIAL_LIMITS.rendererOriginY,
        displayHeight:height,footAnchor:'UNKNOWN',referenceHeight:'UNKNOWN',
        scope:BAKED_SPECIAL_LIMITS.scope,sources:BAKED_SPECIAL_SOURCE,
        sourceStatus:'root-adopted-derivative',nativeAccepted:false,full3d:false,
        renderContract:freeze({depthTest:false,depthWrite:false,transparent:true,renderOrder:mesh.renderOrder}),
        uniqueDecodedImages:bitmaps.size,ownedTextures:textures.size,rafCount:0});
    }
    function dispose(){if(disposed)return;disposed=true;hide('disposed');release();}
    return freeze({setMotion,update,snapshot,dispose});
  }catch(error){disposed=true;release();throw error;}
}
