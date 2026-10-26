// PC-DEFS1: one-off snapshot of the affix definitions as they were before they were merged into affix_defs_web.json
// (forge_web.json affixes/affixUnits and item_card_defs_web.json affixDesc at commit 649802205). Kept as the "before" side of the identity check.
const fs = require('fs');
const [forge, card, out] = process.argv.slice(2);
const f = JSON.parse(fs.readFileSync(forge, 'utf8')), c = JSON.parse(fs.readFileSync(card, 'utf8'));
if (!f.affixes || !c.affixDesc) throw new Error('already merged: nothing to snapshot');
fs.writeFileSync(out, JSON.stringify({ capturedFrom: '649802205', affixes: f.affixes, affixUnits: f.affixUnits, affixDesc: c.affixDesc }));
console.log(JSON.stringify({ affixes: f.affixes.length, affixUnits: f.affixUnits.length, affixDesc: c.affixDesc.length }));
