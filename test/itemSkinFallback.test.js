import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('known missing element variants resolve to the available physical item skin before creating an image request', () => {
  assert.match(
    gameHtml,
    /const _ITEM_SKIN_MISSING_VARIANTS=new Set\(\['necklace_fire','cape_fire','earring_fire'\]\);/,
  );
  assert.doesNotMatch(gameHtml, /const uniq=\(it\.rarity>=5\)\?'_uniq':'';/);
});

test('every fire item skin resolves to its physical art before the browser can request a missing file', () => {
  assert.match(
    gameHtml,
    /const _ITEM_SKIN_MISSING_ELEMENTS=new Set\(\['fire'\]\);/,
  );
  assert.match(
    gameHtml,
    /function _itemSkinSrc\(base,el\)\{const variant=_ITEM_SKIN_MISSING_ELEMENTS\.has\(el\)\|\|_ITEM_SKIN_MISSING_VARIANTS\.has\(base\+'_'\+el\)\?'phys':el;/,
  );
});

test('inventory and world drops share the 404-safe item skin source rule', () => {
  assert.match(
    gameHtml,
    /function _itemSkin\(it,sz,col\)\{[\s\S]*const src=_itemSkinSrc\(base,el\);/,
  );
  assert.match(
    gameHtml,
    /function _worldItemSkin\(it\)\{[\s\S]*const src=_itemSkinSrc\(base,el\);/,
  );
});
