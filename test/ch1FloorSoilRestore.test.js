import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('non-stream buildMapCache restores CH1 soil floor tiling before floor fallback pass', () => {
  assert.match(
    gameHtml,
    /'gt_soil':'assets\/map\/ch1\/ground_dark_soil\.png\?v=20260403-floorfix'/
  );
  assert.match(
    gameHtml,
    /const _soilImg2=_GROUND_TILES\['gt_soil'\];[\s\S]*const _hasSoil2=_soilImg2&&_soilImg2\.complete&&_soilImg2\.naturalWidth>1;[\s\S]*if\(_hasSoil2\)\{[\s\S]*if\(_v2===0\|\|_v2===4\|\|_v2===5\)c\.rect\(tx2\*T,ty2\*T,T,T\)[\s\S]*c\.drawImage\(_soilImg2,Math\.floor\(_stx\),Math\.floor\(_sty\),_tileSz2,_tileSz2\);/
  );
  assert.match(
    gameHtml,
    /if\(!_hasSoil2\)\{[\s\S]*c\.fillStyle=th\.f;c\.fillRect\(px,py,T,T\);[\s\S]*\n  \}/
  );
});

test('non-stream buildMapCache restores CH1 wall edge overlay before boss gate pass', () => {
  assert.match(
    gameHtml,
    /if\(hell===0&&_wallEdgeImg&&_wallEdgeImg\.complete&&_wallEdgeImg\.naturalWidth>0\)\{[\s\S]*const _weAR=_wallEdgeImg\.naturalHeight\/_wallEdgeImg\.naturalWidth,_weW=T\*3,_weH=~~\(_weW\*_weAR\);[\s\S]*c\.drawImage\(_wallEdgeImg,px\+T\/2-_weW\/2,py\+T\/2-_weH\/2,_weW,_weH\);[\s\S]*const _gateTiles3=\[\];/
  );
});

test('non-stream buildMapCache does not paint special tile=5 rune boundary floor', () => {
  assert.doesNotMatch(
    gameHtml,
    /const bn5=_hexRgb\(bt\.f5\);[\s\S]*if\(map\[ty\]\[tx\]!==5\)continue;[\s\S]*c\.fillStyle=bt\.f5;c\.fillRect\(px,py,T,T\);[\s\S]*c\.strokeStyle=bt\.cr\+'.06\)';c\.lineWidth=.5;c\.strokeRect\(px\+1,py\+1,T-2,T-2\);/
  );
});

test('CH1 floor decor does not paint blue translucent rectangle streaks', () => {
  assert.doesNotMatch(
    gameHtml,
    /c\.fillStyle='rgba\(80,180,240,\.06\)';[\s\S]*c\.fillRect\(px\+T\*\.2,py-T\*\.3,T\*\.6,T\*1\.3\);[\s\S]*c\.strokeStyle='rgba\(130,210,255,\.1\)';[\s\S]*c\.strokeRect\(px\+T\*\.2,py-T\*\.3,T\*\.6,T\*1\.3\);/
  );
});

test('CH1 floor decor does not paint green sprout or moss overlays', () => {
  assert.doesNotMatch(
    gameHtml,
    /if\(nearWall&&R\(\)<\.12\)\{const mx=px\+R\(\)\*T,my=py\+T-2,mh2=4\+R\(\)\*8,mw2=3\+R\(\)\*5;[\s\S]*rgba\(60,130,40,\$\{\.06\+R\(\)\*\.04\}\)[\s\S]*c\.moveTo\(mx,my\);c\.lineTo\(mx,my-mh2\);c\.stroke\(\)\}/
  );
  assert.doesNotMatch(
    gameHtml,
    /if\(R\(\)<\.03\)\{const cx=px\+R\(\)\*T,cy=py\+R\(\)\*T;[\s\S]*c\.fillStyle='rgba\(100,120,60,\.05\)';[\s\S]*c\.ellipse\(cx,cy,3\+R\(\)\*3,5\+R\(\)\*6,0,0,Math\.PI\*2\);c\.fill\(\);[\s\S]*c\.lineTo\(cx\+\(R\(\)-\.5\)\*10,py-5\);c\.stroke\(\)\}/
  );
});

test('CH1 floor does not paint green ambient radial glows', () => {
  assert.doesNotMatch(
    gameHtml,
    /if\(R\(\)<\.06\)\{const px=tx\*T,py=ty\*T;const ac=_hexRgb\(th\.ac\);const rad=20\+R\(\)\*25;[\s\S]*createRadialGradient\(px\+T\/2,py\+T\/2,0,px\+T\/2,py\+T\/2,rad\)[\s\S]*c\.fillStyle=g;c\.fillRect\(px\+T\/2-rad,py\+T\/2-rad,rad\*2,rad\*2\)\}/
  );
});
