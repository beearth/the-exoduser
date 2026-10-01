/* wa24-delta-probe 회귀 (Node, 브라우저/게임 실행 없음).
 * 검증:
 *   A) 크롭 결정적 예측 — 뷰포트 AR별 레터박스+cover 컷 (엔진 game.html:60742-60801 과 동일식)
 *   B) ★시간축 드리프트 — 관측기 legacy(_cutsceneStartMs+t) vs 엔진 corrected(_cutLineIdx+_cutLineStartMs)
 *   C) fade 곡선 (game.html:60769-60773)
 *   D) 자막: 결정적 기하 + 시각 가독성 UNKNOWN(거짓 PASS 방지)
 *
 * 실행: node tools/team-followup-20261001/ART/wa24-delta-probe.test.mjs
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const D = require(path.join(here, 'wa24-delta-probe.cjs'));

let pass = 0, fail = 0;
function ok(c, m) { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.error('  FAIL', m); } }
const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;

console.log('\n[A] 크롭 결정적 예측 (wa24 2560×1440, imgR=16/9)');
{
  // 16:9 정합 → 무크롭
  const r169 = D.predictWa24Crop(1920, 1080);
  ok(r169.verdict === 'OK_FULLFRAME', `1920×1080 → OK_FULLFRAME (got ${r169.verdict})`);
  ok(near(r169.cutFrac, 0), `16:9 cutFrac≈0 (${r169.cutFrac})`);
  ok(r169.letterbox.letterboxed === false, '16:9 레터박스 없음');

  // 울트라와이드 → 레터박스(검은 띠)되지만 이미지 자체는 full
  const rUW = D.predictWa24Crop(2560, 1080);
  ok(rUW.letterbox.letterboxed === true, '21:9 레터박스 발생');
  ok(rUW.letterbox.cw === 1920 && rUW.letterbox.ch === 1080, `21:9 콘텐츠박스 1920×1080 (${rUW.letterbox.cw}×${rUW.letterbox.ch})`);
  ok(rUW.verdict === 'OK_FULLFRAME', `21:9 이미지 무크롭 OK (got ${rUW.verdict})`);

  // 16:10 → 좌우 소폭 컷
  const r1610 = D.predictWa24Crop(1920, 1200);
  ok(r1610.cutAxis === 'X', '16:10 컷 축 = 좌우(X)');
  ok(near(r1610.cutFrac, 0.10, 0.005), `16:10 좌우 컷 ≈10% (${(r1610.cutFrac * 100).toFixed(1)}%)`);
  ok(r1610.verdict === 'CROP_SIDE_MINOR', `16:10 → CROP_SIDE_MINOR (got ${r1610.verdict})`);

  // 4:3 → 좌우 대폭 컷 (좌우 첨탑·지옥문 폭 손실)
  const r43 = D.predictWa24Crop(1024, 768);
  ok(r43.cutAxis === 'X', '4:3 컷 축 = 좌우(X)');
  ok(near(r43.cutFrac, 0.25, 0.005), `4:3 좌우 컷 ≈25% (${(r43.cutFrac * 100).toFixed(1)}%)`);
  ok(r43.verdict === 'CROP_SIDE_MAJOR', `4:3 → CROP_SIDE_MAJOR (got ${r43.verdict})`);
  // ★wa24 는 콘텐츠박스가 ≤16:9 라 상하컷(상단 지옥문/하단 계단 손실)은 발생하지 않음을 확인
  ok(r43.cover.branch === 'fit-height/cut-sides', 'wa24 는 좌우컷 분기만 — 상하컷 없음');
  ok(near(r43.cover.hidden.top, 0) && near(r43.cover.hidden.bottom, 0), '상/하 손실 0 (전사 발·상단 눈 보존)');

  // 대칭성: 좌우 컷은 중앙 기준(dx=(cw-dw)/2) → 좌=우
  ok(near(r43.cover.hidden.left, r43.cover.hidden.right), '좌우 컷 대칭(중앙 정렬)');
}

console.log('\n[B] ★시간축 드리프트 — legacy(관측기) vs corrected(엔진)');
{
  // PRO 꼬리 라인(절대 t 는 누적). game.html:60341-60344
  const lines = [
    { id: 'wa22', t: 65200, dur: 3000, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5 }, fade: { in: 500 } },
    { id: 'wa23', t: 68200, dur: 5400, cam: { zs: 1.04, ze: 1.04 }, vfx: { vig: .5 }, fade: { in: 1 } },
    { id: 'wa24', t: 73600, dur: 2400, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 }, fade: { in: 400 } },
    { id: 'wa25', t: 76000, dur: 2900, cam: { zs: 1, ze: 1 }, vfx: { vig: .5 }, fade: { in: 400 } }
  ];
  const WA24 = 2; // 인덱스

  // (B0) 드리프트 0 → 두 축 일치 (관측기가 '이상적'일 때는 맞다는 공정성 확인)
  {
    const D0 = 0, lineElapsed = 200;
    const lineStartMs = lines[WA24].t + D0; // = 73600
    const now = lineStartMs + lineElapsed;
    const c = D.correctedSampler({ lines, lineIdx: WA24, lineStartMs, now });
    const l = D.legacySampler({ lines, cutsceneStartMs: 0, now });
    ok(c.active === 'wa24' && l.active === 'wa24', 'drift=0: 둘 다 wa24');
    ok(near(c.lineElapsed, l.lineElapsed), `drift=0: lineElapsed 일치 (${c.lineElapsed}=${l.lineElapsed})`);
    ok(near(c.fadeAlpha, l.fadeAlpha), 'drift=0: fadeAlpha 일치');
  }

  // (B1) 현실 드리프트(프레임 오버슈트 누적 ~600ms): 같은 라인이지만 값이 어긋남
  {
    const Dacc = 600, lineElapsed = 200;
    const lineStartMs = lines[WA24].t + Dacc; // 74200
    const now = lineStartMs + lineElapsed;    // 74400
    const c = D.correctedSampler({ lines, lineIdx: WA24, lineStartMs, now });
    const l = D.legacySampler({ lines, cutsceneStartMs: 0, now });
    ok(c.active === 'wa24', 'drift=600: 엔진 corrected=wa24');
    ok(l.active === 'wa24', 'drift=600: legacy 도 라인은 wa24');
    ok(near(c.lineElapsed, 200) && near(l.lineElapsed, 800), `★lineElapsed 어긋남 corrected=${c.lineElapsed} vs legacy=${l.lineElapsed}`);
    ok(near(c.fadeAlpha, 0.5) && near(l.fadeAlpha, 1.0), `★fadeAlpha 어긋남 corrected=${c.fadeAlpha}(페이드인 중) vs legacy=${l.fadeAlpha}(이미 1)`);
    ok(!near(c.zoom, l.zoom), `★zoom 어긋남 corrected=${c.zoom} vs legacy=${l.zoom}`);
  }

  // (B2) 큰 드리프트(~1800ms): legacy 가 아예 틀린 라인(wa25) 보고
  {
    const Dacc = 1800, lineElapsed = 700;
    const lineStartMs = lines[WA24].t + Dacc; // 75400
    const now = lineStartMs + lineElapsed;    // 76100
    const c = D.correctedSampler({ lines, lineIdx: WA24, lineStartMs, now });
    const l = D.legacySampler({ lines, cutsceneStartMs: 0, now });
    ok(c.active === 'wa24', 'drift=1800: 엔진 corrected=wa24 (여전히 재생 중)');
    ok(l.active === 'wa25', `★drift=1800: legacy 가 wa25 오판정 (got ${l.active}) — 관측기가 다음 컷으로 착각`);
    ok(c.active !== l.active, '★두 축 활성 컷 불일치 증명');
  }
}

console.log('\n[C] fade 곡선 (wa24 fade.in=400, dur=2400, fade.out=0)');
{
  ok(near(D.fadeAlpha(0, 2400, 400, 0), 0), 'le=0 → 0');
  ok(near(D.fadeAlpha(200, 2400, 400, 0), 0.5), 'le=200 → 0.5 (페이드인 중간)');
  ok(near(D.fadeAlpha(400, 2400, 400, 0), 1), 'le=400 → 1 (페이드인 완료)');
  ok(near(D.fadeAlpha(1200, 2400, 400, 0), 1), 'le=1200 → 1 (유지)');
  ok(near(D.fadeAlpha(2400, 2400, 400, 0), 1), 'le=2400 → 1 (fade.out 없음)');
}

console.log('\n[D] 자막 — 결정적 기하 + 시각 UNKNOWN');
{
  const g = D.subtitleGeometry(D.WA24, 1920, 1080);
  ok(g.color === '#d8d4cc', `wa24 자막색 = 뼈색 #d8d4cc (col 미지정) (got ${g.color})`);
  ok(near(g.y_singleLine, 1080 * 0.88), `자막 y = ch*0.88 (${g.y_singleLine})`);
  ok(g.shakeApplies === false, '★shake 자막 미적용(소스 검증)');
  ok(near(g.wrapWidth, 1920 * 0.84), 'wrap 폭 = cw*0.84');

  const v = D.subtitleVisualVerdict({}); // 픽셀 증거 없음
  ok(v.verdict === 'UNKNOWN', `시각 가독성 → UNKNOWN (got ${v.verdict})`);
  ok(Array.isArray(v.needsForPass) && v.needsForPass.length > 0, 'UNKNOWN 은 PASS 전 필요조건 명시');
  const v2 = D.subtitleVisualVerdict({ pixelSampled: true, legible: true });
  ok(v2.verdict === 'PASS', '픽셀 증거(가독) 주어지면 PASS 반영');
}

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
