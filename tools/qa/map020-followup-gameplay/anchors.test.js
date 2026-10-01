import test from 'node:test';
import assert from 'node:assert/strict';
import { sources, between, functionSource } from './source.mjs';

test('missing or reversed source anchors fail loudly instead of producing empty tests', () => {
  assert.throws(() => between('start end', 'missing', 'end'), /ANCHOR_FAIL/);
  assert.throws(() => between('end start', 'start', 'end'), /ANCHOR_FAIL/);
  assert.throws(() => functionSource(sources['game.html'].replace('function fireBoneWall(', 'function removedBoneWall('), 'fireBoneWall'), /ANCHOR_FAIL/);
});
