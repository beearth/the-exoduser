/* owner-integration-finalcrop 회귀 (Node, 읽기 전용 — fs 쓰기/게임 실행 없음).
 *
 * 검증(인수 연결이 원담당 호출부에서 올바로 동작):
 *   A) 4비율 × 3시각 — 인수한 predictFinalCrop 가 실 draw 원문(fixture actualDraw)과 1e-11 일치
 *   B) 누락 연결 해소 — 원담당 cover-only predictWa24Crop(16:9=OK_FULLFRAME)이 놓친 줌 크롭을 최종이 포착
 *   C) 시간축 보존 — correctedSampler 동일 참조 + line-index lineElapsed(=now-lineStartMs), seq-time 회귀 아님
 *   D) 눈·발·자막 픽셀 가독성 UNKNOWN 유지, fade0=가시성 증거 아님
 *
 * 지원 finalcrop/ fixture 는 재작성하지 않고 import(읽기 전용)해 지상진실로 사용.
 * 실행: node tools/team-followup-20261001/ART/owner-integration-finalcrop.test.mjs
 */
import ownerApi from './wa24-finalcrop.mjs';
import art from './wa24-delta-probe.cjs';
import { actualDraw, line } from '../UIUX/art-support-source-fixture.mjs';

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.error('  FAIL', m); } }
const near = (a, b, e = 1e-11) => Math.abs(a - b) <= e;

const RATIOS = [[1920, 1080], [2560, 1080], [1920, 1200], [1024, 768]];
const TIMES = [400, 1200, 2399];

console.log('\n[A] 4비율 × 3시각 — 인수 predictFinalCrop vs 실 draw 원문(fixture)');
{
  let rows = 0;
  for (const [fullW, fullH] of RATIOS) {
    for (const elapsed of TIMES) {
      const actual = actualDraw(fullW, fullH, elapsed);
      // 인수 경로: 원담당 표면(ownerApi)을 통해 호출
      const final = ownerApi.predictFinalCrop({ fullW, fullH, lines: [line], lineIdx: 0, lineStartMs: 0, now: elapsed });
      let good = true;
      for (const side of ['left', 'right', 'top', 'bottom']) good = good && near(final.fractions[side], actual.fractions[side]);
      for (let i = 0; i < 6; i++) good = good && near(final.matrix[i], actual.matrix[i]);
      for (const k of ['x', 'y', 'w', 'h']) good = good && near(final.drawRect[k], actual.drawRect[k]) && near(final.clip[k], actual.clip[k]);
      ok(good, `${fullW}x${fullH} @${elapsed}ms: fractions/matrix/drawRect/clip 1e-11 일치 (geo=${final.geometryVerdict})`);
      rows++;
    }
  }
  ok(rows === 12, `12행(4비율×3시각) 수행 (got ${rows})`);
  // 편의함수(predictWa24FinalCrop, 원담당 WA24 상수)도 실 draw와 일치 → WA24 상수=게임 소스 라인 확인
  const w = ownerApi.predictWa24FinalCrop({ fullW: 1024, fullH: 768, now: 1200, lineStartMs: 0 });
  const a = actualDraw(1024, 768, 1200);
  ok(near(w.fractions.left, a.fractions.left) && near(w.fractions.top, a.fractions.top),
    'predictWa24FinalCrop(WA24 상수) 도 실 draw와 일치');
}

console.log('\n[B] 누락 연결 해소 — cover-only base 가 놓친 줌 크롭 포착');
{
  const cmp = ownerApi.compareOwnerBaseVsFinal({ fullW: 1920, fullH: 1080, now: 1200, lineStartMs: 0 });
  ok(cmp.base.verdict === 'OK_FULLFRAME', `16:9 원담당 cover-only=OK_FULLFRAME (놓침) (got ${cmp.base.verdict})`);
  ok(cmp.final.geometryVerdict === 'CROPPED', `16:9 최종=CROPPED (줌 크롭 포착) (got ${cmp.final.geometryVerdict})`);
  ok(cmp.missingConnectionResolved === true, '★누락 연결 해소 플래그 true');
  ok(cmp.final.verticalFraction > 0 && cmp.final.horizontalFraction >= 0, '줌 상하 크롭 수직비 > 0');

  // root 검수 증거와 동일한 16:9 상하 손실 백분율(top+bottom) 재현 — 파리티 확인
  const expect = { 400: 6.347554630593131, 1200: 4.76190476190477, 2399: 3.846154488227231 };
  for (const t of TIMES) {
    const a = actualDraw(1920, 1080, t);
    const pct = (a.fractions.top + a.fractions.bottom) * 100;
    ok(Math.abs(pct - expect[t]) < 1e-5, `16:9 @${t}ms 상하손실 ${pct.toFixed(4)}% ≈ 검수값 ${expect[t].toFixed(4)}%`);
  }
}

console.log('\n[C] 시간축 보존 — line-index(_cutLineIdx+_cutLineStartMs), seq-time 회귀 아님');
{
  ok(ownerApi.correctedSampler === art.correctedSampler, 'correctedSampler 동일 참조(원담당 시간축 그대로)');
  const state = { lines: [line], lineIdx: 0, lineStartMs: 80000, now: 81200 };
  ok(ownerApi.correctedSampler(state).lineElapsed === 1200, 'correctedSampler lineElapsed=1200(라인 상대)');
  const final = ownerApi.predictFinalCrop({ fullW: 1920, fullH: 1080, ...state });
  ok(final.timeBase === 'line-index', `predictFinalCrop timeBase=line-index (got ${final.timeBase})`);
  ok(final.lineElapsed === 1200, `lineElapsed=now-lineStartMs=1200 (WA24.t=73600 무관 → seq-time 아님) (got ${final.lineElapsed})`);
  // 실 draw(now=81200, lineElapsed=1200)와 일치 → shake 는 absolute now, 크롭은 lineElapsed 기반 확인
  const a = actualDraw(1920, 1080, 1200, 81200);
  ok(near(final.fractions.top, a.fractions.top) && near(final.verticalFraction, a.fractions.top + a.fractions.bottom),
    '드리프트 시각(lineStartMs=80000)에도 실 draw와 일치');
  // seq-time 축이었다면 틀렸을 것을 대비 증명: 원담당 legacySampler 는 다른 라인/경과를 낼 수 있음
  const legacy = art.legacySampler({ lines: art.WA24 ? [art.WA24] : [line], cutsceneStartMs: 0, now: 81200 });
  ok(legacy.active === null || legacy.lineElapsed !== 1200, 'legacy(seq-time) 는 라인-인덱스와 다른 결과 — 회귀 아님 확인');
}

console.log('\n[D] 눈·발·자막 UNKNOWN + fade0 가시성 증거 아님');
{
  const f = ownerApi.predictFinalCrop({ fullW: 1024, fullH: 768, lines: [line], lineIdx: 0, lineStartMs: 0, now: 1200 });
  ok(f.eyeVerdict === 'UNKNOWN' && f.footVerdict === 'UNKNOWN' && f.subtitleVerdict === 'UNKNOWN', '눈/발/자막 = UNKNOWN 유지');
  ok(f.visibilityEvidence === 'GEOMETRY_ONLY', '가시 상태 = GEOMETRY_ONLY(기하만)');
  const hidden = ownerApi.predictFinalCrop({ fullW: 1920, fullH: 1080, lines: [line], lineIdx: 0, lineStartMs: 0, now: 0 });
  ok(hidden.fadeAlpha === 0 && hidden.visibilityEvidence === 'HIDDEN_FADE_NO_VISIBILITY_EVIDENCE', 'fade0 → 가시성 증거 아님');
  ok(hidden.eyeVerdict === 'UNKNOWN', 'fade0 에서도 눈 UNKNOWN');
}

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
