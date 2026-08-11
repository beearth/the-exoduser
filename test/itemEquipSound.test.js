import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('item equipment maps weapon-type equip sounds over a base sound plus a rare rune layer', () => {
  for (const key of ['equip_base', 'equip_sword', 'equip_crossbow', 'equip_rare']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/equipment/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/equipment/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  // 구 재질(slot) 분화 폐기.
  assert.doesNotMatch(gameHtml, /equip_weapon|equip_armor|equip_accessory|_EQUIP_SFX_BY_SLOT/);
  // 무기=wtype, 활=btype 매핑 + equip_base 폴백.
  assert.match(gameHtml, /const _EQUIP_SFX_BY_WTYPE=\{sword:'equip_sword'\};/);
  assert.match(gameHtml, /const _EQUIP_SFX_BY_BTYPE=\{crossbow:'equip_crossbow'\};/);
  assert.match(gameHtml, /function playEquipSfx\(item\)\{if\(!item\)return;const _k=\(item\.wtype&&_EQUIP_SFX_BY_WTYPE\[item\.wtype\]\)\|\|\(item\.btype&&_EQUIP_SFX_BY_BTYPE\[item\.btype\]\)\|\|'equip_base';playSample\(_k,\.42,_r\(1,\.04\)\);if\(item\.rarity>=2\)playSample\('equip_rare',\.28,_r\(1,\.03\)\);\}/);
  assert.match(gameHtml, /recalcSt\(\);\s*playEquipSfx\(item\);\s*notify\(_T\(item\.name\)\+_T\(' 장착!'\)\);/);
  assert.match(gameHtml, /INV\.equipped\[_autoSlot\]=item;item\.slot=_autoSlot;\s*playItemPickupSfx\(item\);playEquipSfx\(item\);/);
  assert.match(gameHtml, /INV\.equipped\[craftSlot\]=item;\s*SFX\.pickup\(\);playEquipSfx\(item\);/);
});
