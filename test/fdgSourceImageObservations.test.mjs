import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime } from '../engine/fdg/runtime.js';

// These approved paths are synthetic authority labels, never filesystem inputs.
const approvedPath = name => `/qa/approved/${name}.png`;

function projectFixture(src = 'qa/live.png') {
  return {
    schemaVersion: 1, id: `qa-${src}`, name: 'QA observation owner',
    map: { width: 200, height: 200, tileSize: 40, tiles: Array(40_000).fill(1),
      start: { x: 100, y: 185 }, exit: { x: 100, y: 5 }, objects: [] },
    characters: [{ id: 'actor', name: 'QA actor', speed: 156, radius: 12,
      sprite: { src, frameWidth: 16, frameHeight: 16, columns: 1, rows: 1, frames: 1,
        fps: 24, scale: 1, anchorX: .5, anchorY: .9 },
      animations: { idle: { row: 0, frames: 1, fps: 24, loop: true }, walk: { row: 0, frames: 1, fps: 24, loop: true } } }],
    skills: [{ id: 'skill', name: 'QA skill', cooldown: 1, cost: 1, range: 100, damage: 1, vfx: 'effect' }],
    vfx: [{ id: 'effect', name: 'QA effect', kind: 'burst', color: '#abcdef', count: 1,
      life: 1, speed: 1, size: 1, spread: 1 }],
    preview: { characterId: 'actor', skillId: 'skill', vfxId: 'effect', resourceMax: 100, resourceRegen: 1 },
    unknownAuthority: { untouched: true },
  };
}

function eventTarget() {
  const entries = new Map();
  return {
    addEventListener(type, callback) {
      if (!entries.has(type)) entries.set(type, new Set()); entries.get(type).add(callback);
    },
    removeEventListener(type, callback) { entries.get(type)?.delete(callback); },
    count: () => [...entries.values()].reduce((sum, group) => sum + group.size, 0),
  };
}

function harness(plans = {}) {
  const requests = [], images = [], deferred = new Map();
  let rafRequests = 0;
  class FakeImage {
    constructor() { this.naturalWidth = 0; this.naturalHeight = 0; images.push(this); }
    set src(value) {
      this.path = value.replace(/^\//, ''); requests.push(this.path);
      const plan = plans[this.path] || {};
      const decode = () => {
        if (plan.fail) { this.onerror?.(new Error('QA failed decode')); return; }
        this.naturalWidth = plan.width ?? 64; this.naturalHeight = plan.height ?? 32;
        this.onload?.();
      };
      if (plan.defer) deferred.set(this.path, decode); else queueMicrotask(decode);
    }
    removeAttribute(name) { if (name === 'src') this.srcRemoved = true; }
  }
  const windowEvents = eventTarget(), documentEvents = eventTarget(), canvasEvents = eventTarget();
  const window = { ...windowEvents, Image: FakeImage, devicePixelRatio: 1,
    requestAnimationFrame() { rafRequests++; return rafRequests; }, cancelAnimationFrame() {} };
  const document = { ...documentEvents, defaultView: window, hidden: false };
  const context = { globalAlpha: 1 }, stack = [];
  for (const method of ['setTransform', 'beginPath', 'rect', 'clip', 'drawImage', 'fillRect',
    'strokeRect', 'fillText', 'ellipse', 'arc', 'fill', 'stroke', 'moveTo', 'lineTo']) context[method] = () => {};
  context.save = () => stack.push(context.globalAlpha);
  context.restore = () => { context.globalAlpha = stack.pop(); };
  const attributes = new Map();
  const canvas = { ...canvasEvents, ownerDocument: document, width: 320, height: 240,
    getContext: () => context, getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 240 }),
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name), focus() {} };
  return { canvas, window, requests, images, plans,
    listenerCount: () => windowEvents.count() + documentEvents.count() + canvasEvents.count(),
    rafCount: () => rafRequests,
    complete(path) { const decode = deferred.get(path); deferred.delete(path); decode?.(); },
  };
}

async function owner(t, plans) {
  const environment = harness(plans), reported = [];
  const runtime = new FDGRuntime(environment.canvas, projectFixture(), { onError: error => reported.push(error.message) });
  t.after(() => runtime.dispose()); await runtime.load();
  assert.equal(runtime.stats.assetErrors, 0);
  return { runtime, environment, reported };
}

function checkpoint(runtime, environment, reported) {
  return { project: runtime.project, actor: structuredClone(runtime.player), camera: structuredClone(runtime.camera),
    errors: runtime.stats.errors, reports: [...reported], assets: [...runtime.assets], state: runtime.state,
    time: runtime.stats.time, frame: runtime.stats.frame, listeners: environment.listenerCount(), raf: environment.rafCount() };
}

function assertUnchanged(runtime, environment, reported, before) {
  assert.strictEqual(runtime.project, before.project);
  assert.deepEqual(runtime.player, before.actor); assert.deepEqual(runtime.camera, before.camera);
  assert.deepEqual(runtime.stats.errors, before.errors); assert.deepEqual(reported, before.reports);
  assert.equal(runtime.state, before.state); assert.equal(runtime.stats.time, before.time); assert.equal(runtime.stats.frame, before.frame);
  assert.equal(environment.listenerCount(), before.listeners); assert.equal(environment.rafCount(), before.raf);
  for (const [path, record] of before.assets) assert.strictEqual(runtime.assets.get(path), record);
}

test('Approved explicit bindings return decoded scalar dimensions without inferring placement or installing a scene', async t => {
  const { runtime, environment, reported } = await owner(t, { 'qa/shared.png': { width: 37, height: 29 } });
  const first = approvedPath('first'), second = approvedPath('second');
  const bindings = Object.assign(Object.create(null), { [first]: 'qa/shared.png', [second]: 'qa/shared.png' });
  const before = checkpoint(runtime, environment, reported), inputBefore = { ...bindings };
  const result = await runtime.observeSourceImages(bindings, new Set([first, second]));
  assert.deepEqual(result.observations, [first, second].map(canonicalAbsolutePath => ({
    canonicalAbsolutePath, src: 'qa/shared.png', status: 'ready', intrinsicWidth: 37,
    intrinsicHeight: 29, observedBy: 'runtime-image-decode',
  })));
  assert.deepEqual({ ...bindings }, inputBefore);
  assert.equal(environment.requests.filter(path => path === 'qa/shared.png').length, 1, 'One decoded source serves multiple explicitly approved bindings');
  assertUnchanged(runtime, environment, reported, before);
  assert.equal(runtime.sourceSceneReady, false); assert.equal(runtime.captureSourceScene(), null);
  const record = runtime.assets.get('qa/shared.png');
  result.observations[0].intrinsicWidth = -1;
  assert.equal(record.image.naturalWidth, 37, 'Returned observations do not mutate the cached image');
  result.release(); result.release();
  assert.equal(runtime.assets.has('qa/shared.png'), false); assert.equal(record.image, null);
  assert.equal(runtime.assets.size, before.assets.length);
});

test('Missing, unapproved, unsafe or accessor bindings reject before any image load and never fill defaults', async t => {
  const { runtime, environment, reported } = await owner(t);
  const approved = approvedPath('allowed'), before = checkpoint(runtime, environment, reported);
  let getterReads = 0;
  const accessor = Object.defineProperty({}, approved, { enumerable: true, get() { getterReads++; return 'qa/hidden.png'; } });
  const hidden = Object.defineProperty({}, approved, { enumerable: false, value: 'qa/hidden.png' });
  const symbol = { [approved]: 'qa/image.png', [Symbol('extra')]: 'qa/hidden.png' };
  const cases = [
    [null, [approved]], [{}, [approved]], [[], [approved]], [accessor, [approved]], [hidden, [approved]], [symbol, [approved]],
    [{ [approvedPath('other')]: 'qa/image.png' }, [approved]],
    [{ [approved]: '' }, [approved]], [{ [approved]: '/qa/image.png' }, [approved]],
    [{ [approved]: 'qa/../image.png' }, [approved]], [{ [approved]: 'https://example.invalid/image.png' }, [approved]],
    [{ [approved]: 'qa/image.png?q=1' }, [approved]], [{ [approved]: 'qa//image.png' }, [approved]],
    [{ [approved]: 'qa/%69mage.png' }, [approved]], [{ [approved]: 'qa\\image.png' }, [approved]],
    [{ [approved]: 'qa/image.png' }, null], [{ [approved]: 'qa/image.png' }, []],
    [{ [approved]: 'qa/image.png' }, ['relative/image.png']],
  ];
  const requestCount = environment.requests.length;
  for (const [bindings, paths] of cases) await assert.rejects(runtime.observeSourceImages(bindings, paths), TypeError);
  assert.equal(getterReads, 0, 'Binding validation must inspect data descriptors rather than invoking accessors');
  assert.equal(environment.requests.length, requestCount);
  assert.equal(runtime.assets.size, before.assets.length); assertUnchanged(runtime, environment, reported, before);
});

test('Observation has a shared 128-entry upper bound and accepts only the caller approved subset', async t => {
  const { runtime, environment } = await owner(t);
  const paths = Array.from({ length: 129 }, (_, index) => approvedPath(`limit-${index}`));
  const bindings = Object.fromEntries(paths.map(path => [path, 'qa/limit.png']));
  const requestCount = environment.requests.length;
  await assert.rejects(runtime.observeSourceImages(bindings, paths.slice(0, 128)), /1\.\.128/);
  await assert.rejects(runtime.observeSourceImages({ [paths[0]]: 'qa/limit.png' }, paths), /1\.\.128/);
  assert.equal(environment.requests.length, requestCount);
  delete bindings[paths[128]];
  const result = await runtime.observeSourceImages(bindings, paths.slice(0, 128));
  assert.equal(result.observations.length, 128);
  assert.equal(environment.requests.filter(path => path === 'qa/limit.png').length, 1);
  result.release();
  const subset = await runtime.observeSourceImages({ [paths[2]]: 'qa/subset.png' }, paths.slice(0, 9));
  assert.equal(subset.observations.length, 1); assert.equal(subset.observations[0].canonicalAbsolutePath, paths[2]);
  subset.release();
});

test('Decode, empty and invalid intrinsic dimensions throw atomically, retire all new records and preserve live errors', async t => {
  const plans = {
    'qa/decode.png': { fail: true }, 'qa/empty.png': { width: 0 },
    'qa/infinite.png': { width: Infinity }, 'qa/fractional.png': { height: 1.5 },
  };
  const { runtime, environment, reported } = await owner(t, plans);
  runtime.setCamera(4100, 7300);
  runtime._reportError(new Error('Existing QA diagnostic'), 'qa-existing');
  const before = checkpoint(runtime, environment, reported);
  for (const name of ['decode', 'empty', 'infinite', 'fractional']) {
    const src = `qa/${name}.png`, canonical = approvedPath(name), healthy = approvedPath(`${name}-healthy`);
    const pending = runtime.observeSourceImages({ [canonical]: src, [healthy]: 'qa/healthy.png' }, [canonical, healthy]);
    const failedRecord = runtime.assets.get(src), healthyRecord = runtime.assets.get('qa/healthy.png');
    await assert.rejects(pending, /not decoded with valid intrinsic dimensions/);
    assert.equal(runtime.assets.has(src), false); assert.equal(runtime.assets.has('qa/healthy.png'), false);
    assert.equal(failedRecord.image, null); assert.equal(healthyRecord.image, null);
    assert.equal(runtime.assets.size, before.assets.length); assert.equal(runtime._pendingAssets.size, 0);
    assertUnchanged(runtime, environment, reported, before);
  }
});

test('Release preserves existing active records and a newly observed record that becomes active later', async t => {
  const { runtime, environment } = await owner(t);
  const live = approvedPath('live'), activeRecord = runtime.assets.get('qa/live.png');
  const shared = await runtime.observeSourceImages({ [live]: 'qa/live.png' }, [live]);
  shared.release(); assert.strictEqual(runtime.assets.get('qa/live.png'), activeRecord);
  assert.equal(environment.requests.filter(path => path === 'qa/live.png').length, 1);
  const canonical = approvedPath('promoted');
  const observed = await runtime.observeSourceImages({ [canonical]: 'qa/promoted.png' }, [canonical]);
  const promotedRecord = runtime.assets.get('qa/promoted.png');
  await runtime.setProject(projectFixture('qa/promoted.png'));
  observed.release(); observed.release();
  assert.strictEqual(runtime.assets.get('qa/promoted.png'), promotedRecord);
  assert.equal(promotedRecord.status, 'ready'); assert.ok(promotedRecord.image);
  assert.equal(runtime.stats.assetErrors, 0);
});

test('A loadVersion race rejects observations without rolling back the superseding project or leaking the cancelled record', async t => {
  const { runtime, environment, reported } = await owner(t, { 'qa/deferred.png': { defer: true } });
  const canonical = approvedPath('deferred');
  const observing = runtime.observeSourceImages({ [canonical]: 'qa/deferred.png' }, [canonical]);
  const record = runtime.assets.get('qa/deferred.png'), rejected = assert.rejects(observing, /superseded/);
  const replacement = projectFixture('qa/replacement.png');
  await runtime.setProject(replacement); await rejected;
  assert.strictEqual(runtime.project, replacement);
  assert.equal(runtime.assets.has('qa/deferred.png'), false); assert.equal(record.image, null);
  assert.equal(runtime._pendingAssets.size, 0); assert.equal(runtime.stats.assetErrors, 0); assert.deepEqual(reported, []);
  const current = structuredClone(runtime.player);
  environment.complete('qa/deferred.png'); await Promise.resolve();
  assert.strictEqual(runtime.project, replacement); assert.deepEqual(runtime.player, current);
});

test('Dispose cancels pending observation and rejects later calls without creating images or reviving state', async t => {
  const { runtime, environment } = await owner(t, { 'qa/disposed.png': { defer: true } });
  const canonical = approvedPath('disposed');
  const observing = runtime.observeSourceImages({ [canonical]: 'qa/disposed.png' }, [canonical]);
  const rejected = assert.rejects(observing, /superseded/);
  runtime.dispose(); await rejected;
  const imageCount = environment.images.length;
  await assert.rejects(runtime.observeSourceImages({ [canonical]: 'qa/disposed.png' }, [canonical]), /disposed/);
  environment.complete('qa/disposed.png'); await Promise.resolve();
  assert.equal(environment.images.length, imageCount); assert.equal(runtime.assets.size, 0);
  assert.equal(runtime._pendingAssets.size, 0); assert.equal(environment.listenerCount(), 0);
  assert.equal(environment.rafCount(), 0); assert.equal(runtime.state, 'disposed');
});

test('An unavailable image context fails rather than fabricating intrinsic dimensions or polluting the live runtime', async t => {
  const { runtime, environment, reported } = await owner(t);
  const before = checkpoint(runtime, environment, reported), canonical = approvedPath('no-context');
  assert.equal(globalThis.Image, undefined, 'This Node fixture must have no DOM Image fallback');
  delete environment.window.Image;
  await assert.rejects(runtime.observeSourceImages({ [canonical]: 'qa/no-context.png' }, [canonical]), /not decoded with valid intrinsic dimensions/);
  assert.equal(runtime.assets.has('qa/no-context.png'), false);
  assertUnchanged(runtime, environment, reported, before);
  assert.equal(runtime.assets.size, before.assets.length); assert.equal(runtime._pendingAssets.size, 0);
});
