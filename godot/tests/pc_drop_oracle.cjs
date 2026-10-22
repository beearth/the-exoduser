// PC-BOSS-CHASE C-06 (2026-10-22) — 처치 드랍 rollDrop 원본 VM oracle(같은 RNG 단위 주입).
// 고정 스냅샷(source_snapshot/game.html dee094fd)에서 rollDrop(32004)·mkItem·rollAffixes·mkBonePart(45790)·mkSocketStone(15346)
// ·_stoneTierRoll(15336)·_crAutoProcess(15350)·_qRoll 등을 acorn 으로 원문 그대로 잘라 VM 에서 실행한다. 제품 모듈 import 0.
// 테이블은 원본 리터럴을 평가해 만든 data/item_generation_tables.json(제품 포트와 같은 입력).
// 사용: node pc_drop_oracle.cjs --cases-file=<in.json> --out-file=<out.json>   (NODE_PATH 에 acorn)
// case: {units:[...], enemy:{x,y,etype,elite,ib,dropTier}, plv, drop_bonus, min_pick_rar, min_pick_lv_tier, demo(기본 true=16648 기본값)}
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const { parseExpressionAt } = require('acorn');
const arg = k => (process.argv.find(s => s.startsWith(k + '=')) || '').slice(k.length + 1);
const src = SNAPSHOT.readBytes().toString();
const tables = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/item_generation_tables.json'), 'utf8'));
const fn = name => { const a = src.indexOf('\nfunction ' + name + '(') + 1; assert(a > 0, 'source function absent ' + name); return src.slice(a, parseExpressionAt(src, a, { ecmaVersion: 'latest' }).end); };
const lineAt = name => src.slice(0, src.indexOf('\nfunction ' + name + '(') + 1).split('\n').length;
assert.equal(lineAt('rollDrop'), 32004);
assert.equal(lineAt('mkBonePart'), 45790);
assert.equal(lineAt('mkSocketStone'), 15346);
const ROOT = ['rollDrop', 'mkItem', 'rollAffixes', 'mkBonePart', 'mkSocketStone', '_stoneTierRoll', '_crAutoProcess', '_qRoll', '_qTier', '_qGradeOf', '_qGradeName', '_minPickLvThr'];
// 표시·사운드·저장·외부 상태(값 영향 없음) 또는 시험 입력으로 주는 함수
const STUB = new Set(['_T', '_L', 'addTxt', 'playItemDropSfx', 'playSample', 'notify', 'statDropBonus', '_wiPush', '_crStarN', '_crDefN', 'renderInvCrystals', 'dbSaveNow', 'applyStats', 'recalcSt']);
const extra = [];
function collect(name) { if (STUB.has(name) || ROOT.includes(name) || extra.includes(name)) return; if (src.indexOf('\nfunction ' + name + '(') >= 0) extra.push(name); }
for (let pass = 0; pass < 5; pass++) for (const name of [...ROOT, ...extra]) { for (const m of fn(name).matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)\s*\(/g)) collect(m[1]); }
const CODE = [...ROOT, ...extra].map(fn).join('\n');
// 원문 상수 줄(15178·15259·15872·15891·45786) 그대로
const srcLines = src.split('\n');
const constLine = (n, head) => { assert(srcLines[n - 1].startsWith(head), 'const anchor ' + head); return srcLines[n - 1]; };
const CONSTS = [constLine(15178, 'const DROP_SLOT_POOL='), constLine(15259, 'const CRYSTAL_IDS='), constLine(15872, 'const WTYPE_KEYS='),
  constLine(15891, 'const BTYPE_KEYS='), constLine(45786, 'const _BONE_PART_KO=')].join('\n');
const cases = JSON.parse(fs.readFileSync(arg('--cases-file'), 'utf8'));
const out = [];
for (const c of cases) {
  let ri = 0;
  const math = Object.create(Math);
  math.random = () => { if (ri >= c.units.length) throw Error('RNG overread'); return c.units[ri++]; };
  const items = []; const texts = [];
  const ctx = vm.createContext({
    ...tables, Math: math, Date: { now: () => 0 }, console,
    P: { lv: c.plv, x: 0, y: 0, _greedCurse: 0 }, G: { stage: 0, mats: 0 },
    OPT: { minPickRar: c.min_pick_rar || 0, minPickLvTier: c.min_pick_lv_tier || 0, crAutoFuse: -1, crAutoEnh: -1 },
    EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 },
    SI_TO_HELL: [0, 0, 0, 0], CHAPTER_STAGES: [{ hell: 0, stages: 4, startSi: 0 }], STG: [{ monLv: 100 }],
    CRYSTAL_BAG: [], CRYSTAL_BAG_MAX: 9999, STONE_BAG: [], STONE_BAG_MAX: 9999,
    _DEMO_MODE: c.demo !== false, _DEMO_AFFIX_BANNED: new Set(['sharpAtk', 'brutalAtk', 'ruinAtk', 'overkilDmg', 'staggerExplosion', 'parryExplosion', 'elemConvert']),
    _T: s => s, _L: (a) => a, addTxt: (x, y, t) => texts.push({ x, y, t }), playItemDropSfx() {}, playSample() {}, notify() {},
    statDropBonus: () => c.drop_bonus, _wiPush: wi => items.push(wi), _crStarN: s => (s && s.name) || '', _crDefN: d => (d && d.ko) || '',
  });
  vm.runInContext(CONSTS + '\n' + CODE, ctx);
  ctx.__e = c.enemy;
  let error = null;
  try { vm.runInContext('rollDrop(__e)', ctx); } catch (err) { error = String(err && err.message || err); }
  out.push({ draws: ri, error, items, crystal: ctx.CRYSTAL_BAG[0] || null, stone: ctx.STONE_BAG[0] || null, texts });
}
fs.writeFileSync(arg('--out-file'), JSON.stringify(out));
console.log(JSON.stringify({ cases: out.length, errors: out.filter(o => o.error).length }));
