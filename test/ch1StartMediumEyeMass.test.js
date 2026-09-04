import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function pngSize(path) {
  const data = readFileSync(path);
  assert.equal(data.subarray(1, 4).toString('ascii'), 'PNG', `${path} must be a PNG`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

test('CH1-1 owns both supplied eye-mass sheets with valid grid layouts', () => {
  const idlePath = new URL('../img/ch1_1_medium_01_source.png', import.meta.url);
  const actionPath = new URL('../img/ch1_1_medium_02_source.png', import.meta.url);
  assert.ok(existsSync(idlePath), 'the supplied eight-frame idle sheet must ship with the game');
  assert.ok(existsSync(actionPath), 'the supplied 32-frame action sheet must ship with the game');

  const idle = pngSize(idlePath);
  const action = pngSize(actionPath);
  assert.ok(idle.width >= 1200 && idle.height >= 1200,
    'the supplied idle source must retain its full-resolution two-row sheet');
  assert.ok(action.width >= 1400 && action.height >= 1000,
    'the supplied action source must retain its full-resolution four-row sheet');

  assert.match(gameHtml, /const _CH1_START_MEDIUM_SHEETS=\{idle:'img\/ch1_1_medium_01_source\.png',action:'img\/ch1_1_medium_02_source\.png'\}/,
    'runtime must load the exact supplied files');
  assert.match(gameHtml, /function _drawCh1StartMediumEyeMass\(/,
    'the authored monster needs its own two-sheet renderer');
  assert.match(gameHtml, /if\(e\._ch1StartMedium&&_ch1StartMediumReady\.idle\)\{\s*_eDrew=_drawCh1StartMediumEyeMass\(X,e,_now,sa\);/,
    'the runtime enemy pass must draw the supplied sheets instead of the generic atlas');
});

test('CH1-1 starts with a two-monster eye-mass encounter outside the bonfire sanctuary', () => {
  assert.match(gameHtml, /const _CH1_START_MEDIUM_SPAWNS=\[\{dx:-13,dy:-18\},\{dx:13,dy:-21\}\]/,
    'the encounter must have two authored start-relative positions');
  assert.match(gameHtml, /function _spawnCh1StartMediumEyeMasses\(si\)[\s\S]*?if\(si!==0\)return;[\s\S]*?const startX=P\.x\/T,startY=P\.y\/T;[\s\S]*?mkEn\(\(startX\+spawn\.dx\)\*T,\(startY\+spawn\.dy\)\*T,si,4,false,EL\.D,-1\)[\s\S]*?_ch1StartMedium=true[\s\S]*?elite=0;eyeMass\.mods=\[\];eyeMass\.aura=null/,
    'the pair must use the medium tank combat body and opt into the custom renderer');
  assert.match(gameHtml, /if\(si===0\)_spawnCh1StartMediumEyeMasses\(si\);/,
    'the encounter must be created only for CH1-1 after its normal spawn pass');

  for (const spawn of [{ dx: -13, dy: -18 }, { dx: 13, dy: -21 }]) {
    assert.ok(Math.hypot(spawn.dx, spawn.dy) * 40 > 500,
      'every eye mass must remain beyond the 500px START safety radius');
  }
});
