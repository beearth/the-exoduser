import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for (const file of ['game.html', 'game-easy-test.html']) {
  const html = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const source = html.match(/function applyUIScale\(\)\{[\s\S]*?\n\}/)?.[0];
  assert.ok(source, file + ': UI scale function exists');
  function apply(width, height, previous = '1') {
    let value = previous;
    const context = vm.createContext({
      window: {innerWidth: width, innerHeight: height},
      document: {documentElement: {style: {setProperty(name, next) {
        assert.equal(name, '--ui-auto-scale');
        value = next;
      }}}}
    });
    vm.runInContext(source + '\napplyUIScale();', context);
    return Number(value);
  }
  test(file + ': ordinary and ultrawide windows retain the design ratio', () => {
    for (const [w, h] of [[1366, 768], [1920, 1080], [2560, 1080], [3840, 2160], [5120, 1440]]) {
      assert.ok(Math.abs(apply(w, h) - Math.min(w / 1920, h / 1080)) <= 0.000051);
    }
  });
  test(file + ': HUD screen size is stable across page zoom and repeated resize', () => {
    for (const [w, h] of [[960, 540], [2813, 1262]]) {
      const expected = Math.min(w / 1920, h / 1080);
      for (const zoom of [0.25, 0.5, 1, 1.75, 3, 5, 1, 0.25]) {
        const actual = apply(w / zoom, h / zoom) * zoom;
        assert.ok(Math.abs(actual - expected) <= 0.00026, 'zoom ' + zoom + ': ' + actual + ' vs ' + expected);
      }
    }
  });
  test(file + ': small windows and 8K viewports fit instead of hitting fixed bounds', () => {
    for (const [w, h] of [[320, 180], [640, 360], [7680, 4320], [11252, 5048]]) {
      const scale = apply(w, h);
      assert.ok(Math.abs(scale - Math.min(w / 1920, h / 1080)) <= 0.000051);
      assert.ok(1920 * scale <= w + 0.1 && 1080 * scale <= h + 0.1);
    }
  });
  test(file + ': invalid dimensions preserve the previous valid scale', () => {
    for (const [w, h] of [[0, 1080], [1920, 0], [-1, 1080], [NaN, 1080], [Infinity, Infinity]]) {
      assert.equal(apply(w, h, '1.1685'), 1.1685);
    }
  });
}
