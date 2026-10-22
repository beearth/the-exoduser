// PC-HUD-STATS oracle: runs the ORIGINAL game.html bodies (extracted by name, not re-typed) in a VM.
//   grant  : draw() G51733 guard + _grantOssuaryIfNeeded() G45880 + mkItem() G15894 + rollAffixes()
//            with a scripted Math.random sequence and Date.now()=0 → equipped ossuary, draw count, call order.
//   calc_cp: calcCP() G49487 (+statStr/pDefAdd) on a given P/STATS/PASSIVES/INV.
// Input/Output are UTF-8 files (Windows OS.execute console output is not trusted). No npm deps.
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const arg = n => process.argv.slice(2).find(x => x.startsWith(n + '='))?.slice(n.length + 1);
const file = arg('--source-game'), input = arg('--cases-file'), out = arg('--out-file');
if (!file || !input || !out) throw Error('explicit --source-game --cases-file --out-file required');
const src = fs.readFileSync(file, 'utf8');
const tables = JSON.parse(fs.readFileSync(new URL('../data/item_generation_tables.json', import.meta.url), 'utf8'));
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
function fn(name) {
  const re = new RegExp('^function ' + name.replace(/\$/g, '\\$') + '\\(', 'm');
  const m = re.exec(src); if (!m) throw Error('source function missing: ' + name);
  return { name, line: src.slice(0, m.index).split('\n').length, text: blockFrom(m.index) };
}
function lineOf(marker) {
  const idx = src.indexOf(marker); if (idx < 0) throw Error('source marker missing: ' + marker);
  const s = src.lastIndexOf('\n', idx) + 1, e = src.indexOf('\n', idx);
  return { name: marker, line: src.slice(0, idx).split('\n').length, text: src.slice(s, e).trim() };
}
const parts = [fn('rollAffixes'), fn('mkItem'), fn('_grantOssuaryIfNeeded'), fn('statStr'), fn('pDefAdd'), fn('calcCP')];
const drawGuard = lineOf('if(!window._ossGrantChk&&typeof _grantOssuaryIfNeeded===');
const mk = parts.find(p => p.name === 'mkItem').text;
if (!/item\.eDef=60;item\.bonusMp=150;item\.ancPow=0\.25;/.test(mk)) throw Error('ossuary override marker drifted');
if (!/item\.socketCount=0;\s*item\.crystals=\[\];\s*item\.socketQ=\[\];/.test(mk)) throw Error('closed-socket marker drifted');
const grant = parts.find(p => p.name === '_grantOssuaryIfNeeded').text;
if (!/try\{recalcSt\(\)\}catch\(e\)\{\}\s*applyStats\(\);/.test(grant)) throw Error('grant recalc/apply order drifted');
const source = parts.map(p => p.text).join('\n');
const rows = [];
for (const c of JSON.parse(fs.readFileSync(input, 'utf8'))) {
  let error = null; const row = { name: c.name, kind: c.kind };
  try {
    if (c.kind === 'grant') {
      let ri = 0; const math = Object.create(Math);
      math.random = () => { if (ri >= c.rng.length) throw Error('RNG overread'); return c.rng[ri++]; };
      const calls = [];
      const env = { ...structuredClone(tables), Math: math, Date: { now: () => 0 }, P: { lv: c.lv, x: 0, y: 0 },
        INV: { equipped: structuredClone(c.equipped), bag: structuredClone(c.bag) },
        EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 }, _DEMO_MODE: c.demo,
        _DEMO_AFFIX_BANNED: new Set(['sharpAtk', 'brutalAtk', 'ruinAtk', 'overkilDmg', 'staggerExplosion', 'parryExplosion', 'elemConvert']),
        _weaponName: () => '', _uniqueArtBase: () => '', _T: s => s, _rarName: r => 'R' + r,
        notify: () => calls.push('notify'), addTxt: () => calls.push('addTxt'), recalcSt: () => calls.push('recalcSt'), applyStats: () => calls.push('applyStats'),
        WTYPE_KEYS: Object.keys(tables.WTYPES), BTYPE_KEYS: Object.keys(tables.BOWTYPES) };
      vm.runInNewContext(source + '\n_grantOssuaryIfNeeded();', env);
      row.item = JSON.parse(JSON.stringify(env.INV.equipped.ossuary ?? null));
      row.draws = ri; row.calls = calls;
    } else if (c.kind === 'calc_cp') {
      const env = { P: structuredClone(c.P), STATS: structuredClone(c.STATS), PASSIVES: structuredClone(c.PASSIVES),
        INV: { equipped: structuredClone(c.equipped) }, SLOT_NAMES: tables.SLOT_NAMES, Math, Object };
      row.cp = vm.runInNewContext(source + '\ncalcCP();', env);
    } else throw Error('unknown kind ' + c.kind);
  } catch (e) { error = String(e && e.message || e); }
  row.error = error; rows.push(row);
}
fs.writeFileSync(out, JSON.stringify({
  source_functions: [...parts.map(p => ({ name: p.name, line: p.line })), { name: 'draw._ossGrantChk', line: drawGuard.line }],
  slice_sha256: crypto.createHash('sha256').update(source).digest('hex'), rows }), 'utf8');
