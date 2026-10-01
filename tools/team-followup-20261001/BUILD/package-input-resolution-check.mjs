import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parse} from 'acorn';
const prefix='tools/team-followup-20261001/BUILD/package-input-resolution-',startedAt=new Date().toISOString();
const read=value=>JSON.parse(fs.readFileSync(value));
const prior=read('tools/team-followup-20261001/BUILD/package-ready-final-evidence.json');
const config=read('tools/team-followup-20261001/BUILD/package-ready-config.json');
const remotePath='outputs/team-review-20261002/persistence/remote-checkpoint.json',remote=read(remotePath);
const hash=data=>createHash('sha256').update(data).digest('hex');
const git=(...args)=>execFileSync('git',args,{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:128*1024*1024}).toString();
const head=git('rev-parse','HEAD').trim();
const trees=git('ls-tree','-r','-z',remote.sha).split('\0').filter(Boolean).map(line=>{const split=line.indexOf('\t');return {path:line.slice(split+1),oid:line.slice(0,split).split(' ')[2]};});
const treeMap=new Map();for(const entry of trees){const key=entry.path.normalize('NFC');treeMap.set(key,[...(treeMap.get(key)||[]),entry]);}
function digestFile(value){
  const absolute=path.resolve(value);let ancestor=path.parse(absolute).root;
  for(const segment of absolute.slice(ancestor.length).split('/')){ancestor=path.join(ancestor,segment);if(fs.lstatSync(ancestor).isSymbolicLink())throw Error('SYMLINK:'+value);}
  const descriptor=fs.openSync(value,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
  try{const before=fs.fstatSync(descriptor);if(!before.isFile()||before.nlink!==1)throw Error('NOT_REGULAR_SINGLE_LINK:'+value);
    const sha=createHash('sha256'),blob=createHash('sha1').update('blob '+before.size+'\0'),buffer=Buffer.alloc(1024*1024);let count;
    while((count=fs.readSync(descriptor,buffer,0,buffer.length,null))>0){sha.update(buffer.subarray(0,count));blob.update(buffer.subarray(0,count));}
    const after=fs.fstatSync(descriptor);if(before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw Error('CHANGED:'+value);
    return {sha256:sha.digest('hex'),oid:blob.digest('hex'),bytes:before.size,mtimeMs:before.mtimeMs,ctimeMs:before.ctimeMs};
  }finally{fs.closeSync(descriptor);}
}
const files=prior.inputFiles.map(input=>{const current=digestFile(input.path),matches=(treeMap.get(input.path.normalize('NFC'))||[]).filter(entry=>entry.oid===current.oid);return {path:input.path,...current,priorMatches:current.sha256===input.sha256,checkpointMatches:matches.length>0,headPaths:matches.map(entry=>entry.path),lfsPointer:input.lfsPointer??null};});
const excluded=files.filter(input=>input.lfsPointer||input.path.endsWith('.zip'));
const dependencyTexts=files.filter(input=>/\.(html|js|mjs|cjs|css|json|webmanifest|manifest)$/i.test(input.path)).map(input=>({path:input.path,text:fs.readFileSync(input.path,'utf8')}));
const exclusions=excluded.map(input=>{const filename=path.basename(input.path);const hits=dependencyTexts.flatMap(source=>source.text.split('\n').flatMap((line,index)=>line.includes(filename)||line.includes(input.path)?[{path:source.path,line:index+1,text:line.slice(0,500)}]:[]));return {path:input.path,sha256:input.sha256,lfsPointer:input.lfsPointer,hits,reason:hits.length?'DEPENDENCY_REVIEW_REQUIRED':'제작 원본/provenance: 선택 HTML/JS/CSS/JSON/manifest에서 파일명·전체경로 참조0; 활성 chunk/회전 forest 로더는 별도 이름 규칙',decision:hits.length?'KEEP_BLOCKED':'EXCLUDE_SOURCE_ONLY'};});
const selected=files.filter(input=>!exclusions.some(entry=>entry.path===input.path&&entry.decision==='EXCLUDE_SOURCE_ONLY'));
config.inputRoots=selected.map(input=>input.path);config.inputs=selected.map(({path,sha256})=>({path,sha256}));
config.backup={sha:remote.sha,remoteSha:remote.remoteSha,remoteRef:remote.ref,verifiedAt:remote.at,inputs:selected.filter(input=>input.checkpointMatches).map(({path,sha256})=>({path,sha256}))};
config.backupEvidence={providedBy:'root 제공 파일; BUILD는 네트워크 조회0',path:remotePath,sha256:hash(fs.readFileSync(remotePath)),remoteObservedAt:remote.at,buildReadAt:startedAt};
config.outputRoot=path.resolve('outputs/mac-package-ready');config.port=3381;config.executionApproved=false;config.status='INPUT_RESOLVED_PLAN_PENDING';
config.limits=['정확 파일 allowlist; 보호규칙 변경0','root 제공 원격 증거와 로컬 객체 대조; 신규 네트워크 확인 아님','실행 승인0; outputRoot/port점유/정식plan/실행보안검수는root 게이트','미검수 임의 동적 경로는 UNKNOWN'];
const dynamic=read('tools/team-followup-20261001/BUILD/package-ready-dynamic-evidence.json');
const selectedMap=new Map(selected.map(input=>[input.path,input]));
const bounded=dynamic.checks.map(entry=>({...entry,currentSelected:!!selectedMap.get(entry.path),currentSHA: selectedMap.get(entry.path)?.sha256,unchanged:selectedMap.get(entry.path)?.sha256===entry.sha256}));
const game=dependencyTexts.find(entry=>entry.path==='game.html').text,easy=dependencyTexts.find(entry=>entry.path==='game-easy-test.html').text;
const dynamicLocks=dynamic.locks.gameSHA===hash(game)&&dynamic.locks.easySHA===hash(easy);
const runtimeRoot=path.join(config.runtime.cacheRoot,'nwjs-v0.111.2-osx-arm64');
const runtimeChecks=config.runtime.files.map(entry=>{const absolute=path.join(runtimeRoot,entry.path);if(entry.target!==undefined){const target=fs.readlinkSync(absolute),resolved=fs.realpathSync(absolute);return {path:entry.path,match:target===entry.target&&hash('symlink:'+target)===entry.sha256,internal:resolved.startsWith(runtimeRoot+'/')&&!path.isAbsolute(target)};}return {path:entry.path,match:digestFile(absolute).sha256===entry.sha256};});
const releaseMatch=digestFile(config.runtime.releaseInfoPath).sha256===config.runtime.releaseInfoSha256;
const packageInfo=read('package.json'),server=fs.readFileSync('node-main.js','utf8');
const id='a0230e74-f7bb-4acd-923d-ae9873700860',job=path.join(config.outputRoot,'mac-packager-'+id),profile=path.join(job,'user-state/profile'),saveRoot=path.join(job,'user-state/saves');
const portNeedle='const PORT = 3333;',saveNeedle="const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');";
const derivedServer=server.replace(portNeedle,'const PORT = 3381;').replace(saveNeedle,'const SAVE_DIR = '+JSON.stringify(saveRoot)+';');
const derivedPackage={...packageInfo,main:'http://127.0.0.1:3381/index.html?demo=1','node-remote':['http://127.0.0.1:3381','http://localhost:3381'],'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\S+/, '--user-data-dir='+JSON.stringify(profile))};
parse(derivedServer,{ecmaVersion:'latest',sourceType:'script'});
const isolation={portNeedleUnique:server.split(portNeedle).length===2,saveNeedleUnique:server.split(saveNeedle).length===2,profileArgumentUnique:(packageInfo['chromium-args'].match(/--user-data-dir=\S+/g)||[]).length===1,derivedServerParse:true,listenLoopback:derivedServer.includes(".listen(PORT, '127.0.0.1'"),paths:{job,profile,saveRoot},derivedMain:derivedPackage.main,derivedRemote:derivedPackage['node-remote'],derivedProfile:derivedPackage['chromium-args'].match(/--user-data-dir=.+$/)?.[0],serverNoOriginalSave:!derivedServer.includes(saveNeedle),limits:'정적 파생 검수만; 포트점유/프로필 실제쓰기/앱이동후 절대경로/실행0; 기존 보안 args는 변경하지 않았으며 보안 인수 아님'};
const changedAtEnd=files.filter(input=>{const stat=fs.statSync(input.path);return stat.size!==input.bytes||stat.mtimeMs!==input.mtimeMs||stat.ctimeMs!==input.ctimeMs;}).map(input=>input.path);
const headAfter=git('rev-parse','HEAD').trim();
const gates=[];if(head!==remote.sha||headAfter!==head||!remote.verified||remote.sha!==remote.remoteSha)gates.push('HEAD/원격증거 불일치');
if(files.some(input=>!input.priorMatches))gates.push('기존 입력 이후 SHA 변경');if(selected.some(input=>!input.checkpointMatches))gates.push('정확 입력 미백업');if(exclusions.some(entry=>entry.hits.length))gates.push('제외 후보 직접 의존성');if(changedAtEnd.length)gates.push('검사 중 변경');if(!dynamicLocks||bounded.some(entry=>!entry.currentSelected||!entry.unchanged))gates.push('524 동적 계약 변경');if(runtimeChecks.some(entry=>!entry.match||entry.internal===false)||!releaseMatch)gates.push('runtime 변경');
if(!fs.existsSync(config.outputRoot))gates.push('root outputRoot 준비 필요');
const result={startedAt,completedAt:new Date().toISOString(),head,headAfter,remoteEvidence:config.backupEvidence,inputCount:files.length,inputBytes:files.reduce((sum,input)=>sum+input.bytes,0),selectedCount:selected.length,selectedBytes:selected.reduce((sum,input)=>sum+input.bytes,0),manifestSHA:hash(JSON.stringify(config.inputs)),files,exclusions,dependencyTextCount:dependencyTexts.length,bounded,dynamicLocks,runtimeChecks,releaseMatch,isolation,changedAtEnd,gates,unbacked:selected.filter(input=>!input.checkpointMatches).map(input=>input.path),unknown:'전체 임의 JS 문자열 합성·외부 global 호출 완전성 UNKNOWN; 활성 유한 chunk/projectile 집합 및 이름/manifest 참조 검수와 구분'};
fs.writeFileSync(prefix+'config.json',JSON.stringify(config,null,2)+'\n');fs.writeFileSync(prefix+'evidence.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({startedAt:result.startedAt,completedAt:result.completedAt,head,inputCount:result.inputCount,selectedCount:result.selectedCount,selectedBytes:result.selectedBytes,exclusions:exclusions.map(({path,hits})=>({path,hits:hits.length})),unbacked:result.unbacked,gates,runtimeChecks:runtimeChecks.length,bounded:bounded.length,dependencyTexts:dependencyTexts.length,isolation}));
