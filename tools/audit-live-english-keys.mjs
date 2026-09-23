import fs from 'node:fs';
import vm from 'node:vm';
import {collect,loadCatalogs} from './localization-catalog.mjs';
const {tables,lobby}=loadCatalogs(),ctx={};vm.runInNewContext(fs.readFileSync('localization-data.js','utf8'),ctx);
const files=['game.html','game-easy-test.html','index.html','parry-lesson.js','resource-practice.js','system-lesson.js','tutorial-badges.js','stat-panel-ui.js'];
const missing=[];
for(const file of files){const {keys,pairs}=collect(file);const base={...(file==='index.html'?lobby.en:tables.en),...ctx.ExoduserLocalizationData.ui.en};for(const key of keys)if(!pairs.get(key)&&!base[key])missing.push({file,key});}
fs.mkdirSync('output/localization_20260922',{recursive:true});fs.writeFileSync('output/localization_20260922/english-key-audit.json',JSON.stringify({files,missing},null,2)+'\n');
console.log(JSON.stringify({missingCount:missing.length,missing},null,2));
