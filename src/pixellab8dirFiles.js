import path from 'node:path';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';

import { PNG } from 'pngjs';

import {
  DIAGONAL_SOURCE_DIRS,
  buildBlendPlan,
  expandMetadataTo8Directions,
  mixRgbaPixels,
} from './pixellab8dir.js';

const MIRROR_DIAGONAL_DIRS = {
  'north-east': 'north-west',
  'north-west': 'north-east',
  'south-east': 'south-west',
  'south-west': 'south-east',
};

const FALLBACK_COPY_DIRS = {
  'north-east': ['south-east', 'north-west', 'east', 'north', 'south'],
  'north-west': ['south-west', 'north-east', 'west', 'north', 'south'],
  'south-east': ['north-east', 'south-west', 'east', 'south', 'north'],
  'south-west': ['north-west', 'south-east', 'west', 'south', 'north'],
};

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodePng(buffer) {
  return PNG.sync.read(buffer);
}

function encodePng(png) {
  return PNG.sync.write(png);
}

function mixPngs(leftPng, rightPng) {
  const width = Math.max(leftPng.width, rightPng.width);
  const height = Math.max(leftPng.height, rightPng.height);
  const out = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outIndex = (width * y + x) << 2;
      const leftIndex = (leftPng.width * Math.min(y, leftPng.height - 1) + Math.min(x, leftPng.width - 1)) << 2;
      const rightIndex = (rightPng.width * Math.min(y, rightPng.height - 1) + Math.min(x, rightPng.width - 1)) << 2;
      const mixed = mixRgbaPixels(
        Array.from(leftPng.data.slice(leftIndex, leftIndex + 4)),
        Array.from(rightPng.data.slice(rightIndex, rightIndex + 4)),
      );
      out.data[outIndex + 0] = mixed[0];
      out.data[outIndex + 1] = mixed[1];
      out.data[outIndex + 2] = mixed[2];
      out.data[outIndex + 3] = mixed[3];
    }
  }

  return out;
}

function flipPngHorizontally(sourcePng) {
  const out = new PNG({ width: sourcePng.width, height: sourcePng.height });
  for (let y = 0; y < sourcePng.height; y += 1) {
    for (let x = 0; x < sourcePng.width; x += 1) {
      const srcIndex = (sourcePng.width * y + x) << 2;
      const destIndex = (sourcePng.width * y + (sourcePng.width - 1 - x)) << 2;
      out.data[destIndex + 0] = sourcePng.data[srcIndex + 0];
      out.data[destIndex + 1] = sourcePng.data[srcIndex + 1];
      out.data[destIndex + 2] = sourcePng.data[srcIndex + 2];
      out.data[destIndex + 3] = sourcePng.data[srcIndex + 3];
    }
  }
  return out;
}

async function collectAnimationDirs(folderDir) {
  const animationsDir = path.join(folderDir, 'animations');
  if (!(await exists(animationsDir))) {
    return [];
  }
  const entries = await readdir(animationsDir, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

async function collectFrameFiles(dirPath) {
  if (!(await exists(dirPath))) {
    return [];
  }
  const entries = await readdir(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && entry.name.startsWith('frame_') && entry.name.endsWith('.png'))
    .map(entry => entry.name)
    .sort();
}

async function ensureDiagonalRotation(folderDir, dirName, sourceDirs) {
  const outputPath = path.join(folderDir, 'rotations', `${dirName}.png`);
  if (await exists(outputPath)) {
    return false;
  }

  const [leftDir, rightDir] = sourceDirs;
  const leftPath = path.join(folderDir, 'rotations', `${leftDir}.png`);
  const rightPath = path.join(folderDir, 'rotations', `${rightDir}.png`);
  const leftExists = await exists(leftPath);
  const rightExists = await exists(rightPath);
  if (leftExists && !rightExists) {
    await writeFile(outputPath, await readFile(leftPath));
    return true;
  }
  if (rightExists && !leftExists) {
    await writeFile(outputPath, await readFile(rightPath));
    return true;
  }
  if (leftExists && rightExists) {
    const leftPng = decodePng(await readFile(leftPath));
    const rightPng = decodePng(await readFile(rightPath));
    const mixed = mixPngs(leftPng, rightPng);
    await writeFile(outputPath, encodePng(mixed));
    return true;
  }
  for (const fallbackDir of FALLBACK_COPY_DIRS[dirName] || []) {
    const fallbackPath = path.join(folderDir, 'rotations', `${fallbackDir}.png`);
    if (!(await exists(fallbackPath))) {
      continue;
    }
    const mirrorDir = MIRROR_DIAGONAL_DIRS[dirName];
    const fallbackPng = decodePng(await readFile(fallbackPath));
    const outPng = mirrorDir && fallbackDir === mirrorDir
      ? flipPngHorizontally(fallbackPng)
      : fallbackPng;
    await writeFile(outputPath, encodePng(outPng));
    return true;
  }
  const mirrorDir = MIRROR_DIAGONAL_DIRS[dirName];
  if (mirrorDir) {
    const mirrorPath = path.join(folderDir, 'rotations', `${mirrorDir}.png`);
    if (await exists(mirrorPath)) {
      const mirrored = flipPngHorizontally(decodePng(await readFile(mirrorPath)));
      await writeFile(outputPath, encodePng(mirrored));
      return true;
    }
  }
  return false;
}

async function generateAnimationFrames(folderDir, animName, dirName, sourceDirs) {
  const { mkdir } = await import('node:fs/promises');
  const targetDir = path.join(folderDir, 'animations', animName, dirName);
  if (await exists(targetDir)) {
    const files = await collectFrameFiles(targetDir);
    if (files.length > 0) {
      return 0;
    }
  }

  const [leftDir, rightDir] = sourceDirs;
  const leftRoot = path.join(folderDir, 'animations', animName, leftDir);
  const rightRoot = path.join(folderDir, 'animations', animName, rightDir);
  const leftFrames = (await collectFrameFiles(leftRoot)).map(name => path.join(leftRoot, name));
  const rightFrames = (await collectFrameFiles(rightRoot)).map(name => path.join(rightRoot, name));
  const mirrorDir = MIRROR_DIAGONAL_DIRS[dirName];
  await mkdir(targetDir, { recursive: true });
  const plan = buildBlendPlan(leftFrames, rightFrames);
  if (plan.length === 0) {
    for (const fallbackDir of FALLBACK_COPY_DIRS[dirName] || []) {
      const fallbackRoot = path.join(folderDir, 'animations', animName, fallbackDir);
      const fallbackFrames = (await collectFrameFiles(fallbackRoot)).map(name => path.join(fallbackRoot, name));
      if (fallbackFrames.length === 0) {
        continue;
      }
      let generated = 0;
      for (let index = 0; index < fallbackFrames.length; index += 1) {
        const outputPath = path.join(targetDir, `frame_${String(index).padStart(3, '0')}.png`);
        if (await exists(outputPath)) {
          continue;
        }
        const fallbackPng = decodePng(await readFile(fallbackFrames[index]));
        const outPng = mirrorDir && fallbackDir === mirrorDir
          ? flipPngHorizontally(fallbackPng)
          : fallbackPng;
        await writeFile(outputPath, encodePng(outPng));
        generated += 1;
      }
      return generated;
    }
    if (mirrorDir) {
      const mirrorRoot = path.join(folderDir, 'animations', animName, mirrorDir);
      const mirrorFrames = (await collectFrameFiles(mirrorRoot)).map(name => path.join(mirrorRoot, name));
      if (mirrorFrames.length > 0) {
        let generated = 0;
        for (let index = 0; index < mirrorFrames.length; index += 1) {
          const outputPath = path.join(targetDir, `frame_${String(index).padStart(3, '0')}.png`);
          if (await exists(outputPath)) {
            continue;
          }
          const mirrored = flipPngHorizontally(decodePng(await readFile(mirrorFrames[index])));
          await writeFile(outputPath, encodePng(mirrored));
          generated += 1;
        }
        return generated;
      }
    }
    return 0;
  }

  let generated = 0;
  for (let index = 0; index < plan.length; index += 1) {
    const step = plan[index];
    const outputPath = path.join(targetDir, `frame_${String(index).padStart(3, '0')}.png`);
    if (await exists(outputPath)) {
      continue;
    }

    if (!step.left && step.right) {
      await writeFile(outputPath, await readFile(step.right));
      generated += 1;
      continue;
    }
    if (!step.right && step.left) {
      await writeFile(outputPath, await readFile(step.left));
      generated += 1;
      continue;
    }
    if (!step.left || !step.right) {
      continue;
    }

    const leftPng = decodePng(await readFile(step.left));
    const rightPng = decodePng(await readFile(step.right));
    const mixed = mixPngs(leftPng, rightPng);
    await writeFile(outputPath, encodePng(mixed));
    generated += 1;
  }
  return generated;
}

export async function completePixellab8DirFolder({ folderDir }) {
  const metadataPath = path.join(folderDir, 'metadata.json');
  if (!(await exists(metadataPath))) {
    return {
      folderDir,
      skipped: true,
      reason: 'missing metadata',
      generatedRotations: 0,
      generatedAnimationFrames: 0,
      updatedMetadata: false,
    };
  }

  const metadata = await readJson(metadataPath);
  let generatedRotations = 0;
  let generatedAnimationFrames = 0;

  for (const [dirName, sourceDirs] of Object.entries(DIAGONAL_SOURCE_DIRS)) {
    if (await ensureDiagonalRotation(folderDir, dirName, sourceDirs)) {
      generatedRotations += 1;
    }
  }

  const animationNames = await collectAnimationDirs(folderDir);
  for (const animName of animationNames) {
    for (const [dirName, sourceDirs] of Object.entries(DIAGONAL_SOURCE_DIRS)) {
      generatedAnimationFrames += await generateAnimationFrames(folderDir, animName, dirName, sourceDirs);
    }
  }

  const expanded = expandMetadataTo8Directions(metadata);
  const updatedMetadata = JSON.stringify(expanded) !== JSON.stringify(metadata);
  if (updatedMetadata) {
    expanded.export_date = new Date().toISOString();
    await writeJson(metadataPath, expanded);
  }

  return {
    folderDir,
    skipped: false,
    generatedRotations,
    generatedAnimationFrames,
    updatedMetadata,
  };
}

export async function findPixellabMetadataFolders(rootDir) {
  const entries = await readdir(rootDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(rootDir, entry.name));
}
