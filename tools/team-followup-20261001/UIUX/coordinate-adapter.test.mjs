import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { createCoordinates, chargeBox, numberGlyphBoxes, unionBoxes, damageState, planReadings, paintReadings } from './coordinate-adapter.mjs';

const folder = 'tools/team-followup-20261001/UIUX';
const evidence = JSON.parse(fs.readFileSync(`${folder}/coordinate-source-evidence.json`, 'utf8'));
const source = fs.readFileSync('game.html', 'utf8');
assert.equal(crypto.createHash('sha256').update(source).digest('hex'), evidence.gameSha256);
const snippet = name => evidence.snippets.find(item => item.name === name).text;
let checks = 0;
const close = (first, second) => assert.ok(Math.abs(first - second) < 1e-8, `${first} != ${second}`);
const nearPoint = (first, second) => { close(first.x, second.x); close(first.y, second.y); };
const check = (name, run) => { run(); checks++; console.log(`PASS ${name}`); };
function matrixContext() {
  let matrix = [1, 0, 0, 1, 0, 0];
  const stack = [];
  return {
    save() { stack.push([...matrix]); },
    restore() { matrix = stack.pop(); },
    scale(horizontal, vertical) { matrix[0] *= horizontal; matrix[1] *= horizontal; matrix[2] *= vertical; matrix[3] *= vertical; },
    translate(horizontal, vertical) { matrix[4] += matrix[0] * horizontal + matrix[2] * vertical; matrix[5] += matrix[1] * horizontal + matrix[3] * vertical; },
    point(point) { return { x: matrix[0] * point.x + matrix[2] * point.y + matrix[4], y: matrix[1] * point.x + matrix[3] * point.y + matrix[5] }; }
  };
}
const baseFrame = { width: 1280, height: 800, cameraX: -20.5, cameraY: 302.25, shakeX: 1.5, shakeY: -1.5, zoom: 0.62, ssaa: 1, backingWidth: 1280, backingHeight: 800, cssWidth: 1280, cssHeight: 800, cssLeft: 0, cssTop: 0, dpr: 1 };
for (const [width, height] of [[1280, 800], [1324, 982], [390, 844]]) {
  for (const zoom of [1, 0.62]) for (const ssaa of [1, 1.5, 2]) for (const dpr of [1, 1.5, 2]) {
    check(`원 draw matrix/왕복 ${width} zoom${zoom} ss${ssaa} dpr${dpr}`, () => {
      const frame = { ...baseFrame, width, height, zoom, ssaa, dpr, backingWidth: (~~(width * ssaa)) & ~1, backingHeight: (~~(height * ssaa)) & ~1, cssWidth: width * 1.25, cssHeight: height * 1.25, cssLeft: 7, cssTop: 11 };
      const coordinates = createCoordinates(frame);
      const context = matrixContext();
      const randoms = [0.8, 0.2];
      const math = Object.create(Math);
      math.random = () => randoms.shift();
      const actual = vm.createContext({ X: context, VW: width, VH: height, _ssaa: ssaa, _EDITOR_MODE: false, G: { shake: 2.5, cam: { x: frame.cameraX, y: frame.cameraY }, _camZoom: zoom }, Math: math });
      new vm.Script(snippet('drawTransform')).runInContext(actual);
      for (const point of [{ x: -1000.25, y: -500.5 }, { x: 0, y: 0 }, { x: 4020.25, y: 6600.75 }]) {
        const logical = coordinates.worldToLogical(point);
        const backing = coordinates.logicalToBacking(logical);
        nearPoint(backing, context.point(point));
        nearPoint(coordinates.logicalToWorld(logical), point);
        nearPoint(coordinates.backingToLogical(backing), logical);
        nearPoint(coordinates.cssToBacking(coordinates.backingToCSS(backing)), backing);
      }
    });
  }
}
check('DPR 이중곱 없음', () => {
  nearPoint(createCoordinates(baseFrame).worldToLogical({ x: 0, y: 0 }), createCoordinates({ ...baseFrame, dpr: 3 }).worldToLogical({ x: 0, y: 0 }));
});
check('음수 Math.round/trunc 구분', () => {
  const coordinates = createCoordinates({ ...baseFrame, cameraX: 640.5, shakeX: 0, zoom: 1 });
  assert.equal(coordinates.worldToLogical({ x: 0, y: 0 }).x, 0);
});
for (const text of ['12345', '1.2K', '-12', '000', '', 123.8]) for (const scale of [0, 0.62, 1, 1.5]) {
  check(`drawNumStr 실제 셀 ${text} scale${scale}`, () => {
    const drawn = [];
    const context = vm.createContext({ _NUM_W: 48, _NUM_H: 56, _numAtlas: {}, X: { drawImage: (...args) => drawn.push({ x: args[5], y: args[6], w: args[7], h: args[8] }) } });
    new vm.Script(snippet('numberPainter')).runInContext(context);
    context.drawNumStr(context.X, text, -25.75, -19.75, 2, scale);
    assert.deepEqual(numberGlyphBoxes(text, -25.75, -19.75, scale), drawn);
  });
}
check('charge 원 painter bbox/테두리', () => {
  const rectangles = [];
  const context = vm.createContext({ _chargeLabelMetrics: { ctx: null }, X: { save() {}, restore() {}, measureText: () => ({ width: 163.5 }), fillRect: (...args) => rectangles.push(args), strokeRect() {}, fillText() {} } });
  new vm.Script(snippet('chargePainter')).runInContext(context);
  context._drawProjectileChargeLabel(-30, 42, 12, '물리탄 차징 · E로 패링');
  const [horizontal, vertical, width, height] = rectangles[0];
  assert.deepEqual(chargeBox(-30, 42, 12, 163.5), { x: horizontal - 0.75, y: vertical - 0.75, w: width + 1.5, h: height + 1.5 });
});
check('bounce/alpha/shake 원식', () => {
  const stateText = snippet('damageStateAndDraw').split('    // 데미지 숫자')[0];
  for (const life of [100, 95, 80, 19, 1]) {
    const text = Object.freeze({ x: -100.25, y: 78.5, life, ml: 100, sz: 48 });
    const context = vm.createContext({ t: text });
    new vm.Script(stateText + '\nglobalThis.state={alpha:_ta,scale:_bSz/48*_bn,x:t.x+_sk,y:t.y-56*(_bSz/48*_bn)/2};').runInContext(context);
    const state = damageState(text);
    for (const key of Object.keys(state)) close(state[key], context.state[key]);
  }
});
check('역이동은 원 glyph trunc 좌표 유지', () => {
  const box = unionBoxes(numberGlyphBoxes('123', -25.75, 20.75, 1));
  const readings = Object.freeze([Object.freeze({ id: 'charge', kind: 'charge', box: Object.freeze({ ...box }), paint() {} }), Object.freeze({ id: 'damage', kind: 'damage', box: Object.freeze({ ...box }), paint() {} })]);
  const frame = { ...baseFrame, cameraX: 0, cameraY: 0, shakeX: 0, shakeY: 0 };
  const planned = planReadings(readings, frame);
  const coordinates = createCoordinates(frame);
  for (const item of planned) close(item.worldDelta.y * frame.zoom, item.deltaY);
  const original = readings[1].box;
  assert.equal(original.x, box.x);
});
check('paint 큐 damage→charge 및 save/restore', () => {
  const calls = [];
  const readings = [{ id: 'charge', kind: 'charge', paint: () => calls.push('charge') }, { id: 'damage', kind: 'damage', paint: () => calls.push('damage') }];
  const planned = readings.map(reading => ({ id: reading.id, worldDelta: { x: 0, y: 4 } }));
  paintReadings({ save: () => calls.push('save'), restore: () => calls.push('restore'), translate: () => calls.push('move') }, readings, planned);
  assert.deepEqual(calls, ['save', 'move', 'damage', 'restore', 'save', 'move', 'charge', 'restore']);
});
check('UNKNOWN 입력 거절', () => assert.throws(() => createCoordinates({ ...baseFrame, zoom: undefined }), /UNKNOWN/));
check('zero CSS 크기 거절', () => assert.throws(() => createCoordinates({ ...baseFrame, cssWidth: 0 }), /UNKNOWN/));
check('실연결 hunk 큐/원 glyph 좌표/알파/회수', () => {
  const calls = [];
  const drawing = matrixContext();
  drawing.globalAlpha = 1;
  drawing.measureText = () => ({ width: 160 });
  drawing.fillRect = (horizontal, vertical, width, height) => calls.push({ kind: 'charge', point: drawing.point({ x: horizontal, y: vertical }), width, height });
  drawing.strokeRect = () => {};
  drawing.fillText = () => {};
  drawing.drawImage = (...args) => calls.push({ kind: 'damage', point: drawing.point({ x: args[5], y: args[6] }), alpha: drawing.globalAlpha });
  const frame = { ...baseFrame, cameraX: 0, cameraY: 0, shakeX: 0, shakeY: 0 };
  drawing.scale(frame.ssaa, frame.ssaa);
  drawing.translate(frame.width / 2, frame.height / 2);
  drawing.scale(frame.zoom, frame.zoom);
  drawing.translate(-frame.width / 2, -frame.height / 2);
  drawing.translate(Math.round(frame.width / 2 - frame.cameraX), Math.round(frame.height / 2 - frame.cameraY));
  const context = vm.createContext({ X: drawing, _chargeLabelMetrics: { ctx: null }, _NUM_W: 48, _NUM_H: 56, _numAtlas: {}, frame });
  new vm.Script(snippet('numberPainter')).runInContext(context);
  new vm.Script(fs.readFileSync(`${folder}/coordinate-runtime-fixture.js`, 'utf8')).runInContext(context);
  vm.runInContext("_uiuxCoordinateFrame=frame;_drawProjectileChargeLabel(0,0,12,'물리탄 차징 · E로 패링');_uiuxQueueNumber('12',0,-37,0,1,.6);globalThis.jobs=_uiuxCoordinateJobs.map(job=>({id:job.id,kind:job.kind,box:job.box}))", context);
  assert.equal(calls.length, 0);
  const jobs = JSON.parse(JSON.stringify(context.jobs));
  const planned = planReadings(jobs, frame);
  vm.runInContext('_uiuxFlushCoordinates();globalThis.status=_uiuxCoordinateStatus;globalThis.count=_uiuxCoordinateJobs.length', context);
  assert.equal(context.count, 0);
  assert.equal(context.status.status, 'STATIC_CANDIDATE');
  assert.deepEqual(calls.map(call => call.kind), ['damage', 'damage', 'charge']);
  const numberPlacement = planned.find(reading => reading.kind === 'damage');
  assert.notEqual(numberPlacement.worldDelta.y, 0);
  const coordinates = createCoordinates(frame);
  for (const [index, box] of numberGlyphBoxes('12', 0, -37, 1).entries()) {
    nearPoint(calls[index].point, coordinates.logicalToBacking(coordinates.worldToLogical({ x: box.x, y: box.y + numberPlacement.worldDelta.y })));
    assert.equal(calls[index].alpha, 0.6);
  }
});
check('비균등 CSS 스케일 간격 최소값', () => {
  const coordinates = createCoordinates({ ...baseFrame, cssWidth: 640, cssHeight: 800 });
  const gap = coordinates.cssGapToLogical(4);
  assert.ok(gap * 640 / 1280 >= 4);
  assert.ok(gap * 800 / 800 >= 4);
});
check('실연결 UNKNOWN frame 원위치 fallback', () => {
  const drawing = matrixContext();
  let drawn = 0;
  drawing.drawImage = () => { drawn++; };
  const context = vm.createContext({ X: drawing, _NUM_W: 48, _NUM_H: 56, _numAtlas: {} });
  new vm.Script(snippet('numberPainter')).runInContext(context);
  new vm.Script(fs.readFileSync(`${folder}/coordinate-runtime-fixture.js`, 'utf8')).runInContext(context);
  vm.runInContext("_uiuxCoordinateFrame={};_uiuxQueueNumber('12',0,0,0,1,.5);_uiuxFlushCoordinates();globalThis.status=_uiuxCoordinateStatus;globalThis.count=_uiuxCoordinateJobs.length", context);
  assert.equal(drawn, 2);
  assert.equal(context.status.status, 'UNKNOWN');
  assert.equal(context.count, 0);
});
check('paint 예외도 transform restore', () => {
  const calls = [];
  assert.throws(() => paintReadings({ save() {}, translate() {}, restore: () => calls.push('restored') }, [{ id: 'damage', kind: 'damage', paint() { throw new Error('fixture'); } }], [{ id: 'damage', worldDelta: { x: 0, y: 1 } }]), /fixture/);
  assert.deepEqual(calls, ['restored']);
});
check('소스 불변', () => assert.equal(fs.readFileSync('game.html', 'utf8'), source));
console.log(JSON.stringify({ checks, gameSha256: evidence.gameSha256, visualVerdict: 'UNKNOWN', performanceVerdict: 'UNKNOWN' }));
