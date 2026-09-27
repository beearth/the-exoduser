import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const crystals=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE='));
const forge=html.slice(html.indexOf('function renderForge(){'),html.indexOf("$('fgClose').onclick="));
// Minimal DOM for exercising the real forge's click handlers without game boot/save IO.
class Element {
  constructor(){this.children=[];this.style={setProperty(){}};this.classList={add(){}};this.dataset={};this.textContent='';}
  append(...nodes){this.children.push(...nodes);}
  set innerHTML(value){this.markup=value;this.children=[];}
  get innerHTML(){return this.markup||'';}
  appendChild(child){this.children.push(child);return child;}
  replaceChildren(...children){this.children=children;}
  setAttribute(key,value){this[key]=value;}
  querySelector(){return null;}
}
function runtime(bag){
  const elements=new Map();
  const ctx=vm.createContext({HTMLButtonElement:Element,document:{activeElement:null,createElement:()=>new Element(),querySelector:()=>null,querySelectorAll:()=>[]},
    $:id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},
    G:{mats:100000,forgeTab:'crystal'},OPT:{lang:'ko'},P:{x:0,y:0},
    _L:(ko)=>ko,_T:x=>x,_glyph:()=>'',_malCost:x=>x,
    _ensureForgeAtlasLoad(){},BGM:{play(){}},SFX:{forge(){}},
    applyStats(){},addTxt(){},dbSaveNow(){},notify(){},INV:{equipped:{},bag:[]},
    SLOT_NAMES:['weapon','armor','ring1'],_slotName:i=>['Weapon','Armor','Ring'][i],
    _forgeSel:null,_salSel:new Set(),_rerollSel:null,bag});
  vm.runInContext(crystals+'\n'+forge+'\nCRYSTAL_BAG=bag;',ctx);
  return {ctx,elements,run:code=>vm.runInContext(code,ctx)};
}
const cr=(id,star=0,enh=0)=>({id,star,enh});
function descendants(node){return [node,...node.children.flatMap(descendants)];}
function button(rt,label){return descendants(rt.elements.get('fgGrid')).find(e=>e.textContent===label);}
function list(rt,id){return descendants(rt.elements.get('fgGrid')).find(e=>e.id===id);}

test('gems inventory groups quantities without changing bag order and filters independently of the forge',()=>{
  const bag=[cr('cr_martyr_tear'),cr('cr_blood_oath',2),cr('cr_martyr_tear'),cr('cr_martyr_tear',0,3)];
  const rt=runtime(bag),before=JSON.stringify(bag);
  assert.equal(rt.run('typeof renderInvCrystals'),'function','Dedicated inventory renderer exists');
  rt.run("_crForgeFilter='atk';_invCrFilter='def';renderInvCrystals()");
  const slots=descendants(rt.elements.get('invCrystalsPanel')).filter(n=>n.className==='inv-cr-slot');
  assert.equal(slots.length,2);
  assert.equal(slots[0].dataset.count,'1');
  assert.equal(slots[1].dataset.count,'2');
  assert.equal(rt.run('_crForgeFilter'),'atk');
  assert.equal(JSON.stringify(bag),before);
});

test('gems inventory attaches exactly the selected object to a compatible empty equipped socket',()=>{
  const selected=cr('cr_martyr_tear',2,4),other=cr('cr_blood_oath'),rt=runtime([other,selected]);
  assert.equal(rt.run('typeof renderInvCrystals'),'function');
  const armor={slot:'armor',name:'Test armor',crystals:[null]},weapon={slot:'weapon',name:'Test sword',crystals:[null]};
  rt.ctx.INV.equipped={armor,weapon};
  rt.run('renderInvCrystals()');
  const slot=descendants(rt.elements.get('invCrystalsPanel')).find(n=>n.className==='inv-cr-slot'&&n.dataset.id==='cr_martyr_tear');
  slot.onclick();
  const buttons=descendants(rt.elements.get('invCrystalsPanel')).filter(n=>n.className==='inv-cr-attach');
  assert.equal(buttons.length,1,'Incompatible weapons are not offered');
  buttons[0].onclick();
  assert.equal(armor.crystals[0],selected);
  assert.deepEqual(rt.ctx.bag,[other]);
  buttons[0].onclick();
  assert.deepEqual(rt.ctx.bag,[other],'A stale click cannot consume another gem');
});

test('empty gems inventory shows an empty state without changing items or resources',()=>{
  const rt=runtime([]);
  assert.equal(rt.run('typeof renderInvCrystals'),'function');
  rt.run('renderInvCrystals()');
  assert.ok(descendants(rt.elements.get('invCrystalsPanel')).some(n=>n.className==='inv-cr-empty'));
  assert.equal(rt.ctx.G.mats,100000);
  assert.equal(rt.ctx.INV.bag.length,0);
});

test('selected named gem shows every effect as a separate row with its lore',()=>{
  const rt=runtime([cr('cr_blood_oath')]);
  rt.run('renderInvCrystals()');
  const panel=rt.elements.get('invCrystalsPanel');
  descendants(panel).find(n=>n.className==='inv-cr-slot').onclick();
  const rows=descendants(panel).filter(n=>n.className==='inv-cr-effect');
  assert.equal(rows.length,3);
  assert.deepEqual(rows.map(n=>n.children[0].textContent),['공격력','치명확률','최대 HP']);
  assert.deepEqual(rows.map(n=>n.children[1].textContent),['+1','+0.06%','+2']);
  assert.match(descendants(panel).find(n=>n.className==='inv-cr-lore').textContent,/서약/);
});

test('inventory has no crystal management section or pouch shortcut; sockets still open the picker',()=>{
  const inv=html.slice(html.indexOf('function renderInv(){'),html.indexOf('function _fgCraft('));
  assert.doesNotMatch(inv,/invCrystalRow|CRYSTAL_BAG\.sort/);
  const markup=html.slice(html.indexOf('<!-- INVENTORY PANEL -->'),html.indexOf('<!-- INVENTORY PANEL -->')+3000);
  assert.doesNotMatch(markup,/renderCrystalBag/);
  assert.match(html,/openCrystalPicker\(function\(cr,bi\)\{attachCrystal/);
});

test('display groups preserve distinct enhancements, original bag order and source indices',()=>{
  const bag=[cr('cr_martyr_tear'),cr('cr_blood_oath',3),cr('cr_martyr_tear',0,2),{id:'cr_martyr_tear',star:0},cr('cr_deep_well')];
  const rt=runtime(bag),before=JSON.stringify(bag);
  assert.equal(rt.run('typeof _crBagGroups'),'function');
  const groups=rt.run("_crBagGroups('def')");
  assert.equal(groups.length,2);
  assert.deepEqual(Array.from(groups[0].idxs),[2]);
  assert.deepEqual(Array.from(groups[1].idxs),[0,3]);
  assert.equal(JSON.stringify(bag),before);
  assert.equal(rt.run("_crBagGroups('acc')[0].id"),'cr_deep_well');
  assert.equal(rt.run("_crBagGroups('atk')[0].star"),3);
});

test('grouped enhancement consumes exactly one feed and retains the selected crystal after index shifts',()=>{
  const target=cr('cr_martyr_tear',0,2),feed=cr('cr_martyr_tear'),other=cr('cr_deep_well');
  const rt=runtime([feed,other,target]);
  rt.run("_crForgeFilter='def';renderForge()");
  assert.ok(list(rt,'crForgeList'),'grouped owned-crystal list');
  list(rt,'crForgeList').children[0].onclick();
  const cost=rt.run('crystalEnhCost(bag[2])');
  button(rt,'강화 (악의 '+cost+' + 결정 ×1)').onclick();
  assert.equal(target.enh,3);
  assert.deepEqual(rt.ctx.bag,[other,target]);
  assert.equal(rt.run('CRYSTAL_BAG[_crForgeSel]'),target);
  assert.equal(rt.ctx.G.mats,100000-cost);
});

test('decomposing a grouped row removes one crystal, credits one refund and keeps unrelated crystals',()=>{
  const a=cr('cr_martyr_tear'),b=cr('cr_martyr_tear'),other=cr('cr_blood_oath');
  const rt=runtime([other,a,b]);
  rt.run("_crForgeFilter='def';_crForgeTab='decomp';renderForge()");
  assert.ok(list(rt,'crDecompList'),'grouped decomposition list');
  assert.equal(list(rt,'crDecompList').children.length,1);
  list(rt,'crDecompList').children[0].onclick();
  assert.deepEqual(rt.ctx.bag,[other,b]);
  assert.equal(rt.run('CRYSTAL_DUST'),25);
});

test('filtered bulk synthesis includes mixed enhancements but never consumes hidden categories',()=>{
  const hidden=[cr('cr_blood_oath'),cr('cr_blood_oath'),cr('cr_blood_oath')];
  const rt=runtime([...hidden,cr('cr_martyr_tear'),cr('cr_martyr_tear',0,2),cr('cr_martyr_tear',0,4)]);
  rt.run("_crForgeFilter='def';_crForgeTab='synth';renderForge()");
  button(rt,'최상위 일괄합성').onclick();
  assert.equal(rt.ctx.bag.length,4);
  hidden.forEach((item,i)=>assert.equal(rt.ctx.bag[i],item));
  assert.equal(rt.ctx.bag[3].id,'cr_martyr_tear');
  assert.equal(rt.ctx.bag[3].star,1);
  assert.equal(rt.ctx.bag[3].enh,0);
});

test('bulk enhance+fuse remains usable with no malice when synthesis alone is possible',()=>{
  const hidden=[cr('cr_blood_oath'),cr('cr_blood_oath'),cr('cr_blood_oath')];
  const rt=runtime([...hidden,cr('cr_martyr_tear'),cr('cr_martyr_tear'),cr('cr_martyr_tear')]);
  rt.ctx.G.mats=0;
  rt.run("_crForgeFilter='def';renderForge()");
  button(rt,'일괄강화+합성').onclick();
  assert.equal(rt.ctx.bag.length,4);
  hidden.forEach((item,i)=>assert.equal(rt.ctx.bag[i],item));
  assert.equal(rt.ctx.bag[3].star,1);
  assert.equal(rt.ctx.G.mats,0);
});

test('socket picker resets stale filters; attach/detach preserves the same crystal object',()=>{
  const crystal=cr('cr_martyr_tear',3,5),rt=runtime([crystal]);
  rt.run("renderCrystalBag=()=>{};_crBagFilter='s4';openCrystalPicker(()=>{},'armor')");
  assert.equal(rt.run('_crBagFilter'),'all');
  rt.ctx.item={slot:'armor',crystals:[null]};
  assert.equal(rt.run('attachCrystal(item,0,bag[0],0)'),true);
  assert.equal(rt.ctx.item.crystals[0],crystal);
  assert.equal(rt.ctx.bag.length,0);
  assert.equal(rt.run('detachCrystal(item,0)'),true);
  assert.equal(rt.ctx.bag[0],crystal);
});

test('all named gems have English names and two or three scaled options',()=>{
  const rt=runtime([]);
  const result=rt.run('CRYSTAL_IDS.map(id=>({en:CRYSTAL_DEFS[id].en,options:crystalEffects({id,star:4,enh:20})}))');
  assert.equal(result.length,18);
  for(const gem of result){assert.ok(gem.en);assert.ok(gem.options.length>=2&&gem.options.length<=3);}
  const oath=rt.run("crystalEffects({id:'cr_blood_oath',star:4,enh:20})");
  assert.deepEqual(Array.from(oath,x=>x.stat),['atk','crit','hp']);
  assert.equal(oath[0].value,30);
  assert.ok(Math.abs(oath[1].value-1.8)<1e-9);
  assert.equal(oath[2].value,60);
  assert.match(rt.run("_crValStr({id:'cr_blood_oath',star:0,enh:0})"),/공격력.*치명확률.*최대 HP/);
});
