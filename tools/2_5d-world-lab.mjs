import * as THREE from 'three';
import { createCharacterRig } from './2_5d/character-rigs.mjs';
import { createRiftTerrain } from './2_5d/rift-terrain.mjs';
import { createVisualPoseConsumer } from './2_5d/visual-pose-consumer.mjs';
import { createActorEffectLifetime } from './2_5d/actor-effect-lifetime.mjs';

const $ = id => document.getElementById(id);
const labels = {idle:'대기',walk:'걷기',run:'달리기',attack:'공격'};
const dirs = ['남','남동','동','북동','북','북서','서','남서'];
const heights = {warrior:.36, silvertail:.36, 'dark-druid':.65};
const controls = [...document.querySelectorAll('aside button, aside input, aside select')];
const keys = new Set(), rigs = {}, helpers = {}, poses = {}, effects = {};
const state = {ready:false,error:null,frames:0,selected:'warrior',mode:'idle',direction:0,
  x:0,y:0,paused:false,blocked:0,raf:0,lastTime:null,lastUi:0,contextLost:false,disposed:false,foregroundOpacity:1,previewMode:'idle',attackQueued:false};
let terrain, scene, camera, renderer, shadow, observer, reducedQuery;
const leaf = (id,value) => { const el=$(id); if(el && !el.children.length) el.textContent=String(value); };
function stopFrame(){if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;state.lastTime=null;}
function fail(error){
  state.error=error instanceof Error?error.message:String(error);state.ready=false;stopFrame();keys.clear();
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
function clearIntent(){keys.clear();state.attackQueued=false;state.previewMode=null;poses[state.selected]?.release();}
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
  const resolved=poses[state.selected].resolve(dt,intent);state.attackQueued=false;
  state.mode=resolved.params.mode;state.direction=resolved.params.direction;
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
  if(!state.paused){move(dt);pose(dt);}render();
  if(time-state.lastUi>180){updateUi();state.lastUi=time;}
  if(state.ready&&!state.error)state.raf=requestAnimationFrame(frame);
}
function resume(){if(state.ready&&!state.raf&&!state.disposed&&!document.hidden){state.lastTime=null;state.raf=requestAnimationFrame(frame);}}
function createEffects(id){return createActorEffectLifetime({THREE,scene,camera,terrain,options:{depthTest:false,reducedMotion:reducedQuery.matches,dustSize:id==='dark-druid'?.042:.022,attackSize:id==='dark-druid'?.145:.08}});}
function updateReducedMotion(){for(const id of Object.keys(effects)){effects[id].dispose();effects[id]=createEffects(id);}}
function dispose(){
  if(state.disposed)return;state.disposed=true;stopFrame();observer?.disconnect();
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
  $('pause').addEventListener('click',()=>{state.paused=!state.paused;keys.clear();leaf('pause',state.paused?'재생':'일시정지');updateUi();});
  $('reset').addEventListener('click',reset);
}catch(error){fail(error);}
const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ']);
$('world-canvas').addEventListener('keydown',event=>{
  if(!state.ready)return;if(movementKeys.has(event.code)){event.preventDefault();keys.add(event.code);state.previewMode=null;if(event.code==='KeyJ'&&!event.repeat&&!state.paused)state.attackQueued=true;}
  else if(event.code==='Space'&&!event.repeat){event.preventDefault();$('pause').click();}
});
$('world-canvas').addEventListener('keyup',event=>{if(movementKeys.has(event.code))keys.delete(event.code);});
$('world-canvas').addEventListener('blur',clearIntent);
window.addEventListener('blur',clearIntent);
$('world-canvas').addEventListener('webglcontextlost',event=>{event.preventDefault();state.contextLost=true;fail(new Error('WebGL 컨텍스트 소실. 페이지를 다시 열어 주세요.'));});
document.addEventListener('visibilitychange',()=>{clearIntent();if(document.hidden)stopFrame();else resume();});
window.addEventListener('pagehide',dispose,{once:true});
window.__rift25Lab=Object.freeze({snapshot:()=>{let actor;rigs[state.selected]?.object3d.traverse(n=>{if(n.isSkinnedMesh)actor=n;});return {...state,raf:!!state.raf,rig:rigs[state.selected]?.snapshot(),poseConsumer:poses[state.selected]?.snapshot(),effects:effects[state.selected]?.snapshot(),renderContract:actor?{transparent:actor.material.transparent,depthWrite:actor.material.depthWrite,depthTest:actor.material.depthTest,actorOrder:actor.renderOrder,actorScenePosition:rigs[state.selected].object3d.position.toArray(),shadowScenePosition:shadow.position.toArray(),foregroundOrders:terrain.occluders.map(o=>o.object3d.renderOrder)}:null,terrain:terrain?.snapshot(),canvas:{width:$('world-canvas').width,height:$('world-canvas').height}};}});
