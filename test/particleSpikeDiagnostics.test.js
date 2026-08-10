import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('particle rendering reports expensive individual frames only while debug profiling is enabled', () => {
  assert.match(gameHtml, /const _partRenderStart=_DEBUG_PERF\?performance\.now\(\):0;/);
  assert.match(gameHtml, /poolRender\(X,_vl,_vr,_vt,_vb\);/);
  assert.match(gameHtml, /const _partRenderMs=_DEBUG_PERF\?performance\.now\(\)-_partRenderStart:0;/);
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_partRenderMs>8\)console\.warn\('\[PART SPIKE\] '\+_partRenderMs\.toFixed\(1\)\+'ms active='\+_partCnt\+' cap='\+\(IS_MOBILE\?35:80\)\);/);
});
