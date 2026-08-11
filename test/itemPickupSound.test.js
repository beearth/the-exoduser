import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('item pickup plays a random grab/rummage variant for all rarities', () => {
  for (const key of ['pickup_item', 'pickup_rummage1', 'pickup_rummage2', 'pickup_rummage3', 'pickup_rummage4', 'pickup_rummage5']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/pickup/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/pickup/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  // 등급 무관 랜덤 풀에서 1종 재생.
  assert.match(gameHtml, /const _PICKUP_SFX_POOL=\['pickup_item','pickup_rummage1','pickup_rummage2','pickup_rummage3','pickup_rummage4','pickup_rummage5'\];/);
  assert.match(gameHtml, /function playItemPickupSfx\(item\)\{playSample\(_PICKUP_SFX_POOL\[~~\(Math\.random\(\)\*_PICKUP_SFX_POOL\.length\)\],\.5,_r\(1,\.05\)\);\}/);
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
