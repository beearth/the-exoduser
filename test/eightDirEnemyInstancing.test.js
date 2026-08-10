import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const browserVerifier = readFileSync(new URL('../tools/verify_eightdir_enemy_instancing_browser.mjs', import.meta.url), 'utf8');

test('batches eight-direction enemy idle and walk atlas frames by texture bucket', () => {
  assert.match(
    gameHtml,
    /const _ENS8_GL_DIRS=\['south','south-east','east','north-east','north','north-west','west','south-west'\];[\s\S]*?const _ENS8_GL_GROUPS=16;[\s\S]*?const _ens8GLCpu=new Float32Array\(_ENS8_GL_GROUPS\*_ENS_GL_MAX\*_ENS_GL_STRIDE\);/,
  );
  assert.match(
    gameHtml,
    /function _queueEnemy8DirInstanced\([\s\S]*?function _drawEnemy8DirInstanced\(/,
  );
});

test('uses the eight-direction GPU batch before retaining the Canvas sprite fallback', () => {
  assert.match(
    gameHtml,
    /if\(e\._mob8dir&&e\._mobCh\)[\s\S]*?_queueEnemy8DirInstanced\([\s\S]*?e\._ensGLMode=1/,
  );
  assert.match(
    gameHtml,
    /const _ensGLQueued=e\._ensGLMode\|\|0;[\s\S]*?let _eDrew=!!_ensGLQueued;/,
  );
});

test('keeps room for the walk overlay of every capped eight-direction enemy', () => {
  assert.match(gameHtml, /const _ENS8_GL_MAX=_ENS_GL_MAX\*2;/);
  assert.match(gameHtml, /_ens8GLTotal>=_ENS8_GL_MAX/);
});

test('reports eight-direction instance and texture-bucket draw counts in the perf log', () => {
  assert.match(gameHtml, /_dbgEns8GLDraws\+\+/);
  assert.match(gameHtml, /e8:'\+_dbgEns8GL\+'@'\+_dbgEns8GLDraws/);
});

test('keeps a 512-enemy idle-and-walk WebGL2 batch verification scenario', () => {
  assert.match(browserVerifier, /const COUNT=512;/);
  assert.match(browserVerifier, /sprites !== COUNT\*2/);
  assert.match(browserVerifier, /draws !== 16/);
});
