import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const gameHtml = readFileSync(join(repoRoot, 'game.html'), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

test('generated Kraken shot and Silvertail charge-range assets are served by the game', () => {
  assert.equal(existsSync(join(repoRoot, 'img/balls/proj_kraken_shot_api_v1.png')), true);
  assert.equal(existsSync(join(repoRoot, 'img/vfx/silvertail_charge_range_api_v1.png')), true);
  assert.ok(gameHtml.includes("_krakenShotImg.src='img/balls/proj_kraken_shot_api_v1.png?v=20260903'"));
  assert.match(gameHtml, /_silvChargeRangeImg\.src='img\/vfx\/silvertail_charge_range_api_v1\.png\?v=20260903';/);
});

test('near-black API image backgrounds are converted to alpha before additive rendering', () => {
  assert.match(gameHtml, /function _makeBlackAdditiveCutout\(/);
  assert.match(gameHtml, /_silvChargeRangeSurface=_makeBlackAdditiveCutout\(_silvChargeRangeImg/);
  assert.match(gameHtml, /_silvChargeRangeSurface\|\|_silvChargeRangeImg/);
});

test('water-bean has a compact blue water-core identity while large physical or ice balls keep Kraken art', () => {
  const water = sliceBetween(gameHtml, 'function _drawWaterBean(', 'function _drawClassicRainbow(');
  assert.match(water, /_drawWaterBlueFlight\(p,fa,sSc\)/);
  assert.doesNotMatch(water, /_drawKrakenShot/,
    'the small water bean must not inherit the giant Kraken torpedo silhouette');

  const elem = sliceBetween(gameHtml, 'if(p.elemBall){', 'if(p.poisonZone){');
  assert.match(elem, /p\.el===EL\.P\|\|p\.el===EL\.I/);
  assert.match(elem, /_drawKrakenShot\(p,fa,170\)/);
  assert.match(elem, /_drawElemOrb\(/);
  assert.doesNotMatch(elem, /X\.arc\(/);
});

test('water-bean and Kraken-owned large balls skip generic line trails and circle glows', () => {
  const trail = sliceBetween(gameHtml, '// 패스 0: 가시 인덱스', '// 패스 1:');
  assert.match(trail, /!p\.waterBean&&!p\.elemBall/);

  const glow = sliceBetween(gameHtml, '// 패스 1:', '// 패스 2:');
  assert.match(glow, /p\.waterBean\|\|p\.elemBall/);
  assert.match(glow, /continue/);
});

test('Silvertail E hold preview is an open runic sprite instead of a filled gray sector', () => {
  assert.match(gameHtml, /function _drawSilvertailChargeRange\(/);
  const charge = sliceBetween(gameHtml, '// ══ 차징 검격 (sDraw/kiGather 응축)', '// ══ WHIRLWIND');
  assert.match(charge, /_drawSilvertailChargeRange\(X,P\.x,P\.y,_kgPvR,P\.facing,_kgT2,_kgFrm\)/);
  assert.doesNotMatch(charge, /createRadialGradient/);
  assert.doesNotMatch(charge, /X\.fill\(\)/);
  assert.doesNotMatch(charge, /X\.moveTo\(0,0\)/);
});
