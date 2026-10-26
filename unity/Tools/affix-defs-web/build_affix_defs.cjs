// PC-DEFS1: the one shared affix definition table (name, kind, unit, description) of the web game.
// Sources in game.html: AFFIX_NAMES_KO (names), AFFIX_POOL (type 0 prefix / 1 suffix and unit), _AFFIX_DESC (descriptions).
// Ids that are only in AFFIX_NAMES_KO (legacy) have type -1 and no unit. usage: node build_affix_defs.cjs <game.html> <out.json> <web-commit>
const fs = require('fs');
const vm = require('vm');
const [htmlPath, outPath, commit] = process.argv.slice(2);
const src = fs.readFileSync(htmlPath, 'utf8');
function block(open, close, name) {
  const head = 'const ' + name + '=';
  let i = src.indexOf(head);
  if (i < 0) throw new Error('missing ' + name);
  i += head.length;
  if (src[i] !== open) throw new Error('unexpected start of ' + name);
  let depth = 0, j = i;
  for (; j < src.length; j++) { const ch = src[j]; if (ch === open) depth++; else if (ch === close) { depth--; if (depth === 0) break; } }
  return vm.runInNewContext('(' + src.slice(i, j + 1) + ')');
}
const names = block('{', '}', 'AFFIX_NAMES_KO'), desc = block('{', '}', '_AFFIX_DESC'), pool = block('[', ']', 'AFFIX_POOL');
const poolById = new Map(pool.map(p => [p.id, p]));
const affixes = Object.keys(names).map(id => {
  const p = poolById.get(id);
  const o = { id, name: names[id], type: p ? p.type : -1 };
  if (p && p.unit) o.unit = p.unit;
  if (desc[id] !== undefined) o.desc = desc[id];
  return o;
});
const out = {
  source: { webCommit: commit, extractedAt: new Date().toISOString(), file: 'game.html', tables: ['AFFIX_NAMES_KO', 'AFFIX_POOL (type, unit)', '_AFFIX_DESC'], note: 'Single shared definition table for the forge and the inventory item card. Absent unit/desc = the web has none.' },
  affixes,
};
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({ affixes: affixes.length, withUnit: affixes.filter(a => a.unit).length, withDesc: affixes.filter(a => a.desc !== undefined).length, poolEntries: pool.length, descNotInNames: Object.keys(desc).filter(k => !(k in names)).length }));
