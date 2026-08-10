// 엔티티 부하 CPU 프로파일 — 500엔티티 난전의 CPU(update/AI/충돌) 프레임 비용 실측.
// ?bosstest=0&perf=1 (god 모드 보스 아레나)로 진입 후 mkEn으로 적을 단계적으로 늘려
// _prof.u(업데이트 EMA, CPU) 및 [PERF avg] ai/coll 리포트를 수집한다.
// 주의: 헤드리스는 swiftshader(SW 렌더)라 _prof.d/render/drawCalls(GPU)는 실측 무의미 — 참고만.
// 실행: node tools/verify_entity_load_cpu_profile.mjs
import { chromium } from 'playwright';

const TARGETS = [0, 100, 300, 500];   // 목표 생존 적 수(측정 지점)
const SETTLE_MS = 2500;               // 각 단계 EMA 안정+PERF avg 누적 대기

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const perfAvg = [], hitches = [], errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    const t = m.text();
    if (t.startsWith('[PERF avg')) perfAvg.push(t);
    else if (t.startsWith('[FRAME HITCH]')) hitches.push(t);
  });

  await page.goto('http://127.0.0.1:3333/game.html?bosstest=0&perf=1', { waitUntil: 'commit', timeout: 15000 });

  // 전역(G/P/mkEn/ens/_prof) 준비 대기 후 게임 활성화 강제
  const ready = await page.waitForFunction(
    () => (typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function' && typeof ens !== 'undefined' && Array.isArray(ens) && typeof _prof !== 'undefined'),
    null, { timeout: 30000, polling: 200 }
  ).then(() => true).catch(() => false);
  if (!ready) throw new Error('전역 준비 실패: ' + JSON.stringify({ errors }));

  // G.on=true 강제 → 테스트베드 _btWait 통과(보스 아레나 셋업 진행). 아레나 준비까지 폴링.
  await page.evaluate(() => { try { G.on = true; } catch (e) {} });
  await page.waitForFunction(
    () => { try { return G.on === true && G.mw > 0 && (window._btBoss || G._bossArena || ens.length >= 0); } catch (e) { return false; } },
    null, { timeout: 15000, polling: 200 }
  ).catch(() => {});
  // 아레나가 안 떠도 진행: 스테이지가 없으면 초기화하고 G.on 유지
  await page.evaluate(() => {
    try { if (!(G.mw > 0)) { initStage(G.stage || 0); } G.on = true; } catch (e) {}
  });

  // 스폰 헬퍼 설치 (플레이어 주변 링에 일반 적 배치)
  await page.evaluate(() => {
    window.__aliveCount = () => { let n = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) n++; return n; };
    window.__spawnTo = (target) => {
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
    // 보스 패턴은 얼려 엔티티-수 비용만 격리 (VFX 난사 노이즈 제거)
    if (window._btBoss) window._btBoss._btFrozen = true;
  });

  const rows = [];
  for (const target of TARGETS) {
    const alive = await page.evaluate((t) => (t === 0 ? window.__aliveCount() : window.__spawnTo(t)), target);
    await page.waitForTimeout(SETTLE_MS);
    const snap = await page.evaluate(() => ({
      alive: window.__aliveCount(),
      total: ens.length,
      u: window._prof.u, d: window._prof.d, t: window._prof.t,
      profEnabled: !!(window._PERF_PROF && window._PERF_PROF.enabled),
      drawCalls: window._PERF_PROF ? window._PERF_PROF.drawCalls : -1,
    }));
    rows.push({ target, ...snap });
  }

  console.log('=== 엔티티 부하 CPU 프로파일 (headless swiftshader — U만 유효) ===');
  console.log('target | alive | total | U(update,ms) | D(draw,ms*) | T(frame,ms) | PERF_PROF');
  for (const r of rows) {
    console.log(
      String(r.target).padStart(6) + ' | ' +
      String(r.alive).padStart(5) + ' | ' + String(r.total).padStart(5) + ' | ' +
      r.u.toFixed(2).padStart(11) + ' | ' + r.d.toFixed(2).padStart(10) + ' | ' +
      r.t.toFixed(2).padStart(10) + ' | ' + (r.profEnabled ? 'on' : 'off')
    );
  }
  console.log('\n* D(draw)는 SW렌더라 실측 무의미. U(update)만 CPU 병목 판정에 사용.');
  console.log('\n=== [PERF avg] ai/coll/render/dom (>300마리 auto-on, 최근 5건) ===');
  for (const l of perfAvg.slice(-5)) console.log('  ' + l);
  console.log('\n=== [FRAME HITCH] (최근 8건) ===');
  for (const l of hitches.slice(-8)) console.log('  ' + l);
  if (errors.length) console.log('\n=== pageerror ===\n  ' + errors.join('\n  '));
} finally {
  if (browser) await browser.close();
}
