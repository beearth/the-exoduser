import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { Writable } from 'node:stream';
import { once } from 'node:events';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');

// Execute the actual request handler without opening sockets or touching user saves.
test('static handler sends module MIME for 200/range responses and preserves cache/API behavior', { timeout: 5000 }, async () => {
  const saves = fs.mkdtempSync(path.join(os.tmpdir(), 'exoduser-mime-'));
  let handler;
  let listenArgs;
  const filesystem = new Proxy(fs, { get(target, key) {
    if (key === 'existsSync') return filename => filename === path.join(root, '.env') ? false : fs.existsSync(filename);
    if (['mkdirSync', 'writeFileSync', 'unlinkSync'].includes(key)) return () => assert.fail('request test must not write saves');
    return target[key];
  }});
  try {
    vm.runInNewContext(fs.readFileSync(path.join(root, 'server.cjs'), 'utf8'), {
      __dirname: root, URL, Buffer, console,
      process: { env: { PORT: '3340', HOST: '127.0.0.1', EXODUSER_SAVE_DIR: saves } },
      require(name) {
        if (name === 'http') return { createServer(callback) {
          handler = callback;
          return { listen(...args) { listenArgs = args.slice(0, 2); } };
        }};
        return name === 'fs' ? filesystem : require(name);
      }
    }, { filename: 'server.cjs' });
    assert.deepEqual(listenArgs, [3340, '127.0.0.1']);
    async function request(url, headers = {}) {
      const chunks = [];
      const response = new Writable({ write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); } });
      response.writeHead = (status, fields) => { response.status = status; response.headers = fields; response.headersSent = true; };
      const finished = once(response, 'finish');
      await handler({ method: 'GET', url, headers }, response);
      await finished;
      return { status: response.status, headers: response.headers, body: Buffer.concat(chunks) };
    }
    for (const filename of ['definitions.js']) {
      const url = '/unique-item-project/' + filename;
      const file = fs.readFileSync(path.join(root, 'unique-item-project', filename));
      const full = await request(url);
      assert.equal(full.status, 200);
      assert.equal(full.headers['Content-Type'], 'application/javascript');
      assert.deepEqual(full.body, file);
      assert.equal(full.headers['Cache-Control'], 'public, max-age=3600');
      const range = await request(url, { range: 'bytes=0-31' });
      assert.equal(range.status, 206);
      assert.equal(range.headers['Content-Type'], full.headers['Content-Type']);
      assert.deepEqual(range.body, file.subarray(0, 32));
      const cached = await request(url, { 'if-none-match': full.headers.ETag });
      assert.equal(cached.status, 304);
      assert.equal(cached.body.length, 0);
    }
    const review = await request('/unique-item-project/review.html');
    assert.equal(review.headers['Content-Type'], 'text/html; charset=utf-8');
    assert.equal(review.headers['Cache-Control'], 'no-cache, no-store, must-revalidate');
    const slots = await request('/api/slots');
    assert.equal(slots.status, 200);
    assert.equal(slots.headers['Content-Type'], 'application/json');
    assert.deepEqual(fs.readdirSync(saves), []);
  } finally { fs.rmSync(saves, { recursive: true, force: true }); }
});
