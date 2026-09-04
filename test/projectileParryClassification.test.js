import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  let depth = 0;
  let opened = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') { depth++; opened = true; }
    else if (gameHtml[i] === '}') { depth--; if (opened && depth === 0) return gameHtml.slice(start, i + 1); }
  }
  assert.fail(`${name} must be complete`);
}

test('projectile parry class follows gameplay identity, not the legacy redBean skin flag', () => {
  const classify = Function(`
    const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
    ${extractFunction('_projectileParryClass')}
    return _projectileParryClass;
  `)();

  assert.equal(classify({ el: 0, redBean: true }), 'physical', 'physical redBean is an E-mouth projectile');
  assert.equal(classify({ el: 1, redBean: true }), 'magic', 'fire redBean is a magic projectile despite its legacy flag');
  assert.equal(classify({ el: 1, titanEye: true }), 'physical', 'titan eye remains a physical E projectile despite fire element color');
  assert.equal(classify({ el: 1, fireMagic: true }), 'magic');
  assert.equal(classify({ el: 2, waterBean: true }), 'magic');
  assert.equal(classify({ el: 1, elemBall: true, fbEnergy: true }), 'magic', 'large energy uses its dedicated Q-magic route');
  assert.equal(classify({ el: 3, mine: true }), 'magic', 'a mine is a Q-parryable dark trap, not an implicit forbidden hazard');
  assert.equal(classify({ el: 3, trap: true }), 'magic', 'a trap is a Q-parryable dark trap, not an implicit forbidden hazard');
  assert.equal(classify({ el: 0, pierce: true }), 'physical');
  assert.equal(classify({ el: 0, blackBean: true }), 'magic', 'rainbow bean is a Q-parryable magic projectile');
});

test('spawn, render, and Q/E parry routing all consume the same stored class', () => {
  assert.match(gameHtml, /parryClass:''/, 'projectile pool must own an explicit class field');
  assert.match(gameHtml, /p\.parryClass=_projectileParryClass\(p\)/,
    'spawn must freeze the classification after all creation flags are set');
  assert.match(gameHtml, /if\(p\.redBean&&_projectileParryClass\(p\)==='physical'\)/,
    'only physical redBean shots may use the mouth visual');
  assert.match(gameHtml, /const _physicalRed=p\.redBean&&_projectileParryClass\(p\)==='physical';/,
    'physical redBean glow must be keyed from the shared class instead of its red skin flag');
  assert.match(gameHtml, /X\.filter='grayscale\(1\) brightness\(1\.65\) contrast\(1\.25\)'/,
    'the physical redBean mouth must render in the gray E-only palette');
  assert.match(gameHtml, /const _parryClass=_projectileParryClass\(p\);/,
    'collision handling must read the same classification');
  assert.match(gameHtml, /if\(_qParryActive&&_parryClass==='magic'\)/,
    'Q must reflect magic only');
  assert.match(gameHtml, /const _pcPhysical=e\._projChargeBean==='normal'&&e\.el===EL\.P;/,
    'the fire-red charge telegraph must not impersonate a physical white E projectile');
  const trapUpdate = gameHtml.slice(gameHtml.indexOf('// 덫(16:덫사도)'), gameHtml.indexOf('// 차원 균열(98:균열체)'));
  assert.doesNotMatch(trapUpdate, /projs\[pw\+\+\]=p;continue;/,
    'a Q-parryable trap must reach the common magic-Q collision route');
});

test('homing profile follows source class where a shared skin used to override it', () => {
  const turnRate = Function(`
    const EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6};
    ${extractFunction('_projectileParryClass')}
    ${extractFunction('_enemyHomingTurnRate')}
    return _enemyHomingTurnRate;
  `)();

  assert.equal(turnRate({ el: 1, redBean: true }), .0262, 'fire redBean keeps the magic homing profile');
  assert.equal(turnRate({ el: 0, redBean: true }), .00436332, 'physical redBean keeps the physical homing profile');
  assert.equal(turnRate({ el: 1, titanEye: true }), .00436332, 'fire-colored titan eye remains physical');
});

test('peace-shield Q routing accepts magic red comets by parry class', () => {
  const start = gameHtml.indexOf("case 'peaceShield':");
  const end = gameHtml.indexOf("case 'ghostWalk':", start);
  assert.ok(start >= 0 && end > start, 'peace-shield update block must exist');
  const peaceShield = gameHtml.slice(start, end);

  assert.match(peaceShield, /if\(P\._sbParryT>0&&_projectileParryClass\(p\)==='magic'\)/,
    'peaceShield must parry every magic projectile, including redBean + EL.F');
  assert.doesNotMatch(peaceShield, /p\.friendly\|\|p\.noParry\|\|p\.blackBean/,
    'peaceShield must not discard rainbow magic before the Q class check');
  assert.doesNotMatch(peaceShield, /P\._sbParryT>0&&!p\.redBean/,
    'the legacy red skin must never reject a magic Q projectile');
});
