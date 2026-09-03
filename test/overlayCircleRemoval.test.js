import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

test('kraken teleport draw has no destination fill/stroke circle', () => {
  const draw = sliceBetween(gameHtml, 'function _fbDrawOne(fb){', 'if(fb.hid)return');
  assert.match(draw, /if\(fb\.tpT>0\)/);
  assert.match(draw, /_fbDrawVanishFrame/);
  assert.doesNotMatch(draw, /X\.arc\(_mx,_my/);
  assert.doesNotMatch(draw, /_wr=fb\.r\+70/);
});

test('generic teleport telegraph draw has no body or dest circles', () => {
  const block = sliceBetween(gameHtml, '// ── 일반몹 순간이동 전조', '// ── 텔포 도착 임펙트');
  assert.doesNotMatch(block, /X\.arc\(/);
});

test('teleport arrival flash draw has no expanding circles', () => {
  const block = sliceBetween(gameHtml, '// ── 텔포 도착 임펙트', '// ── 순간이동 준비');
  assert.doesNotMatch(block, /X\.arc\(/);
});

test('boss teleport prep/warn draw has no destination circles', () => {
  const prep = sliceBetween(gameHtml, '// ── 순간이동 준비: 목적지 경고 원', '// ── 순간이동 체공: 착지 경고 원');
  const warn = sliceBetween(gameHtml, '// ── 순간이동 체공: 착지 경고 원', "if(e.s==='bossShockWind')");
  assert.doesNotMatch(prep, /X\.arc\(/);
  assert.doesNotMatch(warn, /X\.arc\(/);
});

test('projectile trail does not draw tadpole head circles', () => {
  const trail = sliceBetween(gameHtml, '// 패스 0: 가시 인덱스', '// 패스 1:');
  assert.doesNotMatch(trail, /_hr\*\.75/);
  assert.doesNotMatch(trail, /올챙이 머리/);
});
