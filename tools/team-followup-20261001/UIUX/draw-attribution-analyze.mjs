import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const owned = fileURLToPath(new URL('./', import.meta.url));
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const overlap = (start, end, window) => Math.max(0, Math.min(end, window.end) - Math.max(start, window.start));
const metric = (group, name) => group.metrics.find(entry => entry.name === name).value;

export function alignClock(profile, clock) {
  const navigationUs = metric(clock.metrics, 'NavigationStart') * 1e6;
  assert.equal(metric(clock.stopMetrics, 'NavigationStart'), navigationUs / 1e6);
  const mapUs = timestamp => (timestamp - navigationUs) / 1000;
  const mappedAnchor = metric(clock.metrics, 'Timestamp') * 1000 - navigationUs / 1000;
  const anchorBefore = clock.anchorBefore.result.value;
  const anchorAfter = clock.anchorAfter.result.value;
  const start = mapUs(profile.startTime);
  return {
    navigationUs, mappedAnchor, anchorBefore, anchorAfter,
    anchorInsideBracket: mappedAnchor >= anchorBefore && mappedAnchor <= anchorAfter,
    bracketWidthMs: anchorAfter - anchorBefore,
    residualBracketMs: [anchorBefore - mappedAnchor, anchorAfter - mappedAnchor],
    profileStartMs: start, profileEndMs: mapUs(profile.endTime),
    profileBefore: clock.profileBefore.result.value, profileAfter: clock.profileAfter.result.value,
    profileStartInsideBracket: start >= clock.profileBefore.result.value && start <= clock.profileAfter.result.value,
    stopTimestampMs: metric(clock.stopMetrics, 'Timestamp') * 1000 - navigationUs / 1000
  };
}

export function buildIntervals(profile, navigationUs) {
  assert.equal(profile.samples.length, profile.timeDeltas.length);
  let timestamp = profile.startTime;
  return profile.samples.map((id, index) => {
    const delta = profile.timeDeltas[index];
    assert.ok(Number.isFinite(delta) && delta >= 0);
    const previous = timestamp;
    timestamp += delta;
    assert.ok(timestamp <= profile.endTime);
    return { index, id, start: (previous - navigationUs) / 1000, end: (timestamp - navigationUs) / 1000, deltaMs: delta / 1000 };
  });
}

export function classifyStack(stack) {
  const names = stack.map(frame => frame.functionName);
  const leaf = names.at(-1) || '';
  if (leaf.startsWith('(')) return 'runtime/unresolved';
  if (names.includes('getImageData') || names.includes('putImageData')) return 'Canvas-pixel-read/write';
  if (names.some(name => /fillText|strokeText|measureText|_getAtlasTxt|_syncTextFont/.test(name))) return 'text';
  if (names.some(name => /getElementById|querySelector|getComputedStyle|setAttribute/.test(name))) return 'DOM-api';
  if (names.some(name => /updateHUD|_hud|updateQS|_updateActionKeys|_updatePetBubble/.test(name))) return 'HUD/UI-helper';
  if (names.some(name => /texImage2D|texSubImage2D|bindTexture|drawElements|_glFlush|_flush|_getTex|_uploadCanvasTex/.test(name))) return 'GL-call-path';
  if (names.some(name => /drawImage|CanvasRenderingContext2D|createRadialGradient|fillRect|stroke|restore/.test(name))) return 'Canvas/image-api';
  return 'other-JS/unresolved';
}

export function summarizeIntervals(intervals, window, stackFor) {
  const groups = new Map();
  const categories = {};
  const samples = [];
  for (const interval of intervals) {
    const weight = overlap(interval.start, interval.end, window);
    if (!weight) continue;
    const stack = stackFor(interval.id);
    const category = classifyStack(stack);
    categories[category] = (categories[category] || 0) + weight;
    const previous = groups.get(interval.id) || { nodeId: interval.id, samples: 0, estimatedMs: 0, category, stack };
    previous.samples++;
    previous.estimatedMs += weight;
    groups.set(interval.id, previous);
    samples.push({ ...interval, overlapMs: weight });
  }
  return {
    estimatedCoveredMs: samples.reduce((sum, sample) => sum + sample.overlapMs, 0),
    categories, selfStacks: [...groups.values()].sort((first, second) => second.estimatedMs - first.estimatedMs), samples
  };
}

export function analyze() {
  const rawDirectory = path.join(root, 'outputs/team-review-20261001/draw-attribution');
  const inputNames = ['raw.json', 'profile.cpuprofile', 'clock.json', 'preflight.json'];
  const bytes = Object.fromEntries(inputNames.map(name => [name, fs.readFileSync(path.join(rawDirectory, name))]));
  const inputHashes = Object.fromEntries(inputNames.map(name => [name, sha256(bytes[name])]));
  const [raw, profile, clock, preflight] = inputNames.map(name => JSON.parse(bytes[name]));
  const aligned = alignClock(profile, clock);
  assert.ok(aligned.anchorInsideBracket && aligned.profileStartInsideBracket, '시계 정렬은 실제 bracket 안이어야 함');
  const intervals = buildIntervals(profile, aligned.navigationUs);
  const nodes = new Map(profile.nodes.map(node => [node.id, node]));
  const parents = new Map();
  for (const node of profile.nodes) for (const child of node.children || []) {
    assert.ok(!parents.has(child), '부모 노드 중복');
    parents.set(child, node.id);
  }
  const sources = new Map();
  function sourceFor(url) {
    if (!url) return null;
    if (sources.has(url)) return sources.get(url);
    let local = null;
    try {
      const parsed = new URL(url);
      const relative = decodeURIComponent(parsed.pathname).replace(/^\//, '');
      const absolute = path.resolve(root, relative);
      if (parsed.origin === new URL(preflight.url).origin && absolute.startsWith(root) && fs.existsSync(absolute)) {
        const source = fs.readFileSync(absolute);
        local = { relative, sha256: sha256(source), lines: source.toString('utf8').split('\n'), preflightHashMatch: relative === 'game.html' ? sha256(source) === preflight.sha256 : null };
      }
    } catch {}
    sources.set(url, local);
    return local;
  }
  function stackFor(id) {
    const stack = [];
    const visited = new Set();
    while (id !== undefined) {
      assert.ok(!visited.has(id), '순환 stack');
      visited.add(id);
      const node = nodes.get(id);
      assert.ok(node, `missing node ${id}`);
      const frame = node.callFrame;
      const source = sourceFor(frame.url);
      const line1 = frame.lineNumber >= 0 ? frame.lineNumber + 1 : null;
      stack.unshift({ nodeId: id, functionName: frame.functionName || '<anonymous>', url: frame.url,
        scriptId: frame.scriptId, line0: frame.lineNumber, line1, column0: frame.columnNumber,
        sourcePath: source?.relative || null, sourceSha256: source?.sha256 || null,
        sourceLine: line1 ? source?.lines[line1 - 1]?.trim() || null : null });
      id = parents.get(id);
    }
    return stack;
  }
  const forward = intervals.map((interval, index) => ({ ...interval, start: interval.end, end: index + 1 < intervals.length ? intervals[index + 1].end : aligned.profileEndMs }));
  const slowSpans = raw.spans.filter(span => span.kind === 'draw' && span.duration > 50);
  assert.equal(slowSpans.length, 2);
  const windows = slowSpans.map(span => ({
    span, loop: raw.loops.find(loop => loop.id === span.loopId),
    backwardDeltaEstimate: summarizeIntervals(intervals, span, stackFor),
    forwardHoldSensitivity: summarizeIntervals(forward, span, stackFor),
    bracketShiftSensitivity: aligned.residualBracketMs.map(shiftMs => ({ shiftMs,
      estimate: summarizeIntervals(intervals.map(interval => ({ ...interval, start: interval.start + shiftMs, end: interval.end + shiftMs })), span, stackFor) }))
  }));
  const full = summarizeIntervals(intervals, { start: aligned.profileStartMs, end: aligned.profileEndMs }, stackFor);
  const inclusive = new Map();
  for (const self of full.selfStacks) for (const frame of self.stack) inclusive.set(frame.nodeId, (inclusive.get(frame.nodeId) || 0) + self.estimatedMs);
  const allStacks = profile.nodes.map(node => ({ nodeId: node.id, selfEstimatedMs: full.selfStacks.find(row => row.nodeId === node.id)?.estimatedMs || 0, inclusiveEstimatedMs: inclusive.get(node.id) || 0, stack: stackFor(node.id) }));
  const sourceHashes = Object.fromEntries([...sources.values()].filter(Boolean).map(source => [source.relative, source.sha256]));
  assert.ok([...sources.values()].some(source => source?.preflightHashMatch === true));
  for (const name of inputNames) assert.equal(sha256(fs.readFileSync(path.join(rawDirectory, name))), inputHashes[name], '원자료 변경');
  for (const [relative, hash] of Object.entries(sourceHashes)) assert.equal(sha256(fs.readFileSync(path.join(root, relative))), hash, 'source 변경');
  return {
    inputHashes, sourceHashes, aligned, environment: preflight, rawInitial: raw.initial, rawEnd: raw.end,
    profileSampleCount: profile.samples.length, actualDeltaMs: { min: Math.min(...profile.timeDeltas) / 1000, max: Math.max(...profile.timeDeltas) / 1000, total: profile.timeDeltas.reduce((sum, value) => sum + value, 0) / 1000 },
    profileTailUnestimatedMs: aligned.profileEndMs - intervals.at(-1).end,
    windows, full, allStacks,
    limitations: '샘플 endpoint의 delta를 뒤 구간에 배분한 추정. forward hold/anchor bracket shift는 민감도 대조일 뿐 실제 체류시간·오차 보정값이 아님. native/JS/GPU대기 완전분해·GPU완료·프로파일러오버헤드·이전 사건 동일성 미확정. 게임 source는 preflight SHA 대조, 다른 URL 로컬파일과 브라우저실행바이트 동일성 UNKNOWN.'
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = analyze();
  fs.writeFileSync(path.join(owned, 'draw-attribution-analysis.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ aligned: result.aligned, windows: result.windows.map(window => ({ span: window.span, categories: window.backwardDeltaEstimate.categories, topStacks: window.backwardDeltaEstimate.selfStacks.slice(0, 3) })), inputHashes: result.inputHashes }, null, 2));
}
