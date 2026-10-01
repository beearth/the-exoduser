import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {createD13DeferredReview} from './d13-deferred-contract-candidate.mjs';
import {createFixture,source,sourceEvidence,hash,zoneBlock,reviewZoneBlock} from './d13-deferred-contract-fixture.mjs';

const rows=[],observations={};
function check(name,action){action();rows.push({name,status:'PASS'});}
function prepare(options={enabled:true,reviewOnly:true}) {
  const fixture=createFixture(),callbacks=[];
  const review=createD13DeferredReview({...options,onOriginalTrapKill:event=>callbacks.push(event)});
  fixture.context.review=review;
  const getZones=()=>fixture.context.G._fireZones;
  const activate=review.wrapOriginalTrap(fixture.activate,getZones);
  const loop=review.wrapZonePass(fixture.reviewLoop,getZones);
  const start=()=>{fixture.context.P._gcCd=0;activate();const zone=getZones().at(-1);zone._tickTimer=24;return zone;};
  return {...fixture,review,callbacks,getZones,activate,loop,start};
}
function childFixture(parent){return {...parent,t:0,_tickTimer:0};}
check('즉시 push 실제 전체 루프 같은 tick 처리 재현',()=>{
  const fixture=createFixture();fixture.activate();const parent=fixture.context.G._fireZones[0];parent._tickTimer=24;
  const array=fixture.context.G._fireZones;let child=null,damageCalls=0;
  fixture.context.hurtE=function(...args){damageCalls++;const wasAlive=args[0].alive,value=Reflect.apply(fixture.hurt,this,args);if(wasAlive&&!args[0].alive){child=childFixture(parent);array.push(child);}return value;};
  fixture.loop();assert(child);assert.equal(child.t,1);assert.equal(child._tickTimer,1);assert.equal(array[1],child);assert.equal(damageCalls,1);assert.equal(fixture.enemy.alive,false);assert.equal(fixture.context._shBufI,0);
  observations.immediate={childT:child.t,childTickTimer:child._tickTimer,rngCalls:fixture.rng.length,damageCalls,hp:fixture.enemy.hp,arrayIdentity:true,claim:'같은 tick 순회·타이머/RNG 처리. 자식 틱피해 발생 주장은 아님'};
});
check('지연 callback 압축 종료후/같은 tick child 미처리',()=>{
  const fixture=createFixture();let child=null,callbackCount=0;
  const getZones=()=>fixture.context.G._fireZones,array=getZones();
  const review=createD13DeferredReview({enabled:true,reviewOnly:true,onOriginalTrapKill:event=>{
    callbackCount++;assert.equal(review.inspect().inPass,false);assert.equal(array.length,1);assert.equal(array[0],event.zone);assert.equal(event.enemy,fixture.enemy);assert.equal(fixture.context._shBufI,0);
    child=childFixture(event.zone);review.recordChild(child);array.push(child);
  }});fixture.context.review=review;review.wrapOriginalTrap(fixture.activate,getZones)();const parent=array[0];parent._tickTimer=24;
  review.wrapZonePass(fixture.reviewLoop,getZones)();assert.equal(callbackCount,1);assert.equal(child.t,0);assert.equal(child._tickTimer,0);assert.equal(getZones(),array);assert.equal(array[0],parent);
  observations.deferred={childT:child.t,childTickTimer:child._tickTimer,rngCalls:fixture.rng.length,hp:fixture.enemy.hp,arrayIdentity:true};
  assert(observations.immediate.rngCalls>fixture.rng.length);review.wrapZonePass(fixture.reviewLoop,getZones)();assert.equal(child.t,1);assert.equal(callbackCount,1);
});
check('원 피해·배열·순서·RNG 추가0 대조',()=>{
  const plain=createFixture();plain.activate();plain.context.G._fireZones[0]._tickTimer=24;plain.loop();
  const reviewed=prepare();const parent=reviewed.start(),before={...parent};reviewed.loop();assert.equal(reviewed.getZones()[0],parent);assert.equal(reviewed.callbacks.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(reviewed.enemy)),JSON.parse(JSON.stringify(plain.enemy)));
  assert.deepEqual(JSON.parse(JSON.stringify(reviewed.context.G)),JSON.parse(JSON.stringify(plain.context.G)));
  assert.deepEqual(reviewed.rng,plain.rng);assert.deepEqual(JSON.parse(JSON.stringify(reviewed.effects)),JSON.parse(JSON.stringify(plain.effects)));
  for(const key of Object.keys(before))if(!['t','_tickTimer'].includes(key))assert.equal(parent[key],before[key]);
  observations.noPayload={rngCalls:reviewed.rng.length,hp:reviewed.enemy.hp,kills:reviewed.context.G.kills,callbackCount:reviewed.callbacks.length};
});
for(const flags of [{},{enabled:true},{reviewOnly:true}])check('기본/한쪽 opt-in callback0',()=>{const fixture=prepare(flags);fixture.start();fixture.loop();assert.equal(fixture.enemy.alive,false);assert.equal(fixture.callbacks.length,0);assert.equal(fixture.review.runtimeReady,false);});
check('실제 합체 literal/원본태그 거부',()=>{
  const match=source.match(/G\._fireZones\.push\(\{[^;]*?_pillarSpike:true\}\)/);assert(match);
  const start=source.indexOf('{',match.index),ast=parseExpressionAt(source,start,{ecmaVersion:'latest'}),literal=source.slice(start,ast.end);
  sourceEvidence.fusionLiteral={text:literal,sha256:hash(literal),line:source.slice(0,start).split('\n').length};
  const fixture=prepare();fixture.context.p={x:100,y:100};fixture.context._stR=300;fixture.context._stDmg=10;fixture.context._stLv=1;
  const zone=(new Function('p','_stR','_stDmg','_stLv','EL','return '+literal))(fixture.context.p,300,10,1,{P:0});
  assert.equal(fixture.review.recordOriginal(zone,{}),false);assert.equal(fixture.review.recordFusion(zone),true);assert.equal(fixture.review.inspectSource(zone).kind,'fusion');
  zone._tickTimer=24;fixture.getZones().push(zone);fixture.loop();assert.equal(fixture.enemy.alive,false);assert.equal(fixture.callbacks.length,0);
});
check('자식/불명/직접 DOT 불발',()=>{
  for(const kind of ['child','unknown']){const fixture=prepare();fixture.activate();const zone=fixture.getZones()[0];
    fixture.review.clear();if(kind==='child')assert.equal(fixture.review.recordChild(zone),true);zone._tickTimer=24;fixture.loop();assert.equal(fixture.callbacks.length,0);assert.equal(fixture.enemy.alive,false);}
  const fixture=prepare();const zone=fixture.start();fixture.review.invokeDot(zone,fixture.hurt,undefined,[fixture.enemy,10,0,true,{dot:true,_lessonAttack:'spikeTrap'},0]);assert.equal(fixture.callbacks.length,0);
});
check('출처 재분류/합체후 변형 차단',()=>{const fixture=prepare();const zone=fixture.start();assert.equal(fixture.review.recordChild(zone),false);assert.equal(fixture.review.inspectSource(zone).kind,'original');zone._pillarSpike=true;fixture.loop();assert.equal(fixture.callbacks.length,0);});
check('동일 원본 시전 다수 처치 최대1/FIFO 신규시전',()=>{
  const fixture=prepare();fixture.start();fixture.context.ens.push({...fixture.enemy,kb:{x:0,y:0}});fixture.loop();assert.equal(fixture.context.G.kills,2);assert.equal(fixture.callbacks.length,1);
  fixture.context.ens=[{...createFixture().enemy,kb:{x:0,y:0}}];const newer=fixture.start();fixture.loop();assert.equal(fixture.callbacks.length,2);assert.equal(fixture.callbacks[1].zone,newer);
});
check('실제 압축 만료·원배열 identity·기존순서',()=>{const fixture=prepare();const parent=fixture.start(),expired={...parent,t:599,_tickTimer:0},survivor={...parent,t:10,_tickTimer:0};const array=fixture.getZones();array.unshift(expired);array.push(survivor);fixture.loop();assert.equal(fixture.getZones(),array);assert.equal(array.length,2);assert.equal(array[0],parent);assert.equal(array[1],survivor);assert.equal(fixture.callbacks.length,1);});
check('hurtE 실패/전체 pass 실패시 callback0',()=>{
  const fixture=prepare();fixture.start();const reason=new Error('fixture damage exception');fixture.context.hurtE=()=>{throw reason;};assert.throws(fixture.loop,error=>error===reason);assert.equal(fixture.callbacks.length,0);assert.equal(fixture.review.inspect().inPass,false);assert.equal(fixture.review.inspect().pending,0);
});
check('callback 실패는 원 damage/반환에 영향0',()=>{
  const fixture=createFixture(),reason=new Error('callback fixture');const review=createD13DeferredReview({enabled:true,reviewOnly:true,onOriginalTrapKill(){throw reason;}});fixture.context.review=review;
  review.wrapOriginalTrap(fixture.activate,()=>fixture.context.G._fireZones)();fixture.context.G._fireZones[0]._tickTimer=24;
  assert.equal(review.wrapZonePass(fixture.reviewLoop,()=>fixture.context.G._fireZones)(),undefined);assert.equal(fixture.enemy.alive,false);assert.equal(review.inspect().callbackErrors[0],reason);
});
check('실제 death 의존 checkRooms 대역에서 clear/배열교체 폐기',()=>{
  for(const change of ['clear','array']){const fixture=prepare();fixture.start();fixture.context.checkRooms=()=>{if(change==='clear')fixture.review.clear();else fixture.context.G._fireZones=[];};fixture.loop();assert.equal(fixture.callbacks.length,0);}
});
check('생성/피해/pass this 인수 반환·예외·1회',()=>{
  const review=createD13DeferredReview({enabled:true,reviewOnly:true}),receiver={},argument={},sentinel={};let calls=0;
  const original=function(value){assert.equal(this,receiver);assert.equal(value,argument);calls++;return sentinel;};
  const zones=[];assert.equal(review.wrapOriginalTrap(original,()=>zones).call(receiver,argument),sentinel);assert.equal(review.wrapZonePass(original,()=>zones).call(receiver,argument),sentinel);
  assert.equal(review.invokeDot({},original,receiver,[argument]),sentinel);assert.equal(calls,3);
});
check('소스 루프 전체와 단1개 호출부 치환',()=>{const replacement=sourceEvidence.callsite.replacement;assert.equal(reviewZoneBlock.replace(replacement,sourceEvidence.callsite.original),zoneBlock);assert(zoneBlock.includes('G._fireZones.length=_fzW'));assert(zoneBlock.includes('_fzi<G._fireZones.length'));});
check('실제 비처치/쉴드흡수/부활은 callback0',()=>{
  for(const mode of ['survive','shield','revive']){
    const fixture=prepare();fixture.start();
    if(mode==='survive'){fixture.enemy.hp=100;fixture.enemy.mhp=100;}
    if(mode==='shield'){fixture.enemy.eShield=100;fixture.enemy.eShieldMax=100;}
    if(mode==='revive'){fixture.enemy.etype=87;fixture.enemy.mhp=20;}
    fixture.loop();assert.equal(fixture.enemy.alive,true);assert.equal(fixture.callbacks.length,0);assert.equal(fixture.context._shBufI,0);
  }
});
check('원본2시전 실제 거리분리/FIFO 후속 callback',()=>{
  const fixture=prepare();const first=fixture.start();fixture.context.P.x=1000;const second=fixture.start();fixture.context.ens.push({...createFixture().enemy,x:1000,kb:{x:0,y:0}});
  fixture.loop();assert.equal(fixture.callbacks.length,2);assert.equal(fixture.callbacks[0].zone,first);assert.equal(fixture.callbacks[1].zone,second);assert.equal(fixture.context.G.kills,2);
});
check('큐등록 후 실제 루프 particle 실패면 callback 폐기',()=>{
  const fixture=prepare();fixture.start();const reason=new Error('after-dot particle fixture');
  const before=fixture.hurt;fixture.context.hurtE=function(...args){const value=Reflect.apply(before,this,args);fixture.context.Math.random=()=>{throw reason;};return value;};
  assert.throws(fixture.loop,error=>error===reason);assert.equal(fixture.enemy.alive,false);assert.equal(fixture.callbacks.length,0);assert.equal(fixture.review.inspect().pending,0);assert.equal(fixture.review.inspect().inPass,false);
});
console.log(JSON.stringify({utc:new Date().toISOString(),pass:rows.length,fail:0,rows,observations,sourceEvidence,fixtureScope:'일반 etype0·중립 어픽스/방어·고정RNG. 전체 activateSpikeTrap/hurtE 및 전체 장판 if블록 실행; 외부query/시각/SFX/loot/XP/potion/checkRooms 대역. 합성 child는 순회 증명용 복사object이며 D13 피해/지속/반경 정책이 아님.',actualBrowser:'UNKNOWN: 실행0',productionApplied:false},null,2));
