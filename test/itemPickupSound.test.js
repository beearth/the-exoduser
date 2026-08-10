import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('item pickup uses a single dedicated swipe sound for all rarities', () => {
  assert.match(gameHtml, /pickup_item:'sfx\/pickup\/pickup_item\.mp3'/);
  assert.ok(existsSync(new URL('../sfx/pickup/pickup_item.mp3', import.meta.url)), 'pickup_item sample exists');
  // 단일 스와이프음: 등급 무관 모든 아이템에 pickup_item 하나만 재생.
  assert.match(gameHtml, /function playItemPickupSfx\(item\)\{playSample\('pickup_item',\.5,_r\(1,\.05\)\);\}/);
  // 폐기된 등급 레이어 키가 남아있지 않아야 함.
  assert.doesNotMatch(gameHtml, /pickup_rare|pickup_legend/);
  // 가방 습득 경로
  assert.match(gameHtml, /playItemPickupSfx\(item\);notify\(`\$\{_rarName\(item\.rarity\)\} \$\{_T\(item\.name\)\} \$\{_T\('획득!'\)\}`\);/);
  // 픽업 자동 장착 경로: 습득음(계층) + 장착음
  assert.match(gameHtml, /playItemPickupSfx\(item\);playEquipSfx\(item\);notify\(`\$\{_rarName\(item\.rarity\)\} \$\{_T\(item\.name\)\} \$\{_T\('획득!'\)\} ⚡ \$\{_T\('자동 장착!'\)\}`\);/);
  // 월드아이템 습득부의 중복 SFX.pickup() 제거 확인 (pickupItem 내부가 이미 재생)
  assert.match(gameHtml, /if\(pickupItem\(wi\.item\)\)\{wi\.picked=true;addParts\(wi\.x,wi\.y,RARITY_C\[wi\.item\.rarity\]\|\|'#aaa',6\);/);
  assert.doesNotMatch(gameHtml, /if\(pickupItem\(wi\.item\)\)\{wi\.picked=true;SFX\.pickup\(\);/);
});
