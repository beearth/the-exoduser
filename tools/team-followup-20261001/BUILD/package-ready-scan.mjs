import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),owned='tools/team-followup-20261001/BUILD/',startedAt=new Date().toISOString();
const git=(...args)=>execFileSync('git',args,{cwd:root,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:128*1024*1024});
const sha=data=>createHash('sha256').update(data).digest('hex');
const head=git('rev-parse','HEAD').toString().trim();if(git('rev-parse','--show-object-format').toString().trim()!=='sha1')throw Error('UNSUPPORTED_GIT_OBJECT_FORMAT');
const tree=new Map(git('ls-tree','-r','-z',head).toString().split('\0').filter(Boolean).map(line=>{const split=line.indexOf('\t'),[mode,type,oid]=line.slice(0,split).split(' ');return [line.slice(split+1),{mode,type,oid}];}));
const draft=JSON.parse(fs.readFileSync(owned+'runtime-acquire-config-draft.json'));
const acquisition=JSON.parse(fs.readFileSync('outputs/team-review-20261002/persistence/runtime-root-acquisition.json'));
const inputFiles=[],runtimeFiles=[],blockers=[],sourceStats=[];
const forbidden=relative=>relative.split('/').some(segment=>/^(saves?|userdata.*|profiles?|\.git|\.env.*|node_modules|tmp|dist(?:-.*)?|out)$/i.test(segment)||/\.(app|exe|dll|nw|zip|pem|key)$/i.test(segment));
function digestFile(absolute){
  const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{
    const before=fs.fstatSync(descriptor);if(!before.isFile()||before.nlink!==1)throw Error('NOT_SINGLE_LINK_REGULAR');
    const sha256=createHash('sha256'),blob=createHash('sha1').update(Buffer.from('blob '+before.size+'\0'));const buffer=Buffer.alloc(1024*1024);let bytes=0,prefix=Buffer.alloc(0),count;
    while((count=fs.readSync(descriptor,buffer,0,buffer.length,null))>0){const part=buffer.subarray(0,count);sha256.update(part);blob.update(part);if(prefix.length<512)prefix=Buffer.concat([prefix,part.subarray(0,512-prefix.length)]);bytes+=count;}
    const after=fs.fstatSync(descriptor);if(bytes!==before.size||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw Error('CHANGED_DURING_HASH');
    return {sha256:sha256.digest('hex'),blobOid:blob.digest('hex'),bytes,prefix,stat:{size:after.size,mtimeMs:after.mtimeMs,ctimeMs:after.ctimeMs,dev:after.dev,ino:after.ino}};
  }finally{fs.closeSync(descriptor);}
}
function lfsPointer(data){const text=data.toString();if(!text.startsWith('version https://git-lfs.github.com/spec/v1\n'))return null;const oid=/^oid sha256:([a-f0-9]{64})$/m.exec(text),size=/^size (\d+)$/m.exec(text);return {oid:oid?.[1]??null,size:size?Number(size[1]):null};}
function walkSource(relative){
  const absolute=path.join(root,relative);let stat;try{stat=fs.lstatSync(absolute);}catch(error){blockers.push({path:relative,reason:'MISSING:'+error.code});return;}
  if(stat.isSymbolicLink()){blockers.push({path:relative,reason:'SOURCE_SYMLINK'});return;}
  if(stat.isDirectory()){if(forbidden(relative)){blockers.push({path:relative,reason:'PROTECTED_DIRECTORY_NOT_READ'});return;}for(const name of fs.readdirSync(absolute).sort())walkSource(relative+'/'+name);return;}
  if(!stat.isFile()){blockers.push({path:relative,reason:'NON_REGULAR'});return;}
  if(forbidden(relative)){blockers.push({path:relative,reason:'PROTECTED_FILE_NOT_READ'});return;}
  try{
    const result=digestFile(absolute),tracked=tree.get(relative),pointer=lfsPointer(result.prefix);let backupStatus=tracked?'MODIFIED_NOT_IN_HEAD':'UNTRACKED_NOT_IN_HEAD',headSha256=null,headPointer=null;
    if(tracked&&tracked.oid===result.blobOid){backupStatus='MATCH_LOCAL_HEAD';headSha256=result.sha256;}
    else if(tracked&&tracked.type==='blob'){
      const headSize=Number(git('cat-file','-s',tracked.oid).toString());
      if(headSize<=1024*1024*24){const headBytes=git('cat-file','blob',tracked.oid);headSha256=sha(headBytes);headPointer=lfsPointer(headBytes);if(headPointer&&headPointer.oid===result.sha256&&headPointer.size===result.bytes)backupStatus='MATCH_HEAD_LFS_OID_LOCAL_CONTENT_ONLY';}
    }
    if(pointer)blockers.push({path:relative,reason:'LFS_POINTER_NOT_PAYLOAD',pointer});
    const entry={path:relative,sha256:result.sha256,bytes:result.bytes,workingBlobOid:result.blobOid,headBlobOid:tracked?.oid??null,headSha256,headPointer,backupStatus,lfsPointer:pointer};inputFiles.push(entry);sourceStats.push({path:relative,...result.stat});
    if(inputFiles.length%2000===0)console.log(JSON.stringify({sourceHashed:inputFiles.length,bytes:inputFiles.reduce((sum,input)=>sum+input.bytes,0)}));
  }catch(error){blockers.push({path:relative,reason:String(error.message)});}
}
for(const selection of draft.inputRoots)walkSource(selection);
const runtimeRoot=path.join(acquisition.cacheRoot,'nwjs-v0.111.2-osx-arm64');
function walkRuntime(relative){
  const absolute=path.join(runtimeRoot,relative),stat=fs.lstatSync(absolute);
  if(stat.isSymbolicLink()){
    const target=fs.readlinkSync(absolute);let resolved=null;try{resolved=fs.realpathSync(absolute);}catch(error){blockers.push({path:absolute,reason:'RUNTIME_DANGLING_LINK:'+error.code});}
    const internal=resolved?.startsWith(runtimeRoot+path.sep)&&!path.isAbsolute(target);if(!internal)blockers.push({path:absolute,reason:'RUNTIME_EXTERNAL_OR_ABSOLUTE_LINK',target,resolved});runtimeFiles.push({path:relative,sha256:sha('symlink:'+target),target,resolved,internal:!!internal});return;
  }
  if(stat.isDirectory()){for(const name of fs.readdirSync(absolute).sort())walkRuntime(relative+'/'+name);return;}
  const result=digestFile(absolute);runtimeFiles.push({path:relative,sha256:result.sha256,bytes:result.bytes});
}
try{walkRuntime('nwjs.app');}catch(error){blockers.push({path:runtimeRoot,reason:'RUNTIME_SCAN:'+String(error.message)});}
const binaryPath=path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'),header=Buffer.alloc(8);let runtimeArchitecture;
try{const descriptor=fs.openSync(binaryPath,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{fs.readSync(descriptor,header,0,8,0);}finally{fs.closeSync(descriptor);}runtimeArchitecture={magic:header.readUInt32LE(0).toString(16),cpu:header.readUInt32LE(4).toString(16),arm64:header.readUInt32LE(0)===0xfeedfacf&&header.readUInt32LE(4)===0x0100000c};if(!runtimeArchitecture.arm64)blockers.push({path:binaryPath,reason:'MACHO_ARM64_MISMATCH'});}catch(error){blockers.push({path:binaryPath,reason:String(error.message)});}
let archiveVerification;try{const archive=digestFile(acquisition.archive);archiveVerification={sha256:archive.sha256,officialSha256:acquisition.officialSha256,bytes:archive.bytes,match:archive.sha256===acquisition.officialSha256};if(!archiveVerification.match)blockers.push({path:acquisition.archive,reason:'ARCHIVE_SHA_MISMATCH'});}catch(error){blockers.push({path:acquisition.archive,reason:String(error.message)});}
const releaseBytes=fs.readFileSync(acquisition.releaseInfoPath),releaseInfoSha256=sha(releaseBytes);if(releaseInfoSha256!==acquisition.releaseInfoSha256)blockers.push({path:acquisition.releaseInfoPath,reason:'RELEASE_INFO_SHA_MISMATCH'});
const changedDuringScan=sourceStats.filter(record=>{try{const stat=fs.lstatSync(path.join(root,record.path));return stat.size!==record.size||stat.mtimeMs!==record.mtimeMs||stat.ctimeMs!==record.ctimeMs||stat.ino!==record.ino||stat.dev!==record.dev;}catch{return true;}}).map(record=>record.path);
const headAfter=git('rev-parse','HEAD').toString().trim();if(headAfter!==head)blockers.push({path:'.git/HEAD',reason:'HEAD_CHANGED',before:head,after:headAfter});for(const file of changedDuringScan)blockers.push({path:file,reason:'SOURCE_CHANGED_DURING_SCAN'});
const sortedInputs=inputFiles.sort((first,second)=>first.path.localeCompare(second.path)),sortedRuntime=runtimeFiles.sort((first,second)=>first.path.localeCompare(second.path));
const unbacked=sortedInputs.filter(input=>!input.backupStatus.startsWith('MATCH_'));const outputRoot=path.join(root,'outputs/mac-package-ready');if(!fs.existsSync(outputRoot))blockers.push({path:outputRoot,reason:'OUTPUT_ROOT_MISSING_ROOT_MUST_CREATE'});
const config={sourceRoot:root,outputRoot,arch:'arm64',port:3381,inputRoots:draft.inputRoots,inputs:sortedInputs.map(({path,sha256})=>({path,sha256})),backup:{sha:head,remoteSha:null,remoteRef:'UNKNOWN',verifiedAt:null,inputs:sortedInputs.filter(input=>input.backupStatus==='MATCH_LOCAL_HEAD').map(input=>({path:input.path,sha256:input.sha256}))},runtime:{cacheRoot:acquisition.cacheRoot,releaseInfoPath:acquisition.releaseInfoPath,releaseInfoSha256,files:sortedRuntime.map(({path,sha256,target})=>({path,sha256,...(target===undefined?{}:{target})}))},executionApproved:false,status:'BLOCKED_PRE_EXECUTE',limits:['로컬 HEAD 일치는 원격 보존 증거가 아니다','미백업 입력의 이전 SHA를 현재 SHA로 채우지 않는다','저장 수정 두 HTML은 root 다음 커밋 후 재대조','포트 점유·파생 서버·전체 동적 참조는 별도 게이트']};
const changedPaths=git('diff','--name-only',head).toString().trim().split('\n').filter(Boolean);const outsideInputChanges=changedPaths.filter(file=>!draft.inputRoots.some(selection=>file===selection||file.startsWith(selection+'/')));
const result={startedAt,completedAt:new Date().toISOString(),head,headAfter,inputRoots:draft.inputRoots.length,inputCount:sortedInputs.length,inputBytes:sortedInputs.reduce((sum,input)=>sum+input.bytes,0),inputManifestSha256:sha(JSON.stringify(config.inputs)),runtimeCount:sortedRuntime.length,runtimeBytes:sortedRuntime.reduce((sum,input)=>sum+(input.bytes||0),0),runtimeManifestSha256:sha(JSON.stringify(config.runtime.files)),runtimeArchitecture,archiveVerification,releaseInfo:JSON.parse(releaseBytes),inputFiles:sortedInputs,runtimeFiles:sortedRuntime,unbacked,blockers,changedDuringScan,outsideInputChanges,limitations:'Git 로컬 읽기 전용·저장 내용 접근0·실제 execute0; 런타임 SHA는 root 공식 취득 기록과 대조; 전체 정적 참조·동적 경로 완전성 미확정'};
fs.writeFileSync(owned+'package-ready-config.json',JSON.stringify(config,null,2)+'\n');fs.writeFileSync(owned+'package-ready-evidence.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({completedAt:result.completedAt,head,inputCount:result.inputCount,inputBytes:result.inputBytes,runtimeCount:result.runtimeCount,runtimeBytes:result.runtimeBytes,unbacked:unbacked.map(entry=>({path:entry.path,status:entry.backupStatus})),blockers,changedDuringScan,outsideInputChangeCount:outsideInputChanges.length}));
