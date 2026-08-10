import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const browserVerifier = readFileSync(new URL('../tools/verify_vfx_gl_instancing_browser.mjs', import.meta.url), 'utf8');

test('keeps the additive VFX GPU batch at 256 instances per texture', () => {
  assert.match(gameHtml, /const _VFX_GL_MAX=256,_VFX_GL_STRIDE=9;/);
  assert.match(gameHtml, /function _queueVfxGL\([\s\S]*?_vfxGLCount>=_VFX_GL_MAX/);
  assert.match(gameHtml, /function _flushVfxGL\([\s\S]*?GL\.drawArraysInstanced/);
});

test('keeps a 256-instance single-texture WebGL2 VFX verification scenario', () => {
  assert.match(browserVerifier, /const COUNT=256;/);
  assert.match(browserVerifier, /drawn !== COUNT/);
  assert.match(browserVerifier, /glError !== 0/);
});
