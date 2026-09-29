import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Node {
  constructor(){this.children=[];this.attrs={};this.style={setProperty(){}};}
  append(...nodes){for(const node of nodes){this.children.push(node);node.parentNode=this;}}
  setAttribute(key,value){this.attrs[key]=value;}
  addEventListener(){}
  focus(){this.focused=true;}
}
function setup(earned={}){
  const hud=new Node(),body=new Node();let writes=0;
  const context=vm.createContext({window:{},location:{search:'?slot=badge-ui-test'},URLSearchParams,Date,
    setTimeout:()=>1,clearTimeout(){},
    document:{readyState:'complete',body,getElementById:id=>id==='mmLvl'?hud:null,createElement:()=>new Node(),createElementNS:()=>new Node()},
    localStorage:{getItem:()=>JSON.stringify(earned),setItem:()=>writes++}});
  vm.runInContext(fs.readFileSync(new URL('../tutorial-badges.js',import.meta.url),'utf8'),context);
  return {badge:context.window._tutorialBadges,hud,body,writes:()=>writes};
}
test('no earned badges leaves no HUD button or collection, including language refresh',()=>{
  const {badge,writes}=setup();
  assert.equal(badge.button.hidden,true);
  badge.refreshLanguage();badge.toggle(true);
  assert.equal(badge.button.hidden,true);
  assert.equal(badge.panel.hidden,true);
  assert.equal(writes(),0);
});
test('first completed tutorial reveals the HUD entry without changing award behavior',()=>{
  const {badge,writes}=setup();
  assert.equal(badge.complete('combat',Array(12).fill(true)),true);
  assert.equal(badge.button.hidden,false);
  assert.equal(badge.button.textContent,'배지 1/3');
  badge.toggle(true);assert.equal(badge.panel.hidden,false);
  assert.equal(badge.complete('combat',Array(12).fill(true)),false);
  assert.equal(writes(),1);
});
test('restored badges reveal the entry without awarding or writing again',()=>{
  const {badge,writes}=setup({combat:'2026-09-29T00:00:00Z'});
  assert.equal(badge.button.hidden,false);
  assert.equal(badge.button.textContent,'배지 1/3');
  assert.equal(writes(),0);
});
test('badge entry and collection follow the status HUD while the toast stays global',()=>{
  const {badge,hud,body}=setup();
  assert.equal(badge.button.parentNode,hud);
  assert.equal(badge.panel.parentNode,hud);
  assert.equal(badge.toast.parentNode,body);
});
