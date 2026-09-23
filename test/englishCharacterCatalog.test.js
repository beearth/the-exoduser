import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {collect,loadCatalogs} from '../tools/localization-catalog.mjs';
test('both selectable character descriptions and traits resolve in English',()=>{
 const {lobby,tables}=loadCatalogs(),context={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),context);
 const en={...tables.en,...lobby.en,...context.ExoduserLocalizationData.ui.en};
 const characters=vm.runInNewContext('('+collect('index.html').declarations.CHAR_VISUALS+')');
 const keys=characters.flatMap(ch=>[ch.name,ch.desc,ch.tab,ch.job,...ch.traits.flat()]).filter(x=>typeof x==='string'&&/[가-힣]/.test(x));
 keys.push('블레이드 댄서. 회전대검, 단검 하나');
 for(const key of keys){assert.ok(en[key],key);assert.doesNotMatch(en[key],/[가-힣]/,key);}
});
