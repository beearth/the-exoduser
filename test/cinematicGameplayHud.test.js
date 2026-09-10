import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('gameplay HUD reserves the center and only presents compact edge information', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /<div id="areaTitle"[^>]*>[\s\S]*id="areaTitleKr"[\s\S]*id="areaTitleEn"/);
  assert.match(game, /#areaTitle\.show\s*\{[\s\S]*animation:\s*hudAreaTitle\s+3(?:\.\d+)?s/);
  assert.match(game, /<div id="stageProgress"[^>]*>\s*<div id="stageProgressFill"><\/div>/);
  assert.match(game, /#stageProgressFill\s*\{[\s\S]*transition:\s*width\s+\.6s/);
  assert.match(game, /id="stageTimerHud"[^>]*>00:00<\/div>/);
  assert.doesNotMatch(game, /id="stageTimerHud"[^\n]*>[^<]*TIME/);
});

test('centered resources stay compact while malice uses readable full numbers', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /id="spCnt"[^>]*>✦ 0<\/div>/);
  assert.match(game, /id="cpHud"[^>]*>◇ 0<\/div>/);
  assert.match(game, /id="killCnt"[^>]*>0 \/ 0<\/div>/);
  assert.match(game, /function _hudCompactNumber\(n\)[\s\S]*1e6[\s\S]*\.toFixed\(2\)\+'M'/);
  assert.match(game, /_hudReadableNumber\(G\.mats\)/);
  assert.doesNotMatch(game, /<div[^>]*>KILL<\/div>/);
});

test('top resources use the centered lane below the timer so they never overlap the top-left minimap', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /\.hud-top\s*\{[\s\S]*top:\s*calc\(var\(--ui-inset-top\) \+ env\(safe-area-inset-top, 0px\) \+ 32px\)[\s\S]*left:\s*50%[\s\S]*transform:\s*translateX\(-50%\) scale\(var\(--ui-scale\)\)[\s\S]*transform-origin:\s*top center/);
  assert.match(game, /#stageClock\s*\{[\s\S]*top:\s*calc\(var\(--ui-inset-top\) \+ env\(safe-area-inset-top, 0px\) \+ 7px\)/);
  assert.match(game, /#mmWrap\s*\{[\s\S]*top:\s*8px[\s\S]*left:\s*8px/);
  assert.doesNotMatch(game, /\.hud-top\s*\{[^}]*left:\s*calc\(var\(--ui-inset-top\)/);
});

test('centered resource readout has no panel frame or ornamental separators', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /\/\* ══ GLOBAL UI REDESIGN LAYER ══ \*\/[\s\S]*\.hud-top\s*\{[\s\S]*padding:\s*0[\s\S]*border:\s*none[\s\S]*border-radius:\s*0[\s\S]*background:\s*none[\s\S]*box-shadow:\s*none/);
  assert.match(game, /\.hud-resource\+\.hud-resource\s*\{\s*border-left:\s*none\s*\}/);
  assert.match(game, /\.hud-resource::before\s*\{\s*content:\s*none\s*\}/);
});

test('right HUD labels every value and spells out large numbers', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  for (const [id,label] of [['hudLevelLabel','레벨'],['hudExpLabel','경험치'],['hudKillLabel','지역 처치'],['hudMaliceLabel','악의']]) {
    assert.match(game,new RegExp(`id="${id}"[^>]*>${label}</span>`));
    assert.ok(game.includes(`_hset($('${id}'),'text',_L(`),'labels use localization');
  }
  assert.doesNotMatch(game, /class="objective-frame"[^>]*aria-hidden="true"/);
  assert.match(game, /<span id="lvLbl">1<\/span>/);
  assert.match(game, /_hset\(_et,'text',_hudReadableNumber\(P\.exp\)\+' \/ '\+_hudReadableNumber\(P\.maxExp\)\)/);
  const formatter=game.match(/function _hudReadableNumber\(n\)\{[^\n]+\}/)[0];
  const format=Function('_hudNumberFormatter',`${formatter};return _hudReadableNumber`)(new Intl.NumberFormat('en-US',{maximumFractionDigits:0}));
  assert.equal(format(6600000),'6,600,000');
  assert.equal(format(1100),'1,100');
  assert.equal(format(4000),'4,000');
});
