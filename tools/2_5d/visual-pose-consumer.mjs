// ROOT-ADOPTED derivative for the combined isolated 3387 lab; source candidate is preserved.
export const VISUAL_POSE_PROVENANCE = Object.freeze({
  status: 'ROOT-ADOPTED', role: 'SKILL', ownerUuid: 'ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4',
  endId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-SKILL-CANDIDATE',
  source: 'tools/team-followup-20261006/hell-rift/SKILL/visual-pose-consumer-2_5d.candidate.mjs',
  sourceBytes: 13284, sourceSha256: '5145fdb8c9ab0031709d21ad76330e997076901fb603b23ce796cf5a0ddcfb9e'
});

// Adopted visual-pose-consumer.mjs; original producer header/provenance follows.
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) — CH1 2.5D 캐릭터 슬라이스 후보.
// OFFICIAL-COMPLETION-ID: CH1-2_5D-CHARACTER-MAP-SLICE-20261006-SKILL-CANDIDATE
// GOAL: docs/0마스터플랜/CH1_2_5D_PRODUCTION_GOALS_20261006.md (전사/실버테일/다크드루이드 8방향 idle/move/attack).
//
// 역할(SKILL): 기존 이동/공격/skill "이벤트" → 현행 rig의 "실제 pose API" 연결.
//   idle/walk/run/attack 전이와 attack 중복(overlap)/해제(release) 수명 복귀를 순수 state로 처리.
//   rootmotion/피해계산/새 스킬 수치/Q 계약 변경 0. 미지원 이벤트를 성공처럼 처리 0.
//
// 근거가 된 실제 source(읽기 전용, 미변경):
//   tools/2_5d/character-rigs.mjs
//     createCharacterRig(id,{THREE,height}) → async → frozen {object3d, update, snapshot, dispose}
//     update(dt,{mode='idle',direction=0,phase,speed}) → object3d
//       · mode ∈ {idle,walk,run,attack}; direction 정수 0..7; phase 선택 [0,1]; speed=관찰값(이동/피해/저장 미변경)
//   tools/2_5d/character-rig-catalog.mjs
//     CHARACTER_RIG_CATALOG(ids: dark-druid/warrior/silvertail, frames per mode),
//     CHARACTER_RIG_CONFIG(frameInterval{idle .65,walk .15,run .1,attack .09}, druidFrameInterval .15),
//     CHARACTER_RIG_DIRECTIONS, characterRigFrame(id,mode,direction,index)
//   tools/2_5d-world-lab.mjs:54  direction=(Math.round(Math.atan2(dx,dy)/(Math.PI/4))+8)%8  ← 실제 방향 규약
//                          :63  rig.update(dt,{...,speed: mode==='run'?1.55:1})              ← speed 규약
//   호출측은 attack 및 skill.poseMode=attack을 1프레임 상승 엣지 이벤트로 전달한다.
//   consumer는 held 키 의미를 만들지 않으며 1회 수명/overlap/release만 처리한다.
//
// 미검증/미지원(허위 완료 금지): rig 에는 idle/walk/run/attack 外 pose 없음.
//   parry/shield/dash/cast 등 전용 포즈 없는 skill 이벤트는 supported:false 로 보고하고 포즈를 지어내지 않는다.
//   → 보호 2_3·Q전용 magic 패링·E불가 계약은 "포즈 미생성"으로 보존(해당 시스템 동작 변경 0).
//   createCharacterRig 자체는 THREE+Image 런타임(브라우저/world-lab) 필요 → 본 모듈은 이벤트→params 매핑만 담당.

import { CHARACTER_RIG_CATALOG, CHARACTER_RIG_CONFIG, CHARACTER_RIG_DIRECTIONS }
  from './character-rig-catalog.mjs';

/* ── 실제 API 에서 파생된 지원 범위(frozen) ─────────────────────────────── */
export const SUPPORTED_MODES = Object.freeze(['idle', 'walk', 'run', 'attack']);
export const SUPPORTED_IDS = Object.freeze(Object.keys(CHARACTER_RIG_CATALOG)); // dark-druid, warrior, silvertail
export const DIRECTIONS = CHARACTER_RIG_DIRECTIONS; // ['south','south-east','east','north-east','north','north-west','west','south-west']

export function isSupportedId(id) { return Object.prototype.hasOwnProperty.call(CHARACTER_RIG_CATALOG, id); }
export function directionName(index) { if(!Number.isInteger(index))throw new Error('방향 index는 정수여야 합니다.'); return DIRECTIONS[((index % 8) + 8) % 8]; }
export function directionIndex(name) { const i = DIRECTIONS.indexOf(name); if (i < 0) throw new Error('알 수 없는 방향: ' + name); return i; }

// world-lab:54 와 동일식 — 게임 (dx,dy) → 0..7. (화면축 규약은 world-lab 소유; 그 식을 그대로 재현)
export function directionFromDelta(dx, dy) {
  if (!Number.isFinite(dx)||!Number.isFinite(dy))throw new Error('이동 방향 입력은 finite 수치여야 합니다.');
  if (!dx && !dy) return null; // 입력 없음 → 호출측이 직전 방향 유지
  return (Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) + 8) % 8;
}

// update() 가 쓰는 실제 지속시간 = interval * frames (druid 는 비-idle 150ms 고정).
export function modeDuration(id, mode) {
  const entry = CHARACTER_RIG_CATALOG[id];
  if (!entry) throw new Error('지원하지 않는 캐릭터: ' + id);
  if (!SUPPORTED_MODES.includes(mode)) throw new Error('지원하지 않는 모드: ' + mode);
  const interval = (id === 'dark-druid' && mode !== 'idle')
    ? CHARACTER_RIG_CONFIG.druidFrameInterval
    : CHARACTER_RIG_CONFIG.frameInterval[mode];
  return interval * entry.frames[mode];
}

/* ── 이벤트 → pose params state machine ──────────────────────────────────
 * intent(프레임별): {
 *   dx, dy        : 이동 입력 벡터(없으면 0) — 방향/locomotion 판정
 *   run           : 달리기 여부(boolean)
 *   attack        : 공격 이벤트(그 프레임의 상승 엣지면 true)
 *   facing        : 명시 방향 0..7(선택; dx/dy 없을 때 우선)
 *   skill         : null | { id, poseMode }  poseMode 는 호출측이 선언한 지원 모드(없으면 미지원)
 * }
 * 반환: { params:{mode,direction,speed,phase?}, supported, action, note }
 *   params 는 rig.update(dt, params) 에 그대로 전달 가능.
 */
export function createVisualPoseConsumer(id, opts = {}) {
  if (!isSupportedId(id)) throw new Error('지원하지 않는 캐릭터: ' + id);
  if(!opts||typeof opts!=='object'||Array.isArray(opts))throw new Error('pose options 객체가 필요합니다.');
  const retrigger = opts.retrigger === true;      // 공격 중 재공격: true=재시작, 기본=수명 끝까지 무시(coalesce)
  const attackDur = modeDuration(id, 'attack');

  const state = {
    mode: 'idle', direction: 0,
    attackRemaining: 0,   // >0 이면 attack 수명 진행 중
    moving: false, running: false,
  };

  function _applyDirection(intent) {
    const fromMove = directionFromDelta(intent.dx ?? 0, intent.dy ?? 0);
    if (fromMove != null) state.direction = fromMove;
    else if (Number.isInteger(intent.facing)) state.direction = ((intent.facing % 8) + 8) % 8;
    // 입력 없고 facing 없으면 직전 방향 유지(release 복귀 포함)
  }

  function resolve(dt, intent = {}) {
    if(!intent||typeof intent!=='object'||Array.isArray(intent))throw new Error('pose intent 객체가 필요합니다.');
    if(!Number.isFinite(intent.dx ?? 0)||!Number.isFinite(intent.dy ?? 0))throw new Error('pose dx/dy는 finite 수치여야 합니다.');
    if(intent.facing!==undefined&&(!Number.isInteger(intent.facing)||intent.facing<0||intent.facing>7))throw new Error('pose facing은 0…7 정수여야 합니다.');
    if(intent.run!==undefined&&typeof intent.run!=='boolean')throw new Error('pose run은 boolean이어야 합니다.');
    if(intent.attack!==undefined&&typeof intent.attack!=='boolean')throw new Error('pose attack은 프레임별 boolean 엣지여야 합니다.');
    if(intent.skill!=null&&(typeof intent.skill!=='object'||Array.isArray(intent.skill)))throw new Error('pose skill 객체가 필요합니다.');
    const d = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    state.moving = !!(intent.dx || intent.dy);
    state.running = !!intent.run && state.moving;
    _applyDirection(intent);

    // 1) skill 이벤트 지원 판정 — 전용 포즈 없는 이벤트는 성공처럼 처리하지 않음.
    let supported = true, note = '';
    let wantAttack = intent.attack === true, explicitMode = null;
    if (intent.skill) {
      const pm = intent.skill.poseMode;
      if (pm === 'attack') { wantAttack = true; }
      else if (['idle','walk','run'].includes(pm)) { explicitMode = pm; }
      else { supported = false; note = `skill '${intent.skill.id}' 전용 포즈 없음(미지원) → 포즈 생성 안 함`; }
      // 보호 2_3/Q-only: 패링·방패·돌진 등은 poseMode 미지정 → supported:false, 기존 locomotion 유지.
    }

    // 2) attack 수명: 상승 엣지 + (비진행 중 또는 retrigger) 에만 arming.
    if (wantAttack && (state.attackRemaining <= 0 || retrigger)) {
      state.attackRemaining = attackDur;
    }

    // 3) 모드 결정 — attack 진행 중이면 attack 우선, 아니면 locomotion.
    let mode, phase;
    if (state.attackRemaining > 0) {
      mode = 'attack';
      // 1회 재생 보장: phase 명시(미지정 시 update 가 루프). remaining 선감산 후 진행도.
      state.attackRemaining = Math.max(0, state.attackRemaining - d);
      phase = Math.min(1, Math.max(0, 1 - state.attackRemaining / attackDur));
    } else {
      mode = explicitMode ?? (state.running ? 'run' : (state.moving ? 'walk' : 'idle'));
    }
    state.mode = mode;

    const params = { mode, direction: state.direction, speed: mode === 'run' ? 1.55 : mode === 'walk' ? 1 : mode === 'idle' ? 0 : (state.moving ? 1 : 0) };
    if (phase != null) params.phase = phase;
    const action = mode === 'attack' ? 'attack' : (mode === 'walk'||mode === 'run' ? 'locomotion' : 'idle');
    return { params, supported, action, note, attackRemaining: state.attackRemaining };
  }

  // held/blur release — world-lab blur(:114) 대응. attack 수명 취소 + idle 복귀(방향 유지).
  function release() {
    state.attackRemaining = 0; state.moving = false; state.running = false; state.mode = 'idle';
    return { params: { mode: 'idle', direction: state.direction, speed: 0 }, supported: true, action: 'idle', note: 'release' };
  }

  function snapshot() {
    return Object.freeze({ id, mode: state.mode, direction: state.direction, directionName: directionName(state.direction),
      attackRemaining: state.attackRemaining, attackDuration: attackDur, retrigger, provenance:VISUAL_POSE_PROVENANCE });
  }

  // 선택 편의: 실제 rig(createCharacterRig 반환)에 params 적용. rig 소유권(생성/dispose)은 호출측.
  function drive(rig, dt, intent) {
    if (!rig || typeof rig.update !== 'function') throw new Error('rig.update API 필요 (createCharacterRig 반환 객체)');
    const r = resolve(dt, intent);
    rig.update(dt, r.params); // update 는 object3d 반환; 이동/피해/저장/카메라 변경 없음(speed=관찰값)
    return { ...r, object3d: rig.object3d };
  }

  return Object.freeze({ resolve, release, snapshot, drive, id, supportedModes: SUPPORTED_MODES });
}

export default {
  VISUAL_POSE_PROVENANCE, SUPPORTED_MODES, SUPPORTED_IDS, DIRECTIONS,
  isSupportedId, directionName, directionIndex, directionFromDelta, modeDuration,
  createVisualPoseConsumer,
};
