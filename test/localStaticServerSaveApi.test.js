import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { access, readFile, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url);

function findFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const addr = srv.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      srv.close(err => (err ? reject(err) : resolve(port)));
    });
  });
}

function startStaticServer(port) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['tools/local-static-server.mjs', String(port)], {
      cwd: path.normalize(new URL('.', ROOT).pathname),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('server start timeout'));
    }, 10000);

    const onData = chunk => {
      const text = String(chunk);
      if (text.includes(`[serve:test] url: http://127.0.0.1:${port}/`)) {
        clearTimeout(timer);
        proc.stdout.off('data', onData);
        resolve(proc);
      }
    };

    proc.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on('exit', code => {
      clearTimeout(timer);
      reject(new Error(`server exited early: ${code}`));
    });

    proc.stdout.on('data', onData);
  });
}

test('serve:test supports JSON save/load endpoints for local gameplay', async t => {
  const port = await findFreePort();
  const slot = `codex-local-api-${Date.now()}`;
  const savePath = new URL(`./saves/${slot}.json`, ROOT);
  const server = await startStaticServer(port);

  t.after(async () => {
    server.kill();
    await rm(savePath, { force: true }).catch(() => {});
  });

  const base = `http://127.0.0.1:${port}`;
  const payload = { slot, data: { player: { lv: 7 }, game: { stage: 3 } } };

  const missingLoadRes = await fetch(`${base}/api/load/${encodeURIComponent(slot)}`);
  assert.equal(missingLoadRes.status, 200);
  assert.deepEqual(await missingLoadRes.json(), { ok: false, error: 'not found' });

  const saveRes = await fetch(`${base}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.equal(saveRes.status, 200);
  assert.deepEqual(await saveRes.json(), { ok: true });

  await access(savePath);
  const savedJson = JSON.parse(await readFile(savePath, 'utf8'));
  assert.deepEqual(savedJson, payload.data);

  const loadRes = await fetch(`${base}/api/load/${encodeURIComponent(slot)}`);
  assert.equal(loadRes.status, 200);
  assert.deepEqual(await loadRes.json(), { ok: true, data: payload.data });

  const deleteRes = await fetch(`${base}/api/save/${encodeURIComponent(slot)}`, {
    method: 'DELETE'
  });
  assert.equal(deleteRes.status, 200);
  assert.deepEqual(await deleteRes.json(), { ok: true });

  const loadAfterDeleteRes = await fetch(`${base}/api/load/${encodeURIComponent(slot)}`);
  assert.equal(loadAfterDeleteRes.status, 200);
  assert.deepEqual(await loadAfterDeleteRes.json(), { ok: false, error: 'not found' });
});
