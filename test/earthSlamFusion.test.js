import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('defines earth slam fusion for giantSlam2 and earthBreaker', () => {
  assert.match(
    gameHtml,
    /earthSlam:\['giantSlam2','earthBreaker'\]/
  );
  assert.match(
    gameHtml,
    /earthSlam:\['earthBreaker'\]/
  );
  assert.match(
    gameHtml,
    /earthSlam:'대지치기'/
  );
});

test('dispatches giantSlam2 through its own activation path for fusion handling', () => {
  assert.match(
    gameHtml,
    /case 'giantSlam2':\s*if\(P\.st>=stCost\('giantSlam'\)&&G\.mats>=20&&\(P\._gslCd\|\|0\)<=0\)\{activateGiantSlam\('giantSlam2'\);_skOk=true\}/
  );
});

test('earth slam fusion adds two earthBreaker damage pulses after giant slam hit', () => {
  assert.match(
    gameHtml,
    /function _triggerEarthSlamFusion\(x,y\)\{[\s\S]*const damages=_earthBreakerSplitDamage\([^)]*,2\);[\s\S]*_earthBreakerPulse\(x,y,[^,]+,damages\[0\],2,0,damages\.length\);[\s\S]*damages,nextHit:1,t:0,hitGap:8/
  );
  assert.match(
    gameHtml,
    /if\(srcId==='giantSlam2'&&_isFused\('earthSlam'\)&&P\.skills\.earthBreaker>=1\)\{[\s\S]*_triggerEarthSlamFusion\(P\.x,P\.y\);/
  );
});

test('giant slam now focuses on heavy poise damage instead of guaranteed normal-enemy stun', () => {
  assert.doesNotMatch(
    gameHtml,
    /\/\/ 일반몹: 100% 스턴[\s\S]*e\.poise=0[\s\S]*기절!/
  );
  assert.match(
    gameHtml,
    /\/\/ 일반몹: 강한 포이즈 피해[\s\S]*if\(e\.poise<=0\)[\s\S]*체간 붕괴!/
  );
});
