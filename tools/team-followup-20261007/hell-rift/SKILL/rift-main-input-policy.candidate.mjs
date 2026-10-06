// rift-main-input-policy.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-MAIN-PARALLEL-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-MAIN-PARALLEL-20261007-SKILL-CANDIDATE
//
// 순수 입력 정책(pure policy). DOM capture 적용/실제 이벤트 소비 중단은 root 소유.
//   Rift(2.5D 미리보기 modal/iframe)가 열린 동안: parent combat/action/hold-pickup(R)/auto-next-stage 소비를
//   막고, iframe 대화/걷기/Tab/Enter/Space/Escape/명시 continue 는 작동 가능하게 분류한다.
//   Rift 가 닫혀 game inactive 이면: 기존 Q/E/스킬 경로 의미 변경0(passthrough).
//   본편 스킬/입력 수치·버프·쿨다운·어택티켓 변경0. 보호2_3/Q전용 magic blackBean(E패링0)/기존23 보존.
//
// 실제 본문 Read(검색 아님) 근거:
//   game.html:6109 weapon 'mouse0'/shield 'KeyE', :6111 parry 'KeyQ', :6112 beam 'mouse2',
//     :6114 interact 'KeyR'/inventory 'Tab'/settings 'Escape', :6110 bow 'Space'/charge 'ShiftLeft'.
//   game.html:31608 isJust('interact') 단발 줍기, :31736 isHeld('interact') R-홀드 연속줍기,
//     :31739 _pickHoldT>=9(≈150ms) 간격. (R 키맵 충돌: 단발+홀드 모두 R → rift 중 전부 억제)
//   game.html:12796 Digit1~4 슬롯, :12818 Space 분노, :12822 KeyF 슬롯, :12832 KeyZ 필살기, :12826 ControlLeft 고정스킬.
//   game.html:40562-40565 출구 타일 밟음 → 보스/스테이지 자동 진행(auto-next-stage).
//   game.html:12901-12911 _clearHeldInput(blur/visibility) — rift open 시 parent held 정리 근거.
//   tools/2_5d/editor-preview-host.mjs:109 panel.showModal(동일-origin iframe lab), :162-169 onModalKey
//     capture stopImmediatePropagation(Tab/Enter/Space/Escape native 유지), :179 snapshot().active=rift open.
//
// 이 파일은 game/host/editor/public 을 수정하지 않는다(순수 데이터+함수). root 가 classify 결과로 capture 적용.

'use strict';

/* ── own-data primitive 추출(detached). accessor/비원시/throw → undefined(+unknown). getter 호출0 ── */
function ownPrimitive(obj, key){
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return { ok:false, reason:'non-object' };
  let d; try{ d = Object.getOwnPropertyDescriptor(obj, key); }catch(_){ return { ok:false, reason:'descriptor-threw' }; }
  if (!d) return { ok:true, has:false, value:undefined };                 // 없음=선택 필드일 수 있음
  if (!Object.hasOwn(d, 'value')) return { ok:false, reason:'accessor' }; // getter → 실행0, 거부
  const v = d.value, t = typeof v;
  if (v !== null && t === 'object') return { ok:false, reason:'non-primitive' };
  if (t === 'function' || t === 'symbol') return { ok:false, reason:'non-primitive' };
  return { ok:true, has:true, value:v };                                  // string/number/boolean/undefined/null
}

// 이벤트를 plain own-data primitive 로 복제.
//   accessor(getter)/descriptor-throw = getter 실행 위험 → 전체 fail-closed({ok:false}).
//   non-primitive(객체) 또는 타입 불일치 = getter 위험 없음 → 해당 필드만 soft unknown(무시), 분류 계속.
const HARD_FAIL = new Set(['accessor','descriptor-threw','non-object']);
function detachEvent(ev){
  const unknown = [];
  const type = ownPrimitive(ev, 'type');
  if (!type.ok) return { ok:false, unknown:['type-'+type.reason] };
  if (typeof type.value !== 'string' || !type.value) return { ok:false, unknown:['type-malformed'] };
  const out = { type: type.value };
  const take = (k, wantType) => {
    const r = ownPrimitive(ev, k);
    if (!r.ok){ if (HARD_FAIL.has(r.reason)) return r.reason; unknown.push(k+'-'+r.reason); return null; } // accessor 등 → 하드 fail 신호
    if (r.has){ if (typeof r.value !== wantType || (wantType==='number' && !Number.isFinite(r.value))) unknown.push(k+'-type'); else out[k]=r.value; }
    return null;
  };
  for (const k of ['code','key'])                                    { const h=take(k,'string');  if(h) return { ok:false, unknown:[...unknown, k+'-'+h] }; }
  for (const k of ['repeat','isComposing','ctrlKey','metaKey','altKey']){ const h=take(k,'boolean'); if(h) return { ok:false, unknown:[...unknown, k+'-'+h] }; }
  { const h=take('button','number'); if(h) return { ok:false, unknown:[...unknown, 'button-'+h] }; }
  return { ok:true, ev:out, unknown };
}

/* ── 테이블 exports (정책 계약) ───────────────────────────────────────── */
// rift 중 iframe 으로 허용(대화/걷기/명시 continue). parent combat 로는 소비되지 않음.
export const IFRAME_ALLOW_KEYS = Object.freeze([
  'KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight', // 걷기
  'Tab','Enter','NumpadEnter','Space','Escape',                               // 모달/대화 native (host :163 유지)
]);
export const CONTINUE_KEYS = Object.freeze(['Enter','NumpadEnter','Space']);   // 명시 continue (R 아님)

// rift 중 억제할 parent 범주 + 실제 source:line (R/hold-pickup 키맵 충돌 인계).
export const PARENT_SUPPRESSED = Object.freeze({
  combat:        Object.freeze({ keys:['mouse0','mouse2'],          src:'game.html:6109 weapon mouse0 / :6112 beam mouse2' }),
  action_parry:  Object.freeze({ keys:['KeyQ'],                      src:'game.html:6111 parry KeyQ (보호2_3/Q-only)' }),
  action_shield: Object.freeze({ keys:['KeyE'],                      src:'game.html:6109 shield KeyE (E 패링불가)' }),
  skills:        Object.freeze({ keys:['Digit1','Digit2','Digit3','Digit4','KeyZ','KeyF','ControlLeft'], src:'game.html:12796/12832/12822/12826' }),
  hold_pickup_R: Object.freeze({ keys:['KeyR'],                      src:'game.html:6114 interact KeyR; :31608 isJust 단발; :31736 isHeld 홀드; :31739 _pickHoldT>=9(~150ms)' }),
  auto_next_stage: Object.freeze({ keys:[],                          src:'game.html:40562-40565 출구 타일 밟음 자동 진행 (이벤트 아님 → 루프 억제 플래그)' }),
});
// R 키맵 충돌 명시 인계: 단발 isJust 와 홀드 isHeld 가 동일 'KeyR' → rift 중 둘 다 억제해야 iframe R 입력이 parent 줍기를 트리거하지 않음.
export const KEYMAP_CONFLICTS = Object.freeze([
  Object.freeze({ key:'KeyR', parent:['interact-isJust(game.html:31608)','holdPickup-isHeld(game.html:31736)'], riftDecision:'suppress-parent', note:'iframe continue 는 Enter/Space 사용, R 아님' }),
]);
// 경계 처리 테이블: keyrepeat/keyup/windowblur/composition/pointerownership/focus단절.
export const BOUNDARY_TABLE = Object.freeze({
  keyrepeat:        Object.freeze({ field:'repeat', rule:'repeat 여부와 무관하게 동일 분류. 허용키=iframe, 억제키=suppress. R-홀드 연속줍기는 rift 중 억제' }),
  keyup:            Object.freeze({ field:'type=keyup', rule:'release 는 parent combat 아님. rift 중 target=none+clearHeld. rift 밖 passthrough(parent 가 자체 KH 해제)' }),
  windowblur:       Object.freeze({ field:'type=blur', rule:'clearHeld=true (parent/iframe held 전부 해제; game.html:12901 _clearHeldInput 의미)' }),
  composition:      Object.freeze({ field:'isComposing', rule:'isComposing=true → 텍스트 입력(iframe). parent combat/줍기 소비0' }),
  pointerownership: Object.freeze({ field:'type=mouse*/pointer*', rule:'rift 중 modal/iframe 이 포인터 소유 → parent 마우스 combat(mouse0/2) suppress' }),
  focusloss:        Object.freeze({ field:'focus→iframe', rule:'parent focus 상실 → onRiftOpenClearHeld 로 parent held 해제, parent combat 발생0' }),
});
export const RIFT_INPUT_POLICY = Object.freeze({
  completionId:'CH1-RIFT-MAIN-PARALLEL-20261007-SKILL-CANDIDATE',
  onRiftOpenClearHeld:true,   // rift open 전이 시 parent held 정리(스턱키 방지; game.html:12901)
  failClosed:'malformed/accessor/unknown event → allowParent=false (억제측 안전)',
});

const RELEASE_TYPES = new Set(['keyup','mouseup','pointerup','blur','compositionend','focusout']);
const POINTER_TYPES = new Set(['mousedown','mouseup','pointerdown','pointerup','auxclick','contextmenu']);
const IFRAME_ALLOW = new Set(IFRAME_ALLOW_KEYS);

function D(target, allowParent, reason, extra){ return Object.freeze(Object.assign({ target, allowParent, reason }, extra||{})); }

/* ── 순수 분류기 ──────────────────────────────────────────────────────────
 * classify(event, state)
 *   state: { riftOpen:boolean, gameActive?:boolean }
 *   반환: { target:'parent'|'iframe'|'none', allowParent:boolean, reason, clearHeld?, suppressedCategory?, providersUnknown? }
 *   - riftOpen=true: parent combat/action/pickup/auto-next 억제, iframe 허용키만 통과.
 *   - riftOpen=false: passthrough(기존 Q/E/스킬 의미 변경0).
 *   - 이벤트 검증 실패 → fail-closed(allowParent=false).
 */
export function classify(event, state = {}){
  const riftOpen = state.riftOpen === true;
  const det = detachEvent(event);
  if (!det.ok) return D('none', false, 'failclosed-unreadable-event', { providersUnknown: det.unknown });
  const ev = det.ev;
  const unknown = det.unknown.length ? det.unknown.slice() : undefined;

  if (!riftOpen){
    // rift 닫힘: 기존 경로 그대로. (unknown 필드가 있어도 type 은 유효 → parent 가 자체 처리)
    return D('parent', true, 'rift-closed-passthrough', unknown ? { providersUnknown: unknown } : undefined);
  }

  // ── rift 열림 ──
  if (ev.type === 'blur' || ev.type === 'focusout')
    return D('none', false, 'rift-blur-clear-held', { clearHeld:true, providersUnknown:unknown });
  if (RELEASE_TYPES.has(ev.type))
    return D('none', false, 'rift-release-no-parent-combat', { clearHeld:true, providersUnknown:unknown });
  if (ev.isComposing === true)
    return D('iframe', false, 'rift-ime-composition', { providersUnknown:unknown });
  if (POINTER_TYPES.has(ev.type))
    return D('none', false, 'rift-pointer-owned-by-modal', { suppressedCategory:'combat', providersUnknown:unknown });

  // keydown/compositionstart 등 press 계열
  if (typeof ev.code === 'string' && IFRAME_ALLOW.has(ev.code))
    return D('iframe', false, 'rift-iframe-interaction', { continue: CONTINUE_KEYS.includes(ev.code), providersUnknown:unknown });

  // 그 외 parent combat/action/스킬/R-줍기 → 억제
  let cat = 'combat';
  if (typeof ev.code === 'string'){
    for (const [name, def] of Object.entries(PARENT_SUPPRESSED)) if (def.keys.includes(ev.code)) { cat = name; break; }
  }
  return D('none', false, 'rift-suppress-parent', { suppressedCategory:cat, providersUnknown:unknown });
}

// auto-next-stage 는 이벤트가 아니라 게임루프 출구-타일 검사(game.html:40562). rift 중 억제 플래그.
export function shouldSuppressAutoNextStage(state = {}){ return state.riftOpen === true; }
// rift open 전이 시 parent held 정리 권고(스턱키 방지).
export function clearHeldOnRiftOpen(prev = {}, next = {}){ return next.riftOpen === true && prev.riftOpen !== true; }

export default {
  RIFT_INPUT_POLICY, IFRAME_ALLOW_KEYS, CONTINUE_KEYS, PARENT_SUPPRESSED, KEYMAP_CONFLICTS, BOUNDARY_TABLE,
  classify, shouldSuppressAutoNextStage, clearHeldOnRiftOpen,
};

/* ── 인라인 자가검증 (node stdin 1회; FAIL→throw→nonzero). 순수 정책(외부 소스 불필요) ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ if(c)pass++; else { fail++; console.error('FAIL:',n); } };
  const OPEN={riftOpen:true}, SHUT={riftOpen:false,gameActive:false}, ACT={riftOpen:false,gameActive:true};

  // inactive/closed: 기존 Q/E/스킬 의미 변경0 → passthrough
  ok('closed Q passthrough', classify({type:'keydown',code:'KeyQ'},ACT).allowParent===true);
  ok('closed E passthrough', classify({type:'keydown',code:'KeyE'},SHUT).allowParent===true);
  ok('closed mouse0 passthrough', classify({type:'mousedown',button:0},ACT).allowParent===true);

  // rift open: parent combat/action/pickup 억제
  ok('open Q suppressed(parry)', (r=>r.allowParent===false&&r.suppressedCategory==='action_parry')(classify({type:'keydown',code:'KeyQ'},OPEN)));
  ok('open E suppressed(shield)', classify({type:'keydown',code:'KeyE'},OPEN).suppressedCategory==='action_shield');
  ok('open R suppressed(hold-pickup)', classify({type:'keydown',code:'KeyR'},OPEN).suppressedCategory==='hold_pickup_R');
  ok('open Digit1 suppressed(skills)', classify({type:'keydown',code:'Digit1'},OPEN).suppressedCategory==='skills');
  ok('open mouse0 suppressed(pointer)', (r=>r.allowParent===false&&r.target==='none')(classify({type:'mousedown',button:0},OPEN)));

  // rift open: iframe 대화/걷기/Tab/Enter/Space/Escape/continue 허용
  ok('open walk→iframe', classify({type:'keydown',code:'KeyW'},OPEN).target==='iframe');
  ok('open Tab→iframe (no parent inv)', (r=>r.target==='iframe'&&r.allowParent===false)(classify({type:'keydown',code:'Tab'},OPEN)));
  ok('open Space→iframe continue', (r=>r.target==='iframe'&&r.continue===true)(classify({type:'keydown',code:'Space'},OPEN)));
  ok('open Enter continue', classify({type:'keydown',code:'Enter'},OPEN).continue===true);
  ok('open Escape→iframe', classify({type:'keydown',code:'Escape'},OPEN).target==='iframe');
  ok('open R NOT continue', classify({type:'keydown',code:'KeyR'},OPEN).continue!==true);

  // 경계: repeat/keyup/blur/composition/pointer/focus
  ok('repeat suppressed same as press', classify({type:'keydown',code:'KeyQ',repeat:true},OPEN).allowParent===false);
  ok('repeat walk still iframe', classify({type:'keydown',code:'KeyW',repeat:true},OPEN).target==='iframe');
  ok('keyup open → clearHeld none', (r=>r.target==='none'&&r.clearHeld===true)(classify({type:'keyup',code:'KeyW'},OPEN)));
  ok('blur open → clearHeld', classify({type:'blur'},OPEN).clearHeld===true);
  ok('composition → iframe', classify({type:'keydown',code:'KeyA',isComposing:true},OPEN).target==='iframe');
  ok('pointerup open → none', classify({type:'pointerup',button:0},OPEN).target==='none');

  // accessor/unknown/error fail-closed
  const accEv={type:'keydown'}; Object.defineProperty(accEv,'code',{get(){return 'KeyQ';},enumerable:true});
  ok('accessor code → failclosed', (r=>r.allowParent===false&&r.reason==='failclosed-unreadable-event')(classify(accEv,OPEN)));
  const accType={}; Object.defineProperty(accType,'type',{get(){return 'keydown';},enumerable:true});
  ok('accessor type → failclosed', classify(accType,OPEN).allowParent===false);
  const nonPrim={type:'keydown',code:'KeyW',repeat:{}}; // repeat 비원시
  ok('non-primitive field reported', (classify(nonPrim,OPEN).providersUnknown||[]).some(u=>u.startsWith('repeat-')));
  ok('non-object event failclosed', classify(null,OPEN).allowParent===false);
  ok('closed accessor also failclosed', classify(accEv,SHUT).allowParent===false); // fail-closed 양상태

  // auto-next-stage / clearHeldOnOpen
  ok('auto-next suppressed when open', shouldSuppressAutoNextStage(OPEN)===true);
  ok('auto-next allowed when closed', shouldSuppressAutoNextStage(SHUT)===false);
  ok('clearHeld on open transition', clearHeldOnRiftOpen({riftOpen:false},{riftOpen:true})===true);
  ok('no clearHeld if already open', clearHeldOnRiftOpen({riftOpen:true},{riftOpen:true})===false);

  // 테이블 export 계약
  ok('KEYMAP R conflict exported', KEYMAP_CONFLICTS.some(c=>c.key==='KeyR'&&c.riftDecision==='suppress-parent'));
  ok('BOUNDARY_TABLE has 6 boundaries', Object.keys(BOUNDARY_TABLE).length===6);
  ok('PARENT_SUPPRESSED has R src:line', /31736|31739/.test(PARENT_SUPPRESSED.hold_pickup_R.src));

  console.log(`rift-main-input-policy self-test: ${pass} pass, ${fail} fail`);
  if (fail>0) throw new Error(`${fail} assertion(s) FAILED`);
  return true;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('rift-main-input-policy.candidate.mjs')){
  _selfTest();
}
