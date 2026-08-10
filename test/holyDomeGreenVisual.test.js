import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('renders the healing domain in the requested bright lime palette without a moss-green core', () => {
  assert.match(gameHtml, /const _hdCol=_isHF\?'#ffdd88':'#b6ff54';/);
  assert.match(gameHtml, /G\._holyDomeHealGlow/);
  assert.match(gameHtml, /_healMist/);
  assert.match(gameHtml, /G\._holyDomeHealGlow=_tintHolyDome\(_hdImg,182,255,84\);/);
  assert.doesNotMatch(gameHtml, /G\._holyDomeHealGreen/);
  assert.match(gameHtml, /X\.globalCompositeOperation='lighter';X\.globalAlpha=\(\.52\+\.12\*Math\.sin\(_hdt\*3\)\)\*_fzFade;/);
  assert.match(gameHtml, /X\.shadowColor='#b6ff54';X\.shadowBlur=18;/);
  assert.doesNotMatch(gameHtml, /const _hdAura=X\.createRadialGradient/);
  assert.match(gameHtml, /X\.globalAlpha=\(\.64\+_rp\*\.18\)\*_fzFade;X\.strokeStyle='#d5ff72';X\.lineWidth=3;/);
  assert.match(gameHtml, /X\.strokeStyle='#d5ff72';X\.lineWidth=3;/);
  assert.match(gameHtml, /#e4ffb0/);
  assert.match(gameHtml, /'#b6ff54'/);
  assert.match(gameHtml, /X\.globalAlpha=Math\.sin\(_life\*Math\.PI\)\*\.32\*_fzFade;/);
  assert.match(gameHtml, /X\.lineWidth=1;/);
});

test('converts holyDome black source pixels to transparency before tinting the lime rune', () => {
  assert.match(gameHtml, /function _tintHolyDome\(img,r,g,b\)/);
  assert.match(gameHtml, /const light=Math\.max\(src\[i\],src\[i\+1\],src\[i\+2\]\);/);
  assert.match(gameHtml, /out\[i\+3\]=Math\.round\(light\*src\[i\+3\]\/255\)/);
  assert.match(gameHtml, /G\._holyDomeHealGlow=_tintHolyDome\(_hdImg,182,255,84\);/);
  assert.doesNotMatch(gameHtml, /function _getHolyDomeLight\(r\)/);
  assert.doesNotMatch(gameHtml, /_getTorchSmall\(_hr\)/);
});
