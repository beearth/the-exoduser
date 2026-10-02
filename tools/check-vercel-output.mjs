// Audit the actual static output, including Linux-distinct NFC/NFD asset paths.
import {readdirSync,statSync,existsSync} from 'node:fs';
import {resolve,join,relative} from 'node:path';
import {fileURLToPath} from 'node:url';

export function checkStaticOutput(directory,{maxFiles=15000,maxFileBytes=100000000,maxTotalBytes=4000000000}={}) {
  const root=resolve(directory),files=[];
  for(const name of ['index.html','game.html','parry-lesson.js','resource-practice.js']){
    if(!existsSync(join(root,name)))throw new Error(`Missing runtime entry: ${name}`);
  }
  function walk(dir){
    for(const name of readdirSync(dir)){
      const path=join(dir,name),stat=statSync(path);
      if(stat.isDirectory())walk(path);
      else if(stat.isFile())files.push({path:relative(root,path),bytes:stat.size});
    }
  }
  walk(root);
  // Reserve one file for the Build Output API config.
  if(files.length+1>maxFiles)throw new Error(`Upload file count ${files.length+1} exceeds ${maxFiles}`);
  const oversized=files.filter(f=>f.bytes>maxFileBytes);
  if(oversized.length)throw new Error(`Files exceed ${maxFileBytes} bytes: ${JSON.stringify(oversized)}`);
  const bytes=files.reduce((sum,f)=>sum+f.bytes,0);
  if(bytes>maxTotalBytes)throw new Error(`Total upload bytes ${bytes} exceeds ${maxTotalBytes}; review the web runtime manifest before deploying`);
  files.sort((a,b)=>b.bytes-a.bytes);
  return {files:files.length,bytes,largest:files.slice(0,5),mode:'individual files, no archive',maxFiles,maxFileBytes,maxTotalBytes};
}
if(resolve(process.argv[1]||'')===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify(checkStaticOutput(process.argv[2]||'.vercel/output/static'),null,2));
}
