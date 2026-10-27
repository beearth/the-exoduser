// Offline original-source execution: player -> etype0 damage. No browser/JavaScript in the native player.
// Runs the ORIGINAL game.html functions (meleeRef/_skMul/pAtkMul/_fireKiSlashCrescent/spawnCrescent/updateCrescents/hitArc/hurtE/_poiseHit/mkEn)
// in a vm sandbox. Everything the sandbox does not model (VFX, sound, particles, pets, passives) is a no-op stub; Math.random is a fixed value
// per scenario so crit / no-crit is chosen, never rolled. Elite rolls are replaced by "ordinary" (rollElite -> 0), like Simulation.SpawnNormalEnemy.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
function arg(key, fallback) { const i = process.argv.indexOf(key); return i < 0 ? fallback : process.argv[i + 1]; }
const project = path.resolve(arg('--project', path.resolve(__dirname, '../..')));
const dep = path.resolve(arg('--dependency-root', 'G:/exoduser'));
const acorn = require(require.resolve('acorn', { paths: [dep] }));
const sourcePath = arg('--source', null);
if (!sourcePath) throw Error('--source <game.html of a pinned main commit> is required');
const source = fs.readFileSync(sourcePath, 'utf8');
const sourceSha = crypto.createHash('sha256').update(source).digest('hex');
const fixture = JSON.parse(fs.readFileSync(path.join(project, 'Tools/Fixtures/starter-fixture.json'), 'utf8'));
const ctx = vm.createContext({ fixture });
const run = s => vm.runInContext(s, ctx, { timeout: 20000 });
const anchors = [];

function find(re) { const m = re.exec(source); if (!m) throw Error('not found: ' + re); return m; }
function lineOf(index) { return source.slice(0, index).split('\n').length; }
function exp(name) { const m = find(new RegExp('^(?:const|let|var) +' + name + ' *=', 'm')); const n = acorn.parseExpressionAt(source, m.index + m[0].length, { ecmaVersion: 'latest' }); run('var ' + name + '=(' + source.slice(n.start, n.end) + ');'); anchors.push({ name, line: lineOf(m.index) }); }
const funSources = [];
function fun(name) { const m = find(new RegExp('^function +' + name + ' *[(]', 'm')); const n = acorn.parseExpressionAt(source, m.index, { ecmaVersion: 'latest' }); const text = source.slice(n.start, n.end); funSources.push(text); run(text); anchors.push({ name, line: lineOf(m.index) }); }

// ---- sandbox state ----
run(`var __rnd=0.999;Math.random=function(){return __rnd};
var window={},_charIdx=0,_eqStatCache=null,_eqAffixCache=null,_lEqCache=null,_now=0,_hitSfxCd=0,_critSfxCd=0,_shBufI=0,_txtPerFrame=0,_TXT_BUDGET=999,_impPerFrame=0,_dpsDmg=0,_uqScCtx=null,_uqS={kiPreT:0,poiseOrbT:0},_useGPU=false,_useGL=false,_ESPRITES=[],
P={x:0,y:0,lv:1,baseAtk:15,facing:0,skills:{kiSlash:1},hp:100000,mhp:100000,mp:100,mmp:100,st:100,mst:100,s:'idle',eShield:0,eShieldMax:0,_weaponSeal:0,_killBuff:0,_killMul:0,_atkBon:0},
INV={equipped:{}},STATS={str:0,dex:0,int:0,lck:0},PASSIVES=new Proxy({},{get:()=>0}),
OPT={diff:5,parts:0},G={hitStop:0,slowMo:0,kills:0,_stageDiffOff:0,_sStats:null,_dmgPeak:null,playTime:0,cam:{x:0,y:0}},VW=1920,VH=1080,
ens=[],_crescents=[],_CRES_MAX=16,_cresStep=0,_cresComboT=0,_cresCd=0,_KI_HOLD_STEP=40,_KI_HOLD_MAX=120,_KI_PARRY_WIN=20,wall=false,los=true;
for(var i=0;i<16;i++)_crescents.push({active:false,trail:Array.from({length:5},()=>({x:0,y:0}))});
function isW(){return wall}function hasLOS(){return los}function canMv(){return true}function shQuery(){return ens}function dst(x,y,a,b){return Math.hypot(x-a,y-b)}
function rollElite(){return 0}function rollMods(){return[]}function rollAura(){return null}function safePt(x,y){return{x:x,y:y}}
function _hitSfxForEtype(){return{key:'',pitch:1}}function _L(a){return a}function _T(a){return a}function _r(a,b){return a}function _hurtFieldMobs(){return false}function atkTicketRelease(){}
var SFX=new Proxy({},{get:()=>function(){}});`);
for (const n of ['SLOT_NAMES', '_SK_MUL', 'EL', 'DIFF_LV_OFF', 'DIFF_MUL', 'ETYPE_HP', 'ETYPE_ATK', '_ETYPE_SPD_RAW', 'ETYPE_SPD', 'ETYPE_R', 'ETYPE_POISE', 'ETYPE_COL', 'ETYPE_ERES', 'ELITE_TIERS', 'ELITE_PROB', '_UNDEAD_ET', 'TOTAL_STAGES', '_CH1_OPENING_EXCLUDED_ET', 'STG', 'WTYPES', 'WTYPE_KEYS']) exp(n);
run('var SI_TO_HELL=new Uint8Array(TOTAL_STAGES);var ELC=["#fff","#f80","#8cf","#a3c","#4df","#fff","#fff"];');
const names = ['wp', 'rg1', 'rg2', 'nc', '_uEq', '_lEqRebuild', '_lEq', '_eqStatRebuild', '_eqStat', '_eqAffixRebuild', '_eqAffix', '_lvB', '_slotFlatAtk', 'enhMulAtk',
  'statStr', '_eqImplicit', '_eqLckTotal', 'statCrit', 'statCritDmg', '_passDmgSum', 'pAtkMul', 'pMeleeMul', 'meleeRef', '_skMul', '_kiSlashHoldTier', '_kiSlashHoldMultiplier',
  '_predBonus', '_hunterMul', 'elMul', 'isRareEtype', '_enemyHpPacing', '_poiseHit', 'spawnCrescent', '_fireKiSlashCrescent', 'updateCrescents', 'hitArc', 'mkEn', 'hurtE'];
// shortcut: define stub identifiers BEFORE the real functions that need them are called (function declarations hoist, calls happen later)
for (const n of names) fun(n);

// Every identifier the real functions use that the sandbox does not define becomes a stub: a name that is called -> no-op, any other name -> 0.
const defined = new Set(JSON.parse(run('JSON.stringify(Object.getOwnPropertyNames(globalThis))')));
const wantCall = new Set(), wantValue = new Set();
for (const text of funSources) {
  let prev = null; const toks = [...acorn.tokenizer(text, { ecmaVersion: 'latest' })];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]; if (t.type.label !== 'name') { prev = t; continue; }
    const before = toks[i - 1], after = toks[i + 1];
    if (before && before.type.label === '.') continue;
    if (before && before.type.label === '?.') continue;
    if (after && after.type.label === ':' && before && (before.type.label === '{' || before.type.label === ',')) continue; // object key
    (after && after.type.label === '(' ? wantCall : wantValue).add(t.value);
  }
}
const stubbed = [];
for (const n of wantCall) if (!defined.has(n)) { run('var ' + n + '=function(){};'); stubbed.push(n + '()'); defined.add(n); }
// locals (parameters / const) shadow globals, so declaring the leftovers as 0 never changes a real value
for (const n of wantValue) if (!defined.has(n)) { try { run('var ' + n + '=0;'); } catch (e) {} defined.add(n); }

function J(expr) { return JSON.parse(run('JSON.stringify(' + expr + ')')); }
function r6(v) { return v; }

const wtypes = J('WTYPES'), wtypeKeys = J('WTYPE_KEYS');

// ---- scenarios ----
const levels = Array.from({ length: 30 }, (_, i) => i + 1);
const affixVariants = [[], [{ id: 'sharpAtk', value: 20, tier: 0 }], [{ id: 'sharpAtk', value: 50, tier: 1 }, { id: 'brutalAtk', value: 170, tier: 2 }, { id: 'ruinAtk', value: 20, tier: 0 }]];
const accVariants = [null, { necklaceDmg: 12, ring1Crit: 5, ring1Dmg: 10, bStr: 3, bLck: 40 }];
const steps = [[1, 0], [2, 0], [3, 0], [3, 40], [3, 80], [3, 120]];
const equipped0 = fixture.equipment;
function buildEquip(sc) {
  const eq = JSON.parse(JSON.stringify(equipped0));
  const key = sc.wtype;
  const base = wtypes[key];
  eq.weapon = Object.assign({}, eq.weapon, { wtype: key, atk: sc.atk, spd: base ? base.spdMul : 0.45, wArcW: base.arcW, wRange: base.range, bonusRange: sc.bonusRange, wStagger: base.stagger, affixes: sc.affixes, enh: 0, name: base.name });
  if (sc.acc) {
    eq.necklace = Object.assign({}, eq.necklace, { dmgBonus: sc.acc.necklaceDmg });
    eq.ring1 = Object.assign({}, eq.ring1, { critRate: sc.acc.ring1Crit, dmgBonus: sc.acc.ring1Dmg });
    eq.shield = Object.assign({}, eq.shield, { bStr: sc.acc.bStr, bLck: sc.acc.bLck });
  }
  return eq;
}
const scenarios = [];
let idx = 0;
// plan: the untouched seeded starter (Lv1 warrior, 1-1, kiSlash Lv1, 녹슨 검 atk 18) first, then the Lv1-30 x 7 weapon grid
const plan = [{ starter: true, level: 1, w: 0 }];
for (const level of levels) for (let w = 0; w < wtypeKeys.length; w++) plan.push({ level, w });
for (const { level, w, starter } of plan) {
  {
    const wtype = wtypeKeys[w];
    const affixes = affixVariants[(level + w) % 3];
    const acc = accVariants[(level + w) % 2];
    const kiLv = starter ? 1 : ((level + w) % 20) + 1;
    const si = starter ? 0 : (level + w) % 4;
    const sc = starter ? { level, wtype: fixture.equipment.weapon.wtype, atk: fixture.equipment.weapon.atk, bonusRange: fixture.equipment.weapon.bonusRange, affixes: [], acc: null, kiLv, si, starter: true }
      : { level, wtype, atk: 10 + 3 * w + level, bonusRange: w % 3, affixes, acc, kiLv, si };
    const equip = starter ? JSON.parse(JSON.stringify(equipped0)) : buildEquip(sc);
    run(`INV.equipped=${JSON.stringify(equip)};_eqStatCache=null;_eqAffixCache=null;_lEqCache=null;P.lv=${level};P.baseAtk=${15 + si * 2};P.skills.kiSlash=${kiLv};`);
    sc.baseAtk = 15 + si * 2;
    sc.equipment = equip;
    sc.web = {
      meleeRef: J('meleeRef()'), pAtkMul: J('pAtkMul()'), skMul: J('_skMul("kiSlash")'), critChance: J('statCrit()'), critMult: J('statCritDmg()'),
      ki: [], swing: null
    };
    // etype0 ordinary mob of the stage, level = player level (DIFF_LV_OFF[5] = 0)
    function freshMob() {
      run(`OPT.diff=5;G._stageDiffOff=0;P.lv=${level};var __m=mkEn(60,0,${si},0,false,0,null);__m.id=1;__m.x=60;__m.y=0;ens=[__m];__m.alive=true;`);
      return J('({hp:__m.hp,mhp:__m.mhp,eShield:__m.eShield,eShieldMax:__m.eShieldMax,poise:__m.poise,r:__m.r,lv:__m.lv,atk:__m.atk})');
    }
    const mob = freshMob(); sc.mob = mob;
    for (const crit of [false, true]) {
      for (const [step, charge] of steps) {
        freshMob();
        run(`__rnd=${crit ? 0 : 0.999};P.x=0;P.y=0;P.facing=0;for(var __c of _crescents)__c.active=false;_fireKiSlashCrescent(${step},${charge});`);
        const packetDmg = J('_crescents.find(c=>c.active).dmg');
        const seq = [];
        // up to 4 consecutive hits on the same mob: shield, then hp, poise, stun x1.5
        for (let hit = 0; hit < 4; hit++) {
          if (hit > 0) run(`for(var __c of _crescents)__c.active=false;_fireKiSlashCrescent(${step},${charge});`);
          run('for(var __c of _crescents){if(__c.active){__c.x=0;__c.y=0}} var __before=__m.hp+__m.eShield; updateCrescents(1);');
          const st = J('({hp:__m.hp,eShield:__m.eShield,poise:__m.poise,stunned:__m.stunned,alive:__m.alive,dealt:__before-(__m.hp+__m.eShield)})');
          seq.push(st);
          if (!st.alive) break;
        }
        sc.web.ki.push({ crit, step, charge, packetDmg, seq });
      }
      // ordinary weapon swing (LMB when the active attack is the weapon): baseDmg line from the swing state, then hitArc -> hurtE
      freshMob();
      run(`__rnd=${crit ? 0 : 0.999};P.x=0;P.y=0;P.facing=0;P._atkBon=7;`);
      const seq = [];
      for (let hit = 0; hit < 4; hit++) {
        run(`var __before=__m.hp+__m.eShield; hitArc(0,(wp().wRange||50)+(wp().bonusRange||0)*4,(wp().wArcW||.95),~~(((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))+15)*6),0,"weapon");P._atkBon=7;`);
        const st = J('({hp:__m.hp,eShield:__m.eShield,poise:__m.poise,stunned:__m.stunned,alive:__m.alive,dealt:__before-(__m.hp+__m.eShield)})');
        seq.push(st); if (!st.alive) break;
      }
      sc.web.swingBase = J('~~(((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))+15)*6)');
      (sc.web.swing = sc.web.swing || []).push({ crit, seq });
    }
    scenarios.push(sc); idx++;
  }
}
const result = {
  schema: 'exoduser.unity.damage-parity-oracle.v1',
  source: { path: path.basename(sourcePath), sha256: sourceSha, anchors, stubbedCalls: stubbed.length },
  wtypes, wtypeKeys, scenarios,
  scope: { hurtE_executed: true, mkEn_executed: true, vfx_audio_passives_stubbed: true, elite_roll_replaced_by_ordinary: true, crit_chosen_by_fixed_random: true }
};
const out = arg('--out', path.join(__dirname, 'oracle.json'));
fs.writeFileSync(out, JSON.stringify(result));
const s0 = scenarios[0];
console.log(JSON.stringify({ out, scenarios: scenarios.length, stubbedCalls: stubbed.length, sample: { level: s0.level, wtype: s0.wtype, mob: s0.mob, meleeRef: s0.web.meleeRef, ki0: s0.web.ki[0] } }));
