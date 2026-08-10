import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('stream chunk construction reports only individual builds that exceed a frame budget', () => {
  assert.match(gameHtml, /const _chunkBuildStart=performance\.now\(\);\n\s*const _built=_buildStreamChunk\(cx,cy\);\n\s*const _chunkBuildMs=performance\.now\(\)-_chunkBuildStart;/);
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_chunkBuildMs>16\)console\.warn\('\[MAP STREAM SPIKE\] '\+_chunkBuildMs\.toFixed\(1\)\+'ms chunk='\+cx\+','\+cy\+' queued='\+_streamBuildQCount\);/);
});
