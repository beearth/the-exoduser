import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-12);

function speedHelpers() {
  const start = gameHtml.indexOf('const ENEMY_BULLET_SPEED_MIN=');
  assert.ok(start >= 0, 'enemy bullet speed-band constants must exist');
  const end = gameHtml.indexOf('function spawnProj(props){', start);
  assert.ok(end > start, 'enemy bullet speed helpers must precede spawnProj');
  const source = gameHtml.slice(start, end);
  return Function(`const EL={P:0,F:1,I:2};${source};return {_rollEnemyBulletSpeed,_normalizeEnemyBulletSpeed,_isEnemyMagicBullet}`)();
}

test('enemy physical teeth hold exactly 300 px/s', () => {
  const { _rollEnemyBulletSpeed } = speedHelpers();
  near(_rollEnemyBulletSpeed(() => 0), 300 / 60);
  near(_rollEnemyBulletSpeed(() => 0.5), 300 / 60);
  near(_rollEnemyBulletSpeed(() => 1), 300 / 60);
});

test('fire red-bean and water blue-bean both use the magic 500-600 band', () => {
  const { _normalizeEnemyBulletSpeed, _isEnemyMagicBullet } = speedHelpers();
  assert.equal(_isEnemyMagicBullet({ el: 1, redBean: true }), true, '빨콩 is fire magic');
  assert.equal(_isEnemyMagicBullet({ el: 2, waterBean: true }), true, '파란콩 is water/ice magic');

  const red = { vx: 3, vy: 4, el: 1, redBean: true };
  _normalizeEnemyBulletSpeed(red, () => 0.5);
  assert.ok(Math.abs(Math.hypot(red.vx, red.vy) - 550 / 60) < 1e-12);

  const water = { vx: 3, vy: 4, el: 2, waterBean: true };
  _normalizeEnemyBulletSpeed(water, () => 0);
  assert.ok(Math.abs(Math.hypot(water.vx, water.vy) - 500 / 60) < 1e-12);
});

test('enemy magic and fire-comet barrage use the 500-600 band', () => {
  const { _normalizeEnemyBulletSpeed, _isEnemyMagicBullet } = speedHelpers();
  assert.equal(_isEnemyMagicBullet({ el: 1, fireMagic: true }), true,
    '화성송(화속성 fireMagic) is a magic bullet');

  const slow = { vx: 3, vy: 4, el: 1, fireMagic: true };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 500 / 60) < 1e-12);

  const midpoint = { vx: 3, vy: 4, el: 1, fireMagic: true };
  _normalizeEnemyBulletSpeed(midpoint, () => 0.5);
  assert.ok(Math.abs(Math.hypot(midpoint.vx, midpoint.vy) - 550 / 60) < 1e-12);

  const fast = { vx: 3, vy: 4, el: 1 };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 600 / 60) < 1e-12);
});

test('enemy rainbow bullet shares the 500-600 magic band', () => {
  const { _normalizeEnemyBulletSpeed } = speedHelpers();
  const slow = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 500 / 60) < 1e-12);

  const midpoint = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(midpoint, () => 0.5);
  assert.ok(Math.abs(Math.hypot(midpoint.vx, midpoint.vy) - 550 / 60) < 1e-12);

  const fast = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 600 / 60) < 1e-12);
});

test('enemy bullet normalization preserves direction and applies the rolled final speed', () => {
  const { _normalizeEnemyBulletSpeed } = speedHelpers();
  const slow = { vx: 3, vy: 4 };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 300 / 60) < 1e-12);
  near(slow.vx / slow.vy, 3 / 4);

  const fast = { vx: -3, vy: 4 };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 300 / 60) < 1e-12);
  assert.equal(Math.sign(fast.vx), -1);
  assert.equal(Math.sign(fast.vy), 1);
});

test('spawnProj applies the speed band to ordinary moving enemy bullets only', () => {
  const start = gameHtml.indexOf('function spawnProj(props){');
  const end = gameHtml.indexOf('function _recycleProj(p){', start);
  const spawn = gameHtml.slice(start, end);
  assert.match(spawn, /const _speedBandBullet=_moving&&!p\.titanEye/);
  assert.match(spawn, /if\(_speedBandBullet\)_normalizeEnemyBulletSpeed\(p\)/);
});

test('titan-eye physical bullets also normalize to exactly 300 px/s', () => {
  const start = gameHtml.indexOf('function spawnProj(props){');
  const end = gameHtml.indexOf('function _recycleProj(p){', start);
  const spawn = gameHtml.slice(start, end);
  assert.match(spawn, /if\(_moving&&p\.titanEye\)\{[^}]*_normalizeEnemyBulletSpeed\(p\)/);
});

function beanRollHelpers(rand = () => 0.5) {
  const start = gameHtml.indexOf('function _beanRoll(');
  assert.ok(start >= 0, '_beanRoll must exist');
  const end = gameHtml.indexOf('function _eMouthXY', start);
  assert.ok(end > start, '_beanRoll must precede _eMouthXY');
  const source = gameHtml.slice(start, end);
  return Function(`
    const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
    const dst=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
    const P={x:0,y:0};
    Math.random=${rand.toString()};
    ${source}
    return {_beanRoll};
  `)();
}

test('barrage 3-way is rainbow / fire red-bean / water blue-bean', () => {
  const { _beanRoll } = beanRollHelpers(() => 0.5);
  const e = { x: 1000, y: 1000, _beanCnt: 2 }; // ++ 후 %3 === 0,1,2
  const rainbow = _beanRoll(0, '#fff', 1, 3, 1, e);
  const red = _beanRoll(0, '#fff', 1, 3, 1, e);
  const water = _beanRoll(0, '#fff', 1, 3, 1, e);

  assert.equal(rainbow.blackBean, true, 'slot 0 is rainbow');
  assert.equal(red.redBean, true, 'slot 1 is 빨콩');
  assert.equal(red.el, 1, '빨콩 is fire EL.F');
  assert.equal(water.waterBean, true, 'slot 2 is 옛 파란콩(물)');
  assert.equal(water.el, 2, '파란콩 is water/ice EL.I');
  assert.equal(water.homing, true, 'water magic barrage opts into homing');
  assert.equal(water.blueBean, undefined, 'enemy water must not use parry-reflect blueBean');
  assert.equal(water.fireMagic, undefined, '3-way third slot is water, not 화성송');
});

test('close-range and filler 빨콩 stay fire, not the monster element', () => {
  const { _beanRoll } = beanRollHelpers(() => 0.5);
  const close = _beanRoll(3, '#fff', 1, 3, 1, { x: 0, y: 0 });
  assert.equal(close.redBean, true);
  assert.equal(close._closeBean, true);
  assert.equal(close.el, 1, '근접빨콩 is fire');

  const { _beanRoll: rollFiller } = beanRollHelpers(() => 0.70);
  const fillerRed = rollFiller(3, '#fff', 1, 3, 1, null);
  assert.equal(fillerRed.redBean, true);
  assert.equal(fillerRed.el, 1, 'filler 빨콩 is fire');
});

test('waterBean is wired through spawn, reset, charge, magic-speed, and blue draw', () => {
  const { _isEnemyMagicBullet } = speedHelpers();
  assert.equal(_isEnemyMagicBullet({ waterBean: true }), true, 'waterBean counts as magic even if el omitted');

  assert.match(gameHtml, /p\.waterBean=false/);
  assert.match(gameHtml, /waterBean:b\.waterBean/);
  assert.match(gameHtml, /_projChargeBean='water'/);
  assert.match(gameHtml, /waterBean:true/);
  assert.match(gameHtml, /if\(p\.waterBean\)/);
  assert.match(gameHtml, /_drawWaterBean|_drawOldBlueBean|#317cec|#00ccff/);
});

test('water-bean uses the same saturated blue for its spawn and charge telegraph', () => {
  const beanStart = gameHtml.indexOf('function _beanRoll(');
  const beanEnd = gameHtml.indexOf('function _eMouthXY(', beanStart);
  assert.ok(beanStart >= 0 && beanEnd > beanStart, 'water-bean roll source must exist');
  const beanRoll = gameHtml.slice(beanStart, beanEnd);

  assert.match(beanRoll, /el:EL\.I,col:'#317cec'/,
    'water-bean spawn color must match the saturated blue core palette');
  assert.match(gameHtml, /e\._projChargeBean='water';e\._projChargeCol='#317cec'/,
    'the charge telegraph must not retain the old cyan color');
});
