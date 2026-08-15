// Performance Regression Budget Gate — 향후 gameplay/content 변경이 확보된 headroom을
// 깨뜨리는지 감지하는 최소 반자동 성능 게이트. 최적화 작업 아님(regression detection only).
//
// 설계 원칙 (PERF MAINTENANCE GATE):
//  - game.html에 permanent profiler/counter를 추가하지 않는다. raw per-frame dt는
//    게임이 노출하지 않으므로(내부는 _prof EMA + throttled [FRAME HITCH]뿐), 이 harness가
//    페이지 컨텍스트에 rAF 프로브(window.__fp)를 주입해 raw frame dt를 수집한다(외부 런타임 래퍼).
//  - 기존 harness 패턴 재사용: verify_entity_load_cpu_profile.mjs의 headed 실GPU 부트/스폰/force-on.
//  - 절대 FPS(환경 의존)가 아니라 relative regression 위주. baseline은 같은 환경에서 N회 측정한
//    median/range로 저장하고, --check는 baseline 대비 상대 악화를 advisory로 판정한다.
//  - HEADED 실GPU 필수(headless swiftshader는 수백 엔티티에서 크래시/document.hidden으로 sim 정지).
//    → CI hard gate 부적합. correctness는 test/ deterministic guard, 이건 advisory perf gate.
//
// 사용:
//   node tools/perf_regression_gate.mjs                 # 1회 측정 리포트
//   node tools/perf_regression_gate.mjs --baseline      # N회(기본3) 측정→median/range를 baseline JSON에 저장
//   node tools/perf_regression_gate.mjs --check         # 1회 측정→baseline 대비 상대 regression advisory
//   옵션: --runs=N  --secs=S  --scenarios=A,B,C  --headless(디버그용, 신뢰불가)
//
// 서버 필요: node server.cjs (포트 3333). 실행 전 game.html 서빙 확인.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ARG = new Map(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true];
}));
const MODE = ARG.has('baseline') ? 'baseline' : ARG.has('check') ? 'check' : 'report';
const RUNS = MODE === 'baseline' ? Number(ARG.get('runs') || 3) : 1;
const SECS = Number(ARG.get('secs') || 6);
const SCENS = String(ARG.get('scenarios') || 'A,B,C').split(',').map(s => s.trim().toUpperCase());
const HEADLESS = ARG.has('headless');
const BASELINE_PATH = new URL('./perf_baseline.json', import.meta.url);
const URL_GAME = 'http://127.0.0.1:3333/game.html?bosstest=3&perf=1';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const pct = (arr, p) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); const i = Math.min(s.length - 1, Math.floor(p / 100 * s.length)); return s[i]; };
const median = arr => { const s = [...arr].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };

// ── 시나리오 정의: 기존 실제 gameplay path 우선. 각 scenario는 spawn 수 + 스킬 구동을 지정. ──
const SCENARIOS = {
  A: { name: 'STEADY_COMBAT', enemies: 300, skills: [] },                          // 일반 교전·스킬 미사용 (draw/AI bound)
  B: { name: 'SKILL_BURST', enemies: 150, skills: ['iceOrb', 'venomBlade', 'maliceHunt', 'bladeShard'] }, // 기존 SFX regression 재현 부하
  C: { name: 'HOMING_STRESS', enemies: 300, skills: ['maliceHunt', 'plagueBurst'] },  // plagueHoming/mhBlade 관통·재획득
};

async function bootPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL_GAME, { waitUntil: 'commit', timeout: 15000 });
  const ready = await page.waitForFunction(
    () => (typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function'
      && typeof ens !== 'undefined' && Array.isArray(ens) && typeof pProjs !== 'undefined' && typeof _prof !== 'undefined'),
    null, { timeout: 30000, polling: 200 }).then(() => true).catch(() => false);
  if (!ready) throw new Error('전역 준비 실패: ' + JSON.stringify({ errors }));
  await page.waitForTimeout(8000); // 부트/인트로 컷신 종료 대기
  await page.evaluate(() => {
    try { G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {} if (!(G.mw > 0)) initStage(G.stage || 3); G.on = true; } catch (e) {}
  });
  // 헬퍼 + 외부 프레임-dt 프로브(window.__fp) 주입
  await page.evaluate(() => {
    window.__forceOn = () => { try { G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {} G.on = true; } catch (e) {} };
    window.__aliveCount = () => { let n = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) n++; return n; };
    window.__spawnTo = (target) => {
      window.__forceOn(); let guard = 0;
      while (window.__aliveCount() < target && guard < target * 4) {
        guard++; const ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * 340;
        const e = mkEn(P.x + Math.cos(ang) * d, P.y + Math.sin(ang) * d, G.stage, 6, false, (guard % 5), -1);
        if (e) { e.alive = true; ens.push(e); }
      }
      return window.__aliveCount();
    };
    // 스킬 구동: 실제 발동 경로(_dispatchSkillSlot) 우선, 쿨다운만 리셋해 burst 재현.
    // 슬롯0을 대상 스킬로 세팅→dispatch. dispatch가 SFX/투사체/hit 처리를 실제로 태운다.
    window.__castSkill = (sid) => {
      try {
        // 관련 쿨다운 리셋(실 gameplay 발동 로직은 유지, throttle만 해제)
        P._mhCd = 0; P._vbCd = 0; P._ioCd = 0; P._pbCd = 0; P._bltCd = 0; P._lcCd = 0;
        SKILL_SLOTS[0] = sid; if (!P.skills[sid]) P.skills[sid] = 5;
        return _dispatchSkillSlot(0, 49);
      } catch (e) { return false; }
    };
    if (window._btBoss) window._btBoss._btFrozen = true;
    // 외부 rAF 프레임-dt 프로브 (게임 rAF와 나란히 실행, raw dt 수집 — game.html 무변경)
    window.__fp = { dt: [], on: false, _prev: 0 };
    const _tick = (ts) => {
      if (window.__fp.on) { if (window.__fp._prev) window.__fp.dt.push(ts - window.__fp._prev); window.__fp._prev = ts; }
      else window.__fp._prev = 0;
      requestAnimationFrame(_tick);
    };
    requestAnimationFrame(_tick);
    window.__fpStart = () => { window.__fp.dt = []; window.__fp._prev = 0; window.__fp.on = true; };
    window.__fpStop = () => { window.__fp.on = false; };
  });
  return { page, errors };
}

async function runScenario(page, scen, secs) {
  const cfg = SCENARIOS[scen];
  // reset: 기존 적/투사체 제거 후 목표 수 스폰. (god-mode 접촉/보스로 적이 죽으므로
  //  측정 내내 목표 수로 연속 top-up해 workload를 안정·재현가능하게 고정한다.)
  await page.evaluate(() => { window.__forceOn(); for (let i = 0; i < ens.length; i++) if (ens[i]) ens[i].alive = false; pProjs.length = 0; if (typeof projs !== 'undefined') projs.length = 0; });
  await page.waitForTimeout(300);
  await page.evaluate((n) => window.__spawnTo(n), cfg.enemies);
  // 교전 settle 2.5s: 적이 플레이어에 접근·EMA 안정 (top-up + forceOn), 측정 안 함
  for (let w = 0; w < 2500; w += 250) { await page.waitForTimeout(250); await page.evaluate((n) => { window.__forceOn(); window.__spawnTo(n); }, cfg.enemies); }
  // 측정 시작
  await page.evaluate(() => window.__fpStart());
  const t0 = Date.now(); const castLog = { casts: 0 };
  while (Date.now() - t0 < secs * 1000) {
    await page.waitForTimeout(120);
    const c = await page.evaluate((args) => {
      const [skills, n] = args;
      window.__forceOn(); window.__spawnTo(n);       // 목표 수 연속 유지
      let cast = 0; for (const s of skills) if (window.__castSkill(s)) cast++;
      return cast;
    }, [cfg.skills, cfg.enemies]);
    castLog.casts += c;
  }
  await page.evaluate(() => window.__fpStop());
  // 수집
  const raw = await page.evaluate(() => ({
    dt: window.__fp.dt.slice(),
    u: _prof.u, d: _prof.d, t: _prof.t,
    alive: window.__aliveCount(), pproj: pProjs.length, proj: (typeof projs !== 'undefined' ? projs.length : 0),
  }));
  const dt = raw.dt.filter(x => x > 0 && x < 2000);
  const mean = dt.reduce((a, b) => a + b, 0) / Math.max(1, dt.length);
  return {
    scen, name: cfg.name, samples: dt.length, secs,
    dt_p50: +median(dt).toFixed(2), dt_p95: +pct(dt, 95).toFixed(2), dt_p99: +pct(dt, 99).toFixed(2), dt_max: +Math.max(0, ...dt).toFixed(2),
    hitch_16: dt.filter(x => x > 16.7).length, hitch_33: dt.filter(x => x > 33).length,
    fps: +(1000 / mean).toFixed(1),
    u_ema: +raw.u.toFixed(2), d_ema: +raw.d.toFixed(2), t_ema: +raw.t.toFixed(2),
    enemies: raw.alive, pproj: raw.pproj, proj: raw.proj, casts: castLog.casts,
  };
}

function fmtRow(r) {
  return `${r.scen} ${r.name.padEnd(14)} | p50 ${String(r.dt_p50).padStart(6)} p95 ${String(r.dt_p95).padStart(6)} p99 ${String(r.dt_p99).padStart(6)} max ${String(r.dt_max).padStart(7)} | >16.7:${String(r.hitch_16).padStart(4)} >33:${String(r.hitch_33).padStart(3)} | fps ${String(r.fps).padStart(5)} | U ${String(r.u_ema).padStart(5)} D ${String(r.d_ema).padStart(5)} | en ${r.enemies} pp ${r.pproj} | n=${r.samples} cast=${r.casts}`;
}

(async () => {
  // 서버 확인
  try { const res = await fetch('http://127.0.0.1:3333/game.html'); if (!res.ok) throw 0; }
  catch { console.error('❌ 서버(3333) 미응답. `node server.cjs` 먼저 실행.'); process.exit(2); }

  const browser = await chromium.launch({
    headless: HEADLESS, executablePath: HEADLESS ? undefined : CHROME,
    args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'],
  });
  try {
    // 각 run마다 fresh page (상태 오염 방지). run 안에서 모든 scenario 순차 측정.
    const allRuns = []; // [ {A:res, B:res, C:res}, ... ]
    for (let run = 0; run < RUNS; run++) {
      const { page } = await bootPage(browser);
      const runRes = {};
      for (const s of SCENS) { if (!SCENARIOS[s]) continue; runRes[s] = await runScenario(page, s, SECS); }
      allRuns.push(runRes);
      await page.close();
      console.log(`\n── RUN ${run + 1}/${RUNS} ──`);
      for (const s of SCENS) if (runRes[s]) console.log('  ' + fmtRow(runRes[s]));
    }

    // 집계: scenario별 metric median + range(min~max)
    const METRICS = ['dt_p50', 'dt_p95', 'dt_p99', 'dt_max', 'hitch_16', 'hitch_33', 'fps', 'u_ema', 'd_ema', 't_ema'];
    const agg = {};
    for (const s of SCENS) {
      if (!SCENARIOS[s]) continue;
      const rs = allRuns.map(r => r[s]).filter(Boolean);
      if (!rs.length) continue;
      agg[s] = { name: SCENARIOS[s].name, n_runs: rs.length };
      for (const m of METRICS) {
        const vals = rs.map(r => r[m]);
        agg[s][m] = { median: +median(vals).toFixed(2), min: +Math.min(...vals).toFixed(2), max: +Math.max(...vals).toFixed(2), spread_pct: +(((Math.max(...vals) - Math.min(...vals)) / Math.max(0.01, median(vals))) * 100).toFixed(1) };
      }
      agg[s].workload = { enemies: median(rs.map(r => r.enemies)), pproj: median(rs.map(r => r.pproj)) };
    }

    console.log('\n════════ 집계 (scenario별 metric median [min~max] spread%) ════════');
    for (const s of SCENS) {
      if (!agg[s]) continue;
      console.log(`\n[${s}] ${agg[s].name}  (runs=${agg[s].n_runs}, workload en≈${agg[s].workload.enemies} pproj≈${agg[s].workload.pproj})`);
      for (const m of ['dt_p95', 'dt_p99', 'dt_max', 'hitch_16', 'hitch_33', 'fps']) {
        const a = agg[s][m];
        console.log(`   ${m.padEnd(9)} median ${String(a.median).padStart(8)}  [${a.min} ~ ${a.max}]  spread ${a.spread_pct}%`);
      }
    }

    if (MODE === 'baseline') {
      const out = { created: 'STAMP_AFTER', env: { headed: !HEADLESS, chrome: CHROME, viewport: '1280x720', secs: SECS, runs: RUNS }, scenarios: agg };
      writeFileSync(BASELINE_PATH, JSON.stringify(out, null, 2));
      console.log(`\n✅ baseline 저장: ${BASELINE_PATH.pathname}  (created 필드는 커밋 시 날짜 기입)`);
      console.log('   ※ spread%가 큰 metric은 hard threshold 부적합 → advisory. 아래 variance 보고 threshold 결정.');
    } else if (MODE === 'check') {
      if (!existsSync(BASELINE_PATH)) { console.error('❌ baseline 없음. 먼저 --baseline 실행.'); process.exit(2); }
      const base = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
      console.log('\n════════ REGRESSION CHECK (advisory, relative) ════════');
      let warn = 0;
      for (const s of SCENS) {
        if (!agg[s] || !base.scenarios[s]) continue;
        for (const m of ['dt_p95', 'dt_p99', 'hitch_33']) {
          const cur = agg[s][m].median, ref = base.scenarios[s][m].median;
          const refSpread = base.scenarios[s][m].spread_pct || 20;
          // 상대 악화가 baseline 자체 분산(spread) + 마진을 넘으면 advisory WARN
          const tol = Math.max(refSpread, 15) + 10; // 관측된 분산 + 10%p 마진
          const chg = ref > 0 ? ((cur - ref) / ref) * 100 : 0;
          const flag = chg > tol;
          if (flag) warn++;
          console.log(`  [${s}] ${m.padEnd(9)} cur ${String(cur).padStart(8)} vs base ${String(ref).padStart(8)}  Δ${chg > 0 ? '+' : ''}${chg.toFixed(1)}%  tol +${tol}%  ${flag ? '⚠️ REGRESSION' : 'ok'}`);
        }
      }
      console.log(warn ? `\n⚠️ ${warn} advisory regression signal(s) — REOPEN CONDITION 후보. 수동 재현 확인 필요.` : '\n✅ regression 신호 없음 (headroom 유지).');
      process.exit(0); // advisory: 항상 0 exit (correctness CI를 깨지 않음)
    }
  } finally {
    await browser.close();
  }
})();
