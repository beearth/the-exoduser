import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {extractFunction} from './inventory-dom-candidate.mjs';
import {connectFilter,sourceFactory} from './filter-focus-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),sha=bytes=>createHash('sha256').update(bytes).digest('hex');
if(fs.existsSync(new URL('filter-focus-before.json',owned)))throw new Error('기존 초안/before 보존: 중복 준비 거부');
const preserved={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('filter-focus-'))continue;const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())walk(path);else preserved[fileURLToPath(path).slice(fileURLToPath(root).length)]=sha(fs.readFileSync(path));}}
walk(owned);
const sources={};
for(const [path,tag]of [['game.html','main'],['game-easy-test.html','easy']]){
  const source=fs.readFileSync(new URL(path,root),'utf8'),candidate=connectFilter(source);fs.writeFileSync(new URL('filter-focus-'+tag+'.before.html',owned),source);
  const names=['_invPlaceDetail','_invRenderDetail','_invClearHover','_invRestoreSelectedActions','_invCategoryMatches','_invChangeCategory','_invPlacement','_invPlacementChanged','renderInv','closePanel'];if(path==='game.html')names.push('_invRenderEmptyDetail');
  sources[path]={tag,beforeSha256:sha(source),candidateSha256:sha(candidate),factorySha256:sha(sourceFactory(source)),functions:names.map(name=>({name,line1:source.slice(0,source.indexOf('function '+name+'(')).split('\n').length,sha256:sha(extractFunction(source,name))}))};
  const result=spawnSync('diff',['-u','--label','a/'+path,'--label','b/'+path,new URL(path,root).pathname,'-'],{input:candidate,encoding:'utf8',maxBuffer:8*1024*1024});if(result.status!==1)throw new Error('후보 patch 오류');fs.writeFileSync(new URL('filter-focus-'+tag+'.patch',owned),result.stdout);
}
const composition=fs.readFileSync(new URL('ui-panels.js',root),'utf8');fs.writeFileSync(new URL('filter-focus-ui-panels.before.js',owned),composition);
for(const path of ['ui-panels.js','inventory-space.css','docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md','docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md','docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md'])preserved[path]=sha(fs.readFileSync(new URL(path,root)));
fs.writeFileSync(new URL('filter-focus-before.json',owned),JSON.stringify({at:new Date().toISOString(),sources,preserved},null,2)+'\n');console.log('양쪽 실제 source와 UI composition before 보존; 후보 미적용');
