import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import {applyCandidate} from '../BUILD/media-range-candidate.mjs';

const out='outputs/team-review-20261002/server-integration/';
const before=fs.readFileSync(out+'server-before.cjs','utf8');
const current=fs.readFileSync('server.cjs','utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const ownerHashes=JSON.parse(fs.readFileSync(out+'owner-file-hashes.json'));
for(const [file,expected] of Object.entries(ownerHashes))assert.equal(hash(fs.readFileSync(file)),expected,file);
assert.equal(hash(before),'339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad');
const helper=fs.readFileSync('tools/team-followup-20261001/BALANCE/save-write-failure-candidate.mjs','utf8').replace('let sequence = 0;','let atomicSaveSequence = 0;').replace('export function','function').replace('(++sequence)','(++atomicSaveSequence)');
const oldWrite="fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(saveData, null, 2), 'utf8');";
const expected=applyCandidate(before).replace('function sanitizeSlot(name) {',helper+'\nfunction sanitizeSlot(name) {').replace(oldWrite,"atomicSaveJSON(fs, path.join(SAVE_DIR, slot + '.json'), saveData, process.pid);");
assert.equal(current,expected,'Production must equal exactly the two reviewed changes');
parse(current,{ecmaVersion:'latest'});

// Preserve owner tests and RED evidence. Derived tests execute the current source
// branch/helper/route while using the frozen pre-change source for the RED cases.
const rangePath='tools/team-followup-20261001/BUILD/media-range-test.mjs';
let range=fs.readFileSync(rangePath,'utf8');
range=range.replace("from './media-range-candidate.mjs'","from '../BUILD/media-range-candidate.mjs'")
  .replace("prefix='tools/team-followup-20261001/BUILD/media-range-'",`prefix='${out}range-'`)
  .replace("source=fs.readFileSync('server.cjs','utf8'),candidate=applyCandidate(source)",`source=fs.readFileSync('${out}server-before.cjs','utf8'),candidate=fs.readFileSync('server.cjs','utf8')`)
  .replace('assert.equal(sourceAfter,hash(source))','assert.equal(sourceAfter,hash(candidate))');
const rangeGenerated=new URL('./server-integration-range.generated.mjs',import.meta.url);
fs.writeFileSync(rangeGenerated,range);
await import(rangeGenerated.href+'?run='+Date.now());

let save=fs.readFileSync('tools/team-followup-20261001/BALANCE/save-write-failure-test.mjs','utf8');
const productionHelper=current.slice(current.indexOf('let atomicSaveSequence = 0;'),current.indexOf('function sanitizeSlot(name) {'));
save=save.replace("import {atomicSaveJSON} from './save-write-failure-candidate.mjs';",`const atomicSaveJSON=vm.runInNewContext(${JSON.stringify(productionHelper+'; atomicSaveJSON;')});`)
  .replace("const source = fs.readFileSync('server.cjs', 'utf8');",`const source = fs.readFileSync('${out}server-before.cjs', 'utf8');\nconst production=fs.readFileSync('server.cjs','utf8');`)
  .replace('const candidateRoute = route.replace(originalWrite, "atomicSaveJSON(fs, path.join(SAVE_DIR, slot + \'.json\'), saveData, processId);");',`const candidateRoute=production.slice(production.indexOf("    if (pathname === '/api/save'"),production.indexOf("    if (pathname.startsWith('/api/load/'"));`)
  .replace('processId:987,atomicSaveJSON','processId:987,process:{pid:987},atomicSaveJSON')
  .replace("assert.equal(sha(fs.readFileSync('server.cjs')),sha(source));","assert.equal(sha(fs.readFileSync('server.cjs')),sha(production));")
  .replace("new URL('./save-write-failure-evidence.json',import.meta.url)",JSON.stringify(out+'save-evidence.json'));
assert(save.includes('const candidateRoute=production.slice'));
const saveGenerated=new URL('./server-integration-save.generated.mjs',import.meta.url);
fs.writeFileSync(saveGenerated,save);
await import(saveGenerated.href+'?run='+Date.now());

// Invoke the entire actual HTTP handler expression without http.createServer,
// listen, network, real filesystem writes or loading .env. Verify the existing
// outer catch and successful ACK ordering, omitted by the owner's route fixture.
const ast=parse(current,{ecmaVersion:'latest'});
const node=ast.body.find(n=>n.type==='VariableDeclaration'&&n.declarations[0]?.id.name==='server').declarations[0].init.arguments[0];
const functionText=name=>{const n=ast.body.find(n=>n.type==='FunctionDeclaration'&&n.id.name===name);return current.slice(n.start,n.end);};
const checks=[];
for(const mode of ['success','write','rename','invalid-json']){
  let stored='previous-json',temp='',next=0;const calls=[];
  const memory={openSync(){calls.push('open');return 11;},writeFileSync(fd,data){temp=data.slice(0,17);if(mode==='write')throw new Error('partial');temp=data;},closeSync(){},renameSync(){calls.push('rename');if(mode==='rename')throw new Error('rename');stored=temp;},unlinkSync(){calls.push('cleanup');}};
  const res={writeHead(code){this.status=code;calls.push('status:'+code);},end(body){this.body=body;}};
  const req={url:'/api/save',method:'POST',on(event,fn){if(event==='data')fn(Buffer.from(mode==='invalid-json'?'{':JSON.stringify({slot:'test',data:{game:{mats:123}}})));if(event==='end')fn();return this;}};
  const context=vm.createContext({fs:memory,path,SAVE_DIR:'/memory-only',PORT:3340,URL,Buffer,process:{pid:987},console:{error(){}}});
  const handler=vm.runInContext(productionHelper+'\n'+['sanitizeSlot','sendJSON','readBody'].map(functionText).join('\n')+'\n('+current.slice(node.start,node.end)+')',context);
  await handler(req,res);
  if(mode==='success'){assert.equal(res.status,200);assert.deepEqual(JSON.parse(res.body),{ok:true,slot:'test'});assert.deepEqual(JSON.parse(stored),{game:{mats:123}});assert(calls.indexOf('rename')<calls.indexOf('status:200'));}
  else{assert.equal(res.status,500);assert.equal(res.body,'Internal Server Error');assert.equal(stored,'previous-json');assert(!calls.includes('status:200'));}
  checks.push({name:'whole-handler-'+mode,status:'PASS'});
}
for(const [file,expected] of Object.entries(ownerHashes))assert.equal(hash(fs.readFileSync(file)),expected,file);
assert.equal(fs.readFileSync('server.cjs','utf8'),current);
const result={utc:new Date().toISOString(),beforeSHA:hash(before),productionSHA:hash(current),rangeGroups:23,saveGroups:13,wholeHandlerGroups:checks.length,totalGroups:40,checks,ownerFilesPreserved:Object.keys(ownerHashes).length,limits:'Actual source in VM with memory fs and stream doubles. No listen/network/real save/disk/crash/fsync/media playback verification.'};
fs.writeFileSync(out+'result.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
