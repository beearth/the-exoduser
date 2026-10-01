import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const root = process.cwd();
const base = path.join(root, 'outputs/team-review-20261001/draw-attribution');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = name => JSON.parse(fs.readFileSync(path.join(base, name), 'utf8'));
const raw = read('raw.json');
const profile = read('profile.cpuprofile');
const clock = read('clock.json');
const preflight = read('preflight.json');
const metric = (collection, name) => collection.metrics.find(entry => entry.name === name).value;
const navigationUs = metric(clock.metrics, 'NavigationStart') * 1e6;
const aligned = timestamp => (timestamp - navigationUs) / 1000;
const bracketBefore = clock.anchorBefore.result.value;
const bracketAfter = clock.anchorAfter.result.value;
const anchor = aligned(metric(clock.metrics, 'Timestamp') * 1e6);
assert(anchor >= bracketBefore && anchor <= bracketAfter);
assert.equal(metric(clock.stopMetrics, 'NavigationStart'), metric(clock.metrics, 'NavigationStart'));
assert(aligned(profile.startTime) >= clock.profileBefore.result.value);
assert(aligned(profile.startTime) <= clock.profileAfter.result.value);
assert.equal(profile.samples.length, profile.timeDeltas.length);
assert.equal(hash(path.join(root, 'game.html')), preflight.sha256);
const nodes = new Map(profile.nodes.map(node => [node.id, node]));
const parents = new Map();
for (const node of profile.nodes) {
  for (const child of node.children || []) {
    assert(!parents.has(child));
    parents.set(child, node.id);
  }
}
const sourceHashes = {};
function frame(node) {
  const call = node.callFrame;
  let source = null;
  if (call.url.startsWith('http://qa-draw-attribution-20261001.localhost:3340/')) {
    const relative = new URL(call.url).pathname.slice(1);
    if (['game.html', 'ch1-living-detail.js'].includes(relative)) {
      source = relative;
      if (!sourceHashes[source]) sourceHashes[source] = hash(path.join(root, source));
    }
  }
  return { nodeId: node.id, function: call.functionName, url: call.url,
    line0: call.lineNumber, line1: call.lineNumber >= 0 ? call.lineNumber + 1 : null,
    column0: call.columnNumber, source, positionTicks: node.positionTicks || [] };
}
function stack(id) {
  const chain = [];
  const visited = new Set();
  while (id != null) {
    assert(!visited.has(id));
    visited.add(id);
    assert(nodes.has(id));
    chain.unshift(frame(nodes.get(id)));
    id = parents.get(id);
  }
  return chain;
}
let timestamp = profile.startTime;
const samples = profile.samples.map((id, index) => {
  const previous = timestamp;
  assert(profile.timeDeltas[index] >= 0);
  timestamp += profile.timeDeltas[index];
  return { index, id, start: aligned(previous), end: aligned(timestamp), stack: stack(id) };
});
assert(timestamp <= profile.endTime);
function aggregate(selected) {
  const groups = new Map();
  for (const sample of selected) {
    const key = sample.stack.map(entry => entry.nodeId).join('/');
    const group = groups.get(key) || { stack: sample.stack, sampleCount: 0, estimatedMs: 0 };
    group.sampleCount++;
    group.estimatedMs += sample.weight;
    groups.set(key, group);
  }
  return [...groups.values()].sort((left, right) => right.estimatedMs - left.estimatedMs);
}
const windows = raw.spans.filter(span => span.kind === 'draw' && span.duration > 50).map(span => {
  const loop = raw.loops.find(entry => entry.id === span.loopId);
  assert(loop && span.start >= loop.start && span.end <= loop.end);
  const selected = samples.filter(sample => sample.end > span.start && sample.start < span.end)
    .map(sample => ({ ...sample, weight: Math.max(0, Math.min(span.end, sample.end) - Math.max(span.start, sample.start)) }));
  const stacks = aggregate(selected);
  const itemSamples = selected.filter(sample => sample.stack.some(entry => /_worldItemSkin|_maskWorldDropBlack|_itemSkinSrc/.test(entry.function)));
  const rngSamples = selected.filter(sample => sample.stack.some(entry => /rand|rng/i.test(entry.function)));
  const estimatedMs = selected.reduce((sum, sample) => sum + sample.weight, 0);
  assert(estimatedMs <= span.duration + 0.001);
  return { span, relativeToInputMs: span.start - raw.inputAt, loop,
    previousLoopAfter: raw.loops.find(entry => entry.id === loop.id - 1)?.after || null,
    sampleCount: selected.length, estimatedMs, stacks,
    itemSampleCount: itemSamples.length, rngSampleCount: rngSamples.length,
    endpointOnlyStacks: aggregate(samples.filter(sample => sample.end >= span.start && sample.end < span.end)
      .map(sample => ({ ...sample, weight: sample.end - sample.start }))) };
});
assert.equal(windows.length, 2);
const itemProfileSamples = samples.filter(sample => sample.stack.some(entry => /_worldItemSkin|_maskWorldDropBlack/.test(entry.function)))
  .map(sample => ({ index: sample.index, start: sample.start, end: sample.end, stack: sample.stack }));
const result = {
  generatedAt: new Date().toISOString(),
  inputs: Object.fromEntries(['raw.json', 'profile.cpuprofile', 'clock.json', 'preflight.json'].map(name => [name, hash(path.join(base, name))])),
  sourceHashes, sourceVerification: { gameMatchesPreflight: true, externalScriptHistoricalHash: 'UNKNOWN: local current hash only; root preflight has no external script digest' },
  clock: { navigationUs, bracketBefore, anchor, bracketAfter, bracketWidthMs: bracketAfter - bracketBefore,
    profileStartMs: aligned(profile.startTime), profileBefore: clock.profileBefore.result.value,
    profileAfter: clock.profileAfter.result.value, profileEndMs: aligned(profile.endTime),
    stopMetricsMs: aligned(metric(clock.stopMetrics, 'Timestamp') * 1e6),
    finalSampleMs: aligned(timestamp), unsampledTailMs: (profile.endTime - timestamp) / 1000 },
  method: 'timeDelta preceding interval assigned to endpoint stack, clipped to draw bounds; endpoint-only alternative retained; sampled estimates, not complete CPU/native/GPU split',
  environment: raw.environment, initial: raw.initial, end: raw.end, dropped: raw.dropped,
  cleanupErrors: raw.cleanupErrors, windows, itemProfileSamples,
  limitations: ['observer/profiler overhead unmeasured', 'cache UNKNOWN; environment warm flag not cache proof', 'separate from support/normal-combat 129.8ms event', 'draw wrapper wall elapsed not GPU completion', 'zero sampled calls does not prove zero actual calls', 'native getImageData stack does not isolate readback wait from native work', 'positionTicks are whole-profile line counts, not window-specific samples'],
  checks: 'clock bracket/start bracket, NavigationStart stability, source preflight hash, profile lengths/tree/deltas, span containment, two windows, clipped budget assertions PASS'
};
result.frames = profile.nodes.map(frame);
process.stdout.write(JSON.stringify(result, (key, value) => key === 'stack' ? value.map(entry => entry.nodeId) : value) + '\n');
