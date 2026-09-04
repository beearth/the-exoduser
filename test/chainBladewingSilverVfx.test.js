import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assetUrl = new URL('../img/vfx/chain_blade_silver_realistic.png', import.meta.url);

test('chain Bladewing loads the realistic forged silver asset through chroma-key alpha extraction', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /_CHAIN_BLADE_IMG\.src='img\/vfx\/chain_blade_silver_realistic\.png'/);
  assert.match(game, /_chainBladeSurface=_makeGreenChromaCutout\(_CHAIN_BLADE_IMG\)/);
  assert.match(game, /X\.drawImage\(_chainBladeSurface\|\|_CHAIN_BLADE_IMG,/);

  const metadata = await sharp(fileURLToPath(assetUrl)).metadata();
  assert.equal(metadata.format, 'png');
  assert.ok(metadata.width >= 1200 && metadata.height >= 1000);
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
