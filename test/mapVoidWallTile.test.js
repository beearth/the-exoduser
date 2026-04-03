import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('stage 1 (1_2 map) loads and paints the black void wall tile on wall cells', () => {
  assert.match(
    gameHtml,
    /'gt_void_wall':'assets\/map\/ch1\/wall_black_void_tile\.png'/
  );
  assert.match(
    gameHtml,
    /const _voidWallImg=G\.stage===1\?_GROUND_TILES\['gt_void_wall'\]:null;[\s\S]*for\(let ty=0;ty<mh;ty\+\+\)for\(let tx=0;tx<mw;tx\+\+\)\{if\(map\[ty\]\[tx\]===1\)c\.rect\(tx\*T,ty\*T,T,T\)\}[\s\S]*c\.drawImage\(_voidWallImg,Math\.floor\(px\),Math\.floor\(py\),_tileSz,_tileSz\);/
  );
});

test('void wall tiles are not overwritten by the fallback black wall fill', () => {
  assert.match(
    gameHtml,
    /else if\(v===1&&!_hasVoidWall\)\{c\.fillStyle='#000000';c\.fillRect\(tx\*T,ty\*T,T,T\);\}\s*else if\(v===3\)\{c\.fillStyle='#000000';c\.fillRect\(tx\*T,ty\*T,T,T\);\}/
  );
});

test('void wall tile reloads the map cache when it finishes loading', () => {
  assert.match(
    gameHtml,
    /img\.onload=\(\)=>\{console\.log\('\[GT\] '\+id\+' loaded'\);if\(\(id==='gt_soil'\|\|id==='gt_void_wall'\)&&G\.map\)buildMapCache\(\)\};/
  );
});
