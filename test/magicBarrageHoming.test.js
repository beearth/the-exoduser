import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function enemyHomingTurnRate() {
  const start = gameHtml.indexOf('function _enemyHomingTurnRate(');
  assert.ok(start >= 0, 'enemy homing turn-rate helper must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(end > start + 1, 'enemy homing turn-rate helper must be complete');
  return Function(`const EL={P:0,F:1,I:2};${gameHtml.slice(start, end)};return _enemyHomingTurnRate`)();
}

test('ordinary magic barrage homing is reduced 50% to roughly 90 degrees per second', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ homing: true }), 0.0262);
});

test('all magic barrage family turn rates are reduced 50%', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ blackBean: true }), 0.02325);
  assert.equal(turnRate({ fbEnergy: true }), 0.004);
  assert.equal(turnRate({ elemBall: true }), 0.0291);
  assert.equal(turnRate({ phantomSword: true }), 0.0262);

  for (const rate of [0.02325, 0.0291, 0.0262]) {
    const degPerSec = rate * 60 * 180 / Math.PI;
    assert.ok(degPerSec >= 74 && degPerSec <= 101);
  }
});

test('all E-parry red-bean teeth and titan eyes home at roughly 15 degrees per second', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ redBean: true, el: 0 }), 0.00436332);
  assert.equal(turnRate({ redBean: true, el: 1 }), 0.00436332);
  assert.equal(turnRate({ _closeBean: true, redBean: true, el: 1 }), 0.00436332);
  assert.equal(turnRate({ redBean: true, titanEye: true, el: 1 }), 0.00436332);
  assert.ok(Math.abs(0.00436332 * 60 * 180 / Math.PI - 15) < 0.01);
});

test('ordinary magical speed-band bullets opt into homing while giant energy balls stay straight', () => {
  assert.match(gameHtml, /if\(_speedBandBullet&&_isEnemyMagicBullet\(p\)\)p\.homing=true/);
  assert.match(gameHtml, /!p\.elemBall/,
    'elemBall giant-energy projectiles remain outside ordinary magic homing assignment');
});
