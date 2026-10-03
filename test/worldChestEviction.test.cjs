'use strict';
// Actual source helper/GC/chest lanes; item factory, input and presentation are fixtures.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{test}=require('node:test');
const sourceRoot=process.env.EXODUSER_TEST_SOURCE_DIR||path.resolve(__dirname,'..');
function fixture(file,random=0.5){
 const source=fs.readFileSync(path.join(sourceRoot,file),'utf8');
 const push=source.split(/\r?\n/).find(x=>x.startsWith('function _wiPush(wi)'));
 const gcStart=source.indexOf('// worldItems picked 정리');
 const gcEnd=source.indexOf('// G.txts:',gcStart);
 const gc=source.slice(gcStart,gcEnd);
 const openStart=source.indexOf('// 보물상자 체크 (우선)');
 const open=source.slice(openStart,source.indexOf('// ── 지옥의 잔해 줍기',openStart));
 const spawn=source.split(/\r?\n/).find(x=>x.includes("_wiPush({x:cx,y:cy,type:'chest',picked:false,opened:false});"));
 assert(push&&gcStart>0&&gcEnd>gcStart&&openStart>0&&spawn,'actual source anchors missing');
 const c=vm.createContext({});
 vm.runInContext(`var worldItems=[],P={x:0,y:0},G={stage:0,mats:0,shake:0},OPT={shake:100};
 var effects=[],minted=[],potions=[],_petTut={firstChest:false},SLOT_NAMES=['weapon'],EL={P:0,F:1,I:2,D:3,L:4,H:5};
 var window={_chest3d:{open:()=>effects.push('open3d')}},SFX={victory:()=>effects.push('victory')};
 var cx=0,cy=0;
 function playItemDropSfx(...args){effects.push(['drop',...args]);}
 function dst(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by);}
 function _T(x){return x;} function addTxt(...x){effects.push(['text',...x]);}
 function addParts(...x){effects.push(['parts',...x]);} function _petSayCD(...x){effects.push(['pet',...x]);}
 function addPotion(type,count){potions.push([type,count]);return true;}
 function mkItem(slot,tier,el,rarity){const item={id:'reward'+minted.length,slot,tier,el,rarity};minted.push(item);return item;}
 Math.random=()=>${random};
 ${push}
 function runGC(){${gc}}
 function spawnChest(){${spawn}return worldItems.find(x=>x.type==='chest'&&!x.opened);}
 function openChest(){${open}return chestOpened;}`,c);
 return c;
}
function item(id,rarity=0,extra={}){return {x:0,y:0,type:'item',item:{id,rarity},picked:false,...extra};}
function plain(x){return JSON.parse(JSON.stringify(x));}
for(const file of ['game.html','game-easy-test.html']){
 test(file+': boss reward producer survives a full field and later drops until normal opening',()=>{
  const c=fixture(file);c.worldItems.push(...Array.from({length:20},(_,i)=>item('old'+i)));
  const chest=c.spawnChest();assert(chest,'full field discarded the newly spawned unopened chest');
  for(let i=0;i<80;i++){c._wiPush(item('later'+i,i%6));assert(c.worldItems.includes(chest));assert.equal(c.worldItems.length,20);}
  assert.equal(c.G.mats,0);assert.equal(chest.opened,false);
  assert.equal(c.openChest(),true);assert.equal(chest.opened,true);assert.equal(c.G.mats,5);
  assert.equal(c.minted.length,4);assert.deepEqual(plain(c.potions),[['hp',2]]);
  const trace=plain(c.effects);assert.equal(c.openChest(),false);assert.deepEqual(plain(c.effects),trace);assert.equal(c.G.mats,5);
 });
 test(file+': actual GC compaction and direct-producer overflow preserve unopened chest identity',()=>{
  const c=fixture(file),chest={x:10,y:20,type:'chest',picked:false,opened:false,tag:'unopened'};
  c.worldItems.push(chest,...Array.from({length:25},(_,i)=>item('gc'+i,i%6)),item('consumed',5,{picked:true}));
  c.runGC();assert.equal(c.worldItems.length,20);assert(c.worldItems.includes(chest));assert.equal(chest.x,10);assert.equal(chest.opened,false);
  assert(!c.worldItems.some(x=>x.item&&x.item.id==='consumed'));
 });
 test(file+': equipment/nonchest selection order and drop feedback remain exact normal controls',()=>{
  const c=fixture(file);const initial=[{type:'hp',picked:false},...Array.from({length:19},(_,i)=>item('e'+i,i%6))];
  c.worldItems.push(...initial);c._wiPush(item('new',5));
  assert.deepEqual(plain(c.worldItems.map(x=>x.item&&x.item.id)),['new',...Array.from({length:19},(_,i)=>'e'+i)]);
  c._wiPush(item('next',5));assert.equal(c.worldItems[1].item.id,'next');assert.equal(c.worldItems.length,20);
  assert.deepEqual(plain(c.effects),[['drop',5,0,0],['drop',5,0,0]]);
  const preview=item('preview',5,{_dropPreview:true});c._wiPush(preview);assert.equal(c.effects.length,2);
  const fresh=fixture(file);fresh.worldItems.push(...Array.from({length:23},(_,i)=>item('clean'+i,i%6)));fresh.runGC();
  assert.deepEqual(plain(fresh.worldItems.map(x=>x.item.id)),['clean22','clean1','clean2','clean3','clean4','clean5','clean21','clean7','clean8','clean9','clean10','clean11','clean20','clean13','clean14','clean15','clean16','clean17','clean18','clean19']);
 });
 test(file+': opened/picked chests retain ordinary removal and full protected arrays still obey20',()=>{
  for(const flags of [{opened:true,picked:false},{opened:false,picked:true}]){
   const c=fixture(file),chest={type:'chest',x:0,y:0,...flags};c.worldItems.push(chest,...Array.from({length:19},(_,i)=>item('normal'+i,5)));
   c._wiPush(item('after',5));assert(!c.worldItems.includes(chest));assert.equal(c.worldItems.length,20);
  }
  const c=fixture(file);const chests=Array.from({length:35},(_,i)=>({type:'chest',x:i,y:0,opened:false,picked:false}));
  for(const chest of chests)c._wiPush(chest);assert.equal(c.worldItems.length,20);assert(!c.worldItems.includes(chests[0]));
  c.worldItems.push(...chests.slice(0,5));c.runGC();assert.equal(c.worldItems.length,20);
 });
 test(file+': normal actual opening produces3/4/5, consumes once and leaves far chest unconsumed',()=>{
  for(const [r,n] of [[0,3],[.5,4],[.999,5]]){
   const c=fixture(file,r),chest=c.spawnChest();assert.equal(c.openChest(),true);
   assert.equal(c.minted.length,n);assert.equal(c.worldItems.filter(x=>x.type==='item').length,n);
   assert.equal(chest.opened,true);assert.equal(c.G.mats,5);assert.equal(c.openChest(),false);assert.equal(c.minted.length,n);
   const far={type:'chest',x:60,y:0,opened:false,picked:false};c.worldItems.push(far);assert.equal(c.openChest(),false);assert.equal(far.opened,false);
  }
 });
}
