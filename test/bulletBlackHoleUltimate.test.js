import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

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

test('lavaSummon is presented as the bullet-black-hole emergency ultimate', () => {
  assert.match(gameHtml, /id:'lavaSummon',name:'탄막블랙홀'/);
  assert.match(gameHtml, /desc:'[^']*5초[^']*적 탄막[^']*흡수량 비례/);
  assert.match(gameHtml, /case 'lavaSummon':[\s\S]{0,500}_lvAbsorbed=0[\s\S]{0,200}_lvDmgPool=0/);
});

test('bullet black hole has a small core but a screen-clearing absorption field', () => {
  const duration = Function(`${extractFunction('_bulletBlackHoleDuration')};return _bulletBlackHoleDuration`)();
  const absorbRadius = Function(`${extractFunction('_bulletBlackHoleAbsorbRadius')};return _bulletBlackHoleAbsorbRadius`)();
  const blastRadius = Function(`${extractFunction('_bulletBlackHoleBlastRadius')};return _bulletBlackHoleBlastRadius`)();

  assert.equal(duration(), 300, 'the black hole persists for five seconds at 60 FPS');
  assert.equal(absorbRadius(1), 1000);
  assert.equal(absorbRadius(20), 1475);
  assert.equal(blastRadius(1), 900);
  assert.equal(blastRadius(20), 1470);
});

test('persistent field absorbs only live hostile bullets inside its radius', () => {
  const source = extractFunction('_absorbBulletBlackHoleProjectiles');
  const projs = [
    { x: 30, y: 40, life: 10, dmg: 20, col: '#f00' },
    { x: 50, y: 0, life: 10, dmg: 30, blackBean: true },
    { x: 70, y: 0, life: 10, dmg: 40, elemBall: true },
    { x: 40, y: 20, life: 10, dmg: 50, friendly: true },
    { x: 20, y: 10, life: 10, dmg: 60, mine: true },
    { x: 2000, y: 0, life: 10, dmg: 70 },
    { x: 10, y: 0, life: -1, dmg: 80 },
  ];
  const dst = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  const poolPart = () => {};
  const absorb = Function('projs', 'dst', 'poolPart', `${source};return _absorbBulletBlackHoleProjectiles`)(projs, dst, poolPart);

  assert.deepEqual(absorb(0, 0, 100), { count: 3, damage: 90 });
  assert.equal(projs[0].life, -999);
  assert.equal(projs[1].life, -999, 'unparryable rainbow bullets are still absorbable');
  assert.equal(projs[2].life, -999, 'large energy balls are still absorbable');
  assert.equal(projs[3].life, 10, 'friendly bullets remain');
  assert.equal(projs[4].life, 10, 'player-owned mine zones remain');
  assert.equal(projs[5].life, 10, 'off-field bullets remain until they enter');
});

test('the field absorbs each frame and detonates only after its duration', () => {
  assert.match(gameHtml, /if\(P\._lvCasting\)\{[\s\S]{0,900}_absorbBulletBlackHoleProjectiles\(P\._lvX,P\._lvY,_lvAbsorbR\)[\s\S]{0,400}P\._lvT>=_bulletBlackHoleDuration\(\)[\s\S]{0,80}fireLavaSummon\(\)/);
  const fireSource = extractFunction('fireLavaSummon');
  assert.doesNotMatch(fireSource, /for\(let i=0;i<projs\.length;i\+\+\)/,
    'detonation must not perform the old instant full-screen bullet deletion');
  assert.match(fireSource, /P\._lvAbsorbed/);
  assert.match(fireSource, /P\._lvDmgPool/);
  assert.match(fireSource, /_bulletBlackHoleBlastRadius\(slv\)/);
});
