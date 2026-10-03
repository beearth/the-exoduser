// Whole save/restore/sanitize and useQuickslot/addPotion/updateQS. Reuses the
// prior restore fixture without running its tests. Synthetic empty skill slots,
// DOM nodes/audio/UI/migrations/stat rebuilding; no actual input or native play.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir,plain=x=>JSON.parse(JSON.stringify(x));
const helper=fs.readFileSync(path.join(__dirname,'potionCooldownConsumption.test.cjs'),'utf8');
const h={require,__dirname,process,console};vm.createContext(h);
vm.runInContext(helper.slice(0,helper.lastIndexOf("\nfor(const file of ['game.html'")),h);
function read(file,base){
 const s=h.source(file,base);const html=fs.readFileSync(path.join(base,file),'utf8');
 const src=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).find(x=>x.includes('function addPotion('));
 s.extra=['addPotion','updateQS'].map(n=>{const m='function '+n+'(';assert.equal(src.split(m).length,2);const a=src.indexOf(m),node=acorn.parseExpressionAt(src,a,{ecmaVersion:'latest'});return src.slice(node.start,node.end)}).join('\n');return s;
}
function restore(s,qslots){
 const c=h.fixture(s,0);const d=plain({player:{lv:2,exp:4,maxExp:200,sp:9,ap:5,hp:100,mp:60,st:60,shield:0},
  qslots,game:{stage:1,kills:7,mats:0},skills:{},hellCleared:[0],bagMax:111});
 assert.equal(c.dbRestore(d),true);assert.equal(c.P.lv,2);assert.equal(c.G.stage,1);assert.equal(c.BAG_MAX,111);
 c.G.mats=20;c.P.hp=10;c.P.mhp=5000;
 const nodes=Array.from({length:6},()=>({style:{},children:[],classList:{add(){},remove(){}},offsetWidth:0,
  set innerHTML(x){this._html=x;this.children=[{children:[]},{children:[]},{children:[]}]},get innerHTML(){return this._html},
  querySelector(){return null}}));
 c.$=id=>/^qs\d$/.test(id)?nodes[+id.slice(2)]:null;c.qsAuto=[false,false,false,false];c._qsSwapSel=-1;
 c.SFX.pickup=()=>c.calls.push(['pickup']);c._requestQSRefresh=()=>c.calls.push(['refresh']);
 c._updateSkCdHud=()=>{};c._updateActionKeys=()=>{};c.updateUltSlot=()=>{};c._updateUltSlot=()=>{};c.updateSkillSlots=()=>{};
 vm.runInContext(s.extra,c);c.nodes=nodes;return c;
}
function consume(c){
 for(let i=0;i<4;i++)c.useQuickslot(i);
 c.updateQS();const pickup=c.addPotion('hp',2);assert.equal(pickup,true);c.updateQS();
 return plain({P:c.P,G:c.G,slots:c.QSLOTS,cd:c.qsCooldown,calls:c.calls,nodes:c.nodes});
}
const hp={type:'hp',count:1},empty={type:null,count:0};
for(const file of ['game.html','game-easy-test.html']){
 const s=read(file,dir),old=read(file,baseline);
 for(const slots of [[hp,empty,empty,empty],[{...hp,count:'2',auto:true},empty,empty,empty],
  [{type:'removed',count:4},empty,empty,empty],[hp,empty,empty,empty,{type:'hp',count:20,custom:'preserved'}]]){
  test(file+' normal whole restore/consumer equivalence '+JSON.stringify(slots),()=>assert.deepEqual(consume(restore(s,slots)),consume(restore(old,slots))));
 }
 for(const qslots of ['bad',{},42,true,[],[hp],[hp,null],['bad',0,true,[]],[null,null,null,null]]){
  test(file+' malformed restore reaches complete later state and every consumer '+JSON.stringify(qslots),()=>{
   const c=restore(s,qslots);assert(c.QSLOTS.length>=4);
   for(let i=0;i<4;i++)assert(c.QSLOTS[i]&&typeof c.QSLOTS[i]==='object'&&!Array.isArray(c.QSLOTS[i]));
   const result=consume(c);assert.equal(result.G.mats,21+(qslots[0]&&qslots[0].type==='hp'?0:1));
  });
 }
 for(const qslots of [null,false,0,''])test(file+' absent/falsy qslots keeps existing defaults '+JSON.stringify(qslots),()=>{
  assert.deepEqual(consume(restore(s,qslots)),consume(restore(old,qslots)));
 });
 for(const caller of ['useQuickslot','updateQS'])test(file+' whole '+caller+' after short restore/sanitize',()=>{
  const c=restore(s,[hp]);if(caller==='useQuickslot'){for(let i=0;i<4;i++)c.useQuickslot(i);assert.equal(c.G.mats,19)}else c.updateQS();
 });
 test(file+' non-HP addPotion array consumer reaches first empty slot after short restore',()=>{
  const c=restore(s,[hp]);assert.equal(c.addPotion('synthetic-nonhp',2),true);assert.equal(c.QSLOTS[1].type,'synthetic-nonhp');assert.equal(c.QSLOTS[1].count,2);
  // This synthetic branch is not a newly implemented potion; production POT has HP only.
 });
 test(file+' save roundtrip keeps valid extra fields and repaired blank slots',async()=>{
  const c=restore(s,[{...hp,custom:'kept'},null]);await c.dbSave();assert.equal(c.saved.qslots.length,4);
  assert.equal(c.saved.qslots[0].custom,'kept');assert.deepEqual(plain(c.saved.qslots[1]),empty);
  const n=restore(s,c.saved.qslots);assert.deepEqual(plain(n.QSLOTS),plain(c.QSLOTS));consume(n);
 });
}
