import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const sheetUrl = new URL('../assets/vfx/bullet_black_hole_sheet.png', import.meta.url);

test('API-generated bullet black hole sheet is a normalized transparent 4x2 strip', async () => {
  const sheetPath = fileURLToPath(sheetUrl);
  const meta = await sharp(sheetPath).metadata();
  assert.equal(meta.width, 2048);
  assert.equal(meta.height, 1024);
  assert.equal(meta.hasAlpha, true);
  assert.equal(meta.channels, 4);

  const { data, info } = await sharp(sheetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0;
  let visible = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) transparent++;
    if (data[i] >= 224) visible++;
  }
  const pixels = info.width * info.height;
  assert.ok(transparent > pixels * 0.2, 'sheet must contain genuinely transparent background pixels');
  assert.ok(visible > pixels * 0.02, 'sheet must retain enough opaque black-hole artwork pixels');
});

test('bullet black hole renderer uses all eight API frames and keeps the old pentagram small as fallback', () => {
  assert.match(gameHtml, /bullet_black_hole_sheet\.png/);
  assert.match(gameHtml, /const _lvFrame=\(\(\(_now\/80\)\|0\)%8\)/);
  assert.match(gameHtml, /const _lvSx=\(_lvFrame%4\)\*512,_lvSy=\(\(_lvFrame\/4\)\|0\)\*512/);
  assert.match(gameHtml, /drawImage\(_lvImg,_lvSx,_lvSy,512,512/);
  assert.match(gameHtml, /drawImage\(_pentaRed,-_lvPentaR,-_lvPentaR,_lvPentaR\*2,_lvPentaR\*2\)/,
    'the existing fiery pentagram remains a compact loading fallback');
});
