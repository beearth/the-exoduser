import fs from 'node:fs';
import {createDocument} from '../UIUX/inventory-dom/node-dom.mjs';
import {createHost,activate} from '../UIUX/card-removal-focus/host/harness.js';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
import {sourceFactory,connectFilter} from '../UIUX/filter-focus-candidate.mjs';
export {activate};
const owned=new URL('../UIUX/',import.meta.url);
export function setup(path,version,language='ko',css=false) {
  const tag=path==='game.html'?'main':'easy',before=fs.readFileSync(new URL('filter-focus-'+tag+'.before.html',owned),'utf8'),source=version==='candidate'?fs.readFileSync(new URL('../../../'+path,owned),'utf8'):before;
  const names=['_invPlaceDetail','_invRenderDetail','_invClearHover','_invRestoreSelectedActions','_invCategoryMatches','_invChangeCategory','_invPlacement','_invPlacementChanged','renderInv','closePanel'];if(tag==='main')names.push('_invRenderEmptyDetail');
  const document=createDocument(),prototype=Object.getPrototypeOf(document.createElement('div'));
  prototype.addEventListener=function(type,handler){this.listeners??={};(this.listeners[type]??=[]).push(handler);};
  prototype.click=function(){this.onclick?.({target:this,preventDefault(){}});for(const handler of this.listeners?.click||[])handler({target:this});};
  prototype.before=function(node){this.parentElement.insertBefore(node,this);};
  if(css){const original=document.defaultView.getComputedStyle;document.defaultView.getComputedStyle=node=>{const value=original(node);return node.id==='invRight'?{...value,visibility:'visible'}:value;};}
  const mount=document.createElement('main');document.body.appendChild(mount);
  const data={factory:{[version]:sourceFactory(source)},functions:{[version]:names.map(name=>extractFunction(source,name)).join('\n')}};
  const ui={document,...createHost(document,mount,data,version,language)};
  const wrap=ui.panel.querySelector('.inv-wrap'),equip=document.createElement('div');equip.className='inv-equip';wrap.appendChild(equip);equip.appendChild(ui.nodes.invEqGrid);
  for(const id of ['invOssuaryPanel','invCrystalsPanel','invStorageCol','invCenter','invStBagSection','optLang']){const node=document.createElement('div');node.id=id;ui.nodes[id]=node;wrap.appendChild(node);}
  ui.nodes.optLang.value=language;
  const composition=fs.readFileSync(new URL('../../../ui-panels.js',owned),'utf8');
  const helpers=composition.slice(composition.indexOf('  const el ='),composition.indexOf('  function describeSettingsControls'));
  const inventory=composition.slice(composition.indexOf('  function inventory()'),composition.indexOf('  function init()'));
  ui.env._invChangeCategory=new Function('env',`with(env){${extractFunction(source,'_invChangeCategory')}return _invChangeCategory;}`)(Object.assign(ui.env,{renderInv:ui.api.renderInv,_invClearHover:ui.api._invClearHover}));
  new Function('env',`with(env){${helpers}${inventory}inventory();translate();}`)(ui.env);
  ui.opener.onclick();
  const clone={...ui.item,name:language==='ko'?'시험 갑옷':'Test armour',slot:'armor',rarity:1,_gx:1};
  const bone={...ui.item,name:language==='ko'?'시험 유골':'Test bone',slot:'bonePart',rarity:2,_gx:0,_gy:1};
  ui.env.INV.bag=[ui.item,clone,bone];ui.render();
  return {...ui,clone,bone,source,composition,clickFilter(key,val){const buttons=ui.nodes.invFilters.querySelectorAll('button');const slots=ui.env.SLOT_NAMES.filter(slot=>slot!=='ossuary'&&slot!=='headband2');const index=key==='slot'?(val==='bonePart'?slots.length:slots.indexOf(val)):key==='rarity'?slots.length+1+val:slots.length+6+val;const button=buttons[index];if(!button)throw new Error('실제 필터 없음');button.focus();button.click();return button;},switchTab(key){const tab=document.getElementById('inventory-tab-'+key);tab.focus();tab.click();return tab;}};
}
