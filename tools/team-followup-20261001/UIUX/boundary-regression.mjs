import fs from 'node:fs';
import assert from 'node:assert/strict';

const folder = 'tools/team-followup-20261001/UIUX';
let equivalence = fs.readFileSync(`${folder}/hotpath-equivalence.test.mjs`, 'utf8');
equivalence = equivalence.replace("from './coordinate-hotpath-v2.mjs'", `from '${new URL('./coordinate-bounded-v2.mjs', import.meta.url).href}'`).replace("from './coordinate-adapter.mjs'", `from '${new URL('./coordinate-adapter.mjs', import.meta.url).href}'`).replaceAll('hotpath-coefficients.json', 'boundary-coefficients.json');
const emptyBefore = 'assert.deepEqual(planReadingsV2([], null, workspace), []);';
assert.equal(equivalence.split(emptyBefore).length - 1, 1);
equivalence = equivalence.replace(emptyBefore, "assert.deepEqual(planReadingsV2([], frame, workspace), []);assert.throws(()=>planReadingsV2([],null,workspace),TypeError);");
await import('data:text/javascript;base64,' + Buffer.from(equivalence).toString('base64'));
let runtime = fs.readFileSync(`${folder}/hotpath-runtime.test.mjs`, 'utf8');
runtime = runtime.replaceAll('hotpath-v2-runtime-fixture.js', 'boundary-bounded-runtime-fixture.js').replaceAll('hotpath-runtime-validation.json', 'boundary-runtime-validation.json');
await import('data:text/javascript;base64,' + Buffer.from(runtime).toString('base64'));
const original = JSON.parse(fs.readFileSync(`${folder}/hotpath-coefficients.json`, 'utf8'));
const current = JSON.parse(fs.readFileSync(`${folder}/boundary-coefficients.json`, 'utf8'));
assert.equal(current.coefficients.length, original.coefficients.length);
for (let index = 0; index < current.coefficients.length; index++) {
  const oldRow = original.coefficients[index], row = current.coefficients[index];
  assert.equal(row.fixture, oldRow.fixture); assert.equal(row.count, oldRow.count); assert.equal(row.unresolved, oldRow.unresolved);
  for (const key of ['intersectionTests', 'binVisits', 'candidateAttempts', 'sortCalls', 'mapConstructions', 'freshRecords']) assert.equal(row.v2Warm[key], oldRow.v2Warm[key], `${row.fixture} ${row.count} ${key}`);
  assert.equal(row.v2Warm.linearFallbacks, 0); assert.equal(row.v2Warm.wideRegistrations, 0); assert.equal(row.v2Warm.validationFallbacks, 0);
}
console.log(JSON.stringify({ previousGroups: current.checks, runtimeSequences: 6, coefficientPairsUnchanged: current.coefficients.length, emptyInvalidFrameContract: 'v1 TypeError restored' }));
