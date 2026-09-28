import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const functions=new Map();
for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){
 for(const node of parse(m[1],{ecmaVersion:'latest'}).body){
  if(node.type==='FunctionDeclaration')functions.set(node.id.name,m[1].slice(node.start,node.end));
 }
}
function setup(){
 const nodes={},timers=[];let serial=0;
 const document={activeElement:null,createElement:()=>element(),querySelector:()=>element()};
 function element(id=''){
  const classes=new Set(),attributes={};
  return {id,isConnected:true,style:{},children:[],dataset:{},value:'',src:'',poster:'',paused:true,readyState:0,
   classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));},
    contains:n=>classes.has(n),toggle(n,on){if(on)classes.add(n);else classes.delete(n);}},
   parentElement:{classList:{toggle(){}}},setAttribute(k,v){attributes[k]=v;},getAttribute:k=>attributes[k]??null,
   removeAttribute(k){delete attributes[k];if(k==='src'||k==='poster')this[k]='';},
   addEventListener(){},replaceChildren(){this.children=[];},appendChild(child){this.children.push(child);},
   querySelector:()=>null,querySelectorAll(){return this.children;},
   contains(el){return id==='charVisualPop'?el===nodes.visualCancelBtn||el===nodes.visualCreateBtn:
    id==='createModal'?el===nodes.charName||el===nodes.createCancelBtn:el===this;},
   focus(){document.activeElement=this;},blur(){document.activeElement=null;},
   play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},load(){},click(){return this.onclick?.();}};
 }
 const ctx=vm.createContext({document,$:id=>id==='_langPop'?null:(nodes[id]||(nodes[id]=element(id))),window:{},
  CHAR_VISUALS:[{name:'Warrior',portrait:'warrior.png',idleVid:'warrior.mp4',scene:'warrior-bg.png'},
   {name:'Silver',portrait:'silver.png',idleVid:'silver.mp4',scene:'silver-bg.png',comingSoon:true}],
  _pendingVisualIdx:0,_visualPreviewSeq:0,_visualReturnFocus:null,_GP:{prev:{},axes:[0,0],vibLoopStop(){}},
  _vkbActive:false,_hgState:null,_LOBBY_BUILD:'full',_LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},
  _LOBBY_VER:'qa',_testMode:true,_cinPreview:false,_emberIv:null,_characterLoadSeq:0,
  currentUser:{id:'owner',email:'qa'},_TL:s=>s,escHtml:s=>s,setStatus(){},_spawnEmbers(){},
  setTimeout(fn,delay){const timer={id:++serial,fn,delay,canceled:false};timers.push(timer);return timer.id;},
  clearTimeout(id){const timer=timers.find(t=>t.id===id);if(timer)timer.canceled=true;}});
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','startBGM','hideLoading','showLoading',
  '_clearVidTimers','stopLobbyBgm','playCinematic','_updateCharDisplay','_preloadLoadingImgs'])ctx[name]=()=>{};
 ctx.loadCharacters=ctx.loadLocalCharacters=async()=>{ctx._characterLoadSeq++;};
 for(const id of ['charVisualPop','vkbWrap'])ctx.$(id).style.display='none';
 const names=['stopMediaVideo','selectVisual','openVisualSelect','_visualConfirm','_vkbHide',
  '_closeVisualSelect','_closeCreationOverlays','_goLogin','_goCinematic','_goLobby','showLobby'];
 vm.runInContext(names.map(n=>functions.get(n)||'').join('\n')+'\n'+
  html.match(/\$\('visualCancelBtn'\)\.onclick=[^\n]+/)[0],ctx);
 return {ctx,nodes,timers,document};
}
function assertReleased(s){
 assert.equal(s.nodes.charVisualPop.style.display,'none');
 for(const id of ['csIdleVid','csSceneVid']){
  assert.equal(s.nodes[id].paused,true);assert.equal(s.nodes[id].src,'');assert.equal(s.nodes[id].poster,'');
 }
 assert.equal(s.nodes.csIdleVid.onerror,null);assert.equal(s.nodes.csIdleVid.oncanplay,null);
 assert.ok(s.timers.filter(t=>t.delay===5000).every(t=>t.canceled));
}
test('cancel stops hidden preview media and reopening starts the selected asset again',()=>{
 const s=setup();s.ctx.openVisualSelect();s.nodes.csSceneVid.src='old-scene.mp4';s.nodes.csSceneVid.play();
 s.nodes.visualCancelBtn.click();assertReleased(s);
 s.ctx.openVisualSelect();assert.equal(s.nodes.csIdleVid.src,'warrior.mp4');assert.equal(s.nodes.csIdleVid.paused,false);
});
test('ordinary picker cancel restores its connected trigger',()=>{
 const s=setup(),trigger=s.ctx.$('cardTrigger');trigger.focus();s.ctx.openVisualSelect();
 s.nodes.visualCancelBtn.focus();s.nodes.visualCancelBtn.click();assert.equal(s.document.activeElement,trigger);
});
test('confirm releases preview media while retaining the normal name dialog and delayed focus',()=>{
 const s=setup();s.ctx.openVisualSelect();s.ctx._visualConfirm();assertReleased(s);
 assert.equal(s.nodes.createModal.classList.contains('show'),true);
 s.timers.find(t=>t.delay===50).fn();assert.equal(s.document.activeElement,s.nodes.charName);
});
test('a late fallback cannot restore media or portrait state after the picker closes',()=>{
 const s=setup();s.ctx.openVisualSelect();const fallback=s.nodes.csIdleVid.onerror;
 s.nodes.visualCancelBtn.click();const before=s.nodes.csPortrait.src;fallback();
 for(const timer of s.timers)timer.fn();assertReleased(s);assert.equal(s.nodes.csPortrait.src,before);
});
test('a previous character fallback cannot replace the newly selected character',()=>{
 const s=setup();s.ctx.openVisualSelect();const fallback=s.nodes.csIdleVid.onerror;
 s.ctx.selectVisual(1);fallback();
 for(const timer of s.timers.filter(t=>t.delay===180))timer.fn();
 assert.equal(s.nodes.csIdleVid.src,'silver.mp4');assert.equal(s.nodes.csIdleVid.paused,false);
 assert.equal(s.nodes.csPortrait.style.display,'none');
});
for(const route of ['_goLogin','_goCinematic','_goLobby','showLobby']){
 test(route+' closes the picker and releases its media without retaining hidden focus',async()=>{
  const s=setup();s.ctx.openVisualSelect();s.nodes.visualCancelBtn.focus();await s.ctx[route]();
  assertReleased(s);assert.notEqual(s.document.activeElement,s.nodes.visualCancelBtn);
 });
 test(route+' clears the name dialog and virtual keyboard before delayed input focus runs',async()=>{
  const s=setup();s.ctx.openVisualSelect();s.ctx._visualConfirm();
  s.nodes.charName.focus();s.ctx._vkbActive=true;s.ctx._hgState={cho:'ㄱ'};
  s.ctx.$('vkbWrap').style.display='block';await s.ctx[route]();
  for(const timer of s.timers.filter(t=>t.delay===50))timer.fn();
  assert.equal(s.nodes.createModal.classList.contains('show'),false);
  assert.equal(s.nodes.vkbWrap.style.display,'none');assert.equal(s.ctx._vkbActive,false);assert.equal(s.ctx._hgState,null);
  assert.notEqual(s.document.activeElement,s.nodes.charName);
 });
 test(route+' is safe with initially hidden overlays before their state initializes',async()=>{
  const s=setup();const ctx=vm.createContext({...s.ctx});
  const code=['_goLogin','_goCinematic','_goLobby','showLobby','_closeCreationOverlays','_closeVisualSelect','_vkbHide']
   .map(n=>functions.get(n)||'').join('\n');
  vm.runInContext(code+';globalThis.initial='+route+'();let _visualPreviewSeq=0,_vkbActive=false,_hgState=null;',ctx);
  await ctx.initial;
 });
}
