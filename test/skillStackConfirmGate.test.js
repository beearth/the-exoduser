import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

for (const file of ['game.html','game-easy-test.html']) {
 const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const iceStart=source.search(/^  if\(P\._isAiming\)\{\r?$/m);
 const iceEnd=source.indexOf('// ═══ 독가스탄',iceStart);
 const boneStart=source.indexOf('function fireBoneWall(tx,ty){');
 const boneEnd=source.indexOf('// ═══ 폭산탄',boneStart);
 const noop=()=>{};
 function ice(mp,stk,click=true,cancel=false,blocked=false){
  const P={x:0,y:0,mp,skills:{iceStorm:1},_isStk:stk,_isAiming:true};
  const G={cam:{x:0,y:0},_fireZones:blocked?[{type:'iceStorm',x:0,y:0,r:400}]:[]};
  const args={P,G,mouse:{x:0,y:0},VW:0,VH:0,dst:Math.hypot,MBjust:[click,false,cancel],K:{},showPH:noop,_T:x=>x,EL:{I:1},SFX:{magic:noop},playSample:noop,addTxt:noop,shake:noop};
  new Function(...Object.keys(args),source.slice(iceStart,iceEnd))(...Object.values(args));
  return {mp:P.mp,stk:P._isStk,zones:G._fireZones.length,aim:P._isAiming};
 }
 test(file+': 아이스스톰 확정 비용/부족/스택0/취소/중복 지역',()=>{
  assert.deepEqual(ice(40,1),{mp:0,stk:0,zones:1,aim:false});
  assert.deepEqual(ice(39,1),{mp:39,stk:1,zones:0,aim:true});
  assert.deepEqual(ice(40,0),{mp:40,stk:0,zones:0,aim:false});
  assert.deepEqual(ice(40,1,true,true),{mp:40,stk:1,zones:0,aim:false});
  assert.deepEqual(ice(40,1,true,false,true),{mp:40,stk:1,zones:1,aim:true});
 });
 test(file+': 해골무덤 악의 경계/MP0/스택0/재호출',()=>{
  for(const [mats,stk,success] of [[6,1,true],[5,1,false],[6,0,false]]){
   const P={mp:0,x:0,y:0,skills:{boneWall:1},_bwStk:stk};const G={mats};
   const args={P,G,_malCost:n=>Math.ceil(n*.5),showPH:noop,_T:x=>x,_addSkProf:noop,meleeRef:()=>1,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,EL:{D:1},SFX:{magic:noop},playSample:noop,_r:()=>1,shake:noop,addTxt:noop};
   const fire=new Function(...Object.keys(args),source.slice(boneStart,boneEnd)+';return fireBoneWall;')(...Object.values(args));
   fire(0,0);
   assert.equal(G._boneWalls?.length||0,success?1:0);assert.equal(G.mats,success?0:mats);assert.equal(P._bwStk,success?0:stk);assert.equal(P.mp,0);
   fire(0,0);assert.equal(G._boneWalls?.length||0,success?1:0);
  }
 });
}
