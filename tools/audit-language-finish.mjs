import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {collect, languages, loadCatalogs} from './localization-catalog.mjs';
const out=path.resolve('output/steam_languages_finish_20260923');
fs.mkdirSync(out,{recursive:true});
if(process.argv.includes('--package')){
 const packageRoot=path.resolve(process.env.EXODUSER_QA_PACKAGE||'out/EXODUSER-languages-20260923');
 const relative=path.relative(path.resolve('out'),packageRoot);
 if(!relative||relative.startsWith('..')||path.isAbsolute(relative))throw Error('Package must be under workspace out');
 process.chdir(path.join(packageRoot,'package.nw'));
}
const catalogs=loadCatalogs(),ctx={};
vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),ctx);
const bundle=ctx.ExoduserLocalizationData,keys=new Map();
for(const file of ['game.html','index.html','stat-panel-ui.js','parry-lesson.js','system-lesson.js','resource-practice.js','tutorial-badges.js']){
 const c=collect(file);for(const key of c.keys)keys.set(key,keys.get(key)||{key,en:c.pairs.get(key)||catalogs.tables.en[key]||catalogs.lobby.en[key]||bundle.ui.en[key],file});
}
const d=catalogs.declarations;
const lines=vm.runInNewContext('('+d._INTRO_LINES+')');
const steps=vm.runInNewContext('('+d._INTRO_KEY_STEPS+')');
const extra=[...lines.map(x=>[x.ko,x.en]),...steps.flatMap(x=>[x.title,...x.rows.map(r=>r.slice(2)),...(x.note?[x.note]:[])]),['출시 준비 중','Coming Soon'],['클릭 / Enter / Space · 다음    Space 길게 / ESC · 건너뛰기','Click / Enter / Space · Next    Hold Space / ESC · Skip']];
for(const [key,en] of extra)keys.set(key,{key,en,file:'intro/character'});
const result=languages.filter(c=>c!=='ko').map(code=>{
 const table={...catalogs.lobby[code],...catalogs.tables[code],...bundle.ui[code]};
 return {code,missing:[...keys.values()].filter(r=>!table[r.key])};
});
const reportPrefix=process.argv.includes('--final')?'final-':'';
fs.writeFileSync(out+'/'+reportPrefix+'missing.json',JSON.stringify(result,null,2));
const union=[...new Map(result.flatMap(r=>r.missing).map(r=>[r.key,r])).values()];
fs.writeFileSync(out+'/'+reportPrefix+'missing-source.json',JSON.stringify(union,null,2));
console.log(JSON.stringify({counts:result.map(r=>({code:r.code,missing:r.missing.length})),source:union.map((r,i)=>({i,key:r.key,en:r.en,needsOtherLocales:result.slice(1).some(x=>x.missing.some(m=>m.key===r.key))}))},null,2));
