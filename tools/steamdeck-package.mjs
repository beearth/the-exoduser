// Creates a fresh Windows NW.js package for later Steam Deck / Proton testing.
// Uses the existing runtime, current source files, and the desktop release manifest.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

export const DECK_OPTIONS=Object.freeze({
  fpsCap:60,resScale:100,ssaa:1,showFps:true,diffV2:1,
  bloom:false,trail:true,slash:true,postfx:true,deathFx:true,
  lighting:true,torch:true,ambPart:false,fog:true,grain:false,parts:20
});
export function bootstrapSource(){
  return `// First-run test defaults only; preserve all existing player settings.\n`+
    `try{if(localStorage.getItem('hellcave_settings')===null){localStorage.setItem('hellcave_settings',JSON.stringify({opt:${JSON.stringify(DECK_OPTIONS)}}));}}catch(e){console.warn('Deck defaults could not be stored',e);}\nlocation.replace('index.html');\n`;
}
export function handheldStyles(){
  // 1280px HUD scale is ~0.60: 15px becomes 9px and LT+A still fits its 37px slot.
  return '@media (max-width:1366px){#skKeyBar > div{font-size:15px!important;font-family:Arial,sans-serif!important;}}\n';
}
export function deckManifest(base){
  return {name:base.name+'-deck-test',version:base.version,
    main:'http://localhost:3333/deck-start.html','node-main':base['node-main'],
    'node-remote':base['node-remote'],
    window:{...base.window,width:1280,height:800,min_width:1280,min_height:720},
    'chromium-args':base['chromium-args'].replace(/--user-data-dir=\S+/g,'--user-data-dir=./userdata-deck')};
}
function walk(root,relative=''){
  const result=[];
  for(const entry of fs.readdirSync(path.join(root,relative),{withFileTypes:true})){
    if(entry.isSymbolicLink())throw Error('Symlink in package input: '+path.join(root,relative,entry.name));
    const p=relative?relative+'/'+entry.name:entry.name;
    if(entry.isDirectory())result.push(...walk(root,p));else if(entry.isFile())result.push(p);
  }
  return result;
}
const excluded=p=>/(^|\/)(?:userdata[^/]*|\.git|node_modules|__pycache__|backups?)(\/|$)/i.test(p)
  ||/\.(?:bak(?:\.[^/]+)?|old|tmp|log|zip|blend|psd|kra|pyc)$/i.test(p);
export function planPackage(root,runtime,output){
  root=path.resolve(root);runtime=path.resolve(runtime);output=path.resolve(output);
  if(!output.startsWith(root+path.sep)||output===root)throw Error('Output must be inside the workspace');
  if(fs.existsSync(output))throw Error('Output already exists; choose a fresh folder');
  if(output.startsWith(runtime+path.sep))throw Error('Output cannot be inside runtime input');
  const build=fs.readFileSync(path.join(root,'build-nwjs.mjs'),'utf8');
  const extract=name=>{
    const match=build.match(new RegExp('const '+name+' = \\[([\\s\\S]*?)\\];'));
    if(!match)throw Error('Missing desktop runtime manifest: '+name);
    return [...match[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
  };
  const source=new Set([...extract('FILES'),'node-main.js']);
  const missingDirectories=[],missingFiles=[];
  for(const dir of extract('DIRS')){
    if(!fs.existsSync(path.join(root,dir))){missingDirectories.push(dir);continue;}
    for(const p of walk(path.join(root,dir)))source.add(dir+'/'+p);
  }
  for(const entry of fs.readdirSync(root,{withFileTypes:true})){
    if(entry.isFile()&&/^(lang_[^/]+\.js|atlas_[^/]+)$/.test(entry.name))source.add(entry.name);
  }
  const sourceFiles=[...source].filter(p=>!excluded(p)).filter(p=>{
    if(p==='credits.html'&&!fs.existsSync(path.join(root,p))){missingFiles.push(p);return false;}
    return true;
  }).sort();
  for(const p of sourceFiles)if(!fs.existsSync(path.join(root,p)))throw Error('Missing runtime file: '+p);
  const runtimeFiles=[];
  // Do not traverse browser profiles, old source packages, or incidental user files.
  for(const entry of fs.readdirSync(runtime,{withFileTypes:true})){
    if(entry.isSymbolicLink())throw Error('Symlink in runtime: '+entry.name);
    if(entry.isFile()&&(/\.(exe|dll|pak|bin|dat)$/i.test(entry.name)||entry.name==='vk_swiftshader_icd.json'))runtimeFiles.push(entry.name);
    if(entry.isDirectory()&&['locales','Dictionaries'].includes(entry.name)){
      runtimeFiles.push(...walk(path.join(runtime,entry.name)).map(p=>entry.name+'/'+p));
    }
  }
  for(const required of ['EXODUSER.exe','nw.dll'])if(!runtimeFiles.includes(required))throw Error('Missing NW runtime: '+required);
  return {root,runtime,output,sourceFiles,runtimeFiles,missingDirectories,missingFiles};
}
export function buildPackage(root,runtime,output){
  const plan=planPackage(root,runtime,output);
  const codec=path.join(root,'vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll');
  const codecHash=createHash('sha256').update(fs.readFileSync(codec)).digest('hex');
  if(codecHash!=='be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500')throw Error('NW 0.111.2 codec mismatch');
  const pkgRoot=path.join(plan.output,'package.nw');fs.mkdirSync(pkgRoot,{recursive:true});
  let bytes=0;const records=[];
  const copy=(src,relative)=>{
    const dest=path.join(plan.output,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});
    // Independent copies: later source edits must never mutate a handed-off package.
    if(['package.nw/game.html','package.nw/game-easy-test.html'].includes(relative)){
      const html=fs.readFileSync(src,'utf8');if(!html.includes('<head>'))throw Error('Missing entry head: '+relative);
      fs.writeFileSync(dest,html.replace('<head>','<head>\n<link rel="stylesheet" href="deck-handheld.css">'));
    }else fs.copyFileSync(src,dest);
    const data=fs.readFileSync(dest);bytes+=data.length;
    records.push({path:relative,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});
  };
  for(const p of plan.runtimeFiles)copy(p==='ffmpeg.dll'?codec:path.join(plan.runtime,p),p);
  for(const p of plan.sourceFiles)copy(path.join(plan.root,p),'package.nw/'+p);
  const manifest=deckManifest(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')));
  fs.writeFileSync(path.join(pkgRoot,'package.json'),JSON.stringify(manifest,null,2));
  fs.writeFileSync(path.join(pkgRoot,'deck-bootstrap.js'),bootstrapSource());
  fs.writeFileSync(path.join(pkgRoot,'deck-handheld.css'),handheldStyles());
  fs.writeFileSync(path.join(pkgRoot,'deck-start.html'),'<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EXODUSER</title><body style="margin:0;background:#080609;color:#eee"><p>EXODUSER</p><script src="deck-bootstrap.js"></script></body></html>');
  fs.writeFileSync(path.join(plan.output,'STEAM_DECK_README.txt'),[
    'EXODUSER: HELL LORD — Steam Deck / Proton test package',
    '',
    'STATUS: PC preparation only. Steam Deck hardware and Proton have NOT been tested. No Verified/Playable claim.',
    '1. Copy this ENTIRE folder to Steam Deck. Do not copy only EXODUSER.exe.',
    '2. In Desktop Mode, add EXODUSER.exe as a non-Steam game.',
    '3. In Steam Properties > Compatibility, enable a current stable Proton tool. Record its exact version.',
    '4. Set Start In to this folder. Select the Gamepad controller template; launch from Gaming Mode.',
    '5. Fresh settings: 1280x800 window request, 60 FPS cap, 100% render scale, 1x SSAA, existing Medium effects, FPS display on.',
    '   These are test defaults, not a guaranteed 60 FPS result. Existing settings are preserved.',
    '   Skill-bar key labels use 15px layout text below 1367px viewport width (about 9px after 1280px HUD scale).',
    '6. Test title/videos/audio, tutorial, movement, all skills, inventory/forge/stats/settings using only the controller.',
    '7. Test save/reload, boss combat, dense fights for 10 minutes, and suspend/resume.',
    '8. Record model, SteamOS/Proton versions, FPS/frametime/RAM, battery/TDP, unreadable text and input failures.',
    'If ordinary Proton fails, compare Proton Experimental separately and record the result.',
    '',
    'Saves: Proton prefix %APPDATA%/EXODUSER-HELL/saves (per Steam shortcut prefix).',
    'Browser settings: userdata-deck. No personal saves or browser profiles are included.',
    'Native Linux build and Steam store upload are not part of this package.',
    '',
    'Official: https://partner.steamgames.com/doc/steamhardware/compat',
    ''
  ].join('\r\n'));
  const report={createdAt:new Date().toISOString(),output:plan.output,platform:'Windows x64 / NW.js 0.111.2 / Proton candidate',
    hardwareTested:false,protonTested:false,source:'Current workspace; copied from desktop FILES/DIRS manifest',
    runtimeFiles:plan.runtimeFiles.length,sourceFiles:plan.sourceFiles.length,copiedBytes:bytes,defaults:DECK_OPTIONS,
    missingDirectories:plan.missingDirectories,missingFiles:plan.missingFiles,files:records};
  fs.writeFileSync(path.join(plan.output,'package-manifest.json'),JSON.stringify(report,null,2));
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const root=process.cwd();const output=process.argv[2]||'out/EXODUSER-steamdeck-test-20260914-r2';
  const report=buildPackage(root,path.join(root,'out/EXODUSER-win64'),path.resolve(root,output));
  console.log(JSON.stringify({output:report.output,runtimeFiles:report.runtimeFiles,sourceFiles:report.sourceFiles,copiedBytes:report.copiedBytes,hardwareTested:false},null,2));
}
