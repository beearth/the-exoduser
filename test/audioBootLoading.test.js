import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('starts SFX preload in the background instead of blocking boot completion', () => {
  assert.match(gameHtml, /const _AUDIO_LOAD_CONCURRENCY=4;/);
  assert.match(gameHtml, /setBootLoading\(92,_L\('오디오 준비\.\.\.'[\s\S]*?void _loadAudioBuffers\(\);[\s\S]*?setBootLoading\(98,_L\('게임 시작!'/);
  assert.doesNotMatch(gameHtml, /setBootLoading\(92,_L\('오디오 준비\.\.\.'[\s\S]*?await _loadAudioBuffers\(\);/);
});

test('limits background SFX decoding with reusable preload task state', () => {
  assert.match(gameHtml, /let _audioPreloadTask=null;/);
  assert.match(gameHtml, /if\(_audioPreloadTask\)return _audioPreloadTask;/);
  assert.match(gameHtml, /const _workerCount=Math\.min\(_AUDIO_LOAD_CONCURRENCY,entries\.length\);/);
});
