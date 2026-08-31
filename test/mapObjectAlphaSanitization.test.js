import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PNG } from 'pngjs';

const game = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const animTreePath = new URL('../assets/map/ch1/collision/anim_tree_01.png', import.meta.url);
const dragonSkeletonPath = new URL('../img/map_dragon_skeleton.png', import.meta.url);

test('generated tree sheet with partial-alpha backdrop is sanitized before map rendering', () => {
  const png = PNG.sync.read(fs.readFileSync(animTreePath));
  let partialAlphaPixels = 0;
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i] > 0 && png.data[i] < 255) partialAlphaPixels++;
  }
  assert.ok(partialAlphaPixels > 200_000, 'fixture must reproduce the broad partial-alpha backdrop');

  assert.match(game, /function _hardAlphaSpr\(im\)/);
  assert.match(game, /id:'m_atree1'[^\n]+hardAlpha:1/);
  assert.match(game, /d\.hardAlpha\?\s*_hardAlphaSpr\(this\)/);
});

test('CH1-1 start view excludes the visibly striped animated tree sheet', () => {
  const compose = game.slice(game.indexOf('0:{hand:1,lm:[]'), game.indexOf('// CH1-1 HAND PROPS END'));
  assert.doesNotMatch(compose, /id:'m_atree1'/);
  assert.match(compose, /id:'m_skull_altar',x:82,y:181/);
});

test('dragon skeleton black plate is luminance-keyed before map rendering', () => {
  const png = PNG.sync.read(fs.readFileSync(dragonSkeletonPath));
  let broadPartialPixels = 0;
  for (let i = 3; i < png.data.length; i += 4) {
    if (png.data[i] > 0 && png.data[i] < 255) broadPartialPixels++;
  }
  assert.ok(broadPartialPixels > 800_000, 'fixture must reproduce the giant translucent plate');

  assert.match(game, /function _lumaKeySpr\(im,lo,hi\)/);
  assert.match(game, /_OBJ_SPR\['m_dragon_skeleton'\]=_lumaKeySpr\(this,16,80\)/);
});

test('full-height atmospheric foreground pillars are disabled by default', () => {
  assert.match(game, /var _ATMO_FG=false;/);
  assert.match(game, /function _atmoFgDraw\(ctx\)\{\s*if\(window\._ATMO_FG===false\)return;/);
});
