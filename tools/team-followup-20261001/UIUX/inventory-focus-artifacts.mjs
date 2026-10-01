import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {connectCandidate} from './inventory-focus-candidate.mjs';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const owned=fileURLToPath(new URL('./',import.meta.url));
const sourceHashes={};
for(const path of ['game.html','game-easy-test.html','ui-panels.js']) {
  const source=fs.readFileSync(root+path,'utf8');
  sourceHashes[path]=createHash('sha256').update(source).digest('hex');
  if(path==='ui-panels.js')continue;
  const candidate=connectCandidate(source);
  for(const match of candidate.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if(/\bsrc\s*=|type\s*=\s*["'](?:module|importmap|application\/json)["']/i.test(match[1]))continue;
    new vm.Script(match[2],{filename:path});
  }
  const diff=spawnSync('diff',['-u','--label','a/'+path,'--label','b/'+path,root+path,'-'],{input:candidate,encoding:'utf8',maxBuffer:4*1024*1024});
  if(diff.status!==1)throw new Error('독립 patch 작성 실패');
  fs.writeFileSync(owned+'inventory-focus-'+(path==='game.html'?'main':'easy')+'.patch',diff.stdout);
}
fs.writeFileSync(owned+'inventory-focus-source-hashes.json',JSON.stringify({readAt:new Date().toISOString(),sourceHashes},null,2)+'\n');
console.log('양쪽 미적용 patch와 원소스 SHA 기록');
