import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

const asset=new URL('../assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb',import.meta.url);
const motion=new URL('../chest3d.mjs',import.meta.url);
function lootHelpers(context={}){
 const game=readFileSync(new URL('../game.html',import.meta.url),'utf8');
 const start=game.indexOf('function _chestLootPositions(');
 assert.ok(start>=0,'chest loot needs a collision-aware, separated landing layout');
 return vm.runInNewContext(game.slice(start,game.indexOf('\nfunction _wiPush',start))+'\n;({_chestLootPositions,_chestDropPose,_tickChestDrops})',context);
}

test('three to five drops stay outside the chest, apart, and on a clear reachable side',()=>{
 const {_chestLootPositions}=lootHelpers();
 for(const count of [3,4,5])for(const clear of [()=>true,(x)=>x<=0]){
  const occupied=[{x:-135,y:65}];
  const points=_chestLootPositions(0,0,count,clear,occupied);
  assert.equal(points.length,count);
  for(const p of points){assert.ok(clear(p.x,p.y));assert.ok(Math.hypot(p.x,p.y)>=110);assert.ok(Math.hypot(p.x-occupied[0].x,p.y-occupied[0].y)>=64);}
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)assert.ok(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)>=64);
 }
});

test('chest drops wait for the lid, fly in an arc, and become collectable only on landing',()=>{
 const item={type:'item',x:150,y:90,_chestDrop:{fromX:0,fromY:-35,age:0,delay:.55,duration:.5,height:45}};
 const {_chestDropPose,_tickChestDrops}=lootHelpers({worldItems:[item]});
 assert.equal(_chestDropPose(item).visible,false);
 _tickChestDrops(.55);assert.equal(_chestDropPose(item).visible,true);
 _tickChestDrops(.25);const mid=_chestDropPose(item);
 assert.ok(mid.x>0&&mid.x<150);assert.ok(mid.y<27.5,'mid-flight icon must rise above its straight path');
 assert.ok(item._chestDrop,'pickup must still wait while airborne');
 _tickChestDrops(.25);assert.equal(item._chestDrop,undefined);
 assert.equal(_chestDropPose(item).x,150);assert.equal(_chestDropPose(item).y,90);
});

test('fixed 60 Hz updates pass seconds to chest flight timing',()=>{
 const game=readFileSync(new URL('../game.html',import.meta.url),'utf8');
 const update=game.slice(game.indexOf('function update(){'),game.indexOf('function update(){')+18000);
 const call=update.match(/_tickChestDrops\(([^;]+)\);/);assert.ok(call,'flight must advance inside the unpaused game update');
 let elapsed=0;const ctx={_dtSp:1,_tickChestDrops:dt=>{elapsed+=dt;}};
 for(let i=0;i<60;i++)vm.runInNewContext(call[0],ctx);
 assert.ok(Math.abs(elapsed-1)<1e-9,'60 normal simulation ticks must advance exactly one second');
});

test('runtime chest has a separate hinged lid and bounded game asset cost',()=>{
 const bytes=readFileSync(asset),json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)));
 assert.ok(json.nodes.some(n=>n.name==='ChestLidPivot'),'generated lid must be independently hinged');
 assert.ok(json.nodes.some(n=>n.name==='ChestBody'),'body must remain stationary');
 assert.ok(json.nodes.some(n=>n.name==='ChestLidUnderside'),'opening the scan must reveal a continuous wooden lid underside');
 const triangles=json.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+json.accessors[p.indices].count/3,0);
 assert.ok(triangles<=24000,`${triangles} triangles exceeds prop budget`);
 assert.ok(bytes.length<3000000,'replacement must shrink the existing 5,684,980-byte packaged asset');
 assert.ok(json.images.every(i=>i.bufferView!==undefined),'textures must travel with the GLB');
});

test('opening is idempotent, pauses, reaches a real open lid, and remains open',async()=>{
 assert.ok(existsSync(motion),'new chest animation module is required');
 const {createChestMotion,requestChestOpen,stepChestMotion}=await import(motion);
 const state=createChestMotion();
 assert.equal(state.phase,'closed');
 assert.equal(requestChestOpen(state),true);
 stepChestMotion(state,.2,true);
 assert.equal(state.elapsed,0,'paused game must not animate the chest');
 for(let i=0;i<40;i++)stepChestMotion(state,.05,false);
 assert.equal(state.phase,'open');
 assert.ok(state.lidAngle < -1.7,'lid must swing back beyond 97 degrees');
 const angle=state.lidAngle;
 assert.equal(requestChestOpen(state),false);
 for(let i=0;i<40;i++)stepChestMotion(state,.05,false);
 assert.equal(state.phase,'open');
 assert.equal(state.lidAngle,angle,'opened chest must not disappear or close');
 assert.equal(createChestMotion(true).phase,'open','late model loads must honor already-open world state');
});

test('existing real interaction grants chest rewards once and ignores distant chests',()=>{
 const game=readFileSync(new URL('../game.html',import.meta.url),'utf8');
 const code=game.slice(game.indexOf('    // 보물상자 체크 (우선)'),game.indexOf('    // ── 지옥의 잔해 줍기 ──'));
 let opened=0,potions=0;
 const items=[{type:'chest',x:20,y:0,picked:false,opened:false}];
 const context={worldItems:items,P:{x:0,y:0},G:{stage:0,mats:0},OPT:{shake:100},window:{_chest3d:{open(){opened++;}}},
  dst:(x,y,a,b)=>Math.hypot(x-a,y-b),SFX:{victory(){}},addTxt(){},addParts(){},_T:x=>x,
  SLOT_NAMES:['head'],EL:{P:0,F:1,I:2,D:3,L:4,H:5},mkItem:(slot,tier,el,rarity)=>({slot,tier,el,rarity}),
  _wiPush:x=>items.push(x),addPotion:(_kind,count)=>{potions+=count;return false;},_petTut:{firstChest:true},Math};
 context.canMv=()=>true;Object.assign(context,lootHelpers(context));vm.createContext(context);
 const interact=()=>vm.runInContext(`(()=>{${code}})()`,context);
 interact();
 assert.equal(items[0].opened,true);
 assert.ok(items.filter(i=>i.type==='item').length>=3&&items.filter(i=>i.type==='item').length<=5);
 const drops=items.filter(i=>i.type==='item');
 for(const item of drops)assert.ok(Math.hypot(item.x-items[0].x,item.y-items[0].y)>=110,'loot must land outside the chest footprint');
 for(let i=0;i<drops.length;i++)for(let j=i+1;j<drops.length;j++)assert.ok(Math.hypot(drops[i].x-drops[j].x,drops[i].y-drops[j].y)>=64,'loot icons must not stack on each other');
 assert.equal(context.G.mats,5);assert.equal(potions,2);assert.equal(opened,1);
 const count=items.length;interact();
 assert.equal(items.length,count);assert.equal(context.G.mats,5);assert.equal(potions,2);assert.equal(opened,1);
 items.push({type:'chest',x:200,y:0,picked:false,opened:false});interact();
 assert.equal(items.at(-1).opened,false,'range<60 remains authoritative');
});
