import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {connectRemoval} from './card-removal-focus-candidate.mjs';
import {extractFunction} from './inventory-dom-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),fixtures=new URL('production-integration-fixtures/',owned);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(fixtures,{recursive:true});
if(fs.existsSync(new URL('production-integration-before.json',owned)))throw new Error('중복 준비 금지: 기존 before 보존');
const preserved={};
function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(entry.name.startsWith('production-integration'))continue;const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())inventory(path);else preserved[fileURLToPath(path).slice(fileURLToPath(root).length)]=sha(fs.readFileSync(path));}}
inventory(owned);
const evidencePath='outputs/team-review-20261002/mac-app/uiux-native-matrix.json';
const native=JSON.parse(fs.readFileSync(new URL(evidencePath,root)));if(native.cases.length!==8||native.cases.some(row=>row.removed.active!=='invClose'||!row.close.connected))throw new Error('root native 인수 불일치');
preserved[evidencePath]=sha(fs.readFileSync(new URL(evidencePath,root)));
preserved['inventory-space.css']=sha(fs.readFileSync(new URL('inventory-space.css',root)));
preserved['img/ui/ossuary_socket_hf_v2.png']=sha(fs.readFileSync(new URL('img/ui/ossuary_socket_hf_v2.png',root)));
const previous=JSON.parse(fs.readFileSync(new URL('card-removal-focus-provenance.json',owned))),sources={};
for(const path of ['game.html','game-easy-test.html']){
  const bytes=fs.readFileSync(new URL(path,root)),source=bytes.toString('utf8');
  if(sha(bytes)!==previous.evidence[path].sourceSha256)throw new Error('생산 before 변경: '+path);
  for(const row of previous.evidence[path].functions)if(sha(extractFunction(source,row.name))!==row.sha256)throw new Error('함수 SHA 불일치');
  fs.writeFileSync(new URL(path,fixtures),bytes);
  const expected=connectRemoval(source);fs.writeFileSync(new URL(path+'.expected',fixtures),expected);
  sources[path]={beforeSha256:sha(bytes),expectedSha256:sha(expected),functionEvidence:previous.evidence[path].functions};
}
const docs=['docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md','docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md','docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md'];
for(const path of docs)fs.writeFileSync(new URL(path.replaceAll('/','__'),fixtures),fs.readFileSync(new URL(path,root)));
fs.writeFileSync(new URL('production-integration-before.json',owned),JSON.stringify({at:new Date().toISOString(),sources,preserved,docs,nativeScope:native.scope},null,2)+'\n');
console.log(JSON.stringify({sources,preservedFiles:Object.keys(preserved).length,nativeCases:native.cases.length}));
