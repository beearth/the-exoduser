// Dense Combat Bottleneck Attribution — GPU fill/overdraw vs CPU neighbor-density/spatial-query.
// 최적화 아님. 인과 분리만. game.html 무수정 — 계측/씬제어 전부 런타임 래핑(page.evaluate).
// 실행: node tools/verify_bottleneck_attribution.mjs   (HEADED 창)
//
// deterministic scene:
//  - seeded Math.random (addInitScript)
//  - bosstest=3 테스트베드 setup 완료까지 대기(3.8s) 후 스폰 (안 그러면 ens 리셋으로 전멸)
//  - 결정론적 formation 스폰(RNG 미사용) + 플레이어 결정론적 궤도(프레임 기반) → 적이 계속 능동 추적/분리
//    (steady-state로 두면 적이 idle이 되어 CPU 비용이 사라지므로, 능동 전투를 유지)
//  - 계측: update/draw/shQuery 런타임 래핑으로 프레임당 U/D/T + shQuery 호출/후보
// 실험:
//  (A) GPU: N=500 frozen(_btFramePause) + resScale 1.00/0.75/0.50 → D의 픽셀 반응
//  (B) CPU: N=100~500 능동 궤도 + shQuery 후보 → U·후보의 초선형 여부
//  (C) 재현성: N=500 2회
import { chromium } from 'playwright';

const SEED = 1337;
const WARM = 1500, REC = 1800, SETTLE = 700;
const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))]; };
const mean = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;

let browser;
try {
  browser = await chromium.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  // 주: 시드 RNG(addInitScript) 제거 — 게임 렌더 경로 Math.random까지 교체 시 크래시 의심. 결정론은 씬 고정(고정 스폰/정지)으로 확보.
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));

  // 모든 evaluate에 타임아웃 가드 (무거운 프레임에서 무한 행 방지)
  const ev = async (fn, arg, ms = 10000) => {
    let to; const t = new Promise((_, rej) => { to = setTimeout(() => rej(new Error('EVAL_TIMEOUT')), ms); });
    try { const r = await Promise.race([page.evaluate(fn, arg), t]); clearTimeout(to); return r; }
    catch (e) { clearTimeout(to); console.log('  ! evaluate 실패: ' + e.message); return null; }
  };

  await page.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1', { waitUntil: 'commit', timeout: 15000 });
  const ready = await page.waitForFunction(() => (typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function' && typeof ens !== 'undefined' && typeof _prof !== 'undefined' && typeof shQuery === 'function' && typeof update === 'function' && typeof draw === 'function' && typeof rz === 'function'), null, { timeout: 30000, polling: 200 }).then(() => true).catch(() => false);
  if (!ready) throw new Error('전역 준비 실패: ' + JSON.stringify({ errors }));
  await page.waitForTimeout(7000);

  // 테스트베드 setup(2s 뒤 ens 리셋) 완료까지 대기
  await ev(() => { try { G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {} G.on = true; } catch (e) {} });
  await page.waitForTimeout(3800);

  const setup = await ev(() => {
    try {
      G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {} G.on = true;
      if (window._btBoss) window._btBoss._btFrozen = true;
      window.__cx = P.x; window.__cy = P.y; window.__orbit = false; window.__orbF = 0;
      window.__forceOn = () => { try { G._cutsceneDone = true; G.on = true; if (window._btBoss) window._btBoss._btFrozen = true; } catch (e) {} };
      window.__rec = { frames: [], _uAcc: 0, _lastDraw: 0, _shCalls: 0, _shCand: 0, recording: false };
      if (!window.__updWrapped) { const _o = update; update = function () { const t = performance.now(); const r = _o.apply(this, arguments); window.__rec._uAcc += performance.now() - t; return r; }; window.__updWrapped = true; }
      if (!window.__shqWrapped) { const _o = shQuery; shQuery = function (x, y, r) { const res = _o(x, y, r); const R = window.__rec; R._shCalls++; R._shCand += res.length; return res; }; window.__shqWrapped = true; }
      if (!window.__drwWrapped) {
        const _o = draw;
        draw = function () {
          // 결정론적 플레이어 궤도 (프레임 기반) → 적이 계속 추적/분리 (능동 전투 유지)
          if (window.__orbit) { window.__orbF++; const a = window.__orbF * 0.05; P.x = window.__cx + Math.cos(a) * 260; P.y = window.__cy + Math.sin(a) * 260; }
          const t0 = performance.now(); const r = _o.apply(this, arguments); const t1 = performance.now();
          const R = window.__rec; const T = R._lastDraw ? (t1 - R._lastDraw) : 0; R._lastDraw = t1;
          if (R.recording) { let a = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) a++; R.frames.push({ T, U: R._uAcc, D: t1 - t0, sc: R._shCalls, cd: R._shCand, al: a }); }
          R._uAcc = 0; R._shCalls = 0; R._shCand = 0; return r;
        }; window.__drwWrapped = true;
      }
      // 먼 링(500~900px)에 스폰 → 정지 플레이어로 접근하며 능동 분리(neighbor query) 비용 발생.
      // (플레이어를 움직이면 맵 스트리밍이 GL을 크래시시키므로 플레이어는 고정, 적이 접근)
      window.__spawn = (N) => {
        for (let i = ens.length - 1; i >= 0; i--) { if (ens[i] && !ens[i].ib) ens.splice(i, 1); }
        const cx = window.__cx, cy = window.__cy; let placed = 0, ring = 1;
        while (placed < N && ring < 300) { const r = 520 + (ring % 16) * 24, per = Math.max(10, Math.floor(2 * Math.PI * r / 40)); for (let k = 0; k < per && placed < N; k++) { const e = mkEn(cx + Math.cos((k / per) * 6.283 + ring * 0.4) * r, cy + Math.sin((k / per) * 6.283 + ring * 0.4) * r, G.stage, 6, false, placed % 5, -1); if (e) { e.alive = true; ens.push(e); placed++; } } ring++; }
        return placed;
      };
      window.__alive = () => { let n = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) n++; return n; };
      window.__recStart = () => { window.__rec.frames = []; window.__rec.recording = true; };
      window.__recStop = () => { window.__rec.recording = false; return { frames: window.__rec.frames }; };
      window.__setRes = (r) => { OPT.resScale = r; rz(); return { w: C.width, h: C.height }; };
      window.__pause = (v) => { window._btFramePause = !!v; };
      window.__setOrbit = (v) => { window.__orbit = !!v; };
      let timer = 'no GL'; try { const g = (typeof GL !== 'undefined' && GL) ? GL : null; if (g) { const e2 = g.getExtension('EXT_disjoint_timer_query_webgl2'); timer = e2 ? 'EXT_disjoint_timer_query_webgl2' : (g.getExtension('EXT_disjoint_timer_query') ? 'EXT_disjoint_timer_query' : 'unavailable'); } } catch (e) { timer = 'err'; }
      return { ok: true, timer, canvas: { w: C.width, h: C.height } };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  if (!setup || !setup.ok) throw new Error('setup 실패: ' + JSON.stringify(setup));
  console.log('setup:', JSON.stringify(setup));

  async function record(seconds) {
    await ev(() => window.__recStart());
    const steps = Math.ceil(seconds * 1000 / 250);
    for (let i = 0; i < steps; i++) { await page.waitForTimeout(250); await ev(() => window.__forceOn(), null, 6000); }
    const out = await ev(() => window.__recStop(), null, 8000) || { frames: [] };
    const f = out.frames || [];
    const T = f.map(x => x.T).filter(x => x > 0), U = f.map(x => x.U), D = f.map(x => x.D);
    return { frames: f.length, alive: f.length ? f[f.length - 1].al : 0,
      meanT: +mean(T).toFixed(2), p50: +pct(T, 50).toFixed(2), p95: +pct(T, 95).toFixed(2), p99: +pct(T, 99).toFixed(2),
      meanU: +mean(U).toFixed(2), meanD: +mean(D).toFixed(2),
      hitch16: T.filter(x => x > 16.7).length, hitch34: T.filter(x => x > 34).length,
      shCallsF: +mean(f.map(x => x.sc)).toFixed(0), shCandF: +mean(f.map(x => x.cd)).toFixed(0) };
  }

  // NOTE: resScale(rz) 스윕은 무거운 씬에서 헤드리스 렌더러를 크래시시켜 사용 불가.
  // 대신 WebGL2 timer query로 실제 GPU 실행시간(gpuMs)을 직접 측정하여 GPU 부하를 계량한다.

  // ── N sweep, 능동 궤도: 프레임당 U(CPU) / D(제출) / GPU_time(실행) / shQuery 후보 ──
  console.log('\n=== N sweep — stationary player, far-ring approach (no orbit=no map-stream crash) ===');
  await ev(() => { window.__pause(false); window.__setOrbit(false); window.__forceOn(); });
  const cpuRows = [];
  for (const N of [100, 200, 300, 400, 500]) {
    await ev((n) => { window.__forceOn(); window.__spawn(n); }, N, 15000);
    await page.waitForTimeout(300); // 접근 시작 직후부터 녹화 (능동 국면 포착)
    const r = await record(REC);
    cpuRows.push({ N, ...r });
    console.log('  N=' + N + ' alive=' + r.alive + ' U=' + r.meanU + ' D=' + r.meanD + ' T=' + r.meanT + ' shCand/f=' + r.shCandF + ' p95=' + r.p95);
  }

  // ── (C) 재현성: N=500 재측정 ──
  console.log('\n=== (C) reproducibility — N=500 repeat ===');
  await ev(() => { window.__forceOn(); window.__spawn(500); }, null, 15000);
  await page.waitForTimeout(WARM);
  const rep = await record(REC);
  const base = cpuRows[cpuRows.length - 1];

  // ── 출력 ──
  console.log('\n--- N sweep (active orbit, fixed res) — U/D/T/shQuery ---');
  console.log('  N  | alive | U(CPU upd) | D(draw submit) | T(frame) | p95   | p99   | shCalls/f | shCand/f | cand/alive');
  for (const r of cpuRows) console.log(String(r.N).padStart(4) + ' | ' + String(r.alive).padStart(5) + ' | ' + r.meanU.toFixed(2).padStart(10) + ' | ' + r.meanD.toFixed(2).padStart(14) + ' | ' + r.meanT.toFixed(2).padStart(8) + ' | ' + r.p95.toFixed(2).padStart(5) + ' | ' + r.p99.toFixed(2).padStart(5) + ' | ' + String(r.shCallsF).padStart(9) + ' | ' + String(r.shCandF).padStart(8) + ' | ' + (r.shCandF / Math.max(1, r.alive)).toFixed(1).padStart(7));
  console.log('\n--- reproducibility (N=500) ---');
  console.log('  run1: U=' + base.meanU + ' D=' + base.meanD + ' T=' + base.meanT + ' shCand/f=' + base.shCandF + ' alive=' + base.alive + ' p95=' + base.p95);
  console.log('  run2: U=' + rep.meanU + ' D=' + rep.meanD + ' T=' + rep.meanT + ' shCand/f=' + rep.shCandF + ' alive=' + rep.alive + ' p95=' + rep.p95);

  console.log('\n=== 신호 ===');
  const c1 = cpuRows[0], c5 = cpuRows[cpuRows.length - 1];
  if (c1 && c5) {
    console.log('N ' + (c5.N / c1.N).toFixed(1) + '배(' + c1.N + '→' + c5.N + '): U ' + (c5.meanU / Math.max(0.01, c1.meanU)).toFixed(1) + '배, D ' + (c5.meanD / Math.max(0.01, c1.meanD)).toFixed(1) + '배, shCand/f ' + (c5.shCandF / Math.max(1, c1.shCandF)).toFixed(1) + '배.');
    console.log('  frame분해 @N=' + c5.N + ': U(CPU update)=' + c5.meanU + 'ms  D(draw submit wall)=' + c5.meanD + 'ms  T=' + c5.meanT + 'ms.');
    console.log('  cand/alive 추세(밀도): ' + cpuRows.map(r => (r.shCandF / Math.max(1, r.alive)).toFixed(1)).join(' → ') + ' (증가=밀집 초선형)');
  }
  console.log('\n한계: WebGL2 timer-query와 resScale(rz) 둘 다 무거운 씬에서 렌더러 크래시 → GPU 실행시간 직접계측/픽셀응답 실험 불가.');
  console.log('  D는 CPU draw 제출 wall-time(GPU 비동기 실행은 미포함). GPU-fill vs CPU-submit 분리는 이 하니스로 미해결.');
  console.log('timer-query(가용하나 사용시 크래시): ' + setup.timer + '  | pageerror: ' + errors.length);
} finally { if (browser) await browser.close(); }
