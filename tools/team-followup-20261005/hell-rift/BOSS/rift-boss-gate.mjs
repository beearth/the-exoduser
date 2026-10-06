// rift-boss-gate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// CH1-A BOSS 후보 (ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006 / BOSS = UUID
// 72ba2963-6065-4d67-889a-4e3a76c97140). 역할 책임: "4구역 gate·보스/죽음/부활/
// 재도전 연결" (docs/4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md §3·§11).
//
// 목적: 기존 4구역 gate와 보스 접근/방/죽음/부활/재시험 경계를 **실제 source에 대조**
// 하는 읽기 전용 참조·검증 하네스. 게임/세이브/정본 docs/Git을 변경하지 않는다.
// 생산 채택이 아니라 후보(candidate)다 — 기존 gate 조건을 보존·대조만 한다.
//
// 선행 정본:
//   - REGION_CLEAR_GATE_20260930.md (4구역 gate SSOT)
//   - CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md (사망 후 필드 진행 보존)
//   - CH1_1_A_GRADE_PRODUCTION_20261005.md §1 경계·§3·§5·§11
//   - MAP_SCENE_EDITOR_20261005.md / HELL_RIFT_EDITOR_RESULT_20261006.md (씬 맥락)
//
// 보존 규칙(이 파일이 지키는 것): 기존 gate 조건 임의 완화·무료 개방 0, save 스키마
// 변경 0, 생산 geometry/코드 무변, 보호 docs 2_3·Q전용·어택티켓 금지 불간섭.
// ─────────────────────────────────────────────────────────────────────────────

// ── 대조 대상 source (working tree 스냅샷) ──
// game.html 라인은 타세션 편집으로 유동(REGION_CLEAR_GATE §9). SHA로 스냅샷 고정.
export const SOURCE = Object.freeze({
  file: 'game.html',
  sha256: '4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd',
  capturedAt: '2026-10-06',
  note: '라인 번호는 이 SHA 기준. 대조 전 shasum -a 256 game.html 으로 재확인할 것.',
});

// ── SSOT 상수 (REGION_CLEAR_GATE_20260930.md §3, game.html _regionInit 블록) ──
export const CONST = Object.freeze({
  REG_CLEAR_RATIO: 0.8,     // _REG_CLEAR_RATIO — 지역 처치율 임계
  GATE_GUARD_BONUS: 0.10,   // 문지기 처치 = 게이트 지역 1곳 +10% (구 전역 10% 매핑)
  EPS: 1e-9,                // 부동소수(0.7+0.1<0.8) 임계 비교 보정
  OPEN_FIELD_MIN: 180,      // mw>=180 && mh>=180 일 때만 지역 분할(아니면 구 규칙 폴백)
  REGIONS_REQUIRED: 4,      // 4지역 전부 클리어 = 개방
  FB_TO_REG: Object.freeze([2, 3, 0, 1]), // _FB_SITES(SW,SE,NW,NE) → 지역 idx(0NW,1NE,2SW,3SE)
});

// ── 6단계 경계 ↔ 실제 source 앵커 (후보 인수 시 라인 대조표) ──
// 각 항목은 "같은 후보에서 6단계 재현 가능한 연결 증거"(§3 BOSS 산출 기준)를 위한
// source 참조다. line 은 위 SHA 스냅샷 기준.
export const ANCHORS = Object.freeze([
  Object.freeze({
    step: 1, id: 'REGION_CLEAR', nameKo: '지역 클리어(정화)',
    file: 'game.html', lines: [59081, 59162],
    symbols: ['_regionInit', '_regionRatio', '_regionFbAlive', '_regionCheckClears', '_regionClearedCount'],
    contract: '지역별 처치율>=0.8-1e-9 AND 담당 앵글러 미생존 → cleared 래치(해제 없음). '
            + '빈 지역(total<=0 + 앵글러 없음)=조용히 클리어. 문지기 지역 1곳 +10%.',
    doc: 'REGION_CLEAR_GATE_20260930.md §2·§3',
  }),
  Object.freeze({
    step: 2, id: 'GATE_OPEN', nameKo: '지옥문 개방(보스 해금)',
    file: 'game.html', lines: [40537, 40561],
    symbols: ['checkRooms', 'G._bossUnlocked', '_regionClearedCount', 'G._gateGuardKilled'],
    contract: '!bossArena && bossAlive && !bossUnlocked 에서: regions → krakenOk && 클리어>=4; '
            + '폴백(소형맵) totalSpawned<=0 → krakenOk 즉시; 아니면 krakenOk && kills/tot + 문지기0.10 >= 0.8. '
            + 'krakenOk = stage!==0 || _fbDone (지역 조건에 앵글러가 이미 포함 → 이중 안전망).',
    doc: 'REGION_CLEAR_GATE_20260930.md §3, CH1_1_A_GRADE_PRODUCTION §1 진행',
  }),
  Object.freeze({
    step: 3, id: 'BOSS_ACCESS', nameKo: '보스 접근/방 입장',
    file: 'game.html', lines: [40562, 40587],
    symbols: ['checkRooms', 'G.exits', 'G._bossLoadPhase', '_enterBossArena'],
    contract: '출구 타일 밟음 + !stageCleared && exits>0 && bossLoadPhase<=0 && bossAlive && !bossArena 에서: '
            + 'stage0 && !fbDone → 차단(앵글러 메시지); !bossUnlocked → 차단(봉인 메시지); '
            + '그 외 → bossLoadPhase=1 (fade→네임카드→fade→입장연출 상태머신, phase 1→2→3→4→0).',
    doc: 'REGION_CLEAR_GATE_20260930.md §3, checkRooms 로딩 상태머신',
  }),
  Object.freeze({
    step: 4, id: 'BOSS_DEATH', nameKo: '보스 사망',
    file: 'game.html', lines: [40490, 40522],
    symbols: ['checkRooms', 'findBoss', 'G.bossAlive', 'e._reviveTimer', "rooms.find(type==='boss')"],
    contract: 'bossAlive && bossArena 에서: bossLive = !!findBoss(); 부활 대기(ens.ib 중 _reviveTimer>0)도 '
            + '살아있는 것으로 취급(문 열림 방지). !bossLive && bossRoom → bossAlive=false + 보물상자 + 아레나 출구.',
    doc: 'REGION_CLEAR_GATE_20260930.md 보스 처치 연출',
  }),
  Object.freeze({
    step: 5, id: 'REVIVE', nameKo: '부활(보스/플레이어)',
    file: 'game.html', lines: [40493, 42342],
    symbols: ['e._reviveTimer', 'die', 'reviveOnce', 'P._fallenCanRevive', '신성력(antiRevive)'],
    contract: '보스: _reviveTimer>0 = 생존 취급(사망 문 열림 차단). '
            + '플레이어: die()=reviveOnce 어픽스 즉시부활 / 아니면 fallen 300f 카운트다운 + 자연부활력 확률. '
            + '신성력(antiRevive)은 언데드/구울 부활 억제. 이 경계는 save 미변경(런타임 상태).',
    doc: 'CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md',
  }),
  Object.freeze({
    step: 6, id: 'RETRY', nameKo: '재도전/재시험',
    file: 'game.html', lines: [61539, 61583],
    symbols: ['retryBtn.onclick', '_preArenaBackup', '_captureBossFieldState', '_restoreBossFieldState', '_retryDruidFinale'],
    contract: 'EXP 30% 손실 공통. 분기: 피날레 재도전 → 새 보스; (bossArena && _preArenaBackup) || '
            + '(stage0 && !bossArena && bossUnlocked) → 필드 상태 복원(지역·unlock·kills·gateGuard·fbDone 보존, '
            + '게이트 입구 리스폰); 그 외 → initStage(stage) 일반 재시작(리셋).',
    doc: 'CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md, REGION_CLEAR_GATE 2026-10-02 추가',
  }),
]);

// ── 대조 중 발견한 source 사실 (보존 대상 — 이 후보는 수정하지 않는다) ──
// root 인수 시 확인용. 기존 동작을 바꾸지 말고 사실만 전달한다.
export const NOTES = Object.freeze([
  Object.freeze({
    id: 'EPS_ASYMMETRY', severity: 'info',
    text: '지역 경로(_regionCheckClears, game.html 59153)는 `>=0.8-1e-9` 보정을 쓰지만, '
        + '소형맵 폴백 개방(checkRooms 40554)은 bare `>=0.8`. kills/tot+문지기가 정확히 0.7+0.1 '
        + '같은 조합이면 float 오차로 폴백만 개방 실패. 오픈필드(CH1-1)는 지역 경로라 영향 없음. '
        + '현 CH1-1 범위 밖 변경 금지 — root 판단용 기록.',
  }),
  Object.freeze({
    id: 'KRAKEN_REDUNDANT', severity: 'info',
    text: 'krakenOk(stage!==0||_fbDone)는 지역 경로에서 논리상 잉여(지역 클리어가 이미 앵글러 생존을 '
        + '포함)지만 이중 안전망으로 유지(REGION_CLEAR_GATE §3 line48). 제거하지 않는다.',
  }),
]);

// ─────────────────────────────────────────────────────────────────────────────
// 순수 predicate — game.html의 조건을 부수효과 없이 거울처럼 옮긴 것.
// 입력은 평면 컨텍스트 객체(게임 G/P를 참조하지 않음). 기존 조건 변경 0.
// ─────────────────────────────────────────────────────────────────────────────

// _krakenOk (checkRooms): stage!==0 || _fbDone. si0(1-1)에서만 앵글러 전멸 요구.
export function krakenOk({ stage, fbDone }) {
  return stage !== 0 || !!fbDone;
}

// _regionFbAlive(r): 담당 앵글러 생존 여부. 미스폰=생존 취급, _fbDone=전부 사망.
export function regionFbAlive(region, { stage, fbDone, fbSpawned, fieldBosses }) {
  if (!region || region.fbIdx < 0 || stage !== 0 || fbDone) return false;
  if (!fbSpawned) return true; // 미스폰 = 생존 취급
  const a = fieldBosses;
  if (!a) return false;
  const fb = a[region.fbIdx];
  return !!(fb && fb.hp > 0);
}

// _regionRatio(r,i): total>0 ? kills/total + 문지기보너스 : 1. 빈 지역은 1(충족).
export function regionRatio(region, idx, { gateGuardKilled, regGateIdx }) {
  if (!region) return 0;
  const b = (gateGuardKilled && idx === regGateIdx) ? CONST.GATE_GUARD_BONUS : 0;
  return region.total > 0 ? region.kills / region.total + b : 1;
}

// _regionCheckClears 판정: 래치 전 "이번 프레임 클리어 가능?" (cleared 플래그는 래치).
// ratio>=0.8-1e-9 AND !앵글러생존. 기존 cleared=true 는 그대로 유지(해제 없음).
export function regionClearable(region, idx, ctx) {
  if (!region) return false;
  if (region.cleared) return true; // 래치 보존
  if (regionRatio(region, idx, ctx) < CONST.REG_CLEAR_RATIO - CONST.EPS) return false;
  if (regionFbAlive(region, ctx)) return false;
  return true;
}

// _regionClearedCount(): cleared 래치된 지역 수.
export function regionClearedCount(regions) {
  if (!regions) return 0;
  let n = 0;
  for (let i = 0; i < 4; i++) if (regions[i] && regions[i].cleared) n++;
  return n;
}

// 지역 분할 적용 여부 (_regionInit 초반): 오픈필드(한 변>=180)만 지역, 아니면 null(구 규칙).
export function usesRegions({ mw, mh }) {
  return !!(mw && mh && mw >= CONST.OPEN_FIELD_MIN && mh >= CONST.OPEN_FIELD_MIN);
}

// ── STEP 2: 지옥문 개방 판정 (checkRooms 40537-40561) ──
// 반환: { unlock:boolean, path:'region'|'fallback-empty'|'fallback-kill' }
export function evalGateOpen(ctx) {
  // 선행: !bossArena && bossAlive && !bossUnlocked (호출측에서 보장). 여기선 개방 조건만.
  const kOk = krakenOk(ctx);
  if (ctx.regions) {
    return { unlock: kOk && regionClearedCount(ctx.regions) >= CONST.REGIONS_REQUIRED, path: 'region' };
  }
  const buTot = ctx.totalSpawned || 0;
  if (buTot <= 0) {
    return { unlock: kOk, path: 'fallback-empty' }; // 스폰 추적 없으면 즉시 개방
  }
  const gkBonus = ctx.gateGuardKilled ? CONST.GATE_GUARD_BONUS : 0;
  const ratio = (ctx.stageKills || 0) / buTot + gkBonus;
  return { unlock: kOk && ratio >= CONST.REG_CLEAR_RATIO, path: 'fallback-kill' };
}

// ── STEP 3: 보스 접근/방 입장 판정 (checkRooms 40562-40587, 출구 타일 밟음 시) ──
// 반환: { action:'enter'|'blocked', reason:'angler'|'sealed'|null }
export function evalBossAccess(ctx) {
  // 선행: 출구 타일 위 && !stageCleared && exits>0 && bossLoadPhase<=0 && bossAlive && !bossArena
  if (ctx.stage === 0 && !ctx.fbDone) return { action: 'blocked', reason: 'angler' };
  if (!ctx.bossUnlocked) return { action: 'blocked', reason: 'sealed' };
  return { action: 'enter', reason: null }; // → bossLoadPhase=1
}

// ── STEP 4·5: 보스 사망 판정 + 부활 홀드 (checkRooms 40490-40522) ──
// 부활 대기 중인 보스(ens.ib 중 _reviveTimer>0)는 살아있는 것으로 취급 → 문 안 열림.
export function bossReviveHoldsDoor(ens) {
  if (!ens) return false;
  for (let i = 0; i < ens.length; i++) {
    const e = ens[i];
    if (e && e.ib && (e._reviveTimer || 0) > 0) return true;
  }
  return false;
}
// 반환: boss 사망 확정 여부.
export function evalBossDeath(ctx) {
  // 선행: bossAlive && bossArena
  let bossLive = !!ctx.bossPresent;        // findBoss()
  if (!bossLive && bossReviveHoldsDoor(ctx.ens)) bossLive = true;
  const bossRoom = !!ctx.hasBossRoom;       // rooms.find(type==='boss')
  return !bossLive && bossRoom;             // → bossAlive=false + 보물상자 + 아레나 출구
}

// ── STEP 6: 재도전 경로 분류 (retryBtn.onclick 61539-61583) ──
// 반환: { path, preserveField }  path: 'druid-finale'|'arena-retry'|'field-retry'|'normal-restart'
export function classifyRetry(ctx) {
  if (ctx.retryDruidFinale) return { path: 'druid-finale', preserveField: false };
  if (ctx.bossArena && ctx.hasPreArenaBackup) return { path: 'arena-retry', preserveField: true };
  if (ctx.stage === 0 && !ctx.bossArena && ctx.bossUnlocked) return { path: 'field-retry', preserveField: true };
  return { path: 'normal-restart', preserveField: false }; // initStage(stage) 리셋
}

// ─────────────────────────────────────────────────────────────────────────────
// 자가 검증 — SSOT docs에서 유도한 fixture로 predicate가 source 계약과 일치하는지 대조.
// 게임/세이브 불변. node rift-boss-gate.mjs 로 실행하면 PASS/FAIL 표를 출력한다.
// ─────────────────────────────────────────────────────────────────────────────
function mkRegion(o = {}) {
  return { id: o.id ?? 0, total: o.total ?? 0, kills: o.kills ?? 0, cleared: o.cleared ?? false, fbIdx: o.fbIdx ?? -1 };
}

export const FIXTURES = Object.freeze([
  // STEP 1 — 지역 클리어
  {
    step: 1, name: '빈 지역(total0)+앵글러없음 = 조용히 클리어(ratio 1)',
    run: () => regionRatio(mkRegion({ total: 0, fbIdx: -1 }), 0, { gateGuardKilled: false, regGateIdx: -1 }) === 1
            && regionClearable(mkRegion({ total: 0, fbIdx: -1 }), 0, { stage: 0, fbDone: true, fbSpawned: true, fieldBosses: null, gateGuardKilled: false, regGateIdx: -1 }) === true,
  },
  {
    step: 1, name: '부동소수 0.7+0.1 는 1e-9 보정으로 클리어 성립',
    run: () => regionClearable(mkRegion({ total: 10, kills: 7 }), 0, { stage: 1, fbDone: true, fbSpawned: false, fieldBosses: null, gateGuardKilled: true, regGateIdx: 0 }) === true,
  },
  {
    step: 1, name: '담당 앵글러 생존 중이면 처치율 충족해도 클리어 불가',
    run: () => regionClearable(mkRegion({ total: 10, kills: 10, fbIdx: 0 }), 0, { stage: 0, fbDone: false, fbSpawned: true, fieldBosses: [{ hp: 5 }], gateGuardKilled: false, regGateIdx: -1 }) === false,
  },
  {
    step: 1, name: '앵글러 미스폰(=생존 취급) → 클리어 불가',
    run: () => regionFbAlive(mkRegion({ fbIdx: 0 }), { stage: 0, fbDone: false, fbSpawned: false, fieldBosses: null }) === true,
  },
  // STEP 2 — 지옥문 개방
  {
    step: 2, name: '오픈필드: 4지역 클리어 + krakenOk → 개방',
    run: () => {
      const regions = [mkRegion({ cleared: true }), mkRegion({ cleared: true }), mkRegion({ cleared: true }), mkRegion({ cleared: true })];
      const r = evalGateOpen({ regions, stage: 0, fbDone: true });
      return r.unlock === true && r.path === 'region';
    },
  },
  {
    step: 2, name: 'si0 앵글러 미완(_fbDone=false) → 4지역 클리어여도 개방 차단(이중 안전망)',
    run: () => {
      const regions = [mkRegion({ cleared: true }), mkRegion({ cleared: true }), mkRegion({ cleared: true }), mkRegion({ cleared: true })];
      return evalGateOpen({ regions, stage: 0, fbDone: false }).unlock === false;
    },
  },
  {
    step: 2, name: '소형맵 폴백: totalSpawned<=0 → krakenOk 즉시 개방',
    run: () => evalGateOpen({ regions: null, totalSpawned: 0, stage: 2, fbDone: false }).path === 'fallback-empty'
            && evalGateOpen({ regions: null, totalSpawned: 0, stage: 2, fbDone: false }).unlock === true,
  },
  {
    // ASYMMETRY: 폴백 kill-rule gate(checkRooms 40554)는 bare `>=0.8` — 지역 경로(_regionCheckClears
    // 59153)의 `-1e-9` 보정이 없다. 따라서 7/10+0.10=0.7999999999999999 는 폴백에서 개방되지 않는다.
    // 이 fixture는 "완화"가 아니라 **기존 source 동작을 그대로 보존**한다.
    step: 2, name: '소형맵 폴백: 7/10+0.10 은 float로 0.8 미달 → 봉인(source에 epsilon 없음)',
    run: () => evalGateOpen({ regions: null, totalSpawned: 10, stageKills: 7, gateGuardKilled: true, stage: 2 }).unlock === false,
  },
  {
    step: 2, name: '소형맵 폴백: 처치 0.8 정확(8/10) 문지기 없음 → 개방',
    run: () => evalGateOpen({ regions: null, totalSpawned: 10, stageKills: 8, gateGuardKilled: false, stage: 2 }).unlock === true,
  },
  {
    step: 2, name: '소형맵 폴백: 처치 0.79 문지기 없음 → 봉인 유지',
    run: () => evalGateOpen({ regions: null, totalSpawned: 100, stageKills: 79, gateGuardKilled: false, stage: 2 }).unlock === false,
  },
  // STEP 3 — 보스 접근
  { step: 3, name: 'si0 앵글러 미완 → 접근 차단(angler)', run: () => evalBossAccess({ stage: 0, fbDone: false, bossUnlocked: false }).reason === 'angler' },
  { step: 3, name: '해금 전 → 접근 차단(sealed)', run: () => evalBossAccess({ stage: 1, fbDone: true, bossUnlocked: false }).reason === 'sealed' },
  { step: 3, name: '해금 완료 → 입장', run: () => evalBossAccess({ stage: 1, fbDone: true, bossUnlocked: true }).action === 'enter' },
  // STEP 4·5 — 보스 사망 / 부활 홀드
  { step: 4, name: '보스 부재 + 보스방 → 사망 확정', run: () => evalBossDeath({ bossPresent: false, ens: [], hasBossRoom: true }) === true },
  { step: 5, name: '보스 부활 대기(_reviveTimer>0) → 살아있는 취급, 문 안 열림', run: () => evalBossDeath({ bossPresent: false, ens: [{ ib: true, _reviveTimer: 30 }], hasBossRoom: true }) === false },
  { step: 4, name: '보스방 아직 없음 → 사망 미확정', run: () => evalBossDeath({ bossPresent: false, ens: [], hasBossRoom: false }) === false },
  // STEP 6 — 재도전
  { step: 6, name: '아레나 사망 + 백업 → arena-retry(필드 보존)', run: () => { const r = classifyRetry({ bossArena: true, hasPreArenaBackup: true }); return r.path === 'arena-retry' && r.preserveField === true; } },
  { step: 6, name: '해금된 CH1-1 필드 사망 → field-retry(진행 보존)', run: () => classifyRetry({ stage: 0, bossArena: false, bossUnlocked: true }).path === 'field-retry' },
  { step: 6, name: '해금 전 일반 사망 → normal-restart(리셋)', run: () => { const r = classifyRetry({ stage: 0, bossArena: false, bossUnlocked: false }); return r.path === 'normal-restart' && r.preserveField === false; } },
  { step: 6, name: '피날레 재도전 → druid-finale(새 보스)', run: () => classifyRetry({ retryDruidFinale: true, bossArena: true, hasPreArenaBackup: true }).path === 'druid-finale' },
]);

export function verify() {
  const results = FIXTURES.map((f) => {
    let pass = false, err = null;
    try { pass = f.run() === true; } catch (e) { err = e && e.message; }
    return { step: f.step, name: f.name, pass, err };
  });
  const passed = results.filter((r) => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, results };
}

// 직접 실행 시 자가 검증 리포트 출력 (게임/세이브 불변, 순수 로컬).
const _isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; }
})();
if (_isMain) {
  const { total, passed, failed, results } = verify();
  console.log('rift-boss-gate 자가 검증 — 기존 gate/보스 경계 ↔ source 대조');
  console.log(`source: ${SOURCE.file} @ ${SOURCE.sha256.slice(0, 16)}… (${SOURCE.capturedAt})`);
  for (const r of results) {
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'} [STEP${r.step}] ${r.name}${r.err ? ' — ' + r.err : ''}`);
  }
  console.log(`결과: ${passed}/${total} PASS` + (failed ? `, ${failed} FAIL` : ''));
  try { process.exitCode = failed ? 1 : 0; } catch { /* non-node 환경 무시 */ }
}

export default { SOURCE, CONST, ANCHORS, NOTES, FIXTURES, verify };
