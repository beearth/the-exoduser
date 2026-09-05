import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('Chain Crush landing marks its wave as a source-over earth impact', () => {
  assert.match(gameHtml, /G\._gSlamWave\.push\(\{x:P\.x,y:P\.y,r:30,maxR:_csR,t:0,maxT:24,col:'#ffcc00',kind:'chainSlam'\}\)/);

  const rendererStart = gameHtml.indexOf('if(G._gSlamWave&&G._gSlamWave.length>0){');
  const rendererEnd = gameHtml.indexOf('// ══ 기동칼날개', rendererStart);
  const renderer = gameHtml.slice(rendererStart, rendererEnd);
  assert.match(renderer, /if\(w\.kind==='chainSlam'\)/);
  assert.match(renderer, /X\.globalCompositeOperation='source-over'/);
  assert.match(renderer, /for\(let _csCrack=0;_csCrack<16;_csCrack\+\+\)/);
  assert.match(renderer, /for\(let _csShard=0;_csShard<18;_csShard\+\+\)/);
  assert.match(renderer, /X\.fillStyle='#ffd27a'/);
  assert.match(renderer, /const _isChainSlamHero=w\.kind==='chainSlam';/);
  assert.match(renderer, /const _isSlamHero=_isGSlam\|\|_isChainSlamHero;/);
  assert.match(renderer, /_isChainSlamHero\?1\.8:/);
});
