import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
import {createInventoryFocus,connectCandidate} from './inventory-focus-candidate.mjs';
import {derivedFactory,deriveConnected,extractFunction} from './inventory-dom-candidate.mjs';
import {sources as previous} from './inventory-dom/source-data.mjs';
const owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url),out=new URL('./native-focus/',owned);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync(new URL('before/',out),{recursive:true});
const preserve=['inventory-focus-candidate.mjs','inventory-focus-main.patch','inventory-focus-easy.patch','inventory-dom-candidate.mjs','inventory-dom-provenance.json','inventory-dom-main-minimal.patch','inventory-dom-easy-minimal.patch','inventory-dom/harness.mjs','inventory-dom/host.html','inventory-dom/source-data.mjs'];
const before={};
for(const path of preserve){const bytes=fs.readFileSync(new URL(path,owned));const target=new URL('before/'+path.replaceAll('/','__'),out);if(!fs.existsSync(target))fs.writeFileSync(target,bytes);before[path]={sha256:sha(bytes),snapshotSha256:sha(fs.readFileSync(target))};if(before[path].sha256!==before[path].snapshotSha256)throw new Error('원본 before 이후 변경: '+path);}
const oldProvenance=JSON.parse(fs.readFileSync(new URL('inventory-dom-provenance.json',owned)));
const sources={},comparison={},rawFunctions={};
for(const path of ['game.html','game-easy-test.html']){
  const source=fs.readFileSync(new URL(path,root),'utf8'),baseline=connectCandidate(source),candidate=deriveConnected(source);
  const names=oldProvenance.functionEvidence[path].map(row=>row.name);
  const rows=names.map(name=>{const raw=extractFunction(source,name);const old=oldProvenance.functionEvidence[path].find(row=>row.name===name);return {name,line1:source.slice(0,source.indexOf(`function ${name}(`)).split('\n').length,oldSha256:old.sha256,currentSha256:sha(raw),same:old.sha256===sha(raw)};});
  const functions=Object.fromEntries([['baseline',baseline],['candidate',candidate]].map(([version,text])=>[version,names.map(name=>extractFunction(text,name)).join('\n')]));
  comparison[path]={previousWholeSha256:oldProvenance.sourceHashes[path],currentWholeSha256:sha(source),functions:rows,baselineTextEqual:previous[path].functions.baseline===functions.baseline,candidateTextEqual:previous[path].functions.candidate===functions.candidate};
  if(rows.some(row=>!row.same)||!comparison[path].baselineTextEqual||!comparison[path].candidateTextEqual)throw new Error('인벤토리 함수 변경: '+path);
  for(const text of Object.values(functions))new vm.Script(text);
  sources[path]={sourceSha256:sha(source),factory:{baseline:createInventoryFocus.toString(),candidate:derivedFactory()},functions,functionEvidence:rows};
  rawFunctions[path]=Object.fromEntries(names.map(name=>[name,extractFunction(source,name)]));
  const tag=path==='game.html'?'main':'easy';
  for(const [kind,text]of [['focus',baseline],['combined',candidate]]){
    const result=spawnSync('diff',['-u','--label','a/'+path,'--label','b/'+path,new URL(path,root).pathname,'-'],{input:text,encoding:'utf8',maxBuffer:8*1024*1024});
    if(result.status!==1)throw new Error('재기반 patch 작성 실패');
    fs.writeFileSync(new URL(`native-focus-${tag}-${kind}.patch`,owned),result.stdout);
  }
}
fs.writeFileSync(new URL('current-function-text.json',out),JSON.stringify(rawFunctions,null,2)+'\n');
fs.writeFileSync(new URL('source-data.js',out),'export const sources='+JSON.stringify(sources)+';\n');
let harness=fs.readFileSync(new URL('inventory-dom/harness.mjs',owned),'utf8');
const changes=[
  ["const wrap=document.createElement('div');wrap.className='inv-wrap';panel.appendChild(wrap);", "const box=document.createElement('div');box.className='pbox';panel.appendChild(box);\n  const wrap=document.createElement('div');wrap.className='inv-wrap';box.appendChild(wrap);"],
  ['panel.appendChild(close);nodes.invClose=close;','box.appendChild(close);nodes.invClose=close;']
];
for(const [beforeText,afterText]of changes){if(harness.split(beforeText).length!==2)throw new Error('host 연결 문맥 불일치');harness=harness.replace(beforeText,afterText);}
fs.writeFileSync(new URL('harness.js',out),harness);
const css=fs.readFileSync(new URL('inventory-space.css',root));
const manifest={readAt:new Date().toISOString(),before,comparison,css:{path:'inventory-space.css',sha256:sha(css)},mimeEvidence:{serverPath:'server.cjs',sha256:sha(fs.readFileSync(new URL('server.cjs',root))),js:'application/javascript',mjs:'application/octet-stream 기본값; HTTP 실측 미실시'}};
fs.writeFileSync(new URL('native-focus-manifest.json',owned),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(comparison).map(([path,value])=>[path,{wholeChanged:value.previousWholeSha256!==value.currentWholeSha256,functionsEqual:value.functions.every(row=>row.same),baselineTextEqual:value.baselineTextEqual,candidateTextEqual:value.candidateTextEqual}]))));
