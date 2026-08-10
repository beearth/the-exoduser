import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('shield aura warmup queues the actual GPU sprite upload before regular atlas warming', () => {
  assert.match(gameHtml, /const _WQ_SHIELD_AURA=Symbol\('shield-aura'\);/);
  assert.match(gameHtml, /if\(_saReady&&!_saWarmDone&&_wqLen<80\)_wqBuf\[_wqLen\+\+\]=_WQ_SHIELD_AURA;/);
  assert.match(gameHtml, /if\(img===_WQ_SHIELD_AURA\)\{_warmShieldAuraGpu\(\)\}/);
  assert.match(gameHtml, /function _warmShieldAuraGpu\(\)\{[\s\S]*X\.save\(\);X\.resetTransform\(\);X\.globalAlpha=0;[\s\S]*X\.drawImage\(_SA_IMG,0,0,_SA_CW,_SA_CH,-_SA_CW,-_SA_CH,_SA_CW,_SA_CH\);[\s\S]*X\.drawImage\(_SA_IMG_R,0,0,_SA_CW,_SA_CH,-_SA_CW,-_SA_CH,_SA_CW,_SA_CH\);[\s\S]*_flush\(\);X\.restore\(\);_saWarmDone=true;/);
});

test('shield aura sprite renders only after its full-size warmup completes', () => {
  assert.match(gameHtml, /if\(_saReady&&_saWarmDone\)\{/);
});

test('shield aura sheets are not submitted again through the generic warmup queue', () => {
  assert.doesNotMatch(gameHtml, /if\(_saReady&&_SA_IMG&&_SA_IMG\.naturalWidth>0&&_wqLen<80\)_wqBuf\[_wqLen\+\+\]=_SA_IMG;/);
  assert.doesNotMatch(gameHtml, /if\(_saReady&&_SA_IMG_R&&_SA_IMG_R\.naturalWidth>0&&_wqLen<80\)_wqBuf\[_wqLen\+\+\]=_SA_IMG_R;/);
});
