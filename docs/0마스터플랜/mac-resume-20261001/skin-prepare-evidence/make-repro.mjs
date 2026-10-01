// Run from repository root: node <this-file> <output-dir> [v1|v2|v3].
// Uses an immutable local Git input, never the current production game.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import cp from 'node:child_process';import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),out=process.argv[2],version=process.argv[3]||'v3';
if(!out||!['v1','v2','v3'].includes(version))throw Error('output directory and optional v1|v2|v3 required');
const source=cp.execFileSync('git',['show','cd31c6363a3750d0ae070c2793221b086b8384fe:game.html'],{maxBuffer:20*1024*1024}).toString();
if(crypto.createHash('sha256').update(source).digest('hex')!=='78c3a0c763eb32cb39056835d3eaf30f3402bc054a463028bde783bf4e4f0e28')throw Error('input hash');
const observer=fs.readFileSync(path.join(here,'observer-measured.js'),'utf8'),candidate=fs.readFileSync(path.join(here,version==='v3'?'candidate.js':`candidate-${version}.js`),'utf8');
fs.mkdirSync(out,{recursive:true});
for(const variant of ['baseline','prepare']){
 let html=source.replace('<head>','<head><base href="/">');
 const marker='(async function _boot(){';if(html.split(marker).length!==2)throw Error('anchor');
 html=html.replace(marker,observer+'\n'+candidate+'\n'+marker);
 if(variant==='prepare')html=html.replace('await _prepareWorldDropFx(); // Optional, bounded preparation; original lazy path remains available.','await _prepareWorldDropFx(); // Existing production preparation.\nawait __prepareTwoWorldSkins();');
 fs.writeFileSync(path.join(out,variant+'.html'),html);
}
