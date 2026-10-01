import fs from 'node:fs';
import {createDocument} from '../UIUX/inventory-dom/node-dom.mjs';
import {createHost,activate} from '../UIUX/card-removal-focus/host/harness.js';
import {extractFunction} from '../UIUX/inventory-dom-candidate.mjs';
import {sourceFactory} from '../UIUX/filter-focus-candidate.mjs';
export {activate};
const owned=new URL('../UIUX/',import.meta.url);
export function setup(path,language='ko',transform=source=>source,disableBlur=false) {
  const tag=path==='game.html'?'main':'easy',source=transform.name==='connectOssuary'?fs.readFileSync(path,'utf8'):fs.readFileSync(new URL('ossuary-focus-'+tag+'.before.html',owned),'utf8');
  const record=JSON.parse(fs.readFileSync(new URL('ossuary-focus-before.json',owned))).sources[path];
  const document=createDocument(),prototype=Object.getPrototypeOf(document.createElement('div'));
  const matches=prototype.matches;
  prototype.matches=function(selector){const match=selector.match(/^\[data-([\w-]+)="([^"]*)"\]$/);if(match){const key=match[1].replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());return this.dataset[key]===match[2];}return matches.call(this,selector);};
  prototype.addEventListener=function(type,handler){this.listeners??={};(this.listeners[type]??=[]).push(handler);};
  prototype.click=function(){if(this.disabled)return;this.onclick?.({target:this,preventDefault(){}});for(const handler of this.listeners?.click||[])handler({target:this});};
  prototype.before=function(node){this.parentElement.insertBefore(node,this);};
  if(disableBlur)Object.defineProperty(prototype,'disabled',{configurable:true,get(){return !!this._disabled;},set(value){this._disabled=value;if(value&&document.activeElement===this)this.blur();}});
  const mount=document.createElement('main');document.body.appendChild(mount);
  const functionNames=[...record.functions.filter(row=>row.name!=='_grantOssuaryIfNeeded').map(row=>row.name),'equipItem'];
  const data={factory:{current:sourceFactory(source)},functions:{current:functionNames.map(name=>extractFunction(source,name)).join('\n')}};
  const ui={document,...createHost(document,mount,data,'current',language)},calls={save:0,stats:0,sound:0,notifications:[]};
  const wrap=ui.panel.querySelector('.inv-wrap'),equip=document.createElement('div');equip.className='inv-equip';wrap.appendChild(equip);equip.appendChild(ui.nodes.invEqGrid);
  for(const id of ['invOssuaryPanel','invCrystalsPanel','invStorageCol','invCenter','invStBagSection','optLang']){const node=document.createElement('div');node.id=id;ui.nodes[id]=node;wrap.appendChild(node);}ui.nodes.optLang.value=language;
  const boneCard=document.createElement('div');boneCard.id='invOssBoneCard';ui.nodes.invOssBoneCard=boneCard;ui.nodes.invOssInfo.appendChild(boneCard);
  for(const cls of ['inv-oss-bone-kicker','inv-oss-bone-title','inv-oss-bone-meta','inv-oss-bone-effect','inv-oss-bone-note']){const leaf=document.createElement('span');leaf.className=cls;boneCard.appendChild(leaf);}
  const roster=[{id:'iron_warlord',ko:'철갑 전대',en:'Iron Warlord'}],parts=['skull','torso','arms','legs'];
  Object.assign(ui.env,{ANC_ROSTER:roster,_BONE_PARTS:parts,_BONE_PART_KO:{skull:'두개골',torso:'몸통',arms:'팔',legs:'다리'},_BONE_PART_EN:{skull:'Skull',torso:'Torso',arms:'Arms',legs:'Legs'},dbSaveForce(){calls.save++;},recalcSt(){calls.stats++;},applyStats(){calls.stats++;},notify(value){calls.notifications.push(value);},playSample(){calls.sound++;},playFM(){calls.sound++;},playNoise(){calls.sound++;},_r:()=>1.2,addTxt(){},shake(){}});
  ui.env.INV.ossCollect={iron_warlord_skull:{r:2,t:1}};
  ui.env.INV.equipped.ossuary={slot:'ossuary',name:language==='ko'?'시험 유골함':'Test ossuary',anc:'iron_warlord',rarity:5,el:0,socketCount:0};
  ui.env.INV.bag=[ui.item];
  const apiProgram=`with(env){const _inventoryFocus=controller;${functionNames.map(name=>extractFunction(source,name)).join('\n')}return {renderInv,renderOssPanel,_invClearHover,_invChangeCategory,_invRenderDetail,withdrawBonePart,registerBonePart,equipItem,unequipItem,closePanel};}`;
  const api=new Function('env','controller',apiProgram)(ui.env,ui.api.focus);ui.api=Object.assign({},ui.api,api);ui.render=api.renderInv;
  const composition=fs.readFileSync('ui-panels.js','utf8'),helpers=composition.slice(composition.indexOf('  const el ='),composition.indexOf('  function describeSettingsControls')),inventory=composition.slice(composition.indexOf('  function inventory()'),composition.indexOf('  function init()'));
  ui.env._invChangeCategory=api._invChangeCategory;
  new Function('env',`with(env){${helpers}${inventory}inventory();translate();}`)(ui.env);
  ui.opener.focus();ui.api.focus.begin();ui.panel.classList.add('on');ui.render();
  return {...ui,calls,parts,source,switchTab(key){const button=document.getElementById('inventory-tab-'+key);button.focus();button.click();return button;},selectPart(part){const node=ui.nodes.invOssuaryPanel.querySelector('[data-part="'+part+'"]');node.focus();node.click();return node;},boneItem(part='skull',rarity=3,tier=2){return {slot:'bonePart',anc:'iron_warlord',part,rarity,tier,el:0,name:'Synthetic bone',_gx:1,_gy:0};}};
}
