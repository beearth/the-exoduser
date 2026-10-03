// Whole actual applyStats/recalcSt/grit/stat/affix readers. Actual whole
// dbRestore feeds the restored grit value into the calculation fixture; these
// are separate VM contexts, not a full boot pipeline. Elemental-defense const
// is extracted separately from hurtP; damage/health collision is not executed.
// Equipment/state are synthetic; no crystals/user storage/native/DOM/audio.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;
assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/levelUpResourceRefreshAcceptance.test.cjs'),'utf8'),end=helper.indexOf('for (const source of sources) {');assert(end>0);
function calculations(base){
 const proxy={...fs,readFileSync:(p,...args)=>{
  if(['game.html','game-easy-test.html'].includes(path.basename(p))&&path.dirname(p)===root)p=path.join(base,path.basename(p));
  return fs.readFileSync(p,...args);
 }};
 const c={require:n=>n==='node:fs'?proxy:require(n),__dirname:path.join(root,'test'),console:{log:()=>{}},structuredClone};
 vm.createContext(c);vm.runInContext(helper.slice(0,end)+'\nglobalThis.h={sources,fixture};',c);return c.h;
}
const actual=calculations(dir),original=calculations(baseline),plain=x=>JSON.parse(JSON.stringify(x));
const restoreHelper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8');
const rh={require,__dirname:path.join(root,'test'),process,console};vm.createContext(rh);vm.runInContext(restoreHelper.slice(0,restoreHelper.indexOf("for(const file of ['game.html'")),rh);
const restoreCode=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,rh.extract(f,dir)]));
function restored(file,raw){
 const c=rh.fixture(restoreCode[file]);const data={player:{lv:20,hp:10000,mp:10000,st:10000,shield:10000,exp:0,maxExp:100000,sp:3,ap:0},grit:raw,gritCostModeV2:true};
 assert.equal(c.dbRestore(data),true);return {value:vm.runInContext('_grit',c),raw:data.grit};
}
function edefSource(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>s.includes('function applyStats('));
 const mark='const totalEDef=';assert.equal(src.split(mark).length,2);const at=src.indexOf(mark),end=src.indexOf(';',at);const code=src.slice(at,end+1);acorn.parse(code,{ecmaVersion:'latest'});return code;
}
function consume(h,file,base,grit,{gear=false,level=20,current=[10000,10000,10000,10000]}={}){
 const src=h.sources.find(s=>s.filename===file),equipped=gear?{boots:{bStr:2,bDex:3,bInt:4,bGrit:5,bonusHp:11,bonusMp:13,bonusSt:19,enh:2,
   affixes:[{id:'gritFlatN',value:'3'},{id:'gritFlatR',value:2}],crystals:[]}}:{};
 const f=h.fixture(src,{lv:level,grit,equipped,stats:{str:5,dex:3,int:4,lck:2},passives:{pHuman:1,pVital:1,pStamina:1,pFortify:1,pArmor:1},current});
 f.ctx.applyStats();const once=plain(f.P);f.ctx.applyStats();assert.deepEqual(plain(f.P),once,'recalculation must not repeatedly add grit or heal');
 const access={hm:'helmet',nc:'necklace',rg1:'ring1',rg2:'ring2',cp:'cape',sh:'shield',ar:'armor',bt:'boots',gl:'gloves',pt:'pants',blt:'belt'};
 for(const [name,slot] of Object.entries(access))f.ctx[name]=()=>f.ctx.INV.equipped[slot]||{};
 f.ctx._enhEDef=0;vm.runInContext(edefSource(file,base)+'\nglobalThis.elementalDefense=totalEDef',f.ctx);
 return {gt:f.ctx._gritTotal(),hp:f.ctx._gritHpFlat(),mp:f.ctx._gritMpFlat(),st:f.ctx._gritStFlat(),edef:f.ctx.elementalDefense,P:plain(f.P),effects:plain(f.effects),resources:Array.from(f.resources())};
}
for(const file of ['game.html','game-easy-test.html']){
 for(const n of [0,20,-10,.5,10000,Infinity])for(const gear of [false,true])test(file+' normal whole resource and defense original compatibility '+n+' gear='+gear,()=>{
  assert.deepEqual(consume(actual,file,dir,n,{gear}),consume(original,file,baseline,n,{gear}));
 });
 for(const [raw,n] of [['20',20],['0',0],['-10',-10],['.5',.5],['ab',0],['1.2.3',0],[{},0]])for(const gear of [false,true])test(file+' whole restore grit '+JSON.stringify(raw)+' → resources/defense gear='+gear,()=>{
  const restoredValue=restored(file,raw);assert.deepEqual(restoredValue.raw,raw);
  const value=consume(actual,file,dir,restoredValue.value,{gear}),control=consume(actual,file,dir,n,{gear});
  assert.deepEqual(value,control);assert.equal(typeof value.gt,'number');for(const k of ['mhp','mmp','mst'])assert.equal(typeof value.P[k],'number');
  for(let i=0;i<4;i++)assert(value.resources[i]<10000);
 });
 test(file+' actual restore retains numeric string; calculation does not rewrite it',()=>{
  const r=restored(file,'20');assert.equal(r.value,'20');assert.equal(r.raw,'20');const out=consume(actual,file,dir,r.value);
  assert.equal(out.gt,30);assert.equal(out.edef,15);assert.equal(out.P.baseDef,37);
 });
}
