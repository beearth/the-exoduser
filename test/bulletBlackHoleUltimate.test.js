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

test('persistent field visibly pulls hostile bullets to its core before storing them', () => {
  const source = extractFunction('_absorbBulletBlackHoleProjectiles');
  const projs = [
    { x: 10, y: 0, life: 10, dmg: 20, col: '#f00' },
    { x: 50, y: 0, life: 10, dmg: 30, blackBean: true, vx: 4, vy: 0 },
    { x: 70, y: 0, life: 10, dmg: 40, elemBall: true, vx: 4, vy: 0 },
    { x: 40, y: 20, life: 10, dmg: 50, friendly: true },
    { x: 20, y: 10, life: 10, dmg: 60, mine: true },
    { x: 2000, y: 0, life: 10, dmg: 70 },
    { x: 10, y: 0, life: -1, dmg: 80 },
  ];
  const dst = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  const poolPart = () => {};
  const absorb = Function('projs', 'dst', 'poolPart', `${source};return _absorbBulletBlackHoleProjectiles`)(projs, dst, poolPart);

  assert.deepEqual(absorb(0, 0, 100), {
    count: 1,
    damage: 20,
    captured: [{ el: 0, col: '#f00', sz: 1, r: 4, redBean: false, blackBean: false, bwBean: false, gbBean: false, fireMagic: false, waterBean: false, homing: false }],
  });
  assert.equal(projs[0].life, -999);
  assert.ok(projs[1].life > 0, 'unparryable rainbow bullets remain visible until core contact');
  assert.ok(projs[2].life > 0, 'large energy balls remain visible until core contact');
  assert.ok(projs[1].vx < 0, 'the rainbow bullet is redirected into the core');
  assert.ok(projs[2].vx < 0, 'the large energy bullet is redirected into the core');
  assert.equal(projs[3].life, 10, 'friendly bullets remain');
  assert.equal(projs[4].life, 10, 'player-owned mine zones remain');
  assert.equal(projs[5].life, 10, 'off-field bullets remain until they enter');
});

test('black-hole collapse returns each stored bullet as a two-shot 360-degree friendly reflection', () => {
  const source = extractFunction('_releaseBulletBlackHoleBarrage');
  const calls = [];
  const spawnProj = (props) => calls.push(props);
  const release = Function('spawnProj', 'EL', `${source};return _releaseBulletBlackHoleBarrage`)(spawnProj, { F: 1 });

  const captured = [
    { el: 1, col: '#f00', sz: 1.5, r: 6, redBean: true, blackBean: false, bwBean: false, gbBean: false, fireMagic: false, waterBean: false, homing: true },
    { el: 2, col: '#317cec', sz: 2, r: 8, redBean: false, blackBean: false, bwBean: false, gbBean: false, fireMagic: false, waterBean: true },
    { el: 3, col: '#a44cff', sz: 1.6, r: 5, redBean: false, blackBean: false, bwBean: false, gbBean: true, fireMagic: false, waterBean: false },
    { el: 4, col: '#ffcc00', sz: 2.4, r: 9, redBean: false, blackBean: true, bwBean: false, gbBean: false, fireMagic: false, waterBean: false },
  ];
  assert.equal(release(100, 200, captured, 80), 8);
  assert.equal(calls.length, 8);
  assert.ok(calls.every((shot) => shot.friendly && shot.blackHoleBurst));
  assert.deepEqual(calls.map((shot) => [shot.el, shot.col, shot.sz, shot.r, shot.redBean, shot.waterBean, shot.gbBean, shot.blackBean, shot.homing]), [
    [1, '#f00', 1.5, 6, true, false, false, false, true], [1, '#f00', 1.5, 6, true, false, false, false, true],
    [2, '#317cec', 2, 8, false, true, false, false, false], [2, '#317cec', 2, 8, false, true, false, false, false],
    [3, '#a44cff', 1.6, 5, false, false, true, false, false], [3, '#a44cff', 1.6, 5, false, false, true, false, false],
    [4, '#ffcc00', 2.4, 9, false, false, false, true, true], [4, '#ffcc00', 2.4, 9, false, false, false, true, true],
  ], 'each reflected shot retains the absorbed bullet visual identity');
  assert.ok(calls.every((shot) => Math.hypot(shot.vx, shot.vy) > 10));
  const totalX = calls.reduce((sum, shot) => sum + shot.vx, 0);
  const totalY = calls.reduce((sum, shot) => sum + shot.vy, 0);
  assert.ok(Math.abs(totalX) < 0.0001 && Math.abs(totalY) < 0.0001,
    'released bullets are spaced evenly around the full circle');
  calls.length = 0;
  assert.equal(release(100, 200, Array.from({ length: 100 }, () => captured[0]), 10000), 200,
    'each absorbed bullet must produce two return bullets, without a hidden release cap');
  assert.equal(calls.length, 200);
});

test('black-hole return bullets divide the final collapse damage, not raw enemy projectile damage', () => {
  const fireSource = extractFunction('fireLavaSummon');
  const damageAt = fireSource.indexOf('const dmg=');
  const releaseAt = fireSource.indexOf('_releaseBulletBlackHoleBarrage(');
  assert.ok(damageAt >= 0 && releaseAt > damageAt,
    'the final collapse damage must be calculated before its return bullets are created');
  assert.match(fireSource, /_releaseBulletBlackHoleBarrage\(cx,cy,P\._lvCaptured\|\|\[\],dmg\)/);
});

test('black-hole collapse keeps the return ring readable by omitting the lava burst animation', () => {
  const fireSource = extractFunction('fireLavaSummon');
  assert.match(fireSource, /_releaseBulletBlackHoleBarrage\(cx,cy,P\._lvCaptured\|\|\[\],dmg\)/);
  assert.doesNotMatch(fireSource, /G\._ultBurst=\{kind:'lava'/,
    'the large lava burst sheet must not cover the 360-degree return bullets');
});

test('a reflected black-hole bullet creates its own hit impact before recycling', () => {
  assert.match(gameHtml, /if\(p\.blackHoleBurst\)\{[\s\S]{0,300}_addBoom\(p\.x,p\.y,_blR,36,'fire_medium'\)[\s\S]{0,300}_addImpact\(p\.x,p\.y,p\.el,[\s\S]{0,120}playVFXAng\('magic_burst',p\.x,p\.y/);
});

test('a reflected black-hole bullet keeps homing toward enemies', () => {
  assert.match(gameHtml, /if\(p\.blackHoleBurst&&p\.friendly&&p\.homing&&p\.life>30\)\{/);
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
