import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';

import { syncPixellabChapterToMonsterAtlases } from '../src/pixellabMonsterAtlasSync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRootDir = path.join(__dirname, '..');

function parseOnlyArg(args) {
  const onlyArg = args.find((arg) => arg.startsWith('--only='));
  if (!onlyArg) {
    return null;
  }

  return onlyArg
    .slice('--only='.length)
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value));
}

async function main() {
  const args = process.argv.slice(2);
  const sourceRootDir = path.resolve(projectRootDir, 'img', 'pixellab_all', 'ch1');
  const targetRootDir = path.resolve(projectRootDir, 'img', 'monsters');
  const onlyEtTypes = parseOnlyArg(args);

  const summary = await syncPixellabChapterToMonsterAtlases({
    sourceRootDir,
    targetRootDir,
    onlyEtTypes,
  });

  const generatedDir = path.join(projectRootDir, 'generated');
  const summaryPath = path.join(generatedDir, 'ch1-monster-atlas-sync.json');

  await mkdir(generatedDir, { recursive: true });
  await writeFile(summaryPath, JSON.stringify(summary, null, 2));

  console.log(`synced ${summary.syncedCount} monster atlas folders`);
  console.log(summaryPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
