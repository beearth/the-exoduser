import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('defines giantSlam2 as a duplicate giant slam skill', () => {
  assert.match(gameHtml, /id:'giantSlam2',name:'대왕치기 2',cat:'phys',act:true/);
});

test('dispatches giantSlam2 through activateGiantSlam', () => {
  assert.match(
    gameHtml,
    /case 'giantSlam2':\s*if\(P\.st>=stCost\('giantSlam'\)&&G\.mats>=20&&\(P\._gslCd\|\|0\)<=0\)\{activateGiantSlam\('giantSlam2'\);_skOk=true\}/
  );
});

test('keeps giantSlam2 as a selectable phys skill instead of a fixed default slot', () => {
  assert.doesNotMatch(gameHtml, /SKILL_SLOTS\[1\]='giantSlam2'/);
  assert.doesNotMatch(gameHtml, /giantSlam2:'2'/);
});
