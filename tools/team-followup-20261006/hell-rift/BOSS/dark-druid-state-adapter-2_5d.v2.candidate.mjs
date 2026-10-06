// dark-druid-state-adapter-2_5d.v2.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-2_5D-CONSUMER-CORRECTION-20261006-BOSS / ROLE BOSS / UUID 72ba2963-…
// OFFICIAL-COMPLETION-ID CH1-2_5D-CONSUMER-CORRECTION-20261006-BOSS-V2-CANDIDATE
//
// v1(dark-druid-state-adapter-2_5d.candidate.mjs) 정정판. v1은 보존(덮어쓰기 0).
// 원총괄 source 의미검수(ROOT-SOURCE-CORRECTION-20261006-1304) 반영:
//   · dive/emerge/transform/beast 원화는 **실재하며 2D 렌더에서 소비됨** → "missingDedicatedArt"
//     허위 라벨 제거. 정확한 경계 = 2.5D rig catalog/mode **미등록**(artStatus로 분리).
//   · 도달불가 가짜 e.s 'bossDruidTransform' 제거 — 변신/부활은 **실제 flag 입력**으로만 수용.
//   · moving override가 bossDruidRest를 walk로 바꾸던 분기 제거(부활 텔레포트 delta 오탐 방지).
//   · 미지·잘못된 입력 = UNKNOWN / fail-closed(idle·visible·플래그; walk/attack 추정 금지).
//
// 전투 HP/피해/si/Q/LOCK/보호2_3 변경 0. 표시 상태/아트 status 로직만. 순수(THREE/DOM 불요).
//
// 실제 source 근거(game.html):
//   10511-10515 _loadDruidSheets: assets/sprites/boss/boss_dark_druid_<k>.png,
//     files={base8:8dir_v3, walk, attack, idle, aoe, orb, beast, transform, dive, emerge}
//   10534/10558 dive(4x2 dirless): bossDruidDive 0→7 / bossDruidUnder frame7(스프라이트 숨김 10535) / bossDruidErupt 7→0
//   10531/10564 emerge(4x2 dirless): bossTelePrep 침강0→7 / bossTeleWarn 부상7→0
//   10532/10570 transform(8x1 dirless): *Charge/Jump/Dash +Wind = 서있는→야수 0→7
//   10533/10571 beast(4x2, frame=dir): bossJump/*Charge*/*Dash*/multiDash = 야수 8방향
//   10572 attack(4x8): bossDruidVolley(Wind)/slash/slam/windup   10573 walk   10574 base8/idle
//   revive flags: _druidLastStand(16257), e.reviveIframes(16259/41192/33276), _bossPhase; revive 시 e.s='bossDruidRest'(16259)/'recover'(41188/33275)
//   rig update mode 계약: character-rigs.mjs:132 ['idle','walk','run','attack']만(그 외 throw), direction 0..7
//   2.5D catalog 등록 자산: character-rig-catalog.mjs:36 dark-druid assets=[idle,walk,attack], frames{idle:1,walk:4,run:4,attack:4}; run=walk 재사용(:44)
//   방향 배열: character-rig-catalog.mjs:1 [south,SE,east,NE,north,NW,west,SW]=0..7
// ─────────────────────────────────────────────────────────────────────────────

export const RIG_ID = 'dark-druid';
// rig.update가 허용하는 mode(= 2.5D catalog에 등록된 소비 가능 mode). character-rigs.mjs:132.
export const RIG_MODES = Object.freeze(['idle', 'walk', 'run', 'attack']);
// 2.5D catalog에 **등록된** dark-druid 시트(= 실제 rig가 지금 표출 가능). character-rig-catalog.mjs:36.
export const CATALOG_REGISTERED = Object.freeze(['idle', 'walk', 'attack']); // run은 walk 원화 재사용

// 원화는 실재·2D 소비되나 2.5D catalog **미등록**인 시트. (artStatus='exists-2d-unregistered')
export const TWO_D_ONLY_SHEETS = Object.freeze({
  dive:      { path: 'assets/sprites/boss/boss_dark_druid_dive.png',      grid: '4x2', dirless: true,  consumedAt: 'game.html:10558' },
  emerge:    { path: 'assets/sprites/boss/boss_dark_druid_emerge.png',    grid: '4x2', dirless: true,  consumedAt: 'game.html:10564' },
  transform: { path: 'assets/sprites/boss/boss_dark_druid_transform.png', grid: '8x1', dirless: true,  consumedAt: 'game.html:10570' },
  beast:     { path: 'assets/sprites/boss/boss_dark_druid_beast.png',     grid: '4x2', dirless: false, consumedAt: 'game.html:10571' },
});

const REG = 'catalog-registered';       // 2.5D rig가 지금 소비 가능
const U2D = 'exists-2d-unregistered';   // 원화 실재·2D 소비, 2.5D 미등록(run/attack/idle 임시)

// 실제 game e.s → {rigMode(∈RIG_MODES), artStatus, sheet, visible, note}. 가짜 state 없음.
// rigMode는 항상 등록 mode(=rig throw 방지). sheet는 "이 상태가 원래 쓰는 2D 원화" 사실 기록.
export const DRUID_STATE_MAP = Object.freeze({
  idle:            { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true,  note: '대기 — base8/idle 등록 원화' },
  bossDruidRest:   { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true,  note: '회복/부활 휴식(st2) — idle 고정(이동 플래그로 walk 전환 금지)' },
  recover:         { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true,  note: '부활 recover(41188/33275) — idle' },
  bossRec:         { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true,  note: '보스 공통 회복 — idle' },
  __moving:        { rigMode: 'walk',   artStatus: REG, sheet: 'walk',   visible: true,  note: '이동(AI 추격) — walk 등록 원화' },
  bossDruidVolley:     { rigMode: 'attack', artStatus: REG, sheet: 'attack', visible: true, note: 'Q 독탄 방사 — attack 등록 원화(10572)' },
  bossDruidVolleyWind: { rigMode: 'attack', artStatus: REG, sheet: 'attack', visible: true, note: '방사 전조 — attack 전반 phase(10572)' },
  // 아래는 원화 실재·2D 소비되나 2.5D 미등록 → rigMode는 임시(run/attack/idle), sheet로 실제 원화 기록
  bossDruidDive:   { rigMode: 'run',    artStatus: U2D, sheet: 'dive',   visible: true,  note: '잠복 돌입 — dive 원화 0→7(10559). 2.5D 미등록→run(walk) 임시' },
  bossDruidUnder:  { rigMode: 'idle',   artStatus: U2D, sheet: 'dive',   visible: false, note: '완전 잠복 — 게임 2D도 스프라이트 숨김(10535). billboard 숨김' },
  bossDruidErupt:  { rigMode: 'attack', artStatus: U2D, sheet: 'dive',   visible: true,  note: '분출 — dive 원화 7→0(10561). 미등록→attack 임시' },
  bossTelePrep:    { rigMode: 'run',    artStatus: U2D, sheet: 'emerge', visible: true,  note: '텔레포트 침강 — emerge 원화 0→7(10567). 미등록→run 임시' },
  bossTeleWarn:    { rigMode: 'attack', artStatus: U2D, sheet: 'emerge', visible: true,  note: '텔레포트 부상 — emerge 원화 7→0(10567). 미등록→attack 임시' },
});

// revive/transform는 **상태 위조 금지** — 실제 flag로만. reviving=true면 변신 홀드.
const TRANSFORM_ENTRY = Object.freeze({ rigMode: 'idle', artStatus: U2D, sheet: 'transform', visible: true,
  vfxRef: 'boss_revive_boom/druid_shockring',
  note: '변신/라스트스탠드 — transform 원화 실재·2D 소비(10570). 2.5D 미등록→idle 홀드 + 기존 VFX. 새 변신모델 아님.' });
// *Charge/Jump/Dash(+Wind) = 야수/변신. 실제 e.s가 올 때 beast/transform 원화를 가리키되 2.5D 미등록.
const CHARGE_WIND_ENTRY = Object.freeze({ rigMode: 'attack', artStatus: U2D, sheet: 'transform', visible: true,
  note: '돌진 와인드업=변신 시퀀스(10570, _isChgWind). 미등록→attack 임시' });
const CHARGE_BEAST_ENTRY = Object.freeze({ rigMode: 'attack', artStatus: U2D, sheet: 'beast', visible: true,
  note: '돌진=야수 8방향(10571, _isCharge). 미등록→attack 임시' });
// fail-closed: 미지/미등록 state. 추정 없이 idle·visible·UNKNOWN 플래그.
const UNKNOWN_ENTRY = Object.freeze({ rigMode: 'idle', artStatus: 'UNKNOWN', sheet: null, visible: true,
  note: 'UNKNOWN druid state — fail-closed idle. root가 실제 e.s를 매핑해야 함(walk/attack 추정 안 함)' });

const isChargeWind = s => typeof s === 'string' && s.indexOf('Wind') >= 0 && (s.indexOf('Charge') >= 0 || s.indexOf('Jump') >= 0 || s.indexOf('Dash') >= 0); // game.html:10532
const isCharge = s => typeof s === 'string' && (s === 'bossJump' || s.indexOf('Charge') >= 0 || s.indexOf('charge') >= 0 || s.indexOf('Dash') >= 0 || s.indexOf('multiDash') >= 0); // game.html:10533

// moving override: idle/null만(회복 rest는 제외 — 부활 텔레포트 delta 오탐 방지). v1 결함 정정.
export function resolveState(eState, { moving = false } = {}) {
  if (moving === true && (eState === 'idle' || eState == null)) return '__moving';
  if (Object.prototype.hasOwnProperty.call(DRUID_STATE_MAP, eState)) return eState;
  if (isChargeWind(eState)) return '__chargeWind';
  if (isCharge(eState)) return '__chargeBeast';
  return null; // fail-closed → UNKNOWN
}

function entryFor(key) {
  if (key === '__chargeWind') return CHARGE_WIND_ENTRY;
  if (key === '__chargeBeast') return CHARGE_BEAST_ENTRY;
  if (key && DRUID_STATE_MAP[key]) return DRUID_STATE_MAP[key];
  return UNKNOWN_ENTRY;
}

// facing(라디안, game.html e.facing=atan2(P.y-e.y,P.x-e.x)) → direction 0..7. 유한값 아니면 fail-closed south(0).
export function facingToDirection(angle) {
  if (!Number.isFinite(angle)) return 0;
  const i = Math.round((Math.PI / 2 - angle) / (Math.PI / 4));
  return ((i % 8) + 8) % 8;
}

// 메인 consumer. revive/transform은 flag로만(상태 위조 0). 반환 mode는 항상 RIG_MODES.
// fail-closed: 알 수 없는 state & revive 아님 → UNKNOWN(idle·visible). 잘못된 flag/facing는 무시(안전값).
export function druidRigArgs({ state, facing, moving, reviving, lastStand, phase, speed } = {}) {
  const facingValid = Number.isFinite(facing);
  const direction = facingToDirection(facingValid ? facing : NaN);
  const movingBool = moving === true;                 // 비불린 = false(fail-closed)
  const transforming = reviving === true || lastStand === true; // 실제 flag만
  let key, entry, status;
  if (transforming) { key = '__transform'; entry = TRANSFORM_ENTRY; status = 'transform'; }
  else {
    key = resolveState(state, { moving: movingBool });
    entry = entryFor(key);
    status = (entry === UNKNOWN_ENTRY) ? 'UNKNOWN' : 'ok';
  }
  if (!RIG_MODES.includes(entry.rigMode)) throw new Error(`rig mode 계약 위반: ${entry.rigMode}`); // 불변식
  const args = { mode: entry.rigMode, direction };
  if (Number.isFinite(phase)) args.phase = Math.max(0, Math.min(1, phase));
  if (Number.isFinite(speed)) args.speed = speed;
  return Object.freeze({
    rigUpdateArgs: args,
    visible: entry.visible !== false,
    resolvedState: transforming ? '__transform' : key,
    status,                                   // 'ok' | 'UNKNOWN' | 'transform'
    artStatus: entry.artStatus,               // 'catalog-registered' | 'exists-2d-unregistered' | 'UNKNOWN'
    sheet: entry.sheet,                        // 원래 2D 원화(사실 기록) 또는 null
    sheetInfo: entry.sheet && TWO_D_ONLY_SHEETS[entry.sheet] ? TWO_D_ONLY_SHEETS[entry.sheet] : null,
    vfxRef: entry.vfxRef || null,
    facingValid,                               // false면 facing fail-closed(south) 사용됨
    note: entry.note,
  });
}

// ── 순수 stdin 검증: rest+moving, under→erupt, 실제 revive flags, 미등록 mode 분리, UNKNOWN fail-closed ──
export async function verify() {
  const { characterRigFrame, CHARACTER_RIG_CATALOG } = await import('../../../2_5d/character-rig-catalog.mjs');
  const R = [];
  const ok = (name, cond, detail) => R.push({ name, ok: !!cond, detail: detail || '' });

  // 1) v1 결함 정정: rest+moving이 walk로 바뀌지 않음(idle 유지)
  const restMov = druidRigArgs({ state: 'bossDruidRest', moving: true, facing: 0 });
  ok('rest+moving→idle(not walk)', restMov.rigUpdateArgs.mode === 'idle' && restMov.resolvedState === 'bossDruidRest', `mode=${restMov.rigUpdateArgs.mode}`);

  // 2) 잠복 수명: Under visible=false → Erupt visible=true
  const under = druidRigArgs({ state: 'bossDruidUnder', facing: 0 });
  const erupt = druidRigArgs({ state: 'bossDruidErupt', facing: 0 });
  ok('under visible=false', under.visible === false && under.rigUpdateArgs.mode === 'idle');
  ok('erupt visible=true', erupt.visible === true && erupt.rigUpdateArgs.mode === 'attack');

  // 3) art status 분리: 등록(idle/walk/attack) vs 2D-미등록(dive/emerge/transform/beast)
  ok('idle=catalog-registered', druidRigArgs({ state: 'idle' }).artStatus === 'catalog-registered');
  const dive = druidRigArgs({ state: 'bossDruidDive' });
  ok('dive=exists-2d-unregistered', dive.artStatus === 'exists-2d-unregistered' && dive.sheet === 'dive' && !!dive.sheetInfo, dive.sheetInfo ? dive.sheetInfo.path : 'no sheetInfo');
  ok('no fake missingDedicatedArt', !('missingDedicatedArt' in dive));

  // 4) 실제 revive flags만 수용(가짜 e.s 위조 없음)
  const rev = druidRigArgs({ state: 'recover', reviving: true });
  ok('reviving flag→transform hold(idle)', rev.status === 'transform' && rev.rigUpdateArgs.mode === 'idle' && rev.sheet === 'transform');
  const fakeState = druidRigArgs({ state: 'bossDruidTransform' }); // 게임이 절대 안 만드는 state
  ok('fake e.s bossDruidTransform→UNKNOWN fail-closed', fakeState.status === 'UNKNOWN' && fakeState.rigUpdateArgs.mode === 'idle');

  // 5) fail-closed 입력: 잘못된 flag/ facing
  const badFlag = druidRigArgs({ state: 'idle', moving: 'yes', reviving: 1 }); // 비불린
  ok('non-bool flags ignored(fail-closed)', badFlag.rigUpdateArgs.mode === 'idle' && badFlag.status === 'ok');
  const badFacing = druidRigArgs({ state: 'idle', facing: NaN });
  ok('NaN facing→south(0) fail-closed', badFacing.rigUpdateArgs.direction === 0 && badFacing.facingValid === false);

  // 6) 모든 매핑 rigMode ∈ RIG_MODES, 그리고 그 rigMode는 catalog characterRigFrame에서 유효(미등록 시트는 호출 안 함)
  const keys = [...Object.keys(DRUID_STATE_MAP), '__chargeWind', '__chargeBeast', '__transform', 'UNKNOWN(xyz)'];
  let modeOk = true, frameOk = true, err = '';
  for (const k of keys) {
    const e = k === '__transform' ? TRANSFORM_ENTRY : k === 'UNKNOWN(xyz)' ? UNKNOWN_ENTRY : entryFor(k);
    if (!RIG_MODES.includes(e.rigMode)) { modeOk = false; err = `${k}:${e.rigMode}`; }
    try { characterRigFrame(RIG_ID, e.rigMode, 0, 0); } catch (ex) { frameOk = false; err = `${k} ${e.rigMode}: ${ex.message}`; }
  }
  ok('all rigMode ∈ RIG_MODES', modeOk, err);
  ok('rigMode valid in characterRigFrame', frameOk, err);
  ok('catalog frames unchanged', JSON.stringify(CHARACTER_RIG_CATALOG[RIG_ID].frames) === JSON.stringify({ idle: 1, walk: 4, run: 4, attack: 4 }));

  return { ok: R.every(r => r.ok), results: R };
}

export default { RIG_ID, RIG_MODES, CATALOG_REGISTERED, TWO_D_ONLY_SHEETS, DRUID_STATE_MAP, resolveState, facingToDirection, druidRigArgs, verify };

const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = await verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.name}${c.detail ? ' :: ' + c.detail : ''}`);
  console.log(`verify: ${r.ok ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = r.ok ? 0 : 1; } catch { /* ignore */ }
}
