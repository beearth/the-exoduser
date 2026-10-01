/* wa24-preview 정적 자가검증 (Node, 브라우저 없음).
 * index.html 에 인라인한 변환 수식(letterbox/cutShake/fadeAlpha/canonicalFinal + 엔진 drawRect→frEngine)이
 * (a) root canonical predictFinalCrop(wa24-finalcrop.mjs) 와
 * (b) 실제 game.html draw 원문(UIUX fixture actualDraw) 과
 * 4비율×3시점에서 1e-11 일치하는지 확인한다. 미리보기 숫자 신뢰성 보증.
 *
 * 실행: node tools/team-followup-20261001/ART/wa24-preview/selfcheck.mjs
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { predictFinalCrop } from '../wa24-finalcrop.mjs';
import { actualDraw, line as gameLine } from '../../UIUX/art-support-source-fixture.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  PASS', m); } else { fail++; console.error('  FAIL', m); } };
const near = (a, b, e = 1e-11) => Math.abs(a - b) <= e;

// ── index.html 과 동일한 인라인 수식 (문자 그대로 복제) ──
const EASE = { linear: t => t, in: t => t * t, out: t => 1 - (1 - t) * (1 - t), inout: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 };
function cutShake(mag, t) { return mag ? { x: (Math.sin(t * 0.047) * mag * 2) | 0, y: (Math.cos(t * 0.053) * mag * 2) | 0 } : { x: 0, y: 0 }; }
function letterbox(fullW, fullH) {
  const maxAR = 16 / 9, curAR = fullW / fullH; let lbX = 0, lbY = 0, cw = fullW, ch = fullH;
  if (curAR > maxAR) { cw = ~~(fullH * maxAR); lbX = ~~((fullW - cw) / 2); }
  else if (curAR < 9 / 16) { ch = ~~(fullW / (9 / 16)); lbY = ~~((fullH - ch) / 2); }
  return { cw, ch, lbX, lbY };
}
// wa24 라인 (index.html LINES.wa24)
const L = { id: 'wa24', dur: 2400, cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 }, fade: { in: 400 } };
function canonicalFinal(fullW, fullH, el, natW, natH) {
  const clampF = v => Math.max(0, Math.min(1, v));
  const { cw, ch, lbX, lbY } = letterbox(fullW, fullH);
  const cam = L.cam; const progress = Math.min(1, el / (L.dur || 1));
  const eased = (EASE[cam.ease || 'linear'] || EASE.linear)(progress);
  const zoom = cam.zs + (cam.ze - cam.zs) * eased;
  const now = el; const shake = cutShake((L.vfx || {}).shake || 0, now);
  const tX = lbX + cw / 2 + shake.x - zoom * cw / 2, tY = lbY + ch / 2 + shake.y - zoom * ch / 2;
  const imageRatio = natW / natH, fitHeight = imageRatio > cw / ch;
  const dw = fitHeight ? ch * imageRatio : cw, dh = fitHeight ? ch : cw / imageRatio;
  const dx = fitHeight ? (cw - dw) / 2 : 0, dy = fitHeight ? 0 : (ch - dh) * 0.1;
  const drawRect = { x: tX + zoom * dx, y: tY + zoom * dy, w: zoom * dw, h: zoom * dh };
  return {
    left: clampF((lbX - drawRect.x) / drawRect.w), right: clampF((drawRect.x + drawRect.w - lbX - cw) / drawRect.w),
    top: clampF((lbY - drawRect.y) / drawRect.h), bottom: clampF((drawRect.y + drawRect.h - lbY - ch) / drawRect.h)
  };
}
// index.html 의 엔진 실측 drawRect→frEngine (클립 로컬좌표, lbX/lbY 차감 후 0 기준)
function engineFractions(fullW, fullH, el, natW, natH) {
  const { cw, ch } = letterbox(fullW, fullH);
  const cam = L.cam, t = Math.min(1, el / (L.dur || 1));
  const zoom = cam.zs + (cam.ze - cam.zs) * ((EASE[cam.ease || 'linear'] || EASE.linear)(t));
  const sk = cutShake((L.vfx || {}).shake || 0, el);
  const imgR = natW / natH, cR = cw / ch; let dw, dh, dx, dy;
  if (imgR > cR) { dh = ch; dw = ch * imgR; dx = (cw - dw) / 2; dy = 0; } else { dw = cw; dh = cw / imgR; dx = 0; dy = (ch - dh) * .1; }
  const drawRect = { x: (cw / 2 + sk.x) + zoom * (-cw / 2 + dx), y: (ch / 2 + sk.y) + zoom * (-ch / 2 + dy), w: zoom * dw, h: zoom * dh };
  const clampF = v => Math.max(0, Math.min(1, v));
  return {
    left: clampF((0 - drawRect.x) / drawRect.w), right: clampF((drawRect.x + drawRect.w - cw) / drawRect.w),
    top: clampF((0 - drawRect.y) / drawRect.h), bottom: clampF((drawRect.y + drawRect.h - ch) / drawRect.h)
  };
}

const RATIOS = [[1920, 1080], [2560, 1080], [1920, 1200], [1024, 768]];
const TIMES = [400, 1200, 2399];
const NAT = { w: 2560, h: 1440 };

console.log('\n[preview 수식] canonicalFinal / engineFractions ↔ predictFinalCrop ↔ actualDraw (4×3)');
let rows = 0;
for (const [fw, fh] of RATIOS) for (const el of TIMES) {
  const hCanon = canonicalFinal(fw, fh, el, NAT.w, NAT.h);
  const hEngine = engineFractions(fw, fh, el, NAT.w, NAT.h);
  const mod = predictFinalCrop({ fullW: fw, fullH: fh, lines: [gameLine], lineIdx: 0, lineStartMs: 0, now: el });
  const act = actualDraw(fw, fh, el);
  let good = true;
  for (const s of ['left', 'right', 'top', 'bottom']) {
    good = good && near(hCanon[s], mod.fractions[s]) && near(hEngine[s], act.fractions[s]) && near(hCanon[s], act.fractions[s]);
  }
  ok(good, `${fw}x${fh} @${el}ms: preview 수식 == canonical == 실엔진 draw (1e-11)`);
  rows++;
}
ok(rows === 12, `12행(4비율×3시점) (got ${rows})`);

console.log(`\n=== 결과: ${pass} PASS / ${fail} FAIL ===`);
process.exit(fail ? 1 : 0);
