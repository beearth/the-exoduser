import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse} from 'acorn';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const own=path.dirname(fileURLToPath(import.meta.url));
assert.equal(fs.realpathSync(root),root);
assert.equal(own,path.join(root,'tools/team-followup-20261002/continuous/BALANCE'));
assert.equal(fs.realpathSync(own),own);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const output=path.join(own,'evidence.json');
const e=JSON.parse(fs.readFileSync(output,'utf8'));
e.execution={startedAtUTC:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,actualCwd:process.cwd(),command:'/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/continuous/BALANCE/checks.mjs'};
const inputs=['AGENTS.md','node-main.js','test/nodeMainMats.test.js','tools/team-followup-20261002/continuous/COMMON.md','tools/team-followup-20261002/continuous/BALANCE/TASK.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md','docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md','docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md','tmp/mac-migration-runtime/continued-review-20261002/node-main-backup/completion.json','tmp/mac-migration-runtime/continued-review-20261002/node-main-backup/node-test-red.txt','tmp/mac-migration-runtime/continued-review-20261002/node-main-backup/node-test-green.txt','tools/team-followup-20261002/codex-half/BALANCE/result.md','tools/team-followup-20261002/codex-half/BALANCE/evidence.json'];
const before=Object.fromEntries(inputs.map(p=>[p,sha(read(p))]));e.inputs=before;
const node=read('node-main.js'),ast=parse(node,{ecmaVersion:'latest'});
const declaration=name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(n,name);return node.slice(n.start,n.end);};
function route(method){const found=[];function walk(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement'){const test=node.slice(n.test.start,n.test.end);if(test.includes("pathname === '/api/mats'")&&test.includes("req.method === '"+method+"'"))found.push(n);}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(ast);assert.equal(found.length,1);return node.slice(found[0].start,found[0].end);}
const bodySource=declaration('readBody'),sendSource=declaration('sendJSON'),post=route('POST'),get=route('GET');
const candidate=`function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let settled = false;
    function finish(error, value) {
      if (settled) return;
      settled = true;
      req.removeListener('data', onData);
      req.removeListener('end', onEnd);
      req.removeListener('aborted', onAborted);
      req.removeListener('close', onClose);
      chunks = [];
      // Preserve an error guard for late request errors until request lifetime ends.
      if (error) reject(error); else resolve(value);
    }
    function onData(chunk) { if (!settled) chunks.push(chunk); }
    function onEnd() {
      if (settled) return;
      try { finish(null, JSON.parse(Buffer.concat(chunks).toString())); }
      catch (error) { finish(error); }
    }
    function onError(error) { finish(error); }
    function onAborted() { finish(Object.assign(new Error('Request body aborted'), {code: 'ECONNABORTED'})); }
    function onClose() { finish(Object.assign(new Error('Request closed before body end'), {code: 'ERR_STREAM_PREMATURE_CLOSE'})); }
    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);
    req.on('aborted', onAborted);
    req.on('close', onClose);
  });
}`;
e.source={nodeSha256:sha(node),readBody:{sha256:sha(bodySource),source:bodySource},sendJSON:{sha256:sha(sendSource)},post:{sha256:sha(post),source:post},get:{sha256:sha(get)},candidate:{sha256:sha(candidate),source:candidate,applied:false},scope:'actual readBody/POST/sendJSON/GET fragments; no server import or socket',remainingErrorGuard:'one request error listener retained after settle; data/end/aborted/close listeners removed'};
const baseline=JSON.parse(read('tmp/mac-migration-runtime/continued-review-20261002/node-main-backup/completion.json'));
e.baselineSourceMatches=sha(node)===baseline.owned.find(x=>x.file==='node-main.js').completedSha256;
const oldTests=read('test/nodeMainMats.test.js');
e.newBoundaryJustification={oldRegressionCount:4,oldTestsRerun:false,existingStreamCase:'error emitted immediately without partial data, aborted or close',oldTestsHaveAbortedEvent:oldTests.includes("emit('aborted'"),oldTestsHaveCloseEvent:oldTests.includes("emit('close'"),currentListenerEvents:['data','end','error'],currentAbortedCloseListeners:false};
const events=['data','end','error','aborted','close'],microtaskTurns=16;
const target='/synthetic/_sharedMats.json',slot='/synthetic/hero.json',initial='{"mats":4567,"ts":99}',slotBytes='{"player":{"lv":7},"game":{"stage":2},"ts":8}';
const json=x=>JSON.parse(JSON.stringify(x));
const errorInfo=x=>({name:x.name,message:x.message,...(x.code?{code:x.code}:{})});
async function run(label,source,normal){
  const files=new Map([[target,initial],[slot,slotBytes]]),writes=[],trace=[],snapshots=[];
  const req=Object.assign(new EventEmitter(),{method:'POST',aborted:false,complete:false,destroyed:false});
  const state={body:'pending',bodySettles:0,bodyError:null,handler:'pending',handlerSettles:0,handlerError:null};
  const reply={status:null,headers:null,body:null,headCount:0,endCount:0};
  const response=r=>({writeHead(status,headers){r.status=status;r.headers=json(headers);r.headCount++;trace.push({op:'writeHead',status});},end(body){r.body=body;r.endCount++;trace.push({op:'responseEnd',body});}});
  const memory={existsSync:p=>files.has(p),readFileSync:p=>files.get(p),writeFileSync(p,data,encoding){assert.equal(p,target);writes.push({path:p,data,encoding});files.set(p,data);trace.push({op:'directWrite',data});}};
  const context=vm.createContext({fs:memory,MATS_FILE:target,pathname:'/api/mats',req,res:response(reply),Date:{now:()=>123456},Buffer});
  vm.runInContext(source+'\n'+sendSource,context);
  const actual=context.readBody;
  context.readBody=function(...args){const p=actual(...args);p.then(()=>{state.body='fulfilled';state.bodySettles++;trace.push({op:'bodyFulfilled'});},error=>{state.body='rejected';state.bodyError=errorInfo(error);state.bodySettles++;trace.push({op:'bodyRejected',error:errorInfo(error)});});return p;};
  const done=vm.runInContext('(async()=>{'+post+'})()',context);
  done.then(()=>{state.handler='fulfilled';state.handlerSettles++;trace.push({op:'handlerFulfilled'});},error=>{state.handler='rejected';state.handlerError=errorInfo(error);state.handlerSettles++;trace.push({op:'handlerRejected',error:errorInfo(error)});});
  const listenerCounts=()=>Object.fromEntries(events.map(event=>[event,req.listenerCount(event)]));
  async function probe(stage){for(let i=0;i<microtaskTurns;i++)await Promise.resolve();snapshots.push({stage,microtaskTurns,state:json(state),response:json(reply),writeCount:writes.length,listeners:listenerCounts()});}
  function emit(event,value){trace.push({op:'requestEvent',event,...(event==='data'?{bytes:value.toString()}:event==='error'?{error:errorInfo(value)}:{})});try{const handled=req.emit(event,...(value===undefined?[]:[value]));trace.push({op:'emitResult',event,handled});}catch(error){trace.push({op:'emitThrow',event,error:errorInfo(error)});}}
  await probe('listeners_registered');
  emit('data',Buffer.from(normal?'{"mats":42.9}':'{"mats":100'));
  if(normal){req.complete=true;emit('end');await probe('normal_completed');emit('close');emit('error',Object.assign(Error('late request error'),{code:'ECONNRESET'}));emit('end');await probe('after_normal_late_events');}
  else {req.aborted=true;emit('aborted');await probe('after_aborted_before_close');req.destroyed=true;emit('close');await probe('after_close_before_late_error');emit('error',Object.assign(Error('late request error'),{code:'ECONNRESET'}));await probe('after_late_error');emit('end');await probe('after_late_end');}
  const postTrace=json(trace),getReply={status:null,headers:null,body:null,headCount:0,endCount:0};
  context.req={method:'GET'};context.res=response(getReply);await vm.runInContext('(async()=>{'+get+'})()',context);
  return {label,inputKind:normal?'minimal normal control':'one interrupted partial-body event chain',inputBody:normal?'{"mats":42.9}':'{"mats":100',snapshots,finalState:json(state),postReply:json(reply),successAckCount:reply.status===200?reply.endCount:0,writes,postTrace,getReply,getMats:JSON.parse(getReply.body).mats,targetBytes:files.get(target),slotBytes:files.get(slot),listenersAtFinish:listenerCounts()};
}
try {
  assert(e.baselineSourceMatches,'actual source changed since coordinator baseline; do not reuse prior source assumptions');
  assert(!e.newBoundaryJustification.oldTestsHaveAbortedEvent&&!e.newBoundaryJustification.oldTestsHaveCloseEvent);
  assert(!bodySource.includes("'aborted'")&&!bodySource.includes("'close'"));
  e.failureComparisons=[];e.normalComparisons=[];
  e.failureComparisons.push(await run('current source',bodySource,false));
  e.failureComparisons.push(await run('memory candidate',candidate,false));
  const beforeLate=(r,stage)=>r.snapshots.find(s=>s.stage===stage);
  const current=e.failureComparisons[0],fixed=e.failureComparisons[1];
  for(const stage of ['after_aborted_before_close','after_close_before_late_error']){const red=beforeLate(current,stage),green=beforeLate(fixed,stage);assert.equal(red.state.body,'pending');assert.equal(red.state.handler,'pending');assert.equal(red.response.endCount,0);assert.equal(green.state.body,'rejected');assert.equal(green.response.status,500);assert.equal(green.response.headCount,1);assert.equal(green.response.endCount,1);}
  for(const r of e.failureComparisons){assert.equal(r.writes.length,0);assert.equal(r.targetBytes,initial);assert.equal(r.slotBytes,slotBytes);assert.equal(r.getMats,4567);assert.equal(r.successAckCount,0);assert.equal(r.postReply.status,500);assert.deepEqual(r.postReply.headers,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});assert.deepEqual(JSON.parse(r.postReply.body),{ok:false,error:'Internal Server Error'});assert.equal(r.postReply.headCount,1);assert.equal(r.postReply.endCount,1);assert.equal(r.finalState.bodySettles,1);assert.equal(r.finalState.handlerSettles,1);assert(!r.postTrace.some(t=>t.op==='emitThrow'));}
  assert.equal(current.finalState.bodyError.code,'ECONNRESET');assert.equal(fixed.finalState.bodyError.code,'ECONNABORTED');
  assert.deepEqual(fixed.listenersAtFinish,{data:0,end:0,error:1,aborted:0,close:0});
  e.normalComparisons.push(await run('current normal',bodySource,true));
  e.normalComparisons.push(await run('candidate normal',candidate,true));
  for(const r of e.normalComparisons){assert.equal(r.writes.length,1);assert.deepEqual(JSON.parse(r.targetBytes),{mats:42,ts:123456});assert.equal(r.slotBytes,slotBytes);assert.equal(r.getMats,42);assert.equal(r.finalState.bodySettles,1);assert.equal(r.finalState.handlerSettles,1);assert.equal(r.postReply.status,200);assert.deepEqual(JSON.parse(r.postReply.body),{ok:true,mats:42});assert.equal(r.postReply.headCount,1);assert.equal(r.postReply.endCount,1);assert(!r.postTrace.some(t=>t.op==='emitThrow'));}
  assert.deepEqual(e.normalComparisons[0].writes,e.normalComparisons[1].writes);assert.deepEqual(e.normalComparisons[0].postReply,e.normalComparisons[1].postReply);
  e.verification={status:'PASS_NEW_PENDING_BOUNDARY_REPRODUCED_CANDIDATE_SETTLED',newInterruptedInputCount:1,minimalNormalControlInputCount:1,policyComparisonsPerInput:2,totalSourceFixtureRuns:4,oldRegression4Rerun:false,previous14_18_19Rerun:false,forcedPromiseCompletion:false,microtaskObservationTurns:microtaskTurns,candidateApplied:false,runtimeVerified:false};
} catch(error){e.verification={status:'FAIL',error:errorInfo(error),stack:error.stack};process.exitCode=1;}
const search=spawnSync('rg',['-n','readBody|/api/mats|sharedMats|aborted|stream|한번|오류 응답','docs/'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "readBody|/api/mats|sharedMats|aborted|stream|한번|오류 응답" docs/',exitCode:search.status,matchCount:lines.length,outputSha256:sha(search.stdout),matchedDocuments:[...new Set(lines.map(l=>l.split(':')[0]))]};
if(search.status!==0){e.docsSearch.stderr=search.stderr;process.exitCode=1;}
e.inputDriftAtEnd=inputs.filter(p=>sha(read(p))!==before[p]);
if(e.inputDriftAtEnd.includes('node-main.js')){e.sourceChangedDuringReview=true;process.exitCode=1;}
e.execution.endedAtUTC=new Date().toISOString();
e.status=process.exitCode?'REVIEW_FAILURE_HANDOFF':'COMPLETED_SOURCE_STREAM_BOUNDARY_CANDIDATE_UNAPPLIED';
e.limits=['EventEmitter synthetic request; no socket/HTTP/Node IncomingMessage lifecycle verification','pending is observed for16 microtask turns after aborted/close; no invented timeout or forced success','candidate close-only handler exists but is not independently tested by this single aborted->close event chain','candidate retains one settled error guard until request object lifetime ends; zero-listener teardown not claimed','direct write remains; no partial-write durability/atomic/fd/temp/cleanup/fsync/concurrency conclusions','server/runtime/visual/NW.js/Windows/restart/actual disk success verification0'];
fs.writeFileSync(output,JSON.stringify(e,null,2)+'\n');
console.log(JSON.stringify({status:e.status,verification:e.verification,failureComparisons:e.failureComparisons?.map(r=>({label:r.label,afterAbort:r.snapshots.find(s=>s.stage==='after_aborted_before_close').state,afterClose:r.snapshots.find(s=>s.stage==='after_close_before_late_error').response,finalReply:r.postReply,writes:r.writes.length,get:r.getMats,listeners:r.listenersAtFinish})),normalEquivalent:e.verification.status.startsWith('PASS'),error:e.verification.error},null,2));
