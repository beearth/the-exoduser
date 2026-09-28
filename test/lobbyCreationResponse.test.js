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
function setup(mode='direct'){
 const nodes={},status=[],stories=[],pending=[];let writes=0,storageWrites=0;
 const document={activeElement:null,querySelector:()=>element(),createElement:()=>element()};
 function element(){const classes=new Set();return {style:{},children:[],value:'QA전사',
  classList:{add(n){classes.add(n);},remove(n){classes.delete(n);},contains:n=>classes.has(n),toggle(){}},
  focus(){document.activeElement=this;},querySelector:()=>null,replaceChildren(){},click(){return this.onclick?.();}};}
 const ctx=vm.createContext({console,document,$:id=>id==='_langPop'?null:(nodes[id]||(nodes[id]=element())),window:{},
  _characterLoadSeq:0,_testMode:mode!=='online',_pendingVisualIdx:0,
  CHAR_VISUALS:[{},{}],currentUser:{id:'owner',email:'qa'},_GP:{vibLoopStop(){}},
  _LOBBY_BUILD:'full',_LOBBY_VER_LABEL:{},_LOBBY_VER_LIMITS:{},_LOBBY_VER:'qa',_cinPreview:false,_emberIv:null,
  _TL:s=>s,getCurrentLanguage:()=> 'ko',setStatus:(...args)=>status.push(args),_afterCharacterCreated:async(...args)=>stories.push(args),
  localStorage:{getItem:()=>null,setItem(){storageWrites++;},removeItem(){}},
  fetch:async(url,options)=>{if(url.startsWith('/api/load/'))return {ok:false};writes++;return new Promise((resolve,reject)=>pending.push({resolve,reject,options}));},
  sb:{from:()=>({insert:()=>{writes++;return new Promise((resolve,reject)=>pending.push({resolve,reject}));}})}});
 for(const name of ['clearInterval','stopWorldIntro','stopCinBgm','stopMediaVideo','startBGM','hideLoading',
  'showLoading','_clearVidTimers','stopLobbyBgm','_stopHover','playCinematic','_updateCharDisplay','_preloadLoadingImgs'])ctx[name]=()=>{};
 ctx.loadCharacters=ctx.loadLocalCharacters=async()=>{ctx._characterLoadSeq++;};
 const names=['_goLogin','_goCinematic','_goLobby','showLobby','_closeCreationOverlays','_closeVisualSelect','_vkbHide',
  '_showCreateFailure','doCreateChar','_enterOffline'];
 vm.runInContext(names.map(n=>functions.get(n)).join('\n'),ctx);
 ctx.$('createModal');
 if(mode==='button')ctx._enterOffline();
 return {ctx,nodes,document,status,stories,pending,start:()=>mode==='button'?nodes.createBtn.onclick():ctx.doCreateChar('QA전사',0),
  writes:()=>writes,storageWrites:()=>storageWrites};
}
async function waitPending(s){for(let i=0;i<8&&!s.pending.length;i++)await Promise.resolve();assert.equal(s.pending.length,1);}
function finish(s,mode,outcome){
 if(outcome==='network')s.pending[0].reject(new Error('QA network failure'));
 else s.pending[0].resolve(mode==='online'?{error:outcome==='error'?{code:'23505',message:'duplicate'}:null}:
  {ok:true,json:async()=>({ok:outcome==='success',error:'QA save failed'})});
}

for(const mode of ['online','direct','button'])for(const outcome of ['success','error','network']){
 test(mode+' late '+outcome+' cannot reopen the form, start a story or write fallback storage after login',async()=>{
  const s=setup(mode),task=s.start();await waitPending(s);await s.ctx._goLogin();
  const destination=s.ctx.$('demoEnterBtn');destination.focus();const statusCount=s.status.length;
  finish(s,mode,outcome);await task;
  assert.equal(s.nodes.createModal.classList.contains('show'),false);
  assert.equal(s.document.activeElement,destination);
  assert.equal(s.stories.length,0);assert.equal(s.storageWrites(),0);assert.equal(s.status.length,statusCount);
  assert.equal(s.status.at(-1)[0],'','the old creating message must be cleared on leaving');
  assert.equal(s.nodes.createBtn.disabled,false);assert.equal(s.writes(),1);
 });
}
for(const route of ['_goCinematic','_goLobby','showLobby'])test(route+' invalidates a pending creation before success',async()=>{
 const s=setup(),task=s.start();await waitPending(s);await s.ctx[route]();finish(s,'direct','success');await task;
 assert.equal(s.stories.length,0);assert.equal(s.nodes.createBtn.disabled,false);
});
for(const mode of ['direct','button'])test(mode+' delayed JSON parsing is checked after screen exit',async()=>{
 const s=setup(mode),task=s.start();await waitPending(s);let parsed;
 s.pending[0].resolve({ok:true,json:()=>new Promise(resolve=>{parsed=resolve;})});
 for(let i=0;i<8&&!parsed;i++)await Promise.resolve();assert.equal(typeof parsed,'function');
 await s.ctx._goLogin();parsed({ok:false,error:'old JSON'});await task;
 assert.equal(s.nodes.createModal.classList.contains('show'),false);assert.equal(s.stories.length,0);
});
for(const phase of ['response','JSON'])test('offline preflight '+phase+' cannot submit a save after screen exit',async()=>{
 const s=setup('button');let resolve;const delayed=new Promise(done=>{resolve=done;});
 s.ctx.fetch=url=>url.startsWith('/api/load/')?(phase==='response'?delayed:Promise.resolve({ok:true,json:()=>delayed})):
  (()=>{throw new Error('A stale preflight must not send POST');})();
 const task=s.start();await Promise.resolve();await s.ctx._goLogin();
 resolve(phase==='response'?{ok:false}:{ok:false});await task;
 assert.equal(s.stories.length,0);assert.equal(s.storageWrites(),0);
 assert.equal(s.nodes.createModal.classList.contains('show'),false);assert.equal(s.nodes.createBtn.disabled,false);
});
test('offline submission keeps its original visual index while a newer preview is selected',async()=>{
 const s=setup('button'),task=s.start();await waitPending(s);s.ctx._pendingVisualIdx=1;
 finish(s,'button','success');await task;
 assert.equal(JSON.parse(s.pending[0].options.body).data.charIdx,0);
 assert.deepEqual(Array.from(s.stories[0]),['QA전사',0]);
});

for(const phase of ['list','story','story failure'])test('creation '+phase+' completion cannot resume the old screen after leaving',async()=>{
 const s=setup('online');let settle,started=0,gates=0,restarts=0;
 const pending=new Promise((resolve,reject)=>{settle=phase==='story failure'?reject:resolve;});
 s.ctx._onlineChars=[{id:'created',name:'QA전사'}];
 s.ctx.loadCharacters=()=>{s.ctx._characterLoadSeq++;return phase==='list'?pending:Promise.resolve();};
 s.ctx.ExoduserCharacterStory={play:()=>{started++;return pending;}};
 s.ctx.showCharGate=()=>{gates++;};s.ctx.startBGM=()=>{restarts++;};
 vm.runInContext(functions.get('_afterCharacterCreated'),s.ctx);
 const task=s.ctx._afterCharacterCreated('QA전사',0);
 if(phase!=='list'){for(let i=0;i<8&&!started;i++)await Promise.resolve();assert.equal(started,1);}
 await s.ctx._goLogin();const baseline=restarts;settle(phase==='story failure'?new Error('late playback failure'):true);await task;
 assert.equal(gates,0);assert.equal(restarts,baseline);assert.equal(started,phase==='list'?0:1);
});
test('current online list refresh can finish creation despite advancing its own request number',async()=>{
 const s=setup('online');let gates=0;
 s.ctx._onlineChars=[{id:'created',name:'QA전사'}];
 s.ctx.ExoduserCharacterStory={play:async()=>true};s.ctx.showCharGate=()=>{gates++;};
 vm.runInContext(functions.get('_afterCharacterCreated'),s.ctx);
 await s.ctx._afterCharacterCreated('QA전사',0);assert.equal(gates,1);
});
test('leaving an already playing creation story closes it and cannot enter the old character',async()=>{
 const s=setup();let complete,skips=0,gates=0;
 s.ctx.ExoduserCharacterStory={active:false,play(){this.active=true;return new Promise(resolve=>{complete=resolve;});},
  skip(){skips++;this.active=false;complete(true);}};
 s.ctx.showCharGate=()=>{gates++;};
 vm.runInContext(functions.get('_afterCharacterCreated'),s.ctx);
 const task=s.ctx._afterCharacterCreated('QA전사',0);assert.equal(s.ctx.ExoduserCharacterStory.active,true);
 await s.ctx._goLogin();assert.equal(s.ctx.ExoduserCharacterStory.active,false);await task;
 assert.equal(skips,1);assert.equal(gates,0);
});
