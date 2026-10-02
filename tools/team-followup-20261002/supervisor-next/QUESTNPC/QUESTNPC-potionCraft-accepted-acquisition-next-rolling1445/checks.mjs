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


const taskId='QUESTNPC-potionCraft-after-accepted-acquisition-rolling1445',startUTC=new Date().toISOString(),patches=[];
function make(n,fixed){
 const p=parts(n),s=fs.readFileSync(p.file,'utf8'),old=p.full.split('\n').find(l=>l.includes("if(!_petTut.potionCraft&&P.lv>=100)"));
 assert.ok(old);const marker='_petTut.potionCraft=true;',start=old.indexOf("_petSayCD("),end=old.lastIndexOf(';return}');
 const call=old.slice(start,end);
 const next=old.slice(0,old.indexOf('{'))+'{if('+call+'){_petTut.potionCraft=true;return}}';
 assert.equal(p.full.split(old).length,2);
 const full=p.full.replace(old,next);if(fixed)p.full=full;
 const e=env(p,false,false),pickup=fn(p.file,s,'pickupItem');
 const diff=s.split('\n').find(l=>l.startsWith('const _diffSigned='));
 e.run(diff+'\n'+pickup);
 e.run("G.stage=0;G.bossAlive=false;G._bossRef=null;G.mats=20;SI_TO_HELL={0:0,1:0};P.lv=100;P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.s='move';P.sp=0;P.ap=0;P.rage=0;INV.equipped={weapon:{id:'existing',rarity:1}};var ULT_SLOT=null;for(const k in _petTut)_petTut[k]=true;_petTut.potionCraft=false;_petParryCnt=10;_petStageEnv[0]=true;_petDlgCD.chapter_0=999999;var tick=0,shows=[],requests=[],sfxCalls=[],pickSinks={sound:0,notify:0,lesson:0,save:0};function _itemSz(){return [1,1]}function _invFindSpace(){return {x:0,y:0}}function playItemPickupSfx(){pickSinks.sound++}function notify(){pickSinks.notify++}function _rarName(){return 'Rare'}function dbSaveForce(){pickSinks.save++}window._systemLesson={pickedUp(){pickSinks.lesson++}};Date.now=()=>1700000000000;const _rawShow=_petBubbleShow;_petBubbleShow=function(...a){const out=_rawShow(...a);shows.push({tick,who:a[0],text:a[1],domText:dom.petBubbleTxt?.textContent,opacity:dom.petSubtitle?.style.opacity});return out};const _rawCD=_petSayCD;_petSayCD=function(...a){const out=_rawCD(...a);if(a[0]==='tut_potionCraft'||a[0]==='item_pickup')requests.push({tick,id:a[0],returned:out});return out};const _rawSfx=_petSfx;_petSfx=function(...a){const out=_rawSfx(...a);sfxCalls.push({tick,args:a});return out};");
 const step=k=>e.run('for(let i=0;i<'+k+';i++){tick++;G.frame++;updatePet();}');
 const state=()=>JSON.parse(e.run('JSON.stringify({tick,potionCraft:_petTut.potionCraft,bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,dom,requests,shows,sfxCalls,pickSinks,bagIds:INV.bag.map(i=>i.id),inFrame:_petInFrame,pb:_PB})'));
 const at=s.indexOf(old);return {...e,step,state,patch:{file:p.file,inputSHA:sha(s),helper:'_checkPetDialogue',line:s.slice(0,at).split('\n').length,old,next,oldSHA:sha(old),newSHA:sha(next),candidateHTMLSHA:sha(s.replace(old,next)),inverseByteExact:s.replace(old,next).replace(next,old)===s}};
}
for(const n of ['game.html','game-easy-test.html']){
 let a=make(n,false),b=make(n,true);patches.push(b.patch);
 for(const x of [a,b])assert.equal(x.run("pickupItem({id:'new-rarity3',slot:'weapon',name:'fixture',rarity:3})"),true);
 assert.deepEqual(a.state(),b.state());assert.equal(b.state().requests[0].returned,true);
 for(const x of[a,b])x.step(1);
 const originalRejected=a.state(),candidateRejected=b.state();
 assert.equal(originalRejected.potionCraft,true);assert.equal(candidateRejected.potionCraft,false);
 assert.equal(originalRejected.requests.at(-1).returned,false);assert.equal(candidateRejected.requests.at(-1).returned,false);
 assert.equal(originalRejected.cd.tut_potionCraft,undefined);assert.equal(candidateRejected.cd.tut_potionCraft,undefined);
 for(const x of[a,b])x.step(479);
 const oldAt480=a.state(),newAt480=b.state();
 assert.equal(oldAt480.requests.filter(r=>r.id==='tut_potionCraft'&&r.returned).length,0);
 assert.equal(newAt480.requests.filter(r=>r.id==='tut_potionCraft'&&r.returned).length,1);
 assert.equal(newAt480.potionCraft,true);assert.equal(newAt480.bubble.t,300);assert.equal(newAt480.bubble.pair.mt,240);
 assert.equal(newAt480.cd.tut_potionCraft,599940);assert.equal(newAt480.tiers[1],720);
 assert.deepEqual(newAt480.pickSinks,oldAt480.pickSinks);assert.deepEqual(newAt480.bagIds,oldAt480.bagIds);
 for(const x of[a,b])x.step(541);
 const done=b.state();assert.equal(done.requests.filter(r=>r.id==='tut_potionCraft'&&r.returned).length,1);
 assert.equal(done.shows.filter(r=>r.text==='G. 대장간에서 물약도 제작할 수 있다.').length,1);
 assert.equal(done.shows.filter(r=>r.text==='악의로 물약 만들어! G키야!').length,1);
 assert.equal(done.dom.petSubtitle.style.opacity,'0');assert.equal(done.bubble.pair,null);
 cases.push({file:n,case:'accepted pickup -> next guide rejection -> natural later acceptance and pair lifetime',status:'PASS',originalRejected,candidateRejected,oldAt480,newAt480,done});
 a=make(n,false);b=make(n,true);for(const x of[a,b])x.step(1);assert.deepEqual(a.state(),b.state());for(const x of[a,b])x.step(541);assert.deepEqual(a.state(),b.state());
 cases.push({file:n,case:'fresh successful guide full caller/DOM/pair/expiry exact normal control',status:'PASS',normal:b.state()});
 a=make(n,false);b=make(n,true);for(const x of[a,b]){x.run('_petTierCD[1]=2');x.step(1)}
 assert.equal(a.state().potionCraft,true);assert.equal(b.state().potionCraft,false);b.step(1);assert.equal(b.state().requests.at(-1).returned,true);
 cases.push({file:n,case:'T1 cooldown rejection remains eligible; next clock tick accepts once',status:'PASS',original:a.state(),candidate:b.state()});
 for(const input of ['level99','level201','stage1','gameOff']){
 a=make(n,false);b=make(n,true);for(const x of[a,b]){x.run(input==='level99'?'P.lv=99':input==='level201'?'P.lv=201':input==='stage1'?'G.stage=1;_petDlgCD.chapter_0=999999':'G.on=false');x.step(2)}
 assert.deepEqual(a.state(),b.state());assert.equal(b.state().requests.length,0);
 cases.push({file:n,case:'ineligible '+input,status:'PASS',normal:b.state()});
 }
}
console.log(JSON.stringify({taskId,startUTC,endUTC:new Date().toISOString(),sources:[...new Map(sources.map(x=>[x.file,x])).values()],fragments:[...new Map(receipts.map(x=>[x.file+'|'+x.name+'|'+x.sha256,x])).values()],patches,cases,newCaseGroups:cases.length,productionWrites:0,sharedDocsWrites:0,newFiles:0,previousCompletedFixtureRuns:0,nativeAccepted:false,scope:'New potionCraft next-guide boundary only; actual pickupItem, SayCD/Say/bubble DOM helper/audio helper, whole updatePet and whole checkPetDialogue invoked. Earlier tutorial flags are preseeded, movement/layout/notification/lesson/save/audio primitives and leaf DOM are doubles. Whole update, native acquisition/input/DOM/audio/save and speech-complete acceptance not claimed.'},(key,value)=>key==='requests'&&Array.isArray(value)&&value.length>8?{total:value.length,sha256:sha(JSON.stringify(value)),accepted:value.filter(x=>x.returned),rejectedCount:value.filter(x=>!x.returned).length,first:value.slice(0,3),last:value.slice(-3)}:value));
