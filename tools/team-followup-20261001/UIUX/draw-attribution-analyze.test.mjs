import test from 'node:test';
import assert from 'node:assert/strict';
import { alignClock, buildIntervals, summarizeIntervals, classifyStack, analyze } from './draw-attribution-analyze.mjs';

test('microsecond profile times align through NavigationStart seconds and direct Runtime brackets', () => {
  const result = analyze();
  assert.equal(result.aligned.anchorInsideBracket, true);
  assert.equal(result.aligned.profileStartInsideBracket, true);
  assert.ok(Math.abs(result.aligned.profileStartMs - 47677.764) < 1e-6);
  assert.equal(result.windows.length, 2);
  assert.equal(result.rawEnd.kills, 9);
});

test('overlap accounting clips sample deltas to window; self estimates do not double-count callers', () => {
  const intervals = buildIntervals({ startTime: 1000000, endTime: 1009000, samples: [1, 2], timeDeltas: [4000, 4000] }, 1000000);
  const estimate = summarizeIntervals(intervals, { start: 2, end: 6 }, id => [{ functionName: id === 1 ? 'getImageData' : 'measureText' }]);
  assert.equal(estimate.estimatedCoveredMs, 4);
  assert.deepEqual(estimate.categories, { 'Canvas-pixel-read/write': 2, text: 2 });
  assert.throws(() => buildIntervals({ startTime: 0, endTime: 1, samples: [1], timeDeltas: [-1] }, 0));
});

test('clock mismatch and navigation change are not silently rebased', () => {
  const group = { metrics: [{ name: 'NavigationStart', value: 1 }, { name: 'Timestamp', value: 2 }] };
  const clock = { metrics: group, stopMetrics: group, anchorBefore: { result: { value: 0 } }, anchorAfter: { result: { value: 1 } }, profileBefore: { result: { value: 0 } }, profileAfter: { result: { value: 1 } } };
  assert.equal(alignClock({ startTime: 2000000, endTime: 3000000 }, clock).anchorInsideBracket, false);
  assert.throws(() => alignClock({ startTime: 2000000, endTime: 3000000 }, { ...clock, stopMetrics: { metrics: [{ name: 'NavigationStart', value: 3 }] } }));
});

test('categories require sampled API/helper names and do not attribute readback to HUD or GPU completion', () => {
  assert.equal(classifyStack([{ functionName: 'draw' }, { functionName: 'getImageData' }]), 'Canvas-pixel-read/write');
  assert.equal(classifyStack([{ functionName: 'updateHUD' }]), 'HUD/UI-helper');
  assert.equal(classifyStack([{ functionName: 'querySelector' }]), 'DOM-api');
  assert.equal(classifyStack([{ functionName: 'texImage2D' }]), 'GL-call-path');
  assert.equal(classifyStack([{ functionName: '(idle)' }]), 'runtime/unresolved');
});

test('two actual long draw stacks resolve to source-backed readback paths with full-stack evidence', () => {
  const result = analyze();
  const first = result.windows[0].backwardDeltaEstimate.selfStacks[0];
  const second = result.windows[1].backwardDeltaEstimate.selfStacks[0];
  assert.ok(first.estimatedMs > 100);
  assert.ok(second.estimatedMs > 85);
  assert.ok(first.stack.some(frame => frame.functionName === '_tintHolyDome' && frame.line1 === 8737 && frame.sourceSha256));
  assert.ok(second.stack.some(frame => frame.functionName === 'membrane' && frame.line1 === 120 && frame.sourceSha256));
  assert.equal(first.stack.at(-1).functionName, 'getImageData');
  assert.equal(second.stack.at(-1).functionName, 'getImageData');
  for (const window of result.windows) {
    assert.ok(Math.abs(window.backwardDeltaEstimate.estimatedCoveredMs - window.span.duration) < 1e-6);
    assert.equal(window.backwardDeltaEstimate.categories['HUD/UI-helper'], undefined);
    assert.equal(window.backwardDeltaEstimate.categories.text, undefined);
  }
  assert.equal(result.allStacks.length, 519);
});
