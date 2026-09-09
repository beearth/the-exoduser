import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {languages,loadCatalogs,collect} from '../tools/localization-catalog.mjs';
const source=['localization/ui-source.json','localization/ui-extra-source.json','localization/ui-growth-source.json'].flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')));
function data(){const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('localization-data.js','utf8'),ctx);return ctx.ExoduserLocalizationData;}
test('all growth panel labels, effect rows and spread notes are registered',()=>{
 const registered=new Set(source.map(r=>r.key));
 const missing=[...collect('stat-panel-ui.js').pairs.keys()].filter(k=>!registered.has(k));
 assert.deepEqual(missing,[]);
});
test('all shipped UI source keys resolve in each of the 29 supported languages',()=>{
 const bundle=data(),{tables,lobby}=loadCatalogs(),missing=[];
 for(const code of languages.filter(c=>c!=='ko')){
  const table={...lobby[code],...tables[code],...bundle.ui[code]};
  for(const {key}of source)if(typeof table[key]!=='string'||!table[key].trim())missing.push(code+': '+key);
 }
 assert.equal(missing.length,0,`${missing.length} missing translations; first entries:\n${missing.slice(0,20).join('\n')}`);
});
test('translated parameterized UI text preserves all named values',()=>{
 const bundle=data();
 const slots=value=>[...value.matchAll(/\{([A-Za-z]\w*)\}/g)].map(m=>m[1]).sort();
 for(const [code,table]of Object.entries(bundle.ui))for(const row of source){
  if(table[row.key])assert.deepEqual(slots(table[row.key]),slots(row.en),code+': '+row.key);
 }
});

test('audited English fallback gaps receive explicit language translations',()=>{
 const needed=JSON.parse(fs.readFileSync('localization/ui-needed.json','utf8'));
 const missing=[];
 for(const [code,rows]of Object.entries(needed)){
  const path='localization/ui/'+code+'.json';
  const translated=fs.existsSync(path)?JSON.parse(fs.readFileSync(path,'utf8')):{};
  for(const {key}of rows)if(typeof translated[key]!=='string'||!translated[key].trim())missing.push(code+': '+key);
 }
 assert.equal(missing.length,0,`${missing.length} audited gaps still need translation; first entries:\n${missing.slice(0,10).join('\n')}`);
});
test('every character story retains all canonical lines, including the warning at 22b',()=>{
 const {declarations}=loadCatalogs(),bundle=data();
 for(const [sequence,name,count]of [['prologue','PROLOGUE_LINES',21],['intro','INTRO_CUTSCENE_LINES',18]]){
  const ko=vm.runInNewContext('('+declarations[name]+')').ko;
  const ids=Array.from(ko.filter(line=>line.text),line=>String(line.id)).sort();assert.equal(ids.length,count);
  for(const code of languages.filter(c=>c!=='ko')){
   const translated=bundle.stories[code];assert.ok(translated,code);
   assert.deepEqual(Object.keys(translated[sequence]).sort(),ids,code+': '+sequence);
   for(const text of Object.values(translated[sequence]))assert.ok(text.trim()&&!/\ufffd|TODO|PLACEHOLDER/.test(text),code+': '+text);
  }
 }
});
