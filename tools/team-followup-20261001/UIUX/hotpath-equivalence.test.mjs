import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { chargeBox, numberGlyphBoxes, unionBoxes } from './coordinate-adapter.mjs';
import { createWorkspaceV2, numberBoxV2, createSnapshotV2, planReadingsV2, paintReadingsV2 } from './coordinate-hotpath-v2.mjs';

const folder = 'tools/team-followup-20261001/UIUX';
const layoutSource = fs.readFileSync(`${folder}/layout-candidate.mjs`, 'utf8');
const adapterSource = fs.readFileSync(`${folder}/coordinate-adapter.mjs`, 'utf8');
const game = fs.readFileSync('game.html', 'utf8');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const instrumented = layoutSource.replace('export function ', 'function ').replaceAll('export function ', 'function ').replace('return first.x <', 'stats.intersectionTests++; return first.x <').replace('for (const offset of offsets) {', 'for (const offset of offsets) { stats.candidateAttempts++;') + adapterSource.replace(/^import .*\n/, '').replaceAll('export function ', 'function ');
const frame = Object.freeze({ width: 1280, height: 800, cameraX: 0, cameraY: 0, shakeX: 0, shakeY: 0, zoom: 1, ssaa: 1, backingWidth: 1280, backingHeight: 800, cssWidth: 1280, cssHeight: 800, cssLeft: 0, cssTop: 0, dpr: 1 });
const statsFactory = () => ({ intersectionTests: 0, candidateAttempts: 0, sortCalls: 0, mapCalls: 0, mapConstructions: 0 });
function reference(readings, currentFrame, obstacles = []) {
  const stats = statsFactory();
  const context = vm.createContext({ stats });
  vm.runInContext(`globalThis.readings=${JSON.stringify(readings)};globalThis.frame=${JSON.stringify(currentFrame)};globalThis.obstacles=${JSON.stringify(obstacles)};`, context);
  new vm.Script(`const originalSort=Array.prototype.sort;Array.prototype.sort=function(...args){stats.sortCalls++;return originalSort.apply(this,args)};const originalMap=Array.prototype.map;Array.prototype.map=function(...args){stats.mapCalls++;return originalMap.apply(this,args)};const NativeMap=Map;Map=class extends NativeMap{constructor(...args){super(...args);stats.mapConstructions++}};\n${instrumented}`).runInContext(context);
  vm.runInContext('globalThis.result=planReadings(readings,frame,obstacles);', context);
  vm.runInContext("const paintContext={save(){},restore(){},translate(){}};for(const reading of readings)reading.paint=()=>{};paintReadings(paintContext,readings,result)", context);
  return { output: JSON.parse(JSON.stringify(context.result)), stats };
}
const coefficients = [];
let checks = 0;
const check = (name, run) => { run(); checks++; console.log(`PASS ${name}`); };
function fixture(count, dense) {
  const readings = [];
  let glyphs = 0;
  let numbers = 0;
  for (let index = 0; index < count; index++) {
    const horizontal = dense ? 0 : -500 + (index % 10) * 100;
    const vertical = dense ? 0 : -250 + Math.floor(index / 10) * 44;
    const kind = index % 3 === 0 ? 'charge' : 'damage';
    let box;
    if (kind === 'charge') box = chargeBox(horizontal, vertical, 12, 110);
    else {
      const cells = numberGlyphBoxes('12345', horizontal, vertical, 0.62);
      glyphs += cells.length; numbers++;
      box = unionBoxes(cells);
      assert.deepEqual(numberBoxV2('12345', horizontal, vertical, 0.62), box);
    }
    readings.push(Object.freeze({ id: `${kind}-${index}`, kind, box: Object.freeze(box) }));
  }
  return { readings: Object.freeze(readings), glyphs, numbers };
}
for (const dense of [false, true]) for (const count of [0, 1, 30, 120]) {
  check(`v1/v2 출력·계수 ${dense ? 'dense' : 'spread'} ${count}`, () => {
    const { readings, glyphs, numbers } = fixture(count, dense);
    const before = JSON.stringify(readings);
    const baseline = reference(readings, frame);
    const workspace = createWorkspaceV2();
    const cold = JSON.parse(JSON.stringify(planReadingsV2(readings, frame, workspace)));
    const coldStats = { ...workspace.stats };
    const warm = JSON.parse(JSON.stringify(planReadingsV2(readings, frame, workspace)));
    assert.deepEqual(cold, baseline.output);
    assert.deepEqual(warm, baseline.output);
    assert.equal(JSON.stringify(readings), before);
    assert.equal(workspace.stats.freshRecords, 0);
    const calls = [];
    const paintJobs = readings.map(reading => ({ ...reading, paint: () => calls.push(reading.id) }));
    paintReadingsV2({ save() {}, restore() {}, translate() {} }, paintJobs, workspace.output);
    assert.deepEqual(calls, [...readings.filter(reading => reading.kind === 'damage'), ...readings.filter(reading => reading.kind === 'charge')].map(reading => reading.id));
    const leaders = warm.filter(reading => reading.leader).length;
    const unresolved = warm.filter(reading => reading.unresolved).length;
    coefficients.push({ fixture: dense ? 'dense' : 'spread', count, v1: { ...baseline.stats, namedPlanObjectLiterals: 8 * count + baseline.stats.candidateAttempts + unresolved + leaders + 2, bboxObjectLiterals: glyphs + numbers, bboxArrayReturns: numbers * 5, rectCalls: 1 }, v2Cold: { ...coldStats, bboxPoolGrowth: numbers }, v2Warm: { ...workspace.stats, bboxPoolGrowth: 0, bboxArrayReturns: 0, rectCalls: count > 0 ? 1 : 0 }, unresolved });
  });
}
check('0→120→0→30→120 풀/leader/순서 보존', () => {
  const workspace = createWorkspaceV2();
  planReadingsV2(fixture(120, true).readings, frame, workspace);
  for (const count of [0, 30, 120]) {
    const readings = fixture(count, true).readings;
    assert.deepEqual(JSON.parse(JSON.stringify(planReadingsV2(readings, frame, workspace))), reference(readings, frame).output);
    assert.equal(workspace.stats.freshRecords, 0);
  }
});
check('줌/카메라/음수/해상도/SSAA/DPR/obstacle 동등성', () => {
  for (const width of [390, 1280, 1324]) for (const zoom of [1, 0.62]) for (const ssaa of [1, 1.5, 2]) {
    const current = { ...frame, width, cameraX: -100.5, cameraY: 40.25, shakeX: -0.5, shakeY: 1.75, zoom, ssaa, dpr: 2, backingWidth: width * ssaa, backingHeight: 800 * ssaa, cssWidth: width * 1.25, cssLeft: 7 };
    const readings = fixture(30, true).readings;
    const obstacles = [{ x: 10, y: 50, w: 100, h: 60 }, { x: -100, y: -100, w: 20, h: 20 }];
    assert.deepEqual(JSON.parse(JSON.stringify(planReadingsV2(readings, current, createWorkspaceV2(), obstacles))), reference(readings, current, obstacles).output);
  }
});
check('glyph union 24조합 원형보존', () => {
  for (const num of ['12345', '1.2K', '-12', '000', '', 123.8]) for (const scale of [0, 0.62, 1, 1.5]) assert.deepEqual(numberBoxV2(num, -25.75, -19.75, scale), unionBoxes(numberGlyphBoxes(num, -25.75, -19.75, scale)));
});
check('seed 고정 공간 버킷/다중 band/음수/간극 경계60조합', () => {
  let seed = 20261001;
  const random = () => { seed = Math.imul(seed, 1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
  const workspace = createWorkspaceV2();
  for (let fixtureIndex = 0; fixtureIndex < 60; fixtureIndex++) {
    const readings = Array.from({ length: 30 }, (_, index) => ({ id: `reading-${index}`, kind: random() < 0.5 ? 'charge' : 'damage', box: { x: random() * 1200 - 600, y: random() * 900 - 450, w: random() * 200 + 1, h: random() * 100 + 1 } }));
    const obstacles = [{ x: random() * 1000, y: random() * 800 - 20, w: 90, h: 200 }];
    const current = { ...frame, zoom: fixtureIndex % 2 ? 0.62 : 1, shakeX: -0.5, cameraY: -20.5 };
    assert.deepEqual(JSON.parse(JSON.stringify(planReadingsV2(readings, current, workspace, obstacles))), reference(readings, current, obstacles).output);
  }
});
check('빈 snapshot: rect 호출0/UNKNOWN frame 불필요', () => {
  const workspace = createWorkspaceV2();
  assert.deepEqual(planReadingsV2([], null, workspace), []);
  assert.equal(workspace.stats.intersectionTests, 0);
});
check('매 occupied frame CSS/resize/zoom snapshot 갱신·입력불변', () => {
  const snapshot = createSnapshotV2();
  let reads = 0;
  let rect = { width: 1280, height: 800, left: 0, top: 0 };
  const read = () => { reads++; return rect; };
  snapshot.begin(frame);
  const first = { ...snapshot.get(read) };
  snapshot.get(read);
  assert.equal(reads, 1);
  rect = { width: 390, height: 844, left: 25, top: -10 };
  snapshot.begin(Object.freeze({ ...frame, zoom: 0.62, backingWidth: 390, width: 390 }));
  const next = snapshot.get(read);
  assert.equal(reads, 2);
  assert.equal(first.cssWidth, 1280);
  assert.equal(next.cssWidth, 390); assert.equal(next.cssLeft, 25); assert.equal(next.cssTop, -10); assert.equal(next.zoom, 0.62);
  snapshot.clear(); assert.throws(() => snapshot.get(read), /UNKNOWN/);
  assert.equal(frame.cssWidth, 1280);
});
check('v1/생산 파일 보존', () => {
  assert.equal(fs.readFileSync('game.html', 'utf8'), game);
  assert.equal(fs.readFileSync(`${folder}/layout-candidate.mjs`, 'utf8'), layoutSource);
  assert.equal(fs.readFileSync(`${folder}/coordinate-adapter.mjs`, 'utf8'), adapterSource);
});
fs.writeFileSync(`${folder}/hotpath-coefficients.json`, JSON.stringify({ observedAt: new Date().toISOString(), coefficientScope: 'instrumented-source call counters + named literal/returned-array structural estimates; NOT heap profiler/hidden allocation or game FPS', gameSha256: hash(game), v1AdapterSha256: hash(adapterSource), v1LayoutSha256: hash(layoutSource), checks, coefficients, visualVerdict: 'UNKNOWN', performanceVerdict: 'UNKNOWN' }, null, 2) + '\n');
console.log(JSON.stringify({ checks, fixturePairs: coefficients.length, visualVerdict: 'UNKNOWN' }));
