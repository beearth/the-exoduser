import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
function once(s,a,b){assert.equal(s.split(a).length,2,'unique patch anchor');return s.replace(a,b);}
export function applyItemPadAOutlinePatch(source){
 const card="const div=document.createElement('div');div.className='inv-item';";
 if(!source.includes('div.dataset.inventoryBagIndex=String(i);'))source=once(source,card,card+"\n    div.dataset.inventoryBagIndex=String(i);");
 const i=source.indexOf('function _gpInvNav('),end=parseExpressionAt(source,i,{ecmaVersion:'latest'}).end,fn=source.slice(i,end);
 const anchor="const items=grid.querySelectorAll('.inv-item');";
 assert.equal(fn.split('items[_gpInvIdx]').length-1,5);
 const candidate=once(fn,anchor,anchor+"\n      const _activeBagCard=[...items].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));").replaceAll('items[_gpInvIdx]','_activeBagCard');
 return source.slice(0,i)+candidate+source.slice(end);
}

export function applyItemPadASelectionPatch(source){
  const base=applyItemPadAOutlinePatch(source);
  const old="INV.selected=_gpInvIdx;\n        if(typeof renderInv==='function')renderInv();\n        if(typeof _invRenderDetail==='function')_invRenderDetail(_gpInvIdx,'bag');";
  const next="INV.selected=_gpInvIdx;\n        if(typeof renderInv==='function')renderInv();\n        const _selectedCard=[...grid.querySelectorAll('.inv-item')].find(card=>card.dataset.inventoryBagIndex===String(_gpInvIdx));\n        if(_selectedCard){_selectedCard.style.outline='2px solid #C9A961';_selectedCard.style.outlineOffset='-1px';_selectedCard.scrollIntoView({block:'nearest'});}\n        if(typeof _invRenderDetail==='function')_invRenderDetail(_gpInvIdx,'bag');";
  return once(base,old,next);
}
// Pure source transforms only: importing/running this module never changes a file or runs old tests.

