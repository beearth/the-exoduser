import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';
function extract(source,name,constant=false){
  const anchor=constant?`const ${name}=`:`function ${name}(`;
  const start=source.indexOf(anchor);assert.ok(start>=0,anchor);
  const expression=constant?start+anchor.length:start;
  const end=parseExpressionAt(source,expression,{ecmaVersion:'latest'}).end;
  return constant?`${anchor}${source.slice(expression,end)};`:source.slice(start,end);
}
for(const file of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
 test(file+': saved unique identity survives the actual name migration; legacy behavior remains',()=>{
  const ctx=vm.createContext({});
  vm.runInContext(['WTYPES','_WP_MOD'].map(n=>extract(source,n,true)).join('\n')+'\n'+extract(source,'_weaponName')+'\n'+extract(source,'_fixWpnName',true)+'\nglobalThis.migrate=_fixWpnName;',ctx);
  for(const uniqueId of ['UI-08','UNKNOWN',' ',undefined,'',null,8,{},['UI-08']]){
   const item={slot:'weapon',wtype:'dagger',name:'saved-unique-name',rarity:5,atk:12.375,uniqueSpecial:{value:1.375},affixes:[{value:.125}]};
   if(uniqueId!==undefined)item.uniqueId=uniqueId;
   const before=structuredClone(item);ctx.migrate(item);ctx.migrate(item);
   if(typeof uniqueId==='string'&&uniqueId.length)assert.deepEqual(item,before);
   else{assert.equal(item.name,ctx._weaponName('dagger',0,0));assert.equal(item._nameMig,1);delete item.name;delete item._nameMig;delete before.name;assert.deepEqual(item,before);}
  }
 });
 for(const affordable of [true,false])test(file+': full equip, save snapshot and drop at refund overflow; affordable='+affordable,()=>{
  const old={id:'old',slot:'weapon',rarity:4,enh:145627,tier:0,name:'old',_gx:0,_gy:0};
  const item={id:'new',slot:'weapon',rarity:2,enh:0,tier:0,name:'new',_gx:1,_gy:0};
  const inv={bag:[item],equipped:{weapon:old}};const game={mats:0};let saved=null,saves=0,pickups=0;
  const math=Object.create(Math);math.random=()=>{throw Error('unexpected random');};
  const ctx=vm.createContext({INV:inv,G:game,P:{lv:1,x:0,y:0},Math:math,Date:{now:()=>10000},_dropItemLast:0,
   _earringSlot:()=>false,_equipSlot:i=>i.slot,_itemSz:()=>[1,1],_invFindSpace:()=>({x:0,y:0}),
   notify:()=>{},_L:a=>a,_T:a=>a,addTxt:()=>{},enhColor:()=>'',recalcSt:()=>{},playEquipSfx:()=>{},window:{},
   SFX:{pickup(){pickups++;}},dbSaveForce(){saves++;saved=JSON.parse(JSON.stringify(inv));},dbSaveNow(){saves++;saved=JSON.parse(JSON.stringify(inv));}
  });
  const names=['_malCost','xferCost','_itemEconomyRarity','salvageVal','equipItem','dropItem'];
  vm.runInContext(extract(source,'_MALICE_COST_MUL',true)+'\n'+names.map(n=>extract(source,n)).join('\n'),ctx);
  const cost=ctx.xferCost(old.enh);game.mats=affordable?cost+7:cost-1;
  const before=JSON.stringify(inv);ctx.equipItem(item);
  if(!affordable){assert.equal(JSON.stringify(inv),before);assert.equal(game.mats,cost-1);assert.equal(saves,0);return;}
  assert.equal(game.mats,7);assert.equal(inv.equipped.weapon,item);assert.equal(item.enh,145627);assert.equal(old.enh,0);assert.equal(saves,1);
  // Fixed expected boundary from the unchanged legacy sum, not a copy of candidate code.
  assert.equal(old._enhRefund,2147506212);
  assert.equal(saved.bag[0]._enhRefund,2147506212);assert.equal(saved.bag[0].enh,0);
  inv.bag=JSON.parse(JSON.stringify(saved.bag));
  assert.equal(ctx.dropItem(0),true);assert.equal(game.mats,7+50000+2147506212);assert.equal(inv.bag.length,0);assert.equal(pickups,1);assert.equal(saves,2);
 });
}
