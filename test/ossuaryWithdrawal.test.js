import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for(const file of ['game.html','game-easy-test.html']){
 const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 function setup(){
  const panel={dataset:{selectedPart:'skull'}};
  const c=vm.createContext({INV:{bag:[],selected:0,ossCollect:{iron_warlord_skull:{r:5,t:4}}},ANC_ROSTER:[{id:'iron_warlord',ko:'철갑 전대'}],_BONE_PARTS:['skull','torso','arms','legs'],_BONE_PART_KO:{skull:'두개골'},P:{lv:900},BAG_MAX:3,saves:0,renders:0,events:[],panel,$:id=>id==='invOssuaryPanel'?panel:null,notify(){},_T:s=>s,_L:(s)=>s,_invFindSpace:()=>({x:2,y:3}),_invClearHover(){c.events.push('clear')},dbSaveForce(){c.saves++},renderInv(){c.renders++;c.events.push('render')}});
  const a=html.indexOf('function mkBonePart('),b=html.indexOf('// 부위 포인트 =',a);vm.runInContext(html.slice(a,b),c);
  const start=html.indexOf('function withdrawBonePart(');
  if(start>=0)vm.runInContext(html.slice(start,html.indexOf('// 유니크 유골함 자동 지급',start)),c);
  return c;
 }
 test(file+': withdrawing returns exactly one matching bone and removes its collection record',()=>{
  const c=setup();assert.equal(typeof c.withdrawBonePart,'function','bone withdrawal must exist');
  assert.equal(c.withdrawBonePart(0,'skull'),true);
  assert.equal(c.INV.bag.length,1);const it=c.INV.bag[0];
  assert.equal(it.rarity,5);assert.equal(it.tier,4);assert.equal(it.part,'skull');assert.equal(it.anc,'iron_warlord');
  assert.equal(it._gx,2);assert.equal(it._gy,3);assert.equal(it.itemLv,0);
  assert.equal(c.INV.ossCollect.iron_warlord_skull,undefined);assert.equal(c.saves,1);
  assert.equal(c.INV.selected,null);assert.equal(c.panel.dataset.selectedPart,'');
  assert.equal(c.events.join(','),'render,clear');
  assert.equal(c.withdrawBonePart(0,'skull'),false);assert.equal(c.INV.bag.length,1);
 });
 test(file+': a full grid or bag preserves the registered bone without saving',()=>{
  const c=setup();assert.equal(typeof c.withdrawBonePart,'function','bone withdrawal must exist');
  c._invFindSpace=()=>null;assert.equal(c.withdrawBonePart(0,'skull'),false);assert.equal(c.INV.bag.length,0);assert.equal(c.INV.ossCollect.iron_warlord_skull.r,5);
  c._invFindSpace=()=>({x:0,y:0});c.INV.bag=[{},{},{}];assert.equal(c.withdrawBonePart(0,'skull'),false);assert.equal(c.INV.bag.length,3);assert.equal(c.saves,0);
 });
 test(file+': invalid ancestor and part cannot change collection data',()=>{
  const c=setup();assert.equal(typeof c.withdrawBonePart,'function','bone withdrawal must exist');
  assert.equal(c.withdrawBonePart(9,'skull'),false);assert.equal(c.withdrawBonePart(0,'bogus'),false);assert.equal(c.saves,0);assert.equal(c.INV.bag.length,0);
 });
}
