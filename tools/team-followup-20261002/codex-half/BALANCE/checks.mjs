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
assert.equal(own,path.join(root,'tools/team-followup-20261002/codex-half/BALANCE'));
assert.equal(fs.realpathSync(own),own);
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>createHash('sha256').update(b).digest('hex');
const output=path.join(own,'evidence.json');
const e=JSON.parse(fs.readFileSync(output,'utf8'));
e.execution={startedAt:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,command:'/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/codex-half/BALANCE/checks.mjs'};
const prefix='tools/team-followup-20261002/integration-review/';
const paths=['AGENTS.md','server.cjs','node-main.js','docs/15 세이브+데이터구조/15 세이브+데이터구조.md','docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md','tools/team-followup-20261002/codex-half/BALANCE/TASK.md','tools/team-followup-20261002/project-teams/BALANCE/result.md','tools/team-followup-20261002/project-teams/BALANCE/evidence.json','tools/team-followup-20261002/project-teams/BALANCE/checks.mjs',prefix+'shared-mats-file-independent.json',prefix+'shared-mats-patch-evidence.json',prefix+'node-main.js.shared-mats-candidate','tools/team-followup-20261002/pm-test-support/result.json','tools/team-followup-20261002/pm-test-support/handler-regression.mjs'];
const before=Object.fromEntries(paths.map(p=>[p,sha(read(p))]));
e.inputs=before;
const patch=JSON.parse(read(prefix+'shared-mats-patch-evidence.json'));
const previous19=JSON.parse(read('tools/team-followup-20261002/project-teams/BALANCE/evidence.json'));
const previous18=JSON.parse(read('tools/team-followup-20261002/pm-test-support/result.json'));
const previous14=JSON.parse(read(prefix+'shared-mats-file-independent.json'));
e.sourceDrift=patch.files.filter(p=>sha(read(p.file))!==p.sourceSha256).map(p=>({file:p.file,expected:p.sourceSha256,actual:sha(read(p.file))}));
if(e.sourceDrift.length){e.status='SOURCE_DRIFT_READ_ONLY_HANDOFF';e.execution.endedAt=new Date().toISOString();e.fixtureExecutions=0;fs.writeFileSync(output,JSON.stringify(e,null,2)+'\n');console.log(JSON.stringify({status:e.status,sourceDrift:e.sourceDrift}));process.exitCode=1;}
else {
try {
  assert.equal(previous14.checks.length,14);assert.equal(previous14.status,'actual_owned_files_14pass');
  assert.equal(previous18.passed,18);assert.equal(previous18.failed,0);
  assert.equal(previous19.verification.passed,19);assert.equal(previous19.verification.failed,0);
  const previous18Source=read('tools/team-followup-20261002/pm-test-support/handler-regression.mjs');
  assert(previous18Source.includes("mode===op&&!failed"));assert(!previous18Source.includes('EACCES'));
  assert(previous19.errorResponseFixture.helper.includes('call/throw stub'));
  e.duplicateEvidence={previous14CaseNames:previous14.checks,previous18CaseNames:previous18.checks.map(c=>c.name),previous18CloseMode:'first failure only, finally close retry succeeds',previous18UnlinkErrorInjected:false,previous19AtomicStub:true,combinedScenarioPreviouslyPresent:false,predecessorsRerun:false};
  const server=read('server.cjs'),node=read('node-main.js'),candidate=read(prefix+'node-main.js.shared-mats-candidate');
  const serverAST=parse(server,{ecmaVersion:'latest'}),nodeAST=parse(node,{ecmaVersion:'latest'});
  const find=(ast,name)=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);assert(n,name);return n;};
  const text=(source,n)=>source.slice(n.start,n.end);
  const sequence=serverAST.body.find(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='atomicSaveSequence'));
  assert(sequence);const helper=text(server,sequence)+'\n'+text(server,find(serverAST,'atomicSaveJSON'));
  const readBody=text(node,find(nodeAST,'readBody')),sendJSON=text(node,find(nodeAST,'sendJSON'));
  function route(source,method){const found=[];function walk(n){if(!n||typeof n!=='object')return;if(n.type==='IfStatement'){const t=text(source,n.test);if(t.includes("pathname === '/api/mats'")&&t.includes("req.method === '"+method+"'"))found.push(n);}for(const v of Object.values(n))if(Array.isArray(v))v.forEach(walk);else if(v&&typeof v==='object')walk(v);}walk(parse(source,{ecmaVersion:'latest'}));assert.equal(found.length,1);return text(source,found[0]);}
  const post=route(candidate,'POST'),get=route(node,'GET'),response=previous19.errorResponseFixture.candidateRoute;
  assert.equal(sha(helper),patch.files[0].helperSha256);
  assert.equal(sha(candidate),patch.files.find(p=>p.file==='node-main.js').candidateSha256);
  assert.equal(sha(post),patch.files.find(p=>p.file==='node-main.js').afterPostSha256);
  assert.equal(sha(response),previous19.errorResponseFixture.sha256);
  e.extractedSource={helperSequenceSha256:sha(helper),atomicPostSha256:sha(post),getSha256:sha(get),readBodySha256:sha(readBody),sendJSONSha256:sha(sendJSON),unadoptedResponseFragmentSha256:sha(response),helperStub:false,wholeServerImported:false,patchApplied:false};
  const target='/synthetic/_sharedMats.json',slot='/synthetic/hero.json',initial='{"mats":4567,"ts":99}',slotBytes='{"player":{"lv":7},"game":{"stage":2},"ts":8}';
  e.input={id:'MATS-CLOSE2-UNLINK-DENIED-01',name:'지속 close와 temp unlink 실패 결합',target,initialTargetBytes:initial,independentSlot:slot,initialSlotBytes:slotBytes,body:{mats:100},clock:123456,pid:12002,faults:{close:'both calls EIO; descriptor remains open in this model',unlink:'owned temp EACCES; temp remains'},schema:'{mats:n,ts:Date.now()}',clamp:'Math.max(0,Math.min(Math.floor(+body.mats||0),Number.MAX_SAFE_INTEGER))'};
  async function run(label,postSource){const files=new Map([[target,initial],[slot,slotBytes]]),fds=new Map(),trace=[],replies=[];let fd=30,closeAttempts=0,unlinkAttempts=0,renameAttempts=0,phase='POST';
    const memory={existsSync:p=>files.has(p),readFileSync(p){trace.push({phase,op:'read',path:p});assert(files.has(p));return files.get(p);},
      openSync(p,flags){trace.push({phase,op:'open',path:p,flags});assert.equal(flags,'wx');assert(!files.has(p));files.set(p,'');fds.set(++fd,p);return fd;},
      writeFileSync(d,b,encoding){trace.push({phase,op:'write',fd:d,encoding,bytes:b});assert.equal(encoding,'utf8');assert(fds.has(d));files.set(fds.get(d),b);},
      closeSync(d){closeAttempts++;trace.push({phase,op:'close',attempt:closeAttempts,fd:d,error:{code:'EIO',message:'persistent close '+closeAttempts}});assert(fds.has(d));throw Object.assign(Error('persistent close '+closeAttempts),{code:'EIO'});},
      unlinkSync(p){unlinkAttempts++;trace.push({phase,op:'unlink',attempt:unlinkAttempts,path:p,error:{code:'EACCES',message:'owned temp unlink denied'}});assert(files.has(p));assert(p.startsWith(target+'.tmp-'));throw Object.assign(Error('owned temp unlink denied'),{code:'EACCES'});},
      renameSync(a,b){renameAttempts++;trace.push({phase,op:'rename',from:a,to:b});assert.fail('rename must not be reached in the single close-failure input');}};
    const responseObject=()=>{const r={phase,status:null,headers:null,body:null,endCount:0};replies.push(r);return{writeHead(s,h){r.status=s;r.headers=JSON.parse(JSON.stringify(h));trace.push({phase,op:'headers',status:s});},end(b){r.body=b;r.endCount++;trace.push({phase,op:'end',body:b});}};};
    const req=Object.assign(new EventEmitter(),{method:'POST'}),context=vm.createContext({fs:memory,MATS_FILE:target,pathname:'/api/mats',req,res:responseObject(),process:{pid:12002},Date:{now:()=>123456},Buffer});
    vm.runInContext(helper+'\n'+readBody+'\n'+sendJSON,context);
    let rejected=null;const promise=vm.runInContext('(async()=>{'+postSource+'})()',context);req.emit('data',Buffer.from(JSON.stringify(e.input.body)));req.emit('end');try{await promise;}catch(error){rejected={name:error.name,code:error.code,message:error.message};}
    const postReply=JSON.parse(JSON.stringify(replies[0]));const postTraceEnd=trace.length;
    const residual={liveFdMap:[...fds.entries()].map(([fd,path])=>({fd,path})),tempMap:[...files.entries()].filter(([p])=>p.startsWith(target+'.tmp-')).map(([path,bytes])=>({path,bytes,sha256:sha(bytes)})),targetBytes:files.get(target),targetSha256:sha(files.get(target)),slotBytes:files.get(slot),slotSha256:sha(files.get(slot))};
    phase='GET';context.req={method:'GET'};context.res=responseObject();await vm.runInContext('(async()=>{'+get+'})()',context);
    return {label,rejected,closeAttempts,unlinkAttempts,renameAttempts,postReply,successAckCount:postReply.status===200?postReply.endCount:0,getReply:replies[1],getMats:JSON.parse(replies[1].body).mats,residual,postTrace:trace.slice(0,postTraceEnd),getTrace:trace.slice(postTraceEnd)};
  }
  e.comparisons=[];
  e.comparisons.push(await run('prepared atomic POST candidate',post));
  e.comparisons.push(await run('unadopted 500 response fragment',response));
  for(const r of e.comparisons){assert.equal(r.closeAttempts,2);assert.equal(r.unlinkAttempts,1);assert.equal(r.renameAttempts,0);assert.equal(r.residual.targetBytes,initial);assert.equal(r.residual.slotBytes,slotBytes);assert.equal(r.getMats,4567);assert.equal(r.successAckCount,0);assert.equal(r.residual.liveFdMap.length,1);assert.equal(r.residual.tempMap.length,1);assert.deepEqual(JSON.parse(r.residual.tempMap[0].bytes),{mats:100,ts:123456});}
  assert.deepEqual(e.comparisons[0].rejected,{name:'Error',code:'EIO',message:'persistent close 1'});assert.equal(e.comparisons[0].postReply.status,null);assert.equal(e.comparisons[0].postReply.endCount,0);
  assert.equal(e.comparisons[1].rejected,null);assert.deepEqual(e.comparisons[1].postReply,{phase:'POST',status:500,headers:{'Content-Type':'text/plain'},body:'Internal Server Error',endCount:1});
  assert.deepEqual(e.comparisons[0].residual,e.comparisons[1].residual);
  e.verification={status:'PASS_NEW_SINGLE_INPUT_REPRODUCED',newInputCount:1,comparisonExecutions:2,failedAssertions:0,cleanupSucceeded:false,liveFdEach:1,tempEach:1,productionApplied:false,responsePolicyAdopted:false,runtimePass:false,visualPass:false};
} catch(error){e.failure={message:error.message,stack:error.stack};e.verification={status:'FAIL',newInputCount:1,failedAssertions:1};process.exitCode=1;}
const search=spawnSync('rg',['-n','sharedMats|공유 악의|atomicSaveJSON|/api/mats|fsync|지속.*close|unlink','docs/'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
const lines=search.stdout.trim().split('\n').filter(Boolean);
e.docsSearch={command:'rg -n "sharedMats|공유 악의|atomicSaveJSON|/api/mats|fsync|지속.*close|unlink" docs/',exitCode:search.status,matchCount:lines.length,matchedDocuments:[...new Set(lines.map(l=>l.split(':')[0]))],outputSha256:sha(search.stdout),sharedDocsModified:false};
if(search.status!==0){e.docsSearch.error=search.stderr;process.exitCode=1;}
e.inputPreservation=Object.fromEntries(paths.map(p=>[p,{before:before[p],after:sha(read(p))}]));
e.inputsChanged=Object.entries(e.inputPreservation).filter(([,v])=>v.before!==v.after).map(([p])=>p);
if(e.inputsChanged.length){e.status='SOURCE_CHANGED_DURING_REVIEW';process.exitCode=1;}else e.status=process.exitCode?'FAILED_HANDOFF':'COMPLETED_SINGLE_COUNTEREXAMPLE_SOURCE_ONLY';
e.execution.endedAt=new Date().toISOString();
e.limits=['메모리 fs/VM 및 open descriptor가 남는 close 실패 대역; 실제OS의 close 결과를 보장하지 않음','동일 복합 입력1건을2정책에서 비교; 기존14/18/19 재실행0','finally close/unlink 예외가 삼켜져도 cleanup 성공은 아님','POST 응답과 후속GET 응답 trace를 분리; 실제HTTP/socket/프로세스생존 검수0','fsync/전원손실/crash/동시writer/Windows/앱재시작/runtime/visual 미검수'];
fs.writeFileSync(output,JSON.stringify(e,null,2)+'\n');
console.log(JSON.stringify({status:e.status,verification:e.verification,comparisons:e.comparisons?.map(r=>({label:r.label,exception:r.rejected,postStatus:r.postReply.status,end:r.postReply.endCount,successAck:r.successAckCount,get:r.getMats,close:r.closeAttempts,unlink:r.unlinkAttempts,fd:r.residual.liveFdMap.length,temp:r.residual.tempMap.length})),failure:e.failure},null,2));
}
