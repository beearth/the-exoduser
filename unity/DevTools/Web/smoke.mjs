// Usage: node smoke.mjs <buildDir> <outDir> [port] [url]   (headless, muted)
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire('G:/exoduser/package.json');
const { chromium } = require('playwright');
const [buildDir, outDir, portArg, remote] = process.argv.slice(2);
const port = Number(portArg || 3360);
fs.mkdirSync(outDir, { recursive: true });
const mime = { '.html':'text/html', '.js':'application/javascript', '.wasm':'application/wasm', '.data':'application/octet-stream', '.json':'application/json', '.png':'image/png', '.ico':'image/x-icon', '.css':'text/css', '.mp4':'video/mp4', '.ttf':'font/ttf' };
let served = 0; const served_files = {};
let server = null;
if (!remote) {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html';
    const f = path.join(buildDir, p);
    if (!f.startsWith(buildDir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
    const st = fs.statSync(f); served += st.size; served_files[p] = st.size;
    const enc = f.endsWith('.br') ? 'br' : f.endsWith('.gz') ? 'gzip' : null; const base = enc ? f.slice(0, f.lastIndexOf('.')) : f;
    const hdr = enc ? { 'Content-Encoding': enc } : {};
    res.writeHead(200, { ...hdr, 'Content-Type': mime[path.extname(base)] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-store' });
    fs.createReadStream(f).pipe(res);
  }).listen(port, '127.0.0.1');
}
const url = remote || `http://127.0.0.1:${port}/`;
const prof = path.join(outDir, 'pw-profile');
const ctx = await chromium.launchPersistentContext(prof, {
  channel: process.env.CH || 'chrome', headless: true, viewport: { width: 1600, height: 900 },
  args: [...(process.env.NOWEBGPU ? ['--disable-features=WebGPU'] : ['--enable-unsafe-webgpu']), '--mute-audio', '--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
});
const page = ctx.pages()[0] || await ctx.newPage();
const logs = [], errors = [];
page.on('console', m => { logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', e => errors.push(String(e)));
page.on('requestfailed', r => errors.push('REQFAIL ' + r.url() + ' ' + (r.failure() || {}).errorText));
page.on('response', r => { if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url()); });
const t0 = Date.now();
await page.goto(url, { waitUntil: 'domcontentloaded' });
const env = await page.evaluate(async () => ({ hasGpu: !!navigator.gpu, adapter: navigator.gpu ? (await navigator.gpu.requestAdapter().then(a => a ? (a.info ? `${a.info.vendor}/${a.info.architecture}/${a.info.description}` : 'adapter') : 'null').catch(e => 'err ' + e)) : null, ua: navigator.userAgent }));
// loader finished: loading bar hidden or canvas getContext resolved
let loadMs = null;
for (let i = 0; i < 240; i++) {
  const hidden = await page.evaluate(() => { const c = document.querySelector('#unity-loading-container'); return c ? getComputedStyle(c).display === 'none' : null; }).catch(() => false);
  if (hidden === true) { loadMs = Date.now() - t0; break; }
  if (hidden === null) {
    const buf = await page.screenshot({ clip: { x: 500, y: 300, width: 600, height: 300 } }).catch(() => null);
    if (buf && buf.length > 6000) { loadMs = Date.now() - t0; break; }
  }
  await page.waitForTimeout(500);
}
const timing = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /build2\.(data|wasm|framework)/.test(e.name)).map(e => ({ n: e.name.split('/').pop(), startMs: Math.round(e.startTime), endMs: Math.round(e.responseEnd), enc: e.encodedBodySize })));
await page.waitForTimeout(4000);
const api = await page.evaluate(() => { const c = document.querySelector('canvas'); if (!c) return 'no canvas'; const g2 = c.getContext('webgl2'); if (g2) return 'webgl2'; const gp = c.getContext('webgpu'); return gp ? 'webgpu' : 'unknown'; });
await page.screenshot({ path: path.join(outDir, 'shot0_load.png') });
const steps = process.env.STEPS ? JSON.parse(process.env.STEPS) : [['press','Enter'], ['press','Space'], ['press','Enter']];
let n = 1; const stepLog = []; let lastLogN = 0, lastErrN = 0;
for (const s of steps) {
  const [kind, arg, ms, label] = s;
  if (kind === 'press') await page.keyboard.press(arg);
  else if (kind === 'rep') { for (let i = 0; i < ms; i++) { await page.keyboard.press(arg); await page.waitForTimeout(label || 600); } }
  else if (kind === 'hold') { await page.keyboard.down(arg); await page.waitForTimeout(ms || 2500); await page.keyboard.up(arg); }
  else if (kind === 'holdmulti') { for (const k of arg) await page.keyboard.down(k); await page.waitForTimeout(ms || 1500); for (const k of arg) await page.keyboard.up(k); }
  else if (kind === 'type') await page.keyboard.type(arg, { delay: 80 });
  else if (kind === 'click') await page.mouse.click(arg <= 1 ? arg * 1600 : arg, ms <= 1 ? ms * 900 : ms);   // fractions of the 1600x900 viewport
  else if (kind === 'wait') await page.waitForTimeout(arg);
  await page.waitForTimeout(kind === 'wait' ? 0 : 1500);
  if (kind === 'shot' || kind !== 'wait' || (label === 'shot')) {
    const file = `shot${n++}_${kind}_${String(arg).slice(0, 12)}.png`;
    const buf = await page.screenshot({ path: path.join(outDir, file) });
    const newErr = logs.slice(lastLogN).filter(l => /^\[error\]/.test(l) && !/Failed to load resource/.test(l)); lastLogN = logs.length;
    const newPageErr = errors.slice(lastErrN).filter(e => !/^HTTP|^REQFAIL/.test(e)); lastErrN = errors.length;
    stepLog.push({ file, step: s.slice(0, 3), newConsoleErrors: newErr.slice(0, 5), newPageErrors: newPageErr.slice(0, 5), pngBytes: buf.length });
  }
}
const bytes = await page.evaluate(() => performance.getEntriesByType('resource').reduce((a, e) => a + (e.encodedBodySize || 0), 0));
const res = { url, loadMs, timing, stepLog, api, env, transferEncodedBytes: bytes, servedBytes: served, served_files, errors: errors.slice(0, 60), consoleTail: logs.slice(-80), consoleErrors: logs.filter(l => /^\[(error|warning)\]/.test(l)).slice(0, 60) };
fs.writeFileSync(path.join(outDir, 'smoke.json'), JSON.stringify(res, null, 1));
await ctx.close(); if (server) server.close();
try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
console.log(JSON.stringify({ loadMs, api, env, transferEncodedBytes: bytes, errCount: errors.length }, null, 1));
