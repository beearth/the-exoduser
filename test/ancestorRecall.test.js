import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
 const start=html.indexOf(`function ${name}(`);assert.ok(start>=0,`${name} exists`);
 let n=0;for(let i=html.indexOf('{',start);i<html.length;i++){
  if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return html.slice(start,i+1);
 }
}
test('recall starts once, preserves stored bullets and bypasses summon costs',()=>{
 const a={hp:100,x:12,y:34,_swordAbsorbed:3,_swordDmgPool:90};
 const recall=Function('G',`${source('_recallAncestor')};return _recallAncestor`)({_ancestors:[a]});
 assert.equal(recall(),true);assert.equal(a._swordT,132);assert.equal(a._swordAbsorbed,3);
 a._swordT=100;assert.equal(recall(),true);assert.equal(a._swordT,100);
 const gate=html.slice(html.indexOf("case 'ancestorSummon':"),html.indexOf("case 'ghostXbowTurret':",html.indexOf("case 'ancestorSummon':")));
 assert.ok(gate.indexOf('_recallAncestor()')<gate.indexOf('INV.equipped.ossuary'));
});
test('resource motes arrive once, follow player and clamp all three resources',()=>{
 const G={_ancestorReturns:[{x:0,y:0,t:0,amount:300}]};
 const P={x:100,y:80,hp:10,mp:20,st:30,mhp:200,mmp:400,mst:100};
 const update=Function('G','P',`${source('_updateAncestorReturns')};return _updateAncestorReturns`)(G,P);
 update(30);assert.equal(P.hp,10);assert.ok(G._ancestorReturns[0].x>0);
 P.x=150;update(30);assert.equal(G._ancestorReturns.length,0);
 assert.equal(P.hp,200);assert.equal(P.mp,320);assert.equal(P.st,100);
 update(60);assert.equal(P.mp,320);
});
test('manual charge explodes once, removes summon, and queues stored resources only',()=>{
 const a={hp:100,_recalling:true,_swordT:1,_swordAbsorbed:4,x:10,y:20};
 const G={_ancestors:[a]},P={hp:100};let blasts=0;
 const update=Function('G','P','_detonateAncestorSword',`${source('_updateAncestorReturns')};${source('_updateAncestors')};return _updateAncestors`)(G,P,()=>blasts++);
 update(1);assert.equal(blasts,1);assert.equal(G._ancestors.length,0);
 assert.equal(G._ancestorReturns[0].amount,400);
 update(1);assert.equal(blasts,1);
});
test('lethal damage starts sword planting, preserves stored damage and only removes after explosion',()=>{
 const a={hp:0,_dead:true,_swordT:0,_swordAbsorbed:4,_swordDmgPool:900,x:10,y:20};
 const G={_ancestors:[a]},P={hp:100};const blasts=[];
 const update=Function('G','P','_detonateAncestorSword','_ancestorMeleePressure','addParts','addTxt','_T',`${source('_recallAncestor')};${source('_updateAncestorReturns')};${source('_updateAncestors')};return _updateAncestors`)(G,P,a=>blasts.push(a._swordDmgPool),()=>{},()=>{},()=>{},x=>x);
 update(1);assert.equal(G._ancestors.length,1,'must not vanish on lethal hit');
 assert.equal(a._recalling,true);assert.equal(a._swordT,132);assert.equal(blasts.length,0);
 const recall=Function('G',`${source('_recallAncestor')};return _recallAncestor`)(G);
 assert.equal(recall(),true,'dying summon still consumes recast instead of allowing replacement');
 assert.equal(a._swordT,132);
 update(72);assert.equal(a._swordT,60);assert.equal(blasts.length,0);
 update(60);assert.deepEqual(blasts,[900]);assert.equal(G._ancestors.length,0);
 assert.equal(G._ancestorReturns[0].amount,400);
 update(1);assert.equal(blasts.length,1);
});
