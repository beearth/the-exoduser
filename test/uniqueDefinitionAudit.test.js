import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditDefinitions } from '../unique-item-project/audit-definitions.mjs';

test('real definition audit distinguishes valid proposals from runtime readiness', async () => {
  const result = await auditDefinitions();
  assert.equal(result.definitions, 22);
  assert.equal(result.sourceArtFound, 44);
  assert.equal(result.structurallyValid, true);
  assert.equal(result.runtimeReady, false);
  assert.equal(result.activeDefinitions, 0);
  assert.equal(result.blockers.length, 110);
  const file = new URL('../unique-item-project/audit-definitions.mjs', import.meta.url);
  for (const [args, exit] of [[[], 0], [['--require-ready'], 1]]) {
    const child = spawnSync(process.execPath, [file.pathname, ...args], { encoding: 'utf8' });
    assert.equal(child.status, exit, child.stderr);
    assert.equal(JSON.parse(child.stdout).runtimeReady, false);
  }
});

test('audit catches document drift instead of trusting a copied definition table', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'exoduser-definition-audit-'));
  const folder = path.join(root, 'docs', '7아이템디자인');
  const names = ['UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md', '보라색_고유아이템_카탈로그_20260930.md', '유니크_어픽스_리스트.md'];
  const originals = await Promise.all(names.map(name => readFile(new URL('../docs/7아이템디자인/' + name, import.meta.url), 'utf8')));
  try {
    await mkdir(folder, { recursive: true });
    await Promise.all(names.map((name, i) => writeFile(path.join(folder, name), originals[i])));
    const baseline = await auditDefinitions(root);
    assert.equal(baseline.structurallyValid, true);
    assert.equal(baseline.sourceArtFound, 0);
    assert.equal(baseline.blockers.filter(row => row.code === 'missing_source_art').length, 22);
    for (const [i, from, to, error] of [
      [0, '| `weapon/sword` | UI-03', '| `weapon/dagger` | UI-03', 'contract_mismatch:UI-03'],
      [1, '| UI-01 | 반향의 장막 |', '| UI-01 | changed |', 'catalog_mismatch:UI-01'],
      [2, '`_uParryOrbEcho`', '`_uWrongReference`', 'effect_reference_mismatch:U-D01'],
    ]) {
      assert.ok(originals[i].includes(from));
      await writeFile(path.join(folder, names[i]), originals[i].replace(from, to));
      const result = await auditDefinitions(root);
      assert.equal(result.structurallyValid, false);
      assert.ok(result.documentErrors.includes(error));
      await writeFile(path.join(folder, names[i]), originals[i]);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});
