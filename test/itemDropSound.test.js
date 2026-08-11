import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('item ground drops play a rarity-scaled spatial drop sound with a burst gate', () => {
  for (const key of ['drop_common', 'drop_rare', 'drop_legend']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/drop/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/drop/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  // 등급 스케일: 일반0~1 / 희귀2~3(>=2) / 전설4~5(>=4). 드랍 위치에서 공간 재생, 45ms 게이트.
  assert.match(gameHtml, /function playItemDropSfx\(rar,x,y\)\{const now=performance\.now\(\);if\(now-_lastDropSndT<45\)return;_lastDropSndT=now;const k=rar>=4\?'drop_legend':rar>=2\?'drop_rare':'drop_common';playSampleAt\(k,\.5,_r\(1,\.04\),x,y\);\}/);
  // _wiPush 중앙 배선: 아이템 타입만, 드랍 프리뷰 제외.
  assert.match(gameHtml, /function _wiPush\(wi\)\{worldItems\.push\(wi\);if\(wi\.type==='item'&&wi\.item&&!wi\._dropPreview\)playItemDropSfx\(wi\.item\.rarity\|\|0,wi\.x,wi\.y\);/);
});
