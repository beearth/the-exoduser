import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('the asynchronously loaded player atlas is queued for actual ProxyX texture upload', () => {
  assert.match(gameHtml, /const _WQ_PLAYER_ATLAS=Symbol\('player-atlas'\);/);
  assert.match(gameHtml, /if\(_atlasP_img&&_atlasP_img\.complete&&_atlasP_img\.naturalWidth>0&&!_playerAtlasGpuWarmDone&&_wqLen<80\)_wqBuf\[_wqLen\+\+\]=_WQ_PLAYER_ATLAS;/);
  assert.match(gameHtml, /if\(img===_WQ_PLAYER_ATLAS\)\{_warmPlayerAtlasGpu\(\)\}/);
  assert.match(gameHtml, /function _warmPlayerAtlasGpu\(\)\{[\s\S]*X\.drawImage\(_atlasP_img,-1,-1,1,1\);[\s\S]*_flush\(\);X\.restore\(\);_playerAtlasGpuWarmDone=true;/);
});
