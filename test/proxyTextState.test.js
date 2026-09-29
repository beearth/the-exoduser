import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function renderer(file, normalizeFont = (value) => value) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const source = html.match(/function _buildProxyX\(\)\{[\s\S]*?\n\} \/\/ end _buildProxyX/)[0];
  const writes = [], text = [], native = {};
  for (const [key, initial] of [['font', '10px sans-serif'], ['textAlign', 'start'], ['textBaseline', 'alphabetic']]) {
    let value = initial;
    Object.defineProperty(native, key, {
      get: () => value,
      set(next) { writes.push([key, next]); value = key === 'font' ? normalizeFont(next) : next; },
    });
  }
  for (const method of ['fillText', 'strokeText', 'measureText']) {
    native[method] = (value) => {
      text.push({ method, value, font: native.font, align: native.textAlign, baseline: native.textBaseline });
      return { width: 42 };
    };
  }
  const sandbox = { _txCtx: native, C: {}, _pushMat() {}, _popMat() {}, _tp: (x, y) => [x, y] };
  vm.runInNewContext(`${source}\n_buildProxyX();`, sandbox);
  return { X: sandbox.X, writes, text, native };
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: repeated charge-label measurements avoid native font writes, including normalized CSS`, () => {
    const { X, writes, text } = renderer(file, (value) => value.replace(/,\s*/g, ', '));
    X.font = 'bold 13px "Noto Sans KR",sans-serif';
    for (let i = 0; i < 100; i++) assert.equal(X.measureText('발사').width, 42);
    assert.equal(writes.filter(([key]) => key === 'font').length, 1);
    assert.equal(text.length, 100);
    assert.equal(text[99].font, 'bold 13px "Noto Sans KR", sans-serif');
  });

  test(`${file}: measurement resynchronizes after external native font reset`, () => {
    const { X, writes, text, native } = renderer(file);
    X.font = 'bold 13px sans-serif';
    X.measureText('ready');
    native.font = '10px sans-serif'; // Canvas resize clears native state.
    X.measureText('ready');
    X.measureText('ready');
    assert.equal(text[1].font, 'bold 13px sans-serif');
    assert.equal(writes.filter(([key]) => key === 'font').length, 3);
  });

  test(`${file}: native fill, stroke and measurement share font synchronization`, () => {
    const { X, writes, text } = renderer(file);
    X.fillStyle = {};
    X.font = '20px serif';
    X.fillText('fill', 0, 0); X.strokeText('stroke', 0, 0); X.measureText('width');
    X.save(); X.font = '12px monospace'; X.measureText('inner'); X.restore();
    X.measureText('outer');
    assert.deepEqual(text.map((item) => item.font), ['20px serif', '20px serif', '20px serif', '12px monospace', '20px serif']);
    assert.equal(writes.filter(([key]) => key === 'font').length, 3);
  });

  test(`${file}: sprite save/restore and GPU text state do not touch native canvas text setters`, () => {
    const { X, writes } = renderer(file);
    for (let i = 0; i < 100; i++) { X.save(); X.restore(); }
    X.font = 'bold 20px monospace';
    X.textAlign = 'center';
    X.textBaseline = 'top';
    X.save(); X.font = '12px serif'; X.restore();
    assert.equal(X.font, 'bold 20px monospace');
    assert.equal(X.textAlign, 'center');
    assert.equal(X.textBaseline, 'top');
    assert.equal(writes.length, 0);
  });

  test(`${file}: native text and measurements still use the restored font and alignment`, () => {
    const { X, text } = renderer(file);
    X.font = 'bold 20px monospace'; X.textAlign = 'center'; X.textBaseline = 'top'; X.fillStyle = {};
    X.save(); X.font = '12px serif'; X.textAlign = 'right'; X.textBaseline = 'bottom';
    X.fillStyle = {}; X.fillText('inner', 0, 0);
    X.restore(); X.fillText('outer', 0, 0); X.strokeText('outline', 0, 0);
    assert.equal(X.measureText('width').width, 42);
    assert.deepEqual(text.slice(0, 3), [
      { method: 'fillText', value: 'inner', font: '12px serif', align: 'right', baseline: 'bottom' },
      { method: 'fillText', value: 'outer', font: 'bold 20px monospace', align: 'center', baseline: 'top' },
      { method: 'strokeText', value: 'outline', font: 'bold 20px monospace', align: 'center', baseline: 'top' },
    ]);
    assert.equal(text[3].font, 'bold 20px monospace');
  });
}
