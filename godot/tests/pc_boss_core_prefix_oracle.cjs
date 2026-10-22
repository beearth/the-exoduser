// PC-BOSS-CORE (2026-10-22) — updateE 앞부분(38584–38884) 원본 VM oracle.
// 고정 스냅샷(source_snapshot/game.html 4d911cdd)의 원문 문장을 그대로 실행한다. 제품 모듈 import 0.
// 사용: node pc_boss_core_prefix_oracle.cjs --cases-file=<in.json> --out-file=<out.json>
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const arg = k => (process.argv.find(a => a.startsWith(k + '=')) || '').slice(k.length + 1);
const casesFile = arg('--cases-file'), outFile = arg('--out-file');
assert(casesFile && outFile, 'cases/out required');
const raw = SNAPSHOT.readBytes(), lines = raw.toString().split('\n');
// 고정 스냅샷 dee094fd(91e2774b7) 갱신: 원본 유골함 mkItem 에 2줄 삽입(새 16156-16157). 이 oracle 의 행 번호는 Godot 모듈
// source_line 과 같은 이전 스냅샷(4d911cdd) 좌표로 유지하고, 바이트를 읽을 때만 새 위치로 옮긴다(16156 이상 +2) —
// pc_move_skills_source_oracle.cjs 와 같은 방식(PC-BOSS-CHASE 2026-10-22).
const SHIFT_AT = 16156, SHIFT_BY = 2;
if (!(lines[SHIFT_AT - 1].includes('원시 효과 키') && lines[SHIFT_AT].startsWith('    if(item.legendarySpecial)delete item[item.legendarySpecial.stat];'))) throw Error('G16156-16157 inserted ossuary lines (91e2774b7) moved');
const L = n => lines[(n >= SHIFT_AT ? n + SHIFT_BY : n) - 1];
// 원문 앵커 확인
assert(L(38584).startsWith('function updateE(e,sp){'));
assert(L(38884).includes('e.st2-=sp;') && L(38884).includes('const _fd0=_ffDir(e.x,e.y)'));
assert(L(31722).startsWith('function _pushOutWall(e)'));
assert(L(31907).startsWith('function _ffMoveE(e,sp,spdMul){'));
assert(L(16938).startsWith('function _isNormalDruidBoss(e)'));
assert(L(20121).startsWith('function _cancelProjCharge(e)'));
assert(L(12463).startsWith('function _r(v,s)'));
assert(L(45506).startsWith('function _spikeTrapSlowPct(lv)'));
assert(L(31723).startsWith('function dst(a,b,c,d)'));
assert(L(32080).startsWith('const _ETYPE_SFX={') && L(32084).startsWith('const _ARCH_SFX={'));
assert(L(30870).startsWith('const ETYPE_RANGE=['));
// 함수/상수 원문 범위 추출(줄 번호 보존을 위해 앞을 개행으로 채운다)
function block(start, endPred) {
  let i = start; while (!endPred(L(i), i)) i++;
  return { start, end: i };
}
function fnEnd(start) { // 들여쓰기 0 의 '}' 로 끝나는 함수
  if (L(start).trim().endsWith('}') && !L(start).trim().endsWith('{')) return start;
  let i = start + 1; while (!(L(i) === '}' || L(i).startsWith('}'))) i++; return i;
}
function constEnd(start) { let i = start; while (!L(i).trimEnd().endsWith(';')) i++; return i; }
const pieces = [];
function add(start, end) { pieces.push({ start, end }); }
add(12463, 12463); add(16938, 16938); add(20121, 20121); add(31722, 31723); add(31907, fnEnd(31907));
add(45506, 45506); add(32080, constEnd(32080)); add(32084, constEnd(32084)); add(30870, constEnd(30870));
// updateE 앞부분: 38584..38884 + 'return {d:d};}' (원문 줄 번호 유지)
pieces.sort((a, b) => a.start - b.start);
let code = ''; let cur = 1;
for (const p of pieces) { code += '\n'.repeat(p.start - cur); for (let n = p.start; n <= p.end; n++) code += L(n) + '\n'; cur = p.end + 1; }
let pre = '\n'.repeat(38584 - 1);
for (let n = 38584; n <= 38884; n++) pre += L(n) + '\n';
pre += 'return {d:d};}\n';
const FILE = 'exoduser-game.html';
const lineOf = () => { const m = new Error().stack.split('\n').map(s => s.match(/exoduser-game\.html:(\d+):/)).filter(Boolean); return m.length ? +m[0][1] : -1; };
const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
const dec = v => { if (v && typeof v === 'object' && !Array.isArray(v)) { if ('__f64' in v) return Buffer.from(v.__f64, 'hex').readDoubleLE(0); const o = {}; for (const k in v) o[k] = dec(v[k]); return o; } if (Array.isArray(v)) return v.map(dec); return v; };
const bits = v => { const b = Buffer.alloc(8); b.writeDoubleLE(v); return b.toString('hex'); };
const enc = v => { if (typeof v === 'number') return { __f64: bits(v) }; if (Array.isArray(v)) return v.map(enc); if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) { if (v[k] === undefined) continue; o[k] = enc(v[k]); } return o; } return v; };
const results = [];
for (const c0 of cases.cases) {
  const c = dec(c0);
  const trace = [];
  const q = { tile: [...c.env.tile], canMv: [...c.env.canMv], realWall: [...c.env.realWall], los: [...c.env.los], rng: [...c.env.rng] };
  const take = (k, fb) => q[k].length ? q[k].shift() : fb;
  const ctx = { Math: Object.create(Math), console };
  ctx.window = { _parryLesson: { active: !!c.env.lesson } };
  ctx.Math.random = () => { const u = take('rng', 0.5); trace.push(['rng', lineOf(), u]); return u; };
  ctx.P = c.p;
  const mapRow = ty => new Proxy({}, { get: (_, tx) => { const w = take('realWall', false); trace.push(['realWall', +tx, ty, w]); return w ? 1 : 0; } });
  ctx.G = { stage: 0, rifts: c.env.rifts || [], mw: 100000, mh: 100000, map: new Proxy({}, { get: (_, ty) => mapRow(+ty) }) };
  ctx._canMvTile = (x, y, r) => { const v = take('tile', true); trace.push(['tile', x, y, r, v]); return v; };
  ctx.canMv = (x, y, r) => { const v = take('canMv', true); trace.push(['canMv', x, y, r, v]); return v; };
  ctx.hasLOS = (x1, y1, x2, y2) => { const v = take('los', true); trace.push(['los', x1, y1, x2, y2, v]); return v; };
  ctx.isW = () => { throw Error('isW_not_expected_in_boss_domain'); };
  ctx._ffDir = (x, y) => { trace.push(['ffDir', x, y]); return c.env.ff ? { x: c.env.ff.x, y: c.env.ff.y } : null; };
  ctx.hurtE = (e, dmg) => { trace.push(['hurt', dmg]); e.hp = e.hp - dmg; };
  ctx._tickProjCharge = (e, sp) => { if (!(e._projChargeT > 0)) return; trace.push(['generic']); e._projChargeT -= sp; if (e._projChargeT <= 0) { e._projChargeT = 0; e._fired = (e._fired || 0) + 1; } };
  for (const n of ['addTxt', 'addParts', 'shake', 'playSample']) ctx[n] = (...a) => trace.push(['present', n, a]);
  ctx.SFX = { block: (...a) => trace.push(['present', 'SFX.block', a]) };
  ctx._T = s => s;
  ctx._isDruidFinale = () => false; ctx._druidFinaleAtk = () => { throw Error('finale'); };
  ctx.pDotDur = () => { throw Error('dot'); }; ctx.pDotDmg = () => { throw Error('dot'); };
  ctx.EL = { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 };
  ctx._mSfxPlaying = c.env.msfx || 0;
  ctx.T = 40;
  vm.createContext(ctx);
  vm.runInContext('var _mSfxPlaying=' + (c.env.msfx || 0) + ';' + code, ctx, { filename: FILE });
  vm.runInContext(pre, ctx, { filename: FILE });
  const e = c.e;
  let ret;
  try { ret = ctx.updateE(e, c.sp); } catch (err) { results.push({ id: c.id, error: String(err) }); continue; }
  results.push(enc({ id: c.id, early: ret === undefined, d: ret ? ret.d : null, enemy: e, player: c.p, trace }));
}
fs.writeFileSync(outFile, JSON.stringify({ sha256: SNAPSHOT.sha256, cases: results.length, results }));
console.log(JSON.stringify({ cases: results.length }));
