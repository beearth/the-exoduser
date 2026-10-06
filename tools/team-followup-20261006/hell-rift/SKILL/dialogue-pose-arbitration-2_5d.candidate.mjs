// dialogue-pose-arbitration-2_5d.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1 2.5D interactive rift 후속 후보.
// OFFICIAL-COMPLETION-ID: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-SKILL-DIALOGUE-POSE-CANDIDATE
// COMMON GOAL: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006
//
// 역할 경계(SKILL = visual pose 소비만):
//   읽기전용 대화 preview 상태에 따라 "플레이어 visual intent"를 중단(suspend)/복귀(resume)한다.
//   대화 node/세션 모델·선택·grant·quest·save 는 STORY/root 소유 — 여기서 작성·호출 0 (read-only snapshot 만).
//   전투/cost/timer/combat 값 쓰기 0. 입력 키 바인딩 0 (phase 만 읽음).
//
// 근거 source(읽기 전용, 미변경):
//   ./visual-pose-consumer-2_5d.candidate.mjs
//     createVisualPoseConsumer(id,{retrigger}) → {resolve(dt,intent), drive(rig,dt,intent), release(), snapshot()}
//   ../STORY/npc-dialogue-preview-2_5d.candidate.mjs (STORY 소유 — 읽기만)
//     createNpcDialoguePreview().snapshot() → {sceneId,residentId,phase:'idle'|'approachable'|'open',
//        nodeRef,closeReason,preview:true,commits:false,interactKey,rangeWorld}
//     INTERACTION_CONTRACT: interact 기본 'KeyR'; E('KeyE')=shield 충돌 → 바인딩 안 함(Q-only/E불가 보존).
//   authoritative 상호작용(선택/grant)은 root tools/map-scene-rift-dialogue.mjs — 본 모듈 미접촉.
//
// 대화 "active" 판정 = snapshot().phase === 'open'. dialogueKey = residentId|nodeRef.
// provider 미확인/형식오류 → UNKNOWN 보고 + passthrough(기본 비중단; 화면 없는 상태로 actor 를 얼리지 않음).
//   가짜 연결 PASS 0 — native/화면 미관찰은 fixture 로 대체하지 않는다.

import { createVisualPoseConsumer } from './visual-pose-consumer-2_5d.candidate.mjs';

function isPlainObject(v){ if(!v||typeof v!=='object')return false; const p=Object.getPrototypeOf(v); return p===Object.prototype||p===null; }

// 대화 상태를 안전하게 읽는다(수신자 보존, accessor/thenable/비평면 거절). 쓰기 0.
function readDialogue(portOrSnap){
  try{
    let s=null;
    if(typeof portOrSnap==='function') s=portOrSnap();
    else if(isPlainObject(portOrSnap)&&typeof portOrSnap.snapshot==='function') s=portOrSnap.snapshot();
    else if(isPlainObject(portOrSnap)) s=portOrSnap;
    if(!isPlainObject(s)) return { ok:false, open:false, key:null, unknown:['dialogue-state-missing'] };
    const phase=s.phase;
    if(typeof phase!=='string') return { ok:false, open:false, key:null, unknown:['dialogue-phase-malformed'] };
    const open=phase==='open';
    const key=open?`${s.residentId??''}|${s.nodeRef??''}`:null;
    return { ok:true, open, key, phase, residentId:s.residentId??null, nodeRef:s.nodeRef??null, unknown:[] };
  }catch(_){ return { ok:false, open:false, key:null, unknown:['dialogue-read-threw'] }; }
}

const NEUTRAL = Object.freeze({ dx:0, dy:0, run:false, attack:false }); // 대화 중 동결(이동/공격 무시)

/**
 * createDialoguePoseArbiter(id, { retrigger?, dialogue? })
 *   dialogue: 읽기전용 provider — 함수(()->snap) | {snapshot()} | snapshot객체. 없으면 resolve 때 override 필요.
 * 반환: { resolve, drive, release, setActorReleased, snapshot }
 *   resolve(dt, intent, dialogueOverride?) → { params, arbitration, dialogue, supported, providersUnknown }
 */
export function createDialoguePoseArbiter(id, opts = {}){
  const pose = createVisualPoseConsumer(id, { retrigger: opts.retrigger === true });
  const dialoguePort = opts.dialogue ?? null;
  let suspended = false;
  let lastKey = null;      // 직전 open dialogueKey (node/resident 변경 감지)
  let lastActor = id;

  function resolve(dt, intent = {}, dialogueOverride){
    const d = readDialogue(dialogueOverride !== undefined ? dialogueOverride : dialoguePort);
    const providersUnknown = d.unknown.slice();

    // 전이 처리 — stale attack pose 가 대화/복귀로 새지 않도록 release.
    if (d.open){
      if (!suspended){ pose.release(); suspended = true; lastKey = d.key; }       // 진입: 공격 수명 해제 + 동결
      else if (d.key !== lastKey){ pose.release(); lastKey = d.key; }             // dialogueID 변경: 이전 노드 pose 해제
    } else {
      if (suspended){ pose.release(); suspended = false; lastKey = null; }        // 복귀: 중간공격 재생 방지
    }

    // suspend 중이면 게임 intent 무시하고 중립(idle) 포즈. 아니면 passthrough.
    const r = suspended
      ? pose.resolve(dt, NEUTRAL)
      : pose.resolve(dt, intent);

    return Object.freeze({
      params: r.params,
      supported: r.supported,
      arbitration: suspended ? 'suspended' : 'active',
      dialogue: Object.freeze({ open: d.open, key: d.key, phase: d.phase ?? null, residentId: d.residentId ?? null, nodeRef: d.nodeRef ?? null }),
      providersUnknown,
    });
  }

  // 편의: 실제 rig(createCharacterRig 반환)에 적용. rig 생성/dispose 는 호출측 소유.
  function drive(rig, dt, intent, dialogueOverride){
    if(!rig || typeof rig.update !== 'function') throw new Error('rig.update API 필요');
    const r = resolve(dt, intent, dialogueOverride);
    rig.update(dt, r.params);
    return Object.freeze({ ...r, object3d: rig.object3d });
  }

  // actor 전환/ blur: 외부에서 이 actor 를 떠날 때 호출 → stale attack/suspend 해제.
  function release(){ pose.release(); suspended = false; lastKey = null; return snapshot(); }
  const setActorReleased = release; // 의미상 별칭(actor 변경 시 outgoing 해제)

  function snapshot(){
    return Object.freeze({ id, actor:lastActor, suspended, lastDialogueKey:lastKey, pose: pose.snapshot() });
  }

  return Object.freeze({ resolve, drive, release, setActorReleased, snapshot, id });
}

export default { createDialoguePoseArbiter };

/* ── 인라인 자가검증 (stdin; three.js/화면 불필요 — 순수 state + mock) ─────────── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ c?pass++:(fail++,console.error('FAIL:',n)); };
  const snap = (phase, residentId='rift-rest-haran', nodeRef='meet') => ({ phase, residentId, nodeRef });

  // UNIT1: 대화 open → suspend(중립), 게임 intent(공격/이동) 무시
  let dlg = snap('idle');
  const arb = createDialoguePoseArbiter('warrior', { dialogue: () => dlg });
  ok('active passthrough walk', arb.resolve(0.1, { dx:0, dy:1 }).params.mode === 'walk');
  dlg = snap('open');
  const rOpen = arb.resolve(0.1, { dx:0, dy:1, attack:true }); // 대화 중 공격+이동 시도
  ok('suspend ignores gameplay → idle', rOpen.arbitration==='suspended' && rOpen.params.mode==='idle');
  ok('suspend reports dialogue open', rOpen.dialogue.open===true && rOpen.dialogue.key==='rift-rest-haran|meet');

  // UNIT2-a: 공격 중 대화 open → stale attack 제거(동결)
  let dlg2 = snap('idle');
  const arb2 = createDialoguePoseArbiter('warrior', { dialogue: () => dlg2 });
  ok('attack starts', arb2.resolve(0.1, { attack:true }).params.mode==='attack');
  dlg2 = snap('open');
  ok('attack cleared on dialogue open', arb2.resolve(0.1, {}).params.mode==='idle');
  ok('pose attackRemaining=0 after suspend', arb2.snapshot().pose.attackRemaining===0);

  // UNIT2-b: dialogueID(node/resident) 변경 중 open → 이전 pose release (stale 없음)
  let dlg3 = snap('open','rift-rest-haran','meet');
  const arb3 = createDialoguePoseArbiter('warrior', { dialogue: () => dlg3 });
  arb3.resolve(0.1, {});
  const k1 = arb3.snapshot().lastDialogueKey;
  dlg3 = snap('open','rift-gift-berin','afterGift'); // 다른 resident/node
  arb3.resolve(0.1, { attack:true }); // 변경 프레임의 공격도 무시
  const k2 = arb3.snapshot().lastDialogueKey;
  ok('dialogueID change tracked', k1==='rift-rest-haran|meet' && k2==='rift-gift-berin|afterGift');
  ok('still suspended idle on id change', arb3.snapshot().pose.attackRemaining===0 && arb3.snapshot().suspended===true);

  // UNIT2-c: 대화 close 복귀 후 공격 재입력 = fresh (중간공격 잔류 없음)
  let dlg4 = snap('open');
  const arb4 = createDialoguePoseArbiter('warrior', { dialogue: () => dlg4 });
  arb4.resolve(0.1, {}); // suspended
  dlg4 = snap('idle');
  ok('resume passthrough idle (no stale attack)', arb4.resolve(0.1, {}).params.mode==='idle' && arb4.snapshot().suspended===false);
  ok('fresh attack after resume', arb4.resolve(0.1, { attack:true }).params.mode==='attack');

  // UNIT2-d: actor 전환 — outgoing arbiter release 로 stale attack 제거
  const aW = createDialoguePoseArbiter('warrior', { dialogue: () => snap('idle') });
  aW.resolve(0.1, { attack:true });
  ok('warrior mid-attack', aW.snapshot().pose.attackRemaining>0);
  aW.setActorReleased(); // 전환 시 호출
  ok('outgoing actor released', aW.snapshot().pose.attackRemaining===0);

  // provider 미확인 → UNKNOWN + passthrough(비중단), 가짜연결 아님
  const aU = createDialoguePoseArbiter('warrior', { dialogue: () => ({ phase: 123 }) }); // 형식오류
  const rU = aU.resolve(0.1, { dx:1, dy:0 });
  ok('unknown dialogue → passthrough', rU.arbitration==='active' && rU.params.mode==='walk');
  ok('unknown reported not faked', rU.providersUnknown.length>0);

  // drive(mock rig) 가 arbiter params 를 update 로 전달
  let cap=null; const mock={ object3d:{t:'o'}, update:(dt,p)=>{cap=p;return mock.object3d;} };
  const aD = createDialoguePoseArbiter('silvertail', { dialogue: () => snap('idle') });
  aD.drive(mock, 0.1, { dx:1, dy:0 });
  ok('drive forwards params', cap && cap.mode==='walk' && cap.direction===2);
  // 대화 중 drive → 중립 전달(이동 무시)
  aD.drive(mock, 0.1, { dx:1, dy:0 }, snap('open'));
  ok('drive during dialogue neutral', cap.mode==='idle');

  // 경계: real combat/dialogue provider 메서드 호출 0 (snapshot/읽기만) — 쓰기 메서드 미사용 확인
  let wrote=false; const spy={ phase:'open', residentId:'x', nodeRef:'meet',
    choose(){wrote=true;}, grant(){wrote=true;}, close(){wrote=true;}, requestInteract(){wrote=true;} };
  const aS = createDialoguePoseArbiter('warrior', { dialogue: spy });
  aS.resolve(0.1, { attack:true }); aS.resolve(0.1, {});
  ok('no write/grant/choose on dialogue provider', wrote===false);

  console.log(`dialogue-pose-arbitration-2_5d self-test: ${pass} pass, ${fail} fail`);
  return fail===0;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('dialogue-pose-arbitration-2_5d.candidate.mjs')){
  const okAll=_selfTest(); if(typeof process.exit==='function') process.exit(okAll?0:1);
}
