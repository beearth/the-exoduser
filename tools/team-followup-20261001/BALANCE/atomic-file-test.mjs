import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parse} from 'acorn';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = fs.readFileSync(path.join(root,'server.cjs'),'utf8');
const ast = parse(source,{ecmaVersion:'latest',sourceType:'script'});
const functionNode = ast.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='atomicSaveJSON');
const sequenceNode = ast.body.find(node=>node.type==='VariableDeclaration'&&node.declarations.some(declaration=>declaration.id.name==='atomicSaveSequence'));
assert(functionNode&&sequenceNode);
const extracted = [sequenceNode,functionNode].map(node=>source.slice(node.start,node.end));
const atomicSaveJSON = vm.runInNewContext(extracted.join('\n')+'\natomicSaveJSON;');
const base = fileURLToPath(new URL('./atomic-file-fixtures/',import.meta.url));
fs.mkdirSync(base,{recursive:true});
const output = fs.mkdtempSync(path.join(base,'run-'));
const evidence = {startedAt:new Date().toISOString(),output,runtime:{node:process.version,platform:process.platform,arch:process.arch},sourceSha256:sha(source),functionSha256:sha(extracted[1]),sequenceSha256:sha(extracted[0]),checks:[],errors:[],limits:'실제 소유 디렉터리 파일 I/O. 주입 write/rename 오류는 실디스크 장애 아님; HTTP/크래시/fsync/Windows 미검수'};
const oldData = {inv:{weapon:{enh:2}},game:{mats:1000}};
const newData = {inv:{weapon:{enh:3}},game:{mats:800}};
const serialized = data=>JSON.stringify(data,null,2);
function target(name) {return path.join(output,name+'.json');}
function noTemporary() {assert(!fs.readdirSync(output).some(name=>name.includes('.tmp-')));}
function check(name,callback) {callback();evidence.checks.push(name);}
try {
  check('신규 실제 파일 생성',()=>{atomicSaveJSON(fs,target('new'),newData,process.pid);assert.equal(fs.readFileSync(target('new'),'utf8'),serialized(newData));noTemporary();});
  check('기존 실제 파일 교체',()=>{fs.writeFileSync(target('existing'),serialized(oldData));atomicSaveJSON(fs,target('existing'),newData,process.pid);assert.equal(fs.readFileSync(target('existing'),'utf8'),serialized(newData));noTemporary();});
  check('반복 저장 정확한 bytes',()=>{atomicSaveJSON(fs,target('existing'),oldData,process.pid);assert.equal(fs.readFileSync(target('existing'),'utf8'),serialized(oldData));noTemporary();});
  for(const mode of ['write','rename'])check('주입 '+mode+' 실패: 실제 이전 bytes 보존·temp 정리',()=>{
    const file=target(mode);fs.writeFileSync(file,serialized(oldData));
    const original=fs.readFileSync(file);
    const wrapped=Object.create(fs);
    if(mode==='write')wrapped.writeFileSync=(descriptor,data,encoding)=>{fs.writeFileSync(descriptor,data.slice(0,17),encoding);throw Object.assign(new Error('injected partial write'),{code:'EIO'});};
    else wrapped.renameSync=()=>{throw Object.assign(new Error('injected rename'),{code:'EIO'});};
    assert.throws(()=>atomicSaveJSON(wrapped,file,newData,process.pid),error=>{evidence.errors.push({mode,kind:'injected',code:error.code,message:error.message});return error.code==='EIO';});
    assert.deepEqual(fs.readFileSync(file),original);noTemporary();
  });
  check('실제 ENOENT: 없는 부모 디렉터리',()=>{
    assert.throws(()=>atomicSaveJSON(fs,path.join(output,'absent','slot.json'),newData,process.pid),error=>{evidence.errors.push({kind:'actual OS',code:error.code,syscall:error.syscall});return error.code==='ENOENT';});noTemporary();
  });
  check('실제 wx 충돌: 외부 파일 보존',()=>{
    const file=target('collision');fs.writeFileSync(file,serialized(oldData));
    let foreign;
    const wrapped=Object.create(fs);
    wrapped.openSync=(temporary,flags)=>{foreign=temporary;fs.writeFileSync(temporary,'foreign fixture',{flag:'wx'});return fs.openSync(temporary,flags);};
    assert.throws(()=>atomicSaveJSON(wrapped,file,newData,process.pid),error=>{evidence.errors.push({kind:'actual OS with fixture-created collision',code:error.code});return error.code==='EEXIST';});
    assert.equal(fs.readFileSync(foreign,'utf8'),'foreign fixture');assert.equal(fs.readFileSync(file,'utf8'),serialized(oldData));
  });
  evidence.status='passed_actual_owned_file_io';
}catch(error){evidence.status=['EPERM','EACCES'].includes(error.code)?'blocked_no_bypass':'failed';evidence.failure={code:error.code,message:error.message};process.exitCode=1;
}finally{
  evidence.sourceHashAfter=sha(fs.readFileSync(path.join(root,'server.cjs')));
  evidence.productionUnchanged=evidence.sourceHashAfter===evidence.sourceSha256;
  evidence.files=fs.readdirSync(output).map(name=>({name,bytes:fs.statSync(path.join(output,name)).size,sha256:sha(fs.readFileSync(path.join(output,name)))}));
  evidence.completedAt=new Date().toISOString();
  fs.writeFileSync(new URL('./atomic-file-evidence.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify(evidence,null,2));
}
