import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('bonfire barrier source is created before gameplay and queued for real GPU warmup', () => {
  assert.match(gameHtml, /const _BONFIRE_BARRIER_IMG=new Image\(\);[\s\S]*?_BONFIRE_BARRIER_IMG\.src='sprites\/bonfire_barrier\.png';/);
  assert.match(gameHtml, /const _WQ_BONFIRE_BARRIER=Symbol\('bonfire-barrier'\);/);
  assert.match(gameHtml, /if\(_BONFIRE_BARRIER_IMG\.complete&&_BONFIRE_BARRIER_IMG\.naturalWidth>0&&!_bonfireBarrierWarmDone&&_wqLen<80\)_wqBuf\[_wqLen\+\+\]=_WQ_BONFIRE_BARRIER;/);
  assert.match(gameHtml, /if\(img===_WQ_BONFIRE_BARRIER\)\{_warmBonfireBarrierGpu\(\)\}/);
});

test('bonfire barrier does not trigger a first-use GPU upload during gameplay', () => {
  assert.match(gameHtml, /function _warmBonfireBarrierGpu\(\)\{[\s\S]*X\.drawImage\(_BONFIRE_BARRIER_IMG,-1,-1,1,1\);[\s\S]*_flush\(\);X\.restore\(\);_bonfireBarrierWarmDone=true;/);
  assert.match(gameHtml, /const _bfImg=_BONFIRE_BARRIER_IMG;[\s\S]*if\(_bonfireBarrierWarmDone&&_bfImg\.complete&&_bfImg\.naturalWidth>0\)/);
});
