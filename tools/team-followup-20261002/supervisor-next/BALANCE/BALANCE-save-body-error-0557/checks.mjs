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
const rel='tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-save-body-error-0557';
const own=path.dirname(fileURLToPath(import.meta.url));
assert.equal(own,path.join(root,rel));assert.equal(process.cwd(),root);
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const copy=x=>JSON.parse(JSON.stringify(x));
const err=x=>({name:x.name,message:x.message,code:x.code});
const at=()=>{const d=new Date();return {UTC:d.toISOString(),KST:new Date(d.getTime()+32400000).toISOString().replace('Z','+09:00')};};
const inputs=['AGENTS.md',rel+'/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md','docs/15 세이브+데이터구조/15 세이브+데이터구조.md','node-main.js'];
const e={taskId:'BALANCE-save-body-error-0557',provider:'Codex BALANCE',chatId:'01a0faaf-a06a-79a2-9def-58eb8ad10d65',chatIdSource:'previous confirmed role identity',received:{exactTimestamp:null,source:'supervisor direct delegation; TASK read first'},coordinatorProvided:{checkpoint:'6c2dadab0b3a81a600e8358f485518cfcb122199',source:'TASK root-provided history',independentHeadObservation:false,changesCount:null},inputs:Object.fromEntries(inputs.map(f=>[f,sha(read(f))])),execution:{startedAt:at(),actualCwd:process.cwd(),node:process.version,command:'/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node '+rel+'/checks.mjs'},ownedFiles:['checks.mjs','result.md','evidence.json'],skillUsage:[],externalAPIUsage:[],errors:[]};
const source=read('node-main.js'),ast=parse(source,{ecmaVersion:'latest'});
function walk(n,fn){if(!n||typeof n!=='object')return;fn(n);for(const v of Object.values(n))if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object')walk(v,fn);}
const decl=name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(n);return source.slice(n.start,n.end);};
const found=[];walk(ast,n=>{if(n.type==='IfStatement'){const t=source.slice(n.test.start,n.test.end);if(t.includes("pathname === '/api/save'")&&t.includes("req.method === 'POST'"))found.push(n);}});assert.equal(found.length,1);
const route=source.slice(found[0].start,found[0].end),body=decl('readBody'),send=decl('sendJSON'),sanitize=decl('sanitizeSlot');
const candidate=`if (pathname === '/api/save' && req.method === 'POST') {
  let body, slot;
  try {
    body = await readBody(req);
    slot = sanitizeSlot(body.slot || 'default');
    if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');
  } catch (error) {
    return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });
  }
  if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });
  return sendJSON(res, 200, { ok: true, slot });
}`;
parse(candidate,{ecmaVersion:'latest',allowAwaitOutsideFunction:true,allowReturnOutsideFunction:true});
e.source={readAt:at(),nodeSha256:sha(source),readBody:{sha256:sha(body),source:body},sendJSON:{sha256:sha(send),source:send},sanitizeSlot:{sha256:sha(sanitize),source:sanitize},save:{sha256:sha(route),source:route},candidate:{sha256:sha(candidate),source:candidate,productionApplied:false},sharedReadBodyCandidateApplied:false};
const original='{"player":{"lv":7},"game":{"stage":2},"ts":8}';
const input={slot:'영웅/../ A?',data:{player:{lv:9},game:{stage:4},ts:80}};
const safe='영웅_____A_',file='/synthetic/'+safe+'.json',other='/synthetic/_sharedMats.json',mats='{"mats":4567,"ts":99}';
async function run(label,fragment,normal){
  const files=new Map([[file,original],[other,mats]]),trace=[],writes=[],snapshots=[];
  const req=Object.assign(new EventEmitter(),{method:'POST'}),state={body:'pending',bodySettles:0,handler:'pending',handlerSettles:0};
  const response={status:null,headers:null,bytes:null,headCount:0,endCount:0};
  const memory={writeFileSync(p,bytes,encoding){assert.equal(p,file);files.set(p,bytes);writes.push({path:p,bytes,encoding});trace.push({op:'write',path:p,bytes,encoding});}};
  const res={writeHead(status,headers){response.status=status;response.headers=copy(headers);response.headCount++;trace.push({op:'headers',status});},end(bytes){response.bytes=bytes;response.endCount++;trace.push({op:'responseEnd',bytes});}};
  const context=vm.createContext({fs:memory,path,SAVE_DIR:'/synthetic',req,res,pathname:'/api/save',Buffer,Date:{now:()=>123456}});
  vm.runInContext(body+'\n'+send+'\n'+sanitize,context);assert.equal(context.sanitizeSlot(input.slot),safe);
  const actual=context.readBody;
  context.readBody=(...args)=>{const p=actual(...args);p.then(()=>{state.body='fulfilled';state.bodySettles++;trace.push({op:'bodyFulfilled'});},error=>{state.body='rejected';state.bodySettles++;state.bodyError=err(error);trace.push({op:'bodyRejected',error:err(error)});});return p;};
  const done=vm.runInContext('(async()=>{'+fragment+'})()',context);
  done.then(value=>{state.handler='fulfilled';state.handlerSettles++;state.returnedValue=value===undefined?'undefined':copy(value);trace.push({op:'handlerFulfilled',returnedValue:state.returnedValue});},error=>{state.handler='rejected';state.handlerSettles++;state.handlerError=err(error);trace.push({op:'handlerRejected',error:err(error)});});
  async function probe(stage){for(let i=0;i<16;i++)await Promise.resolve();snapshots.push({stage,microtaskTurns:16,state:copy(state),response:copy(response),writeCount:writes.length});}
  await probe('registered');
  if(normal){trace.push({op:'requestEvent',event:'data',bytes:JSON.stringify(input)});req.emit('data',Buffer.from(JSON.stringify(input)));trace.push({op:'requestEvent',event:'end'});req.emit('end');}
  else{const error=Object.assign(new Error('synthetic request body failure'),{code:'ECONNRESET'});trace.push({op:'requestEvent',event:'error',error:err(error)});req.emit('error',error);}
  await probe(normal?'after_end':'after_error');
  return {label,inputKind:normal?'normal complete body':'request error only',trace,snapshots,state:copy(state),response:copy(response),writes,slotBytes:files.get(file),sharedMatsBytes:files.get(other),successACK:response.status===200?response.endCount:0,listeners:Object.fromEntries(['data','end','error','aborted','close'].map(k=>[k,req.listenerCount(k)]))};
}
e.runs=[];
try{
  for(const normal of [false,true])for(const [label,fragment] of [['current',route],['memory save catch candidate',candidate]])e.runs.push(await run(label,fragment,normal));
  const [red,green,n1,n2]=e.runs;
  for(const r of [red,green]){assert.equal(r.state.body,'rejected');assert.equal(r.state.bodySettles,1);assert.equal(r.state.bodyError.code,'ECONNRESET');assert.equal(r.writes.length,0);assert.equal(r.slotBytes,original);assert.equal(r.sharedMatsBytes,mats);assert.equal(r.successACK,0);assert.equal(r.state.handlerSettles,1);}
  assert.equal(red.state.handler,'rejected');assert.equal(red.state.handlerError.code,'ECONNRESET');assert.equal(red.response.headCount,0);assert.equal(red.response.endCount,0);
  assert.equal(green.state.handler,'fulfilled');assert.equal(green.state.returnedValue,'undefined');assert.equal(green.response.status,500);assert.equal(green.response.headCount,1);assert.equal(green.response.endCount,1);assert.deepEqual(JSON.parse(green.response.bytes),{ok:false,error:'Internal Server Error'});
  for(const r of [n1,n2]){assert.equal(r.state.body,'fulfilled');assert.equal(r.state.handler,'fulfilled');assert.equal(r.state.bodySettles,1);assert.equal(r.state.handlerSettles,1);assert.equal(r.state.returnedValue,'undefined');assert.equal(r.writes.length,1);assert.equal(r.slotBytes,JSON.stringify(input.data,null,2));assert.equal(r.sharedMatsBytes,mats);assert.equal(r.response.status,200);assert.equal(r.response.headCount,1);assert.equal(r.response.endCount,1);assert.equal(r.successACK,1);assert.deepEqual(JSON.parse(r.response.bytes),{ok:true,slot:safe});assert(r.trace.findIndex(t=>t.op==='write')<r.trace.findIndex(t=>t.op==='headers'));}
  for(const r of [green,n1,n2])assert.deepEqual(r.response.headers,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  assert.deepEqual(n1.writes,n2.writes);assert.deepEqual(n1.response,n2.response);
  e.verification={status:'PASS_BODY_ERROR_REPRODUCED_CATCH_CANDIDATE_NORMAL_EQUIVALENT',failureInputs:1,normalInputs:1,policies:2,totalSourceRuns:4,previousTestsRerun:0,productionApplied:false,sharedReadBodyCandidateApplied:false,runtimeVerified:false};
}catch(error){e.errors.push({error:err(error),stack:error.stack});e.verification={status:'FAIL'};process.exitCode=1;}
const search=spawnSync('rg',['-n','readBody|/api/save|sanitizeSlot|No data|Internal Server Error','docs/'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "readBody|/api/save|sanitizeSlot|No data|Internal Server Error" docs/',exitCode:search.status,matchCount:lines.length,outputSha256:sha(search.stdout),matchedDocuments:[...new Set(lines.map(l=>l.split(':')[0]))]};
if(search.status!==0)process.exitCode=1;
e.inputDriftAtEnd=inputs.filter(f=>sha(read(f))!==e.inputs[f]);if(e.inputDriftAtEnd.includes('node-main.js'))process.exitCode=1;
e.execution.endedAt=at();e.status=process.exitCode?'FAIL_HANDOFF':'COMPLETED_MEMORY_SAVE_CATCH_CANDIDATE_UNAPPLIED';
e.limits=['request error/end only; close/aborted/late-error cases not repeated','harness rejection observer does not catch or respond inside production route','candidate catch includes body read/parse, sanitize, data test and direct write; responses400/200 outside catch; failure sendJSON errors not caught','No-data400 is source-preserved but not executed; fs exception/partialwrite/response errors not tested','candidate accesses plain JSON body.data twice; exotic getters/proxies not tested','No actual HTTP/IncomingMessage/NW.js/process crash/disk/atomic/fsync/cleanup/concurrency claim'];
fs.writeFileSync(path.join(own,'evidence.json'),JSON.stringify(e,null,2)+'\n');
console.log(JSON.stringify({status:e.status,verification:e.verification,runs:e.runs.map(r=>({label:r.label,inputKind:r.inputKind,state:r.state,response:r.response,writes:r.writes.length})),nodeSha256:e.source.nodeSha256,docsMatches:lines.length,docsDocuments:e.docsSearch.matchedDocuments.length,inputDrift:e.inputDriftAtEnd},null,2));
