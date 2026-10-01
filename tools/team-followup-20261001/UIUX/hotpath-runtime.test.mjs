import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const folder = 'tools/team-followup-20261001/UIUX';
const evidence = JSON.parse(fs.readFileSync(`${folder}/coordinate-source-evidence.json`, 'utf8'));
const numberSource = evidence.snippets.find(snippet => snippet.name === 'numberPainter').text;
const frame = { width: 1280, height: 800, cameraX: 0, cameraY: 0, shakeX: 0, shakeY: 0, zoom: 1, ssaa: 1, backingWidth: 1280, backingHeight: 800, cssWidth: 1280, cssHeight: 800, cssLeft: 0, cssTop: 0, dpr: 1 };
function setup(version) {
  const calls = [];
  const stack = [];
  let horizontal = 0, vertical = 0, rectCalls = 0;
  const drawing = {
    globalAlpha: 1,
    save() { stack.push([horizontal, vertical, this.globalAlpha, this.font, this.lineWidth, this.globalCompositeOperation]); },
    restore() { [horizontal, vertical, this.globalAlpha, this.font, this.lineWidth, this.globalCompositeOperation] = stack.pop(); },
    translate(deltaX, deltaY) { horizontal += deltaX; vertical += deltaY; },
    measureText: () => ({ width: 110 }),
    fillRect(x, y, width, height) { calls.push(['rect', x + horizontal, y + vertical, width, height, this.globalAlpha]); },
    strokeRect() {},
    fillText(text, x, y) { calls.push(['label', text, x + horizontal, y + vertical, this.globalAlpha]); },
    drawImage(...args) { calls.push(['digit', args[1], args[5] + horizontal, args[6] + vertical, args[7], args[8], this.globalAlpha]); }
  };
  const context = vm.createContext({ X: drawing, _chargeLabelMetrics: { ctx: null }, _NUM_W: 48, _NUM_H: 56, _numAtlas: {}, frame, C: { getBoundingClientRect() { rectCalls++; return { width: context.frame.cssWidth, height: context.frame.cssHeight, left: context.frame.cssLeft, top: context.frame.cssTop }; } } });
  new vm.Script(numberSource).runInContext(context);
  new vm.Script(fs.readFileSync(`${folder}/${version === 1 ? 'coordinate-runtime-fixture.js' : 'hotpath-v2-runtime-fixture.js'}`, 'utf8')).runInContext(context);
  return {
    run(count, nextFrame) {
      calls.length = 0; rectCalls = 0; context.frame = nextFrame;
      const begin = version === 1 ? '_uiuxCoordinateFrame=frame;C.getBoundingClientRect();' : '_uiuxV2Snapshot.begin(frame);';
      vm.runInContext(begin, context);
      for (let index = 0; index < count; index++) {
        if (index % 3 === 0) vm.runInContext("_drawProjectileChargeLabel(0,0,12,'물리탄 차징 · E로 패링')", context);
        else vm.runInContext("_uiuxQueueNumber('12345',0,0,0,.62,.6)", context);
      }
      vm.runInContext('_uiuxFlushCoordinates();globalThis.jobCount=_uiuxCoordinateJobs.length;globalThis.status=_uiuxCoordinateStatus.status', context);
      assert.equal(context.jobCount, 0); assert.equal(stack.length, 0);
      return { calls: JSON.parse(JSON.stringify(calls)), rectCalls, status: context.status };
    }
  };
}
const first = setup(1), second = setup(2);
const observations = [];
for (const count of [0, 1, 30, 120, 0, 1]) {
  const nextFrame = count === 1 ? { ...frame, zoom: 0.62, cssWidth: 390, cssHeight: 844, cssLeft: 9, cssTop: -4 } : frame;
  const baseline = first.run(count, nextFrame), optimized = second.run(count, nextFrame);
  assert.deepEqual(optimized.calls, baseline.calls);
  assert.equal(baseline.rectCalls, 1);
  assert.equal(optimized.rectCalls, count === 0 ? 0 : 1);
  observations.push({ count, v1RectCalls: baseline.rectCalls, v2RectCalls: optimized.rectCalls, paintCalls: optimized.calls.length, equivalence: 'PASS' });
}
fs.writeFileSync(`${folder}/hotpath-runtime-validation.json`, JSON.stringify({ scope: 'VM mock drawing operations/rect calls; not browser or game profile', observations, visualVerdict: 'UNKNOWN', performanceVerdict: 'UNKNOWN' }, null, 2) + '\n');
console.log(JSON.stringify({ runtimeSequences: observations.length, equivalence: 'PASS', emptyFrameRectCalls: 0 }));
