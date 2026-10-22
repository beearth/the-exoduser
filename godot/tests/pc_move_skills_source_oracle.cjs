// PC-MOVE-SKILLS independent oracle (2026-10-22): runs UNTOUCHED game.html statements in one Node VM program.
// Source bytes = immutable snapshot godot/source_snapshot/game.html (snapshot.cjs, SHA 4d911cdd…85e5d4).
// Extracted verbatim (one `with` scope so `let` state persists across calls):
//   BINDS/BINDS2 G6188–6206, K/KH/MB G12846–12848, X키 사슬 상수·변수·_harpDist* G12849–12883, MBjust G12884,
//   _r G12463, keydown K/KH G13215 + Shift/전격이동 G13225–13249, keyup G13330–13366, _clearHeldInput G13371–13380,
//   _chkAct/_chkJust/isAct/isJust/_chkHeld/isHeld G14288–14293, wp/sh/bt/ar G16498–16501, _uqS G16515–16517,
//   _uqMoveRefund G16526–16532, _isKiCharging G16832, _shCacheBuf/_shCacheFrom G19785–19786, statStr/statInt G27993/27995,
//   pChargeRange/pChargeGauge G28020–28021, dst G31723, isDimBreach G44322, _isFused G44488, _SK_MUL G44507–44554,
//   _skMul G44556, _canBladeDash/_tickBladeDash/activateBladeDash G45342–45463,
//   update() 조각: G32155–32582(S16b 전체: 프레임 앞 탈출·펫 stub·게이지 회복·홀드·자동발사·비행·끌림·착지·재발사·_dashIframe),
//   G32775(iframes 감소), G32779–32786(기동게이지 최대치), G32985(상태 무관 전격 틱),
//   switch 조각: idle G33032–33039, sBlock G33747–33754, case 'bladeDash' G33943, stagger/pStun G34331–34345.
// 나머지 식별자는 기록 stub(Proxy `with`). 벽(canMv/canMvBlink)·조준(_aimDir)·shQuery 결과는 Godot이 실제로 질의한
// 값을 같은 순서로 공급하고, 원본이 실제로 질의한 좌표를 기록해 Godot 질의와 대조한다(순서·좌표 모두).
// Math.random: 이 구간의 모든 호출 행을 기록(전부 표현 — 사운드 선택·파티클·번개 기둥). 0.5 공급.
// usage: node oracle.cjs <ignored-game.html> <scenario.json> <out.json>   (UTF-8 files)
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const [, scenarioPath, outputPath] = process.argv.slice(2);
assert(scenarioPath && outputPath, 'usage: node oracle.cjs <game.html> <scenario.json> <out.json>');
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const raw = SNAPSHOT.readBytes();
const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
const lines = raw.toString('utf8').split('\n');
const L = (n) => lines[n - 1];
const span = (a, b) => lines.slice(a - 1, b).join('\n');
// ── exact anchors ──
assert(L(6188) === 'let BINDS={' && L(6206) === '};', 'G6188-6206 BINDS');
assert(L(12846) === 'const K={};' && L(12884).startsWith('const MBjust={};'), 'G12846/12884');
assert(L(12851).startsWith('const _HARP_TIER_F=[0,1,6,12];') && L(12883) === 'let _harpGauge=_HARP_GAUGE_MAX;', 'G12851-12883');
assert(L(12463).startsWith('function _r(v,s){'), 'G12463 _r');
assert(L(13215).startsWith('  K[e.code]=true;KH[e.code]=true;'), 'G13215');
assert(L(13225).includes('Shift 사슬: 홀드 시작') && L(13249) === '  }', 'G13225-13249');
assert(L(13330).startsWith('  K[e.code]=false;KH[e.code]=false;') && L(13366).startsWith("  if(e.code==='Space')_handleDeathMenuKeyboard(e);") && L(13367) === '});', 'G13330-13366');
assert(L(13371) === 'function _clearHeldInput(){' && L(13380) === '}', 'G13371-13380');
assert(L(14288).startsWith('function _chkAct(b)') && L(14293).startsWith('function isHeld(action)'), 'G14288-14293');
assert(L(16498).startsWith('function wp()') && L(16501).startsWith('function ar()'), 'G16498-16501');
assert(L(16515).startsWith('let _uqS={') && L(16517).startsWith('  csEchoUsed:false,hdF:-1};'), 'G16515-16517');
assert(L(16526).startsWith('function _uqMoveRefund(cost){') && L(16532) === '}', 'G16526-16532');
assert(L(16832).startsWith('function _isKiCharging()'), 'G16832');
assert(L(19785).startsWith('const _shCacheBuf=') && L(19786).startsWith('function _shCacheFrom(res)'), 'G19785-19786');
assert(L(27993).startsWith('function statStr()') && L(27995).startsWith('function statInt()'), 'G27993/27995');
assert(L(28020).startsWith('function pChargeRange()') && L(28021).startsWith('function pChargeGauge()'), 'G28020-28021');
assert(L(31723).startsWith('function dst(a,b,c,d)'), 'G31723');
assert(L(44322).startsWith('function isDimBreach()') && L(44488).startsWith('function _isFused(key)'), 'G44322/44488');
assert(L(44507) === 'const _SK_MUL={' && L(44554) === '};' && L(44556).startsWith('function _skMul(skId)'), 'G44507-44556');
assert(L(45343).startsWith('function _canBladeDash()') && L(45418).startsWith('function activateBladeDash(dir){') && L(45463) === '}', 'G45342-45463');
assert(L(32155).startsWith('  const _pPrevX=P.x') && L(32582).startsWith('  if(_dashIframe>0){'), 'G32155-32582');
assert(L(32775).startsWith('  if(P.iframes>0)P.iframes=Math.max(0,P.iframes-sp);'), 'G32775');
assert(L(32779).includes('const _cbLvSt=') && L(32786).startsWith('  _harpGauge=Math.min(_harpGauge,_HARP_GAUGE_MAX);'), 'G32779-32786');
assert(L(32985).startsWith("  if(P.s!=='bladeDash'&&P._bdMoveT>0)"), 'G32985');
assert(L(33033).startsWith('    if(P._bdTrigger!=null){') && L(33039) === '    }', 'G33032-33039');
assert(L(33748).startsWith('    if(P._bdTrigger!=null){') && L(33754) === '    }', 'G33747-33754');
assert(L(33943) === "  case 'bladeDash':{_tickBladeDash(sp);break;}", 'G33943');
assert(L(34331) === "  case 'stagger':{" && L(34345) === '    break;}', 'G34331-34345');

const PIECES = [
  [6188, 6206], [12846, 12884], [12463, 12463], [13371, 13380], [14288, 14293], [16498, 16501],
  [16515, 16517], [16526, 16532], [16832, 16832], [19785, 19786], [27993, 27993], [27995, 27995], [28020, 28021], [31723, 31723],
  [44322, 44322], [44488, 44488], [44507, 44554], [44556, 44556], [45342, 45463],
  '__px.api={',
  ' keydown(e){', [13215, 13215], [13225, 13249], ' },',
  ' keyup(e){', [13330, 13366], ' },',
  ' blur(){_clearHeldInput()},',
  ' frame(sp){',
  [32155, 32582], [32775, 32775], [32779, 32786], [32985, 32985],
  '  switch(P.s){',
  "  case 'idle':{", [33032, 33039], '  break;}',
  "  case 'sBlock':{", [33747, 33754], '  break;}',
  [33943, 33943],
  [34331, 34345],
  '  }',
  ' },',
  ' get(){return {_harpGauge,_HARP_GAUGE_MAX,_dashHold,_dashHoldF,_dashTier,_dashActive,_dashLeft,_dashVX,_dashVY,_dashIframe,_dashPhase,',
  '  _harpActive,_harpX,_harpY,_harpVX,_harpVY,_harpDist,_harpMaxDist,_harpHit,_harpTier,_harpHits:_harpHits.length,_harpLandT}},',
  ' set(o){if("gauge" in o)_harpGauge=o.gauge;}',
  '};',
];
const PROG_LINES = [], SRC_MAP = [];
for (const piece of PIECES) {
  if (typeof piece === 'string') { PROG_LINES.push(piece); SRC_MAP.push(0); }
  else for (let n = piece[0]; n <= piece[1]; n++) { PROG_LINES.push(L(n)); SRC_MAP.push(n); }
}
const PROGRAM = PROG_LINES.join(String.fromCharCode(10));

const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
function safe(v) { try { return JSON.parse(JSON.stringify(v, (k, x) => (typeof x === 'object' && x && x.__isEnemy ? 'enemy:' + x.id : x))); } catch (e) { return '[unserializable]'; } }

function runCase(c) {
  const out = { calls: [], random: [], errors: [], canmv: [], aims: 0, shq: 0, frames: [] };
  const feeds = { canmv: (c.canmv || []).slice(), aim: (c.aim || []).slice(), shq: (c.shq || []).slice() };
  const rec = (name, ret) => (...args) => { out.calls.push({ call: name, args: safe(args) }); return typeof ret === 'function' ? ret(...args) : ret; };
  const P = Object.assign({ x: 0, y: 0, r: 15, s: 'idle', st2: 0, iframes: 0, facing: 0, hp: 350, mhp: 350, st: 200, mst: 200, mp: 160, mmp: 160,
    poise: 4, poiseR: 0, baseAtk: 8, skills: {}, activeChargeSk: 'charge', _fused: {}, chargeStocks: 1, maxChargeStocks: 1, chargeCd: 0 }, c.P || {});
  const ctx = {
    console, Infinity, NaN, undefined, Object, Array, JSON, Number, String, Boolean, Set, Map, Error, isFinite, parseInt, parseFloat,
    Math: Object.create(Math), P,
    G: Object.assign({ on: true, paused: false, stage: 0, cam: { x: P.x, y: P.y }, hitStop: 0, shake: 0, _pStats: null }, c.G || {}),
    window: { _parryLesson: undefined }, OPT: { hitStop: 100, shake: 100, parts: 100 }, PASSIVES: Object.assign({ pCharge: 0 }, c.passives || {}),
    INV: { equipped: Object.assign({}, c.equipped || {}) }, EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 },
    ELP: ['#dddddd', '#ff6622', '#44aaff', '#bb55ee', '#ffee44', '#ffdd55'], VH: 1080, VW: 1920, _gpActive: false, _gameFrame: 0, _dtSp: 1,
    SFX: new Proxy({}, { get: (_, k) => rec('SFX.' + String(k)) }),
    performance: { now: () => ctx.__now }, __now: 0,
    _T: (s) => s, _L: (a) => a, _interactKeyFresh: new Map(), _cutSkipHolding: false, _cutSkipHold: 0, _sdTapBuf: 0,
  };
  ctx._eqAffix = (k) => { out.calls.push({ call: '_eqAffix', args: [k] }); return (c.affix || {})[k] || 0; };
  ctx._uEq = (k) => { out.calls.push({ call: '_uEq', args: [k] }); return (c.unique || {})[k] || 0; };
  ctx._lEq = (k) => { out.calls.push({ call: '_lEq', args: [k] }); return (c.legend || {})[k] || 0; };
  ctx.magicRef = () => c.magicRef || 0; ctx.pMagicMul = () => c.pMagicMul || 1; ctx._fuseMul = () => 1;
  ctx._aimDir = () => { out.aims++; if (!feeds.aim.length) { out.errors.push('aim_feed_exhausted'); return 0; } return feeds.aim.shift(); };
  const wall = (kind) => (x, y, r) => {
    out.canmv.push({ kind, x, y, r });
    if (!feeds.canmv.length) { out.errors.push('canmv_feed_exhausted'); return true; }
    return feeds.canmv.shift();
  };
  ctx.canMvBlink = wall('blink'); ctx.canMv = wall('mv');
  ctx.shQuery = (x, y, r) => {
    out.shq++;
    const row = feeds.shq.shift();
    if (!row) { out.errors.push('shq_feed_exhausted'); return []; }
    out.calls.push({ call: 'shQuery', args: [x, y, r] });
    return row.map((e) => { const en = ctx.__ens[e.id] || (ctx.__ens[e.id] = { __isEnemy: true, kb: { x: 0, y: 0 } }); Object.assign(en, e); return en; });
  };
  ctx.__ens = {};
  ctx.hurtE = (e, dmg, ang, noSound, opts, atkEl) => { out.calls.push({ call: 'hurtE', args: [e.id, dmg, ang, !!noSound, safe(opts), atkEl] }); };
  ctx.Math.random = () => {
    const st = (new Error()).stack.split('\n');
    let line = -1;
    for (const frame of st) { const m = frame.match(/oracle-program:(\d+):\d+/); if (m) { line = SRC_MAP[+m[1] - 1] || -1; break; } }
    out.random.push(line); return 0.5;
  };
  const proxy = new Proxy(ctx, {
    has: (target, key) => typeof key === 'string' && !(key in globalThis && !(key in target)),
    get: (target, key) => { if (key === Symbol.unscopables) return undefined; if (key in target) return target[key]; const f = rec(String(key)); target[key] = f; return f; },
    set: (target, key, value) => { target[key] = value; return true; },
  });
  ctx.__px = proxy;
  vm.createContext(ctx);
  vm.runInContext('with(__px){' + PROGRAM + '\n}', ctx, { filename: 'oracle-program', lineOffset: 0 });
  const api = ctx.api;
  if (c.gauge !== undefined) api.set({ gauge: c.gauge });
  const events = (c.events || []).slice();
  for (let f = 0; f < c.frames; f++) {
    while (events.length && events[0].frame === f) {
      const ev = events.shift();
      ctx.__now = ev.t_ms || 0;
      if (ev.type === 'down') api.keydown({ code: ev.code, repeat: !!ev.repeat, preventDefault() {}, target: null });
      else if (ev.type === 'up') api.keyup({ code: ev.code, preventDefault() {}, target: null });
      else if (ev.type === 'blur') api.blur();
      else if (ev.type === 'set_state') { P.s = ev.s; P.st2 = ev.st2 || 0; }
      out.calls.push({ call: 'EVENT', args: [ev.type, ev.code || ev.s || '', f] });
    }
    ctx._gameFrame++;
    out.calls.push({ call: 'FRAME', args: [f] });
    api.frame(1);
    const s = api.get();
    out.frames.push(Object.assign({ f, x: P.x, y: P.y, iframes: P.iframes, s: P.s, st: P.st, mp: P.mp, poise: P.poise, bdMoveT: P._bdMoveT || 0,
      bdTrigger: P._bdTrigger === undefined ? null : P._bdTrigger, bdAng: P._bdAng === undefined ? null : P._bdAng, st2: P.st2, shake: ctx.G.shake, facing: P.facing }, s));
  }
  out.leftover = { canmv: feeds.canmv.length, aim: feeds.aim.length, shq: feeds.shq.length };
  // 호출 행 분류: 사운드 피치 _r(G12463)·playSample 선택·poolPart 파티클·번개 기둥 좌표(_th*/bPts/bAng/bLen) = 표현 전용
  const PRESENTATION = /playSample|poolPart|_thPts|_thBr|_thSegs|_thBW|bPts|bAng|bLen|_cd\[|_vm\[|_ve\[|_pa=|'#44ddff'|'#ffee44'/;
  out.random_lines = [...new Set(out.random)].map((line) => ({ line, presentation: line === 12463 || (line > 0 && PRESENTATION.test(L(line))), text: line > 0 ? L(line).trim().slice(0, 90) : '' }));
  return out;
}

const results = [];
for (const c of scenario.cases || []) {
  let row;
  try { row = runCase(c); } catch (err) { row = { exception: String(err && err.stack || err).split('\n').slice(0, 5).join(' | ') }; }
  row.name = c.name;
  if (row.calls) row.calls = row.calls.filter((x) => ['hurtE', 'playSample', 'addTxt', 'addParts', 'poolPart', 'playVFXAng', 'shake', 'showPH', 'EVENT', 'FRAME', 'shQuery', '_uEq', '_lEq', '_eqAffix'].includes(x.call) || x.call.startsWith('SFX.'));
  results.push(row);
}
fs.writeFileSync(outputPath, JSON.stringify({ schema: 'pc-move-skills-oracle.v1', source_sha256: sha256, cases: results }, null, 1), 'utf8');
console.log('ORACLE_DONE', results.length, results.filter((r) => r.exception).length);
