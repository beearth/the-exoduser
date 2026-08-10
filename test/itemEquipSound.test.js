import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('item equipment uses material-specific sounds and a rare-item rune layer', () => {
  for (const key of ['equip_weapon', 'equip_armor', 'equip_accessory', 'equip_rare']) {
    assert.match(gameHtml, new RegExp(`${key}:'sfx/equipment/${key}\\.mp3'`));
    assert.ok(existsSync(new URL(`../sfx/equipment/${key}.mp3`, import.meta.url)), `${key} sample exists`);
  }
  assert.match(gameHtml, /const _EQUIP_SFX_BY_SLOT=\{weapon:'equip_weapon',bow:'equip_weapon',shield:'equip_armor',armor:'equip_armor',helmet:'equip_armor',boots:'equip_armor',gloves:'equip_armor',pants:'equip_armor',cape:'equip_armor'\};/);
  assert.match(gameHtml, /function playEquipSfx\(item\)\{[\s\S]*?playSample\(_equipSfx,\.42,_r\(1,\.04\)\);[\s\S]*?if\(item\.rarity>=2\)playSample\('equip_rare',\.28,_r\(1,\.03\)\);/);
  assert.match(gameHtml, /recalcSt\(\);\s*playEquipSfx\(item\);\s*notify\(_T\(item\.name\)\+_T\(' 장착!'\)\);/);
  assert.match(gameHtml, /INV\.equipped\[_autoSlot\]=item;item\.slot=_autoSlot;\s*playItemPickupSfx\(item\);playEquipSfx\(item\);/);
  assert.match(gameHtml, /INV\.equipped\[craftSlot\]=item;\s*SFX\.pickup\(\);playEquipSfx\(item\);/);
});
