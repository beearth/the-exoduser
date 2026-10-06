/* Root-adopted derivative of the pinned MAP editor-entry candidate.
 * Only the borrowed previewPort changes a transient lab pose. No scene/history/save writes.
 * Port handles: restore() restores only their own active token; dispose() only releases it.
 */
import '../map-scene-core.js';
import {assessRegistration} from './scene-registration.mjs';
import {prepareResidentPreview} from '../map-scene-resident-preview.mjs';

const K = globalThis.MapSceneCore;
const NPC_BY_OBJECT = new Map([
  ['obj-resident-haran','rift-rest-haran'], ['obj-resident-berin','rift-gift-berin'],
  ['obj-resident-nessa','rift-request-nessa'], ['obj-resident-dorik','rift-prepare-dorik']
]);
const own = (o,k) => {
  if(!o || typeof o!=='object') throw new Error('UNKNOWN · 편집기 상태 형식');
  const d=Object.getOwnPropertyDescriptor(o,k);
  if(d && !Object.hasOwn(d,'value')) throw new Error('UNKNOWN · getter '+k);
  return d?.value;
};
function plainCopy(value, seen=new Set(), budget={left:150000}, depth=0) {
  if(--budget.left<0 || depth>64) throw new Error('UNKNOWN · 상태 규모');
  if(value===null || typeof value==='string' || typeof value==='boolean') return value;
  if(typeof value==='number' && Number.isFinite(value)) return value;
  if(typeof value!=='object' || seen.has(value)) throw new Error('UNKNOWN · 비JSON 상태');
  const proto=Object.getPrototypeOf(value);
  if(!Array.isArray(value) && proto!==Object.prototype && proto!==null) throw new Error('UNKNOWN · 상태 prototype');
  if(own(value,'then')!==undefined) throw new Error('UNKNOWN · thenable 상태');
  seen.add(value);
  const out=Array.isArray(value)?[]:{};
  for(const key of Object.keys(value)) {
    if(key==='__proto__') throw new Error('UNKNOWN · 상태 key');
    out[key]=plainCopy(own(value,key),seen,budget,depth+1);
  }
  seen.delete(value);
  return out;
}
function editorState(value) {
  if(own(value,'then')!==undefined) throw new Error('UNKNOWN · readEditor는 동기 상태여야 합니다');
  if(own(value,'ready')!==true) throw new Error('편집기 준비 전');
  for(const key of ['busy','playing']) {
    const flag=own(value,key);
    if(flag!==undefined && typeof flag!=='boolean') throw new Error('UNKNOWN · '+key);
    if(flag===true) throw new Error('편집기 작업 또는 보행 시험 중');
  }
  let scene=own(value,'scene'), selected=own(value,'selected');
  if(scene===undefined) {
    const snapshot=own(value,'snapshot'), selection=own(value,'selection');
    if(typeof snapshot!=='function') throw new Error('편집기 snapshot 없음');
    const result=snapshot.call(value);
    if(own(result,'scene')!==undefined) {
      scene=own(result,'scene'); selected=own(result,'selected');
    } else {
      scene=result;
      if(typeof selection!=='function') throw new Error('편집기 selection 없음');
      selected=selection.call(value);
    }
  }
  if(typeof selected!=='string' || !NPC_BY_OBJECT.has(selected)) throw new Error('선택한 객체는 지원 주민이 아닙니다');
  return {scene:plainCopy(scene), objectId:selected, npcId:NPC_BY_OBJECT.get(selected)};
}
function byteCopy(bytes) {
  if(bytes instanceof ArrayBuffer) return new Uint8Array(bytes.slice(0));
  if(ArrayBuffer.isView(bytes) && bytes.byteLength<=32000000) return new Uint8Array(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength));
  throw new Error('실제 canonical bytes가 필요합니다');
}

export function createEditorPreviewEntry({readEditor,canonicalBytes,previewPort}={}) {
  if(typeof readEditor!=='function') throw new Error('readEditor 함수가 필요합니다');
  const portEnter=own(previewPort,'enter');
  if(typeof portEnter!=='function') throw new Error('previewPort.enter 함수가 필요합니다');
  const pinnedBytes=byteCopy(canonicalBytes);
  if(pinnedBytes.byteLength>32000000) throw new Error('canonical bytes 최대 32MB');
  let epoch=0, disposed=false, active=null, pending=0, lastReason=null;
  const released=new WeakSet();
  const reject=reason => {lastReason=reason;return {entered:false,reason};};
  const current=id => !disposed && epoch===id;
  function handleMethods(handle) {
    if(!handle || typeof handle!=='object' || own(handle,'then')!==undefined) throw new Error('UNKNOWN · preview restore handle');
    const restore=own(handle,'restore'), dispose=own(handle,'dispose');
    if(typeof restore!=='function' || (dispose!==undefined && typeof dispose!=='function')) throw new Error('UNKNOWN · restore()/dispose() 계약');
    return {handle,restore,dispose};
  }
  function release(record,restore) {
    if(!record || released.has(record.handle)) return;
    released.add(record.handle);
    for(const fn of [restore?record.restore:null,record.dispose]) if(fn) {
      try {const result=fn.call(record.handle);if(result!==undefined) Promise.resolve(result).catch(()=>{});} catch (_) { /* cleanup never creates an unhandled rejection */ }
    }
  }
  async function enter() {
    if(disposed) return reject('어댑터 종료됨');
    const id=++epoch;
    pending++;
    try {
      const state=editorState(readEditor());
      const reg=await assessRegistration(state.scene,{canonicalBytes:pinnedBytes});
      if(!current(id)) return reject('요청 취소됨 · registration');
      if(reg.ok!==true) return reject('정본 배치·crop·nav·원자료 불일치');
      const prep=prepareResidentPreview(state.scene,state.npcId,(s,x,y,r)=>K.canWalk(s,x,y,r));
      if(prep.ready!==true || prep.objectId!==state.objectId) return reject(prep.reason||'주민 접근점 확인 실패');
      // Selection or data may have changed during canonical hashing; never use a stale click.
      const fresh=editorState(readEditor());
      if(fresh.objectId!==state.objectId || JSON.stringify(fresh.scene)!==JSON.stringify(state.scene)) return reject('검사 중 편집기 선택 또는 씬이 변경됐습니다');
      if(!current(id)) return reject('요청 취소됨 · preview');
      const record=handleMethods(await portEnter.call(previewPort,{npcId:state.npcId,objectId:state.objectId,x:prep.player.x,y:prep.player.y}));
      if(!current(id)) {release(record,true);return reject('요청 취소됨 · 늦은 preview 복구');}
      const prior=active;
      active=record;
      if(prior?.handle!==record.handle) release(prior,false);
      lastReason=null;
      return {entered:true,npcId:state.npcId,objectId:state.objectId,player:{...prep.player},assess:{pin:reg.pin.status,canonicalCompare:reg.canonicalCompare.status,walkableCount:reg.walkableCount,editorRoundtrip:reg.editorRoundtrip.status}};
    } catch(error) {return reject('진입 실패 · '+(error instanceof Error?error.message:'UNKNOWN'));}
    finally {pending--;}
  }
  function cancel() {if(disposed)return;epoch++;release(active,true);active=null;}
  function dispose() {if(disposed)return;disposed=true;epoch++;release(active,true);active=null;}
  return Object.freeze({enter,cancel,dispose,snapshot:()=>({disposed,pending,active:!!active,epoch,lastReason})});
}
export const EDITOR_PREVIEW_ENTRY=Object.freeze({
  completionId:'ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007',
  candidateSha256:'d4b805be94ae4a55901ecc6987221569b58e463d0b5d3d32933708af1c668c2e',
  canonicalScene:'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json',
  owned:'epoch, detached canonical bytes, active restore handle',
  borrowed:'readEditor, previewPort; dispose only releases the port token, restore is token-guarded',
  physicalHeight:'UNKNOWN',nativeAccepted:false,visualAssessed:false
});
