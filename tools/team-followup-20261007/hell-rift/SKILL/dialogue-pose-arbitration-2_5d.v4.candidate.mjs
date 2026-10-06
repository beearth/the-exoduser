// dialogue-pose-arbitration-2_5d.v4.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-QUALITY-FIX-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-FIX-20261007-DIALOGUE-POSE-V4-CANDIDATE
// GOAL: CH1-RIFT-QUALITY-FIX-20261007
//
// v4 결함수정(v3 raw f3b01624… 대비):
//   (A) v3:38 — `typeof portOrSnap.snapshot` 및 `portOrSnap.snapshot()` 가 snapshot 이 getter 면
//       accessor 를 "실행"했다. v4: snapshot 을 own-data method 로만 해석하고 receiver 보존 .call;
//       accessor/throw/미존재는 실행 없이 UNKNOWN. (safe own-data method.call(receiver))
//   (B) v3:53 — view.nodeId 가 accessor 면 null 로만 떨어지고 UNKNOWN[] 누락. v4: `view-nodeId-accessor`
//       를 UNKNOWN 으로 명시. (field getter 는 어느 필드든 실행0 → ownData 가 value 를 읽지 않음.)
//   유지: 수정 public tools/2_5d/visual-pose-consumer.mjs 소비(run speed 1.55 / finite facing 전달 /
//       top-level attackRemaining / 대화 close·char·blur·reset 후 옛 공격 0). public consumer 재구현0.
//
// 역할 경계(SKILL=visual pose 소비만): 대화 node/세션/선택/grant/quest/save 는 STORY/root 소유(읽기만).
//   본편 스킬/입력 수치·전투/cost/timer·키 바인딩 쓰기0. 보호2_3/Q전용 magic blackBean(E패링0)/어택티켓/기존23/save 보존.
//
// 실제 대화 계약(읽기): tools/2_5d/interaction-cue-lifetime.mjs:174 isOpen(boolean),:187 view.npcId,
//   :175 supported(있으면 true),:30 hardened own-data-prop(accessor/thenable/비객체 거부). nodeId 는 view 내.
// 소비 public: tools/2_5d/visual-pose-consumer.mjs (SHA 참조 d16723f497ecd2034e337fdcba9f9c25bf737edb5f9cae19e026fbb370b33305).

import { createVisualPoseConsumer } from '../../../2_5d/visual-pose-consumer.mjs';

const isObject = v => v !== null && (typeof v === 'object' || typeof v === 'function');
// own-data-prop 만 반환. accessor면 {accessor:true}(value 미읽음=실행0). 없으면 {has:false}.
function ownData(o, key){ if(!isObject(o)||Array.isArray(o)) return {has:false}; const d=Object.getOwnPropertyDescriptor(o,key); if(!d) return {has:false}; if(!Object.hasOwn(d,'value')) return {has:false,accessor:true}; return {has:true,value:d.value}; }
// 상속 포함 thenable(프로토타입 체인). accessor then 도 실행 없이 thenable 취급.
function hasInheritedThenable(o){ try{ let p=o; for(let i=0;isObject(p)&&i<16;i++){ const d=Object.getOwnPropertyDescriptor(p,'then'); if(d){ if(typeof d.get==='function')return true; if(Object.hasOwn(d,'value')&&typeof d.value==='function')return true; } p=Object.getPrototypeOf(p); } }catch(_){ return true; } return false; }
const idOrNull = v => (typeof v==='string'&&v) ? v : (v==null ? null : String(v));
const finiteDir = v => (Number.isInteger(v)&&v>=0&&v<=7) ? v : undefined;

// v4 (A): snapshot 을 안전하게 해석. 반환 { s? , unknown? }.
//   - 함수형 provider: 호출측이 reader 로 전달 → 호출(의도된 reader, field getter 아님).
//   - 객체 provider: own-data `snapshot` 메서드만 receiver 보존 .call. accessor/throw → UNKNOWN(실행0).
//     own snapshot 없으면 객체 자체를 평면 snapshot 으로 취급(실행0).
function resolveSnapshot(portOrSnap){
  if (typeof portOrSnap === 'function'){ try{ return { s: portOrSnap() }; }catch(_){ return { unknown:['dialogue-reader-threw'] }; } }
  if (!isObject(portOrSnap)) return { s: portOrSnap };
  const d = Object.getOwnPropertyDescriptor(portOrSnap, 'snapshot');
  if (d){
    if (!Object.hasOwn(d,'value')) return { unknown:['snapshot-accessor'] };          // getter → 실행0, UNKNOWN
    if (typeof d.value === 'function'){ try{ return { s: d.value.call(portOrSnap) }; }catch(_){ return { unknown:['snapshot-threw'] }; } }
    return { unknown:['snapshot-not-callable'] };
  }
  return { s: portOrSnap }; // own snapshot 없음 → 평면 snapshot 객체로 취급
}

// 현행 대화 계약 읽기: {isOpen:boolean, view:{npcId,nodeId}, supported?:true}. 위반 → UNKNOWN(닫힘 취급).
function readDialogueV4(portOrSnap){
  const rs = resolveSnapshot(portOrSnap);
  if (rs.unknown) return U(rs.unknown, false);
  const s = rs.s;
  if(!isObject(s)||Array.isArray(s)) return U(['dialogue-state-missing'], false);
  if(hasInheritedThenable(s)) return U(['dialogue-async-thenable'], false);
  const sup=ownData(s,'supported');
  if(sup.accessor) return U(['supported-accessor'], false);
  if(sup.has && sup.value!==true) return U(['dialogue-unsupported'], false);
  const io=ownData(s,'isOpen');
  if(io.accessor) return U(['isOpen-accessor'], false);
  if(!io.has || typeof io.value!=='boolean') return U(['isOpen-malformed'], false);
  if(!io.value) return { ok:true, open:false, npcId:null, nodeId:null, key:null, unknown:[] };
  const vd=ownData(s,'view');
  if(vd.accessor) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|accessor-view', unknown:['view-accessor'] };
  if(!vd.has || !isObject(vd.value)) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|unknown-view', unknown:['view-malformed'] };
  const npcD=ownData(vd.value,'npcId'), nodeD=ownData(vd.value,'nodeId');
  const npcId=npcD.accessor?null:idOrNull(npcD.value);
  const nodeId=nodeD.accessor?null:idOrNull(nodeD.value);
  const unknown=[];
  if(npcD.accessor)unknown.push('view-npcId-accessor'); else if(npcId==null)unknown.push('view-npcId-missing');
  if(nodeD.accessor)unknown.push('view-nodeId-accessor');                              // v4 (B): 누락 보완
  return { ok:true, open:true, npcId, nodeId, key:`${npcId??''}|${nodeId??''}`, unknown };
  function U(unknown,open){ return { ok:false, open:!!open, npcId:null, nodeId:null, key:null, unknown }; }
}

/**
 * createDialoguePoseArbiter(id,{retrigger?,dialogue?})
 * 반환: { resolve, drive, onActorChange, onBlur, reset, release, snapshot, id }
 *   resolve → { params, supported, arbitration, attackRemaining(top-level), dialogue, providersUnknown }
 */
export function createDialoguePoseArbiter(id, opts = {}){
  const pose = createVisualPoseConsumer(id, { retrigger: opts.retrigger === true });
  const dialoguePort = opts.dialogue ?? null;
  let suspended=false, lastKey=null;

  function resolve(dt, intent = {}, dialogueOverride){
    const d = readDialogueV4(dialogueOverride!==undefined ? dialogueOverride : dialoguePort);
    const providersUnknown = d.unknown.slice();
    if (d.open){
      if (!suspended){ pose.release(); suspended=true; lastKey=d.key; }
      else if (d.key!==lastKey){ pose.release(); lastKey=d.key; }
    } else if (suspended){ pose.release(); suspended=false; lastKey=null; }

    let r;
    if (suspended){
      const neutral = { dx:0, dy:0, run:false, attack:false };
      const f = finiteDir(intent.facing);
      if (f!==undefined) neutral.facing = f;                   // finite facing 보존(대면)
      r = pose.resolve(dt, neutral);
    } else {
      r = pose.resolve(dt, intent);
    }
    return Object.freeze({
      params: r.params, supported: r.supported,
      arbitration: suspended ? 'suspended' : 'active',
      attackRemaining: r.attackRemaining,                      // top-level
      dialogue: Object.freeze({ open:d.open, npcId:d.npcId, nodeId:d.nodeId, key:d.key }),
      providersUnknown,
    });
  }
  function drive(rig, dt, intent, dialogueOverride){
    if(!rig || typeof rig.update!=='function') throw new Error('rig.update API 필요');
    const r=resolve(dt,intent,dialogueOverride); rig.update(dt,r.params);
    return Object.freeze({ ...r, object3d: rig.object3d });
  }
  function release(reason){ pose.release(); suspended=false; lastKey=null; return snapshot(reason); }
  const onActorChange = () => release('actor-change');
  const onBlur        = () => release('blur');
  const reset         = () => release('reset');
  function snapshot(reason){ const ps=pose.snapshot(); return Object.freeze({ id, suspended, lastDialogueKey:lastKey, lastReason:reason??null, attackRemaining:ps.attackRemaining, direction:ps.direction, mode:ps.mode }); }
  return Object.freeze({ resolve, drive, onActorChange, onBlur, reset, release, snapshot, id });
}

export default { createDialoguePoseArbiter };

/* ── 인라인 자가검증 (node stdin 1회; 실패시 throw/nonzero). 실제 public API 소비 ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ if(c)pass++; else { fail++; console.error('FAIL:',n); } };
  const open=(npcId='rift-rest-haran',nodeId='meet')=>({ isOpen:true, view:{npcId,nodeId} });
  const shut=()=>({ isOpen:false, view:null });

  // v4(A): snapshot 이 getter 인 provider → 실행0 + UNKNOWN(snapshot-accessor)
  const gSnap={}; let snapGetterRuns=0; Object.defineProperty(gSnap,'snapshot',{get(){snapGetterRuns++;return ()=>open();},enumerable:true});
  const rA=createDialoguePoseArbiter('warrior',{dialogue:gSnap}).resolve(0.1,{});
  ok('snapshot getter NOT executed', snapGetterRuns===0);
  ok('snapshot-accessor UNKNOWN', rA.providersUnknown.includes('snapshot-accessor'));
  ok('snapshot-accessor → passthrough(not suspended)', rA.arbitration==='active');

  // own-data snapshot method 는 receiver 보존 .call 로 정상 소비
  const objProv={ _open:true, snapshot(){ return { isOpen:this._open, view:{npcId:'rift-gift-berin',nodeId:'afterGift'} }; } };
  const rM=createDialoguePoseArbiter('warrior',{dialogue:objProv}).resolve(0.1,{facing:3});
  ok('own-data snapshot().call(receiver)', rM.arbitration==='suspended' && rM.dialogue.npcId==='rift-gift-berin' && rM.dialogue.nodeId==='afterGift');

  // v4(B): view.nodeId accessor → UNKNOWN(view-nodeId-accessor), 실행0
  const viewNodeGetter={ isOpen:true, view:(()=>{ const vv={npcId:'x'}; let runs=0; Object.defineProperty(vv,'nodeId',{get(){runs++;return 'y';},enumerable:true}); vv.__runs=()=>runs; return vv; })() };
  const rB=createDialoguePoseArbiter('warrior',{dialogue:()=>viewNodeGetter}).resolve(0.1,{});
  ok('view-nodeId-accessor UNKNOWN', rB.providersUnknown.includes('view-nodeId-accessor'));
  ok('nodeId getter not executed', viewNodeGetter.view.__runs()===0);
  ok('nodeId accessor → null', rB.dialogue.nodeId===null);

  // 유지(public 소비): poseMode run → run / finite facing6 / top-level attackRemaining
  ok('public poseMode run', createDialoguePoseArbiter('warrior',{dialogue:shut}).resolve(0.1,{skill:{id:'s',poseMode:'run'}}).params.mode==='run');
  let dlg=shut(); const aF=createDialoguePoseArbiter('warrior',{dialogue:()=>dlg}); aF.resolve(0.1,{dx:1,dy:0}); dlg=open();
  const rf=aF.resolve(0.1,{facing:6, attack:true});
  ok('dialogue keeps finite facing6', rf.params.direction===6 && rf.params.mode==='idle');
  const aT=createDialoguePoseArbiter('warrior',{dialogue:shut}); const rt=aT.resolve(0.1,{attack:true});
  ok('top-level attackRemaining>0', typeof rt.attackRemaining==='number' && rt.attackRemaining>0);
  ok('run speed 1.55', createDialoguePoseArbiter('warrior',{dialogue:shut}).resolve(0.1,{dx:1,dy:0,run:true}).params.speed===1.55);

  // close·char·blur·reset 후 옛 공격 0
  let d2=shut(); const a2=createDialoguePoseArbiter('warrior',{dialogue:()=>d2});
  a2.resolve(0.1,{attack:true}); d2=open();
  ok('enter clears attack', a2.resolve(0.1,{}).params.mode==='idle' && a2.snapshot().attackRemaining===0);
  d2=shut(); ok('exit fresh attack', a2.resolve(0.1,{}).params.mode==='idle' && a2.resolve(0.1,{attack:true}).params.mode==='attack');
  const a3=createDialoguePoseArbiter('warrior',{dialogue:shut});
  a3.resolve(0.1,{attack:true}); a3.onActorChange(); ok('actor-change→0', a3.snapshot().attackRemaining===0);
  a3.resolve(0.1,{attack:true}); a3.onBlur();         ok('blur→0',         a3.snapshot().attackRemaining===0);
  a3.resolve(0.1,{attack:true}); a3.reset();           ok('reset→0',        a3.snapshot().attackRemaining===0);

  // 상속 thenable → UNKNOWN; provider 쓰기 메서드 호출0
  const proto={}; Object.defineProperty(proto,'then',{value(){}}); const inh=Object.create(proto); inh.isOpen=true; inh.view={npcId:'x',nodeId:'y'};
  ok('inherited thenable UNKNOWN', createDialoguePoseArbiter('warrior',{dialogue:()=>inh}).resolve(0.1,{}).providersUnknown.includes('dialogue-async-thenable'));
  let wrote=false; const spy={isOpen:true,view:{npcId:'x',nodeId:'y'},choose(){wrote=true;},grant(){wrote=true;},close(){wrote=true;}};
  const a6=createDialoguePoseArbiter('warrior',{dialogue:spy}); a6.resolve(0.1,{attack:true}); a6.resolve(0.1,{});
  ok('no write on provider', wrote===false);

  console.log(`dialogue-pose-arbitration-2_5d.v4 self-test: ${pass} pass, ${fail} fail`);
  if (fail>0) throw new Error(`${fail} assertion(s) FAILED`);
  return true;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('dialogue-pose-arbitration-2_5d.v4.candidate.mjs')){
  _selfTest(); // 실패시 throw → nonzero
}
