import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createInventoryFocus, connectCandidate} from './inventory-focus-candidate.mjs';
const reproductions=[];
after(()=>fs.writeFileSync(new URL('./inventory-focus-reproduction.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),scope:'실제 함수 추출·DOM 대역, 실화면 아님',reproductions},null,2)+'\n'));
export function extract(source, name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error('함수 없음');
  const end = source.indexOf('\nfunction ',start + 1);
  return source.slice(start,end);
}
export function fixture() {
  const document={activeElement:null};
  class Node {
    constructor() {this.children=[];this.dataset={};this.attrs={};this.style={};this.isConnected=true;this.disabled=false;this.flags=new Set();this.classList={contains:value=>this.flags.has(value),remove:(...values)=>values.forEach(value=>this.flags.delete(value)),add:(...values)=>values.forEach(value=>this.flags.add(value)),toggle:(value,on)=>on?this.flags.add(value):this.flags.delete(value)};}
    append(...nodes) {this.children.push(...nodes);}
    appendChild(node) {this.append(node);}
    querySelectorAll() {return [];}
    querySelector() {return null;}
    contains(node) {return node===this||this.children.some(child=>child.contains(node));}
    closest() {return this.hidden?this:null;}
    focus() {if(this.isConnected&&!this.disabled&&!this.hidden)document.activeElement=this;}
    blur() {if(document.activeElement===this)document.activeElement=document.body;}
    setAttribute(key,value) {this.attrs[key]=value;}
    replaceChildren(...children) {for(const child of this.children){if(child.contains(document.activeElement))document.activeElement=null;child.isConnected=false;}this.children=children;}
  }
  document.createElement=()=>new Node();
  document.body=new Node();
  const nodes=Object.fromEntries(['invPanel','invRight','invActionBtns','invClose','invCompareFloat','invOssInfo'].map(id=>[id,new Node()]));
  nodes.invPanel.classList.add('on');nodes.invPanel.children=[nodes.invRight,nodes.invActionBtns,nodes.invClose];
  const oldAction=new Node();nodes.invActionBtns.children=[oldAction];oldAction.focus();
  nodes.invRight._detailItem={name:'이전 검'};nodes.invRight.classList.add('inv-side-compare');
  const controller=createInventoryFocus({document,get:id=>nodes[id],label:(ko,en)=>document.lang==='en'?en:ko});
  return {document,Node,nodes,oldAction,controller};
}
for(const path of ['game.html','game-easy-test.html']) {
  const source=fs.readFileSync(new URL('../../../'+path,import.meta.url),'utf8');
  for(const sourceType of ['bag','eq','st']) test(`${path}: ${sourceType} 빈 상세 원식 RED → 후보 GREEN`,()=>{
    function run(text,patched) {
      const ui=fixture();
      const context={$:id=>ui.nodes[id],INV:{bag:[],equipped:{}},_getStore:()=>[],_inventoryFocus:ui.controller};
      vm.runInNewContext(extract(text,'_invRenderDetail'),context);
      context._invRenderDetail(0,sourceType);
      reproductions.push({path,sourceType,patched,selectedItemExists:false,staleActions:ui.nodes.invActionBtns.children.length,staleDetail:ui.nodes.invRight._detailItem!==null,focus:ui.document.activeElement===ui.oldAction?'소멸 아이템의 이전 액션':ui.document.activeElement===ui.nodes.invClose?'인벤토리 닫기':'기타'});
      if(patched){assert.equal(ui.nodes.invRight._detailItem,null);assert.equal(ui.nodes.invActionBtns.children.length,0);assert.equal(ui.document.activeElement,ui.nodes.invClose);assert.equal(ui.nodes.invRight.classList.contains('inv-side-compare'),false);}
      else {assert.equal(ui.document.activeElement,ui.oldAction);assert.equal(ui.nodes.invActionBtns.children.length,1);assert.equal(ui.nodes.invRight._detailItem.name,'이전 검');}
    }
    run(source,false);run(connectCandidate(source),true);
  });
  test(`${path}: 장착 선택 소멸 복원 호출 실제 추출`,()=>{
    const patched=connectCandidate(source);
    const ui=fixture();
    const context={$:id=>ui.nodes[id],INV:{bag:[],equipped:{},selected:'eq:weapon'},_getStore:()=>[],_inventoryFocus:ui.controller};
    vm.runInNewContext(extract(patched,'_invRenderDetail')+'\n'+extract(patched,'_invRestoreSelectedActions'),context);
    context._invRestoreSelectedActions();
    assert.equal(ui.document.activeElement,ui.nodes.invClose);
  });
  test(`${path}: 호출 연결·중복 거부·추출 구문`,()=>{
    const candidate=connectCandidate(source);
    for(const name of ['_invRenderDetail','_invRestoreSelectedActions','openPanel','togglePanel','closePanel','closeAllPanels'])new vm.Script(extract(candidate,name));
    assert.throws(()=>connectCandidate(candidate));
    assert.match(candidate,/#invPanel.on \[data-inventory-detail-trigger\]/);
    assert.match(candidate,/_inventoryFocus.bind\(div,\(\)=>INV.bag.includes\(item\)/);
  });
  for(const compare of [false,true]) test(`${path}: 정상 실제 상세/비교 함수 보존 ${compare}`,()=>{
    const item={name:'시험 검',slot:'weapon',rarity:0,socketCount:0},equipped={name:'장착 검',slot:'weapon',rarity:0};
    const before=JSON.stringify({item,equipped});
    function render(text) {
      const ui=fixture();ui.nodes.invPanel.dataset.inventoryPage='equipment';ui.nodes.invRight._detailItem=null;
      let compareCalls=0;
      const context={$:id=>ui.nodes[id],document:ui.document,INV:{bag:[item],equipped:compare?{weapon:equipped}:{},selected:0},_inventoryFocus:ui.controller,
        _equipSlot:it=>it.slot,_invBuildCompare(){compareCalls++;return {diffs:'효과 차이',eqCard:'장착 카드'};},_invCardFields:()=> '상세 효과',_T:value=>value,_L:(ko)=>ko,RARITY_C:['#978e7d'],salvageVal:()=>1,_earringSlot:()=>false,P:{lv:1},G:{mats:0}};
      vm.runInNewContext(extract(text,'_invRenderDetail'),context);context._invRenderDetail(0,'bag');
      return {count:ui.nodes.invRight.children.length,compareCalls,compareClass:ui.nodes.invRight.classList.contains('inv-side-compare'),actions:ui.nodes.invActionBtns.innerHTML};
    }
    assert.deepEqual(render(connectCandidate(source)),render(source));
    assert.equal(JSON.stringify({item,equipped}),before);
  });
  test(`${path}: 실제 open/close 호출·재열기·이미 열린 패널 갱신`,()=>{
    const ui=fixture(),opener=new ui.Node();
    for(const id of ['settings','forge','statPanel','skillPanel'])ui.nodes[id]=new ui.Node();
    ui.document.querySelectorAll=()=>[];
    ui.nodes.invPanel.classList.remove('on');opener.focus();
    const context={$:id=>ui.nodes[id],document:ui.document,_inventoryFocus:ui.controller,G:{paused:false,forgeOpen:false},_injectPanelNav(){},renderInv(){},renderSettings(){},renderForge(){},renderStatPanel(){},renderSkillPanel(){}};
    const candidate=connectCandidate(source);
    vm.runInNewContext(['openPanel','closePanel','closeAllPanels'].map(name=>extract(candidate,name)).join('\n'),context);
    context.openPanel('invPanel');ui.oldAction.focus();context.openPanel('invPanel');context.closePanel('invPanel');
    assert.equal(ui.document.activeElement,opener);
    context.openPanel('invPanel');ui.oldAction.focus();context.closeAllPanels();assert.equal(ui.document.activeElement,opener);
    assert.equal(context.G.paused,false);
  });
}
function key(node,code,type='down',extra={}) {
  const event={target:node,code,prevented:false,preventDefault(){this.prevented=true;},...extra};
  (type==='down'?node.onkeydown:node.onkeyup)(event);return event;
}
test('Enter/Space 각1회, 반복·수정키 차단·Tab 네이티브 유지',()=>{
  const ui=fixture(),node=new ui.Node();let calls=0;
  ui.controller.bind(node,()=>({}),()=>calls++,'검');
  assert.equal(node.attrs.role,'button');assert.equal(node.tabIndex,0);
  key(node,'Enter');assert.equal(calls,1);
  key(node,'Enter','down',{repeat:true});key(node,'Enter','down',{ctrlKey:true});assert.equal(calls,1);
  key(node,'Space');assert.equal(calls,1);key(node,'Space','up');assert.equal(calls,2);
  key(node,'Space','up');assert.equal(calls,2);
  assert.equal(key(node,'Tab').prevented,false);
  key(node,'Space');node.onblur();key(node,'Space','up');assert.equal(calls,2);
  assert.equal(ui.document.activeElement,ui.nodes.invRight);
});
test('빈 진입·삭제 anchor·오류 후 안전한 닫기 초점',()=>{
  const ui=fixture(),node=new ui.Node();let item={};
  ui.controller.bind(node,()=>item,()=>{node.isConnected=false;},'검');
  key(node,'Enter');ui.oldAction.focus();item=null;ui.controller.missing();
  assert.equal(ui.document.activeElement,ui.nodes.invClose);
  key(node,'Enter');assert.equal(ui.document.activeElement,ui.nodes.invClose);
});
test('연결된 anchor 복귀, 마우스 누락은 초점 강탈0',()=>{
  const ui=fixture(),node=new ui.Node();
  ui.controller.bind(node,()=>({}),()=>{},'검');key(node,'Enter');ui.controller.missing();
  assert.equal(ui.document.activeElement,node);
  const elsewhere=new ui.Node();elsewhere.focus();ui.controller.missing();
  assert.equal(ui.document.activeElement,elsewhere);
});
test('닫기/재열기 외부 opener 복귀, 삭제 opener에 focus0',()=>{
  const ui=fixture(),opener=new ui.Node();opener.focus();ui.controller.begin();
  ui.oldAction.focus();ui.nodes.invPanel.classList.remove('on');ui.controller.close();assert.equal(ui.document.activeElement,opener);
  ui.controller.begin();ui.nodes.invPanel.classList.add('on');ui.oldAction.focus();opener.isConnected=false;
  ui.nodes.invPanel.classList.remove('on');ui.controller.close();assert.notEqual(ui.document.activeElement,opener);
  assert.equal(ui.document.activeElement,ui.document.body);
});
test('KO/EN 리프·자식만 갱신, save/아이템 데이터 참조 변경0',()=>{
  for(const lang of ['ko','en']){
    const ui=fixture();ui.document.lang=lang;ui.controller.missing();
    const leaf=ui.nodes.invRight.children[0];assert.equal(leaf.children.length,0);assert.equal(leaf.attrs.role,'status');
    assert.equal(leaf.textContent,lang==='en'?'Selected item is unavailable.':'선택한 아이템이 없습니다.');
    assert.equal('innerHTML' in ui.nodes.invRight,false);
  }
});
