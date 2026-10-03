// Actual whole dbRestore/dbSave/applyStats/recalcSt and cost functions.
// Storage/network, unrelated migrations and visual effects use isolated test doubles.
// Regeneration/absorption execute extracted production blocks, not native gameplay.
// A malformed current resource can be NaN before stage entry; the normal stage
// reset refills it. This guards against treating a detached restore model as a
// persistent gameplay failure. No proposed restore coercion is adopted here.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir;
function extract(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8');
 const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].find(m=>m[1].includes('function dbRestore('))[1];
 const ast=acorn.parse(script,{ecmaVersion:'latest'});
 const names=['dbRestore','dbSave','_restoreExpProgress','_sanitizeCoreState','_ensureBaseWingStrike',
  'applyStats','recalcSt','_lvB','_gritTotal','_gritHpFlat','_gritMpFlat','_gritStFlat',
  '_eqStatRebuild','_eqStat','_eqAffixRebuild','_eqAffix','_eqImplicit','pPredSpd',
  'stCost','mpCost','useStPct','useMp','_skLv','_dpsCostMul','_stDisc','pBowCost','pAtkCost','pMeleeStCost','pMagicCost',
  'SLOT_NAMES','STATS','PASSIVES','PASSIVE_DEF','_grit','_eqAffixCache','_eqStatCache','_diffSigned',
  '_COST_BASE','_COST_SK','_COST_DPS'];
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
 vm.createContext(c);vm.runInContext(src.code,c);return c;
}
const cases=[['number',60],['decimal',30.5],['numeric-string','40'],['bad-string','full'],
 ['missing',undefined],['null',null],['zero',0],['zero-string','0'],['space-string',' '],['minus-zero-string','-0'],['negative',-5],['over-max',9999],['nonfinite-JSON',Infinity]];
for(const file of ['game.html','game-easy-test.html']){
 const src=extract(file,dir),old=extract(file,baseline);
 for(const field of ['mp','st','shield'])for(const [name,value]of cases){
  test(file+' '+field+' '+name+' restore/rebuild/cost/regen/absorption',()=>{
   const data=JSON.parse(JSON.stringify({player:{lv:1,hp:200,mp:60,st:60,shield:60,[field]:value}}));
   const c=fixture(src),b=fixture(old);assert.equal(c.dbRestore(structuredClone(data)),true);
   assert.equal(b.dbRestore(structuredClone(data)),true);c.applyStats();b.applyStats();
   const restored={mp:c.P.mp,st:c.P.st,shield:c.P.shield};
   if(name==='bad-string'){assert(Number.isNaN(c.P[field]));assert(Number.isNaN(b.P[field]))}
   else{assert(Number.isFinite(c.P[field]));assert.equal(c.P[field],b.P[field])}
   assert.equal(c.P.hp,b.P.hp);assert.equal(c.P.mmp,b.P.mmp);assert.equal(c.P.mst,b.P.mst);assert.equal(c.P.mshield,b.P.mshield);
   // Actual cost gates and payment functions; effects/casting are outside this test.
   const stGate=c.P.st>=c.stCost('bladeShot'),mpGate=c.P.mp>=c.mpCost('iceOrb');
   const stBefore=c.P.st,mpBefore=c.P.mp;
   if(stGate){const amount=c.useStPct('bladeShot');assert.equal(c.P.st,stBefore-amount)}
   if(mpGate){const amount=c.useMp('iceOrb');assert.equal(c.P.mp,Math.max(0,mpBefore-amount))}
   c.P.st=restored.st;c.P.mp=restored.mp;
   c._str=c.P.stR;c._mpr=c.P.mpR;c.sp=1;
   vm.runInContext(src.regen+'\n'+src.shieldRegen,c);
   if(name==='bad-string')assert(Number.isNaN(c.P[field]));
   else assert(Number.isFinite(c.P.st)&&Number.isFinite(c.P.mp)&&Number.isFinite(c.P.shield));
   c.a=10;vm.runInContext('let _shFullBlock=false;'+src.absorb+';globalThis.fullBlock=_shFullBlock',c);
   assert(Number.isFinite(c.a));
   if(name==='bad-string'&&field==='shield')assert(Number.isNaN(c.P.shield));else assert(Number.isFinite(c.P.shield));
   if(name==='bad-string'){
    assert(Number.isNaN(b.P[field]));
    b._str=b.P.stR;b._mpr=b.P.mpR;b.sp=1;vm.runInContext(old.regen+'\n'+old.shieldRegen,b);assert(Number.isNaN(b.P[field]));
   }
   // The actual direct normal-stage reset, after real stats rebuilding, masks
   // this candidate's claimed persistent failure. Map generation and alternate
   // bosstest entry are not executed or accepted by this regression.
   vm.runInContext(src.refill,c);
   for(const key of ['hp','mp','st','shield']){assert(Number.isFinite(c.P[key]));assert.equal(c.P[key],c.P['m'+key])}
  });
 }
 test(file+' actual dbSave JSON resource round-trip',async()=>{
  const c=fixture(src);[c.P.mp,c.P.st,c.P.shield]=[40.5,30.5,20.5];await c.dbSave();
  const payload=JSON.parse(JSON.stringify(c.saved));assert.deepEqual([payload.player.mp,payload.player.st,payload.player.shield],[40.5,30.5,20.5]);
  const r=fixture(src);assert.equal(r.dbRestore(payload),true);r.applyStats();assert.deepEqual([r.P.mp,r.P.st,r.P.shield],[40.5,30.5,20.5]);
 });
 test(file+' no-player metadata does not restore resources',()=>{const c=fixture(src);assert.equal(c.dbRestore({charIdx:0}),false);assert.equal(c.P.mp,80);assert.equal(c.dbRestore(null),false)});
}
