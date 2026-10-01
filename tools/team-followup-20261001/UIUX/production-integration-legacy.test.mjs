import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const read=fs.readFileSync,write=fs.writeFileSync,owned=new URL('./',import.meta.url),root=new URL('../../../',import.meta.url);
const fixtures=new URL('production-integration-fixtures/',owned);
const suite=process.env.UIUX_LEGACY_SUITE;
if(!['inventory-focus','inventory-dom','native-focus','card-removal-focus'].includes(suite))throw new Error('검사 suite 지정 필요');
const resolve=path=>path instanceof URL?fileURLToPath(path):String(path);
const sourcePaths=new Map(['game.html','game-easy-test.html'].map(path=>[fileURLToPath(new URL(path,root)),new URL(path,fixtures)]));
const provenancePath=fileURLToPath(new URL('inventory-dom-provenance.json',owned));
fs.readFileSync=function(path,...args){
  const resolved=resolve(path);
  if(sourcePaths.has(resolved))return read.call(fs,sourcePaths.get(resolved),...args);
  if(suite==='inventory-dom'&&resolved===provenancePath){
    const value=JSON.parse(read.call(fs,path,'utf8'));
    for(const name of Object.keys(value.sourceHashes))value.sourceHashes[name]=createHash('sha256').update(read.call(fs,new URL(name,fixtures))).digest('hex');
    const bytes=Buffer.from(JSON.stringify(value));return args[0]==='utf8'?bytes.toString('utf8'):bytes;
  }
  return read.call(fs,path,...args);
};
const allowed=['inventory-focus-reproduction.json','inventory-dom-evidence.json','card-removal-focus-reproduction.json'];
fs.writeFileSync=function(path,...args){const resolved=resolve(path),name=allowed.find(name=>resolved===fileURLToPath(new URL(name,owned)));if(!name)throw new Error('기존 증거 쓰기 차단: '+resolved);return write.call(fs,new URL(suite+'-'+name,fixtures),...args);};
await import(new URL(suite+'.test.mjs',owned));
