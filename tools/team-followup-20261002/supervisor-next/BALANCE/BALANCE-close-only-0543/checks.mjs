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
const relativeOwn='tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-close-only-0543';
const own=path.dirname(fileURLToPath(import.meta.url));
assert.equal(own,path.join(root,relativeOwn));
assert.equal(process.cwd(),root);
assert.equal(fs.realpathSync(own),own);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const clone=x=>JSON.parse(JSON.stringify(x));
const info=x=>({name:x.name,message:x.message,...(x.code?{code:x.code}:{})});
const at=()=>({UTC:new Date().toISOString(),KST:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Seoul'})+' KST'});
const e={taskId:'BALANCE-close-only-0543',provider:'Codex BALANCE',chatId:'01a0faaf-a06a-79a2-9def-58eb8ad10d65',chatIdSource:'previous confirmed role/chat identity; no new session created',received:{exactTimestamp:null,source:'supervisor direct delegation; TASK read first'},coordinatorProvided:{commit:'f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c',time:'2026-10-02T05:42 approximately',source:'TASK',independentHeadObservation:false,changesCount:null},execution:{startedAt:at(),actualCwd:process.cwd(),node:process.version,command:'/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node '+relativeOwn+'/checks.mjs'},ownedFiles:['checks.mjs','result.md','evidence.json'],constraints:{GitCommands:0,productionModified:false,sharedDocsModified:false,previousOutputsModified:false,server:0,HTTP:0,socket:0,game:0,UI:0,build:0,install:0,newSessions:0,subagents:0,externalMessages:0,filesystemDeletes:0},skillUsage:[],externalAPIUsage:[],readErrors:[]};
const inputs=['AGENTS.md','node-main.js',relativeOwn+'/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md','docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md','tools/team-followup-20261002/continuous/BALANCE/checks.mjs','tools/team-followup-20261002/continuous/BALANCE/evidence.json'];
e.inputs=Object.fromEntries(inputs.map(p=>[p,sha(read(p))]));
const source=read('node-main.js'),ast=parse(source,{ecmaVersion:'latest'});
const declarations=name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(n);return source.slice(n.start,n.end);};
const callsites=[];
function walk(n,visit){if(!n||typeof n!=='object')return;visit(n);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(x=>walk(x,visit));else if(v&&typeof v==='object')walk(v,visit);}
walk(ast,n=>{if(n.type==='CallExpression'&&n.callee.name==='readBody')callsites.push({line:source.slice(0,n.start).split('\n').length,source:source.slice(n.start,n.end)});});
assert.equal(callsites.length,2);
const routes={};
for(const route of ['/api/mats','/api/save']){const found=[];walk(ast,n=>{if(n.type==='IfStatement'){const t=source.slice(n.test.start,n.test.end);if(t.includes("pathname === '"+route+"'")&&t.includes("req.method === 'POST'"))found.push(n);}});assert.equal(found.length,1);routes[route]=source.slice(found[0].start,found[0].end);}
const current=declarations('readBody'),send=declarations('sendJSON'),sanitize=declarations('sanitizeSlot');
const previous=JSON.parse(read('tools/team-followup-20261002/continuous/BALANCE/evidence.json'));
const candidate=previous.source.candidate.source;
assert.equal(sha(candidate),previous.source.candidate.sha256);
e.source={readAt:at(),nodeSha256:sha(source),readBody:{sha256:sha(current),source:current},candidate:{sha256:sha(candidate),source:candidate,applied:false,origin:'previous evidence candidate copied as text; previous fixture not imported/executed'},sendJSON:{sha256:sha(send),source:send},sanitizeSlot:{sha256:sha(sanitize),source:sanitize},routes:Object.fromEntries(Object.entries(routes).map(([r,s])=>[r,{sha256:sha(s),source:s}])),callsites};
assert.equal(e.source.nodeSha256,'541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf');
const saveDir='/synthetic',target=saveDir+'/_sharedMats.json',slot=saveDir+'/hero.json';
const originalMats='{"mats":4567,"ts":99}',originalSlot='{"player":{"lv":7},"game":{"stage":2},"ts":8}';
const data={player:{lv:8},game:{stage:3},ts:77};
const complete=JSON.stringify({mats:51.8,slot:'hero',data});
const partial='{"mats":51.8,"slot":"hero","data":';
const events=['data','end','error','aborted','close'];
const microtaskTurns=16;
async function run(route,policy,bodySource,normal){
  const files=new Map([[target,originalMats],[slot,originalSlot]]),writes=[],trace=[],snapshots=[];
  const req=Object.assign(new EventEmitter(),{method:'POST',complete:false,readableEnded:false,aborted:false,destroyed:false});
  const state={body:'pending',bodySettles:0,handler:'pending',handlerSettles:0};
  const reply={status:null,headers:null,body:null,headCount:0,endCount:0};
  const memory={writeFileSync(p,bytes,encoding){assert([target,slot].includes(p));writes.push({path:p,bytes,encoding});files.set(p,bytes);trace.push({op:'write',path:p,bytes,encoding});}};
  const res={writeHead(status,headers){reply.status=status;reply.headers=clone(headers);reply.headCount++;trace.push({op:'headers',status});},end(bytes){reply.body=bytes;reply.endCount++;trace.push({op:'responseEnd',bytes});}};
  const context=vm.createContext({fs:memory,path,SAVE_DIR:saveDir,MATS_FILE:target,pathname:route,req,res,Date:{now:()=>123456},Buffer});
  vm.runInContext(bodySource+'\n'+send+'\n'+sanitize,context);
  const actual=context.readBody;
  context.readBody=(...args)=>{const p=actual(...args);p.then(()=>{state.body='fulfilled';state.bodySettles++;trace.push({op:'bodyFulfilled'});},error=>{state.body='rejected';state.bodySettles++;state.bodyError=info(error);trace.push({op:'bodyRejected',error:info(error)});});return p;};
  const done=vm.runInContext('(async()=>{'+routes[route]+'})()',context);
  // Observe rejections without adding catch/response behavior to the actual route.
  done.then(()=>{state.handler='fulfilled';state.handlerSettles++;trace.push({op:'handlerFulfilled'});},error=>{state.handler='rejected';state.handlerSettles++;state.handlerError=info(error);trace.push({op:'handlerRejected',error:info(error)});});
  const flags=()=>({complete:req.complete,readableEnded:req.readableEnded,aborted:req.aborted,destroyed:req.destroyed});
  const listeners=()=>Object.fromEntries(events.map(k=>[k,req.listenerCount(k)]));
  async function probe(stage){for(let i=0;i<microtaskTurns;i++)await Promise.resolve();snapshots.push({stage,microtaskTurns,flags:flags(),state:clone(state),reply:clone(reply),writeCount:writes.length,listeners:listeners()});}
  function emit(event,value){trace.push({op:'requestEvent',event,flags:flags(),...(event==='data'?{bytes:value.toString()}:{})});try{trace.push({op:'emitResult',event,handled:req.emit(event,...(value===undefined?[]:[value]))});}catch(error){trace.push({op:'emitThrow',event,error:info(error)});}}
  await probe('registered');emit('data',Buffer.from(normal?complete:partial));await probe('after_data');
  if(normal){req.complete=true;req.readableEnded=true;emit('end');await probe('after_end_before_close');}
  req.destroyed=true;emit('close');await probe('after_close');
  return {route,policy,inputKind:normal?'complete end then close':'partial close-only',input:normal?complete:partial,trace,snapshots,state:clone(state),reply:clone(reply),writes,matsBytes:files.get(target),slotBytes:files.get(slot),flags:flags(),listeners:listeners(),successACK:reply.status===200?reply.endCount:0};
}
e.runs=[];
try{
  for(const normal of [false,true])for(const route of ['/api/mats','/api/save'])for(const [policy,body] of [['current',current],['candidate',candidate]])e.runs.push(await run(route,policy,body,normal));
  for(const r of e.runs){
    assert(!r.trace.some(t=>t.op==='emitThrow'));
    assert.deepEqual(r.trace.filter(t=>t.op==='requestEvent').map(t=>t.event),r.inputKind==='partial close-only'?['data','close']:['data','end','close']);
    if(r.inputKind==='partial close-only'){
      assert.equal(r.writes.length,0);assert.equal(r.successACK,0);assert.equal(r.matsBytes,originalMats);assert.equal(r.slotBytes,originalSlot);
      if(r.policy==='current'){assert.equal(r.state.body,'pending');assert.equal(r.state.handler,'pending');assert.equal(r.state.bodySettles,0);assert.equal(r.state.handlerSettles,0);assert.equal(r.reply.endCount,0);}
      else{assert.equal(r.state.body,'rejected');assert.equal(r.state.bodySettles,1);assert.equal(r.state.handlerSettles,1);assert.equal(r.state.bodyError.code,'ERR_STREAM_PREMATURE_CLOSE');
        if(r.route==='/api/mats'){assert.equal(r.state.handler,'fulfilled');assert.equal(r.reply.status,500);assert.equal(r.reply.headCount,1);assert.equal(r.reply.endCount,1);assert.deepEqual(JSON.parse(r.reply.body),{ok:false,error:'Internal Server Error'});}
        else{assert.equal(r.state.handler,'rejected');assert.equal(r.state.handlerError.code,'ERR_STREAM_PREMATURE_CLOSE');assert.equal(r.reply.status,null);assert.equal(r.reply.headCount,0);assert.equal(r.reply.endCount,0);}
      }
    }else{
      assert.equal(r.writes.length,1);assert.equal(r.state.body,'fulfilled');assert.equal(r.state.handler,'fulfilled');assert.equal(r.state.bodySettles,1);assert.equal(r.state.handlerSettles,1);assert.equal(r.reply.status,200);assert.equal(r.reply.headCount,1);assert.equal(r.reply.endCount,1);assert.equal(r.successACK,1);
      assert.deepEqual(r.snapshots.find(s=>s.stage==='after_end_before_close').reply,r.reply);
      if(r.route==='/api/mats'){assert.equal(r.matsBytes,'{"mats":51,"ts":123456}');assert.equal(r.slotBytes,originalSlot);assert.deepEqual(JSON.parse(r.reply.body),{ok:true,mats:51});}
      else{assert.equal(r.slotBytes,JSON.stringify(data,null,2));assert.equal(r.matsBytes,originalMats);assert.deepEqual(JSON.parse(r.reply.body),{ok:true,slot:'hero'});}
    }
    if(r.reply.status!==null)assert.deepEqual(r.reply.headers,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    if(r.policy==='candidate')assert.deepEqual(r.listeners,{data:0,end:0,error:1,aborted:0,close:0});
  }
  for(const route of Object.keys(routes)){const pair=e.runs.filter(r=>r.route===route&&r.inputKind==='complete end then close');assert.deepEqual(pair[0].writes,pair[1].writes);assert.deepEqual(pair[0].reply,pair[1].reply);}
  e.verification={status:'PASS_CLOSE_ONLY_BOUNDARY_AND_SHARED_CALLSITE_RISK',newFailureInputs:1,minimalNormalInputs:1,actualCallsites:2,policies:2,totalSourceRuns:8,microtaskObservationTurns:16,previousTestsRerun:0,candidateApplied:false,runtimeVerified:false,productionDecision:'NO-FIX: retain unapplied shared candidate; /api/save rejection has no local response catch'};
}catch(error){e.verification={status:'FAIL',error:info(error),stack:error.stack};process.exitCode=1;}
const search=spawnSync('rg',['-n','readBody|/api/mats|/api/save|ERR_STREAM_PREMATURE_CLOSE|readableEnded|aborted','docs/'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "readBody|/api/mats|/api/save|ERR_STREAM_PREMATURE_CLOSE|readableEnded|aborted" docs/',exitCode:search.status,matchCount:lines.length,outputSha256:sha(search.stdout),matchedDocuments:[...new Set(lines.map(l=>l.split(':')[0]))]};
if(search.status!==0){e.docsSearch.stderr=search.stderr;process.exitCode=1;}
e.inputDriftAtEnd=inputs.filter(p=>sha(read(p))!==e.inputs[p]);
if(e.inputDriftAtEnd.includes('node-main.js'))process.exitCode=1;
e.execution.endedAt=at();
e.status=process.exitCode?'FAIL_HANDOFF':'COMPLETED_CANDIDATE_UNAPPLIED_SHARED_CATCH_GATE';
e.limits=['Synthetic EventEmitter flags complete/readableEnded assigned by fixture; neither current nor candidate reads them','No aborted/error emitted; late error guard presence only counted, not exercised again','Pending bounded to16 microtask turns; no forced completion, elapsed timeout or infinite wait claim','Rejected /api/save handler is observed by harness; no production catch inserted or process crash proven','No actual IncomingMessage/socket/HTTP/NW.js/end-user delivery or disk writes','No already-ended response boundary; no atomic/fsync/cleanup/durability/concurrency/lifetime-GC claims'];
fs.writeFileSync(path.join(own,'evidence.json'),JSON.stringify(e,null,2)+'\n');
console.log(JSON.stringify({status:e.status,verification:e.verification,runs:e.runs.map(r=>({route:r.route,policy:r.policy,inputKind:r.inputKind,state:r.state,response:r.reply.status,ends:r.reply.endCount,writes:r.writes.length,listeners:r.listeners})),docsMatches:lines.length,docsDocuments:e.docsSearch.matchedDocuments.length,inputDrift:e.inputDriftAtEnd},null,2));
