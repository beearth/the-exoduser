// Whole actual restore/equip -> three attack references -> whole fireBow and
// _fireXbow in one VM. Synthetic equipment/projectile pool/passive multiplier,
// sound/space/save/migration/stat-refresh leaves. No actual hit/native/user save.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,baseline=process.env.EXODUSER_TEST_BASELINE_DIR;assert(baseline,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/ancestorPowerConsumption.test.cjs'),'utf8'),cut=helper.indexOf("const parts=['skull'");assert(cut>0);
const h={require,__dirname:path.join(root,'test'),process,console};vm.createContext(h);vm.runInContext(helper.slice(0,cut)+'\nglobalThis.h={extract,fixture};',h);
function source(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>s.includes('function meleeRef('));
 const names=['wp','bw','hm','enhMulAtk','_lvB','_slotFlatAtk','_eqStatRebuild','_eqStat','meleeRef','bowRef','magicRef','fireBow','_fireXbow','pBowRange','pBowSpd','_autoBowSpec'];
 return h.h.extract(file,base)+'\n'+names.map(name=>{const mark='function '+name+'(';assert.equal(src.split(mark).length,2,name);const n=acorn.parseExpressionAt(src,src.indexOf(mark),{ecmaVersion:'latest'});return src.slice(n.start,n.end);}).join('\n');
}
const actual=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,source(f,dir)])),original=Object.fromEntries(['game.html','game-easy-test.html'].map(f=>[f,source(f,baseline)]));
function consume(code,raw,{bag=false,seal=0}={}){
 const c=h.h.fixture(code),noop=()=>{},gear={};
 for(const [slot,stat,value] of [['weapon','bStr',5],['bow','bDex',6],['helmet','bInt',7]])gear[slot]={id:slot,name:'synthetic '+slot,slot,reqLv:0,atk:raw,enh:2,[stat]:value,
  socketCount:0,crystals:[],affixes:[{id:'sharpAtk',value:5},{id:'brutalAtk',value:'3'}],...(slot==='bow'?{btype:'crossbow'}:{})};
 Object.assign(c,{BOWTYPES:{crossbow:{range:1000,atkMul:1.5,projSpd:13}},pProjs:[],pBowMul:()=>2,pXbowMul:()=>1.2,
  _getPProj:()=>({}),XBOW_DMG:28,XBOW_PIERCE:false,XBOW_RANGE:1000,XBOW_SPEED:13,_gxFiring:0,_gxTurret:{x:0,y:0},
  playSample:noop,playSampleAt:noop,poolPart:noop,_r:()=>1});
 const data={player:{lv:20,hp:200,mp:60,st:60,shield:10,exp:0,maxExp:100000,sp:0,ap:0},stats:{str:20,dex:21,int:22},
  inv:{bag:bag?Object.values(gear):[],equipped:bag?{}:gear}};
 assert.equal(c.dbRestore(data),true);
 if(bag)for(const slot of ['weapon','bow','helmet']){const ref=c.INV.bag.find(it=>it.slot===slot);c.equipItem(ref);assert.equal(c.INV.equipped[slot],ref);assert.equal(c.INV.bag.includes(ref),false);}
 Object.assign(c.P,{baseAtk:15,_weaponSeal:seal,facing:0,_bowBon:10});c.PASSIVES.pBow=0;c.G.mats=2;
 const refs=[c.meleeRef(),c.bowRef(),c.magicRef()];
 const fired=c.fireBow();assert.equal(fired,true);assert.equal(c.G.mats,1);assert.equal(c.P._bowBon,0);
 c._fireXbow(100,0);c._gxFiring=1.5;c._fireXbow(100,0);
 for(const slot of ['weapon','bow','helmet']){assert.deepEqual(c.INV.equipped[slot].atk,raw);assert.deepEqual(gear[slot].atk,raw);}
 return {refs,projectiles:JSON.parse(JSON.stringify(c.pProjs)),mats:c.G.mats,bowBonus:c.P._bowBon,state:c.P.s,recovery:c.P.st2};
}
for(const file of ['game.html','game-easy-test.html']){
 for(const raw of [0,60,-10,.5,10000,NaN,Infinity,undefined])test(file+' numeric atk preserves complete references and manual/auto/turret emissions '+raw,()=>{
  assert.deepEqual(consume(actual[file],raw),consume(original[file],raw));
 });
 for(const [raw,n] of [['60',60],['0',0],['-10',-10],['.5',.5],['ab',0],[{},0]])for(const bag of [false,true])for(const seal of [0,1])test(file+' restored atk '+JSON.stringify(raw)+' bag='+bag+' seal='+seal,()=>{
  const out=consume(actual[file],raw,{bag,seal});assert.deepEqual(out,consume(actual[file],n,{bag,seal}));
  for(const value of out.refs)assert(Number.isFinite(value));
 });
 test(file+' explicit restored string60 references and whole manual bow damage',()=>{
  const out=consume(actual[file],'60',{bag:true});assert.deepEqual(out.refs,[118.5,120.5,122.5]);
  assert.equal(out.projectiles[0].dmg,7260);assert.equal(out.projectiles[1].dmg,1383);assert.equal(out.projectiles[2].dmg,2076);
 });
}
