import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('8-direction WebGL enemies retain the charge guide during eChargeWind', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  const eightDirStart = game.indexOf("if(e._mob8dir&&e._mobCh){");
  const atlasPathStart = game.indexOf("if(!_atlasEReady||!_atlasE)continue;", eightDirStart);
  assert.ok(eightDirStart >= 0, '8-direction WebGL path exists');
  assert.ok(atlasPathStart > eightDirStart, '8-direction path ends before atlas path');
  const eightDirPath = game.slice(eightDirStart, atlasPathStart);

  assert.match(eightDirPath, /if\(e\.s==='eChargeWind'&&e\._chgAimMax>0\)\{/);
  assert.match(eightDirPath, /X\.strokeRect\(0,-_cgW\/2,_cgL,_cgW\);/);
  assert.match(eightDirPath, /X\.fillRect\(0,-_cgW\/2,_cgL\*_cgP,_cgW\);/);
});
