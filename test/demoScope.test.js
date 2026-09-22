import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gameUrl = new URL('../game.html', import.meta.url);
const lobbyUrl = new URL('../index.html', import.meta.url);
const demoNotesUrl = new URL('../docs/0마스터플랜/DEMO/HELL_DEMO_BUILD_NOTES.md', import.meta.url);

test('the public demo is capped at level 100 and ends after stage 1-1', async () => {
  const game = await readFile(gameUrl, 'utf8');

  assert.match(game, /const _DEMO_LV_CAP=100;/);
  assert.match(game, /const _DEMO_LAST_STAGE=0;[^\n]*1-1/);
  assert.doesNotMatch(game, /const _DEMO_LV_CAP=_BIC\?100:500;/);
  assert.match(game, /if\(_DEMO_MODE&&P\.lv>=_DEMO_LV_CAP\)/);
  assert.match(game, /if\(_DEMO_MODE&&G\.stage===_DEMO_LAST_STAGE&&_curHell===0\)/);
});

test('the lobby and demo build notes describe the same 1-1 level 100 scope', async () => {
  const [lobby, notes] = await Promise.all([
    readFile(lobbyUrl, 'utf8'),
    readFile(demoNotesUrl, 'utf8'),
  ]);

  assert.match(lobby, /demo:'Lv\.1 START · Stage 1-1 Only · Lv\.100 Cap · 1~2h'/);
  assert.match(lobby, /DEMO CHARACTER[\s\S]*Lv\.1 START · Stage 1-1 · Lv\.100 Cap/);
  assert.match(notes, /\| 레벨 캡 \| 100 \(`_DEMO_LV_CAP=100`\) \|/);
  assert.match(notes, /\| 스테이지 \| 1-1만 \(`_DEMO_LAST_STAGE=0`\) \|/);
});

test('current scope documents retain no active 1-4 public-demo contract', async () => {
  const [ea, marketing, mapPlan] = await Promise.all([
    readFile(new URL('../docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md', import.meta.url), 'utf8'),
    readFile(new URL('../docs/13출시·마케팅/13출시·마케팅.md', import.meta.url), 'utf8'),
    readFile(new URL('../docs/4.1맵디자인+설정/맵유형_확장기획.md', import.meta.url), 'utf8'),
  ]);

  assert.match(ea, /현행 공개 데모는 `\?demo`와 `\?bic` 모두 Lv\.100·1-1/);
  assert.doesNotMatch(marketing, /일반데모\(Lv500\)|_DEMO_LAST_STAGE=3/);
  assert.doesNotMatch(mapPlan, /_DEMO_LAST_STAGE=3/);
});