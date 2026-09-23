import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const server = readFileSync(new URL('../tools/local-static-server.mjs', import.meta.url), 'utf8');

test('field rebuild is an explicit CH1-1 map-QA-only runtime branch', () => {
  assert.match(game, /_DIABLO_FIELD_QA/);
  assert.match(game, /function _buildDiabloField\(/);
  assert.match(game, /fieldrebuild/);
  assert.match(game, /diablo_hell_corpse_tree_v1\.png/);
  assert.match(game, /diablo_hell_torch/);
  assert.match(game, /function _paintDiabloFieldGround\(/);
  assert.match(game, /if\(G\._fieldRebuildQA\)_editorObjs=\[\]/);
  assert.match(game, /forestBoundary[^\n]*_DIABLO_FIELD_QA/);
  assert.match(server, /\/map\/field/);
  assert.match(server, /fieldrebuild=1/);
});

test('map QA torches use a dedicated 8-frame flame sheet while their trunk stays fixed', () => {
  const sheet = readFileSync(new URL('../assets/map/ch1/diablo_field_torch_flame_v1.png', import.meta.url));
  assert.match(game, /'diablo_hell_torch':'assets\/map\/ch1\/diablo_field_torch_base_v1\.png'/);
  assert.match(game, /diablo_field_torch_flame_v1\.png/);
  assert.match(game, /'diablo_hell_torch_flame':\{sz:150,keepAR:1,anim:\{frames:8,cols:4,rows:2,interval:110\}\}/);
  assert.match(game, /_drawDiabloTorchFrame\(X,mo\.x,mo\.y,_now,mo\.x\*\.13\+mo\.y\*\.07,mo\.scale\)/);
  assert.match(game, /function _drawDiabloTorchFrame\(/);
  assert.match(game, /function _diabloNatureSway\(/);
  assert.match(game, /'diablo_hell_corpse_tree':\{sz:920,large:1,keepAR:1,sway:/);
  assert.match(game, /'dead_tree':\{sz:64,col:1,sway:/);
  assert.match(game, /const _swayActive=_diabloNatureSway\(X,mo,_meta,/);
  assert.doesNotMatch(game, /_drawDiabloTorchVfx/);
  assert.equal(sheet.toString('ascii', 1, 4), 'PNG');
  assert.equal(sheet.readUInt32BE(16), 1672);
  assert.equal(sheet.readUInt32BE(20), 944);
  assert.equal(sheet[25], 6, 'spritesheet must retain RGBA alpha');
});
