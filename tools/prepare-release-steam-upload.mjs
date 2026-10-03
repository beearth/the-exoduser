import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateReleasePackage} from './release-target.mjs';
export function prepareUpload(root,out,appId,depotId){
 root=path.resolve(root);out=path.resolve(out);
 const read=f=>fs.readFileSync(path.join(root,'package.nw',f),'utf8');
 const config=JSON.parse(read('release-config.json')),pkg=JSON.parse(read('package.json'));
 validateReleasePackage({config,package:pkg,buildTarget:read('build-target.js'),lobby:read('index.html'),game:read('game.html'),exe:fs.existsSync(path.join(root,'EXODUSER.exe'))},appId,depotId);
 const proof=JSON.parse(fs.readFileSync(path.join(root,'release-artifact-manifest.json'),'utf8'));
 if(proof.config.target!==config.target||proof.config.appId!==appId||proof.config.depotId!==depotId)throw Error('Artifact identity mismatch');
 const expected=new Map(proof.files.map(f=>[f.path,f]));
 const exclusions=['release-artifact-manifest.json','runtime-provenance.json','nw.exe','*.log','*.bak*','*.tmp','*.ps1','*.py','*.blend*','*.kra','*.aseprite','*.psd','*.xcf','*.md','Dictionaries/*','userdata*/*','*/userdata*/*','*/saves/*','*/.git/*','*/.env*','*/node_modules/*','*/Library/*','*/_unity_preview/*','package.nw/game-easy-test.html'];
 const omitRegex=exclusions.map(p=>new RegExp('^'+p.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*')+'$','i'));
 const included=[],excluded=[],seen=new Set();
 function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,ent.name),rel=path.relative(root,file).replaceAll('\\','/');
  if(ent.isSymbolicLink())throw Error('Symlink rejected: '+rel);
  if(ent.isDirectory()){walk(file);continue}
  if(rel==='release-artifact-manifest.json')continue;
  const omit=omitRegex.some(re=>re.test(rel)||re.test(path.basename(rel)));
  const record=expected.get(rel);
  if(!record){if(omit){excluded.push({path:rel,bytes:fs.statSync(file).size,generatedDuringQA:true});continue}throw Error('Unrecorded package file: '+rel)}
  const bytes=fs.readFileSync(file),sha256=crypto.createHash('sha256').update(bytes).digest('hex');
  if(record.sha256!==sha256||record.bytes!==bytes.length)throw Error('Artifact modified: '+rel);
  seen.add(rel);
  if(!omit&&/(^|\/)(saves|userdata[^/]*|\.git|node_modules)(\/|$)|(?:^|\/)(\.env[^/]*|ssfn[^/]*|loginusers|config\.vdf)|\.(pem|key|pfx)$/i.test(rel))throw Error('Private path: '+rel);
  (omit?excluded:included).push(record);
 }}walk(root);
 if(seen.size!==expected.size)throw Error('Missing artifact file');
 for(const name of ['EXODUSER.exe','nw.dll','node.dll','ffmpeg.dll','icudtl.dat','resources.pak','package.nw/build-target.js','package.nw/release-config.json'])if(!included.some(f=>f.path===name))throw Error('Missing runtime '+name);
 if(fs.existsSync(out))throw Error('Upload output already exists');
 fs.mkdirSync(out+'/steampipe',{recursive:true});
 const portable=p=>p.replaceAll('\\','/');
 const depot=`"DepotBuildConfig"\n{\n "DepotID" "${depotId}"\n "ContentRoot" "${portable(root)}/"\n "FileMapping" { "LocalPath" "*" "DepotPath" "." "recursive" "1" }\n${exclusions.map(p=>' "FileExclusion" "'+p+'"').join('\n')}\n}\n`;
 fs.writeFileSync(`${out}/depot_build_${depotId}.vdf`,depot);
 for(const preview of [0,1])fs.writeFileSync(`${out}/app_build_${appId}${preview?'_preview':''}.vdf`,`"appbuild"\n{\n "appid" "${appId}"\n "desc" "EXODUSER ${config.target} review correction ${config.buildId}"\n "buildoutput" "${portable(out)}/steampipe/"\n "contentroot" "${portable(root)}/"\n "setlive" ""\n "preview" "${preview}"\n "depots" { "${depotId}" "depot_build_${depotId}.vdf" }\n}\n`);
 const report={sourceCommit:proof.sourceCommit,config,appId,depotId,contentRoot:root,setlive:'',included,excluded};
 fs.writeFileSync(out+'/upload-file-audit.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify({appId,depotId,target:config.target,included:included.length,bytes:included.reduce((n,f)=>n+f.bytes,0),out}));return report;
}
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const m=/^--(root|out|app-id|depot-id)=(.+)$/.exec(a);if(!m)throw Error('Explicit --root --out --app-id --depot-id required');return[m[1],m[2]]}));
if(args.root)prepareUpload(args.root,args.out,Number(args['app-id']),Number(args['depot-id']));
else if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))throw Error('Explicit --root --out --app-id --depot-id required');
