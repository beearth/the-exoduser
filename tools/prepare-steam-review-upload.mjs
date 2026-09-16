import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root='G:/exoduser/out/EXODUSER-win64',out='G:/exoduser/output/steam_install_review_20260916';
const sourceBase='4539c6fbd52a1c1b9f0ec280f38e6dec782c8a5d';
const expectedGame=execFileSync('git',['show',sourceBase+':game.html'],{maxBuffer:20*1024*1024}).toString('utf8').replace('nm.textContent=ch.name;','nm.textContent=_T(ch.name);').replace('ds.textContent=ch.desc;','ds.textContent=_T(ch.desc);');
if(fs.readFileSync(root+'/package.nw/game.html','utf8').replaceAll('\r\n','\n')!==expectedGame.replaceAll('\r\n','\n'))throw Error('Package game differs from pinned source plus two-line fix');
const old=fs.readFileSync('G:/exoduser-steam/scripts/depot_build_4749591.vdf','utf8');
const extra=['*.bak*','userdata/*','*/userdata/*','*/saves/*','*.log','*.tmp','*.ps1','*.py','*.blend','*.blend1','*.kra','*.aseprite','*/.git/*','*/.env','*/.env.*','*/node_modules/*','package.nw/game-easy-test.html','package.nw/_steam_review_probe.js'];
const patterns=[...old.matchAll(/"FileExclusion"\s+"([^"]+)"/g)].map(m=>m[1]).concat(extra);
const rex=patterns.map(p=>new RegExp('^'+p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*')+'$','i'));
const files=[];function scan(dir){for(const d of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,d.name);if(d.isDirectory())scan(p);else files.push(p);}}scan(root);
const included=[],excluded=[];
for(const p of files){const rel=path.relative(root,p).replaceAll('\\','/'),size=fs.statSync(p).size;const exclude=rex.some(r=>r.test(rel)||r.test(path.basename(rel)));(exclude?excluded:included).push({path:rel,size});}
for(const f of included){if(/(^|\/)(?:saves|userdata|\.git|node_modules)(\/|$)|(?:^|\/)(?:\.env(?:\.|$)|ssfn|loginusers|config\.vdf)|\.(?:pem|key|pfx)$/i.test(f.path))throw Error('Unexpected sensitive path: '+f.path);}
const pkg=JSON.parse(fs.readFileSync(root+'/package.nw/package.json','utf8'));
if(pkg.inject_js_end||pkg.main!=='http://localhost:3333/index.html')throw Error('QA manifest still installed');
const critical=['EXODUSER.exe','nw.dll','node.dll','ffmpeg.dll','icudtl.dat','resources.pak','package.nw/package.json','package.nw/node-main.js','package.nw/game.html','package.nw/index.html','package.nw/localization-data.js','package.nw/lobby_i18n.js','package.nw/world-intro-subtitles-data.js'];
for(const p of critical)if(!included.some(f=>f.path===p))throw Error('Missing runtime: '+p);
for(const f of included)if(critical.includes(f.path)||f.path.startsWith('package.nw/lang_'))f.sha256=crypto.createHash('sha256').update(fs.readFileSync(root+'/'+f.path)).digest('hex');
const depot=old.replaceAll('G:/exoduser-steam/content/windows/',root+'/').replace(/\}\s*$/,extra.map(p=>'\t"FileExclusion" "'+p+'"').join('\n')+'\n}\n');
fs.writeFileSync(out+'/depot_build_4749591.vdf',depot);
for(const preview of [0,1])fs.writeFileSync(out+`/app_build_4749590${preview?'_preview':''}.vdf`, `"appbuild"\n{\n "appid" "4749590"\n "desc" "EXODUSER Steam review language remediation 20260916"\n "buildoutput" "${out}/steampipe/"\n "contentroot" "${root}/"\n "setlive" ""\n "preview" "${preview}"\n "depots" { "4749591" "depot_build_4749591.vdf" }\n}\n`);
fs.mkdirSync(out+'/steampipe',{recursive:true});
const result={sourceBase,sourceModification:'Only renderSettings nm/ds textContent now uses existing _T(ch.name)/_T(ch.desc). Package game verified against this pinned base plus exact two replacements; prior asset comparison is package-vs-435.json.',headAtAudit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),contentRoot:root,appId:4749590,depotId:4749591,previewOnly:false,setlive:'',includedCount:included.length,includedBytes:included.reduce((s,f)=>s+f.size,0),excludedCount:excluded.length,patterns,included,excluded};
fs.writeFileSync(out+'/upload-file-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({sourceBase,included:result.includedCount,bytes:result.includedBytes,excluded:result.excludedCount,langFiles:included.filter(f=>/package.nw\/lang_.*\.js$/.test(f.path)).length}));
