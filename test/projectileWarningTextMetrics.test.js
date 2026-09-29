import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
function fixture(file) {
  const html = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const fn = html.indexOf('function _drawProjectileChargeLabel(');
  const marker = html.lastIndexOf('// Cache stable projectile warning widths', fn);
  const source = html.slice(marker < 0 ? fn : marker, html.indexOf('function _drawShootCharge(', fn));
  const listeners = {}, widths = [], boxes = [];
  let revision = 0;
  const makeContext = () => ({
    save() {}, restore() {}, strokeRect() {}, fillText() {},
    fillRect(x, y, w, h) { boxes.push({ w, h }); },
    measureText(label) { widths.push(label); return { width: label.length * 7 + revision }; },
  });
  const sandbox = { X: makeContext(), document: { fonts: { addEventListener(type, cb) { listeners[type] = cb; } } } };
  vm.runInNewContext(source, sandbox);
  return { draw: (...args) => sandbox._drawProjectileChargeLabel(...args), widths, boxes, listeners,
    replaceContext() { sandbox.X = makeContext(); }, changeFont() { revision = 10; } };
}
for (const file of ['game.html']) {
  test(file + ': repeated warning labels reuse width while language and renderer changes remeasure', () => {
    const f = fixture(file);
    for (let i = 0; i < 100; i++) f.draw(i, 100, 20, '물리탄 차징 · E로 패링');
    assert.equal(f.widths.length, 1);
    assert.equal(f.boxes[99].w, '물리탄 차징 · E로 패링'.length * 7 + 14);
    f.draw(0, 100, 20, 'PHYSICAL SHOT CHARGING · PARRY WITH E');
    assert.equal(f.widths.length, 2);
    f.replaceContext(); f.draw(0, 100, 20, 'PHYSICAL SHOT CHARGING · PARRY WITH E');
    assert.equal(f.widths.length, 3);
  });
  test(file + ': font completion and failure invalidate warning width without storing stale metrics', () => {
    const f = fixture(file);
    f.draw(0, 100, 20, 'warning'); f.changeFont();
    assert.equal(typeof f.listeners.loadingdone, 'function');
    f.listeners.loadingdone(); f.draw(0, 100, 20, 'warning');
    assert.equal(f.boxes[1].w, 7 * 7 + 10 + 14);
    assert.equal(typeof f.listeners.loadingerror, 'function');
    f.listeners.loadingerror(); f.draw(0, 100, 20, 'warning');
    assert.equal(f.widths.length, 3);
  });
}
