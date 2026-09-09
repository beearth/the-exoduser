import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import '../stat-panel-ui.js';
const ui=globalThis.ExoduserStatsPanel;
const caps={str:500,dex:500,int:500,lck:500,vit:500};
const defs=[{key:'pAtk',max:10},{key:'pMagic',max:10}];
const state=()=>({stats:{str:5,dex:0,int:0,lck:0,vit:2},grit:3,passives:{pAtk:3,pMagic:0},sp:10,ap:2});

test('planning leaves live allocations untouched and conserves tiered SP/AP',()=>{
  assert.equal(typeof ui.createPlan,'function','draft allocation API must exist');
  const live=state(),before=structuredClone(live),plan=ui.createPlan(live);
  plan.stats.str+=10;plan.passives.pAtk+=1;
  const result=ui.evaluatePlan(plan,live,caps,defs);
  assert.equal(result.sp,0);assert.equal(result.ap,0);
  assert.equal(result.changes,2);assert.deepEqual(live,before);
  plan.passives.pAtk=2;plan.passives.pMagic=3;
  assert.equal(ui.evaluatePlan(plan,live,caps,defs).ap,0);
});
test('planning rejects stale allocations but keeps newly earned unspent points',()=>{
  assert.equal(typeof ui.createPlan,'function');
  const live=state(),plan=ui.createPlan(live);
  plan.stats.str+=10;live.sp+=5;
  assert.equal(ui.evaluatePlan(plan,live,caps,defs).sp,5);
  live.stats.dex=1;
  assert.equal(ui.evaluatePlan(plan,live,caps,defs),null);
});
test('plans reject overspending, unknown fields, nonintegers and cap violations',()=>{
  assert.equal(typeof ui.createPlan,'function');
  for(const mutate of [p=>p.stats.str=501,p=>p.passives.pMagic=4,p=>p.grit=-1,p=>p.stats.dex=0.5,p=>p.passives.unknown=1,p=>p.stats.hack=1]){
    const live=state(),plan=ui.createPlan(live);mutate(plan);
    assert.equal(ui.evaluatePlan(plan,live,caps,defs),null);
  }
});
test('reset plan returns actual tier costs, grit and legacy VIT without mutating live',()=>{
  assert.equal(typeof ui.createPlan,'function');
  const live=state(),plan=ui.createPlan(live);
  for(const k in plan.stats)plan.stats[k]=0;
  for(const k in plan.passives)plan.passives[k]=0;
  plan.grit=0;
  const result=ui.evaluatePlan(plan,live,caps,defs);
  assert.equal(result.sp,20);assert.equal(result.ap,5);
  assert.equal(live.stats.vit,2);
});
test('every live passive has one path and structured numeric effects',()=>{
  assert.equal(typeof ui.passiveEffects,'function');
  const html=fs.readFileSync('game.html','utf8');
  const keys=[...html.split('const PASSIVE_DEF=[')[1].split('\n];')[0].matchAll(/key:'([^']+)'/g)].map(m=>m[1]);
  for(const key of keys){
    assert.equal(ui.paths.filter(p=>p.keys.includes(key)).length,1,key);
    assert.ok(ui.passiveEffects(key,0).length,key);
    for(const r of ui.passiveEffects(key,10))assert.ok(Number.isFinite(r.value),key);
  }
  const crit=ui.passiveEffects('pCrit',4);
  assert.equal(crit[0].value,6);
  assert.equal(ui.passiveEffects('pParry',10)[2].value,50);
  assert.equal(ui.passiveEffects('pGuard',0)[0].value,30);
});
test('Stamina Vessel survives recalculation and does not stack repeatedly',()=>{
  const html=fs.readFileSync('game.html','utf8');
  const source=html.slice(html.indexOf('function recalcSt(){'),html.indexOf('\nfunction itemPower(',html.indexOf('function recalcSt(){')));
  const ctx={STATS:{dex:10},P:{st:20,_crystalStats:null},PASSIVES:{pHuman:0,pStamina:3},SLOT_NAMES:[],_eqAffix:()=>0,_gritStFlat:()=>0,_eqAffixCache:null,_eqStatCache:null};
  vm.createContext(ctx);vm.runInContext(source,ctx);
  ctx.recalcSt();assert.equal(ctx.P.mst,270);
  ctx.recalcSt();assert.equal(ctx.P.mst,270);
  ctx.PASSIVES.pStamina=0;ctx.recalcSt();assert.equal(ctx.P.mst,120);
});
test('removed legacy passives can be refunded but never increased',()=>{
  const live=state();live.passives.pPhysPen=2;
  const plan=ui.createPlan(live);
  assert.ok(ui.evaluatePlan(plan,live,caps,defs));
  plan.passives.pPhysPen=0;
  assert.equal(ui.evaluatePlan(plan,live,caps,defs).ap,4);
  plan.passives.pPhysPen=3;
  assert.equal(ui.evaluatePlan(plan,live,caps,defs),null);
});
test('attribute previews express direct investment and per-second regeneration',()=>{
  assert.equal(typeof ui.statEffects,'function');
  assert.equal(ui.statEffects('str',10)[0].value,10);
  assert.equal(ui.statEffects('str',10)[1].value,50);
  assert.equal(ui.statEffects('str',10)[2].value,1.2);
  assert.equal(ui.statEffects('dex',10).find(r=>r.en==='Maximum ST').value,20);
  assert.equal(ui.statEffects('lck',20)[0].value,0.5);
});
