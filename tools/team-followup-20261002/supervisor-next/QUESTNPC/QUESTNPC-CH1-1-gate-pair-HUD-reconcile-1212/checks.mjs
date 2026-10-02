import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001',receipts=[],sources=[],cases=[];
const sha=x=>createHash('sha256').update(x).digest('hex');
function idx(s,m){const a=s.indexOf(m);assert.ok(a>=0,m);assert.equal(s.indexOf(m,a+m.length),-1,m);return a}
function frag(file,s,name,a,b){const t=s.slice(a,b);receipts.push({file,name,fromLine:s.slice(0,a).split('\n').length,toLine:s.slice(0,b-1).split('\n').length,sha256:sha(t)});return t}
function between(file,s,name,a,b){const from=idx(s,a);return frag(file,s,name,from,s.indexOf(b,from+a.length))}
function fn(file,s,name){
 const a=idx(s,'function '+name+'('),begin=s.indexOf('{',a);let depth=0,mode='';
 for(let i=begin;i<s.length;i++){const c=s[i],n=s[i+1];
 if(mode==='line'){if(c==='\n')mode='';continue}
 if(mode==='block'){if(c==='*'&&n==='/'){mode='';i++}continue}
 if(mode){if(c==='\\'){i++;continue}if(c===mode)mode='';continue}
 if(c==='/'&&n==='/'){mode='line';i++;continue}if(c==='/'&&n==='*'){mode='block';i++;continue}
 if(c==="'"||c==='"'||c.charCodeAt(0)===96){mode=c;continue}
 if(c==='{')depth++;if(c==='}'&&--depth===0)return frag(file,s,name,a,i+1);
 }throw Error('missing function boundary '+name);
}
function parts(name){
 const file=root+'/'+name,s=fs.readFileSync(file,'utf8');sources.push({file,sha256:sha(s)});
 const init=between(file,s,'actual full pet state','const _petBubble=','// 대사 발동 함수');
 const priority=between(file,s,'actual priority state','const _PET_TIER_COOL=','// id → 티어 추론');
 const oi=idx(s,'const _PET_OP_MAX='),op=frag(file,s,'opacity',oi,s.indexOf(';',oi)+1);
 const full=fn(file,s,'_checkPetDialogue'),marker='_PB.tier=-1;_petInFrame=true;';assert.equal(full.split(marker).length,2);
 const ins=full.replace(marker,marker+'\n  try{');
 const candidate=ins.slice(0,ins.lastIndexOf('}'))+'  }finally{_petInFrame=false}\n}';
 const functions=['_petTierOf','_petSay','_petSfx','_petBubbleShow','_petSayCD','_petBidCD','_petSayUrgent','_petFireBid','_updatePetBubble','_petBagNext','updatePet','playFM'].map(n=>fn(file,s,n)).join('\n');
 const guards=between(file,s,'update guards','function update(){','  // null 엔트리 정리');
 const pet=s.split('\n').filter(l=>l.trim().startsWith('if(G.pets)updatePet();'));assert.equal(pet.length,1);
 const at=s.indexOf(pet[0]);frag(file,s,'update pet call',at,at+pet[0].length);
 const event=between(file,s,'external gate caller','  // ═══ 지옥문 개방:','  if(!G.stageCleared&&G.exits.length>0');
 return {file,init,priority,op,full,candidate,functions,guards,pet:pet[0],event};
}
const originalError=new Error('injected-createOscillator-failure');
function env(p,candidate,fault){
 const ctx=vm.createContext({__error:originalError,__fault:fault});
 vm.runInContext("var G={on:true,paused:false,stage:4,frame:1,bossAlive:true,_bossRef:null,_regions:{},_bossUnlocked:false,pets:{crow:{},cat:{},xbow:{},iris:{}}},P={lv:501,hp:5,mhp:100,mp:100,mmp:100,st:100,mst:100,s:'idle',skills:{},x:0,y:0},INV={bag:[],equipped:{}},STATS={str:0,dex:0,int:0},ens=[],projs=[],SI_TO_HELL={4:1},OPT={diff:5};\nvar _dtSp=1,_MAP_QA_MODE=false,_DEMO_MODE=false,_DEMO_LAST_STAGE=3,_EDITOR_MODE=false,_shDirty=false,_mmDirty=0;\nvar window={_systemLesson:{tick(){}},_parryLesson:{tick(){return false}}};\nvar trace={urgent:[],oscillatorCalls:0,noise:0,timers:0,gate:0,victory:0};\nvar dom={petSubtitle:{style:{}},petPortrait:{style:{},src:''},petBubbleTxt:{style:{},textContent:'',children:[]}};\nfunction $(id){return dom[id]||null}function _T(t){return t}function _L(t){return t}function _padifyHint(t){return t}\nfunction isJust(){return false}function _chkJust(){return false}function _updateOnePet(){}function _updateGhostXbow(){}function _updateGhostIris(){}\nfunction _regionClearedCount(){return 4}function addTxt(){trace.gate++}var SFX={victory(){trace.victory++}};\nvar _activeNodeCnt=0,_MAX_ACTIVE_NODES=100;\nfunction param(){return {setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}}}\nfunction actx(){return {currentTime:0,createOscillator(){trace.oscillatorCalls++;if(__fault)throw __error;return {frequency:param(),connect(){},start(){},stop(){},disconnect(){}}},createGain(){return {gain:param(),connect(){},disconnect(){}}}}}\nfunction _r(n){return n}function mbus(){return {}}function setTimeout(){trace.timers++}function playNoise(){trace.noise++}",ctx);
 vm.runInContext([p.init,p.priority,p.op,p.functions,candidate?p.candidate:p.full,p.guards+'\n'+p.pet+'\n}', 'function event(){'+p.event+'}'].join('\n'),ctx);
 vm.runInContext("const __urgent=_petSayUrgent;_petSayUrgent=function(...a){const inFrame=_petInFrame;const out=__urgent(...a);trace.urgent.push({id:a[0],inFrame,returned:out});return out}",ctx);
 const run=t=>vm.runInContext(t,ctx);
 const snap=()=>JSON.parse(run('JSON.stringify({inFrame:_petInFrame,pb:_PB,bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,activeNodes:_activeNodeCnt,dom,trace})'));
 return {run,snap};
}


const taskId='QUESTNPC-CH1-1-gate-pair-HUD-reconcile-memory',startUTC=new Date().toISOString(),patches=[];
function hudPatch(p){
 const raw=fs.readFileSync(p.file,'utf8'),show=fn(p.file,raw,'_petBubbleShow'),timer=fn(p.file,raw,'_updatePetBubble');
 const head=show.replace('{','{\n  try{').replace('if(!_ps)return;','if(!_ps){_petHUDDirty=false;return;}');
 assert.notEqual(head,show);
 const fixedShow=head.slice(0,-1)+'  _petHUDDirty=false;\n  }catch(e){_petHUDDirty=true;throw e}\n}';
 const marker='    // 자막 페이드아웃';assert.equal(timer.split(marker).length,2);
 const fixedTimer=timer.replace(marker,'    if(_petHUDDirty&&_petBubble.t>0)_petBubbleShow(_petBubble.who,_petBubble.txt);\n'+marker).replace("if(_petBubble.t<=0&&!_petBubble.pair){","if(_petBubble.t<=0&&!_petBubble.pair){_petHUDDirty=false;");
 const functions=p.functions.replace(show,fixedShow).replace(timer,fixedTimer);assert.notEqual(functions,p.functions);
 patches.push({file:p.file,showOriginalSHA:sha(show),showCandidateSHA:sha(fixedShow),timerOriginalSHA:sha(timer),timerCandidateSHA:sha(fixedTimer),originalShow:show,candidateShow:fixedShow,originalTimer:timer,candidateTimer:fixedTimer,newState:'let _petHUDDirty=false;'});
 return {...p,init:p.init+'\nlet _petHUDDirty=false;',functions};
}
function scene(p){
 const e=env(p,false,false);
 e.run("G.stage=0;G._fbDone=true;P.hp=100;trace.hudWrites=0;var __hudFault=false;var __hudStyleFault=false;var __text='';var __font='';Object.defineProperty(dom.petBubbleTxt,'textContent',{enumerable:true,get(){return __text},set(v){trace.hudWrites++;if(__hudFault)throw __error;__text=v}});Object.defineProperty(dom.petBubbleTxt.style,'fontSize',{enumerable:true,get(){return __font},set(v){if(__hudStyleFault)throw __error;__font=v}})");
 e.run('event()');assert.equal(e.run('G._bossUnlocked'),true);assert.equal(e.snap().cd.boss_gate_open,1800);assert.equal(e.snap().bubble.t,240);
 return e;
}
for(const name of ['game.html','game-easy-test.html']){
 const p=parts(name),fixed=hudPatch(p);
 for(const kind of ['text','style','audio']){
  const a=scene(p),b=scene(fixed),fault=kind==='text'?'__hudFault=true':kind==='style'?'__hudStyleFault=true':'__fault=true';
  const states=[];
  for(const e of [a,b]){
   e.run(fault+';_dtSp=240;G.frame=2;');let caught;try{e.run('update()')}catch(err){caught=err}assert.equal(caught,originalError);states.push(e.snap());
  }
  assert.deepEqual(states[0],states[1]);assert.equal(states[1].bubble.pairFired,true);assert.equal(states[1].bubble.pair,null);assert.equal(states[1].bubble.t,240);assert.equal(states[1].cd.boss_gate_open,1560);
  assert.equal(b.run('_petHUDDirty'),kind!=='audio');
  for(const e of [a,b])e.run('__hudFault=false;__hudStyleFault=false;__fault=false;_dtSp=1;G.frame=3;update();event()');
  const old=a.snap(),next=b.snap();
  assert.equal(next.bubble.t,239);assert.equal(next.cd.boss_gate_open,1559);assert.equal(next.trace.gate,1);assert.equal(next.trace.victory,1);
  assert.equal(next.trace.oscillatorCalls,states[1].trace.oscillatorCalls);
  assert.equal(next.bubble.pairFired,true);assert.equal(next.bubble.pair,null);assert.equal(b.run('_petHUDDirty'),false);
  assert.deepEqual(old.cd,next.cd);assert.deepEqual(old.tiers,next.tiers);assert.deepEqual(old.bubble,next.bubble);
  if(kind==='text'){assert.notEqual(old.dom.petBubbleTxt.textContent,next.bubble.txt);assert.equal(next.dom.petBubbleTxt.textContent,next.bubble.txt)}
  if(kind==='style'){assert.equal(next.dom.petSubtitle.style.right,'20px');assert.notEqual(old.dom.petSubtitle.style.right,'20px')}
  if(kind==='audio')assert.deepEqual(old,next);
  cases.push({source:name,case:'actual-CH1-1-gate-pair-'+kind+'-fault',status:'PASS',sameErrorIdentity:true,afterFault:states[1],originalNext:old,candidateNext:next});
 }
 const a=scene(p),b=scene(fixed);for(const e of [a,b])e.run('_dtSp=240;G.frame=2;update();_dtSp=1;G.frame=3;update();event()');
 assert.deepEqual(a.snap(),b.snap());cases.push({source:name,case:'normal-gate-pair-control',status:'PASS',state:b.snap()});
 const c=scene(fixed);c.run('__hudFault=true;_dtSp=240;');let caught;try{c.run('update()')}catch(err){caught=err}assert.equal(caught,originalError);
 c.run('__hudFault=false;_petBubble.t=0;_petBubble.pair=null;_dtSp=1;G.frame=3;update()');
 assert.equal(c.run('_petHUDDirty'),false);assert.equal(c.snap().dom.petSubtitle.style.opacity,'0');
 cases.push({source:name,case:'expired-or-cancelled-pending-HUD-clears',status:'PASS',state:c.snap()});
}
console.log(JSON.stringify({taskId,startUTC,endUTC:new Date().toISOString(),sources,fragments:receipts,patches,cases,newCaseGroups:10,productionApplied:false,runtimeAccepted:false,newFiles:0,priorFixtureRuns:0,policy:'HUD-only retry after caught render exception; same Error propagated; CD/UID/pair consumption and SFX unchanged'},null,2));
