import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('registered chapter 1 void wall asset exists in the served project tree', () => {
  assert.equal(
    existsSync(new URL('../assets/map/ch1/wall_black_void_tile.png', import.meta.url)),
    true
  );
});

test('chapter 1 caches the void wall tile as the fallback wall texture', () => {
  assert.match(
    gameHtml,
    /'gt_void_wall':'assets\/map\/ch1\/wall_black_void_tile\.png'/
  );
  assert.match(
    gameHtml,
    /const _voidWallImg=hell===0\?_GROUND_TILES\['gt_void_wall'\]:null;[\s\S]*else if\(_hasVoidWall\)\{[\s\S]*if\(map\[ty\]\[tx\]!==1\)continue;[\s\S]*c\.drawImage\(_voidWallImg,px-_wx0,py-_wy0,_tileSz,_tileSz\);/
  );
});

test('void wall tiles are not overwritten by the fallback black wall fill', () => {
  assert.match(
    gameHtml,
    /else if\(v===1&&G\.stage!==4&&!_hasVoidWall&&!\(hell===0&&_skullWallPat\)\)\{[\s\S]*c\.fillStyle='#000000';c\.fillRect\(lx,ly,T,T\)[\s\S]*else if\(v===3\)\{c\.fillStyle='#000000';c\.fillRect\(lx,ly,T,T\)\}/
  );
});

test('void wall tile reloads the map cache when it finishes loading', () => {
  assert.match(
    gameHtml,
    /img\.onload=\(\)=>\{console\.log\('\[GT\] '\+id\+' loaded'\);if\(G&&G\.map\)_queueMapCacheRefresh\(\)\};/
  );
});
