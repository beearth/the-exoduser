import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=x=>createHash('sha256').update(x).digest('hex');
const fragments=[],sources=[],cases=[];
function extract(file,s,name,start,end){
 const a=s.indexOf(start);assert.ok(a>=0);assert.equal(s.indexOf(start,a+start.length),-1);
 const b=end?s.indexOf(end,a+start.length):s.indexOf('\n',a);assert.ok(b>a);
 const t=s.slice(a,b);fragments.push({file,name,fromLine:s.slice(0,a).split('\n').length,toLine:s.slice(0,b-1).split('\n').length,sha256:sha(t)});return t;
}
function fn(file,s,name){
 const a=s.indexOf('function '+name+'(');assert.ok(a>=0);assert.equal(s.indexOf('function '+name+'(',a+1),-1);
 let d=0,mode='',begin=s.indexOf('{',a);
 for(let i=begin;i<s.length;i++){
  let c=s[i],n=s[i+1];
  if(mode==='line'){if(c==='\n')mode='';continue}
  if(mode==='block'){if(c==='*'&&n==='/'){mode='';i++}continue}
  if(mode){if(c==='\\'){i++;continue}if(c===mode)mode='';continue}
  if(c==='/'&&n==='/'){mode='line';i++;continue}if(c==='/'&&n==='*'){mode='block';i++;continue}
  if(c==="'"||c==='"'||c.charCodeAt(0)===96){mode=c;continue}
  if(c==='{')d++;if(c==='}'&&--d===0){const t=s.slice(a,i+1);fragments.push({file,name,fromLine:s.slice(0,a).split('\n').length,toLine:s.slice(0,i).split('\n').length,sha256:sha(t)});return t}
 }throw Error('function boundary missing '+name);
}
function parts(name){
 const file=root+'/'+name,s=fs.readFileSync(file,'utf8');sources.push({file,sha256:sha(s)});
 const init=extract(file,s,'bubble and CD','const _petBubble=','// 튜토리얼 플래그');
 const priority=extract(file,s,'priority state','const _PET_TIER_COOL=','// id → 티어 추론');
 const mode=extract(file,s,'URL QA mode',"const _MAP_QA_MODE=");
 const event=extract(file,s,'real gate-open caller block','  // ═══ 지옥문 개방:','  if(!G.stageCleared&&G.exits.length>0');
 const functions=Object.fromEntries(['_petTierOf','_petSay','_petSayCD','_petBidCD','_petSayUrgent','_petFireBid'].map(n=>[n,fn(file,s,n)]));
 assert.ok(!functions._petSayUrgent.includes('if(_MAP_QA_MODE)'));assert.ok(!functions._petFireBid.includes('if(_MAP_QA_MODE)'));
 const urgent=functions._petSayUrgent.replace('{','{\n  if(_MAP_QA_MODE)return false;');
 const fire=functions._petFireBid.replace('{','{\n  if(_MAP_QA_MODE){_PB.tier=-1;_PB.weight=0;return}');
 return {file,init,priority,mode,event,functions,urgent,fire};
}
function env(p,qa,candidate,consumerOnly=false){
 const ctx=vm.createContext({URLSearchParams});
 vm.runInContext(`
 var window={location:{search:'?stage=4&combatqa=1${qa?'&mapqa=1':''}'}};
 var G={stage:4,bossAlive:true,_bossArena:false,_bossUnlocked:false,_regions:{}},P={x:0,y:0};
 var _DEMO_MODE=false,_DEMO_LAST_STAGE=3,_shDirty=false,_mmDirty=0;
 var trace={shows:[],sfx:[],gate:0,victory:0};
 function _T(t){return t}function _L(ko,en){return ko}
 function _petBubbleShow(who,txt){trace.shows.push({who,txt})}function _petSfx(who,urgent){trace.sfx.push({who,urgent})}
 function _regionClearedCount(){return 4}function addTxt(){trace.gate++}
 var SFX={victory(){trace.victory++}};
 `,ctx);
 const f={...p.functions};if(candidate&&!consumerOnly)f._petSayUrgent=p.urgent;if(candidate)f._petFireBid=p.fire;
 vm.runInContext([p.mode,p.init,p.priority,...Object.values(f),'function event(){'+p.event+'}'].join('\n'),ctx);
 const run=t=>vm.runInContext(t,ctx);
 const state=()=>JSON.parse(run('JSON.stringify({bubble:_petBubble,cd:_petDlgCD,tiers:_petTierCD,pb:_PB,inFrame:_petInFrame,trace,unlocked:G._bossUnlocked})'));
 // Synthetic pre-existing speech is produced by real _petSay, not a forged bubble/CD.
 assert.equal(run("_petSay('tut_start','crow','synthetic existing speech',5,'cat','synthetic old pair',4)"),true);
 return {run,state};
}
function dialogue(s){return {bubble:s.bubble,cd:s.cd,tiers:s.tiers,shows:s.trace.shows,sfx:s.trace.sfx}}
for(const name of ['game.html','game-easy-test.html']){
 const p=parts(name),old=env(p,true,false),fixed=env(p,true,true);
 const initial=fixed.state();assert.deepEqual(old.state(),initial);
 for(const e of [old,fixed])e.run('event()');
 const before=old.state(),after=fixed.state();
 assert.equal(before.bubble._uid,'boss_gate_open');assert.equal(before.bubble.t,240);
 assert.equal(before.cd.boss_gate_open,1800);assert.deepEqual(before.tiers,[300,300,300,300,300,0]);
 assert.equal(before.trace.shows.length-initial.trace.shows.length,1);
 assert.equal(before.trace.sfx.length-initial.trace.sfx.length,1);
 assert.deepEqual(dialogue(after),dialogue(initial));assert.equal(after.unlocked,true);
 cases.push({source:name,case:'mapqa-external-urgent-caller',status:'PASS',initial,current:before,candidate:after});
 // Existing SayCD/BidCD guards are controls for the same suppression contract.
 const ordinary=env(p,true,false),os=ordinary.state();
 assert.equal(ordinary.run("_petSayCD('qa_control','crow','synthetic',1,1)"),false);
 assert.equal(ordinary.run("_petBidCD('qa_control','crow','synthetic',1,1)"),false);
 assert.deepEqual(ordinary.state(),os);
 // Consumer isolation: queued T5 comes from actual original urgent in QA mode.
 const consumed=env(p,true,false),drop=env(p,true,true,true);
 for(const e of [consumed,drop])e.run('_petInFrame=true;event()');
 assert.deepEqual(consumed.state(),drop.state());const queued=drop.state();assert.equal(queued.pb.tier,5);
 for(const e of [consumed,drop])e.run('_petFireBid()');
 assert.equal(consumed.state().bubble._uid,'boss_gate_open');
 assert.deepEqual(dialogue(drop.state()),dialogue(queued));assert.equal(drop.state().pb.tier,-1);assert.equal(drop.state().pb.weight,0);
 cases.push({source:name,case:'same-QA-urgent-slot-consumer',status:'PASS',queued,current:consumed.state(),candidate:drop.state()});
 // Required normal QA=false control, external interrupt and queued consumption.
 for(const queuedMode of [false,true]){
  const a=env(p,false,false),b=env(p,false,true);
  for(const e of [a,b]){if(queuedMode)e.run('_petInFrame=true');e.run('event()');if(queuedMode)e.run('_petFireBid()')}
  assert.deepEqual(a.state(),b.state());const s=b.state();
  assert.equal(s.bubble._uid,'boss_gate_open');assert.equal(s.bubble.t,240);
  assert.equal(s.bubble.pair.txt,'문 열렸어! 이제 보스 잡으러 가자!');
  assert.equal(s.cd.boss_gate_open,1800);assert.equal(s.trace.sfx.at(-1).urgent,true);
  assert.equal(s.trace.shows.some(x=>x.txt==='synthetic old pair'),false);
  cases.push({source:name,case:queuedMode?'normal-slot-control':'normal-external-control',status:'PASS',state:s});
 }
 sources.at(-1).candidateFunctions={urgentSha256:sha(p.urgent),fireSha256:sha(p.fire)};
}
console.log(JSON.stringify({taskId:'QUESTNPC-urgent-map-qa-suppression-hb1014',executionUTC:new Date().toISOString(),
 productionApplied:false,runtimeAccepted:false,previousCompletedRuns:0,sources,fragments,cases,
 stubs:['HUD/SFX sinks (actual helper calls, no audio hardware)','gate caller regionClearedCount=4, G/P are explicit synthetic inputs','URLSearchParams real mode declaration; no browser/bootstrap/full update','existing pair is synthetic text via real _petSay; no fake CD/counter mutation'],
 patch:{urgent:'if(_MAP_QA_MODE)return false;',fire:'if(_MAP_QA_MODE){_PB.tier=-1;_PB.weight=0;return}'}
},null,2));
