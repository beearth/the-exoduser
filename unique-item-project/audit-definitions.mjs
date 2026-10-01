import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { UNIQUE_DEFINITIONS, EFFECT_PROPOSALS, validateDefinitions } from './definitions.mjs';

const projectRoot = path.resolve(import.meta.dirname, '..');

// Check the catalog against its source documents, not another hand-copied table.
export async function auditDefinitions(root = projectRoot) {
  const itemDocs = path.join(root, 'docs', '7아이템디자인');
  const [contract, catalog, effectsDoc] = await Promise.all([
    readFile(path.join(itemDocs, 'UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md'), 'utf8'),
    readFile(path.join(itemDocs, '보라색_고유아이템_카탈로그_20260930.md'), 'utf8'),
    readFile(path.join(itemDocs, '유니크_어픽스_리스트.md'), 'utf8'),
  ]);
  const section = contract.split('## 3.')[1]?.split('## 4.')[0] || '';
  const expected = new Map();
  const documentErrors = [];
  for (const line of section.split('\n').filter(line => line.startsWith('| `'))) {
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
    const ids = cells[1].match(/UI-\d{2}/g) || [];
    const effectIds = cells[2].match(/U-D\d{2}/g) || [];
    if (ids.length !== effectIds.length) documentErrors.push('contract_column_count');
    ids.forEach((id, i) => {
      if (expected.has(id)) documentErrors.push('duplicate_contract_id:' + id);
      expected.set(id, { family: cells[0].replaceAll('`', ''), effectId: effectIds[i] });
    });
  }
  if (expected.size !== 22) documentErrors.push('contract_count:' + expected.size);
  const names = new Map([...catalog.matchAll(/^\| (UI-\d{2}) \| ([^|]+) \|[^\n]*?\| U-D\d{2} /gm)].map(match => [match[1], match[2].trim()]));
  const effectRows = new Map([...effectsDoc.matchAll(/^\| \*\*(U-D\d{2})\*\*.*$/gm)].map(match => [match[1], match[0]]));
  for (const definition of UNIQUE_DEFINITIONS) {
    const actualFamily = definition.wtype ? 'weapon/' + definition.wtype : definition.btype ? 'bow/' + definition.btype : definition.slots.join('/');
    const expectedRow = expected.get(definition.uniqueId);
    if (!expectedRow || expectedRow.family !== actualFamily || expectedRow.effectId !== definition.effectId) documentErrors.push('contract_mismatch:' + definition.uniqueId);
    if (names.get(definition.uniqueId) !== definition.catalogName) documentErrors.push('catalog_mismatch:' + definition.uniqueId);
  }
  for (const effect of EFFECT_PROPOSALS) {
    if (!effectRows.get(effect.effectId)?.includes('`' + effect.proposalStat + '`')) documentErrors.push('effect_reference_mismatch:' + effect.effectId);
  }
  const paths = UNIQUE_DEFINITIONS.flatMap(definition => [definition.art.originalPath, definition.art.candidatePath]);
  const artPaths = (await Promise.all(paths.map(async filename => {
    try { await access(path.join(root, filename)); return filename; }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }))).filter(Boolean);
  const validation = validateDefinitions(UNIQUE_DEFINITIONS, { effects: EFFECT_PROPOSALS, artPaths });
  return {
    definitions: UNIQUE_DEFINITIONS.length,
    structurallyValid: validation.valid && documentErrors.length === 0,
    runtimeReady: validation.canActivate,
    activeDefinitions: UNIQUE_DEFINITIONS.filter(definition => definition.enabled).length,
    sourceArtFound: artPaths.length,
    documentErrors,
    issues: validation.issues,
    blockers: validation.blockers,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await auditDefinitions();
  console.log(JSON.stringify(result, null, 2));
  if (!result.structurallyValid || (process.argv.includes('--require-ready') && !result.runtimeReady)) process.exitCode = 1;
}
