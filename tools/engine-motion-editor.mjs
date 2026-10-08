import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {createCharacterRig} from './2_5d/character-rigs.mjs?v=druid-authored-pose-20261008-v6';
import {normalizeClip,bindClip} from './engine/animation-clip.mjs?v=20261009-v1';

const $=id=>document.getElementById(id), axes=['x','y','z'];
const write=(id,value)=>{const n=$(id);if(n&&n.children.length===0)n.textContent=String(value);};
const copy=value=>JSON.parse(JSON.stringify(value));
const labels={root:'기준점',waist:'골반',torso:'몸통',head:'머리','arm-left':'왼팔','arm-right':'오른팔','forearm-left':'왼쪽 아래팔','forearm-right':'오른쪽 아래팔','robe-left':'왼쪽 망토','robe-right':'오른쪽 망토','foot-left':'왼발','foot-right':'오른발'};
const properties={rotation:'회전',position:'위치',scale:'크기'};
const canvas=$('viewport'),stage=$('stage'),nodes=new Map(),rests=new Map(),undo=[],redo=[];
let rig,scene,camera,renderer,helper,selectionAxes,observer,player,clip;
let selected='dark-druid-torso',property='rotation',time=0,playing=false,lastTime=0,raf=0,disposed=false,failed=false,dirty=false,draft=false;

function uiClip(value){
  const next=normalizeClip(value);
  if(next.tracks.length>64||next.tracks.reduce((sum,t)=>sum+t.keys.length,0)>2048)throw new Error('편집 화면은 최대 64트랙·2048키를 지원합니다.');
  for(const track of next.tracks)if(!nodes.has(track.target))throw new Error(`현재 리그에 없는 대상: ${track.target}`);
  return next;
}
function resetTransforms(){for(const [id,rest]of rests){const node=nodes.get(id);for(const p of Object.keys(rest))node[p].set(...rest[p]);}}
function replaceClip(value,{remember=true}={}){
  const next=uiClip(value),previous=clip;
  if(previous&&JSON.stringify(previous)===JSON.stringify(next))return false;
  pause();player?.dispose();resetTransforms();
  try{player=bindClip(next,id=>nodes.get(id));}
  catch(error){resetTransforms();if(previous){player=bindClip(previous,id=>nodes.get(id));player.seek(time);}throw error;}
  if(previous&&remember){undo.push(copy(previous));if(undo.length>40)undo.shift();redo.length=0;}
  clip=next;time=Math.min(time,clip.durationSeconds);dirty=remember||dirty;draft=false;player.seek(time);renderTracks();updateControls();schedule();return true;
}
function makeExample(){
  const frames=[0,.55,.85,1.3,1.8], poses={torso:[0,-8,12,3,0],head:[0,6,-10,-2,0],'arm-left':[0,-28,20,6,0],'arm-right':[0,18,-16,-4,0]};
  return {format:'exoduser-animation-clip',version:1,name:'드루이드 · 편집 예제',durationSeconds:1.8,
    tracks:Object.entries(poses).map(([name,angles])=>({target:`dark-druid-${name}`,property:'rotation',interpolation:'smooth',keys:frames.map((t,i)=>({time:t,value:[0,0,angles[i]*Math.PI/180]}))}))};
}
function targetLabel(id){return id==='dark-druid-object'?'전체 캐릭터':labels[id.replace('dark-druid-','')]||id;}
function currentTrack(){return clip?.tracks.find(t=>t.target===selected&&t.property===property);}
function setNotice(value){write('notice',value);}
function updateControls(){
  if(!clip)return;
  $('target').value=selected;$('property').value=property;$('duration').value=String(clip.durationSeconds);$('clip-name').value=clip.name;
  $('seek').max=String(clip.durationSeconds);$('seek').value=String(time);write('time',`${time.toFixed(2)} / ${clip.durationSeconds.toFixed(2)} s`);
  $('interpolation').value=currentTrack()?.interpolation||'smooth';
  const vector=nodes.get(selected)?.[property],factor=property==='rotation'?180/Math.PI:1;
  axes.forEach(axis=>{const input=$(`axis-${axis}`);if(document.activeElement!==input)input.value=String(Number((vector[axis]*factor).toFixed(4)));input.step=property==='rotation'?'1':'0.01';input.min=property==='scale'?'0.001':'';});
  $('remove').disabled=!currentTrack()?.keys.some(k=>Math.abs(k.time-time)<.000001);
  $('undo').disabled=!undo.length;$('redo').disabled=!redo.length;
  write('project-status',dirty?'변경 있음 · 내려받아 보관':'모션 데이터 준비됨');
  for(const button of $('hierarchy').querySelectorAll('button'))button.classList.toggle('selected',button.dataset.target===selected);
  if(selectionAxes&&nodes.has(selected))nodes.get(selected).add(selectionAxes);
  if(draft)setNotice('미기록 자세 · 키프레임을 기록하세요.');
}
function renderTracks(){
  const container=$('tracks');container.replaceChildren();
  if(!clip.tracks.length){const empty=document.createElement('p');empty.className='empty';empty.append(document.createTextNode('관절의 값을 바꾼 뒤 첫 키프레임을 기록하세요.'));container.append(empty);}
  for(const track of clip.tracks){
    const row=document.createElement('div');row.className='track';const label=document.createElement('span');label.className='track-label';label.append(document.createTextNode(`${targetLabel(track.target)} · ${properties[track.property]}`));
    const lane=document.createElement('div');lane.className='track-lane';
    for(const key of track.keys){const button=document.createElement('button');button.type='button';button.className='key';button.style.left=`${Math.max(.8,Math.min(99.2,key.time/clip.durationSeconds*100))}%`;button.title=`${targetLabel(track.target)} ${properties[track.property]} · ${key.time.toFixed(2)}초`;button.setAttribute('aria-label',button.title);button.dataset.time=String(key.time);button.dataset.target=track.target;button.dataset.property=track.property;button.addEventListener('click',()=>{selected=track.target;property=track.property;seek(key.time);});lane.append(button);}
    row.append(label,lane);container.append(row);
  }
  $('json').value=JSON.stringify(clip,null,2);selectKeys();
}
function selectKeys(){for(const key of $('tracks').querySelectorAll('.key'))key.classList.toggle('selected',key.dataset.target===selected&&key.dataset.property===property&&Math.abs(Number(key.dataset.time)-time)<.000001);}
function schedule(){if(!disposed&&!failed&&renderer&&!document.hidden&&!raf)raf=requestAnimationFrame(render);}
function pause(){playing=false;lastTime=0;write('play','▶ 재생');$('play').setAttribute('aria-pressed','false');}
function applyRecordedPose(){resetTransforms();player.seek(time);}
function seek(value){pause();time=Math.max(0,Math.min(clip.durationSeconds,value));draft=false;applyRecordedPose();setNotice('');updateControls();selectKeys();schedule();}
function render(now){
  raf=0;if(disposed||failed||!renderer)return;
  try{
    if(playing){if(lastTime)time+=Math.min(.05,(now-lastTime)/1000);lastTime=now;if(time>=clip.durationSeconds){if($('loop').checked)time%=clip.durationSeconds;else{time=clip.durationSeconds;pause();}}applyRecordedPose();updateControls();}
    const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),view=3.25/(Number($('zoom').value)/100),aspect=w/h;
    const ratio=renderer.getPixelRatio();if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio))renderer.setSize(w,h,false);
    camera.left=-view*aspect/2;camera.right=view*aspect/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();
    scene.updateMatrixWorld(true);rig.object3d.traverse(n=>{if(n.isSkinnedMesh)n.skeleton.update();});helper.visible=$('bones').checked;selectionAxes.visible=$('bones').checked;renderer.render(scene,camera);
    if(playing)schedule();
  }catch(error){fail(error);}
}
function report(error){setNotice(error instanceof Error?error.message:String(error));}
function editAxis(){
  pause();const values=axes.map(axis=>$(`axis-${axis}`).value.trim());
  if(values.some(v=>v==='')){setNotice('X·Y·Z 값을 모두 입력하세요.');return false;}
  const numbers=values.map(Number);if(numbers.some(v=>!Number.isFinite(v))||(property==='scale'&&numbers.some(v=>v<=0))){setNotice('유한한 값을 입력하세요. 크기는 0보다 커야 합니다.');return false;}
  const factor=property==='rotation'?Math.PI/180:1;nodes.get(selected)[property].set(...numbers.map(v=>v*factor));draft=true;updateControls();schedule();return true;
}
function record(){
  try{if(!editAxis())return;const next=copy(clip);let track=next.tracks.find(t=>t.target===selected&&t.property===property);if(!track){track={target:selected,property,interpolation:$('interpolation').value,keys:[]};next.tracks.push(track);}
    const value=axes.map(axis=>nodes.get(selected)[property][axis]);const key={time:Math.min(clip.durationSeconds,Number(time.toFixed(4))),value};const index=track.keys.findIndex(k=>Math.abs(k.time-key.time)<.000001);if(index<0)track.keys.push(key);else track.keys[index]=key;track.keys.sort((a,b)=>a.time-b.time);
    replaceClip(next);setNotice(`${key.time.toFixed(2)}초에 자세를 기록했습니다.`);
  }catch(error){report(error);}
}
for(const axis of axes){$(`axis-${axis}`).addEventListener('input',editAxis);$(`axis-${axis}`).addEventListener('change',editAxis);}
$('target').addEventListener('change',()=>{selected=$('target').value;seek(time);});
$('property').addEventListener('change',()=>{property=$('property').value;seek(time);});
$('record').addEventListener('click',record);
$('remove').addEventListener('click',()=>{try{const next=copy(clip),track=next.tracks.find(t=>t.target===selected&&t.property===property);if(!track)return;track.keys=track.keys.filter(k=>Math.abs(k.time-time)>=.000001);if(!track.keys.length)next.tracks=next.tracks.filter(t=>t!==track);replaceClip(next);setNotice('키프레임을 제거했습니다.');}catch(error){report(error);}});
$('revert').addEventListener('click',()=>seek(time));
$('seek').addEventListener('input',()=>seek(Number($('seek').value)));
$('play').addEventListener('click',()=>{if(playing){pause();return;}if(time>=clip.durationSeconds)time=0;draft=false;applyRecordedPose();playing=true;lastTime=0;write('play','Ⅱ 일시정지');$('play').setAttribute('aria-pressed','true');setNotice('');schedule();});
$('stop').addEventListener('click',()=>seek(0));
$('interpolation').addEventListener('change',()=>{try{const next=copy(clip),track=next.tracks.find(t=>t.target===selected&&t.property===property);if(track){track.interpolation=$('interpolation').value;replaceClip(next);}}catch(error){report(error);}});
for(const id of ['duration','clip-name'])$(id).addEventListener('change',()=>{try{const next=copy(clip);if(id==='duration')next.durationSeconds=$('duration').value.trim()===''?NaN:Number($('duration').value);else next.name=$('clip-name').value;replaceClip(next);}catch(error){report(error);updateControls();}});
$('undo').addEventListener('click',()=>{if(!undo.length)return;try{const previous=undo[undo.length-1],current=copy(clip);replaceClip(previous,{remember:false});undo.pop();redo.push(current);dirty=true;updateControls();setNotice('키프레임 변경을 되돌렸습니다.');}catch(error){report(error);}});
$('redo').addEventListener('click',()=>{if(!redo.length)return;try{const next=redo[redo.length-1],current=copy(clip);replaceClip(next,{remember:false});redo.pop();undo.push(current);dirty=true;updateControls();setNotice('키프레임 변경을 다시 실행했습니다.');}catch(error){report(error);}});
$('import').addEventListener('click',()=>{try{if($('json').value.length>1000000)throw new Error('JSON은 1,000,000자 이하만 가져올 수 있습니다.');const next=JSON.parse($('json').value);replaceClip(next);setNotice('모션을 가져왔습니다.');}catch(error){report(error);}});
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(clip,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='exoduser-motion.animation.json';a.click();URL.revokeObjectURL(url);$('json').value=JSON.stringify(clip,null,2);$('json').closest('details').open=true;updateControls();setNotice('파일 내려받기를 요청했습니다. 완료되지 않으면 아래 JSON을 보관하세요.'+(draft?' 미기록 자세는 포함되지 않습니다.':''));});
for(const id of ['zoom','bones'])$(id).addEventListener('input',schedule);
function hidden(){if(document.hidden){pause();if(raf)cancelAnimationFrame(raf);raf=0;}else schedule();}
function blur(){if(playing){pause();schedule();}}
window.addEventListener('blur',blur);window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',hidden);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fail(new Error('그래픽 연결이 끊겼습니다. 모션 JSON을 복사해 보관하세요.'));});
function fail(error){if(failed||disposed)return;failed=true;pause();if(raf)cancelAnimationFrame(raf);raf=0;for(const input of document.querySelectorAll('button,input,select'))input.disabled=true;$('loading').hidden=false;write('loading',error instanceof Error?error.message:String(error));write('project-status','로드 실패');}
function dispose(){if(disposed)return;disposed=true;pause();if(raf)cancelAnimationFrame(raf);observer?.disconnect();window.removeEventListener('blur',blur);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',hidden);player?.dispose();helper?.geometry.dispose();helper?.material.dispose();selectionAxes?.geometry.dispose();selectionAxes?.material.dispose();rig?.dispose();renderer?.dispose();}
window.addEventListener('pagehide',dispose,{once:true});

try{
  rig=await createCharacterRig('dark-druid',{THREE,height:2.2});
  if(disposed){rig.dispose();}else{
    rig.update(0,{mode:'idle',direction:0,phase:0});scene=new THREE.Scene();scene.add(rig.object3d);nodes.set('dark-druid-object',rig.object3d);
    rig.object3d.traverse(node=>{if(node.isBone){if(nodes.has(node.name))throw new Error('중복 관절 이름');nodes.set(node.name,node);}});
    for(const [id,node]of nodes){rests.set(id,Object.fromEntries(['position','rotation','scale'].map(p=>[p,axes.map(axis=>node[p][axis])])));const option=document.createElement('option');option.value=id;option.append(document.createTextNode(targetLabel(id)));$('target').append(option);
      const button=document.createElement('button');button.type='button';button.className='node';button.dataset.target=id;button.style.paddingLeft=`${id==='dark-druid-object'?8:18}px`;button.append(document.createTextNode(targetLabel(id)));button.addEventListener('click',()=>{selected=id;seek(time);});$('hierarchy').append(button);}
    helper=new THREE.SkeletonHelper(rig.object3d);helper.material.depthTest=false;helper.material.transparent=true;helper.material.opacity=.65;scene.add(helper);selectionAxes=new THREE.AxesHelper(.13);selectionAxes.material.depthTest=false;selectionAxes.renderOrder=100;
    camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,20);camera.position.set(0,1.12,5);camera.lookAt(0,1.12,0);
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0,0);
    for(const input of document.querySelectorAll('button,input,select,textarea'))input.disabled=false;
    replaceClip(makeExample(),{remember:false});$('loading').hidden=true;dirty=false;updateControls();
    observer=new ResizeObserver(schedule);observer.observe(stage);schedule();
    window.__exoduserMotionEditor=Object.freeze({snapshot:()=>({clip:copy(clip),time,playing,selected,property,draft,dirty,undo:undo.length,redo:redo.length,boneCount:[...nodes.values()].filter(n=>n.isBone).length,representation:rig.snapshot().representation,transforms:Object.fromEntries([...nodes].map(([id,node])=>[id,Object.fromEntries(['position','rotation','scale'].map(p=>[p,axes.map(axis=>node[p][axis])]))])),renderedTriangles:renderer.info.render.triangles,disposed})});
  }
}catch(error){fail(error);player?.dispose();rig?.dispose();renderer?.dispose();}
