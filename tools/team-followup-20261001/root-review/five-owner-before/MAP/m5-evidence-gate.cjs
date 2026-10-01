/* ============================================================================
 * MAP-M5-EVIDENCE-GATE — M5/MAP-020 보행·뷰 증거 판정기 (오프라인)
 * 세션 d447a49d / Mac MAP / 2026-10-01
 *
 * 목적: 하니스 출력(안전화 하니스 legs 또는 실측 walk-input-raw.json)과 정적
 *   8뷰 캡처 메타를 SSOT·원자료와 대조해 경계별로 PASS/FAIL/UNKNOWN/INCONCLUSIVE
 *   를 부여한다. "실제 8뷰가 없으면 전체 PASS 금지"를 게이트로 강제한다.
 *
 * 등급 규약(불완전 표본 보수화):
 *   PASS         : 방문(held 전구간)+좌표 계약/전방벽 증거 확인+예상좌표 일치.
 *   FAIL         : 증거가 기대와 모순(맵 변경, 벽 통과, SSOT 벽판정 불일치, 개구 기대인데 막힘).
 *   UNKNOWN      : 미방문(leg/표본 없음) 또는 좌표불명(벽판정 증거 자체가 없음).
 *   INCONCLUSIVE : 정지했으나 충돌 근거 불명(전방벽 프로브 없음/비벽), 미도달/타임아웃,
 *                  입력불명(held=false 표본), 예상좌표 불일치.
 *
 * 입력 전제: 게임/서버/브라우저 미기동. 이 모듈은 Read-only 원자료만 읽는
 *   순수 판정기다. 상태 변경·네트워크·파일쓰기 없음(테스트가 결과를 쓴다).
 * ========================================================================== */
'use strict';

// ── SSOT/원자료 계약(대조 기준) ───────────────────────────────────────────
// T=40, world 8000², master 8192², bake→world ×1000/1024.
// 출처: _MAP_SSOT_INDEX.md, before-map-collision.json.coordinateCheck,
//       MAP020-Mac-실화면-검수.md, walk-input-raw.json(실측 종점).
const SSOT = {
  tile: 40,
  bake2world: (b) => b * 1000 / 1024,
  // M5 좌표 계약: 문서 7000,6900 = 벽(오기). 접근점 6660,6140 = 비벽.
  coordContract: {
    doc_M5_world: { world: [7000, 6900], mustBeWall: true, note: 'SSOT 문서좌표(월드해석)=벽, 보행진입점 아님(오기)' },
    doc_M5_bake: { world: [6835.9375, 6738.28125], mustBeWall: true, note: '문서좌표 bake→world 해석=벽' },
    approach: { world: [6660, 6140], mustBeWall: false, note: '검증된 비벽 접근점(검수 배치 기준)' },
  },
  // 접근 가능한 경계 leg 기대(실측 종점 ±tol). M5 "주머니 안→입구 전체 경로"는
  // 아직 미성립이므로 아래는 접근 가능한 경계만 다룬다.
  boundaries: {
    A_enter_south:  { dir: 'S', kind: 'block', expect: { y: 6304.369 }, tol: 40, note: '남진→남측벽 정지(실측 y6304.369)' },
    B_inside_north: { dir: 'N', kind: 'open',  expect: { y: 6137.214 }, tol: 40, note: '북상 복귀(실측 y6137.214)' },
    C_entry_east:   { dir: 'E', kind: 'open',  expect: { x: 6746.363 }, tol: 40, note: '동측 개구(실측 x6746.363)' },
    D_block_south2: { dir: 'S', kind: 'block', expect: { y: 6223.577 }, tol: 40, note: '동측열 남진→곡선 남측벽 정지(실측 y6223.577)' },
  },
  // leg 이름 별칭(실측 phase.name ↔ 안전화 하니스 leg.name)
  alias: {
    'south-approach': 'A_enter_south', 'A_enter_south': 'A_enter_south',
    'north-return': 'B_inside_north', 'B_inside_north': 'B_inside_north',
    'east-entry': 'C_entry_east', 'C_entry_east': 'C_entry_east',
    'south-blocked': 'D_block_south2', 'D_block_south2': 'D_block_south2',
  },
  // 가이드 §15 CAMERA QA 8뷰. 전체 PASS는 8뷰 모두 실제 증거 필요.
  views8: ['START', 'EARLY', 'MAIN ARENA', 'SIDE LEFT', 'SIDE RIGHT', 'PRIMARY LANDMARK', 'LATE', 'EXIT/BOSS'],
};

const EPS = 0.5;   // flatline 임계(px)
const FLAT_N = 5;  // 연속 표본 수(≈250ms @50ms)

function R(grade, reason, extra) { return Object.assign({ grade, reason }, extra || {}); }
const axisOf = (dir) => (dir === 'N' || dir === 'S') ? 'y' : 'x';

// ── leg 정규화: 두 포맷 → 공통 형태 ────────────────────────────────────────
// 반환: {name, dir, samples:[{t,x,y,held,wall,wallAhead,gameWallAhead}], end{x,y}, mapUnchanged, stopReason?}
function normLeg(raw) {
  if (!raw || typeof raw !== 'object') return null;
  // 안전화 하니스 포맷: name/dir/endPos/samples(wallAhead,gameWallAhead)
  if (raw.name && raw.dir && (raw.endPos || raw.samples)) {
    const s = (raw.samples || []).map((x) => ({
      t: x.t, x: x.x, y: x.y, held: x.held,
      wall: (typeof x.wall === 'boolean') ? x.wall : null,
      wallAhead: (typeof x.wallAhead === 'boolean') ? x.wallAhead : null,
      gameWallAhead: (typeof x.gameWallAhead === 'boolean') ? x.gameWallAhead : null,
      mapSame: (typeof x.mapSame === 'boolean') ? x.mapSame : null,
    }));
    const mapUnchanged = (typeof raw.mapUnchanged === 'boolean') ? raw.mapUnchanged
      : (s.length ? s.every((x) => x.mapSame !== false) : null);
    const end = raw.endPos || (s.length ? { x: s[s.length - 1].x, y: s[s.length - 1].y } : null);
    return { name: raw.name, dir: raw.dir, samples: s, end, mapUnchanged, stopReason: raw.stopReason || null };
  }
  // 실측 raw 포맷: phase{name,code}/after/samples(wall=플레이어중심 isW)
  if (raw.phase && raw.phase.name) {
    const s = (raw.samples || []).map((x) => ({
      t: x.t, x: x.x, y: x.y, held: x.held,
      wall: (typeof x.wall === 'boolean') ? x.wall : null, // 플레이어 중심 isW(전방 아님)
      wallAhead: null, gameWallAhead: null, mapSame: null,
    }));
    return {
      name: raw.phase.name, dir: dirFromCode(raw.phase.code), samples: s,
      end: raw.after || null, mapUnchanged: (typeof raw.mapUnchanged === 'boolean') ? raw.mapUnchanged : null,
      stopReason: null,
    };
  }
  return null;
}
function dirFromCode(code) {
  return ({ KeyW: 'N', ArrowUp: 'N', KeyS: 'S', ArrowDown: 'S', KeyD: 'E', ArrowRight: 'E', KeyA: 'W', ArrowLeft: 'W' })[code] || '?';
}

// ── flatline(정지) 판정: 이동축에서 마지막 FLAT_N 표본 변위<EPS ─────────────
function isFlatline(samples, axis) {
  if (samples.length < FLAT_N) return false;
  const tail = samples.slice(-FLAT_N);
  let mn = Infinity, mx = -Infinity;
  for (const s of tail) { const v = s[axis]; if (v < mn) mn = v; if (v > mx) mx = v; }
  return (mx - mn) < EPS;
}
// 전방벽 증거: 말미 표본에서 gameWallAhead(우선) 또는 wallAhead. 둘 다 없으면 null.
function forwardWall(samples) {
  const tail = samples.slice(-FLAT_N);
  let sawGame = false, sawTile = false, gameTrue = false, tileTrue = false;
  for (const s of tail) {
    if (s.gameWallAhead !== null) { sawGame = true; if (s.gameWallAhead === true) gameTrue = true; }
    if (s.wallAhead !== null) { sawTile = true; if (s.wallAhead === true) tileTrue = true; }
  }
  if (sawGame) return gameTrue;      // 게임 isW 전방 프로브 우선
  if (sawTile) return tileTrue;      // 타일 분류기 전방 프로브
  return null;                        // 전방벽 증거 없음 → 충돌불명
}
function within(end, axis, expect, tol) {
  if (!end || typeof end[axis] !== 'number' || typeof expect !== 'number') return null;
  return Math.abs(end[axis] - expect) <= tol;
}

// ── 경계 1개 판정 ──────────────────────────────────────────────────────────
function judgeBoundary(key, spec, legRaw) {
  const leg = normLeg(legRaw);
  if (!leg) return R('UNKNOWN', '미방문: leg 없음', { key });
  const s = leg.samples || [];
  if (!s.length) return R('UNKNOWN', '미방문: 표본 0', { key });
  if (!s.every((x) => x.held === true)) return R('INCONCLUSIVE', '입력불명: held=false 표본 존재', { key });
  if (leg.mapUnchanged === false) return R('FAIL', '맵/충돌 변경됨 — 무결성 위반', { key });

  const axis = axisOf(spec.dir);
  const stopped = isFlatline(s, axis);
  const fw = forwardWall(s);
  const exp = spec.expect[axis];
  const hit = within(leg.end, axis, exp, spec.tol);

  if (spec.kind === 'block') {
    if (!stopped) {
      if (s.some((x) => x.wallAhead === true || x.gameWallAhead === true))
        return R('FAIL', '전방이 벽인데 정지하지 않고 통과', { key, end: leg.end });
      return R('INCONCLUSIVE', '미도달/미정지(타임아웃) — 막힘 미확인', { key, end: leg.end, stopReason: leg.stopReason });
    }
    // 정지함
    if (fw === true && hit === true) return R('PASS', '정지+전방벽 확인+예상 막힘좌표 일치', { key, end: leg.end });
    if (fw === true && hit === false) return R('INCONCLUSIVE', '정지+전방벽이나 예상좌표 불일치(좌표불명)', { key, end: leg.end, expect: exp });
    if (fw === null) return R('INCONCLUSIVE', '정지하나 전방벽 증거 없음(충돌불명)', { key, end: leg.end });
    return R('INCONCLUSIVE', '정지하나 전방 비벽(충돌불명)', { key, end: leg.end });
  }
  // kind === 'open'
  if (stopped && fw === true) return R('FAIL', '개구(통행) 기대이나 전방벽에 막힘', { key, end: leg.end });
  if (hit === true) return R('PASS', '기대 방향 이동·종점 도달', { key, end: leg.end });
  if (hit === null) return R('UNKNOWN', '좌표불명: 종점/기대값 결측', { key, end: leg.end });
  return R('INCONCLUSIVE', '이동하나 기대 종점 불일치', { key, end: leg.end, expect: exp });
}

// ── 좌표 계약 판정(벽/비벽) ────────────────────────────────────────────────
// probe: {wallTile?:bool, gameIsW?:bool|null} — 하니스 coordAudit 항목에서 공급.
function judgeCoord(key, spec, probe) {
  if (!probe) return R('UNKNOWN', '좌표불명: 증거 없음', { key, world: spec.world });
  const got = (probe.gameIsW !== undefined && probe.gameIsW !== null) ? probe.gameIsW
    : (probe.wallTile !== undefined && probe.wallTile !== null ? probe.wallTile : null);
  if (got === null) return R('UNKNOWN', '좌표불명: 벽 판정 없음', { key, world: spec.world });
  return (got === spec.mustBeWall)
    ? R('PASS', `벽판정 일치(=${got})`, { key, world: spec.world })
    : R('FAIL', `SSOT 불일치: 기대 ${spec.mustBeWall}, 실제 ${got}`, { key, world: spec.world });
}

// ── 8뷰 집계 ───────────────────────────────────────────────────────────────
// views: [{view:'START', filename, cam, player, zoom}] / walkCoverage: ['SIDE RIGHT']
function tallyViews(views, walkCoverage) {
  const present = new Set();
  (views || []).forEach((v) => { if (v && v.view) present.add(String(v.view).toUpperCase()); });
  (walkCoverage || []).forEach((v) => present.add(String(v).toUpperCase()));
  const want = SSOT.views8.map((v) => v.toUpperCase());
  const missing = want.filter((v) => !present.has(v));
  return { present: [...present], missing, complete: missing.length === 0 };
}

// ── 종합 판정 ───────────────────────────────────────────────────────────────
// bundle = { legs:{A_enter_south:<leg>,...} 또는 [<leg>...], coordProbes:{approach:{...}},
//            views:[{view,...}], walkCoverage:['SIDE RIGHT'] }
function judge(bundle) {
  bundle = bundle || {};
  // legs: 배열이면 별칭으로 매핑
  const legMap = {};
  if (Array.isArray(bundle.legs)) {
    for (const lg of bundle.legs) {
      const nm = (lg && lg.name) || (lg && lg.phase && lg.phase.name);
      const key = nm && SSOT.alias[nm];
      if (key) legMap[key] = lg;
    }
  } else if (bundle.legs && typeof bundle.legs === 'object') {
    for (const k of Object.keys(bundle.legs)) { const key = SSOT.alias[k] || k; legMap[key] = bundle.legs[k]; }
  }

  const boundaries = {};
  for (const key of Object.keys(SSOT.boundaries)) {
    boundaries[key] = judgeBoundary(key, SSOT.boundaries[key], legMap[key]);
  }
  const coords = {};
  for (const key of Object.keys(SSOT.coordContract)) {
    const probe = bundle.coordProbes && bundle.coordProbes[key];
    coords[key] = judgeCoord(key, SSOT.coordContract[key], probe);
  }
  const views = tallyViews(bundle.views, bundle.walkCoverage);

  // 등급 집계
  const all = [...Object.values(boundaries), ...Object.values(coords)];
  const anyFail = all.some((r) => r.grade === 'FAIL');
  const anyUnknown = all.some((r) => r.grade === 'UNKNOWN');
  const anyInconc = all.some((r) => r.grade === 'INCONCLUSIVE');

  const blockers = [];
  if (anyFail) blockers.push('FAIL 항목 존재');
  if (!views.complete) blockers.push('8뷰 미완(미방문: ' + views.missing.join(', ') + ')');
  if (anyUnknown) blockers.push('UNKNOWN 항목 존재');
  if (anyInconc) blockers.push('INCONCLUSIVE 항목 존재');

  let verdict;
  if (anyFail) verdict = 'FAIL';
  else if (blockers.length) verdict = 'RETOUCH';   // ★ 8뷰·불완전 표본 있으면 PASS 금지
  else verdict = 'PASS';

  return {
    fixture: 'MAP-M5-EVIDENCE-GATE',
    verdict,
    passForbiddenReason: (verdict !== 'PASS') ? blockers : null,
    views,
    boundaries,
    coords,
    summary: tally(all, boundaries, coords, views),
  };
}

function tally(all, boundaries, coords, views) {
  const count = (arr) => arr.reduce((m, r) => (m[r.grade] = (m[r.grade] || 0) + 1, m), {});
  return {
    boundaries: count(Object.values(boundaries)),
    coords: count(Object.values(coords)),
    viewsPresent: views.present.length,
    viewsWanted: SSOT.views8.length,
  };
}

module.exports = { judge, judgeBoundary, judgeCoord, normLeg, isFlatline, forwardWall, tallyViews, SSOT, R };
