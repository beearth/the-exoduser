import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const source = readFileSync(new URL('../tools/qa_first_kill_cpu_probe.js', import.meta.url), 'utf8');
const harness = readFileSync(new URL('../tools/qa_frame_probe.mjs', import.meta.url), 'utf8');

function setup() {
  let now = 0;
  class Canvas2D {
    constructor() { this.canvas = { width: 128, height: 128 }; }
    drawImage(image) { now += image.cost || 0.1; return image; }
    clearRect() { now += 0.1; }
    getImageData() { now += 3; return 'pixels'; }
    putImageData() { now += 0.1; }
  }
  class WebGL2 {
    texImage2D() { now += 0.1; }
    texSubImage2D() { now += 0.1; }
  }
  const window = {};
  const canvas = new Canvas2D();
  window._addCorpse = function (image) { canvas.drawImage(image); return this; };
  window._maskWorldDropBlack = function () { canvas.getImageData(); throw new Error('original failure'); };
  const originals = { corpse: window._addCorpse, draw: Canvas2D.prototype.drawImage };
  const context = vm.createContext({ window, CanvasRenderingContext2D: Canvas2D,
    WebGL2RenderingContext: WebGL2, performance: { now: () => now } });
  vm.runInContext(source, context);
  return { window, canvas, gl: new WebGL2(), originals, context, Canvas2D };
}

test('20,001 ordinary draws do not hide the first corpse; child source and self time survive', () => {
  const { window, canvas, originals, Canvas2D } = setup();
  for (let i = 0; i < 20001; i++) canvas.drawImage({});
  assert.equal(window.__qaFirstKill.records.length, 0);
  const receiver = {};
  assert.equal(window._addCorpse.call(receiver, { src: 'sprite.png' }), receiver);
  canvas.drawImage({ src: 'slow.png', cost: 3 });
  const records = window.__qaFirstKill.stop();
  assert.equal(records.length, 3);
  assert.equal(records[0].parent, '_addCorpse');
  assert.equal(records[0].source, 'sprite.png');
  assert.equal(records[1].label, '_addCorpse');
  assert.ok(records[1].selfMs < 0.001);
  assert.equal(records[2].source, 'slow.png');
  assert.equal(window.__qaFirstKill.skippedFast2d, 20001);
  assert.equal(window.__qaFirstKill.droppedCount, 0);
  assert.equal(window._addCorpse, originals.corpse);
  assert.equal(Canvas2D.prototype.drawImage, originals.draw);
  assert.equal(window.__qaFirstKill.stop().length, 3);
});

test('overflow retains recent uploads and explicitly invalidates completeness', () => {
  const { window, gl } = setup();
  for (let i = 0; i < 20005; i++) gl.texImage2D({ src: `upload-${i}` });
  const records = window.__qaFirstKill.stop();
  assert.equal(records.length, 20000);
  assert.equal(records[0].source, 'upload-5');
  assert.equal(records.at(-1).source, 'upload-20004');
  assert.equal(window.__qaFirstKill.droppedCount, 5);
  assert.equal(window.__qaFirstKill.truncated, true);
});

test('exceptions propagate, stack unwinds, and reinstall does not nest wrappers', () => {
  const { window, canvas, context } = setup();
  assert.throws(() => window._maskWorldDropBlack(), /original failure/);
  const prior = window.__qaFirstKill;
  canvas.clearRect();
  assert.equal(prior.skippedFast2d, 1);
  assert.equal(prior.records[0].parent, '_maskWorldDropBlack');
  vm.runInContext(source, context);
  assert.equal(prior.stopped, true);
  window._addCorpse({});
  assert.equal(window.__qaFirstKill.records.length, 2);
  assert.equal(window.__qaFirstKill.totalCalls, 2);
});

test('missing constructors are recorded without an installation exception', () => {
  const context = vm.createContext({ window: {}, performance: { now: () => 0 } });
  const result = vm.runInContext(source, context);
  assert.equal(result.installed, true);
  assert.ok(result.missing.includes('gl.texImage2D'));
  assert.ok(result.missing.includes('2d.drawImage'));
  assert.equal(context.window.__qaFirstKill.stop().length, 0);
});

test('actual harness finalization serializes stop records alongside original env/results', async () => {
  const { window, context } = setup();
  window._addCorpse({ src: 'corpse.png' });
  const start = harness.indexOf('  const firstKill = await page.evaluate');
  const endLine = '  writeFileSync(out, JSON.stringify({ env, results, firstKill }, null, 1));';
  const end = harness.indexOf(endLine, start) + endLine.length;
  assert.ok(start > 0 && end > start);
  const finalization = harness.slice(start, end);
  async function finish(fail) {
    let serialized;
    const host = vm.createContext({
      page: { evaluate: async callback => {
        if (fail) throw new Error('page closed');
        return vm.runInContext(`(${callback.toString()})()`, context);
      } },
      env: { fixedSha: 'test-sha' }, results: [{ name: 'COMBAT', valid: true }],
      blocked: [], errors: [], warns: [], path, OUT_DIR: '/unused', LABEL: 'test',
      writeFileSync: (_path, text) => { serialized = JSON.parse(text); }
    });
    await vm.runInContext(`(async () => { ${finalization} })()`, host);
    return serialized;
  }
  const captured = await finish(false);
  assert.equal(captured.env.fixedSha, 'test-sha');
  assert.equal(captured.results[0].name, 'COMBAT');
  assert.equal(captured.firstKill.stopped, true);
  assert.equal(captured.firstKill.records[0].source, 'corpse.png');
  const failure = await finish(true);
  assert.match(failure.firstKill.captureError, /page closed/);
  assert.equal(failure.results[0].valid, true);
});
