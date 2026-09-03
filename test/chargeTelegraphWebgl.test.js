import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('8-direction WebGL enemies retain the charge guide during eChargeWind', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  const eightDirStart = game.indexOf("if(e._mob8dir&&e._mobCh){");
  const atlasPathStart = game.indexOf("if(!_atlasEReady||!_atlasE)continue;", eightDirStart);
  assert.ok(eightDirStart >= 0, '8-direction WebGL path exists');
  assert.ok(atlasPathStart > eightDirStart, '8-direction path ends before atlas path');
  const eightDirPath = game.slice(eightDirStart, atlasPathStart);

  assert.match(eightDirPath, /if\(e\.s==='eChargeWind'&&e\._chgAimMax>0\)\{/);
  assert.match(eightDirPath, /_drawChargeTele\(X,e,sa\)/);
});

test('monster charge guide uses distinct START BODY END artwork', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  for (const asset of ['charge_start_rift.png', 'charge_body_mist.png', 'charge_end_spear.png']) {
    assert.ok(existsSync(path.join(rootDir, 'assets/vfx/enemy', asset)), `${asset} exists`);
    assert.match(game, new RegExp(`assets/vfx/enemy/${asset.replace('.', '\\.')}`));
  }
});

test('three-part layout preserves charge length and the existing guide width', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  const layoutStart = game.indexOf('function _getChargeTeleLayout(e){');
  const layoutEnd = game.indexOf('function _drawChargeTele(', layoutStart);
  assert.ok(layoutStart >= 0, 'charge telegraph layout helper exists');
  assert.ok(layoutEnd > layoutStart, 'charge telegraph layout helper is extractable');

  const layoutSource = game.slice(layoutStart, layoutEnd);
  const getLayout = Function(`${layoutSource}; return _getChargeTeleLayout;`)();
  const base = { st2: 90, _chgAimMax: 90, _chgVisLen: 800, _chgLen: 800, r: 30 };
  const start = getLayout(base);
  const fadedIn = getLayout({ ...base, st2: 60 });
  const middle = getLayout({ ...base, st2: 45 });

  assert.equal(middle.length, 800, 'BODY and END use the wall-clipped charge length');
  assert.equal(middle.bodyWidth, 51, 'BODY preserves the existing e.r × 1.7 guide width');
  assert.equal(middle.endX, 800, 'END is anchored at the dash destination');
  assert.equal(middle.startX, 0, 'START is anchored at the monster center');
  assert.equal(start.fade, 0, 'telegraph begins transparent');
  assert.equal(fadedIn.fade, 1, 'fade-in completes in 30 frames / 0.5 seconds');
  assert.equal(middle.bodyAlpha, 0.27, 'BODY becomes slightly stronger while remaining inside the requested 0.18–0.28 band');
  assert.equal(middle.energyAlpha, 0.11, 'the center flow gains contrast without becoming a solid fill');
  assert.equal(middle.startAlpha, 0.56, 'START remains readable beneath the monster without becoming bright red');
  assert.equal(middle.endAlpha, 0.7, 'END remains the brightest directional part');
  assert.equal(middle.edgeBaseAlpha, 0.62, 'edge cracks gain a small contrast increase');
  assert.ok(middle.edgeAlpha >= 0.5 && middle.edgeAlpha <= 0.65,
    'edge crack pulse stays inside the requested 0.50–0.65 band');
  assert.ok(middle.startSize >= 35 && middle.startSize <= 50);
  assert.ok(middle.endSize >= 45 && middle.endSize <= 65);
});

test('only BODY stretches while START and END retain their image ratios', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  const drawStart = game.indexOf('function _drawChargeTele(');
  const drawEnd = game.indexOf('// ── 공통: 색상 파서', drawStart);
  const draw = game.slice(drawStart, drawEnd);

  assert.match(draw, /_startW=_startH\*\(_start\.naturalWidth\/_start\.naturalHeight\)/);
  assert.match(draw, /X\.drawImage\(_start,-_startW\/2,-_startH\/2,_startW,_startH\)/);
  assert.match(draw, /X\.drawImage\(_body,0,-_cgW\/2,_cgL,_cgW\)/);
  assert.match(draw, /_endW=_endH\*\(_end\.naturalWidth\/_end\.naturalHeight\)/);
  assert.match(draw, /X\.drawImage\(_end,_cgL-_endW\/2,-_endH\/2,_endW,_endH\)/);
  assert.doesNotMatch(draw, /fillRect\(/, 'the telegraph must not fall back to an opaque rectangle');
});

test('charge AI, distance, sweep hitbox, and damage contracts remain unchanged', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /const _chgLock=\(e\._chgAimMax\|\|60\)\*\.755/);
  assert.match(game, /let _vl=e\._chgLen\|\|100;for\(let _ct=e\.r;_ct<_vl;_ct\+=12\)/);
  assert.match(game, /if\(e\.st2<=0\)\{e\.s='eCharge';e\.st2=e\._chgDur\|\|20;e\._chgVisLen=null\}/);
  assert.match(game, /dst\(P\.x,P\.y,_scx,_scy\)<P\.r\+e\.r\+18/);
  assert.match(game, /hurtP\(~~\(e\.atk\*30\*elMul/);
});
