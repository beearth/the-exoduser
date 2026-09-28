import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),functions=new Map();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
 for(const node of parse(m[1],{ecmaVersion:'latest'}).body){
  if(node.type==='FunctionDeclaration')functions.set(node.id.name,m[1].slice(node.start,node.end));
 }
}
function setup(selected=0){
 const nodes={},timers=[],document={activeElement:null,createElement:tag=>element(tag)};
 function element(tag='div',id=''){
  const classes=new Set(),attrs={};
  const e={id,tagName:tag.toUpperCase(),style:{},children:[],dataset:{},disabled:false,isConnected:true,
   className:'',value:'',src:'',poster:'',parentElement:{classList:{toggle(){}}},
   classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},
    contains:n=>classes.has(n),toggle(n,force){if(force)classes.add(n);else classes.delete(n);}},
   setAttribute(k,v){attrs[k]=String(v);if(k==='data-vi')this.dataset.vi=String(v);},getAttribute:k=>attrs[k]??null,
   removeAttribute(k){delete attrs[k];if(k==='src'||k==='poster')this[k]='';},
   replaceChildren(...items){this.children=items;},appendChild(child){this.children.push(child);},
   querySelectorAll(){return this.children.filter(c=>c.className==='cs-ico');},
   querySelector(){return this.children.find(c=>c.classList.contains('sel'))||null;},
   contains(target){return target===this||this.children.some(child=>child.contains(target));},
   focus(){document.activeElement=this;},blur(){document.activeElement=null;},click(){if(!this.disabled)this.onclick?.();},
   pause(){this.paused=true;},load(){},addEventListener(){}};
  return e;
 }
 const ctx=vm.createContext({document,$:id=>nodes[id]||(nodes[id]=element('div',id)),window:{},
  _pendingVisualIdx:selected,_visualPreviewSeq:0,_visualReturnFocus:null,
  CHAR_VISUALS:[{name:'Warrior',portrait:'warrior.png'},{name:'Silver',portrait:'silver.png',comingSoon:true}],
  _TL:s=>s,escHtml:s=>s,_spawnEmbers(){},setStatus(){},
  setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}});
 const names=['selectVisual','openVisualSelect','_visualSelectKeydown','_closeVisualSelect','stopMediaVideo','_visualConfirm'];
 vm.runInContext(names.map(n=>functions.get(n)||'').join('\n'),ctx);
 const pop=ctx.$('charVisualPop');pop.style.display='none';
 const cancel=ctx.$('visualCancelBtn'),create=ctx.$('visualCreateBtn');pop.children=[ctx.$('visualGrid'),cancel,create];
 cancel.onclick=()=>ctx._closeVisualSelect({restoreFocus:true});create.onclick=()=>ctx._visualConfirm();
 const trigger=ctx.$('trigger');trigger.focus();ctx.openVisualSelect();
 function key(key,extra={}){
  const e={key,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...extra};
  assert.equal(typeof ctx._visualSelectKeydown,'function','the picker must handle keyboard input');
  ctx._visualSelectKeydown(e);return e;
 }
 return {ctx,nodes,document,trigger,timers,key,icons:nodes.visualGrid.children};
}
for(const selected of [0,1])test('opening focuses the selected native preview button: '+selected,()=>{
 const s=setup(selected);assert.equal(s.document.activeElement,s.icons[selected]);
 assert.equal(s.icons[selected].tagName,'BUTTON');assert.equal(s.icons[selected].type,'button');
 assert.equal(s.icons[selected].getAttribute('aria-pressed'),'true');
 assert.equal(s.icons[1-selected].getAttribute('aria-pressed'),'false');
});
test('Tab and Shift+Tab stay inside the picker and loop through its enabled controls',()=>{
 const s=setup(),controls=[...s.icons,s.nodes.visualCancelBtn,s.nodes.visualCreateBtn];
 for(let i=1;i<=controls.length;i++){const e=s.key('Tab');assert.equal(e.prevented,true);assert.equal(e.stopped,true);assert.equal(s.document.activeElement,controls[i%controls.length]);}
 s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.visualCreateBtn);
});
test('locked preview is reachable while its disabled create action is skipped',()=>{
 const s=setup(1);assert.equal(s.nodes.visualCreateBtn.disabled,true);
 s.key('Tab');assert.equal(s.document.activeElement,s.nodes.visualCancelBtn);
 s.key('Tab');assert.equal(s.document.activeElement,s.icons[0]);
 s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.visualCancelBtn);
});
for(const shiftKey of [false,true])test('Tab recovers focus from outside the modal: '+shiftKey,()=>{
 const s=setup();s.trigger.focus();s.key('Tab',{shiftKey});
 assert.equal(s.document.activeElement,shiftKey?s.nodes.visualCreateBtn:s.icons[0]);
});
test('direction keys preview, focus and announce the same character without confirming creation',()=>{
 const s=setup();s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,1);assert.equal(s.document.activeElement,s.icons[1]);
 assert.equal(s.icons[1].getAttribute('aria-pressed'),'true');assert.equal(s.icons[0].getAttribute('aria-pressed'),'false');
 assert.equal(s.nodes.visualCreateBtn.disabled,true);assert.equal(s.nodes.createModal,undefined);
 s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,1);
 s.key('Home');assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.nodes.visualCreateBtn.disabled,false);
 s.key('End');assert.equal(s.ctx._pendingVisualIdx,1);s.key('ArrowLeft');assert.equal(s.ctx._pendingVisualIdx,0);
 s.key('ArrowLeft');assert.equal(s.ctx._pendingVisualIdx,0);
});
test('direction keys on an action button do not change the selected preview',()=>{
 const s=setup();s.nodes.visualCancelBtn.focus();const e=s.key('ArrowRight');
 assert.equal(e.prevented,false);assert.equal(s.ctx._pendingVisualIdx,0);
});
test('Escape cancels through the normal cleanup and returns focus to the connected trigger',()=>{
 const s=setup();const e=s.key('Escape');assert.equal(e.prevented,true);assert.equal(e.stopped,true);
 assert.equal(s.nodes.charVisualPop.style.display,'none');assert.equal(s.document.activeElement,s.trigger);
 assert.equal(s.nodes.csIdleVid.src,'');assert.equal(s.nodes.csIdleVid.paused,true);assert.equal(s.nodes.createModal,undefined);
});
for(const key of ['Escape','ArrowRight','Tab'])for(const extra of [{isComposing:true},{keyCode:229}]){
 test(key+' does not consume an IME composition event: '+JSON.stringify(extra),()=>{
  const s=setup(),before=s.document.activeElement,e=s.key(key,extra);
  assert.equal(e.prevented,false);assert.equal(s.document.activeElement,before);assert.equal(s.ctx._pendingVisualIdx,0);
  assert.equal(s.nodes.charVisualPop.style.display,'flex');
 });
}
test('the hidden picker does not intercept keyboard input',()=>{
 const s=setup();s.ctx._closeVisualSelect();const e=s.key('Tab');assert.equal(e.prevented,false);
});
test('clicking a preview button never opens the name form',()=>{
 const s=setup();s.icons[1].click();assert.equal(s.ctx._pendingVisualIdx,1);assert.equal(s.nodes.createModal,undefined);
});
