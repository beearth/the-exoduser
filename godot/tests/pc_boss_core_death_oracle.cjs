// PC-BOSS-CORE (2026-10-22) — 보스 사망 판정 원본 VM oracle.
// 42515–42624 1차 즉시 부활, 42641–42650 2차 폴백 예약, 34493–34535 폴백 타이머 판정 원문을 실행한다.
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const arg = k => (process.argv.find(a => a.startsWith(k + '=')) || '').slice(k.length + 1);
const casesFile = arg('--cases-file'), outFile = arg('--out-file');
assert(casesFile && outFile);
const lines = SNAPSHOT.readBytes().toString().split('\n');
// 고정 스냅샷 dee094fd(91e2774b7) 갱신: 원본 유골함 mkItem 에 2줄 삽입(새 16156-16157). 이 oracle 의 행 번호는 Godot 모듈
// source_line 과 같은 이전 스냅샷(4d911cdd) 좌표로 유지하고, 바이트를 읽을 때만 새 위치로 옮긴다(16156 이상 +2) —
// pc_move_skills_source_oracle.cjs 와 같은 방식(PC-BOSS-CHASE 2026-10-22).
const SHIFT_AT = 16156, SHIFT_BY = 2;
if (!(lines[SHIFT_AT - 1].includes('원시 효과 키') && lines[SHIFT_AT].startsWith('    if(item.legendarySpecial)delete item[item.legendarySpecial.stat];'))) throw Error('G16156-16157 inserted ossuary lines (91e2774b7) moved');
const L = n => lines[(n >= SHIFT_AT ? n + SHIFT_BY : n) - 1];
assert(L(42515).trim() === 'if(e.ib){' && L(42516).includes('e.deaths=(e.deaths||0)+1'));
assert(L(42622).includes('return; // 죽지 않음') && L(42624).trim() === '}');
assert(L(42641).trim() === 'if(e.ib&&!e._bossRevJudged){' && L(42650).trim() === '}');
assert(L(34493).trim() === 'else if(e._reviveTimer>0){' && L(34494).trim() === 'e._reviveTimer-=sp;');
assert(L(34500).trim() === 'if(e.ib){' && L(34536).trim().startsWith('}else if(e._reviveAsGhoul){'));
assert(L(12463).startsWith('function _r(v,s)') && L(31723).startsWith('function dst('));
const pad = (n) => '\n'.repeat(n - 1);
const take = (a, b) => { let s = ''; for (let n = a; n <= b; n++) s += L(n) + '\n'; return s; };
const FILE = 'exoduser-game.html';
const lineOf = () => { const m = new Error().stack.split('\n').map(s => s.match(/exoduser-game\.html:(\d+):/)).filter(Boolean); return m.length ? +m[0][1] : -1; };
const srcHelpers = pad(12463) + L(12463) + '\n' + '\n'.repeat(20057 - 12463 - 1) + L(20057) + '\n' + '\n'.repeat(31723 - 20057 - 1) + L(31723) + '\n';
assert(L(20057).startsWith('function _eMouthXY(e,ang)'));
// 각 조각은 자체 script — 줄 번호는 앞을 개행으로 채워 원문과 같게 한다(함수 헤더는 직전 줄 끝에 붙인다)
const immSrc = pad(42514) + 'function __imm(e){' + '\n' + take(42515, 42624) + 'return {revived:false};}\n';
const resSrc = pad(42640) + 'function __res(e){' + '\n' + take(42641, 42650) + '}\n';
const tickSrc = pad(34493) + 'function __tick(e,sp){if(e._reviveTimer>0){' + '\n' + take(34494, 34535) + '}}}}\n';
const dec = v => { if (v && typeof v === 'object' && !Array.isArray(v)) { if ('__f64' in v) return Buffer.from(v.__f64, 'hex').readDoubleLE(0); const o = {}; for (const k in v) o[k] = dec(v[k]); return o; } if (Array.isArray(v)) return v.map(dec); return v; };
const bits = v => { const b = Buffer.alloc(8); b.writeDoubleLE(v); return b.toString('hex'); };
const enc = v => { if (typeof v === 'number') return { __f64: bits(v) }; if (Array.isArray(v)) return v.map(enc); if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) { if (v[k] === undefined || k === '_bossRef') continue; o[k] = enc(v[k]); } return o; } return v; };
const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8')).cases;
const results = [];
for (const c0 of cases) {
  const c = dec(c0);
  const trace = [];
  const q = { rng: [...c.env.rng], canMv: [...c.env.canMv] };
  const ctx = { Math: Object.create(Math), console };
  ctx.Math.random = () => { const u = q.rng.length ? q.rng.shift() : 0.5; trace.push(['rng', lineOf(), u]); return u; };
  ctx.P = c.p;
  const gt = { stage: 0, _killedBosses: [] };
  ctx.G = new Proxy(gt, { set(t, k, v) { if (k !== '_bossRef') trace.push(['g', k, v]); t[k] = v; return true; } });
  ctx.STG = [{ hell: 0 }];
  ctx._isDruidFinale = () => false;
  ctx._druidFinaleReviveChance = () => { throw Error('finale'); };
  ctx._eqAffix = id => { assert.equal(id, 'antiRevive'); return c.env.suppress; };
  ctx._T = s => s; ctx._L = (ko) => ko;
  ctx.canMv = (x, y, r) => { const v = q.canMv.length ? q.canMv.shift() : true; trace.push(['canMv', x, y, r, v]); return v; };
  ctx.safePt = (x, y, r) => { trace.push(['safePt', x, y, r]); return c.env.safe ? { x: c.env.safe.x, y: c.env.safe.y } : null; };
  ctx.addTxt = (x, y, t, col, life) => trace.push(['text', x, y, t, col, life]);
  for (const n of ['poolPart', 'playVFXAng', '_addBlastLight', '_addTpBolt', 'shake']) ctx[n] = (...a) => trace.push(['present', n, a]);
  ctx.playSample = (...a) => trace.push(['present', 'playSample', a]);
  ctx.hurtP = (d, o) => trace.push(['hurtP', d, o]);
  ctx._spawnBossProjectile = (e, props) => trace.push(['spawn', props]);
  ctx.mkEn = () => { throw Error('companion'); };
  vm.createContext(ctx);
  vm.runInContext(srcHelpers, ctx, { filename: FILE });
  vm.runInContext(immSrc, ctx, { filename: FILE });
  vm.runInContext(resSrc, ctx, { filename: FILE });
  vm.runInContext(tickSrc, ctx, { filename: FILE });
  const e = c.e;
  let out = { id: c.id, mode: c.mode };
  try {
    if (c.mode === 'death') {
      const r = ctx.__imm(e);
      out.revived = r === undefined;
      if (!out.revived) ctx.__res(e);
    } else {
      for (let i = 0; i < c.ticks; i++) ctx.__tick(e, c.sp);
    }
  } catch (err) { out.error = String(err); }
  out.enemy = e; out.player = c.p; out.trace = trace;
  results.push(enc(out));
}
fs.writeFileSync(outFile, JSON.stringify({ sha256: SNAPSHOT.sha256, results }));
console.log(JSON.stringify({ cases: results.length }));
