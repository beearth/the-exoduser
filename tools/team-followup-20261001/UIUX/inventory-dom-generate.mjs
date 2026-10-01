import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createInventoryFocus,connectCandidate} from './inventory-focus-candidate.mjs';
import {deriveConnected,derivedFactory,extractFunction} from './inventory-dom-candidate.mjs';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url),owned=new URL('./',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const originalHashes=Object.fromEntries(fs.readdirSync(owned).filter(name=>name.startsWith('inventory-focus-')).map(name=>[name,sha(fs.readFileSync(new URL(name,owned)))]));
const sources={};
for(const path of ['game.html','game-easy-test.html']) {
  const source=fs.readFileSync(new URL(path,root),'utf8'),baseline=connectCandidate(source),candidate=deriveConnected(source);
  const names=['_invPlaceDetail','_invRenderDetail','_invClearHover','_invRestoreSelectedActions','_invCategoryMatches','_invPlacement','_invPlacementChanged','renderInv','closePanel'];
  if(path==='game.html')names.push('_invRenderEmptyDetail');
  const functionEvidence=names.map(name=>({name,line1:source.slice(0,source.indexOf(`function ${name}(`)).split('\n').length,sha256:sha(extractFunction(source,name))}));
  const functions=Object.fromEntries([['baseline',baseline],['candidate',candidate]].map(([version,text])=>[version,names.map(name=>extractFunction(text,name)).join('\n')]));
  for(const text of Object.values(functions))new vm.Script(text);
  const data={sourceSha256:sha(source),functionEvidence,factory:{baseline:createInventoryFocus.toString(),candidate:derivedFactory()},functions};
  for(const match of candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if(/\bsrc\s*=|type\s*=\s*["'](?:module|importmap|application\/json)["']/i.test(match[1]))continue;
    new vm.Script(match[2],{filename:path});
  }
  sources[path]=data;
  const diff=spawnSync('diff',['-u','--label','a/'+path,'--label','b/'+path,new URL(path,root).pathname,'-'],{input:candidate,encoding:'utf8',maxBuffer:8*1024*1024});
  if(diff.status!==1)throw new Error('patch 생성 실패');
  fs.writeFileSync(new URL(`inventory-dom-${path==='game.html'?'main':'easy'}-combined.patch`,owned),diff.stdout);
  const beforeFile=new URL(`inventory-dom/${path==='game.html'?'main':'easy'}-baseline.txt`,owned);
  fs.writeFileSync(beforeFile,baseline);
  const delta=spawnSync('diff',['-u','--label','a/'+path+'+inventory-focus','--label','b/'+path+'+inventory-dom',beforeFile.pathname,'-'],{input:candidate,encoding:'utf8',maxBuffer:8*1024*1024});
  if(delta.status!==1)throw new Error('minimal patch 생성 실패');
  fs.writeFileSync(new URL(`inventory-dom-${path==='game.html'?'main':'easy'}-minimal.patch`,owned),delta.stdout);
  fs.unlinkSync(beforeFile);
}
fs.writeFileSync(new URL('inventory-dom/source-data.mjs',owned),'export const sources='+JSON.stringify(sources)+';\n');
fs.writeFileSync(new URL('inventory-dom-provenance.json',owned),JSON.stringify({readAt:new Date().toISOString(),originalHashes,sourceHashes:Object.fromEntries(Object.entries(sources).map(([path,data])=>[path,data.sourceSha256])),functionEvidence:Object.fromEntries(Object.entries(sources).map(([path,data])=>[path,data.functionEvidence]))},null,2)+'\n');
console.log('원 후보 Read/import·실제 함수 추출·미적용 minimal/combined patch 생성 완료');
