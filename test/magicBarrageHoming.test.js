import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} helper must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') { depth++; opened = true; }
    else if (gameHtml[i] === '}') { depth--; if (opened && depth === 0) return gameHtml.slice(start, i + 1); }
  }
  assert.fail(`${name} helper must be complete`);
}

function enemyHomingTurnRate() {
  return Function(`const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};${extractFunction('_projectileParryClass')};${extractFunction('_enemyHomingTurnRate')};return _enemyHomingTurnRate`)();
}

test('ordinary magic barrage homing is halved to roughly 45 degrees per second', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ homing: true, el: 1 }), 0.0131);
});

test('all magic barrage family turn rates are halved', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ blackBean: true }), 0.011625);
  assert.equal(turnRate({ fbEnergy: true }), 0.002);
  assert.equal(turnRate({ elemBall: true }), 0.01455);
  assert.equal(turnRate({ phantomSword: true }), 0.0131);

  for (const rate of [0.011625, 0.01455, 0.0131]) {
    const degPerSec = rate * 60 * 180 / Math.PI;
    assert.ok(degPerSec >= 37 && degPerSec <= 51);
  }
});

test('only physical red-bean teeth and titan eyes home at roughly 7.5 degrees per second', () => {
  const turnRate = enemyHomingTurnRate();
  assert.equal(turnRate({ redBean: true, el: 0 }), 0.00218166);
  assert.equal(turnRate({ redBean: true, el: 1 }), 0.0131, 'fire redBean is a Q magic comet');
  assert.equal(turnRate({ _closeBean: true, redBean: true, el: 1 }), 0.0131, 'close fire redBean is a Q magic comet');
  assert.equal(turnRate({ redBean: true, titanEye: true, el: 1 }), 0.00218166);
  assert.ok(Math.abs(0.00218166 * 60 * 180 / Math.PI - 7.5) < 0.01);
});

test('ordinary magical speed-band bullets opt into homing while giant energy balls stay straight', () => {
  assert.match(gameHtml, /if\(_speedBandBullet&&_isEnemyMagicBullet\(p\)\)p\.homing=true/);
  assert.match(gameHtml, /!p\.elemBall/,
    'elemBall giant-energy projectiles remain outside ordinary magic homing assignment');
});
