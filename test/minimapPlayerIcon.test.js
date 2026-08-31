import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('both character minimap icons are compact transparent portraits', async () => {
  for (const file of ['minimap_warrior.png', 'minimap_silvertail.png']) {
    const icon = PNG.sync.read(await readFile(path.join(rootDir, 'img', 'ui', file)));
    assert.equal(icon.width, 128, file);
    assert.equal(icon.height, 128, file);
    assert.ok(icon.data.some((channel, index) => index % 4 === 3 && channel < 255), `${file} must preserve transparency`);
  }
});

test('minimap marker selects the current character portrait and retains the atlas fallback', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /const _mmPortraitSrc=\['img\/ui\/minimap_warrior\.png','img\/ui\/minimap_silvertail\.png'\]/);
  assert.match(game, /const portrait=_mmPortraitImgs\[_charIdx\]\|\|_mmPortraitImgs\[0\]/);
  assert.match(game, /const portraitReady=portrait&&portrait\.complete&&portrait\.naturalWidth>0/);
  assert.match(game, /if\(portraitReady\)\{MX\.drawImage\(portrait,px-R,py-R,D,D\);\}/);
  assert.match(game, /else if\(_mmFace\)\{MX\.drawImage\(_mmFace,px-R,py-R\);\}/);
});
