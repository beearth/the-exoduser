// QA → ANIMVFX 인계용: 정규 부팅·정규 루프(headed, visible)에서 몹 피격 플래시를 프레임 단위로 캡처한다.
//  - 부팅: 실제 game.html 정규 경로(컷신은 길게 누르기 스킵과 같은 _cutsceneEnd, 가이드·연습은 화면 버튼 클릭). 강제 부팅 플래그·수동 loop() 구동 없음.
//  - 캡처: loop() 1회가 끝난 직후(그 프레임의 GL flush 완료 뒤) 캔버스에서 몹 주변 220×220을 createImageBitmap으로 떠서 연속 프레임 시트로 저장.
//  - QA 조작(명시): 몹 추가 스폰(mkEn, 시드 고정, 2마리 중 1마리는 HP 1e12로 비치명 피격 관찰용), HP 보충, 저장 요청 차단, 음소거. 공격은 실제 마우스 좌클릭 홀드.
// 사용: node tools/qa_vfx_hitflash_capture.mjs --label=vfx-cap0 [--fpscap=60] [--char=new|test] [--variant=<html>]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const ARG = new Map(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? '1'] : [a, '1']; }));
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const LABEL = ARG.get('label') || 'vfx';
const CHAR = ARG.get('char') || 'new';
const FPSCAP = Number(ARG.get('fpscap') || 0);
const VARIANT = ARG.get('variant') || 'disk';
const SECS = Number(ARG.get('secs') || 22);
const OUT = path.resolve(ROOT, ARG.get('out') || 'tmp/qa-perf-20261001/vfx');
const ORIGIN = 'http://127.0.0.1:3333';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cpu = () => { let idle = 0, total = 0; for (const c of os.cpus()) { for (const k in c.times) total += c.times[k]; idle += c.times.idle; } return { idle, total }; };

mkdirSync(OUT, { recursive: true });
const served = Buffer.from(await (await fetch(ORIGIN + '/game.html')).arrayBuffer());
const body = VARIANT === 'disk' ? null : readFileSync(path.resolve(ROOT, VARIANT));
const sha = createHash('sha256').update(body || served).digest('hex');
const c0 = cpu(); await sleep(3000); const c1 = cpu();
const preLoad = Math.round(1000 * (1 - (c1.idle - c0.idle) / Math.max(1, c1.total - c0.total))) / 10;

const ctx = await chromium.launchPersistentContext(mkdtempSync(path.join(os.tmpdir(), 'exo-qa-vfx-')), {
  headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', viewport: null,
  args: ['--window-position=0,0', '--window-size=1936,1220', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--disable-features=CalculateNativeWinOcclusion', '--no-first-run', '--no-default-browser-check'],
});
for (const pat of ['**/api/save', '**/api/mats']) await ctx.route(pat, r => r.request().method() === 'POST' ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }) : r.continue());
if (body) await ctx.route(/\/game\.html(\?|$)/, r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }));
if (CHAR === 'test') await ctx.addInitScript(`try{ if(!sessionStorage.getItem('__qaSeed')){ sessionStorage.setItem('__qaSeed','1'); localStorage.setItem('_dLv500','1'); } }catch(e){}`);
const page = ctx.pages()[0];
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
const cdp = await ctx.newCDPSession(page);
await page.goto(ORIGIN + '/game.html', { waitUntil: 'commit' });
await cdp.send('Page.bringToFront');
await page.waitForFunction(() => { try { return _cutsceneState === 'INTRO_CUTSCENE' || (G.on && !_cutsceneState); } catch (e) { return false; } }, null, { timeout: 60000, polling: 250 }).catch(() => {});
for (let i = 0; i < 3; i++) { await sleep(1500); const still = await page.evaluate(() => { try { if (_cutsceneState === 'INTRO_CUTSCENE') { _cutsceneEnd(); return true; } } catch (e) {} return false; }); if (!still) break; }
for (let i = 0; i < 20; i++) { const st = await page.evaluate(() => { try { if (G.on && !_cutsceneState) return 'on'; } catch (e) {} const b = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /^(건너뛰기|Skip)$/.test(b.textContent.trim())); if (b) { b.click(); return 'clicked'; } return 'wait'; }).catch(() => 'wait'); if (st === 'on') break; await sleep(700); }
await page.waitForFunction(() => { try { return G.on && !G.paused && P && !_cutsceneState && _bmcDone; } catch (e) { return false; } }, null, { timeout: 90000, polling: 250 });
await sleep(3000);
await page.evaluate(() => { const b = document.querySelector('.lesson-skip'); if (b && b.offsetParent !== null) b.click(); });
await sleep(6000);

const boot = await page.evaluate((cap) => {
  if (cap) OPT.fpsCap = cap;
  return { hidden: document.hidden, visibility: document.visibilityState, focus: document.hasFocus(), inner: [innerWidth, innerHeight], canvas: [C.width, C.height], useGL: !!_useGL, ensWarmDone: typeof _ensWarmDone !== 'undefined' ? _ensWarmDone : null, bootLoadActive: typeof _bootLoadActive !== 'undefined' ? _bootLoadActive : null, lv: P.lv, stage: G.stage, fpsCap: OPT.fpsCap, quality: OPT.quality };
}, FPSCAP);
console.log(`[${LABEL}] boot`, JSON.stringify(boot), 'sha', sha.slice(0, 16), 'preLoad', preLoad + '%');

// ── 페이지 계측: 정규 loop() 뒤에서만 읽는다 (loop/draw를 직접 호출하지 않음) ──
await page.evaluate(() => {
  const V = window.__vfx = { seqs: [], frames: 0, glSeen: 0, d2Seen: 0, done: false, counts: { single: 0, rehit: 0, death: 0 }, dts: [] };
  const CW = 220, PRE = 3, POST_HIT = 14, POST_DEATH = 26, MAXSEQ = 3;
  const tr = new Map(); // enemy → { ring:[], seq:null, prevPost:0 }
  const _draw = window.draw, _loop = window.loop; let pre = new Map(), lastTs = 0;
  window.draw = function () { pre = new Map(); for (let i = 0; i < ens.length; i++) { const e = ens[i]; if (e && tr.has(e)) pre.set(e, e._hitFlash || 0); } return _draw.apply(this, arguments); };
  window.loop = function (ts) {
    const r = _loop.call(this, ts);
    if (V.done || !G.on || G.paused) return r;
    V.frames++; if (lastTs) { if (V.dts.length < 4000) V.dts.push(ts - lastTs); } lastTs = ts;
    // 추적 대상: 플레이어 420px 안의 비보스 몹 최대 5 (죽은 뒤에도 시퀀스가 끝날 때까지 유지)
    if (tr.size < 5) for (let i = 0; i < ens.length && tr.size < 5; i++) { const e = ens[i]; if (!e || !e.alive || e.ib || tr.has(e)) continue; const dx = e.x - P.x, dy = e.y - P.y; if (dx * dx + dy * dy < 176400) tr.set(e, { ring: [], seq: null, prevPost: 0, id: V.frames + ':' + i }); }
    for (const [e, t] of tr) {
      const p = pre.has(e) ? pre.get(e) : null; if (p === null) continue; // 이번 프레임 draw 전에 추적 중이던 대상만
      const sx = Math.round(VW * .5 + (e.x - G.cam.x) - CW / 2), sy = Math.round(VH * .5 + (e.y - G.cam.y) - CW / 2);
      const on = sx > -CW && sy > -CW && sx < C.width && sy < C.height;
      const fr = { ts, pre: p, post: e._hitFlash || 0, gl: e._ensGLMode, m8: !!e._mob8dir, alive: !!e.alive, s: e.s, hp: Math.round(e.hp), rehit: t.prevPost > 0 && p > t.prevPost, bmp: on ? createImageBitmap(C, Math.max(0, sx), Math.max(0, sy), CW, CW).catch(() => null) : null };
      if (e._ensGLMode === 1) V.glSeen++; else V.d2Seen++;
      if (!t.seq) {
        t.ring.push(fr); if (t.ring.length > PRE + 1) { const old = t.ring.shift(); if (old.bmp) old.bmp.then(b => b && b.close()); }
        const started = p > 0 && t.prevPost === 0;
        if (started || !e.alive) t.seq = { frames: t.ring.slice(), remain: POST_HIT, kind: 'single', et: e.etype, r: e.r, id: t.id, deathAt: -1 };
      } else {
        t.seq.frames.push(fr); t.seq.remain--;
        if (fr.rehit && t.seq.kind === 'single') { t.seq.kind = 'rehit'; t.seq.remain = Math.max(t.seq.remain, POST_HIT); }
      }
      if (t.seq && !e.alive && t.seq.deathAt < 0) { t.seq.deathAt = t.seq.frames.length - 1; t.seq.kind = 'death'; t.seq.remain = POST_DEATH; }
      if (t.seq && t.seq.remain <= 0) {
        const k = t.seq.kind; if (V.counts[k] < MAXSEQ) { V.counts[k]++; V.seqs.push(t.seq); } else for (const f of t.seq.frames) if (f.bmp) f.bmp.then(b => b && b.close());
        if (!e.alive) tr.delete(e); else { t.seq = null; t.ring = []; }
      }
      t.prevPost = fr.post;
      if (!e.alive && !t.seq) tr.delete(e);
    }
    if (V.counts.single >= MAXSEQ && V.counts.rehit >= MAXSEQ && V.counts.death >= MAXSEQ) V.done = true;
    return r;
  };
});

// ── QA 스폰(시드 고정) + 실제 좌클릭 홀드 공격 ──
const god = setInterval(() => { page.evaluate(() => { try { if (P.hp < P.mhp) P.hp = P.mhp; } catch (e) {} }).catch(() => {}); }, 250);
const spawn = () => page.evaluate(() => { try {
  if (!window.__qaRnd) { let a = 20261001; window.__qaRnd = function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  let near = 0; const kinds = []; for (const e of ens) { if (!e || !e.alive) continue; if (!e.ib && kinds.length < 12) kinds.push([e.etype, e.el]); const dx = e.x - P.x, dy = e.y - P.y; if (dx * dx + dy * dy < 176400) near++; }
  if (!kinds.length) kinds.push([0, 0]); let g = 0;
  while (near < 10 && g++ < 60) { const a = window.__qaRnd() * 6.283, d = 120 + window.__qaRnd() * 220, x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d; if (isW(x, y)) continue; const k = kinds[g % kinds.length]; const e = mkEn(x, y, G.stage, k[0], false, k[1], -1); if (e) { e.alive = true; if (g % 2 === 0) { e.hp = e.mhp = 1e12; e._qaDurable = 1; } ens.push(e); near++; } }
  return near; } catch (e) { return String(e); } });
await spawn(); await sleep(1500);
const cx = Math.round(boot.inner[0] / 2), cy = Math.round(boot.inner[1] / 2);
await page.mouse.move(cx + 120, cy); await page.mouse.down();
const tEnd = Date.now() + SECS * 1000; let shotDone = false;
while (Date.now() < tEnd) {
  // 가장 가까운 몹 쪽으로 조준(실제 마우스 이동)
  const aim = await page.evaluate(() => { try { let b = null, bd = 1e12; for (const e of ens) { if (!e || !e.alive || e.ib) continue; const dx = e.x - P.x, dy = e.y - P.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; b = e; } } const V = window.__vfx; return { a: b ? [b.x - G.cam.x, b.y - G.cam.y] : null, done: V.done, counts: V.counts }; } catch (e) { return { a: null }; } });
  if (aim.a) await page.mouse.move(cx + aim.a[0], cy + aim.a[1]);
  if (!shotDone && aim.counts && aim.counts.single >= 1) { shotDone = true; await page.screenshot({ path: path.join(OUT, LABEL + '-fullscreen.png') }).catch(() => {}); }
  if (aim.done) break;
  await spawn(); await sleep(220);
}
await page.mouse.up(); clearInterval(god);

// ── 시트 생성: 시퀀스당 1장 (프레임 가로 나열 + pre 값/GL 모드/생존 표기 + 평균 휘도) ──
const result = await page.evaluate(async () => {
  const V = window.__vfx; V.done = true; const out = [];
  const lum = (ctx, w, h) => { const d = ctx.getImageData(0, 0, w, h).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] * .2126 + d[i + 1] * .7152 + d[i + 2] * .0722; return Math.round(s / (w * h) * 10) / 10; };
  for (const q of V.seqs) {
    const n = q.frames.length, CW = 220, PAD = 4, H = CW + 46, COLS = 10, ROWS = Math.ceil(n / COLS);
    const cv = document.createElement('canvas'); cv.width = Math.min(n, COLS) * (CW + PAD); cv.height = ROWS * H; const x = cv.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#111'; x.fillRect(0, 0, cv.width, cv.height); const tmp = document.createElement('canvas'); tmp.width = tmp.height = CW; const tx = tmp.getContext('2d', { willReadFrequently: true });
    const rows = [];
    for (let i = 0; i < n; i++) { const f = q.frames[i]; const b = f.bmp ? await f.bmp : null; let L = null;
      if (b) { tx.clearRect(0, 0, CW, CW); tx.drawImage(b, 0, 0); L = lum(tx, CW, CW); x.drawImage(b, (i % COLS) * (CW + PAD), ~~(i / COLS) * H); b.close(); }
      x.fillStyle = f.pre > 0 ? '#ffd27a' : '#9aa'; x.font = '13px monospace';
      x.fillText('#' + i + ' hf=' + f.pre + (f.rehit ? ' REHIT' : ''), (i % COLS) * (CW + PAD) + 3, ~~(i / COLS) * H + CW + 14);
      x.fillText('gl=' + f.gl + (f.alive ? ' alive' : ' DEAD') + ' ' + f.s, (i % COLS) * (CW + PAD) + 3, ~~(i / COLS) * H + CW + 28);
      x.fillText('L=' + L + ' dt=' + (i ? Math.round((f.ts - q.frames[i - 1].ts) * 10) / 10 : 0), (i % COLS) * (CW + PAD) + 3, ~~(i / COLS) * H + CW + 42);
      rows.push({ i, hf: f.pre, post: f.post, gl: f.gl, m8: f.m8, alive: f.alive, s: f.s, hp: f.hp, rehit: f.rehit, lum: L, dt: i ? Math.round((f.ts - q.frames[i - 1].ts) * 10) / 10 : 0 });
    }
    out.push({ kind: q.kind, etype: q.et, r: q.r, deathAt: q.deathAt, rows, png: cv.toDataURL('image/png') });
  }
  const d = V.dts.slice().sort((a, b) => a - b);
  return { seqs: out, frames: V.frames, glSeen: V.glSeen, d2Seen: V.d2Seen, counts: V.counts, dtP50: d.length ? d[d.length >> 1] : 0, hidden: document.hidden, visibility: document.visibilityState };
});
const c2 = cpu();
const summary = { label: LABEL, at: new Date().toISOString(), sha256: sha, variant: VARIANT, char: CHAR, preLoadPct: preLoad, boot, frames: result.frames, frameDtP50: Math.round(result.dtP50 * 10) / 10, glSamples: result.glSeen, twoDSamples: result.d2Seen, counts: result.counts, endHidden: result.hidden, endVisibility: result.visibility, pageerrors: errors, seqs: [] };
result.seqs.forEach((q, i) => { const f = `${LABEL}-${q.kind}-${i}.png`; writeFileSync(path.join(OUT, f), Buffer.from(q.png.split(',')[1], 'base64')); summary.seqs.push({ file: f, kind: q.kind, etype: q.etype, r: q.r, deathAt: q.deathAt, rows: q.rows }); });
writeFileSync(path.join(OUT, LABEL + '.json'), JSON.stringify(summary, null, 1));
console.log(`[${LABEL}] frames ${result.frames} dtP50 ${summary.frameDtP50}ms GL샘플 ${result.glSeen} 2D샘플 ${result.d2Seen} seq ${JSON.stringify(result.counts)} hidden=${result.hidden} errors ${errors.length}`);
for (const q of summary.seqs) console.log('  ' + q.file + ' et' + q.etype + ' | hf: ' + q.rows.map(r => r.hf + (r.rehit ? '!' : '') + (r.alive ? '' : 'x')).join(' ') + ' | gl: ' + [...new Set(q.rows.map(r => r.gl))].join('/') + ' | L: ' + q.rows.map(r => r.lum).join(' '));
await ctx.close();
