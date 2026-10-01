import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildSharedMatsCandidate} from './shared-mats-atomic-candidate.mjs';

const sha = data=>createHash('sha256').update(data).digest('hex');
const sources = Object.fromEntries(['server.cjs','node-main.js'].map(file=>[file,fs.readFileSync(file,'utf8')]));
const file = '/synthetic/_sharedMats.json';
const initial = JSON.stringify({mats:4567,ts:99});
const checks = [];
const counterexamples = [];
const hashes = {};
function fixture(mode,exists=true) {
  const files=new Map(exists?[[file,initial]]:[]),handles=new Map(),calls=[];
  let nextDescriptor=10;
  return {files,handles,calls,
    existsSync:target=>files.has(target),readFileSync:target=>files.get(target),
    openSync(target,flags){calls.push('open');assert.equal(flags,'wx');assert(!files.has(target));files.set(target,'');const descriptor=++nextDescriptor;handles.set(descriptor,target);return descriptor;},
    writeFileSync(target,data,encoding){calls.push('write');assert.equal(encoding,'utf8');const destination=typeof target==='number'?handles.get(target):target;if(mode==='write'){files.set(destination,data.slice(0,8));throw Object.assign(Error('partial write injected'),{code:'EIO'});}files.set(destination,data);},
    closeSync:descriptor=>handles.delete(descriptor),
    renameSync(from,to){calls.push('rename');if(mode==='rename')throw Object.assign(Error('rename injected'),{code:'EIO'});files.set(to,files.get(from));files.delete(from);},
    unlinkSync:target=>files.delete(target)
  };
}
async function invoke(candidate,memory,method,mats,useCandidate=true) {
  const context=vm.createContext({fs:memory,MATS_FILE:file,pathname:'/api/mats',req:{method},res:{},process:{pid:987},Date:{now:()=>123456},readBody:async()=>({mats}),sendJSON:(res,status,data)=>({status,data})});
  return vm.runInContext(candidate.helperCode+'\n(async()=>{'+(method==='GET'?candidate.get:useCandidate?candidate.candidatePost:candidate.originalPost)+'})()',context);
}
async function check(name,callback){await callback();checks.push(name);}
for(const [sourceFile,source] of Object.entries(sources)) {
  const candidate=buildSharedMatsCandidate(sources['server.cjs'],source);
  hashes[sourceFile]={source:sha(source),get:sha(candidate.get),post:sha(candidate.originalPost),helper:sha(candidate.helperCode)};
  await check(sourceFile+' 原RED: 부분 쓰기 뒤 GET0',async()=>{
    const memory=fixture('write');await assert.rejects(invoke(candidate,memory,'POST',100,false),/partial write/);
    const result=await invoke(candidate,memory,'GET');assert.equal(result.data.mats,0);assert.notEqual(memory.files.get(file),initial);
    counterexamples.push({sourceFile,input:{previousMats:4567,postMats:100,failure:'write 8 chars then injected EIO'},originalBytes:memory.files.get(file),originalGet:result.data});
  });
  for(const mode of ['write','rename'])await check(sourceFile+' 후보 '+mode+' 실패: 이전bytes/GET/ACK0/temp정리',async()=>{
    const memory=fixture(mode);await assert.rejects(invoke(candidate,memory,'POST',100),/injected/);assert.equal(memory.files.get(file),initial);assert.equal(memory.files.size,1);assert.equal(memory.handles.size,0);const candidateGet=await invoke(candidate,memory,'GET');assert.equal(candidateGet.data.mats,4567);
    const counterexample=counterexamples.find(entry=>entry.sourceFile===sourceFile);if(mode==='write')counterexample.candidateGet=candidateGet.data;
  });
  for(const exists of [true,false])await check(sourceFile+' 후보 정상 신규/교체 '+exists,async()=>{
    const memory=fixture('ok',exists);const result=await invoke(candidate,memory,'POST',999);assert.equal(JSON.stringify(result),JSON.stringify({status:200,data:{ok:true,mats:999}}));assert.deepEqual(JSON.parse(memory.files.get(file)),{mats:999,ts:123456});assert.equal(memory.files.size,1);assert.equal((await invoke(candidate,memory,'GET')).data.mats,999);
  });
  await check(sourceFile+' clamp/schema/ACK 동일 10입력',async()=>{
    for(const mats of [-1,0,1.9,'12.7','bad',null,undefined,Infinity,-Infinity,Number.MAX_SAFE_INTEGER+100]) {
      const original=fixture('ok'),updated=fixture('ok');
      const before=await invoke(candidate,original,'POST',mats,false),after=await invoke(candidate,updated,'POST',mats);
      assert.equal(JSON.stringify(before),JSON.stringify(after));assert.deepEqual(JSON.parse(original.files.get(file)),JSON.parse(updated.files.get(file)));
    }
  });
  await check(sourceFile+' GET 없음/손상 형태 불변',async()=>{
    for(const memory of [fixture('ok',false),fixture('ok')]){if(memory.files.size)memory.files.set(file,'broken');assert.equal(JSON.stringify(await invoke(candidate,memory,'GET')),JSON.stringify({status:200,data:{ok:true,mats:0}}));}
  });
  await check(sourceFile+' 밑줄 슬롯 제외 원식',async()=>{
    const expression=source.match(/fs\.readdirSync\(SAVE_DIR\)\.filter\(f => f\.endsWith\('\.json'\) && !f\.startsWith\('_'\)\)/)[0];
    const listed=vm.runInNewContext(expression,{fs:{readdirSync:()=>['_sharedMats.json','_sharedMats.json.tmp-987-1','slot.json','text.txt']},SAVE_DIR:'/synthetic'});assert.equal(JSON.stringify(listed),'["slot.json"]');
  });
}
const sourceHashesAfter=Object.fromEntries(Object.keys(sources).map(file=>[file,sha(fs.readFileSync(file))]));
for(const file of Object.keys(sources))assert.equal(sourceHashesAfter[file],hashes[file].source);
const result={completedAt:new Date().toISOString(),passed:checks.length,checks,counterexamples,hashes,sourceHashesAfter,productionUnchanged:true,limits:'합성 메모리 fs/고정 clock, EIO 주입. 실제 OS/디스크/HTTP/fsync/크래시/Windows 미검수'};
fs.writeFileSync(new URL('./shared-mats-atomic-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
