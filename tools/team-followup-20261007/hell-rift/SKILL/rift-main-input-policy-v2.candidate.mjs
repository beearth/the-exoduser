// rift-main-input-policy-v2.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1-RIFT-MAIN-POLICIES-FIX-20261007.
// OFFICIAL-COMPLETION-ID: CH1-RIFT-MAIN-POLICIES-FIX-20261007-SKILL-CANDIDATE
// 원 v1(읽기만, 불변): ./rift-main-input-policy.candidate.mjs
//
// 원총괄 검수 결함 FIX:
//   P1a) v1:111 `const riftOpen = state.riftOpen === true;` · v1:145/147 `state.riftOpen===true`/`next.riftOpen===true`
//        → state 의 getter/상속 프로퍼티를 직접 조회. v2: readRiftOpen() own-data primitive schema 로만 판정,
//        getter/inherited/thenable/proxy-descriptor-throw = fail-closed(실행0, Error.message 조회0).
//   P1b) v1:44 detachEvent 가 own `type` 를 요구 → 실제 KeyboardEvent 는 type/code 가 prototype accessor 라
//        own 이 아니어서 malformed 로 판정, rift OFF 상태의 Q/E 까지 차단. v2: rift inactive(명시 own false)면
//        "event 검증/선점 전에" 즉시 기존 동작 그대로 통과(prototype/real-DOM event 포함, schema 미적용).
//        active 일 때만 root 가 primitive 로 project 한 plain 이벤트를 소비하며, policy 는 raw DOM getter 를
//        직접 실행하지 않는다(= own-data 만 조회; prototype/ accessor 는 project 안 됨으로 거부).
//
// 실제 본문 Read(검색 아님) 근거:
//   tools/2_5d-world-lab.mjs:353 movementKeys(KeyW/A/S/D,Arrows,ShiftLeft/Right,KeyJ),
//     :355 KeyJ→attack(attackQueued), :356 Space→$('pause').click()=일시정지(※stage-continue 아님),
//     :357 KeyR→talk()=대화 open, :358 Escape→closeDialogue, :360 keyup movement delete, :362 blur→clearIntent,
//     :209/:221 Shift→run(470 vs 260), :56 clearIntent(keys.clear+attackQueued=false+release). (tools/2_5d/lab.mjs 부재→PENDING)
//   tools/2_5d/editor-preview-host.mjs:109 panel.showModal,:162-169 onModalKey capture(Tab/Enter/Space/Escape native 유지),:179 snapshot().active.
//   game.html:6109 weapon mouse0/shield KeyE,:6111 parry KeyQ,:6112 beam mouse2,:6114 interact KeyR/inventory Tab/settings Escape,:6110 bow Space,
//     :31608 isJust('interact') 단발 줍기,:31736 isHeld('interact') R-홀드 연속줍기(:31739 _pickHoldT>=9),
//     :40562-40565 출구타일 자동진행,:13365 _pollGamepad(합성 키코드 주입)/:60015 루프 호출,:12901 _clearHeldInput(blur/visibility).
//
// 순수 policy. game/host/editor/public/main/docs/Git 미수정. 본편 BINDS/Q-only blackBean(E패링0)/어택티켓 의미변경0.

'use strict';

/* ── own-data primitive 조회. getter/throw = 실행0 + 신호. (proxy descriptor throw 포함) ── */
function ownData(o, key){
  if (o === null || (typeof o !== 'object' && typeof o !== 'function')) return { ok:false, reason:'non-object' };
  let d; try{ d = Object.getOwnPropertyDescriptor(o, key); }catch(_){ return { ok:false, reason:'descriptor-threw' }; } // Error.message 미조회
  if (!d) return { ok:true, has:false, value:undefined };
  if (!Object.hasOwn(d, 'value')) return { ok:false, reason:'accessor' };   // getter → 실행0, 거부
  return { ok:true, has:true, value:d.value };
}
function looksThenable(o){ const r = ownData(o,'then'); if(!r.ok) return true; if(r.has && (typeof r.value==='function')) return true;
  // 상속 then(accessor 포함) 탐지: prototype 체인 descriptor 조회(실행0)
  try{ let p=Object.getPrototypeOf(o); for(let i=0;p&&i<16;i++){ let d; try{ d=Object.getOwnPropertyDescriptor(p,'then'); }catch(_){ return true; } if(d){ if(typeof d.get==='function')return true; if(Object.hasOwn(d,'value')&&typeof d.value==='function')return true; } p=Object.getPrototypeOf(p); } }catch(_){ return true; }
  return false; }

/* ── state schema: riftOpen 을 own-data boolean 으로만 판정 ── */
function readRiftOpen(state){
  if (state===null || (typeof state!=='object' && typeof state!=='function')) return { status:'invalid', reason:'state-non-object' };
  if (looksThenable(state)) return { status:'invalid', reason:'state-thenable' };
  const r = ownData(state, 'riftOpen');
  if (!r.ok) return { status:'invalid', reason:'riftOpen-'+r.reason };     // accessor/inherited/descriptor-threw
  if (!r.has || typeof r.value !== 'boolean') return { status:'invalid', reason:'riftOpen-not-own-boolean' };
  return { status: r.value ? 'active' : 'inactive' };
}

/* ── projected event(= root 가 native DOMevent 를 primitive 로 project)만 own-data 로 검증. raw DOM getter 실행0 ── */
const HARD = new Set(['accessor','descriptor-threw','non-object']);
function detachProjected(ev){
  const unknown=[];
  const t = ownData(ev,'type');
  if (!t.ok) return { ok:false, reason: HARD.has(t.reason)?'failclosed-event':'event-malformed', unknown:['type-'+t.reason] };
  if (!t.has || typeof t.value!=='string' || !t.value) return { ok:false, reason:'event-not-projected', unknown:['type-not-own-string'] }; // 실제 DOMevent(prototype accessor) 거부
  const out={ type:t.value };
  const take=(k,want)=>{ const r=ownData(ev,k); if(!r.ok){ if(HARD.has(r.reason)) return r.reason; unknown.push(k+'-'+r.reason); return null; }
    if(r.has){ if(typeof r.value!==want || (want==='number'&&!Number.isFinite(r.value))) unknown.push(k+'-type'); else out[k]=r.value; } return null; };
  for(const k of ['code','key']){ const h=take(k,'string'); if(h) return { ok:false, reason:'failclosed-event', unknown:[...unknown,k+'-'+h] }; }
  for(const k of ['repeat','isComposing']){ const h=take(k,'boolean'); if(h) return { ok:false, reason:'failclosed-event', unknown:[...unknown,k+'-'+h] }; }
  { const h=take('button','number'); if(h) return { ok:false, reason:'failclosed-event', unknown:[...unknown,'button-'+h] }; }
  return { ok:true, ev:out, unknown };
}

/* ── 테이블 exports ── */
// rift active 중 iframe(lab)으로 가는 키 + 실제 lab 의미(world-lab.mjs). parent 는 해당 키 소비0.
export const IFRAME_ALLOW = Object.freeze({
  KeyW:'walk', KeyA:'walk', KeyS:'walk', KeyD:'walk',
  ArrowUp:'walk', ArrowDown:'walk', ArrowLeft:'walk', ArrowRight:'walk',
  ShiftLeft:'run', ShiftRight:'run',           // :209/:221 달리기
  KeyJ:'attack',                               // :355 J 공격 (parent J=stats 억제)
  KeyR:'dialogue',                             // :357 R 대화 (parent R=줍기 억제)
  Space:'pause',                               // :356 Space=일시정지 (※ stage-continue 아님)
  Escape:'close-dialogue',                     // :358 대화 닫기
  Tab:'modal-native', Enter:'modal-native', NumpadEnter:'modal-native', // host :163 native 유지
});
export const IFRAME_ALLOW_KEYS = Object.freeze(Object.keys(IFRAME_ALLOW));
// parent(본편 game.html) 억제 범주 + source:line.
export const PARENT_SUPPRESSED = Object.freeze({
  combat:        Object.freeze({ keys:['mouse0','mouse2'], src:'game.html:6109 weapon mouse0 / :6112 beam mouse2' }),
  action_parry:  Object.freeze({ keys:['KeyQ'],            src:'game.html:6111 parry KeyQ (보호2_3/Q-only blackBean)' }),
  action_shield: Object.freeze({ keys:['KeyE'],            src:'game.html:6109 shield KeyE (E 패링불가)' }),
  skills:        Object.freeze({ keys:['Digit1','Digit2','Digit3','Digit4','KeyZ','KeyF','ControlLeft'], src:'game.html:12796/12832/12822/12826' }),
  hold_pickup_R: Object.freeze({ keys:['KeyR'],            src:'game.html:6114 interact KeyR; :31608 isJust 단발; :31736 isHeld 홀드; :31739 _pickHoldT>=9(~150ms)' }),
  auto_next_stage: Object.freeze({ keys:[],                src:'game.html:40562-40565 출구타일 자동진행(이벤트 아님→루프 억제 플래그)' }),
});
// R 키맵 충돌: parent 는 KeyR=줍기(단발+홀드), lab 은 KeyR=대화. rift active 시 iframe(대화) 우선·parent 억제.
export const KEYMAP_CONFLICTS = Object.freeze([
  Object.freeze({ key:'KeyR', parent:['interact-isJust(game.html:31608)','holdPickup-isHeld(game.html:31736,:31739)'], lab:'talk/dialogue(world-lab.mjs:357)', riftDecision:'iframe-dialogue · parent-suppress' }),
  Object.freeze({ key:'Space', parent:['bow(game.html:6110)'], lab:'pause(world-lab.mjs:356)', riftDecision:'iframe-pause · NOT stage-continue' }),
  Object.freeze({ key:'KeyJ', parent:['stats?(game.html:6114 stats KeyJ)'], lab:'attack(world-lab.mjs:355)', riftDecision:'iframe-attack · parent-suppress' }),
  Object.freeze({ key:'Tab', parent:['inventory(game.html:6114)'], lab:'modal-native(host:163)', riftDecision:'iframe-native · parent-suppress' }),
]);
export const BOUNDARY_TABLE = Object.freeze({
  keyrepeat:        Object.freeze({ field:'repeat', rule:'repeat 무관 동일 분류. 허용키=iframe, 억제키=suppress. R-홀드 줍기는 parent 억제' }),
  keyup:            Object.freeze({ field:'type=keyup', rule:'release=parent combat 아님. active → target none + clearHeld. inactive → passthrough' }),
  windowblur:       Object.freeze({ field:'type=blur', rule:'clearHeld=true (parent/iframe held 해제; game.html:12901 _clearHeldInput / world-lab.mjs:362 clearIntent)' }),
  composition:      Object.freeze({ field:'isComposing', rule:'isComposing=true → 텍스트(iframe). parent 소비0' }),
  pointerownership: Object.freeze({ field:'type=mouse*/pointer*', rule:'active → modal/iframe 포인터 소유 → parent mouse combat suppress' }),
  focusloss:        Object.freeze({ field:'focus→iframe', rule:'parent focus 상실 → clearHeldOnRiftOpen 로 parent held 해제' }),
});
// parent already-held / gamepad 경계 (iframe allow 와 분리).
export const PARENT_HELD_GAMEPAD = Object.freeze({
  alreadyHeld: 'rift open 전 눌린 parent 키 → clearHeldOnRiftOpen(true) 로 _clearHeldInput(game.html:12901) 권고. stuck-key 방지.',
  gamepad: 'game.html:13365 _pollGamepad 합성 키코드 주입/:60015 루프 호출 → rift active 중 shouldSuppressGamepadPoll(true) 로 주입 억제. 패드 역시 parent combat 억제 대상.',
});
export const RIFT_INPUT_POLICY_V2 = Object.freeze({
  completionId:'CH1-RIFT-MAIN-POLICIES-FIX-20261007-SKILL-CANDIDATE',
  failClosed:'invalid state / active 미-project event / accessor·proxy-throw → allowParent=false (getter 실행0)',
  inactivePassthrough:'state.riftOpen own false → event 검증 전 즉시 passthrough(real-DOM/prototype 포함; 기존 Q/E/스킬 의미 변경0)',
  projection:'active 는 root 가 native DOMevent 를 plain primitive 로 project; policy 는 raw getter 직접 실행0',
});

const RELEASE_TYPES = new Set(['keyup','mouseup','pointerup','blur','compositionend','focusout']);
const POINTER_TYPES = new Set(['mousedown','mouseup','pointerdown','pointerup','auxclick','contextmenu']);
function D(target, allowParent, reason, extra){ return Object.freeze(Object.assign({ target, allowParent, reason }, extra||{})); }

/**
 * classify(projectedEvent, state)
 *   state: own-data { riftOpen:boolean } (root 공급). projectedEvent: active 일 때 root 가 primitive 로 project 한 plain 이벤트.
 *   반환: { target:'parent'|'iframe'|'none', allowParent, reason, clearHeld?, suppressedCategory?, labMeaning?, providersUnknown? }
 */
export function classify(projectedEvent, state){
  const st = readRiftOpen(state);
  if (st.status === 'inactive')
    return D('parent', true, 'rift-inactive-passthrough');          // P1b: event 미검증, 기존 동작 그대로
  if (st.status === 'invalid')
    return D('none', false, 'failclosed-state', { providersUnknown:[st.reason] });

  // ── active: root-projected plain primitive 만 소비 (raw DOM getter 실행0) ──
  const det = detachProjected(projectedEvent);
  if (!det.ok) return D('none', false, det.reason, { providersUnknown: det.unknown });
  const ev = det.ev, unknown = det.unknown.length ? det.unknown.slice() : undefined;

  if (ev.type==='blur' || ev.type==='focusout') return D('none', false, 'rift-blur-clear-held', { clearHeld:true, providersUnknown:unknown });
  if (RELEASE_TYPES.has(ev.type))               return D('none', false, 'rift-release-no-parent-combat', { clearHeld:true, providersUnknown:unknown });
  if (ev.isComposing === true)                  return D('iframe', false, 'rift-ime-composition', { providersUnknown:unknown });
  if (POINTER_TYPES.has(ev.type))               return D('none', false, 'rift-pointer-owned-by-modal', { suppressedCategory:'combat', providersUnknown:unknown });
  if (typeof ev.code==='string' && Object.hasOwn(IFRAME_ALLOW, ev.code))
    return D('iframe', false, 'rift-iframe-interaction', { labMeaning: IFRAME_ALLOW[ev.code], providersUnknown:unknown });
  let cat='combat';
  if (typeof ev.code==='string') for (const [n,def] of Object.entries(PARENT_SUPPRESSED)) if (def.keys.includes(ev.code)) { cat=n; break; }
  return D('none', false, 'rift-suppress-parent', { suppressedCategory:cat, providersUnknown:unknown });
}
export function shouldSuppressAutoNextStage(state){ return readRiftOpen(state).status === 'active'; }
export function shouldSuppressGamepadPoll(state){ return readRiftOpen(state).status === 'active'; }
export function clearHeldOnRiftOpen(prev, next){ return readRiftOpen(next).status==='active' && readRiftOpen(prev).status!=='active'; }

export default {
  RIFT_INPUT_POLICY_V2, IFRAME_ALLOW, IFRAME_ALLOW_KEYS, PARENT_SUPPRESSED, KEYMAP_CONFLICTS, BOUNDARY_TABLE, PARENT_HELD_GAMEPAD,
  classify, shouldSuppressAutoNextStage, shouldSuppressGamepadPoll, clearHeldOnRiftOpen,
};

/* ── 인라인 자가검증 (node stdin 1회; FAIL→throw→nonzero). 순수 정책 ── */
function _selfTest(){
  let pass=0, fail=0; const ok=(n,c)=>{ if(c)pass++; else { fail++; console.error('FAIL:',n); } };
  const OPEN={riftOpen:true}, OFF={riftOpen:false};

  // P1b: 실제 DOM 과 같은 prototype 이벤트가 rift OFF 에서 통과(Q/E 미차단), event 미검증
  const protoEv=Object.create({ type:'keydown', code:'KeyQ' }); // type/code 가 inherited(own 아님)
  ok('OFF prototype Q passthrough', classify(protoEv, OFF).allowParent===true);
  ok('OFF prototype E passthrough', classify(Object.create({type:'keydown',code:'KeyE'}), OFF).allowParent===true);

  // active: root-projected plain 이벤트 소비
  ok('active Q suppressed(parry)', classify({type:'keydown',code:'KeyQ'},OPEN).suppressedCategory==='action_parry');
  ok('active E suppressed(shield)', classify({type:'keydown',code:'KeyE'},OPEN).suppressedCategory==='action_shield');
  ok('active R→iframe dialogue(not pickup)', (r=>r.target==='iframe'&&r.labMeaning==='dialogue'&&!r.allowParent)(classify({type:'keydown',code:'KeyR'},OPEN)));
  ok('active Shift→iframe run', classify({type:'keydown',code:'ShiftLeft'},OPEN).labMeaning==='run');
  ok('active J→iframe attack', classify({type:'keydown',code:'KeyJ'},OPEN).labMeaning==='attack');
  ok('active Space→iframe pause(NOT continue)', (r=>r.labMeaning==='pause'&&r.reason!=='rift-stage-continue')(classify({type:'keydown',code:'Space'},OPEN)));
  ok('active Escape→close-dialogue', classify({type:'keydown',code:'Escape'},OPEN).labMeaning==='close-dialogue');
  ok('active walk→iframe', classify({type:'keydown',code:'KeyW'},OPEN).labMeaning==='walk');
  ok('active mouse0→none', classify({type:'mousedown',button:0},OPEN).target==='none');

  // active 에서 raw DOM(prototype type) 이벤트 → root 미project → fail-closed(event-not-projected), getter 실행0
  ok('active raw-DOM refused', (r=>r.allowParent===false&&r.reason==='event-not-projected')(classify(protoEv, OPEN)));

  // 경계
  ok('repeat suppressed', classify({type:'keydown',code:'KeyQ',repeat:true},OPEN).allowParent===false);
  ok('keyup clearHeld', classify({type:'keyup',code:'KeyW'},OPEN).clearHeld===true);
  ok('blur clearHeld', classify({type:'blur'},OPEN).clearHeld===true);
  ok('composition→iframe', classify({type:'keydown',code:'KeyR',isComposing:true},OPEN).target==='iframe');

  // invalid state: getter riftOpen → failclosed, getter 실행0
  let sr=0; const sGet={}; Object.defineProperty(sGet,'riftOpen',{get(){sr++;return true;},enumerable:true});
  ok('state getter failclosed', classify({type:'keydown',code:'KeyQ'}, sGet).reason==='failclosed-state');
  ok('state getter not executed', sr===0);
  ok('inherited riftOpen failclosed', classify({type:'keydown',code:'KeyQ'}, Object.create({riftOpen:false})).reason==='failclosed-state');
  ok('non-object state failclosed', classify({type:'keydown',code:'KeyQ'}, null).allowParent===false);
  ok('non-boolean riftOpen failclosed', classify({type:'keydown',code:'KeyQ'}, {riftOpen:1}).reason==='failclosed-state');

  // active event accessor/proxy throw → failclosed, getter 실행0
  let er=0; const evGet={type:'keydown'}; Object.defineProperty(evGet,'code',{get(){er++;return 'KeyQ';},enumerable:true});
  ok('event code getter failclosed', classify(evGet,OPEN).allowParent===false);
  ok('event code getter not executed', er===0);
  const proxyThrow=new Proxy({},{getOwnPropertyDescriptor(){throw new Error('t');},get(){throw new Error('g');}});
  ok('proxy descriptor throw failclosed', classify(proxyThrow,OPEN).allowParent===false);

  // gamepad / auto-next / clearHeld (iframe allow 와 분리된 경계)
  ok('gamepad poll suppressed active', shouldSuppressGamepadPoll(OPEN)===true);
  ok('gamepad poll ok inactive', shouldSuppressGamepadPoll(OFF)===false);
  ok('auto-next suppressed active', shouldSuppressAutoNextStage(OPEN)===true);
  ok('clearHeld on open transition', clearHeldOnRiftOpen(OFF,OPEN)===true);
  ok('no clearHeld already open', clearHeldOnRiftOpen(OPEN,OPEN)===false);

  // 테이블 계약
  ok('Space conflict = NOT continue', KEYMAP_CONFLICTS.some(c=>c.key==='Space'&&/NOT stage-continue/.test(c.riftDecision)));
  ok('R conflict lab=dialogue', KEYMAP_CONFLICTS.some(c=>c.key==='KeyR'&&/dialogue/.test(c.lab)));
  ok('gamepad boundary exported', /_pollGamepad/.test(PARENT_HELD_GAMEPAD.gamepad));

  console.log(`rift-main-input-policy-v2 self-test: ${pass} pass, ${fail} fail`);
  if (fail>0) throw new Error(`${fail} assertion(s) FAILED`);
  return true;
}
if (typeof process!=='undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('rift-main-input-policy-v2.candidate.mjs')){
  _selfTest();
}
