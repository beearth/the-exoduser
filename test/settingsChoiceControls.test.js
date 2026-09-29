import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function fixture(file) {
  const source=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const start=source.indexOf('function renderSettings(){');
  const block=source.slice(start,source.indexOf("  const list=$('keyBindList');",start))+'}';
  const calls=[],document={activeElement:null};
  class Node {
    constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.style={};this.dataset={};this.attrs={};this.tabIndex=tag==='button'?0:-1;}
    appendChild(n){this.children.push(n);return n;}
    replaceChildren(){this.children=[];}
    set innerHTML(value){this.children=[];}
    setAttribute(k,v){this.attrs[k]=String(v);}
    getAttribute(k){return this.attrs[k];}
    insertBefore(n,before){this.children.splice(this.children.indexOf(before),0,n);}
    closest(selector){return this.dataset.settingsChoice&&selector.includes('data-settings-choice')?this:null;}
    focus(options){document.activeElement=this;this.focusOptions=options;}
    getContext(){return {};}
  }
  document.createElement=tag=>new Node(tag);
  const cursor=new Node('div'),character=new Node('div');
  const ctx=vm.createContext({document,$:id=>id==='cursorGrid'?cursor:id==='charSelectGrid'?character:null,
    _CURSORS:[{name:'기본',nameEn:'Default',img:'default.png'},{name:'검',nameEn:'Sword',img:'sword.png',draw:()=>calls.push('fallback')}],
    CHAR_LIST:[{name:'전사',desc:'검은 갑옷',idleN:1,folder:'warrior'},{name:'댄서',desc:'회전 대검',idleN:1,folder:'dancer'}],
    OPT:{cursor:0,shake:40},_charIdx:0,_cursorCache:['old'],_T:s=>s,_L:(ko)=>ko,
    _applyCursor:()=>calls.push('cursor'),saveSettings:()=>calls.push('save'),
    _loadCharAtlas:index=>{ctx._charIdx=index;calls.push('character:'+index);}});
  vm.runInContext(block,ctx);ctx.renderSettings();
  return {ctx,calls,document,cursor,character};
}
for(const file of ['game.html','game-easy-test.html']) {
  test(file+': character and cursor choices are named keyboard reachable buttons with selection state',()=>{
    const {cursor,character}=fixture(file);
    for(const grid of [cursor,character])for(const [i,card] of grid.children.entries()) {
      assert.equal(card.tagName,'BUTTON');assert.equal(card.type,'button');assert.equal(card.tabIndex,0);
      assert.ok(card.getAttribute('aria-label'));assert.equal(card.getAttribute('aria-pressed'),String(i===0));
    }
  });
  test(file+': cursor selection preserves other options and restores focus to the rebuilt card',()=>{
    const {ctx,calls,document,cursor}=fixture(file);
    const card=cursor.children[1];card.focus();card.onclick();
    assert.equal(ctx.OPT.cursor,1);assert.equal(ctx.OPT.shake,40);
    assert.deepEqual(calls,['cursor','save']);assert.equal(document.activeElement,cursor.children[1]);
    assert.equal(document.activeElement.getAttribute('aria-pressed'),'true');assert.equal(document.activeElement.focusOptions.preventScroll,true);
  });
  test(file+': character selection uses the atlas loader and preserves focused selection after redraw',()=>{
    const {ctx,calls,document,character}=fixture(file);
    character.children[1].focus();character.children[1].onclick();
    assert.equal(ctx._charIdx,1);assert.deepEqual(calls,['character:1']);
    assert.equal(document.activeElement,character.children[1]);assert.equal(document.activeElement.getAttribute('aria-pressed'),'true');
  });
  test(file+': cursor image failure retains its canvas fallback and name',()=>{
    const {calls,cursor}=fixture(file),card=cursor.children[1];
    card.children[0].onerror();
    assert.equal(card.children[0].style.display,'none');assert.equal(card.children[1].tagName,'CANVAS');
    assert.equal(card.children.at(-1).textContent,'검');assert.deepEqual(calls,['fallback']);
  });
}
