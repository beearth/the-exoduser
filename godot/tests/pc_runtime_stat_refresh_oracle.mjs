// PC-RUNTIME-STATS oracle: runs the ORIGINAL game.html applyStats()/recalcSt()/
// _refreshEquipmentStats() bodies (extracted by name, not re-typed) in a VM per case.
// Input/Output are UTF-8 files (Windows OS.execute console output is not trusted).
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const arg = n => process.argv.slice(2).find(x => x.startsWith(n + '='))?.slice(n.length + 1);
const file = arg('--source-game'), input = arg('--cases-file'), out = arg('--out-file');
if (!file || !input || !out) throw Error('explicit --source-game --cases-file --out-file required');
const src = fs.readFileSync(file, 'utf8');

function blockFrom(start) {
  // brace matching that skips '...', "...", `...` and // comments
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
function fn(name) {
  const re = new RegExp('^function ' + name.replace(/\$/g, '\\$') + '\\(', 'm');
  const m = re.exec(src); if (!m) throw Error('source function missing: ' + name);
  return { name, line: src.slice(0, m.index).split('\n').length, text: blockFrom(m.index) };
}
function line(prefix) {
  const idx = src.indexOf('\n' + prefix); if (idx < 0) throw Error('source line missing: ' + prefix);
  const end = src.indexOf('\n', idx + 1);
  return { name: prefix, line: src.slice(0, idx + 1).split('\n').length, text: src.slice(idx + 1, end) };
}
function constArray(prefix) {
  const idx = src.indexOf('\n' + prefix); if (idx < 0) throw Error('source const missing: ' + prefix);
  const end = src.indexOf('];', idx); return { name: prefix, line: src.slice(0, idx + 1).split('\n').length, text: src.slice(idx + 1, end + 2) };
}
const parts = [
  line('const SLOT_NAMES='), line('const _diffSigned='), constArray('const Q_GRADES=['),
  fn('_eqAffixRebuild'), fn('_eqAffix'), fn('_eqStatRebuild'), fn('_eqStat'), fn('_eqImplicit'),
  fn('_lvB'), fn('pPredSpd'), fn('_gritTotal'), fn('_gritHpFlat'), fn('_gritMpFlat'), fn('_gritStFlat'),
  fn('_qGemMul'), fn('_qGradeOf'), fn('socketMul'), fn('crystalEffects'),
  fn('applyStats'), fn('recalcSt'), fn('_refreshEquipmentStats'),
];
if (!/P\.mhp=~~\(\(_stgHp/.test(parts.find(p => p.name === 'applyStats').text)) throw Error('applyStats marker drifted');
if (!/applyStats\(\);\s*P\.hp=Math\.min\(P\.mhp,_eqHP\)/.test(parts.find(p => p.name === '_refreshEquipmentStats').text)) throw Error('equipment refresh marker drifted');
const prelude = 'var _eqAffixCache=null,_eqAffixVer=0,_eqStatCache=null,_lEqCache=null;\n';
const source = prelude + parts.map(p => p.text).join('\n');
const FIELDS = ['hp', 'mhp', 'st', 'mst', 'mp', 'mmp', 'shield', 'mshield', 'hpR', 'stR', 'mpR', 'speed', '_oocSpeed',
  'baseDef', 'baseAtk', 'maxPoise', 'poise', 'poiseR', '_effStats', '_crystalStats'];
const rows = [];
for (const c of JSON.parse(fs.readFileSync(input, 'utf8'))) {
  const P = structuredClone(c.P);
  const env = { P, G: structuredClone(c.G), STATS: structuredClone(c.STATS), PASSIVES: structuredClone(c.PASSIVES),
    INV: structuredClone(c.INV), OPT: { diff: c.diff }, _grit: c.grit, CRYSTAL_DEFS: {}, CRYSTAL_STAR: {}, Math, Set };
  const call = c.mode === 'equipment_refresh' ? '_refreshEquipmentStats();' : 'applyStats();';
  let error = null;
  try { vm.runInNewContext(source + '\n' + call, env); } catch (e) { error = String(e && e.message || e); }
  const p = {}; for (const k of FIELDS) if (k in P) p[k] = P[k];
  rows.push({ name: c.name, mode: c.mode, error, p });
}
fs.writeFileSync(out, JSON.stringify({
  source_functions: parts.map(p => ({ name: p.name, line: p.line })),
  slice_sha256: crypto.createHash('sha256').update(source).digest('hex'), rows }), 'utf8');
