import {applyItemPadAOutlinePatch} from '../ITEM-pad-A-outline-lifetime-rolling1300/checks.mjs';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';

function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemDragIdentityPatch(source){
 source=once(source,'_invDrag={idx:i,ox:item._gx,oy:item._gy,w,h,el:div};','_invDrag={idx:i,item,ox:item._gx,oy:item._gy,w,h,el:div};');
 source=once(source,"  _invDragMoved=true;\n  const grid=$('invGrid');if(!grid)return;","  _invDragMoved=true;\n  const current=INV.bag.indexOf(_invDrag.item);if(current<0)return;\n  const grid=$('invGrid');if(!grid)return;");
 source=once(source,'_invCanPlace(_invDrag.idx,Math.max','_invCanPlace(current,Math.max');
 return once(source,"  if(_invCanPlace(d.idx,gx,gy)){\n    INV.bag[d.idx]._gx=gx;INV.bag[d.idx]._gy=gy;\n  }","  const current=INV.bag.indexOf(d.item);\n  if(current>=0&&_invCanPlace(current,gx,gy)){\n    INV.bag[current]._gx=gx;INV.bag[current]._gy=gy;\n  }");
}
export function applyEquipSalSelectionIdentityPatch(source){
 const start=source.indexOf('function equipItem(');assert(start>=0);
 const end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 let body=source.slice(start,end);
 body=once(body,'  const old=INV.equipped[','  const _salItems=[..._invSalSel].map(idx=>INV.bag[idx]).filter(Boolean);\n  const old=INV.equipped[');
 body=once(body,'  INV.bag=INV.bag.filter(i=>i!==item);','  INV.bag=INV.bag.filter(i=>i!==item);\n  _invSalSel.clear();for(const selected of _salItems){const current=INV.bag.indexOf(selected);if(current>=0)_invSalSel.add(current);}');
 return source.slice(0,start)+body+source.slice(end);
}
export function applyFavSelectionPrunePatch(source){
 return once(source,'for(const idx of[..._invSalSel]){if(idx>=INV.bag.length)_invSalSel.delete(idx)}','for(const idx of[..._invSalSel]){if(idx>=INV.bag.length||INV.bag[idx]?.fav)_invSalSel.delete(idx)}');
}
export function applyItemPadBIdentityPatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 return once(source,'if(_bi[_gpInvIdx])_bi[_gpInvIdx].dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))','const _card=[..._bi].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));if(_card)_card.dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,cancelable:true}))');
}

function applyVisibleNav(source){
 const nav=source.indexOf('function _gpInvNav('),i=source.indexOf("    const bagLen=typeof INV!=='undefined'?INV.bag.length:0;",nav),end=source.indexOf('    _clr();',i);
 assert(i>=0&&end>i);
 let old=source.slice(i,end);
 const marker="const bagLen=typeof INV!=='undefined'?INV.bag.length:0;";
 const next=once(old,marker,marker+"\n    const _visibleBagIndices=[...($('invGrid')?.querySelectorAll('.inv-item')||[])].map(card=>Number(card.dataset.inventoryBagIndex)).filter(idx=>Number.isInteger(idx)&&idx>=0&&idx<bagLen);")
 .replace('if(!bagLen){','if(!_visibleBagIndices.length){')
 .replaceAll('_gpInvIdx=Math.max(0,_gpInvIdx-1)','_gpInvIdx=_visibleBagIndices.filter(idx=>idx<_gpInvIdx).at(-1)??_visibleBagIndices[0]')
 .replaceAll('_gpInvIdx=Math.min(bagLen-1,_gpInvIdx+1)','_gpInvIdx=_visibleBagIndices.find(idx=>idx>_gpInvIdx)??_visibleBagIndices.at(-1)');
 const move=source.slice(0,i)+next+source.slice(end);
 return once(once(move,'if(x&&!_gpUIPrev.x&&_gpInvIdx<bagLen)','if(x&&!_gpUIPrev.x&&_visibleBagIndices.includes(_gpInvIdx))'),'if(y&&!_gpUIPrev.y&&_gpInvIdx<bagLen)','if(y&&!_gpUIPrev.y&&_visibleBagIndices.includes(_gpInvIdx))');
}
export function applyFreshBagOutlineAfterActionPatch(source){
 const start=source.indexOf('function _gpInvNav('),end=parseExpressionAt(source,start,{ecmaVersion:'latest'}).end;
 const fn=source.slice(start,end),anchor="\n    }\n  } else if(_gpInvMode==='eq'){";
 const restore="\n      const _freshBagCard=[...grid.querySelectorAll('.inv-item')].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));\n      if(_freshBagCard&&_freshBagCard!==_activeBagCard){_freshBagCard.style.outline='2px solid #C9A961';_freshBagCard.style.outlineOffset='-1px';_freshBagCard.scrollIntoView({block:'nearest'});}";
 return source.slice(0,start)+once(fn,anchor,restore+anchor)+source.slice(end);
}
export function applyComposedItemInventoryPatch(source){
 for(const apply of [applyItemPadAOutlinePatch,applyItemPadBIdentityPatch,applyVisibleNav,applyItemDragIdentityPatch,applyEquipSalSelectionIdentityPatch,applyFavSelectionPrunePatch,applyFreshBagOutlineAfterActionPatch])source=apply(source);
 return source;
}
