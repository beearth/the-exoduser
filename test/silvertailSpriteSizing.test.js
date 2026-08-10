import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Silvertail sync preserves dark character pixels and uses only transparent resize padding', async () => {
  const tool = await readFile(new URL('../tools/sync_silvertail_pixellab.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(tool, /function clearEdgeBackdrop/);
  assert.match(tool, /resize\(FRAME_SIZE, FRAME_SIZE, \{ fit: 'contain', background: \{ r: 0, g: 0, b: 0, alpha: 0 \}, kernel: sharp\.kernel\.nearest \}\)/);
});
