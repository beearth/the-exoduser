import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function loadAudioContextController() {
  const start = gameHtml.indexOf('let _actx=null,_actxResumed=false');
  const end = gameHtml.indexOf('function sfxVol()', start);
  assert.notEqual(start, -1, 'audio context controller start should exist');
  assert.notEqual(end, -1, 'audio context controller end should exist');

  const listeners = new Map();
  let resolveResume;
  class FakeAudioContext {
    constructor() {
      this.state = 'suspended';
      this.resumeCalls = 0;
    }
    resume() {
      this.resumeCalls++;
      return new Promise((resolve) => {
        resolveResume = () => {
          this.state = 'running';
          resolve();
        };
      });
    }
  }
  const document = {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };
  const window = { AudioContext: FakeAudioContext };
  const factory = new Function(
    'window',
    'document',
    'setInterval',
    'clearInterval',
    'IS_MOBILE',
    'listeners',
    `${gameHtml.slice(start, end)}\nreturn { actx, resume: _resumeAudioCtx, listeners, getContext: () => _actx };`,
  );
  const api = factory(window, document, () => 1, () => {}, false, listeners);
  return { api, listeners, resolve: () => resolveResume?.() };
}

test('audio recovery waits for the first user gesture and coalesces a pending resume', async () => {
  const { api, listeners, resolve } = loadAudioContextController();
  const context = api.actx();

  api.resume(false);
  assert.equal(context.resumeCalls, 0, 'background recovery must not fight autoplay policy');

  const gesture = listeners.get('pointerdown');
  assert.equal(typeof gesture, 'function');
  gesture();
  gesture();
  assert.equal(context.resumeCalls, 1, 'one pending resume promise is enough');

  resolve();
  await new Promise((done) => setImmediate(done));
  context.state = 'suspended';
  api.resume(false);
  assert.equal(context.resumeCalls, 2, 'an already-unlocked context may recover in the background');
});

test('the per-frame SFX reset routes suspended recovery through the guarded resume helper', () => {
  const start = gameHtml.indexOf('function _sfxFrameReset()');
  const end = gameHtml.indexOf('const _SILVERTAIL_VOICE_MAP=', start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  const source = gameHtml.slice(start, end);

  assert.match(source, /if\(_actx&&_actx\.state==='suspended'\)_resumeAudioCtx\(false\);/);
  assert.doesNotMatch(source, /_actx\.resume\(\)/);
});
