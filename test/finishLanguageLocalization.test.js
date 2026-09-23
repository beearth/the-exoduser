import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {languages,loadCatalogs} from '../tools/localization-catalog.mjs';
const source=JSON.parse(fs.readFileSync('localization/finish-source.json','utf8'));
const context={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),context);
const catalogs=loadCatalogs(),bundle=context.ExoduserLocalizationData;
const tokens=s=>(s.match(/\{\w+\}/g)||[]).sort();
const translateSource=fs.readFileSync('game.html','utf8').match(/function _T\(s\)\{[\s\S]*?\n\}/)[0];
for(const code of languages.filter(c=>c!=='ko'))test(code+' resolves every final release label and preserves placeholders',()=>{
 const table={...catalogs.lobby[code],...catalogs.tables[code],...bundle.ui[code]};
 for(const row of source){assert.ok(table[row.key]?.trim(),row.key);assert.deepEqual(tokens(table[row.key]),tokens(row.en),row.key);}
 const runtime={OPT:{lang:code},_LANG_TBL:{[code]:table},_LANG_PFX:{},_LANG_BASE:{}};
 vm.runInNewContext(translateSource,runtime);
 assert.equal(runtime._T('불꽃칼날'),table['불꽃칼날']);
 if(code!=='en'){
  const data=JSON.parse(fs.readFileSync('localization/finish/'+code+'.json','utf8'));
  assert.equal(Object.keys(data).length,40);
  for(const [key,value] of Object.entries(data)){assert.ok(source.some(r=>r.key===key));assert.ok(!/[가-힣]/.test(value),key);}
 }
});
test('loading status uses translation before displaying its leaf text',()=>{
 const game=fs.readFileSync('game.html','utf8');
 const body=game.slice(game.indexOf('function setBootLoading('),game.indexOf('function hideBootLoading('));
 const nodes={stLoadBar:{style:{}},stNextName:{textContent:''}};
 const ctx={_bootPerfMark(){},$:id=>nodes[id],_T:s=>'translated:'+s,hideBootLoading(){}};
 vm.runInNewContext(body+';setBootLoading(50,"몬스터 스킨 로딩...");',ctx);
 assert.equal(nodes.stNextName.textContent,'translated:몬스터 스킨 로딩...');
});
test('character class heading goes through existing localized job label',()=>{
 const assignment=fs.readFileSync('index.html','utf8').match(/\$\('csClsName'\)\.textContent=[^;]+;/)[0];
 const leaf={textContent:''};
 vm.runInNewContext(assignment,{$:()=>leaf,ch:{job:'전사',cls:'WARRIOR'},_TL:s=>s==='전사'?'Krieger':s});
 assert.equal(leaf.textContent,'Krieger');
});
