// D01 drop oracle exporter: runs the ORIGINAL game.html mkItem / rollAffixes / rollDrop (equipment half) / _wiPush in a Node VM with a seeded
// Math.random and writes oracle.json. Nothing here is a hand-written expectation; the native runtime never executes JS.
//   node export.cjs [--source G:/exoduser/game.html] [--out oracle.json] [--mk 3000] [--drop 1500] [--push 400] [--seed 20261027]
const fs = require('fs'), vm = require('vm'), path = require('path'); const L = require('./lib.cjs');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const sourcePath = arg('--source', 'G:/exoduser/game.html'), outPath = arg('--out', path.join(__dirname, 'oracle.json'));
const NMK = +arg('--mk', 3000), NDROP = +arg('--drop', 1500), NPUSH = +arg('--push', 400), SEED = +arg('--seed', 20261027);
const g = L.load(sourcePath), src = g.text;

// ---- original declarations, sliced by text anchor ----
const need = (t) => { if (!src.includes(t)) throw new Error('anchor changed: ' + t); return t; };
const lit = (name) => { const r = L.literal(src, 'const ' + name + '='); return 'const ' + name + '=' + r.text + ';'; };
const parts = [];
parts.push(lit('EL'), lit('RARITY_MUL'), lit('AFFIX_POOL'), lit('_AFSLOT'), lit('IMPLICIT_TABLE'), lit('LEGENDARY_SPECIAL'), lit('UNIQUE_ART'), lit('UNIQUE_SPECIAL'),
  lit('SLOT_NAMES'), lit('SLOT_EMOJI'), lit('WTYPES'), lit('_WP_MOD'), lit('BOWTYPES'));
parts.push(need('const DROP_SLOT_POOL=SLOT_NAMES.filter(s=>s!==\'ossuary\');'), need('const WTYPE_KEYS=Object.keys(WTYPES);'), need('const BTYPE_KEYS=Object.keys(BOWTYPES);'));
const bannedStart = src.indexOf('const _DEMO_AFFIX_BANNED='); parts.push(src.slice(bannedStart, src.indexOf(';', bannedStart) + 1));
for (const f of ['_uniqueArtBase', 'rollAffixes', '_weaponName', 'mkItem', '_minPickLvThr', '_wiPush']) parts.push(L.fn(src, f));
// rollDrop up to (not including) the bone-part drop block; the equipment half ends with the dropCount if/else, so one closing brace finishes the function
const rdStart = src.indexOf('function rollDrop(e){'), rdCut = src.indexOf('  // ═══ 유골 부위 드롭', rdStart);
if (rdStart < 0 || rdCut < 0) throw new Error('rollDrop anchors');
const rollDropEquip = src.slice(rdStart, rdCut) + '}';
parts.push(rollDropEquip);

// ---- PRNG shared with the C# oracle (mulberry32) ----
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let gen = mulberry32(1), draws = 0;
const rndMath = Object.create(null); for (const k of Object.getOwnPropertyNames(Math)) rndMath[k] = Math[k];
rndMath.random = () => { draws++; return gen(); };
const NOW = 1700000000000;
const worldItems = [];
const ctx = vm.createContext({
  Math: rndMath, Date: { now: () => NOW }, performance: { now: () => 12345.678 }, console, Uint8Array,
  P: { lv: 1, _greedCurse: 0 }, G: { stage: 0 }, OPT: { minPickRar: 0, minPickLvTier: 0 }, _DEMO_MODE: false, _L: (a) => a,
  SI_TO_HELL: new Proxy({}, { get: (_, k) => Math.floor(+k / 5) }), CHAPTER_STAGES: Array.from({ length: 12 }, (_, i) => ({ startSi: i * 5, stages: 5 })),
  statDropBonus: () => ctx.__bonus, __bonus: 1, worldItems, playItemDropSfx() {},
});
vm.runInContext(parts.join('\n'), ctx);
// capture pushes made by rollDrop's _wiPush call; keep the real _wiPush for the cap test
vm.runInContext('var __pushed=[];const __realPush=_wiPush;_wiPush=function(w){__pushed.push(w)};', ctx);

const plain = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'number' && Number.isNaN(v)) ? 'NaN' : v));
const pick = (r, a) => a[Math.floor(r() * a.length)];
const SLOTS = ['weapon', 'shield', 'boots', 'armor', 'helmet', 'bow', 'gloves', 'pants', 'belt', 'necklace', 'ring1', 'ring2', 'cape', 'bracelet', 'headband', 'headband2'];
const WT = ['sword', 'dagger', 'hammer', 'mace', 'club', 'axe', 'spear'], BT = ['crossbow', 'repeater', 'arcane'];
const caseRng = mulberry32(SEED);
const out = { schema: 'exoduser.unity.drop-oracle.v1', source: { path: sourcePath, sha256: g.sha, lines: g.lines.length, note: 'original mkItem/rollAffixes/rollDrop(equipment half)/_wiPush executed unchanged; stubs: Math.random (mulberry32), Date.now, P.lv, OPT, statDropBonus, SI_TO_HELL, CHAPTER_STAGES' } };

// ---- mkItem ----
out.mk = [];
for (let i = 0; i < NMK; i++) {
  const slot = SLOTS[i % SLOTS.length], rarity = Math.floor(caseRng() * 6), tier = Math.floor(caseRng() * 5), el = Math.floor(caseRng() * 6);
  const lv = pick(caseRng, [1, 7, 10, 99, 100, 199, 200, 250, 399, 400, 500, 999, 1000, 2000]);
  let wtype = null; const r = caseRng();
  if (slot === 'weapon' && r < .5) wtype = pick(caseRng, WT); if (slot === 'bow' && r < .5) wtype = pick(caseRng, BT);
  const demo = caseRng() < .15, seed = Math.floor(caseRng() * 2 ** 31);
  gen = mulberry32(seed); draws = 0; ctx.P.lv = lv; ctx._DEMO_MODE = demo; vm.runInContext('rollAffixes._c=null', ctx);
  ctx.__args = [slot, tier, el, rarity, wtype === null ? undefined : wtype];
  const item = vm.runInContext('mkItem(...__args)', ctx);
  out.mk.push({ in: { slot, tier, el, rarity, wtype, lv, seed, demo }, out: plain(item), draws });
}
// ---- rollAffixes alone (all slots incl. bracelet sub types, grade 0..5, level bonus) ----
out.affix = [];
for (let i = 0; i < Math.floor(NMK / 3); i++) {
  const slot = SLOTS[i % SLOTS.length], grade = Math.floor(caseRng() * 7) % 6, brType = slot === 'bracelet' ? pick(caseRng, ['demon', 'life']) : undefined;
  const lv = pick(caseRng, [1, 100, 199, 200, 400, 600, 1000, 3000]), demo = caseRng() < .2, seed = Math.floor(caseRng() * 2 ** 31);
  gen = mulberry32(seed); draws = 0; ctx.P.lv = lv; ctx._DEMO_MODE = demo; vm.runInContext('rollAffixes._c=null', ctx); ctx.__args = [grade, slot, brType];
  const res = vm.runInContext('rollAffixes(...__args)', ctx);
  out.affix.push({ in: { slot, grade, brType: brType || null, lv, seed, demo }, out: plain(res), draws });
}
// ---- rollDrop (equipment half) ----
out.drop = [];
const kinds = ['normal', 'normal', 'normal', 'elite', 'mini', 'stageBoss', 'chapterBoss'];
for (let i = 0; i < NDROP; i++) {
  const kind = pick(caseRng, kinds); const stage = Math.floor(caseRng() * 60);
  const chapterFinal = kind === 'chapterBoss'; const si = chapterFinal ? (Math.floor(stage / 5)) * 5 + 4 : (kind === 'stageBoss' ? Math.floor(stage / 5) * 5 + Math.floor(caseRng() * 4) : stage);
  const e = { ib: kind === 'stageBoss' || chapterFinal, etype: kind === 'mini' ? 90 + Math.floor(caseRng() * 10) : Math.floor(caseRng() * 80), elite: kind === 'elite' ? 1 + Math.floor(caseRng() * 3) : 0, dropTier: Math.floor(caseRng() * 5), x: Math.round(caseRng() * 4000) / 2, y: Math.round(caseRng() * 4000) / 2 };
  const bonus = pick(caseRng, [0.3, 0.8, 1, 1.0165, 1.3, 2.5, 5]), curse = caseRng() < .15;
  const minPickRar = pick(caseRng, [0, 0, 0, 1, 2, 3]), minPickLvTier = pick(caseRng, [0, 0, 0, 1, 3, 7]);
  const lv = pick(caseRng, [1, 50, 100, 250, 500, 999, 1000]), demo = caseRng() < .1, seed = Math.floor(caseRng() * 2 ** 31);
  gen = mulberry32(seed); draws = 0; ctx.P.lv = lv; ctx.P._greedCurse = curse ? 1 : 0; ctx.G.stage = si; ctx.OPT.minPickRar = minPickRar; ctx.OPT.minPickLvTier = minPickLvTier; ctx._DEMO_MODE = demo; vm.runInContext('rollAffixes._c=null', ctx); ctx.__bonus = bonus; ctx.__e = e;
  vm.runInContext('__pushed.length=0;rollDrop(__e)', ctx);
  out.drop.push({ in: { kind, stage: si, e, bonus, curse, minPickRar, minPickLvTier, lv, demo, seed }, out: { draws, items: plain(vm.runInContext('__pushed', ctx)) } });
}
// ---- _wiPush cap ----
out.push = [];
for (let i = 0; i < NPUSH; i++) {
  const n = 1 + Math.floor(caseRng() * 60), seq = []; for (let k = 0; k < n; k++) seq.push(Math.floor(caseRng() * 6));
  ctx.__list = []; ctx.__seq = seq;
  const res = vm.runInContext('(function(){const l=[];let id=1;for(const r of __seq){__realPush.call(null,{type:\'item\',item:{rarity:r},picked:false,id:id++,x:0,y:0});}return worldItems.map(w=>w.id)})()', ctx);
  worldItems.length = 0;
  out.push.push({ seq, ids: plain(res) });
}
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({ mk: out.mk.length, affix: out.affix.length, drop: out.drop.length, push: out.push.length, dropItems: out.drop.reduce((s, c) => s + c.out.items.length, 0), sha: g.sha }));
