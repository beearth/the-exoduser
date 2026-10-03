// Whole production save/restore/equip/fireHellfireBeam/hurtE with isolated data.
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
  'equipItem','_refreshEquipmentStats','nc','rg1','rg2','hm','pBeamMul','fireHellfireBeam','hurtE','_calcMaxExp',
  '_getTodayStr','_canTransLv','_eqAffixRebuild','_eqAffix','SLOT_NAMES'];
 if(file==='game.html')names.push('_equipSlot','_earringSlot');
 const nodes=names.map(name=>{
  if(name!=='SLOT_NAMES'){const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);
   const at=src.indexOf(marker),start=src.slice(at-6,at)==='async '?at-6:at;
   return acorn.parseExpressionAt(src,start,{ecmaVersion:'latest'})}
  const n=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));
  assert.equal(n.length,1,name);return n[0]});
 const start=src.indexOf('const ang=Math.atan2(e.y-p.y,e.x-p.x);\n        const mult=elMul(p.el,e.el);');assert(start>=0);
 const marker='hurtE(e,dmg,ang,_isTurretProj||p.blueBean,p,p.el);';const end=src.indexOf(marker,start)+marker.length;assert(end>start);
 const bridge='function collisionDamageBridge(e,p){'+src.slice(start,end)+'}}';
 return nodes.sort((a,b)=>a.start-b.start).map(n=>src.slice(n.start,n.end)).join('\n')+'\n'+bridge;
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

function beamFixture(src,value,{bag=false,time=0}={}){
 const c=restored(src,Array(7).fill(0));
 const helmet={id:42,name:'test helmet',slot:'helmet',reqLv:1,enh:0,socketCount:0,crystals:[],affixes:[],beamDmg:value};
 const data=plain({player:{lv:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},
  inv:{bag:bag?[helmet]:[],equipped:bag?{}:{helmet}}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 Object.assign(c,{magicRef:()=>10,statInt:()=>2,pMagicMul:()=>2,_skMul:()=>3,_fuseMul:()=>1,
  _gpActive:false,VW:800,VH:600,mouse:{x:600,y:300},pProjs:[],_getPProj:()=>({}),
  elMul:()=>1,pMagicSpd:()=>2,playSample:(...a)=>c.calls.push(['sample',...a]),_r:()=>1,
  _addSkProf:(...a)=>c.calls.push(['prof',...a])});
 Object.assign(c.P,{_fbCasting:true,_fbT:time,skills:{fireBeam:1},s:'idle',x:0,y:0});
 Object.assign(c.G,{cam:{x:0,y:0},_sStats:{dmgDealt:0,maxHit:0,crits:0}});
 return c;
}
function beamHit(c){
 c.fireHellfireBeam();assert.equal(c.pProjs.length,1);const p=c.pProjs[0];
 const e={alive:true,etype:0,ib:false,hp:1e12,mhp:1e12,x:100,y:0,r:8,s:'idle',st2:0,mods:[],kb:{x:0,y:0}};
 // Exact damage block extracted from update, with target overlap supplied by the test.
 // Full movement, collision search, explosion and death processing are not executed.
 c.collisionDamageBridge(e,p);
 assert.equal(c._shBufI,0);return plain({projectile:p,damage:1e12-e.hp,P:c.P,G:c.G,calls:c.calls});
}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const value of [5,'5',1.5,'1.5',-.25,'-.25',0,null,undefined,'',' ']){
  test(file+' normal beam value retains full cast and hit '+JSON.stringify(value),()=>{
   const c=beamFixture(src,value),b=beamFixture(old,value);
   assert.deepEqual(beamHit(c),beamHit(b));
  });
 }
 for(const time of [0,60,300])for(const bag of [false,true]){
  test(file+' malformed restored beam value falls back to zero bonus '+time+' bag='+bag,()=>{
   const c=beamFixture(src,'ab',{time,bag}),z=beamFixture(src,0,{time,bag});
   const r=beamHit(c),n=beamHit(z);
   assert.equal(r.projectile.dmg,n.projectile.dmg);assert.equal(r.damage,n.damage);
   assert.equal(r.projectile.dmg,120*Math.max(10,time/60*40));
   assert.equal(r.damage,r.projectile.dmg);
   assert.equal(c.hm().beamDmg,'ab');
   assert.equal(r.P._fbCasting,false);assert.equal(r.P._fbCd,30);
   assert.equal(r.projectile.explDmg,~~(r.projectile.dmg*.6));
  });
 }
 test(file+' malformed raw save survives roundtrip and numeric fallback is recomputed',async()=>{
  const c=beamFixture(src,'ab');await c.dbSave();assert(c.saved);
  const r=beamFixture(src,0);assert.equal(r.dbRestore(plain(c.saved)),true);
  Object.assign(r.P,{_fbCasting:true,_fbT:0});
  assert.equal(r.hm().beamDmg,'ab');assert.equal(beamHit(r).damage,1200);
 });
 test(file+' inactive cast cannot create a projectile',()=>{
  const c=beamFixture(src,'ab');c.P._fbCasting=false;c.fireHellfireBeam();assert.equal(c.pProjs.length,0);
 });
}
