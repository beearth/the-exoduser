import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {extractFunction,derivedFactory,deriveConnected} from './inventory-dom-candidate.mjs';
import {fixFactory,connectRemoval} from './card-removal-focus-candidate.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),out=new URL('card-removal-focus/host/',owned);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(new URL('before/',out),{recursive:true});
const preserved={};
const oldHashes=JSON.parse(fs.readFileSync(new URL('native-focus-final-hashes.json',owned))).files;
const oldBefore=JSON.parse(fs.readFileSync(new URL('native-focus-manifest.json',owned))).before;
const paths=[...Object.keys(oldHashes),...Object.keys(oldBefore).map(path=>'tools/team-followup-20261001/UIUX/'+path),'tools/team-followup-20261001/UIUX/native-focus-final-hashes.json','inventory-space.css','img/ui/ossuary_socket_hf_v2.png','outputs/team-review-20261002/persistence/uiux-native-focus.json','outputs/team-review-20261002/persistence/uiux-native-focus.jpg'];
for(const path of paths){const bytes=fs.readFileSync(new URL(path,root)),hash=sha(bytes);if(oldHashes[path]&&oldHashes[path]!==hash)throw new Error('기존 native 파일 변경: '+path);const snapshot=new URL('before/'+path.replaceAll('/','__'),out);if(!fs.existsSync(snapshot))fs.writeFileSync(snapshot,bytes);if(sha(fs.readFileSync(snapshot))!==hash)throw new Error('before 불일치');preserved[path]=hash;}
const manifest=JSON.parse(fs.readFileSync(new URL('native-focus-manifest.json',owned))),previous=JSON.parse(fs.readFileSync(new URL('native-focus/current-function-text.json',owned))),sources={},evidence={};
for(const path of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(new URL(path,root),'utf8');
  const rows=manifest.comparison[path].functions.map(row=>{const raw=extractFunction(source,row.name);if(raw!==previous[path][row.name]||sha(raw)!==row.currentSha256)throw new Error('함수 변경: '+path+'/'+row.name);return {name:row.name,line1:source.slice(0,source.indexOf('function '+row.name+'(')).split('\n').length,sha256:sha(raw)};});
  const baseline=deriveConnected(source),candidate=connectRemoval(source),functions={};
  for(const [version,text]of Object.entries({baseline,candidate}))functions[version]=rows.map(row=>extractFunction(text,row.name)).join('\n');
  sources[path]={sourceSha256:sha(source),factory:{baseline:derivedFactory(),candidate:fixFactory()},functions};
  evidence[path]={sourceSha256:sha(source),functions:rows};
  for(const [kind,left,right]of [['minimal',baseline,candidate],['combined',source,candidate]]){
    const before=new URL('before/'+path+'.'+kind,out);fs.writeFileSync(before,left);
    const diff=spawnSync('diff',['-u','--label','a/'+path,'--label','b/'+path,before.pathname,'-'],{input:right,encoding:'utf8',maxBuffer:8*1024*1024});if(diff.status!==1)throw new Error('patch 실패');
    fs.writeFileSync(new URL(`card-removal-focus-${path==='game.html'?'main':'easy'}-${kind}.patch`,owned),diff.stdout);
  }
}
fs.writeFileSync(new URL('source-data.js',out),'export const sources='+JSON.stringify(sources)+';\n');
let harness=fs.readFileSync(new URL('native-focus/harness.js',owned),'utf8');
harness=harness.replace("panel.className='panel on'","panel.className='panel'");
harness=harness.replace("opener.onclick=()=>{api.focus.begin();panel.classList.add('on');api.renderInv();};", "opener.onclick=()=>{opener.focus();api.focus.begin();panel.classList.add('on');api.renderInv();};");
fs.writeFileSync(new URL('harness.js',out),harness);
let html=fs.readFileSync(new URL('native-focus/host.html',owned),'utf8').replace('value="candidate">DOM 합본','value="candidate">카드 소멸 수정').replace('value="baseline">원 focus 후보','value="baseline">직전 DOM 합본').replace('Native DOM-only 인수','카드 소멸 Native DOM-only 인수');
fs.writeFileSync(new URL('host.html',out),html);
let controller=fs.readFileSync(new URL('native-focus/controller.js',owned),'utf8').replace('../../../../inventory-space.css','../../../../../inventory-space.css').replace('  ui.render();report();','  report();');
fs.writeFileSync(new URL('controller.js',out),controller);
fs.writeFileSync(new URL('card-removal-focus-provenance.json',owned),JSON.stringify({at:new Date().toISOString(),preserved,evidence,css:preserved['inventory-space.css']},null,2)+'\n');
console.log('양쪽 19함수 동일, 원본 byte 보존, .js host/패치 생성');
