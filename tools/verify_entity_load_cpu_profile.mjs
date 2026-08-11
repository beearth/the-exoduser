// 엔티티 부하 프레임 프로파일 — 난전의 CPU(update/AI) + GPU(draw/drawCalls) 프레임 비용 실측.
// ?bosstest=3&perf=1 (god 모드 보스 아레나, 스테이지0 인트로컷신 회피)로 진입,
// G.on 강제 활성 후 mkEn으로 적을 단계적으로 늘려 _prof.u/_prof.d/_prof.t 및
// [PERF avg] ai/coll/render/drawCalls, [FRAME HITCH] U=/D= 를 수집한다.
// ★ HEADED 필수: headless SW렌더(swiftshader)는 수백 엔티티에서 렌더러 크래시 + document.hidden으로
//   sim 자체가 안 돌아 U=0이 된다. 실제 GPU(headless:false)로만 유효한 프레임 비용을 얻는다.
// 실행: node tools/verify_entity_load_cpu_profile.mjs  (창이 뜬다)
// 주의: 적을 플레이어 주변 링에 밀집 스폰하므로 AI 이웃질의 밀도가 실제보다 높을 수 있음(초선형 비용 상한 관측용).
import { chromium } from 'playwright';

const TARGETS = [0, 100, 300, 500, 700];   // 목표 생존 적 수(측정 지점)
const SETTLE_MS = 2500;               // 각 단계 EMA 안정+PERF avg 누적 대기

let browser;
try {
  // HEADED 필수: 헤드리스 SW렌더(swiftshader)는 수백 엔티티에서 렌더러 크래시 + document.hidden으로 sim 미실행.
  // 실제 GPU로 구동해야 update/draw 프레임 비용이 유효.
  browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const perfAvg = [], hitches = [], errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    const t = m.text();
    if (t.startsWith('[PERF avg')) perfAvg.push(t);
    else if (t.startsWith('[FRAME HITCH]')) hitches.push(t);
  });

  // bosstest=3: 비-제로 스테이지 → 스테이지0 인트로 컷신(G.on 리셋 유발) 회피
  await page.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1', { waitUntil: 'commit', timeout: 15000 });

  // 전역(G/P/mkEn/ens/_prof) 준비 대기 후 게임 활성화 강제
  const ready = await page.waitForFunction(
    () => (typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function' && typeof ens !== 'undefined' && Array.isArray(ens) && typeof _prof !== 'undefined'),
    null, { timeout: 30000, polling: 200 }
  ).then(() => true).catch(() => false);
  if (!ready) throw new Error('전역 준비 실패: ' + JSON.stringify({ errors }));

  // 부트/인트로 컷신이 G.on을 되돌리는 레이스 방지: 컷신 완료 처리 후 활성화.
  // 초기 8초 settle로 부트 시퀀스가 끝나길 기다린다.
  await page.waitForTimeout(8000);
  await page.evaluate(() => {
    try {
      G._cutsceneDone = true;
      try { _cutsceneState = null; } catch (e) {}
      if (!(G.mw > 0)) initStage(G.stage || 3);
      G.on = true;
    } catch (e) {}
  });

  // 스폰/유틸 헬퍼 + G.on 재강제 함수 (컷신도 종료)
  await page.evaluate(() => {
    window.__forceOn = () => { try { G._cutsceneDone = true; try { _cutsceneState = null; } catch (e) {} G.on = true; } catch (e) {} };
    window.__aliveCount = () => { let n = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) n++; return n; };
    window.__spawnTo = (target) => {
      window.__forceOn();
      let guard = 0;
      while (window.__aliveCount() < target && guard < target * 4) {
        guard++;
        const ang = Math.random() * Math.PI * 2, d = 90 + Math.random() * 340;
        const x = P.x + Math.cos(ang) * d, y = P.y + Math.sin(ang) * d;
        const e = mkEn(x, y, G.stage, 6, false, (guard % 5), -1);
        if (e) { e.alive = true; ens.push(e); }
      }
      return window.__aliveCount();
    };
    // 시뮬 검증용: 적 위치 스냅샷 → 나중에 움직였는지 확인
    window.__posSnap = () => { let s = 0, n = 0; for (let i = 0; i < ens.length && n < 30; i++) { const e = ens[i]; if (e && e.alive) { s += e.x + e.y; n++; } } return s; };
    if (window._btBoss) window._btBoss._btFrozen = true;
  });

  const rows = [];
  for (const target of TARGETS) {
    await page.evaluate((t) => (t === 0 ? window.__aliveCount() : window.__spawnTo(t)), target);
    const pos0 = await page.evaluate(() => window.__posSnap());
    // settle: G.on 매 250ms 재강제 (컷신/리셋 레이스 대응)
    for (let w = 0; w < SETTLE_MS; w += 250) {
      await page.waitForTimeout(250);
      await page.evaluate(() => window.__forceOn());
    }
    // GL 프레임당 델타 샘플링 (배칭 효율 진단): drawcalls/tex bind/prog switch/blend per frame
    // _PERF_PROF/_gameFrame은 const/let 전역 → window에 없음. bare 참조.
    const gl0 = await page.evaluate(() => {
      const P2 = (typeof _PERF_PROF !== 'undefined') ? _PERF_PROF : {};
      return { dc: P2.drawCalls || 0, tx: P2._glTex || 0, pg: P2._glProg || 0, bl: P2._glBlend || 0, f: (typeof _gameFrame !== 'undefined' ? _gameFrame : 0) };
    });
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.__forceOn());
    const snap = await page.evaluate((args) => {
      const [p0, g0] = args;
      const P2 = (typeof _PERF_PROF !== 'undefined') ? _PERF_PROF : {};
      const gf = (typeof _gameFrame !== 'undefined' ? _gameFrame : 0);
      const fd = Math.max(1, gf - g0.f);
      return {
        alive: window.__aliveCount(),
        total: ens.length,
        u: window._prof.u, d: window._prof.d, t: window._prof.t,
        gon: G.on,
        moved: Math.abs(window.__posSnap() - p0) > 1,
        profEnabled: !!(P2 && P2.enabled),
        frames: fd,
        dcF: ((P2.drawCalls || 0) - g0.dc) / fd,     // drawcalls / frame
        txF: ((P2._glTex || 0) - g0.tx) / fd,        // texture binds / frame
        pgF: ((P2._glProg || 0) - g0.pg) / fd,       // program switches / frame
        blF: ((P2._glBlend || 0) - g0.bl) / fd,      // blend changes / frame
      };
    }, [pos0, gl0]);
    rows.push({ target, ...snap });
  }

  console.log('=== 엔티티 부하 프레임 프로파일 (HEADED 실 GPU — U/D 모두 유효) ===');
  console.log('alive | U(upd) | D(draw) | T(frame) | drawCall/f | texBind/f | progSw/f | blend/f | sim');
  for (const r of rows) {
    console.log(
      String(r.alive).padStart(5) + ' | ' +
      r.u.toFixed(2).padStart(6) + ' | ' + r.d.toFixed(2).padStart(7) + ' | ' +
      r.t.toFixed(2).padStart(8) + ' | ' +
      r.dcF.toFixed(0).padStart(10) + ' | ' + r.txF.toFixed(0).padStart(9) + ' | ' +
      r.pgF.toFixed(1).padStart(8) + ' | ' + r.blF.toFixed(1).padStart(7) + ' | ' +
      (r.moved ? 'Y' : 'N')
    );
  }
  console.log('\n* HEADED 실 GPU: U(CPU update)·D(GPU draw) 유효. 예산 16.7ms(60fps).');
  console.log('* 배칭 진단: drawCall/f = 프레임당 GL 드로우콜. texBind/f≈drawCall/f 이면 매 드로우마다 텍스처 재바인드(=아틀라스 배칭 부재). progSw=셰이더 전환.');
  console.log('\n=== [PERF avg] ai/coll/render/dom (>300마리 auto-on, 최근 5건) ===');
  for (const l of perfAvg.slice(-5)) console.log('  ' + l);
  console.log('\n=== [FRAME HITCH] (최근 8건) ===');
  for (const l of hitches.slice(-8)) console.log('  ' + l);
  if (errors.length) console.log('\n=== pageerror ===\n  ' + errors.join('\n  '));
} finally {
  if (browser) await browser.close();
}
