import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parry passive caps rainbow bean damage reduction at 50 percent', () => {
  assert.match(
    gameHtml,
    /function pParryRainbowDR\(\)\{return Math\.min\(\.50,PASSIVES\.pParry\*\.10\)\}/
  );
});

test('parry passive description states the 50 percent rainbow bean cap', () => {
  assert.match(
    gameHtml,
    /desc:'카운터뎀 \+50%\/lv, 우클릭 공속 \+10%\/lv, 무지개탄 피해감소 \+10%\/lv \(최대50%\)'/
  );
});
