// Whole save/restore/equip, ancestor stats/summon/update/waves/detonation and hurtE.
// Stats rebuilding, combat stat leaves, UI/audio, network and unrelated migrations
// use doubles; spatial queries and stat leaves are synthetic. No user storage,
// full game update, enemy AI, map geometry, native game, pixels or audio run.
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
  '_getTodayStr','_canTransLv','_eqAffixRebuild','_eqAffix','_eqImplicit','SLOT_NAMES',
  'ANC_ROSTER','_ANC_KIT','_BONE_PARTS','_ancPartPts','_calcAncestorStats','_ossSetComplete',
  '_ossUnlockedList','activateAncestorSummon','_updateAncestors','_updateAncestorReturns',
  '_updateAncestorKiWaves','_launchAncestorKiWave','_ancestorMeleePressure','_hurtAncestor',
  '_recallAncestor','_updateAncestorStomp','_ancestorStompImpact','_detonateAncestorSword',
  '_ancestorCanAbsorb','_ancestorSwordAbsorbProjectiles','_ancestorSwordAbsorbRadius'];
 if(file==='game.html')names.push('_equipSlot','_earringSlot');
 else for(const name of ['_updateAncestorKiWaves','_launchAncestorKiWave','_updateAncestorStomp','_ancestorStompImpact','_ancestorCanAbsorb'])names.splice(names.indexOf(name),1);
 const nodes=names.map(name=>{
  if(!['SLOT_NAMES','ANC_ROSTER','_ANC_KIT','_BONE_PARTS'].includes(name)){const marker='function '+name+'(';assert.equal(src.split(marker).length,2,name);
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
  SKILL_LIST:[{id:'ancestorSummon'}],SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_FUSE_PAIRS:{},
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

const parts=['skull','torso','arms','legs'];
function ancestorFixture(src,value,{bag=false,level=1,crit=false,affix=.1,implicit=10}={}){
 const c=fixture(src);c.hasWave=src.includes('function _launchAncestorKiWave(');const gear={id:42,name:'test ossuary',slot:'ossuary',reqLv:0,enh:0,socketCount:0,
  crystals:[],affixes:[{id:'ancDmg',value:affix},{id:'ancHP',value:.9}],ancPow:value,
  _implicitStat:'_iAncPow',_implicitVal:implicit},collection=Object.fromEntries(parts.map(p=>['iron_warlord_'+p,{r:2,t:1}]));
 const data=plain({player:{lv:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},
  skills:{ancestorSummon:level},inv:{bag:bag?[gear]:[],equipped:bag?{}:{ossuary:gear},ossCollect:collection}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 assert.equal(c.P.skills.ancestorSummon,level);assert.equal(c.INV.ossCollect.iron_warlord_arms.r,2);
 Object.assign(c,{_now:0,_shBufI:0,_hitSfxCd:1,_UNDEAD_ET:new Set(),_dpsDmg:0,
  _txtPerFrame:0,_TXT_BUDGET:12,_impPerFrame:0,OPT:{parts:0},ens:[],VW:800,VH:600,
  EL:{F:1,I:2,D:3,L:4,P:5},_petOnAtk:()=>{},statStr:()=>1,statCrit:()=>0,statCritDmg:()=>1.5,
  _predBonus:()=>0,_hunterMul:()=>1,_uEq:()=>0,wp:()=>({}),
  magicRef:()=>10,statInt:()=>2,pMagicMul:()=>2,_skMul:()=>6,_fuseMul:()=>1,
  addParts:()=>{},poolPart:()=>{},shake:()=>{},_addBoom:(...a)=>c.calls.push(['boom',...a]),
  dst:(x,y,xx,yy)=>Math.hypot(xx-x,yy-y),shQuery:()=>c.ens,
  playSample:(...a)=>c.calls.push(['sample',...a]),_r:()=>1,
  projs:[],ELC:{},_addSkProf:(...a)=>c.calls.push(['prof',...a])});
 c.Math=Object.create(Math);c.Math.random=()=>crit?0:.99;
 Object.assign(c.G,{cam:{x:0,y:0},hitStop:0,_sStats:{dmgDealt:0,maxHit:0,crits:0}});
 c.P.s='idle';c.PASSIVES.pBow=0;
 return c;
}
function enemy(x=170){return {alive:true,etype:0,ib:false,hp:1e12,mhp:1e12,x,y:0,r:8,s:'idle',
 st2:0,mods:[],kb:{x:0,y:0},atk:0};}
function swordHit(c){
 const e=enemy();c.ens=[e];c.activateAncestorSummon();assert.equal(c.G._ancestors.length,1);
 const a=c.G._ancestors[0];assert.equal(a._emergeT,96);assert.equal(c.P._ancCd,1500);
 c._updateAncestors(96);assert.equal(a._emergeT,0);assert.equal(e.hp,1e12);
 c._updateAncestors(1);
 if(c.hasWave){assert.equal(a._kiWaves.length,1);assert.equal(e.hp,1e12);}
 const waveDamage=c.hasWave?a._kiWaves[0].dmg:1e12-e.hp;c._updateAncestors(1);
 const damage=1e12-e.hp;c._updateAncestors(1);assert.equal(1e12-e.hp,damage,'attack hits once before cooldown');
 assert.equal(c._shBufI,0);return plain({P:c.P,INV:c.INV,G:c.G,enemy:e,waveDamage,damage,calls:c.calls,dps:c._dpsDmg});
}
function detonate(c,count,pool){
 c.activateAncestorSummon();const a=c.G._ancestors[0];
 a._swordX=a.x;a._swordY=a.y;a._swordAbsorbed=count;a._swordDmgPool=pool;
 const e=enemy();c.ens=[e];const result=c._detonateAncestorSword(a);
 return plain({result,damage:1e12-e.hp,a,calls:c.calls});
}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const value of [.25,.5,-.25,-2,0,null,undefined,'']){
  test(file+' normal ancPow preserves entire summon/wave/hit state '+JSON.stringify(value),()=>{
   assert.deepEqual(swordHit(ancestorFixture(src,value)),swordHit(ancestorFixture(old,value)));
  });
 }
 for(const [value,numeric] of [['.25',.25],['0.5',.5],['-.25',-.25],['0',0],[' ',0],['ab',0]]){
  for(const bag of [false,true])test(file+' restored ancPow '+JSON.stringify(value)+' bag='+bag+' reaches numeric summon and enemy damage',()=>{
   const c=ancestorFixture(src,value,{bag}),n=ancestorFixture(src,numeric,{bag});
   const a=swordHit(c),b=swordHit(n);assert.equal(a.G._ancestors[0].dmg,b.G._ancestors[0].dmg);
   assert.equal(a.waveDamage,b.waveDamage);assert.equal(a.damage,b.damage);
   assert(a.damage>1);assert.equal(c.INV.equipped.ossuary.ancPow,value);
   assert.deepEqual(a.G,b.G);assert.deepEqual(a.enemy,b.enemy);
  });
 }
 for(const level of [1,6,20])for(const crit of [false,true]){
  test(file+' level '+level+' crit='+crit+' composes actual affix/implicit, summon and attack consumers',()=>{
   const c=ancestorFixture(src,'.5',{level,crit,affix:'.1',implicit:'10'}),n=ancestorFixture(src,.5,{level,crit,affix:.1,implicit:10});
   const a=swordHit(c),b=swordHit(n);assert.equal(a.damage,b.damage);assert.equal(a.waveDamage,b.waveDamage);
   const expected=Math.max(1,~~(240*1.36*1.7*(1+~~((level-1)/5)*.25)));
   assert.equal(a.G._ancestors[0].dmg,expected);assert.equal(a.waveDamage,Math.max(1,~~(expected*(crit?2:1)*1.25)));
   assert.equal(a.damage,a.waveDamage);assert.equal(a.G._ancestors[0].hp,~~(600*2.5*(1+level*.06)*1.9));
  });
 }
 test(file+' no other power bonus avoids string-only damage inflation',()=>{
  const c=ancestorFixture(src,'0.5',{affix:0,implicit:0}),n=ancestorFixture(src,.5,{affix:0,implicit:0});
  const a=swordHit(c),b=swordHit(n);assert.equal(a.G._ancestors[0].dmg,489);assert.equal(a.damage,b.damage);assert.equal(a.damage,611);
 });
 for(const count of [0,24])test(file+' restored power reaches whole recall explosion count='+count,()=>{
  const a=detonate(ancestorFixture(src,'.5'),count,120),b=detonate(ancestorFixture(src,.5),count,120);
  assert.deepEqual(a.result,b.result);assert.equal(a.damage,b.damage);assert.equal(a.damage,a.result.damage);
  assert.equal(a.result.radius,Math.min(480,240+count*10));
 });
 test(file+' missing item and incomplete set preserve summon guard',()=>{
  const c=ancestorFixture(src,'.5');delete c.INV.equipped.ossuary;c.activateAncestorSummon();assert.equal(c.G._ancestors,undefined);
  const n=ancestorFixture(src,'.5');delete n.INV.ossCollect.iron_warlord_legs;
  assert.equal(n._calcAncestorStats(0),null);assert.equal(n._calcAncestorStats(1),null);
  n.activateAncestorSummon();assert.equal(n.G._ancestors,undefined);assert.equal(n.P._ancCd,undefined);
 });
 test(file+' saved raw ancPow roundtrips through whole save/restore and reproduces numeric damage',async()=>{
  const c=ancestorFixture(src,'.5',{bag:true});const first=swordHit(c);await c.dbSave();assert(c.saved);
  assert.equal(c.saved.inv.equipped.ossuary.ancPow,'.5');
  const n=ancestorFixture(src,0);assert.equal(n.dbRestore(plain(c.saved)),true);
  assert.equal(n.INV.equipped.ossuary.ancPow,'.5');assert.equal(swordHit(n).damage,first.damage);
 });
}
