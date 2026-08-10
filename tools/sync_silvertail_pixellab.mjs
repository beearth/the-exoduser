import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

import { loadWorkspaceEnv } from '../src/workspaceEnv.js';
import {
  SILVERTAIL_DIRECTIONS,
  buildSilvertailFramePlan,
  clockFileForGameDirection,
} from '../src/silvertailPixellabSync.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHARACTER_ID = 'eda1221a-6fee-4228-9350-c36a15a3eaea';
const FRAME_SIZE = 48;
const WALK_FRAME_COUNT = 8;

async function fetchBytes(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`PixelLab download failed (${response.status}): ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function extractZip(zipPath, outputDir) {
  return new Promise((resolve, reject) => {
    execFile('C:\\Windows\\System32\\tar.exe', ['-xf', zipPath, '-C', outputDir], (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function makeFrame(input) {
  return sharp(input)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(FRAME_SIZE, FRAME_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
}

async function buildDirectionSheet(extractedDir, gameDirection) {
  const plan = buildSilvertailFramePlan(gameDirection, WALK_FRAME_COUNT);
  const sources = await Promise.all(plan.map((frame) => readFile(frame.type === 'rotation'
    ? path.join(extractedDir, 'Idle', 'rotations', `${frame.direction}.png`)
    : path.join(extractedDir, 'Idle', 'animations', 'walk', frame.direction, `frame_${String(frame.frame).padStart(3, '0')}.png`))));
  const frames = await Promise.all(sources.map(makeFrame));
  return sharp({
    create: { width: FRAME_SIZE * frames.length, height: FRAME_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite(frames.map((input, index) => ({ input, left: index * FRAME_SIZE, top: 0 }))).png().toBuffer();
}

async function main() {
  const env = await loadWorkspaceEnv({ rootDir: ROOT_DIR });
  if (!env.PIXELLAB_API_KEY) throw new Error('PIXELLAB_API_KEY is missing');
  const headers = { Authorization: `Bearer ${env.PIXELLAB_API_KEY}` };
  const download = await fetchBytes(`https://api.pixellab.ai/mcp/characters/${CHARACTER_ID}/download`, headers);
  const temporaryDir = await mkdtemp(path.join(os.tmpdir(), 'silvertail-pixellab-'));
  const zipPath = path.join(temporaryDir, 'silvertail.zip');
  await writeFile(zipPath, download);
  await extractZip(zipPath, temporaryDir);
  const targetDir = path.join(ROOT_DIR, 'img', 'exoduser_silvertail');
  await mkdir(targetDir, { recursive: true });

  try {
    for (const gameDirection of SILVERTAIL_DIRECTIONS) {
      const sheet = await buildDirectionSheet(temporaryDir, gameDirection);
      const target = path.join(targetDir, `${clockFileForGameDirection(gameDirection)}.png`);
      const temporary = `${target}.pixellab-sync.tmp`;
      await writeFile(temporary, sheet);
      await rename(temporary, target);
    }

    await writeFile(path.join(targetDir, '.pixellab-sync.json'), `${JSON.stringify({
      characterId: CHARACTER_ID,
      gameDirections: SILVERTAIL_DIRECTIONS,
      pixelLabDirectionOverrides: {
        'south-east': 'south-west',
        'south-west': 'south-east',
      },
      clockFiles: Object.fromEntries(SILVERTAIL_DIRECTIONS.map((direction) => [direction, clockFileForGameDirection(direction)])),
      idleSource: 'walk frame_000 duplicated (PixelLab rotations excluded)',
      idleFrames: 2,
      walkFrames: WALK_FRAME_COUNT,
    }, null, 2)}\n`);
  } finally {
    await rm(temporaryDir, { recursive: true, force: true });
  }
  console.log('Synced Silvertail from PixelLab character ZIP');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
