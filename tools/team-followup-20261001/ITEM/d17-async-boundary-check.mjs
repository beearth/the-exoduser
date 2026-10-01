import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {extract} from './binding-save-harness.mjs';
import {createD17LifecycleReview as createOld} from './d17-lifecycle-roll-candidate.mjs';
import {createD17LifecycleReview as createNew} from './d17-async-boundary-candidate.mjs';
const source=fs.readFileSync(new URL('../../../game.html',import.meta.url),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const owned=new URL('./',import.meta.url);
const oldRegression=fs.readFileSync(new URL('d17-lifecycle-roll-check.mjs',owned),'utf8');
assert.equal(fs.readFileSync(new URL('d17-async-boundary-check-regression.mjs',owned),'utf8'),oldRegression.replace("from './d17-lifecycle-roll-candidate.mjs'","from './d17-async-boundary-candidate.mjs'"));
const preservationFile=new URL('d17-async-boundary-evidence.json',owned);
let preservedFiles=null;
if(fs.existsSync(preservationFile)){
  const before=JSON.parse(fs.readFileSync(preservationFile,'utf8')).preservation.before;
  for(const [name,expected]of Object.entries(before))assert.equal(hash(fs.readFileSync(new URL(name,owned))),expected,name);
  preservedFiles=Object.keys(before).length;
}
const functions=['fireBlackStar','activateSpikeTrap'].map(name=>({name,text:extract(source,name)}));
const deferred=()=>{let resolve,reject;const promise=new Promise((success,failure)=>{resolve=success;reject=failure;});return {promise,resolve,reject};};
function fixture(factory=createNew,flags={enabled:true,reviewOnly:true}) {
  const noop=()=>{};
  const context=vm.createContext({P:{x:100,y:0,skills:{spikeTrap:2,blackStar:1},_bsX:0,_bsY:0,iframes:0},G:{mats:100,slowMo:0,_fireZones:[]},_charIdx:0,ens:[],EL:{P:1},OPT:{hitStop:100},_HS:{blackStar:1},ultUnmute:noop,_cdRed:()=>0,poolPart:noop,dst:Math.hypot,SFX:{detonate:noop},shake:noop,addTxt:noop,_T:value=>value,_isFused:()=>false,_malCost:value=>value,_addSkProf:noop,_spikeTrapDmg:()=>77,playSample:noop,_r:()=>1});
  vm.runInContext(functions.map(entry=>entry.text).join('\n'),context);
  let trapCalls=0,blackCalls=0,rollReads=0;
  const runtime=factory({...flags,getPlayer:()=>context.P,getCharacterKey:()=>context._charIdx,getZones:()=>context.G._fireZones,
    getEquippedHelmet:()=>{rollReads++;return {uniqueId:'UI-17',slot:'helmet',uniqueRoll:{version:1,effectId:'U-D17',stat:'_uBlackZoneGather',unit:'count',storedValue:3}};},
    fireBlackStar(...args){blackCalls++;return Reflect.apply(context.fireBlackStar,this,args);},
    activateSpikeTrap(...args){trapCalls++;return Reflect.apply(context.activateSpikeTrap,this,args);}});
  const trap=()=>{context.P._gcCd=0;runtime.activateSpikeTrap();return context.G._fireZones.at(-1);};
  const cast=()=>{context.P._bsCasting=true;runtime.fireBlackStar();};
  return {context,runtime,trap,cast,counts:()=>({trapCalls,blackCalls,rollReads})};
}
const oldFailures=[];
{
  const test=fixture(createOld),gate=deferred();const result=test.runtime.wrapBoundary(()=>gate.promise)();
  const zone=test.trap();test.cast();assert.equal(zone.x,0);
  oldFailures.push({case:'pending 중 신규 출처 재등록 및 이동',expectedX:100,actualX:zone.x,verdict:'기존 후보 FAIL 재현'});
  gate.resolve();await result;
}
{
  const test=fixture(createOld),gate=deferred();const late=test.runtime.wrapBoundary(()=>gate.promise)();
  await test.runtime.wrapBoundary(async()=>{})();
  const zone=test.trap();gate.resolve();await late;test.cast();assert.equal(zone.x,100);
  oldFailures.push({case:'A pending/B 완료 뒤 새 provenance를 A finally가 삭제',expectedX:0,actualX:zone.x,verdict:'기존 후보 FAIL 재현'});
}
const passed=[];
async function check(name,run){await run();passed.push(name);}
for(const first of ['resolve','reject'])for(const second of ['resolve','reject'])for(const reverse of [false,true])await check(`A/B ${first}/${second} ${reverse?'역순':'정순'}`,async()=>{
  const test=fixture(),gates=[deferred(),deferred()];
  const outputs=gates.map(gate=>test.runtime.wrapBoundary(()=>gate.promise)().then(value=>({value}),error=>({error})));
  assert.equal(test.runtime.getPendingCount(),2);const zone=test.trap();test.cast();assert.equal(zone.x,100);assert.equal(test.counts().rollReads,0);
  const order=reverse?[1,0]:[0,1],modes=[first,second];
  for(const index of order){const reason=new Error(`boundary-${index}`);gates[index][modes[index]](modes[index]==='reject'?reason:index);const outcome=await outputs[index];if(modes[index]==='reject')assert.equal(outcome.error,reason);else assert.equal(outcome.value,index);
    if(test.runtime.getPendingCount()){const another=test.trap();test.cast();assert.equal(another.x,100);}}
  assert.equal(test.runtime.getPendingCount(),0);test.cast();assert.equal(zone.x,100);const fresh=test.trap();test.cast();assert.equal(fresh.x,0);
});
await check('pending 생성/시전/등록 원동작 횟수와 상태',async()=>{
  const test=fixture(),gate=deferred(),result=test.runtime.wrapBoundary(()=>gate.promise)();
  const zone=test.trap(),before={...zone};const storm={type:'storm',x:200,y:0,t:1,maxT:600};test.context.G._fireZones.push(storm);
  assert.equal(test.runtime.onHellRayStormCreated(storm),false);assert.equal(test.runtime.onMaliceStormOriginalCreated(storm),false);
  assert.equal(test.runtime.onInfernoSlamFixedCreated({type:'fireAura',follow:false}),false);
  test.cast();assert.deepEqual({...zone},before);assert.equal(test.counts().trapCalls,1);assert.equal(test.counts().blackCalls,1);assert.equal(test.counts().rollReads,0);
  assert.equal(test.context.P._bsCd,7200);assert.equal(test.context.P._bsCasting,false);
  gate.resolve(7);assert.equal(await result,7);test.cast();assert.equal(zone.x,100);assert.equal(storm.x,200);
});
for(const change of ['clear','player','character','zones'])for(const reject of [false,true])await check(`${change} 뒤 늦은 ${reject?'reject':'resolve'}`,async()=>{
  const test=fixture(),gate=deferred(),result=test.runtime.wrapBoundary(()=>gate.promise)().then(()=>null,error=>error);
  const blocked=test.trap();test.runtime.clear();assert.equal(test.runtime.getPendingCount(),1);
  if(change==='player')test.context.P={...test.context.P,x:250,_gcCd:0};
  if(change==='character')test.context._charIdx=1;
  if(change==='zones')test.context.G._fireZones=[blocked];
  test.cast();assert.equal(blocked.x,100);
  gate[reject?'reject':'resolve'](reject?new Error('late'):9);await result;
  const fresh=test.trap();test.cast();assert.equal(fresh.x,0);assert.equal(blocked.x,100);fresh.x=80;
  await Promise.resolve();test.cast();assert.equal(fresh.x,0);
});
await check('clear는 진행중 경계 취소하지 않음/중첩 동기원함수',async()=>{
  const test=fixture(),gate=deferred();const outer=test.runtime.wrapBoundary(function(){test.runtime.wrapBoundary(()=>23)();test.runtime.clear();const zone=test.trap();test.cast();assert.equal(zone.x,100);return gate.promise;});
  const output=outer();assert.equal(test.runtime.getPendingCount(),1);gate.resolve();await output;assert.equal(test.runtime.getPendingCount(),0);
});
await check('원함수 this/인수/동기반환 identity/호출1',()=>{
  const test=fixture(),receiver={},argument={},value={};let count=0;
  const wrapped=test.runtime.wrapBoundary(function(actual){count++;assert.equal(this,receiver);assert.equal(actual,argument);return value;});
  assert.equal(wrapped.call(receiver,argument),value);assert.equal(count,1);assert.equal(test.runtime.getPendingCount(),0);
});
await check('동기 예외 identity/호출1 및 후속 회복',()=>{
  const test=fixture(),reason=new Error('sync');let count=0;
  assert.throws(test.runtime.wrapBoundary(()=>{count++;throw reason;}),error=>error===reason);
  assert.equal(count,1);assert.equal(test.runtime.getPendingCount(),0);const zone=test.trap();test.cast();assert.equal(zone.x,0);
});
await check('native Promise identity는 별개/결과 this 인수 보존',async()=>{
  const test=fixture(),gate=deferred(),receiver={},argument={};let count=0;
  const wrapped=test.runtime.wrapBoundary(function(value){assert.equal(this,receiver);assert.equal(value,argument);count++;return gate.promise;});
  const output=wrapped.call(receiver,argument);assert.notEqual(output,gate.promise);const value={};gate.resolve(value);assert.equal(await output,value);assert.equal(count,1);
});
await check('then getter1/then 호출1/receiver/비동기 동화',async()=>{
  const test=fixture();let getterCalls=0,thenCalls=0;const value={};
  const thenable={get then(){getterCalls++;return function(resolve){thenCalls++;assert.equal(this,thenable);resolve(value);};}};
  const output=test.runtime.wrapBoundary(()=>thenable)();assert.equal(getterCalls,1);assert.equal(thenCalls,0);assert.equal(test.runtime.getPendingCount(),1);
  assert.equal(await output,value);assert.equal(getterCalls,1);assert.equal(thenCalls,1);assert.equal(test.runtime.getPendingCount(),0);
});
await check('throwing then getter는 동기 예외/경계 해제',()=>{
  const test=fixture(),reason=new Error('getter');let count=0;
  const value={get then(){count++;throw reason;}};
  assert.throws(test.runtime.wrapBoundary(()=>value),error=>error===reason);assert.equal(count,1);assert.equal(test.runtime.getPendingCount(),0);
});
await check('then 비함수 객체 반환 identity',()=>{const test=fixture(),value={then:3};assert.equal(test.runtime.wrapBoundary(()=>value)(),value);assert.equal(test.runtime.getPendingCount(),0);});
await check('then 호출 예외/다중 resolve/reject',async()=>{
  const test=fixture(),reason=new Error('then');await assert.rejects(test.runtime.wrapBoundary(()=>({then(){throw reason;}}))(),error=>error===reason);
  assert.equal(await test.runtime.wrapBoundary(()=>({then(resolve,reject){resolve(11);resolve(22);reject(reason);throw reason;}}))(),11);assert.equal(test.runtime.getPendingCount(),0);
});
await check('pending/ready 원 생성·종료 this/인수/반환·예외',async()=>{
  const player={_bsCasting:false},zones=[],receiver={},argument={},sentinel={},reason=new Error('original');
  let calls=0,throwing=false;
  const original=function(value){calls++;assert.equal(this,receiver);assert.equal(value,argument);if(throwing)throw reason;return sentinel;};
  const runtime=createNew({enabled:true,reviewOnly:true,getPlayer:()=>player,getCharacterKey:()=>0,getZones:()=>zones,getEquippedHelmet:()=>null,fireBlackStar:original,activateSpikeTrap:original});
  for(const pending of [false,true]){
    const gate=deferred(),output=pending?runtime.wrapBoundary(()=>gate.promise)():null;
    for(const name of ['fireBlackStar','activateSpikeTrap']){
      throwing=false;assert.equal(runtime[name].call(receiver,argument),sentinel);
      throwing=true;assert.throws(()=>runtime[name].call(receiver,argument),error=>error===reason);
    }
    if(pending){gate.resolve();await output;}
  }
  assert.equal(calls,8);
});
await check('정착 후 microtask 후속 경계 token 분리',async()=>{
  const test=fixture(),first=deferred(),second=deferred();
  const output=test.runtime.wrapBoundary(()=>first.promise)();first.resolve(1);assert.equal(await output,1);
  const fresh=test.trap();test.cast();assert.equal(fresh.x,0);
  const later=test.runtime.wrapBoundary(()=>second.promise)();fresh.x=80;await Promise.resolve();test.cast();assert.equal(fresh.x,80);
  assert.equal(test.runtime.getPendingCount(),1);second.resolve(2);assert.equal(await later,2);
  test.cast();assert.equal(fresh.x,80);const newest=test.trap();test.cast();assert.equal(newest.x,0);
});
for(const flags of [{},{enabled:true},{reviewOnly:true}])await check('기본/한쪽 opt-in 비활성',async()=>{const test=fixture(createNew,flags),gate=deferred(),result=test.runtime.wrapBoundary(()=>gate.promise)();const zone=test.trap();test.cast();gate.resolve();await result;test.cast();assert.equal(zone.x,100);assert.equal(test.runtime.runtimeReady,false);});
console.log(JSON.stringify({utc:new Date().toISOString(),oldFailures,newChecks:passed.length,newStatus:'PASS',passed,preservedFiles,regressionImportOnly:true,gameSha256:hash(source),functions:functions.map(({name,text})=>({name,sha256:hash(text)}))},null,2));
