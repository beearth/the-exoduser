const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('game.html','utf8');
const array=name=>Function('return '+html.match(new RegExp('const '+name+'=(\\[[\\s\\S]*?\\]);'))[1])();
function harness(){
  const c={INV:{equipped:{headband:null,headband2:null},bag:[],selected:null},P:{lv:100,x:0,y:0},G:{mats:0},CRYSTAL_BAG:[],CRYSTAL_BAG_MAX:9999,CRYSTAL_DEFS:{},window:{},Date,Math,
    _L:a=>a,_T:a=>a,notify(){},recalcSt(){},applyStats(){},renderInv(){},playEquipSfx(){},playItemPickupSfx(){},dbSaveForce(){},_itemSz:()=>[2,2],_invFindSpace:()=>({x:0,y:0}),xferCost:()=>10,_rarName:()=>'',playFM(){},playNoise(){}};
  vm.createContext(c);
  vm.runInContext(html.slice(html.indexOf('function _earringSlot('),html.indexOf('let _dropItemLast=')),c);
  vm.runInContext(html.slice(html.indexOf('function pickupItem('),html.indexOf('function recalcSt(')),c);
  return c;
}
const earring=(name,slot='headband')=>({name,slot,rarity:0,enh:0,socketCount:0,crystals:[]});
test('17 stable equipment ids, 16 non-overlapping paperdoll sockets',()=>{
  const names=array('SLOT_NAMES'),pos=array('EQ_POS');
  assert.equal(names.length,17);assert.equal(names[15],'ossuary');assert.equal(names[16],'headband2');
  for(const key of ['SLOT_KR','SLOT_EN','SLOT_EMOJI','SLOT_SVG'])assert.equal(array(key).length,17,key);
  const visible=names.map((n,i)=>n==='ossuary'?null:pos[i]).filter(Boolean);
  assert.equal(visible.length,16);assert.deepEqual(pos[16],[504,0]);
  visible.forEach(([x,y],i)=>{assert.ok(x>=0&&x+72<=600&&y>=0&&y+72<=324);visible.slice(i+1).forEach(([a,b])=>assert.ok(x+72<=a||a+72<=x||y+72<=b||b+72<=y));});
});
test('manual equip fills both earrings and allows replacing either one',()=>{
  const c=harness(),a=earring('a'),b=earring('b'),d=earring('d');c.INV.bag.push(a,b,d);
  c.equipItem(a);c.equipItem(b);
  assert.equal(c.INV.equipped.headband,a);assert.equal(c.INV.equipped.headband2,b);assert.equal(b.slot,'headband2');
  c._equipEarringTo(d,'headband2');assert.equal(c.INV.equipped.headband,a);assert.equal(c.INV.equipped.headband2,d);assert.ok(c.INV.bag.includes(b));
  c.unequipItem('headband2');assert.equal(c.INV.equipped.headband2,null);assert.equal(c.INV.equipped.headband,a);assert.ok(c.INV.bag.includes(d));
});
test('pickup uses empty earrings, then bag; failed replacement preserves both',()=>{
  const c=harness(),a=earring('a','headband2'),b=earring('b'),d=earring('d');
  c.pickupItem(a);c.pickupItem(b);c.pickupItem(d);
  assert.equal(c.INV.equipped.headband,a);assert.equal(c.INV.equipped.headband2,b);assert.ok(c.INV.bag.includes(d));
  b.enh=3;c._equipEarringTo(d,'headband2');assert.equal(c.INV.equipped.headband2,b);assert.equal(d.slot,'headband');assert.ok(c.INV.bag.includes(d));
  d.reqLv=200;c._equipEarringTo(d,'headband');assert.equal(c.INV.equipped.headband,a);
});
test('old saves retain the first earring and new saves retain both',()=>{
  const INV={equipped:{headband:earring('old')}};
  vm.runInNewContext(html.match(/if\(INV\.equipped\.headband2===undefined\)[^;]+;/)[0],{INV});
  assert.equal(INV.equipped.headband.name,'old');assert.equal(INV.equipped.headband2,null);
  INV.equipped.headband2=earring('new','headband2');assert.equal(JSON.parse(JSON.stringify(INV)).equipped.headband2.name,'new');
});
test('shared affix/crystal/art types, complete stats, single forge category',()=>{
  assert.ok(array('CR_ACC_SLOTS').includes('headband2'));
  assert.match(html,/headband2:'headband'/);assert.match(html,/headband2:'earring'/);
  assert.match(html,/if\(slot==='headband2'\)\{const item=mkItem\('headband',tier,el,rarity,wtype\);item.slot=slot;return item\}/);
  assert.match(html,/const _mpEnhSet=new Set\(\[[^\]]*'headband2'/);
  assert.match(html,/const _allDefSlots=\[[^\]]*'headband2'/);
  assert.match(html,/_eq\.headband2\|\|\{\}\)\.dmgBonus/);
  assert.equal((html.match(/INV\.equipped\.headband2&&INV\.equipped\.headband2\.eDef/g)||[]).length,2);
  assert.equal(array('_craftSlots').filter(x=>x==='headband2').length,0);
  assert.doesNotMatch(html,/slots:\[[^\]]*'headband2'/); // slot category stays canonical headband
});
