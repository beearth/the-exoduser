import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('CH1 uses only the six user-provided deco cuts with aspect-ratio rendering', () => {
  for (const file of [
    'provided_gore_01.png',
    'provided_gore_02.png',
    'provided_gore_03.png',
    'provided_gore_04.png',
    'provided_gore_05.png',
    'provided_gore_06.png',
  ]) {
    assert.match(gameHtml, new RegExp(file.replace('.', '\\.')));
  }
  assert.match(
    gameHtml,
    /'m_usergore1':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore2':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore3':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore4':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore5':\{sz:\d+,keepAR:1\}[\s\S]*'m_usergore6':\{sz:\d+,keepAR:1\}/
  );
});

test('CH1 user-provided gore deco is restricted to stages 1-4 and wall placements scale with side-wall count', () => {
  assert.match(
    gameHtml,
    /const _chDecoRaw=_CH_DECO\[hell\];[\s\S]*const _chDeco=_chDecoRaw\?\.filter\(d=>\(!d\.stageMin\|\|G\.stage>=d\.stageMin\)&&\(!d\.stageMax\|\|G\.stage<=d\.stageMax\)\)\|\|\[\];/
  );
  assert.match(
    gameHtml,
    /const _providedFloorDeco=_chDeco\.filter\(d=>d\.userProvided&&d\.floorMount\);[\s\S]*const _providedWallDeco=_chDeco\.filter\(d=>d\.userProvided&&d\.wallMount\);[\s\S]*const _providedFloorTarget=Math\.min\(4,_providedFloorDeco\.length\?4:0\);[\s\S]*if\(_providedWallDeco\.length>0\)\{[\s\S]*const _providedWallTarget=Math\.max\(2,~~\(_wallCells\.length\/40\)\);/
  );
});

test('CH1 wall-mounted user deco is inset into the wall and rendered bottom-anchored', () => {
  assert.match(
    gameHtml,
    /'m_usergore1'.*floorMount:1,wallMount:1[\s\S]*'m_usergore6'.*floorMount:1,wallMount:1[\s\S]*_wallCells\.push\(\{x,y,ox,oy\}\);[\s\S]*const cell=_wallCells\[ci\];[\s\S]*const px=cell\.x\*T\+T\/2\+cell\.ox,py=cell\.y\*T\+T\/2\+cell\.oy;[\s\S]*MAP_OBJS\.push\(\{type:pick\.id,x:px,y:py,hell,_anchorBottom:1\}\);[\s\S]*if\(mo\._anchorBottom\|\|_meta\.anchorBottom\)X\.drawImage\(_spr,mo\.x-_dw\/2,mo\.y-_dh,_dw,_dh\);/
  );
});

test('CH1 user-provided deco selection cycles through the pool instead of pure random repeats', () => {
  assert.match(
    gameHtml,
    /function _mkProvidedCycle\(pool\)\{[\s\S]*function _nextProvided\(cyc,fallback\)\{[\s\S]*const _providedFloorCycle=_mkProvidedCycle\(_providedFloorDeco\);[\s\S]*const _providedWallCycle=_mkProvidedCycle\(_providedWallDeco\);[\s\S]*const _largeCycle=_mkProvidedCycle\(_largeDeco\);[\s\S]*const _scatterCycle=_mkProvidedCycle\(_baseDeco\.filter\(d=>d\.scatter\)\);[\s\S]*const _normalCycle=_mkProvidedCycle\(_normalDeco\.length>0\?_normalDeco:_baseDeco\);[\s\S]*pick=_nextProvided\(_providedFloorCycle,_providedFloorDeco\[0\]\);[\s\S]*pick=_nextProvided\(_providedWallCycle,_providedWallDeco\[0\]\);[\s\S]*_scPick=_nextProvided\(_scatterCycle,_scatterDeco\[0\]\)\.id;[\s\S]*_dObj=_nextProvided\(_normalCycle,_pool\[0\]\);/
  );
});

test('user-provided gore cuts remove the checker background instead of keeping an opaque rectangle', async () => {
  for (const file of [
    'provided_gore_01.png',
    'provided_gore_02.png',
    'provided_gore_03.png',
    'provided_gore_04.png',
    'provided_gore_05.png',
    'provided_gore_06.png',
  ]) {
    const filePath = fileURLToPath(new URL(`../assets/map/ch1/floor_objects/${file}`, import.meta.url));
    const { data, info } = await sharp(filePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let opaque = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) opaque++;
    const opaquePct = opaque / (info.width * info.height);
    assert.ok(
      opaquePct < 0.6,
      `${file} still keeps too much opaque background: ${(opaquePct * 100).toFixed(2)}%`
    );
  }
});
