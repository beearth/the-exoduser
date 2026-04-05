import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { PNG } from 'pngjs';

import { completePixellab8DirFolder } from '../src/pixellab8dirFiles.js';

function makePngBuffer([r, g, b, a]) {
  const png = new PNG({ width: 1, height: 1 });
  png.data[0] = r;
  png.data[1] = g;
  png.data[2] = b;
  png.data[3] = a;
  return PNG.sync.write(png);
}

test('completePixellab8DirFolder generates diagonal rotation files and updates metadata', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'pixellab-8dir-'));
  const folderDir = path.join(rootDir, 'mob_test');

  try {
    await mkdir(path.join(folderDir, 'rotations'), { recursive: true });
    await writeFile(path.join(folderDir, 'rotations', 'south.png'), makePngBuffer([255, 0, 0, 255]));
    await writeFile(path.join(folderDir, 'rotations', 'east.png'), makePngBuffer([0, 255, 0, 255]));
    await writeFile(path.join(folderDir, 'rotations', 'north.png'), makePngBuffer([0, 0, 255, 255]));
    await writeFile(path.join(folderDir, 'rotations', 'west.png'), makePngBuffer([255, 255, 0, 255]));

    await writeFile(path.join(folderDir, 'metadata.json'), JSON.stringify({
      character: {
        directions: 4,
      },
      frames: {
        rotations: {
          south: 'rotations/south.png',
          east: 'rotations/east.png',
          north: 'rotations/north.png',
          west: 'rotations/west.png',
        },
        animations: {},
      },
    }, null, 2));

    const result = await completePixellab8DirFolder({ folderDir });

    assert.equal(result.generatedRotations, 4);
    assert.equal(result.updatedMetadata, true);

    const southEastBuffer = await readFile(path.join(folderDir, 'rotations', 'south-east.png'));
    const southEast = PNG.sync.read(southEastBuffer);
    assert.deepEqual(Array.from(southEast.data), [128, 128, 0, 255]);

    const updatedMetadata = JSON.parse(await readFile(path.join(folderDir, 'metadata.json'), 'utf8'));
    assert.equal(updatedMetadata.character.directions, 8);
    assert.equal(updatedMetadata.frames.rotations['north-west'], 'rotations/north-west.png');
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test('completePixellab8DirFolder backfills missing north diagonals from existing side diagonals', async () => {
  const rootDir = await mkdtemp(path.join(tmpdir(), 'pixellab-8dir-'));
  const folderDir = path.join(rootDir, 'mob_partial');

  try {
    await mkdir(path.join(folderDir, 'rotations'), { recursive: true });
    await writeFile(path.join(folderDir, 'rotations', 'south.png'), makePngBuffer([10, 10, 10, 255]));
    await writeFile(path.join(folderDir, 'rotations', 'south-east.png'), makePngBuffer([20, 40, 60, 255]));
    await writeFile(path.join(folderDir, 'rotations', 'south-west.png'), makePngBuffer([70, 80, 90, 255]));

    await writeFile(path.join(folderDir, 'metadata.json'), JSON.stringify({
      character: {
        directions: 8,
      },
      frames: {
        rotations: {
          south: 'rotations/south.png',
          'south-east': 'rotations/south-east.png',
          'south-west': 'rotations/south-west.png',
        },
        animations: {},
      },
    }, null, 2));

    await completePixellab8DirFolder({ folderDir });

    const northEast = PNG.sync.read(await readFile(path.join(folderDir, 'rotations', 'north-east.png')));
    const northWest = PNG.sync.read(await readFile(path.join(folderDir, 'rotations', 'north-west.png')));

    assert.deepEqual(Array.from(northEast.data), [20, 40, 60, 255]);
    assert.deepEqual(Array.from(northWest.data), [70, 80, 90, 255]);
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
