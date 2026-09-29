import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),functions=new Map(),layoutBindings=[];
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
 for(const node of parse(m[1],{ecmaVersion:'latest'}).body){
  if(node.type==='FunctionDeclaration')functions.set(node.id.name,m[1].slice(node.start,node.end));
  if(node.type==='ExpressionStatement'&&node.expression.type==='CallExpression'&&
   node.expression.callee.type==='MemberExpression'&&node.expression.callee.property.name==='addEventListener'&&
   node.expression.callee.object.type==='CallExpression'&&node.expression.callee.object.callee.property?.name==='matchMedia')
   layoutBindings.push(m[1].slice(node.start,node.end));
 }
}
function setup(selected=0){
 const nodes={},timers=[],layoutListeners=[],document={activeElement:null,documentElement:{dir:'ltr'},createElement:tag=>element(tag)};
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
   scrollRequests:[],scrollIntoView(options){this.scrollRequests.push(options);},
   focus(){document.activeElement=this;},blur(){document.activeElement=null;},click(){if(!this.disabled)this.onclick?.();},
   pause(){this.paused=true;},load(){},addEventListener(){}};
  return e;
 }
 const ctx=vm.createContext({document,$:id=>nodes[id]||(nodes[id]=element('div',id)),window:{matchMedia(query){return{addEventListener(event,callback){layoutListeners.push({query,event,callback});}};}},
  _pendingVisualIdx:selected,_visualPreviewSeq:0,_visualReturnFocus:null,
  CHAR_VISUALS:[{name:'Warrior',portrait:'warrior.png'},{name:'Silver',portrait:'silver.png',comingSoon:true}],
  _TL:s=>s,escHtml:s=>s,_spawnEmbers(){},setStatus(){},
  setTimeout(fn){timers.push(fn);return timers.length;},clearTimeout(){}});
 const names=['selectVisual','openVisualSelect','_visualInfoLayoutChanged','_resetVisualInfoScroll','_visualSelectKeydown','_closeVisualSelect','stopMediaVideo','_visualConfirm'];
 vm.runInContext([...names.map(n=>functions.get(n)||''),...layoutBindings].join('\n'),ctx);
 const pop=ctx.$('charVisualPop');pop.style.display='none';
 pop.querySelector=selector=>selector==='.cs-body'?ctx.$('csBody'):null;
 const cancel=ctx.$('visualCancelBtn'),create=ctx.$('visualCreateBtn');pop.children=[ctx.$('csLeft'),ctx.$('csRight'),ctx.$('visualGrid'),cancel,create];
 cancel.onclick=()=>ctx._closeVisualSelect({restoreFocus:true});create.onclick=()=>ctx._visualConfirm();
 const trigger=ctx.$('trigger');trigger.focus();ctx.openVisualSelect();
 function key(key,extra={}){
  const e={key,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...extra};
  assert.equal(typeof ctx._visualSelectKeydown,'function','the picker must handle keyboard input');
  ctx._visualSelectKeydown(e);return e;
 }
 function changeLayout(){
  assert.equal(layoutListeners.length,1,'the responsive layout must register one breakpoint listener');
  assert.equal(layoutListeners[0].query,'(max-width:760px)');assert.equal(layoutListeners[0].event,'change');
  layoutListeners[0].callback();
 }
 return {ctx,nodes,document,trigger,timers,key,changeLayout,icons:nodes.visualGrid.children};
}
for(const selected of [0,1])test('opening focuses the selected native preview button: '+selected,()=>{
 const s=setup(selected);assert.equal(s.document.activeElement,s.icons[selected]);
 assert.equal(s.icons[selected].tagName,'BUTTON');assert.equal(s.icons[selected].type,'button');
 assert.equal(s.icons[selected].getAttribute('aria-pressed'),'true');
 assert.equal(s.icons[1-selected].getAttribute('aria-pressed'),'false');
});
test('Tab and Shift+Tab stay inside the picker and loop through its enabled controls',()=>{
 const s=setup(),controls=[s.nodes.csLeft,s.nodes.csRight,...s.icons,s.nodes.visualCancelBtn,s.nodes.visualCreateBtn];
 for(let i=1;i<=controls.length;i++){const e=s.key('Tab');assert.equal(e.prevented,true);assert.equal(e.stopped,true);assert.equal(s.document.activeElement,controls[(i+2)%controls.length]);}
 s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.csRight);
});
test('locked preview is reachable while its disabled create action is skipped',()=>{
 const s=setup(1);assert.equal(s.nodes.visualCreateBtn.disabled,true);
 s.key('Tab');assert.equal(s.document.activeElement,s.nodes.visualCancelBtn);
 s.key('Tab');assert.equal(s.document.activeElement,s.nodes.csLeft);
 s.key('Tab');assert.equal(s.document.activeElement,s.nodes.csRight);
 s.key('Tab');assert.equal(s.document.activeElement,s.icons[0]);
 s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.csRight);
});
for(const shiftKey of [false,true])test('Tab recovers focus from outside the modal: '+shiftKey,()=>{
 const s=setup();s.trigger.focus();s.key('Tab',{shiftKey});
 assert.equal(s.document.activeElement,shiftKey?s.nodes.visualCreateBtn:s.nodes.csLeft);
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
test('Shift+Tab from the first preview reaches both readable detail regions',()=>{
 const s=setup();s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.csRight);
 s.key('Tab',{shiftKey:true});assert.equal(s.document.activeElement,s.nodes.csLeft);
 s.key('Tab');assert.equal(s.document.activeElement,s.nodes.csRight);
});
for(const key of ['PageDown','End'])test('detail-region '+key+' remains native scrolling without changing preview',()=>{
 const s=setup();s.nodes.csRight.focus();const e=s.key(key);
 assert.equal(e.prevented,false);assert.equal(e.stopped,false);assert.equal(s.ctx._pendingVisualIdx,0);
 assert.equal(s.document.activeElement,s.nodes.csRight);
});
test('Escape from a detail region closes and restores the trigger',()=>{
 const s=setup();s.nodes.csLeft.focus();s.key('Escape');
 assert.equal(s.nodes.charVisualPop.style.display,'none');assert.equal(s.document.activeElement,s.trigger);
});
test('entering a detail region reveals its start instead of the middle of its long content',()=>{
 const s=setup();s.key('Tab',{shiftKey:true});
 assert.equal(s.document.activeElement,s.nodes.csRight);
 assert.equal(s.nodes.csRight.scrollRequests.length,1);
 assert.equal(s.nodes.csRight.scrollRequests[0].block,'start');
});
test('reopening the picker resets the body and both detail scroll positions',()=>{
 const s=setup();s.nodes.csBody=s.ctx.$('csBody');
 for(const id of ['csBody','csLeft','csRight'])s.nodes[id].scrollTop=73;
 s.ctx._closeVisualSelect();s.ctx.openVisualSelect();
 for(const id of ['csBody','csLeft','csRight'])assert.equal(s.nodes[id].scrollTop,0,id);
});
test('previewing a different character starts its details at the top',()=>{
 const s=setup();s.nodes.csBody=s.ctx.$('csBody');
 for(const id of ['csBody','csLeft','csRight'])s.nodes[id].scrollTop=73;
 s.icons[1].click();
 for(const id of ['csBody','csLeft','csRight'])assert.equal(s.nodes[id].scrollTop,0,id);
});
test('reselecting the same preview preserves the current reading position',()=>{
 const s=setup();s.nodes.csBody=s.ctx.$('csBody');
 for(const id of ['csBody','csLeft','csRight'])s.nodes[id].scrollTop=73;
 s.icons[0].click();
 for(const id of ['csBody','csLeft','csRight'])assert.equal(s.nodes[id].scrollTop,73,id);
});

for(const id of ['csLeft','csRight'])test('responsive layout change reveals the focused detail region: '+id,()=>{
 const s=setup();s.nodes[id].focus();
 for(const key of ['csBody','csLeft','csRight'])s.ctx.$(key).scrollTop=73;
 s.changeLayout();
 assert.equal(s.document.activeElement,s.nodes[id]);
 for(const key of ['csBody','csLeft','csRight'])assert.equal(s.nodes[key].scrollTop,0,key);
 assert.equal(s.nodes[id].scrollRequests.at(-1).block,'start');
 assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.nodes.createModal,undefined);
});
for(const focus of ['preview','action','outside'])test('layout change preserves reading position without detail focus: '+focus,()=>{
 const s=setup();(focus==='preview'?s.icons[0]:focus==='action'?s.nodes.visualCancelBtn:s.trigger).focus();
 const active=s.document.activeElement;
 for(const key of ['csBody','csLeft','csRight'])s.ctx.$(key).scrollTop=73;
 s.changeLayout();
 assert.equal(s.document.activeElement,active);
 for(const key of ['csBody','csLeft','csRight'])assert.equal(s.nodes[key].scrollTop,73,key);
 assert.equal(s.nodes.csLeft.scrollRequests.length+s.nodes.csRight.scrollRequests.length,0);
});
test('layout change does not scroll or focus the hidden picker',()=>{
 const s=setup();s.ctx._closeVisualSelect();s.nodes.csRight.focus();
 for(const key of ['csBody','csLeft','csRight'])s.ctx.$(key).scrollTop=73;
 s.changeLayout();
 assert.equal(s.document.activeElement,s.nodes.csRight);
 for(const key of ['csBody','csLeft','csRight'])assert.equal(s.nodes[key].scrollTop,73,key);
 assert.equal(s.nodes.csRight.scrollRequests.length,0);
});


test('RTL preview arrows follow the physical button order and keep Home/End logical',()=>{
 const s=setup();s.document.documentElement.dir='rtl';
 s.key('ArrowLeft');assert.equal(s.ctx._pendingVisualIdx,1);assert.equal(s.document.activeElement,s.icons[1]);
 assert.equal(s.nodes.visualCreateBtn.disabled,true);assert.equal(s.icons[1].getAttribute('aria-pressed'),'true');
 s.key('ArrowLeft');assert.equal(s.ctx._pendingVisualIdx,1);
 s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.document.activeElement,s.icons[0]);
 s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.nodes.visualCreateBtn.disabled,false);
 s.key('End');assert.equal(s.ctx._pendingVisualIdx,1);s.key('Home');assert.equal(s.ctx._pendingVisualIdx,0);
 assert.equal(s.nodes.createModal,undefined);
});
test('preview arrow mapping uses the current document direction while open',()=>{
 const s=setup();s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,1);
 s.document.documentElement.dir='rtl';s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,0);
 s.document.documentElement.dir='ltr';s.key('ArrowRight');assert.equal(s.ctx._pendingVisualIdx,1);
});
for(const dir of ['ltr','rtl'])for(const input of ['dpad','stick'])test(dir+' preview '+input+' follows physical left/right order',()=>{
 const s=setup();s.document.documentElement.dir=dir;s.nodes.charVisualPop.querySelectorAll=()=>s.icons;
 s.ctx._GP={axes:[0,0],prev:{}};
 const branch=html.slice(html.indexOf('  // 비주얼 선택 팝업'),html.indexOf('  // 우측 스틱'));
 vm.runInContext('function padPreview(just){'+branch+'}',s.ctx);
 const next=dir==='rtl'?-1:1;
 function move(direction){s.ctx._GP.axes[0]=input==='stick'?direction:0;s.ctx.padPreview(input==='dpad'?{[direction<0?14:15]:true}:{});}
 function neutral(){s.ctx._GP.axes[0]=0;s.ctx.padPreview({});}
 move(next);assert.equal(s.ctx._pendingVisualIdx,1);assert.equal(s.nodes.visualCreateBtn.disabled,true);
 assert.equal(s.icons[1].getAttribute('aria-pressed'),'true');move(next);assert.equal(s.ctx._pendingVisualIdx,1);
 neutral();move(-next);assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.nodes.visualCreateBtn.disabled,false);
 neutral();move(-next);assert.equal(s.ctx._pendingVisualIdx,0);assert.equal(s.nodes.createModal,undefined);
});
