import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

const tick = sliceBetween(gameHtml, 'function _fbTick(){', 'function _fbDraw(){');
const draw = sliceBetween(gameHtml, 'function _fbDraw(){', 'function _wmLockDest(w){');

test('kraken field-boss HP is 30x the old 1800+lv*350 curve', () => {
  assert.match(gameHtml, /const _FB_HP_MUL=30/);
  const hpFn = gameHtml.match(/function _fbHp\(lv\)\{[^}]+\}/);
  assert.ok(hpFn, '_fbHp helper must exist');
  const hp = Function(`const _FB_HP_MUL=30;${hpFn[0]};return _fbHp`)();
  assert.equal(hp(1), (1800 + 350) * 30);
  assert.equal(hp(100), (1800 + 100 * 350) * 30);
});

test('CH1-1 places 4 krakens on authored map sites, not a single 2500px chase spawn', () => {
  assert.match(gameHtml, /const _FB_COUNT=4/);
  assert.match(gameHtml, /const _FB_SITES=\[\[58,158\],\[148,150\],\[52,42\],\[148,42\]\]/);
  assert.match(tick, /G\._fieldBosses/);
  assert.doesNotMatch(tick, /dst\(P\.x,P\.y,G\._fbSpawnX,G\._fbSpawnY\)>2500/);
});

test('four krakens keep the original sprite; element is lure/energy color not a body wash', () => {
  assert.match(gameHtml, /const _FB_ELS=\[2,1,3,4\]/);
  assert.match(gameHtml, /function _fbEnsureSheet\(/);
  const sheet = sliceBetween(gameHtml, 'function _fbEnsureSheet(', 'function _fbHp(');
  assert.doesNotMatch(sheet, /source-atop/);
  assert.match(gameHtml, /_fbMk\(_FB_SITES\[_si\]\[0\],_FB_SITES\[_si\]\[1\],_FB_ELS\[_si\]\)/);
  assert.match(gameHtml, /el:el/);
  assert.match(gameHtml, /spawnProj\(\{x:m\.x,y:m\.y[\s\S]*?el:fb\.el/);
});

test('CH1-1 hell gate stays sealed until all four elemental krakens are dead', () => {
  const rooms = sliceBetween(gameHtml, 'function checkRooms(){', 'function hurtE(');
  assert.match(rooms, /G\.stage===0&&!G\._fbDone/);
  assert.match(rooms, /G\.stage!==0\|\|G\._fbDone/);
  assert.match(rooms, /심연의 앵글러를 모두 처치하라/);
});

test('initStage clears the kraken pack so a CH1-1 re-entry requires all four again', () => {
  const init = sliceBetween(gameHtml, 'function initStage(si){', 'function nextStage(){');
  assert.match(init, /G\._fbDone=false/);
  assert.match(init, /G\._fbSpawned=false/);
});

test('first angler spawn starts hid with vanish reverse emerge, not the body sprite', () => {
  assert.match(gameHtml, /hid:1,burst:0,burstGap:0,spawnIn:1,asleep:1/);
  assert.match(tick, /fb\.hid=1;fb\.spawnIn=1/);
  assert.match(tick, /fb\.tpT=54/);
  assert.match(tick, /_FB_WAKE/);
  assert.doesNotMatch(gameHtml, /G\._fieldBoss=\{x:_sx/);
});

test('kraken gathers energy from lure tentacles then fires a large energy ball', () => {
  assert.match(gameHtml, /const _FB_EN_CHG=180/);
  assert.match(gameHtml, /function _fbLureTips\(/);
  assert.match(gameHtml, /function _fbEsca\(/);
  assert.match(gameHtml, /function _fbFireEnergy\(/);
  assert.match(tick, /fb\.enChg=_FB_EN_CHG/);
  assert.match(tick, /_fbFireEnergy\(fb\)/);
  assert.match(tick, /_fbEsca\(fb\)/);
  assert.match(gameHtml, /fbEnergy:true/);
  assert.match(gameHtml, /elemBall:true/);
  assert.match(draw, /fb\.enChg/);
  assert.match(draw, /_fbEsca\(fb\)/);
  assert.doesNotMatch(gameHtml, /fbEnergy:true[\s\S]{0,80}redBean:true/);
});

test('kraken charge uses the cut 8-frame meteor gather strip on the esca', () => {
  assert.ok(existsSync(join(root, 'img/fieldboss_angler_charge.png')));
  assert.match(gameHtml, /fieldboss_angler_charge\.png/);
  assert.match(gameHtml, /function _fbDrawCharge\(/);
  const chg = sliceBetween(gameHtml, 'function _fbDrawCharge(fb){', 'function _fbDrawOne(fb){');
  assert.match(chg, /_fbEsca\(fb\)/);
  assert.match(chg, /%8/);
  assert.doesNotMatch(chg, /fr%4/);
  assert.doesNotMatch(chg, /%12/);
  assert.doesNotMatch(chg, /X\.arc\(/);
  assert.match(draw, /_fbDrawCharge\(fb\)/);
  assert.doesNotMatch(draw, /_orb=16\+_cProg\*70/);
});

test('kraken energy ball is huge and explodes huge', () => {
  const fire = sliceBetween(gameHtml, 'function _fbFireEnergy(fb){', 'function _fbClear(){');
  assert.match(fire, /sz:48/);
  assert.match(fire, /r:20/);
  assert.match(gameHtml, /p\.fbEnergy/);
  assert.match(gameHtml, /_addBoom\([^)]*p\.x[^)]*2[0-9]{2}/);
});

test('kraken energy-ball visual size matches the fire-devil energy ball', () => {
  const krakenFly = sliceBetween(gameHtml, 'function _fbDrawFly(p){', '// ── 흰색 물리탄');
  const fireDevilFly = sliceBetween(gameHtml, 'function _fdDrawFly(p){', 'function _fdClear(){');
  assert.match(krakenFly, /var dw=240,/);
  assert.match(fireDevilFly, /var dw=240,/);
  assert.doesNotMatch(krakenFly, /\(p\.sz\|\|48\)\*3\.5/);
});

test('kraken energy ball flies straight, a bit faster, on a 3s attack cadence', () => {
  const fire = sliceBetween(gameHtml, 'function _fbFireEnergy(fb){', 'function _fbClear(){');
  const one = sliceBetween(gameHtml, 'function _fbTickOne(fb){', 'function _fbDrawCharge(fb){');
  assert.match(fire, /vx:Math\.cos\(a\)\*10/);
  assert.doesNotMatch(fire, /homing:true/);
  assert.match(one, /fb\.shotCd=_FB_EN_CHG/);
  assert.doesNotMatch(one, /shotCd=1200/);
  assert.doesNotMatch(one, /shotCd<=0&&!fb\.hid&&!\(fb\.tpT>0\)&&!\(fb\.enChg>0\)&&!\(fb\.burst>0\)/);
  assert.match(one, /if\(!\(fb\.tpCd>0\)\)fb\.tpCd=600/);
});

test('large energy balls explode on visible-core contact but parry on the wider visible ball', () => {
  assert.match(gameHtml, /_bigBall=_isBigEnergy\(p\)/);
  assert.match(gameHtml, /_pCollR=P\.r\+\(_bigBall\?_bigEnergyContactRadius\(p\):\(p\.sz\|\|1\)\*3\)/);
  assert.match(gameHtml, /_pParryR=_bigBall\?Math\.max\(P\.r\+\(p\.sz\|\|48\)\+90,P\.s==='sBlock'\?_sBlockChargeRadius\(P\._sbHoldT\):P\._sbReleaseR\|\|0\)/,
    'the Q hold must give large energy balls the same charged outer parry radius');
  assert.match(gameHtml, /_pDist=_bigBall\?_relativeSweepDistance\(/);
  assert.match(gameHtml, /_bigEnergyWallContact\(p,_oldPx,_oldPy,p\.x,p\.y\)/);
});

test('kraken faces the player with left vs right sheet cells, not a fake 8-dir wrap', () => {
  assert.match(tick, /fb\.frame=_fbFaceFrame\(fb,P\.x,P\.y\)/);
  const fn = gameHtml.match(/function _fbFaceFrame\(fb,px,py\)\{[\s\S]*?\n\}/);
  assert.ok(fn, '_fbFaceFrame helper must exist');
  const face = Function(`${fn[0]};return _fbFaceFrame`)();
  const right = face({x:100,y:100,t:0}, 400, 100);
  const left = face({x:100,y:100,t:0}, -50, 100);
  assert.ok([3, 7].includes(right), `player on right must use right-facing cells 3/7, got ${right}`);
  assert.ok([0, 1, 2, 4, 5, 6].includes(left), `player on left must use left-facing cells, got ${left}`);
  assert.doesNotMatch(tick, /fb\.frame=\(\(Math\.round\(_ang\/\(Math\.PI\/4\)\)%8\)\+8\)%8/);
});

test('spawn emerge skips old-location vanish and first-land smash', () => {
  assert.match(draw, /!fb\.spawnIn/);
  assert.match(tick, /fb\.spawnIn/);
  const land = tick.slice(tick.indexOf('if(fb.tpT===0)'), tick.indexOf('}else if(fb.tpCd>0)'));
  assert.match(land, /playVFXAng\('kraken_tp'/);
  assert.match(land, /_isSpawn|spawnIn/);
  assert.match(land, /if\(!_isSpawn\)|if\(!fb\.spawnIn\)|if\(!_isSpawn&&/);
});
