const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const createState = require('./package-entry-state.cjs');
const root = path.resolve(__dirname, '../../../..');
const html = fs.readFileSync(path.join(__dirname, 'package-entry.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
const rows = [];
const hashes = {};
function check(name, action) { try { action(); rows.push({ name, status: 'PASS' }); } catch (error) { rows.push({ name, status: 'FAIL', error: error.message }); } }
function page(entry, broken = false) {
  const navigations = []; const status = { textContent: '' }; const events = {};
  vm.runInNewContext(script, { require() { if (broken) throw new Error('Node unavailable'); return { __exoduserPackageEntry: entry }; }, document: { getElementById: () => status }, location: { replace: url => navigations.push(url) }, addEventListener(event, callback) { events[event] = callback; } });
  return { navigations, status, events };
}
for (const file of ['package.json', 'node-main.js', 'build-nwjs.mjs', 'index.html']) hashes[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
for (const file of ['node-main.js', 'build-nwjs.mjs']) {
  let source = fs.readFileSync(path.join(root, file), 'utf8');
  const diff = fs.readFileSync(path.join(__dirname, file + '.diff'), 'utf8');
  for (const hunk of diff.split('\n@@\n').slice(1)) {
    const lines = hunk.trimEnd().split('\n');
    const before = lines.filter(line => /^[ -]/.test(line)).map(line => line.slice(1)).join('\n');
    const after = lines.filter(line => /^[ +]/.test(line)).map(line => line.slice(1)).join('\n');
    assert.equal(source.split(before).length, 2); source = source.replace(before, after);
  }
  check(file + ' unique hunks present', () => assert.ok(source.includes(file === 'node-main.js' ? 'entryState.ready()' : "nwPkg.main = 'package-entry.html'")));
  if (file === 'node-main.js') {
    check('node-main candidate syntax', () => new vm.Script(source));
    for (const outcome of ['normal', 'EADDRINUSE', 'EACCES', 'UNKNOWN']) check('server listener ' + outcome, () => {
      const entryState = createState(3347); const view = page(entryState); const server = new EventEmitter(); let closes = 0;
      server.close = callback => { closes++; callback(); };
      server.listen = (port, host, callback) => {
        assert.equal(server.listenerCount('error'), 1);
        if (outcome === 'normal') callback(); else { server.emit('error', { code: outcome === 'UNKNOWN' ? undefined : outcome }); callback(); }
      };
      const processMock = {};
      vm.runInNewContext(source.slice(source.indexOf('let serverFailed = false;')), { server, PORT: 3347, entryState, process: processMock, console: { error() {} }, dlog() {} });
      assert.equal(view.navigations.length, outcome === 'normal' ? 1 : 0);
      assert.equal(closes, outcome === 'normal' ? 0 : 1);
      assert.equal(processMock.exitCode, outcome === 'normal' ? undefined : 1);
    });
  }
}
for (const port of [3333, 3347]) {
  check(port + ' pending then own listen', () => { const state = createState(port); const view = page(state); assert.equal(view.navigations.length, 0); state.ready(); state.ready(); assert.deepEqual(view.navigations, ['http://localhost:' + port + '/index.html?demo=1']); });
  check(port + ' listen before page', () => { const state = createState(port); state.ready(); assert.equal(page(state).navigations.length, 1); });
  check(port + ' failure before page', () => { const state = createState(port); state.failed('EADDRINUSE'); state.ready(); const view = page(state); assert.equal(view.navigations.length, 0); assert.ok(view.status.textContent.includes('EADDRINUSE')); });
  check(port + ' pending failure and late ready', () => { const state = createState(port); const view = page(state); state.failed('EACCES'); state.ready(); assert.equal(view.navigations.length, 0); });
}
check('missing shared process state fails closed', () => assert.equal(page(undefined).navigations.length, 0));
check('Node unavailable fails closed', () => assert.equal(page(undefined, true).navigations.length, 0));
check('unapproved port blocked', () => { const state = createState(3340); state.ready(); assert.equal(page(state).navigations.length, 0); });
check('pagehide unsubscribes before ready', () => { const state = createState(3333); const view = page(state); view.events.pagehide(); state.ready(); assert.equal(view.navigations.length, 0); });
const result = { at: new Date().toISOString(), kind: 'static-and-VM-no-socket', hashes, rows, pass: rows.filter(row => row.status === 'PASS').length, fail: rows.filter(row => row.status === 'FAIL').length, limits: ['Shared process identity across actual NW.js contexts unverified.', 'No actual navigation, port identity HTTP check, package or live shutdown.', 'A server error after navigation cannot retract the opened game.'] };
fs.writeFileSync(path.join(__dirname, 'evidence.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ pass: result.pass, fail: result.fail })); process.exitCode = result.fail ? 1 : 0;
