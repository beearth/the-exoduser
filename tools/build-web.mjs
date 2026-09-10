// Dependency-free web staging. Never copy the repository root as static output.
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,existsSync,linkSync,copyFileSync,statSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';

const root=process.cwd(),out=resolve(root,process.argv[2]||'web-dist');
if(!out.startsWith(root+sep)||out===root)throw new Error('Output must be a child of the workspace');
if(existsSync(out))throw new Error('Use a fresh output directory; existing files are never deleted');
// Reuse the reviewed desktop runtime manifest, without its Node/NW bootstrap.
const nw=readFileSync('build-nwjs.mjs','utf8');
const extract=name=>[...nw.match(new RegExp('const '+name+' = \\[([\\s\\S]*?)\\];'))[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
const files=new Set(extract('FILES')),dirs=extract('DIRS');
const tracked=execFileSync('git',['ls-files','-z'],{maxBuffer:16*1024*1024}).toString().split('\0').filter(Boolean);
const selected=tracked.filter(p=>(files.has(p)||/^(lang_[^/]+\.js|atlas_[^/]+)$/.test(p)||dirs.some(d=>p.startsWith(d+'/')))
  &&!p.includes('/_unity_preview/')&&!p.includes('/_p11_candidates/')&&!/\.(zip|blend|psd|kra)$/i.test(p));
for(const p of ['index.html','game.html','stat-panel-ui.js','localization-runtime.js','video/title_motion_hd.mp4']){
  if(!selected.includes(p))throw new Error('Missing required runtime file: '+p);
}
mkdirSync(out,{recursive:true});let bytes=0;
for(const p of selected){
  const dest=resolve(out,p);if(!dest.startsWith(out+sep))throw new Error('Unsafe output path');
  mkdirSync(dirname(dest),{recursive:true});
  try{linkSync(resolve(root,p),dest)}catch(e){if(!['EXDEV','EPERM','EACCES','ENOTSUP'].includes(e.code))throw e;copyFileSync(resolve(root,p),dest)}
  bytes+=statSync(dest).size;
}
console.log(JSON.stringify({output:out,files:selected.length,bytes,excluded:'source archives, cinematic work files, backups, tools, dependencies, Git history'}));
