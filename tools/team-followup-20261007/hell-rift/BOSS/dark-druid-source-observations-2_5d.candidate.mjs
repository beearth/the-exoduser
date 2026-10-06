// dark-druid-source-observations-2_5d.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-CONSUMER-LINK-20261007-SOURCE-OBSERVATIONS / ROLE BOSS / UUID 72ba2963-…
// GOAL CH1-RIFT-CONSUMER-LINK-20261007
// COMPLETION-ID CH1-RIFT-CONSUMER-LINK-20261007-SOURCE-OBSERVATIONS-CANDIDATE
//
// **브라우저 안전** 관측 데이터 모듈. 원본 PNG의 프레임별 alpha 관측(occupied bbox/empty/
// 상단 band/edge)을 **오프라인에서 측정**해 정적 데이터로 제공 + BAKE motion 메타 + UI 진단 접점.
// 이 모듈은 node:fs/zlib를 **import 하지 않는다**(브라우저 export 안전). 오프라인 측정은 도구
// dark-druid-special-cell-audit-2_5d.v2.candidate.mjs(fs/zlib)로 수행했고(2026-10-07),
// 값은 아래 FRAME_OBSERVATIONS에 핀됨. 검증(verifyEmbedded)은 측정기를 **주입**받아 비교한다.
//
// foot/referenceHeight UNKNOWN(occupied bbox를 해부학 foot/strip으로 격상 0), sourcepixels 불변.
// 숨김(hidden)은 기존 BAKED_SPECIAL_MOTIONS.under 소유(여기서 재정의 0, 참조만). 원픽셀 삭제/추정 0.
//
// source:line — root tools/2_5d/baked-special-motion.mjs:16-21(SOURCE fullSHA/dims),
//   :22-32(MOTIONS, under.hidden), :33-40(LIMITS rendererOriginY .86, foot/refHeight UNKNOWN).
// 측정 provenance: alpha>16, upperEdgeBand=상단 8%(bandRatio .08), 정수경계 cell(:50-53).
// emerge는 dive와 동일 바이트/동일 SHA(:17-18) → 관측 동일.
// AGENTS.md §6: 맵 geometry/가림/카메라 QA 아님 → 맵가이드 전체 read 비적용. VISUAL VERDICT: NOT ASSESSED.
// ─────────────────────────────────────────────────────────────────────────────

import { BAKED_SPECIAL_SOURCE, BAKED_SPECIAL_MOTIONS, BAKED_SPECIAL_LIMITS } from '../../../2_5d/baked-special-motion.mjs';
// (node:fs / node:zlib 미import — 브라우저 안전)

export const UNKNOWN = 'UNKNOWN';
export const OBSERVATION_PROVENANCE = Object.freeze({
  tool: 'dark-druid-special-cell-audit-2_5d.v2.candidate.mjs', measuredAt: '2026-10-07',
  alphaThreshold: 16, upperEdgeBandRatio: 0.08, cellBoundary: 'Math.round 정수경계(root :50-53)',
  note: '오프라인 fs/zlib 측정값을 정적 핀. 브라우저 모듈은 fs/zlib 미사용. foot/IK UNKNOWN(격상 0).',
});

// 소스 핀(브라우저 안전 재노출): path/fullSHA/dims. 원본 PNG 불변.
export const SOURCE_PINS = Object.freeze(Object.fromEntries(Object.entries(BAKED_SPECIAL_SOURCE).map(
  ([k, v]) => [k, Object.freeze({ path: v.path, fullSHA: v.sha256, width: v.width, height: v.height, bytes: v.bytes })])));

export const GRID = Object.freeze({
  dive: { cols: 4, rows: 2, cells: 8, dirless: true },
  emerge: { cols: 4, rows: 2, cells: 8, dirless: true },
  transform: { cols: 8, rows: 1, cells: 8, dirless: true },
  beast: { cols: 4, rows: 2, cells: 8, dirless: true },
});

// 프레임별 관측(오프라인 측정 핀). occupied=[x,y,w,h](cell 상대) 또는 null(empty).
// top/bot=edge 1행 점유, fill=채움비, ub=상단 8% band 점유. foot/IK 아님.
const obs = (frame, occupied, top, bot, fill, ub) => Object.freeze({ frame, occupied: occupied ? Object.freeze(occupied) : null, empty: !occupied, topEdgeOccupancy: top, bottomEdgeOccupancy: bot, fillRatio: fill, upperEdgeBand08: ub });
const DIVE_OBS = Object.freeze([
  obs(0, [37, 6, 387, 438], 0, 0.71171, 0.55683, 0.07614),
  obs(1, [14, 30, 403, 414], 0, 0.71558, 0.57923, 0.00176),
  obs(2, [8, 25, 436, 419], 0, 0.78604, 0.5812, 0.01345),
  obs(3, [0, 65, 425, 379], 0, 0.65688, 0.49751, 0),
  obs(4, [23, 0, 403, 426], 0.68694, 0, 0.52947, 0.16905),
  obs(5, [24, 0, 409, 424], 0.69752, 0, 0.42569, 0.10313),
  obs(6, [43, 0, 371, 427], 0.79054, 0, 0.30063, 0.36145),
  obs(7, [79, 0, 327, 425], 0.65237, 0, 0.25709, 0.20381),
]);
export const FRAME_OBSERVATIONS = Object.freeze({
  dive: DIVE_OBS,
  emerge: DIVE_OBS, // 동일 SHA → 동일 관측(:17-18)
  transform: Object.freeze([
    obs(0, [16, 122, 269, 445], 0, 0, 0.38048, 0),
    obs(1, [29, 166, 242, 399], 0, 0, 0.29109, 0),
    obs(2, [15, 232, 271, 333], 0, 0, 0.27841, 0),
    obs(3, [20, 261, 261, 304], 0, 0, 0.237, 0),
    obs(4, [29, 291, 242, 277], 0, 0, 0.2039, 0),
    obs(5, [40, 325, 220, 242], 0, 0, 0.16832, 0),
    obs(6, [31, 330, 239, 237], 0, 0, 0.17646, 0),
    obs(7, [9, 328, 282, 256], 0, 0, 0.20905, 0),
  ]),
  beast: Object.freeze([
    obs(0, [99, 35, 243, 370], 0, 0, 0.29289, 0.00013),
    obs(1, [37, 28, 343, 377], 0, 0, 0.37355, 0.00364),
    obs(2, [25, 43, 389, 342], 0, 0, 0.37469, 0),
    obs(3, [51, 35, 311, 368], 0, 0, 0.27941, 0.00013),
    obs(4, [98, 19, 252, 385], 0, 0, 0.3141, 0.01969),
    obs(5, [38, 17, 313, 387], 0, 0, 0.34108, 0.09165),
    obs(6, [24, 34, 404, 353], 0, 0, 0.39063, 0.00019),
    obs(7, [63, 19, 319, 396], 0, 0, 0.36437, 0.02573),
  ]),
});

// BAKE motion 메타(브라우저 안전 재노출). hidden은 BAKED_SPECIAL_MOTIONS 소유(참조). foot/refHeight UNKNOWN.
export const BAKE_MOTION_META = Object.freeze(Object.fromEntries(Object.entries(BAKED_SPECIAL_MOTIONS).map(
  ([id, m]) => [id, Object.freeze({ sheet: m.sheet, ticks: m.ticks, reverse: !!m.reverse, hidden: !!m.hidden })])));
export const RENDER_LIMITS = Object.freeze({
  rendererOriginY: BAKED_SPECIAL_LIMITS.rendererOriginY, aspectAllowance: BAKED_SPECIAL_LIMITS.aspectAllowance,
  nativeEmergeAspect: BAKED_SPECIAL_LIMITS.nativeEmergeAspect, footAnchor: UNKNOWN, referenceHeight: UNKNOWN,
  note: 'rendererOriginY(.86)는 렌더 계수이며 측정 foot 아님. foot/IK UNKNOWN.',
});

// native frame 번호(reverse/under 반영) — 관측은 **시트 셀 인덱스** 기준. motion→native frame 매핑.
export function motionNativeFrame(motionId, phase01) {
  const m = BAKED_SPECIAL_MOTIONS[motionId];
  if (!m) throw new Error(`지원하지 않는 motion: ${motionId}`);
  if (typeof phase01 !== 'number' || !Number.isFinite(phase01) || phase01 < 0 || phase01 > 1) throw new Error(`phase 범위 오류: ${phase01}`);
  if (m.hidden) return 7; // under: 고정 7 (root :47)
  let f = Math.min(7, Math.floor(phase01 * 8));
  if (m.reverse) f = 7 - f;
  return f;
}

// UI 진단 접점(브라우저 안전): motion+phase → 셀 관측 + 렌더 메타. 디버그 패널용 데이터.
export function diagForMotion(motionId, phase01 = 0) {
  const m = BAKE_MOTION_META[motionId];
  if (!m) throw new Error(`지원하지 않는 motion: ${motionId}`);
  const frame = motionNativeFrame(motionId, phase01);
  const o = FRAME_OBSERVATIONS[m.sheet][frame];
  return Object.freeze({
    motion: motionId, sheet: m.sheet, frame, reverse: m.reverse, hidden: m.hidden,
    observation: o, grid: GRID[m.sheet], sourcePin: SOURCE_PINS[m.sheet],
    footAnchor: UNKNOWN, referenceHeight: UNKNOWN, rendererOriginY: RENDER_LIMITS.rendererOriginY,
    accepted: false, acceptance: 'PENDING-NOT-ASSESSED',
    note: 'occupied=원본 alpha bbox(픽셀). foot/strip 확정 아님. hidden은 BAKED_SPECIAL_MOTIONS 소유.',
  });
}
export function diagSummary() {
  return Object.freeze(Object.keys(FRAME_OBSERVATIONS).map(sheet => Object.freeze({
    sheet, cells: GRID[sheet].cells, fullSHA: SOURCE_PINS[sheet].fullSHA,
    upperEdgeBandMax: Math.max(...FRAME_OBSERVATIONS[sheet].map(o => o.upperEdgeBand08)),
    anyEmpty: FRAME_OBSERVATIONS[sheet].some(o => o.empty),
  })));
}

// 주입식 검증: 외부(fs/zlib) 측정기를 받아 정적 관측과 대조. 이 모듈은 fs/zlib 미참조 유지.
// measurer = { measureCell(sheet,frame,{alpha}), auditEruptTopBand(sheet,{bandRatio,alpha}) }
export function verifyEmbedded(measurer) {
  if (!measurer || typeof measurer.measureCell !== 'function' || typeof measurer.auditEruptTopBand !== 'function') throw new Error('measurer(측정기) 주입 필요');
  const mismatches = [];
  for (const sheet of Object.keys(FRAME_OBSERVATIONS)) {
    const band = measurer.auditEruptTopBand(sheet, { bandRatio: OBSERVATION_PROVENANCE.upperEdgeBandRatio, alpha: OBSERVATION_PROVENANCE.alphaThreshold });
    for (let f = 0; f < GRID[sheet].cells; f++) {
      const live = measurer.measureCell(sheet, f, { alpha: OBSERVATION_PROVENANCE.alphaThreshold });
      const e = FRAME_OBSERVATIONS[sheet][f];
      const lo = live.occupied, eo = e.occupied;
      const occEq = (!lo && !eo) || (lo && eo && lo.x === eo[0] && lo.y === eo[1] && lo.w === eo[2] && lo.h === eo[3]);
      const ub = band.bands[f].topBandOccupancy;
      if (!occEq || live.topEdgeOccupancy !== e.topEdgeOccupancy || live.bottomEdgeOccupancy !== e.bottomEdgeOccupancy || live.fillRatio !== e.fillRatio || ub !== e.upperEdgeBand08)
        mismatches.push({ sheet, frame: f, live: { occ: lo, top: live.topEdgeOccupancy, bot: live.bottomEdgeOccupancy, fill: live.fillRatio, ub }, embedded: e });
    }
  }
  return { ok: mismatches.length === 0, mismatches };
}

export default { UNKNOWN, OBSERVATION_PROVENANCE, SOURCE_PINS, GRID, FRAME_OBSERVATIONS, BAKE_MOTION_META, RENDER_LIMITS, motionNativeFrame, diagForMotion, diagSummary, verifyEmbedded };
