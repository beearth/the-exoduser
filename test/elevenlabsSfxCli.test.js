import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  buildElevenLabsSfxRequest,
  parseElevenLabsSfxArgs,
  resolveElevenLabsSfxOutputPath,
} from '../tools/elevenlabs_sfx.mjs';

test('ElevenLabs SFX CLI builds a sound-generation request with the requested game audio format', () => {
  const args = parseElevenLabsSfxArgs([
    '--key', 'equip_weapon', '--text', 'tight steel weapon draw',
    '--duration', '0.5', '--prompt-influence', '0.82', '--output-format', 'mp3_44100_128',
  ]);
  const request = buildElevenLabsSfxRequest({
    apiKey: 'test-key', text: args.text, durationSeconds: args.duration,
    promptInfluence: args.promptInfluence, outputFormat: args.outputFormat,
  });
  assert.equal(resolveElevenLabsSfxOutputPath({ rootDir: 'G:/exoduser', key: args.key }), path.join(path.resolve('G:/exoduser'), 'sfx', 'equipment', 'equip_weapon.mp3'));
  assert.equal(request.url, 'https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128');
  assert.equal(request.init.headers['xi-api-key'], 'test-key');
  assert.deepEqual(JSON.parse(request.init.body), {
    text: 'tight steel weapon draw', model_id: 'eleven_text_to_sound_v2', duration_seconds: 0.5, prompt_influence: 0.82,
  });
});
