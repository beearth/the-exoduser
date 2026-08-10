import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('world drops keep a readable inventory skin in front of a subdued item-pillar without floating item-name text', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  const itemStart = game.indexOf("else if(it.type==='item'){");
  const itemEnd = game.indexOf("else if(it.type==='chest'){", itemStart);
  const potionStart = game.indexOf("else if(it.type==='potion'){");
  const potionEnd = game.indexOf("else if(it.type==='item'){", potionStart);
  const itemDraw = game.slice(itemStart, itemEnd);
  const potionDraw = game.slice(potionStart, potionEnd);

  assert.ok(itemStart >= 0 && itemEnd > itemStart, 'equipment drop draw branch is present');
  assert.ok(potionStart >= 0 && potionEnd > potionStart, 'potion drop draw branch is present');
  assert.match(game, /function _maskWorldDropBlack\(canvas\)/);
  assert.match(game, /function _itemSkinSrc\(base,el\)[\s\S]*output\/imagegen\/item-skins\//);
  assert.match(game, /function _worldItemSkin\(it\)[\s\S]*const src=_itemSkinSrc\(base,el\);/);
  assert.match(game, /img\._worldDropMasked=_maskWorldDropBlack\(canvas\);/);
  assert.match(itemDraw, /const _dropSz=34;const _skin=_worldItemSkin\(item\);/);
  assert.match(itemDraw, /const _dropX=it\.x-_dropSz\*\.58,_dropY=it\.y\+b-_dropSz\*\.82;/);
  assert.match(itemDraw, /X\.drawImage\(_skin,_dropX-_dropSz\/2,_dropY-_dropSz\/2,_dropSz,_dropSz\);/);
  assert.doesNotMatch(itemDraw, /X\.fillRect\(it\.x-_dropSz/);
  assert.doesNotMatch(itemDraw, /globalCompositeOperation='screen'/);
  assert.doesNotMatch(itemDraw, /fillText\(_T\(item\.name\)/);
  assert.doesNotMatch(potionDraw, /fillText\(_T\(pt\.name\)/);
});

test('equipment drops alternate two centered item-pillar frames without lateral motion', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  await Promise.all([
    'img/fx/world_item_drop_beams_source08_01.png',
    'img/fx/world_item_drop_beams_source08_02.png',
  ].map((asset) => access(path.join(rootDir, asset))));
  const itemStart = game.indexOf("else if(it.type==='item'){");
  const itemEnd = game.indexOf("else if(it.type==='chest'){", itemStart);
  const itemDraw = game.slice(itemStart, itemEnd);
  assert.match(game, /const _worldDropFx=\['img\/fx\/world_item_drop_beams_source08_01\.png','img\/fx\/world_item_drop_beams_source08_02\.png'\]\.map\(src=>\{const img=new Image\(\);img\.src=src;return img;\}\);/);
  assert.match(game, /const _worldDropFxTiles=\[\[\],\[\]\];/);
  assert.match(game, /const _WORLD_DROP_FX_COLS=2,_WORLD_DROP_FX_ROWS=2;/);
  assert.match(game, /const _srcW=Math\.floor\(img\.naturalWidth\/_WORLD_DROP_FX_COLS\),_srcH=Math\.floor\(img\.naturalHeight\/_WORLD_DROP_FX_ROWS\);/);
  assert.match(game, /const _pillarFrame=~~\(\(_now\/180\+it\.x\)%2\);/);
  assert.match(game, /const _fx=_worldDropFxTile\(_pillarFrame,_fxTile\);/);
  assert.match(itemDraw, /const _fxDrawW=60,_fxDrawH=160;/);
  assert.match(itemDraw, /X\.globalAlpha=\.46\+Math\.sin\(_now\/400\+it\.x\)\*\.05;/);
  assert.match(itemDraw, /const _fxTile=\[0,1,2,3,3,3\]\[item\.rarity\];/);
  assert.match(itemDraw, /if\(_fx\)X\.drawImage\(_fx,it\.x-_fxDrawW\/2,it\.y\+b-_fxDrawH,_fxDrawW,_fxDrawH\);/);
});
