import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const workspace=process.cwd();
const root=path.resolve(workspace,'out/EXODUSER-steam-languages-20260923');
const out=path.resolve(workspace,'output/steam_languages_finish_20260923');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'language-package-manifest.json'),'utf8'));
const old=fs.readFileSync('output/steam_install_review_20260916/depot_build_4749591.vdf','utf8');
const patterns=[...new Set([...old.matchAll(/"FileExclusion"\s+"([^"]+)"/g)].map(m=>m[1]).concat(['language-package-manifest.json','Dictionaries/*']))];
const expressions=patterns.map(p=>new RegExp('^'+p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*')+'$','i'));
const expected=new Map([['language-package-manifest.json',null]]);
for(const [key,prefix] of [['applicationFiles','package.nw/'],['runtimeFiles','']])for(const file of manifest[key])expected.set(prefix+file.path,file);
const included=[],excluded=[],seen=new Set();
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name),relative=path.relative(root,file).replaceAll('\\','/');
 if(entry.isSymbolicLink())throw Error('Symlink rejected: '+relative);
 if(entry.isDirectory()){walk(file);continue;}
 if(!entry.isFile()||!expected.has(relative))throw Error('Unexpected package entry: '+relative);
 seen.add(relative);const record=expected.get(relative),bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
 if(record&&(record.bytes!==bytes.length||record.sha256!==hash))throw Error('Package modified: '+relative);
 const omit=expressions.some(re=>re.test(relative)||re.test(path.basename(relative)));
 if(!omit&&/(^|\/)(?:saves|userdata|\.git|node_modules)(\/|$)|(?:^|\/)(?:\.env(?:\.|$)|ssfn|loginusers|config\.vdf)|\.(?:pem|key|pfx)$/i.test(relative))throw Error('Private path: '+relative);
 (omit?excluded:included).push({path:relative,bytes:bytes.length,sha256:hash});
}}
walk(root);if(seen.size!==expected.size)throw Error('Missing manifest entries');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.nw/package.json'),'utf8'));
if(pkg.inject_js_end||pkg.main!=='http://localhost:3333/index.html?demo=1')throw Error('Unexpected release manifest');
for(const name of ['EXODUSER.exe','nw.dll','node.dll','ffmpeg.dll','package.nw/game.html','package.nw/index.html','package.nw/localization-data.js','package.nw/video/warrior_story_v23_clean.mp4'])if(!included.some(f=>f.path===name))throw Error('Missing runtime '+name);
fs.mkdirSync(path.join(out,'steampipe'),{recursive:true});
const portable=p=>p.replaceAll('\\','/');
const depot='"DepotBuildConfig"\n{\n "DepotID" "4749591"\n "ContentRoot" "'+portable(root)+'/"\n "FileMapping" { "LocalPath" "*" "DepotPath" "." "recursive" "1" }\n'+patterns.map(p=>' "FileExclusion" "'+p+'"').join('\n')+'\n}\n';
fs.writeFileSync(path.join(out,'depot_build_4749591.vdf'),depot);
for(const preview of [0,1])fs.writeFileSync(path.join(out,`app_build_4749590${preview?'_preview':''}.vdf`),'"appbuild"\n{\n "appid" "4749590"\n "desc" "EXODUSER 29-language completion 20260923 '+manifest.sourceCommit.slice(0,12)+'"\n "buildoutput" "'+portable(out)+'/steampipe/"\n "contentroot" "'+portable(root)+'/"\n "setlive" ""\n "preview" "'+preview+'"\n "depots" { "4749591" "depot_build_4749591.vdf" }\n}\n');
const report={sourceCommit:manifest.sourceCommit,contentRoot:root,appId:4749590,depotId:4749591,setlive:'',includedCount:included.length,includedBytes:included.reduce((n,f)=>n+f.bytes,0),excludedCount:excluded.length,patterns,included,excluded};
fs.writeFileSync(path.join(out,'upload-file-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,patterns:undefined,included:undefined,excluded:undefined}));
