// Dense Combat Bottleneck Attribution — GPU fill/overdraw vs CPU neighbor-density/spatial-query.
// 최적화 아님. 인과 분리만. game.html 무수정 — 계측은 전부 런타임 래핑(page.evaluate).
// 실행: node tools/verify_bottleneck_attribution.mjs   (HEADED 창이 뜬다)
//
// 설계:
//  1) deterministic scene: seeded Math.random + 고정 플레이어/카메라 + 결정론적 formation 스폰 + 고정 warm-up
//  2) GPU hypothesis: N=500 고정 씬(_btFramePause로 sim 정지) + resScale 1.00/0.75/0.50 → D의 픽셀 반응
//  3) CPU hypothesis: N=100~500 스윕 + shQuery 호출/후보 카운터(런타임 래핑) → U·후보 초선형 여부
//  4) 판정: GPU dominant / CPU spatial-query dominant / mixed / evidence insufficient
import { chromium } from 'playwright';

const SEED = 1337;
const WARM = 1600, REC = 1600, SETTLE = 700;

const pct = (arr, p) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p / 100 * a.length))]; };
const mean = (arr) => arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;

let browser;
try {
  browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // (1) 결정론: 게임 로드 전에 Math.random을 시드 PRNG로 교체
  await page.addInitScript((seed) => {
    let s = seed >>> 0;
    Math.random = function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }, SEED);

  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1', { waitUntil: 'commit', timeout: 15000 });
  const ready = await page.waitForFunction(
    () => (typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function' && typeof ens !== 'undefined' && Array.isArray(ens) && typeof _prof !== 'undefined' && typeof shQuery === 'function' && typeof update === 'function' && typeof draw === 'function' && typeof rz === 'function'),
    null, { timeout: 30000, polling: 200 }
  ).then(() => true).catch(() => false);
  if (!ready) throw new Error('전역 준비 실패: ' + JSON.stringify({ errors }));

  await page.waitForTimeout(7000); // 부트 시퀀스 안착

  // (2) 씬 고정 + 계측 설치 (런타임 래핑, game.html 무수정)
  const setup = await page.evaluate(() => {
    try {
      // 컷신/활성화
      G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {}
      if (!(G.mw > 0)) initStage(G.stage || 3);
      G.on = true;
      if (window._btBoss) window._btBoss._btFrozen = true;
      // 플레이어 고정(god + 정지). 카메라는 플레이어 추종 → 고정.
      window.__forceOn = () => { try { G._cutsceneDone = true; G.on = true; if (window._btBoss) window._btBoss._btFrozen = true; P.vx = 0; P.vy = 0; } catch (e) {} };

      // 계측 recorder (프레임당 U/D/T + shQuery 호출/후보)
      window.__rec = { frames: [], _uAcc: 0, _lastDraw: 0, _shCalls: 0, _shCand: 0, recording: false };
      if (!window.__updWrapped) { const _o = update; update = function () { const t = performance.now(); const r = _o.apply(this, arguments); window.__rec._uAcc += performance.now() - t; return r; }; window.__updWrapped = true; }
      if (!window.__shqWrapped) { const _o = shQuery; shQuery = function (x, y, r) { const res = _o(x, y, r); const R = window.__rec; R._shCalls++; R._shCand += res.length; return res; }; window.__shqWrapped = true; }
      if (!window.__drwWrapped) { const _o = draw; draw = function () { const t0 = performance.now(); const r = _o.apply(this, arguments); const t1 = performance.now(); const R = window.__rec; const T = R._lastDraw ? (t1 - R._lastDraw) : 0; R._lastDraw = t1; if (R.recording) { let a = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) a++; R.frames.push({ T, U: R._uAcc, D: t1 - t0, sc: R._shCalls, cd: R._shCand, al: a }); } R._uAcc = 0; R._shCalls = 0; R._shCand = 0; return r; }; window.__drwWrapped = true; }

      // 결정론적 formation 스폰 (RNG 미사용 배치)
      window.__spawnFormation = (N) => {
        for (let i = ens.length - 1; i >= 0; i--) { if (ens[i] && !ens[i].ib) ens.splice(i, 1); }
        const cx = P.x, cy = P.y; let placed = 0, ring = 1;
        while (placed < N && ring < 300) {
          const r = 70 + ring * 26, per = Math.max(6, Math.floor(2 * Math.PI * r / 34));
          for (let k = 0; k < per && placed < N; k++) {
            const ang = (k / per) * Math.PI * 2 + ring * 0.3;
            const e = mkEn(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, G.stage, 6, false, (placed % 5), -1);
            if (e) { e.alive = true; ens.push(e); placed++; }
          }
          ring++;
        }
        return placed;
      };
      window.__aliveCount = () => { let n = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) n++; return n; };
      window.__recStart = () => { window.__rec.frames = []; window.__rec.recording = true; };
      window.__recStop = () => { window.__rec.recording = false; return window.__rec.frames; };
      window.__setRes = (r) => { OPT.resScale = r; rz(); return { w: C.width, h: C.height }; };
      window.__pause = (v) => { window._btFramePause = !!v; };

      // WebGL2 timer query 가용성
      let timer = 'no GL';
      try { const g = (typeof GL !== 'undefined' && GL) ? GL : null; if (g) { const e2 = g.getExtension('EXT_disjoint_timer_query_webgl2'); const e1 = g.getExtension('EXT_disjoint_timer_query'); timer = e2 ? 'EXT_disjoint_timer_query_webgl2' : (e1 ? 'EXT_disjoint_timer_query' : 'unavailable'); } } catch (e) { timer = 'err:' + e.message; }
      return { ok: true, timer, canvas: { w: C.width, h: C.height }, resScale: OPT.resScale };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  if (!setup.ok) throw new Error('setup 실패: ' + JSON.stringify(setup));
  console.log('setup:', JSON.stringify(setup));

  // 계측 self-check: 짧게 녹화해 U>0, sc>0(sim 활성) 확인
  await page.evaluate(() => { window.__forceOn(); window.__pause(false); window.__spawnFormation(300); window.__recStart(); });
  await page.waitForTimeout(1200);
  const chk = await page.evaluate(() => { const f = window.__recStop(); return { n: f.length, U: f.reduce((s, x) => s + x.U, 0) / (f.length || 1), sc: f.reduce((s, x) => s + x.sc, 0) / (f.length || 1) }; });
  console.log('instrumentation self-check (U>0 & sc>0 필요):', JSON.stringify(chk));
  const instrOK = chk.n > 5 && chk.U > 0 && chk.sc > 0;
  console.log('  → 계측 ' + (instrOK ? 'OK' : '실패(래핑 미작동)'));

  async function record(seconds) {
    await page.evaluate(() => window.__recStart());
    const steps = Math.ceil(seconds * 1000 / 250);
    for (let i = 0; i < steps; i++) { await page.waitForTimeout(250); await page.evaluate(() => window.__forceOn()); }
    const f = await page.evaluate(() => window.__recStop());
    const T = f.map(x => x.T).filter(x => x > 0), U = f.map(x => x.U), D = f.map(x => x.D);
    const al = f.length ? f[f.length - 1].al : 0;
    return {
      frames: f.length, alive: al,
      meanT: +mean(T).toFixed(2), p50: +pct(T, 50).toFixed(2), p95: +pct(T, 95).toFixed(2), p99: +pct(T, 99).toFixed(2),
      meanU: +mean(U).toFixed(2), meanD: +mean(D).toFixed(2),
      hitch16: T.filter(x => x > 16.7).length, hitch34: T.filter(x => x > 34).length,
      shCallsF: +mean(f.map(x => x.sc)).toFixed(0), shCandF: +mean(f.map(x => x.cd)).toFixed(0),
    };
  }

  // ── (A) GPU hypothesis: N=500 고정 씬, resScale 스윕 ──
  console.log('\n=== (A) GPU hypothesis — N=500 frozen scene, resScale sweep ===');
  await page.evaluate(() => { window.__forceOn(); window.__pause(false); window.__setRes(100); window.__spawnFormation(500); });
  await page.waitForTimeout(WARM); // 팩킹 안착
  await page.evaluate(() => window.__pause(true)); // 씬 정지 → draw만
  const gpuRows = [];
  for (const res of [100, 75, 50]) {
    const dim = await page.evaluate((r) => window.__setRes(r), res);
    await page.waitForTimeout(SETTLE);
    const r = await record(REC);
    gpuRows.push({ res, px: dim.w * dim.h, canvas: dim.w + 'x' + dim.h, ...r });
    console.log('  [A] res=' + res + '% ' + dim.w + 'x' + dim.h + ' meanD=' + r.meanD + ' meanT=' + r.meanT + ' frames=' + r.frames);
  }
  console.log('resScale | canvas       | Mpx  | meanD | meanT | p95   | p99   | (U는 pause라 0 기대)');
  for (const r of gpuRows) console.log(
    String(r.res).padStart(7) + '% | ' + r.canvas.padEnd(12) + ' | ' + (r.px / 1e6).toFixed(2).padStart(4) + ' | ' +
    r.meanD.toFixed(2).padStart(5) + ' | ' + r.meanT.toFixed(2).padStart(5) + ' | ' + r.p95.toFixed(2).padStart(5) + ' | ' + r.p99.toFixed(2).padStart(5) + ' | U=' + r.meanU);

  // ── (B) CPU hypothesis: N 스윕, sim 활성 ──
  console.log('\n=== (B) CPU hypothesis — N sweep, sim active, resScale=100 ===');
  await page.evaluate(() => { window.__pause(false); window.__setRes(100); window.__forceOn(); });
  const cpuRows = [];
  for (const N of [100, 200, 300, 400, 500]) {
    await page.evaluate((n) => { window.__forceOn(); window.__spawnFormation(n); }, N);
    await page.waitForTimeout(WARM);
    const r = await record(REC);
    cpuRows.push({ N, ...r });
    console.log('  [B] N=' + N + ' alive=' + r.alive + ' meanU=' + r.meanU + ' shCand/f=' + r.shCandF + ' frames=' + r.frames);
  }
  console.log('  N  | alive | meanU | meanD | meanT | p95   | p99   | shCalls/f | shCand/f | cand/alive');
  for (const r of cpuRows) console.log(
    String(r.N).padStart(4) + ' | ' + String(r.alive).padStart(5) + ' | ' +
    r.meanU.toFixed(2).padStart(5) + ' | ' + r.meanD.toFixed(2).padStart(5) + ' | ' + r.meanT.toFixed(2).padStart(5) + ' | ' +
    r.p95.toFixed(2).padStart(5) + ' | ' + r.p99.toFixed(2).padStart(5) + ' | ' +
    String(r.shCallsF).padStart(9) + ' | ' + String(r.shCandF).padStart(8) + ' | ' + (r.shCandF / Math.max(1, r.alive)).toFixed(1).padStart(6));

  // ── (C) 재현성 체크: N=500 두 번 ──
  console.log('\n=== (C) reproducibility — N=500 repeat ===');
  await page.evaluate(() => { window.__forceOn(); window.__spawnFormation(500); });
  await page.waitForTimeout(WARM);
  const rep = await record(REC);
  const base = cpuRows[cpuRows.length - 1];
  console.log('  N=500 run1: meanU=' + base.meanU + ' meanD=' + base.meanD + ' shCand/f=' + base.shCandF + ' alive=' + base.alive);
  console.log('  N=500 run2: meanU=' + rep.meanU + ' meanD=' + rep.meanD + ' shCand/f=' + rep.shCandF + ' alive=' + rep.alive);

  // ── 분석 요약(수치만; 판정은 사람이 해석) ──
  console.log('\n=== 분석 신호 ===');
  const g100 = gpuRows.find(r => r.res === 100), g50 = gpuRows.find(r => r.res === 50);
  if (g100 && g50 && g100.meanD > 0) {
    const pxRatio = g50.px / g100.px, dRatio = g50.meanD / g100.meanD;
    console.log('GPU: 픽셀 ' + (pxRatio * 100).toFixed(0) + '%로 줄일 때 meanD ' + (dRatio * 100).toFixed(0) + '% (' + g100.meanD + '→' + g50.meanD + 'ms). D가 픽셀에 강반응이면 fill-bound 지지, 약반응이면 기각.');
  }
  const c1 = cpuRows[0], c5 = cpuRows[cpuRows.length - 1];
  if (c1 && c5) {
    const nR = c5.N / c1.N, uR = c5.meanU / Math.max(0.01, c1.meanU), candR = c5.shCandF / Math.max(1, c1.shCandF);
    console.log('CPU: N ' + nR.toFixed(1) + '배 → meanU ' + uR.toFixed(1) + '배, shCand/f ' + candR.toFixed(1) + '배. U·cand가 N보다 초선형(>N배)이면 spatial-query 밀도 비용 지지.');
    console.log('     cand/alive 추세(밀도): ' + cpuRows.map(r => (r.shCandF / Math.max(1, r.alive)).toFixed(1)).join(' → ') + ' (증가=밀집 초선형)');
  }
  console.log('\ntimer-query: ' + setup.timer);
  console.log('instrumentation: ' + (instrOK ? 'OK' : 'FAILED'));
  if (errors.length) console.log('pageerror(' + errors.length + '): ' + errors.slice(0, 3).join(' | '));
} finally {
  if (browser) await browser.close();
}
