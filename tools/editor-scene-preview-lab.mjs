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
function draw(record){
  if(!current(record)||!renderer||!scene||!camera)return;
  renderer.render(scene,camera);state.frames++;
  if(shaderFailure)throw new Error('편집 씬 shader 연결 실패');
  const gl=renderer.getContext();
  if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw new Error('편집 씬 WebGL 표시 실패');
}
function move(dt){
  if(!terrain||!player||!marker)return;
  let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  let dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(dx||dy){
    const n=Math.hypot(dx,dy),step=240*dt, x=player.x+dx/n*step,y=player.y+dy/n*step;
    if(terrain.canWalk(x,y,12)){player.x=x;player.y=y;}else state.blocked++;
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
  return Object.freeze({entryId:state.entryId,ready:state.ready,loading:state.loading,error:state.error,disposed:state.disposed,raf:!!state.raf,frames:state.frames,heldKeys:keys.size,blocked:state.blocked,dpr:state.dpr,canvas:{width:canvas.width,height:canvas.height},mode:state.mode,zoom:state.zoom,player:player?{...player}:null,terrain:terrain?.snapshot()||null,failure:{hasCause:failurePresent,phase:failurePhase},sceneSource:'EDITOR_SNAPSHOT',canonicalSceneFetch:false,editorMutation:false,saveAccepted:false,native6Accepted:false,physicalHeight:'UNKNOWN'});
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
    markerGeometry=new THREE.SphereGeometry(.04,12,8);markerMaterial=new THREE.MeshBasicMaterial({color:0xf1c67b,depthTest:false,depthWrite:false});
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
