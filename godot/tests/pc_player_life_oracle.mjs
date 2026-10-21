// PCI-01 oracle: runs the ORIGINAL game.html die()/_fallenResolve()/_refillRespawnResources()
// bodies (extracted by name) and the retry/lobby source statements (extracted by text) in a VM.
// UTF-8 file in/out only (Windows OS.execute console output is not trusted).
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
function fn(name) {
  const m = new RegExp('^function ' + name + '\\(', 'm').exec(src); if (!m) throw Error('source function missing: ' + name);
  return { name, line: src.slice(0, m.index).split('\n').length, text: blockFrom(m.index) };
}
function stmt(needle) {
  const idx = src.indexOf(needle); if (idx < 0) throw Error('source statement missing: ' + needle);
  const ls = src.lastIndexOf('\n', idx) + 1, le = src.indexOf('\n', idx);
  return { name: needle, line: src.slice(0, idx).split('\n').length, text: src.slice(ls, le).trim() };
}
const die = fn('die'), resolve = fn('_fallenResolve'), refill = fn('_refillRespawnResources');
const expLoss = stmt('const expLoss=~~(P.exp*0.3);\n  P.exp=Math.max(0,P.exp-expLoss);');
const expLossText = 'const expLoss=~~(P.exp*0.3);P.exp=Math.max(0,P.exp-expLoss);';
const reset = stmt("P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle';P.iframes=300;P.kb={x:0,y:0};");
const lobby = stmt("if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}");
const FIELDS = ['hp', 'mp', 'st', 'shield', 's', 'st2', 'iframes', '_reviveOnceUsed', '_demonRevCd', '_fallenAng',
  '_fallenRevChance', '_fallenCanRevive', 'exp', 'burnT', '_freezeSlow', '_rbBurn'];
const el = () => ({ classList: { add() {}, remove() {}, contains() { return false } }, style: {}, textContent: '', innerHTML: '' });
function env(c) {
  const P = structuredClone(c.P);
  const rnd = [...(c.random || [])];
  const M = Object.create(Math); M.random = () => (rnd.length ? rnd.shift() : 0.5);
  return { P, G: { slowMo: 0, _fireZones: null, stage: 0, kills: 0, comboMax: 0 }, PASSIVES: structuredClone(c.PASSIVES || {}),
    OPT: { shake: 100 }, Math: M, _BOOTH_MODE: false, _boothDeadF: -1, _gxTurret: null, _xbowEquipped: false, _uqS: {},
    _eqAffix: id => (c.affix && c.affix[id]) || 0, _eqImplicit: () => 0, _uEq: () => 0, _rageMax: () => 100,
    ultUnmute() {}, playSample() {}, addTxt() {}, _T: s => s, _L: s => s, shake() {}, dst: () => 9e9, _r: v => v,
    SFX: { beamStop() {}, die() {}, levelup() {} }, _stopShieldLoop() {}, _petSayCD() {}, _petOnDeath() {}, poolPart() {},
    _ddDeaths: 0, _ddChapDeathMap: {}, _resetInteractInput() {}, BGM: { fadeOut() {}, play() {} }, setTimeout() {},
    $: el, HELL_NAMES: [], STG: [{ hell: 0 }], _dmgLog: [], _DMG_LOG_MAX: 10,
    isDimBreach: () => false, ar: () => ({}), bt: () => ({}), _isFused: () => false,
    _HARP_GAUGE_BASE_CELLS: 4, _HARP_GAUGE_COST: [0, 10], _HARP_GAUGE_MAX: 0, _harpGauge: 0 };
}
const rows = [];
for (const c of JSON.parse(fs.readFileSync(input, 'utf8'))) {
  const e = env(c);
  let code;
  switch (c.op) {
    case 'die': code = die.text + '\ndie();'; break;
    case 'resolve': code = resolve.text + '\n_fallenResolve();'; break;
    case 'retry': code = refill.text + '\n' + expLossText + '\n' + reset.text + '\n/* applyStats() 생략: 같은 스탯이면 최대치 불변 */\n_refillRespawnResources();'; break;
    case 'lobby': code = lobby.text; break;
    default: throw Error('unknown op ' + c.op);
  }
  let error = null;
  try { vm.runInNewContext(code, e); } catch (x) { error = String(x && x.message || x); }
  const p = {}; for (const k of FIELDS) if (k in e.P) p[k] = e.P[k];
  rows.push({ name: c.name, op: c.op, error, p, G: { slowMo: e.G.slowMo, on: e.G.on } });
}
const sliceText = [die, resolve, refill, expLoss, reset, lobby].map(p => p.text).join('\n');
fs.writeFileSync(out, JSON.stringify({
  rows, slice_sha256: crypto.createHash('sha256').update(sliceText).digest('hex'),
  source_sha256: crypto.createHash('sha256').update(src).digest('hex'),
  source_functions: [die, resolve, refill, expLoss, reset, lobby].map(p => ({ name: p.name.slice(0, 40), line: p.line })),
}), 'utf8');
