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
  return Function(`const EL={P:0};${source};return {_rollEnemyBulletSpeed,_normalizeEnemyBulletSpeed}`)();
}

test('enemy physical bullet average drops by 50 px/s to a 100-250 band', () => {
  const { _rollEnemyBulletSpeed } = speedHelpers();
  near(_rollEnemyBulletSpeed(() => 0), 100 / 60);
  near(_rollEnemyBulletSpeed(() => 0.5), 175 / 60);
  near(_rollEnemyBulletSpeed(() => 1), 250 / 60);
});

test('enemy magic bullet speed remains in the 250-400 band', () => {
  const { _normalizeEnemyBulletSpeed } = speedHelpers();
  const slow = { vx: 3, vy: 4, el: 1 };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 250 / 60) < 1e-12);

  const midpoint = { vx: 3, vy: 4, el: 1 };
  _normalizeEnemyBulletSpeed(midpoint, () => 0.5);
  assert.ok(Math.abs(Math.hypot(midpoint.vx, midpoint.vy) - 325 / 60) < 1e-12);

  const fast = { vx: 3, vy: 4, el: 1 };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 400 / 60) < 1e-12);
});

test('enemy rainbow bullet speed rises by 50 px/s to a 300-450 band', () => {
  const { _normalizeEnemyBulletSpeed } = speedHelpers();
  const slow = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 300 / 60) < 1e-12);

  const midpoint = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(midpoint, () => 0.5);
  assert.ok(Math.abs(Math.hypot(midpoint.vx, midpoint.vy) - 375 / 60) < 1e-12);

  const fast = { vx: 3, vy: 4, el: 0, blackBean: true };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 450 / 60) < 1e-12);
});

test('enemy bullet normalization preserves direction and applies the rolled final speed', () => {
  const { _normalizeEnemyBulletSpeed } = speedHelpers();
  const slow = { vx: 3, vy: 4 };
  _normalizeEnemyBulletSpeed(slow, () => 0);
  assert.ok(Math.abs(Math.hypot(slow.vx, slow.vy) - 100 / 60) < 1e-12);
  near(slow.vx / slow.vy, 3 / 4);

  const fast = { vx: -3, vy: 4 };
  _normalizeEnemyBulletSpeed(fast, () => 1);
  assert.ok(Math.abs(Math.hypot(fast.vx, fast.vy) - 250 / 60) < 1e-12);
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
