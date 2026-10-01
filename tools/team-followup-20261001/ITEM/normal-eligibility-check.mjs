import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const base = 'outputs/team-review-20261001/support/normal-combat/';
const currentPath = 'tools/team-followup-20261001/QA/analyze-support-normal.mjs';
const beforePath = 'tools/team-followup-20261001/root-review/normal-analyzer-before.mjs';
const files = [base + 'raw.json', base + 'analysis.json', base + 'preflight.json', currentPath, beforePath,
  'outputs/team-review-20261001/draw-attribution/normal-analysis-before.json',
  'tools/team-followup-20261001/BUILD/normal-combat-audit-evidence.json',
  'tools/team-followup-20261001/BUILD/normal-combat-audit-check.mjs',
  'tools/team-followup-20261001/root-review/normal-analyzer-check.mjs'];
const text = file => fs.readFileSync(file, 'utf8');
const hash = file => crypto.createHash('sha256').update(text(file)).digest('hex');
const hashes = Object.fromEntries(files.map(file => [file, hash(file)]));
const raw = JSON.parse(text(files[0]));
const saved = JSON.parse(text(files[1]));
const beforeSaved = JSON.parse(text(files[5]));
const buildEvidence = JSON.parse(text(files[6]));
const copy = value => structuredClone(value);
function analyze(source, value) {
  let result;
  const script = source.replace("import fs from 'node:fs';", '')
    .replace("new URL('../../../outputs/team-review-20261001/support/normal-combat/',import.meta.url)", "new URL('file:///memory/')");
  vm.runInNewContext(script, { URL, fs: {
    readFileSync: () => JSON.stringify(value),
    writeFileSync: (file, body) => { result = JSON.parse(body); }
  }, console: { log() {} } }, { timeout: 1000 });
  return result;
}
const before = text(beforePath);
const current = text(currentPath);
const beforeResult = analyze(before, raw);
const currentResult = analyze(current, raw);
assert.deepEqual(beforeResult, beforeSaved);
assert.deepEqual(currentResult, saved);
assert.equal(currentResult.eligible, true);
for (const key of ['full', 'firstKillWindow', 'denseLongest', 'denseSegments', 'firstObservedKill', 'kills', 'inputs']) {
  assert.deepEqual(currentResult[key], beforeResult[key]);
}
const mutations = [
  ['empty rows', value => { value.rows = []; }],
  ['empty draws', value => { value.draws = []; }],
  ['empty inputs', value => { value.inputs = []; }],
  ['not stopped', value => { value.stopped = false; }],
  ['firstKill before input', value => { value.firstKill.at = value.firstInput.at - 1; }],
  ['firstKill inconsistent batch', value => { value.firstKill.kills = 999; }],
  ['nonfinite timestamp JSON null', value => { value.rows[5].timestamp = null; }],
  ['backward timestamp', value => { value.rows[5].timestamp = value.rows[4].timestamp - 10; }],
  ['negative draw duration', value => { value.draws[5].end = value.draws[5].at - 1; }],
  ['untrusted input', value => { value.inputs[0].trusted = false; }],
  ['end unfocused', value => { value.end.focus = false; }],
  ['dropped field missing', value => { delete value.dropped; }]
];
assert.deepEqual(mutations.map(([name]) => name), buildEvidence.counterexamples.map(entry => entry.input));
const counterexamples = mutations.map(([name, mutate]) => {
  const value = copy(raw);
  mutate(value);
  const oldOutput = analyze(before, value);
  const output = analyze(current, value);
  assert.equal(oldOutput.eligible, true);
  assert.equal(output.eligible, false);
  assert(output.exclusions.length > 0);
  return { name, beforeEligible: oldOutput.eligible, currentEligible: output.eligible, reasons: output.exclusions };
});
const probes = [
  ['unknown schema', value => { value.schema = 'unknown'; }],
  ['missing rows array', value => { delete value.rows; }],
  ['missing firstInput', value => { delete value.firstInput; }],
  ['missing firstKill', value => { delete value.firstKill; }],
  ['invalid endpoint paused', value => { value.end.paused = true; }],
  ['future rAF timestamp', value => { value.rows.at(-1).timestamp = value.rows.at(-1).at + 1000000; }],
  ['negative initial rAF timestamp', value => { value.rows[0].timestamp = -1; }],
  ['reversed inputs array', value => { [value.inputs[0], value.inputs[1]] = [value.inputs[1], value.inputs[0]]; }]
];
const findings = probes.map(([name, mutate]) => {
  const value = copy(raw);
  mutate(value);
  const output = analyze(current, value);
  return { name, eligible: output.eligible, exclusions: output.exclusions, raf: output.full?.rafTimestampIntervals };
});
let rootEvidence;
const rootCheck = text(files[8]).replace(/^import .*;$/gm, '')
  .replace("const root=new URL('../../../',import.meta.url)", "const root=new URL('../../../'," + JSON.stringify('file://' + process.cwd() + '/' + files[8]) + ")")
  .replace("new URL('./normal-analyzer-final-evidence.json',import.meta.url)", "new URL('file:///memory/root-evidence.json')");
vm.runInNewContext(rootCheck, { URL, crypto, assert, vm,
  fs: { readFileSync: (...args) => fs.readFileSync(...args),
    writeFileSync: (file, body) => { rootEvidence = JSON.parse(body); } },
  console: { log() {} }, process: { exitCode: 0 } }, { timeout: 3000 });
assert.equal(rootEvidence.pass, 21);
assert.equal(rootEvidence.fail, 0);
const replacement = "  require(Number.isFinite(row?.timestamp)&&row.timestamp>=0&&row.timestamp<=row.at,'invalid rAF/snapshot chronology '+index);\n";
const inputReplacement = "for(const [index,input] of raw.inputs.entries())if(index)require(input.at>=raw.inputs[index-1].at,'nonmonotonic input '+index);\n";
const candidate = current.replace('for(const [index,row] of raw.rows.entries()){', 'for(const [index,row] of raw.rows.entries()){\n' + replacement)
  .replace('const firstInput=raw.inputs.find', inputReplacement + 'const firstInput=raw.inputs.find');
assert.notEqual(candidate, current);
assert.deepEqual(analyze(candidate, raw), currentResult);
for (const [, mutate] of [...mutations, ...probes]) {
  const value = copy(raw);
  mutate(value);
  assert.equal(analyze(candidate, value).eligible, false);
}
for (const file of files) assert.equal(hash(file), hashes[file]);
process.stdout.write(JSON.stringify({ checkedAt: new Date().toISOString(), hashes,
  preservedMetrics: ['full', 'firstKillWindow', 'denseLongest', 'denseSegments', 'firstObservedKill', 'kills', 'inputs'],
  eligibleBefore: beforeResult.eligible, eligibleCurrent: currentResult.eligible,
  counterexamples, findings, minimalInputs: {
    futureTimestamp: { path: 'rows[last].timestamp', expression: 'rows[last].at + 1000000' },
    negativeTimestamp: { path: 'rows[0].timestamp', value: -1 },
    reversedInputs: 'swap inputs[0] and inputs[1], no other edits'
  }, rootCheck: { pass: rootEvidence.pass, fail: rootEvidence.fail, mode: 'fs writes intercepted in memory, no root evidence overwrite' },
  candidateChecks: '정상 원자료 출력 동일; BUILD12+추가8 모두 거부; 공유파일 수정0',
  limitations: ['synchronousDrawCPU means synchronous elapsed wall time, not CPU-only or GPU completion', 'candidate unadopted', 'no live measurement', 'JSON serializable fixtures only'] }, null, 2) + '\n');
