// Whole production save/restore/equip/addExp functions with isolated JSON data.
// Stats rebuilding, passive queue, UI/audio, network and unrelated migrations
// use doubles. No user storage, actual XP producer, native game or pixels run.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir;
const plain=x=>JSON.parse(JSON.stringify(x));
function extract(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8');
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
 let js=0,maps=0;
 for(const m of scripts){if(/type=["']importmap/.test(m[1])){JSON.parse(m[2]);maps++}
  else if(m[2].trim()){acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type=["']module/.test(m[1])?'module':'script'});js++}}
 assert.equal(js,6);assert.equal(maps,1);
 const matches=scripts.filter(m=>m[2].includes('function addExp('));assert.equal(matches.length,1);
 const src=matches[0][2],ast=acorn.parse(src,{ecmaVersion:'latest'});
 const names=['dbSave','dbRestore','_restoreExpProgress','_sanitizeCoreState','_ensureBaseWingStrike',
  'equipItem','_refreshEquipmentStats','nc','addExp','_calcMaxExp',
  '_getTodayStr','_canTransLv','_eqAffixRebuild','_eqAffix','SLOT_NAMES'];
 if(file==='game.html')names.push('_equipSlot','_earringSlot');
 const nodes=names.map(name=>{
  if(name!=='SLOT_NAMES'){const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);
   const at=src.indexOf(marker),start=src.slice(at-6,at)==='async '?at-6:at;
   return acorn.parseExpressionAt(src,start,{ecmaVersion:'latest'})}
  const n=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));
  assert.equal(n.length,1,name);return n[0]});
 return nodes.sort((a,b)=>a.start-b.start).map(n=>src.slice(n.start,n.end)).join('\n');
}
function fixture(src,{demo=false,cap=100}={}){
 const calls=[],noop=()=>{},c={P:{lv:1,hp:200,mhp:300,mp:60,mmp:80,st:60,mst:100,
  shield:10,mshield:20,skills:{},x:0,y:0},G:{on:true,stage:0,mats:0},INV:{bag:[],equipped:{}},
  PASSIVES:{pHuman:0,pDemon:0},STATS:{},window:{},CHAR_LIST:[{}],_charIdx:0,
  _loadCharAtlas:noop,_applyMaskAtlas:noop,STORAGE:{},STORAGE_MAX:200,BAG_MAX:300,
  _getStore:noop,_persistSharedStorage:noop,_CR_LEGACY_IDS:{},CRYSTAL_BAG:[],CRYSTAL_DUST:0,
  CRYSTAL_BAG_MAX:200,CRYSTAL_DEFS:{},UPGRADES:{},POT:{},POT_LV:{},QSLOTS:[],
  SKILL_LIST:[],SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_FUSE_PAIRS:{},
  _syncActiveSkAfterReset:noop,_getAllAbsorbed:()=>[],_repairAreaSkillSlot:noop,_findAutoSkillSlot:()=>-1,
  _charId:'isolated-test',_dbReady:true,_saving:false,_lastSaveTime:0,IS_ELECTRON:true,
  _passiveQueueItems:()=>[],_loadSharedMats:()=>0,_saveSharedMats:noop,_flushSharedStorage:noop,
  _drainPendingSaveNow:noop,_pendingForce:false,_DEMO_MODE:demo,_DEMO_LV_CAP:cap,
  applyStats:()=>{calls.push(['stats']);Object.assign(c.P,{mhp:300,mmp:80,mst:100,mshield:20})},
  _processPassiveQueue:()=>{calls.push(['queue']);return 0},
  SFX:{levelup:()=>calls.push(['levelup'])},showPH:(...a)=>calls.push(['ph',...a]),
  addTxt:(...a)=>calls.push(['text',...a]),_levelUpVfx:{trigger:(p,s,n,d)=>calls.push(['vfx',s,n,d])},
  _T:x=>x,_L:x=>x,notify:x=>calls.push(['notify',x]),playEquipSfx:()=>calls.push(['equipSound']),
  dbSaveForce:()=>calls.push(['saveForce']),_itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0})};
 c.sb={from(){return{update(payload){c.saved=plain(payload.data);return{eq(){return{
  async select(){return{data:[{id:c._charId}],error:null}}}}}}}}};
 vm.createContext(c);vm.runInContext('let _grit=0,_eqAffixCache=null,_eqStatCache=null,_earringEquipTarget=null;\n'+src,c);
 c.calls=calls;return c;
}
function restored(src,value,{bag=false,affix=0,lv=1,exp=0,maxExp=100000,...config}={}){
 const c=fixture(src,config),item={id:42,name:'test necklace',slot:'necklace',reqLv:1,enh:0,
  socketCount:0,crystals:[],affixes:affix?[{id:'expBonus',value:affix}]:[],expBonus:value};
 const data=plain({player:{lv,exp,maxExp,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},
  inv:{bag:bag?[item]:[],equipped:bag?{}:{necklace:item}}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 return c;
}
const compatibility=[['number',.5,450],['fraction',.125,337],['zero',0,300],['negative',-.5,300],
 ['missing',undefined,300],['null',null,300],['empty','',300],['space',' ',300],['bad','ab',300]];
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const bag of [false,true]){
  for(const [label,value,want]of compatibility)test(file+' '+(bag?'bag/equip':'equipped')+' '+label+' XP stays equivalent',()=>{
   const c=restored(src,value,{bag}),b=restored(old,value,{bag});
   c.addExp(900);b.addExp(900);assert.equal(c.P.exp,want);
   assert.deepEqual(plain(c.P),plain(b.P));assert.deepEqual(c.calls,b.calls);
  });
  test(file+' '+(bag?'bag/equip':'equipped')+' numeric-string direct field retains numeric meaning',()=>{
   const c=restored(src,'0.5',{bag});c.addExp(900);assert.equal(c.P.exp,450);
   assert.equal(c.nc().expBonus,'0.5');assert.equal(c.INV.bag.length,0);
  });
 }
 test(file+' direct then affix multiplication and truncation order preserved',()=>{
  const c=restored(src,'0.5',{affix:'0.1'}),n=restored(src,.5,{affix:.1});
  c.addExp(905);n.addExp(905);assert.equal(c.P.exp,496);assert.deepEqual(plain(c.P),plain(n.P));
 });
 test(file+' whole level loop and growth effects match numeric counterpart',()=>{
  const c=restored(src,'0.5',{maxExp:400}),n=restored(src,.5,{maxExp:400});
  c.addExp(900);n.addExp(900);assert.deepEqual(plain(c.P),plain(n.P));assert.deepEqual(c.calls,n.calls);
  assert.equal(c.P.lv,4);assert.equal(c.P.sp,9);assert.equal(c.P.ap,2);
  assert.equal(c.calls.filter(x=>x[0]==='levelup').length,1);
  assert.equal(c.calls.filter(x=>x[0]==='saveForce').length,1);
 });
 test(file+' demo and transcendence bypass normal bonus as before',()=>{
  for(const settings of [{demo:true,lv:100,maxExp:400,exp:400},{lv:1000,maxExp:5010000}]){
   const c=restored(src,'0.5',settings),b=restored(old,'0.5',settings);
   c.addExp(10,true);b.addExp(10,true);assert.deepEqual(plain(c.P),plain(b.P));assert.deepEqual(c.calls,b.calls);
  }
 });
 test(file+' real dbSave payload preserves direct field through isolated JSON roundtrip',async()=>{
  const c=restored(src,'0.5');await c.dbSave();assert(c.saved);
  assert.equal(c.saved.inv.equipped.necklace.expBonus,'0.5');
  const r=fixture(src);assert.equal(r.dbRestore(plain(c.saved)),true);r.addExp(900);
  assert.equal(r.P.exp,450);assert.equal(r.nc().expBonus,'0.5');
 });
}
