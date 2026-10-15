import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const gatePath = fileURLToPath(new URL('../tools/docs-sync-check.mjs', import.meta.url));

function environment(root) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.startsWith('GIT_') || key === 'ALLOW_MISSING_DOCS') delete env[key];
  }
  return { ...env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(root, 'empty-global-config') };
}

function fixture(t, { initialize = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'exoduser-docs-sync-'));
  const cwd = join(root, 'repo');
  mkdirSync(cwd);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const env = environment(root);
  function git(...args) {
    const result = spawnSync('git', args, { cwd, env, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  }
  function write(path, text = 'changed\n') {
    const absolute = join(cwd, path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, text);
  }
  function run(args = [], overrides = {}) {
    const result = spawnSync(process.execPath, [gatePath, ...args], {
      cwd, env: { ...env, ...overrides }, encoding: 'utf8',
    });
    assert.equal(result.error, undefined);
    return { ...result, output: result.stdout + result.stderr };
  }
  if (initialize) {
    git('init', '-q');
    git('config', 'user.name', 'Docs Sync Test');
    git('config', 'user.email', 'docs-sync-test@example.invalid');
    git('config', 'core.hooksPath', join(root, 'no-hooks'));
    write('game.js', 'baseline\n');
    write('docs/system.md', 'baseline\n');
    write('docs/CHANGELOG_SYNC.md', 'baseline\n');
    git('add', '.');
    git('commit', '-q', '-m', 'Baseline');
  }
  return { cwd, git, write, run };
}

test('clean repositories and docs-only changes pass', (t) => {
  const repo = fixture(t);
  assert.equal(repo.run().status, 0);
  assert.equal(repo.run(['--staged']).status, 0);
  repo.write('docs/system.md');
  assert.equal(repo.run().status, 0);
  repo.git('add', 'docs/system.md');
  assert.equal(repo.run(['--staged']).status, 0);
});

test('unstaged code changes require docs and the progress log', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  const result = repo.run();
  assert.equal(result.status, 1);
  assert.match(result.output, /working tree changes/);
  assert.match(result.output, /game\.js/);
  assert.match(result.output, /docs\/CHANGELOG_SYNC\.md/);
});

test('staged code-only changes are rejected in both scopes', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  repo.git('add', 'game.js');
  assert.equal(repo.run().status, 1);
  const result = repo.run(['--staged']);
  assert.equal(result.status, 1);
  assert.match(result.output, /staged changes/);
});

test('untracked code is included only in the working tree scope', (t) => {
  const repo = fixture(t);
  repo.write('new-code.js');
  assert.equal(repo.run().status, 1);
  assert.equal(repo.run(['--staged']).status, 0);
});

test('docs changes without the progress log cannot accompany code', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  repo.write('docs/system.md');
  const result = repo.run();
  assert.equal(result.status, 1);
  assert.match(result.output, /progress log is missing/);
});

test('matching docs and progress log changes pass', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  repo.write('docs/system.md');
  repo.write('docs/CHANGELOG_SYNC.md');
  assert.equal(repo.run().status, 0);
  repo.git('add', '.');
  assert.equal(repo.run(['--staged']).status, 0);
});

test('the progress log itself satisfies the existing docs path contract', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  repo.write('docs/CHANGELOG_SYNC.md');
  assert.equal(repo.run().status, 0);
});

test('unstaged docs cannot satisfy the staged check', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  repo.git('add', 'game.js');
  repo.write('docs/system.md');
  repo.write('docs/CHANGELOG_SYNC.md');
  assert.equal(repo.run().status, 0);
  assert.equal(repo.run(['--staged']).status, 1);
  repo.git('add', 'docs');
  assert.equal(repo.run(['--staged']).status, 0);
});

test('untracked docs and progress log are included in the working tree scope', (t) => {
  const repo = fixture(t);
  repo.git('rm', 'docs/CHANGELOG_SYNC.md');
  repo.git('commit', '-q', '-m', 'Remove progress log from baseline');
  repo.write('game.js');
  repo.write('docs/new-system.md');
  repo.write('docs/CHANGELOG_SYNC.md');
  assert.equal(repo.run().status, 0);
});

test('renamed Korean paths with spaces stay intact', (t) => {
  const repo = fixture(t);
  const renamedPath = '전투 새 이름.js';
  renameSync(join(repo.cwd, 'game.js'), join(repo.cwd, renamedPath));
  repo.git('add', '-A');
  assert.match(repo.git('diff', '--cached', '--name-status'), /^R100\s/m);
  const result = repo.run(['--staged']);
  assert.equal(result.status, 1);
  assert.ok(result.output.includes(JSON.stringify(renamedPath)));
  repo.write('docs/CHANGELOG_SYNC.md');
  repo.git('add', 'docs/CHANGELOG_SYNC.md');
  assert.equal(repo.run(['--staged']).status, 0);
});

test('quotes, newlines and surrounding spaces in paths are preserved', {
  skip: process.platform === 'win32' && 'Windows filenames do not support quotes or newlines',
}, (t) => {
  const repo = fixture(t);
  const path = '  전투 "인용"\n이름.js  ';
  repo.write(path);
  const result = repo.run();
  assert.equal(result.status, 1);
  assert.ok(result.output.includes(JSON.stringify(path)));
});

test('git failure is rejected even with the existing bypass', (t) => {
  const repo = fixture(t, { initialize: false });
  for (const overrides of [{}, { ALLOW_MISSING_DOCS: '1' }]) {
    const result = repo.run([], overrides);
    assert.equal(result.status, 1);
    assert.match(result.output, /git .* failed:/);
  }
});

test('invalid CLI arguments are rejected even with the existing bypass', (t) => {
  const repo = fixture(t);
  for (const args of [['--unknown'], ['--staged', '--staged']]) {
    const result = repo.run(args, { ALLOW_MISSING_DOCS: '1' });
    assert.equal(result.status, 1);
    assert.match(result.output, /Usage:/);
  }
});

test('only the explicit existing bypass value permits incomplete docs', (t) => {
  const repo = fixture(t);
  repo.write('game.js');
  assert.equal(repo.run([], { ALLOW_MISSING_DOCS: '1' }).status, 0);
  assert.equal(repo.run([], { ALLOW_MISSING_DOCS: 'true' }).status, 1);
  repo.git('add', 'game.js');
  assert.equal(repo.run(['--staged'], { ALLOW_MISSING_DOCS: '1' }).status, 0);
});
