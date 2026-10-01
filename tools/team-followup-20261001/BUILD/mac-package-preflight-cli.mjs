import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const sha256=value=>createHash('sha256').update(value).digest('hex');
const forbidden=segment=>/^(saves?|userdata.*|profiles?|\.git|\.env.*|node_modules|tmp|dist(?:-.*)?|out)$/i.test(segment)||/\.(app|exe|dll|zip|nw|pem|key)$/i.test(segment);
function requireValue(condition,code){if(!condition)throw Error(code);}
function componentsSafe(absolute,allowMissing=false){
  const parsed=path.parse(absolute);let current=parsed.root;
  for(const segment of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)){
    current=path.join(current,segment);
    try{requireValue(!fs.lstatSync(current).isSymbolicLink(),'SYMLINK_REJECTED');}
    catch(error){if(error.code==='ENOENT'&&allowMissing)return;throw error;}
  }
}
function directory(value){requireValue(typeof value==='string'&&path.isAbsolute(value),'ABSOLUTE_ROOT_REQUIRED');const resolved=path.resolve(value);componentsSafe(resolved);requireValue(fs.statSync(resolved).isDirectory(),'DIRECTORY_REQUIRED');return resolved;}
function relativeFile(root,value){
  requireValue(typeof value==='string'&&value.length>0&&!value.includes('\\')&&!path.isAbsolute(value),'RELATIVE_FILE_REQUIRED');
  const segments=value.split('/');requireValue(segments.every(segment=>segment&&segment!=='.'&&segment!=='..'),'PATH_ESCAPE_REJECTED');
  requireValue(!segments.some(forbidden),'PROTECTED_INPUT_REJECTED');
  const absolute=path.resolve(root,value);requireValue(absolute.startsWith(root+path.sep),'PATH_ESCAPE_REJECTED');componentsSafe(absolute);
  const stat=fs.lstatSync(absolute);requireValue(stat.isFile()&&stat.nlink===1,'REGULAR_SINGLE_LINK_FILE_REQUIRED');return absolute;
}
function digestFile(absolute){
  const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);
  try{const before=fs.fstatSync(descriptor);requireValue(before.isFile()&&before.nlink===1,'REGULAR_SINGLE_LINK_FILE_REQUIRED');const data=fs.readFileSync(descriptor);const after=fs.fstatSync(descriptor);requireValue(before.size===after.size&&before.mtimeMs===after.mtimeMs&&before.ctimeMs===after.ctimeMs,'INPUT_CHANGED_DURING_READ');return sha256(data);}finally{fs.closeSync(descriptor);}
}
export function preflight(manifest){
  const result={mode:'dry-run/read-only',at:new Date().toISOString(),status:'BLOCKED',checks:[],limitations:['원격SHA는제공된증거대조이며Git원격독립조회아님','명시목록만검사;전체에셋완전성/런타임서명/코덱/실행검수아님','출력경로는예약하지않음;실제생성직전독점mkdir와전체입력재검증필요']};
  const check=(name,run)=>{try{const evidence=run();result.checks.push({name,pass:true,evidence});return evidence;}catch(error){result.checks.push({name,pass:false,error:String(error.message)});return null;}};
  const root=check('입력root',()=>directory(manifest.sourceRoot));
  check('원격복구증거',()=>{
    const backup=manifest.backup;requireValue(backup&&/^[a-f0-9]{40}$/.test(backup.localSha)&&backup.localSha===backup.remoteSha,'BACKUP_SHA_MISMATCH');
    requireValue(typeof backup.remoteRef==='string'&&/^refs\/(heads|tags)\/[A-Za-z0-9_./-]+$/.test(backup.remoteRef)&&typeof backup.verifiedAt==='string'&&Number.isFinite(Date.parse(backup.verifiedAt)),'BACKUP_EVIDENCE_REQUIRED');
    return {localSha:backup.localSha,remoteSha:backup.remoteSha,remoteRef:backup.remoteRef,verifiedAt:backup.verifiedAt,trust:'제공된증거;외부조회0'};
  });
  check('명시입력SHA/원격보존입력SHA',()=>{
    requireValue(root&&Array.isArray(manifest.inputs)&&manifest.inputs.length>0&&manifest.inputs.length<=10000,'INPUT_LIST_REQUIRED');
    const seen=new Set();return manifest.inputs.map(input=>{
      requireValue(!seen.has(input.path),'DUPLICATE_INPUT');seen.add(input.path);
      const absolute=relativeFile(root,input.path);
      requireValue(/^[a-f0-9]{64}$/.test(input.sha256)&&input.sha256===input.backupSha256,'BACKUP_INPUT_SHA_MISMATCH');
      const actual=digestFile(absolute);requireValue(actual===input.sha256,'INPUT_SHA_MISMATCH');return {path:input.path,sha256:actual};
    });
  });
  check('고유출력경로/덮어쓰기금지',()=>{
    const outputRoot=directory(manifest.outputRoot);requireValue(['arm64','x64'].includes(manifest.arch),'MAC_ARCH_REQUIRED');
    const name=manifest.outputName||`EXODUSER-mac-${manifest.arch}-${randomUUID()}`;
    requireValue(new RegExp(`^EXODUSER-mac-${manifest.arch}-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$`).test(name),'UNIQUE_OUTPUT_NAME_REQUIRED');
    const output=path.join(outputRoot,name);componentsSafe(output,true);
    try{fs.lstatSync(output);throw Error('OUTPUT_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}
    requireValue(!outputRoot.split(path.sep).some(forbidden),'PROTECTED_OUTPUT_ROOT');
    return {path:output,exists:false,reserved:false};
  });
  check('Mac런타임존재/헤더대상일치',()=>{
    const runtime=manifest.runtime;requireValue(runtime&&typeof runtime.appPath==='string','MAC_RUNTIME_MISSING');
    const app=directory(runtime.appPath);requireValue(app.endsWith('.app'),'MAC_APP_REQUIRED');
    const binary=path.join(app,'Contents/MacOS/nwjs'),plist=path.join(app,'Contents/Info.plist');componentsSafe(binary);componentsSafe(plist);
    requireValue(fs.lstatSync(plist).isFile(),'INFO_PLIST_REQUIRED');
    requireValue(/^[a-f0-9]{64}$/.test(runtime.sha256)&&digestFile(binary)===runtime.sha256,'RUNTIME_SHA_MISMATCH');
    const descriptor=fs.openSync(binary,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);const header=Buffer.alloc(8);let length;
    try{length=fs.readSync(descriptor,header,0,8,0);}finally{fs.closeSync(descriptor);}
    requireValue(length===8&&header.readUInt32LE(0)===0xfeedfacf,'THIN_MACHO64_REQUIRED_UNIVERSAL_UNKNOWN');
    const expected=manifest.arch==='arm64'?0x0100000c:0x01000007;requireValue(header.readUInt32LE(4)===expected,'RUNTIME_ARCH_MISMATCH');
    return {app,binary,arch:manifest.arch,quality:'파일/헤더만확인;실행가능성/서명/Frameworks완전성UNKNOWN'};
  });
  result.status=result.checks.every(entry=>entry.pass)?'PASS_DRY_RUN':'BLOCKED';result.packageCreated=false;return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    requireValue(process.argv.length===3,'Usage: node mac-package-preflight-cli.mjs MANIFEST.json (dry-run only)');
    const manifestPath=path.resolve(process.argv[2]);requireValue(!manifestPath.split(path.sep).some(forbidden)&&manifestPath.endsWith('.json'),'MANIFEST_PATH_REJECTED');componentsSafe(manifestPath);const report=preflight(JSON.parse(fs.readFileSync(manifestPath,'utf8')));console.log(JSON.stringify(report,null,2));if(report.status==='BLOCKED')process.exitCode=2;
  }catch(error){console.log(JSON.stringify({status:'BLOCKED',mode:'dry-run/read-only',error:String(error.message),packageCreated:false}));process.exitCode=2;}
}
