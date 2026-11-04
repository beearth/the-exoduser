// Read-only replacement for running asset importers as automatic oracle tests.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function recoverAsset(manifest,readPart){
 const parts=[];
 for(const part of manifest.parts){
  if(path.posix.basename(part.path)!==part.path)throw Error('invalid recovery part path');
  const b=await readPart(part.path);
  if(b.length!==part.bytes||digest(b)!==part.sha256)throw Error('recovery part mismatch '+part.path);
  parts.push(b);
 }
 const b=Buffer.concat(parts);
 if(b.length!==manifest.bytes||digest(b)!==manifest.sha256)throw Error('recovery asset mismatch');
 return b;
}
async function checkReceipt(receipt,readBlob) {
 const rows=[];
 if(!Array.isArray(receipt.assets)||!receipt.assets.length)throw Error('empty asset receipt');
 for(const asset of receipt.assets){
  const dest=asset.destination;
  if(typeof dest!=='string'||dest.includes('\\')||dest.startsWith('/')||dest.split('/').some(p=>p==='..')||dest.includes(':'))throw Error('invalid destination '+dest);
  const file=dest.startsWith('Exoduser/')||dest.startsWith('StreamingAssets/')?'unity/Assets/'+dest:'unity/Assets/Exoduser/Resources/'+dest;
  const row={file,expectedBytes:asset.bytes,expectedSha256:asset.sha256};
  try{const b=await readBlob(file);row.bytes=b.length;row.sha256=digest(b);row.inputSource=b.recoveryManifest||'tracked asset blob';row.passed=b.length===asset.bytes&&row.sha256===asset.sha256;}catch(e){row.passed=false;row.error=e.message;}
  rows.push(row);
 }
 return {total:rows.length,failed:rows.filter(x=>!x.passed).length,rows};
}
async function main(){
 const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1]},repo=path.resolve(arg('--repo',path.join(__dirname,'../../..'))),rev=arg('--rev','HEAD');
 const git=args=>{const r=cp.spawnSync('git',['-C',repo,...args],{stdio:['ignore','pipe','pipe'],windowsHide:true,maxBuffer:1024*1024*1024});if(r.status!==0)throw Error(r.stderr.toString().trim());return r.stdout;};
 const results=[];
 const manifests=git(['ls-tree','-r','--name-only',rev,'--','unity/Tools/MediaRecovery']).toString().trim().split('\n').filter(p=>p.endsWith('/manifest.json')).map(file=>({file,data:JSON.parse(git(['show',rev+':'+file]))}));
 const readAsset=async file=>{
  try{return git(['show',rev+':'+file]);}catch(e){
   const recovery=manifests.find(m=>'unity/'+m.data.destination===file);
   if(!recovery)throw e;
   const b=await recoverAsset(recovery.data,async p=>git(['show',rev+':'+path.posix.join(path.posix.dirname(recovery.file),p)]));
   b.recoveryManifest=recovery.file;return b;
  }
 };
 for(const name of ['source_receipt.json','inventory-assets.json','lobby-assets.json']){
  const receipt=JSON.parse(git(['show',rev+':unity/Tools/Fixtures/'+name]));
  results.push({receipt:name,...await checkReceipt(receipt,readAsset)});
 }
 const output={scope:'tracked Unity asset receipts vs pinned Git blobs or verified MediaRecovery parts; no re-import, rendering, audio, video decode or Python',coreSha:git(['rev-parse',rev]).toString().trim(),results};
 const out=arg('--out',null);if(!out)throw Error('--out required');fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify(results.map(({receipt,total,failed})=>({receipt,total,failed}))));
 process.exitCode=results.some(x=>x.failed)?2:0;
}
module.exports={checkReceipt,recoverAsset};
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
