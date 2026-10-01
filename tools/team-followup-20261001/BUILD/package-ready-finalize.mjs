import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {parse} from 'acorn';
const owned='tools/team-followup-20261001/BUILD/',root=process.cwd(),startedAt=new Date().toISOString();
const evidence=JSON.parse(fs.readFileSync(owned+'package-ready-evidence.json')),config=JSON.parse(fs.readFileSync(owned+'package-ready-config.json'));
const git=(...args)=>execFileSync('git',args,{env:{...process.env,GIT_OPTIONAL_LOCKS:'0'},maxBuffer:128*1024*1024});
const sha=data=>createHash('sha256').update(data).digest('hex');
const treeEntries=git('ls-tree','-r','-z',evidence.head).toString().split('\0').filter(Boolean).map(line=>{const split=line.indexOf('\t');return {path:line.slice(split+1),oid:line.slice(0,split).split(' ')[2]};});
const aliases=[];
for(const input of evidence.unbacked.filter(entry=>entry.backupStatus==='UNTRACKED_NOT_IN_HEAD')){
  const candidates=treeEntries.filter(entry=>entry.path.normalize('NFC')===input.path.normalize('NFC'));const matching=candidates.filter(entry=>entry.oid===input.workingBlobOid);
  aliases.push({path:input.path,candidates,matching});
  if(matching.length){const actual=evidence.inputFiles.find(entry=>entry.path===input.path);actual.backupStatus='MATCH_LOCAL_HEAD_NORMALIZATION_ALIAS';actual.headSha256=actual.sha256;actual.headBlobOid=matching[0].oid;actual.headAliasPaths=matching.map(entry=>entry.path);if(new Set(candidates.map(entry=>entry.oid)).size>1)evidence.blockers.push({path:input.path,reason:'NORMALIZED_HEAD_PATHS_DIFFERENT_CONTENT',candidates});}
}
function digestFile(absolute){const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{const stat=fs.fstatSync(descriptor);if(!stat.isFile()||stat.nlink!==1)throw Error('NOT_SINGLE_LINK_REGULAR');const hash=createHash('sha256'),blob=createHash('sha1').update('blob '+stat.size+'\0'),buffer=Buffer.alloc(1024*1024);let prefix=Buffer.alloc(0),count,total=0;while((count=fs.readSync(descriptor,buffer,0,buffer.length,null))>0){const data=buffer.subarray(0,count);hash.update(data);blob.update(data);if(prefix.length<512)prefix=Buffer.concat([prefix,data.subarray(0,512-prefix.length)]);total+=count;}const after=fs.fstatSync(descriptor);if(total!==stat.size||after.mtimeMs!==stat.mtimeMs||after.ctimeMs!==stat.ctimeMs)throw Error('CHANGED_DURING_HASH');return {sha256:hash.digest('hex'),workingBlobOid:blob.digest('hex'),bytes:total,prefix};}finally{fs.closeSync(descriptor);}}
for(const blocker of evidence.blockers.filter(entry=>entry.reason==='PROTECTED_FILE_NOT_READ'&&entry.path.endsWith('.zip'))){
  const data=digestFile(path.join(root,blocker.path));const head=treeEntries.find(entry=>entry.path===blocker.path);const text=data.prefix.toString();let pointer=null;if(text.startsWith('version https://git-lfs.github.com/spec/v1\n'))pointer={oid:/oid sha256:([a-f0-9]{64})/.exec(text)?.[1],size:Number(/size (\d+)/.exec(text)?.[1])};
  evidence.inputFiles.push({path:blocker.path,sha256:data.sha256,bytes:data.bytes,workingBlobOid:data.workingBlobOid,headBlobOid:head?.oid??null,headSha256:head?.oid===data.workingBlobOid?data.sha256:null,backupStatus:head?.oid===data.workingBlobOid?'MATCH_LOCAL_HEAD':'MODIFIED_NOT_IN_HEAD',lfsPointer:pointer,packagerRejected:true});
  blocker.reason='PACKAGER_PROTECTED_ZIP_INPUT';if(pointer)evidence.blockers.push({path:blocker.path,reason:'LFS_POINTER_NOT_PAYLOAD',pointer});
}
const refs=[],parseErrors=[],scriptStyle=[],textSha=[];
function addReference(file,value,line,kind){if(typeof value!=='string'||/^(?:data:|https?:|\/\/|#)/.test(value))return;const stripped=value.split(/[?#]/)[0];if(!stripped||stripped==='/')return;if(!/\.(?:png|webp|jpe?g|gif|svg|ico|mp3|wav|ogg|mp4|webm|js|css|json|glb|gltf|woff2?)$/i.test(stripped))return;const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),stripped.replace(/^\//,'')));const covered=config.inputRoots.some(selection=>resolved===selection||resolved.startsWith(selection+'/'));refs.push({from:file,line,value,resolved,exists:fs.existsSync(path.join(root,resolved)),covered,kind});}
function traverse(node,file,parent=null,offset=0){if(!node||typeof node!=='object')return;
  if(node.type==='Literal'&&typeof node.value==='string'){
    const explicitPrefix=/^(?:assets|img|sprites|bgm|sfx|video|localization|output)\//.test(node.value);
    const assignment=parent?.type==='AssignmentExpression'&&['src','href'].includes(parent.left?.property?.name);
    const fetchArgument=parent?.type==='CallExpression'&&parent.callee?.name==='fetch'&&parent.arguments[0]===node;
    if(explicitPrefix||assignment||fetchArgument)addReference(file,node.value,(node.loc?.start.line||0)+offset,assignment||fetchArgument?'explicit-load-literal':'prefixed-path-literal-candidate');
  }
  if(node.type==='TemplateLiteral'&&node.expressions.length>0){const prefix=node.quasis[0]?.value.cooked;if(/^(?:assets|img|sprites|bgm|sfx|video|localization|output)\//.test(prefix||''))refs.push({from:file,line:(node.loc?.start.line||0)+offset,value:prefix+'${...}',kind:'dynamic-template',prefixCovered:config.inputRoots.some(selection=>prefix.startsWith(selection+'/')||prefix===selection+'/'),requiresRuntimeResolution:true});}
  for(const [key,value] of Object.entries(node)){if(key==='loc')continue;if(Array.isArray(value))value.forEach(entry=>traverse(entry,file,node,offset));else if(value&&typeof value==='object')traverse(value,file,node,offset);}
}
for(const input of evidence.inputFiles.filter(entry=>/\.(?:html|js|css)$/.test(entry.path)&&entry.bytes<20*1024*1024)){
  const text=fs.readFileSync(path.join(root,input.path),'utf8');textSha.push({path:input.path,sha256:sha(text),matchesScan:sha(text)===input.sha256});
  if(input.path.endsWith('.html')){
    for(const match of text.matchAll(/<(script|link)\b[^>]*?\b(?:src|href)\s*=\s*(["'])([^"']+)\2[^>]*>/gi)){const value=match[3];if(/^(?:https?:|\/\/|data:)/.test(value)){scriptStyle.push({from:input.path,value,external:true});continue;}addReference(input.path,value,text.slice(0,match.index).split('\n').length,'direct-script-style');scriptStyle.push(refs.at(-1));}
    for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc\s*=|application\/(?:ld\+)?json|importmap/i.test(match[1]))continue;try{const sourceType=/\btype\s*=\s*["']module["']/i.test(match[1])?'module':'script';const offset=text.slice(0,match.index+match[0].indexOf('>')+1).split('\n').length-1;traverse(parse(match[2],{ecmaVersion:'latest',sourceType,allowAwaitOutsideFunction:true,allowReturnOutsideFunction:true,locations:true}),input.path,null,offset);}catch(error){parseErrors.push({path:input.path,reason:error.message});}}
  }else if(input.path.endsWith('.js')){try{traverse(parse(text,{ecmaVersion:'latest',sourceType:'module',allowAwaitOutsideFunction:true,locations:true}),input.path);}catch(error){parseErrors.push({path:input.path,reason:error.message});}}
  for(const match of text.matchAll(/url\(\s*(["']?)([^"')\r\n]+)\1\s*\)/g))addReference(input.path,match[2],null,'css-url-candidate');
}
const directMissing=refs.filter(entry=>entry.kind==='direct-script-style'&&(!entry.exists||!entry.covered));for(const entry of directMissing)evidence.blockers.push({path:entry.resolved,reason:'DIRECT_SCRIPT_STYLE_MISSING_OR_NOT_SELECTED',from:entry.from});
const missingCandidates=refs.filter(entry=>entry.exists===false),dynamicTemplates=refs.filter(entry=>entry.kind==='dynamic-template');
evidence.inputFiles.sort((first,second)=>first.path.localeCompare(second.path));evidence.unbacked=evidence.inputFiles.filter(entry=>!entry.backupStatus.startsWith('MATCH_'));
config.inputs=evidence.inputFiles.map(({path,sha256})=>({path,sha256}));config.backup.inputs=evidence.inputFiles.filter(entry=>entry.backupStatus==='MATCH_LOCAL_HEAD'||entry.backupStatus==='MATCH_LOCAL_HEAD_NORMALIZATION_ALIAS').map(({path,sha256})=>({path,sha256}));config.outputRoot=path.join(root,'outputs/mac-package-ready');config.executionApproved=false;
config.limits=['로컬HEAD내용대조는원격보존증거아님','미백업HTML현재SHA를backup.inputs에포함하지않음','LFS/ZIP보호거부/동적참조미검수/출력root미생성해소전execute0'];
evidence.inputCount=evidence.inputFiles.length;evidence.inputBytes=evidence.inputFiles.reduce((sum,input)=>sum+input.bytes,0);evidence.inputManifestSha256=sha(JSON.stringify(config.inputs));evidence.aliases=aliases;evidence.finalizedAt=new Date().toISOString();evidence.finalHead=git('rev-parse','HEAD').toString().trim();evidence.referenceAudit={startedAt,textSha,scriptStyle,refs,parseErrors,directMissing,missingCandidates,dynamicTemplates,verdict:'필수직접script/style와정적리터럴후보를분리;후보에는비활성/폴백/문자열조각포함. 동적분기전체는실제검수전UNKNOWN·실행승인불가'};evidence.limitations='로컬read-only Git/입력스캔만;원격/Git쓰기/execute/앱/게임/세이브0';
evidence.outsideInputChanges=git('diff','--name-only','-z',evidence.head).toString().split('\0').filter(file=>file&&!config.inputRoots.some(selection=>file===selection||file.startsWith(selection+'/')));
fs.writeFileSync(owned+'package-ready-config.json',JSON.stringify(config,null,2)+'\n');fs.writeFileSync(owned+'package-ready-final-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({inputCount:evidence.inputCount,inputBytes:evidence.inputBytes,localHeadMatch:evidence.inputFiles.filter(entry=>entry.backupStatus.startsWith('MATCH_')).length,unbacked:evidence.unbacked.map(entry=>entry.path),normalizationAliases:aliases.length,runtimeCount:evidence.runtimeCount,runtimeBytes:evidence.runtimeBytes,links:evidence.runtimeFiles.filter(entry=>entry.target).length,blockers:evidence.blockers,directMissing,missingCandidateCount:missingCandidates.length,dynamicTemplateCount:dynamicTemplates.length,parseErrors,textChanged:textSha.filter(entry=>!entry.matchesScan),finalHead:evidence.finalHead}));
