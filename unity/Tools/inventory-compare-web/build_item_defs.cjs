// PC-A25: definition tables of the web item card (game.html _invCardFields / _invBuildCompare): weapon/bow type tables only.
// PC-DEFS1: affix names/types/units/descriptions moved to Resources/Data/affix_defs_web.json (Tools/affix-defs-web/build_affix_defs.cjs).
// usage: node build_item_defs.cjs <game.html> <out.json> <web-commit>
const fs = require('fs');
const [htmlPath, outPath, commit] = process.argv.slice(2);
const src = fs.readFileSync(htmlPath, 'utf8');
function literal(name) {
  const m = src.match(new RegExp('const ' + name + '\s*=\s*\{'));
  if (!m) throw new Error('missing ' + name);
  let i = m.index + m[0].length - 1, depth = 0, j = i;
  for (; j < src.length; j++) { const ch = src[j]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) break; } }
  return eval('(' + src.slice(i, j + 1) + ')');
}
const wt = literal('WTYPES'), bt = literal('BOWTYPES');
const pick = o => Object.entries(o).map(([id, v]) => ({ id, name: v.name, atkMul: v.atkMul, spdMul: v.spdMul }));
const out = {
  source: { webCommit: commit, extractedAt: new Date().toISOString(), file: 'game.html WTYPES / BOWTYPES', note: 'definitions only; weapon/bow type tables. Affix names, types, units and descriptions are in affix_defs_web.json' },
  wtypes: pick(wt), btypes: pick(bt),
};
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({ wtypes: out.wtypes.length, btypes: out.btypes.length }));
