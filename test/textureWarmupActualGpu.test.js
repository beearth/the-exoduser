import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('generic warmup images use the active render context so the GPU texture is uploaded before gameplay', () => {
  assert.match(gameHtml, /function _warmImageGpu\(img\)\{/);
  assert.match(gameHtml, /X\.save\(\);X\.resetTransform\(\);X\.globalAlpha=0;\n\s*X\.drawImage\(img,-1,-1,1,1\);\n\s*_flush\(\);X\.restore\(\);/);
  assert.match(gameHtml, /else if\(img\)\{if\(!_wqSeen\.has\(img\)\)\{_wqSeen\.add\(img\);_warmImageGpu\(img\)\}\}/);
  assert.doesNotMatch(gameHtml, /_wqCtx\.drawImage/);
});

test('generic warmup skips duplicate image objects within a queue pass', () => {
  assert.match(gameHtml, /_wqSeen=new Set\(\);/);
  assert.match(gameHtml, /else if\(img\)\{if\(!_wqSeen\.has\(img\)\)\{_wqSeen\.add\(img\);_warmImageGpu\(img\)\}\}/);
  assert.match(gameHtml, /_ensWarmDone=true;_wqLen=0;_wqIdx=0;_wqSeen=null;/);
});

test('remaining texture warmup yields to browser idle time after gameplay starts', () => {
  assert.match(gameHtml, /function _scheduleWarmupNext\(\)\{/);
  assert.match(gameHtml, /if\(typeof requestIdleCallback==='function'&&typeof G!=='undefined'&&G\.on\)\{requestIdleCallback\(_warmupNext,\{timeout:120\}\)\}else setTimeout\(_warmupNext,0\);/);
  assert.match(gameHtml, /_wqIdx\+\+;\n\s*_scheduleWarmupNext\(\);/);
});
