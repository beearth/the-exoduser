export function createHost(document, mount, data, version, language='ko') {
  const panel=document.createElement('section');panel.id='invPanel';panel.className='panel on';panel.dataset.inventoryPage='equipment';
  const wrap=document.createElement('div');wrap.className='inv-wrap';panel.appendChild(wrap);
  const ids=['cpVal','cpBreak','invEquippedCount','invSocketCount','invEquipPower','invResBar','invEqGrid','invFilters','invExpand','invMax','invGrid','invCount','invRight','invActionBtns','invCompareArea','invCompareFloat','invOssInfo'];
  const nodes={invPanel:panel};
  for(const id of ids){const node=document.createElement('div');node.id=id;nodes[id]=node;wrap.appendChild(node);}
  const close=document.createElement('button');close.id='invClose';close.type='button';close.textContent=language==='ko'?'닫기':'Close';panel.appendChild(close);nodes.invClose=close;
  const opener=document.createElement('button');opener.textContent=language==='ko'?'인벤토리 열기':'Open inventory';mount.replaceChildren(opener,panel);
  const item={name:language==='ko'?'시험 검':'Test sword',slot:'weapon',rarity:0,el:0,_gx:0,_gy:0,socketCount:0};
  const env={document,$:id=>nodes[id]||document.getElementById(id),console,INV:{bag:[item],equipped:{weapon:{...item,name:language==='ko'?'기존 검':'Equipped sword'}},selected:null},G:{mats:0,paused:true},P:{lv:1},
    SLOT_NAMES:['weapon'],EQ_POS:[[0,0]],RARITY_C:['#978e7d','#81a36b','#6f9dba','#ac86b8','#c5a15f'],EL:{P:0,F:1,I:2,D:3,L:4},ELC:['#aaa','#f88','#8af','#98a','#aaf'],
    BAG_MAX:300,INV_COLS:2,invFilter:{slot:null,rarity:null,el:null},CRYSTAL_BAG:[],CRYSTAL_BAG_MAX:10,CRYSTAL_DUST:0,_invHover:-1,_invLastPlacement:null,_invSalSel:new Set(),_invDragMoved:false,_invDrag:null,_invGridResizeObserver:null,_invGridParentWidth:0,_GC_SZ:0,
    getComputedStyle:node=>document.defaultView.getComputedStyle(node),ResizeObserver:class {observe(){}},_L:(ko,en)=>language==='ko'?ko:en,_T:value=>value,
    calcCP:()=>({total:1,atk:1,def:0,extra:0}),_glyph:()=>'',_slotName:()=>language==='ko'?'무기':'Weapon',_slotGlyph:()=>'',_rarName:index=>String(index),_itemSkin:()=>'',itemPower:()=>1,
    _itemSz:()=>[1,1],_invRows:()=>2,_invFindSpace:()=>({x:0,y:0}),_equipSlot:it=>it.slot,_earringSlot:()=>false,_getStore:()=>[],_invCardFields:()=>language==='ko'?'시험 효과':'Test effect',_invBuildCompare:()=>({diffs:'CP: +1',eqCard:language==='ko'?'장착 검':'Equipped sword'}),salvageVal:()=>1,
    renderInvStorage(){},renderOssPanel(){},renderInvCrystals(){},_injectPanelNav(){},applyStats(){throw new Error('실제 스탯 쓰기 금지');},dbSaveNow(){throw new Error('저장 금지');}};
  const program=`with(env){const _inventoryFocus=(${data.factory[version]})({document,get:$,label:_L});\n${data.functions[version]}\nreturn {renderInv,_invClearHover,_invRenderDetail,closePanel,focus:_inventoryFocus};}`;
  const api=new Function('env',program)(env);
  close.onclick=()=>api.closePanel('invPanel');
  opener.onclick=()=>{api.focus.begin();panel.classList.add('on');api.renderInv();};
  return {api,env,nodes,item,opener,panel,render:()=>api.renderInv()};
}

export function activate(node, code='Enter', extra={}) {
  const event={target:node,code,prevented:false,preventDefault(){this.prevented=true;},...extra};
  node.onkeydown(event);
  if(code==='Space')node.onkeyup(event);
  return event;
}
