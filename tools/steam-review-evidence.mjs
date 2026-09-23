// Read-only evidence for the package, installed rejected build and store diff.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=process.cwd(),out=path.join(root,'output/steam_review_20260916');
const pkg=path.join(root,'out/EXODUSER-win64/package.nw');
const installed='E:/steam/steamapps/common/EXODUSER HELL LORD/package.nw';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const committedHash=name=>{try{return crypto.createHash('sha256').update(execFileSync('git',['show','HEAD:'+name],{maxBuffer:16*1024*1024})).digest('hex')}catch{return null}};
const names=['game.html','index.html','localization-runtime.js','localization-data.js','localization.css','world-intro-subtitles.js','character-story-player.js',...fs.readdirSync(pkg).filter(f=>/^lang_.*\.js$/.test(f))];
function resources(dir,prefix='localization'){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=prefix+'/'+entry.name;
  if(entry.isDirectory())resources(path.join(dir,entry.name),rel);else names.push(rel);
 }
}
resources(path.join(root,'localization'));
const before=JSON.parse(fs.readFileSync(path.join(out,'store-before.json'),'utf8'));
const after=JSON.parse(fs.readFileSync(path.join(out,'store-after.json'),'utf8')).choices;
const changes=after.filter(x=>before.find(y=>y.id===x.id)?.checked!==x.checked).map(x=>({id:x.id,was:before.find(y=>y.id===x.id)?.checked,now:x.checked}));
if(changes.some(x=>!(/supported_languages/.test(x.id)||x.id==='checkbox_app_classification_category_category_13_')))throw Error('Unexpected store change');
function reproduce(file){
 const g=fs.readFileSync(file,'utf8');
 const start=g.indexOf('// 게임 시작 시 자동 불러오기');
 const code=g.slice(start,g.indexOf('try{_applyCursor()}catch(e){}',start));
 const run=settings=>{
  const values=new Map([['hellLang','fr'],['hellcave_settings',settings]]);
  const ctx=vm.createContext({OPT:{lang:'ko'},BINDS:{},BINDS2:{},document:{documentElement:{}},localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)},BGM:{setVol(){}},_repairChainAttackBinds(){},applyUIScale(){},syncSettingsUI(){}});
  vm.runInContext(fs.readFileSync('localization-runtime.js','utf8'),ctx);
  vm.runInContext(g.match(/function saveSettings\(\)\{[^\n]+/)[0],ctx);
  vm.runInContext(code,ctx);
  return {selected:'fr',actual:ctx.OPT.lang,stored:values.get('hellLang')};
 };
 return {noSettings:run(null),oldKoreanSettings:run(JSON.stringify({opt:{lang:'ko',diffV2:1}}))};
}
const evidence={at:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),status:execFileSync('git',['status','--short'],{encoding:'utf8'}),deployment:'G:/exoduser-steam/content/windows',artifact:path.dirname(pkg),uploaded:false,newBuildId:null,installedBuildId:'25202408',installedGameHash:hash(path.join(installed,'game.html')),sourceReproduction:{installed:reproduce(path.join(installed,'game.html')),fixed:reproduce('game.html')},changes,files:names.map(name=>({name,package:hash(path.join(pkg,name)),source:hash(path.join(root,name)),matches:hash(path.join(pkg,name))===hash(path.join(root,name))})),translationFiles:fs.readdirSync(pkg).filter(f=>/^lang_.*\.js$/.test(f)).length};
for(const file of evidence.files){file.committed=committedHash(file.name);file.matchesCommitted=file.package===file.committed;}
fs.writeFileSync(path.join(out,'package-evidence.json'),JSON.stringify(evidence,null,2));
console.log(JSON.stringify({translationFiles:evidence.translationFiles,storeChanges:changes.length,sourceReproduction:evidence.sourceReproduction,mismatches:evidence.files.filter(x=>!x.matches).map(x=>x.name)}));
