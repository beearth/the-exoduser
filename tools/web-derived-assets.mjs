// Validate approved web-only media before writing a fresh static artifact.
import {existsSync,readFileSync,lstatSync,realpathSync,openSync,readSync,closeSync} from 'node:fs';
import {resolve,sep,extname} from 'node:path';
import {createHash} from 'node:crypto';
export const WEB_DERIVED_MANIFEST='assets/web-derived/20261101/manifest.json';
export const WEB_DERIVED_SIDECAR='__web-derived-output.json';
const base='assets/web-derived/20261101/';
export function safeMediaPath(path) {
 if(typeof path!=='string'||!path||/[\\:%?#\x00-\x1f]/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..'))throw new Error('Unsafe media path: '+path);
 return path.normalize('NFC');
}
function checkedFile(root,path) {
 const file=resolve(root,path),actual=realpathSync(file),boundary=realpathSync(root)+sep;
 if(!actual.startsWith(boundary)||!lstatSync(file).isFile()||lstatSync(file).isSymbolicLink())throw new Error('Unsafe media file path: '+path);
 return file;
}
export function mediaIdentity(file) {
 const size=lstatSync(file).size,sha=createHash('sha256'),blob=createHash('sha1').update('blob '+size+'\0'),fd=openSync(file,'r'),buffer=Buffer.alloc(1024*1024);
 let count;try{while((count=readSync(fd,buffer,0,buffer.length,null))>0){const bytes=buffer.subarray(0,count);sha.update(bytes);blob.update(bytes);}}finally{closeSync(fd);}
 return {bytes:size,sha256:sha.digest('hex'),git_blob:blob.digest('hex')};
}
export function assertDerivativeFormat(file,mime) {
 const bytes=Buffer.alloc(12),fd=openSync(file,'r');try{readSync(fd,bytes,0,12,0);}finally{closeSync(fd);}
 const valid=mime==='audio/flac'?bytes.subarray(0,4).toString()==='fLaC':mime==='image/webp'?bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP':mime==='video/mp4'?bytes.subarray(4,8).toString()==='ftyp':false;
 if(!valid)throw new Error('Invalid derivative format/MIME: '+file);
}
export function planWebDerivedAssets({root,selected,tracked,manifestPath=WEB_DERIVED_MANIFEST,maxFileBytes=100000000,maxTotalBytes=4000000000,maxFiles=15000}) {
 const trackedCanonical=new Map(),trackedVariants=new Map();for(const path of tracked){const canonical=path.normalize('NFC');if(!trackedCanonical.has(canonical))trackedCanonical.set(canonical,path);const variants=trackedVariants.get(canonical)||[];variants.push(path);trackedVariants.set(canonical,variants);}
 const selectedByCanonical=new Map(),identityCache=new Map();
 const identify=path=>{if(!identityCache.has(path))identityCache.set(path,mediaIdentity(checkedFile(root,path)));return identityCache.get(path);};
 for(const path of selected){
  const canonical=safeMediaPath(path);
  if(canonical.startsWith('assets/web-derived/')||canonical.startsWith('_web_derived/')||canonical===WEB_DERIVED_SIDECAR)throw new Error('Reserved output path: '+path);
  if(selectedByCanonical.has(canonical)){
   const previous=selectedByCanonical.get(canonical);if(identify(previous).sha256!==identify(path).sha256)throw new Error('Different bytes at normalized source path: '+canonical);
  }else selectedByCanonical.set(canonical,path);
 }
 const manifestFile=resolve(root,manifestPath),hasManifest=existsSync(manifestFile);
 let assets=[];
 if(trackedCanonical.has(manifestPath)&&!hasManifest)throw new Error('Missing tracked derivative manifest');
 if(hasManifest){
  if(!trackedCanonical.has(manifestPath))throw new Error('Derived manifest is not tracked');
  const manifest=JSON.parse(readFileSync(checkedFile(root,manifestPath),'utf8'));
  if(manifest.version!==1||!Array.isArray(manifest.assets)||!manifest.assets.length)throw new Error('Invalid web derivative manifest');assets=manifest.assets;
 }
 const replacements=new Map();
 for(const record of assets){
  const source=safeMediaPath(record.source_path),target=safeMediaPath(record.derivative_path);
  if(!selectedByCanonical.has(source))throw new Error('Derivative source is not selected: '+source);
  if(!target.startsWith(base)||target===manifestPath)throw new Error('Invalid derivative path: '+target);
  if(!trackedCanonical.has(source)||!trackedCanonical.has(target))throw new Error('Derivative source/file is not tracked: '+source);
  const sourceFile=selectedByCanonical.get(source),targetFile=trackedCanonical.get(target),input=identify(sourceFile),output=identify(targetFile);
  for(const [canonical,expected] of [[source,input],[target,output]])for(const variant of trackedVariants.get(canonical)){const actual=identify(variant);if(actual.sha256!==expected.sha256||actual.bytes!==expected.bytes||actual.git_blob!==expected.git_blob)throw new Error('Different bytes at normalized source/derivative path: '+canonical);}
  if(!/^[a-f0-9]{40}$/.test(record.source_git_blob)||input.git_blob!==record.source_git_blob||input.sha256!==record.source_sha256||input.bytes!==record.source_bytes)throw new Error('Changed derivative source identity: '+source);
  if(!/^[a-f0-9]{64}$/.test(record.sha256)||output.sha256!==record.sha256||output.bytes!==record.bytes)throw new Error('Changed derivative identity: '+target);
  const pair=extname(source).toLowerCase()+':'+extname(target).toLowerCase();
  const types={'.wav:.flac':'audio/flac','.png:.webp':'image/webp','.mp4:.mp4':'video/mp4'};
  if(types[pair]!==record.mime)throw new Error('Invalid derivative MIME/extension pair: '+source);
  assertDerivativeFormat(checkedFile(root,targetFile),record.mime);
  const staged='_web_derived/'+createHash('sha256').update(source).digest('hex')+extname(target).toLowerCase();
  const previous=replacements.get(source);
  if(previous){
   const keys=['source_git_blob','source_sha256','source_bytes','sha256','bytes','mime'];
   if(previous.derivative_path!==target||keys.some(key=>previous[key]!==record[key])||previous.source_aliases.includes(record.source_path))throw new Error('Duplicate conflicting normalized source mapping: '+source);
   previous.source_aliases.push(record.source_path);
  }else replacements.set(source,{...record,source_path:source,source_aliases:[record.source_path],derivative_path:target,public_path:source,staged_path:staged,sourceFile:targetFile});
 }
 const entries=[],mappings=[];
 for(const [canonical,path] of selectedByCanonical){
  const replacement=replacements.get(canonical);
  if(replacement){const {sourceFile,...mapping}=replacement;entries.push({sourcePath:sourceFile,outputPath:replacement.staged_path,bytes:replacement.bytes});mappings.push(mapping);}
  else entries.push({sourcePath:path,outputPath:path,bytes:lstatSync(checkedFile(root,path)).size});
 }
 const sidecar=mappings.length?JSON.stringify({version:1,logical_assets:assets.length,assets:mappings},null,2)+'\n':null;
 const bytes=entries.reduce((sum,entry)=>sum+entry.bytes,0)+(sidecar?Buffer.byteLength(sidecar):0);
 if(entries.length+(sidecar?1:0)+1>maxFiles)throw new Error('Upload file count exceeds '+maxFiles);
 if(entries.some(entry=>entry.bytes>maxFileBytes)||(sidecar&&Buffer.byteLength(sidecar)>maxFileBytes))throw new Error('File exceeds '+maxFileBytes+' bytes');
 if(bytes>maxTotalBytes)throw new Error('Total upload bytes '+bytes+' exceeds '+maxTotalBytes);
 return {entries,sidecar,bytes,derived:mappings.length,logicalDerived:assets.length};
}

// Recheck the generated mapping against the actual prebuilt static bytes.
export function validateStagedWebDerivedAssets(root) {
 const path=resolve(root,WEB_DERIVED_SIDECAR);if(!existsSync(path))return [];
 const data=JSON.parse(readFileSync(checkedFile(root,WEB_DERIVED_SIDECAR),'utf8'));
 if(data.version!==1||!Array.isArray(data.assets)||!data.assets.length)throw new Error('Invalid staged derivative manifest');
 if(!Number.isSafeInteger(data.logical_assets)||data.logical_assets!==data.assets.reduce((sum,asset)=>sum+(asset.source_aliases?.length||0),0))throw new Error('Invalid staged logical source count');
 const destinations=new Set(),files=new Set();
 for(const record of data.assets){
  const publicPath=safeMediaPath(record.public_path),source=safeMediaPath(record.source_path),staged=safeMediaPath(record.staged_path),target=safeMediaPath(record.derivative_path);
  const extension=extname(target).toLowerCase(),expected='_web_derived/'+createHash('sha256').update(publicPath).digest('hex')+extension;
  const types={'.wav:.flac':'audio/flac','.png:.webp':'image/webp','.mp4:.mp4':'video/mp4'};
  if(source!==publicPath||staged!==expected||!target.startsWith(base)||types[extname(source).toLowerCase()+':'+extension]!==record.mime)throw new Error('Invalid staged derivative path/MIME: '+source);
  if(destinations.has(publicPath)||files.has(staged))throw new Error('Duplicate staged derivative mapping: '+source);destinations.add(publicPath);files.add(staged);
  if(!/^[a-f0-9]{40}$/.test(record.source_git_blob)||!/^[a-f0-9]{64}$/.test(record.source_sha256)||!Number.isSafeInteger(record.source_bytes)||record.source_bytes<0||!/^[a-f0-9]{64}$/.test(record.sha256)||!Number.isSafeInteger(record.bytes)||record.bytes<0)throw new Error('Invalid staged derivative identity: '+source);
  if(!Array.isArray(record.source_aliases)||!record.source_aliases.length||new Set(record.source_aliases).size!==record.source_aliases.length||record.source_aliases.some(alias=>safeMediaPath(alias)!==publicPath))throw new Error('Invalid staged source aliases: '+source);
  const actual=mediaIdentity(checkedFile(root,staged));
  if(actual.bytes!==record.bytes||actual.sha256!==record.sha256)throw new Error('Changed staged derivative bytes: '+staged);
  assertDerivativeFormat(checkedFile(root,staged),record.mime);
 }
 return data.assets;
}
