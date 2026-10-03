// Whole actual save/restore/equip/stat readers/activateNeedleShot; contiguous
// needle burst emission, wSwing recovery if and exact HUD format expression.
// Full attack/update, collision, native/input/visual/audio not run. Stat rebuild
// unrelated to the selected readers, projectile pool and audio/UI use doubles.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir,plain=x=>JSON.parse(JSON.stringify(x));
const helper=fs.readFileSync(path.join(__dirname,'ancestorPowerConsumption.test.cjs'),'utf8');
const h={require,__dirname,process,console};vm.createContext(h);vm.runInContext(helper.slice(0,helper.indexOf("for(const file of ['game.html'")),h);
function source(file,base){
 const html=fs.readFileSync(path.join(base,file),'utf8'),src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(x=>x.includes('function statDex('));
 const extra=['gl','wp','_eqStat','_eqStatRebuild','_lvB','_uEq','statDex','activateNeedleShot'].map(n=>{
  const m='function '+n+'(';assert.equal(src.split(m).length,2,n);const a=src.indexOf(m),node=acorn.parseExpressionAt(src,a,{ecmaVersion:'latest'});return src.slice(node.start,node.end)}).join('\n');
 const a=src.indexOf('  if(P._needleBurst&&P._needleBurst.cnt<P._needleBurst.max){'),b=src.indexOf('\n  //',a+2);assert(a>0&&b>a);
 const needle=src.slice(a,b);acorn.parse(needle,{ecmaVersion:'latest'});
 const m="if(P.st2<=0){P.s='wRecover';P.st2=~~(16/";assert.equal(src.split(m).length,2);
 const start=src.indexOf(m),end=src.indexOf('}}',start);assert(end>start);const recover=src.slice(start,end+1);acorn.parse(recover,{ecmaVersion:'latest'});
 const fmt='statDex().toFixed(3)';assert(src.includes(fmt));return {all:h.extract(file,base),extra,needle,recover,fmt};
}
function fixture(s,value,{bag=false,bonuses=false,level=1}={}){
 const c=h.fixture(s.all);c.SKILL_LIST=[{id:'needleShot'}];
 const gear={id:42,name:'glove test',slot:'gloves',reqLv:0,enh:0,socketCount:0,crystals:[],atkSpd:value,
  bDex:bonuses?25:0,affixes:[{id:'atkSpeed',value:bonuses?.1:0}],_implicitStat:'_iAtkSpd',_implicitVal:bonuses?10:0,_uGloveSpd:bonuses?.4:0};
 const data=plain({player:{lv:bonuses?25:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:0},
  stats:{dex:bonuses?100:20},skills:{needleShot:level},inv:{bag:bag?[gear]:[],equipped:bag?{}:{gloves:gear}}});
 vm.runInContext(s.extra+'\nfunction actualNeedleTick(sp){'+s.needle+'}\nfunction actualRecover(){'+s.recover+'}\nfunction actualFormat(){return '+s.fmt+'}',c);
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);
 c.INV.equipped.weapon={spd:.45,affixes:[]};vm.runInContext('_eqStatCache=null;_eqAffixCache=null',c);
 Object.assign(c,{bowRef:()=>100,pBowMul:()=>2,_skMul:()=>3,_addSkProf:x=>c.calls.push(['prof',x]),
  playSample:(...a)=>c.calls.push(['sample',...a]),_r:()=>1,shake:x=>c.calls.push(['shake',x]),
  _getPProj:()=>({}),pProjs:[],EL:{P:5}});c.P.facing=0;c.Math=Object.create(Math);c.Math.random=()=>.5;return c;
}
function consume(c){
 const scalar=c.statDex(),format=c.actualFormat();c.P.s='wSwing';c.P.st2=0;c.actualRecover();
 const recovery=c.P.st2;c.activateNeedleShot();const burst=plain(c.P._needleBurst);
 for(let i=0;i<7;i++)c.actualNeedleTick(1);
 return plain({scalar,format,recovery,P:c.P,G:c.G,burst,projs:c.pProjs,calls:c.calls});
}
for(const file of ['game.html','game-easy-test.html']){
 const s=source(file,dir),old=source(file,baseline);
 for(const value of [0,.1,.4,-.1,-2,null,'',false,true])for(const bonuses of [false,true])test(file+' normal scalar/emission/recovery/format '+JSON.stringify(value)+' bonuses='+bonuses,()=>{
  assert.deepEqual(consume(fixture(s,value,{bonuses})),consume(fixture(old,value,{bonuses})));
 });
 for(const [value,numeric] of [['.1',.1],['0',0],['-.1',-.1],['ab',0],[{},0],[['ab'],0]])for(const bag of [false,true])for(const bonuses of [false,true])test(file+' restored glove '+JSON.stringify(value)+' bag='+bag+' bonuses='+bonuses,()=>{
  const a=consume(fixture(s,value,{bag,bonuses})),b=consume(fixture(s,numeric,{bag,bonuses}));assert.deepEqual(a,b);
  assert.equal(a.P.st,52);assert.equal(a.P._ndCd,90);assert.equal(a.P._needleBurst,null);assert.equal(a.projs.length,2);
  assert(a.projs[0].dmg>0);assert.equal(a.projs[0].dmg,a.burst.dmg);assert(a.recovery>0);
 });
 for(const [value,damage,recovery] of [['.1',666,32],['ab',606,35]])test(file+' recovery and emitted damage independently of HUD '+value,()=>{
  const c=fixture(s,value);c.P.s='wSwing';c.P.st2=0;c.actualRecover();
  c.activateNeedleShot();for(let i=0;i<7;i++)c.actualNeedleTick(1);assert.equal(c.pProjs.length,2);assert.equal(c.pProjs[0].dmg,damage,'recovery='+c.P.st2);assert.equal(c.P.st2,recovery);
 });
 for(const level of [1,6,11])test(file+' actual skill count level '+level,()=>{
  const r=consume(fixture(s,'.1',{level}));assert.equal(r.projs.length,2+Math.floor((level-1)/5));
  assert.equal(r.burst.interval,2);assert.equal(r.burst.range,600);assert.equal(r.burst.spd,30);assert.equal(r.projs[0].pierce,0);
 });
 for(const guard of ['st','cooldown'])test(file+' whole needle activation guard '+guard,()=>{
  const c=fixture(s,'.1');if(guard==='st')c.P.st=7;else c.P._ndCd=10;
  const before=c.P.st;c.activateNeedleShot();assert.equal(c.P.st,before);assert.equal(c.P._needleBurst,undefined);assert.equal(c.pProjs.length,0);
 });
 test(file+' whole save JSON roundtrip preserves raw glove and numeric consumption',async()=>{
  const c=fixture(s,'.1',{bag:true});const first=consume(c);await c.dbSave();assert.equal(c.saved.inv.equipped.gloves.atkSpd,'.1');
  const n=fixture(s,0);assert.equal(n.dbRestore(plain(c.saved)),true);n.P.st=60;n.P._ndCd=0;
  const r=consume(n);assert.equal(r.scalar,first.scalar);assert.equal(r.projs[0].dmg,first.projs[0].dmg);
 });
}
