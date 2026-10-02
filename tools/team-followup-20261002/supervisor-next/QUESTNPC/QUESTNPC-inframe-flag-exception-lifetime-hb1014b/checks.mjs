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
for(const name of ['game.html','game-easy-test.html']){
 const p=parts(name),old=env(p,false,true),fixed=env(p,true,true),failures=[];
 for(const e of [old,fixed]){let caught;try{e.run('update()')}catch(err){caught=err}
 assert.equal(caught,originalError);failures.push({message:caught.message,sameErrorIdentity:true});}
 const before=old.snap(),after=fixed.snap();assert.equal(before.inFrame,true);assert.equal(after.inFrame,false);
 assert.deepEqual({...before,inFrame:false},after);
 assert.equal(before.pb.tier,5);assert.equal(before.pb.id,'hp_critical');assert.equal(before.pb.weight,100);
 assert.equal(before.bubble.t,180);assert.equal(before.cd.hp_critical,undefined);assert.deepEqual(before.tiers,[0,0,0,0,0,0]);
 for(const e of [old,fixed]){e.run('__fault=false');e.run('event()')}
 const lost=old.snap(),rescued=fixed.snap();
 assert.deepEqual(lost.trace.urgent.at(-1),{id:'boss_gate_open',inFrame:true,returned:false});
 assert.deepEqual(rescued.trace.urgent.at(-1),{id:'boss_gate_open',inFrame:false,returned:true});
 assert.equal(lost.pb.id,'hp_critical');assert.equal(lost.cd.boss_gate_open,undefined);
 assert.equal(rescued.bubble._uid,'boss_gate_open');assert.equal(rescued.cd.boss_gate_open,1800);
 assert.equal(rescued.pb.id,'hp_critical');assert.equal(rescued.pb.tier,5);
 cases.push({source:name,case:'real-playFM-callback-error-and-following-event',status:'PASS',failures,currentAfterError:before,candidateAfterError:after,currentAfterEvent:lost,candidateAfterEvent:rescued});
 const a=env(p,false,false),b=env(p,true,false);a.run('update()');b.run('update()');
 assert.deepEqual(a.snap(),b.snap());assert.equal(b.snap().inFrame,false);
 assert.equal(b.snap().pb.tier,-1);assert.equal(b.snap().cd.hp_critical,1800);
 cases.push({source:name,case:'same-frame-normal-no-error-control',status:'PASS',state:b.snap()});
 sources.at(-1).candidateSha256=sha(p.candidate);
}
console.log(JSON.stringify({taskId:'QUESTNPC-inframe-flag-exception-lifetime-hb1014b',executionUTC:new Date().toISOString(),
 productionApplied:false,runtimeAccepted:false,previousCompletedRuns:0,sources,fragments:receipts,cases,
 patch:'try after _petInFrame=true; finally{_petInFrame=false} at dispatcher exit; original mid-fire reset retained',
 stubs:['AudioContext nodes/DOM synthetic; createOscillator fault, same Error object propagates','actual playFM/_petSfx/_petBubbleShow execute; playNoise and timer sinks','full dispatcher/updatePet; update guard prefix/pet call only, middle gameplay omitted','synthetic Lv501 HP5 stage4, region count4; no actual combat/audio/browser loop']
},null,2));
