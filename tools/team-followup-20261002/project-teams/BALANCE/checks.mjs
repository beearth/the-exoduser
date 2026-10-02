import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parse} from 'acorn';

const own=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(own,'../../../..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=args=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});assert.equal(r.status,0,r.stderr);return r.stdout.trim();};
const count=()=>git(['status','--short','--untracked-files=all']).split('\n').filter(Boolean).length;
const evidencePath=path.join(own,'evidence.json');
const evidence=JSON.parse(fs.readFileSync(evidencePath,'utf8'));
if(evidence.verification)evidence.verificationHistory=[...(evidence.verificationHistory||[]),{execution:evidence.execution,verification:evidence.verification,failures:evidence.checks.filter(c=>!c.pass)}];
evidence.execution={startedAt:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,command:'/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/project-teams/BALANCE/checks.mjs',head:git(['rev-parse','HEAD'])};
evidence.changes.middle=count();
assert(evidence.changes.middle<100,'100 항목 전에 새 산출 중단');
const prefix='tools/team-followup-20261002/integration-review/';
const patchEvidence=JSON.parse(read(prefix+'shared-mats-patch-evidence.json'));
const file14=JSON.parse(read(prefix+'shared-mats-file-independent.json'));
const handler18=JSON.parse(read('tools/team-followup-20261002/pm-test-support/result.json'));
const protectedPaths=['AGENTS.md','game.html','game-easy-test.html','index.html','server.cjs','node-main.js','test/nodeMainMats.test.js','tools/team-followup-20261001/BALANCE/shared-mats-atomic-candidate.mjs',prefix+'server.cjs.shared-mats.patch',prefix+'node-main.js.shared-mats.patch',prefix+'server.cjs.shared-mats-candidate',prefix+'node-main.js.shared-mats-candidate',prefix+'shared-mats-patch-evidence.json',prefix+'shared-mats-file-independent.json','tools/team-followup-20261002/pm-test-support/result.json','tools/team-followup-20261002/pm-test-support/receipt.json','tools/team-followup-20261002/project-teams/BALANCE/task.md'];
const before=Object.fromEntries(protectedPaths.map(p=>[p,hash(read(p))]));
const checks=[];
async function check(name,fn){try{const detail=await fn();checks.push({name,pass:true,...(detail===undefined?{}:{detail})});}catch(error){checks.push({name,pass:false,error:error.stack});}}
function walk(node,fn){if(!node||typeof node!=='object')return;fn(node);for(const v of Object.values(node))if(Array.isArray(v))v.forEach(n=>walk(n,fn));else if(v&&typeof v==='object')walk(v,fn);}
function route(source,method){const found=[];walk(parse(source,{ecmaVersion:'latest',allowAwaitOutsideFunction:true,allowReturnOutsideFunction:true}),n=>{if(n.type==='IfStatement'){const t=source.slice(n.test.start,n.test.end);if(t.includes("pathname === '/api/mats'")&&t.includes("req.method === '"+method+"'"))found.push(n);}});assert.equal(found.length,1);return found[0];}
const text=(source,node)=>source.slice(node.start,node.end);
function applyInMemory(source,patch){const input=source.split('\n'),lines=patch.split('\n'),output=[];let cursor=0;
  for(let i=0;i<lines.length;i++){const m=/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(lines[i]);if(!m)continue;const start=Number(m[1])-1;assert(start>=cursor);output.push(...input.slice(cursor,start));cursor=start;let oldCount=0,newCount=0;
    for(i++;i<lines.length&&!lines[i].startsWith('@@');i++){const l=lines[i];if(!l||l.startsWith('diff --git')||l.startsWith('index ')||l.startsWith('--- ')||l.startsWith('+++ '))continue;assert([' ','+','-'].includes(l[0]));if(l[0]!=='+' ){assert.equal(input[cursor++],l.slice(1));oldCount++;}if(l[0]!=='-'){output.push(l.slice(1));newCount++;}}
    assert.equal(oldCount,Number(m[2]??1));assert.equal(newCount,Number(m[4]??1));i--;}
  output.push(...input.slice(cursor));return output.join('\n');}
const candidates={};
await check('원담당 candidate builder SHA 동일',()=>assert.equal(hash(read(patchEvidence.ownerCandidate)),patchEvidence.ownerCandidateSha256));
for(const entry of patchEvidence.files){const source=read(entry.file),candidate=read(prefix+entry.file+'.shared-mats-candidate'),patch=read(prefix+entry.file+'.shared-mats.patch');candidates[entry.file]=candidate;
  await check(entry.file+' exact-context/SHA/메모리 적용 동일',()=>{assert.equal(hash(source),entry.sourceSha256);assert.equal(hash(candidate),entry.candidateSha256);assert.equal(hash(patch),entry.patchSha256);assert.equal(applyInMemory(source,patch),candidate);});
  await check(entry.file+' AST 최소 적용 경계',()=>{const ast=parse(candidate,{ecmaVersion:'latest'}),helper=ast.body.filter(n=>n.type==='FunctionDeclaration'&&n.id.name==='atomicSaveJSON'),sequence=ast.body.filter(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='atomicSaveSequence'));assert.equal(helper.length,1);assert.equal(sequence.length,1);assert.equal(hash(text(candidate,sequence[0])+'\n'+text(candidate,helper[0])),entry.helperSha256);assert.equal(hash(text(candidate,route(candidate,'GET'))),entry.getSha256);const originalPost=text(source,route(source,'POST')),candidatePost=text(candidate,route(candidate,'POST'));assert.equal(candidatePost,originalPost.replace("fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');",'atomicSaveJSON(fs, MATS_FILE, { mats: n, ts: Date.now() }, process.pid);'));const rest=s=>s.replace(text(s,route(s,'POST')),'POST_PLACEHOLDER').replace(/let atomicSaveSequence = 0;\s*function atomicSaveJSON[\s\S]*?\n}\s*/,'ATOMIC_PLACEHOLDER\n');if(entry.file==='server.cjs')assert.equal(rest(source),rest(candidate));else assert.equal(candidate.replace(text(candidate,sequence[0])+'\n'+text(candidate,helper[0])+'\n\n','').replace(candidatePost,originalPost),source);});
}
await check('기존 actual-file14 결과 재사용·현행 입력 대조',()=>{assert.equal(file14.status,'actual_owned_files_14pass');assert.equal(file14.checks.length,14);assert.equal(file14.preserved,true);for(const e of patchEvidence.files)assert.equal(file14.before[e.file],hash(read(e.file)));return {completedAt:file14.completedAt,rerun:false};});
await check('Terminal12 handler18 결과 재사용·후보/입력 대조',()=>{assert.equal(handler18.passed,18);assert.equal(handler18.failed,0);assert.equal(handler18.productionApplied,false);assert.equal(handler18.sourceSha256,hash(read('node-main.js')));assert.equal(handler18.candidateSha256,hash(candidates['node-main.js']));assert.equal(handler18.patchSha256,hash(read(prefix+'node-main.js.shared-mats.patch')));for(const v of Object.values(handler18.preservation))assert.equal(v.before,v.after);return {completedAt:handler18.completedAt,rerun:false};});
await check('기존 영구 테스트 fd fakeFs 부족 확인',()=>{const source=read('test/nodeMainMats.test.js'),nodes=[];walk(parse(source,{ecmaVersion:'latest',sourceType:'module'}),n=>{if(n.type==='VariableDeclarator'&&n.id.name==='fakeFs')nodes.push(n);});assert.equal(nodes.length,1);const keys=nodes[0].init.properties.map(p=>p.key.name);const missing=['openSync','closeSync','renameSync','unlinkSync'].filter(n=>!keys.includes(n));assert.equal(missing.length,4);return {missing,requiredProcessPid:true,permanentTestModified:false};});

// Source fixture only: catch body parsing/storage errors before success sendJSON.
// This verifies response policy; atomicSaveJSON is an explicit call/throw stub.
const nodeCandidate=candidates['node-main.js'];
const originalRoute=text(nodeCandidate,route(nodeCandidate,'POST'));
const ast=parse(nodeCandidate,{ecmaVersion:'latest'});
const helperText=name=>text(nodeCandidate,ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name));
const proposedRoute=originalRoute.replace("    const body = await readBody(req);\n    const n =", "    let n;\n    try {\n      const body = await readBody(req);\n      n =").replace("    atomicSaveJSON(fs, MATS_FILE, { mats: n, ts: Date.now() }, process.pid);\n    return sendJSON", "      atomicSaveJSON(fs, MATS_FILE, { mats: n, ts: Date.now() }, process.pid);\n    } catch (error) {\n      res.writeHead(500, { 'Content-Type': 'text/plain' });\n      return res.end('Internal Server Error');\n    }\n    return sendJSON");
evidence.errorResponseFixture={scope:'node-main POST /api/mats branch only; never saved/applied to production',candidateRoute:proposedRoute,sha256:hash(proposedRoute),helper:'atomicSaveJSON call/throw stub; no fd or disk execution',policy:'readBody/clamp/atomicSaveJSON failure -> server.cjs existing 500 text/plain body; success sendJSON outside try',applied:false};
await check('오류응답 후보 구문·성공 응답 catch 외부·기존 server 500형태',()=>{const n=route(proposedRoute,'POST');assert.equal(n.consequent.body[1].type,'TryStatement');assert.equal(n.consequent.body.at(-1).type,'ReturnStatement');const server=read('server.cjs');assert(server.includes("res.writeHead(500, { 'Content-Type': 'text/plain' });"));assert(server.includes("res.end('Internal Server Error');"));assert.equal((proposedRoute.match(/atomicSaveJSON\(/g)||[]).length,1);});
async function invoke(routeSource,{phase,body='{"mats":42.9}',responseThrows=false}={}){const req=new EventEmitter(),events=[],replies=[],storageCalls=[];req.method='POST';const res={writeHead(status,headers){events.push(['headers',status]);if(responseThrows)throw Error('response transport unavailable');replies.push({status,headers});},end(data){events.push(['end']);replies.at(-1).body=data;}};const context=vm.createContext({req,res,pathname:'/api/mats',fs:{},MATS_FILE:'/synthetic/_sharedMats.json',process:{pid:12002},Date:{now:()=>123456},Buffer,atomicSaveJSON(_fs,file,data,pid){storageCalls.push({file,data:JSON.parse(JSON.stringify(data)),pid});events.push(['storage']);if(phase)throw Object.assign(Error(phase+' injected'),{code:'EIO'});events.push(['rename-success-stub']);}});let error;const pending=vm.runInContext(helperText('readBody')+'\n'+helperText('sendJSON')+'\n(async()=>{'+routeSource+'})()',context);req.emit('data',Buffer.from(body));req.emit('end');try{await pending;}catch(e){error=e.message;}return {events,replies:JSON.parse(JSON.stringify(replies)),storageCalls,error};}
await check('기존 atomic 후보 handler 거부·성공ACK0·오류응답0',async()=>{const r=await invoke(originalRoute,{phase:'write'});assert.equal(r.error,'write injected');assert.equal(r.replies.length,0);assert.equal(r.events.filter(e=>e[0]==='end').length,0);return r;});
for(const phase of ['open','write','close','rename'])await check('오류응답 source fixture '+phase+' 예외→500/end1',async()=>{const r=await invoke(proposedRoute,{phase});assert.equal(r.error,undefined);assert.equal(r.replies.length,1);assert.deepEqual(r.replies[0],{status:500,headers:{'Content-Type':'text/plain'},body:'Internal Server Error'});assert.equal(r.events.filter(e=>e[0]==='end').length,1);assert(!r.events.some(e=>e[0]==='headers'&&e[1]===200));return r;});
await check('오류응답 source fixture JSON 실패→저장0·500/end1',async()=>{const r=await invoke(proposedRoute,{body:'{'});assert.equal(r.error,undefined);assert.equal(r.storageCalls.length,0);assert.equal(r.replies.length,1);assert.equal(r.replies[0].status,500);assert.equal(r.replies[0].body,'Internal Server Error');return r;});
await check('오류응답 source fixture 성공 clamp/schema/ACK 순서 유지',async()=>{const before=await invoke(originalRoute),after=await invoke(proposedRoute);assert.deepEqual(after,before);assert.deepEqual(after.storageCalls[0].data,{mats:42,ts:123456});assert.equal(after.replies[0].status,200);assert.deepEqual(JSON.parse(after.replies[0].body),{ok:true,mats:42});assert(after.events.findIndex(e=>e[0]==='rename-success-stub')<after.events.findIndex(e=>e[0]==='headers'));return after;});
await check('성공 응답 transport 실패 재응답 시도0',async()=>{const r=await invoke(proposedRoute,{responseThrows:true});assert.equal(r.error,'response transport unavailable');assert.equal(r.events.filter(e=>e[0]==='headers').length,1);assert.equal(r.replies.length,0);return r;});
await check('읽기 입력 SHA 보존',()=>{for(const p of protectedPaths)assert.equal(hash(read(p)),before[p]);});
const search=spawnSync('rg',['-n','sharedMats|공유 악의|atomicSaveJSON|/api/mats|fsync|nodeMainMats','docs/'],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024});
await check('코드 산출 후 docs 전체 키워드 검색',()=>{assert.equal(search.status,0,search.stderr);});
const matches=search.stdout.trim().split('\n').filter(Boolean);
evidence.docsSearch={command:'rg -n "sharedMats|공유 악의|atomicSaveJSON|/api/mats|fsync|nodeMainMats" docs/',status:search.status,matchCount:matches.length,stdoutSha256:hash(search.stdout),matchedDocuments:[...new Set(matches.map(l=>l.split(':')[0]))],rawOutputStored:false,note:'추가 산출 제한에 따라 검색 개수·전체출력 SHA·매칭 문서 목록을 evidence 안에 기록; 변경안은 result.md 계약표에 기록'};
evidence.inputs=before;evidence.checks=checks;
evidence.reusedEvidence={actualFile14:{path:prefix+'shared-mats-file-independent.json',count:14,rerun:false},handler18:{path:'tools/team-followup-20261002/pm-test-support/result.json',count:18,rerun:false}};
evidence.execution.endedAt=new Date().toISOString();
evidence.verification={completedAt:evidence.execution.endedAt,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,headAtFinish:git(['rev-parse','HEAD']),syntaxCheckedExternally:false};
evidence.changes.afterChecks=count();
evidence.status=evidence.verification.failed?'CHECK_FAILED':'SOURCE_ACCEPTANCE_PLAN_CHECKED_NOT_APPLIED';
evidence.limits=['source fixture only; atomic helper call/throw stub, success rename event is a stub','기존14/18 tests only inspected/reused, not rerun','실HTTP/응답 socket/앱/실디스크/fsync/전원손실/crash/Windows/concurrency/지속close/unlink 실패 미검수','생산 코드·영구 test·공용 docs 변경0; 총괄 통합 Gate 유지'];
fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:evidence.status,passed:evidence.verification.passed,failed:evidence.verification.failed,failures:checks.filter(c=>!c.pass),changes:evidence.changes},null,2));
if(evidence.verification.failed)process.exitCode=1;
