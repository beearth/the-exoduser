import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {languages,loadCatalogs} from '../tools/localization-catalog.mjs';
const c={};for(const file of ['localization-data.js','lobby-stage-info.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),c);
const {lobby}=loadCatalogs();
for(const code of languages)test(code+' lobby slots localize all35 stage labels',()=>{
 const catalog={...lobby[code],...c.ExoduserLocalizationData.ui[code]};
 for(let stage=0;stage<35;stage++){
  const label=c.LOBBY_STAGE_INFO.formatProgress(stage,key=>code==='ko'?key:catalog[key]||key);
  if(code!=='ko')assert.doesNotMatch(label,/[가-힣�]/,label);
  assert.ok(label.includes(String(c.LOBBY_STAGE_INFO.getProgress(stage).floor)));
 }
 if(!['ko','en'].includes(code))assert.notEqual(catalog['지옥의 겨울'],'Hell Winter');
});
