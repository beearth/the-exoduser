import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parry blue beans bypass the default magic-to-HP penalty', () => {
  assert.match(gameHtml, /parryBlueBean:false,/);
  assert.match(gameHtml, /p\.parryBlueBean=false;/);
  const tagged =
    gameHtml.match(
      /p\.redBean=false;p\.blueBean=true;p\.col='#00e5ff';p\.homing=true;p\.magic=true;p\.parryBlueBean=true;/g
    ) || [];
  assert.equal(tagged.length, 3);
  assert.match(
    gameHtml,
    /const _magicHpRate=\(opts&&opts\.parryBlueBean\)\?1:_mpRate;/
  );
  assert.match(
    gameHtml,
    /if\(_rawLeft>0\)e\.hp-=_isMagicDmg\?\(~~\(_rawLeft\*_magicHpRate\)\|\|1\):_rawLeft/
  );
  assert.match(
    gameHtml,
    /else\{e\.hp-=_isMagicDmg\?\(~~\(dmg\*_magicHpRate\)\|\|1\):dmg\}/
  );
  assert.match(
    gameHtml,
    /hurtE\(_bbe,~~\(p\._aoeDmg\*_bbm\*_bbeStkMul\),_bba,true,\{magic:true,blueBean:true,parryBlueBean:!!p\.parryBlueBean\},p\.el\);/
  );
});
