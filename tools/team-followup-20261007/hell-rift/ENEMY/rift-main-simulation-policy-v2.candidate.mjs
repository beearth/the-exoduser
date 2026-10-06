// ════════════════════════════════════════════════════════════════════════
//  rift-main-simulation-policy-v2.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-MAIN-POLICIES-FIX-20261007-ENEMY-CANDIDATE
//  배정: TASK CH1-RIFT-MAIN-POLICIES-FIX-20261007-ENEMY (ROLE ENEMY)
//
//  원 v1(rift-main-simulation-policy.candidate.mjs, 읽기만)의 실 결함 FIX:
//   P1-a: v1 은 {state,identity,expectedIdentity} 가정 → **실제 host snapshot 계약과 불일치**.
//         실제 snapshot(아래 Read)은 {disposed, active, pending, phase, token, iframeLoaded}.
//   P1-b: update() 만 막아도 **gamepad poll / 합성 key dispatch / P.facing 직접변이**가 누출.
//  v2 = 명시 host→detached policy adapter. 순수(pure). G.paused 미변경·게임실행·스폰·timer/RAF 0.
//  목록만으로 "전체 freeze 완료"를 주장하지 않는다(별도 게이트는 host/caller 소유).
//
//  ── 실제 본문 Read (fresh, 파일존재/검색과 구분) ─────────────────────────
//   tools/2_5d/main-rift-host.mjs:251-253 snapshot() = {disposed, active:(phase==='active'),
//     pending:(phase==='loading'), phase:current?.phase??'idle', token:current?.id??null, iframeLoaded}.
//     phase enum(실): 'loading'@216 / 'active'@194 / 'closed'@98 / 'failed'@118 / 기본 'idle'@252.
//   tools/2_5d/editor-preview-host.mjs:179-181 snapshot() = {disposed, active, pending:!!openJob,
//     iframeLoaded, adapter} — **phase/token 없음**(존재 확인 필수, guessed field 0).
//   game.html 누출 hotpath(실 라인):
//     · gamepad poll: loop @60015 `try{_pollGamepad()}` (def @13365) — G.paused 무관 매프레임.
//     · 합성 key dispatch(DOM 우회): @13043 `document.dispatchEvent(ev)`(ev._fromGp) → keydown
//       핸들러 @12749-12841(독립 `!G.paused`) 로 유입.
//     · P.facing 직접변이: @12453(mouse) / @13595·@13621(gamepad stick) — update() 게이트 밖.
//     · update() 조기 return 시뮬 게이트: @30938 (enemy/proj/spawn/poison/damage/_gameFrame++@30943).
//
//  AI/spawn/damage/collision/save/원본 변경 0. 공유 host/원본/정본docs/Git 쓰기 0.
//  보호 2_3/Q-only magic·blackBean(E 패링0)/어택티켓 금지/기존23/AGENTS·LOCK·SSOT 보존.
//  맵 geometry/배치/발/카메라 작업 아님 → map guide 전체 Read 를 선행완료로 주장 0. VISUAL=미관측 RETOUCH.
// ════════════════════════════════════════════════════════════════════════

// 실 snapshot 필드(두 host 공통/부분). guessed 0.
const SNAPSHOT_FIELDS = Object.freeze(['phase','active','pending','token','disposed','iframeLoaded']);
const PHASE_ENUM     = Object.freeze(['idle','loading','active','closed','failed']);        // main-rift-host 실 enum
const INACTIVE_PHASE = new Set(['idle','closed']);                                          // 명시 비활성(원 sim 허용)
const OWNED_PHASE    = new Set(['loading','active','scheduled','restoring','entering']);    // 소유중(부모 차단). loading=실, 나머지=추상 owner 수용

// update()@30938 밖에서 별개로 소비해야 할 누출 hotpath (목록 ≠ 전체 freeze)
export const CONSUMED_SKIP = Object.freeze([
  Object.freeze({ id:'updateEarlyReturn', src:'game.html:30938 if(G.paused)return (sim 전체·_gameFrame++@30943)' }),
  Object.freeze({ id:'gamepadPoll',       src:'game.html:60015 loop _pollGamepad() (def 13365) — G.paused 무관' }),
  Object.freeze({ id:'gamepadKeyInject',  src:'game.html:13043 document.dispatchEvent(ev._fromGp) → keydown @12749-12841' }),
  Object.freeze({ id:'facingMutation',    src:'game.html:12453 mouse / 13595,13621 gamepad stick — P.facing 직접변이' }),
]);

// ── 안전 projection: own-primitive 만, getter-throw/thenable/non-primitive/proxy → fail-closed ──
function _safeRead(obj, k){
  let has; try{ has = Object.prototype.hasOwnProperty.call(obj, k); } catch(_) { return { ok:false }; }
  if(!has) return { ok:true, has:false };
  let val; try{ val = obj[k]; } catch(_) { return { ok:false }; }         // getter/proxy throw
  return { ok:true, has:true, val };
}
export function projectHostSnapshot(snap){
  if(snap === null || typeof snap !== 'object') return { ok:false, reason:'not-object' };
  let th; try{ th = snap.then; } catch(_) { return { ok:false, reason:'accessor-throw:then' }; }
  if(typeof th === 'function') return { ok:false, reason:'thenable' };     // thenable 거부(임의 await 방지)
  const out = {};
  for(const k of SNAPSHOT_FIELDS){
    const r = _safeRead(snap, k);
    if(!r.ok) return { ok:false, reason:'accessor-throw:'+k };
    if(r.has){
      const t = typeof r.val;
      if(r.val !== null && t !== 'string' && t !== 'number' && t !== 'boolean') return { ok:false, reason:'non-primitive:'+k };
      out[k] = r.val;
    }
  }
  return { ok:true, snap:out };                                            // Error.message 등 임의 조회 0
}

const _freeze = Object.freeze;
function _decision({ownership, allowParentSim, failClosed, reason, token}){
  const blocked = !allowParentSim;
  return _freeze({
    ownership,                      // 'inactive'|'disposed'|'entering'|'active'|'scheduled'|'restoring'|'stale'|'failed'|'unknown'
    allowParentSim: !!allowParentSim,
    blockParentSim: blocked, blockGamepad: blocked,  // 소유/fail-closed 는 부모 sim+gamepad 차단
    failClosed: !!failClosed,
    token: token===undefined ? null : token,
    consumedSkip: blocked ? CONSUMED_SKIP : _freeze([]),  // 차단 시 소비 목록(별개 hotpath 포함)
    preserveParentInactiveTick: true,   // 원 paused tick 모델 미변경
    touchesUserPause: false, writesParentState:false, createsTimerOrRAF:false, spawnsEnemies:false, runsGame:false,
    reason,
  });
}

// ── 명시 host→policy adapter (순수). opts.expectedToken 주면 stale 식별(없으면 token 검사 생략) ──
export function riftMainSimulationPolicyV2(hostSnapshot, opts){
  const proj = projectHostSnapshot(hostSnapshot);
  if(!proj.ok) return _decision({ ownership:'unknown', allowParentSim:false, failClosed:true, reason:'snapshot 투영 실패 fail-closed: '+proj.reason });
  const s = proj.snap;
  const expectedToken = opts && Object.prototype.hasOwnProperty.call(opts,'expectedToken') ? opts.expectedToken : undefined;

  // disposed 명시 → 해제(원 sim 허용)
  if(s.disposed === true) return _decision({ ownership:'disposed', allowParentSim:true, reason:'host disposed — parent 재개 허용' });

  // token 1차: expectedToken 주어졌는데 token 필드 없거나 불일치 → stale(현 live ownership 과 혼합 0, fail-closed)
  if(expectedToken !== undefined){
    if(!Object.prototype.hasOwnProperty.call(s,'token')) return _decision({ ownership:'stale', allowParentSim:false, failClosed:true, reason:'expectedToken 있으나 snapshot token 부재 — stale fail-closed' });
    if(s.token !== expectedToken) return _decision({ ownership:'stale', allowParentSim:false, failClosed:true, token:s.token, reason:'token 불일치 — stale(live ownership 혼합 금지)' });
  }
  const tok = Object.prototype.hasOwnProperty.call(s,'token') ? s.token : null;

  // phase 있으면 phase 우선(+ active/pending 일관성 검사)
  if(Object.prototype.hasOwnProperty.call(s,'phase')){
    const ph = s.phase;
    if(typeof ph !== 'string' || (!PHASE_ENUM.includes(ph) && !OWNED_PHASE.has(ph)))
      return _decision({ ownership:'unknown', allowParentSim:false, failClosed:true, token:tok, reason:'알 수 없는 phase fail-closed: '+String(ph) });
    // 일관성: 실 snapshot 은 active=(phase==='active'), pending=(phase==='loading')
    if(Object.prototype.hasOwnProperty.call(s,'active') && typeof s.active==='boolean' && s.active !== (ph==='active'))
      return _decision({ ownership:'unknown', allowParentSim:false, failClosed:true, token:tok, reason:'active/phase 불일치 — 위조 의심 fail-closed' });
    if(Object.prototype.hasOwnProperty.call(s,'pending') && typeof s.pending==='boolean' && s.pending !== (ph==='loading'))
      return _decision({ ownership:'unknown', allowParentSim:false, failClosed:true, token:tok, reason:'pending/phase 불일치 fail-closed' });
    if(ph === 'failed') return _decision({ ownership:'failed', allowParentSim:false, failClosed:true, token:tok, reason:'host failed — 모호, parent 차단(leak 방지)' });
    if(INACTIVE_PHASE.has(ph)) return _decision({ ownership:'inactive', allowParentSim:true, token:tok, reason:'inactive('+ph+') 명시유효 — 원 sim 허용' });
    // OWNED
    const own = ph==='loading' ? 'entering' : ph;   // loading→entering(scheduled)
    return _decision({ ownership:own, allowParentSim:false, token:tok, reason:'소유중('+own+') — parent sim+gamepad 차단' });
  }

  // phase 없음(editor-host 형태): active/pending boolean 사용
  const hasA = Object.prototype.hasOwnProperty.call(s,'active'), hasP = Object.prototype.hasOwnProperty.call(s,'pending');
  if(hasA && typeof s.active==='boolean'){
    if(s.active === true) return _decision({ ownership:'active', allowParentSim:false, token:tok, reason:'active=true — 차단' });
    if(hasP && typeof s.pending==='boolean' && s.pending === true) return _decision({ ownership:'entering', allowParentSim:false, token:tok, reason:'pending=true — 차단' });
    return _decision({ ownership:'inactive', allowParentSim:true, token:tok, reason:'active=false(&pending=false) — 원 sim 허용' });
  }
  // phase/active 모두 신뢰 불가 → fail-closed
  return _decision({ ownership:'unknown', allowParentSim:false, failClosed:true, token:tok, reason:'phase/active 신뢰 불가 fail-closed' });
}

// 편의 (pure)
export function shouldBlockParent(hostSnapshot, opts){ return riftMainSimulationPolicyV2(hostSnapshot, opts).blockParentSim; }
