// native-cover-source-validation — ART 후속검수 (2026-10-02)
// 목적: 양쪽 실제 renderer(game.html / game-easy-test.html)에서 cover+줌+레터박스
//       변환 블록의 "원문 바이트"를 추출·실행하여 drawImage 좌표와 영역보존을 뽑고,
//       완전히 분리된 독립 기하식과 대조한다.
// 성격: 읽기전용. 게임 실행·카메라/자막 시각 인수·이미지 생성/변환/채택·Git쓰기 전부 0.
//       기존 project-teams/ART 19검사(정체·계약)는 재실행하지 않는다(중복0).
//       실제 renderer 원문(if(ln.img){...}) 전체를 구동하지 않고, 자립적 기하 라인만
//       파일에서 바이트 그대로 잘라 실행하므로 "실런타임 카메라/자막"은 근거로 세지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => fs.readFileSync(path.join(ROOT, p));

// ── 최소 fixture: 실제 JPEG SOF 마커에서 natural 크기만 읽음(디코드/변환 없음) ──
function jpegSize(buf) {
  let i = 2; // SOI
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const h = buf.readUInt16BE(i + 5), w = buf.readUInt16BE(i + 7);
      return { w, h };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('SOF marker not found');
}

// ── 실제 source 원문 라인 추출(바이트 그대로) ──
// 자립적 기하 라인만 잘라낸다. 실패 시 즉시 throw → 원문 변경을 소리내어 감지.
function sliceLines(src, startNeedle, endNeedle) {
  const lines = src.split('\n');
  const s = lines.findIndex(l => l.includes(startNeedle));
  assert.ok(s >= 0, `start not found: ${startNeedle}`);
  const e = lines.findIndex((l, i) => i >= s && l.includes(endNeedle));
  assert.ok(e >= 0, `end not found: ${endNeedle}`);
  return { text: lines.slice(s, e + 1).join('\n').trim(), startLine: s + 1, endLine: e + 1 };
}

function extractRenderer(file) {
  const buf = read(file);
  const src = buf.toString('utf8');
  // 레터박스 산식 (cw/ch/_lbX/_lbY)
  const lb = sliceLines(src, 'const _maxAR=16/9;', 'else if(_curAR<9/16)');
  // 카메라+cover draw 산식 (zoom/dx/dy/dw/dh), cx.translate/scale 포함
  const cam = sliceLines(src, 'const cam=ln.cam||{zs:1,ze:1};', 'else{dw=cw;dh=cw/imgR;dx=0;dy=(ch-dh)*.1}');
  // _ease 정의 원문
  const easeLine = src.split('\n').find(l => l.startsWith('const _ease='));
  assert.ok(easeLine, '_ease def not found');
  // _cutShake 정의 원문 (shake=0 → {x:0,y:0} 확인용으로 실제 함수 실행)
  const shakeLine = src.split('\n').find(l => l.includes('function _cutShake('));
  assert.ok(shakeLine, '_cutShake def not found');
  return { file, wholeSha: sha(buf), lb, cam, easeLine, shakeLine };
}

// ── 추출한 원문 라인을 구동하는 실행기 ──
// mock cx는 캔버스 CTM(이동/스케일)만 추적한다. 레터박스 translate(_lbX,_lbY)와
// clip 사각형은 정확히 stage 사각형과 일치하므로 가시분율 계산에서 상쇄 → stage-local
// 공간(0..cw,0..ch)에서 CTM을 identity로 시작한다.
function makeCtx() {
  const m = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  return {
    m,
    translate(tx, ty) { m.e += m.a * tx + m.c * ty; m.f += m.b * tx + m.d * ty; },
    scale(sx, sy) { m.a *= sx; m.b *= sx; m.c *= sy; m.d *= sy; },
    save() {}, restore() {},
    apply(px, py) { return { x: m.a * px + m.c * py + m.e, y: m.b * px + m.d * py + m.f }; },
  };
}

function runReal(rend, { fullW, fullH, cam, lineElapsed, dur, natW, natH }) {
  // eslint 아님: Function 바디에 원문 라인을 그대로 삽입
  const _ease = (0, eval)('(' + rend.easeLine.replace(/^const _ease=/, '').replace(/;$/, '') + ')');
  // _cutShake 실제 정의를 평가하여 사용(shake=0 경로 실행)
  const _cutShake = (0, eval)('(' + rend.shakeLine.replace(/^function _cutShake/, 'function') + ')');
  const cx = makeCtx();
  const img = { naturalWidth: natW, naturalHeight: natH };
  const ln = { cam, dur };
  const now = 0; // shake=0이라 now 무영향
  const body =
    rend.lb.text + '\n' +
    rend.cam.text + '\n' +
    'return {cw,ch,_lbX,_lbY,zoom,panX,panY,imgR,cR,dx,dy,dw,dh,ctm:cx.m,sk};';
  const fn = new Function('cx', '_ease', '_cutShake', 'img', 'ln', 'lineElapsed', 'now', '_fullW', '_fullH', body);
  const r = fn(cx, _ease, _cutShake, img, ln, lineElapsed, now, fullW, fullH);
  // 이미지 normalized (u,v) → stage-local 좌표 (실제 CTM 적용)
  r.mapUV = (u, v) => cx.apply(r.dx + u * r.dw, r.dy + v * r.dh);
  // draw-space(스테이지 좌표계) → stage-local (CTM 고정점 검증용)
  r.mapDraw = (x, y) => cx.apply(x, y);
  return r;
}

// ── 완전 분리된 독립 기하식 (원문 변수 재사용 0) ──
function independent({ fullW, fullH, natW, natH, zs, ze, et }) {
  const MAXAR = 16 / 9, MINAR = 9 / 16;
  const curAR = fullW / fullH;
  let cw = fullW, ch = fullH, lbX = 0, lbY = 0;
  if (curAR > MAXAR) { cw = Math.trunc(fullH * MAXAR); lbX = Math.trunc((fullW - cw) / 2); }
  else if (curAR < MINAR) { ch = Math.trunc(fullW / MINAR); lbY = Math.trunc((fullH - ch) / 2); }
  const zoom = zs + (ze - zs) * et;
  const imgR = natW / natH, cR = cw / ch;
  let dw, dh, dx, dy;
  if (imgR > cR) { dh = ch; dw = ch * imgR; dx = (cw - dw) / 2; dy = 0; }
  else { dw = cw; dh = cw / imgR; dx = 0; dy = (ch - dh) * 0.1; }
  // stage-local X_stage(u) = (dx+u*dw - cw/2)*zoom + cw/2
  const xStage = u => ((dx + u * dw) - cw / 2) * zoom + cw / 2;
  const yStage = v => ((dy + v * dh) - ch / 2) * zoom + ch / 2;
  // 가시 u,v 구간 (stage 창 0..cw, 0..ch 내부)
  const solveU = X => (X - cw / 2) / zoom + cw / 2 >= 0 ? ((X / zoom) ) : 0; // placeholder, 아래서 직접
  // u: xStage(u)=0 → u0 ; xStage(u)=cw → u1
  const u0raw = ((cw / 2 - (cw / 2) / zoom) - dx) / dw;
  const u1raw = ((cw / 2 + (cw / 2) / zoom) - dx) / dw;
  const v0raw = ((ch / 2 - (ch / 2) / zoom) - dy) / dh;
  const v1raw = ((ch / 2 + (ch / 2) / zoom) - dy) / dh;
  const cl = x => Math.min(1, Math.max(0, x));
  const uVis = cl(u1raw) - cl(u0raw);
  const vVis = cl(v1raw) - cl(v0raw);
  return {
    cw, ch, lbX, lbY, zoom, imgR, cR, dw, dh, dx, dy, xStage, yStage,
    cropLeft: cl(u0raw), cropRight: 1 - cl(u1raw),
    cropTop: cl(v0raw), cropBottom: 1 - cl(v1raw),
    uVis, vVis, areaVis: uVis * vVis,
  };
}

// ── 피사체 좌표(claude-provider result §2 인수, 재측정 아님: 시각추정 인용) ──
const SUBJECTS = [
  ['중앙 전사', 0.45, 0.35],
  ['청발 번개 마법사', 0.68, 0.37],
  ['좌하 녹색 마법사', 0.20, 0.68],
  ['중하 불화살 궁수', 0.62, 0.63],
  ['우측 번개 종단(악마)', 0.90, 0.33],
];

const renderers = [extractRenderer('game.html'), extractRenderer('game-easy-test.html')];

// 원문 동일성(두 renderer의 추출 라인 바이트 일치) 확인
const fragSame = {
  lbIdentical: renderers[0].lb.text === renderers[1].lb.text,
  camIdentical: renderers[0].cam.text === renderers[1].cam.text,
  easeIdentical: renderers[0].easeLine === renderers[1].easeLine,
  lbSha: sha(Buffer.from(renderers[0].lb.text)),
  camSha: sha(Buffer.from(renderers[0].cam.text)),
};

// 실제 이미지 natural 크기(최소 fixture)
const emg1 = jpegSize(read('assets/cutscene/warintro/emg1.jpg'));
const emg1Sha = sha(read('assets/cutscene/warintro/emg1.jpg'));
const cand2 = jpegSize(read('output/cutscene_remaster_20260930/warintro_candidates_unreviewed/emg1_candidate2_retry.jpg'));
const cand2Sha = sha(read('output/cutscene_remaster_20260930/warintro_candidates_unreviewed/emg1_candidate2_retry.jpg'));

// 시나리오: 창 비율 × 줌 단계
const WINDOWS = [
  ['16:9', 1920, 1080],
  ['16:10', 1920, 1200],
  ['32:9', 3840, 1080],
];
// wa26: zs1.08→ze1.04, ease 'out'; wa27: 1.04 고정. et: 시작0 / 종료1.
const ZOOMS = [
  ['wa26 시작', 1.08, 1.04, 0, 'out'],
  ['wa26 종료', 1.08, 1.04, 1, 'out'],
  ['wa27 고정', 1.04, 1.04, 1, 'linear'],
];

const IMAGES = [
  ['원본 emg1 (3:2)', emg1.w, emg1.h],
  ['후보2 (16:9)', cand2.w, cand2.h],
];

const results = [];
const table = [];
const counterexamples = [];
const checks = [];
function check(id, fn) { try { fn(); checks.push({ id, status: 'PASS' }); } catch (e) { checks.push({ id, status: 'FAIL', error: e.message }); } }

// _ease 'out' 실제값 교차검증
check('ease-out-matches-source', () => {
  const easeOut = (0, eval)('(' + renderers[0].easeLine.replace(/^const _ease=/, '').replace(/;$/, '') + ')').out;
  assert.ok(Math.abs(easeOut(0.5) - (1 - 0.25)) < 1e-12);
  assert.ok(Math.abs(easeOut(1) - 1) < 1e-12 && easeOut(0) === 0);
});

for (const [imgName, natW, natH] of IMAGES) {
  for (const [winName, fullW, fullH] of WINDOWS) {
    for (const [zName, zs, ze, tEnd, easeName] of ZOOMS) {
      // et: 실제 ease 함수로 계산 (dur는 임의, lineElapsed=tEnd*dur로 t=tEnd 유도)
      const dur = 1000, lineElapsed = tEnd * dur;
      const real = runReal(renderers[0], { fullW, fullH, cam: { zs, ze, ease: easeName }, lineElapsed, dur, natW, natH });
      const real2 = runReal(renderers[1], { fullW, fullH, cam: { zs, ze, ease: easeName }, lineElapsed, dur, natW, natH });
      const easeOut = (0, eval)('(' + renderers[0].easeLine.replace(/^const _ease=/, '').replace(/;$/, '') + ')');
      const et = (easeOut[easeName] || easeOut.linear)(lineElapsed / dur);
      const ind = independent({ fullW, fullH, natW, natH, zs, ze, et });

      // 독립식 ↔ 실제 추출 실행 결과 대조
      const key = `${imgName} | ${winName} | ${zName}`;
      check(`match:${key}`, () => {
        for (const k of ['cw', 'ch', 'zoom', 'imgR', 'dx', 'dy', 'dw', 'dh']) {
          assert.ok(Math.abs(real[k] - ind[k]) < 1e-6, `${k}: real ${real[k]} vs ind ${ind[k]}`);
        }
        assert.equal(real._lbX, ind.lbX); assert.equal(real._lbY, ind.lbY);
      });
      // 두 renderer(본편/쉬운판) 좌표 동일성
      check(`renderer-parity:${key}`, () => {
        for (const k of ['cw', 'ch', 'zoom', 'dx', 'dy', 'dw', 'dh']) assert.equal(real[k], real2[k], k);
      });
      // CTM 적용(실제 mock cx) ↔ 독립 closed-form 대조
      check(`ctm:${key}`, () => {
        // (1) 카메라 고정점: draw-space 스테이지 중심은 scale 후에도 자기 자신으로 매핑
        const pc = real.mapDraw(real.cw / 2, real.ch / 2);
        assert.ok(Math.abs(pc.x - ind.cw / 2) < 1e-6 && Math.abs(pc.y - ind.ch / 2) < 1e-6, `fixed point ${pc.x},${pc.y}`);
        // (2) 가시 좌경계: u0가 clamp 없이 (0,1)이면 그 지점 stage X는 0이어야(독립식과 일치)
        const u0raw = ((ind.cw / 2 - (ind.cw / 2) / ind.zoom) - ind.dx) / ind.dw;
        if (u0raw > 0 && u0raw < 1) {
          const pL = real.mapUV(u0raw, 0.5);
          assert.ok(Math.abs(pL.x - 0) < 1e-6, `left edge stageX=${pL.x}`);
        }
        // (3) 가시 상경계(세로): v0raw가 (0,1)이면 그 지점 stage Y는 0 (else 분기 비중심 오프셋 검증)
        const v0raw = ((ind.ch / 2 - (ind.ch / 2) / ind.zoom) - ind.dy) / ind.dh;
        if (v0raw > 0 && v0raw < 1) {
          const pT = real.mapUV(0.5, v0raw);
          assert.ok(Math.abs(pT.y - 0) < 1e-6, `top edge stageY=${pT.y}`);
        }
      });

      // 피사체 가시여부(실제 CTM로 매핑)
      const subjVis = SUBJECTS.map(([n, u, v]) => {
        const p = real.mapUV(u, v);
        const vis = p.x >= 0 && p.x <= real.cw && p.y >= 0 && p.y <= real.ch;
        if (!vis) counterexamples.push({ scenario: key, subject: n, uv: [u, v], stage: [Math.round(p.x), Math.round(p.y)], stageBox: [real.cw, real.ch] });
        return { n, vis, margin: Math.min(p.x, real.cw - p.x, p.y, real.ch - p.y) / Math.min(real.cw, real.ch) };
      });

      table.push({
        image: imgName, window: winName, zoom: zName, et: +et.toFixed(4),
        letterbox: (real._lbX || real._lbY) ? `띠 lbX=${real._lbX},lbY=${real._lbY}` : '없음',
        branch: ind.imgR > ind.cR ? 'if(좌우크롭)' : 'else(상하크롭)',
        cropPct: {
          left: +(ind.cropLeft * 100).toFixed(2), right: +(ind.cropRight * 100).toFixed(2),
          top: +(ind.cropTop * 100).toFixed(2), bottom: +(ind.cropBottom * 100).toFixed(2),
        },
        areaPreservedPct: +(ind.areaVis * 100).toFixed(2),
        drawImage: { dx: +real.dx.toFixed(1), dy: +real.dy.toFixed(1), dw: +real.dw.toFixed(1), dh: +real.dh.toFixed(1) },
        subjectsVisible: subjVis.every(s => s.vis),
        minSubjectMarginPct: +(Math.min(...subjVis.map(s => s.margin)) * 100).toFixed(2),
      });
    }
  }
}

const fail = checks.filter(c => c.status === 'FAIL');
const out = {
  task: 'native-cover-source-validation',
  executedAtUTC: new Date().toISOString(),
  verificationKind: 'SOURCE-EXTRACTED-GEOMETRY vs INDEPENDENT-FORMULA; 실런타임/시각 인수 아님',
  node: process.version,
  sourceSha: { 'game.html': renderers[0].wholeSha, 'game-easy-test.html': renderers[1].wholeSha, 'emg1.jpg': emg1Sha, 'emg1_candidate2.jpg': cand2Sha },
  extractedFragments: {
    'game.html': { lb: renderers[0].lb, cam: renderers[0].cam },
  },
  fragmentIdentity: fragSame,
  imageSizes: { emg1, cand2 },
  checkCount: checks.length, pass: checks.length - fail.length, fail: fail.length,
  checks,
  cropTable: table,
  counterexamples,
};
console.log(JSON.stringify(out, null, 2));
process.exitCode = fail.length ? 1 : 0;
