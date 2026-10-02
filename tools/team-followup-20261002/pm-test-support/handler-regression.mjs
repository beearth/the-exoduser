import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import * as url from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const out = path.dirname(new URL(import.meta.url).pathname);
const root = path.resolve(out,'../../..');
const hash = b => createHash('sha256').update(b).digest('hex');
const receipt = JSON.parse(fs.readFileSync(path.join(out,'receipt.json')));
const git = args => {const r=spawnSync('git',args,{cwd:root,encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}});assert.equal(r.status,0,r.stderr);return r.stdout.trimEnd();};
receipt.executionStartedAt=new Date().toISOString();
receipt.changesMiddle=git(['status','--short','--untracked-files=all']).split('\n').filter(Boolean).length;
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
const source=fs.readFileSync(path.join(root,'node-main.js'),'utf8');
const candidate=fs.readFileSync(path.join(root,'tools/team-followup-20261002/integration-review/node-main.js.shared-mats-candidate'),'utf8');
const patch=fs.readFileSync(path.join(root,'tools/team-followup-20261002/integration-review/node-main.js.shared-mats.patch'),'utf8');
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:e.stack});}}
// Apply unified hunks only in memory, including exact context and line counts.
await check('현재 소스 + 지정 patch = 후보 byte 일치',()=>{
 const lines=source.split('\n');let cursor=0;const result=[];
 const p=patch.split('\n');
 for(let i=0;i<p.length;i++){
  const m=/^@@ -(\d+),(\d+) \+(\d+),(\d+) @@/.exec(p[i]);if(!m)continue;
  const start=Number(m[1])-1;result.push(...lines.slice(cursor,start));cursor=start;let old=0,added=0;
  for(i++;i<p.length&&!p[i].startsWith('@@');i++){
   const l=p[i];if(!l)continue;
   if(l[0]===' '||l[0]==='-'){assert.equal(lines[cursor++],l.slice(1));old++;}
   if(l[0]===' '||l[0]==='+'){result.push(l.slice(1));added++;}
  }
  assert.equal(old,Number(m[2]));assert.equal(added,Number(m[4]));i--;
 }
 result.push(...lines.slice(cursor));assert.equal(result.join('\n'),candidate);
});
const dir='/synthetic/EXODUSER-HELL/saves', target=dir+'/_sharedMats.json',slot=dir+'/hero.json';
const initial='{"mats":4567,"ts":99}',slotBytes='{"player":{"lv":7},"game":{"stage":2},"ts":8}';
function fixture(mode='ok',exists=true){
 const files=new Map([[slot,slotBytes],...(exists?[[target,initial]]:[])]),fds=new Map(),events=[];let fd=30,failed=false,handler;
 const inject=op=>{if(mode===op&&!failed){failed=true;throw Object.assign(Error(op+' injected'),{code:'EIO'});}};
 const fake={appendFileSync(){},mkdirSync(){},existsSync:p=>files.has(p),readFileSync:p=>{assert(files.has(p));return files.get(p);},readdirSync:p=>[...files.keys()].filter(x=>path.dirname(x)===p).map(x=>path.basename(x)),readFile(p,cb){cb(Error('missing'));},
 openSync(p,flags){events.push(['open',p,flags]);assert.equal(flags,'wx');inject('open');if(files.has(p))throw Object.assign(Error('exclusive collision'),{code:'EEXIST'});files.set(p,'');fds.set(++fd,p);return fd;},
 writeFileSync(d,b,enc){assert.equal(enc,'utf8');assert.equal(typeof d,'number');assert(fds.has(d),'live descriptor required');events.push(['write',d]);if(mode==='write'&&!failed)files.set(fds.get(d),b.slice(0,8));inject('write');files.set(fds.get(d),b);},
 closeSync(d){assert(fds.has(d),'close requires live descriptor');events.push(['close',d]);inject('close');fds.delete(d);},
 renameSync(a,b){assert(files.has(a));assert(![...fds.values()].includes(a),'rename after close');events.push(['rename',a,b]);inject('rename');files.set(b,files.get(a));files.delete(a);},
 unlinkSync(p){assert(files.has(p));assert(![...fds.values()].includes(p));events.push(['unlink',p]);files.delete(p);}};
 vm.runInNewContext(candidate,{require:id=>({fs:fake,path,url,http:{createServer(cb){handler=cb;return{listen(){events.push(['listen-intercepted']);}};}}})[id],__dirname:'/synthetic-app',process:{pid:12002,env:{APPDATA:'/synthetic'}},Buffer,console,Date:class extends Date{static now(){return 123456;}}});
 async function request(route,method='GET',body){
  const req=Object.assign(new EventEmitter(),{url:route,method});let status,data,ends=0;
  const promise=handler(req,{writeHead(s){events.push(['headers',s]);status=s;},end(b){events.push(['end']);data=b;ends++;}});
  if(body!==undefined){req.emit('data',Buffer.from(typeof body==='string'?body:JSON.stringify(body)));req.emit('end');}
  try{await promise;return{status,data:data?JSON.parse(data):undefined,ends};}catch(error){return{status,data,ends,error:error.message};}
 }
 return{files,fds,events,request};
}
await check('전체 핸들러 GET 없음·손상·슬롯 분리',async()=>{for(const exists of [false,true]){const f=fixture('ok',exists);if(exists)f.files.set(target,'broken');assert.equal((await f.request('/api/mats')).data.mats,0);assert.deepEqual((await f.request('/api/slots')).data.slots.map(s=>s.name),['hero']);assert.equal((await f.request('/api/load/hero')).data.data.player.lv,7);}});
for(const [label,input,expected] of [['절삭',42.9,42],['음수',-3,0],['상한',Number.MAX_SAFE_INTEGER+100,Number.MAX_SAFE_INTEGER],['문자숫자','12.7',12],['잘못된문자','bad',0],['null',null,0],['0',0,0],['음의소수',-0.1,0]])await check('전체 POST 값 '+label,async()=>{
 const f=fixture();const r=await f.request('/api/mats','POST',{mats:input});assert.deepEqual(r,{status:200,data:{ok:true,mats:expected},ends:1});assert.deepEqual(JSON.parse(f.files.get(target)),{mats:expected,ts:123456});assert.equal((await f.request('/api/mats')).data.mats,expected);assert.equal(f.files.get(slot),slotBytes);assert.equal(f.fds.size,0);assert.equal(f.files.size,2);
 const ops=f.events.map(e=>e[0]);assert(ops.indexOf('rename')<ops.indexOf('headers'));assert(ops.indexOf('headers')<ops.indexOf('end'));
});
await check('신규 파일·연속 요청 temp 고유명과 정리',async()=>{const f=fixture('ok',false);for(const n of [1,2,3])assert.equal((await f.request('/api/mats','POST',{mats:n})).data.mats,n);const names=f.events.filter(e=>e[0]==='open').map(e=>e[1]);assert.equal(new Set(names).size,3);assert(names.every(n=>/^.*\.tmp-12002-\d+$/.test(n)));assert.equal(f.files.size,2);assert.equal(f.fds.size,0);});
const failures=[];
for(const mode of ['open','write','close','rename'])await check('전체 POST '+mode+' 실패 bytes·ACK0·temp 정리·재조회',async()=>{
 const f=fixture(mode);const r=await f.request('/api/mats','POST',{mats:100});assert.match(r.error,new RegExp(mode+' injected'));assert.equal(r.status,undefined);assert.equal(r.ends,0);assert.equal(f.files.get(target),initial);assert.equal(f.files.get(slot),slotBytes);assert.equal(f.files.size,2);assert.equal(f.fds.size,0);assert.equal((await f.request('/api/mats')).data.mats,4567);assert.equal((await f.request('/api/mats','POST',{mats:8})).status,200);
 failures.push({mode,rejectedPromise:r.error,responseStatus:r.status??null,responseEndCount:r.ends,oldBytesPreserved:true,slotBytesPreserved:true,ownedTempRemaining:0,liveDescriptors:0,events:f.events});
});
await check('exclusive collision 타 소유 temp 보존',async()=>{const f=fixture();const foreign=target+'.tmp-12002-1';f.files.set(foreign,'foreign-owner');const r=await f.request('/api/mats','POST',{mats:5});assert.match(r.error,/exclusive collision/);assert.equal(r.ends,0);assert.equal(f.files.get(foreign),'foreign-owner');assert.equal(f.files.get(target),initial);assert.equal(f.files.get(slot),slotBytes);assert.equal(f.fds.size,0);assert(!f.events.some(e=>e[0]==='unlink'));});
await check('잘못된 JSON 기존 handler 응답 한계',async()=>{const f=fixture();const r=await f.request('/api/mats','POST','{');assert(r.error);assert.equal(r.ends,0);assert.equal(f.files.get(target),initial);assert(!f.events.some(e=>e[0]==='open'));});
const preservation=Object.fromEntries(Object.entries(receipt.inputSha256).map(([p,h])=>[p,{before:h,after:hash(fs.readFileSync(path.join(root,p)))}]));
await check('읽기 입력 SHA 전후 보존',()=>{for(const v of Object.values(preservation))assert.equal(v.after,v.before);});
const result={executedAt:receipt.executionStartedAt,completedAt:new Date().toISOString(),passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,checks,failures,preservation,sourceSha256:hash(source),candidateSha256:hash(candidate),patchSha256:hash(patch),productionApplied:false,limits:['전체 source를 VM 실행하고 createServer/listen 가로챔; 실제 HTTP 서버 실행0','fakeFs 메모리 및 단발 EIO 주입; close 실패는 descriptor가 열린 채 남아 finally 재시도 성공인 모형','지속 close/unlink 실패와 crash/fsync/concurrency/Windows/실디스크/실HTTP 미검수','파일 실패 및 JSON 실패는 handler Promise 거부; HTTP 500/end 미구현, 성공 ACK0은 검증했으나 정상 오류 응답 보장 아님']};
fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n');
receipt.executionCompletedAt=result.completedAt;receipt.status=result.failed?'검사 실패':'검수 완료·생산 미채택';receipt.passed=result.passed;receipt.failed=result.failed;
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({passed:result.passed,failed:result.failed,checks:checks.filter(c=>!c.pass)},null,2));if(result.failed)process.exitCode=1;
