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

test('external player atlases still wait for GPU warmup, while generated character canvases can render immediately', () => {
  assert.match(gameHtml, /function _queuePlayerAtlasGpuWarmup\(\)\{[\s\S]*?_scheduleGpuWarm\(\(\)=>\{_playerAtlasGpuWarmQueued=false;_warmPlayerAtlasGpu\(\)\}\);/);
  assert.match(gameHtml, /if\(_atlasPReady&&\(_playerAtlasGpuWarmDone\|\|_playerAtlasNoWarmupNeeded\)&&\(P\._sa\|\|\(P\._sa=SpriteAnimator\.create\(_atlasP_img,_atlasP_frames,'idle'\)\)\)\)\{/);
});

test('a generated character canvas never waits on the unrelated base-atlas GPU warmup', () => {
  assert.match(gameHtml, /const _playerAtlasNoWarmupNeeded=_atlasP_img&&typeof _atlasP_img\.getContext==='function';/);
  assert.match(gameHtml, /if\(_atlasPReady&&\(_playerAtlasGpuWarmDone\|\|_playerAtlasNoWarmupNeeded\)&&\(P\._sa\|\|\(P\._sa=SpriteAnimator\.create\(_atlasP_img,_atlasP_frames,'idle'\)\)\)\)\{/);
});
