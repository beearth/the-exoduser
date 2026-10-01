import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createD13DeferredReview as currentFactory} from './d13-deferred-contract-candidate.mjs';
import {createFixture,hash,sourceEvidence} from './d13-deferred-contract-fixture.mjs';
const root=new URL('../../../',import.meta.url);
const beforePath='outputs/team-review-20261002/four-candidate-acceptance/d13-deferred-contract-candidate.mjs.before';
const beforeText=fs.readFileSync(new URL(beforePath,root),'utf8');
const {createD13DeferredReview:beforeFactory}=await import('data:text/javascript;base64,'+Buffer.from(beforeText).toString('base64'));
const currentText=fs.readFileSync(new URL('./d13-deferred-contract-candidate.mjs',import.meta.url),'utf8');
function fixture(factory,onCallback) {
  const raw=createFixture(),events=[];
  const review=factory({enabled:true,reviewOnly:true,onOriginalTrapKill:event=>{events.push(event);onCallback?.({raw,review,events,event});}});
  raw.context.review=review;
  const getZones=()=>raw.context.G._fireZones;
  const activate=review.wrapOriginalTrap(raw.activate,getZones);
  const loop=review.wrapZonePass(raw.reviewLoop,getZones);
  const start=(x=100)=>{raw.context.P.x=x;raw.context.P._gcCd=0;activate();const zone=getZones().at(-1);zone._tickTimer=24;return zone;};
  const first=start(),second=start(1000);raw.context.ens.push({...createFixture().enemy,x:1000,kb:{x:0,y:0}});
  return {...raw,review,events,getZones,start,loop,first,second};
}
function transitions(factory,expected) {
  return ['clear','replace'].map(mode=>{
    const test=fixture(factory,({raw,review,events})=>{if(events.length===1){if(mode==='clear')review.clear();else raw.context.G._fireZones=[];}});
    test.loop();assert.equal(test.events.length,expected);return {mode,callbacks:test.events.length,expected:1,kills:test.context.G.kills};
  });
}
if(process.argv.includes('--red-current')){
  assert.equal(hash(currentText),hash(beforeText));
  console.log(JSON.stringify({utc:new Date().toISOString(),currentImport:'기존 실제 후보',sha256:hash(currentText),red:transitions(currentFactory,2)},null,2));
}else{
  const red=transitions(beforeFactory,2),rows=[];
  const check=(name,run)=>{run();rows.push({name,status:'PASS'});};
  check('root before 고정 반례/current 두 전환 PASS',()=>assert.deepEqual(transitions(currentFactory,1).map(row=>row.callbacks),[1,1]));
  for(const mode of ['clear','replace'])check(`${mode} 후 새 등록 상태 보존`,()=>{
    let fresh=null;
    const test=fixture(currentFactory,({raw,review,events})=>{if(events.length===1){if(mode==='clear')review.clear();else raw.context.G._fireZones=[];fresh={...test.first,x:2000,t:0,_tickTimer:24};assert.equal(review.recordOriginal(fresh,{}),true);raw.context.G._fireZones.push(fresh);}});
    test.loop();assert.equal(test.events.length,1);assert.equal(test.review.inspectSource(fresh).kind,'original');
    test.context.ens=[{...createFixture().enemy,x:2000,kb:{x:0,y:0}}];test.loop();assert.equal(test.events.length,2);assert.equal(test.events[1].zone,fresh);
  });
  check('같은 배열 callback 신규 등록은 삭제0/다음 pass 소비',()=>{
    let fresh=null;
    const test=fixture(currentFactory,({raw,review,events})=>{if(events.length===1){fresh={...test.first,x:2000,t:0,_tickTimer:24};assert.equal(review.recordOriginal(fresh,{}),true);raw.context.G._fireZones.push(fresh);}});
    test.loop();assert.equal(test.events.length,2);assert.equal(fresh.t,0);assert.equal(test.review.inspectSource(fresh).kind,'original');
    test.context.ens=[{...createFixture().enemy,x:2000,kb:{x:0,y:0}}];test.loop();assert.equal(test.events.length,3);
  });
  check('callback 재진입은 원 pass 실행 전 거부/외부큐 보존',()=>{
    let ran=0;
    const test=fixture(currentFactory,({review,events})=>{if(events.length===1)review.wrapZonePass(()=>{ran++;},test.getZones)();});
    test.loop();assert.equal(ran,0);assert.equal(test.events.length,2);assert.equal(test.review.inspect().callbackErrors.length,1);
    assert.match(test.review.inspect().callbackErrors[0].message,/재진입/);test.loop();assert.equal(test.events.length,2);
  });
  check('callback 예외만 있으면 기존 FIFO 계속/예외 식별',()=>{
    const reason=new Error('callback fixture');const test=fixture(currentFactory,({events})=>{if(events.length===1)throw reason;});test.loop();assert.equal(test.events.length,2);assert.equal(test.review.inspect().callbackErrors[0],reason);
  });
  for(const mode of ['clear','replace'])check(`${mode} 후 callback 예외는 stale 중단`,()=>{
    const reason=new Error('transition fixture');const test=fixture(currentFactory,({raw,review,events})=>{if(events.length===1){if(mode==='clear')review.clear();else raw.context.G._fireZones=[];throw reason;}});test.loop();assert.equal(test.events.length,1);assert.equal(test.review.inspect().callbackErrors[0],reason);
  });
  check('원 pass 안 clear→새 등록을 종료 guard가 지우지 않음',()=>{
    const test=fixture(currentFactory);let fresh=null;
    test.context.checkRooms=()=>{test.review.clear();fresh={...test.first,type:'spikeTrap',x:3000,t:0,_tickTimer:0};assert.equal(test.review.recordOriginal(fresh,{}),true);};
    test.loop();assert.equal(test.events.length,0);assert.equal(test.review.inspectSource(fresh).kind,'original');
  });
  check('원 pass 배열 교체→새 등록을 종료 guard가 지우지 않음',()=>{
    const test=fixture(currentFactory);let fresh=null;
    test.context.checkRooms=()=>{fresh={...test.first,x:3000,t:0,_tickTimer:0};test.context.G._fireZones=[fresh];assert.equal(test.review.recordOriginal(fresh,{}),true);};
    test.loop();assert.equal(test.events.length,0);assert.equal(test.review.inspectSource(fresh).kind,'original');
  });
  check('before/current 원 피해/상태·순서·RNG 동일',()=>{
    const old=fixture(beforeFactory),updated=fixture(currentFactory);old.loop();updated.loop();
    assert.deepEqual(JSON.parse(JSON.stringify(updated.context.ens)),JSON.parse(JSON.stringify(old.context.ens)));
    assert.deepEqual(JSON.parse(JSON.stringify(updated.context.G)),JSON.parse(JSON.stringify(old.context.G)));
    assert.deepEqual(updated.rng,old.rng);assert.deepEqual(JSON.parse(JSON.stringify(updated.effects)),JSON.parse(JSON.stringify(old.effects)));
    assert.equal(updated.getZones()[0],updated.first);assert.equal(updated.getZones()[1],updated.second);assert.equal(updated.events.length,2);
  });
  check('동기 this/인수/반환/원 예외·호출1 보존',()=>{
    const review=currentFactory({enabled:true,reviewOnly:true}),receiver={},argument={},sentinel={},reason=new Error('original'),zones=[];let calls=0;
    assert.equal(review.wrapZonePass(function(value){calls++;assert.equal(this,receiver);assert.equal(value,argument);return sentinel;},()=>zones).call(receiver,argument),sentinel);
    assert.equal(calls,1);assert.throws(review.wrapZonePass(()=>{throw reason;},()=>zones),error=>error===reason);assert.equal(review.inspect().inPass,false);
  });
  check('기본 비활성 원 pass만 실행/callback0',()=>{let calls=0;const review=currentFactory({onOriginalTrapKill(){throw Error('disabled');}});assert.equal(review.wrapZonePass(()=>{calls++;return 7;})(),7);assert.equal(calls,1);assert.equal(review.runtimeReady,false);});
  const metadata={...sourceEvidence,zoneBlock:{sha256:sourceEvidence.zoneBlock.sha256,bytes:sourceEvidence.zoneBlock.bytes,line:sourceEvidence.zoneBlock.line},callsite:sourceEvidence.callsite};
  console.log(JSON.stringify({utc:new Date().toISOString(),beforeImportRed:red,currentPass:rows.length,fail:0,rows,beforePath,beforeSha256:hash(beforeText),currentSha256:hash(currentText),sourceEvidence:metadata,productionApplied:false,fixtureScope:'기존 실제 full hurtE/장판블록 fixture 재사용. 새 child payload/밸런스 결정0'},null,2));
}
