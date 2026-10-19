import test from 'node:test';
import assert from 'node:assert/strict';
import { FrameProfiler, PROFILER_DEFAULTS, MAX_PROFILER_CAPACITY,
  MAX_PROFILER_WARMUP, MAX_PROFILER_FPS } from '../engine/fdg/profiler.js';

const stats = (frame, gap = 16, changes = {}) => ({ state: 'running', frame,
  frameDeltaMs: gap, updateMs: 2, renderMs: 3, particleCount: 8,
  drawCalls: 12, droppedSteps: 0, ...changes });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} should equal ${expected}`);

test('defaults and option validation keep finite, bounded storage and immutable settings', () => {
  const profiler = new FrameProfiler();
  assert.deepEqual(PROFILER_DEFAULTS, { targetFps: 60, capacity: 600, warmupFrames: 12 });
  assert.equal(profiler.snapshot().active, false);
  near(profiler.frameBudgetMs, 1000 / 60);
  for (const value of [null, 2, 'value', []]) assert.throws(() => new FrameProfiler(value), TypeError);
  for (const field of ['targetFps', 'capacity', 'warmupFrames']) {
    for (const value of [NaN, Infinity, -Infinity, '60', null]) assert.throws(() => new FrameProfiler({ [field]: value }), TypeError);
  }
  for (const options of [{ targetFps: 0 }, { targetFps: MAX_PROFILER_FPS + 1 },
    { capacity: 0 }, { capacity: MAX_PROFILER_CAPACITY + 1 },
    { warmupFrames: -1 }, { warmupFrames: MAX_PROFILER_WARMUP + 1 }]) assert.throws(() => new FrameProfiler(options), RangeError);
  for (const options of [{ capacity: 1.5 }, { warmupFrames: 0.5 }]) assert.throws(() => new FrameProfiler(options), TypeError);
  assert.throws(() => { profiler.capacity = Infinity; }, TypeError);
  assert.throws(() => profiler.start(23), TypeError);
  assert.equal(new FrameProfiler({ targetFps: 59.94 }).targetFps, 59.94);
});

test('baseline, monotonically new frames, pause/dispose, and repeat renders cannot be sampled', () => {
  const profiler = new FrameProfiler({ warmupFrames: 0 });
  assert.equal(profiler.sample(stats(10)), false, 'Stopped by default.');
  assert.equal(profiler.start('scene', stats(10)), profiler);
  assert.equal(profiler.sample(stats(10)), false, 'Starting stats are a baseline, not a new frame.');
  assert.equal(profiler.sample(stats(11, 0)), false, 'First rAF has no gap.');
  assert.equal(profiler.sample(stats(11)), false, 'Same frame cannot turn valid after a render.');
  assert.equal(profiler.sample(stats(12)), true);
  assert.equal(profiler.sample(stats(12, 1000)), false);
  assert.equal(profiler.sample(stats(8)), false);
  assert.equal(profiler.sample(stats(13, 16, { state: 'paused' })), false);
  assert.equal(profiler.sample(stats(13)), false);
  assert.equal(profiler.sample(stats(14, 0)), false, 'Resume begins with gap0.');
  assert.equal(profiler.sample(stats(15)), true);
  assert.equal(profiler.sample(stats(16, 16, { state: 'disposed' })), false);
  assert.equal(profiler.sample(stats(17, 16, { state: 'stopped' })), false);
  assert.equal(profiler.sample(stats(18, 16, { state: 'ready' })), false);
  assert.equal(profiler.stop().sampleCount, 2);
  assert.equal(profiler.sample(stats(19)), false);
  assert.equal(profiler.stop().active, false);
});

test('warmup consumes only valid running rAFs and excludes their cumulative dropped work', () => {
  const profiler = new FrameProfiler({ warmupFrames: 2 }).start('warm', stats(0, 0, { droppedSteps: 100 }));
  assert.equal(profiler.sample(stats(1, 0, { droppedSteps: 100 })), false);
  assert.equal(profiler.snapshot().warmupRemaining, 2);
  assert.equal(profiler.sample(stats(2, 16, { droppedSteps: 110 })), false);
  assert.equal(profiler.sample(stats(2, 16, { droppedSteps: 110 })), false);
  assert.equal(profiler.sample(stats(3, 16, { state: 'paused', droppedSteps: 110 })), false);
  assert.equal(profiler.snapshot().warmupRemaining, 1);
  assert.equal(profiler.sample(stats(4, 16, { droppedSteps: 120 })), false);
  assert.equal(profiler.sample(stats(5, 1000, { droppedSteps: 174 })), true);
  const snapshot = profiler.snapshot();
  assert.equal(snapshot.warmupRemaining, 0);
  assert.equal(snapshot.sampleCount, 1);
  assert.equal(snapshot.metrics.droppedSteps, 54);
  assert.equal(snapshot.metrics.frameDeltaMs.max, 1000, 'Raw hitch gap stays unclamped.');
});

test('nearest-rank quantiles, arithmetic-gap FPS, CPU, peaks, and strict budget counts match data', () => {
  const profiler = new FrameProfiler({ targetFps: 50, warmupFrames: 0 }).start('quantiles', stats(0));
  for (let frame = 1; frame <= 100; frame += 1) {
    assert.equal(profiler.sample(stats(frame, frame, { updateMs: frame / 2, renderMs: frame / 2,
      particleCount: frame, drawCalls: frame * 2, droppedSteps: frame * 2 })), true);
  }
  const result = profiler.stop();
  assert.equal(result.frameBudgetMs, 20);
  assert.deepEqual(result.metrics.frameDeltaMs, { mean: 50.5, min: 1, max: 100, p50: 50, p95: 95, p99: 99 });
  assert.deepEqual(result.metrics.cpuMs, result.metrics.frameDeltaMs);
  near(result.metrics.fps, 1000 / 50.5);
  assert.equal(result.metrics.overBudgetFrames, 80, 'Exactly 20ms meets the budget.');
  assert.equal(result.metrics.overBudgetRatio, 0.8);
  assert.equal(result.metrics.cpuOverBudgetFrames, 80);
  assert.equal(result.metrics.cpuOverBudgetRatio, 0.8);
  assert.equal(result.metrics.peakParticles, 100);
  assert.equal(result.metrics.peakDrawCalls, 200);
  assert.equal(result.metrics.droppedSteps, 200);
});

test('bounded ring measures only newest records while cumulative drops keep session scope', () => {
  const profiler = new FrameProfiler({ capacity: 3, warmupFrames: 0 }).start('ring', stats(0));
  const pool = [...profiler._buffer];
  for (let frame = 1; frame <= 8; frame += 1) profiler.sample(stats(frame, frame * 10,
    { droppedSteps: frame, particleCount: 100 - frame, drawCalls: 100 - frame }));
  const result = profiler.snapshot();
  assert.equal(result.sampleCount, 3);
  assert.equal(result.totalSampleCount, 8);
  assert.deepEqual(result.metrics.frameDeltaMs, { mean: 70, min: 60, max: 80, p50: 70, p95: 80, p99: 80 });
  assert.equal(result.metrics.peakParticles, 94, 'Expired peaks are excluded.');
  assert.equal(result.metrics.peakDrawCalls, 94);
  assert.equal(result.metrics.droppedSteps, 8, 'Cumulative drop delta is not truncated with the ring.');
  assert.equal(profiler._buffer.length, 3);
  pool.forEach((record, index) => assert.equal(profiler._buffer[index], record, 'Reuse bounded records.'));
});

test('scene counter reset and rejected intervals rebase droppedSteps without negative or stale debt', () => {
  const profiler = new FrameProfiler({ warmupFrames: 0 }).start('drop', stats(10, 16, { droppedSteps: 100 }));
  profiler.sample(stats(11, 16, { droppedSteps: 104 }));
  profiler.sample(stats(12, 16, { state: 'paused', droppedSteps: 200 }));
  profiler.sample(stats(13, 16, { droppedSteps: 202 }));
  profiler.sample(stats(14, 0, { droppedSteps: 0 }));
  profiler.sample(stats(15, 16, { droppedSteps: 3 }));
  profiler.sample(stats(16, 16, { droppedSteps: 1 }));
  profiler.sample(stats(17, 16, { droppedSteps: 2 }));
  profiler.sample(stats(17, 16, { droppedSteps: 100 }));
  profiler.sample(stats(17, 16, { droppedSteps: 2 }));
  profiler.sample(stats(18, 16, { droppedSteps: 102 }));
  assert.equal(profiler.snapshot().metrics.droppedSteps, 12, 'Repeated manual-step counter increments are excluded without accepting stale counter snapshots.');
  const noBaseline = new FrameProfiler({ warmupFrames: 0 }).start();
  noBaseline.sample(stats(1, 16, { droppedSteps: 200 }));
  assert.equal(noBaseline.snapshot().metrics.droppedSteps, 0, 'No evidence for pre-existing drops.');
});

test('reset and independent snapshots/profilers never retain external input references', () => {
  const options = { capacity: 2, warmupFrames: 0 };
  const baseline = stats(20);
  const first = new FrameProfiler(options).start('first', baseline);
  const second = new FrameProfiler(options).start('second', baseline);
  options.capacity = 50; baseline.frame = 99;
  const input = stats(21, 24, { droppedSteps: 2 });
  assert.equal(first.sample(input), true);
  input.frameDeltaMs = 1000;
  const saved = first.stop();
  saved.metrics.frameDeltaMs.mean = -1; saved.metrics.droppedSteps = -1;
  assert.equal(first.snapshot().metrics.frameDeltaMs.mean, 24);
  assert.equal(first.snapshot().metrics.droppedSteps, 2);
  assert.equal(second.snapshot().sampleCount, 0);
  first.start('reset', stats(50));
  assert.equal(first.snapshot().sampleCount, 0);
  assert.equal(first.snapshot().totalSampleCount, 0);
  assert.equal(first.snapshot().metrics.droppedSteps, 0);
  assert.equal(first.snapshot().metrics.peakParticles, 0);
  assert.equal(first.snapshot().label, 'reset');
  assert.equal(first.sample(stats(51, 10)), true);
  assert.equal(first.snapshot().metrics.frameDeltaMs.mean, 10);
});

test('malformed samples and finite extremes produce no NaN or Infinity snapshots', () => {
  const profiler = new FrameProfiler({ warmupFrames: 0 }).start();
  for (const input of [null, {}, stats(-1), stats(0.5), stats(Number.MAX_SAFE_INTEGER + 1)]) assert.equal(profiler.sample(input), false);
  let frame = 0;
  for (const field of ['frameDeltaMs', 'updateMs', 'renderMs', 'particleCount', 'drawCalls', 'droppedSteps']) {
    for (const value of [NaN, Infinity, -Infinity, '1', -1]) assert.equal(profiler.sample(stats(++frame, 16, { [field]: value })), false);
  }
  assert.equal(profiler.sample(stats(++frame, 16, { updateMs: Number.MAX_VALUE, renderMs: Number.MAX_VALUE })), false);
  assert.equal(profiler.sample(stats(++frame, Number.MIN_VALUE)), true);
  assert.equal(Number.isFinite(profiler.snapshot().metrics.fps), true);
  profiler.start();
  profiler.sample(stats(1, Number.MAX_VALUE, { updateMs: Number.MAX_VALUE, renderMs: 0 }));
  profiler.sample(stats(2, Number.MAX_VALUE, { updateMs: Number.MAX_VALUE, renderMs: 0 }));
  const scan = value => { if (typeof value === 'number') assert.equal(Number.isFinite(value), true); else if (value && typeof value === 'object') Object.values(value).forEach(scan); };
  scan(profiler.snapshot());
});
