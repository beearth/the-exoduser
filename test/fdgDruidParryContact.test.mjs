import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DRUID_PARRY_CONTACT_ATLAS,
  createDruidParryContactRenderer,
} from '../engine/fdg/druid-parry-contact.js';

function atlasFactory() {
  const calls = [], ink = [], canvases = [];
  const state = { x: 0, y: 0, alpha: 1, color: null, width: 1, path: [] };
  const stack = [];
  const context = {
    clearRect(...args) { calls.push(['clearRect', ...args]); },
    save() { stack.push(structuredClone(state)); calls.push(['save']); },
    restore() { Object.assign(state, stack.pop()); calls.push(['restore']); },
    translate(x, y) { state.x += x; state.y += y; },
    beginPath() { state.path = []; },
    rect(...args) { state.path.push(['rect', ...args]); },
    clip() { calls.push(['clip', state.x, state.y]); },
    moveTo(x, y) { state.path.push(['M', x, y]); },
    lineTo(x, y) { state.path.push(['L', x, y]); },
    closePath() { state.path.push(['Z']); },
    stroke() { ink.push({ op: 'stroke', ...structuredClone(state) }); },
    fill() { ink.push({ op: 'fill', ...structuredClone(state) }); },
    set globalAlpha(value) { state.alpha = value; },
    set strokeStyle(value) { state.color = value; },
    set fillStyle(value) { state.color = value; },
    set lineWidth(value) { state.width = value; },
  };
  const factory = () => {
    const canvas = { width: 0, height: 0, getContext: kind => kind === '2d' ? context : null };
    canvases.push(canvas);
    return canvas;
  };
  return { factory, calls, ink, canvases, stack };
}

function drawContext() {
  const calls = [], stack = [];
  const context = {
    globalAlpha: 0.37,
    globalCompositeOperation: 'lighter',
    save() {
      stack.push({ alpha: this.globalAlpha, composite: this.globalCompositeOperation });
      calls.push(['save']);
    },
    restore() {
      const previous = stack.pop();
      this.globalAlpha = previous.alpha;
      this.globalCompositeOperation = previous.composite;
      calls.push(['restore']);
    },
    drawImage(...args) {
      calls.push(['drawImage', args, this.globalAlpha, this.globalCompositeOperation]);
    },
  };
  return { context, calls, stack };
}

const native = Object.freeze({ kind: 'dark02', x: 4500.125, y: 7200.75, ageFrames: 6, active: true,
  mt: 72, t: 6, progress: 6 / 72, radius: 80, nativeDamage: 17 });

test('one cached 6×4 atlas authors distinct sharp frames and a clear last cell', () => {
  const spy = atlasFactory();
  const renderer = createDruidParryContactRenderer({ canvasFactory: spy.factory });
  assert.equal(renderer.ready, true);
  assert.ok(Object.isFrozen(renderer));
  assert.ok(Object.isFrozen(renderer.metadata));
  assert.equal(renderer.metadata, DRUID_PARRY_CONTACT_ATLAS);
  assert.deepEqual(renderer.metadata, {
    columns: 6, rows: 4, cellSize: 128, frameCount: 24, fps: 24, nativeFps: 60,
    worldSize: 96, width: 768, height: 512, visualDurationSeconds: 1, transparentFrame: 23,
  });
  assert.equal(spy.canvases.length, 1);
  assert.equal(spy.canvases[0].width, 768);
  assert.equal(spy.canvases[0].height, 512);
  assert.deepEqual(spy.calls[0], ['clearRect', 0, 0, 768, 512]);
  assert.equal(spy.calls.filter(call => call[0] === 'clip').length, 23);
  assert.equal(spy.stack.length, 0);
  const signatures = new Set();
  let previousAlpha = Infinity;
  for (let frame = 0; frame < 24; frame++) {
    const cx = (frame % 6 + 0.5) * 128, cy = (Math.floor(frame / 6) + 0.5) * 128;
    const records = spy.ink.filter(record => record.x === cx && record.y === cy);
    if (frame === 23) {
      assert.equal(records.length, 0);
      signatures.add('transparent');
      continue;
    }
    assert.equal(records.length, 7); // two ray layers plus five pointed shards
    signatures.add(JSON.stringify(records.map(({ x, y, ...record }) => record)));
    const core = records[1];
    assert.ok(core.alpha > 0 && core.alpha < previousAlpha);
    previousAlpha = core.alpha;
    assert.deepEqual(records.map(record => record.color),
      ['#68dfff', '#f5ffff', '#8cecff', '#8cecff', '#8cecff', '#8cecff', '#8cecff']);
    for (const record of records) {
      assert.ok(Number.isFinite(record.alpha) && record.alpha <= 1);
      for (const point of record.path) {
        if (point[0] === 'M' || point[0] === 'L') {
          assert.ok(point.slice(1).every(value => Number.isFinite(value) && Math.abs(value) < 64));
        }
      }
    }
  }
  assert.equal(signatures.size, 24);
  assert.equal(Object.hasOwn(spy.canvases[0], '_glVer'), false);
});

test('native age samples exact frame crops including sixth tick, freeze and transparent tail', () => {
  const spy = atlasFactory();
  const renderer = createDruidParryContactRenderer({ canvasFactory: spy.factory });
  const output = drawContext();
  const before = structuredClone(native);
  assert.equal(renderer.draw(output.context, native), true);
  const sixthTick = output.calls.find(call => call[0] === 'drawImage')[1];
  assert.deepEqual(sixthTick.slice(1, 5), [256, 0, 128, 128]);
  assert.deepEqual(sixthTick.slice(5), [native.x - 48, native.y - 48, 96, 96]);
  assert.equal(sixthTick[0], spy.canvases[0]);
  assert.deepEqual(native, before);
  for (let frame = 0; frame < 24; frame++) {
    assert.equal(renderer.draw(output.context, { ...native, ageFrames: (frame + 0.1) * 60 / 24 }), true);
    const call = output.calls.at(-2)[1];
    assert.deepEqual(call.slice(1, 5), [(frame % 6) * 128, Math.floor(frame / 6) * 128, 128, 128]);
  }
  const crops = [];
  for (const ageFrames of [6, 6, 60, 71, 72, 900, Number.MAX_VALUE]) {
    assert.equal(renderer.draw(output.context, { ...native, ageFrames }), true);
    crops.push(output.calls.at(-2)[1].slice(1, 5));
  }
  assert.deepEqual(crops[0], crops[1]);
  for (const crop of crops.slice(2)) assert.deepEqual(crop, [640, 384, 128, 128]);
  assert.equal(native.mt, 72);
});

test('draw emits one quad, restores caller state, and never rerasterizes or mutates resources', () => {
  const spy = atlasFactory();
  const renderer = createDruidParryContactRenderer({ canvasFactory: spy.factory });
  const output = drawContext();
  const authored = structuredClone({ calls: spy.calls, ink: spy.ink });
  const options = Object.freeze({ ...native, resource: Object.freeze({ uv: Object.freeze([0, 0, 1, 1]) }) });
  const original = structuredClone(options);
  for (let ageFrames = 0; ageFrames < 72; ageFrames++) {
    const previousLength = output.calls.length;
    assert.equal(renderer.draw(output.context, { ...options, ageFrames }), true);
    const drawCalls = output.calls.slice(previousLength);
    assert.deepEqual(drawCalls.map(call => call[0]), ['save', 'drawImage', 'restore']);
    assert.equal(drawCalls[1][2], 1);
    assert.equal(drawCalls[1][3], 'source-over');
    assert.equal(output.context.globalAlpha, 0.37);
    assert.equal(output.context.globalCompositeOperation, 'lighter');
  }
  assert.deepEqual(options, original);
  assert.deepEqual({ calls: spy.calls, ink: spy.ink }, authored);
  assert.equal(spy.canvases.length, 1);
  assert.equal(Object.hasOwn(spy.canvases[0], '_glVer'), false);
  assert.equal(output.stack.length, 0);
  const throwing = drawContext();
  throwing.context.drawImage = () => { throw new Error('consumer draw failed'); };
  assert.throws(() => renderer.draw(throwing.context, native), /consumer draw failed/);
  assert.equal(throwing.context.globalAlpha, 0.37);
  assert.equal(throwing.context.globalCompositeOperation, 'lighter');
  assert.equal(throwing.stack.length, 0);
});

test('unlisted, inactive, invalid or unready inputs leave native fallback untouched', () => {
  const spy = atlasFactory(), output = drawContext();
  const renderer = createDruidParryContactRenderer({ canvasFactory: spy.factory });
  const invalid = [null, undefined, {}, { ...native, kind: 'dark' }, { ...native, kind: 'physical' },
    ...[false, undefined, null, 1, 'true'].map(active => ({ ...native, active })),
    ...[NaN, Infinity, -Infinity, -1, '6', null, undefined].map(ageFrames => ({ ...native, ageFrames })),
    ...[NaN, Infinity, -Infinity, '4500', null, undefined].flatMap(value =>
      [{ ...native, x: value }, { ...native, y: value }])];
  for (const options of invalid) assert.equal(renderer.draw(output.context, options), false);
  assert.equal(renderer.draw(null, native), false);
  assert.equal(renderer.draw({}, native), false);
  assert.deepEqual(output.calls, []);
  assert.equal(output.context.globalAlpha, 0.37);
  assert.equal(output.context.globalCompositeOperation, 'lighter');
  const unavailable = [
    () => null,
    () => ({ getContext: () => null }),
    () => { throw new Error('canvas unavailable'); },
  ];
  for (const canvasFactory of unavailable) {
    const unready = createDruidParryContactRenderer({ canvasFactory });
    assert.equal(unready.ready, false);
    assert.equal(unready.draw(output.context, native), false);
  }
  assert.deepEqual(output.calls, []);
});
