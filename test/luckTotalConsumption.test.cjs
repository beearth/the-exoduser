// Whole actual dbRestore and luck/equipment readers in one VM. Unrelated
// restore migrations, applyStats, UI/audio/network/storage leaves are doubles.
// No combat RNG, loot roll, native input, disk save or full renderer execution.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8'),cut=helper.indexOf("const parts=['skull'");assert(cut>0);
const h={require,__dirname:path.join(root,'test'),process,console};vm.createContext(h);vm.runInContext(helper.slice(0,cut)+'\nglobalThis.h={extract,fixture};',h);
function source(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>s.includes('function _eqLckTotal('));
 const names=['_eqLckTotal','_lvB','_eqStatRebuild','_eqStat','statCrit','statCritDmg','statDropBonus'];
 const nodes=names.map(name=>{const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);return acorn.parseExpressionAt(src,src.indexOf(marker),{ecmaVersion:'latest'});});
 return h.h.extract(file,base)+'\n'+nodes.map(n=>src.slice(n.start,n.end)).join('\n');
}
const current=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,source(f,dir)])),original=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,source(f,baseline)]));
function consume(code,raw,gear){
 const c=h.h.fixture(code),equipped=gear?{boots:{bLck:5,affixes:[{id:'lckFlatN',value:'3'},{id:'lckFlatR',value:2},{id:'critRate',value:.1},{id:'critDmgA',value:.2},{id:'dropRate',value:.4}]},ring1:{critRate:.02},ring2:{critRate:.03},necklace:{critRate:.01}}:{};
 const data={player:{lv:20,hp:200,mp:60,st:60,shield:10,exp:0,maxExp:100000,sp:0,ap:0},stats:{lck:raw},inv:{bag:[],equipped}};
 assert.equal(c.dbRestore(data),true);const restored=c.STATS.lck;Object.assign(c.PASSIVES,{pCrit:gear?2:0,pDrop:gear?1:0});if(gear)c.P._crystalStats={crit:2,cdmg:10,drop:20};
 const result={total:c._eqLckTotal(),crit:c.statCrit(),critDmg:c.statCritDmg(),drop:c.statDropBonus()};
 assert.deepEqual(c.STATS.lck,restored,'consumption must not rewrite restored stats');assert.deepEqual(data.stats.lck,raw,'raw save payload preserved');
 return {result,restored};
}
for(const file of ['game.html','game-easy-test.html']){
 for(const n of [0,20,-10,.5,10000,Infinity,NaN])for(const gear of [false,true])test(file+' normal original compatibility '+n+' gear='+gear,()=>{
  assert.deepEqual(consume(current[file],n,gear),consume(original[file],n,gear));
 });
 for(const [raw,n] of [['20',20],['0',0],['-10',-10],['.5',.5],['ab',0],['1.2.3',0],[{},0]])for(const gear of [false,true])test(file+' whole restore '+JSON.stringify(raw)+' → luck/crit/drop gear='+gear,()=>{
  const got=consume(current[file],raw,gear),control=consume(current[file],n,gear);assert.deepEqual(got.restored,raw);assert.deepEqual(got.result,control.result);assert.equal(typeof got.result.total,'number');
 });
 test(file+' raw string20 remains string while consumers use total30',()=>{
  const got=consume(current[file],'20',false);assert.equal(got.restored,'20');assert.deepEqual(got.result,{total:30,crit:.75,critDmg:1.56,drop:1.045});
 });
}
