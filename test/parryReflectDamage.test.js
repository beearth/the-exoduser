import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parried projectiles use the unified reflect formula and per-projectile multipliers', () => {
  assert.match(
    gameHtml,
    /function pParryProjDmg\(bulletDmg,isQ\)\{const scale=isQ\?magicRef\(\)\*statInt\(\)\*pMagicMul\(\):meleeRef\(\)\*statStr\(\)\*pAtkMul\(\);[\s\S]*return Math\.max\(_calc,_kiFloor\);\}/
  );
  assert.match(gameHtml, /p\.dmg=~~\(pParryProjDmg\(p\.dmg,false\)\*1\.8\);p\._aoeDmg=p\.dmg\*1\.5;/);
  assert.match(gameHtml, /p\.dmg=~~\(pParryProjDmg\(p\.dmg,false\)\*0\.8\*_msReflect\);p\.life=60;p\.ml=60;/);
  assert.match(gameHtml, /p\.friendly=true;p\.life=240;p\.ml=240;p\.dmg=~~\(pParryProjDmg\(p\.dmg,false\)\*1\.5\);p\._aoeR=160;p\._aoeDmg=p\.dmg\*2;/);
  assert.match(gameHtml, /p\.friendly=true;p\.dmg=~~\(pParryProjDmg\(p\.dmg,_sbPW\)\*2\);p\.life=200;p\.ml=200;/);
  assert.doesNotMatch(gameHtml, /function pParryProjDmgMul\(/);
});
