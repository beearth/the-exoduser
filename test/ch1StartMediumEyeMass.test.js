import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function pngSize(path) {
  const data = readFileSync(path);
  assert.equal(data.subarray(1, 4).toString('ascii'), 'PNG', `${path} must be a PNG`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function opaqueComponentCount(path, cols, rows) {
  const png = PNG.sync.read(readFileSync(path));
  const cellW = png.width / cols, cellH = png.height / rows;
  const counts = [];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const seen = new Uint8Array(cellW * cellH);
    let count = 0;
    for (let y = 0; y < cellH; y++) for (let x = 0; x < cellW; x++) {
      const start = y * cellW + x;
      if (seen[start] || !png.data[((row * cellH + y) * png.width + col * cellW + x) * 4 + 3]) continue;
      count++;
      const queue = [start]; seen[start] = 1;
      for (let i = 0; i < queue.length; i++) {
        const at = queue[i], px = at % cellW, py = Math.floor(at / cellW);
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,-1],[1,-1],[-1,1]]) {
          const nx = px + dx, ny = py + dy, next = ny * cellW + nx;
          if (nx < 0 || nx >= cellW || ny < 0 || ny >= cellH || seen[next]) continue;
          if (png.data[((row * cellH + ny) * png.width + col * cellW + nx) * 4 + 3]) { seen[next] = 1; queue.push(next); }
        }
      }
    }
    counts.push(count);
  }
  return counts;
}

test('CH1-1 uses the text-free regular eight-direction four-frame sheet', () => {
  const spritePath = new URL('../img/ch1_1_eye_slime_8dir_4frame_clean.png', import.meta.url);
  assert.ok(existsSync(spritePath), 'the text-free runtime sheet must ship with the game');
  assert.deepEqual(pngSize(spritePath), { width: 1024, height: 2048 },
    'the cleaned source must repack four frames across eight directions as uniform 256px cells');

  assert.match(gameHtml, /const _CH1_START_MEDIUM_SHEETS=\{sheet:'img\/ch1_1_eye_slime_8dir_4frame_clean\.png\?v=20260905-crop-sync'\}/,
    'runtime must use the new text-free four-frame sheet through a fresh cache version');
  assert.match(gameHtml, /function _drawCh1StartMediumEyeMass\(/,
    'the authored monster needs its own sheet renderer');
  assert.match(gameHtml, /if\(e\._ch1StartMedium&&_ch1StartMediumReady\.sheet\)\{\s*_eDrew=_drawCh1StartMediumEyeMass\(X,e,_now,sa\);/,
    'the runtime enemy pass must draw the supplied sheets instead of the generic atlas');
});

test('CH1-1 maps target direction rows and four authored frame columns', () => {
  assert.match(gameHtml, /const cols=4,rows=8;/,
    'the cleaned production sheet must be sliced as four frames across eight direction rows');
  assert.match(gameHtml, /const frameCol=e\.s==='eAttack'\?1:animated\?2\+~~\(_now\/120\)%2:0;/,
    'idle uses frame 1, attack uses frame 2, and movement cycles frames 3 and 4');
  assert.match(gameHtml, /const targetFacing=P&&P\.hp>0\?Math\.atan2\(P\.y-e\.y,P\.x-e\.x\):\(e\.facing\|\|0\);/,
    'the custom path must calculate the live player-facing direction before choosing a frame');
  assert.match(gameHtml, /const _CH1_START_MEDIUM_DIRMAP=\[2,3,4,5,6,7,0,1\];/,
    'the source order north→north-east→east→south-east→south→south-west→west→north-west must map from canvas angles');
  assert.match(gameHtml, /const frame=_CH1_START_MEDIUM_DIRMAP\[direction\]\*cols\+frameCol;/,
    'every direction row must select its own current animation frame');
});

test('CH1-1 text-free runtime sheet keeps one silhouette in every source cell', () => {
  const spritePath = new URL('../img/ch1_1_eye_slime_8dir_4frame_clean.png', import.meta.url);
  assert.deepEqual(opaqueComponentCount(spritePath, 4, 8), Array(32).fill(1),
    'no neighbour fragments, numbers, captions, or backdrop may enter the cleaned runtime frames');
});

test('CH1-1 text-free runtime sheet uses binary alpha for a bright body on transparent ground', () => {
  const png = PNG.sync.read(readFileSync(new URL('../img/ch1_1_eye_slime_8dir_4frame_clean.png', import.meta.url)));
  for (let i = 3; i < png.data.length; i += 4) assert.ok(
    png.data[i] === 0 || png.data[i] === 255,
    'the cleaned sheet must not retain a dim semi-transparent presentation-board backdrop',
  );
});

test('CH1-1 centers every cleaned frame within its top and bottom alpha bounds', () => {
  const png = PNG.sync.read(readFileSync(new URL('../img/ch1_1_eye_slime_8dir_4frame_clean.png', import.meta.url)));
  for (let row = 0; row < 8; row++) for (let col = 0; col < 4; col++) {
    let minY = 256, maxY = -1;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) if (png.data[((row * 256 + y) * png.width + col * 256 + x) * 4 + 3]) {
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    assert.ok(Math.abs(minY - (255 - maxY)) <= 1,
      'each frame must be vertically centered after its precise top/bottom crop');
  }
});

test('CH1-1 renderer preserves the supplied frame aspect ratio', () => {
  assert.match(gameHtml, /const drawH=Math\.max\(240,e\.r\*7\);\s*const drawW=drawH\*\(fw\/fh\);/,
    'the supplied tall source frames must retain their natural aspect ratio at Kraken-scale height');
  assert.match(gameHtml, /X\.drawImage\(img,sx,sy,fw,fh,-drawW\/2,-drawH\/2,drawW,drawH\);/,
    'the renderer must use separate width and height values instead of a square crop');
  assert.doesNotMatch(gameHtml, /X\.drawImage\(img,sx,sy,fw,fh,-size\/2,-size\/2,size,size\);/,
    'a square destination squeezes the source and makes the monster appear cut off');
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
