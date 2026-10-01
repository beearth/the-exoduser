const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { apply } = require('../handoff-bundle/prepare.cjs');
const createState = require('../handoff-bundle/package-entry-state.cjs');
const root = path.resolve(__dirname, '../../../..');
const startedAt = new Date().toISOString();
const fixture = fs.mkdtempSync(path.join(__dirname, 'fixture-'));
const saves = path.join(fixture, 'saves'); fs.mkdirSync(saves);
const writes = [];
const rows = [];
const servers = [];
const hashes = {};
const observations = {};
function read(file) { const source = fs.readFileSync(path.join(root, file), 'utf8'); hashes[file] = crypto.createHash('sha256').update(source).digest('hex'); return source; }
function check(name, action) { try { action(); rows.push({ name, status: 'PASS' }); } catch (error) { rows.push({ name, status: 'FAIL', error: error.message }); } }
const source = read('node-main.js');
const diff = read('tools/team-followup-20261001/BUILD/handoff-bundle/node-main.js.diff');
const patched = apply(source, diff);
const tail = patched.slice(patched.indexOf('let serverFailed = false;'));
const helpers = source.slice(source.indexOf('function sanitizeSlot('), source.indexOf('http.createServer('));
const routes = source.slice(source.indexOf("  if (pathname === '/api/slots'"), source.indexOf("  if (pathname === '/' || pathname === '')"));
assert.ok(helpers.startsWith('function sanitizeSlot(') && routes.includes("pathname === '/api/mats'"));
const marker = crypto.randomUUID();
const guardedFs = new Proxy(fs, { get(target, key) {
  if (['readdirSync', 'readFileSync', 'existsSync', 'writeFileSync', 'unlinkSync'].includes(key)) return (file, ...args) => {
    const absolute = path.resolve(file); assert.ok(absolute === saves || absolute.startsWith(saves + path.sep), 'save boundary');
    if (['writeFileSync', 'unlinkSync'].includes(key)) writes.push({ operation: key, path: absolute });
    return target[key](file, ...args);
  };
  return target[key];
} });
const routeContext = vm.createContext({ fs: guardedFs, path, SAVE_DIR: saves, Buffer });
vm.runInContext(helpers + '\nglobalThis.handle = async (req,res) => {const pathname = new URL(req.url,"http://fixture.invalid").pathname;\n' + routes + '\nres.writeHead(404);res.end("not-found");};', Object.assign(routeContext, { URL }));
function fixtureServer(identity) {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === '/identity') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ marker: identity })); return; }
      await routeContext.handle(req, res);
    } catch (error) { res.writeHead(500); res.end(error.message); }
  }); servers.push(server); return server;
}
function bind(server, port, entryState) {
  const processMock = {}; const logs = [];
  vm.runInNewContext(tail, { server, PORT: port, entryState, process: processMock, console: { error: message => logs.push(message) }, dlog: message => logs.push(message) });
  return { processMock, logs };
}
async function request(port, route, method = 'GET', body) {
  const res = await fetch('http://127.0.0.1:' + port + route, { method, headers: { Connection: 'close', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(4000) });
  return { status: res.status, data: await res.json() };
}
async function close(server) {
  if (!server.listening) return;
  server.closeAllConnections(); await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
(async () => {
  try {
    const first = fixtureServer(marker); const state = createState(0);
    const listening = once(first, 'listening');
    const normal = bind(first, 0, state); await listening;
    const port = first.address().port;
    observations.port = port; observations.address = first.address();
    check('OS loopback port0 allocated, production ports excluded', () => { assert.ok(port > 0); assert.ok(![3333, 3340, 3347].includes(port)); assert.equal(first.address().address, '127.0.0.1'); });
    check('real listen transitions ready without failure', () => { assert.equal(state.snapshot().phase, 'ready'); assert.equal(normal.processMock.exitCode, undefined); });
    const identity = await request(port, '/identity');
    check('ready server HTTP identity equals own marker', () => assert.equal(identity.data.marker, marker));
    const payload = { player: { lv: 7 }, game: { kills: 3 }, fixture: marker };
    const saved = await request(port, '/api/save', 'POST', { slot: 'loopback', data: payload });
    check('actual save POST', () => { assert.equal(saved.status, 200); assert.equal(saved.data.ok, true); });
    const loaded = await request(port, '/api/load/loopback');
    check('actual load equals written fixture', () => assert.deepEqual(loaded.data.data, payload));
    const mats = await request(port, '/api/mats', 'POST', { mats: -2 });
    check('actual shared mats clamp', () => assert.equal(mats.data.mats, 0));
    const slots = await request(port, '/api/slots');
    check('actual slots excludes shared mats', () => { assert.equal(slots.data.slots.length, 1); assert.equal(slots.data.slots[0].name, 'loopback'); });
    const rival = fixtureServer('rival-' + marker); const rivalState = createState(port);
    const rejected = new Promise(resolve => rival.once('error', resolve));
    const failure = bind(rival, port, rivalState); const error = await rejected;
    observations.collision = { code: error.code, state: rivalState.snapshot(), logs: failure.logs, exitCode: failure.processMock.exitCode };
    check('actual EADDRINUSE stays failed and closes only rival', () => { assert.equal(error.code, 'EADDRINUSE'); assert.equal(rivalState.snapshot().phase, 'failed'); assert.equal(failure.processMock.exitCode, 1); assert.equal(rival.listening, false); assert.equal(first.listening, true); });
    rivalState.ready();
    check('failed entry rejects late ready', () => assert.equal(rivalState.snapshot().phase, 'failed'));
    const afterCollision = await request(port, '/identity');
    check('original own server preserved / wrong-ready request detects wrong identity', () => { assert.equal(afterCollision.data.marker, marker); assert.notEqual(afterCollision.data.marker, 'rival-' + marker); });
    const page = read('tools/team-followup-20261001/BUILD/handoff-bundle/package-entry.html');
    const originalScript = page.split('<script>')[1].split('</script>')[0];
    const script = originalScript.replace('[3333, 3347].includes(state.port)', '[' + port + '].includes(state.port)');
    const navigations = [];
    vm.runInNewContext(script, { require: () => ({ __exoduserPackageEntry: rivalState }), document: { getElementById: () => ({ textContent: '' }) }, location: { replace: url => navigations.push(url) }, addEventListener() {} });
    check('real bind failure causes VM entry navigations zero', () => assert.equal(navigations.length, 0));
    await request(port, '/api/save/loopback', 'DELETE');
    check('save delete confined and no fixture writes elsewhere', () => { assert.ok(!fs.existsSync(path.join(saves, 'loopback.json'))); assert.ok(writes.length >= 3); assert.deepEqual(fs.readdirSync(fixture), ['saves']); });
    await close(first);
    check('own server closed', () => assert.equal(first.listening, false));
    let connectionError;
    try { await request(port, '/identity'); } catch (error) { connectionError = error; }
    check('HTTP no longer available after close', () => assert.ok(connectionError));
  } finally {
    for (const server of servers) await close(server);
    fs.rmSync(fixture, { recursive: true });
    observations.cleaned = !fs.existsSync(fixture);
  }
})().catch(error => rows.push({ name: 'integration execution', status: 'FAIL', error: error.stack })).finally(() => {
  const evidence = { startedAt, completedAt: new Date().toISOString(), kind: 'real-Node-loopback-plus-VM-entry', node: process.version, fixture, sources: hashes, writes, observations, rows, pass: rows.filter(row => row.status === 'PASS').length, fail: rows.filter(row => row.status === 'FAIL').length, substitutions: ['PORT=0 for initial listen, own allocated port for rival', 'SAVE_DIR=unique fixture/saves', 'only extracted save helpers/routes and candidate listen/error tail execute', 'VM entry allowed-port list replaced by allocated port; navigation captured only'], limits: ['No NW.js context identity or actual browser navigation.', 'No real EACCES test, game or package validation.', 'Filesystem proxy constrains extracted save API, not whole production code.'] };
  fs.writeFileSync(path.join(__dirname, 'evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify({ pass: evidence.pass, fail: evidence.fail, port: observations.port, cleaned: observations.cleaned })); process.exitCode = evidence.fail ? 1 : 0;
});
