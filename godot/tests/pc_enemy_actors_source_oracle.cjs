// PC-ENEMY-ACTORS (2026-10-23) — 자연 공급 9종(+자연 29) updateE 원본 VM oracle.
// 고정 스냅샷 godot/source_snapshot/game.html(SNAPSHOT.json sha256) 의 원문 함수/상수를 이름으로 잘라 그대로 실행한다.
// 제품 GDScript 를 읽지 않는다. 경계(env) 함수만 기록용 stub 이며, 경계 안쪽(updateE·mkEn·teleportE·eProjAt·
// _tickProjCharge·_fireChargedProj·_spawnBossProjectile·_ffMoveE·_beanRoll·eModHitP·addParts·_addTp* 등)은 원문이다.
// 사용: node pc_enemy_actors_source_oracle.cjs --cases-file=<in.json> --out-file=<out.json>
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const arg = k => (process.argv.find(a => a.startsWith(k + '=')) || '').slice(k.length + 1);
const casesFile = arg('--cases-file'), outFile = arg('--out-file');
assert(casesFile && outFile, 'cases/out required');
const SRC = SNAPSHOT.readBytes().toString();
const LINES = SRC.split('\n');

// ── 원문 추출(문자열·주석을 건너뛰는 괄호 매칭) ───────────────────────────────
function skipString(s, i) { const q = s[i]; i++; while (i < s.length) { if (s[i] === '\\') { i += 2; continue; } if (s[i] === q) return i + 1; if (q === '`' && s[i] === '$' && s[i + 1] === '{') { i = matchBrace(s, i + 1) + 1; continue; } i++; } return i; }
function matchBrace(s, open) { let depth = 0; for (let i = open; i < s.length; i++) { const c = s[i]; if (c === '"' || c === "'" || c === '`') { i = skipString(s, i) - 1; continue; } if (c === '/' && s[i + 1] === '/') { i = s.indexOf('\n', i); continue; } if (c === '/' && s[i + 1] === '*') { i = s.indexOf('*/', i) + 1; continue; } if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) return i; } } throw Error('unbalanced'); }
function fnSrc(name) { const re = new RegExp('(^|\\n)function ' + name.replace(/\$/g, '\\$') + '\\('); const m = re.exec(SRC); if (!m) throw Error('function ' + name); const a = m.index + m[1].length; const b = SRC.indexOf('{', a); return SRC.slice(a, matchBrace(SRC, b) + 1); }
function lineWith(prefix) { const l = LINES.find(x => x.startsWith(prefix)); if (!l) throw Error('line ' + prefix); return l; }
function constSrc(name) { const re = new RegExp('(^|\\n)const ' + name + '\\s*='); const m = re.exec(SRC); if (!m) throw Error('const ' + name); const a = m.index + m[1].length; let depth = 0; for (let i = SRC.indexOf('=', a) + 1; i < SRC.length; i++) { const c = SRC[i]; if (c === '"' || c === "'" || c === '`') { i = skipString(SRC, i) - 1; continue; } if (c === '/' && SRC[i + 1] === '/') { i = SRC.indexOf('\n', i); continue; } if ('[{('.includes(c)) depth++; else if (']})'.includes(c)) depth--; else if (c === ';' && depth === 0) return SRC.slice(a, i + 1); } throw Error('const end ' + name); }

const CONSTS = ['DIFF_LV_OFF', 'DIFF_MUL', 'ETYPE_ERES', 'ELC', 'ETYPE_HP', 'ETYPE_ATK', '_ETYPE_SPD_RAW', 'ETYPE_SPD', 'ETYPE_R', 'ETYPE_RANGE', 'ETYPE_POISE', 'ETYPE_COL', 'ELITE_TIERS', 'ELITE_PROB', 'MOD_DEFS', 'AURA_DEFS', '_CH1_OPENING_EXCLUDED_ET', '_ETYPE_SFX', '_ARCH_SFX', 'SHASH_CELL', '_MOB8_TOTAL'];
const FNS = ['updateE', '_ffMoveE', '_pushOutWall', 'dst', 'safePt', 'atkTicketRequest', 'atkTicketRelease', '_tickProjCharge', '_fireChargedProj', '_cancelProjCharge', '_spawnBossProjectile', 'eProjAt', '_beanRoll', '_eMouthXY', 'teleportE', 'eModHitP', '_addTpSmoke', '_addTpImpact', '_addTpBolt', '_addBlastLight', 'addParts', 'mkEn', '_enemyHpPacing', '_assignMobSkin', 'rollElite', 'rollMods', 'rollAura', 'isRareEtype', '_r', '_spikeTrapSlowPct', '_isNormalDruidBoss', 'elMul', '_parseCol', '_tickEliteAttackLock', '_claimEliteAttack'];
// 풀 배열 원문(행 단위)
const POOL_LINES = [lineWith('const _ccache='), lineWith('const _TP_SMOKE_MAX='), lineWith('const _TP_IMP_MAX='), lineWith('const _TP_BOLT_MAX='), lineWith('const _BL_MAX=')];
// 적 루프 per-enemy 앞부분 원문(34395~34399 오라 리셋 루프 본문 / 34446~34456 타이머) — 문장 그대로 붙여 쓴다.
const AURA_RESET = LINES.find(l => l.includes("e._aAtkM=1;e._aSpdM=1;e._aDefM=1;e._auraL=null;"));
assert(AURA_RESET, 'aura reset');
const AURA_IDX = LINES.indexOf(AURA_RESET);
const AURA_BODY = [AURA_RESET, LINES[AURA_IDX + 1], LINES[AURA_IDX + 2], LINES[AURA_IDX + 3]].join('\n');
assert(AURA_BODY.includes('_webSlow') && AURA_BODY.includes('_legInjury') && AURA_BODY.includes('_spikeSlow'));
const TIMER_START = LINES.findIndex(l => l.includes('if(e._spawnT>0)e._spawnT--;'));
assert(TIMER_START > 0);
// 원문 34446~34457: 0 _spawnT / 1 주석 / 2 보스 재소환 VFX(ib 전용) / 3~8 stunned·_hitStun·_hitFlash·_stunImmune·_pImmune·_maxStunned / 9 const _eox / 10 reviveIframes / 11 const _ed2
const TIMER_BODY = [0, 3, 4, 5, 6, 7, 8, 10].map(k => LINES[TIMER_START + k]).join('\n');
assert(TIMER_BODY.includes('if(e.stunned>0)e.stunned-=sp;') && TIMER_BODY.includes('if(e.reviveIframes>0)e.reviveIframes') && TIMER_BODY.includes('e._maxStunned=0'));
const PRE_CODE = 'function __outerPrefix(e,sp){\n' + AURA_BODY + '\n' + TIMER_BODY + '\n}';

const CODE = CONSTS.map(constSrc).join('\n') + '\n' + POOL_LINES.join('\n') + '\n' + FNS.map(fnSrc).join('\n') + '\n' + PRE_CODE;

// ── 결정적 난수: 31비트 LCG(GDScript 시험 env 와 같은 식) ────────────────────
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; s = s & 0x7fffffff; return s / 2147483648; }; }

const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8'));
const results = [];
const FIELDS = ['x', 'y', 's', 'st2', 'facing', '_alerted', 'projT', 'projCd', '_projChargeT', 'poise', 'poiseR', 'hp', 'atk', 'speed', 'r', 'stunned', '_hitStun', '_spawnT',
  'teleportT', 'summonT', '_tpWarnT', '_tpWarnX', '_tpWarnY', 'webT', 'swoopT', 'trapT', 'motherT', '_stCloneT', '_stTpCd', '_iceSlamT', 'echDx', 'echDy', '_lastFdx', '_lastFdy', '_sepCd', 'shockMax', '_tpFlashT', '_mSfxCd'];
for (const c of cases.cases) {
  const ev = [];
  let draws = 0;
  const rnd = lcg(c.seed);
  const ctx = { console, Math: Object.create(Math), Infinity, NaN, isFinite, Set, Map, Array, Object, JSON, Number, String, Boolean, parseInt, parseFloat };
  ctx.Math.random = () => { draws++; return rnd(); };
  ctx.window = ctx; ctx._parryLesson = undefined;
  const P = Object.assign({ x: 0, y: 0, r: 14, iframes: 0, s: 'idle', facing: 0, hp: 1000, kb: { x: 0, y: 0 }, _freezeSlow: 0, parryBank: 0, lv: c.lv || 1, st2: 0 }, c.P);
  ctx.P = P;
  ctx.G = { stage: 0, rifts: [], mw: 200, mh: 200, map: new Proxy([], { get: (_, ty) => ty === 'length' ? 200 : new Proxy([], { get: () => 0 }) }), atkTickets: 0, maxAtkTickets: 3, cam: { x: P.x, y: P.y }, _shotWarnings: null, _stageDiffOff: 0, shake: 0, kills: 0 };
  ctx.OPT = { diff: c.diff ?? 5, shake: 100, hitStop: 100, parts: 80, deathFx: true };
  ctx.STG = [{ monLv: 100 }]; ctx.SI_TO_HELL = [0]; ctx.EL = { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 };
  ctx._useGPU = false; ctx._useGL = false; ctx._ESPRITES = {}; ctx.BOSS_MOVES = []; ctx._FDG_DRUID_THORN_FIRST = false;
  ctx._gameFrame = 0; ctx._mSfxPlaying = 0; ctx._deadPool = [];
  ctx.T = 40; ctx.VW = 1920; ctx.VH = 1080; ctx.IS_MOBILE = false; ctx._partCnt = 0; ctx.POOL_SZ = 99999;
  const walls = c.walls || [];
  const blocked = (x, y) => walls.some(w => x >= w[0] && x < w[0] + w[2] && y >= w[1] && y < w[1] + w[3]);
  ctx.isW = (x, y) => blocked(x, y);
  ctx.canMv = (x, y, r) => !blocked(x - r, y - r) && !blocked(x + r, y - r) && !blocked(x - r, y + r) && !blocked(x + r, y + r);
  ctx._canMvTile = ctx.canMv;
  ctx.hasLOS = () => c.los !== false;
  ctx._ffDir = (x, y) => { if (c.ff === null) return null; const a = Math.atan2(P.y - y, P.x - x); return { x: Math.cos(a), y: Math.sin(a) }; };
  ctx._isDruidFinale = () => false; ctx._druidFinaleUpdate = () => false; ctx._bossPhaseCheck = () => { throw Error('boss'); };
  ctx._T = s => s; ctx._L = (ko) => ko;
  const others = (c.others || []).map(o => Object.assign({ alive: true, r: 20, etype: 0, kb: { x: 0, y: 0 } }, o));
  ctx.ens = [];
  ctx.shQuery = (x, y, r) => { const S = ctx.SHASH_CELL; const out = []; const cx0 = ~~((x - r) / S), cx1 = ~~((x + r) / S), cy0 = ~~((y - r) / S), cy1 = ~~((y + r) / S); for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) for (const o of ctx.ens) { if (o && o.alive && ~~(o.x / S) === cx && ~~(o.y / S) === cy) out.push(o); } return out; };
  ctx.projs = [];
  ctx._recycleProj = p => ev.push(['recycleProj', p._tag]);
  const rec = (name) => (...a) => { ev.push([name, ...a.map(v => (v && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) : v)]); };
  for (const n of ['addTxt', 'poolPart', 'playSample', 'shake', 'playVFXAng', '_addBoom', 'bigImpact', 'doParry']) ctx[n] = rec(n);
  ctx.hurtE = (e, d) => ev.push(['hurtE', d]);
  ctx.SFX = new Proxy({}, { get: (_, k) => rec('SFX.' + String(k)) });
  ctx.hurtP = (d, o) => { ev.push(['hurtP', d, o ? JSON.parse(JSON.stringify(o)) : null]); };
  ctx.isPWin = () => { const v = !!c.pwin; ev.push(['isPWin', v]); return v; };
  ctx._poiseHit = (e, a) => ev.push(['poiseHit', a]);
  ctx.ar = () => ({ el: c.armorEl ?? 0 });
  ctx._emitEnemyShot = (e, props) => { ev.push(['shot', JSON.parse(JSON.stringify(props))]); return null; };
  ctx.spawnProj = (props) => { const p = JSON.parse(JSON.stringify(props)); p._tag = 'p' + ctx.projs.length; ctx.projs.push(p); ev.push(['proj', p]); return p; };
  vm.createContext(ctx);
  vm.runInContext(CODE, ctx, { filename: 'exoduser-game.html' });
  ctx.window._noProjEtypes = undefined;
  // 생성: 실제 mkEn(위치 x,y, stage0, etype, ib=false, el, room)
  const e = ctx.mkEn(c.spawn.x, c.spawn.y, 0, c.etype, false, c.el === null || c.el === undefined ? undefined : c.el, c.room ?? 0);
  if (!e) { results.push({ id: c.id, error: 'mkEn_null' }); continue; }
  if (c.override) Object.assign(e, c.override);
  ctx.ens.push(e); for (const o of others) ctx.ens.push(o);
  const ctorDraws = draws;
  const created = JSON.parse(JSON.stringify(e));
  const ticks = [];
  for (let t = 0; t < c.ticks; t++) {
    draws = 0; ev.length = 0; ctx._mSfxPlaying = 0; ctx._gameFrame++;
    const before = ctx.ens.length;
    try { ctx.__outerPrefix(e, c.sp); ctx.updateE(e, c.sp); } catch (err) { ticks.push({ t, error: String(err && err.message || err) }); break; }
    const spawned = ctx.ens.slice(before).map(n => n ? { etype: n.etype, x: n.x, y: n.y, hp: n.hp, mhp: n.mhp, el: n.el === undefined ? null : n.el, eShield: n.eShield, speed: n.speed, r: n.r, st2: n.st2, facing: n.facing } : null);
    const snap = {}; for (const k of FIELDS) snap[k] = e[k] === undefined ? null : e[k];
    snap.kbx = e.kb.x; snap.kby = e.kb.y;
    ticks.push({ t, draws, e: snap, ev: ev.map(x => x), spawned, P: { kbx: P.kb.x, kby: P.kb.y, _freezeSlow: P._freezeSlow, parryBank: P.parryBank } });
  }
  results.push({ id: c.id, etype: c.etype, ctorDraws, created, ticks });
}
fs.writeFileSync(outFile, JSON.stringify({ sha256: SNAPSHOT.sha256, cases: results.length, results }));
console.log(JSON.stringify({ cases: results.length, ok: results.filter(r => !r.error).length }));
