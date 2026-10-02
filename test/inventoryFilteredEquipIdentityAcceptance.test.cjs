'use strict';

// Actual source-only inventory acceptance. DOM transport, layout/detail/focus,
// stats, lesson, save and audio are doubles. No native keys, GP, combat or disk save.
// The bag renderer and R selection block have explicit wrappers; keydown is the
// whole original arrow, and pickup/equip/grid/cost/right-click functions are whole.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {parseExpressionAt} = require('acorn');
const ROOT = path.resolve(__dirname, '..');
const sha = b => createHash('sha256').update(b).digest('hex');
const baseline = process.argv.includes('--baseline');
const CARD_OLD = "const div=document.createElement('div');div.className='inv-item';";
const CARD_NEW = CARD_OLD + '\n    div.dataset.inventoryBagIndex=String(i);';
const KEY_OLD = "if(_xi[_jfIdx])_xi[_jfIdx].dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))";
const KEY_NEW = "const _card=[..._xi].find(card=>card.dataset.inventoryBagIndex===String(_jfIdx));if(_card)_card.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))";
const FUNCS = ['pickupItem','equipItem','_invBagRightClick','_invRows','_itemSz',
  '_invCategoryKey','_invGrid','_invFindSpace','xferCost','_malCost',
  '_itemEconomyRarity','enhColor','_invCategoryMatches'];
const CONSTS = ['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','INV_COLS','_MALICE_COST_MUL',
  'CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CR_DEF_SLOTS','CRYSTAL_DEFS','CRYSTAL_BAG_MAX'];
const sources = ['game.html','game-easy-test.html'].map(file => {
  const bytes=fs.readFileSync(path.join(ROOT,file));
  return {file,bytes:bytes.length,sha256:sha(bytes),text:bytes.toString('utf8')};
});
function uniqueReplace(s, old, next) {
  assert.equal(s.split(old).length,2,'unique source anchor');
  return s.replace(old,next);
}
function inverse(s) {
  if(baseline) {assert(!s.includes(CARD_NEW));assert(s.includes(KEY_OLD));return s;}
  return uniqueReplace(uniqueReplace(s,CARD_NEW,CARD_OLD),KEY_NEW,KEY_OLD);
}
function extract(source) {
  const s=source.text, blocks=[];
  function block(name,start,end) {
    assert(start>=0&&end>start,name);
    const code=s.slice(start,end);
    blocks.push({name,line:s.slice(0,start).split('\n').length,bytes:Buffer.byteLength(code),sha256:sha(code)});
    return code;
  }
  function fn(name) {
    const m=new RegExp('^function '+name+'\\(', 'm').exec(s);assert(m,name);
    return block(name,m.index,parseExpressionAt(s,m.index,{ecmaVersion:'latest'}).end);
  }
  function constant(name) {
    const m=new RegExp('^const '+name+'=', 'm').exec(s);assert(m,name);
    const end=parseExpressionAt(s,m.index+m[0].length,{ecmaVersion:'latest'}).end;
    return block(name,m.index,end)+';';
  }
  const renderer=s.indexOf('function renderInv(');
  const bi=s.indexOf('  // 필터 적용\n',renderer),be=s.indexOf('    // ── 우측 패널:',bi);
  const bag=block('renderInv actual filter/card section (partial renderer)',bi,be);
  const mark="addEventListener('keydown',",ks=s.indexOf(mark+'e=>{');
  assert(ks>=0,'actual global keydown registration');
  const arrowStart=ks+mark.length;
  const keyAst=parseExpressionAt(s,arrowStart,{ecmaVersion:'latest'});
  assert.equal(keyAst.type,'ArrowFunctionExpression','global keydown must be a whole arrow');
  const key=block('whole global keydown arrow',arrowStart,keyAst.end);
  const pi=s.indexOf('    if(!chestOpened){',s.indexOf('// 장비 아이템 줍기 — R키:'));
  const pe=s.indexOf('    // ── R키: 악의+물약',pi);
  const pickup=block('actual R equipment-selection block (partial update)',pi,pe);
  const program=CONSTS.map(constant).join('\n')+'\n'+FUNCS.map(fn).join('\n')+'\n'+
    ['_earringSlot','_equipSlot'].filter(n=>s.includes('function '+n+'(')).map(fn).join('\n')+
    '\nlet _invHover=-1;function renderInv(){const grid=$("invGrid");grid.replaceChildren();const _GC=48;\n'+bag+
    '\n}\nconst actualKeydown='+key+';\nfunction actualRSelection(){const chestOpened=false;\n'+pickup+'\n}\n';
  new vm.Script(program); // Reject extraction/glue syntax before any scenario.
  return {program,blocks};
}
class DomDouble {
  constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={};this.className='';this.classes=new Set();
    this.classList={contains:s=>this.classes.has(s),add:s=>this.classes.add(s),remove:s=>this.classes.delete(s)};}
  appendChild(n){n.parentElement=this;this.children.push(n);return n;}
  replaceChildren(){for(const n of this.children)n.parentElement=null;this.children=[];}
  querySelectorAll(selector){assert.equal(selector,'.inv-item');return this.children.filter(n=>n.className==='inv-item');}
  dispatchEvent(e){assert.equal(e.type,'contextmenu');this.oncontextmenu?.(e);}
}
class MouseDouble {constructor(type,opts){this.type=type;Object.assign(this,opts);}preventDefault(){}}
const data = value => JSON.parse(JSON.stringify(value));
function run(source, program, scenario) {
  const grid=new DomDouble(),panel=new DomDouble();panel.dataset.inventoryPage='equipment';panel.classes.add('on');
  const events=[],details=[];let rng=0;
  const crystal={id:source.file==='game.html'?'cr_martyr_tear':'cr_hp',enh:0,star:0};
  const item=(id,slot)=>({id,slot,name:id,rarity:0,enh:0,socketCount:1,crystals:[null],tier:0,el:0});
  const X=item('X','boots'),A=item('A','armor'),B=item('B','armor');
  const old={...item('OLD','armor'),rarity:5,enh:3,_enhRefund:7,crystals:[crystal]};
  if(scenario==='level-reject')A.reqLv=11;
  const observer=name=>(...args)=>events.push({name,args:args.map(v=>v&&typeof v==='object'&&v.id?v.id:v)});
  const c=vm.createContext({MouseEvent:MouseDouble,document:{createElement:t=>new DomDouble(t)},
    $:id=>id==='invGrid'?grid:id==='invPanel'?panel:null,
    listeningBind:null,K:{},KH:{},BINDS:{shield:'KeyE'},BINDS2:{},
    INV:{bag:[],equipped:{armor:old,boots:scenario==='empty-boots'?null:item('OLD_BOOTS','boots')},selected:null},
    G:{on:true,paused:true,mats:scenario==='cost-reject'?1499:10000,cam:{x:0,y:0}},P:{lv:10,x:0,y:0},
    BAG_MAX:300,CRYSTAL_BAG:[],_earringEquipTarget:null,
    invFilter:{slot:scenario.startsWith('unfiltered')||scenario==='empty-boots'||scenario==='hidden-selection'?null:'armor',rarity:null,el:null},
    _invSalSel:new Set(),_invDragMoved:false,_inventoryFocus:{bind(){}},
    _invRenderDetail:(idx,from,preview)=>details.push({idx,from,preview:!!preview}),_invClearHover(){},
    _T:s=>s,_L:s=>s,_rarName:r=>String(r),_glyph:()=>'',_itemSkin:()=>'',itemPower:()=>0,
    RARITY_C:['#fff'],ELC:['#aaa'],notify:observer('notify'),addTxt:observer('addTxt'),_crDefN:d=>d.ko,
    recalcSt:observer('recalcSt'),applyStats:observer('applyStats'),dbSaveForce:observer('dbSaveForce'),
    playEquipSfx:observer('playEquipSfx'),playItemPickupSfx:observer('playItemPickupSfx'),
    window:{_systemLesson:{pickedUp:observer('lesson.pickedUp'),equipped:observer('lesson.equipped')}},
    worldItems:[],deathDrop:null,VW:800,VH:600,dst:(x,y,u,v)=>Math.hypot(x-u,y-v),addParts:observer('addParts')});
  vm.runInContext('Date.now=()=>12345;',c);
  c.Math=Object.create(Math);c.Math.random=()=>{rng++;throw Error('unexpected RNG in inventory fixture');};
  vm.runInContext(program,c);
  function take(it){const wi={x:0,y:0,type:'item',item:it,picked:false};c.worldItems=[wi];vm.runInContext('actualRSelection()',c);assert(wi.picked);}
  if(scenario==='empty-boots')take(X);else for(const it of [X,A,B])take(it);
  const picked=data({bag:c.INV.bag.map(it=>it.id),boots:c.INV.equipped.boots?.id,pickup:c.worldItems[0].picked});
  if(scenario!=='empty-boots') {
    assert.deepEqual(picked.bag,['X','A','B']);
    vm.runInContext('renderInv()',c);
    let cards=grid.querySelectorAll('.inv-item');
    if(scenario==='hidden-selection'){
      cards[0].onclick({ctrlKey:false,metaKey:false}); // real X click before filtering
      c.invFilter.slot='armor';vm.runInContext('renderInv()',c);
    }else if(scenario==='filtered-selection'){
      cards[0].onclick({ctrlKey:false,metaKey:false}); // actual A selection and rerender
    }else{
      const ordinal=scenario==='unfiltered-B'?2:scenario.startsWith('unfiltered')?1:scenario==='filtered-B'?1:0;
      const card=cards[ordinal];assert(card,'actual rendered card');
      (card.onmouseenter||card.onmouseover)();
    }
    cards=grid.querySelectorAll('.inv-item');
    const cardIndices=cards.map(n=>n.dataset.inventoryBagIndex??null);
    c.keyEvent={code:'KeyY',ctrlKey:scenario==='ctrl-prefix',repeat:false,preventDefault:observer('keydown.preventDefault')};
    vm.runInContext('actualKeydown(keyEvent)',c);
    c.cardIndices=cardIndices;
  }
  const result={picked,hover:vm.runInContext('_invHover',c),selected:c.INV.selected,
    equipped:c.INV.equipped.armor.id,bag:c.INV.bag.map(it=>it.id),mats:c.G.mats,
    old:{enh:old.enh,refund:old._enhRefund,crystal:old.crystals[0]?.id??null,gx:old._gx,gy:old._gy},
    A:{enh:A.enh,crystal:A.crystals[0]?.id??null,gx:A._gx,gy:A._gy},
    B:{enh:B.enh,crystal:B.crystals[0]?.id??null,gx:B._gx,gy:B._gy},
    crystalCount:[old,A,B].reduce((n,it)=>n+it.crystals.filter(Boolean).length,0)+c.CRYSTAL_BAG.length,
    crystalIdentity:[old,A,B].some(it=>it.crystals.includes(crystal))||c.CRYSTAL_BAG.includes(crystal),
    disjoint:!Object.values(c.INV.equipped).some(it=>c.INV.bag.includes(it)),rng,
    events:data(events),details:data(details)};
  return {result:data(result),cardIndices:c.cardIndices};
}
const rows=[],controls=[],failures=[];let pass=0,fail=0;
function group(source,id,action){try{action();pass++;}catch(e){fail++;failures.push({file:source.file,id,error:e.message});}}
const SCENARIOS=['filtered-A','filtered-B','filtered-selection','hidden-selection',
  'unfiltered-A','unfiltered-B','cost-reject','level-reject','ctrl-prefix'];
for(const source of sources){
  const current=extract(source),old=extract({...source,text:inverse(source.text)});
  source.blocks=current.blocks;delete source.text;
  for(const scenario of SCENARIOS)group(source,scenario,()=>{
    const r=run(source,current.program,scenario);rows.push({file:source.file,scenario,...r});
    const expected=scenario==='filtered-B'||scenario==='unfiltered-B'?'B':
      ['hidden-selection','cost-reject','level-reject','ctrl-prefix'].includes(scenario)?'OLD':'A';
    const s=r.result;
    assert.equal(s.equipped,expected,'KeyY must use actual bag identity, not visible ordinal');
    assert(s.disjoint&&s.crystalIdentity);assert.equal(s.crystalCount,1);assert.equal(s.rng,0);
    if(expected!=='OLD'){
      assert.equal(s.mats,8500);assert.equal(s.old.enh,0);assert.equal(s.old.refund,6);
      assert.equal(s[expected].enh,3);assert.equal(s[expected].crystal,source.file==='game.html'?'cr_martyr_tear':'cr_hp');
      assert(s.bag.includes('OLD'));assert(!s.bag.includes(expected));
    }else{
      assert.equal(s.mats,scenario==='cost-reject'?1499:10000);assert.equal(s.old.enh,3);assert.equal(s.old.refund,7);
      assert.equal(s.A.enh,0);assert.equal(s.B.enh,0);
      assert(!s.events.some(e=>['playEquipSfx','lesson.equipped'].includes(e.name)));
      assert.equal(s.events.filter(e=>e.name==='dbSaveForce').length,3,'pickup saves only');
    }
  });
  for(const scenario of ['unfiltered-A','unfiltered-B'])group(source,'old-control-'+scenario,()=>{
    const actual=run(source,current.program,scenario),prior=run(source,old.program,scenario);
    assert.deepEqual(actual.result,prior.result,'normal state/events/details/RNG must equal exact old source');
    controls.push({file:source.file,scenario,equal:true,current:actual.result,old:prior.result});
  });
  group(source,'empty-boots-pickup-difference-preserved',()=>{
    const actual=run(source,current.program,'empty-boots'),prior=run(source,old.program,'empty-boots');
    assert.deepEqual(actual.result,prior.result);
    assert.deepEqual(actual.result.picked.bag,source.file==='game.html'?['X']:[]);
    assert.equal(actual.result.picked.boots,source.file==='game.html'?undefined:'X');
    controls.push({file:source.file,scenario:'empty-boots',equal:true,current:actual.result.picked});
  });
}
for(const source of sources)assert.equal(sha(fs.readFileSync(path.join(ROOT,source.file))),source.sha256,'source changed during read-only acceptance');
console.log(JSON.stringify({mode:baseline?'actual-original-baseline':'actual-current-with-exact-inverse-controls',
  counts:{groups:pass+fail,pass,fail,normalControls:controls.length},sources,rows,controls,failures,
  limits:['DOM/MouseEvent transport doubles; innerHTML not parsed or laid out',
    'actual bag filter/card section only; full renderInv/focus/detail excluded',
    'whole global keydown and whole equip/pickup/grid/cost helpers executed',
    'R selection block only; update/keyR/combat/drop generation not executed',
    'stats, audio, save, lesson and display observer doubles; physical/native/GP/real saves UNKNOWN'],
  productionWrites:0,existingTestsRepeated:0,fixtureFilesWritten:0}));
process.exitCode=fail?1:0;
