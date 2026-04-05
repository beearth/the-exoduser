import path from 'node:path';
import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';

function extractEtypeFromFolderName(folderName) {
  const match = folderName.match(/etype(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listPixellabMonsterCandidates({ sourceRootDir, onlyEtTypes = null }) {
  const names = await readdir(sourceRootDir);
  const onlySet = Array.isArray(onlyEtTypes) && onlyEtTypes.length > 0
    ? new Set(onlyEtTypes.map((value) => Number(value)))
    : null;
  const results = [];

  for (const folderName of names) {
    const sourceDir = path.join(sourceRootDir, folderName);
    const etype = extractEtypeFromFolderName(folderName);
    if (etype === null || (onlySet && !onlySet.has(etype))) {
      continue;
    }

    if (!(await pathExists(path.join(sourceDir, 'metadata.json')))) {
      continue;
    }

    const metadata = JSON.parse(await readFile(path.join(sourceDir, 'metadata.json'), 'utf8'));

    results.push({
      etype,
      folderName,
      sourceDir,
      targetFolderName: `etype${etype}_full`,
      directions: metadata?.character?.directions ?? 0,
      animationKeys: Object.keys(metadata?.frames?.animations ?? {}),
    });
  }

  return results.sort((left, right) => left.etype - right.etype);
}

async function syncPixellabMonsterCandidate({ candidate, targetRootDir }) {
  const targetDir = path.join(targetRootDir, candidate.targetFolderName);

  await mkdir(targetRootDir, { recursive: true });
  await rm(targetDir, { recursive: true, force: true });
  await cp(candidate.sourceDir, targetDir, { recursive: true });

  return {
    etype: candidate.etype,
    sourceFolderName: candidate.folderName,
    targetFolderName: candidate.targetFolderName,
    directions: candidate.directions,
    animationKeys: candidate.animationKeys,
  };
}

export async function syncPixellabChapterToMonsterAtlases({
  sourceRootDir,
  targetRootDir,
  onlyEtTypes = null,
} = {}) {
  const candidates = await listPixellabMonsterCandidates({ sourceRootDir, onlyEtTypes });
  const results = [];

  for (const candidate of candidates) {
    results.push(await syncPixellabMonsterCandidate({ candidate, targetRootDir }));
  }

  return {
    sourceRootDir,
    targetRootDir,
    totalCandidates: candidates.length,
    syncedCount: results.length,
    skippedCount: 0,
    results,
  };
}

export {
  extractEtypeFromFolderName,
  listPixellabMonsterCandidates,
  syncPixellabMonsterCandidate,
};
