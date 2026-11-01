// Dependency-free web staging. Never copy the repository root as static output.
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,existsSync,linkSync,copyFileSync,statSync,writeFileSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {selectWebRuntimeFiles} from './web-runtime-manifest.mjs';
import {planWebDerivedAssets,WEB_DERIVED_SIDECAR} from './web-derived-assets.mjs';

const root=process.cwd(),out=resolve(root,process.argv[2]||'web-dist');
if(!out.startsWith(root+sep)||out===root)throw new Error('Output must be a child of the workspace');
if(existsSync(out))throw new Error('Use a fresh output directory; existing files are never deleted');
// Reuse the reviewed desktop runtime manifest, without its Node/NW bootstrap.
const nw=readFileSync('build-nwjs.mjs','utf8');
const extract=name=>[...nw.match(new RegExp('const '+name+' = \\[([\\s\\S]*?)\\];'))[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const files=extract('FILES');
const tracked=execFileSync('git',['ls-files','-z'],{maxBuffer:16*1024*1024}).toString().split('\0').filter(Boolean);
const selected=selectWebRuntimeFiles(tracked,files,p=>readFileSync(resolve(root,p),'utf8'));
for(const p of selected)if(!existsSync(resolve(root,p)))throw new Error('Missing tracked web runtime file: '+p);
for(const p of ['index.html','game.html','stat-panel-ui.js','localization-runtime.js',
  'three-runtime.js','assets/vendor/three-r160/build/three.module.js',
  'assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js',
  'assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js']){
  if(!selected.includes(p))throw new Error('Missing required runtime file: '+p);
}
// Require the videos consumed by selected runtime sources, not a retired filename.
const selectedCanonical=new Set(selected.map(p=>p.normalize('NFC')));
for(const p of selected){
  if(!/\.(html|js|css|mjs)$/.test(p))continue;
  const source=readFileSync(resolve(root,p),'utf8');
  for(const match of source.matchAll(/["'`](video\/[^"'`\r\n]+\.(?:mp4|webm)(?:[?#][^"'`\r\n]*)?)["'`]/gi)){
    const video=match[1].split(/[?#]/)[0].normalize('NFC');
    if(video.includes('${'))continue; // Dynamic prefixes remain the selector's responsibility.
    if(!selectedCanonical.has(video))throw new Error('Missing required runtime file: '+video);
  }
}
const plan=planWebDerivedAssets({root,selected,tracked});
mkdirSync(out,{recursive:true});let bytes=0;
for(const entry of plan.entries){
  const p=entry.sourcePath,dest=resolve(out,entry.outputPath);if(!dest.startsWith(out+sep))throw new Error('Unsafe output path');
  mkdirSync(dirname(dest),{recursive:true});
  try{linkSync(resolve(root,p),dest)}catch(e){
    // macOS resolves NFC/NFD spellings to one file; accept only an identical hard link.
    if(e.code==='EEXIST'){
      const sourceStat=statSync(resolve(root,p)),destStat=statSync(dest);
      if(sourceStat.dev!==destStat.dev||sourceStat.ino!==destStat.ino)throw e;
    }else{if(!['EXDEV','EPERM','EACCES','ENOTSUP'].includes(e.code))throw e;copyFileSync(resolve(root,p),dest)}
  }
  const stagedBytes=statSync(dest).size;if(stagedBytes!==entry.bytes)throw new Error('Staged media size changed: '+entry.outputPath);
  bytes+=stagedBytes;
}
if(plan.sidecar){writeFileSync(resolve(out,WEB_DERIVED_SIDECAR),plan.sidecar);bytes+=Buffer.byteLength(plan.sidecar);}
if(bytes!==plan.bytes)throw new Error('Static output byte count changed during staging');
console.log(JSON.stringify({output:out,files:plan.entries.length+(plan.sidecar?1:0),bytes,derived:plan.derived,logicalDerived:plan.logicalDerived,excluded:'source archives, cinematic work files, backups, tools, dependencies, Git history'}));
