import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { syncPixellabChapterToMonsterAtlases } from '../src/pixellabMonsterAtlasSync.js';

async function writePngStub(filePath) {
  await writeFile(filePath, Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
  ]));
}

test('syncPixellabChapterToMonsterAtlases copies etype folders into monster atlas layout', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'pixellab-monster-sync-'));
  const sourceRootDir = path.join(rootDir, 'pixellab_all', 'ch1');
  const targetRootDir = path.join(rootDir, 'monsters');
  const sourceDir = path.join(sourceRootDir, '003_etype85_darkKnight');

  try {
    await mkdir(path.join(sourceDir, 'rotations'), { recursive: true });
    await mkdir(path.join(sourceDir, 'animations', 'breathing-idle', 'south'), { recursive: true });
    await mkdir(path.join(sourceDir, 'animations', 'cross-punch', 'south-east'), { recursive: true });

    await writePngStub(path.join(sourceDir, 'rotations', 'south.png'));
    await writePngStub(path.join(sourceDir, 'rotations', 'south-east.png'));
    await writePngStub(path.join(sourceDir, 'animations', 'breathing-idle', 'south', 'frame_000.png'));
    await writePngStub(path.join(sourceDir, 'animations', 'cross-punch', 'south-east', 'frame_000.png'));

    await writeFile(path.join(sourceDir, 'metadata.json'), JSON.stringify({
      character: {
        id: 'char-85',
        name: 'etype85 dark knight',
        directions: 8,
      },
      frames: {
        rotations: {
          south: 'rotations/south.png',
          'south-east': 'rotations/south-east.png',
        },
        animations: {
          'breathing-idle': {
            south: ['animations/breathing-idle/south/frame_000.png'],
          },
          'cross-punch': {
            'south-east': ['animations/cross-punch/south-east/frame_000.png'],
          },
        },
      },
    }, null, 2));

    const result = await syncPixellabChapterToMonsterAtlases({ sourceRootDir, targetRootDir });

    assert.equal(result.totalCandidates, 1);
    assert.equal(result.syncedCount, 1);
    assert.equal(result.skippedCount, 0);
    assert.equal(result.results[0].etype, 85);
    assert.equal(result.results[0].targetFolderName, 'etype85_full');

    const copiedMetadata = JSON.parse(await readFile(path.join(targetRootDir, 'etype85_full', 'metadata.json'), 'utf8'));
    assert.equal(copiedMetadata.character.id, 'char-85');

    const copiedSouth = await readFile(path.join(targetRootDir, 'etype85_full', 'rotations', 'south.png'));
    assert.equal(copiedSouth[0], 0x89);

    const copiedAnim = await readFile(path.join(targetRootDir, 'etype85_full', 'animations', 'cross-punch', 'south-east', 'frame_000.png'));
    assert.equal(copiedAnim[0], 0x89);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('syncPixellabChapterToMonsterAtlases ignores folders without etype metadata', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'pixellab-monster-sync-'));
  const sourceRootDir = path.join(rootDir, 'pixellab_all', 'ch1');
  const targetRootDir = path.join(rootDir, 'monsters');

  try {
    await mkdir(path.join(sourceRootDir, 'mob_slime', 'rotations'), { recursive: true });
    await writePngStub(path.join(sourceRootDir, 'mob_slime', 'rotations', 'south.png'));

    const result = await syncPixellabChapterToMonsterAtlases({ sourceRootDir, targetRootDir });

    assert.equal(result.totalCandidates, 0);
    assert.equal(result.syncedCount, 0);
    assert.equal(result.results.length, 0);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
