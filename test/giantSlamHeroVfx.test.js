import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

const sheets = [
  ['Hell Slam I', new URL('../assets/vfx/giant_slam_impact_sheet.png', import.meta.url)],
  ['Hell Slam II', new URL('../assets/vfx/inferno_slam_impact_sheet.png', import.meta.url)],
];

for (const [label, sheetUrl] of sheets) {
  test(`${label} hero VFX sheet is a transparent 2x2 production asset`, async () => {
    const sheetPath = fileURLToPath(sheetUrl);
    assert.equal(existsSync(sheetPath), true, `${label} sheet must exist`);
    const meta = await sharp(sheetPath).metadata();
    assert.equal(meta.width, 1024);
    assert.equal(meta.height, 1024);
    assert.equal(meta.hasAlpha, true);
    assert.equal(meta.channels, 4);

    const { data, info } = await sharp(sheetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparent = 0;
    let visible = 0;
    for (let i = 3; i < data.length; i += info.channels) {
      if (data[i] === 0) transparent++;
      if (data[i] >= 160) visible++;
    }
    const pixels = info.width * info.height;
    assert.ok(transparent > pixels * 0.2, `${label} sheet needs genuine transparent space`);
    assert.ok(visible > pixels * 0.015, `${label} sheet needs enough visible impact art`);
  });
}

test('Hell Slam I selects inferno while Chain Crush keeps the giant earth impact', () => {
  assert.match(gameHtml, /giant_slam_impact_sheet\.png/);
  assert.match(gameHtml, /inferno_slam_impact_sheet\.png/);
  assert.match(gameHtml, /const _slamKind=\(srcId==='giantSlam2'&&_isFused\('infernoSlam'\)\)\?'inferno':'giant';/);
  assert.match(gameHtml, /const _slamVfxKind=srcId==='giantSlam'\?'inferno':_slamKind;/);
  assert.match(gameHtml, /kind:_slamKind,vfxKind:_slamVfxKind/);
  assert.match(gameHtml, /\(w\.vfxKind==='inferno'\|\|w\.kind==='inferno'\)\?_infernoSlamVfx:_giantSlamVfx/);
});

test('slam renderer advances all four API frames on a 2x2 grid', () => {
  assert.match(gameHtml, /const _slamFrame=Math\.min\(3,~~\(_wP\*4\)\)/);
  assert.match(gameHtml, /const _slamSx=\(_slamFrame%2\)\*512,_slamSy=~~\(_slamFrame\/2\)\*512/);
  assert.match(gameHtml, /drawImage\(_slamVfx\.img,_slamSx,_slamSy,512,512/);
});

test('Shift+left Hell Slam I layers a visible earth impact over the quake ring', () => {
  const renderer = gameHtml.slice(gameHtml.indexOf('if(G._gSlamWave&&G._gSlamWave.length>0){'), gameHtml.indexOf('// ══ 기동칼날개', gameHtml.indexOf('if(G._gSlamWave&&G._gSlamWave.length>0){')));
  assert.match(renderer, /if\(_isGSlam&&w\.kind==='giant'\)/);
  assert.match(renderer, /const _earthImpactP=Math\.min\(1,_wP\*5\)/);
  assert.match(renderer, /X\.ellipse\(w\.x,w\.y,_earthCraterR,_earthCraterR\*\.34,0,0,Math\.PI\*2\)/);
  assert.match(renderer, /for\(let _crack=0;_crack<12;_crack\+\+\)/);
});
