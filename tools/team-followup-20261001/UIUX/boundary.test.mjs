import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { planReadings } from './coordinate-adapter.mjs';
import { createWorkspaceV2, planReadingsV2 } from './coordinate-bounded-v2.mjs';

const folder = 'tools/team-followup-20261001/UIUX';
const original = fs.readFileSync(`${folder}/coordinate-hotpath-v2.mjs`, 'utf8');
const bounded = fs.readFileSync(`${folder}/coordinate-bounded-v2.mjs`, 'utf8');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const base = { width: 1280, height: 800, cameraX: 0, cameraY: 0, shakeX: 0, shakeY: 0, zoom: 1, ssaa: 1, backingWidth: 1280, backingHeight: 800, cssWidth: 1280, cssHeight: 800, cssLeft: 0, cssTop: 0, dpr: 1 };
const reading = { id: 'reading', kind: 'charge', box: { x: 0, y: 0, w: 10, h: 20 } };
const overflow = [{ id: 'overflow', kind: 'charge', box: { x: 0, y: 1e308, w: 10, h: 1e308 } }];
const reproduce = vm.createContext({ readings: overflow, frame: { ...base, zoom: 2 } });
let oldFailure;
try { new vm.Script(original.replaceAll('export function ', 'function ') + '\nplanReadingsV2(readings,frame,createWorkspaceV2());').runInContext(reproduce, { timeout: 25 }); }
catch (error) { oldFailure = error.code; }
assert.equal(oldFailure, 'ERR_SCRIPT_EXECUTION_TIMEOUT');
console.log('PASS 원 v2 overflow timeout25ms 재현');

const boundedBody = bounded.replace(/^import .*\n/, '').replace(/^export \{.*\n/m, '').replaceAll('export function ', 'function ');
const workspace = createWorkspaceV2();
const context = vm.createContext({ referencePlanReadings: planReadings, workspace });
new vm.Script(boundedBody).runInContext(context);
const normalized = value => structuredClone(value);
const run = (fn, readings, frame, obstacles, gap) => {
  try { return { output: normalized(fn(readings, frame, obstacles, gap)) }; }
  catch (error) { return { error: { name: error.name, message: error.message } }; }
};
const boundedCall = (readings, frame, obstacles = [], gap = 4) => {
  Object.assign(context, { readings, frame, obstacles, gap });
  new vm.Script('globalThis.result=planReadingsV2(readings,frame,workspace,obstacles,gap);').runInContext(context, { timeout: 250 });
  return context.result;
};
const cases = [
  ['overflow', overflow, { ...base, zoom: 2 }],
  ['finite enormous y', [{ ...reading, box: { x: 0, y: 1e200, w: 10, h: 20 } }], base],
  ['finite enormous height', [{ ...reading, box: { x: 0, y: 0, w: 10, h: 1e200 } }], base],
  ['sum overflow accepted endpoint', [{ ...reading, box: { x: 0, y: 1e308, w: 10, h: 1e308 } }], base],
  ['band increment precision stall', [{ ...reading, box: { x: 0, y: 1e20, w: 10, h: 20 } }], { ...base, height: 1e30, backingHeight: 1e30, cssHeight: 1e30 }],
  ['huge finite gap query', [reading, { ...reading, id: 'second' }], base, [], 1e200],
  ['query endpoint overflow', [reading], { ...base, height: 1e308, backingHeight: 1e308, cssHeight: 1e308 }, [], 1e308],
  ['wide obstacle collision', [reading, { ...reading, id: 'second' }], base, [{ x: 630, y: 0, w: 40, h: 1e20 }]],
  ['negative huge obstacle', [reading], base, [{ x: 630, y: -1e200, w: 40, h: 1e200 }]],
  ['zero width', [{ ...reading, box: { ...reading.box, w: 0 } }], base],
  ['negative height', [{ ...reading, box: { ...reading.box, h: -1 } }], base],
  ['NaN x', [{ ...reading, box: { ...reading.box, x: NaN } }], base],
  ['Infinity y', [{ ...reading, box: { ...reading.box, y: Infinity } }], base],
  ['duplicate id', [reading, reading], base],
  ['invalid kind', [{ ...reading, kind: 'other' }], base],
  ['invalid obstacle precedes reading', overflow, { ...base, zoom: 2 }, [{ x: 0, y: 0, w: 0, h: 10 }]],
  ['viewport division overflow', [reading], { ...base, ssaa: Number.MIN_VALUE }],
  ['viewport division underflow', [reading], { ...base, backingWidth: Number.MIN_VALUE, ssaa: Number.MAX_VALUE }],
  ['gap division overflow', [reading], { ...base, cssWidth: Number.MIN_VALUE }],
  ['zero times ratio Infinity', [reading], { ...base, cssWidth: Number.MIN_VALUE }, [], 0],
  ['camera arithmetic overflow', [reading], { ...base, width: 1e308, cameraX: -1e308, shakeX: 1e308 }],
  ['mapped width overflow', [{ ...reading, box: { ...reading.box, w: 1e308 } }], { ...base, zoom: 2 }],
  ['mapped height underflow', [{ ...reading, box: { ...reading.box, h: Number.MIN_VALUE } }], { ...base, zoom: Number.MIN_VALUE }],
  ['NaN gap', [reading], base, [], NaN],
  ['negative gap', [reading], base, [], -1],
  ['invalid frame', [reading], { ...base, zoom: 0 }],
  ['empty invalid frame preserves v1 rejection', [], null],
  ['empty valid frame', [], base],
  ['null box', [{ ...reading, box: null }], base],
  ['missing id', [{ kind: 'charge', box: reading.box }], base]
];
const observations = [];
for (const [name, readings, frame, obstacles = [], gap = 4] of cases) {
  const expected = run(planReadings, readings, frame, obstacles, gap);
  const actual = run(boundedCall, readings, frame, obstacles, gap);
  assert.deepEqual(actual, expected, name);
  assert.ok(workspace.stats.registeredBands <= 64 * (readings.length + obstacles.length), `${name} registration bound`);
  assert.ok(workspace.stats.binVisits <= 64 * workspace.stats.candidateAttempts, `${name} query bound`);
  observations.push({ name, verdict: 'PASS', error: actual.error || null, boundedStats: { ...workspace.stats } });
  const recovery = run(boundedCall, [reading], base, [], 4);
  assert.deepEqual(recovery, run(planReadings, [reading], base, [], 4), `${name} workspace recovery`);
  console.log(`PASS ${name} / workspace 재사용`);
}
assert.equal(fs.readFileSync(`${folder}/coordinate-hotpath-v2.mjs`, 'utf8'), original);
const embeddedContext = vm.createContext({});
new vm.Script(fs.readFileSync(`${folder}/boundary-bounded-runtime-fixture.js`, 'utf8')).runInContext(embeddedContext);
let embeddedChecks = 0;
for (const [name, readings, frame, obstacles = [], gap = 4] of cases) {
  const expected = run(planReadings, readings, frame, obstacles, gap);
  Object.assign(embeddedContext, { readings, frame, obstacles, gap });
  const actual = run(() => {
    new vm.Script('globalThis.result=_uiuxCoordinateCandidate.planReadingsV2(readings,frame,_uiuxV2Workspace,obstacles,gap)').runInContext(embeddedContext, { timeout: 250 });
    return embeddedContext.result;
  });
  assert.deepEqual(actual, expected, `${name} embedded hunk`);
  embeddedChecks++;
}
fs.writeFileSync(`${folder}/boundary-validation.json`, JSON.stringify({ observedAt: new Date().toISOString(), originalSha256: hash(original), boundedSha256: hash(bounded), originalFailure: oldFailure, originalTimeoutMs: 25, boundedTimeoutMs: 250, caseCount: observations.length, embeddedChecks, observations, visualVerdict: 'UNKNOWN', performanceVerdict: 'UNKNOWN' }, null, 2) + '\n');
console.log(JSON.stringify({ boundaryCases: observations.length, workspaceRecoveries: observations.length, originalPreserved: true }));
