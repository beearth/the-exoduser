// dialogue-pose-arbitration-2_5d.v2.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-QUALITY-NOW-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NOW-20261007-DIALOGUE-POSE-CANDIDATE
// COMMON_GOAL: CH1-RIFT-QUALITY-NOW-20261007
//
// v2 변경점: 실제 현행 대화 snapshot 계약을 { isOpen:boolean, view:{npcId, nodeId} } 로 맞춘다.
//   (v1 은 {phase,residentId,nodeRef} 였음 — 현행 소비자 계약과 불일치.)
//   근거: tools/2_5d/interaction-cue-lifetime.mjs:174 `data(snap,'isOpen')`,
//         :187 `id(data(data(snap,'view'),'npcId'))`, :175 `supported` 가 있으면 true 여야 함.
//         hardened 읽기 규율(:30 data(): own-data-prop 만, accessor/thenable/비객체 거부)을 동일 적용.
//
// 역할 경계(SKILL = visual pose 소비만): 읽기전용 대화 상태로 플레이어 visual intent 를 suspend/resume.
//   대화 node/세션/선택/grant/quest/save 는 STORY/root 소유 — 호출·작성 0 (snapshot 읽기만).
//   root 의 기존 pose 소비자(createVisualPoseConsumer)·cue 렌더러를 재구현하지 않고 import/consume.
//   전투/cost/timer/combat 값·입력 키 바인딩 쓰기 0. (Q-only magic/E 패링불가/어택티켓 보존.)
//
// import: 기존 public pose 소비자(재구현 금지).
import { createVisualPoseConsumer } from '../../../team-followup-20261006/hell-rift/SKILL/visual-pose-consumer-2_5d.candidate.mjs';

const isObject = v => v !== null && (typeof v === 'object' || typeof v === 'function');
function looksThenable(v){ try{ const d=Object.getOwnPropertyDescriptor(v,'then'); if(!d)return false; if(typeof d.get==='function')return true; return Object.hasOwn(d,'value')&&typeof d.value==='function'; }catch(_){ return true; } }
// own-data-prop 만 반환(accessor 비소비). 없으면 {has:false}. interaction-cue data() 규율과 동일.
function ownData(o,key){ if(!isObject(o)||Array.isArray(o))return {has:false}; const d=Object.getOwnPropertyDescriptor(o,key); if(!d)return {has:false}; if(!Object.hasOwn(d,'value'))return {has:false,accessor:true}; return {has:true,value:d.value}; }
function idOrNull(v){ return (typeof v==='string'&&v) ? v : (v==null ? null : String(v)); }

// 현행 대화 계약 읽기: { isOpen, view:{npcId,nodeId}, supported? }. 실패 → UNKNOWN(닫힘 취급).
function readDialogueV2(portOrSnap){
  try{
    let s=null;
    if(typeof portOrSnap==='function') s=portOrSnap();
    else if(isObject(portOrSnap)&&typeof portOrSnap.snapshot==='function') s=portOrSnap.snapshot();
    else s=portOrSnap;
    if(!isObject(s)||Array.isArray(s)) return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['dialogue-state-missing'] };
    if(looksThenable(s)) return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['dialogue-async-thenable'] };
    const sup=ownData(s,'supported');
    if(sup.has && sup.value!==true) return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['dialogue-unsupported'] };
    const io=ownData(s,'isOpen');
    if(!io.has || typeof io.value!=='boolean') return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['isOpen-malformed'] };
    if(!io.value) return { ok:true, open:false, npcId:null, nodeId:null, key:null, unknown:[] };
    const viewD=ownData(s,'view');
    if(!viewD.has || !isObject(viewD.value)) return { ok:false, open:true, npcId:null, nodeId:null, key:'open|unknown-view', unknown:['view-malformed'] };
    const npcId=idOrNull(ownData(viewD.value,'npcId').value);
    const nodeId=idOrNull(ownData(viewD.value,'nodeId').value);
    return { ok:true, open:true, npcId, nodeId, key:`${npcId??''}|${nodeId??''}`, unknown: (npcId==null?['view-npcId-missing']:[]) };
  }catch(_){ return { ok:false, open:false, npcId:null, nodeId:null, key:null, unknown:['dialogue-read-threw'] }; }
}

const NEUTRAL = Object.freeze({ dx:0, dy:0, run:false, attack:false }); // 대화 중 동결(이동/공격 무시, facing 유지)

/**
 * createDialoguePoseArbiter(id, { retrigger?, dialogue? })
 *   dialogue: 읽기전용 provider — ()->snap | {snapshot()} | snap객체(현행 {isOpen,view:{npcId,nodeId}}).
 * 반환: { resolve, drive, onActorChange, onBlur, reset, release, snapshot, id }
 */
export function createDialoguePoseArbiter(id, opts = {}){
  const pose = createVisualPoseConsumer(id, { retrigger: opts.retrigger === true });
  const dialoguePort = opts.dialogue ?? null;
  let suspended=false, lastKey=null;

  function resolve(dt, intent = {}, dialogueOverride){
    const d = readDialogueV2(dialogueOverride!==undefined ? dialogueOverride : dialoguePort);
    const providersUnknown = d.unknown.slice();
    if (d.open){
      if (!suspended){ pose.release(); suspended=true; lastKey=d.key; }        // 진입: 공격 수명 해제 + 동결(facing 유지)
      else if (d.key!==lastKey){ pose.release(); lastKey=d.key; }               // view.npcId/nodeId 변경: 이전 노드 pose 해제
    } else if (suspended){ pose.release(); suspended=false; lastKey=null; }     // 종료: 중간 공격 재생 방지
    const r = suspended ? pose.resolve(dt, NEUTRAL) : pose.resolve(dt, intent);
    return Object.freeze({
      params: r.params, supported: r.supported,
      arbitration: suspended ? 'suspended' : 'active',
      dialogue: Object.freeze({ open:d.open, npcId:d.npcId, nodeId:d.nodeId, key:d.key }),
      providersUnknown,
    });
  }
  function drive(rig, dt, intent, dialogueOverride){
    if(!rig || typeof rig.update!=='function') throw new Error('rig.update API 필요');
    const r=resolve(dt,intent,dialogueOverride); rig.update(dt,r.params);
    return Object.freeze({ ...r, object3d: rig.object3d });
  }
  // UNIT2 수명 훅 — interaction-cue onActorChange/reset 대응. 모두 이전 공격 잔존 제거(facing 유지).
  function release(reason){ pose.release(); suspended=false; lastKey=null; return snapshot(reason); }
  const onActorChange = () => release('actor-change');
  const onBlur        = () => release('blur');
  const reset         = () => release('reset');
  function snapshot(reason){
    return Object.freeze({ id, suspended, lastDialogueKey:lastKey, lastReason: reason??null, pose: pose.snapshot() });
  }
  return Object.freeze({ resolve, drive, onActorChange, onBlur, reset, release, snapshot, id });
}

export default { createDialoguePoseArbiter };

/* ── 인라인 자가검증 (node stdin; three.js/화면 불필요). FAIL → nonzero exit ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ c?pass++:(fail++,console.error('FAIL:',n)); };
  const open=(npcId='rift-rest-haran',nodeId='meet')=>({ isOpen:true, view:{npcId,nodeId} });
  const shut=()=>({ isOpen:false, view:null });

  // UNIT1: 현행 계약 isOpen/view.npcId/view.nodeId
  let dlg=shut(); const a=createDialoguePoseArbiter('warrior',{dialogue:()=>dlg});
  ok('active passthrough walk', a.resolve(0.1,{dx:0,dy:1}).params.mode==='walk');
  dlg=open();
  const ro=a.resolve(0.1,{dx:0,dy:1,attack:true});
  ok('isOpen→suspend idle', ro.arbitration==='suspended' && ro.params.mode==='idle');
  ok('view.npcId/nodeId key', ro.dialogue.npcId==='rift-rest-haran' && ro.dialogue.nodeId==='meet' && ro.dialogue.key==='rift-rest-haran|meet');

  // UNIT2-enter: 공격 중 진입 → 이전 공격 잔존0, facing 유지
  let d2=shut(); const a2=createDialoguePoseArbiter('warrior',{dialogue:()=>d2});
  a2.resolve(0.1,{dx:1,dy:0}); // 동쪽(dir2)으로 facing 설정
  ok('attack starts', a2.resolve(0.1,{attack:true}).params.mode==='attack');
  d2=open();
  const re=a2.resolve(0.1,{dx:0,dy:1,attack:true});
  ok('enter clears stale attack', re.params.mode==='idle' && a2.snapshot().pose.attackRemaining===0);
  ok('enter keeps facing (dir2)', re.params.direction===2);

  // UNIT2-nodeChange: view 변경(같은 open) → release
  let d3=open('rift-rest-haran','meet'); const a3=createDialoguePoseArbiter('warrior',{dialogue:()=>d3});
  a3.resolve(0.1,{}); const k1=a3.snapshot().lastDialogueKey;
  d3=open('rift-gift-berin','afterGift'); a3.resolve(0.1,{attack:true});
  ok('view change tracked & suspended', a3.snapshot().lastDialogueKey==='rift-gift-berin|afterGift' && a3.snapshot().pose.attackRemaining===0);
  void k1;

  // UNIT2-exit: 종료 후 공격 재입력 fresh(잔존0)
  let d4=open(); const a4=createDialoguePoseArbiter('warrior',{dialogue:()=>d4});
  a4.resolve(0.1,{}); d4=shut();
  ok('exit resume idle', a4.resolve(0.1,{}).params.mode==='idle' && a4.snapshot().suspended===false);
  ok('fresh attack after exit', a4.resolve(0.1,{attack:true}).params.mode==='attack');

  // UNIT2-character/blur/reset 수명 훅 → 이전 공격 잔존0
  const a5=createDialoguePoseArbiter('warrior',{dialogue:shut});
  a5.resolve(0.1,{dx:1,dy:0}); a5.resolve(0.1,{attack:true});
  ok('mid-attack before hook', a5.snapshot().pose.attackRemaining>0);
  a5.onActorChange(); ok('onActorChange clears attack', a5.snapshot().pose.attackRemaining===0);
  a5.resolve(0.1,{attack:true}); a5.onBlur();  ok('onBlur clears attack', a5.snapshot().pose.attackRemaining===0);
  a5.resolve(0.1,{attack:true}); a5.reset();   ok('reset clears attack', a5.snapshot().pose.attackRemaining===0);

  // 계약 위반/미지원 → providersUnknown + passthrough, 가짜 PASS 아님
  ok('isOpen non-boolean → unknown passthrough', (()=>{const r=createDialoguePoseArbiter('warrior',{dialogue:()=>({isOpen:'yes'})}).resolve(0.1,{dx:1,dy:0}); return r.arbitration==='active'&&r.providersUnknown.includes('isOpen-malformed');})());
  ok('supported:false → unknown', createDialoguePoseArbiter('warrior',{dialogue:()=>({isOpen:true,supported:false,view:{npcId:'x',nodeId:'y'}})}).resolve(0.1,{}).providersUnknown.includes('dialogue-unsupported'));
  // accessor snapshot 거부(hardened): isOpen 를 getter 로 노출 → own-data 아님 → malformed
  const acc={}; Object.defineProperty(acc,'isOpen',{get(){return true;},enumerable:true});
  ok('accessor isOpen rejected', createDialoguePoseArbiter('warrior',{dialogue:()=>acc}).resolve(0.1,{}).providersUnknown.includes('isOpen-malformed'));

  // drive(mock rig) 전달 + 대화 중 중립
  let cap=null; const mock={object3d:{t:'o'},update:(dt,p)=>{cap=p;return mock.object3d;}};
  const a6=createDialoguePoseArbiter('silvertail',{dialogue:shut});
  a6.drive(mock,0.1,{dx:1,dy:0}); ok('drive forwards walk/dir2', cap&&cap.mode==='walk'&&cap.direction===2);
  a6.drive(mock,0.1,{dx:1,dy:0},open()); ok('drive during open neutral', cap.mode==='idle');

  // provider 쓰기 메서드 호출 0
  let wrote=false; const spy={isOpen:true,view:{npcId:'x',nodeId:'y'},choose(){wrote=true;},grant(){wrote=true;},close(){wrote=true;}};
  const a7=createDialoguePoseArbiter('warrior',{dialogue:spy}); a7.resolve(0.1,{attack:true}); a7.resolve(0.1,{});
  ok('no write on dialogue provider', wrote===false);

  console.log(`dialogue-pose-arbitration-2_5d.v2 self-test: ${pass} pass, ${fail} fail`);
  return fail===0;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('dialogue-pose-arbitration-2_5d.v2.candidate.mjs')){
  const okAll=_selfTest(); if(typeof process.exit==='function') process.exit(okAll?0:1);
}
