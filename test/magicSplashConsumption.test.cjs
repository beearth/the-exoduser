// Whole save/restore/equip/dispatch/hurtE + actual update magicCast and splash blocks.
// Cast timer and collision target are supplied; resource cost, stats and pool allocator are doubles.
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
  'equipItem','_refreshEquipmentStats','nc','rg1','rg2','hm','_execMagicE','_MAGIC_E_HANDLERS','hurtE','_calcMaxExp',
  '_getTodayStr','_canTransLv','_eqAffixRebuild','_eqAffix','SLOT_NAMES'];
 if(file==='game.html')names.push('_equipSlot','_earringSlot');
 const nodes=names.map(name=>{
  if(!['SLOT_NAMES','_MAGIC_E_HANDLERS'].includes(name)){const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);
   const at=src.indexOf(marker),start=src.slice(at-6,at)==='async '?at-6:at;
   return acorn.parseExpressionAt(src,start,{ecmaVersion:'latest'})}
  const n=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));
  assert.equal(n.length,1,name);return n[0]});
 const found=[];
 function walk(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement')found.push(n);
  for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v)}}
 walk(ast);
 const casts=found.filter(n=>src.slice(n.test.start,n.test.end)==="P.s==='magicCast'"&&src.slice(n.consequent.start,n.consequent.end).includes("const _mcSk=P.activeMagicSk"));assert.equal(casts.length,1);
 const cast=casts[0],castCode='function magicCastCompletion(){'+src.slice(cast.start,cast.consequent.end)+'}';
 const splashes=found.filter(n=>src.slice(n.test.start,n.test.end)==='p.magic&&!p.bladeShard&&!p.maliceHunt&&!p.iceBlade&&!p.blueBean&&!p.lightning');assert.equal(splashes.length,1);
 const splashCode='function splashBridge(e,p){let hit=false;for(let once=0;once<1;once++){'+src.slice(splashes[0].start,splashes[0].end)+'}return hit;}';
 return nodes.sort((a,b)=>a.start-b.start).map(n=>src.slice(n.start,n.end)).join('\n')+'\n'+castCode+'\n'+splashCode;
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

function spell(src,mul,radius,{bag=false}={}){
 const c=restored(src,Array(7).fill(0));
 const gear={id:44,name:'test helmet',slot:'helmet',reqLv:1,enh:0,affixes:[],crystals:[],socketCount:0,splashMul:mul,splashR:radius};
 const data=plain({player:{lv:1,hp:200,mp:60,st:60,shield:0},inv:{bag:bag?[gear]:[],equipped:bag?{}:{helmet:gear}}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 Object.assign(c,{magicRef:()=>500,statInt:()=>2,pMagicMul:()=>3,_skMul:()=>1,pMagicSpd:()=>2,
  VW:800,VH:600,_gpActive:false,_isFused:()=>false,pProjs:[],_getPProj:()=>({}),
  useMp:()=>{c.P.mp-=10;return 10},_addSkProf:()=>{},elMul:()=>1,
  dst:(x,y,x2,y2)=>Math.hypot(x-x2,y-y2),ELC:{1:'#fire'},hitCol:'#test'});
 c.EL.H=6;c.EL.E=7;c.SFX.magic=()=>{};c.queries=[];c.particles=[];
 c.Math=Object.create(Math);c.Math.random=()=>.5;
 Object.assign(c.P,{x:0,y:0,facing:0,activeMagicSk:'elemMissile',skills:{elemMissile:1}});
 c._execMagicE();assert.equal(c.P.s,'magicCast');assert.equal(c.P.st2,7);assert.equal(c.P.mp,50);
 c.P.st2=0;c.magicCastCompletion();
 assert.equal(c.P.s,'magicRecover');assert.equal(c.pProjs.length,3);
 const p=c.pProjs[0];assert.equal(p.magic,true);assert.equal(p.arcMissile,true);assert.equal(p.fireball,undefined);
 assert.equal(p.dmg,1006);assert.equal(p.r,8);
 c.projectile=p;
 return c;
}
function splash(c,positions=[0,70,87,5000]){
 const enemies=positions.map((x,i)=>({id:i,alive:true,etype:0,ib:false,hp:1e12,mhp:1e12,
  x,y:0,r:8,s:'idle',st2:0,mods:[],kb:{x:0,y:0}}));
 const primary=enemies[0];c.poolPart=(...a)=>c.particles.push(a);
 c.shQuery=(x,y,r)=>{c.queries.push(r);return enemies.filter(e=>c.dst(x,y,e.x,e.y)<Number(r)+8)};
 c.splashBridge(primary,c.projectile);assert.equal(c._shBufI,0);
 return plain({damage:enemies.map(e=>1e12-e.hp),enemies,queries:c.queries,particles:c.particles,P:c.P,projectile:c.projectile});
}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const [mul,r]of [[2,10],[.5,3.5],[-.3,-2],[0,0],[null,null],[undefined,undefined],['','']]){
  test(file+' normal magic splash retains enemy, cast and particle state '+JSON.stringify([mul,r]),()=>{
   assert.deepEqual(splash(spell(src,mul,r)),splash(spell(old,mul,r)));
  });
 }
 for(const [label,value,n]of [['integer-string','2',2],['decimal-string','0.5',.5],['bad-string','ab',0]])for(const bag of [false,true]){
  test(file+' multiplier '+label+' '+(bag?'bag→equip':'restored equipped'),()=>{
   const c=spell(src,value,10,{bag}),nrm=spell(src,n,10,{bag}),result=splash(c),normal=splash(nrm);
   assert.deepEqual(result.damage,normal.damage);assert.equal(result.damage[1],~~(1006*(.5+n)));
   assert.equal(result.damage[2],0);assert.equal(result.damage[3],0);assert.equal(c.hm().splashMul,value);
  });
 }
 for(const [label,value,n]of [['integer-string','10',10],['decimal-string','3.5',3.5],['bad-string','ab',0],['space-string',' ',0]])for(const bag of [false,true]){
  test(file+' radius '+label+' '+(bag?'bag→equip':'restored equipped')+' respects strict boundary',()=>{
   const c=spell(src,.5,value,{bag}),nrm=spell(src,.5,n,{bag});
   const result=splash(c),normal=splash(nrm);assert.deepEqual(result.damage,normal.damage);
   assert.deepEqual(result.queries,normal.queries);assert.equal(result.damage[0],0);
   assert.equal(result.damage[3],0);assert.equal(c.hm().splashR,value);
  });
 }
 test(file+' both raw fields survive actual save JSON roundtrip',async()=>{
  const c=spell(src,'0.5','10');await c.dbSave();assert(c.saved);const r=spell(src,0,0);
  assert.equal(r.dbRestore(plain(c.saved)),true);assert.equal(r.hm().splashMul,'0.5');assert.equal(r.hm().splashR,'10');
  assert.deepEqual(splash(r).damage,splash(spell(src,.5,10)).damage);
 });
 test(file+' excluded projectile flags do not run magic splash',()=>{
  for(const flag of ['magic','bladeShard','maliceHunt','iceBlade','blueBean','lightning']){
   const c=spell(src,'ab','ab');c.projectile[flag]=flag==='magic'?false:true;
   const result=splash(c);assert.deepEqual(result.damage,[0,0,0,0]);assert.equal(result.queries.length,0);
  }
 });
}
