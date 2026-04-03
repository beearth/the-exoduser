import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('fireball keeps only ten percent of its previous knockback', () => {
  assert.match(
    gameHtml,
    /id:'fireball',name:'[^']+',cat:'magic',desc:'[^']*0\.5%[^']*'/
  );
  assert.match(
    gameHtml,
    /_pp\.kb=0\.005;_pp\.kbMult=0\.1;_pp\.magic=true;_pp\.fireball=true;/
  );
  assert.match(
    gameHtml,
    /const _fireballKbOpts=!p\.fireBeamProj&&p\.fireball\?\{kbMult:0\.1\}:\{\};[\s\S]*hurtE\(e,~~\(dmg\*m\),a,false,_fireballKbOpts,el\);/
  );
});
