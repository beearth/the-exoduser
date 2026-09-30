// QA·성능팀 프레임 프로브 (PM-001) — 실제 Chrome(headed, 실GPU)에서 실제 플레이 흐름을 재현·측정한다.
// 게임 소스는 수정하지 않는다. 계측은 페이지 주입(rAF 래퍼, update/draw 래퍼, LoAF, GPU timer query)만 사용.
//
// 세이브 보호: POST /api/save, POST /api/mats, DELETE /api/save/* 는 브라우저에서 가로채 가짜 ok 응답 — 서버·디스크에 쓰지 않는다.
//             프로필은 실행마다 새 임시 폴더(localStorage/IndexedDB 격리).
// QA 전용 조작(측정 결과에 명시): 무적(HP 보충), mkEn 추가 스폰. 몹 수·화질 옵션은 기록만 하고 줄이지 않는다.
//
// 사용:
//   node tools/qa_frame_probe.mjs --label=before --char=test --res=1920x1080
//   (현재 game.html은 _DEMO_MODE=true 고정 — 세이브는 localStorage이며 실행마다 새 임시 프로필이라 사용자 세이브와 격리)
//   옵션: --variant=disk|head|<파일경로>   (game.html 본문을 HEAD 커밋/다른 파일로 바꿔 같은 조건 비교)
//         --res=WxH|fullscreen  --scen=IDLE,MOVE,COMBAT,PANELS,POST  --enemies=120  --query="depthSlice=1"
//         --gpu=0 (GPU timer query 끔)  --gl=1 (느린 GL 호출 기록)  --secs=1 (구간 길이 배율)
//         --profile=1 (CPU 샘플링 프로파일 — 측정 오버헤드가 있으므로 전후 비교용 수치는 profile 없이 잰다)
//         --seed=N --maxload=60 --origin=http://127.0.0.1:PORT --expectsha=<sha256 앞자리>
//         --enemy=1 (적 루프 타임버짓 break·updateE 비용 계측 — 서빙 본문에 계수 코드가 들어가므로 진단 전용)
//         --cpu=N (CDP CPU 스로틀 — 저사양 CPU에서의 적 루프 예산 초과 재현용, 수치는 실기기 값이 아님)
//         --tracesave=1 (트레이스 원본 저장 — 10초에 약 400MB)
//         --trace=COMBAT2,MOVE (구간 CDP 트레이싱: JS가 짧은 긴 간격을 GPU/컴포지터 스레드 이벤트로 귀속 — 진단 전용)
//         --inject=<js파일> (부트 후 페이지에 주입할 실험 패치 — 소스 수정 전 A/B용)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const ARG = new Map(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? '1'] : [a, '1']; }));
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const LABEL = ARG.get('label') || 'run';
const CHAR = ARG.get('char') || 'test'; // new=데모 신규 Lv1, test=데모 테스트 캐릭터(Lv캡·전 스킬, localStorage _dLv500 경로)
const RES = ARG.get('res') || '1920x1080';
const VARIANT = ARG.get('variant') || 'disk';
const SCEN = (ARG.get('scen') || 'IDLE,MOVE,COMBAT,PANELS,POST').split(',').map(s => s.trim().toUpperCase());
const ENEMIES = Number(ARG.get('enemies') || 120);
const QUERY = ARG.get('query') || '';
const USE_GPU_Q = ARG.get('gpu') !== '0';
const USE_GL_PROBE = ARG.get('gl') === '1';
const USE_PROFILE = ARG.get('profile') === '1'; // CDP 샘플링 프로파일러: 구간 상위 self-time + 최악 프레임/패널 조작 구간 함수 귀속
const SECS = Number(ARG.get('secs') || 1);
const INJECT = ARG.get('inject') || '';
const OUT_DIR = path.resolve(ROOT, ARG.get('out') || 'tmp/qa-perf-20261001');
const CHROME = ARG.get('chrome') || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ORIGIN = (ARG.get('origin') || 'http://127.0.0.1:3333').replace(/\/$/, ''); // --origin: 패키지 사본을 다른 포트로 서빙해 대조할 때
const EXPECT_SHA = (ARG.get('expectsha') || '').toLowerCase();   // --expectsha: 측정 대상 game.html SHA-256(앞자리 일부 가능)이 다르면 실행 거부
const SEED = Number(ARG.get('seed') || 20261001);                // QA 추가 스폰 위치 난수 시드(실행 간 동일 배치)
const MAXLOAD = Number(ARG.get('maxload') || 60);                // 시작 전 시스템 CPU(%) 상한. 넘으면 최대 90초 대기 후 loadOk=false 표시
const USE_ENEMY = ARG.get('enemy') === '1';                      // 적 루프 계측: 타임버짓 break 횟수·인덱스, updateE 호출 비용, 거리 티어 분포
const CPU_THROTTLE = Number(ARG.get('cpu') || 1);                   // --cpu=6 : 렌더러 메인 스레드 CPU 6배 감속(저사양 재현, 진단 전용)
const TRACE_SEGS = (ARG.get('trace') || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean); // --trace=COMBAT2
const sleep = ms => new Promise(r => setTimeout(r, ms));
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;

function pct(sorted, p) { if (!sorted.length) return 0; return sorted[Math.min(sorted.length - 1, Math.floor(p / 100 * sorted.length))]; }
function dist(arr) {
  const s = arr.filter(x => x >= 0).sort((a, b) => a - b);
  if (!s.length) return { n: 0 };
  return { n: s.length, mean: r2(s.reduce((a, b) => a + b, 0) / s.length), p50: r2(pct(s, 50)), p95: r2(pct(s, 95)), p99: r2(pct(s, 99)), max: r2(s[s.length - 1]) };
}
function cpuSnap() { let idle = 0, total = 0; for (const c of os.cpus()) { for (const k in c.times) total += c.times[k]; idle += c.times.idle; } return { idle, total }; }
function git(args) { try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim(); } catch { return ''; } }

// ── 페이지 시작 전 주입: rAF 프레임 기록 + LoAF/longtask + 포커스·컨텍스트 이벤트 ──
const INIT = `(() => {
  const Q = window.__qa = { frames: [], cur: null, on: false, loaf: [], lt: [], ev: [], mem: [], marks: [], slowGL: [], gpu: [] };
  const _raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    return _raf(function (ts) {
      let f = Q.cur;
      const t0 = performance.now();
      if (!f || f.ts !== ts) { f = Q.cur = { ts: ts, js: 0, u: 0, d: 0, nu: 0, st: t0, en: t0 }; if (Q.on) Q.frames.push(f); }
      try { return cb(ts); } finally { f.en = performance.now(); f.js += f.en - t0; }
    });
  };
  try { new PerformanceObserver(l => { if (!Q.on) return; for (const e of l.getEntries()) Q.loaf.push({ t: e.startTime, dur: e.duration, block: e.blockingDuration, render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0, style: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0, scripts: (e.scripts || []).slice(0, 5).map(s => ({ n: String(s.sourceFunctionName || s.invoker || '').slice(0, 70), d: s.duration, fsl: s.forcedStyleAndLayoutDuration })) }); }).observe({ type: 'long-animation-frame' }); } catch (e) {}
  try { new PerformanceObserver(l => { if (!Q.on) return; for (const e of l.getEntries()) Q.lt.push({ t: e.startTime, dur: e.duration }); }).observe({ type: 'longtask' }); } catch (e) {}
  const ev = type => Q.ev.push({ t: performance.now(), type: type, hidden: document.hidden, focus: document.hasFocus() });
  document.addEventListener('visibilitychange', () => ev('visibility'));
  window.addEventListener('blur', () => ev('blur')); window.addEventListener('focus', () => ev('focus')); window.addEventListener('resize', () => ev('resize'));
  window.addEventListener('webglcontextlost', () => ev('glLost'), true); window.addEventListener('webglcontextrestored', () => ev('glRestored'), true);
  setInterval(() => {
    if (!Q.on) return; const m = { t: performance.now(), heap: performance.memory ? performance.memory.usedJSHeapSize : 0, nodes: document.getElementsByTagName('*').length };
    try { m.paused = !!G.paused; m.on = !!G.on; let a = 0; for (let i = 0; i < ens.length; i++) if (ens[i] && ens[i].alive) a++; m.ens = a; m.projs = projs.length; m.pProjs = pProjs.length; m.px = P.x; m.py = P.y; if (Q.en) { let t1 = 0, t2 = 0, t3 = 0, t4 = 0; for (let i = 0; i < ens.length; i++) { const e = ens[i]; if (!e || !e.alive) continue; const dx = e.x - P.x, dy = e.y - P.y, d2 = dx * dx + dy * dy; if (d2 < 22500) t1++; else if (d2 < 122500) t2++; else if (d2 < 490000) t3++; else t4++; } m.tiers = [t1, t2, t3, t4]; } } catch (e) {}
    Q.mem.push(m);
  }, 500);
})();`;

// ── 부트 후 주입: update/draw 시간, GPU timer query(메인 GL 컨텍스트, loop 1회 범위) ──
const POST_BOOT = `(() => {
  const Q = window.__qa; if (Q._wrapped) return 'already'; Q._wrapped = true;
  const _u = window.update, _d = window.draw;
  window.update = function () { const t = performance.now(); try { return _u.apply(this, arguments); } finally { const f = Q.cur; if (f) { f.u += performance.now() - t; f.nu++; } } };
  window.draw = function () { const t = performance.now(); try { return _d.apply(this, arguments); } finally { const f = Q.cur; if (f) f.d += performance.now() - t; } };
  let info = { wrapped: true, gpuQ: false };
  if (${USE_GPU_Q ? 'true' : 'false'}) { try {
    const gl = (typeof GL !== 'undefined' && GL) ? GL : null; const ext = gl && gl.getExtension('EXT_disjoint_timer_query_webgl2');
    if (gl && ext) {
      const pend = []; const _loop = window.loop; let active = null;
      window.loop = function (ts) {
        // 완료된 쿼리 회수
        while (pend.length) { const p = pend[0]; if (!gl.getQueryParameter(p.q, gl.QUERY_RESULT_AVAILABLE)) { if (pend.length > 8) { gl.deleteQuery(pend.shift().q); continue; } break; }
          const dj = gl.getParameter(ext.GPU_DISJOINT_EXT); const ns = gl.getQueryParameter(p.q, gl.QUERY_RESULT); gl.deleteQuery(p.q); pend.shift(); if (!dj && Q.on) Q.gpu.push(ns / 1e6); }
        let q = null; if (pend.length < 6) { q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); }
        try { return _loop.call(this, ts); } finally { if (q) { gl.endQuery(ext.TIME_ELAPSED_EXT); pend.push({ q: q }); } }
      };
      info.gpuQ = true;
    } } catch (e) { info.gpuErr = String(e); } }
  if (${USE_GL_PROBE ? 'true' : 'false'}) { try {
    const P2 = WebGL2RenderingContext.prototype;
    // 2D 캔버스 동기 호출(읽기백·측정) — 5ms 초과 시 호출 스택과 함께 기록
    const C2 = CanvasRenderingContext2D.prototype;
    for (const name of ['getImageData', 'putImageData', 'measureText', 'drawImage']) { const orig = C2[name]; C2[name] = function () { const t = performance.now(); const r = orig.apply(this, arguments); const dt = performance.now() - t; if (dt > 5 && Q.on) { let st = ''; try { st = new Error().stack.split(String.fromCharCode(10)).slice(2, 6).map(l => l.trim().split(location.origin).join('').slice(0, 60)).join(' < '); } catch (e) {} Q.slowGL.push({ t: t, fn: '2d.' + name, ms: dt, src: this.canvas.width + 'x' + this.canvas.height + ' ' + st }); } return r; }; }
    for (const name of ['texImage2D', 'texSubImage2D', 'bufferData', 'bufferSubData', 'compileShader', 'linkProgram', 'readPixels', 'generateMipmap', 'finish', 'getError', 'drawElements', 'drawArrays', 'drawArraysInstanced', 'drawElementsInstanced', 'useProgram', 'getUniformLocation', 'getProgramParameter', 'getShaderParameter', 'clear', 'bindFramebuffer', 'blitFramebuffer', 'createTexture', 'deleteTexture', 'texStorage2D', 'framebufferTexture2D', 'checkFramebufferStatus', 'getParameter', 'getExtension']) {
      const orig = P2[name]; const isTex = name === 'texImage2D' || name === 'texSubImage2D';
      P2[name] = function () { const t = performance.now(); const r = orig.apply(this, arguments); const dt = performance.now() - t;
        if (Q.on && (dt > 1 || isTex)) { let src = ''; if (isTex) { const a = arguments[arguments.length - 1]; try { if (a && a.tagName === 'IMG') src = (a.src || '').split('/').slice(-2).join('/').split('?')[0] + ' ' + a.naturalWidth + 'x' + a.naturalHeight; else if (a && a.tagName === 'CANVAS') src = 'canvas' + (a.id ? '#' + a.id : '') + (a._qaTag ? ':' + a._qaTag : '') + ' ' + a.width + 'x' + a.height; else if (a && a.width) src = (a.constructor && a.constructor.name) + ' ' + a.width + 'x' + a.height; else src = 'raw ' + arguments[3] + 'x' + arguments[4]; } catch (e) {} }
          Q.slowGL.push({ t: t, fn: name, ms: dt, src: src }); }
        return r; };
    } info.glProbe = true; } catch (e) { info.glErr = String(e); } }
  return info;
})()`;

// ── CPU 프로파일 분석 ──
function analyzeProfile(profile, syncT, windows) {
  const nodes = new Map(); for (const n of profile.nodes) nodes.set(n.id, n);
  const parent = new Map(); for (const n of profile.nodes) for (const c of (n.children || [])) parent.set(c, n.id);
  const nm = n => { const c = n.callFrame; return (c.functionName || '(anon)') + (c.url ? '@' + c.url.split('/').pop().split('?')[0] + ':' + (c.lineNumber + 1) : ''); };
  const ts = []; let t = profile.startTime; for (let i = 0; i < profile.samples.length; i++) { t += profile.timeDeltas[i]; ts.push(t); }
  // 동기화 마커(__qaSyncMark)의 첫 샘플 시각 = performance.now() syncT
  let off = null; for (let i = 0; i < profile.samples.length; i++) { if (nodes.get(profile.samples[i]).callFrame.functionName === '__qaSyncMark') { off = ts[i] - syncT * 1000; break; } }
  const self = (from, to) => { const m = new Map(); let total = 0; for (let i = 0; i < ts.length - 1; i++) { if (ts[i] < from || ts[i] >= to) continue; const dt = (ts[i + 1] - ts[i]) / 1000; const n = nodes.get(profile.samples[i]); const k = nm(n); m.set(k, (m.get(k) || 0) + dt); total += dt; } return { m, total }; };
  const stackOf = (id) => { const out = []; let cur = id, g = 0; while (cur != null && g++ < 6) { const n = nodes.get(cur); if (!n || n.callFrame.functionName === '(root)') break; out.push(nm(n)); cur = parent.get(cur); } return out.join(' < '); };
  const top = (r, k, skipIdle) => [...r.m.entries()].filter(e => !skipIdle || !/^(idle)/.test(e[0])).sort((a, b) => b[1] - a[1]).slice(0, k).map(e => e[0] + ' ' + r1(e[1]) + 'ms');
  const all = self(-Infinity, Infinity);
  const out = { syncOk: off != null, totalMs: r1(all.total), top: top(all, 28, false), windows: [] };
  if (off != null) for (const w of windows) {
    const from = w.st * 1000 + off, to = w.en * 1000 + off; const r = self(from, to);
    // 구간 내 최다 leaf 스택
    const sm = new Map(); for (let i = 0; i < ts.length - 1; i++) { if (ts[i] < from || ts[i] >= to) continue; const k = stackOf(profile.samples[i]); sm.set(k, (sm.get(k) || 0) + (ts[i + 1] - ts[i]) / 1000); }
    out.windows.push({ label: w.label, ms: r1(w.en - w.st), top: top(r, 8, true), stacks: [...sm.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => r1(e[1]) + 'ms ' + e[0]) });
  }
  return out;
}

// ── CDP 트레이스 분석: JS가 짧은데 간격이 긴 프레임의 [JS 종료, 다음 프레임 JS 시작] 구간을 스레드별 이벤트로 귀속 ──
function analyzeTrace(events, syncT, windows) {
  const pname = new Map(), tname = new Map(); let off = null;
  for (const e of events) {
    if (e.ph === 'M' && e.name === 'process_name') pname.set(e.pid, e.args && e.args.name);
    else if (e.ph === 'M' && e.name === 'thread_name') tname.set(e.pid + ':' + e.tid, e.args && e.args.name);
    else if (off == null && e.name === 'qaSync') off = e.ts - syncT * 1000;
  }
  const out = { events: events.length, syncOk: off != null, windows: [] };
  if (off == null) return out;
  const X = events.filter(e => e.ph === 'X' && e.dur > 500);
  for (const w of windows) {
    const from = w.st * 1000 + off, to = w.en * 1000 + off; const m = new Map();
    for (const e of X) { const a = Math.max(from, e.ts), b = Math.min(to, e.ts + e.dur); if (b <= a) continue; const k = (pname.get(e.pid) || e.pid) + '/' + (tname.get(e.pid + ':' + e.tid) || e.tid) + ' ' + e.name; const o = m.get(k) || { ov: 0, n: 0, max: 0 }; o.ov += (b - a) / 1000; o.n++; o.max = Math.max(o.max, e.dur / 1000); m.set(k, o); }
    out.windows.push({ label: w.label, ms: r1(w.en - w.st), top: [...m.entries()].sort((a, b) => b[1].ov - a[1].ov).slice(0, 14).map(e => r1(e[1].ov) + 'ms n' + e[1].n + ' max' + r1(e[1].max) + ' ' + e[0]) });
  }
  return out;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  try { const res = await fetch(ORIGIN + '/game.html', { method: 'HEAD' }); if (!res.ok) throw 0; } catch { console.error('서버 미응답: ' + ORIGIN); process.exit(2); }
  const diskHtml = readFileSync(path.join(ROOT, 'game.html'));
  const servedHtml = Buffer.from(await (await fetch(ORIGIN + '/game.html')).arrayBuffer());
  const sha = b => createHash('sha256').update(b).digest('hex');
  let variantBody = null, variantSha = sha(servedHtml);
  if (VARIANT === 'head') { variantBody = execFileSync('git', ['show', 'HEAD:game.html'], { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 }); variantSha = sha(variantBody); }
  else if (VARIANT !== 'disk') { variantBody = readFileSync(path.resolve(ROOT, VARIANT)); variantSha = sha(variantBody); }
  if (EXPECT_SHA && !variantSha.startsWith(EXPECT_SHA)) { console.error('측정 대상 SHA 불일치: 기대 ' + EXPECT_SHA + ' / 실제 ' + variantSha); process.exit(4); }
  // --enemy=1: 타임버짓 break 지점에 계수 코드 삽입(디스크 무변경, 브라우저에 서빙하는 본문만)
  let enemyPatched = false;
  if (USE_ENEMY) { const sig = '>(IS_MOBILE?8:12))break;'; let body = (variantBody || servedHtml).toString('utf8'); const n = body.split(sig).length - 1;
    if (n === 1) { body = body.replace(sig, '>(IS_MOBILE?8:12)){(window.__qaEB||(window.__qaEB=[])).push(_ei,ens.length);break}'); variantBody = Buffer.from(body, 'utf8'); enemyPatched = true; }
    else console.error('[enemy] break 시그니처 ' + n + '곳 — 계수 삽입 생략(updateE 계측만 수행)'); }

  const env = {
    label: LABEL, startedAt: new Date().toISOString(), root: ROOT, url: null, char: CHAR, variant: VARIANT,
    gitHead: git(['rev-parse', 'HEAD']), gitBranch: git(['rev-parse', '--abbrev-ref', 'HEAD']),
    gitDirty: git(['status', '--short', '--untracked-files=no']).split('\n').filter(Boolean),
    gameHtmlSha256: { disk: sha(diskHtml), served: sha(servedHtml), measured: variantSha, servedEqualsDisk: sha(diskHtml) === sha(servedHtml) },
    host: { cpu: os.cpus()[0].model, logical: os.cpus().length, ramGB: r1(os.totalmem() / 2 ** 30), freeGB: r1(os.freemem() / 2 ** 30), platform: os.platform() + ' ' + os.release() },
    origin: ORIGIN, seed: SEED, cpuThrottle: CPU_THROTTLE, enemyProbe: USE_ENEMY, enemyBreakPatched: enemyPatched, traceSegs: TRACE_SEGS,
    chromePath: CHROME, res: RES, scen: SCEN, enemiesTarget: ENEMIES, query: QUERY, inject: INJECT,
    qaOnly: ['god(HP refill 250ms)', 'mkEn top-up to enemiesTarget in COMBAT', 'save writes intercepted', '--mute-audio'],
  };

  // 시작 전 동시 부하 확인: 3초 평균 시스템 CPU가 상한 아래로 내려올 때까지 최대 90초 대기
  { let pct = 100, waited = 0; for (;;) { const a = cpuSnap(); await sleep(3000); const b = cpuSnap(); pct = r1(100 * (1 - (b.idle - a.idle) / Math.max(1, b.total - a.total))); if (pct <= MAXLOAD || waited >= 90) break; waited += 3; if (waited % 15 === 3) console.log('[' + LABEL + '] 시작 전 시스템 CPU ' + pct + '% > ' + MAXLOAD + '% — 대기'); }
    env.preLoad = { sysCpuPct: pct, waitedS: waited, limit: MAXLOAD, loadOk: pct <= MAXLOAD }; if (!env.preLoad.loadOk) console.log('[' + LABEL + '] 경고: 부하 ' + pct + '% 상태로 시작 — 이 실행은 비교 제외 대상'); }
  // --userdir=<폴더>: 프로필을 유지해 '두 번째 세션'(localStorage 학습 목록 등)을 재현. 없으면 실행마다 새 임시 프로필.
  const profile = ARG.get('userdir') ? path.resolve(ROOT, ARG.get('userdir')) : mkdtempSync(path.join(os.tmpdir(), 'exo-qa-prof-'));
  mkdirSync(profile, { recursive: true }); env.userdir = ARG.get('userdir') || '(temp)';
  const [rw, rh] = RES === 'fullscreen' ? [1920, 1080] : RES.split('x').map(Number);
  const ctx = await chromium.launchPersistentContext(profile, {
    headless: false, executablePath: CHROME, viewport: null,
    args: ['--window-position=0,0', `--window-size=${rw + 16},${rh + 140}`, '--mute-audio', '--enable-precise-memory-info', '--autoplay-policy=no-user-gesture-required',
      '--disable-features=CalculateNativeWinOcclusion', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--no-first-run', '--no-default-browser-check'],
  });
  const blocked = [];
  await ctx.route('**/api/save', route => { if (route.request().method() === 'POST') { blocked.push('POST /api/save'); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } return route.continue(); });
  await ctx.route('**/api/save/**', route => { if (route.request().method() === 'DELETE') { blocked.push('DELETE /api/save'); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } return route.continue(); });
  await ctx.route('**/api/mats', route => { if (route.request().method() === 'POST') { blocked.push('POST /api/mats'); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); } return route.continue(); });
  if (variantBody) await ctx.route(/\/game\.html(\?|$)/, route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: variantBody }));
  await ctx.addInitScript(INIT);
  if (CHAR === 'test') await ctx.addInitScript(`try{ if(!sessionStorage.getItem('__qaSeed')){ sessionStorage.setItem('__qaSeed','1'); localStorage.setItem('_dLv500','1'); } }catch(e){}`);

  const page = ctx.pages()[0] || await ctx.newPage();
  const errors = [], warns = [];
  page.on('pageerror', e => errors.push(String(e.message).slice(0, 300)));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error') errors.push('console: ' + t.slice(0, 300)); else if (/FRAME HITCH|context|CONTEXT|LOOP CRASH/.test(t)) warns.push(t.slice(0, 200)); });
  const cdp = await ctx.newCDPSession(page);
  let bcdp = null; try { bcdp = await ctx.browser()?.newBrowserCDPSession(); } catch {}
  await cdp.send('Performance.enable');

  // 창 크기 보정: inner 크기가 요청 해상도와 같아지도록
  const { windowId } = await cdp.send('Browser.getWindowForTarget');
  if (RES === 'fullscreen') await cdp.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'fullscreen' } });
  else {
    await page.goto('about:blank');
    for (let i = 0; i < 3; i++) {
      const inner = await page.evaluate(() => ({ w: innerWidth, h: innerHeight }));
      if (inner.w === rw && inner.h === rh) break;
      const b = (await cdp.send('Browser.getWindowForTarget')).bounds;
      await cdp.send('Browser.setWindowBounds', { windowId, bounds: { width: b.width + (rw - inner.w), height: b.height + (rh - inner.h) } });
      await sleep(400);
    }
  }
  const url = `${ORIGIN}/game.html${QUERY ? '?' + QUERY : ''}`;
  env.url = url;
  const tNav = Date.now();
  await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
  // 기본: Playwright 포커스 에뮬레이션 유지(다른 세션이 OS 포커스를 가져가도 게임의 blur→입력 해제가 측정을 깨지 않게).
  // --realfocus=1 이면 에뮬레이션을 끄고 실제 blur를 INVALID로 처리한다. 가시성(hidden)·resize·GL loss는 항상 검사.
  env.focusEmulation = ARG.get('realfocus') !== '1';
  if (!env.focusEmulation) { try { await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false }); } catch {} }
  await cdp.send('Page.bringToFront');
  // 인트로 컷신: 사용자 길게 누르기 스킵과 같은 종료 함수(_cutsceneEnd)로 넘긴다 (PRO→INTRO→종료, 최대 3회)
  await page.waitForFunction(() => { try { return _cutsceneState === 'INTRO_CUTSCENE' || (G.on && !_cutsceneState); } catch (e) { return false; } }, null, { timeout: 60000, polling: 250 }).catch(() => {});
  for (let i = 0; i < 3; i++) { await sleep(1500); const still = await page.evaluate(() => { try { if (_cutsceneState === 'INTRO_CUTSCENE') { _cutsceneEnd(); return true; } return false; } catch (e) { return false; } }); if (!still) break; }
  // 신규 캐릭터 인트로 가이드(1/4 '눈을 떠'): 화면의 실제 '건너뛰기' 버튼을 누른다
  for (let i = 0; i < 20; i++) { const st = await page.evaluate(() => { try { if (G.on && !_cutsceneState) return 'on'; } catch (e) {} const b = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /^(건너뛰기|Skip)$/.test(b.textContent.trim())); if (b) { b.click(); return 'clicked'; } return 'wait'; }).catch(() => 'wait'); if (st === 'on') break; await sleep(700); }
  const booted = await page.waitForFunction(() => { try { return typeof G !== 'undefined' && G.on && !G.paused && typeof P !== 'undefined' && P && !_cutsceneState && _bmcDone; } catch (e) { return false; } }, null, { timeout: 90000, polling: 250 }).then(() => true).catch(() => false);
  env.bootMs = Date.now() - tNav; env.booted = booted;
  if (!booted) {
    const st = await page.evaluate(() => { try { return { on: G.on, paused: G.paused, cut: _cutsceneState, bmc: _bmcDone, stage: G.stage }; } catch (e) { return { err: String(e) }; } });
    await page.screenshot({ path: path.join(OUT_DIR, LABEL + '-bootfail.png') });
    console.error('부트 실패', st, errors.slice(0, 5)); writeFileSync(path.join(OUT_DIR, LABEL + '.json'), JSON.stringify({ env, bootState: st, errors }, null, 1)); await ctx.close(); process.exit(3);
  }
  await sleep(3000);
  // 연습(패링 레슨) 패널: 실제 '연습 건너뛰기' 버튼 클릭
  env.lessonSkipped = await page.evaluate(() => { const b = document.querySelector('.lesson-skip'); if (b && b.offsetParent !== null) { b.click(); return true; } return false; });
  await sleep(6000); // 워밍업 큐·청크 빌드 안정화
  const wrapInfo = await page.evaluate(POST_BOOT);
  if (INJECT) { const r = await page.evaluate(readFileSync(path.resolve(ROOT, INJECT), 'utf8')); env.injectResult = r; }
  env.wrap = wrapInfo;
  if (CPU_THROTTLE > 1) { await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE }); env.cpuThrottle = CPU_THROTTLE; }
  await page.evaluate((seed) => { let a = seed | 0; window.__qaRnd = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }, SEED);
  if (USE_ENEMY) env.enemyWrap = await page.evaluate(() => { try {
    const Q = window.__qa; Q.en = { calls: 0, us: 0, max: 0, ticks: 0, perTick: [], big: 0 }; window.__qaEB = [];
    const _ue = window.updateE; let tickCalls = 0, tickUs = 0;
    window.updateE = function (e, sp) { const t = performance.now(); const r = _ue(e, sp); const d = (performance.now() - t) * 1000; if (Q.on) { Q.en.calls++; Q.en.us += d; if (d > Q.en.max) Q.en.max = d; if (d > 500) Q.en.big++; tickCalls++; tickUs += d; } return r; };
    const _u2 = window.update; window.update = function () { tickCalls = 0; tickUs = 0; const r = _u2.apply(this, arguments); if (Q.on) { Q.en.ticks++; if (Q.en.perTick.length < 40000) Q.en.perTick.push(tickCalls, tickUs); } return r; };
    return true; } catch (e) { return String(e); } });
  env.page = await page.evaluate(() => {
    const o = { inner: [innerWidth, innerHeight], outer: [outerWidth, outerHeight], dpr: devicePixelRatio, screen: [screen.width, screen.height], ua: navigator.userAgent, hidden: document.hidden, focus: document.hasFocus() };
    try { o.canvas = [C.width, C.height]; o.cssCanvas = [C.clientWidth, C.clientHeight]; o.VW = VW; o.VH = VH; } catch (e) {}
    try { o.opt = JSON.parse(JSON.stringify(OPT)); } catch (e) {}
    try { o.useGL = !!_useGL; o.useGPU = !!_useGPU; const gl = GL; const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info'); o.renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : ''; o.glVer = gl ? gl.getParameter(gl.VERSION) : ''; } catch (e) {}
    try { o.game = { stage: G.stage, lv: P.lv, charIdx: typeof _charIdx !== 'undefined' ? _charIdx : null, mapObjs: MAP_OBJS.length, ens: ens.length, demo: typeof _DEMO_MODE !== 'undefined' ? _DEMO_MODE : null, depthSlice: typeof _dsEnabled === 'function' ? _dsEnabled() : null, skills: SKILL_SLOTS.slice(0, 8), bag: INV.bag.length }; } catch (e) { o.gameErr = String(e); }
    o.domNodes = document.getElementsByTagName('*').length;
    try { o.texhot = { manifest: JSON.parse(localStorage.getItem('hell_texhot_v1') || '[]').length, bySrc: typeof _texBySrc !== 'undefined' && _texBySrc ? _texBySrc.size : null, preQ: typeof _texPreQ !== 'undefined' ? _texPreQ.length : null, wait: typeof _texPreWait !== 'undefined' ? _texPreWait.length : null, px: typeof _texPrePx !== 'undefined' ? _texPrePx : null }; } catch (e) {}
    return o;
  });
  console.log(`[${LABEL}] boot ${env.bootMs}ms inner ${env.page.inner} canvas ${env.page.canvas} dpr ${env.page.dpr} ${env.page.renderer} focus=${env.page.focus} hidden=${env.page.hidden} gpuQ=${wrapInfo.gpuQ}`);
  console.log(`[${LABEL}] game`, JSON.stringify(env.page.game), 'OPT q=' + env.page.opt?.quality, 'res=' + env.page.opt?.resScale, 'cap=' + env.page.opt?.fpsCap);
  await page.screenshot({ path: path.join(OUT_DIR, LABEL + '-00-boot.png') });

  // QA 무적 (세이브 차단 상태의 메모리 조작만)
  const god = setInterval(() => { page.evaluate(() => { try { if (P && P.hp < P.mhp) P.hp = P.mhp; if (P.hp <= 0) { P.hp = P.mhp; P.s = 'idle'; } } catch (e) {} }).catch(() => {}); }, 250);
  const cx = Math.round(env.page.inner[0] / 2), cy = Math.round(env.page.inner[1] / 2);

  async function gpuProcCpu() { if (!bcdp) return null; try { const { processInfo } = await bcdp.send('SystemInfo.getProcessInfo'); const o = {}; for (const p of processInfo) o[p.type] = (o[p.type] || 0) + p.cpuTime; return o; } catch { return null; } }
  async function perfMetrics() { const { metrics } = await cdp.send('Performance.getMetrics'); const o = {}; for (const m of metrics) o[m.name] = m.value; return o; }

  const results = [];
  async function segment(name, secs, action, opts = {}) {
    secs = secs * SECS;
    await cdp.send('Page.bringToFront');
    await page.evaluate(() => { const Q = window.__qa; Q.frames = []; Q.loaf = []; Q.lt = []; Q.ev = []; Q.mem = []; Q.marks = []; Q.slowGL = []; Q.gpu = []; Q.on = true; });
    let syncT = 0; if (USE_PROFILE) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 200 }); await cdp.send('Profiler.start'); syncT = await page.evaluate('(function __qaSyncMark(){const t=performance.now();while(performance.now()-t<5){}return t})()'); }
    const doTrace = bcdp && TRACE_SEGS.includes(name); let traceEv = null, traceSync = 0;
    if (doTrace) { traceEv = []; bcdp.on('Tracing.dataCollected', d => { for (const e of d.value) traceEv.push(e); });
      await bcdp.send('Tracing.start', { traceConfig: { recordMode: 'recordUntilFull', includedCategories: ['toplevel', 'gpu', 'viz', 'cc', 'blink.user_timing', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-gpu.service'] } });
      traceSync = await page.evaluate(() => { performance.mark('qaSync'); return performance.now(); }); }
    if (USE_ENEMY) await page.evaluate(() => { const Q = window.__qa; if (Q.en) { Q.en.calls = 0; Q.en.us = 0; Q.en.max = 0; Q.en.ticks = 0; Q.en.perTick = []; Q.en.big = 0; } window.__qaEB = []; });
    const m0 = await perfMetrics(), g0 = await gpuProcCpu(), c0 = cpuSnap(), t0 = Date.now();
    let actionInfo = null;
    try { actionInfo = await action(secs); } catch (e) { actionInfo = { error: String(e).slice(0, 300) }; }
    const remain = secs * 1000 - (Date.now() - t0); if (remain > 0) await sleep(remain);
    const wall = (Date.now() - t0) / 1000;
    await page.evaluate(() => { window.__qa.on = false; });
    const m1 = await perfMetrics(), g1 = await gpuProcCpu(), c1 = cpuSnap();
    let profile = null; if (USE_PROFILE) { profile = (await cdp.send('Profiler.stop')).profile; }
    if (doTrace) { const done = new Promise(r => bcdp.once('Tracing.tracingComplete', r)); await bcdp.send('Tracing.end'); await Promise.race([done, sleep(20000)]); bcdp.removeAllListeners('Tracing.dataCollected'); }
    const enemyRaw = USE_ENEMY ? await page.evaluate(() => ({ en: window.__qa.en, eb: window.__qaEB || [] })) : null;
    const raw = await page.evaluate(() => { const Q = window.__qa; Q.on = false; return { frames: Q.frames.map(f => [f.ts, f.js, f.u, f.d, f.nu, f.st, f.en]), loaf: Q.loaf, lt: Q.lt, ev: Q.ev, mem: Q.mem, marks: Q.marks, slowGL: Q.slowGL, gpu: Q.gpu, hidden: document.hidden, focus: document.hasFocus() }; });
    await page.screenshot({ path: path.join(OUT_DIR, `${LABEL}-${name}.png`) }).catch(() => {});
    const fr = raw.frames; const iv = []; for (let i = 1; i < fr.length; i++) iv.push(fr[i][0] - fr[i - 1][0]);
    // 게임이 실제로 draw한 프레임만의 간격 (fpsCap 사용 시 rAF 빈도와 구분)
    const drawn = fr.filter(f => f[3] > 0); const div = []; for (let i = 1; i < drawn.length; i++) div.push(drawn[i][0] - drawn[i - 1][0]);
    const cnt = (a, th) => a.filter(x => x > th).length;
    const heap = raw.mem.map(m => m.heap).filter(Boolean);
    const d = (k) => r2((m1[k] || 0) - (m0[k] || 0));
    const res = {
      name, secs: r1(wall), frames: fr.length, rafFps: r1(iv.length / wall), drawFps: r1(drawn.length / wall),
      interval: dist(iv), drawInterval: dist(div),
      over: { '8.4': cnt(iv, 8.4), '16.7': cnt(iv, 16.7), '33.4': cnt(iv, 33.4), '50': cnt(iv, 50), '100': cnt(iv, 100) },
      longFrameMsTotal: r1(iv.filter(x => x > 33.4).reduce((a, b) => a + b, 0)),
      js: dist(fr.map(f => f[1])), update: dist(fr.filter(f => f[4] > 0).map(f => f[2])), draw: dist(drawn.map(f => f[3])),
      gpuMs: raw.gpu.length ? dist(raw.gpu) : null,
      loaf: { n: raw.loaf.length, totalMs: r1(raw.loaf.reduce((a, b) => a + b.dur, 0)), top: raw.loaf.sort((a, b) => b.dur - a.dur).slice(0, 5).map(l => ({ dur: r1(l.dur), render: r1(l.render), style: r1(l.style), scripts: l.scripts.map(s => `${s.n}:${r1(s.d)}${s.fsl > 1 ? '(fsl ' + r1(s.fsl) + ')' : ''}`) })) },
      longtasks: { n: raw.lt.length, maxMs: r1(Math.max(0, ...raw.lt.map(l => l.dur))) },
      cdp: { scriptS: d('ScriptDuration'), styleS: d('RecalcStyleDuration'), layoutS: d('LayoutDuration'), taskS: d('TaskDuration'), styleCount: d('RecalcStyleCount'), layoutCount: d('LayoutCount'), nodes: m1.Nodes, listeners: m1.JSEventListeners, jsHeapMB: r1((m1.JSHeapUsedSize || 0) / 2 ** 20) },
      procCpuS: g0 && g1 ? { gpu: r2((g1.GPU || 0) - (g0.GPU || 0)), renderer: r2((g1.renderer || 0) - (g0.renderer || 0)), browser: r2((g1.browser || 0) - (g0.browser || 0)) } : null,
      sysCpuPct: r1(100 * (1 - (c1.idle - c0.idle) / Math.max(1, c1.total - c0.total))),
      heapMB: heap.length ? { start: r1(heap[0] / 2 ** 20), end: r1(heap[heap.length - 1] / 2 ** 20), min: r1(Math.min(...heap) / 2 ** 20), max: r1(Math.max(...heap) / 2 ** 20) } : null,
      domNodes: raw.mem.length ? [raw.mem[0].nodes, raw.mem[raw.mem.length - 1].nodes] : null,
      ens: raw.mem.length ? { min: Math.min(...raw.mem.map(m => m.ens ?? 0)), max: Math.max(...raw.mem.map(m => m.ens ?? 0)) } : null,
      projs: raw.mem.length ? { max: Math.max(...raw.mem.map(m => m.projs ?? 0)), pMax: Math.max(...raw.mem.map(m => m.pProjs ?? 0)) } : null,
      pausedSamples: raw.mem.filter(m => m.paused).length, memSamples: raw.mem.length,
      events: raw.ev.map(e => e.type), valid: !raw.hidden && raw.focus && !raw.ev.some(e => /visibility|blur|resize|glLost/.test(e.type)),
      slowGL: raw.slowGL.slice().sort((a, b) => b.ms - a.ms).slice(0, 40).map(s => `${r1(s.ms)}ms ${s.fn} ${s.src || ''} @${r1((s.t - (fr[0] ? fr[0][5] : 0)) / 1000)}s`),
      texUploads: (() => { const tx = raw.slowGL.filter(s => /^tex/.test(s.fn)); const by = new Map(); for (const s of tx) { const k = s.src; const o = by.get(k) || { n: 0, ms: 0, max: 0 }; o.n++; o.ms += s.ms; o.max = Math.max(o.max, s.ms); by.set(k, o); } return { n: tx.length, totalMs: r1(tx.reduce((a, b) => a + b.ms, 0)), over8: tx.filter(s => s.ms > 8).length, by: [...by.entries()].sort((a, b) => b[1].ms - a[1].ms).slice(0, 40).map(e => `${r1(e[1].ms)}ms n${e[1].n} max${r1(e[1].max)} ${e[0]}`) }; })(),
      marks: raw.marks, action: actionInfo,
      // 긴 간격 iv[i]=ts[i+1]-ts[i] 는 프레임 i의 작업(JS+렌더 파이프라인)이 만든다 → 프레임 i의 js/u/d를 원인으로 표기
      worst: fr.slice(0, -1).map((f, i) => ({ iv: fr[i + 1][0] - f[0], js: f[1], u: f[2], d: f[3], nu: f[4], at: r1((f[0] - fr[0][0]) / 1000) })).sort((a, b) => b.iv - a.iv).slice(0, 10).map(w => ({ iv: r1(w.iv), js: r1(w.js), u: r1(w.u), d: r1(w.d), nu: w.nu, atS: w.at })),
      _iv: iv.map(r1),
    };
    if (doTrace && traceEv) { // JS 비중이 30% 미만인 긴 간격 상위 6개: [프레임 JS 종료, 다음 프레임 JS 시작]
      const wins = []; for (let i = 0; i < fr.length - 1; i++) { const ivv = fr[i + 1][0] - fr[i][0]; if (ivv > 50 && fr[i][1] < ivv * 0.3) wins.push({ iv: ivv, label: 'gap@' + r1((fr[i][0] - fr[0][0]) / 1000) + 's iv' + r1(ivv) + ' js' + r1(fr[i][1]), st: fr[i][6], en: fr[i + 1][5] }); }
      wins.sort((a, b) => b.iv - a.iv); res.trace = analyzeTrace(traceEv, traceSync, wins.slice(0, 6)); res.trace.candidates = wins.length;
      if (ARG.get('tracesave') === '1') { try { writeFileSync(path.join(OUT_DIR, LABEL + '-' + name + '-trace.json'), JSON.stringify({ traceEvents: traceEv })); } catch (e) {} } }
    if (enemyRaw && enemyRaw.en) { const en = enemyRaw.en; const tc = [], tu = []; for (let i = 0; i < en.perTick.length; i += 2) { tc.push(en.perTick[i]); tu.push(en.perTick[i + 1] / 1000); }
      const brIdx = [], brLen = []; for (let i = 0; i < enemyRaw.eb.length; i += 2) { brIdx.push(enemyRaw.eb[i]); brLen.push(enemyRaw.eb[i + 1]); }
      const tiers = raw.mem.filter(m => m.tiers).map(m => m.tiers); const tmax = k => tiers.length ? Math.max(...tiers.map(t => t[k])) : null, tavg = k => tiers.length ? r1(tiers.reduce((a, t) => a + t[k], 0) / tiers.length) : null;
      res.enemy = { ticks: en.ticks, updateECalls: en.calls, usPerCall: en.calls ? r1(en.us / en.calls) : 0, usMaxCall: r1(en.max), callsOver500us: en.big, callsPerTick: dist(tc), updateEMsPerTick: dist(tu), ticksOver12ms: tu.filter(x => x > 12).length, ticksOver6ms: tu.filter(x => x > 6).length,
        budgetBreaks: brIdx.length, breakPatched: enemyPatched, breakIdx: brIdx.length ? dist(brIdx) : null, starvedPerBreak: brIdx.length ? dist(brIdx.map((v, i) => brLen[i] - v)) : null,
        tierAvg: { t1: tavg(0), t2: tavg(1), t3: tavg(2), t4: tavg(3) }, tierMax: { t1: tmax(0), t2: tmax(1), t3: tmax(2), t4: tmax(3) } }; }
    if (actionInfo && actionInfo.invalidReason) { res.valid = false; res.invalidReason = actionInfo.invalidReason; }
    if (profile) { const wins = fr.slice().sort((a, b) => b[1] - a[1]).slice(0, 6).filter(f => f[1] > 8).map(f => ({ label: 'frame@' + r1((f[0] - fr[0][0]) / 1000) + 's js' + r1(f[1]), st: f[5], en: f[6] }));
      for (const o of (actionInfo && actionInfo.ops) || []) if (o.ms > 40) wins.push({ label: 'op ' + o.label, st: o.t0, en: o.t1 });
      res.profile = analyzeProfile(profile, syncT, wins); }
    results.push(res);
    if (res.enemy) console.log('[' + LABEL + '] ' + name.padEnd(8) + ' enemy: ticks ' + res.enemy.ticks + ' updateE ' + res.enemy.usPerCall + 'µs/call (max ' + res.enemy.usMaxCall + ') calls/tick p50 ' + res.enemy.callsPerTick.p50 + ' p95 ' + res.enemy.callsPerTick.p95 + ' | updateE ms/tick p95 ' + res.enemy.updateEMsPerTick.p95 + ' max ' + res.enemy.updateEMsPerTick.max + ' | >12ms ticks ' + res.enemy.ticksOver12ms + ' | budget breaks ' + res.enemy.budgetBreaks + ' | T1 avg ' + res.enemy.tierAvg.t1 + ' max ' + res.enemy.tierMax.t1);
    if (res.trace) console.log('[' + LABEL + '] ' + name.padEnd(8) + ' trace: events ' + res.trace.events + ' sync ' + res.trace.syncOk + ' gap 후보 ' + res.trace.candidates);
    const g = res.gpuMs ? ` gpu p50 ${res.gpuMs.p50} p95 ${res.gpuMs.p95} max ${res.gpuMs.max}` : '';
    console.log(`[${LABEL}] ${name.padEnd(8)} ${res.valid ? 'OK ' : 'INVALID'} fps ${res.drawFps} | iv p50 ${res.interval.p50} p95 ${res.interval.p95} p99 ${res.interval.p99} max ${res.interval.max} | >16.7:${res.over['16.7']} >33:${res.over['33.4']} >50:${res.over['50']} >100:${res.over['100']} | js p50 ${res.js.p50} p95 ${res.js.p95} p99 ${res.js.p99} max ${res.js.max} | U p95 ${res.update.p95} D p95 ${res.draw.p95}${g} | style ${res.cdp.styleS}s layout ${res.cdp.layoutS}s | LoAF ${res.loaf.n} | heap ${res.heapMB?.start}→${res.heapMB?.end}MB | ens ${res.ens?.min}~${res.ens?.max} | sysCPU ${res.sysCpuPct}%`);
    return res;
  }

  const topUp = (n) => page.evaluate((n) => {
    try {
      let alive = 0; const kinds = [];
      for (let i = 0; i < ens.length; i++) { const e = ens[i]; if (e && e.alive) { alive++; if (!e.ib && kinds.length < 24) kinds.push([e.etype, e.el]); } }
      if (!kinds.length) kinds.push([0, 0]);
      let made = 0, guard = 0;
      while (alive < n && guard < n * 4) { guard++; const rnd = window.__qaRnd || Math.random; const a = rnd() * Math.PI * 2, d = 140 + rnd() * 420; const x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
        if (typeof isW === 'function' && isW(x, y)) continue; const k = kinds[guard % kinds.length]; const e = mkEn(x, y, G.stage, k[0], false, k[1], -1); if (e) { e.alive = true; ens.push(e); alive++; made++; } }
      return { alive, made };
    } catch (e) { return { err: String(e) }; }
  }, n);

  for (const s of SCEN) {
    if (s === 'IDLE') await segment('IDLE', 10, async () => null);
    else if (s === 'MOVE') await segment('MOVE', 20, async (secs) => {
      const p0 = await page.evaluate(() => [P.x, P.y]);
      const plan = [['KeyW', .3], ['KeyD', .15], ['KeyW', .2], ['KeyA', .2], ['KeyS', .15]];
      for (const [k, frac] of plan) { await page.keyboard.down(k); await sleep(secs * 1000 * frac); await page.keyboard.up(k); }
      const p1 = await page.evaluate(() => [P.x, P.y]);
      return { from: p0.map(Math.round), to: p1.map(Math.round), path: 'W30% D15% W20% A20% S15%' };
    });
    else if (/^COMBAT[0-9]*$/.test(s)) { // COMBAT=첫 교전(콜드), COMBAT2..=같은 세션의 이어지는 교전(웜)
      const pre = await topUp(ENEMIES); await sleep(2500); // 접근·스폰 연출 settle (측정 제외)
      await segment(s, 20, async (secs) => {
        const k0 = await page.evaluate(() => G.kills);
        await page.mouse.move(cx + 180, cy - 40); await page.mouse.down();
        const keys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Space', 'KeyF']; let i = 0, casts = 0; const tEnd = Date.now() + secs * 1000 - 300; let lastTop = 0;
        while (Date.now() < tEnd) {
          await page.keyboard.press(keys[i++ % keys.length], { delay: 40 }); casts++;
          const ang = i * 0.9; await page.mouse.move(cx + Math.cos(ang) * 200, cy + Math.sin(ang) * 140);
          if (Date.now() - lastTop > 1000) { lastTop = Date.now(); await topUp(ENEMIES); }
          await sleep(560);
        }
        await page.mouse.up();
        const k1 = await page.evaluate(() => G.kills);
        return { preSpawn: pre, keyPresses: casts, cadence: '키 1회/0.6s (1~4,Space,F 순환) + 좌클릭 홀드', kills: k1 - k0 };
      });
    }
    else if (s === 'PANELS') await segment('PANELS', 24, async () => {
      const ops = [];
      const op = async (label, fn, settle = 1200, hold = 0) => { const pm0 = await perfMetrics(); const t = await page.evaluate(() => performance.now()); await fn(); const st = await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r({ t: performance.now(), inv: document.getElementById('invPanel')?.classList.contains('on'), set: document.getElementById('settings')?.classList.contains('on'), page: document.getElementById('invPanel')?.dataset.inventoryPage, nodes: document.getElementsByTagName('*').length }))))); const pm1 = await perfMetrics(); const dd = k => r1(((pm1[k] || 0) - (pm0[k] || 0)) * 1000); ops.push({ label, ms: r1(st.t - t), keyHoldMs: hold, afterKeyMs: r1(st.t - t - hold), t0: t, t1: st.t, inv: st.inv, set: st.set, page: st.page, nodes: st.nodes, scriptMs: dd('ScriptDuration'), styleMs: dd('RecalcStyleDuration'), layoutMs: dd('LayoutDuration') }); await sleep(settle); };
      // 입력이 실제로 반영됐는지 확인한다. 미반영이면 0.6초 뒤 1회 재시도, 그래도 아니면 구간 무효(수치를 패널 비용으로 쓰지 않는다).
      const failures = [];
      const expect = async (label, fn, want, settle) => { const hold = /^(Tab|Esc)/.test(label) ? 70 : 0; await op(label, fn, settle, hold); let o = ops[ops.length - 1];
        if (want(o)) return true;
        const diag = await page.evaluate(() => { try { return { paused: !!G.paused, on: !!G.on, ps: P && P.s, panels: [...document.querySelectorAll('.panel.on')].map(n => n.id), active: document.activeElement && (document.activeElement.id || document.activeElement.tagName), lesson: !!document.querySelector('.lesson-skip') }; } catch (e) { return { err: String(e) }; } });
        o.retry = true; o.diag = diag; await sleep(600); await op(label + ' (재시도)', fn, settle, hold); o = ops[ops.length - 1];
        if (want(o)) return true; failures.push(label); await page.screenshot({ path: path.join(OUT_DIR, LABEL + '-PANELS-fail-' + failures.length + '.png') }).catch(() => {}); return false; };
      await page.mouse.up().catch(() => {}); await page.mouse.move(cx, cy - 200); await sleep(300);
      for (let rep = 0; rep < 2; rep++) {
        if (!await expect('Tab 열기', () => page.keyboard.press('Tab', { delay: 70 }), o => o.inv === true)) break;
        for (const pg of ['ossuary', 'crystals', 'storage', 'equipment']) await expect('탭 ' + pg, () => page.evaluate(pg => { const b = document.querySelector('#invPanel button[data-page="' + pg + '"]'); if (b) b.click(); return !!b; }, pg), o => o.page === pg, 900);
        if (!await expect('Tab 닫기', () => page.keyboard.press('Tab', { delay: 70 }), o => o.inv === false, 900)) break;
        if (!await expect('Esc 설정 열기', () => page.keyboard.press('Escape', { delay: 70 }), o => o.set === true)) break;
        if (!await expect('Esc 설정 닫기', () => page.keyboard.press('Escape', { delay: 70 }), o => o.set === false, 900)) break;
      }
      await page.evaluate(() => { try { if (G.paused) closeAllPanels(); } catch (e) {} });
      return failures.length ? { ops, invalidReason: '패널 입력 미반영: ' + failures.join(', ') } : { ops };
    });
    else if (s === 'POST') { await topUp(Math.min(ENEMIES, 60)); await segment('POST', 12, async () => null); }
  }
  clearInterval(god);
  // Segment frame recording has stopped: diagnostic serialization is outside timings.
  const firstKill = await page.evaluate(() => {
    const probe = window.__qaFirstKill;
    if (!probe) return null;
    const records = probe.stop();
    return { records, missing: probe.missing, startedAt: probe.startedAt, endedAt: probe.endedAt,
      totalCalls: probe.totalCalls, skippedFast2d: probe.skippedFast2d,
      droppedCount: probe.droppedCount, truncated: probe.truncated,
      firstDeathCandidateAt: probe.firstDeathCandidateAt, stopped: probe.stopped };
  }).catch(error => ({ captureError: String(error) }));
  env.texhotEnd = await page.evaluate(() => { try { _texHotSave(); return { manifest: JSON.parse(localStorage.getItem('hell_texhot_v1') || '[]').map(e => e[0]), bySrc: _texBySrc ? _texBySrc.size : null }; } catch (e) { return null; } }).catch(() => null);
  env.finishedAt = new Date().toISOString(); env.blockedWrites = blocked.length; env.errors = errors.slice(0, 20); env.warns = warns.slice(0, 20);
  const out = path.join(OUT_DIR, LABEL + '.json');
  writeFileSync(out, JSON.stringify({ env, results, firstKill }, null, 1));
  console.log(`[${LABEL}] saved ${out} | blocked writes ${blocked.length} | pageerrors ${errors.length}`);
  await ctx.close();
}
main().catch(e => { console.error(e); process.exit(1); });
