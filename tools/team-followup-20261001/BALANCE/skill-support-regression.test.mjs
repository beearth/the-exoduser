import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const original=readFileSync(new URL('../SKILL/ice-cancel-probe.safe.js',import.meta.url),'utf8');
const candidate=readFileSync(new URL('./skill-support-probe.js',import.meta.url),'utf8');
function moduleOf(source){const context=vm.createContext({});vm.runInContext(source,context);return context.IceCancelProbe;}
function environment(options={}) {
  const listeners=new Map();let pending=null;let count=0;const attempts=[];
  const win={
    addEventListener(type,handler){listeners.set(type,handler);if(options.addFail===type)throw Error('add fixture');},
    removeEventListener(type){attempts.push(type);if(options.removeFail===type)throw Error('remove fixture');listeners.delete(type);},
    requestAnimationFrame(handler){pending=handler;return ++count;},
    cancelAnimationFrame(){pending=null;if(options.cancelFail)throw Error('cancel fixture');}
  };
  return {win,listeners,attempts,step(){const handler=pending;pending=null;handler?.();},pending:()=>!!pending,options};
}
const raw=(fields={})=>({aim:false,mp:100,stk:0,rech:100,zones:[],...fields});
const json=value=>JSON.parse(JSON.stringify(value));

test('원실패→수정:100→99/0→1/취소는 UNKNOWN, 환급/충전 확정0',()=>{
  const observed=[];
  for(const [name,source] of [['original',original],['candidate',candidate]]) {
    const env=environment();let state=raw({aim:true});
    const probe=moduleOf(source).install({win:env.win,readRaw:()=>state,now:()=>0});
    state=raw({aim:false,stk:1,rech:99});env.step();
    const result=json(probe.dump());observed.push({name,result});
    if(name==='original'){assert.equal(result.counts.rechargeTicks,1);assert.equal(result.counts.stkRefund,0);}
    else{assert.equal(result.counts.rechargeTicks,0);assert.equal(result.counts.stkRefund,0);assert.equal(result.counts.unknownCharge,1);assert.equal(probe.verdict().verdict,'UNKNOWN');}
    probe.dispose();
  }
  console.log(JSON.stringify({case:'root-counterexample',observed}));
});

test('관측 두끝점만의0→2스택 및 timer0/reset도 UNKNOWN',()=>{
  for(const next of [raw({stk:2,rech:0}),raw({stk:1,rech:1500}),raw({stk:1,rech:0})]) {
    const env=environment();let state=raw();const probe=moduleOf(candidate).install({win:env.win,readRaw:()=>state});
    state=next;env.step();assert.equal(probe.dump().counts.rechargeTicks,0);assert.equal(probe.verdict().verdict,'UNKNOWN');probe.dispose();
  }
});

function actualTrace(file,{stk,rech,max,spValues}) {
  const source=readFileSync(new URL(`../../../${file}`,import.meta.url),'utf8');
  const start=source.indexOf('    if(P._isStk<_isMax){',source.indexOf('// ═══ 아이스스톰 — 2스택 충전'));
  const end=source.indexOf('\n  }',start);
  assert(start>=0&&end>start);
  const block=source.slice(start,end);
  const player={_isStk:stk,_isRech:rech};const trace=[];
  for(const [index,sp] of spValues.entries()) {
    const beforeStk=player._isStk,beforeRech=player._isRech;
    vm.runInNewContext(block,{P:player,_isMax:max,sp},{timeout:1000});
    trace.push({updateSeq:index+1,beforeStk,beforeRech,afterStk:player._isStk,afterRech:player._isRech,max,sp});
  }
  return {player,trace};
}

test('양쪽 실제 충전블록 대조:완전 update추적시만1회/다중만료 확인',()=>{
  for(const file of ['game.html','game-easy-test.html'])for(const spValues of [[100],[100,1500]]) {
    const env=environment();let state=raw({updateSeq:0});
    const probe=moduleOf(candidate).install({win:env.win,readRaw:()=>state});
    const evidence=actualTrace(file,{stk:0,rech:100,max:3,spValues});
    state=raw({stk:evidence.player._isStk,rech:evidence.player._isRech,updateSeq:spValues.length,rechargeTrace:evidence.trace});
    env.step();assert.equal(probe.dump().counts.rechargeTicks,spValues.length);assert.equal(probe.dump().counts.unknownCharge,0);probe.dispose();
  }
});

test('누락 update수/불연속trace/잘못된만료 기록은 UNKNOWN',()=>{
  for(const mutate of [state=>{delete state.updateSeq;},state=>{state.updateSeq=2;},state=>{state.rechargeTrace[0].afterRech=99;},state=>{state.rechargeTrace[0].sp=1;}]) {
    const env=environment();let state=raw({updateSeq:0});const probe=moduleOf(candidate).install({win:env.win,readRaw:()=>state});
    state=raw({stk:1,rech:1500,updateSeq:1,rechargeTrace:[{updateSeq:1,beforeStk:0,beforeRech:100,afterStk:1,afterRech:1500,max:3,sp:100}]});
    mutate(state);env.step();assert.equal(probe.dump().counts.unknownCharge,1);probe.dispose();
  }
});

test('원실패→수정:install reader throw 이후 listener3→0/명시UNKNOWN',()=>{
  const before=environment();assert.throws(()=>moduleOf(original).install({win:before.win,readRaw(){throw Error('read fixture');}}));assert.equal(before.listeners.size,3);
  const after=environment();const probe=moduleOf(candidate).install({win:after.win,readRaw(){throw Error('read fixture');}});
  assert.equal(after.listeners.size,0);assert.equal(after.pending(),false);assert.equal(probe._diag().disposed,true);assert.equal(probe.verdict().verdict,'UNKNOWN');assert.equal(probe.dump().errors[0].phase,'install');
});

test('rAF reader 예외는 정리·오류기록·재설치 허용',()=>{
  const env=environment();let fail=false;const module=moduleOf(candidate);
  const probe=module.install({win:env.win,readRaw:()=>{if(fail)throw Error('raf fixture');return raw();}});
  fail=true;env.step();assert.equal(env.listeners.size,0);assert.equal(env.pending(),false);assert.equal(env.win.__iceCancelProbe,null);assert.equal(probe.verdict().verdict,'UNKNOWN');assert.equal(probe.dump().errors[0].phase,'raf-read');
  const next=module.install({win:env.win,readRaw:()=>raw()});assert.equal(env.listeners.size,3);next.dispose();assert.equal(env.listeners.size,0);
});

test('개별remove/cancel 예외도후속정리 계속·실패listener는기록하고재시도',()=>{
  const env=environment({removeFail:'mousedown',cancelFail:true});const probe=moduleOf(candidate).install({win:env.win,readRaw:()=>raw()});
  probe.dispose();assert.deepEqual(env.attempts,['mousedown','mouseup','contextmenu']);assert.equal(env.listeners.size,1);assert.equal(probe._diag().remainingListeners,1);assert.equal(probe.verdict().verdict,'UNKNOWN');
  env.options.removeFail=null;env.options.cancelFail=false;probe.dispose();assert.equal(env.listeners.size,0);assert.equal(probe._diag().remainingListeners,0);
});

test('add 부분실패·null표본도정리/증거부족 유지',()=>{
  const env=environment({addFail:'mouseup'});const probe=moduleOf(candidate).install({win:env.win,readRaw:()=>raw()});assert.equal(env.listeners.size,0);assert.equal(probe.verdict().verdict,'UNKNOWN');
  const normal=environment();let state=raw();const gap=moduleOf(candidate).install({win:normal.win,readRaw:()=>state});state=null;normal.step();state=raw({stk:1,rech:0});normal.step();assert.equal(gap.verdict().verdict,'UNKNOWN');gap.dispose();
});

test('원파일 해시근거',()=>{
  console.log(JSON.stringify({originalProbe:createHash('sha256').update(original).digest('hex'),candidate:createHash('sha256').update(candidate).digest('hex')}));
});
