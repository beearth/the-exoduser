import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

import { completePixellab8DirFolder, findPixellabMetadataFolders } from '../src/pixellab8dirFiles.js';

const THIS_FILE = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(THIS_FILE), '..');
const CH1_DIR = path.join(ROOT_DIR, 'img', 'pixellab_all', 'ch1');
const REPORT_PATH = path.join(ROOT_DIR, 'generated', 'ch1-8dir-completion.json');
const IS_MAIN = process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE;

function parseArgs(argv) {
  const args = {
    rootDir: CH1_DIR,
    limit: null,
    match: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case '--root':
        args.rootDir = path.resolve(ROOT_DIR, argv[i + 1]);
        i += 1;
        break;
      case '--limit':
        args.limit = Number(argv[i + 1]);
        i += 1;
        break;
      case '--match':
        args.match = argv[i + 1];
        i += 1;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }
  return args;
}

export async function runCompleteCh18Dir(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  let folders = await findPixellabMetadataFolders(args.rootDir);
  if (args.match) {
    folders = folders.filter(folderDir => path.basename(folderDir).includes(args.match));
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    folders = folders.slice(0, args.limit);
  }

  const results = [];
  for (const folderDir of folders) {
    const result = await completePixellab8DirFolder({ folderDir });
    results.push({
      folder: path.basename(folderDir),
      generatedRotations: result.generatedRotations,
      generatedAnimationFrames: result.generatedAnimationFrames,
      updatedMetadata: result.updatedMetadata,
      skipped: result.skipped,
      reason: result.reason || null,
    });
  }

  const summary = {
    rootDir: path.relative(ROOT_DIR, args.rootDir),
    totalFolders: results.length,
    generatedRotations: results.reduce((sum, row) => sum + row.generatedRotations, 0),
    generatedAnimationFrames: results.reduce((sum, row) => sum + row.generatedAnimationFrames, 0),
    updatedMetadata: results.filter(row => row.updatedMetadata).length,
    touchedFolders: results.filter(row => row.generatedRotations || row.generatedAnimationFrames || row.updatedMetadata).length,
    results,
  };

  await writeFile(REPORT_PATH, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    totalFolders: summary.totalFolders,
    generatedRotations: summary.generatedRotations,
    generatedAnimationFrames: summary.generatedAnimationFrames,
    updatedMetadata: summary.updatedMetadata,
    report: path.relative(ROOT_DIR, REPORT_PATH),
  }, null, 2));
  return summary;
}

if (IS_MAIN) {
  runCompleteCh18Dir().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
