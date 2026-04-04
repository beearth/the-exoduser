import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  parseElevenLabsArgs,
  resolveElevenLabsOutputPath,
} from '../tools/elevenlabs_tts.mjs';
import {
  detectExtensionFromContentType,
  parsePixelLabArgs,
} from '../tools/pixellab_request.mjs';

test('parseElevenLabsArgs accepts voice key and text', () => {
  const args = parseElevenLabsArgs([
    '--key',
    'voice_move',
    '--text',
    'Move now.',
  ]);

  assert.equal(args.key, 'voice_move');
  assert.equal(args.text, 'Move now.');
});

test('resolveElevenLabsOutputPath defaults key outputs into sfx voice folder', () => {
  const outputPath = resolveElevenLabsOutputPath({
    rootDir: path.resolve('G:/hell'),
    key: 'voice_move',
  });

  assert.equal(outputPath, path.join(path.resolve('G:/hell'), 'sfx', 'voice', 'voice_move.mp3'));
});

test('parsePixelLabArgs parses path, method, and output file', () => {
  const args = parsePixelLabArgs([
    '--path',
    '/characters',
    '--method',
    'POST',
    '--body-json',
    '{"name":"boss"}',
    '--out',
    'generated/pixellab/boss.json',
  ]);

  assert.equal(args.path, '/characters');
  assert.equal(args.method, 'POST');
  assert.equal(args.bodyJson, '{"name":"boss"}');
  assert.equal(args.out, 'generated/pixellab/boss.json');
});

test('detectExtensionFromContentType maps common response types', () => {
  assert.equal(detectExtensionFromContentType('application/json; charset=utf-8'), '.json');
  assert.equal(detectExtensionFromContentType('image/png'), '.png');
  assert.equal(detectExtensionFromContentType('audio/mpeg'), '.mp3');
  assert.equal(detectExtensionFromContentType('application/octet-stream'), '.bin');
});
