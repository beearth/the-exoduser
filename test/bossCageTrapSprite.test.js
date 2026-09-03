import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const sheetUrl = new URL('../assets/vfx/boss/boss_cageTrap.webp', import.meta.url);

test('bone prison collage is normalized into six unclipped 512px frames', async () => {
  const sheetPath = fileURLToPath(sheetUrl);
  const meta = await sharp(sheetPath).metadata();
  assert.equal(meta.width, 1536);
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
  assert.ok(transparent > pixels * 0.25, 'sheet must keep a genuinely transparent background');
  assert.ok(visible > pixels * 0.02, 'sheet must retain enough opaque bone-prison artwork');

  for (let frame = 0; frame < 6; frame++) {
    const cellX = (frame % 3) * 512;
    const cellY = Math.floor(frame / 3) * 512;
    let borderVisible = 0;
    let borderPixels = 0;
    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        if (x >= 8 && x < 504 && y >= 8 && y < 504) continue;
        borderPixels++;
        const alpha = data[((cellY + y) * info.width + cellX + x) * info.channels + 3];
        if (alpha >= 16) borderVisible++;
      }
    }
    assert.ok(borderVisible < borderPixels * 0.01, `frame ${frame} must not be clipped by its cell edge`);
    const cell = await sharp(sheetPath)
      .extract({ left: cellX, top: cellY, width: 512, height: 512 })
      .ensureAlpha()
      .raw()
      .toBuffer();
    assert.equal(cell.some((value, index) => index % 4 === 3 && value >= 16), true,
      `frame ${frame} must contain visible bone-prison artwork`);
  }
});

test('cageTrap renders the six-frame bone prison and keeps the procedural cage as load fallback', () => {
  assert.match(
    gameHtml,
    /registerVFX\('boss_cageTrap','assets\/vfx\/boss\/boss_cageTrap\.webp',512,512,6,3,'source-over'\)/,
  );

  const start = gameHtml.indexOf('// ══ 감옥 렌더 ══');
  const end = gameHtml.indexOf('// ══ 연쇄번개 렌더 ══', start);
  assert.ok(start >= 0 && end > start, 'missing cage trap render block');
  const cageDraw = gameHtml.slice(start, end);

  assert.match(cageDraw, /const _ctRise=Math\.min\(1,\(ct\.t-ct\.warnT\)\/36\)/);
  assert.match(cageDraw, /const _ctFr=Math\.min\(5,~~\(_ctRise\*6\)\)/);
  assert.match(cageDraw, /X\.drawImage\(_ctSh\.img,\(_ctFr%3\)\*512,~~\(_ctFr\/3\)\*512,512,512/);
  assert.match(cageDraw, /else\{\/\/ 스프라이트 로드 전 절차식 폴백/);
});
