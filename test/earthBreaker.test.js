import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('defines earthBreaker as a separate physical active skill', () => {
  assert.match(
    gameHtml,
    /id:'earthBreaker',name:'대지파괴'.*cat:'phys'.*act:true.*desc:'제자리에서 땅을 내려찍는 물리 스킬/
  );
});

test('earthBreaker hit count scales at level 1, 5, and 10', () => {
  assert.match(
    gameHtml,
    /function _earthBreakerHitCount\(slv\)\{\s*if\(slv>=10\)return 3;\s*if\(slv>=5\)return 2;\s*return 1;\s*\}/
  );
});

test('earthBreaker total damage scales by 10 percent per level and splits across hits', () => {
  assert.match(
    gameHtml,
    /function _earthBreakerSplitDamage\(baseDamage,slv\)\{[\s\S]*const hitCount=_earthBreakerHitCount\(slv\);[\s\S]*const totalDamage=~~\(baseDamage\*\(1\+\(slv-1\)\*0\.10\)\);[\s\S]*const perHit=~~\(totalDamage\/hitCount\);[\s\S]*const remainder=totalDamage-perHit\*hitCount;[\s\S]*damages\.push\(perHit\+\(i<remainder\?1:0\)\)/
  );
});

test('earthBreaker dispatches through skill slots as a standalone cast', () => {
  assert.match(
    gameHtml,
    /case 'earthBreaker':\s*if\(\(P\._earthBreakCd\|\|0\)>0\)\{showPH\('쿨다운 중\.\.\.','#ff8844'\);break\}\s*if\(P\.st>=stCost\('earthBreaker'\)\)\{activateEarthBreaker\(\);_skOk=true\}/
  );
  assert.match(
    gameHtml,
    /function activateEarthBreaker\(\)\{[\s\S]*P\._earthBreakAnimT=18;[\s\S]*_startEarthBreaker\(P\.x,P\.y\);/
  );
});
