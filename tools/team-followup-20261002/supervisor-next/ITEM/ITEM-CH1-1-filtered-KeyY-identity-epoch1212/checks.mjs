import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {spawnSync} from 'node:child_process';

import {pathToFileURL} from 'node:url';
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemKeyYIdentityPatch(source){
 source=once(source,"const div=document.createElement('div');div.className='inv-item';","const div=document.createElement('div');div.className='inv-item';\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,"if(_xi[_jfIdx])_xi[_jfIdx].dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))","const _card=[..._xi].find(card=>card.dataset.inventoryBagIndex===String(_jfIdx));if(_card)_card.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))");
}

// Replay only when explicitly run. Importing the patch performs no source reads or tests.
export function runChecks(){
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
assert.equal(fs.realpathSync(process.cwd()),root);
const startedUTC=new Date().toISOString(),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const anchors=[],rows=[],groups=[],patches=[];
function ref(file,label,source,start,end){
 const text=source.slice(start,end);assert(start>=0&&end>start,label);
 anchors.push({file,label,line:source.slice(0,start).split('\n').length,sha256:sha(text),bytes:Buffer.byteLength(text)});
 return text;
}
function fun(file,s,n,optional=false){const i=s.indexOf('function '+n+'(');if(i<0&&optional)return '';assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);}
function con(file,s,n){const m='const '+n+'=',i=s.indexOf(m);assert(i>=0,n);return ref(file,n,s,i,parseExpressionAt(s,i+m.length,{ecmaVersion:'latest'}).end)+';';}
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.className='';this.classes=new Set();this.classList={add:s=>this.classes.add(s),remove:s=>this.classes.delete(s),contains:s=>this.classes.has(s),toggle:(s,v)=>v?this.classes.add(s):this.classes.delete(s)};}
 appendChild(n){n.parentElement=this;this.children.push(n);return n;}
 replaceChildren(){this.children=[];}
 querySelectorAll(q){assert.equal(q,'.inv-item');return this.children.filter(c=>c.className==='inv-item');}
 dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseEvent {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const sources=['game.html','game-easy-test.html'].map(file=>({file,text:fs.readFileSync(file,'utf8')}));
for(const {file,text:source} of sources){
 const patched=applyItemKeyYIdentityPatch(source);
 patches.push({file,beforeSHA:sha(source),afterSHA:sha(patched),replacements:2});
 function build(s,record){
  const f=n=>record?fun(file,s,n):(()=>{const i=s.indexOf('function '+n+'(');if(i<0)return '';return s.slice(i,parseExpressionAt(s,i,{ecmaVersion:'latest'}).end);})();
  const funcs=['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','xferCost','_malCost','_itemEconomyRarity','enhColor','_invCategoryMatches'].map(f).join('\n');
  const ear=['_earringSlot','_equipSlot'].map(n=>s.includes('function '+n+'(')?f(n):'').join('\n');
  const cs=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'].map(n=>con(file,s,n)).join('\n');
  const bi=s.indexOf('  // 필터 적용\n',s.indexOf('function renderInv(')),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=record?ref(file,'actual renderInv filter/card loop',s,bi,be):s.slice(bi,be);
  const ki=s.indexOf("  if($('invPanel').classList.contains('on')){",s.indexOf('// ── 인벤토리 열린 상태:')),ke=s.indexOf('  // ═══ Digit1~4',ki);
  const key=record?ref(file,'actual global inventory key block',s,ki,ke):s.slice(ki,ke);
  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:')),pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pick=record?ref(file,'actual R pickup selection block',s,pi,pe):s.slice(pi,pe);
  return cs+'\n'+funcs+'\n'+ear+'\nlet _invHover=-1;function renderInv(){const grid=$(\'invGrid\');grid.replaceChildren();const _GC=48;\n'+bag+'\n}\nfunction itemKeyHandler(e){\n'+key+'\n}\nfunction rPickup(){const chestOpened=false;\n'+pick+'\n}\n';
 }
 const originalProgram=build(source,true),candidateProgram=build(patched,false);
 function run(mode,usePatch){
  const grid=new Node(),panel=new Node();panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const crystal={id:file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const old={id:'OLD',slot:'armor',name:'old',rarity:5,enh:3,_enhRefund:7,socketCount:1,crystals:[crystal],tier:0,el:0};
  const X={id:'X',slot:'boots',name:'excluded',rarity:0,enh:0,socketCount:0,crystals:[],tier:0,el:0};
  const A={id:'A',slot:'armor',name:'chosen',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const B={id:'B',slot:'armor',name:'other',rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0};
  const events=[],trace={pickup:0,save:0,recalc:0,equipSfx:0,apply:0,lessonPickup:0,lessonEquip:0,rng:0,details:[]};
  const observer=n=>()=>{trace[n]++;events.push(n);};
  const detail=(idx,source,preview)=>{trace.details.push({idx,source,preview:!!preview});};
  const c=vm.createContext({console,MouseEvent,document:{createElement:t=>new Node(t)},$ :id=>id==='invPanel'?panel:id==='invGrid'?grid:null,
   INV:{bag:[],equipped:{armor:old,boots:{id:'OLD_BOOTS',slot:'boots',rarity:0,enh:0,socketCount:0,crystals:[]}},selected:null},G:{mats:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},BAG_MAX:300,
   CRYSTAL_BAG:[],_earringEquipTarget:null,invFilter:{slot:mode==='unfiltered'?null:'armor',rarity:null,el:null},
   _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},_invRenderDetail:detail,_invClearHover(){},_T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,RARITY_C:['#fff'],ELC:['#aaa'],
   notify:s=>events.push('notify:'+s),addTxt:()=>events.push('addTxt'),_crDefN:d=>d.ko,
   recalcSt:observer('recalc'),playEquipSfx:observer('equipSfx'),playItemPickupSfx:observer('pickup'),dbSaveForce:observer('save'),applyStats:observer('apply'),
   window:{_systemLesson:{pickedUp:observer('lessonPickup'),equipped:observer('lessonEquip')}},worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:()=>events.push('parts')});
  vm.runInContext('Date.now=()=>12345;Math.random=()=>{throw Error("unexpected RNG")}',c);
  vm.runInContext(usePatch?candidateProgram:originalProgram,c);
  for(const item of [X,A,B]){const wi={x:0,y:0,type:'item',item,picked:false};c.worldItems=[wi];vm.runInContext('rPickup()',c);assert(wi.picked);assert(c.INV.bag.includes(item));}
  assert.equal(c.INV.bag[1],A);assert(!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)));
  vm.runInContext('renderInv()',c);
  let cards=grid.querySelectorAll('.inv-item');
  const chosen=cards.find(n=>mode==='unfiltered'?n===cards[1]:n===cards[0]);
  assert(chosen);
  const hover=chosen.onmouseenter||chosen.onmouseover;hover();
  const before={mats:c.G.mats,oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldCrystalIdentity:old.crystals[0]===crystal,bag:c.INV.bag.map(it=>it.id)};
  if(mode==='selected')vm.runInContext('_invHover=-1;INV.selected=1',c);
  if(mode==='hidden')vm.runInContext('_invHover=-1;INV.selected=0',c);
  if(mode==='last')cards[cards.length-1].onmouseenter?.(),cards[cards.length-1].onmouseover?.();
  vm.runInContext('itemKeyHandler({code:"KeyY",preventDefault(){}})',c);
  const equipped=c.INV.equipped.armor;
  const after={mats:c.G.mats,equipped:equipped.id,bag:c.INV.bag.map(it=>it.id),oldEnh:old.enh,AEnh:A.enh,BEnh:B.enh,oldRefund:old._enhRefund,
   oldCrystal:old.crystals[0]?.id||null,ACrystal:A.crystals[0]?.id||null,BCrystal:B.crystals[0]?.id||null,crystalBag:c.CRYSTAL_BAG.length,
   crystalTotal:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
   crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it))};
  const row={file,mode,patched:usePatch,initialBag:before.bag,visibleBagIndices:usePatch?cards.map(n=>n.dataset.inventoryBagIndex):null,before,after,trace,events};
  rows.push(row);return row;
 }
 const red=run('filtered',false),green=run('filtered',true);
 assert.equal(red.after.equipped,'B');assert.equal(green.after.equipped,'A');
 assert.equal(green.after.mats,8500);assert.equal(green.after.AEnh,3);assert.equal(green.after.BEnh,0);assert.equal(green.after.oldEnh,0);
 assert.equal(green.after.crystalTotal,1);assert(green.after.crystalIdentity&&green.after.disjoint);assert.equal(green.after.ACrystal,crystalId(file));
 groups.push(file+': R pickup→actual filter/card hover→actual KeyY dispatch wrong B; candidate chooses A and conserves resources');
 const selected=run('selected',true);assert.equal(selected.after.equipped,'A');groups.push(file+': selected bag identity under filter');
 const normal=run('unfiltered',false),normalCandidate=run('unfiltered',true);
 assert.deepEqual(normal.after,normalCandidate.after);assert.deepEqual(normal.events,normalCandidate.events);assert.deepEqual(normal.trace,normalCandidate.trace);
 groups.push(file+': unfiltered control state and trace equivalent');
 const hidden=run('hidden',true);assert.equal(hidden.after.equipped,'OLD');assert.equal(hidden.after.mats,10000);assert.equal(hidden.trace.lessonEquip,0);
 groups.push(file+': hidden selected card no fallback to another item');
 const last=run('last',true);assert.equal(last.after.equipped,'B');assert.equal(last.after.crystalTotal,1);
 groups.push(file+': last visible card maps to actual bag index2');
}
function crystalId(f){return f==='game.html'?'cr_martyr_tear':'cr_hp';}
const docs=spawnSync('rg',['-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
assert.equal(docs.status,0);
const evidence={task:'CH1-1 loot→renderInv→KeyY filtered card identity',startedUTC,endedUTC:new Date().toISOString(),groups,rows,anchors,patches,
 sourceEnd:sources.map(s=>({file:s.file,sha256:sha(fs.readFileSync(s.file))})),docsSearch:{command:['rg','-n','pickupItem|_jfIdx|KeyY|inventoryBagIndex|_invBagRightClick|장착|강화 이전|결정 자동 전승','docs/'],exit:docs.status,lines:docs.stdout.trimEnd().split('\n').length,stdoutSHA256:sha(docs.stdout)},
 actual:['whole pickupItem/equipItem/_invBagRightClick/grid/cost helpers','actual R item-selection block','actual renderInv filter/card loop','actual global inventory KeyY block','live rendered card events, no retained detached callback'],
 stubs:['DOM Node/MouseEvent dispatch, no browser/native','renderInv wrapper runs actual bag section only; full layout/focus/eq/detail not executed','detail/UI/stat/SFX/save/lesson observers','synthetic legal ordinary loot items, actual rollDrop/combat not executed'],
 priorTestsRepeated:0,productionApplied:false,runtimeAccepted:false,newFiles:0,errors:[],exit:0};
console.log(JSON.stringify(evidence));

}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)runChecks();

