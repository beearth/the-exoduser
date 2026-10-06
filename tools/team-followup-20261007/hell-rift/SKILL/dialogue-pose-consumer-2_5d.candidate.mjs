// dialogue-pose-consumer-2_5d.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-CONSUMER-LINK-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-CONSUMER-LINK-20261007-DIALOGUE-POSE-CONSUMER-CANDIDATE
// GOAL: CH1-RIFT-CONSUMER-LINK-20261007
//
// 목적(consumer-link): 배우당 1 arbiter(실제 public visual-pose-consumer wrap) + 실제 dialogue snapshot 을
//   연결해, root 의 단일 RAF 가 호출하는 "하나의 pose 소비자"를 제공한다. root 의 rig.update/clearIntent/
//   단일 RAF 소유는 그대로 두고(재구현0), 본 consumer 는 이벤트+대화상태 → pose params 매핑만 담당한다.
//
// v4(raw45) 대비 개선(요청2): descriptor "조회 자체"의 예외까지 전체 catch.
//   Proxy 의 getOwnPropertyDescriptor trap throw 등 → getter 호출0 로 UNKNOWN 분류(실행/크래시0).
//   (v4 는 resolveSnapshot/thenable 만 catch, ownData 의 getOwnPropertyDescriptor 는 미보호였음.)
//
// 유지: 실제 public tools/2_5d/visual-pose-consumer.mjs 소비 — run speed 1.55, finite facing 전달,
//   top-level attackRemaining. 대화 중 neutral idle + facing 유지. close/char/blur/reset 후 이전 공격 0 +
//   다음 새 입력 허용. public consumer 재구현0. 본편 스킬/입력 수치·전투/cost/timer·키 바인딩 변경0.
//   보호2_3/Q전용 magic blackBean(E패링0)/어택티켓금지/기존23/사용자save 보존.
//
// 실제 대화 계약(읽기): tools/2_5d/interaction-cue-lifetime.mjs:174 isOpen(boolean),:187 view.npcId,
//   :175 supported(있으면 true),:30 hardened own-data-prop. nodeId 는 view 내. 소비 public SHA 참조
//   d16723f497ecd2034e337fdcba9f9c25bf737edb5f9cae19e026fbb370b33305.

import { createVisualPoseConsumer } from '../../../2_5d/visual-pose-consumer.mjs';

const isObject = v => v !== null && (typeof v === 'object' || typeof v === 'function');
// descriptor 조회 자체를 try/catch(요청2). accessor면 {accessor:true}(value 미읽음=실행0). throw→{threw:true}.
function ownData(o, key){
  if(!isObject(o)||Array.isArray(o)) return {has:false};
  let d; try{ d=Object.getOwnPropertyDescriptor(o,key); }catch(_){ return {has:false,threw:true}; }
  if(!d) return {has:false};
  if(!Object.hasOwn(d,'value')) return {has:false,accessor:true};
  return {has:true,value:d.value};
}
function hasInheritedThenable(o){ try{ let p=o; for(let i=0;isObject(p)&&i<16;i++){ let d; try{ d=Object.getOwnPropertyDescriptor(p,'then'); }catch(_){ return true; } if(d){ if(typeof d.get==='function')return true; if(Object.hasOwn(d,'value')&&typeof d.value==='function')return true; } try{ p=Object.getPrototypeOf(p); }catch(_){ return true; } } }catch(_){ return true; } return false; }
const idOrNull = v => (typeof v==='string'&&v) ? v : (v==null ? null : String(v));
const finiteDir = v => (Number.isInteger(v)&&v>=0&&v<=7) ? v : undefined;

// snapshot 안전 해석: 함수형 provider 호출 | own-data snapshot 메서드 .call(receiver) | 평면 snapshot.
// accessor snapshot / descriptor throw / 호출 throw → 실행 중단 없이 UNKNOWN.
function resolveSnapshot(portOrSnap){
  if (typeof portOrSnap === 'function'){ try{ return { s: portOrSnap() }; }catch(_){ return { unknown:['dialogue-reader-threw'] }; } }
  if (!isObject(portOrSnap)) return { s: portOrSnap };
  let d; try{ d=Object.getOwnPropertyDescriptor(portOrSnap,'snapshot'); }catch(_){ return { unknown:['snapshot-descriptor-threw'] }; }
  if (d){
    if(!Object.hasOwn(d,'value')) return { unknown:['snapshot-accessor'] };
    if(typeof d.value==='function'){ try{ return { s: d.value.call(portOrSnap) }; }catch(_){ return { unknown:['snapshot-threw'] }; } }
    return { unknown:['snapshot-not-callable'] };
  }
  return { s: portOrSnap };
}

// 현행 대화 계약 읽기. 전체 try/catch(요청2). 위반/예외 → UNKNOWN(닫힘 취급, getter 호출0).
function readDialogue(portOrSnap){
  try{
    const rs = resolveSnapshot(portOrSnap);
    if (rs.unknown) return U(rs.unknown, false);
    const s = rs.s;
    if(!isObject(s)||Array.isArray(s)) return U(['dialogue-state-missing'], false);
    if(hasInheritedThenable(s)) return U(['dialogue-async-thenable'], false);
    const sup=ownData(s,'supported');
    if(sup.threw) return U(['supported-descriptor-threw'], false);
    if(sup.accessor) return U(['supported-accessor'], false);
    if(sup.has && sup.value!==true) return U(['dialogue-unsupported'], false);
    const io=ownData(s,'isOpen');
    if(io.threw) return U(['isOpen-descriptor-threw'], false);
    if(io.accessor) return U(['isOpen-accessor'], false);
    if(!io.has || typeof io.value!=='boolean') return U(['isOpen-malformed'], false);
    if(!io.value) return { ok:true, open:false, npcId:null, nodeId:null, key:null, unknown:[] };
    const vd=ownData(s,'view');
    if(vd.threw) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|view-threw', unknown:['view-descriptor-threw'] };
    if(vd.accessor) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|accessor-view', unknown:['view-accessor'] };
    if(!vd.has || !isObject(vd.value)) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|unknown-view', unknown:['view-malformed'] };
    const npcD=ownData(vd.value,'npcId'), nodeD=ownData(vd.value,'nodeId');
    const npcId=(npcD.accessor||npcD.threw)?null:idOrNull(npcD.value);
    const nodeId=(nodeD.accessor||nodeD.threw)?null:idOrNull(nodeD.value);
    const unknown=[];
    if(npcD.threw)unknown.push('view-npcId-descriptor-threw'); else if(npcD.accessor)unknown.push('view-npcId-accessor'); else if(npcId==null)unknown.push('view-npcId-missing');
    if(nodeD.threw)unknown.push('view-nodeId-descriptor-threw'); else if(nodeD.accessor)unknown.push('view-nodeId-accessor');
    return { ok:true, open:true, npcId, nodeId, key:`${npcId??''}|${nodeId??''}`, unknown };
  }catch(_){ return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['dialogue-read-threw'] }; }
  function U(unknown,open){ return { ok:false, open:!!open, npcId:null, nodeId:null, key:null, unknown }; }
}

/**
 * createDialoguePoseConsumer({ dialogue?, retrigger?, ids? })
 *   dialogue : 읽기전용 provider (함수 ()->snap | {snapshot()} | snap객체). override 로도 전달 가능.
 *   ids      : 선생성할 actor id 목록(선택). 없으면 setActor/step 에서 지연 생성.
 * 반환: { setActor, step, drive, onActorChange, onBlur, reset, release, snapshot, activeId }
 *   배우당 1 arbiter(public consumer) 소유. root 단일 RAF 가 step(dt,intent[,dialogueOverride]) 호출 후
 *   반환 params 로 rig.update. root clearIntent/단일 RAF/rig.update 는 그대로(재구현0).
 */
export function createDialoguePoseConsumer(opts = {}){
  const dialoguePort = opts.dialogue ?? null;
  const retrigger = opts.retrigger === true;
  const poses = new Map();     // actorId -> public visual-pose-consumer (배우당 1)
  let suspended=false, lastKey=null, activeId=null;

  function poseFor(id){
    let p=poses.get(id);
    if(!p){ p=createVisualPoseConsumer(id, { retrigger }); poses.set(id,p); }
    return p;
  }
  function setActor(id){
    if(id===activeId) return snapshot();
    if(activeId!=null && poses.has(activeId)) poses.get(activeId).release(); // outgoing: 이전 공격 0
    suspended=false; lastKey=null; activeId=id;
    return snapshot();
  }
  function step(dt, intent = {}, dialogueOverride){
    if(activeId==null) return Object.freeze({ params:null, arbitration:'no-actor', attackRemaining:0, dialogue:null, providersUnknown:['no-active-actor'], actorId:null });
    const pose = poseFor(activeId);
    const d = readDialogue(dialogueOverride!==undefined ? dialogueOverride : dialoguePort);
    const providersUnknown = d.unknown.slice();
    if (d.open){
      if (!suspended){ pose.release(); suspended=true; lastKey=d.key; }
      else if (d.key!==lastKey){ pose.release(); lastKey=d.key; }
    } else if (suspended){ pose.release(); suspended=false; lastKey=null; }
    let r;
    if (suspended){
      const neutral={ dx:0, dy:0, run:false, attack:false };
      const f=finiteDir(intent.facing); if(f!==undefined) neutral.facing=f; // 대화 중 facing 유지
      r=pose.resolve(dt, neutral);
    } else r=pose.resolve(dt, intent);
    return Object.freeze({
      params: r.params, supported: r.supported,
      arbitration: suspended ? 'suspended' : 'active',
      attackRemaining: r.attackRemaining,
      dialogue: Object.freeze({ open:d.open, npcId:d.npcId, nodeId:d.nodeId, key:d.key }),
      providersUnknown, actorId: activeId,
    });
  }
  function drive(rig, dt, intent, dialogueOverride){
    if(!rig || typeof rig.update!=='function') throw new Error('rig.update API 필요');
    const r=step(dt,intent,dialogueOverride);
    if(r.params) rig.update(dt, r.params);  // root 단일 RAF 가 호출; 여기서 루프 생성0
    return Object.freeze({ ...r, object3d: rig.object3d });
  }
  function release(reason){ if(activeId!=null && poses.has(activeId)) poses.get(activeId).release(); suspended=false; lastKey=null; return snapshot(reason); }
  const onActorChange = id => { release('actor-change'); if(id!==undefined) activeId=id; return snapshot('actor-change'); };
  const onBlur = () => release('blur');
  const reset  = () => release('reset');
  function snapshot(reason){
    const p = activeId!=null ? poses.get(activeId) : null;
    const ps = p ? p.snapshot() : null;
    return Object.freeze({ activeId, suspended, lastDialogueKey:lastKey, lastReason:reason??null,
      actors:[...poses.keys()], attackRemaining: ps?ps.attackRemaining:0, direction: ps?ps.direction:null, mode: ps?ps.mode:null });
  }
  if(Array.isArray(opts.ids)) for(const id of opts.ids){ try{ poseFor(id); }catch(_){} }
  return Object.freeze({ setActor, step, drive, onActorChange, onBlur, reset, release, snapshot,
    get activeId(){ return activeId; } });
}

export default { createDialoguePoseConsumer };

/* ── 인라인 자가검증 (node stdin 1회; FAIL→throw→nonzero). 실제 public API 소비 ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ if(c)pass++; else { fail++; console.error('FAIL:',n); } };
  const open=(npcId='rift-rest-haran',nodeId='meet')=>({ isOpen:true, view:{npcId,nodeId} });
  const shut=()=>({ isOpen:false, view:null });

  // 1) 배우당 1 arbiter + 실제 public API(run 1.55 / facing / top-level attackRemaining)
  const c=createDialoguePoseConsumer({ dialogue:shut, ids:['warrior','silvertail'] });
  c.setActor('warrior');
  ok('no-actor before setActor guarded', createDialoguePoseConsumer({dialogue:shut}).step(0.1,{}).arbitration==='no-actor');
  ok('walk passthrough', c.step(0.1,{dx:0,dy:1}).params.mode==='walk');
  ok('run speed 1.55', c.step(0.1,{dx:1,dy:0,run:true}).params.speed===1.55);
  ok('top-level attackRemaining', c.step(0.1,{attack:true}).attackRemaining>0);
  c.release();

  // 2) descriptor 조회 예외(Proxy getOwnPropertyDescriptor trap throw) → getter 호출0 + UNKNOWN
  const proxyThrow=new Proxy({}, { getOwnPropertyDescriptor(){ throw new Error('trap'); }, get(){ throw new Error('no-get'); } });
  const cP=createDialoguePoseConsumer({ dialogue:()=>proxyThrow }); cP.setActor('warrior');
  const rP=cP.step(0.1,{dx:1,dy:0});
  ok('descriptor-throw → UNKNOWN (no crash)', rP.providersUnknown.length>0 && rP.arbitration==='active' && rP.params.mode==='walk');

  // snapshot getter 실행0 + UNKNOWN
  let gr=0; const g={}; Object.defineProperty(g,'snapshot',{get(){gr++;return ()=>open();},enumerable:true});
  const cG=createDialoguePoseConsumer({ dialogue:g }); cG.setActor('warrior');
  const rG=cG.step(0.1,{});
  ok('snapshot getter not executed', gr===0 && rG.providersUnknown.includes('snapshot-accessor'));

  // 3) 대화 중 neutral idle + facing 유지; close/char/blur/reset 후 이전 공격0 + 다음 새 입력 허용
  let dlg=shut(); const c3=createDialoguePoseConsumer({ dialogue:()=>dlg }); c3.setActor('warrior');
  c3.step(0.1,{attack:true}); // 공격 개시
  dlg=open();
  const rs=c3.step(0.1,{facing:5, dx:1,dy:0, attack:true});
  ok('dialogue neutral idle', rs.arbitration==='suspended' && rs.params.mode==='idle');
  ok('dialogue keeps facing5', rs.params.direction===5);
  ok('old attack cleared on enter', c3.snapshot().attackRemaining===0);
  dlg=shut();
  ok('resume idle after close', c3.step(0.1,{}).params.mode==='idle');
  ok('next new attack allowed after close', c3.step(0.1,{attack:true}).params.mode==='attack');

  // actor change → outgoing 이전 공격0, 신규 입력 허용
  const c4=createDialoguePoseConsumer({ dialogue:shut }); c4.setActor('warrior');
  c4.step(0.1,{attack:true}); ok('warrior mid-attack', c4.snapshot().attackRemaining>0);
  c4.setActor('silvertail'); // outgoing warrior release
  const wSnap=c4.snapshot(); ok('switched to silvertail idle', wSnap.activeId==='silvertail' && wSnap.attackRemaining===0);
  ok('new actor accepts attack', c4.step(0.1,{attack:true}).params.mode==='attack');
  c4.setActor('warrior'); ok('warrior residue cleared on switch-away', c4.snapshot().attackRemaining===0);

  // blur/reset 후 이전 공격0 + 다음 입력 허용
  const c5=createDialoguePoseConsumer({ dialogue:shut }); c5.setActor('warrior');
  c5.step(0.1,{attack:true}); c5.onBlur(); ok('blur→0', c5.snapshot().attackRemaining===0);
  ok('attack after blur allowed', c5.step(0.1,{attack:true}).params.mode==='attack');
  c5.reset(); ok('reset→0', c5.snapshot().attackRemaining===0);

  // view.nodeId accessor → UNKNOWN + 실행0; provider 쓰기 메서드 호출0
  let nr=0; const vv={npcId:'x'}; Object.defineProperty(vv,'nodeId',{get(){nr++;return 'y';},enumerable:true});
  const cN=createDialoguePoseConsumer({ dialogue:()=>({isOpen:true,view:vv}) }); cN.setActor('warrior');
  const rN=cN.step(0.1,{});
  ok('view-nodeId-accessor UNKNOWN + no exec', rN.providersUnknown.includes('view-nodeId-accessor') && nr===0);
  let wrote=false; const spy={isOpen:true,view:{npcId:'x',nodeId:'y'},choose(){wrote=true;},grant(){wrote=true;},close(){wrote=true;}};
  const cW=createDialoguePoseConsumer({ dialogue:spy }); cW.setActor('warrior'); cW.step(0.1,{attack:true}); cW.step(0.1,{});
  ok('no write on provider', wrote===false);

  // drive(mock rig): root 단일 RAF 가 rig.update 호출(여기선 단발)
  let cap=null; const mock={object3d:{t:'o'},update:(dt,p)=>{cap=p;return mock.object3d;}};
  const cD=createDialoguePoseConsumer({ dialogue:()=>open() }); cD.setActor('silvertail');
  cD.drive(mock,0.1,{facing:2, dx:1,dy:0});
  ok('drive during open neutral+facing2', cap.mode==='idle' && cap.direction===2);

  console.log(`dialogue-pose-consumer-2_5d self-test: ${pass} pass, ${fail} fail`);
  if(fail>0) throw new Error(`${fail} assertion(s) FAILED`);
  return true;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('dialogue-pose-consumer-2_5d.candidate.mjs')){
  _selfTest();
}
