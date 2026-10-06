// dark-druid-state-adapter-2_5d.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-2_5D-CHARACTER-MAP-SLICE-20261006-BOSS / ROLE BOSS / UUID 72ba2963-…
// OFFICIAL-COMPLETION-ID CH1-2_5D-CHARACTER-MAP-SLICE-20261006-BOSS-CANDIDATE
//
// 목적(goals doc §BOSS): 다크드루이드의 기존 방향 원화 + walk/attack/dive/emerge/
// transform 상태를 **실제 rig 표시 API**에 연결하는 consumer. si/전투 LOCK/보호2_3/
// 체력·피해값 변경 0. 완전 3D 본모델 가정 0 — rig에 없는 상태는 명시 fallback.
//
// 접점이 되는 실제 API (read-only, 미수정):
//   tools/2_5d/character-rigs.mjs      createCharacterRig(id,{THREE,height}) →
//       { object3d, update(dt,{mode,direction,phase,speed}), snapshot(), dispose() }
//     · update mode 계약(character-rigs.mjs:132): ['idle','walk','run','attack']만 허용,
//       direction 정수 0..7. 그 외는 throw — 따라서 dive/emerge/transform은 전용 mode 없음.
//   tools/2_5d/character-rig-catalog.mjs  characterRigFrame(id,mode,direction,index),
//       CHARACTER_RIG_DIRECTIONS, CHARACTER_RIG_CATALOG, CHARACTER_RIG_CONFIG
//     · dark-druid frames(catalog:36): {idle:1, walk:4, run:4, attack:4}
//     · run은 walk 원화 재사용(catalog:44 주석), druidFrameInterval=0.15.
//     · 승인 원화 3종(다른 bossGLB 대체 0):
//         idle  assets/sprites/boss/boss_dark_druid_8dir_v3.png sha ceb3843f… (1656×1240)
//         walk  assets/sprites/boss/boss_dark_druid_walk.png    sha 6da45fef… (887×1774)
//         attack assets/sprites/boss/boss_dark_druid_attack.png sha 79e0f8e6… (887×1774)
//   방향 배열(catalog:1): [south,SE,east,NE,north,NW,west,SW] = index 0..7.
//
// 이 파일은 데이터/로직만 제공(순수). THREE/DOM 없이 import 가능. createCharacterRig는
// 호출자(3387 world-lab)가 소유 — 본 adapter는 그 update()에 넣을 인자를 계산.
// ─────────────────────────────────────────────────────────────────────────────

export const RIG_ID = 'dark-druid';
export const RIG_MODES = Object.freeze(['idle', 'walk', 'run', 'attack']); // character-rigs.mjs:132 계약
export const DRUID_FRAMES = Object.freeze({ idle: 1, walk: 4, run: 4, attack: 4 }); // catalog:36

// ── 게임 실제 druid 상태(e.s) → rig mode 매핑 ──
// game.html _druidFinaleAI / _isDruidFinale 상태. kind:'native'=rig 전용 mode 존재,
// 'fallback'=전용 art 없음→근접 mode 재사용(명시). missingDedicatedArt=true는 완료로
// 꾸미지 말 것(goals doc §12/§BOSS). vfx는 game.html의 **기존** 연출 참조(신규 art 0).
export const DRUID_STATE_MAP = Object.freeze({
  // --- locomotion / idle ---
  idle:            { rigMode: 'idle',   kind: 'native',   note: '정지/대기 — 8dir idle 원화 1프레임' },
  bossDruidRest:   { rigMode: 'idle',   kind: 'native',   note: '회복/휴식(st2 카운트) — idle 유지' },
  recover:         { rigMode: 'idle',   kind: 'native',   note: 'mkEn recover — idle' },
  bossRec:         { rigMode: 'idle',   kind: 'native',   note: '보스 공통 회복 — idle' },
  // 'walk'는 game에 전용 e.s 없음: AI 추격 이동(moving=true)에서 파생 → rig walk
  __moving:        { rigMode: 'walk',   kind: 'native',   note: '이동(motionSpeed>0, AI 추격) → walk 원화' },
  // --- attack (wind-up/active 공통 → attack) ---
  bossDruidVolley:     { rigMode: 'attack', kind: 'native', note: 'Q 독탄 방사' },
  bossDruidVolleyWind: { rigMode: 'attack', kind: 'native', note: '방사 전조(48f) — attack 전반부 phase' },
  bossCharge:          { rigMode: 'attack', kind: 'native', note: '돌진 타격' },
  bossChargeWind:      { rigMode: 'attack', kind: 'native', note: '돌진 전조' },
  // --- dive: 전용 mode 없음 → fallback ---
  bossDruidDive:   { rigMode: 'run',    kind: 'fallback', missingDedicatedArt: true,
                     note: '잠복 돌입(지면 아래로). dive 전용 원화 없음 → run(=walk 원화 재사용, 빠른 이동) + 하강 billboard. 완전3D 잠복 아님.' },
  bossDruidUnder:  { rigMode: 'idle',   kind: 'fallback', missingDedicatedArt: true, hideBillboard: true,
                     note: '완전 잠복(표적 고정). 지상 표현 없음 → billboard 숨김(object3d.visible=false). 지면 텔레그래프는 ANIMVFX/게임 기존 연출 소유.' },
  // --- emerge: 전용 mode 없음 → fallback ---
  bossDruidErupt:  { rigMode: 'attack', kind: 'fallback', missingDedicatedArt: true,
                     note: '분출/상승 타격. emerge 전용 원화 없음 → attack 재사용(분출=타격). 상승 VFX는 게임 기존 druid_shockring 참조.' },
  // --- transform: 전용 mode 없음 → fallback (phase/last-stand) ---
  bossDruidTransform: { rigMode: 'idle', kind: 'fallback', missingDedicatedArt: true, vfxRef: 'boss_revive_boom/druid_shockring',
                     note: '페이즈 전환/마지막 저항(_druidLastStand, _bossPhase, _reviveDruidFinale). 변신 전용 원화 없음 → idle 홀드 + 기존 재소환 VFX 오버레이. 새 변신 모델 주장 0.' },
});

// 게임 상태→adapter 논리 상태 별칭(여러 e.s를 한 논리 상태로). 호출자가 e.s를 그대로 넘기면
// resolveState가 우선 DRUID_STATE_MAP를 보고, 없으면 접미사 규칙(…Wind→attack 등)으로 좁힘.
export function resolveState(eState, { moving = false } = {}) {
  if (moving && (eState === 'idle' || eState === 'bossDruidRest' || eState == null)) return '__moving';
  if (DRUID_STATE_MAP[eState]) return eState;
  // 미등록 boss* 공격 상태의 안전 좁힘(전투 LOCK 수치 불변 — 표시만): …Wind/공격류 → attack
  if (typeof eState === 'string' && /^boss[A-Z]/.test(eState)) return '__genericAttack';
  return 'idle';
}

// 명시되지 않은 일반 boss 공격 상태의 표시 fallback(수치/전투 불변, attack 원화 재사용).
const GENERIC_ATTACK = Object.freeze({ rigMode: 'attack', kind: 'fallback', missingDedicatedArt: false,
  note: '미등록 boss* 공격 상태 — attack 원화 재사용(표시만, 전투 수치 불변)' });

// ── facing(라디안, game.html e.facing=atan2(P.y-e.y,P.x-e.x)) → direction index 0..7 ──
// south(+y,down)=0, SE=1, east=2, NE=3, north=4, NW=5, west=6, SW=7 (catalog:1 배열 순서).
export function facingToDirection(angle) {
  if (!Number.isFinite(angle)) return 0; // south 기본
  const i = Math.round((Math.PI / 2 - angle) / (Math.PI / 4));
  return ((i % 8) + 8) % 8;
}

// ── 메인 consumer: 게임 druid 틱 → rig.update(dt, args) 인자 ──
// 반환 args.mode는 항상 RIG_MODES 안(=rig throw 방지). visible=false면 billboard 숨김.
export function druidRigArgs({ state, facing = Math.PI / 2, moving = false, phase, speed } = {}) {
  const key = resolveState(state, { moving });
  const entry = key === '__genericAttack' ? GENERIC_ATTACK : DRUID_STATE_MAP[key];
  const mode = entry.rigMode;
  if (!RIG_MODES.includes(mode)) throw new Error(`rig mode 계약 위반: ${mode}`);
  const direction = facingToDirection(facing);
  const args = { mode, direction };
  if (Number.isFinite(phase)) args.phase = Math.max(0, Math.min(1, phase));
  if (Number.isFinite(speed)) args.speed = speed;
  return {
    rigUpdateArgs: args,                 // rig.update(dt, rigUpdateArgs) 로 전달
    visible: entry.hideBillboard ? false : true,
    resolvedState: key,
    kind: entry.kind,
    missingDedicatedArt: !!entry.missingDedicatedArt,
    vfxRef: entry.vfxRef || null,
    note: entry.note,
  };
}

// ── 순수 검증: 모든 매핑 mode가 rig 허용 집합 안이고, dark-druid characterRigFrame이
//    (mode,direction,index) 전부에서 throw 없이 프레임을 반환하는지. (THREE/DOM 불필요) ──
export async function verify() {
  const { characterRigFrame, CHARACTER_RIG_CATALOG } = await import('../../../2_5d/character-rig-catalog.mjs');
  const results = [];
  const allStates = [...Object.keys(DRUID_STATE_MAP), '__genericAttack'];
  // 1) 모든 상태의 mode가 허용 집합 안
  for (const k of allStates) {
    const e = k === '__genericAttack' ? GENERIC_ATTACK : DRUID_STATE_MAP[k];
    results.push({ check: `mode(${k})=${e.rigMode}`, ok: RIG_MODES.includes(e.rigMode) });
  }
  // 2) frames 계약이 catalog와 일치
  const cat = CHARACTER_RIG_CATALOG[RIG_ID];
  results.push({ check: 'catalog frames 일치', ok: JSON.stringify(cat.frames) === JSON.stringify(DRUID_FRAMES) });
  // 3) 8방향 × 각 mode × 각 frame index에서 characterRigFrame 반환(throw 0)
  let frameOk = true, frameErr = '';
  for (const mode of RIG_MODES) {
    for (let d = 0; d < 8; d++) {
      for (let i = 0; i < DRUID_FRAMES[mode]; i++) {
        try { const f = characterRigFrame(RIG_ID, mode, d, i); if (!f || !f.path) { frameOk = false; frameErr = `${mode}/${d}/${i} 빈 프레임`; } }
        catch (err) { frameOk = false; frameErr = `${mode}/${d}/${i}: ${err.message}`; }
      }
    }
  }
  results.push({ check: 'characterRigFrame 8dir×mode×frame throw 0', ok: frameOk, detail: frameErr });
  // 4) facingToDirection 경계(8방위 대표각)
  const dirSpec = [[Math.PI / 2, 0], [Math.PI / 4, 1], [0, 2], [-Math.PI / 4, 3], [-Math.PI / 2, 4], [-3 * Math.PI / 4, 5], [Math.PI, 6], [3 * Math.PI / 4, 7]];
  const dirOk = dirSpec.every(([a, want]) => facingToDirection(a) === want);
  results.push({ check: 'facingToDirection 8방위', ok: dirOk });
  const ok = results.every(r => r.ok);
  return { ok, results };
}

export default { RIG_ID, RIG_MODES, DRUID_FRAMES, DRUID_STATE_MAP, resolveState, facingToDirection, druidRigArgs, verify };

// 직접 실행(IO 없음): node dark-druid-state-adapter-2_5d.candidate.mjs → verify 출력.
const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = await verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.check}${c.detail ? ' :: ' + c.detail : ''}`);
  console.log(`verify: ${r.ok ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = r.ok ? 0 : 1; } catch { /* ignore */ }
}
