import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { parse } from 'acorn';
import { buildSharedMatsCandidate } from '../../team-followup-20261001/BALANCE/shared-mats-atomic-candidate.mjs';

const root = new URL('../../../', import.meta.url);
const sha = value => createHash('sha256').update(value).digest('hex');
const serverSource = fs.readFileSync(new URL('server.cjs', root), 'utf8');
const report = { checkedAt: new Date().toISOString(), productionApplied: false,
  ownerCandidate: 'tools/team-followup-20261001/BALANCE/shared-mats-atomic-candidate.mjs',
  ownerCandidateSha256: sha(fs.readFileSync(new URL('../../team-followup-20261001/BALANCE/shared-mats-atomic-candidate.mjs', import.meta.url))),
  files: [], limits: ['Exact source-context patches only; source files untouched.',
    'git apply --check does not apply patches or confirm native HTTP/storage/package behavior.'] };
for (const file of ['server.cjs', 'node-main.js']) {
  const source = fs.readFileSync(new URL(file, root), 'utf8');
  const candidate = buildSharedMatsCandidate(serverSource, source);
  assert.equal(source.split(candidate.originalPost).length, 2);
  let next = source.replace(candidate.originalPost, candidate.candidatePost);
  const ast = parse(source, { ecmaVersion: 'latest' });
  const helpers = ast.body.filter(n => n.type === 'FunctionDeclaration' && n.id.name === 'atomicSaveJSON');
  const sequences = ast.body.filter(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.name === 'atomicSaveSequence'));
  let helperInserted = false;
  if (helpers.length === 0) {
    assert.equal(sequences.length, 0, 'sequence must not exist without helper');
    const readBody = ast.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'readBody');
    assert.ok(readBody);
    next = next.slice(0, readBody.end) + '\n\n' + candidate.helperCode + next.slice(readBody.end);
    helperInserted = true;
  } else {
    assert.equal(helpers.length, 1); assert.equal(sequences.length, 1);
    const actualHelper = [sequences[0], helpers[0]].map(n => source.slice(n.start, n.end)).join('\n');
    assert.equal(actualHelper, candidate.helperCode, 'reuse exact existing helper/sequence');
  }
  const afterAST = parse(next, { ecmaVersion: 'latest' });
  assert.equal(afterAST.body.filter(n => n.type === 'FunctionDeclaration' && n.id.name === 'atomicSaveJSON').length, 1);
  assert.equal(afterAST.body.filter(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.name === 'atomicSaveSequence')).length, 1);
  assert.equal(next.includes(candidate.originalPost), false);
  assert.equal(next.split(candidate.candidatePost).length, 2);
  const candidatePath = new URL(file + '.shared-mats-candidate', import.meta.url);
  fs.writeFileSync(candidatePath, next);
  const patchPath = new URL(file + '.shared-mats.patch', import.meta.url);
  const diff = spawnSync('git', ['diff', '--no-index', '--src-prefix=a/', '--dst-prefix=b/',
    new URL(file, root).pathname, candidatePath.pathname], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  assert.equal(diff.status, 1, diff.stderr);
  // Restore real repository labels; no shell interpolation or production write.
  const lines = diff.stdout.split('\n');
  lines[0] = `diff --git a/${file} b/${file}`;
  const originalLine = lines.findIndex(line => line.startsWith('--- '));
  const candidateLine = lines.findIndex(line => line.startsWith('+++ '));
  assert.ok(originalLine >= 0 && candidateLine >= 0);
  lines[originalLine] = `--- a/${file}`;
  lines[candidateLine] = `+++ b/${file}`;
  const patch = lines.join('\n');
  fs.writeFileSync(patchPath, patch);
  const check = spawnSync('git', ['apply', '--check', patchPath.pathname],
    { cwd: root.pathname, encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
  assert.equal(check.status, 0, check.stderr);
  assert.equal(sha(fs.readFileSync(new URL(file, root))), sha(source), 'production source preserved');
  report.files.push({ file, sourceSha256: sha(source), candidateSha256: sha(next),
    patchSha256: sha(patch), helperInserted, helperCount: 1, sequenceCount: 1,
    getSha256: sha(candidate.get), beforePostSha256: sha(candidate.originalPost),
    afterPostSha256: sha(candidate.candidatePost), helperSha256: sha(candidate.helperCode),
    gitApplyCheck: { status: check.status, stdout: check.stdout, stderr: check.stderr } });
}
report.status = 'READY_EXACT_PATCHES_NOT_APPLIED';
fs.writeFileSync(new URL('shared-mats-patch-evidence.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
