import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('blackBean remains hostile and can never be converted by a parry window', () => {
  const start = gameHtml.indexOf('// ══ 무지개콩탄:');
  const end = gameHtml.indexOf('// ══ 화이트볼', start);
  assert.ok(start >= 0 && end > start, 'blackBean collision block must exist');
  const block = gameHtml.slice(start, end);

  assert.doesNotMatch(block, /const _bkParry=_anyPW/);
  assert.doesNotMatch(block, /p\.blackBean=false/);
  assert.doesNotMatch(block, /p\.friendly=true/);
  assert.doesNotMatch(block, /pParryProjDmg\(/);
  assert.match(block, /hurtP\(_bkD,\{dtype:'magic',src:'무지개폭발'\}\)/);
});

test('all broad projectile parry loops explicitly skip blackBean', () => {
  assert.match(gameHtml, /if\(p\.friendly\|\|p\.noParry\|\|p\.blackBean\|\|_isBigEnergy\(p\)\)continue;/);
  assert.match(gameHtml, /if\(p\.friendly\|\|p\.noParry\|\|p\.blackBean\)continue;/);
});

test('pet combat guidance tells the player to dodge rainbow shots', () => {
  assert.match(gameHtml, /_petSayCD\('tut_rainbow','crow','무지개빛은 패링 불가! 피해!'/);
  assert.doesNotMatch(gameHtml, /_petSayCD\('tut_rainbow'[^\n]+Q 패링/);
  assert.doesNotMatch(gameHtml, /_petBidCD\('parry_(?:low|mid)'[^\n]+무지개는 Q/);
});
