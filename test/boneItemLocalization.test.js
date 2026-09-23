import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {languages,loadCatalogs} from '../tools/localization-catalog.mjs';
const {tables}=loadCatalogs(),context={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),context);
for(const code of languages.filter(c=>c!=='ko'))test(code+' translates every generated ossuary item',()=>{
 const catalog={...tables[code],...context.ExoduserLocalizationData.ui[code]};
 for(const key of ['전대의 유골함',...['두개골','몸통','팔','다리'].map(p=>'철갑 전대의 '+p)]){assert.ok(catalog[key],key);assert.doesNotMatch(catalog[key],/[가-힣]/);}
});
