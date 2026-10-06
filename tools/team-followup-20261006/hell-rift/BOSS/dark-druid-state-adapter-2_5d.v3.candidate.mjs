// dark-druid-state-adapter-2_5d.v3.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-2_5D-STRICT-CONSUMER-FIX-20261006-BOSS / ROLE BOSS / UUID 72ba2963-…
// OFFICIAL-COMPLETION-ID CH1-2_5D-STRICT-CONSUMER-FIX-20261006-BOSS-V3-CANDIDATE
//
// v1/v2 보존(수정 0). v3는 원총괄 read-only 의미검수가 v2에서 확인한 2개 실결함 정정.
//
// 결함1 (v2 @110-112): transforming = reviving||lastStand → lastStand=true면 **영구 transform
//   hold**. 실제 game.html:16257 `_druidLastStand`는 최후저항 **전투 내내 true**지만, 16354
//   `_druidFinaleAI`는 `reviveIframes>0||_spawnT>0||stunned>0`인 **유한 창**에서만 정지하고,
//   16368-16372 rest→idle, 16375-16384 volley가 재개된다. → lastStand는 **context만**.
//   transform hold는 **유한 reviving 창(reviveIframes>0||_spawnT>0)에서만**; 창 종료 후 실제
//   state 해석(rest→idle→volley) 및 Under false→Erupt true 복귀.
//
// 결함2 (v2 @78-85/109-116): null/missing state→walk, substring(indexOf 'Charge'/'Dash')로
//   임의 badDashState→attack/ok 추정. → **실제 emitted state allowlist(정확 일치)**로만 분류;
//   미지/누락/임의 문자열은 UNKNOWN / fail-closed(idle·visible·플래그, walk/attack 추정 0).
//
// 전투 HP/피해/si/Q/LOCK/보호2_3/원본 state·flags 쓰기 0. 표시 상태/아트-status 로직만. 순수.
//
// source 근거(game.html): 16257 _druidLastStand set; 16354 AI 정지창(reviveIframes/_spawnT/
//   stunned); 16368-72 recover/bossRec→bossDruidRest→idle; 16375-84 volley 재개;
//   10535 Under 스프라이트 숨김; 10558 dive / 10564 emerge / 10570 transform / 10571 beast 소비;
//   10572 attack / 10573 walk / 10574 base8; e.reviveIframes 16259/41192/37275(감소);
//   e._spawnT 41220/33292(55f 창). rig mode 계약 character-rigs.mjs:132; catalog :36.
// ─────────────────────────────────────────────────────────────────────────────

export const RIG_ID = 'dark-druid';
export const RIG_MODES = Object.freeze(['idle', 'walk', 'run', 'attack']); // character-rigs.mjs:132
export const CATALOG_REGISTERED = Object.freeze(['idle', 'walk', 'attack']); // catalog:36 (run=walk 재사용)

export const TWO_D_ONLY_SHEETS = Object.freeze({
  dive:      { path: 'assets/sprites/boss/boss_dark_druid_dive.png',      grid: '4x2', dirless: true,  consumedAt: 'game.html:10558' },
  emerge:    { path: 'assets/sprites/boss/boss_dark_druid_emerge.png',    grid: '4x2', dirless: true,  consumedAt: 'game.html:10564' },
  transform: { path: 'assets/sprites/boss/boss_dark_druid_transform.png', grid: '8x1', dirless: true,  consumedAt: 'game.html:10570' },
  beast:     { path: 'assets/sprites/boss/boss_dark_druid_beast.png',     grid: '4x2', dirless: false, consumedAt: 'game.html:10571' },
});

const REG = 'catalog-registered';
const U2D = 'exists-2d-unregistered';

// ── 실제 emitted druid state allowlist(정확 문자열만; substring 금지) → 분류 ──
// rigMode는 항상 RIG_MODES(=rig throw 방지). sheet=원래 2D 원화 사실 기록. visible=false는 Under만.
export const STATE_CLASS = Object.freeze({
  idle:                { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true },  // 10574
  recover:             { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true },  // 16368 recover→rest
  bossRec:             { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true },  // 16368
  bossDruidRest:       { rigMode: 'idle',   artStatus: REG, sheet: 'idle',   visible: true },  // 16371 st2<=0→idle
  bossDruidVolley:     { rigMode: 'attack', artStatus: REG, sheet: 'attack', visible: true },  // 10572/16380
  bossDruidVolleyWind: { rigMode: 'attack', artStatus: REG, sheet: 'attack', visible: true },  // 10572/16360
  bossDruidDive:       { rigMode: 'run',    artStatus: U2D, sheet: 'dive',   visible: true },  // 10559
  bossDruidUnder:      { rigMode: 'idle',   artStatus: U2D, sheet: 'dive',   visible: false }, // 10535/10560
  bossDruidErupt:      { rigMode: 'attack', artStatus: U2D, sheet: 'dive',   visible: true },  // 10561
  bossTelePrep:        { rigMode: 'run',    artStatus: U2D, sheet: 'emerge', visible: true },  // 10531/10567
  bossTeleWarn:        { rigMode: 'attack', artStatus: U2D, sheet: 'emerge', visible: true },  // 10567
  bossChargeWind:      { rigMode: 'attack', artStatus: U2D, sheet: 'transform', visible: true }, // 10570/16399
  bossCharge:          { rigMode: 'attack', artStatus: U2D, sheet: 'beast',  visible: true },  // 10571
});

const UNKNOWN_ENTRY = Object.freeze({ rigMode: 'idle', artStatus: 'UNKNOWN', sheet: null, visible: true,
  note: 'UNKNOWN/미등록 druid state — fail-closed idle(추정 안 함). root가 실제 emitted state를 allowlist에 매핑해야 함' });
const TRANSFORM_ENTRY = Object.freeze({ rigMode: 'idle', artStatus: U2D, sheet: 'transform', visible: true,
  vfxRef: 'boss_revive_boom/druid_shockring',
  note: '유한 reviving 창(reviveIframes>0||_spawnT>0) 변신 홀드 — transform 원화 실재·2D 소비(10570), 2.5D 미등록→idle 홀드. 창 종료 후 실제 state 복귀' });

// moving override: 정확히 state==='idle' + moving일 때만 walk. null/기타 state는 override 안 함(결함2 정정).
export function resolveState(eState, { moving = false } = {}) {
  if (moving === true && eState === 'idle') return '__moving';
  if (typeof eState === 'string' && Object.prototype.hasOwnProperty.call(STATE_CLASS, eState)) return eState;
  return null; // null/'' /미지/임의문자열 → fail-closed UNKNOWN (substring 추정 0)
}

export function facingToDirection(angle) {
  if (!Number.isFinite(angle)) return 0; // fail-closed south
  const i = Math.round((Math.PI / 2 - angle) / (Math.PI / 4));
  return ((i % 8) + 8) % 8;
}

const WALK_ENTRY = Object.freeze({ rigMode: 'walk', artStatus: REG, sheet: 'walk', visible: true, note: '이동(idle+moving) — walk 등록 원화(10573)' });

// 메인 consumer.
//   reviving : 유한 변신/부활 창에서만 true(root가 e.reviveIframes>0||e._spawnT>0로 공급) → transform 홀드.
//   lastStand: **context만**(최후저항 전투 내내 true) — 홀드 유발 안 함. 창 종료 후 실제 state 해석.
//   fail-closed: 미지/누락 state & reviving 아님 → UNKNOWN(idle·visible). 비불린 flag·NaN facing 무시.
export function druidRigArgs({ state, facing, moving, reviving, lastStand, phase, speed } = {}) {
  const facingValid = Number.isFinite(facing);
  const direction = facingToDirection(facingValid ? facing : NaN);
  const movingBool = moving === true;
  const inReviveWindow = reviving === true;      // 유한 창만(lastStand는 제외 — 결함1 정정)
  const lastStandCtx = lastStand === true;       // context 노출용

  let key, entry, status;
  if (inReviveWindow) { key = '__transform'; entry = TRANSFORM_ENTRY; status = 'transform'; }
  else {
    key = resolveState(state, { moving: movingBool });
    if (key === '__moving') { entry = WALK_ENTRY; status = 'ok'; }
    else if (key && STATE_CLASS[key]) { entry = STATE_CLASS[key]; status = 'ok'; }
    else { key = null; entry = UNKNOWN_ENTRY; status = 'UNKNOWN'; }
  }
  if (!RIG_MODES.includes(entry.rigMode)) throw new Error(`rig mode 계약 위반: ${entry.rigMode}`);
  const args = { mode: entry.rigMode, direction };
  if (Number.isFinite(phase)) args.phase = Math.max(0, Math.min(1, phase));
  if (Number.isFinite(speed)) args.speed = speed;
  return Object.freeze({
    rigUpdateArgs: args,
    visible: entry.visible !== false,
    resolvedState: inReviveWindow ? '__transform' : key,
    status,                                    // 'ok' | 'UNKNOWN' | 'transform'
    artStatus: entry.artStatus,
    sheet: entry.sheet,
    sheetInfo: entry.sheet && TWO_D_ONLY_SHEETS[entry.sheet] ? TWO_D_ONLY_SHEETS[entry.sheet] : null,
    lastStand: lastStandCtx,                   // context만(홀드 미유발)
    vfxRef: entry.vfxRef || null,
    facingValid,
    note: entry.note || null,
  });
}

// ── 순수 stdin 검증: 새 결함만(이전 검사 반복 0) ──
export async function verify() {
  const { characterRigFrame, CHARACTER_RIG_CATALOG } = await import('../../../2_5d/character-rig-catalog.mjs');
  const R = []; const ok = (n, c, d) => R.push({ name: n, ok: !!c, detail: d || '' });

  // 결함1: lastStand=true(창 아님)는 transform 홀드 안 하고 실제 state 재개
  const lsRest = druidRigArgs({ state: 'bossDruidRest', lastStand: true });
  ok('lastStand+rest→idle(not transform-hold)', lsRest.status === 'ok' && lsRest.rigUpdateArgs.mode === 'idle' && lsRest.lastStand === true);
  const lsVolley = druidRigArgs({ state: 'bossDruidVolley', lastStand: true });
  ok('lastStand+volley→attack(resumes)', lsVolley.status === 'ok' && lsVolley.rigUpdateArgs.mode === 'attack');
  // 유한 reviving 창: 홀드 → 창 종료 후 rest→volley
  const revWin = druidRigArgs({ state: 'recover', reviving: true, lastStand: true });
  ok('reviving window→transform hold(idle)', revWin.status === 'transform' && revWin.rigUpdateArgs.mode === 'idle' && revWin.sheet === 'transform');
  const afterRest = druidRigArgs({ state: 'bossDruidRest', reviving: false, lastStand: true });
  const afterVolley = druidRigArgs({ state: 'bossDruidVolley', reviving: false, lastStand: true });
  ok('after window: rest→idle then volley→attack', afterRest.rigUpdateArgs.mode === 'idle' && afterVolley.rigUpdateArgs.mode === 'attack' && afterRest.status === 'ok');
  // Under false→Erupt true 복귀(최후저항 중에도)
  const uLs = druidRigArgs({ state: 'bossDruidUnder', lastStand: true });
  const eLs = druidRigArgs({ state: 'bossDruidErupt', lastStand: true });
  ok('under false→erupt true (during lastStand)', uLs.visible === false && eLs.visible === true && eLs.rigUpdateArgs.mode === 'attack');

  // 결함2: null/missing→walk 금지; substring 추정 금지
  const nullMov = druidRigArgs({ state: null, moving: true });
  ok('null+moving→UNKNOWN(not walk)', nullMov.status === 'UNKNOWN' && nullMov.rigUpdateArgs.mode === 'idle');
  const badDash = druidRigArgs({ state: 'badDashState' });
  ok('badDashState→UNKNOWN(not attack via substring)', badDash.status === 'UNKNOWN');
  const fakeMulti = druidRigArgs({ state: 'bossMultiDash' }); // 'Dash' 포함하지만 allowlist 밖
  ok('bossMultiDash(not in allowlist)→UNKNOWN', fakeMulti.status === 'UNKNOWN');
  const empty = druidRigArgs({ state: '' });
  ok('empty state→UNKNOWN', empty.status === 'UNKNOWN');
  // 허용된 idle+moving만 walk
  const idleMov = druidRigArgs({ state: 'idle', moving: true });
  ok('idle+moving→walk(allowed)', idleMov.rigUpdateArgs.mode === 'walk' && idleMov.status === 'ok');

  // art-status 분리 유지(원화 실재 vs catalog 미등록)
  ok('idle=catalog-registered', druidRigArgs({ state: 'idle' }).artStatus === REG);
  const dive = druidRigArgs({ state: 'bossDruidDive' });
  ok('dive=exists-2d-unregistered+sheet', dive.artStatus === U2D && dive.sheet === 'dive' && !!dive.sheetInfo);
  ok('no fake missingDedicatedArt key', !('missingDedicatedArt' in dive));

  // fail-closed 입력 + rigMode 불변식
  const badFacing = druidRigArgs({ state: 'idle', facing: NaN });
  ok('NaN facing→south(0)', badFacing.rigUpdateArgs.direction === 0 && badFacing.facingValid === false);
  let modeOk = true, frameOk = true, err = '';
  for (const k of [...Object.keys(STATE_CLASS), '__transform', '__moving', 'UNKNOWN']) {
    const e = k === '__transform' ? TRANSFORM_ENTRY : k === '__moving' ? WALK_ENTRY : (STATE_CLASS[k] || UNKNOWN_ENTRY);
    if (!RIG_MODES.includes(e.rigMode)) { modeOk = false; err = `${k}:${e.rigMode}`; }
    try { characterRigFrame(RIG_ID, e.rigMode, 0, 0); } catch (ex) { frameOk = false; err = `${k} ${e.rigMode}: ${ex.message}`; }
  }
  ok('all rigMode ∈ RIG_MODES', modeOk, err);
  ok('rigMode valid in characterRigFrame', frameOk, err);
  ok('catalog frames unchanged', JSON.stringify(CHARACTER_RIG_CATALOG[RIG_ID].frames) === JSON.stringify({ idle: 1, walk: 4, run: 4, attack: 4 }));

  return { ok: R.every(r => r.ok), results: R };
}

export default { RIG_ID, RIG_MODES, CATALOG_REGISTERED, TWO_D_ONLY_SHEETS, STATE_CLASS, resolveState, facingToDirection, druidRigArgs, verify };

const _isMain = (() => { try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; } })();
if (_isMain) {
  const r = await verify();
  for (const c of r.results) console.log(`  ${c.ok ? 'OK' : 'FAIL'} ${c.name}${c.detail ? ' :: ' + c.detail : ''}`);
  console.log(`verify: ${r.ok ? 'PASS' : 'FAIL'}`);
  try { process.exitCode = r.ok ? 0 : 1; } catch { /* ignore */ }
}
