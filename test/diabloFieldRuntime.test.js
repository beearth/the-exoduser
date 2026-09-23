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
