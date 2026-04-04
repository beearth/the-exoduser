import test from 'node:test';
import assert from 'node:assert/strict';

import { buildElevenLabsTtsRequest } from '../src/elevenlabsProxy.js';

test('buildElevenLabsTtsRequest builds url, headers, and body', () => {
  const req = buildElevenLabsTtsRequest({
    apiKey: 'eleven-key',
    voiceId: 'voice_abc',
    text: 'You have entered the void.',
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
    voiceSettings: {
      stability: 0.55,
      similarity_boost: 0.8,
    },
  });

  assert.equal(req.url, 'https://api.elevenlabs.io/v1/text-to-speech/voice_abc');
  assert.equal(req.init.method, 'POST');
  assert.equal(req.init.headers['xi-api-key'], 'eleven-key');
  assert.equal(req.init.headers.Accept, 'audio/mpeg');
  assert.equal(req.init.headers['Content-Type'], 'application/json');

  const body = JSON.parse(req.init.body);
  assert.equal(body.text, 'You have entered the void.');
  assert.equal(body.model_id, 'eleven_multilingual_v2');
  assert.equal(body.output_format, 'mp3_44100_128');
  assert.deepEqual(body.voice_settings, {
    stability: 0.55,
    similarity_boost: 0.8,
  });
});

test('buildElevenLabsTtsRequest rejects missing voice id', () => {
  assert.throws(() => {
    buildElevenLabsTtsRequest({
      apiKey: 'eleven-key',
      voiceId: '',
      text: 'hello',
    });
  }, /voice id/i);
});

test('buildElevenLabsTtsRequest rejects missing text', () => {
  assert.throws(() => {
    buildElevenLabsTtsRequest({
      apiKey: 'eleven-key',
      voiceId: 'voice_abc',
      text: '   ',
    });
  }, /text/i);
});
