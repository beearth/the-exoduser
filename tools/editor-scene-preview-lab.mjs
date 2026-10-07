import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import { createEditorSceneTerrain } from './2_5d/editor-scene-terrain.mjs';

// This viewer consumes one detached edited scene. It never fetches the canonical
// rift scene and never writes to the editor, project, history, player or save.
const $=id=>document.getElementById(id), canvas=$('scene-canvas'), stage=$('stage');
const keys=new Set(), movement=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
const state={entryId:null,ready:false,loading:false,error:null,disposed:false,raf:0,frames:0,lastTime:null,blocked:0,dpr:1,width:1,height:1,mode:'orthographic',zoom:1};
let owner=null, renderer=null, scene=null, camera=null, terrain=null, marker=null, observer=null;
let failurePresent=false, failureCause, failurePhase=null, shaderFailure=false;
let player=null, viewCentre=null, markerGeometry=null, markerMaterial=null;
const PROBE_MIN_DIAMETER_CSS=12, PROBE_OUTER_RADIUS=.04, probeView=new THREE.Vector3();
const probeState={minDiameterCss:PROBE_MIN_DIAMETER_CSS,scale:1,reason:'not-ready'};
let probeInnerRadius=0;
const ownedDisposed=new WeakSet();
const fixedError='편집 씬을 표시하지 못했습니다. 미리보기를 닫고 다시 열어 주세요.';
const own=(object,key)=>Object.getOwnPropertyDescriptor(object,key);
function scalarField(object,key){const d=own(object,key);if(!d||!('value'in d))throw new Error('미리보기 요청 필드 오류');return d.value;}
function current(record){return owner===record&&!record.closed&&!state.disposed&&!state.error;}
function text(id,value){const node=$(id);if(node&&node.children.length===0)node.textContent=value;}
function onceDispose(resource){if(resource&&typeof resource==='object'&&!ownedDisposed.has(resource)){ownedDisposed.add(resource);try{resource.dispose();}catch(_e){}}}
function stopFrame(){if(state.raf){cancelAnimationFrame(state.raf);state.raf=0;}state.lastTime=null;}
function releaseDisplay(){
  stopFrame();keys.clear();
  const oldTerrain=terrain;terrain=null;try{oldTerrain?.dispose();}catch(_e){}
  onceDispose(markerGeometry);onceDispose(markerMaterial);markerGeometry=markerMaterial=null;marker=null;
  probeInnerRadius=0;probeState.scale=null;probeState.reason='unavailable';
  try{observer?.disconnect();}catch(_e){}observer=null;
  onceDispose(renderer);renderer=null;scene=null;camera=null;player=null;viewCentre=null;
}
function fail(record,error,phase){
  if(owner!==record||record.closed||state.disposed)return;
  if(!failurePresent){failurePresent=true;failureCause=error;failurePhase=phase;}
  state.error=fixedError;state.loading=false;state.ready=false;
  record.controller.abort();releaseDisplay();text('state',fixedError);
}
function viewport(){
  if(!renderer)return;
  const rect=stage.getBoundingClientRect(), width=Math.max(1,Math.floor(rect.width)),height=Math.max(1,Math.floor(rect.height));
  const raw=window.devicePixelRatio,dpr=typeof raw==='number'&&Number.isFinite(raw)&&raw>0?Math.min(2,raw):1;
  if(state.dpr!==dpr||renderer.getPixelRatio()!==dpr)renderer.setPixelRatio(dpr);
  state.dpr=dpr;state.width=width;state.height=height;renderer.setSize(width,height,false);
  configureCamera();
}
function configureCamera(){
  if(!terrain||!scene||!renderer)return;
  const b=terrain.bounds, corners=[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].map(([x,y])=>terrain.worldToScene(x,y));
  const angle=50*Math.PI/180,sin=Math.sin(angle),cos=Math.cos(angle);
  const left=Math.min(...corners.map(p=>p.x)),right=Math.max(...corners.map(p=>p.x)),bottom=Math.min(...corners.map(p=>-p.z*sin)),top=Math.max(...corners.map(p=>-p.z*sin));
  const width=Math.max(.001,right-left),height=Math.max(.001,top-bottom),aspect=state.width/state.height;
  const centre=terrain.worldToScene(viewCentre.x,viewCentre.y), distance=Math.max(width,height)*2+10;
  if(state.mode==='perspective'){
    camera=new THREE.PerspectiveCamera(45,aspect,.01,10000);
    camera.position.set(centre.x,centre.y+sin*distance/state.zoom,centre.z+cos*distance/state.zoom);camera.lookAt(centre);
  }else{
    const halfY=Math.max(height/2,width/aspect/2)*1.1/state.zoom,halfX=halfY*aspect;
    camera=new THREE.OrthographicCamera(-halfX,halfX,halfY,-halfY,.01,10000);
    camera.position.set(centre.x,centre.y+sin*distance,centre.z+cos*distance);camera.lookAt(centre);
  }
  camera.updateProjectionMatrix();terrain.setViewport(viewCentre.x,viewCentre.y);
}
function measureProbeInnerRadius(geometry){
  const positions=geometry.getAttribute('position'),indices=geometry.getIndex();
  if(!positions||positions.itemSize!==3||!Number.isInteger(positions.count)||positions.count<3||!indices||!Number.isInteger(indices.count)||indices.count<3||indices.count%3!==0)throw new Error('보행 표식 geometry 오류');
  let radius=Infinity;
  for(let i=0;i<indices.count;i+=3){
    const a=indices.getX(i),b=indices.getX(i+1),c=indices.getX(i+2);
    if(!Number.isInteger(a)||!Number.isInteger(b)||!Number.isInteger(c)||a<0||b<0||c<0||a>=positions.count||b>=positions.count||c>=positions.count)throw new Error('보행 표식 index 오류');
    const ax=positions.getX(a),ay=positions.getY(a),az=positions.getZ(a),bx=positions.getX(b),by=positions.getY(b),bz=positions.getZ(b),cx=positions.getX(c),cy=positions.getY(c),cz=positions.getZ(c);
    if(![ax,ay,az,bx,by,bz,cx,cy,cz].every(Number.isFinite))throw new Error('보행 표식 vertex 오류');
    const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az;
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,length=Math.hypot(nx,ny,nz);
    const distance=Math.abs(nx*ax+ny*ay+nz*az)/length;
    if(!Number.isFinite(length)||length<=0||!Number.isFinite(distance)||distance<=0)throw new Error('보행 표식 triangle 오류');
    radius=Math.min(radius,distance);
  }
  if(!Number.isFinite(radius)||radius<=0||radius>PROBE_OUTER_RADIUS)throw new Error('보행 표식 내접 반지름 오류');
  return radius;
}
function displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner){
  return current(record)&&!!renderOwner&&!!sceneOwner&&!!cameraOwner&&!!markerOwner&&renderer===renderOwner&&scene===sceneOwner&&camera===cameraOwner&&marker===markerOwner;
}
function hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,reason){
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  markerOwner.visible=false;probeState.scale=Number.isFinite(markerOwner.scale.x)?markerOwner.scale.x:null;probeState.reason=reason;
  return true;
}
function sizeProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner){
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  cameraOwner.updateMatrixWorld(true);
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  markerOwner.updateWorldMatrix(true,false);
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  probeView.setFromMatrixPosition(markerOwner.matrixWorld).applyMatrix4(cameraOwner.matrixWorldInverse);
  const rect=canvas.getBoundingClientRect(),projection=cameraOwner.projectionMatrix.elements,depth=-probeView.z,near=cameraOwner.near,far=cameraOwner.far;
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  if(!Number.isFinite(rect.width)||rect.width<=0||!Number.isFinite(rect.height)||rect.height<=0||!Number.isFinite(probeView.x)||!Number.isFinite(probeView.y)||!Number.isFinite(depth)||!Number.isFinite(near)||near<=0||!Number.isFinite(far)||far<=near||!Number.isFinite(projection[0])||!Number.isFinite(projection[5])||!Number.isFinite(probeInnerRadius)||probeInnerRadius<=0)return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'invalid-projection');
  if(depth<=0)return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'behind-camera');
  if(depth<=near||depth>=far)return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'outside-depth');
  if(cameraOwner.isPerspectiveCamera!==true&&cameraOwner.isOrthographicCamera!==true)return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'unsupported-camera');
  let pixelsPerUnit=Math.min(rect.width*Math.abs(projection[0]),rect.height*Math.abs(projection[5]))/2;
  if(cameraOwner.isPerspectiveCamera===true)pixelsPerUnit/=depth;
  if(!Number.isFinite(pixelsPerUnit)||pixelsPerUnit<=0)return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'invalid-projection');
  const scale=Math.max(1,PROBE_MIN_DIAMETER_CSS/(2*probeInnerRadius*pixelsPerUnit)),outerRadius=PROBE_OUTER_RADIUS*scale;
  if(!Number.isFinite(scale)||!Number.isFinite(outerRadius)||!(outerRadius<Math.min(depth-near,far-depth)))return hideProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner,'minimum-unmet');
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  markerOwner.scale.setScalar(scale);
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return false;
  markerOwner.visible=true;probeState.scale=scale;probeState.reason='visible';
  return true;
}
function draw(record){
  const renderOwner=renderer,sceneOwner=scene,cameraOwner=camera,markerOwner=marker;
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner)||!sizeProbe(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return;
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return;
  renderOwner.render(sceneOwner,cameraOwner);
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return;
  state.frames++;
  if(shaderFailure)throw new Error('편집 씬 shader 연결 실패');
  const gl=renderOwner.getContext();
  if(!displayMatches(record,renderOwner,sceneOwner,cameraOwner,markerOwner))return;
  if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('편집 씬 WebGL 표시 실패');
}
function move(dt){
  if(!terrain||!player||!marker)return;
  let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  let dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(dx||dy){
    const n=Math.hypot(dx,dy),step=240*dt, x=player.x+dx/n*step,y=player.y+dy/n*step;
    if(terrain.canWalk(x,y,12)){player.x=x;player.y=y;}else{
      state.blocked++;
      if(dx&&dy&&step>0){
        if(terrain.canWalk(x,player.y,12))player.x=x;
        if(terrain.canWalk(player.x,y,12))player.y=y;
      }
    }
  }
  marker.position.copy(terrain.worldToScene(player.x,player.y,8));
}
function tick(now,record){
  state.raf=0;if(!current(record)||!state.ready||document.hidden)return;
  const dt=state.lastTime===null?0:Math.min(.05,Math.max(0,(now-state.lastTime)/1000));state.lastTime=now;
  try{move(dt);draw(record);}catch(error){fail(record,error,'frame');return;}
  if(current(record))state.raf=requestAnimationFrame(time=>tick(time,record));
}
function resume(){if(owner&&current(owner)&&state.ready&&!document.hidden&&!state.raf){state.lastTime=null;state.raf=requestAnimationFrame(time=>tick(time,owner));}}
function snapshot(){
  return Object.freeze({entryId:state.entryId,ready:state.ready,loading:state.loading,error:state.error,disposed:state.disposed,raf:!!state.raf,frames:state.frames,heldKeys:keys.size,blocked:state.blocked,dpr:state.dpr,canvas:{width:canvas.width,height:canvas.height},mode:state.mode,zoom:state.zoom,probe:Object.freeze({...probeState}),player:player?{...player}:null,terrain:terrain?.snapshot()||null,failure:{hasCause:failurePresent,phase:failurePhase},sceneSource:'EDITOR_SNAPSHOT',canonicalSceneFetch:false,editorMutation:false,saveAccepted:false,native6Accepted:false,physicalHeight:'UNKNOWN'});
}
async function loadScene(input,options){
  if(state.disposed||owner)throw new Error('편집 씬 진입은 창마다 한 번만 허용됩니다');
  const entryId=scalarField(options,'entryId');
  if(typeof entryId!=='string'||!entryId||entryId.length>128)throw new Error('미리보기 진입 ID 오류');
  const core=globalThis.MapSceneCore;if(!core||typeof core.validate!=='function')throw new Error('씬 검증 모듈 누락');
  const copy=core.validate(input), record={entryId,controller:new AbortController(),closed:false};
  owner=record;state.entryId=entryId;state.loading=true;text('state','편집한 배치와 길을 불러오는 중입니다.');
  let candidate=null;
  try{
    candidate=await createEditorSceneTerrain({THREE,scene:copy,core,signal:record.controller.signal});
    if(!current(record)){candidate.dispose();throw new Error('편집 씬 진입이 취소됐습니다');}
    terrain=candidate;candidate=null;scene=new THREE.Scene();
    scene.add(terrain.object3d);scene.background=new THREE.Color('#101b20');
    renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true});
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.debug.checkShaderErrors=true;
    renderer.debug.onShaderError=()=>{shaderFailure=true;};
    viewCentre={x:(terrain.bounds.left+terrain.bounds.right)/2,y:(terrain.bounds.top+terrain.bounds.bottom)/2};
    player={x:terrain.spawn.x,y:terrain.spawn.y};
    markerGeometry=new THREE.SphereGeometry(.04,12,8);probeInnerRadius=measureProbeInnerRadius(markerGeometry);
    markerMaterial=new THREE.MeshBasicMaterial({color:0xf1c67b,transparent:true,depthTest:false,depthWrite:false});
    marker=new THREE.Mesh(markerGeometry,markerMaterial);marker.renderOrder=100000;scene.add(marker);move(0);
    text('scene-name',copy.name);const info=terrain.snapshot();
    text('facts','오브젝트 '+info.objects+'개 · 표시 '+info.visibleObjects+'개\n레이어 '+info.layerCount+'개\n현재 편집 배치와 보행 영역을 사용합니다.');
    viewport();draw(record);
    if(!current(record))throw new Error('편집 씬 진입이 취소됐습니다');
    observer=new ResizeObserver(()=>{if(current(record)){try{viewport();draw(record);}catch(error){fail(record,error,'resize');}}});
    observer.observe(stage);state.loading=false;state.ready=true;
    text('state','현재 편집 씬 · 금빛 보행 지점으로 길을 확인하세요.');resume();return snapshot();
  }catch(error){
    try{candidate?.dispose();}catch(_e){}
    if(current(record))fail(record,error,'load');
    throw error;
  }
}
function dispose(){
  if(state.disposed)return;state.disposed=true;state.ready=false;state.loading=false;
  if(owner){owner.closed=true;owner.controller.abort();}releaseDisplay();
}
canvas.addEventListener('keydown',event=>{if(state.ready&&movement.has(event.code)){event.preventDefault();keys.add(event.code);}});
canvas.addEventListener('keyup',event=>{keys.delete(event.code);});
canvas.addEventListener('blur',()=>keys.clear());
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden)stopFrame();else resume();});
window.addEventListener('pagehide',dispose,{once:true});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(owner)fail(owner,new Error('WebGL context lost'),'context-lost');});
$('camera-mode').addEventListener('change',()=>{if(!state.ready||!['orthographic','perspective'].includes($('camera-mode').value))return;state.mode=$('camera-mode').value;try{configureCamera();draw(owner);}catch(error){fail(owner,error,'camera');}});
$('zoom').addEventListener('input',()=>{const n=Number($('zoom').value);if(!state.ready||!Number.isFinite(n)||n<.5||n>3)return;state.zoom=n;try{configureCamera();draw(owner);}catch(error){fail(owner,error,'zoom');}});
$('fit').addEventListener('click',()=>{if(!state.ready)return;state.zoom=1;$('zoom').value='1';viewCentre={x:(terrain.bounds.left+terrain.bounds.right)/2,y:(terrain.bounds.top+terrain.bounds.bottom)/2};try{configureCamera();draw(owner);}catch(error){fail(owner,error,'fit');}});
$('spawn').addEventListener('click',()=>{if(!state.ready)return;keys.clear();player={x:terrain.spawn.x,y:terrain.spawn.y};try{move(0);draw(owner);}catch(error){fail(owner,error,'spawn');}});
window.__editorScene25d=Object.freeze({ready:true,loadScene,snapshot,sceneSnapshot:()=>terrain?.sourceSceneSnapshot()||null,dispose});
