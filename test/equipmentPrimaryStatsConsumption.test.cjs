// Actual whole restore/equip and whole stat/resource calculations, connected
// by a two-VM state bridge. Unrelated migrations, inventory space, save,
// UI/audio/network leaves are doubles. No crystals, actual boot/native/save.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
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
const actual=calculations(dir),original=calculations(baseline);
const rhText=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8'),cut=rhText.indexOf("const parts=['skull'");assert(cut>0);
const rh={require,__dirname:path.join(root,'test'),process,console};vm.createContext(rh);vm.runInContext(rhText.slice(0,cut)+'\nglobalThis.h={extract,fixture};',rh);
const restoreCode=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,rh.h.extract(f,dir)]));
const plain=x=>JSON.parse(JSON.stringify(x));
function restored(file,raw,{bag=false}={}){
 const c=rh.h.fixture(restoreCode[file]),item={id:58,name:'synthetic armor',slot:'armor',reqLv:0,enh:0,socketCount:0,crystals:[],affixes:[],...raw};
 const data={player:{lv:20,hp:10000,mp:10000,st:10000,shield:10000,exp:0,maxExp:100000,sp:0,ap:0},
  stats:{str:5,dex:3,int:4,lck:2},inv:{bag:bag?[item]:[],equipped:{boots:{slot:'boots',name:'synthetic boots',bStr:3,bDex:4,bInt:5,bonusHp:11,bonusMp:13,bonusSt:19,bonusShield:17,enh:2,socketCount:0,crystals:[],affixes:[{id:'strFlat',value:2},{id:'dexFlat',value:3},{id:'intFlat',value:4}]},...(!bag?{armor:item}:{})}}};
 assert.equal(c.dbRestore(data),true);
 if(bag){const ref=c.INV.bag[0];c.equipItem(ref);assert.equal(c.INV.equipped.armor,ref);assert.equal(c.INV.bag.includes(ref),false);}
 for(const [key,value] of Object.entries(raw)){assert.deepEqual(c.INV.equipped.armor[key],value);assert.deepEqual(item[key],value);}
 return {equipped:c.INV.equipped,stats:c.STATS};
}
function consume(h,file,state){
 const src=h.sources.find(s=>s.filename===file),f=h.fixture(src,{lv:20,grit:2,equipped:state.equipped,stats:state.stats,
  passives:{pHuman:1,pVital:1,pStamina:1,pFortify:1,pArmor:1},current:[10000,10000,10000,10000]});
 const before=structuredClone(f.ctx.INV.equipped);f.ctx.applyStats();const once=plain(f.P);
 f.ctx.applyStats();assert.deepEqual(plain(f.P),once,'recalculation must not accumulate or heal');
 assert.deepEqual(f.ctx.INV.equipped,before,'calculation does not rewrite equipment payload');
 return {P:once,resources:Array.from(f.resources()),effects:plain(f.effects)};
}
for(const file of ['game.html','game-easy-test.html']){
 for(const value of [0,20,-10,.5,10000,NaN,Infinity,undefined])test(file+' numeric primary-stat compatibility '+value,()=>{
  const state=restored(file,{bStr:value,bDex:value,bInt:value});assert.deepEqual(consume(actual,file,state),consume(original,file,state));
 });
 for(const field of ['bStr','bDex','bInt'])for(const [raw,n] of [['20',20],['0',0],['-10',-10],['.5',.5],['ab',0],[{},0]])for(const bag of [false,true])test(file+' restored '+field+'='+JSON.stringify(raw)+' bag='+bag+' reaches effective stats and resources',()=>{
  const state=restored(file,{[field]:raw},{bag}),control=restored(file,{[field]:n},{bag});
  const out=consume(actual,file,state);assert.deepEqual(out,consume(actual,file,control));
  for(const k of ['str','dex','int'])assert.equal(typeof out.P._effStats[k],'number');
  for(const k of ['mhp','mmp','mst','mshield','hpR','mpR','stR','speed'])assert(Number.isFinite(out.P[k]),k);
  assert.deepEqual(state.equipped.armor[field],raw,'restored payload remains unchanged');
 });
 test(file+' combined numeric strings have explicit whole-function results',()=>{
  const out=consume(actual,file,restored(file,{bStr:'20',bDex:'20',bInt:'20'}));
  assert.deepEqual(out.P._effStats,{str:40,dex:40,int:43,vit:0,lck:12});
  assert.equal(out.P.mhp,925);assert.equal(out.P.mmp,361);assert.equal(out.P.mshield,332);
 });
}
