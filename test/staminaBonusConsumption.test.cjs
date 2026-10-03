// Actual whole dbRestore/dbSave/equipItem/applyStats/recalcSt and cost functions.
// Storage/network, unrelated migrations and visual effects use isolated test doubles.
// Regeneration/absorption execute extracted production blocks, not native gameplay.
// Maximum-resource corruption is distinct from a transient malformed current resource.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir;
function extract(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8');
 const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];let js=0,maps=0;
 for(const m of scripts){if(/type=[\"']importmap/.test(m[1])){JSON.parse(m[2]);maps++}
 else if(m[2].trim()){acorn.parse(m[2],{ecmaVersion:'latest',sourceType:/type=[\"']module/.test(m[1])?'module':'script'});js++}}
 assert.equal(js,6);assert.equal(maps,1);
 const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('function dbRestore('))[1];
 const ast=acorn.parse(script,{ecmaVersion:'latest'});
 const names=['dbRestore','dbSave','_restoreExpProgress','_sanitizeCoreState','_ensureBaseWingStrike',
  'equipItem','_refreshEquipmentStats','_calcMaxExp','_getTodayStr','_canTransLv','applyStats','recalcSt','_lvB','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat',
  '_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','pPredSpd',
  'stCost','mpCost','useStPct','useMp','_skLv','_dpsCostMul','_stDisc','pBowCost','pAtkCost','pMeleeStCost','pMagicCost',
  'SLOT_NAMES','STATS','PASSIVES','PASSIVE_DEF','_grit','_eqAffixCache','_eqStatCache','_diffSigned',
  '_COST_BASE','_COST_SK','_COST_DPS'];
 if(file==='game.html')names.push('_equipSlot','_earringSlot');
 const nodes=names.map(name=>{const found=ast.body.filter(n=>n.type==='FunctionDeclaration'&&n.id.name===name||n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name===name));assert.equal(found.length,1,name);return found[0]});
 nodes.push(...ast.body.filter(n=>n.type==='ExpressionStatement'&&script.slice(n.start,n.end)==='PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);'));
 const code=[...new Set(nodes)].sort((a,b)=>a.start-b.start).map(n=>script.slice(n.start,n.end)).join('\n');
 // Parse only the first balanced statement, avoiding unrelated script/HTML tail.
 const statement=marker=>{const at=html.indexOf(marker);assert(at>=0,marker);let pos=at,depth=0,seen=false;
  for(;pos<html.length;pos++){if(html[pos]==='{'){depth++;seen=true}else if(html[pos]==='}'&&--depth===0&&seen)return html.slice(at,pos+1)}throw Error(marker)};
 const stage=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name==='initStage');assert(stage);
 const refill=stage.body.body.filter(n=>n.type==='ExpressionStatement'&&/^P\.(hp|mp|st|shield)=P\.m(hp|mp|st|shield);$/.test(script.slice(n.start,n.end)));
 assert.equal(refill.length,4,'four direct assignments in normal stage branch');
 const sourceSHA=require('node:crypto').createHash('sha256').update(html).digest('hex');
 return {code,sourceSHA,refill:refill.map(n=>script.slice(n.start,n.end)).join('\n'),regen:statement("if(P.s==='idle'){P.st=Math.min(P.mst,P.st+_str/8*sp);"),
  shieldRegen:statement('if(P.mshield>0){\n    if(P.shieldRegenT>0)'),
  absorb:statement('if(P.mshield>0&&P.shield>0){')};
}
function fixture(src){
 const noop=()=>{},c={P:{lv:1,hp:200,mhp:300,mp:80,mmp:80,st:100,mst:100,shield:0,mshield:0,skills:{},s:'idle',x:0,y:0},
 G:{on:true,stage:0,mats:0},INV:{bag:[],equipped:{}},OPT:{diff:5},window:{},console,
 CHAR_LIST:[{}],_charIdx:0,_applyMaskAtlas:noop,_loadCharAtlas:noop,
 STORAGE:{},STORAGE_MAX:200,BAG_MAX:300,_getStore:noop,_persistSharedStorage:noop,
 _CR_LEGACY_IDS:{},CRYSTAL_BAG:[],CRYSTAL_DUST:0,UPGRADES:{},POT:{},POT_LV:{},QSLOTS:[],
 SKILL_LIST:[],SKILL_SLOTS:Array(6).fill(null),ULT_SLOT:null,_FUSE_PAIRS:{},
 _syncActiveSkAfterReset:noop,_getAllAbsorbed:()=>[],_repairAreaSkillSlot:noop,_findAutoSkillSlot:()=>-1,
 _eqImplicit:()=>0,_uEq:()=>0,_gxFiring:0,_lastCost:0,_T:x=>x,showPH:noop,
 pShieldCdMul:()=>1,pMRegenMul:()=>1,addTxt:noop,poolPart:noop,
 _charId:'isolated-test',_dbReady:true,_saving:false,_lastSaveTime:0,IS_ELECTRON:true,
 _passiveQueueItems:()=>[],_loadSharedMats:()=>0,_saveSharedMats:noop,_flushSharedStorage:noop,
 _drainPendingSaveNow:noop,_pendingForce:false};
 c.sb={from(){return{update(payload){c.saved=payload.data;return{eq(){return{async select(){return{data:[{id:c._charId}],error:null}}}}}}}}};
 vm.createContext(c);vm.runInContext('let _earringEquipTarget=null;\n'+src.code,c);return c;
}

const plain=x=>JSON.parse(JSON.stringify(x));
function restored(src,values,{bag=false,enh=0}={}){
 const c=fixture(src);c.playEquipSfx=()=>{};c.notify=()=>{};c.dbSaveForce=()=>{};
 c._L=x=>x;c._itemSz=()=>[1,1];c._invFindSpace=()=>({x:0,y:0});
 const armor={id:1,name:'test armor',slot:'armor',reqLv:1,enh:0,affixes:[],crystals:[],socketCount:0,bonusSt:values[0]};
 const boots={id:2,name:'test boots',slot:'boots',reqLv:1,enh:0,affixes:[],crystals:[],socketCount:0,bonusSt:values[1]};
 const ring={id:3,name:'test ring',slot:'ring1',reqLv:1,enh,affixes:[],crystals:[],socketCount:0};
 const data=plain({player:{lv:1,hp:200,mp:60,st:60,shield:0},
  inv:{bag:bag?[armor]:[],equipped:bag?{boots,ring1:ring}:{armor,boots,ring1:ring}}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);c.applyStats();
 return c;
}
function consume(src,c){
 vm.runInContext(src.refill,c);const mst=c.P.mst,full=c.P.st,cost=c.stCost('bladeShot');
 const paid=c.useStPct('bladeShot'),remaining=c.P.st;
 c._str=c.P.stR;c._mpr=c.P.mpR;c.sp=1;vm.runInContext(src.regen,c);
 return plain({mst,full,cost,paid,remaining,regenerated:c.P.st,mp:c.P.mp,mhp:c.P.mhp,mmp:c.P.mmp,mshield:c.P.mshield});
}
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const values of [[100,50],[.5,-.25],[-5,0],[0,0],[null,undefined],['','']]){
  test(file+' normal bonus preserves entire rebuilt state and consumption '+JSON.stringify(values),()=>{
   const c=restored(src,values),b=restored(old,values);
   assert.deepEqual(plain(c.P),plain(b.P));assert.deepEqual(consume(src,c),consume(old,b));
  });
 }
 for(const [label,value,n]of [['numeric-string','100',100],['bad-string','ab',0],['space-string',' ',0]])for(const bag of [false,true]){
  test(file+' '+label+' restore'+(bag?'→equip':' equipped')+' retains capacity and real costs',()=>{
   const c=restored(src,[value,50],{bag}),number=restored(src,[n,50],{bag});
   assert.equal(c.P.mst,number.P.mst);assert.equal(c.P.st,number.P.st);
   assert.deepEqual(consume(src,c),consume(src,number));
   assert(c.P.mst>100);assert(c.P.st>=0&&c.P.st<c.P.mst);
   assert.equal(c.INV.equipped.armor.bonusSt,value);
  });
 }
 test(file+' each participating SLOT_NAMES field is independently numeric',()=>{
  const slots=vm.runInContext('SLOT_NAMES.slice()',fixture(src));
  assert.equal(slots.length,file==='game.html'?17:16);
  for(const slot of slots)for(const [v,n]of [['25',25],['ab',0]]){
   const c=restored(src,[0,0]),normal=restored(src,[0,0]);
   c.INV.equipped[slot]={id:10,slot,enh:0,affixes:[],crystals:[],bonusSt:v};
   normal.INV.equipped[slot]={id:10,slot,enh:0,affixes:[],crystals:[],bonusSt:n};
   c.applyStats();normal.applyStats();assert.equal(c.P.mst,normal.P.mst,slot+': '+v);
  }
 });
 test(file+' existing strengthening/passive/crystal/grit contributions remain ordered',()=>{
  const c=restored(src,['100',50],{enh:3}),n=restored(src,[100,50],{enh:3});
  for(const x of [c,n]){
   x.P._crystalStats={st:12.5};vm.runInContext('PASSIVES.pHuman=1;PASSIVES.pStamina=2;_grit=3;',x);
   x.P.st=50;x.recalcSt();x.recalcSt();
  }
  assert.equal(c.P.mst,n.P.mst);assert.equal(c.P.st,n.P.st);assert.equal(c.P.st,50);
 });
 test(file+' actual saved raw field survives isolated JSON roundtrip',async()=>{
  const c=restored(src,['100',50]);await c.dbSave();assert(c.saved);
  const r=fixture(src);assert.equal(r.dbRestore(plain(c.saved)),true);r.applyStats();
  assert.equal(r.INV.equipped.armor.bonusSt,'100');assert.equal(r.P.mst,c.P.mst);
  assert.deepEqual(consume(src,r),consume(src,c));
 });
 test(file+' ordinary stage refill cannot mask damaged maximum, corrected capacity persists',t=>{
  const c=restored(src,['100',50]),n=restored(src,[100,50]),b=restored(old,['100',50]);
  const oldMax=b.P.mst;vm.runInContext(old.refill,b);assert.equal(b.P.st,oldMax);
  assert.notEqual(oldMax,n.P.mst);t.diagnostic('synthetic numeric mst='+n.P.mst+' legacy string mst='+oldMax+' after-refill st='+b.P.st);
  const result=consume(src,c);assert.equal(result.full,n.P.mst);assert.equal(result.mst,n.P.mst);
 });
}
