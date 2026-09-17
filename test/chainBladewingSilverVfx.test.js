import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import vm from 'node:vm';

const assetUrl = new URL('../img/vfx/chain_blade_cyclone_8f.png', import.meta.url);

test('chain Bladewing loads the eight-frame silver sheet with its original alpha', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /_CHAIN_BLADE_IMG\.src='img\/vfx\/chain_blade_cyclone_8f\.png'/);
  assert.doesNotMatch(game, /_chainBladeSurface=_makeGreenChromaCutout\(_CHAIN_BLADE_IMG\)/);

  const metadata = await sharp(fileURLToPath(assetUrl)).metadata();
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 1774);
  assert.equal(metadata.height, 887);
  assert.equal(metadata.hasAlpha, true);
});

test('chain Bladewing draws all eight cells once per 12 game frames with the cyclone core on the player', async () => {
  for (const file of ['game.html', 'game-easy-test.html']) {
    const game = await readFile(new URL('../' + file, import.meta.url), 'utf8');
    const render = game.match(/\/\/ ══ 기동칼날개 — 스프라이트 날개 렌더 ══[\s\S]*?(?=\/\/ ══ 유탄 — 렌더)/)[0];
    const calls = [];
    const X = new Proxy({ drawImage(...args) { calls.push(args); } }, { get: (o, k) => o[k] ?? (() => {}) });
    const b = { x: 100, y: 200, ang: 0, r: 160, t: 0, maxT: 8, phase: 0 };
    const ctx = { X, G: { _chainBlades: [b] }, _chainBladeReady: true, _CHAIN_BLADE_IMG: { naturalWidth: 1774, naturalHeight: 887 } };
    for (let f = 0; f < 8; f++) {
      b.phase = f * 1.5;
      vm.runInNewContext(render, ctx);
    }
    assert.equal(calls.length, 8, file);
    assert.equal(new Set(calls.map(a => a.slice(1, 3).join(','))).size, 8, file);
    for (const a of calls) {
      assert.equal(a.length, 9);
      assert.ok(a[1] >= 0 && a[1] + a[3] <= 1774);
      assert.ok(a[2] >= 0 && a[2] + a[4] <= 887);
      assert.equal(a[5], -a[7] * .65);
      assert.equal(a[6], -a[8] / 2);
    }
  }
});

test('chain Bladewing hit, spark, and fallback colors are cold silver', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  const combat = game.match(/\/\/ ── 기동칼날개: 이동 중 광역 베기[\s\S]*?\/\/ ── INT\(사슬기동:화염\)/)?.[0] || '';
  const render = game.match(/\/\/ ══ 기동칼날개 — 스프라이트 날개 렌더 ══[\s\S]*?\/\/ ══ 유탄 — 렌더/)?.[0] || '';

  assert.match(combat, /'#dcecff'/);
  assert.match(combat, /'#a9bfd0'/);
  assert.doesNotMatch(combat, /#ff4466/i);
  assert.match(render, /fillStyle='#a9bfd0'/);
  assert.doesNotMatch(render, /#ff2244/i);
});
