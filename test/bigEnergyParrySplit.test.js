import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function splitHelper() {
  const match = gameHtml.match(/function _splitParriedBigEnergy\(p,totalDmg\)\{[\s\S]*?\n\}/);
  assert.ok(match, 'large-energy parry split helper must exist');
  const pProjs = [];
  const _getPProj = () => ({
    _hitSet: new Set(), magic: false, arcMissile: false, _arcLock: 0, _maxBounce: 0,
  });
  const fn = Function('_getPProj', 'pProjs', `${match[0]};return _splitParriedBigEnergy`)(_getPProj, pProjs);
  return { fn, pProjs };
}

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

test('parried large energy ball splits into five plain elemental magic shots', () => {
  const { fn, pProjs } = splitHelper();
  fn({ x: 100, y: 200, vx: 12, vy: 0, el: 1 }, 1000);

  assert.equal(pProjs.length, 5);
  assert.ok(pProjs.every((p) => p.el === 1), 'fire fragments preserve the red fire element');
  assert.ok(pProjs.every((p) => p.dmg === 200));
  assert.ok(pProjs.every((p) => p.r === 8 && p.magic && !p.arcMissile),
    'split shots must use the plain magic projectile path, not the arc-missile path');
  assert.ok(pProjs.every((p) => p._parryMagicShot === true),
    'split shots must opt into the full-size comet magic-bullet visual instead of a bean-sized fallback');
  assert.ok(pProjs.every((p) => p._arcLock === 0 && p._maxBounce === 0),
    'plain magic fragments must not inherit arc-missile launch lock or bounce behavior');
  assert.equal(new Set(pProjs.map((p) => Math.atan2(p.vy, p.vx).toFixed(6))).size, 5);
});

test('large-energy fragments render with the existing full magic-comet projectile', () => {
  const normalMagicLengthSrc = extractFunction('_normalMagicCometLength');
  const normalMagicLength = Function(`${normalMagicLengthSrc};return _normalMagicCometLength`)();

  assert.ok(Math.abs(normalMagicLength(4) - 123.2) < 1e-9,
    'a standard post-scaling sz4 magic bullet renders at the live 20 x 2.8 x 2.2 comet length');
  assert.match(gameHtml, /_drawCometBullet\(p\.x,p\.y,_normalMagicCometLength\(p\.sz\)/,
    'ordinary hostile magic bullets must use the shared live-size helper');
  assert.match(gameHtml, /else if\(p\._parryMagicShot\)\{[\s\S]{0,500}_drawCometBullet\(p\.x,p\.y,/,
    'parry fragments must reuse the normal comet magic-bullet renderer');
  assert.match(gameHtml, /const _pmLen=_normalMagicCometLength\(4\)\*2;/,
    'all five parry fragments must keep the approved two-times normal magic-bullet visual size');
  assert.match(gameHtml, /p\._parryMagicShot=false/,
    'pooled player projectiles must clear the parry magic visual flag');
  assert.match(gameHtml, /OPT\.parts>=60[^\n]+!p\.plagueBlade&&!p\._parryMagicShot\)_projEmit/,
    'full comet fragments must not be obscured by the generic dust emitter');
});

test('water large-energy fragments preserve the blue water element', () => {
  const { fn, pProjs } = splitHelper();
  fn({ x: 10, y: 20, vx: 0, vy: 8, el: 2 }, 500);
  assert.equal(pProjs.length, 5);
  assert.ok(pProjs.every((p) => p.el === 2));
  assert.match(gameHtml, /const ELC=\['#bbbbbb','#ff5522','#3388ff'/,
    'EL.F fragments render red and EL.I fragments render blue');
});

test('Q parry routes large energy balls through the five-shot split', () => {
  assert.match(gameHtml, /if\(_bigBall&&!p\.friendly&&!_pHit&&!P\._ioActive\)[\s\S]{0,300}_resolveBigEnergyParry\(p,_bigParryDmg\)/);
});

test('large-energy parry grants ten times the normal recovery resources without multiplying fragment damage', () => {
  const resolveSrc = extractFunction('_resolveBigEnergyParry');
  const parrySrc = extractFunction('doParry');

  assert.match(resolveSrc, /const _bigResourceMul=10/);
  assert.match(resolveSrc, /P\.parryBank=\(P\.parryBank\|\|0\)\+totalDmg\*_bigResourceMul/);
  assert.match(resolveSrc, /doParry\(totalDmg,p\.x,p\.y,true,p\.el,_bigResourceMul\)/);
  assert.match(parrySrc, /function doParry\(_inDmg,_px,_py,_forceQ,_parryEl,_resourceMul\)/);
  assert.match(parrySrc, /const _resourceBonus=Math\.max\(1,_resourceMul\|\|1\)/);
  assert.match(parrySrc, /const _prBase=~~\([^;]+\*_resourceBonus\)/);
  assert.match(parrySrc, /const _harpAdd=\([^;]+\)\*_resourceBonus/);
  assert.match(parrySrc, /const _rageAdd=\(\([^;]+\)\*_resourceBonus\+_uSR\)/);
  assert.match(parrySrc, /const _matsAdd=\([^;]+\)\*_resourceBonus/);
  assert.match(resolveSrc, /_splitParriedBigEnergy\(p,totalDmg\)/,
    'the ten-times bonus must not be passed into the five-shot damage split');
});

test('large energy contact uses the visible core instead of the tiny spawn body radius', () => {
  const match = gameHtml.match(/function _bigEnergyContactRadius\(p\)\{[^}]+\}/);
  assert.ok(match, 'large-energy visible-core collision helper must exist');
  const radius = Function(`${match[0]};return _bigEnergyContactRadius`)();

  assert.equal(radius({ fbEnergy: true, r: 26, sz: 96 }), 96);
  assert.equal(radius({ fdEnergy: true, r: 23.4, sz: 96 }), 96);
  assert.match(gameHtml, /_pCollR=P\.r\+\(_bigBall\?_bigEnergyContactRadius\(p\):\(p\.sz\|\|1\)\*3\)/);
});

test('large energy always detonates on player or wall contact even while damage is invulnerable', () => {
  assert.match(gameHtml, /if\(_bigBall&&!p\.friendly&&!_pHit&&!P\._ioActive\)\{[\s\S]{0,500}P\.iframes<=0&&P\.s!==['"]charge['"][\s\S]{0,300}_fbEnergyBoom\(p\)[\s\S]{0,80}_pHit=true/,
    'large balls deal damage only when vulnerable but always explode and recycle');
  assert.match(gameHtml, /const _bigWallHit=_bigEnergyWallContact\(p,_oldPx,_oldPy,p\.x,p\.y\);[\s\S]{0,180}_fbEnergyBoom\(p\)/,
    'large balls must sweep their visible core and use their explosion VFX on wall contact');
});

test('large energy uses relative swept collision for crossing player movement', () => {
  const src = extractFunction('_relativeSweepDistance');
  const distance = Function(`${src};return _relativeSweepDistance`)();

  assert.equal(distance(-10, 0, 10, 0, 0, -10, 0, 10), 0,
    'crossing projectile/player paths must collide between frames');
  assert.equal(distance(0, 0, 20, 0, 0, 10, 20, 10), 10,
    'parallel paths preserve their separation');
});

test('large energy wall collision sweeps its full core instead of checking only its center endpoint', () => {
  const radiusSrc = extractFunction('_bigEnergyContactRadius');
  const wallSrc = extractFunction('_bigEnergyWallContact');
  const wallContact = Function(`${radiusSrc};${wallSrc};return _bigEnergyWallContact`)();
  const hit = wallContact({ r: 4, sz: 10 }, 0, 0, 100, 0, (x) => x >= 50);

  assert.ok(hit, 'sweep must find the thin wall');
  assert.ok(hit.x < 50, 'impact position stays on the last valid side of the wall');
});

test('large energy owns one terminal pipeline and cannot become a friendly 30-pierce ball', () => {
  assert.match(gameHtml, /function _resolveBigEnergyParry\(p,totalDmg\)/);
  assert.doesNotMatch(gameHtml, /_bigPierce=30/);
  assert.match(gameHtml, /if\(_bigBall&&p\.friendly\)\{_fbEnergyBoom\(p\);_recycleProj\(p\);continue\}/,
    'an unexpected friendly large ball must terminate instead of piercing');

  const projectileLoop = gameHtml.slice(
    gameHtml.indexOf('{let pw=0;_resetParryHomingCache()'),
    gameHtml.indexOf('// ── 석궁 자동 발사'),
  );
  assert.match(projectileLoop, /if\(_bigBall&&!p\.friendly&&!_pHit&&!P\._ioActive\)/,
    'hostile large balls use a dedicated player contact branch');
  assert.match(projectileLoop, /if\(!p\.blackBean&&!_bigBall&&!p\.noParry/,
    'generic projectile contact must exclude large balls');
});

test('Q shield splits large energy while non-Q reflection loops leave it to the dedicated pipeline', () => {
  const peaceShieldStart = gameHtml.indexOf("case 'peaceShield':");
  const peaceShield = gameHtml.slice(
    peaceShieldStart,
    gameHtml.indexOf("case 'ghostWalk':", peaceShieldStart),
  );
  assert.match(peaceShield, /if\(_isBigEnergy\(p\)\)[\s\S]{0,300}_resolveBigEnergyParry\(p,/,
    'peace shield Q parry must split the original immediately');

  assert.match(gameHtml, /const p=projs\[i\];if\(p\.friendly\|\|p\.noParry\|\|p\.blackBean\|\|_isBigEnergy\(p\)\)continue;/,
    'E back-blade reflection must not turn large magic energy friendly');
  assert.match(gameHtml, /const p=projs\[_pi\];if\(p\.friendly\|\|!p\.life\|\|_isBigEnergy\(p\)\)continue;/,
    'non-Q landing parry must not bypass large-energy ownership');
});
