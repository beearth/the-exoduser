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


const taskId='QUESTNPC-speed-record-commit-despite-guide-error-memory',startUTC=new Date().toISOString(),patches=[];
for(const n of ['game.html','game-easy-test.html']){
 const p=parts(n),raw=fs.readFileSync(p.file,'utf8'),caller=fn(p.file,raw,'checkRooms'),helper=fn(p.file,raw,'_petOnStageClear');
 const marker=n==='game.html'?'          if(_dbReady)dbSave(); // 클리어 보상·기록은 다음 자동저장 전에 확정':'          break;\n        }\n      }\n    }\n  }\n}';
 assert.equal(caller.split(marker).length,2);
 const hook="          if(typeof _petOnStageClear==='function')_petOnStageClear(G.stage);";
 const replacement=n==='game.html'?marker+'\n'+hook:marker.replace('          break;',hook+'\n          break;');
 const caller2=caller.replace(marker,replacement),helperBefore=helper.replace('const _elapsed=(G.frame-_petStageStartT)/60;','const _elapsed=(G.stageTime||0)/60;');
 const recordLine=helperBefore.split('\n').find(x=>x.includes("if(!_petStageRecord[stageId]"));
 const guideBlock=helperBefore.slice(helperBefore.indexOf('  if(_elapsed<=30)'),helperBefore.indexOf(recordLine));
 const recordGuard="if(!_petStageRecord[stageId]||_elapsed<_petStageRecord[stageId]){_petStageRecord[stageId]=_elapsed;";
 assert.equal(recordLine.split(recordGuard).length,2);
 const recordCandidate=recordLine.replace(recordGuard,'if(_record){');
 const helper2=helperBefore.replace(guideBlock,"  const _record=!_petStageRecord[stageId]||_elapsed<_petStageRecord[stageId];\n  try{\n"+guideBlock+"  }finally{if(_record)_petStageRecord[stageId]=_elapsed}\n").replace(recordLine,recordCandidate);
 patches.push({file:p.file,callerOriginalSHA:sha(caller),callerCandidateSHA:sha(caller2),old:marker,next:replacement,helperOriginalSHA:sha(helper),helperCandidateSHA:sha(helper2),helperBefore,helper2});
 function make(fixed,kind){
 const e=env(p,false,false);e.run(caller2+'\n'+(fixed?helper2:helperBefore));
 e.run("SI_TO_HELL[0]=0;G.stage=0;G.frame=0;G.stageTime=1800;G.bossAlive=false;G._bossArena=true;G._bossLoadPhase=0;G._crT=29;G.rooms=[];G.exits=[{x:0,y:0}];G._zones=null;G.stageCleared=false;G._totalSpawned=10;G._stageKills=10;G.comboMax=0;G._sStats={};P.x=0;P.y=0;P.hp=100;P.lv=50;P.sp=0;var T=16,STG=Array.from({length:35},(_,i)=>({hell:0,isHellBoss:false})),HELL_NAMES=['썩은 숲'],_dbReady=true;_DEMO_MODE=true;_DEMO_LAST_STAGE=0;trace.saveCalls=0;trace.clearResultCalls=0;trace.guideIds=[];trace.savedSP=null;function dbSave(){trace.saveCalls++;trace.savedSP=P.sp}function _showClearResult(){trace.clearResultCalls++}function playSample(){}function findBoss(){return null}function doWin(){};for(const id of ['clearStats','clearTitle','clearTitleEn','clearSub','nextBtn','stageClear'])dom[id]={style:{},textContent:'',innerHTML:'',children:[],disabled:true};var __hudFail=false,__txt='';Object.defineProperty(dom.petBubbleTxt,'textContent',{enumerable:true,get(){return __txt},set(v){if(__hudFail&&v==='…30초. 너 진짜 미쳤구나.')throw __error;__txt=v}});const __speedSay=_petSayCD;_petSayCD=function(...a){trace.guideIds.push(a[0]);return __speedSay(...a)}");
 if(kind==='hud'||kind==='slowerHud')e.run('__hudFail=true');
 if(kind==='audio')e.run('__fault=true');
 if(kind==='slowerHud')e.run('_petStageRecord[G.stage]=10');
 if(kind==='active')e.run("_petBubble.t=10;_petBubble.txt='existing-active-guide';");
 if(kind==='duplicate')e.run('G.stageCleared=true');
 const state=()=>JSON.parse(e.run("JSON.stringify({cleared:G.stageCleared,sp:P.sp,time:G.stageTime,ta:G._taRecords,save:trace.saveCalls,savedSP:trace.savedSP,result:trace.clearResultCalls,ids:trace.guideIds,record:_petStageRecord[G.stage],bubble:_petBubble,cd:_petDlgCD,clearUI:{title:dom.clearTitle.textContent,sub:dom.clearSub.textContent,next:dom.nextBtn.textContent,nextDisabled:dom.nextBtn.disabled,opacity:dom.stageClear.style.opacity}})"));
 return {...e,state};
 }
 for(const kind of ['normal','hud','audio','active','duplicate','slowerHud']){
 const a=make(false,kind),b=make(true,kind);
 let aerr,berr;try{a.run('checkRooms()')}catch(x){aerr=x}try{b.run('checkRooms()')}catch(x){berr=x}
 const fault=['hud','audio','slowerHud'].includes(kind);assert.equal(aerr,fault?originalError:undefined);assert.equal(berr,fault?originalError:undefined);
 const sa=a.state(),sb=b.state(),pick=s=>({cleared:s.cleared,sp:s.sp,time:s.time,ta:s.ta,save:s.save,savedSP:s.savedSP,result:s.result,clearUI:s.clearUI});
 assert.deepEqual(pick(sa),pick(sb));if(kind==='normal'||kind==='active'||kind==='duplicate')assert.deepEqual(sa,sb);
 if(kind==='hud'||kind==='audio'){assert.equal(sa.record,undefined);assert.equal(sb.record,30);}
 if(kind==='slowerHud'){assert.equal(sa.record,10);assert.equal(sb.record,10);}
 if(kind==='duplicate'){assert.equal(sb.ids.length,0);assert.equal(sb.sp,0);assert.equal(sb.save,0);}
 else{assert.equal(sb.cleared,true);assert.equal(sb.sp,10);assert.equal(sb.save,n==='game.html'?1:0);assert.equal(sb.savedSP,n==='game.html'?10:null);assert.equal(sb.result,1);assert.equal(sb.ids[0],'speed_stage_30s');}
 if(kind==='normal'||kind==='active')assert.equal(sb.record,30);
 if(kind==='active'){assert.equal(sb.bubble.txt,'existing-active-guide');assert.equal(sb.cd.speed_stage_30s,undefined);}
 b.run('__hudFail=false;__fault=false;G._crT=29;checkRooms()');const second=b.state();assert.equal(second.save,sb.save);assert.equal(second.sp,sb.sp);assert.deepEqual(second.ids,sb.ids);
 cases.push({source:n,case:kind,status:'PASS',sameErrorIdentity:fault&&berr===originalError,original:sa,candidate:sb,afterRepeatedExitCheck:second});
 }
}
console.log(JSON.stringify({taskId,startUTC,endUTC:new Date().toISOString(),sources,fragments:receipts,patches,cases,newCaseGroups:12,productionApplied:false,runtimeAccepted:false,newFiles:0,previousCasesExecuted:0,scope:'new helper record-finally candidate in actual wired exit caller; existing elapsed clock candidate baseline; synthetic inputs and save/UI/audio sinks; normal ordering, first Error and guide rejection preserved; no gameplay or actual DB'},null,2));
