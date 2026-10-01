import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {extractFunction} from './inventory-dom-candidate.mjs';
import {sourceFactory} from './filter-focus-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(fs.existsSync(new URL('ossuary-focus-before.json',owned)))throw new Error('동일 before/초안 보존: 중복 준비 거부');
const preserved={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('ossuary-focus-'))continue;const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())walk(path);else preserved[fileURLToPath(path).slice(fileURLToPath(root).length)]=sha(fs.readFileSync(path));}}
walk(owned);
const sources={};
for(const [path,tag]of [['game.html','main'],['game-easy-test.html','easy']]){
  const source=fs.readFileSync(new URL(path,root),'utf8');fs.writeFileSync(new URL('ossuary-focus-'+tag+'.before.html',owned),source);
  const names=['_invPlaceDetail','_invRenderDetail','_invClearHover','_invRestoreSelectedActions','_invCategoryMatches','_invChangeCategory','_invPlacement','_invPlacementChanged','renderInv','closePanel','renderOssPanel','_ossHideBoneInfo','_ossShowBoneInfo','_bonePartName','_ossSetComplete','mkBonePart','_boneRegister','registerBonePart','withdrawBonePart','unequipItem','_grantOssuaryIfNeeded'];if(tag==='main')names.push('_invRenderEmptyDetail');
  sources[path]={tag,sha256:sha(source),factorySha256:sha(sourceFactory(source)),functions:names.map(name=>({name,line1:source.slice(0,source.indexOf('function '+name+'(')).split('\n').length,sha256:sha(extractFunction(source,name))}))};
}
for(const path of ['ui-panels.js','inventory-space.css','docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md','docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md'])preserved[path]=sha(fs.readFileSync(new URL(path,root)));
fs.writeFileSync(new URL('ossuary-focus-ui-panels.before.js',owned),fs.readFileSync(new URL('ui-panels.js',root)));
fs.writeFileSync(new URL('ossuary-focus-before.json',owned),JSON.stringify({at:new Date().toISOString(),sources,preserved},null,2)+'\n');console.log('실제 유골함/수집/해제 함수 before·SHA 보존');
