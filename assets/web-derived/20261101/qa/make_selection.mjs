import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const root='/Users/fordeargamers/exoduser-wt/_out/web-media-derivatives-20261101';
const repo='/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024';
const commit='58956eec7d35873d229d94d5244cb73f665ef49e';
const {selectWebRuntimeFiles}=await import(pathToFileURL(root+'/build-input/web-runtime-manifest.mjs'));
const source=fs.readFileSync(root+'/build-input/build-nwjs.mjs','utf8');
const match=source.match(/const FILES = \[[\s\S]*?\n\];/);
if(!match)throw Error('FILES array missing');
const FILES=vm.runInNewContext(match[0]+'\nFILES');
const tree=JSON.parse(fs.readFileSync(root+'/github-tree.json','utf8'));
if(tree.sha!=='1ba1c6ca9ee1fd5239f209b659dd7dfa54c79b37'||tree.truncated)throw Error('source tree mismatch/truncated');
const rows=new Map(tree.tree.filter(e=>e.type==='blob'&&Number.isInteger(e.size)).map(e=>[e.path,{path:e.path,blob:e.sha,bytes:e.size}]));
const cache=new Map();let fetched=0;
function getSource(path){
 if(cache.has(path))return cache.get(path);
 const row=rows.get(path);if(!row)throw Error('source not in tree: '+path);
 let r=spawnSync('git',['cat-file','blob',row.blob],{cwd:repo,env:{...process.env,GIT_NO_LAZY_FETCH:'1'},maxBuffer:64*1024*1024});
 if(r.status!==0){
  const f=spawnSync('git',['fetch','origin',row.blob],{cwd:repo,stdio:['ignore','ignore','pipe']});
  if(f.status!==0)throw Error('cannot fetch '+path+': '+String(f.stderr).slice(-500));
  r=spawnSync('git',['cat-file','blob',row.blob],{cwd:repo,env:{...process.env,GIT_NO_LAZY_FETCH:'1'},maxBuffer:64*1024*1024});
  fetched++;
 }
 if(r.status!==0)throw Error('cannot read '+path);
 const text=r.stdout.toString('utf8');cache.set(path,text);return text;
}
const selected=selectWebRuntimeFiles([...rows.keys()],FILES,getSource);
const entries=selected.map(path=>rows.get(path));
const bytes=entries.reduce((a,e)=>a+e.bytes,0);
const report={commit,files:entries.length,bytes,readSourceCount:cache.size,fetchedSourceBlobs:fetched,entries};
fs.writeFileSync(root+'/web-closure-selection.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({files:entries.length,bytes,readSourceCount:cache.size,fetchedSourceBlobs:fetched}));
if(entries.length!==3095||bytes!==4629181769)process.exitCode=2;
