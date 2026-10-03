// Whole actual save/restore/equip/useQuickslot and contiguous automatic-potion
// decrement/guard/consumption block. Cooldown tick is the original four-slot
// loop, not a replacement model. Full update/input/native/audio/DOM not run;
// unrelated stats/migrations, UI and sound use doubles. Isolated in-memory saves.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir,plain=x=>JSON.parse(JSON.stringify(x));
const helper=fs.readFileSync(path.join(__dirname,'ancestorPowerConsumption.test.cjs'),'utf8');
const h={require,__dirname,process,console};vm.createContext(h);
vm.runInContext(helper.slice(0,helper.indexOf("for(const file of ['game.html'")),h);
function source(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8');
 const src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(s=>s.includes('function useQuickslot('));
 const funcs=['gl','blt','potHeal','useQuickslot'].map(n=>{const m='function '+n+'(';assert.equal(src.split(m).length,2);
  const node=acorn.parseExpressionAt(src,src.indexOf(m),{ecmaVersion:'latest'});return src.slice(node.start,node.end)}).join('\n');
 const start=src.indexOf('  if(autoPotCd>0)autoPotCd-=sp;'),end=src.indexOf('  // ─── [S16c] SKILL_CD',start);
 assert(start>0&&end>start);const auto=src.slice(start,end);assert.equal((auto.match(/G\.mats--/g)||[]).length,1);
 const tickAt=src.indexOf('for(let i=0;i<4;i++){if(qsCooldown[i]>0)');assert(tickAt>0);
 acorn.parse(src.slice(tickAt,src.indexOf('\n',tickAt)),{ecmaVersion:'latest'});
 return {all:h.extract(file,base),funcs,auto,tick:src.slice(tickAt,src.indexOf('\n',tickAt))};
}
function fixture(s,value,{slot='gloves',bag=false,regen=0,affix=0,level=0}={}){
 const c=h.fixture(s.all);const gear={id:42,name:'cooldown fixture',slot,reqLv:0,enh:0,socketCount:0,crystals:[],affixes:[],potCd:value};
 const data=plain({player:{lv:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},skills:{},
  inv:{bag:bag?[gear]:[],equipped:bag?{}:{[slot]:gear}}});
 Object.assign(c,{qsCooldown:[0,0,0,0],autoPotCd:0,PASSIVES:{pRegen:regen,pHuman:0,pDemon:0},
  SFX:{potion:()=>c.calls.push(['potion'])},updateQS:()=>c.calls.push(['qs']),addParts:(...a)=>c.calls.push(['parts',...a]),$:()=>null});
 c.QSLOTS=[{type:'hp',count:0},{type:'hp',count:0},{type:null,count:0},{type:null,count:0}];c.POT.hp={col:'#33cc66'};
 vm.runInContext('let POT_LV={hp:'+level+'};\n'+s.funcs+'\nfunction actualAuto(sp){'+s.auto+'}\nfunction actualQuickTick(sp){'+s.tick+'}',c);
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 assert.deepEqual(plain(c.INV.equipped[slot].potCd),value);c.G.mats=20;c.G._pStats={_hC:0};c.G._sStats={potions:0};
 c.P.hp=10;c.P.mhp=5000;c.window._systemLesson={active:true,recovered:(...a)=>c.calls.push(['recovered',...a])};
 c.INV.equipped[slot].affixes=[{id:'potionCdRed',value:affix}];vm.runInContext('_eqAffixCache=null',c);return c;
}
function snapshot(c){return plain({P:c.P,G:c.G,calls:c.calls,qsCooldown:c.qsCooldown,autoPotCd:c.autoPotCd})}
function consume(c,mode){if(mode==='manual')c.useQuickslot(0);else c.actualAuto(0);return snapshot(c)}
function elapse(c,mode,n){if(mode==='manual')c.actualQuickTick(n);else c.actualAuto(n)}
for(const file of ['game.html','game-easy-test.html']){
 const s=source(file,dir),old=source(file,baseline);
 for(const slot of ['gloves','belt'])for(const mode of ['manual','auto']){
  for(const value of [0,.1,.2,.3,-.1,null,'','0.1','-0.1'])test(file+' normal '+slot+' '+mode+' '+JSON.stringify(value),()=>{
   const a=fixture(s,value,{slot,regen:2,affix:.1,level:1}),b=fixture(old,value,{slot,regen:2,affix:.1,level:1});
   assert.deepEqual(consume(a,mode),consume(b,mode));elapse(a,mode,5);elapse(b,mode,5);assert.deepEqual(snapshot(a),snapshot(b));
  });
  for(const value of ['ab',{},['ab'],'0.1.2'])for(const bag of [false,true])test(file+' restored malformed '+slot+' '+mode+' bag='+bag+' '+JSON.stringify(value),()=>{
   const a=fixture(s,value,{slot,bag}),b=fixture(s,0,{slot,bag});
   consume(a,mode);consume(b,mode);assert.equal(mode==='manual'?a.qsCooldown[0]:a.autoPotCd,420);
   assert.deepEqual(snapshot(a),snapshot(b));assert.equal(a.G.mats,19);assert.equal(a.P.hp,110);
   elapse(a,mode,6);elapse(b,mode,6);consume(a,mode);consume(b,mode);
   assert.equal(a.G.mats,19,'six frames do not allow another resource consumption');assert.deepEqual(snapshot(a),snapshot(b));
   elapse(a,mode,414);elapse(b,mode,414);if(mode==='manual'){consume(a,mode);consume(b,mode)}
   assert.equal(a.G.mats,18);assert.deepEqual(snapshot(a),snapshot(b));
  });
 }
 for(const [label,change] of [['empty currency',c=>c.G.mats=0],['full hp',c=>c.P.hp=c.P.mhp],
  ['cooldown',c=>{c.qsCooldown[0]=10;c.autoPotCd=10}]])for(const mode of ['manual','auto'])test(file+' guard '+label+' '+mode,()=>{
   const c=fixture(s,'ab');change(c);const before={m:c.G.mats,h:c.P.hp};consume(c,mode);assert.equal(c.G.mats,before.m);assert.equal(c.P.hp,before.h);
 });
 for(const [label,change] of [['off',c=>c.G.on=false],['paused',c=>c.G.paused=true],['bad slot',c=>c.QSLOTS[0].type='missing']])test(file+' whole manual '+label,()=>{
   const c=fixture(s,'ab');change(c);c.useQuickslot(0);assert.equal(c.G.mats,20);assert.equal(c.P.hp,10);
 });
 for(const [label,change] of [['parry lesson',c=>c.window._parryLesson={active:true}],['dead',c=>c.P.hp=0],['insufficient deficit',c=>c.P.hp=c.P.mhp-99]])test(file+' automatic guard '+label,()=>{
   const c=fixture(s,'ab');change(c);const hp=c.P.hp;c.actualAuto(0);assert.equal(c.G.mats,20);assert.equal(c.P.hp,hp);
 });
 test(file+' manual cooldown affix and automatic omission remain distinct',()=>{
  const a=fixture(s,'.1',{regen:2,affix:.1}),b=fixture(s,'.1',{regen:2,affix:.1});consume(a,'manual');consume(b,'auto');
  assert.equal(a.qsCooldown[0],310);assert.equal(b.autoPotCd,352);
 });
 test(file+' raw equipment cooldown survives whole save/restore',async()=>{
  const c=fixture(s,'ab',{slot:'belt',bag:true});await c.dbSave();assert.equal(c.saved.inv.equipped.belt.potCd,'ab');
  const n=fixture(s,0);assert.equal(n.dbRestore(plain(c.saved)),true);assert.equal(n.INV.equipped.belt.potCd,'ab');
  n.G.mats=20;n.P.hp=10;n.P.mhp=5000;n.useQuickslot(0);assert.equal(n.qsCooldown[0],420);assert.equal(n.G.mats,19);
 });
}
