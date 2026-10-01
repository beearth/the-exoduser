import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parse,parseExpressionAt} from 'acorn';

const server=fs.readFileSync('server.cjs','utf8');
const anchor=server.indexOf('const MIME = ');
assert(anchor>=0);
const start=anchor+'const MIME = '.length;
const end=parseExpressionAt(server,start,{ecmaVersion:'latest'}).end;
const mime=vm.runInNewContext('('+server.slice(start,end)+')');
assert.equal(mime['.js'],'application/javascript');
assert.equal(mime['.mjs'],undefined);
assert(server.includes("const mime = MIME[ext] || 'application/octet-stream'"));
const seen=new Map();
function inspect(file){
  if(seen.has(file))return;
  const source=fs.readFileSync(file,'utf8');
  const imports=parse(source,{ecmaVersion:'latest',sourceType:'module'}).body.filter(node=>node.type==='ImportDeclaration').map(node=>node.source.value);
  const target=file.endsWith('.mjs')?'tools/team-followup-20261001/ITEM/browser-bootstrap-derived-'+path.basename(file,'.mjs')+'.js':file;
  seen.set(file,{file,target,sha256:crypto.createHash('sha256').update(source).digest('hex'),mime:mime[path.extname(file)]||'application/octet-stream',imports});
  for(const specifier of imports){assert(specifier.startsWith('.'));inspect(path.posix.normalize(path.posix.join(path.posix.dirname(file),specifier)));}
}
inspect('tools/team-followup-20261001/ITEM/persistence-integration-port.mjs');
inspect('tools/team-followup-20261001/ITEM/browser-bootstrap-ui.js');
const graph=[...seen.values()].map(entry=>({...entry,proposedImportRewrites:entry.imports.map(specifier=>{
  const dependency=seen.get(path.posix.normalize(path.posix.join(path.posix.dirname(entry.file),specifier)));
  const relative=path.posix.relative(path.posix.dirname(entry.target),dependency.target);
  return {from:specifier,to:relative.startsWith('.')?relative:'./'+relative};
})}));
assert(graph.filter(entry=>entry.file.endsWith('.mjs')).every(entry=>entry.mime==='application/octet-stream'));
process.stdout.write(JSON.stringify({checkedAt:new Date().toISOString(),serverSha256:crypto.createHash('sha256').update(server).digest('hex'),
  graph,plan:'root 인수 후 명시 파생 .js 4개에 원문 그대로+import 경로만 치환; 원본 재작성/서버수정 없음. 현재는 계획만, 파생파일 생성/빌드0',
  factoryInstall:'별도 opt-in bootstrap에서 derived persistence factory를 import 후 installD10Review/createD10ReviewController에 주입',
  liveHTTP:'UNKNOWN',browserImport:'UNKNOWN',CSPAndPackaging:'UNKNOWN',mjsDirectImport:'현행 소스 MIME상 부적격'},null,2)+'\n');
