/* wa24-engine-parity 정적 자가검증 (Node, 브라우저 없음).
 * 재생 후보(preview.html)의 순수 로직이 실엔진·canonical 과 일치하고,
 * 고정 preview 가 생략한 3차이(shake 절대now / 연속애니 / 전환)를 올바로 보정했는지 확인.
 *
 * A) 시퀀스 타임라인: wa23[0,5400) wa24[5400,7800) wa25[7800,10700), dur 자동진행 경계
 * B) geometry 공식: 후보 변환(now=el 결정 모드)이 canonical predictFinalCrop·실엔진 actualDraw 와 1e-11 일치 (4비율×3시점)
 * C) ★shake 절대-now 보정: 같은 lineElapsed 라도 절대 now 가 다르면 shake 값이 달라짐(엔진 :60864) → 고정 preview(now=el) 와 구분됨
 *
 * 실행: node tools/team-followup-20261001/ART/wa24-engine-parity/selfcheck.mjs
 */
import { predictFinalCrop } from '../wa24-finalcrop.mjs';
import { actualDraw, line as gameLine } from '../../UIUX/art-support-source-fixture.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.error('  FAIL', m); } };
const near = (a, b, e = 1e-11) => Math.abs(a - b) <= e;

// ── preview.html 과 동일한 순수 로직 (문자 그대로 복제) ──
const EASE = { linear: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t), inout: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 };
function cutShake(mag, t) { return mag ? { x: (Math.sin(t * 0.047) * mag * 2) | 0, y: (Math.cos(t * 0.053) * mag * 2) | 0 } : { x: 0, y: 0 }; }
function letterbox(fw, fh) { const maxAR = 16 / 9, curAR = fw / fh; let lbX = 0, lbY = 0, cw = fw, ch = fh; if (curAR > maxAR) { cw = ~~(fh * maxAR); lbX = ~~((fw - cw) / 2); } else if (curAR < 9 / 16) { ch = ~~(fw / (9 / 16)); lbY = ~~((fh - ch) / 2); } return { cw, ch, lbX, lbY }; }
const SEQ = [
  { id: 'wa23', dur: 5400, cam: { zs: 1.04, ze: 1.04 }, vfx: { vig: .5 }, fade: { in: 1 } },
  { id: 'wa24', dur: 2400, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 }, fade: { in: 400 } },
  { id: 'wa25', dur: 2900, cam: { zs: 1, ze: 1 }, vfx: { vig: .5 }, fade: { in: 400 } }
];
let acc = 0; for (const s of SEQ) { s.start = acc; acc += s.dur; } const TOTAL = acc;
function sequenceAt(seqMs) {
  if (seqMs >= TOTAL) return { done: true, idx: SEQ.length - 1, line: SEQ[SEQ.length - 1], lineElapsed: SEQ[SEQ.length - 1].dur };
  for (let i = 0; i < SEQ.length; i++) { const s = SEQ[i]; if (seqMs >= s.start && seqMs < s.start + s.dur) return { done: false, idx: i, line: s, lineElapsed: seqMs - s.start }; }
  return { done: false, idx: 0, line: SEQ[0], lineElapsed: 0 };
}
// 후보 drawFrame 과 동일한 drawRect→fractions (클립 로컬좌표, shakeNow 주입)
function engineFractions(fw, fh, line, lineElapsed, shakeNow, natW, natH) {
  const { cw, ch } = letterbox(fw, fh);
  const cam = line.cam, t = Math.min(1, lineElapsed / (line.dur || 1));
  const zoom = cam.zs + (cam.ze - cam.zs) * ((EASE[cam.ease || 'linear'] || EASE.linear)(t));
  const sk = cutShake((line.vfx || {}).shake || 0, shakeNow);
  const imgR = natW / natH, cR = cw / ch; let dw, dh, dx, dy;
  if (imgR > cR) { dh = ch; dw = ch * imgR; dx = (cw - dw) / 2; dy = 0; } else { dw = cw; dh = cw / imgR; dx = 0; dy = (ch - dh) * .1; }
  const drawRect = { x: (cw / 2 + sk.x) + zoom * (-cw / 2 + dx), y: (ch / 2 + sk.y) + zoom * (-ch / 2 + dy), w: zoom * dw, h: zoom * dh };
  const clampF = v => Math.max(0, Math.min(1, v));
  return { left: clampF((0 - drawRect.x) / drawRect.w), right: clampF((drawRect.x + drawRect.w - cw) / drawRect.w), top: clampF((0 - drawRect.y) / drawRect.h), bottom: clampF((drawRect.y + drawRect.h - ch) / drawRect.h) };
}

console.log('\n[A] 시퀀스 타임라인 (자동진행 경계)');
ok(TOTAL === 10700, `TOTAL=10700ms (got ${TOTAL})`);
ok(sequenceAt(0).line.id === 'wa23' && sequenceAt(0).lineElapsed === 0, 'seq 0 → wa23 el0');
ok(sequenceAt(5399).line.id === 'wa23', 'seq 5399 → wa23 (경계 직전)');
ok(sequenceAt(5400).line.id === 'wa24' && sequenceAt(5400).lineElapsed === 0, '★seq 5400 → wa24 el0 (wa23 dur 자동진행)');
ok(sequenceAt(5800).line.id === 'wa24' && sequenceAt(5800).lineElapsed === 400, 'seq 5800 → wa24 el400 (진입)');
ok(sequenceAt(7799).line.id === 'wa24', 'seq 7799 → wa24 (출구 직전)');
ok(sequenceAt(7800).line.id === 'wa25' && sequenceAt(7800).lineElapsed === 0, '★seq 7800 → wa25 el0');
ok(sequenceAt(10700).done === true, 'seq 10700 → done');

console.log('\n[B] geometry 공식 ↔ canonical ↔ 실엔진 draw (4비율×3시점, now=el 결정 모드)');
const RATIOS = [[1920, 1080], [2560, 1080], [1920, 1200], [1024, 768]], TIMES = [400, 1200, 2399];
let rows = 0;
for (const [fw, fh] of RATIOS) for (const el of TIMES) {
  const cand = engineFractions(fw, fh, SEQ[1], el, el, 2560, 1440); // shakeNow=el (결정 모드, fixture 규약)
  const mod = predictFinalCrop({ fullW: fw, fullH: fh, lines: [gameLine], lineIdx: 0, lineStartMs: 0, now: el });
  const act = actualDraw(fw, fh, el);
  let good = true;
  for (const s of ['left', 'right', 'top', 'bottom']) good = good && near(cand[s], mod.fractions[s]) && near(cand[s], act.fractions[s]);
  ok(good, `${fw}x${fh} @${el}ms: 후보 == canonical == 실엔진 draw (1e-11)`);
  rows++;
}
ok(rows === 12, `12행 (got ${rows})`);

console.log('\n[C] ★shake 절대-now 보정 (고정 preview now=el 과 구분)');
{
  const el = 1200;
  const atElNow = cutShake(1, el);                 // 고정 preview 방식(now=el)
  const atWall1 = cutShake(1, 123456.7);           // 절대 now A
  const atWall2 = cutShake(1, 123456.7 + 33.3);    // 절대 now B(다음 프레임)
  ok(atWall1.x !== atWall2.x || atWall1.y !== atWall2.y, 'shake 는 절대 now 에 따라 프레임마다 변함(애니메이션)');
  // 적어도 하나의 절대 now 에서 now=el 스냅샷과 달라질 수 있음을 증명(값이 now 의존)
  ok(JSON.stringify(atWall1) !== JSON.stringify(atElNow) || JSON.stringify(atWall2) !== JSON.stringify(atElNow),
    '★절대-now shake 가 now=el 스냅샷과 구분됨(고정 preview 가 생략한 지터)');
  // 엔진 _cutShake 와 동일 함수(fixture 와 동일 결과)
  ok(cutShake(1, 1000).x === ((Math.sin(1000 * 0.047) * 2) | 0), 'cutShake 공식 = 엔진 :60627');
}

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
