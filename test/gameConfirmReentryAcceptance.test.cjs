"use strict";
// Actual live-source confirm reentry acceptance; stdout only.
// Root executes this once after applying the +47B guard in both HTML files.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {createRequire} = require('node:module');
const {parseExpressionAt} = require('acorn');
const ROOT = path.resolve(__dirname,'..');
const GUARD = '\n  if(_gcResolve)return Promise.resolve(false);';
let actualSourceContexts = 0;
const HFILE = path.join(ROOT,'test/inventoryJunkConfirmRevalidationAcceptance.test.cjs');
const UIUX_SHA = 'c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2';
const sha = x => createHash('sha256').update(x).digest('hex');
const clone = x => JSON.parse(JSON.stringify(x));
const harnessBytes = fs.readFileSync(HFILE);
const harness = harnessBytes.toString('utf8');
const headerEnd = harness.indexOf('const SCENARIOS =');
const runHeader = 'async function run(program, scenario) {';
const setupStart = harness.indexOf(runHeader) + runHeader.length;
const setupEnd = harness.indexOf("  if (scenario === 'before-fav'");
assert(headerEnd > 0 && setupStart > runHeader.length && setupEnd > setupStart);
// Reuse existing extractor/DOM and the exact fixture-initialization source only.
// Its old scenario arrays, run/verify functions and main footer are NOT executed.
const bootstrap = harness.slice(0,headerEnd) +
  '\nfunction createFixture(program){const scenario="normal";\n' +
  harness.slice(setupStart,setupEnd) +
  '\nreturn {context,nodes,events,listeners,A,B,C,R,N};}\nmodule.exports={extract,createFixture};';
const hm = {exports:{}};
vm.runInNewContext(bootstrap,{module:hm,require:createRequire(HFILE),__dirname:path.dirname(HFILE),
  process,Buffer,console},{filename:'existing-harness-helpers-only'});
const helper = hm.exports;
function tracked(p) {
  const state={status:'pending'};
  Promise.resolve(p).then(value=>{state.status='fulfilled';state.value=value;},
    error=>{state.status='rejected';state.error={name:error.name,message:error.message};});
  return state;
}
async function flush(){for(let i=0;i<16;i++)await Promise.resolve();}
function fixture(program){
  actualSourceContexts++;
  const f=helper.createFixture(program);f.requests=[];
  f.context.observeConfirm=(args,p)=>f.requests.push({args:clone(args),promise:p,state:tracked(p)});
  vm.runInContext('const _acceptanceRawGC=gameConfirm;gameConfirm=function(...a){const p=_acceptanceRawGC(...a);observeConfirm(a,p);return p;};',f.context);
  return f;
}
function direct(f,message='first',ok='first-ok',cancel='first-no',html=true){
  f.context.callArgs=[message,ok,cancel,html];return vm.runInContext('gameConfirm(...callArgs)',f.context);
}
function snap(f){
  return {html:f.nodes.get('gcMsg').innerHTML,text:f.nodes.get('gcMsg').textContent,
    ok:f.nodes.get('gcOk').textContent,cancel:f.nodes.get('gcCancel').textContent,
    on:f.nodes.get('gcModal').classes.has('on'),okHandler:f.nodes.get('gcOk').onclick,
    cancelHandler:f.nodes.get('gcCancel').onclick,resolver:vm.runInContext('_gcResolve',f.context)};
}
function plainSnap(s){return {html:s.html,text:s.text,ok:s.ok,cancel:s.cancel,on:s.on};}
function finalState(f){return clone({bag:f.context.INV.bag.map(x=>x.id),mats:f.context.G.mats,
  selected:f.context.INV.selected,salvageSelected:[...f.context._invSalSel],events:f.events});}
async function reentry(program,kind,decision){
  const f=fixture(program);const bulkFirst=kind==='bulk-double';
  const p1=bulkFirst?f.nodes.get('invJunkBtn').click():direct(f,'<b>first message</b>');
  const firstWork=tracked(p1);const first=snap(f);
  const p2=kind==='direct'?direct(f,'second message','second-ok','second-no',false):f.nodes.get('invJunkBtn').click();
  const secondWork=tracked(p2);await flush();const afterSecond=snap(f);
  assert.equal(f.requests.length,2,'two actual gameConfirm invocations observed');
  const observedBefore={first:plainSnap(first),afterSecond:plainSnap(afterSecond),
    firstMessagePreserved:first.html===afterSecond.html&&first.text===afterSecond.text,
    firstLabelsPreserved:first.ok===afterSecond.ok&&first.cancel===afterSecond.cancel,
    firstHandlersPreserved:first.okHandler===afterSecond.okHandler&&first.cancelHandler===afterSecond.cancelHandler,
    firstResolverPreserved:first.resolver===afterSecond.resolver,
    firstStillPending:f.requests[0].state.status==='pending',
    secondGC:clone(f.requests[1].state),secondWork:clone(secondWork),stateBeforeDecision:finalState(f)};
  f.nodes.get(decision?'gcOk':'gcCancel').click();await flush();
  const observedAfter={firstGC:clone(f.requests[0].state),firstWork:clone(firstWork),secondGC:clone(f.requests[1].state),
    secondWork:clone(secondWork),modalClosed:!f.nodes.get('gcModal').classes.has('on'),
    resolverNull:vm.runInContext('_gcResolve===null',f.context),state:finalState(f)};
  // Actual sequential new request after the first decision; do not repair orphan promises.
  const next=tracked(direct(f,'sequential request','next-ok','next-no',false));
  const nextOpened=f.nodes.get('gcModal').classes.has('on');f.nodes.get('gcCancel').click();await flush();
  return {kind,decision,observedBefore,observedAfter,sequential:{opened:nextOpened,result:clone(next),closed:!f.nodes.get('gcModal').classes.has('on')}};
}
function verify(r){
  const b=r.observedBefore,a=r.observedAfter;
  assert(b.firstMessagePreserved&&b.firstLabelsPreserved&&b.firstHandlersPreserved&&b.firstResolverPreserved,
    'second call must not replace first message/labels/handlers/resolver');
  assert(b.firstStillPending,'first decision remains pending before click');
  assert.deepEqual(b.secondGC,{status:'fulfilled',value:false},'second actual GC promise immediately fulfills false');
  assert.equal(b.secondWork.status,'fulfilled','second actual caller promise completes');
  assert.equal(b.stateBeforeDecision.mats,500,'no reward before first decision');
  assert.deepEqual(b.stateBeforeDecision.bag,['A','B'],'no delete before first decision');
  assert.equal(a.firstGC.status,'fulfilled','first actual GC promise must not be orphaned');
  assert.equal(a.firstGC.value,r.decision,'first GC follows original decision');
  assert.equal(a.firstWork.status,'fulfilled','first actual caller completes');
  assert.deepEqual(a.secondGC,{status:'fulfilled',value:false},'second GC remains canceled');
  assert(a.modalClosed&&a.resolverNull,'first decision closes and clears active resolver');
  const committed=r.kind==='bulk-double'&&r.decision;
  assert.deepEqual(a.state.bag,committed?[]:['A','B'],'only first accepted bulk may remove original objects');
  assert.equal(a.state.mats,committed?3500:500,'only first accepted bulk may award once');
  for(const event of ['SFX.pickup','dbSaveNow','renderInv'])
    assert.equal(a.state.events.filter(x=>x.name===event).length,+committed,event+' no duplicate commit');
  assert(r.sequential.opened&&r.sequential.closed,'fresh sequential request is accepted after completion');
  assert.deepEqual(r.sequential.result,{status:'fulfilled',value:false});
}
async function sequential(program,kind){
  const f=fixture(program),quotes=[];
  if(kind==='bulk-two-sequential'){
    for(let i=0;i<2;i++){
      if(i===1){f.context.INV.bag.push(f.R,f.N);vm.runInContext('renderInv()',f.context);}
      const work=tracked(f.nodes.get('invJunkBtn').click());quotes.push(plainSnap(snap(f)));
      f.nodes.get('gcOk').click();await flush();assert.equal(work.status,'fulfilled');
    }
    assert.equal(f.context.G.mats,5500);assert.deepEqual(Array.from(f.context.INV.bag,x=>x.id),[]);
    assert.equal(f.events.filter(x=>x.name==='dbSaveNow').length,2);
  }else{
    for(const [i,decision] of [[0,true],[1,false],[2,true]]){
      const work=tracked(direct(f,'message-'+i,'ok-'+i,'cancel-'+i,i%2===0));quotes.push(plainSnap(snap(f)));
      f.nodes.get(decision?'gcOk':'gcCancel').click();await flush();assert.equal(work.value,decision);
    }
  }
  return {kind,quotes,state:finalState(f),requests:f.requests.map(x=>({args:x.args,result:clone(x.state)}))};
}
(async()=>{
  const report={mode:'actual-live-guard-source-with-guard-removed-normal-controls',at:new Date().toISOString(),
    harness:{path:path.relative(ROOT,HFILE),bytes:harnessBytes.length,sha256:sha(harnessBytes),
      reusedOnly:'extractor + DomDouble + exact fixture initialization; previous 28 groups/main NOT run'},
    UIUXOfficialCandidateSHA256:UIUX_SHA,sources:[],rows:[],controls:[],failures:[],fixtureErrors:[],
    counts:{groups:0,pass:0,fail:0,normalSequentialControls:0,sourceContexts:0,fixtureErrors:0}};
  for(const file of ['game.html','game-easy-test.html']){
    const before=fs.readFileSync(path.join(ROOT,file)),text=before.toString();
    const start=text.indexOf('function gameConfirm('),end=parseExpressionAt(text,start,{ecmaVersion:'latest'}).end;
    const fn=text.slice(start,end);
    assert.equal(fn.split(GUARD).length,2,'current production must contain the adopted guard exactly once');
    assert.equal(sha(fn),UIUX_SHA,'current actual function equals the accepted official function');
    const oldFn=fn.replace(GUARD,'');
    const oldText=text.slice(0,start)+oldFn+text.slice(end);
    const current=helper.extract(text),old=helper.extract(oldText);
    report.sources.push({file,bytes:before.length,sha256:sha(before),functionLine:text.slice(0,start).split('\n').length,
      currentFunctionBytes:Buffer.byteLength(fn),currentFunctionSHA256:sha(fn),
      guardRemovedControlFunctionBytes:Buffer.byteLength(oldFn),guardRemovedControlFunctionSHA256:sha(oldFn),
      actualBlocks:current.blocks,normalControlBlocks:old.blocks});
    for(const kind of ['direct','bulk-double','direct-then-bulk'])for(const decision of [true,false]){
      let result;
      try{result=await reentry(current.program,kind,decision);}
      catch(e){report.fixtureErrors.push({file,kind,decision,name:e.name,error:e.message});continue;}
      const row={file,kind,decision,result};report.counts.groups++;
      try{verify(result);row.pass=true;report.counts.pass++;}
      catch(e){row.pass=false;row.error=e.message;report.failures.push({file,kind,decision,error:e.message});report.counts.fail++;}
      report.rows.push(row);
    }
    for(const kind of ['bulk-two-sequential','direct-three-sequential']){
      try{const oldResult=await sequential(old.program,kind),currentResult=await sequential(current.program,kind);
        assert.deepEqual(currentResult,oldResult,'normal sequential state/args/order must equal exact guard-removed source');
        report.controls.push({file,kind,equal:true,result:currentResult});report.counts.normalSequentialControls++;}
      catch(e){report.fixtureErrors.push({file,kind,name:e.name,error:e.message});}
    }
    assert.equal(sha(fs.readFileSync(path.join(ROOT,file))),sha(before),'test must preserve production bytes');
  }
  assert.equal(sha(fs.readFileSync(HFILE)),sha(harnessBytes),'existing regression bytes preserved');
  report.counts.sourceContexts=actualSourceContexts;
  report.counts.fixtureErrors=report.fixtureErrors.length;
  report.limits=['Whole live-source gameConfirm, real registered bulk-junk onclick, filter and salvage helpers through reused synthetic DOM/event fixture.',
    'Current code is executed as read; no guard is inserted into the live positive source. Guard removal occurs only in memory for normal sequential controls.',
    'First pending request preservation/second false is the approved busy policy. No native timing/input/GP/RNG/whole-game completion claim.',
    'Pre-resolver synchronous setter reentry, external close/resolver mutation, stale handlers, DOM throws and all other caller paths remain outside this test.',
    'Renderer/detail/localization/audio/save are doubles. Existing 28 regression groups, native app/HTTP/storage/RAF/audio/visual tests are not executed.'];
  report.productionWritesByTest=0;report.filesWrittenByTest=0;report.previousTestsExecuted=0;
  console.log(JSON.stringify(report));
  process.exitCode=report.counts.fail||report.counts.fixtureErrors||report.counts.groups!==12||report.counts.normalSequentialControls!==4?1:0;
})().catch(e=>{console.error(JSON.stringify({fixturePreparationError:{name:e.name,message:e.message}}));process.exitCode=2;});
