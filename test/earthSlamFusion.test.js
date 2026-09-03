import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('removed earthSlam fusion cannot re-enter fusion data or runtime dispatch', () => {
  assert.doesNotMatch(gameHtml, /earthSlam\s*:\s*\{color:/);
  assert.doesNotMatch(gameHtml, /earthSlam\s*:\s*'earthBreaker'/);
  assert.doesNotMatch(gameHtml, /function _earthSlamDamageSplit\(/);
  assert.doesNotMatch(gameHtml, /function _triggerEarthSlamFusion\(/);
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
