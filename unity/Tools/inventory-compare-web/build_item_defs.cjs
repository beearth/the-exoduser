// PC-A25: definition tables of the web item card (game.html _invCardFields / _invBuildCompare): weapon/bow type tables and the affix
// description texts. Affix names/types/units already live in Resources/Data/forge_web.json (affixes/affixUnits) and are NOT copied here.
// usage: node build_item_defs.cjs <game.html> <forge_web.json> <out.json> <web-commit>
const fs = require('fs');
const [htmlPath, forgePath, outPath, commit] = process.argv.slice(2);
const src = fs.readFileSync(htmlPath, 'utf8');
function literal(name) {
  const m = src.match(new RegExp('const ' + name + '\s*=\s*\{'));
  if (!m) throw new Error('missing ' + name);
  let i = m.index + m[0].length - 1, depth = 0, j = i;
  for (; j < src.length; j++) { const ch = src[j]; if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) break; } }
  return eval('(' + src.slice(i, j + 1) + ')');
}
const wt = literal('WTYPES'), bt = literal('BOWTYPES'), desc = literal('_AFFIX_DESC'), names = literal('AFFIX_NAMES_KO');
const forge = JSON.parse(fs.readFileSync(forgePath, 'utf8'));
const fn = Object.fromEntries(forge.affixes.map(a => [a.id, a.name]));
const mismatch = Object.keys(names).filter(k => fn[k] !== names[k]);
const pick = o => Object.entries(o).map(([id, v]) => ({ id, name: v.name, atkMul: v.atkMul, spdMul: v.spdMul }));
const out = {
  source: { webCommit: commit, extractedAt: new Date().toISOString(), file: 'game.html WTYPES / BOWTYPES / _AFFIX_DESC', note: 'definitions only; affix names, types and units come from forge_web.json' },
  wtypes: pick(wt), btypes: pick(bt),
  affixDesc: Object.entries(desc).map(([id, d]) => ({ id, desc: d })),
};
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({ wtypes: out.wtypes.length, btypes: out.btypes.length, affixDesc: out.affixDesc.length, forgeNameMismatch: mismatch.length, namesInWeb: Object.keys(names).length, namesInForge: forge.affixes.length }));
