import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Node {
  constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.style={};this.dataset={};this.attrs={};this.className='';this.tabIndex=tag==='button'?0:-1;this.isConnected=true;}
  appendChild(node){this.children.push(node);node.parentNode=this;return node;}
  replaceChildren(...nodes){this.children=[];for(const n of nodes)this.appendChild(n);}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k];}
  set innerHTML(v){this.children=[];this.html=v;}
  get innerHTML(){return this.html;}
  querySelector(selector){const key=selector.match(/data-bind-control="([^"]+)"/)?.[1];return this.walk().find(n=>n.dataset.bindControl===key)||null;}
  walk(){return this.children.flatMap(n=>[n,...n.walk()]);}
  focus(){this.focused=true;}
}
function setup(file,mode='kbm'){
  const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const block=source.slice(source.indexOf("  const list=$('keyBindList');"),source.indexOf('  // F5키로도 리셋 가능'));
  const list=new Node('div'),calls=[];
  const document={activeElement:null,getElementById:()=>null,createElement:t=>new Node(t),removeEventListener(){},addEventListener(){}};
  const ctx=vm.createContext({document,window:{},$:id=>id==='keyBindList'?list:null,_bindTab:mode,_gpActive:false,
    BINDS:{up:'KeyW',weapon:'mouse0',charge:'ShiftLeft'},BINDS2:{up:'ArrowUp',weapon:null,charge:null},listeningBind:null,_listenAlt:false,
    _T:s=>s,_L:(ko)=>ko,_bindName:s=>s,keyName:s=>s,_GP_KEY:{0:'mouse0',4:'ShiftLeft',5:'ControlLeft'},
    renderSettings:()=>calls.push('render'),saveSettings:()=>calls.push('save'),notify:()=>{},_resetGpKeyMap:()=>{},_saveGpKeyMap:()=>{}});
  vm.runInContext('(function(){'+block+'})()',ctx);
  return {source,list,ctx,calls,rows:list.children.filter(n=>n.className==='set-row')};
}
const event={stopPropagation(){},preventDefault(){}};
for(const file of ['game.html','game-easy-test.html']){
  test(file+': binding selectors and keyboard keys are reachable named buttons',()=>{
    const {list,rows}=setup(file);
    assert.equal(list.children[0].children.length,2);
    for(const n of [...list.children[0].children,...rows.flatMap(r=>r.children),list.children.at(-1)]){
      assert.equal(n.tagName,'BUTTON');assert.equal(n.type,'button');assert.equal(n.tabIndex,0);
      assert.ok(n.textContent);if(n.className.includes('set-key'))assert.ok(n.getAttribute('aria-label'));
    }
  });
  test(file+': starting primary or alternate capture preserves mappings and performs no save',()=>{
    for(const alternate of [false,true]){const {rows,ctx,calls}=setup(file);const n=rows[1].children[alternate?1:0];n.onclick(event);
      assert.equal(ctx.listeningBind,'weapon');assert.equal(ctx._listenAlt,alternate);assert.equal(ctx.BINDS.weapon,'mouse0');assert.equal(ctx.BINDS2.weapon,null);assert.deepEqual(calls,['render']);}
  });
  test(file+': alternate removal has an action name and preserves the primary key',()=>{
    const {rows,ctx,calls}=setup(file),del=rows[0].children[2];assert.equal(del.tagName,'BUTTON');assert.match(del.getAttribute('aria-label'),/up/);del.onclick(event);
    assert.equal(ctx.BINDS2.up,null);assert.equal(ctx.BINDS.up,'KeyW');assert.deepEqual(calls,['render','save']);
  });
  test(file+': fixed pad bindings cannot activate, configurable bindings remain reachable',()=>{
    const {rows}=setup(file,'pad');const fixed=rows[0].children.at(-1),editable=rows[1].children.at(-1);
    assert.equal(fixed.tagName,'BUTTON');assert.equal(fixed.disabled,true);assert.equal(fixed.onclick,undefined);
    assert.equal(editable.tagName,'BUTTON');assert.equal(editable.tabIndex,0);assert.ok(editable.getAttribute('aria-label'));
  });
  test(file+': pad capture announces waiting and ignores a held activation key',()=>{
    const {rows,ctx}=setup(file,'pad'),button=rows[1].children.at(-1);button.onclick(event);
    assert.match(button.getAttribute('aria-label'),/키 입력/);
    ctx.window._gpBindH.k({...event,repeat:true,code:'Enter'});
    assert.equal(ctx._GP_KEY[4],'ShiftLeft');assert.ok(ctx.window._gpBindH);
    ctx.window._gpBindH.k({...event,repeat:false,code:'KeyP'});
    assert.equal(ctx._GP_KEY[4],'KeyP');assert.equal(ctx.window._gpBindH,null);
  });
}
