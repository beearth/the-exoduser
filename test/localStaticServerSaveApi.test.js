import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { access, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStaticServer } from '../tools/local-static-server.mjs';

const ROOT = new URL('..', import.meta.url);
const ROOT_DIR = fileURLToPath(ROOT);

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

test('serve:test supports JSON save/load endpoints for local gameplay', async t => {
  const port = await findFreePort();
  const slot = `codex-local-api-${Date.now()}`;
  const savePath = new URL(`./saves/${slot}.json`, ROOT);
  const server = createStaticServer({
    rootDir: ROOT_DIR,
    host: '127.0.0.1'
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });

  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
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
