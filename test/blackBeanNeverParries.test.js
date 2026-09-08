import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('blackBean remains hostile until the magic Q window routes it into the common parry conversion', () => {
  const start = gameHtml.indexOf('// ══ 무지개콩탄:');
  const end = gameHtml.indexOf('// ══ 화이트볼', start);
  assert.ok(start >= 0 && end > start, 'blackBean collision block must exist');
  const block = gameHtml.slice(start, end);

  assert.match(block, /const _bkQParry=_qParryActive&&_parryClass==='magic';/,
    'the rainbow collision must yield to an active magic-Q parry before its contact explosion');
  assert.match(block, /if\(p\.blackBean&&!_pHit&&!_bkQParry&&_pDist<_bkHitR/,
    'only non-Q-parried rainbow contact may reach the explosion path');
  assert.match(block, /_hurtProjectilePlayer\(p,_bkD,\{dtype:'magic',src:'무지개폭발'\}\)/);

  const commonStart = gameHtml.indexOf('// ══ 일반탄:');
  const commonEnd = gameHtml.indexOf("else if(P.s==='whirlwind'", commonStart);
  const commonParry = gameHtml.slice(commonStart, commonEnd);
  assert.match(commonParry, /if\(!_bigBall&&!p\.noParry/, 'the Q common parry route must not exclude blackBean');
  assert.match(commonParry, /if\(!_bigBall&&!p\.noParry&&!p\.poisonZone&&!_pHit&&!p\.friendly&&_pDist/,
    'a reflected friendly blue bean must not be re-parried during the same Q iframe window');
  assert.match(commonParry, /doParry\(p\.dmg,p\.x,p\.y,false,p\.blackBean\?'rainbow':p\.el(?:,undefined,_waterBeanParry\?'waterBean':undefined)?\)/,
    'a Q-parried rainbow projectile must use the rainbow parry impact');
});

test('Q parry loops do not discard blackBean before class routing', () => {
  const start = gameHtml.indexOf("case 'peaceShield':");
  const end = gameHtml.indexOf("case 'ghostWalk':", start);
  const peaceShield = gameHtml.slice(start, end);
  assert.doesNotMatch(peaceShield, /p\.noParry\|\|p\.blackBean/,
    'peaceShield Q must let rainbow shots reach the magic class check');
  assert.match(peaceShield, /_projectileParryClass\(p\)==='magic'/);
  assert.match(peaceShield, /p\._fromRainbow=!!p\.blackBean/,
    'peaceShield must preserve the rainbow impact identity on its reflected blue bean');
});

test('a reflected rainbow shot cannot re-enter the Q parry branch while friendly', () => {
  const commonStart = gameHtml.indexOf('// ?먥븧 ?쇰컲??');
  const commonEnd = gameHtml.indexOf("else if(P.s==='whirlwind'", commonStart);
  const commonParry = gameHtml.slice(commonStart, commonEnd);
  assert.match(gameHtml, /!_pHit&&!p\.friendly&&_pDist/);
});

test('pet combat guidance teaches Q for rainbow shots', () => {
  assert.match(gameHtml, /_petSayCD\('tut_rainbow','crow','무지개탄은 Q 패링이다\. E는 안 통해\.'/);
  assert.match(gameHtml, /_petBidCD\('parry_(?:low|mid)'[^\n]+무지개탄은 Q 패링이다\. E는 안 통해\./);
});
