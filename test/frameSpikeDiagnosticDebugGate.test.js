import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('expensive frame diagnostic logs are opt-in so console output cannot amplify ordinary gameplay hitches', () => {
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_dpTotal>16\)\{/);
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_dbgDPost>16\)\{const _pA=/);
  assert.match(gameHtml, /var _DEBUG_PERF=new URLSearchParams\(location\.search\)\.get\('perf'\)==='1';/);
});
