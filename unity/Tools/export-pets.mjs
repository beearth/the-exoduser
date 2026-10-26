// CPU-only byte transfer and literal extraction from the pinned repository source.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=path.resolve(new URL('../..',import.meta.url).pathname);
const ref='66d4fd8601a4a708c2d3609dd72c2451bd7ca98a';
const read=p=>execFileSync('git',['show',ref+':'+p],{cwd:root,maxBuffer:32*1024*1024});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const source=read('godot/source_snapshot/game.html'),text=source.toString('utf8');
if(!hash(source).startsWith('dee094fd'))throw Error('Unexpected web snapshot');
const helper=read('tools/pet-dialogue-source.mjs');
const {extract}=await import('data:text/javascript;base64,'+helper.toString('base64'));
const entries=extract(text);
const res=path.join(root,'unity/Assets/Exoduser/Resources');
const rows=[];
const guid=p=>crypto.createHash('md5').update('UNITY-PET-01/'+p).digest('hex');
function write(p,b){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,b);}
function texture(from,to){const b=read(from),p=path.join(res,'Art/pets',to+'.png');write(p,b);
 write(p+'.meta',`fileFormatVersion: 2\nguid: ${guid(to)}\nTextureImporter:\n  serializedVersion: 13\n  externalObjects: {}\n  textureType: 0\n  textureShape: 1\n  alphaUsage: 1\n  alphaIsTransparency: 1\n  mipmaps:\n    enableMipMap: 0\n    sRGBTexture: 1\n  isReadable: 0\n  nPOTScale: 0\n  textureSettings:\n    serializedVersion: 2\n    filterMode: ${to.endsWith('/portrait')?1:0}\n    aniso: 1\n    wrapU: 1\n    wrapV: 1\n    wrapW: 1\n  maxTextureSize: 4096\n  platformSettings:\n  - serializedVersion: 4\n    buildTarget: DefaultTexturePlatform\n    maxTextureSize: 4096\n    resizeAlgorithm: 0\n    textureFormat: -1\n    textureCompression: 0\n    compressionQuality: 50\n    crunchedCompression: 0\n    allowsAlphaSplitting: 0\n    overridden: 0\n    ignorePlatformSupport: 0\n    androidETC2FallbackOverride: 0\n`);
 rows.push({source:from,destination:'Art/pets/'+to+'.png',bytes:b.length,sha256:hash(b),width:b.readUInt32BE(16),height:b.readUInt32BE(20)});
}
const dirs=['east','south-east','south','south-west','west','north-west','north','north-east'];
for(const pet of ['crow','cat']){
 const folder=pet==='crow'?'crow':'cat_pet';
 for(const d of dirs)texture('img/'+folder+'/'+d+'.png',pet+'/'+d);
 texture('img/'+folder+'/portrait.png',pet+'/portrait');
}
for(const [kind,ds,count] of [['idle',['south','south-west'],0],['running-4-frames',['south','south-west','west'],4]])
 for(const d of ds)for(let f=0;f<(count||(d==='south'?8:2));f++){
  const frame='frame_'+String(f).padStart(3,'0');
  texture('img/cat_pet_anim/animations/'+kind+'/'+d+'/'+frame+'.png','cat/'+kind+'/'+d+'/'+frame);
 }
for(let i=1;i<=4;i++)texture('img/fx/flame0'+i+'.png','flame0'+i);
// Balanced literal object only; never execute the HTML or a gameplay function.
function objectLiteral(s,marker){let start=s.indexOf(marker);if(start<0)throw Error('Missing '+marker);
 start=s.indexOf('{',start);let depth=0,q='',escape=false;
 for(let i=start;i<s.length;i++){let c=s[i];if(q){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===q)q='';continue;}
  if(c==='"'||c==="'"){q=c;continue;}if(c==='{')depth++;if(c==='}'&&--depth===0)return vm.runInNewContext('('+s.slice(start,i+1)+')',{}, {timeout:1000});}
 throw Error('Unclosed '+marker);
}
const dictionaries={en:objectLiteral(text,'const _EN={')};
const codes=['zh','zht','ja','vi','th','id','es','fr','it','ptbr','ro','de','nl','sv','da','no','ru','uk','pl','cs','hu','bg','el','fi','tr','ar'];
for(const code of codes)dictionaries[code]=objectLiteral(read('lang/'+code+'.js').toString('utf8'),'const _'+code.toUpperCase()+'={');
const extra=read('localization-data.js').toString('utf8');
// Same module consumed by source _LANG_TBL merge. This file is data-only.
const context={};vm.runInNewContext(extra,context,{timeout:1000});
for(const [code,dict] of Object.entries(context.ExoduserLocalizationData?.ui??{}))if(dictionaries[code])Object.assign(dictionaries[code],dict);
// The helper's connected flag belongs to Godot and must not become a Unity claim.
const data={sourceSha256:hash(source),entries:Object.entries(entries).map(([id,e])=>({id,...e,connected:undefined,dur:e.dur??0,cd:e.cd??0,pd:e.pd??0})),languages:[]};
const keys=new Set(Object.values(entries).flatMap(e=>[e.txt,e.pt,...(e.txt_components??[]),...(e.pt_components??[])]).filter(Boolean));
for(const [code,dict] of Object.entries(dictionaries))data.languages.push({code,lines:[...keys].map(ko=>({ko,text:dict[ko]||ko}))});
write(path.join(res,'Data/pets.json'),JSON.stringify(data));
write(path.join(root,'unity/Tools/Fixtures/pet-assets.json'),JSON.stringify({schema:'exoduser.unity.source-pets.v1',ref,sourceSha256:hash(source),assetCount:rows.length,assets:rows,dialogueIds:data.entries.length,languages:data.languages.map(l=>({code:l.code,translated:l.lines.filter(x=>x.text!==x.ko).length,total:l.lines.length})),torchDarkAlpha:0},null,2)+'\n');
console.log(JSON.stringify({sourceSha256:hash(source),assets:rows.length,dialogueIds:data.entries.length,languages:data.languages.length}));
