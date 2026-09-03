import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gameHtml = readFileSync(join(root, 'game.html'), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

test('화마귀 sheets exist as packed 8-frame 2x4 PNGs', () => {
  assert.ok(existsSync(join(root, 'img/fieldboss_firedevil_emerge.png')));
  assert.ok(existsSync(join(root, 'img/fieldboss_firedevil_idle.png')));
  assert.ok(existsSync(join(root, 'img/fieldboss_firedevil_dir.png')));
});

test('CH1-1 places 4 fire-devils on inner sites away from krakens and eels', () => {
  assert.match(gameHtml, /const _FD_COUNT=4/);
  assert.match(gameHtml, /const _FD_WAKE=1000/);
  assert.match(gameHtml, /const _FD_SITES=\[\[78,125\],\[125,125\],\[78,70\],\[125,70\]\]/);
  assert.match(gameHtml, /function _fdTick\(/);
  assert.match(gameHtml, /function _fdDraw\(/);
  assert.match(gameHtml, /_fdTick\(\)/);
  assert.match(gameHtml, /_fdDraw\(\)/);
});

test('화마귀 walk sheets cover all authored clock directions', () => {
  for (const h of [1, 3, 5, 6, 7, 9, 12]) {
    assert.ok(existsSync(join(root, `img/fieldboss_firedevil_walk_${h}.png`)), `walk ${h}`);
  }
  assert.match(gameHtml, /11:\{src:'img\/fieldboss_firedevil_walk_1\.png'[\s\S]{0,80}flip:true/,
    '11 oclock reuses the authored 1 oclock motion with an explicit horizontal mirror');
});

test('화마귀 facing uses all eight clock-hour walk directions', () => {
  const clockFn = gameHtml.match(/function _fdWalkClock\(dx,dy\)\{[\s\S]*?\n\}/);
  assert.ok(clockFn, '_fdWalkClock helper must exist');
  const clock = Function(`${clockFn[0]};return _fdWalkClock`)();
  assert.equal(clock(300, 0), 3, 'east = 3 oclock');
  assert.equal(clock(300, 300), 5, 'south-east = 5');
  assert.equal(clock(0, 300), 6, 'south = 6');
  assert.equal(clock(-300, 300), 7, 'south-west = 7');
  assert.equal(clock(-300, 0), 9, 'west = 9');
  assert.equal(clock(-300, -300), 11, 'north-west = 11 (sheet later)');
  assert.equal(clock(0, -300), 12, 'north = 12 (sheet later)');
  assert.equal(clock(300, -300), 1, 'north-east = 1 (sheet later)');
  assert.equal(clock(0, 0), 6, 'idle faces south');
  const faceFn = gameHtml.match(/function _fdFaceFrame\(m,px,py\)\{[\s\S]*?\n\}/);
  assert.ok(faceFn, '_fdFaceFrame helper must exist');
  const face = Function(`${clockFn[0]};${faceFn[0]};return _fdFaceFrame`)();
  const m = {x:100, y:100, t:0};
  assert.equal(face(m, 400, 100), 3);
  assert.equal(face(m, 400, 400), 5);
  assert.equal(face(m, 100, 400), 6);
  assert.equal(face(m, -50, 400), 7);
  assert.equal(face(m, -50, 100), 9);
});

test('화마귀 draw uses per-clock movement sheets and a still fallback', () => {
  const draw = sliceBetween(gameHtml, 'function _fdDrawOne(m){', 'function _atmDrawHud(){');
  assert.match(gameHtml, /fieldboss_firedevil_walk_3\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_5\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_6\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_7\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_9\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_1\.png/);
  assert.match(gameHtml, /fieldboss_firedevil_walk_12\.png/);
  assert.match(draw, /_fdWalkImg/);
  assert.match(draw, /m\._moving/);
  assert.match(draw, /_fdAnimFrame/);
  assert.match(draw, /def\.cols/);
  assert.match(draw, /def\.rows/);
  assert.match(draw, /def\.frames/);
  assert.match(draw, /def\.flip/);
  assert.match(draw, /_fdDirImg|'dir'/);
  assert.doesNotMatch(draw, /useIdle/);
});

test('화마귀 charge reuses the directional walk sheet while stationary', () => {
  const draw = sliceBetween(gameHtml, 'function _fdDrawOne(m){', 'function _atmDrawHud(){');
  assert.match(draw, /m\._moving\|\|m\.enChg>0/);
  assert.match(draw, /_fdAnimFrame\(m,def\.frames\)/);
});

test('화마귀 charge animation advances slower than movement animation', () => {
  const animFn = gameHtml.match(/function _fdAnimFrame\(m,frames\)\{[\s\S]*?\n\}/);
  assert.ok(animFn, '_fdAnimFrame helper must exist');
  const anim = Function(`${animFn[0]};return _fdAnimFrame`)();
  assert.equal(anim({enChg:1, chargeWalkT:17, walkT:99}, 8), 0);
  assert.equal(anim({enChg:1, chargeWalkT:18, walkT:99}, 8), 1);
  assert.equal(anim({enChg:0, chargeWalkT:99, walkT:5}, 4), 0);
  assert.equal(anim({enChg:0, chargeWalkT:99, walkT:6}, 4), 1);
  const tick = sliceBetween(gameHtml, 'function _fdTickOne(m){', 'function _fdDrawCharge(m){');
  assert.match(tick, /m\.chargeWalkT=0/);
  assert.match(tick, /m\.chargeWalkT=\(m\.chargeWalkT\|\|0\)\+1/);
});

test('화마귀 walks toward the player after emerging', () => {
  const tick = sliceBetween(gameHtml, 'function _fdTick(){', 'function _fdDraw(){');
  assert.match(gameHtml, /const _FD_SPD=/);
  assert.match(tick, /_FD_SPD/);
  assert.match(tick, /Math\.cos\(a\)\*_FD_SPD/);
  assert.match(tick, /m\._moving=/);
  assert.match(tick, /m\.walkT/);
});

test('화마귀 emerges from the smoke sheet instead of popping the idle body', () => {
  const tick = sliceBetween(gameHtml, 'function _fdTick(){', 'function _fdDraw(){');
  assert.match(gameHtml, /fieldboss_firedevil_emerge\.png/);
  assert.match(gameHtml, /hid:1,spawnIn:1,asleep:1/);
  assert.match(tick, /m\.asleep/);
  assert.match(tick, /m\.spawnIn=1/);
  assert.match(tick, /m\.emT=54/);
  assert.match(gameHtml, /function _fdDrawEmerge\(/);
});

test('화마귀 charge orb grows on the eyeball from the 12-frame fire-sphere sheet', () => {
  assert.ok(existsSync(join(root, 'img/fieldboss_firedevil_charge.png')));
  assert.match(gameHtml, /fieldboss_firedevil_charge\.png/);
  assert.match(gameHtml, /function _fdDrawCharge\(/);
  const draw = sliceBetween(gameHtml, 'function _fdDrawOne(m){', 'function _atmDrawHud(){');
  assert.match(draw, /_fdDrawCharge\(m\)/);
  assert.doesNotMatch(draw, /_fdTips\(m\)/);
  const eye = sliceBetween(gameHtml, 'function _fdEye(m){', 'function _fdTips(m){');
  assert.match(eye, /m\.frame/);
  const chg = sliceBetween(gameHtml, 'function _fdDrawCharge(m){', 'function _fdDraw(){');
  assert.match(chg, /_fdEye\(m\)/);
  assert.match(chg, /fr%4/);
});

test('화마귀 flying fire-sphere uses the centered 16-frame 4x4 lava-orb sheet', () => {
  assert.ok(existsSync(join(root, 'img/proj_firedevil_orb.png')));
  assert.match(gameHtml, /proj_firedevil_orb\.png/);
  assert.match(gameHtml, /function _fdDrawFly\(/);
  const fly = sliceBetween(gameHtml, 'function _fdDrawFly(p){', 'function _fdClear(){');
  assert.match(fly, /naturalWidth\/4/);
  assert.match(fly, /naturalHeight\/4/);
  assert.match(fly, /%16/);
  assert.match(fly, /fr%4/);
  assert.match(fly, /fr\/4/);
  assert.match(fly, /-dw\/2,-dh\/2,dw,dh/);
  assert.doesNotMatch(fly, /Math\.atan2\(p\.vy,p\.vx\)/);
  assert.match(fly, /_fdFlyImg/);
  assert.match(gameHtml, /if\(p\.fdEnergy\)[\s\S]{0,180}_fdDrawFly\(p\)/);
});

test('화마귀 flying fire-sphere skips the generic tadpole trail circle', () => {
  const trail = sliceBetween(gameHtml, '// 패스 0: 가시 인덱스', '// 패스 1:');
  assert.match(trail, /!p\.fdEnergy/);
  const glow = sliceBetween(gameHtml, '// 패스 1:', '// 패스 2:');
  assert.match(glow, /p\.fdEnergy/);
});

test('화마귀 fires a huge fire energy ball after a 3s tentacle charge', () => {
  assert.match(gameHtml, /const _FD_EN_CHG=180/);
  assert.match(gameHtml, /function _fdFireEnergy\(/);
  const fire = sliceBetween(gameHtml, 'function _fdFireEnergy(m){', 'function _fdDrawFly(p){');
  assert.match(fire, /el:EL\.F/);
  assert.match(fire, /sz:48/);
  assert.match(fire, /r:18/);
  assert.match(fire, /fdEnergy:true/);
  assert.match(gameHtml, /elemBall:true/);
});

test('화마귀 energy ball flies straight, a bit faster, on a 3s attack cadence', () => {
  const fire = sliceBetween(gameHtml, 'function _fdFireEnergy(m){', 'function _fdDrawFly(p){');
  const one = sliceBetween(gameHtml, 'function _fdTickOne(m){', 'function _fdDrawCharge(m){');
  assert.match(fire, /vx:Math\.cos\(a\)\*6/);
  assert.doesNotMatch(fire, /homing:true/);
  assert.match(one, /m\.shotCd=_FD_EN_CHG/);
  assert.doesNotMatch(one, /shotCd=1200/);
  assert.doesNotMatch(one, /shotCd<=0&&!\(m\.enChg>0\)&&!\(m\.burst>0\)/);
  assert.match(one, /if\(!\(m\.tpCd>0\)\)m\.tpCd=600/);
});

test('화마귀 teleport shrinks at the old spot and grows from the smallest emerge frame at the destination', () => {
  const tick = sliceBetween(gameHtml, 'function _fdTickOne(m){', 'function _fdDraw(){');
  const draw = sliceBetween(gameHtml, 'function _fdDrawOne(m){', 'function _atmDrawHud(){');
  const start = tick.match(/if\(m\.tpCd===0\)\{[\s\S]*?else m\.tpCd=600;/);
  assert.ok(start, 'tp start block');
  assert.doesNotMatch(start[0], /m\.x=m\.tpX/, 'must stay at old spot while shrinking');
  const land = sliceBetween(tick, 'if(m.emT===0){', 'return;');
  assert.match(land, /m\.x=m\.tpX/, 'snap to dest after emerge');
  assert.match(draw, /_fdDrawEmerge\([^;]*m\.tpX/, 'grow at destination');
  assert.match(draw, /_fdDrawEmerge\([^;]*m\.x/, 'shrink at old spot');
  assert.match(draw, /7-Math\.min\(7,\(prog\*8\)\|0\)/, 'old spot plays emerge 7→0');
  assert.match(draw, /m\.spawnIn[\s\S]{0,80}Math\.min\(7,\(prog\*8\)\|0\)/, 'first spawn and dest grow 0→7');
});

test('화마귀 death capture maps clock facing back to the legacy direction sheet', () => {
  const capture = sliceBetween(gameHtml, 'function _fmDrawSpriteTo(', 'function _fmDeathFx(');
  assert.match(capture, /m\._fmKind==='fd'[\s\S]*?_fdDirFrame\(m\.frame\)/);
});

test('hurt/death kit includes 화마귀 as a field mob', () => {
  assert.match(gameHtml, /G\._fireDevils/);
  assert.match(gameHtml, /_fmKind:'fd'/);
  const hurt = sliceBetween(gameHtml, 'function _hurtFieldMobs(', 'function _parryHomingTarget(');
  assert.match(hurt, /G\._fireDevils/);
  assert.match(gameHtml, /화마귀/);
});
