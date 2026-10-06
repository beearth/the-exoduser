import * as THREE from 'three';
import { createCharacterRig } from './2_5d/character-rigs.mjs';
import { createRiftTerrain, RIFT_TERRAIN } from './2_5d/rift-terrain.mjs';
import { createVisualPoseConsumer } from './2_5d/visual-pose-consumer.mjs';
import { createActorEffectLifetime } from './2_5d/actor-effect-lifetime.mjs';
import { checkFrameSpec, worldFootProvider, realNavFromTerrain, runV3, SLICE_ACCEPTANCE_PROVENANCE } from './2_5d/slice-acceptance.mjs';
import { assessRegistration, SCENE_REGISTRATION_PROVENANCE } from './2_5d/scene-registration.mjs';

const $ = id => document.getElementById(id);
const labels = {idle:'대기',walk:'걷기',run:'달리기',attack:'공격'};
const dirs = ['남','남동','동','북동','북','북서','서','남서'];
const heights = {warrior:.36, silvertail:.36, 'dark-druid':.65};
const controls = [...document.querySelectorAll('aside button, aside input, aside select')];
const keys = new Set(), rigs = {}, helpers = {}, poses = {}, effects = {};
const state = {ready:false,error:null,frames:0,selected:'warrior',mode:'idle',direction:0,
  x:0,y:0,paused:false,blocked:0,raf:0,lastTime:null,lastUi:0,contextLost:false,disposed:false,foregroundOpacity:1,previewMode:'idle',attackQueued:false};
let terrain, scene, camera, renderer, shadow, observer, reducedQuery;
let observeFoot, realNav, anchorJob=null, registration=null;
let acceptance={status:'PENDING',samples:0,reason:'표시 위치 검사 전',result:null};
const anchorSamples=12;
const leaf = (id,value) => { const el=$(id); if(el && !el.children.length) el.textContent=String(value); };
function stopFrame(){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;state.lastTime=null;}
function fail(error){
  state.error=error instanceof Error?error.message:String(error);state.ready=false;stopFrame();keys.clear();cancelAnchorCheck('오류로 검사 중단');
  controls.forEach(el=>el.disabled=true);Object.values(rigs).forEach(r=>r.object3d.visible=false);
  leaf('loading-title','시험을 중단했습니다');leaf('loading-detail',state.error);$('loading').hidden=false;
  leaf('status','원본 외형을 대체하지 않았습니다. 오류를 확인한 뒤 다시 열어 주세요.');
}
function resize(){
  if(!renderer || state.error)return;
  const box=$('world-canvas').parentElement.getBoundingClientRect();
  const width=Math.max(1,Math.round(box.width)),height=Math.max(1,Math.round(box.height));
  renderer.setSize(width,height,false);
  const half=3.5/2;camera.left=-half*width/height;camera.right=-camera.left;camera.top=half;camera.bottom=-half;
  camera.zoom=Number($('zoom').value)/100;camera.updateProjectionMatrix();
  if(state.ready)render();
}
function cancelAnchorCheck(reason){if(!anchorJob&&acceptance.status==='PENDING')return;anchorJob=null;acceptance={status:'PENDING',samples:0,reason,result:null};updateAcceptanceUi();}
function clearIntent(){cancelAnchorCheck('입력·캐릭터·초점 변경으로 검사 중단');keys.clear();state.attackQueued=false;state.previewMode=null;poses[state.selected]?.release();}
function updateAcceptanceUi(){
  leaf('metric-check',acceptance.status==='RUNNING'?`관측 ${acceptance.samples} / ${anchorSamples}`:acceptance.status);
  leaf('check-detail',acceptance.reason);
}
function beginAnchorCheck(){
  if(!state.ready||state.paused){anchorJob=null;acceptance={status:'PENDING',samples:0,reason:'재생 중인 화면에서 검사해 주세요.',result:null};updateAcceptanceUi();return;}
  const mode=state.mode;clearIntent();setMode(mode);pose(0);render();
  anchorJob={id:state.selected,mode:state.mode,direction:state.direction,x:state.x,y:state.y,snapshots:[]};
  acceptance={status:'RUNNING',samples:0,reason:'제자리 모션의 표시 앵커와 보행 경계를 관측 중',result:null};updateAcceptanceUi();
}
function sampleAnchor(){
  if(!anchorJob)return;
  const job=anchorJob;
  if(state.selected!==job.id||state.mode!==job.mode||state.direction!==job.direction||state.x!==job.x||state.y!==job.y){cancelAnchorCheck('이동 또는 모션 전환으로 검사 중단');return;}
  try{
    const worldFoot=observeFoot(rigs[state.selected].object3d);
    job.snapshots.push({id:job.id,mode:job.mode,direction:job.direction,worldFoot});
    acceptance.samples=job.snapshots.length;
    if(job.snapshots.length===anchorSamples){
      const result=runV3({snapshots:job.snapshots,realNav,footPoints:job.snapshots.map(s=>({id:s.id,...s.worldFoot}))});
      const points=job.snapshots.map(s=>s.worldFoot),drift=Math.hypot(Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y)));
      acceptance={status:result.totals.fail?'FAIL':result.totals.pending?'PENDING':'PASS',samples:anchorSamples,reason:`표시 앵커 편차 ${drift.toFixed(3)} 월드 px · 보행 반경 12 px. 발 그림 접촉은 별도 화면 검수.`,result};anchorJob=null;
    }
  }catch(error){anchorJob=null;acceptance={status:'FAIL',samples:acceptance.samples,reason:error.message,result:null};}
  updateAcceptanceUi();
}
function setMode(mode){clearIntent();state.previewMode=mode==='attack'?null:mode;state.attackQueued=mode==='attack';}
function select(id){
  if(!rigs[id])return;
  if(id!==state.selected){clearIntent();effects[state.selected]?.onActorChange('character-switch');}
  state.selected=id;Object.entries(rigs).forEach(([key,rig])=>{rig.object3d.visible=key===id;helpers[key].visible=key===id&&$('bones').checked;});
  leaf('actor-name',rigs[id].snapshot().name);applyState();
}
function reset(){clearIntent();effects[state.selected]?.onActorChange('reset');state.x=5480;state.y=3740;if(!terrain.canWalk(state.x,state.y,12))throw new Error('대표 화면 시작 발 위치가 막혀 있습니다');state.direction=0;state.blocked=0;setMode('idle');applyState();}
// Explicit selection/reset still applies the new foot transform while time is paused.
function applyState(){if(state.ready){pose(0);render();updateUi();}}
function updateUi(){
  if(!state.ready)return;
  const s=rigs[state.selected].snapshot();
  for(const id of Object.keys(labels))$(id).setAttribute('aria-pressed',String(id===state.mode));
  leaf('metric-mode',`${labels[state.mode]} · ${dirs[state.direction]}${state.paused?' · 정지':''}`);
  leaf('metric-bones',`${s.boneCount} / ${s.meshCount}`);leaf('metric-source',`${s.source.w} × ${s.source.h}`);
  leaf('metric-position',`${Math.round(state.x)} / ${Math.round(state.y)}`);
  leaf('metric-nav',`${terrain.canWalk(state.x,state.y)?'접지':'경계'} · 막힘 ${state.blocked}`);
  leaf('metric-occlusion',state.foregroundOpacity<1?'전경 32% · 발 위치 유지':state.y<=4320?'뿔 뒤쪽 정렬':'뿔 앞쪽 정렬');
  leaf('status',`${s.name} · 승인 외형 · 관절 변형과 방향 모션`);
}
function move(dt){
  const dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  const dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(state.attackQueued||poses[state.selected].snapshot().attackRemaining>0)return;
  if(!dx&&!dy)return;
  const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?470:260;
  state.direction=(Math.round(Math.atan2(dx,dy)/(Math.PI/4))+8)%8;
  const length=Math.hypot(dx,dy),x=state.x+dx/length*speed*dt,y=state.y+dy/length*speed*dt;
  const within=(x,y)=>x>=terrain.bounds.left+12&&x<=terrain.bounds.right-12&&y>=terrain.bounds.top+12&&y<=terrain.bounds.bottom-12&&terrain.canWalk(x,y,12);
  if(within(x,y)){state.x=x;state.y=y;}
  else if(dx&&within(x,state.y)){state.x=x;state.blocked++;}
  else if(dy&&within(state.x,y)){state.y=y;state.blocked++;}
  else state.blocked++;
}
function pose(dt){
  const dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  const dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  const intent={dx,dy,run:keys.has('ShiftLeft')||keys.has('ShiftRight'),attack:state.attackQueued,facing:state.direction};
  if(state.previewMode)intent.skill={id:'preview',poseMode:state.previewMode};
  const previousMode=state.mode;
  const resolved=poses[state.selected].resolve(dt,intent);state.attackQueued=false;
  state.mode=resolved.params.mode;state.direction=resolved.params.direction;
  if(state.mode!==previousMode)cancelAnchorCheck('모션 전환으로 이전 표시 검사 무효');
  const rig=rigs[state.selected];rig.update(dt,resolved.params);
  rig.object3d.position.copy(terrain.worldToScene(state.x,state.y));rig.object3d.quaternion.copy(camera.quaternion);
  // Preserve the existing actor-foot sorting boundary, rather than inventing a heightmap.
  rig.object3d.traverse(node=>{if(node.isMesh)node.renderOrder=state.y<=4320?20:40;});
  rig.object3d.updateMatrixWorld(true);helpers[state.selected].updateMatrixWorld(true);
  state.foregroundOpacity=1;
  for(const o of terrain.occluders){
    const xs=o.polygon.map(p=>p.x),ys=o.polygon.map(p=>p.y);
    const overlaps=state.y<=o.footY&&state.x>=Math.min(...xs)-heights[state.selected]*400/2&&state.x<=Math.max(...xs)+heights[state.selected]*400/2&&state.y>=Math.min(...ys)&&state.y<=Math.max(...ys);
    o.object3d.material.opacity=$('fade-foreground').checked&&overlaps?.32:1;
    state.foregroundOpacity=Math.min(state.foregroundOpacity,o.object3d.material.opacity);
  }
  shadow.position.copy(terrain.worldToScene(state.x,state.y));shadow.position.y=.002;
  shadow.scale.set(state.selected==='dark-druid'?.17:.10,state.selected==='dark-druid'?.10:.06,1);
  effects[state.selected].update(dt,state.x,state.y,rig.snapshot());
}
function render(){if(state.error||state.contextLost)return;renderer.render(scene,camera);state.frames++;}
function frame(time){
  state.raf=0;if(!state.ready||state.disposed)return;
  const dt=state.lastTime===null?0:Math.min(.04,Math.max(0,(time-state.lastTime)/1000));state.lastTime=time;
  if(!state.paused){move(dt);pose(dt);}render();if(!state.paused)sampleAnchor();
  if(time-state.lastUi>180){updateUi();state.lastUi=time;}
  if(state.ready&&!state.error)state.raf=requestAnimationFrame(frame);
}
function resume(){if(state.ready&&!state.raf&&!state.disposed&&!document.hidden){state.lastTime=null;state.raf=requestAnimationFrame(frame);}}
function createEffects(id){return createActorEffectLifetime({THREE,scene,camera,terrain,options:{depthTest:false,reducedMotion:reducedQuery.matches,dustSize:id==='dark-druid'?.042:.022,attackSize:id==='dark-druid'?.145:.08}});}
function updateReducedMotion(){for(const id of Object.keys(effects)){effects[id].dispose();effects[id]=createEffects(id);}}
function dispose(){
  if(state.disposed)return;state.disposed=true;anchorJob=null;stopFrame();observer?.disconnect();
  reducedQuery?.removeEventListener('change',updateReducedMotion);
  Object.values(effects).forEach(e=>e.dispose());
  Object.values(helpers).forEach(h=>{h.geometry.dispose();h.material.dispose();});
  Object.values(rigs).forEach(r=>r.dispose());terrain?.dispose();shadow?.geometry.dispose();shadow?.material.dispose();renderer?.dispose();
}
try{
  renderer=new THREE.WebGLRenderer({canvas:$('world-canvas'),antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors=true;renderer.debug.onShaderError=()=>fail(new Error('2.5D 화면 셰이더 연결 실패'));
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080e11);
  camera=new THREE.OrthographicCamera(-3,3,1.75,-1.75,.01,100);
  const angle=50*Math.PI/180;camera.position.set(0,Math.sin(angle)*16,Math.cos(angle)*16);camera.lookAt(0,0,0);
  terrain=await createRiftTerrain({THREE,angle:50,scale:400});scene.add(terrain.object3d);
  const sceneResponse=await fetch(new URL('../'+RIFT_TERRAIN.scene,import.meta.url));
  if(!sceneResponse.ok)throw new Error('맵 등록 대조 원자료 HTTP '+sceneResponse.status);
  registration=await assessRegistration(terrain.sourceSceneSnapshot(),{canonicalBytes:await sceneResponse.arrayBuffer()});
  if(!registration.ok)throw new Error('맵 정본 핀·배치·투영 대조 실패');
  observeFoot=worldFootProvider(terrain,THREE);realNav=realNavFromTerrain(terrain);
  const frameSpecs=checkFrameSpec();if(frameSpecs.some(r=>r.pass===false))throw new Error('캐릭터 프레임 규격 실패: '+frameSpecs.find(r=>r.pass===false).detail);
  leaf('metric-registration',`${registration.pin.status} · ${registration.walkableCount} 타일`);
  leaf('metric-editor',registration.editorRoundtrip.status);
  for(const occluder of terrain.occluders){occluder.object3d.renderOrder=30;occluder.object3d.material.depthTest=false;occluder.object3d.material.depthWrite=false;occluder.object3d.material.transparent=true;}
  reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  for(const id of ['warrior','silvertail','dark-druid']){
    rigs[id]=await createCharacterRig(id,{THREE,height:heights[id]});scene.add(rigs[id].object3d);
    // Actor, foreground and effects share Three's transparent pass, so foot renderOrder is effective.
    rigs[id].object3d.traverse(node=>{if(node.isMesh){node.material.transparent=true;node.material.depthTest=false;node.material.depthWrite=false;node.material.needsUpdate=true;}});
    poses[id]=createVisualPoseConsumer(id);
    effects[id]=createEffects(id);
    helpers[id]=new THREE.SkeletonHelper(rigs[id].object3d);helpers[id].material.transparent=true;helpers[id].material.depthTest=false;helpers[id].material.depthWrite=false;helpers[id].renderOrder=70;helpers[id].visible=false;scene.add(helpers[id]);
  }
  shadow=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x030a0c,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}));
  shadow.rotation.x=-Math.PI/2;shadow.renderOrder=15;scene.add(shadow);
  state.ready=true;controls.forEach(el=>el.disabled=false);$('loading').hidden=true;reset();select('warrior');
  reducedQuery.addEventListener('change',updateReducedMotion);
  observer=new ResizeObserver(resize);observer.observe($('world-canvas').parentElement);resize();resume();
  for(const id of Object.keys(labels))$(id).addEventListener('click',()=>setMode(id));
  $('character').addEventListener('change',()=>select($('character').value));
  $('bones').addEventListener('change',()=>select(state.selected));
  $('fade-foreground').addEventListener('change',()=>{pose(0);render();updateUi();});

  $('zoom').addEventListener('input',()=>{leaf('zoom-label',`${$('zoom').value}%`);resize();});
  $('pause').addEventListener('click',()=>{cancelAnchorCheck('일시정지 또는 재생 전환으로 검사 중단');state.paused=!state.paused;keys.clear();leaf('pause',state.paused?'재생':'일시정지');updateUi();});
  $('reset').addEventListener('click',reset);
  $('check-foot').addEventListener('click',beginAnchorCheck);
}catch(error){fail(error);}
const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ']);
$('world-canvas').addEventListener('keydown',event=>{
  if(!state.ready)return;if(movementKeys.has(event.code)){cancelAnchorCheck('키 입력으로 검사 중단');event.preventDefault();keys.add(event.code);state.previewMode=null;if(event.code==='KeyJ'&&!event.repeat&&!state.paused)state.attackQueued=true;}
  else if(event.code==='Space'&&!event.repeat){event.preventDefault();$('pause').click();}
});
$('world-canvas').addEventListener('keyup',event=>{if(movementKeys.has(event.code))keys.delete(event.code);});
$('world-canvas').addEventListener('blur',clearIntent);
window.addEventListener('blur',clearIntent);
$('world-canvas').addEventListener('webglcontextlost',event=>{event.preventDefault();state.contextLost=true;fail(new Error('WebGL 컨텍스트 소실. 페이지를 다시 열어 주세요.'));});
document.addEventListener('visibilitychange',()=>{clearIntent();if(document.hidden)stopFrame();else resume();});
window.addEventListener('pagehide',dispose,{once:true});
window.__rift25Lab=Object.freeze({snapshot:()=>{let actor;rigs[state.selected]?.object3d.traverse(n=>{if(n.isSkinnedMesh)actor=n;});return {...state,raf:!!state.raf,rig:rigs[state.selected]?.snapshot(),poseConsumer:poses[state.selected]?.snapshot(),effects:effects[state.selected]?.snapshot(),acceptance:structuredClone(acceptance),registration:structuredClone(registration),diagnosticProvenance:{QA:SLICE_ACCEPTANCE_PROVENANCE,MAP:SCENE_REGISTRATION_PROVENANCE},renderContract:actor?{transparent:actor.material.transparent,depthWrite:actor.material.depthWrite,depthTest:actor.material.depthTest,actorOrder:actor.renderOrder,actorScenePosition:rigs[state.selected].object3d.position.toArray(),shadowScenePosition:shadow.position.toArray(),foregroundOrders:terrain.occluders.map(o=>o.object3d.renderOrder)}:null,terrain:terrain?.snapshot(),canvas:{width:$('world-canvas').width,height:$('world-canvas').height}};}});
