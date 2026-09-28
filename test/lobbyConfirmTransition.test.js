import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const confirmation=html.slice(html.indexOf('let _delConfirmCb=null;'),html.indexOf('// ── 가상 키보드'));
const transitions=html.slice(html.indexOf('function _goLogin('),html.indexOf('// ═══ 오프라인 모드 진입'))+
 html.slice(html.indexOf('async function showLobby('),html.indexOf('async function loadCharacters(){'));
const onlineDelete=html.match(/_showDelConfirm\(ch.name,async\(\)=>\{([\s\S]*?)\n        \}\);/)[1];
const localDelete=html.match(/_showDelConfirm\(s.name,async\(\)=>\{([\s\S]*?)\n        \}\);/)[1];

function setup(){
 const nodes={};let focusCalls=0,status=[];
 const document={activeElement:null,querySelector:()=>element(),createElement:()=>element()};
 const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},isConnected:true,
  addEventListener(){},querySelector:()=>null,replaceChildren(){},
  focus(){document.activeElement=this;focusCalls++;},blur(){document.activeElement=null;},
  contains(el){return el===this||el===nodes.delConfirmYes||el===nodes.delConfirmNo;},
  click(){return this.onclick?.();}});
 const ctx=vm.createContext({document,$:id=>id==='_langPop'?null:(nodes[id]||(nodes[id]=element())),
  window:{},_GP:{prev:{},axes:[0,0],vibLoopStop(){}},_LOBBY_BUILD:'full',_LOBBY_VER_LABEL:{},
  _LOBBY_VER_LIMITS:{},_LOBBY_VER:'test',_testMode:true,_cinPreview:false,_emberIv:null,
  _characterLoadSeq:0,currentUser:{id:'owner',email:'qa'},_TL:s=>s,
  setStatus:(...args)=>status.push(args)});
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM',
  'hideLoading','showLoading','_clearVidTimers','stopLobbyBgm','playCinematic',
  '_updateCharDisplay','_preloadLoadingImgs'])ctx[name]=()=>{};
 ctx.loadCharacters=ctx.loadLocalCharacters=async()=>{ctx._characterLoadSeq++;};
 vm.runInContext(confirmation+transitions,ctx);
 return {ctx,nodes,document,element,focusCalls:()=>focusCalls,status};
}

for(const route of ['_goLogin','_goCinematic','_goLobby','showLobby'])test(route+' discards an old confirmation and its callback without focusing hidden lobby controls',async()=>{
 const s=setup();let calls=0;
 s.element().focus();s.ctx._showDelConfirm('sample',()=>{calls++;});
 const before=s.focusCalls();await s.ctx[route]();
 assert.equal(s.nodes.delConfirmModal.style.display,'none');
 assert.equal(vm.runInContext('_delConfirmCb',s.ctx),null);
 assert.equal(vm.runInContext('_delConfirmReturnFocus',s.ctx),null);
 assert.notEqual(s.document.activeElement,s.nodes.delConfirmNo);
 assert.equal(s.focusCalls(),before);
 await s.nodes.delConfirmYes.click();assert.equal(calls,0);
});

for(const outcome of ['resolve','reject'])test('a '+outcome+' after screen exit releases the request lock without old error or focus effects',async()=>{
 const s=setup();let settle,calls=0;
 const pending=new Promise((resolve,reject)=>{settle=outcome==='resolve'?resolve:reject;});
 s.ctx._showDelConfirm('sample',()=>{calls++;return pending;});
 const submit=s.nodes.delConfirmYes.click();assert.equal(calls,1);
 await s.ctx._goLogin();assert.equal(s.nodes.delConfirmModal.style.display,'none');
 assert.equal(vm.runInContext('_delConfirmBusy',s.ctx),true,'an already submitted request is still in flight');
 const destination=s.element();destination.focus();const before=s.focusCalls(),statusBefore=s.status.length;
 settle(outcome==='reject'?new Error('old request failed'):undefined);await submit;
 assert.equal(vm.runInContext('_delConfirmBusy',s.ctx),false);
 assert.equal(s.nodes.delConfirmYes.disabled,false);assert.equal(s.nodes.delConfirmNo.disabled,false);
 assert.equal(s.document.activeElement,destination);assert.equal(s.focusCalls(),before);
 assert.equal(s.status.length,statusBefore);
 s.ctx._showDelConfirm('new',()=>{calls++;});await s.nodes.delConfirmYes.click();assert.equal(calls,2);
});

test('ordinary cancel still restores its trigger and stays locked during a submitted request',async()=>{
 const s=setup(),trigger=s.element();trigger.focus();let resolve;
 s.ctx._showDelConfirm('sample',()=>new Promise(done=>{resolve=done;}));
 s.ctx._hideDelConfirm();assert.equal(s.document.activeElement,trigger);
 s.ctx._showDelConfirm('sample',()=>new Promise(done=>{resolve=done;}));
 const submit=s.nodes.delConfirmYes.click();s.ctx._hideDelConfirm();
 assert.equal(s.nodes.delConfirmModal.style.display,'flex');resolve();await submit;
 assert.equal(s.nodes.delConfirmModal.style.display,'none');assert.equal(s.document.activeElement,trigger);
});

for(const mode of ['online success','online zero rows','local success','local failure'])test(mode+' cannot start a new list request or fallback after leaving the lobby',async()=>{
 const s=setup();let finish,reloads=0,storageReads=0;
 const response=new Promise(resolve=>{finish=resolve;});
 s.ctx.ch={id:'hero'};s.ctx.s={name:'hero'};s.ctx._slotScrollIdx=1;
 s.ctx.loadCharacters=s.ctx.loadLocalCharacters=async()=>{reloads++;s.ctx._characterLoadSeq++;};
 s.ctx.fetch=()=>response;s.ctx.localStorage={getItem(){storageReads++;return null;}};
 const query={eq(){return this;},select(){return response;}};
 s.ctx.sb={from:()=>({delete:()=>query})};
 const body=mode.startsWith('online')?onlineDelete:localDelete;
 vm.runInContext('_showDelConfirm("hero",async()=>{'+body+'});',s.ctx);
 const submit=s.nodes.delConfirmYes.click();await s.ctx._goLogin();
 const statusBefore=s.status.length;
 finish(mode.startsWith('online')?{data:mode==='online success'?[{id:'hero'}]:[],error:null}:{ok:mode==='local success'});
 await submit;
 assert.equal(reloads,0);assert.equal(storageReads,0);assert.equal(s.status.length,statusBefore);
 assert.equal(s.ctx._slotScrollIdx,1);
});

for(const mode of ['desktop rejection','manual close notice'])test('quit '+mode+' cannot replace status on a later screen',async()=>{
 const s=setup();let reject;const timers=[];
 s.ctx._lobbyLang=()=> 'ko';s.ctx.setTimeout=fn=>timers.push(fn);s.ctx.window.close=()=>{};
 if(mode==='desktop rejection')s.ctx.window.electronAPI={quitApp:()=>new Promise((_,fail)=>{reject=fail;})};
 vm.runInContext(html.slice(html.indexOf('function _showLobbyQuit(){'),html.indexOf('// ── 커스텀 삭제 확인 모달')),s.ctx);
 s.ctx._showLobbyQuit();const submit=s.nodes.delConfirmYes.click();await s.ctx._goLogin();
 const before=s.status.length;
 if(reject)reject(new Error('quit unavailable'));await submit;
 for(const timer of timers)timer();assert.equal(s.status.length,before);
});

for(const mode of ['server','storage fallback'])test('local deletion on the same screen preserves '+mode+' completion',async()=>{
 const s=setup();let reloads=0,removed=0;
 s.ctx.s={name:'hero'};s.ctx._slotScrollIdx=1;
 s.ctx.loadLocalCharacters=async()=>{reloads++;s.ctx._characterLoadSeq++;};
 s.ctx.fetch=async()=>({ok:mode==='server'});
 s.ctx.localStorage={getItem:()=>JSON.stringify({name:'hero'}),removeItem(){removed++;}};
 vm.runInContext('_showDelConfirm("hero",async()=>{'+localDelete+'});',s.ctx);
 await s.nodes.delConfirmYes.click();assert.equal(reloads,1);assert.equal(s.ctx._slotScrollIdx,0);
 assert.equal(removed,mode==='storage fallback'?1:0);
});

for(const mode of ['desktop rejection','manual close notice'])test('quit '+mode+' still reports status on the same screen',async()=>{
 const s=setup(),timers=[];s.ctx._lobbyLang=()=> 'ko';s.ctx.setTimeout=fn=>timers.push(fn);s.ctx.window.close=()=>{};
 if(mode==='desktop rejection')s.ctx.window.electronAPI={quitApp:async()=>{throw new Error('quit unavailable');}};
 vm.runInContext(html.slice(html.indexOf('function _showLobbyQuit(){'),html.indexOf('// ── 커스텀 삭제 확인 모달')),s.ctx);
 s.ctx._showLobbyQuit();const before=s.status.length;await s.nodes.delConfirmYes.click();for(const timer of timers)timer();
 assert.equal(s.status.length,before+1);
});

for(const route of ['_goLogin','_goCinematic','_goLobby','showLobby'])test(route+' is safe before confirmation state initializes',async()=>{
 const s=setup();s.nodes.delConfirmModal.style.display='none';
 const early=vm.createContext({...s.ctx});
 vm.runInContext(transitions+confirmation.slice(confirmation.indexOf('function _hideDelConfirm('),confirmation.indexOf('function _delHighlight()'))+
  ';globalThis.start='+route+'();let _delConfirmBusy=false,_delConfirmCb=null,_delConfirmReturnFocus=null;',early);
 await early.start;
});
