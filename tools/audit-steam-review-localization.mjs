import fs from 'node:fs';
import vm from 'node:vm';
import {languages,loadCatalogs,collect} from './localization-catalog.mjs';
const out='output/steam_review_20260916';
fs.mkdirSync(out,{recursive:true});
const {tables,lobby}=loadCatalogs(),ctx={};
vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),ctx);
const bundle=ctx.ExoduserLocalizationData;
const sources=['game.html','index.html','stat-panel-ui.js','parry-lesson.js','system-lesson.js','resource-practice.js'];
const keys=new Map();
for(const file of sources){const c=collect(file);for(const key of c.keys)if(!keys.has(key))keys.set(key,[]);for(const key of c.keys)keys.get(key).push(file);}
const result=languages.map(code=>{
 const table={...lobby[code],...tables[code],...bundle.ui[code]};
 const missing=code==='ko'?[]:[...keys].filter(([k])=>!table[k]).map(([key,files])=>({key,files}));
 return {code,scannedKeys:keys.size,unresolvedLiteralKeys:missing.length,missing};
});
fs.writeFileSync(out+'/catalog-audit.json',JSON.stringify(result,null,2));
console.log(result.map(({code,scannedKeys,unresolvedLiteralKeys})=>({code,scannedKeys,unresolvedLiteralKeys})));
