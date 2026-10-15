import { spawnSync } from 'node:child_process';

const progressLog = 'docs/CHANGELOG_SYNC.md';

function gitPaths(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || result.stderr?.trim() || `exit ${result.status}`;
    throw new Error(`git ${args.join(' ')} failed: ${detail}`);
  }
  if (!result.stdout) return [];
  if (!result.stdout.endsWith('\0')) {
    throw new Error(`git ${args.join(' ')} returned incomplete path data`);
  }
  return result.stdout.slice(0, -1).split('\0');
}

function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--staged')) {
    throw new Error('Usage: node tools/docs-sync-check.mjs [--staged]');
  }
  const staged = args.length === 1;
  const stagedPaths = gitPaths(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']);
  const files = new Set(staged ? stagedPaths : [
    ...gitPaths(['diff', '--name-only', '--diff-filter=ACMR', '-z']),
    ...stagedPaths,
    ...gitPaths(['ls-files', '--others', '--exclude-standard', '-z']),
  ]);
  const codeFiles = [...files].filter((file) => !file.startsWith('docs/'));
  const docsFiles = [...files].filter((file) => file.startsWith('docs/'));

  if (codeFiles.length === 0) return;
  if ((docsFiles.length > 0 && files.has(progressLog)) || process.env.ALLOW_MISSING_DOCS === '1') return;

  console.error(`\n[docs-sync-check] ${staged ? 'staged' : 'working tree'} changes include non-doc files, but docs sync is incomplete.`);
  console.error('\nChanged non-doc files:');
  for (const file of codeFiles) console.error(`- ${JSON.stringify(file)}`);
  console.error('\nRequired action:');
  console.error(docsFiles.length === 0
    ? '- Update the matching docs/ files before commit.'
    : '- docs/ changes exist, but the progress log is missing.');
  console.error(`- Update ${progressLog} with this change set.`);
  console.error('- Or set ALLOW_MISSING_DOCS=1 for an explicit one-off bypass.\n');
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`[docs-sync-check] ${error.message}`);
  process.exitCode = 1;
}
