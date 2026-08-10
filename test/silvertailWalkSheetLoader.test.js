import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Silvertail uses the warrior-compatible two-idle/eight-walk sheet layout', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /exoduser_silvertail[^\n]+idleN:2,walkN:8/);
  assert.match(game, /const _SILVERTAIL_CLOCK_FILES=\{south:'6','south-east':'5',east:'3','north-east':'1',north:'12','north-west':'11',west:'9','south-west':'7'\};/);
  assert.match(game, /const _SILVERTAIL_ASSET_VERSION='20260808-clockfiles-v11';/);
});

test('keyboard movement does not overwrite mouse facing during ghostWalk', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  const ghostWalk = game.match(/case 'ghostWalk':\{([\s\S]*?)break;\}/)?.[1] || '';
  assert.doesNotMatch(ghostWalk, /P\.facing\s*=\s*Math\.atan2\(dy,dx\)/);
});

test('keyboard movement cannot overwrite mouse aim while click refreshes attack aim', async () => {
  const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
  assert.match(game, /let mouse=\{x:0,y:0\},_mouseFacing=0,_mouseFacingReady=false;/);
  assert.match(game, /addEventListener\('mousedown',e=>\{\s*_setMousePosition\(e\);\s*_setMouseFacing\(\);/);
  assert.match(game, /if\(_mouseFacingReady\)P\.facing=_mouseFacing;\s*else _setMouseFacing\(\);/);
});
