/** Pure, bounded diagnostics for the FDG preview's completed rAF stats. */
export const PROFILER_DEFAULTS = Object.freeze({ targetFps: 60, capacity: 600, warmupFrames: 12 });
export const MAX_PROFILER_CAPACITY = 10_000;
export const MAX_PROFILER_WARMUP = 10_000;
export const MAX_PROFILER_FPS = 240;

const finiteNonnegative = value => Number.isFinite(value) && value >= 0;
const frameNumber = value => Number.isSafeInteger(value) && value >= 0;

function option(value, name, min, max, integer = false) {
  if (!Number.isFinite(value) || integer && !Number.isSafeInteger(value)) throw new TypeError(`${name} must be a finite ${integer ? 'integer' : 'number'}.`);
  if (value < min || value > max) throw new RangeError(`${name} must be in ${min}..${max}.`);
  return value;
}

function distribution(values) {
  if (!values.length) return { mean: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
  values.sort((a, b) => a - b);
  // An online mean avoids both overflowing the sum and underflowing value/N.
  const mean = values.reduce((average, value, index) => average + (value - average) / (index + 1), 0);
  const rank = fraction => values[Math.ceil(fraction * values.length) - 1];
  return { mean, min: values[0], max: values.at(-1), p50: rank(0.5), p95: rank(0.95), p99: rank(0.99) };
}

export class FrameProfiler {
  constructor(options = {}) {
    if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Profiler options must be an object.');
    const { targetFps = PROFILER_DEFAULTS.targetFps, capacity = PROFILER_DEFAULTS.capacity,
      warmupFrames = PROFILER_DEFAULTS.warmupFrames } = options;
    Object.defineProperties(this, {
      targetFps: { enumerable: true, value: option(targetFps, 'targetFps', 1, MAX_PROFILER_FPS) },
      capacity: { enumerable: true, value: option(capacity, 'capacity', 1, MAX_PROFILER_CAPACITY, true) },
      warmupFrames: { enumerable: true, value: option(warmupFrames, 'warmupFrames', 0, MAX_PROFILER_WARMUP, true) },
    });
    Object.defineProperty(this, 'frameBudgetMs', { enumerable: true, value: 1000 / this.targetFps });
    this._buffer = Array.from({ length: this.capacity }, () => ({ frameDeltaMs: 0, updateMs: 0,
      renderMs: 0, cpuMs: 0, particleCount: 0, drawCalls: 0 }));
    this._reset('');
    this._active = false;
  }

  _reset(label, baselineStats) {
    this._label = label;
    this._active = true;
    this._size = 0;
    this._writeIndex = 0;
    this._totalSampleCount = 0;
    this._warmupRemaining = this.warmupFrames;
    this._lastFrame = frameNumber(baselineStats?.frame) ? baselineStats.frame : -1;
    this._lastDroppedSteps = frameNumber(baselineStats?.droppedSteps) ? baselineStats.droppedSteps : null;
    this._droppedSteps = 0;
  }

  start(label = '', baselineStats) {
    if (typeof label !== 'string') throw new TypeError('Profiler label must be a string.');
    this._reset(label, baselineStats);
    return this;
  }

  /** True only when a new running frame was stored after warmup. */
  sample(stats) {
    if (!this._active || !stats || typeof stats !== 'object' || !frameNumber(stats.frame) || stats.frame < this._lastFrame) return false;
    if (stats.frame === this._lastFrame) {
      // A manual step can change cumulative counters without advancing rAF.
      // Rebase a newer counter, but never let an old snapshot move it backward.
      if (frameNumber(stats.droppedSteps) && (this._lastDroppedSteps === null || stats.droppedSteps > this._lastDroppedSteps)) this._lastDroppedSteps = stats.droppedSteps;
      return false;
    }
    // Consume observed frame IDs even if paused or malformed, so a later manual
    // render of that frame cannot convert it into a new measurement.
    this._lastFrame = stats.frame;
    const dropped = stats.droppedSteps;
    const validDropped = frameNumber(dropped);
    const droppedDelta = validDropped && this._lastDroppedSteps !== null ? Math.max(0, dropped - this._lastDroppedSteps) : 0;
    this._lastDroppedSteps = validDropped ? dropped : null;
    const { frameDeltaMs, updateMs, renderMs, particleCount, drawCalls } = stats;
    const cpuMs = updateMs + renderMs;
    if (stats.state !== 'running' || !Number.isFinite(frameDeltaMs) || frameDeltaMs <= 0
      || !finiteNonnegative(updateMs) || !finiteNonnegative(renderMs) || !Number.isFinite(cpuMs)
      || !frameNumber(particleCount) || !frameNumber(drawCalls) || !validDropped) return false;
    if (this._warmupRemaining > 0) { this._warmupRemaining -= 1; return false; }
    const record = this._buffer[this._writeIndex];
    record.frameDeltaMs = frameDeltaMs; record.updateMs = updateMs; record.renderMs = renderMs;
    record.cpuMs = cpuMs; record.particleCount = particleCount; record.drawCalls = drawCalls;
    this._writeIndex = (this._writeIndex + 1) % this.capacity;
    this._size = Math.min(this.capacity, this._size + 1);
    this._totalSampleCount += 1;
    this._droppedSteps = Math.min(Number.MAX_SAFE_INTEGER, this._droppedSteps + droppedDelta);
    return true;
  }

  stop() { this._active = false; return this.snapshot(); }

  snapshot() {
    const rows = this._buffer.slice(0, this._size);
    const frameDeltaMs = distribution(rows.map(row => row.frameDeltaMs));
    const updateMs = distribution(rows.map(row => row.updateMs));
    const renderMs = distribution(rows.map(row => row.renderMs));
    const cpuMs = distribution(rows.map(row => row.cpuMs));
    const overBudgetFrames = rows.filter(row => row.frameDeltaMs > this.frameBudgetMs).length;
    const cpuOverBudgetFrames = rows.filter(row => row.cpuMs > this.frameBudgetMs).length;
    return {
      label: this._label, active: this._active, targetFps: this.targetFps, frameBudgetMs: this.frameBudgetMs,
      capacity: this.capacity, warmupFrames: this.warmupFrames, warmupRemaining: this._warmupRemaining,
      sampleCount: this._size, totalSampleCount: this._totalSampleCount,
      metrics: {
        fps: this._size ? Math.min(Number.MAX_VALUE, 1000 / frameDeltaMs.mean) : 0,
        frameDeltaMs, updateMs, renderMs, cpuMs, overBudgetFrames,
        overBudgetRatio: this._size ? overBudgetFrames / this._size : 0,
        cpuOverBudgetFrames, cpuOverBudgetRatio: this._size ? cpuOverBudgetFrames / this._size : 0,
        peakParticles: rows.reduce((peak, row) => Math.max(peak, row.particleCount), 0),
        peakDrawCalls: rows.reduce((peak, row) => Math.max(peak, row.drawCalls), 0),
        droppedSteps: this._droppedSteps,
      },
    };
  }
}
