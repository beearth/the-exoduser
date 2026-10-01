import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {buildSharedMatsCandidate} from '../BALANCE/shared-mats-atomic-candidate.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const preserved=['server.cjs','node-main.js',...fs.readdirSync(path.join(root,'tools/team-followup-20261001/BALANCE')).filter(name=>name.startsWith('shared-mats-atomic-')).map(name=>'tools/team-followup-20261001/BALANCE/'+name)];
const before=Object.fromEntries(preserved.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
const sources=Object.fromEntries(['server.cjs','node-main.js'].map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
const base=fileURLToPath(new URL('../../../outputs/team-review-20261002/four-candidate-acceptance/balance-root-fixtures/',import.meta.url));
const evidence={startedAt:new Date().toISOString(),runtime:{node:process.version,platform:process.platform,arch:process.arch},before,checks:[],errors:[],counterexamples:[],hashes:{}};
let output;
function noTemp(directory){assert(!fs.readdirSync(directory).some(name=>name.includes('.tmp-')));}
async function invoke(candidate,file,method,mats,implementation=fs,original=false){
  const replies=[];
  const context=vm.createContext({fs:implementation,MATS_FILE:file,pathname:'/api/mats',req:{method},res:{},process:{pid:process.pid},Date:{now:()=>123456},readBody:async()=>({mats}),sendJSON:(res,status,data)=>{replies.push({status,data});return {status,data};}});
  try{return await vm.runInContext(candidate.helperCode+'\n(async()=>{'+(method==='GET'?candidate.get:original?candidate.originalPost:candidate.candidatePost)+'})()',context);}
  catch(error){assert.equal(replies.length,0);throw error;}
}
async function check(name,callback){await callback();evidence.checks.push(name);}
try{
  fs.mkdirSync(base,{recursive:true});output=fs.mkdtempSync(path.join(base,'run-'));evidence.output=output;
  for(const [sourceFile,source] of Object.entries(sources)){
    const candidate=buildSharedMatsCandidate(sources['server.cjs'],source);
    evidence.hashes[sourceFile]={get:sha(candidate.get),post:sha(candidate.originalPost),helper:sha(candidate.helperCode)};
    const directory=path.join(output,sourceFile.replace('.','-'));fs.mkdirSync(directory);
    const file=path.join(directory,'_sharedMats.json');
    await check(sourceFile+' 신규 실제 bytes/GET/콜백ACK',async()=>{
      const response=await invoke(candidate,file,'POST',100);assert.equal(JSON.stringify(response),JSON.stringify({status:200,data:{ok:true,mats:100}}));assert.deepEqual(JSON.parse(fs.readFileSync(file)),{mats:100,ts:123456});assert.equal((await invoke(candidate,file,'GET')).data.mats,100);noTemp(directory);
    });
    await check(sourceFile+' 기존 교체',async()=>{await invoke(candidate,file,'POST',4567);assert.equal((await invoke(candidate,file,'GET')).data.mats,4567);noTemp(directory);});
    await check(sourceFile+' 반복 저장·clamp/schema 10입력',async()=>{
      for(const mats of [-1,0,1.9,'12.7','bad',null,undefined,Infinity,-Infinity,Number.MAX_SAFE_INTEGER+100]){
        const normalized=Math.max(0,Math.min(Math.floor(+mats||0),Number.MAX_SAFE_INTEGER));
        const response=await invoke(candidate,file,'POST',mats);assert.equal(response.data.mats,normalized);assert.deepEqual(JSON.parse(fs.readFileSync(file)),{mats:normalized,ts:123456});assert.equal((await invoke(candidate,file,'GET')).data.mats,normalized);noTemp(directory);
      }
    });
    for(const mode of ['write','rename'])await check(sourceFile+' '+mode+'주입 실패 이전bytes/GET/temp/ACK0',async()=>{
      await invoke(candidate,file,'POST',4567);const bytes=fs.readFileSync(file);
      const wrapped=Object.create(fs);
      if(mode==='write')wrapped.writeFileSync=(descriptor,data,encoding)=>{assert.equal(typeof descriptor,'number');fs.writeFileSync(descriptor,data.slice(0,8),encoding);throw Object.assign(Error('injected partial write'),{code:'EIO'});};
      else wrapped.renameSync=()=>{throw Object.assign(Error('injected rename'),{code:'EIO'});};
      await assert.rejects(invoke(candidate,file,'POST',100,wrapped),error=>{evidence.errors.push({sourceFile,mode,kind:'injected',code:error.code});return error.code==='EIO';});assert.deepEqual(fs.readFileSync(file),bytes);assert.equal((await invoke(candidate,file,'GET')).data.mats,4567);noTemp(directory);
    });
    await check(sourceFile+' 실제ENOENT POST거부/GET0',async()=>{
      const absent=path.join(directory,'absent','_sharedMats.json');await assert.rejects(invoke(candidate,absent,'POST',100),error=>{evidence.errors.push({sourceFile,kind:'actual OS',code:error.code,syscall:error.syscall});return error.code==='ENOENT';});assert.equal(JSON.stringify(await invoke(candidate,absent,'GET')),JSON.stringify({status:200,data:{ok:true,mats:0}}));noTemp(directory);
    });
    await check(sourceFile+' 원문 부분쓰기 실제 손상 GET0',async()=>{
      const redFile=path.join(directory,'_redMats.json');fs.writeFileSync(redFile,JSON.stringify({mats:4567,ts:99}));
      const wrapped=Object.create(fs);wrapped.writeFileSync=(destination,data,encoding)=>{assert.equal(destination,redFile);fs.writeFileSync(destination,data.slice(0,8),encoding);throw Object.assign(Error('injected original partial write'),{code:'EIO'});};
      await assert.rejects(invoke(candidate,redFile,'POST',100,wrapped,true),/injected/);const result=await invoke(candidate,redFile,'GET');assert.equal(result.data.mats,0);assert.throws(()=>JSON.parse(fs.readFileSync(redFile)));evidence.counterexamples.push({sourceFile,input:{previous:4567,post:100,failure:'8 chars then injected EIO'},originalBytes:fs.readFileSync(redFile,'utf8'),originalGet:result.data,candidateGet:(await invoke(candidate,file,'GET')).data});noTemp(directory);
    });
  }
  evidence.status='actual_owned_files_14pass';
}catch(error){evidence.status=['EPERM','EACCES'].includes(error.code)?'blocked_no_bypass':'failed';evidence.failure={code:error.code,message:error.message};process.exitCode=1;
}finally{
  evidence.after=Object.fromEntries(preserved.map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));evidence.preserved=JSON.stringify(before)===JSON.stringify(evidence.after);
  if(output)evidence.files=fs.readdirSync(output).flatMap(directory=>fs.readdirSync(path.join(output,directory)).map(name=>{const file=path.join(output,directory,name);return {file:path.relative(output,file),bytes:fs.statSync(file).size,sha256:sha(fs.readFileSync(file))};}));
  evidence.completedAt=new Date().toISOString();evidence.limits='실제 소유 합성파일만. write/rename EIO주입 vs 실제ENOENT 구분. HTTP/앱/fsync/전원손실/크래시/Windows/동시writer 미검수';
  fs.writeFileSync(new URL('../../../outputs/team-review-20261002/four-candidate-acceptance/balance-root-file14.json',import.meta.url),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify(evidence,null,2));
}
