import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('gameplay stream chunks use one idle-time build at a time when the browser supports it', () => {
  assert.match(gameHtml, /function _scheduleStreamChunkBuild\(\)\{/);
  assert.match(gameHtml, /requestIdleCallback\(function\(deadline\)\{[\s\S]*?_tickStreamChunkBuild\(_idleBudget,1\);/);
  assert.match(gameHtml, /if\(typeof requestIdleCallback==='function'\)_scheduleStreamChunkBuild\(\);/);
});

test('stream chunk building retains the frame-loop fallback for browsers without idle callbacks', () => {
  assert.match(gameHtml, /else if\(\(_p3-_p0\)<8\)_tickStreamChunkBuild\(4,3\);\n\s*else _tickStreamChunkBuild\(1,1\)/);
});
