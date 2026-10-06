import * as THREE from 'three';
import { createCharacterRig } from './2_5d/character-rigs.mjs';
import { createBakedSpecialMotion } from './2_5d/baked-special-motion.mjs';
import { createRiftTerrain, RIFT_TERRAIN } from './2_5d/rift-terrain.mjs';
import { createRiftContactUnderlay } from './2_5d/rift-contact-underlay.mjs';
import { createDialoguePoseArbiter } from './2_5d/dialogue-pose.mjs';
import { createDialogueObservationConsumer } from './2_5d/dialogue-observation.mjs';
import { createCorruptedWolf } from './2_5d/corrupted-wolf.mjs';
import { createActorEffectLifetime } from './2_5d/actor-effect-lifetime.mjs';
import { checkFrameSpec, worldFootProvider, realNavFromTerrain, runV3, SLICE_ACCEPTANCE_PROVENANCE } from './2_5d/slice-acceptance.mjs';
import { assessRegistration, SCENE_REGISTRATION_PROVENANCE } from './2_5d/scene-registration.mjs';
import { createInteractionCueLifetime, INTERACTION_CUE_PROVENANCE } from './2_5d/interaction-cue-lifetime.mjs';
import { createRiftResidentBillboards, riftResidentFootOrder } from './2_5d/rift-resident-billboards.mjs';
import { createRiftDialogue } from './map-scene-rift-dialogue.mjs';
import { residentDialogueAnchors } from './map-scene-rift-residents.mjs';
import { inspectResidentAccess } from './map-scene-resident-access.mjs';

const $ = id => document.getElementById(id);
const labels = {idle:'대기',walk:'걷기',run:'달리기',attack:'공격'};
const specialLabels={dive:'지면으로 잠입',under:'잠행 · 본체 숨김',erupt:'솟아오르기','tele-prep':'출현 준비','tele-warn':'출현',transform:'변신',beast:'야수 · 방향 원화'};
const dirs = ['남','남동','동','북동','북','북서','서','남서'];
const heights = {warrior:.36, silvertail:.36, 'dark-druid':.65};
const controls = [...document.querySelectorAll('aside button, aside input, aside select')];
const keys = new Set(), rigs = {}, helpers = {}, poses = {}, effects = {};
const state = {ready:false,error:null,frames:0,selected:'warrior',mode:'idle',direction:0,
  x:0,y:0,paused:false,blocked:0,raf:0,lastTime:null,lastUi:0,contextLost:false,disposed:false,foregroundOpacity:1,previewMode:'idle',attackQueued:false};
let terrain, scene, camera, renderer, shadow, observer, reducedQuery, residents, dialogue, residentAccess, interactionCue, specialMotion;
let dialogueObservation, wolf, wolfPlacement=null, wolfError=null;
const wolfAbort=new AbortController();
const dialoguePlayer={x:0,y:0};
let dialogueSignature='',nearestNpc=null;
let foregroundShaderPrograms=[],contactShaderPrograms=[],contactUnderlay;
let observeFoot, realNav, anchorJob=null, registration=null;
let acceptance={status:'PENDING',samples:0,reason:'표시 위치 검사 전',result:null};
const anchorSamples=12;
let previewSequence=0,previewEntry=null,previewEntryReason=null;
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
function cancelSpecial(){specialMotion?.setMotion('none');if(rigs[state.selected]){rigs[state.selected].object3d.visible=true;helpers[state.selected].visible=$('bones').checked;}if(shadow)shadow.visible=true;}
function clearIntent(){cancelAnchorCheck('입력·캐릭터·초점 변경으로 검사 중단');keys.clear();state.attackQueued=false;state.previewMode=null;poses[state.selected]?.release();cancelSpecial();}
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
function setMode(mode){if(dialogue?.snapshot().isOpen)closeDialogue('motion-preview');clearIntent();state.previewMode=mode==='attack'?null:mode;state.attackQueued=mode==='attack';}
function playSpecial(){
  if(!state.ready||state.paused)return;
  closeDialogue('special-motion');clearIntent();$('character').value='dark-druid';select('dark-druid');
  effects['dark-druid'].onActorChange('special-motion');
  state.direction=Number($('special-facing').value);
  specialMotion.setMotion($('special-motion').value,state.direction);applyState();
}
function select(id){
  if(!rigs[id])return;
  if(id!==state.selected){invalidatePreview('character-switch');closeDialogue('character-switch');clearIntent();interactionCue?.onActorChange('character-switch');effects[state.selected]?.onActorChange('character-switch');}
  state.selected=id;Object.entries(rigs).forEach(([key,rig])=>{rig.object3d.visible=key===id;helpers[key].visible=key===id&&$('bones').checked;});
  leaf('actor-name',rigs[id].snapshot().name);applyState();
}
function reset(){invalidatePreview('reset');closeDialogue('reset');interactionCue?.onSceneChange('reset');clearIntent();poses[state.selected]?.reset();effects[state.selected]?.onActorChange('reset');state.x=5480;state.y=3740;if(!terrain.canWalk(state.x,state.y,12))throw new Error('대표 화면 시작 발 위치가 막혀 있습니다');state.direction=0;state.blocked=0;setMode('idle');placeWolf();applyState();}
function closeDialogue(reason){const wasOpen=dialogue?.snapshot().isOpen;dialogue?.close(reason);if(wasOpen){keys.clear();state.attackQueued=false;state.previewMode=null;poses[state.selected]?.release('dialogue-close');}dialogueSignature='';updateDialogue();}
function updateDialogue(){
  if(!dialogue)return;
  const snapshot=dialogue.snapshot(),view=snapshot.view;
  const observed=dialogueObservation?.observe(snapshot);
  leaf('dialogue-session',observed?.stateKnown?`이번 화면의 선택 · 유품 ${observed.trial.gift.length} · 부탁 ${observed.trial.quest.length}`:'대화 상태 확인 중');
  nearestNpc=dialogue.nearest(dialoguePlayer);
  leaf('npc-near',nearestNpc?`${nearestNpc.name.ko} · R로 대화`:'주민에게 다가가면 R로 대화합니다.');
  $('talk').disabled=!state.ready||state.paused||!nearestNpc;
  $('dialogue-panel').hidden=!view;
  const signature=view?JSON.stringify([view.npcId,view.nodeId,view.options]):'closed';
  if(signature===dialogueSignature)return;dialogueSignature=signature;
  leaf('dialogue-name',view?.name.ko||'');leaf('dialogue-text',view?.text.ko||'');
  leaf('dialogue-notice',view?.notice.ko||'');
  const list=$('dialogue-options');while(list.firstChild)list.removeChild(list.firstChild);
  for(const option of view?.options||[]){
    const button=document.createElement('button');button.type='button';button.textContent=option.label.ko;
    button.addEventListener('click',()=>{if(state.ready&&!state.paused){dialogue.choose(option.id);updateDialogue();}});list.appendChild(button);
  }
}
function talk(){if(!state.ready||state.paused)return;const n=dialogue.nearest(dialoguePlayer);if(!n)return;clearIntent();state.direction=(Math.round(Math.atan2(n.x-state.x,n.y-state.y)/(Math.PI/4))+8)%8;dialogue.open(n.npcId,dialoguePlayer);applyState();updateDialogue();}
function displayApproach(row){
  // Prefer lateral separation for two readable bodies; canonical foot/nav stay unchanged.
  for(const [dx,dy] of [[120,0],[-120,0],[80,80],[-80,80],[80,-80],[-80,-80],[0,120],[0,-120]]){
    const point={x:row.foot.x+dx,y:row.foot.y+dy};
    if(dialogue.nearest(point)?.npcId===row.npcId)return {...point,distance:Math.hypot(dx,dy)};
  }
  return row.approach;
}
function invalidatePreview(reason){previewEntry=null;previewEntryReason=reason;}
function previewEntrySnapshot(){return Object.freeze({active:!!previewEntry,token:previewEntry?.token??null,npcId:previewEntry?.npcId??null,objectId:previewEntry?.objectId??null,reason:previewEntryReason});}
function enterPreview(payload){
  let origin=null,entry=null;
  try{
    if(!state.ready||state.error||state.disposed||state.contextLost)throw new Error('lab-not-ready');
    const values={};
    if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('invalid-payload');
    for(const key of ['npcId','objectId','x','y']){const d=Object.getOwnPropertyDescriptor(payload,key);if(!d||!Object.hasOwn(d,'value'))throw new Error('invalid-payload');values[key]=d.value;}
    const {npcId,objectId,x,y}=values;
    if(typeof npcId!=='string'||typeof objectId!=='string'||!Number.isFinite(x)||!Number.isFinite(y))throw new Error('invalid-payload');
    const row=residentAccess?.rows.find(r=>r.npcId===npcId&&r.objectId===objectId);
    if(!row||row.status!=='ready')throw new Error('resident-mismatch');
    const b=terrain.bounds;
    if(x<b.left+12||x>b.right-12||y<b.top+12||y>b.bottom-12||!terrain.canWalk(x,y,12))throw new Error('approach-blocked');
    if(dialogue.nearest({x,y})?.npcId!==npcId)throw new Error('nearest-resident-mismatch');
    origin={x:state.x,y:state.y,direction:state.direction,selected:state.selected};
    entry={token:++previewSequence,npcId,objectId,x,y,selected:state.selected};
    invalidatePreview('new-entry');closeDialogue('editor-preview');clearIntent();
    interactionCue?.onActorChange('editor-preview');effects[state.selected]?.onActorChange('editor-preview');
    state.x=x;state.y=y;state.direction=(Math.round(Math.atan2(row.foot.x-x,row.foot.y-y)/(Math.PI/4))+8)%8;state.blocked=0;
    previewEntry=entry;previewEntryReason=null;applyState();
    let used=false;
    return Object.freeze({restore(){
      if(used)return false;used=true;
      if(previewEntry!==entry||state.selected!==entry.selected||state.x!==entry.x||state.y!==entry.y){if(previewEntry===entry)invalidatePreview('entry-changed');return false;}
      invalidatePreview('restored');
      if(!state.ready||state.error||state.disposed||state.contextLost||!terrain.canWalk(origin.x,origin.y,12))return false;
      closeDialogue('editor-preview-restore');clearIntent();interactionCue?.onActorChange('editor-preview-restore');effects[state.selected]?.onActorChange('editor-preview-restore');
      state.x=origin.x;state.y=origin.y;state.direction=origin.direction;state.blocked=0;applyState();return true;
    }});
  }catch(error){
    if(entry&&previewEntry===entry){invalidatePreview('entry-failed');if(origin&&state.selected===origin.selected){state.x=origin.x;state.y=origin.y;state.direction=origin.direction;}}
    previewEntryReason=error instanceof Error?error.message:'entry-failed';return null;
  }
}
function visitResident(){
  const row=residentAccess?.rows.find(r=>r.npcId===$('resident').value),point=row?.displayApproach;
  if(!row||row.status!=='ready'||!point||!terrain.canWalk(point.x,point.y,12))return;
  invalidatePreview('preview-location-change');closeDialogue('preview-location-change');clearIntent();interactionCue?.onActorChange('preview-location-change');effects[state.selected]?.onActorChange('preview-location-change');
  state.x=point.x;state.y=point.y;state.direction=(Math.round(Math.atan2(row.foot.x-state.x,row.foot.y-state.y)/(Math.PI/4))+8)%8;state.blocked=0;setMode('idle');applyState();
}
function placeWolf(){
  if(!wolf||!terrain)return;
  wolfPlacement=null;
  for(const [dx,dy] of [[180,100],[-180,100],[180,-100],[-180,-100],[0,180],[0,-180]]){
    const x=state.x+dx,y=state.y+dy;
    if(terrain.canWalk(x,y,12)){wolfPlacement={x,y,radius:12};break;}
  }
  updateWolf(0);
}
function updateWolf(dt){
  if(!wolf)return;
  if(!wolfPlacement||!$('wolf-visible').checked){wolf.object3d.visible=false;return;}
  wolf.update(dt,{mode:$('wolf-mode').value,direction:Number($('wolf-facing').value),x:wolfPlacement.x,y:wolfPlacement.y});
}
// Explicit selection/reset still applies the new foot transform while time is paused.
function applyState(){if(state.ready){pose(0);render();updateUi();}}
function updateUi(){
  if(!state.ready)return;
  const s=rigs[state.selected].snapshot();
  const special=specialMotion.snapshot();
  for(const id of Object.keys(labels))$(id).setAttribute('aria-pressed',String(id===state.mode));
  leaf('metric-mode',`${special.active?specialLabels[special.id]:labels[state.mode]} · ${dirs[state.direction]}${state.paused?' · 정지':''}`);
  leaf('metric-bones',`${s.boneCount} / ${s.meshCount}`);leaf('metric-source',`${s.source.w} × ${s.source.h}`);
  leaf('metric-position',`${Math.round(state.x)} / ${Math.round(state.y)}`);
  leaf('metric-nav',`${terrain.canWalk(state.x,state.y)?'접지':'경계'} · 막힘 ${state.blocked}`);
  leaf('metric-occlusion',state.foregroundOpacity<1?'전경 32% · 발 위치 유지':state.y<=4320?'뿔 뒤쪽 정렬':'뿔 앞쪽 정렬');
  leaf('status',special.active?'다크드루이드 · 기존 특수동작 원화 · 발 기준 미인수':`${s.name} · 승인 외형 · 관절 변형과 방향 모션`);
  leaf('special-status',special.active?`${special.visible?'재생':'본체 숨김'} · ${special.frameSource?.frame??0}번 셀`:special.completed?'1회 종료 · 관절 모션으로 복귀':'기존 특수동작 원화를 1회 재생합니다.');
  $('special-play').disabled=state.paused;$('check-foot').disabled=special.active;
  const ws=wolf?.snapshot();
  leaf('wolf-status',wolfError?`늑대 표시 중단 · ${wolfError}`:!wolfPlacement?'주변에 접근 가능한 자리가 없습니다.':ws?`${dirs[ws.direction]} · ${ws.usedMode==='walk'?'걷기':'대기'} · ${ws.frame}번 셀${ws.fellBackFromEmptyWalkFrame!==null?' · 빈 셀에서 대기로 전환':''}`:'늑대 그림 준비 중');
  updateDialogue();
}
function move(dt){
  if(dialogue?.snapshot().isOpen)return;
  const dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
  const dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
  if(state.attackQueued||poses[state.selected].snapshot().attackRemaining>0)return;
  if(!dx&&!dy)return;
  if(previewEntry)invalidatePreview('user-movement');
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
  // Residents, player and all original foregrounds share the foot-Y order (4320 => 30).
  rig.object3d.traverse(node=>{if(node.isMesh)node.renderOrder=30+(state.y-4320)/8000*10;});
  rig.object3d.updateMatrixWorld(true);helpers[state.selected].updateMatrixWorld(true);
  const special=specialMotion.update(dt,{x:state.x,y:state.y});
  rig.object3d.visible=!special.active;
  helpers[state.selected].visible=!special.active&&$('bones').checked;
  state.foregroundOpacity=1;
  for(const o of terrain.occluders){
    const xs=o.polygon.map(p=>p.x),ys=o.polygon.map(p=>p.y);
    const overlaps=state.y<=o.footY&&state.x>=Math.min(...xs)-heights[state.selected]*400/2&&state.x<=Math.max(...xs)+heights[state.selected]*400/2&&state.y>=Math.min(...ys)&&state.y<=Math.max(...ys);
    o.object3d.material.opacity=$('fade-foreground').checked&&overlaps?.32:1;
    state.foregroundOpacity=Math.min(state.foregroundOpacity,o.object3d.material.opacity);
  }
  shadow.position.copy(terrain.worldToScene(state.x,state.y));shadow.position.y=.002;
  shadow.scale.set(state.selected==='dark-druid'?.17:.10,state.selected==='dark-druid'?.10:.06,1);
  shadow.visible=!special.active||special.visible;
  effects[state.selected].update(dt,state.x,state.y,rig.snapshot());
  dialoguePlayer.x=state.x;dialoguePlayer.y=state.y;
  residents?.update(state.x,state.y);
  interactionCue?.update(dt,dialoguePlayer,dialogue);
  const target=terrain.worldToScene(state.x,state.y),angle=50*Math.PI/180;
  camera.position.set(target.x,Math.sin(angle)*16,target.z+Math.cos(angle)*16);camera.lookAt(target);
  updateWolf(dt);
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
function updateReducedMotion(){interactionCue?.setReducedMotion(reducedQuery.matches);for(const id of Object.keys(effects)){effects[id].dispose();effects[id]=createEffects(id);}}
function dispose(){
  if(state.disposed)return;invalidatePreview('disposed');state.disposed=true;anchorJob=null;stopFrame();observer?.disconnect();
  reducedQuery?.removeEventListener('change',updateReducedMotion);
  Object.values(effects).forEach(e=>e.dispose());
  Object.values(helpers).forEach(h=>{h.geometry.dispose();h.material.dispose();});
  wolfAbort.abort();wolf?.dispose();Object.values(rigs).forEach(r=>r.dispose());specialMotion?.dispose();contactUnderlay?.dispose();terrain?.dispose();shadow?.geometry.dispose();shadow?.material.dispose();renderer?.dispose();
  interactionCue?.dispose();residents?.dispose();dialogue?.close('pagehide');
}
try{
  renderer=new THREE.WebGLRenderer({canvas:$('world-canvas'),antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.debug.checkShaderErrors=true;renderer.debug.onShaderError=()=>fail(new Error('2.5D 화면 셰이더 연결 실패'));
  scene=new THREE.Scene();scene.background=new THREE.Color(0x080e11);
  camera=new THREE.OrthographicCamera(-3,3,1.75,-1.75,.01,100);
  const angle=50*Math.PI/180;camera.position.set(0,Math.sin(angle)*16,Math.cos(angle)*16);camera.lookAt(0,0,0);
  terrain=await createRiftTerrain({THREE,angle:50,scale:400});scene.add(terrain.object3d);
  // Compile all authored foreground materials, including offscreen cutouts, once.
  renderer.compile(terrain.object3d,camera);
  const gl=renderer.getContext();
  foregroundShaderPrograms=renderer.info.programs.filter(p=>p.cacheKey.includes('rift-foreground-canonical-nav')).map(p=>({cacheKey:p.cacheKey,linked:gl.getProgramParameter(p.program,gl.LINK_STATUS)===true}));
  const expectedForegroundPrograms=1;
  if(foregroundShaderPrograms.length!==expectedForegroundPrograms||foregroundShaderPrograms.some(p=>!p.linked))throw new Error('Foreground GPU shader link failed');
  const sceneResponse=await fetch(new URL('../'+RIFT_TERRAIN.scene,import.meta.url));
  if(!sceneResponse.ok)throw new Error('맵 등록 대조 원자료 HTTP '+sceneResponse.status);
  registration=await assessRegistration(terrain.sourceSceneSnapshot(),{canonicalBytes:await sceneResponse.arrayBuffer()});
  if(!registration.ok)throw new Error('맵 정본 핀·배치·투영 대조 실패');
  contactUnderlay=await createRiftContactUnderlay({THREE,terrain,enabled:$('cliff-contact').checked});
  if(state.disposed){contactUnderlay.dispose();throw new Error('페이지 종료');}
  scene.add(contactUnderlay.object3d);
  renderer.compile(contactUnderlay.object3d,camera);
  contactShaderPrograms=renderer.info.programs.filter(p=>p.cacheKey.includes('rift-contact-underlay')).map(p=>({cacheKey:p.cacheKey,linked:gl.getProgramParameter(p.program,gl.LINK_STATUS)===true}));
  if(contactShaderPrograms.length!==2||contactShaderPrograms.some(p=>!p.linked))throw new Error('Contact underlay GPU shader link failed');
  observeFoot=worldFootProvider(terrain,THREE);realNav=realNavFromTerrain(terrain);
  const residentScene=terrain.sourceSceneSnapshot();
  residentAccess=inspectResidentAccess(residentScene,(_s,x,y,r)=>terrain.canWalk(x,y,r));
  if(residentAccess.mode!=='independent'||residentAccess.rows.some(r=>r.status!=='ready'))throw new Error('주민 접근 지점이 정본 보행과 일치하지 않습니다');
  const dialogueResponse=await fetch(new URL('./team-followup-20261005/hell-rift/STORY/rift-dialogue.json',import.meta.url));
  if(!dialogueResponse.ok)throw new Error('주민 대사 원자료 HTTP '+dialogueResponse.status);
  const dialogueBytes=await dialogueResponse.arrayBuffer();
  const dialoguePin=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',dialogueBytes)),b=>b.toString(16).padStart(2,'0')).join('');
  if(dialoguePin!=='be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc')throw new Error('주민 대사 원자료 핀 불일치');
  dialogue=createRiftDialogue(residentScene,JSON.parse(new TextDecoder().decode(dialogueBytes)),(_s,x,y,r)=>terrain.canWalk(x,y,r),residentDialogueAnchors(residentScene));
  if(!dialogue)throw new Error('주민 대화 소비 계약이 일치하지 않습니다');
  dialogueObservation=createDialogueObservationConsumer({dialogueProvider:()=>dialogue});
  for(const row of residentAccess.rows)row.displayApproach=displayApproach(row);
  residents=await createRiftResidentBillboards({THREE,terrain,camera,scene,displayScale:1.8});
  const frameSpecs=checkFrameSpec();if(frameSpecs.some(r=>r.pass===false))throw new Error('캐릭터 프레임 규격 실패: '+frameSpecs.find(r=>r.pass===false).detail);
  leaf('metric-registration',`${registration.pin.status} · ${registration.walkableCount} 타일`);
  leaf('metric-editor',registration.editorRoundtrip.status);
  for(const occluder of terrain.occluders){occluder.object3d.renderOrder=30+(occluder.footY-4320)/8000*10;occluder.object3d.material.depthTest=false;occluder.object3d.material.depthWrite=false;occluder.object3d.material.transparent=true;}
  reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  interactionCue=createInteractionCueLifetime({THREE,scene,camera,terrain,options:{orderFor:riftResidentFootOrder,anchorFor:npcId=>residentDialogueAnchors(residentScene).find(a=>a.npcId===npcId)||null,reducedMotion:reducedQuery.matches}});
  if(!interactionCue.snapshot().active)throw new Error('주민 접근 표시 초기화 실패');
  for(const id of ['warrior','silvertail','dark-druid']){
    rigs[id]=await createCharacterRig(id,{THREE,height:heights[id]});scene.add(rigs[id].object3d);
    // Actor, foreground and effects share Three's transparent pass, so foot renderOrder is effective.
    rigs[id].object3d.traverse(node=>{if(node.isMesh){node.material.transparent=true;node.material.depthTest=false;node.material.depthWrite=false;node.material.needsUpdate=true;}});
    poses[id]=createDialoguePoseArbiter(id,{dialogueProvider:()=>dialogue,retrigger:false});
    effects[id]=createEffects(id);
    helpers[id]=new THREE.SkeletonHelper(rigs[id].object3d);helpers[id].material.transparent=true;helpers[id].material.depthTest=false;helpers[id].material.depthWrite=false;helpers[id].renderOrder=70;helpers[id].visible=false;scene.add(helpers[id]);
  }
  shadow=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x030a0c,transparent:true,opacity:.26,depthWrite:false,side:THREE.DoubleSide}));
  shadow.rotation.x=-Math.PI/2;shadow.renderOrder=15;scene.add(shadow);
  specialMotion=await createBakedSpecialMotion({THREE,terrain,camera,scene,height:heights['dark-druid']});
  try{wolf=await createCorruptedWolf({THREE,terrain,camera,height:.36,previewFps:6,signal:wolfAbort.signal});if(state.disposed){wolf.dispose();throw new Error('페이지 종료');}scene.add(wolf.object3d);}
  catch(error){wolfError=error instanceof Error?error.message:String(error);}
  if(state.disposed)throw new Error('종료한 화면은 다시 재생하지 않습니다');
  state.ready=true;controls.forEach(el=>el.disabled=false);$('loading').hidden=true;reset();select('warrior');
  reducedQuery.addEventListener('change',updateReducedMotion);
  observer=new ResizeObserver(resize);observer.observe($('world-canvas').parentElement);resize();resume();
  for(const id of Object.keys(labels))$(id).addEventListener('click',()=>setMode(id));
  $('character').addEventListener('change',()=>select($('character').value));
  $('bones').addEventListener('change',()=>select(state.selected));
  $('fade-foreground').addEventListener('change',()=>{pose(0);render();updateUi();});
  $('ground-detail').addEventListener('change',()=>{terrain.setGroundDetailEnabled($('ground-detail').checked);render();});
  $('cliff-contact').addEventListener('change',()=>{contactUnderlay.setEnabled($('cliff-contact').checked);render();});
  $('special-play').addEventListener('click',playSpecial);
  $('special-stop').addEventListener('click',()=>{clearIntent();applyState();});

  $('zoom').addEventListener('input',()=>{leaf('zoom-label',`${$('zoom').value}%`);resize();});
  $('pause').addEventListener('click',()=>{closeDialogue('pause-change');cancelAnchorCheck('일시정지 또는 재생 전환으로 검사 중단');state.paused=!state.paused;keys.clear();leaf('pause',state.paused?'재생':'일시정지');updateUi();});
  $('reset').addEventListener('click',reset);
  $('check-foot').addEventListener('click',beginAnchorCheck);
  $('visit-resident').addEventListener('click',visitResident);
  $('talk').addEventListener('click',talk);
  $('dialogue-close').addEventListener('click',()=>closeDialogue('manual'));
  $('wolf-near').addEventListener('click',()=>{placeWolf();render();updateUi();});
  for(const id of ['wolf-visible','wolf-mode','wolf-facing'])$(id).addEventListener('change',()=>{updateWolf(0);render();updateUi();});
}catch(error){fail(error);}
const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyJ']);
$('world-canvas').addEventListener('keydown',event=>{
  if(!state.ready)return;if(movementKeys.has(event.code)){closeDialogue('movement-input');cancelAnchorCheck('키 입력으로 검사 중단');cancelSpecial();event.preventDefault();keys.add(event.code);state.previewMode=null;if(event.code==='KeyJ'&&!event.repeat&&!state.paused)state.attackQueued=true;}
  else if(event.code==='Space'&&!event.repeat){event.preventDefault();$('pause').click();}
  else if(event.code==='KeyR'&&!event.repeat){event.preventDefault();talk();}
  else if(event.code==='Escape'&&!event.repeat){event.preventDefault();closeDialogue('escape');}
});
$('world-canvas').addEventListener('keyup',event=>{if(movementKeys.has(event.code))keys.delete(event.code);});
function handleBlur(){closeDialogue('blur');clearIntent();poses[state.selected]?.onBlur();}
$('world-canvas').addEventListener('blur',()=>{clearIntent();poses[state.selected]?.onBlur();});
window.addEventListener('blur',handleBlur);
$('world-canvas').addEventListener('webglcontextlost',event=>{event.preventDefault();state.contextLost=true;fail(new Error('WebGL 컨텍스트 소실. 페이지를 다시 열어 주세요.'));});
document.addEventListener('visibilitychange',()=>{clearIntent();if(document.hidden)stopFrame();else resume();});
window.addEventListener('pagehide',dispose,{once:true});
window.__rift25Lab=Object.freeze({enterPreview,snapshot:()=>{let actor;rigs[state.selected]?.object3d.traverse(n=>{if(n.isSkinnedMesh)actor=n;});return {...state,previewEntry:previewEntrySnapshot(),raf:!!state.raf,rig:rigs[state.selected]?.snapshot(),poseConsumer:poses[state.selected]?.snapshot(),effects:effects[state.selected]?.snapshot(),specialMotion:specialMotion?.snapshot(),actorVisible:rigs[state.selected]?.object3d.visible,shadowVisible:shadow?.visible,acceptance:structuredClone(acceptance),registration:structuredClone(registration),residents:residents?.snapshot(),interactionCue:interactionCue?.snapshot(),residentAccess:structuredClone(residentAccess),dialogue:dialogue?structuredClone(dialogue.snapshot()):null,dialogueObservation:dialogueObservation?.snapshot(),wolf:wolf?.snapshot(),wolfPlacement:wolfPlacement?{...wolfPlacement,canWalk:terrain.canWalk(wolfPlacement.x,wolfPlacement.y,wolfPlacement.radius)}:null,wolfError,nearestNpc:structuredClone(nearestNpc),cameraPosition:camera?.position.toArray(),diagnosticProvenance:{INTERACTION:INTERACTION_CUE_PROVENANCE,QA:SLICE_ACCEPTANCE_PROVENANCE,MAP:SCENE_REGISTRATION_PROVENANCE},renderContract:actor?{transparent:actor.material.transparent,depthWrite:actor.material.depthWrite,depthTest:actor.material.depthTest,actorOrder:actor.renderOrder,actorScenePosition:rigs[state.selected].object3d.position.toArray(),shadowScenePosition:shadow.position.toArray(),foregroundOrders:terrain.occluders.map(o=>o.object3d.renderOrder)}:null,terrain:terrain?.snapshot(),contactUnderlay:contactUnderlay?.snapshot(),contactShaderPrograms:contactShaderPrograms.map(p=>({...p})),foregroundShaderPrograms:foregroundShaderPrograms.map(p=>({...p})),canvas:{width:$('world-canvas').width,height:$('world-canvas').height}};}});
