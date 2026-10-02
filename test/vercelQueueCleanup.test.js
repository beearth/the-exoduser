import test from 'node:test';
import assert from 'node:assert/strict';

test('queue cleanup refuses another project before canceling anything', async () => {
  const { clearLegacyQueues } = await import('../tools/clear-legacy-vercel-queues.mjs');
  const calls = [];
  await assert.rejects(clearLegacyQueues(async (url, options) => {
    calls.push({ url: String(url), method: options.method });
    return { ok: true, json: async () => ({ deployments: [
      { uid: 'dpl_wrong', name: 'the-exoduser', state: 'QUEUED' },
    ] }) };
  }, 'test-token'), /Unexpected project/);
  assert.equal(calls.some(call => call.method === 'PATCH'), false);
});

test('queue cleanup cancels only active legacy deployments and empties every state', async () => {
  const { clearLegacyQueues, TEAM_ID } = await import('../tools/clear-legacy-vercel-queues.mjs');
  const pending = new Map([['hell', new Set(['dpl_h1', 'dpl_h2'])], ['hell-build', new Set(['dpl_b1'])]]);
  const canceled = [];
  const result = await clearLegacyQueues(async (url, options) => {
    url = new URL(url);
    assert.equal(url.origin, 'https://api.vercel.com');
    assert.equal(url.searchParams.get('teamId'), TEAM_ID);
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    if (options.method === 'PATCH') {
      const id = url.pathname.split('/')[3];
      canceled.push(id);
      for (const ids of pending.values()) ids.delete(id);
      return { ok: true, json: async () => ({ readyState: 'CANCELED' }) };
    }
    const name = url.searchParams.get('projectId');
    assert.ok(pending.has(name));
    const state = url.searchParams.get('state');
    const ids = state === 'QUEUED' ? [...pending.get(name)].slice(0, 1) : [];
    return { ok: true, json: async () => ({ deployments: [
      ...ids.map(uid => ({ uid, name, state })),
      { uid: 'dpl_ready', name, state: 'READY' },
    ] }) };
  }, 'test-token');
  assert.deepEqual(canceled, ['dpl_h1', 'dpl_h2', 'dpl_b1']);
  assert.deepEqual(result, { hell: 2, 'hell-build': 1 });
});

test('queue cleanup stops on authentication failures without exposing credentials', async () => {
  const { clearLegacyQueues } = await import('../tools/clear-legacy-vercel-queues.mjs');
  await assert.rejects(clearLegacyQueues(async () => ({ ok: false, status: 403 }), 'sensitive-test-token'),
    error => error.message === 'Vercel GET failed (403)');
});
