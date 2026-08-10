import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('cold-start asset preload reports only individually slow asset requests in debug mode', () => {
  assert.match(gameHtml, /function tick\(src,_assetStartedAt\)\{/);
  assert.match(gameHtml, /const _assetLoadMs=_DEBUG_PERF\?performance\.now\(\)-_assetStartedAt:0;/);
  assert.match(gameHtml, /if\(_DEBUG_PERF&&_assetLoadMs>500\)console\.warn\('\[BOOT ASSET SLOW\] '\+_assetLoadMs\.toFixed\(1\)\+'ms src='\+src\);/);
  assert.match(gameHtml, /im\.onload=\(\)=>tick\(src,_assetStartedAt\);im\.onerror=\(\)=>tick\(src,_assetStartedAt\);/);
});
