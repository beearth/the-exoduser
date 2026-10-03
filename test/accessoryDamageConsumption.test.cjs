// Whole production save/restore/equip/hurtE functions with isolated JSON data.
// Stats rebuilding, combat stat leaves, UI/audio, network and unrelated migrations
// use doubles. No user storage, full attack/update/AI, native game or pixels run.
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
  'equipItem','_refreshEquipmentStats','nc','rg1','rg2','hurtE','_calcMaxExp',
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

const slots=['necklace','ring1','ring2','belt','bracelet','headband','headband2'];
function restored(src,values,{bag=false}={}){
 const c=fixture(src),gear=Object.fromEntries(slots.map((slot,i)=>[slot,{id:i,name:'test '+slot,slot,
  reqLv:1,enh:0,socketCount:0,crystals:[],affixes:[],dmgBonus:values[i]}]));
 const data=plain({player:{lv:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},
  inv:{bag:bag?[gear.necklace]:[],equipped:bag?Object.fromEntries(Object.entries(gear).filter(([k])=>k!=='necklace')):gear}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 Object.assign(c,{_now:0,_shBufI:0,_hitSfxCd:1,_UNDEAD_ET:new Set(),_dpsDmg:0,
  _txtPerFrame:0,_TXT_BUDGET:12,_impPerFrame:0,OPT:{parts:0},ens:[],
  EL:{F:1,I:2,D:3,L:4,P:5},_petOnAtk:()=>{},statStr:()=>1,statCrit:()=>0,statCritDmg:()=>1.5,
  _predBonus:()=>0,_hunterMul:()=>1,_uEq:()=>0,wp:()=>({}),shQuery:()=>[],
  addParts:()=>{},poolPart:()=>{},shake:()=>{}});
 Object.assign(c.G,{cam:{x:0,y:0},hitStop:0,_sStats:{dmgDealt:0,maxHit:0,crits:0}});
 c.P.s='idle';c.PASSIVES.pBow=0;
 return c;
}
function hit(c,opts={},config={}){
 const e={alive:true,etype:0,ib:false,hp:1e12,mhp:1e12,x:100,y:0,r:8,s:'idle',st2:0,
  mods:[],kb:{x:0,y:0},...config},before=e.hp;
 c.hurtE(e,1000,undefined,true,opts);assert.equal(c._shBufI,0);return {e,damage:before-e.hp};
}
function snapshot(c,r){return plain({P:c.P,INV:c.INV,G:c.G,enemy:r.e,damage:r.damage,calls:c.calls,dps:c._dpsDmg})}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 const activeSlots=file==='game.html'?slots:slots.slice(0,6),count=activeSlots.length;
 for(const values of [[20,10,10,10,10,10,10],[.5,-.25,.125,0,0,0,0],[0,0,0,0,0,0,0],
  [-10,-5,0,0,0,0,0],[null,undefined,'',' ',0,0,0]]){
  test(file+' numeric/missing/signed fractions retain entire hit state '+JSON.stringify(values),()=>{
   const c=restored(src,values),b=restored(old,values),r=hit(c),br=hit(b);
   assert.deepEqual(snapshot(c,r),snapshot(b,br));
  });
 }
 for(let i=0;i<count;i++)for(const [label,value,numeric]of [['numeric-string','10',10],['bad-string','ab',0]]){
  test(file+' '+slots[i]+' '+label+' does not corrupt other accessory bonuses',()=>{
   const values=Array(7).fill(10);values[i]=value;const numbers=values.slice();numbers[i]=numeric;
   const c=restored(src,values),n=restored(src,numbers),r=hit(c),nr=hit(n);
   assert.equal(r.damage,nr.damage);assert.equal(r.damage,1000+(count-(label==='numeric-string'?0:1))*100);
   assert.equal(c.INV.equipped[slots[i]].dmgBonus,value);
  });
 }
 test(file+' bag restoration and whole necklace equip reach whole enemy damage',()=>{
  const c=restored(src,['20',10,10,10,10,10,10],{bag:true});assert.equal(c.INV.bag.length,0);
  assert.equal(hit(c).damage,1100+count*100);assert.equal(c.nc().dmgBonus,'20');
 });
 test(file+' ordinary, arrow, beam and dot paths preserve numeric result',()=>{
  for(const opts of [{},{maxDist:1000},{beam:true},{dot:true}]){
   const c=restored(src,Array(7).fill('10')),n=restored(src,Array(7).fill(10));
   assert.equal(hit(c,opts).damage,hit(n,opts).damage);assert.equal(c._dpsDmg,1000+count*100);
  }
 });
 test(file+' shield absorbs final bonus before HP with existing overflow',()=>{
  const c=restored(src,Array(7).fill('10')),r=hit(c,{}, {eShieldMax:2000,eShield:1500});
  assert.equal(r.damage,count*100-500);assert.equal(r.e.eShield,0);assert.equal(c._dpsDmg,count*100-500);
 });
 test(file+' stored payload preserves raw fields and recomputes numeric sum after roundtrip',async()=>{
  const c=restored(src,Array(7).fill('10'));await c.dbSave();assert(c.saved);
  const r=restored(src,Array(7).fill(0));assert.equal(r.dbRestore(plain(c.saved)),true);
  assert.equal(hit(r).damage,1000+count*100);assert.equal(r.nc().dmgBonus,'10');
 });
}
