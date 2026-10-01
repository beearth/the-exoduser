import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const atomicSaveJSON=vm.runInNewContext("let atomicSaveSequence = 0;\n\nfunction atomicSaveJSON(fs, file, data, processId) {\n  const serialized = JSON.stringify(data, null, 2);\n  const temporary = file + '.tmp-' + processId + '-' + (++atomicSaveSequence);\n  let descriptor;\n  let owned = false;\n  try {\n    descriptor = fs.openSync(temporary, 'wx');\n    owned = true;\n    fs.writeFileSync(descriptor, serialized, 'utf8');\n    fs.closeSync(descriptor);\n    descriptor = undefined;\n    fs.renameSync(temporary, file);\n    owned = false;\n  } finally {\n    if (descriptor !== undefined) {\n      try { fs.closeSync(descriptor); } catch {}\n    }\n    if (owned) {\n      try { fs.unlinkSync(temporary); } catch {}\n    }\n  }\n}\n\n; atomicSaveJSON;");

const source = fs.readFileSync('outputs/team-review-20261002/server-integration/server-before.cjs', 'utf8');
const production=fs.readFileSync('server.cjs','utf8');
const sha = data => createHash('sha256').update(data).digest('hex');
const route = source.slice(source.indexOf("    if (pathname === '/api/save'"), source.indexOf("    if (pathname.startsWith('/api/load/'"));
const sanitize = source.match(/function sanitizeSlot\(name\) \{[\s\S]*?\n\}/)[0];
const originalWrite = "fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');";
assert.equal(route.split(originalWrite).length, 2);
const candidateRoute=production.slice(production.indexOf("    if (pathname === '/api/save'"),production.indexOf("    if (pathname.startsWith('/api/load/'"));
const oldData = {inv:{equipped:{weapon:{enh:2}}},game:{mats:1234}};
const newData = {inv:{equipped:{weapon:{enh:3}}},game:{mats:234}};
const oldBytes = JSON.stringify(oldData, null, 2);
const target = '/fixture/캐릭터.json';
const checks = [];
function memoryFS(mode, existing = true) {
  const files = new Map(existing ? [[target, oldBytes]] : []);
  const handles = new Map();
  let nextDescriptor = 10;
  const calls = [];
  const failure = message => Object.assign(new Error(message), {code:'EIO'});
  return {files, handles, calls,
    openSync(file, flags) {
      calls.push(['open',file,flags]);
      assert.equal(flags,'wx');
      if (mode === 'open') throw failure('open');
      if (mode === 'collision') {files.set(file,'foreign');throw Object.assign(new Error('collision'),{code:'EEXIST'});}
      assert(!files.has(file));files.set(file,'');const descriptor=++nextDescriptor;handles.set(descriptor,file);return descriptor;
    },
    writeFileSync(file, data, encoding) {
      calls.push(['write',file]);assert.equal(encoding,'utf8');
      const destination = typeof file === 'number' ? handles.get(file) : file;
      if (mode === 'write' || mode === 'cleanup') {files.set(destination,data.slice(0,17));throw failure('partial write');}
      files.set(destination,data);
    },
    closeSync(descriptor) {calls.push(['close',descriptor]);if(mode==='close')throw failure('close');handles.delete(descriptor);},
    renameSync(from,to) {calls.push(['rename',from,to]);assert.equal(path.dirname(from),path.dirname(to));if(mode==='rename')throw failure('rename');files.set(to,files.get(from));files.delete(from);},
    unlinkSync(file) {calls.push(['unlink',file]);if(mode==='cleanup')throw failure('unlink');files.delete(file);}
  };
}
async function invoke(block, memory, body) {
  const context=vm.createContext({fs:memory,path,SAVE_DIR:'/fixture',pathname:'/api/save',req:{method:'POST'},res:{},readBody:async()=>body,processId:987,process:{pid:987},atomicSaveJSON,sendJSON:(res,status,data)=>({status,data})});
  return vm.runInContext(sanitize+'\n(async()=>{'+block+'})()',context);
}
async function check(name, callback) {await callback();checks.push(name);}
await check('원문 부분 기록 뒤 EIO: 기존 JSON 손상',async()=>{
  const memory=memoryFS('write');await assert.rejects(invoke(route,memory,{slot:'캐릭터',data:newData}),/partial write/);
  assert.notEqual(memory.files.get(target),oldBytes);assert.throws(()=>JSON.parse(memory.files.get(target)));
});
for(const mode of ['open','write','close','rename','cleanup','collision']) {
  await check('후보 '+mode+' 실패: 이전 파일 보존',async()=>{
    const memory=memoryFS(mode);await assert.rejects(invoke(candidateRoute,memory,{slot:'캐릭터',data:newData}));assert.equal(memory.files.get(target),oldBytes);
    if(['open','write','rename'].includes(mode))assert.equal(memory.files.size,1);
    if(mode==='close')assert.equal(memory.files.size,1);
    if(mode==='cleanup') {assert.equal(memory.files.size,2);assert(memory.calls.some(entry=>entry[0]==='unlink'));}
    if(mode==='collision') {assert.equal([...memory.files.values()].filter(value=>value==='foreign').length,1);assert(!memory.calls.some(entry=>entry[0]==='unlink'));}
  });
}
for(const existing of [true,false])await check('후보 성공 기존파일='+existing,async()=>{
  const memory=memoryFS('ok',existing);const response=await invoke(candidateRoute,memory,{slot:'캐릭터',data:newData});assert.equal(JSON.stringify(response),JSON.stringify({status:200,data:{ok:true,slot:'캐릭터'}}));assert.equal(memory.files.get(target),JSON.stringify(newData,null,2));assert.equal(memory.files.size,1);assert.equal(memory.handles.size,0);
});
await check('원문/후보 슬롯·JSON·응답 호환',async()=>{
  for(const slot of [undefined,'../evil','가'.repeat(60),'']) {
    const before=memoryFS('ok',false),after=memoryFS('ok',false);
    const first=await invoke(route,before,{slot,data:newData}),second=await invoke(candidateRoute,after,{slot,data:newData});assert.equal(JSON.stringify(first),JSON.stringify(second));assert.deepEqual([...before.files],[...after.files]);
  }
});
await check('No data 400: 쓰기0',async()=>{
  const memory=memoryFS('ok');const result=await invoke(candidateRoute,memory,{slot:'캐릭터'});assert.equal(result.status,400);assert.equal(memory.calls.length,0);
});
await check('직렬화 실패: 이전 파일 보존·임시 파일0',async()=>{
  const memory=memoryFS('ok');const cyclic={};cyclic.self=cyclic;await assert.rejects(invoke(candidateRoute,memory,{slot:'캐릭터',data:cyclic}));assert.equal(memory.calls.length,0);assert.equal(memory.files.get(target),oldBytes);
});
await check('반복 저장: 새 snapshot·임시 파일0',async()=>{
  const memory=memoryFS('ok');await invoke(candidateRoute,memory,{slot:'캐릭터',data:newData});await invoke(candidateRoute,memory,{slot:'캐릭터',data:oldData});assert.equal(memory.files.get(target),oldBytes);assert.equal(memory.files.size,1);
});
assert.equal(sha(fs.readFileSync('server.cjs')),sha(production));
const evidence={completedAt:new Date().toISOString(),checks,passed:checks.length,serverSha256:sha(source),routeSha256:sha(route),sanitizeSha256:sha(sanitize),productionUnchanged:true,limits:'메모리 fs 실패 주입만. 실제 디스크/크래시/원자성/fsync/서버ACK 미검수',imports:['node:fs','node:path','node:vm','node:assert/strict','node:crypto','./save-write-failure-candidate.mjs']};
fs.writeFileSync("outputs/team-review-20261002/server-integration/save-evidence.json",JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
