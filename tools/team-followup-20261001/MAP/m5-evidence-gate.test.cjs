/* ============================================================================
 * MAP-M5-EVIDENCE-GATE 회귀 — 실측 원자료 + 합성 시나리오
 *   node tools/team-followup-20261001/MAP/m5-evidence-gate.test.cjs
 * 검증: 각 등급(PASS/FAIL/UNKNOWN/INCONCLUSIVE) 산출, 8뷰 없는 PASS 금지,
 *       실측 walk-input-raw.json/south-shots.json에 대한 보수적 판정.
 * ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const G = require('./m5-evidence-gate.cjs');

const EV = path.resolve(__dirname, '../../../docs/0마스터플랜/mac-resume-20261001/map020-evidence');
let PASS = 0, FAIL = 0; const log = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
  log.push({ name, ok: !!cond, detail: cond ? undefined : detail });
}

// ── 합성 표본 헬퍼 ──────────────────────────────────────────────────────────
// path: [{x,y}...]. opts: {held=true, wallAheadTail, gameWallAheadTail, mapSame=true}
function mkLeg(name, dir, pathPts, opts = {}) {
  const held = opts.held !== false;
  const n = pathPts.length;
  const samples = pathPts.map((p, i) => {
    const isTail = i >= n - 5;
    const s = { t: i * 50, x: p.x, y: p.y, held: (opts.heldHole != null && i === opts.heldHole) ? false : held, mapSame: opts.mapSame !== false };
    if (opts.wallAheadTail != null) s.wallAhead = isTail ? opts.wallAheadTail : false;
    if (opts.wallAheadAll != null) s.wallAhead = opts.wallAheadAll;
    if (opts.gameWallAheadTail != null) s.gameWallAhead = isTail ? opts.gameWallAheadTail : false;
    return s;
  });
  return { name, dir, samples, endPos: pathPts[n - 1], mapUnchanged: opts.mapSame !== false, stopReason: opts.stopReason || null };
}
function ramp(from, to, steps, axis) { // 선형 경로, 나머지 축 고정
  const out = []; for (let i = 0; i <= steps; i++) { const t = i / steps; const v = from[axis] + (to[axis] - from[axis]) * t; out.push(axis === 'y' ? { x: from.x, y: v } : { x: v, y: from.y }); } return out;
}
function stall(at, steps) { const out = []; for (let i = 0; i < steps; i++) out.push({ x: at.x, y: at.y }); return out; }

const allViews = () => G.SSOT.views8.map((v) => ({ view: v, filename: v + '.png', cam: { x: 0, y: 0 } }));

// ── 1) 실측 원자료 판정 ─────────────────────────────────────────────────────
console.log('\n[1] 실측 원자료 (walk-input-raw.json + south-shots.json)');
{
  const legs = JSON.parse(fs.readFileSync(path.join(EV, 'walk-input-raw.json'), 'utf8'));
  const shots = JSON.parse(fs.readFileSync(path.join(EV, 'south-shots.json'), 'utf8'));
  // 정적 shot은 모두 같은 남쪽 카메라(2420,6600) → START 1뷰로만 집계. 보행은 SIDE RIGHT.
  const views = shots.map((s) => ({ view: 'START', filename: s.filename, cam: s.cam, player: s.player, zoom: s.zoom }));
  const r = G.judge({ legs, views, walkCoverage: ['SIDE RIGHT'],
    coordProbes: { // before-map-collision.json.coordinateCheck 값(게임 isW 미노출 → tile만)
      doc_M5_world: { wallTile: true, gameIsW: null },
      doc_M5_bake: { wallTile: true, gameIsW: null },
      approach: { wallTile: false, gameIsW: null },
    } });
  check('1a 실측 종합 verdict≠PASS(8뷰·충돌불명)', r.verdict !== 'PASS', r.verdict);
  check('1b 8뷰 미완 차단사유 포함', (r.passForbiddenReason || []).some((x) => x.indexOf('8뷰') === 0), JSON.stringify(r.passForbiddenReason));
  check('1c 남측 차단 leg는 INCONCLUSIVE(충돌불명: 전방프로브 없음)', r.boundaries.A_enter_south.grade === 'INCONCLUSIVE' && r.boundaries.D_block_south2.grade === 'INCONCLUSIVE', JSON.stringify([r.boundaries.A_enter_south, r.boundaries.D_block_south2]));
  check('1d 복귀/개구 leg PASS(종점 일치)', r.boundaries.B_inside_north.grade === 'PASS' && r.boundaries.C_entry_east.grade === 'PASS', JSON.stringify([r.boundaries.B_inside_north, r.boundaries.C_entry_east]));
  check('1e 좌표계약: 문서=벽 PASS, 접근=비벽 PASS', r.coords.doc_M5_world.grade === 'PASS' && r.coords.approach.grade === 'PASS', JSON.stringify(r.coords));
  check('1f 8뷰 집계: present<8', r.views.present.length < 8 && !r.views.complete, JSON.stringify(r.views));
  console.log('  실측 verdict=' + r.verdict + ' | views=' + r.views.present.length + '/8 | ' + JSON.stringify(r.summary.boundaries));
}

// ── 2) 완전 증거 → PASS (8뷰 + 전방벽 + 좌표일치) ────────────────────────────
console.log('\n[2] 완전 증거 → PASS');
{
  const legs = [
    mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), { gameWallAheadTail: true }),
    mkLeg('B_inside_north', 'N', ramp({ x: 6660, y: 6304.369 }, { x: 6660, y: 6137.214 }, 20, 'y'), {}),
    mkLeg('C_entry_east', 'E', ramp({ x: 6660, y: 6137.214 }, { x: 6746.363, y: 6137.214 }, 10, 'x'), {}),
    mkLeg('D_block_south2', 'S', ramp({ x: 6746.363, y: 6137.214 }, { x: 6746.363, y: 6223.577 }, 20, 'y').concat(stall({ x: 6746.363, y: 6223.577 }, 6)), { gameWallAheadTail: true }),
  ];
  const r = G.judge({ legs, views: allViews(), walkCoverage: ['SIDE RIGHT'],
    coordProbes: { doc_M5_world: { wallTile: true }, doc_M5_bake: { wallTile: true }, approach: { wallTile: false } } });
  check('2a 전체 PASS', r.verdict === 'PASS', JSON.stringify({ v: r.verdict, b: r.passForbiddenReason, sum: r.summary }));
  check('2b 모든 경계 PASS', Object.values(r.boundaries).every((x) => x.grade === 'PASS'), JSON.stringify(r.boundaries));
}

// ── 3) 뷰 1개 제거 → PASS 금지(RETOUCH) ─────────────────────────────────────
console.log('\n[3] 8뷰 미완 → PASS 금지');
{
  const legs = [ mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), { gameWallAheadTail: true }) ];
  const views = allViews().slice(0, 7); // EXIT/BOSS 제외
  const r = G.judge({ legs, views, coordProbes: { doc_M5_world: { wallTile: true }, doc_M5_bake: { wallTile: true }, approach: { wallTile: false } } });
  check('3a verdict RETOUCH(≠PASS)', r.verdict === 'RETOUCH', r.verdict);
  check('3b 차단사유에 8뷰 미완', (r.passForbiddenReason || []).some((x) => x.indexOf('8뷰') === 0), JSON.stringify(r.passForbiddenReason));
  check('3c 미방문 뷰 EXIT/BOSS 보고', r.views.missing.includes('EXIT/BOSS'), JSON.stringify(r.views.missing));
}

// ── 4) 등급별 단위 판정 ─────────────────────────────────────────────────────
console.log('\n[4] 등급별 단위');
{
  const spec = G.SSOT.boundaries.A_enter_south;
  // 미방문
  check('4a 미방문(leg 없음)=UNKNOWN', G.judgeBoundary('A_enter_south', spec, null).grade === 'UNKNOWN');
  check('4b 표본0=UNKNOWN', G.judgeBoundary('A_enter_south', spec, mkLeg('A_enter_south', 'S', [])).grade === 'UNKNOWN');
  // 입력불명
  const holed = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), { gameWallAheadTail: true, heldHole: 3 });
  check('4c held=false 표본=INCONCLUSIVE(입력불명)', G.judgeBoundary('A_enter_south', spec, holed).grade === 'INCONCLUSIVE', JSON.stringify(G.judgeBoundary('A_enter_south', spec, holed)));
  // 정지했으나 전방벽 없음(충돌불명)
  const noProbe = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), {});
  check('4d 정지+전방벽증거 없음=INCONCLUSIVE(충돌불명)', G.judgeBoundary('A_enter_south', spec, noProbe).grade === 'INCONCLUSIVE', G.judgeBoundary('A_enter_south', spec, noProbe).reason);
  // 정지+전방 비벽(충돌불명)
  const fwFalse = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), { gameWallAheadTail: false });
  check('4e 정지+전방 비벽=INCONCLUSIVE', G.judgeBoundary('A_enter_south', spec, fwFalse).grade === 'INCONCLUSIVE');
  // 벽 통과(FAIL): 전방벽 true인데 끝까지 이동(정지 안 함)
  const through = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6500 }, 40, 'y'), { wallAheadAll: true });
  check('4f 전방벽 통과=FAIL', G.judgeBoundary('A_enter_south', spec, through).grade === 'FAIL', JSON.stringify(G.judgeBoundary('A_enter_south', spec, through)));
  // 맵 변경(FAIL)
  const mapch = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6304.369 }, 30, 'y').concat(stall({ x: 6660, y: 6304.369 }, 6)), { gameWallAheadTail: true, mapSame: false });
  check('4g 맵 변경=FAIL', G.judgeBoundary('A_enter_south', spec, mapch).grade === 'FAIL');
  // 정지+전방벽+좌표 불일치(INCONCLUSIVE 좌표불명)
  const offCoord = mkLeg('A_enter_south', 'S', ramp({ x: 6660, y: 6140 }, { x: 6660, y: 6600 }, 30, 'y').concat(stall({ x: 6660, y: 6600 }, 6)), { gameWallAheadTail: true });
  check('4h 정지+전방벽+예상좌표 불일치=INCONCLUSIVE', G.judgeBoundary('A_enter_south', spec, offCoord).grade === 'INCONCLUSIVE', JSON.stringify(G.judgeBoundary('A_enter_south', spec, offCoord)));
  // open leg 막힘(FAIL)
  const openSpec = G.SSOT.boundaries.C_entry_east;
  const openBlocked = mkLeg('C_entry_east', 'E', ramp({ x: 6660, y: 6137.214 }, { x: 6690, y: 6137.214 }, 10, 'x').concat(stall({ x: 6690, y: 6137.214 }, 6)), { gameWallAheadTail: true });
  check('4i 개구 기대인데 막힘=FAIL', G.judgeBoundary('C_entry_east', openSpec, openBlocked).grade === 'FAIL');
}

// ── 5) 좌표 계약 단위 ───────────────────────────────────────────────────────
console.log('\n[5] 좌표 계약 단위');
{
  const c = G.SSOT.coordContract.approach;
  check('5a 접근점 gameIsW=false → PASS(비벽 일치)', G.judgeCoord('approach', c, { gameIsW: false }).grade === 'PASS');
  check('5b 접근점 gameIsW=true → FAIL(SSOT 불일치)', G.judgeCoord('approach', c, { gameIsW: true }).grade === 'FAIL');
  check('5c 접근점 증거 없음 → UNKNOWN', G.judgeCoord('approach', c, null).grade === 'UNKNOWN');
  const d = G.SSOT.coordContract.doc_M5_world;
  check('5d 문서좌표 wallTile=true → PASS(벽 일치)', G.judgeCoord('doc_M5_world', d, { wallTile: true }).grade === 'PASS');
  check('5e 문서좌표 wallTile=false → FAIL', G.judgeCoord('doc_M5_world', d, { wallTile: false }).grade === 'FAIL');
  check('5f 벽판정 없음(null) → UNKNOWN', G.judgeCoord('doc_M5_world', d, { wallTile: null, gameIsW: null }).grade === 'UNKNOWN');
}

console.log('\n==== 결과: ' + PASS + ' PASS / ' + FAIL + ' FAIL ====');
console.log('GATE_TEST_JSON ' + JSON.stringify({ pass: PASS, fail: FAIL, results: log }));
process.exit(FAIL ? 1 : 0);
