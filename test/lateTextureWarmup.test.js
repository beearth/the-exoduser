import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('late-loaded warmup images are queued only once across rescan passes', () => {
  assert.match(gameHtml, /var _wqGpuImages=new Set\(\),_wqQueued=null;/);
  assert.match(gameHtml, /function _queueWarmImage\(img,cap\)\{/);
  assert.match(gameHtml, /if\(!img\|\|_wqLen>=cap\|\|_wqGpuImages\.has\(img\)\|\|_wqQueued\.has\(img\)\)return;/);
  assert.match(gameHtml, /_wqQueued\.add\(img\);_wqBuf\[_wqLen\+\+\]=img;/);
});

test('completed warmup rescans periodically for images that finished loading later', () => {
  assert.match(gameHtml, /var _warmRescanFrame=0;/);
  assert.match(gameHtml, /else if\(\+\+_warmRescanFrame>=180\)\{_warmRescanFrame=0;_ensWarmDone=false;_warmupEnsAtlas\(\)\}/);
});
