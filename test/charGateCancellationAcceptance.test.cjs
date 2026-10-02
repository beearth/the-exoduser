'use strict';

// Actual whole gate/transition/storage functions and actual listener source.
// DOM, auth delivery, media, timer and localStorage are explicit memory doubles.
// No page script evaluation, real auth/API/storage, browser or native navigation.
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {parseExpressionAt,parse}=require('acorn');
const ROOT=path.resolve(__dirname,'..'),FILE=path.join(ROOT,'index.html');
const originalBytes=fs.readFileSync(FILE),source=originalBytes.toString('utf8');
const sha=x=>createHash('sha256').update(x).digest('hex');
const OLD_GATE_SHA='475b7013544010e793267300afa8174d5c6ac06626f8407c34ad365a8c401e4d';
const FN=['showCharGate','_goLogin','_goCinematic','showLobby','_afterCharacterCreated',
  'showLoading','hideLoading','setStatus','_demoSlotRead','_demoSyncActiveSave','_demoActivateSlot',
  '_lobbyDemoCharacterName','_lobbyAncestorName','_lobbyAncestorCaption','_lobbyAncestorDetail',
  '_updateCharDisplay','_closeCreationOverlays','_closeVisualSelect','_stopHover',
  'stopWorldIntro','stopMediaVideo','stopCinBgm','startBGM','playEnterSFX'];
function info(name,code,start,kind){return{name,kind,code,line:source.slice(0,start).split('\n').length,bytes:Buffer.byteLength(code),sha256:sha(code)};}
function fn(name){
  const m=new RegExp('^(?:async )?function '+name+'\\(','m').exec(source);assert.ok(m,name);
  let n=parseExpressionAt(source,m.index,{ecmaVersion:'latest'}),wrapperCalls=0;
  // A following IIFE can be parsed as a call of this expression; never include
  // that adjacent statement in the selected whole-function source.
  while(n.type==='CallExpression'){n=n.callee;wrapperCalls++;}
  assert.equal(n.type,'FunctionExpression');assert.equal(n.id.name,name);assert.equal(n.start,m.index);
  return{...info(name,source.slice(m.index,n.body.end),m.index,'function'),expressionWrapperCallsRemoved:wrapperCalls};
}
function decl(name){const m=new RegExp('^(?:var|const|let) '+name+'=','m').exec(source);assert.ok(m,name);const end=source.indexOf(';',m.index)+1;const code=source.slice(m.index,end);assert.equal(parse(code,{ecmaVersion:'latest'}).body[0].type,'VariableDeclaration');return info(name,code,m.index,'declaration');}
const blocks=[...FN.map(fn),decl('_selectedSlot'),decl('_characterLoadSeq'),decl('_DEMO_SLOT_PREFIX')];
const cv=/^const CHAR_VISUALS=/m.exec(source);assert.ok(cv);
const cvend=parseExpressionAt(source,cv.index+cv[0].length,{ecmaVersion:'latest'}).end+1;
blocks.push(info('CHAR_VISUALS',source.slice(cv.index,cvend),cv.index,'constant'));
const gate=blocks.find(x=>x.name==='showCharGate');
if(process.argv.includes('--baseline'))assert.equal(gate.sha256,OLD_GATE_SHA);
const enterStart=source.indexOf("if($('enterGameBtn')){",source.indexOf('// 입장 버튼'));
const enterEnd=source.indexOf('// 생성 모달',enterStart);
assert.ok(enterStart>=0&&enterEnd>enterStart);
const enter=info('enterGameBtnBindings',source.slice(enterStart,enterEnd),enterStart,'listener-registration');
parse(enter.code,{ecmaVersion:'latest'});
const authStart=source.indexOf('sb.auth.onAuthStateChange(');
assert.ok(authStart>=0);
const authEnd=parseExpressionAt(source,authStart,{ecmaVersion:'latest'}).end;
const auth=info('authStateChangeRegistration',source.slice(authStart,authEnd)+';',authStart,'listener-registration');
const replayMatch=/<button\b[^>]*\bid="replayCinBtn"[^>]*\bonclick="([^"]+)"[^>]*>/i.exec(source);
assert.ok(replayMatch);parse(replayMatch[1],{ecmaVersion:'latest'});
const replay=info('replayCinBtnInline',replayMatch[1],replayMatch.index,'inline-handler-body');

// Only after production adoption, normal controls reconstruct old actual source
// by removing the two reviewed guard contacts. Baseline makes no candidate.
function oldGate(actual){
  if(sha(actual)===OLD_GATE_SHA)return actual;
  const capture='  const request=_characterLoadSeq;\n';
  const guard='if(request!==_characterLoadSeq)return;';
  assert.equal(actual.split(capture).length,2);assert.equal(actual.split(guard).length,2);
  const old=actual.replace(capture,'').replace(guard,'');assert.equal(sha(old),OLD_GATE_SHA);return old;
}

const CASES=[
  {id:'normal-demo-button',build:'demo',test:true},
  {id:'normal-local-button',build:'full',test:true},
  {id:'normal-online-button',build:'full',test:false},
  {id:'normal-demo-created-story',build:'demo',test:true,story:true},
  {id:'online-logout-auth-cancellation',build:'full',test:false,cancel:'login'},
  {id:'demo-replay-cinematic-cancellation',build:'demo',test:true,cancel:'replay'},
  {id:'demo-slot-missing-error',build:'demo',test:true,missing:true},
  {id:'demo-activation-first-storage-error',build:'demo',test:true,storageError:true}
];

async function run(sc,control=false){
  const trace=[],storageTrace=[],timers=[],nav=[];let authCallback=null;
  const record=(type,details={})=>trace.push({type,...details});
  const byid=new Map();let nextNode=0;
  class Element{
    constructor(tag,id=''){
      this.tag=tag;this._id=id;this.key=id||tag+'-'+(++nextNode);this.children=[];this.parentElement=null;
      this.listeners=new Map();this.attrs=new Map();this.disabled=false;this.onclick=null;this.offsetParent={};this.offsetWidth=100;
      this.style=new Proxy({}, {set:(o,k,v)=>{o[k]=v;record('style',{node:this.key,key:k,value:v});return true;}});
      const cls=new Set();this.classList={contains:x=>cls.has(x),
        add:(...xs)=>{for(const x of xs)cls.add(x);record('class.add',{node:this.key,values:xs});},
        remove:(...xs)=>{for(const x of xs)cls.delete(x);record('class.remove',{node:this.key,values:xs});},
        toggle:(x,on)=>{const value=on===undefined?!cls.has(x):!!on;if(value)cls.add(x);else cls.delete(x);record('class.toggle',{node:this.key,key:x,on:value});return value;}};
      this.pause=()=>record('media.pause',{node:this.key});this.load=()=>record('media.load',{node:this.key});
      if(id)byid.set(id,this);
    }
    set id(v){this._id=v;this.key=v;byid.set(v,this);}get id(){return this._id;}
    set textContent(v){this.text=v;record('text',{node:this.key,value:v});}get textContent(){return this.text||'';}
    set innerHTML(v){this.html=v;record('html',{node:this.key,value:v});}get innerHTML(){return this.html||'';}
    replaceChildren(...children){this.children=children;for(const child of children)child.parentElement=this;record('replaceChildren',{node:this.key,children:children.map(x=>x.key)});}
    addEventListener(type,callback){this.listeners.set(type,callback);}
    click(){record('UI.click',{node:this.key});const event={currentTarget:this,preventDefault(){},stopPropagation(){}};const cb=this.listeners.get('click');if(cb)cb(event);if(this.onclick)this.onclick(event);}
    contains(target){return target===this||this.children.includes(target);}
    querySelector(sel){return sel==='p'?byid.get('loading-message'):sel==='.cin-hell-frame'?byid.get('cin-hell-frame'):null;}
    removeAttribute(name){this.attrs.delete(name);record('attribute.remove',{node:this.key,name});}
    getAttribute(name){return this.attrs.get(name)||null;}setAttribute(name,value){this.attrs.set(name,value);}
    focus(){document.activeElement=this;record('focus',{node:this.key});}blur(){document.activeElement=null;}
    scrollIntoView(){record('scrollIntoView',{node:this.key});}
  }
  for(const id of ['enterGameBtn','lobby','loginSection','lobbyMode','userEmail','cinLang','chapterGate','chGateImg',
    'loading','loading-message','status','lobbyStatus','cinScene','mainWrap','googleBtn','offlineBtn','demoEnterBtn',
    'createModal','createBtn','vkbWrap','charVisualPop','delConfirmModal','cinVideo','worldIntroVideo','cinTextInner',
    'cinClickPrompt','cin-hell-frame','cinDoorL','cinDoorR','charDispEmpty','charDispTitle','charDispSub','charDispDetail',
    'lobbyCharPreview','lobbyCharKeyart','lobbyBgImg','csIdleVid','csSceneVid','container','container-header','login-title','replayCinBtn'])new Element('div',id);
  for(let i=1;i<=19;i++)new Element('div','cinImg'+i);
  const $=id=>byid.get(id)||null;
  const document={activeElement:null,documentElement:{dir:'ltr'},getElementById:$,
    createElement:tag=>new Element(tag),addEventListener:(...args)=>record('document.listener',{type:args[0]}),
    querySelector:sel=>sel==='.container'?$('container'):sel==='.container > div[style*="text-align:center"]'?$('container-header'):sel==='#loginSection h2'?$('login-title'):null};
  $('lobby').style.display='flex';$('loginSection').style.display='none';$('charVisualPop').style.display='none';
  $('vkbWrap').style.display='none';$('delConfirmModal').style.display='none';
  const selected=sc.missing?'없는전사':sc.test?'전사A':'char-1';
  const slot={name:'전사A',ts:15,charIdx:0,player:{lv:8,mp:30},game:{stage:0,bossUnlocked:false}};
  const active={...slot,player:{lv:12,mp:42},game:{stage:0,bossUnlocked:true},cleared:[1,3]};
  const store=new Map([['hellsave_demo_0',JSON.stringify(slot)],['unrelated:save','KEEP']]);
  if(!sc.storageError){store.set('hellsave_demo_active','0');store.set('hellsave_demo',JSON.stringify(active));}
  const injected=new Error('first activation storage error');
  const localStorage={getItem:key=>{const value=store.get(String(key))??null;storageTrace.push({op:'get',key:String(key),value});return value;},
    setItem:(key,value)=>{storageTrace.push({op:'set',key:String(key),value:String(value)});if(sc.storageError&&key==='hellsave_demo')throw injected;store.set(String(key),String(value));},
    removeItem:key=>{storageTrace.push({op:'remove',key:String(key)});store.delete(String(key));}};
  const location={search:sc.build==='demo'?'?demo=1':'',hostname:'fixture.invalid'};
  let href='http://fixture.invalid/index.html?lobby=1'+(sc.build==='demo'?'&demo=1':'');
  Object.defineProperty(location,'href',{get:()=>href,set:value=>{href=value;nav.push(value);record('navigation',{value});}});
  const window={location};
  const authDouble={onAuthStateChange:fn=>{authCallback=fn;record('auth.register');},
    signOut:()=>{record('auth.signOut');assert.ok(authCallback,'actual auth callback registered');authCallback('SIGNED_OUT',null);return Promise.resolve();}};
  const c=vm.createContext({window,location,document,$,localStorage,URLSearchParams,encodeURIComponent,
    console:{warn:(...args)=>record('console.warn',{message:String(args[0])}),error:(...args)=>record('console.error',{message:String(args[0])})},
    Image:class{set src(v){record('Image.src',{value:v});}},_LOBBY_BUILD:sc.build,_testMode:sc.test,
    _lobbyLang:()=> 'ko',_TL:x=>x,getCurrentLanguage:()=> 'ko',_cinPreview:false,_cinDone:true,_cinReady:true,
    _emberIv:0,_hoverSrc:null,_hoverGain:null,_hoverCtx:null,_cinBgm:null,
    _worldIntroSubtitles:null,_worldIntroPlayer:null,_cinKeyCleanup:null,
    _GP:{vibLoopStop:()=>record('GP.vibLoopStop'),vib:(...args)=>record('GP.vib',{args})},
    _enterSFX:{currentTime:0,volume:1,play:()=>record('audio.enter.play')},_enterGain:null,
    sb:{auth:authDouble},currentUser:{id:'fixture-user',email:'fixture@example.invalid'},_onlineChars:[],
    ExoduserCharacterStory:{active:false,play:async options=>{record('story.play',{options});return true;}},
    setTimeout:(callback,delay)=>{timers.push({callback,delay});record('timer',{delay});return timers.length;},
    clearInterval:id=>record('interval.clear',{id}),setInterval:()=>{throw Error('unexpected live BGM interval branch');},
    stopLobbyBgm:()=>record('audio.stopLobby'),_tryBGM:()=>record('audio.tryBGM'),bgmStarted:true,
    _clearVidTimers:()=>record('media.clearTimers'),playCinematic:()=>record('media.playCinematic'),
    _swapLobbyBg:value=>record('visual.swapLobbyBg',{value}),
    loadCharacters:()=>{record('list.loadCharacters.double');return Promise.resolve();}});
  vm.runInContext(blocks.map(b=>control&&b.name==='showCharGate'?oldGate(b.code):b.code).join('\n'),c,{timeout:1000});
  vm.runInContext(enter.code,c,{timeout:1000});
  // Browser's inline-handler wrapper is emulated; body is exact HTML source.
  $('replayCinBtn').onclick=vm.runInContext('(function(event){'+replay.code+'})',c);
  if(!sc.test){vm.runInContext(auth.code,c);await c.showLobby();}
  c._selectedSlot=selected;c._selectedSlotName=sc.test?selected:'온라인 전사';c._selectedCharDisplay={name:sc.test?selected:'온라인 전사',charIdx:0};
  trace.length=0;storageTrace.length=0;
  const beforeHref=href;let caught=null;
  try{if(sc.story)await c._afterCharacterCreated('전사A',0);else $('enterGameBtn').click();}catch(error){caught=error;}
  const activationTrace=JSON.parse(JSON.stringify(storageTrace));const afterActivation=Object.fromEntries(store);
  if(sc.storageError){assert.equal(caught,injected);assert.equal(timers.length,0);}else assert.equal(caught,null);
  if(sc.missing){assert.equal(timers.length,0);assert.equal($('status').textContent,'알 수 없는 오류');}
  if(!sc.storageError&&!sc.missing){assert.equal(timers.length,1);assert.equal(timers[0].delay,1200);}
  if(sc.cancel==='login')$('lobbyLogout').click();
  if(sc.cancel==='replay')$('replayCinBtn').click();
  const seqBeforeTimers=c._characterLoadSeq, traceBeforeTimers=JSON.parse(JSON.stringify(trace));
  const storageBeforeTimers=JSON.parse(JSON.stringify(storageTrace));
  for(const t of timers)t.callback();
  const afterTimers=Object.fromEntries(store);assert.deepEqual(afterTimers,afterActivation,'timers/cancel must not rollback or add activation writes');
  assert.deepEqual(storageTrace,storageBeforeTimers,'no storage side effects after preactivation');assert.equal(store.get('unrelated:save'),'KEEP');
  const obligations=[];
  if(sc.cancel){assert.equal(seqBeforeTimers,1,'actual transition increments current request');if(href!==beforeHref)obligations.push('stale timer navigated after actual transition');}
  else if(!sc.storageError&&!sc.missing){
    const target=sc.build==='demo'?'game.html?test=1&slot=demo&demo=1':sc.test?'game.html?test=1&slot='+encodeURIComponent(selected):'game.html?char=char-1&slot='+encodeURIComponent('온라인 전사');
    assert.equal(href,target+(sc.story?'&story=warrior-v21':''));
  }else assert.equal(href,beforeHref);
  if(sc.build==='demo'&&!sc.storageError&&!sc.missing){
    const saved=JSON.parse(store.get('hellsave_demo'));assert.equal(saved.player.lv,12);assert.equal(saved.game.bossUnlocked,true);
    assert.equal(store.get('hellsave_demo_active'),'0');
  }
  return{id:sc.id,status:obligations.length?'FAIL_STALE_NAVIGATION':'PASS',obligations,build:sc.build,testMode:sc.test,
    beforeHref,href,nav,seqBeforeTimers,timerDelays:timers.map(t=>t.delay),sameFirstError:sc.storageError?caught===injected:null,
    activationTrace,storageTrace,afterActivation,afterTimers,traceBeforeTimers,completeTrace:trace,
    lifecycle:{lobby:$('lobby').style.display,login:$('loginSection').style.display,gate:$('chapterGate').style.display,selectedSlot:c._selectedSlot},
    actualAuthCallbackRegistered:!sc.test};
}

(async()=>{
  const startedAt=new Date().toISOString(),records=[],controls=[];let fixtureErrors=0;
  for(const sc of CASES){
    try{
      const result=await run(sc);records.push(result);
      if(sc.id.startsWith('normal-')){
        const old=await run(sc,true);
        // Independent VM realms have different Object prototypes; compare all
        // serializable events,URL,storage and lifecycle values,not realm identity.
        assert.deepEqual(JSON.parse(JSON.stringify(result)),JSON.parse(JSON.stringify(old)));
        controls.push({id:sc.id,oldGateSHA256:sha(oldGate(gate.code)),eventURLStorageLifecycleEqual:true});
      }
    }catch(error){fixtureErrors++;records.push({id:sc.id,status:'FIXTURE_ERROR',error:String(error.stack||error)});}
  }
  const pass=records.filter(r=>r.status==='PASS').length,fail=records.filter(r=>r.status==='FAIL_STALE_NAVIGATION').length;
  console.log(JSON.stringify({startedAt,completedAt:new Date().toISOString(),groups:records.length,pass,fail,fixtureErrors,
    normalOldSourceControls:controls,sourceExecutions:records.length+controls.length,
    baseline:process.argv.includes('--baseline'),memoryCandidateExecutions:0,
    source:{file:'index.html',bytes:originalBytes.length,sha256:sha(originalBytes),blocks:[...blocks,enter,auth,replay].map(({code,...x})=>x)},
    records,sourcePreserved:sha(fs.readFileSync(FILE))===sha(originalBytes),
    boundaries:{actual:'Whole gate,login,cinematic,showLobby,created-story,selection-reset,loading and demo-slot helpers; actual enter listener registration,auth callback and replay inline body.',
      doubles:'MemoryDOM/style/media methods,held timer,Mapstorage,Image,translation,bgm/visual sinks; loadCharacters list requests are a stub,not actual network/list rendering. Story play resolves true;creation save already exists. Auth registration expression separated from init and used only full online mode; signOut double delivers actual SIGNED_OUT callback.',
      invalidation:'Demo/auth init early-return prevents auth registration in native/offline; online login cancel and demo replay cancel are separate source ingress cases.',
      storage:'Activation occurs before timer;cancel preserves existing activation writes. No rollback policy adopted. Demo5-slot constants/helpers actual; fixture lv12/openflag only data preservation,not game progression.',
      normalControls:'Full serializable event/URL/storage/lifecycle traces normalized with JSON to remove independent VM realm prototypes only.',
      extraction:'Acorn FunctionExpression.body.end; adjacent IIFE CallExpression wrappers unwrapped for boundary selection only. No whole-page evaluation or adjacent IIFE execution.',
      error:'Mapactivation setItem throws identical object at actual registered handler; DOMdouble propagates that error,not native DOM exception delivery acceptance.',
      unverified:['Native/browser entry or overlay keyboard/pointer reachability','Actual Supabase/auth/logout/service delivery','Full init/online and local list producers,character selection renderer','Actual story playback/media/BGM/DOMfocus or gamepad','Real storage/save/API/schema/gameplay/build','Other seq changes that do not increment shared lifecycle']}
  },null,2));
  process.exitCode=fixtureErrors?2:fail?1:0;
})().catch(error=>{console.error(error.stack);process.exitCode=2;});
