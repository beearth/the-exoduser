import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parry blue beans keep their damage flags and boss damage resolves to exactly 10% max HP', () => {
  assert.match(gameHtml, /parryBlueBean:false,/);
  assert.match(gameHtml, /p\.parryBlueBean=false;/);
  const tagged = gameHtml.match(/p\.parryBlueBean=true/g) || [];
  assert.ok(tagged.length >= 12);
  assert.match(
    gameHtml,
    /if\(opts&&opts\.parryBlueBean&&e\.mhp>0\)\{dmg=Math\.max\(dmg,~~\(e\.mhp\*0\.10\)\)\}/
  );
  const hurtStart = gameHtml.indexOf('function hurtE(');
  const hurtEnd = gameHtml.indexOf('// ─── [S16j]', hurtStart);
  const hurtSource = gameHtml.slice(hurtStart, hurtEnd);
  const finalBossClamp = hurtSource.indexOf('if(e.ib&&opts&&opts.parryBlueBean){dmg=~~(e.mhp*.10)}');
  assert.ok(finalBossClamp > hurtSource.indexOf('if(e._frozen>0&&!isDot){dmg=~~(dmg*1.5)}'));
  assert.ok(finalBossClamp < hurtSource.indexOf('// ═══ 에너지쉴드: 모든 배율 확정 후 흡수'));
  assert.doesNotMatch(hurtSource, /parryBlueBean\)\{dmg=Math\.min/);
  assert.match(
    gameHtml,
    /if\(dmg > 0\) \{[\s\S]*e\.hp-=dmg;/
  );
  assert.match(
    gameHtml,
    /hurtE\(_bbe,_bbeD,_bba,true,\{magic:true,blueBean:true,parryBlueBean:!!p\.parryBlueBean\},p\.el\);/
  );
  assert.doesNotMatch(gameHtml, /_magicHpRate/);
});
