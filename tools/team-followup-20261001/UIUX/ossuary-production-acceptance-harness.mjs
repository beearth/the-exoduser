import {createDocument} from './inventory-dom/node-dom.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
import {sourceFactory} from './filter-focus-candidate.mjs';

export function createHarness(source,language='ko',disableBlur=false) {
  const document=createDocument(),prototype=Object.getPrototypeOf(document.createElement('div')),match=prototype.matches;
  prototype.matches=function(selector){const attr=selector.match(/^\[data-([\w-]+)="([^"]*)"\]$/);return attr?this.dataset[attr[1].replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase())]===attr[2]:match.call(this,selector);};
  if(disableBlur)Object.defineProperty(prototype,'disabled',{configurable:true,get(){return !!this._disabled;},set(value){this._disabled=value;if(value&&document.activeElement===this)this.blur();}});
  const nodes={};
  for(const [id,tag]of [['invPanel','section'],['invClose','button'],['invFilters','div'],['invOssuaryPanel','div']]){const node=document.createElement(tag);node.id=id;nodes[id]=node;}
  document.body.appendChild(nodes.invPanel);for(const id of ['invClose','invFilters','invOssuaryPanel'])nodes.invPanel.appendChild(nodes[id]);
  const opener=document.createElement('button');document.body.appendChild(opener);opener.focus();
  const env={document,$:id=>nodes[id]||document.getElementById(id),G:{paused:true},INV:{bag:[],equipped:{ossuary:{name:'Fixture urn',anc:'iron_warlord'}},selected:null,ossCollect:{iron_warlord_skull:{r:2,t:1}}},
    ANC_ROSTER:[{id:'iron_warlord',ko:'철갑 전대',en:'Iron Warlord'}],_BONE_PARTS:['skull','torso','arms','legs'],_BONE_PART_KO:{skull:'두개골',torso:'몸통',arms:'팔',legs:'다리'},_BONE_PART_EN:{skull:'Skull',torso:'Torso',arms:'Arms',legs:'Legs'},
    _L:(ko,en)=>language==='ko'?ko:en,_T:value=>value,_rarName:value=>String(value),SLOT_NAMES:['weapon'],_slotName:()=>language==='ko'?'무기':'Weapon',EL:{P:0,F:1,I:2,D:3,L:4},ELC:['#aaa','#f00','#00f','#333','#eee'],RARITY_C:['#111','#222','#333','#444','#555'],invFilter:{slot:null,rarity:null,el:null}};
  const controller=new Function('return ('+sourceFactory(source)+')')()({document,get:env.$,label:env._L});controller.begin();nodes.invPanel.classList.add('on');nodes.invPanel.dataset.inventoryPage='ossuary';
  const names=['renderOssPanel','_ossHideBoneInfo','_bonePartName','_ossSetComplete','closePanel'];
  const api=new Function('env','controller',`with(env){const _inventoryFocus=controller;${names.map(name=>extractFunction(source,name)).join('\n')}return {renderOssPanel,closePanel};}`)(env,controller);
  const renderer=extractFunction(source,'renderInv'),start=renderer.indexOf("  const fBar=$('invFilters');"),end=renderer.indexOf('  // ── Bag expand button');
  if(start<0||end<start)throw new Error('실제 filter block 문맥 변경');
  const filterBlock=renderer.slice(start,end);
  const filterRender=new Function('env','controller',`with(env){function renderInv(){const token=controller.beforeRender();${filterBlock}controller.afterRender(token);}return renderInv;}`)(env,controller);
  api.renderOssPanel();
  return {document,nodes,opener,env,controller,api,filterRender,filterBlock};
}
