// PCI-10 oracle: runs the ORIGINAL game.html shaman revive block (updateE `if(e.etype===9&&e.s==='idle'){...}`,
// G38944–38958, extracted by text+brace matching) in a VM against the port's dead pool snapshot.
// UTF-8 file in/out only.
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const arg = n => process.argv.slice(2).find(x => x.startsWith(n + '='))?.slice(n.length + 1);
const file = arg('--source-game'), input = arg('--cases-file'), out = arg('--out-file');
if (!file || !input || !out) throw Error('explicit --source-game --cases-file --out-file required');
const src = fs.readFileSync(file, 'utf8');
function blockFrom(start) {
  let i = src.indexOf('{', start), depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw Error('unbalanced block at ' + start);
}
const needle = "if(e.etype===9&&e.s==='idle'){";
const at = src.indexOf(needle); if (at < 0) throw Error('shaman revive block missing');
if (src.indexOf(needle, at + 1) >= 0) throw Error('shaman revive block not unique');
const block = blockFrom(at);
const line = src.slice(0, at).split('\n').length;
if (!/corpse\.alive=true;corpse\.hp=~~\(corpse\.mhp\*\.5\)/.test(block)) throw Error('revive marker drifted');
const FIELDS = ['alive', 'hp', 'eShield', 'eShieldMax', 's', 'st2', 'stunned', 'poise', 'reviveIframes'];
const rows = [];
for (const c of JSON.parse(fs.readFileSync(input, 'utf8'))) {
  const pool = structuredClone(c.pool);
  const e = structuredClone(c.caster);
  const env = { e, _deadPool: pool, sp: 1, d: 1000, Math, dst: (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2),
    _reviveVFX() {}, addTxt() {}, addParts() {}, _T: s => s, canMv: () => false };
  let error = null;
  try { vm.runInNewContext(block, env); } catch (x) { error = String(x && x.message || x); }
  const idx = pool.findIndex(o => o.alive === true);
  const corpse = idx >= 0 ? Object.fromEntries(FIELDS.map(k => [k, pool[idx][k]])) : null;
  rows.push({ name: c.name, error, selected_index: idx, corpse, reviveT: e.reviveT });
}
fs.writeFileSync(out, JSON.stringify({ rows, block_line: line,
  block_sha256: crypto.createHash('sha256').update(block).digest('hex'),
  source_sha256: crypto.createHash('sha256').update(src).digest('hex') }), 'utf8');
