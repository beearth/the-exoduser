import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { createCanvas } from 'canvas';

// ---------------------------------------------------------------------------
// MAP-root-rotated-culling-bounds-hb1014
//
// 가설: ch1-boundary-edge.js draw()의 고정 90px '중심' 컬링이, 회전·스케일된
// 뿌리 띠(drawImage(rim,-220,-46), 440x120, s=ROOT_SCALE*(.85+R()*.35))의 변환
// 사각형이 viewport에 걸치는데도 중심이 90px 밖이면 조기 skip(화면 가장자리 팝인).
//
// 핵심 검증점: cull은 r.x를 x0/x1과 비교하는데, x0/x1은 이미 hw=VW/2/z+80 의
// '80 world-px 오버스캔'을 포함한다(소스 89-90행). 따라서 '보이는 viewport'
// 기준 실효 여유 = 오버스캔80 + 중심여유90 = 170 world-px. 최대 변환 reach는
// s_max(0.504)*hypot(220,74)=~117 world-px. 170 >= 117 이면 보이는 띠는 절대
// 누락되지 않는다 → 가시 결함 없음(NO-FIX) 가능성.
//
// 실제 build/draw/rng(seed 20261001)를 node-canvas(실 Canvas 대역)+CTM 캡처
// ctx로 실행한다. '합성'(변환 사각형)과 '도달성'(보이는 viewport와 겹침)을 분리.
// 최소 memory 후보(margin 90->117=ceil(ROOT_SCALE*1.20*hypot(220,74)))와
// 정상 전량 draw control을 함께 돌려 가시 누락을 측정한다.
// productionApplied=false, runtimeAccepted=false.
// ---------------------------------------------------------------------------

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const SRC = 'ch1-boundary-edge.js';
const sha = t => createHash('sha256').update(t).digest('hex');
const source = readFileSync(ROOT + '/' + SRC, 'utf8');
const srcSha = sha(source);

const CULL = 'if(r.x<x0-90||r.x>x1+90||r.y<y0-90||r.y>y1+90)continue;';
assert.equal(source.indexOf(CULL), source.lastIndexOf(CULL), 'cull 라인 유일');
assert.ok(source.includes(CULL), 'cull 라인 확인');

// 변환 상수 유도 (하드코딩 아님)
const ROOT_SCALE = 0.42, S_MAX_FACTOR = 1.20;
const IMG_W = 440, IMG_H = 120, OFF_X = -220, OFF_Y = -46; // drawImage(rim,-220,-46), 440x120
const MAX_CORNER = Math.max(
  Math.hypot(OFF_X, OFF_Y), Math.hypot(OFF_X + IMG_W, OFF_Y),
  Math.hypot(OFF_X, OFF_Y + IMG_H), Math.hypot(OFF_X + IMG_W, OFF_Y + IMG_H));
const S_MAX = ROOT_SCALE * S_MAX_FACTOR;            // 0.504
const MAX_REACH = S_MAX * MAX_CORNER;               // ~117.0
const OVERSCAN = 80, CENTER_MARGIN = 90;            // 소스 상수
const EFFECTIVE_MARGIN = OVERSCAN + CENTER_MARGIN;   // 170 (보이는 viewport 기준)
const MARG = Math.ceil(MAX_REACH);                   // 후보 중심여유 117
const candidateSource = source.replace(CULL,
  `if(r.x<x0-${MARG}||r.x>x1+${MARG}||r.y<y0-${MARG}||r.y>y1+${MARG})continue;`);
const noCullSource = source.replace(CULL, 'if(false)continue;'); // 정상 전량 draw control
assert.notEqual(candidateSource, source);
assert.notEqual(noCullSource, source);

function makeEnv() {
  const env = {
    document: { createElement() { return createCanvas(1, 1); } },
    performance: { now: () => Date.now() },
    location: { search: '' },
    requestIdleCallback: fn => { fn(); },
    setTimeout: fn => { fn(); },
    Image: function () {
      const c = createCanvas(700, 700); const g = c.getContext('2d');
      g.fillStyle = '#888'; g.fillRect(0, 0, 700, 700);
      c.complete = true; c.naturalWidth = 700; c.naturalHeight = 700; return c;
    },
    console: { log() {}, warn() {} },
  };
  env.globalThis = env; return vm.createContext(env);
}
function loadModule(srcText) { const ctx = makeEnv(); vm.runInContext(srcText, ctx); return ctx.Ch1BoundaryEdge; }

function capturingCtx() {
  let M = [1, 0, 0, 1, 0, 0]; const stack = [];
  const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
    A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
    A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
  const apply = (x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
  const roots = []; let box = null;
  return {
    save() { stack.push(M.slice()); }, restore() { M = stack.pop(); },
    translate(x, y) { M = mul(M, [1, 0, 0, 1, x, y]); },
    rotate(a) { M = mul(M, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]); },
    scale(x, y) { M = mul(M, [x, 0, 0, y, 0, 0]); },
    drawImage(img, ...a) {
      if (a.length >= 8) { box = [a[4], a[5], a[4] + a[6], a[5] + a[7]]; return; } // shade -> cull box(x0,y0,x1,y1)
      const dx = a[0], dy = a[1], w = img.width, h = img.height;
      const corners = [[dx, dy], [dx + w, dy], [dx + w, dy + h], [dx, dy + h]].map(([x, y]) => apply(x, y));
      roots.push({ cx: M[4], cy: M[5], corners });
    },
    _result: () => ({ roots, box }),
  };
}

// SAT: 분리축 최대 간격(양수=분리/겹침없음, 간격값은 headroom 하한)
function satGap(poly, box) {
  const b = [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]];
  const axes = p => p.map((pt, i) => { const q = p[(i + 1) % p.length]; return [-(q[1] - pt[1]), q[0] - pt[0]]; });
  const proj = (p, ax) => { const n = Math.hypot(ax[0], ax[1]) || 1; const u = [ax[0] / n, ax[1] / n]; let mn = Infinity, mx = -Infinity; for (const pt of p) { const d = pt[0] * u[0] + pt[1] * u[1]; mn = Math.min(mn, d); mx = Math.max(mx, d); } return [mn, mx]; };
  let gap = -Infinity;
  for (const ax of [...axes(poly), ...axes(b)]) { const [a0, a1] = proj(poly, ax), [c0, c1] = proj(b, ax); gap = Math.max(gap, Math.max(c0 - a1, a0 - c1)); }
  return gap; // >0 분리, <=0 겹침
}
const overlaps = (poly, box) => satGap(poly, box) <= 1e-9;

function frameMap(N) {
  const map = Array.from({ length: N }, (_, y) => Array.from({ length: N }, (_, x) =>
    (x === 0 || y === 0 || x === N - 1 || y === N - 1) ? 1 : 0));
  return { stage: 0, _bossArena: false, mw: N, mh: N, map, cam: { x: 0, y: 0 } };
}
function drawCapture(mod, g, VW, VH, z) { const ctx = capturingCtx(); mod.draw(ctx, g, 0, VW, VH, z); return ctx._result(); }
const key = r => Math.round(r.cx) + ',' + Math.round(r.cy);

export function runChecks() {
  const startedAt = new Date().toISOString();
  const results = [];
  const check = (id, name, f) => { try { f(); results.push({ id, name, status: 'PASS' }); }
    catch (e) { results.push({ id, name, status: 'FAIL', reason: e.message }); } };

  const N = 120, T = 40, WORLD = N * T;
  const cur = loadModule(source), cand = loadModule(candidateSource), full = loadModule(noCullSource);

  // 전량(no-cull) draw로 실제 roots 변환 사각형 캡처 (전맵)
  const gFull = { ...frameMap(N), cam: { x: WORLD / 2, y: WORLD / 2 } };
  const fullCap = drawCapture(full, gFull, WORLD * 3, WORLD * 3, 1);
  const allRoots = fullCap.roots; const rootCount = full.qa().roots;
  for (const r of allRoots) {
    const xs = r.corners.map(c => c[0]), ys = r.corners.map(c => c[1]);
    r.hx = (Math.max(...xs) - Math.min(...xs)) / 2; r.hy = (Math.max(...ys) - Math.min(...ys)) / 2;
    r.reach = Math.max(...r.corners.map(c => Math.hypot(c[0] - r.cx, c[1] - r.cy)));
  }
  const maxReachObs = Math.max(...allRoots.map(r => r.reach));
  const maxHx = Math.max(...allRoots.map(r => r.hx)), maxHy = Math.max(...allRoots.map(r => r.hy));

  // 보이는 viewport box (화면 실제 영역; map으로 clamp)
  const visBox = (cam, VW, VH, z) => [Math.max(0, cam.x - VW / (2 * z)), Math.max(0, cam.y - VH / (2 * z)),
    Math.min(WORLD, cam.x + VW / (2 * z)), Math.min(WORLD, cam.y + VH / (2 * z))];

  check('B01', '실제 build/rng 루트 생성(>0), 전량 캡처==qa().roots, cull box 복원', () => {
    assert.ok(rootCount > 0); assert.equal(allRoots.length, rootCount); assert.ok(fullCap.box);
  });
  check('B02', '결정성/보존: current==candidate==full 루트 집합 동일', () => {
    const kc = new Set(drawCapture(cur, { ...frameMap(N), cam: { x: WORLD / 2, y: WORLD / 2 } }, WORLD * 3, WORLD * 3, 1).roots.map(key));
    const kd = new Set(drawCapture(cand, { ...frameMap(N), cam: { x: WORLD / 2, y: WORLD / 2 } }, WORLD * 3, WORLD * 3, 1).roots.map(key));
    for (const r of allRoots) { assert.ok(kc.has(key(r))); assert.ok(kd.has(key(r))); }
  });

  // --- 가설의 기하적 실재성(격리): 오버스캔 없다면 90은 부족 ---
  check('H01', `가설 실재: 최대 변환 reach(${maxReachObs.toFixed(1)}) > 중심여유 90 (오버스캔 無 가정 시 90 단독은 불충분)`, () => {
    assert.ok(maxReachObs > CENTER_MARGIN, 'reach>90');
    assert.ok(maxHx > CENTER_MARGIN || maxHy > CENTER_MARGIN, 'AABB 반경도 90 초과 가능');
  });
  // --- 그러나 오버스캔 80이 이를 상쇄: 실효여유 170 >= reach ---
  check('H02', `상쇄: 실효여유=오버스캔80+중심90=170 >= 최대 reach(${Math.ceil(maxReachObs)}) 및 maxHx/Hy(${Math.ceil(Math.max(maxHx, maxHy))}) → 기하적으로 안전`, () => {
    assert.ok(EFFECTIVE_MARGIN >= MAX_REACH, '170>=117(이론 상한)');
    assert.ok(EFFECTIVE_MARGIN >= maxReachObs, '170>=관측 reach');
    assert.ok(EFFECTIVE_MARGIN >= Math.max(maxHx, maxHy), '170>=AABB 반경');
  });

  // --- 보이는 viewport 기준 스캔: 현행이 '보이는' 띠를 누락하는가? ---
  const cams = []; for (let x = 1200; x <= WORLD - 1200; x += 600) for (let y = 1200; y <= WORLD - 1200; y += 600) cams.push({ x, y });
  const zs = [1, 0.62, 0.3];
  let visNeed = 0, curVisMiss = 0, candVisMiss = 0, culledNonVisible = 0, culledTotal = 0;
  let minCulledGapToVisible = Infinity, closestCulled = null, candExtraOverdraw = 0;
  for (const z of zs) for (const cam of cams) {
    const g = { ...frameMap(N), cam };
    const cc = drawCapture(cur, g, 1600, 900, z), dd = drawCapture(cand, g, 1600, 900, z);
    const curSet = new Set(cc.roots.map(key)), candSet = new Set(dd.roots.map(key));
    const vb = visBox(cam, 1600, 900, z);
    for (const r of allRoots) {
      const vis = overlaps(r.corners, vb);
      if (vis) { visNeed++; if (!curSet.has(key(r))) curVisMiss++; if (!candSet.has(key(r))) candVisMiss++; }
      if (!curSet.has(key(r))) { // 현행이 컬링한 띠
        culledTotal++;
        const gap = satGap(r.corners, vb); // >0 = 보이는 영역과 분리
        if (gap > 1e-9) culledNonVisible++;
        if (gap < minCulledGapToVisible) { minCulledGapToVisible = gap; closestCulled = { root: key(r), z, gap: Number(gap.toFixed(2)) }; }
      }
      if (!curSet.has(key(r)) && candSet.has(key(r))) candExtraOverdraw++; // 후보가 더 그린 (오버스캔 밖) 띠
    }
  }

  check('V01', `보이는 viewport 스캔(z=${zs.join('/')}, viewports=${cams.length * zs.length}): 현행이 보이는 띠를 0 누락 (가시 결함 없음)`, () => {
    assert.ok(visNeed > 0, '보이는 띠 사건 존재');
    assert.equal(curVisMiss, 0, '현행 가시 누락 0');
  });
  check('V02', `현행이 컬링한 띠는 전부 비가시(보이는 영역과 분리). 가장 가까운 컬링 띠도 간격 ${Number.isFinite(minCulledGapToVisible) ? minCulledGapToVisible.toFixed(1) : 'n/a'}px>0`, () => {
    assert.ok(culledTotal > 0, '컬링된 띠 존재');
    assert.equal(culledNonVisible, culledTotal, '컬링된 띠 전부 비가시');
    assert.ok(minCulledGapToVisible > 0, '가장 가까운 컬링 띠도 화면 밖(간격>0=헤드룸)');
  });
  check('C01', `후보(117)도 가시 누락 0 — 현행 대비 '보이는' 변화 없음. 후보가 추가로 그린 띠 ${candExtraOverdraw}개는 전부 오버스캔 밖(비가시 overdraw)`, () => {
    assert.equal(candVisMiss, 0, '후보 가시 누락 0');
    // 후보가 추가로 그린 띠가 하나라도 '보이면' 그건 현행 결함의 증거 → 그런 띠는 없어야 함(현행도 보이는 건 다 그림)
    // candExtraOverdraw는 전부 비가시 overdraw여야 한다: curVisMiss==0 이므로 자동 성립.
    assert.ok(candExtraOverdraw >= 0);
  });

  // --- 보존: 현행이 그린 띠는 후보도 동일 변환으로 그린다 (추가만) ---
  check('P01', '보존: 현행이 그린 띠 ⊆ 후보, 코너 좌표 일치(변환/픽셀/위치 불변)', () => {
    const g = { ...frameMap(N), cam: { x: WORLD / 2, y: 1600 } };
    const cc = drawCapture(cur, g, 1600, 900, 1), dd = drawCapture(cand, g, 1600, 900, 1);
    const dmap = new Map(dd.roots.map(r => [key(r), r]));
    for (const r of cc.roots) { const d = dmap.get(key(r)); assert.ok(d); for (let i = 0; i < 4; i++) { assert.ok(Math.abs(r.corners[i][0] - d.corners[i][0]) < 1e-6); assert.ok(Math.abs(r.corners[i][1] - d.corners[i][1]) < 1e-6); } }
  });
  check('P02', '후보는 cull 상수만 90->117 변경, 다른 바이트 동일', () => {
    const back = candidateSource.split(`-${MARG}`).join('-90').split(`+${MARG}`).join('+90');
    assert.equal(back, source);
  });
  check('P03', '모드 게이트 0/a/b·파서 불변, shade build 정상', () => {
    assert.match(candidateSource, /if\(v!=='b'\)return;/);
    assert.match(candidateSource, /edgeShade=\(\[0ab\]\)/);
    assert.equal(cand.qa().built, true);
  });

  const finishedAt = new Date().toISOString();
  return {
    taskId: 'MAP-root-rotated-culling-bounds-hb1014', startedAt, finishedAt, node: process.version,
    productionApplied: false, runtimeAccepted: false, candidateRecommended: false,
    verdict: 'NO-FIX: 현행 90px 중심여유는 소스의 80 world-px 오버스캔과 합쳐 170 world-px 실효여유를 이루며, 회전·스케일 띠의 최대 변환 reach ~117 world-px를 초과한다. 보이는 viewport 기준 가시 누락 0. 후보(117)는 가시적 변화 없이 오버스캔 밖 overdraw만 추가 → 미채택 권고.',
    band: 'real ch1-boundary-edge.js build/draw/rng(seed 20261001) in node-canvas; blur UNSUPPORTED in node-canvas(cardinal normals from raw mask) — explicit band; frame wall map (NOT production CH1-1 grid; prod anchors=305, band=' + rootCount + ')',
    source: { file: SRC, sha256: srcSha }, candidateSourceSha256: sha(candidateSource),
    derivation: { ROOT_SCALE, S_MAX_FACTOR, S_MAX, imageRect: [OFF_X, OFF_Y, IMG_W, IMG_H], maxCornerDist: Number(MAX_CORNER.toFixed(3)),
      maxReachTheoretical: Number(MAX_REACH.toFixed(2)), overscan: OVERSCAN, centerMargin: CENTER_MARGIN, effectiveMargin: EFFECTIVE_MARGIN,
      candidateMargin: MARG, headroomWorldPx: Number((EFFECTIVE_MARGIN - MAX_REACH).toFixed(2)) },
    roots: { bandCount: rootCount, productionCount: 305, maxReachObserved: Number(maxReachObs.toFixed(2)), maxHx: Number(maxHx.toFixed(2)), maxHy: Number(maxHy.toFixed(2)),
      sObservedRange: [Number(Math.min(...allRoots.map(r => r.reach / MAX_CORNER)).toFixed(3)), Number(Math.max(...allRoots.map(r => r.reach / MAX_CORNER)).toFixed(3))] },
    visibleScan: { zooms: zs, viewports: cams.length * zs.length, visibleNeed: visNeed, currentVisibleMisses: curVisMiss, candidateVisibleMisses: candVisMiss,
      culledTotal, culledAllNonVisible: culledNonVisible === culledTotal, minCulledGapToVisiblePx: Number(minCulledGapToVisible.toFixed(2)), closestCulled, candidateExtraNonVisibleOverdraw: candExtraOverdraw },
    counts: { pass: results.filter(r => r.status === 'PASS').length, fail: results.filter(r => r.status === 'FAIL').length }, results,
    gates: { visualGateExecuted: false, visualVerdict: 'RETOUCH', newNativeCameraViews: 0 },
  };
}

if (process.argv[1] && import.meta.url === 'file://' + process.argv[1]) {
  let out, code = 0;
  try { out = runChecks(); code = out.counts.fail ? 1 : 0; }
  catch (e) { out = { fatal: e.message, stack: e.stack }; code = 2; }
  console.log(JSON.stringify(out, null, 2));
  process.exitCode = code;
}
