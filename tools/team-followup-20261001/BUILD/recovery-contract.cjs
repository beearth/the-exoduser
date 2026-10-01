const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const root = path.resolve(__dirname, '../../..');
const fixture = fs.mkdtempSync(path.join(__dirname, 'fixture-'));
const rows = [];
const sources = {};
function read(file) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  sources[file] = crypto.createHash('sha256').update(source).digest('hex');
  return source;
}
function check(name, action) {
  rows.push({ name, status: 'PASS' });
  try { action(); } catch (error) { rows.at(-1).status = 'FAIL'; rows.at(-1).error = error.message; }
}
function boot(source, env, base) {
  let handler;
  const listeners = {};
  const server = { listen(port, host) { this.port = port; this.host = host; return this; }, on(event, callback) { listeners[event] = callback; return this; } };
  const guardedFs = new Proxy(fs, { get(target, key) {
    if (['existsSync', 'readFileSync', 'writeFileSync', 'appendFileSync', 'mkdirSync', 'readdirSync', 'unlinkSync'].includes(key)) {
      return (file, ...args) => {
        assert.ok(path.resolve(file).startsWith(fixture + path.sep), 'fixture boundary: ' + file);
        return target[key](file, ...args);
      };
    }
    return target[key];
  } });
  vm.runInNewContext(source, { require(name) {
    if (name === 'http') return { createServer(callback) { handler = callback; return server; } };
    if (name === 'fs') return guardedFs;
    if (name === 'os') return { homedir: () => base };
    return require(name);
  }, __dirname: base, process: { env: { ...env } }, Buffer, URL, console: { log() {}, error() {} } });
  return { server, listeners, async request(url, method = 'GET', body) {
    const req = new EventEmitter(); req.url = url; req.method = method; req.headers = {};
    const res = { writeHead(status) { this.status = status; }, end(data) { this.data = JSON.parse(data); } };
    const pending = handler(req, res);
    if (body !== undefined) req.emit('data', Buffer.from(JSON.stringify(body)));
    req.emit('end'); await pending; return res;
  } };
}
(async () => {
  const development = read('server.cjs');
  const packaged = read('node-main.js');
  const builder = read('build-nwjs.mjs');
  const integrationId = '20261001-101010';
  const transformed = packaged.replace('const PORT = 3333;', 'const PORT = 3347;').replace("path.join(APPDATA, 'EXODUSER-HELL', 'saves')", `path.join(APPDATA, 'EXODUSER-INTEGRATION-${integrationId}', 'saves')`);
  check('builder isolation replacements still present', () => {
    for (const token of ['localhost:3347', 'const PORT = 3347;', 'userdata-integration-${integrationId}', 'EXODUSER-INTEGRATION-${integrationId}']) assert.ok(builder.includes(token), token);
  });
  for (const [name, source, port] of [['development', development, 3340], ['package-copy', transformed, 3347]]) {
    const base = path.join(fixture, name); fs.mkdirSync(base);
    const save = name === 'development' ? path.join(base, 'saves') : path.join(base, `EXODUSER-INTEGRATION-${integrationId}`, 'saves');
    const runtime = boot(source, { PORT: '3340', HOST: '127.0.0.1', EXODUSER_SAVE_DIR: save, APPDATA: base }, base);
    check(name + ' port and loopback', () => { assert.equal(runtime.server.port, port); assert.equal(runtime.server.host, '127.0.0.1'); });
    const data = { ts: 123, player: { lv: 7 }, game: { kills: 9 }, charIdx: 2 };
    const saved = await runtime.request('/api/save', 'POST', { slot: '../복구', data });
    check(name + ' sanitized slot confined', () => { assert.equal(saved.status, 200); assert.equal(saved.data.slot, '___복구'); assert.ok(fs.existsSync(path.join(save, '___복구.json'))); });
    const restored = await runtime.request('/api/load/' + encodeURIComponent(saved.data.slot));
    check(name + ' save/load roundtrip', () => assert.deepEqual(restored.data.data, data));
    await runtime.request('/api/mats', 'POST', { mats: -5 });
    const mats = await runtime.request('/api/mats');
    check(name + ' negative mats clamp', () => assert.equal(mats.data.mats, 0));
    const slots = await runtime.request('/api/slots');
    check(name + ' underscore-prefixed sanitized slot hidden (observed gap)', () => assert.equal(slots.data.slots.length, 0));
    await runtime.request('/api/save', 'POST', { slot: 'recovery-normal', data });
    const normalSlots = await runtime.request('/api/slots');
    check(name + ' normal slot visible / shared mats excluded', () => { assert.equal(normalSlots.data.slots.length, 1); assert.equal(normalSlots.data.slots[0].name, 'recovery-normal'); });
    const restarted = boot(source, { PORT: '3340', HOST: '127.0.0.1', EXODUSER_SAVE_DIR: save, APPDATA: base }, base);
    const reloaded = await restarted.request('/api/load/' + encodeURIComponent(saved.data.slot));
    check(name + ' VM restart retains fixture save', () => assert.deepEqual(reloaded.data.data, data));
    check(name + ' port collision handler absent (observed gap)', () => assert.equal(runtime.listeners.error, undefined));
  }
  for (const port of ['0', '65536', 'NaN', '3.5']) check('reject invalid PORT ' + port, () => assert.throws(() => boot(development, { PORT: port }, path.join(fixture, 'invalid-port')), /PORT must/));
  const blocked = path.join(fixture, 'not-directory'); fs.writeFileSync(blocked, 'fixture');
  check('save path existing file fails boot', () => assert.throws(() => boot(development, { PORT: '3340', EXODUSER_SAVE_DIR: path.join(blocked, 'saves') }, path.join(fixture, 'bad-path')), /ENOTDIR/));
  for (const file of ['game.html', 'game-easy-test.html']) {
    const source = read(file);
    const start = source.indexOf('function _clearHeldInput(){');
    const end = source.indexOf("addEventListener('mousemove'", start);
    assert.ok(start >= 0 && end > start);
    const callbacks = {};
    const context = { K: { KeyR: true }, KH: { ShiftLeft: true }, MB: { 0: true }, MBjust: { 0: true }, P: { _beamHold: true }, _dashHold: true, _dashHoldF: 5, _dashTier: 3, _cutSkipHolding: true, _cutSkipHold: 4, addEventListener(event, callback) { callbacks[event] = callback; }, document: { hidden: true, addEventListener(event, callback) { callbacks[event] = callback; } } };
    vm.runInNewContext(source.slice(start, end), context);
    check(file + ' blur clears input and holds', () => {
      callbacks.blur();
      for (const map of [context.K, context.KH, context.MB, context.MBjust]) assert.ok(Object.values(map).every(value => value === false));
      assert.equal(context.P._beamHold, false); assert.equal(context._dashHoldF, 0); assert.equal(context._dashTier, 0); assert.equal(context._cutSkipHold, 0);
    });
    check(file + ' hidden visibility clears / visible preserves', () => {
      context.K.KeyR = true; callbacks.visibilitychange(); assert.equal(context.K.KeyR, false);
      context.document.hidden = false; context.K.KeyR = true; callbacks.visibilitychange(); assert.equal(context.K.KeyR, true);
    });
  }
  fs.rmSync(fixture, { recursive: true });
  const result = { kind: 'mock-http-real-fixture-no-listen', at: new Date().toISOString(), node: process.version, sources, rows, counts: { pass: rows.filter(row => row.status === 'PASS').length, fail: rows.filter(row => row.status === 'FAIL').length }, limits: ['No real socket, browser, package execution or process crash test.', 'Port error handler absence is a gap observation, not collision recovery PASS.', 'No atomic-write/interrupted-write durability proof.'] };
  fs.writeFileSync(path.join(__dirname, 'recovery-evidence.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result.counts)); process.exitCode = result.counts.fail ? 1 : 0;
})().catch(error => { console.error(error); process.exitCode = 1; });
