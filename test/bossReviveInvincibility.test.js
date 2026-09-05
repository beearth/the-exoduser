import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gameHtml = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const bossSettings = await readFile(new URL('../docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md', import.meta.url), 'utf8');
const bossSpec = await readFile(new URL('../docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md', import.meta.url), 'utf8');

test('boss phase and revive invincibility use the shortened 90-frame contract', () => {
  assert.match(gameHtml, /부활 무적 1\.5초/);
  assert.match(gameHtml, /e\.reviveIframes=90/);
  assert.match(gameHtml, /if\(e\.reviveIframes>90\)e\.reviveIframes=90/);
  assert.doesNotMatch(gameHtml, /e\.reviveIframes=180/);
});

test('boss invincibility docs stay synchronized at 90 frames', () => {
  assert.match(bossSettings, /무적 1\.5초 \(`reviveIframes = 90`\)/);
  assert.match(bossSpec, /무적 1\.5초 \(reviveIframes = 90\)/);
});
