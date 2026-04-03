import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('defines earth slam fusion for giantSlam2 and earthBreaker', () => {
  assert.match(
    gameHtml,
    /earthSlam:\s*\{color:'#[^']+',color2:'#[^']+',tier:'clear',minLv:1,star:1,skills:\['earthBreaker','giantSlam2'\]\}/
  );
  assert.match(
    gameHtml,
    /earthSlam:\['giantSlam2'\]/
  );
  assert.match(
    gameHtml,
    /earthSlam:'대지치기'/
  );
});

test('earthBreaker becomes the host card for earth slam fusion', () => {
  assert.match(
    gameHtml,
    /earthSlam:'earthBreaker'/
  );
  assert.match(
    gameHtml,
    /_ssid==='earthBreaker'&&P\.skills\.giantSlam2>=1&&_isFused\('earthSlam'\)\)\?'대지치기'/
  );
});

test('earth slam fusion adds one giant slam poise hit before two earthBreaker damage pulses', () => {
  assert.match(
    gameHtml,
    /function _earthSlamDamageSplit\(baseDamage,slv\)\{[\s\S]*const totalDamage=~~\(baseDamage\*\(1\+\(slv-1\)\*0\.10\)\);[\s\S]*const hitCount=2;[\s\S]*damages\.push\(perHit\+\(i<remainder\?1:0\)\)/
  );
  assert.match(
    gameHtml,
    /hitGap:60/
  );
  assert.match(
    gameHtml,
    /startDelay:60/
  );
  assert.match(
    gameHtml,
    /function activateEarthBreaker\(\)\{[\s\S]*const _earthFused=_isFused\('earthSlam'\)&&P\.skills\.giantSlam2>=1;[\s\S]*if\(_earthFused\)\{[\s\S]*_triggerEarthSlamFusion\(P\.x,P\.y\);[\s\S]*return;/
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
