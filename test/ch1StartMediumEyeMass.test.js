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

test('CH1-1 owns the cleaned Eye Slime 8-direction three-row sheet', () => {
  const spritePath = new URL('../img/ch1_1_eye_slime_8dir_3row_clean.png', import.meta.url);
  assert.ok(existsSync(spritePath), 'the cleaned Eye Slime sheet must ship with the game');

  const sprite = pngSize(spritePath);
  assert.equal(sprite.width, 2048, 'the production source retains its eight 256px columns');
  assert.equal(sprite.height, 768, 'the production source retains its three authored 256px animation rows');

  assert.match(gameHtml, /const _CH1_START_MEDIUM_SHEETS=\{sheet:'img\/ch1_1_eye_slime_8dir_3row_clean\.png'\}/,
    'runtime must load the alpha-cleaned single production sheet');
  assert.match(gameHtml, /function _drawCh1StartMediumEyeMass\(/,
    'the authored monster needs its own sheet renderer');
  assert.match(gameHtml, /if\(e\._ch1StartMedium&&_ch1StartMediumReady\.sheet\)\{\s*_eDrew=_drawCh1StartMediumEyeMass\(X,e,_now,sa\);/,
    'the runtime enemy pass must draw the supplied sheets instead of the generic atlas');
});

test('CH1-1 maps idle, walk, and attack states to the three cleaned rows', () => {
  assert.match(gameHtml, /const cols=8,rows=3;/,
    'the cleaned production sheet must be sliced as eight columns by three rows');
  assert.match(gameHtml, /const row=!animated\?0:e\.s==='eAttack'\?2:1;/,
    'idle, walk, and attack must select their authored rows without time-based cross-row crops');
  assert.match(gameHtml, /const frame=row\*cols\+Math\.round\(/,
    'every row must use the entity facing to choose its eight-direction frame');
});

test('CH1-1 has exactly one connected monster silhouette in every 8-direction cell', () => {
  const spritePath = new URL('../img/ch1_1_eye_slime_8dir_3row_clean.png', import.meta.url);
  assert.deepEqual(opaqueComponentCount(spritePath, 8, 3), Array(24).fill(1),
    'cross-row remnants and detached neighbor fragments must not survive in a runtime frame');
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
