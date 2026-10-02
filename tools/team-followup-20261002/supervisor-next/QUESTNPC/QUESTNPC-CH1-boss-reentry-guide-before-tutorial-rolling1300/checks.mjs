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


const taskId='QUESTNPC-boss-reentry-record-before-tutorial-return-memory-v2',startUTC=new Date().toISOString(),patches=[];
function arenaSource(n){
 const p=parts(n),raw=fs.readFileSync(p.file,'utf8'),enter=fn(p.file,raw,'_enterBossArena'),capture=fn(p.file,raw,'_captureBossFieldState'),restore=fn(p.file,raw,'_restoreBossFieldState');
 const old="if(G.bossAlive&&!_petBossPrevAlive){_petBossEngage[_ch]=(_petBossEngage[_ch]||0)+1;";
 assert.equal(p.full.split(old).length,2);
 const replacement="const _petBossActive=G.bossAlive&&!!G._bossArena;\n  if(_petBossActive&&!_petBossPrevAlive){";
 const full=p.full.replace(old,replacement).replace('_petBossPrevAlive=G.bossAlive;','_petBossPrevAlive=_petBossActive;');
 const marker='G.bossAlive=true;G._bossRef=null;',hook="G.bossAlive=true;{const _petCh=SI_TO_HELL[si]||0;_petBossEngage[_petCh]=(_petBossEngage[_petCh]||0)+1;}_petBossPrevAlive=false;G._bossRef=null;";
 assert.equal(enter.split(marker).length,2);const enter2=enter.replace(marker,hook);
 patches.push({file:p.file,dispatcherOld:old,dispatcherNew:replacement,prevOld:'_petBossPrevAlive=G.bossAlive;',prevNew:'_petBossPrevAlive=_petBossActive;',enterOld:marker,enterNew:hook,dispatcherOriginalSHA:sha(p.full),dispatcherCandidateSHA:sha(full),enterOriginalSHA:sha(enter),enterCandidateSHA:sha(enter2)});
 return{p,full,enter,enter2,capture,restore};
}
function setup(r,fixed){
 const p=fixed?{...r.p,full:r.full}:r.p,e=env(p,false,false);
 e.run(r.capture+'\n'+r.restore+'\n'+(fixed?r.enter2:r.enter));
 e.run("SI_TO_HELL[0]=0;G.stage=0;G.frame=1;G.mats=100;G._bossArena=false;G.cam={x:0,y:0};G.map=[[4]];G.mw=1;G.mh=1;G.rooms=[];G.exits=[];G.spawnHoles=[];G.rifts=[];G._worms=[];G._regions=[];G.bossAlive=true;P.lv=500;P.hp=100;P.sp=0;P.ap=0;P.rage=0;P.r=8;P.s='move';_petParryCnt=10;_petBossIntroSeen[0]=true;_petDiffLast=0;var _preArenaBackup=null,MAP_OBJS=[],worldItems=[],pProjs=[],_impacts=[],_vfxAnims=[],_fireExps=[],_bossTestReq=-1,ULT_SLOT=null,_BOSS_ATHEME={0:{rc:'rgba(0,0,0,'}},STG=[{be:0}],T=16;OPT.shake=100;trace.bidIds=[];trace.gen=0;function _diffSigned(){return 0}function dst2(a,b,c,d){return(a-c)**2+(b-d)**2}function _isDruidFinale(){return false}function _recycleProj(){}function _recyclePProj(){}function genBossArena(){trace.gen++;return{map:[[4]],mw:1,mh:1,rooms:[],exitX:0,exitY:0,entryX:0,entryY:0,bossX:0,bossY:0}}function mkEn(x,y){return{x,y,alive:true,ib:true,r:8,hp:100,mhp:100}}function buildMapCache(){}function poolPart(){}function _bossSfx(){return null}function playSample(){}function safePt(x,y){return{x,y}}SFX.groggy=function(){};const __bid=_petBidCD;_petBidCD=function(...a){trace.bidIds.push(a[0]);return __bid(...a)};ens=[{alive:true,ib:false,x:1000,y:1000}];");
 const state=()=>JSON.parse(e.run("JSON.stringify({count:_petBossEngage[0]||0,prev:_petBossPrevAlive,bossAlive:G.bossAlive,arena:G._bossArena,bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,bids:trace.bidIds,gen:trace.gen})"));
 return {...e,state};
}

for(const n of ['game.html','game-easy-test.html']){
 const r=arenaSource(n),a=setup(r,false),b=setup(r,true),rounds=[];
 for(const e of[a,b])e.run('P.lv=50;_petTut.firstParry=true;_petTut.keyESC=true;');
 for(let i=1;i<=5;i++){
  for(const e of[a,b]){
   e.run('G.frame++;_enterBossArena(false);');
   if(i===2)e.run('_petAtkCnt=3;');
   if(i===3)e.run('_petAtkCnt=8;');
   if(i===4)e.run('_petChargeUsed=true;');
   if(i===5)e.run('_petHitCnt=1;');
   e.run('_checkPetDialogue()');
  }
  rounds.push({entry:i,original:a.state(),candidate:b.state()});
  assert.equal(a.state().count,0);assert.equal(b.state().count,i);
  if(i<5)for(const e of[a,b])e.run('_restoreBossFieldState(_preArenaBackup);G._bossArena=false;G.bossAlive=true;G._bossRef=null;');
 }
 for(const e of[a,b])e.run('_dtSp=1000;_updatePetBubble();_updatePetBubble();_dtSp=1;G.frame++;_checkPetDialogue()');
 assert.equal(a.state().count,1);assert.equal(a.state().bids.filter(x=>x==='boss_retry5').length,0);
 assert.equal(b.state().count,5);assert.equal(b.state().bids.filter(x=>x==='boss_retry5').length,1);
 assert.equal(b.state().cd.boss_retry5,599940);assert.equal(b.state().bubble.t,240);
 cases.push({source:n,case:'five-real-entry-events-recorded-despite-five-different-tutorial-returns',status:'PASS',rounds,originalAfterConsumer:a.state(),candidateAfterConsumer:b.state()});
 const u=setup(r,false),v=setup(r,true);
 for(const e of[u,v])e.run('_checkPetDialogue();_enterBossArena(false);_checkPetDialogue()');
 assert.deepEqual(u.state(),v.state());cases.push({source:n,case:'initial-field-to-first-entry-normal-control',status:'PASS',state:v.state()});
 const w=setup(r,true);w.run('_petBossEngage[0]=4;_enterBossArena(false);_petBubble.t=10;_checkPetDialogue()');
 assert.equal(w.state().count,5);assert.equal(w.state().bids.filter(x=>x==='boss_retry5').length,1);assert.equal(w.state().cd.boss_retry5,undefined);
 w.run('_checkPetDialogue()');assert.equal(w.state().bids.filter(x=>x==='boss_retry5').length,1);
 cases.push({source:n,case:'existing-active-bubble-refusal-consumes-once-no-new-retry-policy',status:'PASS',state:w.state()});
}
console.log(JSON.stringify({taskId,startUTC,endUTC:new Date().toISOString(),sources,fragments:receipts,patches,cases,newCaseGroups:6,productionApplied:false,runtimeAccepted:false,newFiles:0,priorFixtureRuns:0,v1CompletedTestsRerun:0},null,2));
