const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { EventEmitter } = require('node:events');
const root = path.resolve(__dirname, '../../../..');
const rows = [];
const hashes = {};
function check(name, action) {
  try { action(); rows.push({ name, status: 'PASS' }); }
  catch (error) { rows.push({ name, status: 'FAIL', error: error.message }); }
}
function apply(source, diff) {
  for (const hunk of diff.split('\n@@\n').slice(1)) {
    const lines = hunk.trimEnd().split('\n');
    const before = lines.filter(line => line.startsWith('-') || line.startsWith(' ')).map(line => line.slice(1)).join('\n');
    const after = lines.filter(line => line.startsWith('+') || line.startsWith(' ')).map(line => line.slice(1)).join('\n');
    assert.equal(source.split(before).length, 2, 'unique source hunk');
    source = source.replace(before, after);
  }
  return source;
}
for (const file of ['server.cjs', 'node-main.js']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const diff = fs.readFileSync(path.join(__dirname, file + '.diff'), 'utf8');
  hashes[file] = crypto.createHash('sha256').update(source).digest('hex');
  const candidate = apply(source, diff);
  check(file + ' full candidate syntax', () => new vm.Script(candidate));
  const tail = candidate.slice(candidate.indexOf('let serverFailed = false;'));
  for (const outcome of ['normal', 'EADDRINUSE', 'EACCES', 'EIO', 'UNKNOWN']) {
    check(file + ' ' + outcome, () => {
      const logs = [];
      const debug = [];
      const processMock = { exitCode: undefined };
      const server = new EventEmitter();
      let listens = 0;
      let closes = 0;
      server.close = callback => { closes++; callback(Object.assign(new Error('not running'), { code: 'ERR_SERVER_NOT_RUNNING' })); return server; };
      server.listen = (port, host, callback) => {
        listens++;
        assert.equal(server.listenerCount('error'), 1, 'handler installed before bind');
        assert.equal(port, file === 'server.cjs' ? 3340 : 3347);
        assert.equal(host, '127.0.0.1');
        if (outcome === 'normal') callback();
        else {
          const error = new Error('mock bind failure');
          if (outcome !== 'UNKNOWN') error.code = outcome;
          server.emit('error', error);
          server.emit('error', error);
        }
        return server;
      };
      vm.runInNewContext(tail, { server, PORT: file === 'server.cjs' ? 3340 : 3347, HOST: '127.0.0.1', process: processMock, console: { error: message => logs.push(message), log: message => logs.push(message) }, dlog: message => debug.push(message) });
      assert.equal(listens, 1, 'no retry or port switch');
      if (outcome === 'normal') {
        assert.equal(closes, 0); assert.equal(processMock.exitCode, undefined);
        assert.equal(logs.length + debug.length, 1);
      } else {
        assert.equal(closes, 1, 'only this server closes once'); assert.equal(processMock.exitCode, 1);
        assert.equal(logs.length, 1);
        assert.ok(logs[0].includes('host=127.0.0.1 port=')); assert.ok(logs[0].includes('code=' + outcome));
        assert.equal(debug.length, file === 'node-main.js' ? 1 : 0);
        assert.ok(![...logs, ...debug].some(message => message.includes('listening') || message.includes('no-cache')));
      }
    });
  }
  if (file === 'server.cjs') check('unspecified development HOST identified', () => {
    const server = new EventEmitter(); let log;
    server.close = callback => callback();
    server.listen = () => server.emit('error', { code: 'EADDRINUSE' });
    vm.runInNewContext(tail, { server, PORT: 3340, HOST: undefined, process: {}, console: { error: message => { log = message; } } });
    assert.ok(log.includes('host=<unspecified> port=3340 code=EADDRINUSE'));
  });
}
const result = { at: new Date().toISOString(), kind: 'EventEmitter-no-socket', hashes, rows, pass: rows.filter(row => row.status === 'PASS').length, fail: rows.filter(row => row.status === 'FAIL').length, limits: ['Only listener tail executes; no HTTP handler, filesystem save or socket executes.', 'exitCode is not forced process exit or NW.js GUI closure.', 'Live bind failure / shutdown and package identity require separate validation.'] };
fs.writeFileSync(path.join(__dirname, 'evidence.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ pass: result.pass, fail: result.fail }));
process.exitCode = result.fail ? 1 : 0;
