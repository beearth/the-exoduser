import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { loadWorkspaceEnv } from '../src/workspaceEnv.js';

test('loadWorkspaceEnv merges .env and .env.local without overriding existing process values', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'workspace-env-'));
  try {
    await writeFile(
      path.join(rootDir, '.env'),
      [
        'PIXELLAB_API_KEY=base-key',
        'PIXELLAB_BASE_URL=https://api.pixellab.ai',
        'SHARED_VALUE=from-env',
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      path.join(rootDir, '.env.local'),
      [
        'ELEVENLABS_API_KEY=local-key',
        'SHARED_VALUE=from-local',
      ].join('\n'),
      'utf8',
    );

    const target = {
      SHARED_VALUE: 'already-set',
    };

    const result = await loadWorkspaceEnv({ rootDir, env: target });

    assert.equal(result.PIXELLAB_API_KEY, 'base-key');
    assert.equal(result.PIXELLAB_BASE_URL, 'https://api.pixellab.ai');
    assert.equal(result.ELEVENLABS_API_KEY, 'local-key');
    assert.equal(result.SHARED_VALUE, 'already-set');
    assert.deepEqual(result.__loadedFiles, ['.env', '.env.local']);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('loadWorkspaceEnv parses quoted values and ignores comments', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'workspace-env-'));
  try {
    await writeFile(
      path.join(rootDir, '.env'),
      [
        '# comment',
        'ELEVENLABS_VOICE_ID="voice_123"',
        'EMPTY=',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = await loadWorkspaceEnv({ rootDir, env: {} });

    assert.equal(result.ELEVENLABS_VOICE_ID, 'voice_123');
    assert.equal(result.EMPTY, '');
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
