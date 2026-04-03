import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parried projectiles get an explicit reflect-only damage bonus', () => {
  assert.match(gameHtml, /function pParryProjDmgMul\(\)\{return 3;\}/);
  assert.match(
    gameHtml,
    /p\.dmg=~~\(p\.dmg\*2\.5\*\(1\+\(_sdLv-1\)\*0\.15\)\*_wingMul\*pParryProjDmgMul\(\)\);p\._aoeDmg=p\.dmg\*4;/
  );
  assert.match(
    gameHtml,
    /p\.dmg=~~\(_rBase\*1\.5\*\(1\+\(_sdLv-1\)\*0\.1\)\*_msReflect\*pParryDmg\(\)\*\(\(P\._stWingT\|\|0\)>0\?1\.5:1\)\*pParryProjDmgMul\(\)\);/
  );
  assert.match(
    gameHtml,
    /p\.dmg=~~\(p\.dmg\*1\.8\*pParryProjDmgMul\(\)\);p\._aoeDmg=p\.dmg\*3;/
  );
  assert.match(
    gameHtml,
    /p\.dmg=~~\(p\.dmg\*0\.8\*_msReflect\*pParryProjDmgMul\(\)\);p\.life=60;p\.ml=60;/
  );
  assert.match(
    gameHtml,
    /p\.friendly=true;p\.life=240;p\.ml=240;p\.dmg=~~\(p\.dmg\*pParryProjDmgMul\(\)\);p\._aoeR=160;p\._aoeDmg=p\.dmg\*4;/
  );
  assert.match(
    gameHtml,
    /p\.dmg=~~\(_rB\*1\.2\*pParryDmg\(\)\*pParryProjDmgMul\(\)\);p\.life=80;p\.ml=80;/
  );
  const parry15 = gameHtml.match(/p\.dmg=~~\(_rB\*1\.5\*pParryDmg\(\)\*pParryProjDmgMul\(\)\);p\.life=180;p\.ml=180;/g) || [];
  assert.ok(parry15.length >= 2);
  assert.match(
    gameHtml,
    /p\.dmg=~~\(_rB\*2\*pParryDmg\(\)\*pParryProjDmgMul\(\)\);p\.life=200;p\.ml=200;/
  );
});
