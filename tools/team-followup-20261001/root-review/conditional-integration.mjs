import fs from 'node:fs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {applyCandidate} from '../BUILD/conditional-range-candidate.mjs';
const out='outputs/team-review-20261002/conditional-integration/';
const sha=s=>createHash('sha256').update(s).digest('hex');
const owners=JSON.parse(fs.readFileSync(out+'owner-hashes.json'));
for(const [file,h]of Object.entries(owners))assert.equal(sha(fs.readFileSync(file)),h,file);
const before=fs.readFileSync(out+'conditional-before.cjs','utf8');
assert.equal(sha(before),'6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538');
assert.equal(fs.readFileSync('server.cjs','utf8'),applyCandidate(before));
function runGenerated(name,text){
 const url=new URL('./'+name+'.generated.mjs',import.meta.url);fs.writeFileSync(url,text);
 const r=spawnSync(process.execPath,[url.pathname],{encoding:'utf8'});
 fs.writeFileSync(out+name+'.txt',r.stdout+r.stderr);
 assert.equal(r.status,0,r.stdout+r.stderr);
}
let conditional=fs.readFileSync(new URL('../BUILD/conditional-range-test.mjs',import.meta.url),'utf8')
 .replace("from './conditional-range-candidate.mjs'","from '../BUILD/conditional-range-candidate.mjs'")
 .replace("prefix='tools/team-followup-20261001/BUILD/conditional-range-'",`prefix='${out}conditional-'`)
 .replace("source=fs.readFileSync('server.cjs','utf8'),candidate=applyCandidate(source)",`source=fs.readFileSync('${out}conditional-before.cjs','utf8'),candidate=fs.readFileSync('server.cjs','utf8')`)
 .replace("assert.equal(hash(fs.readFileSync('server.cjs')),hash(source))","assert.equal(hash(fs.readFileSync('server.cjs')),hash(candidate))");
runGenerated('conditional-source31',conditional);

// Adapt the previously accepted 40-group source suite without editing it.
// Cache declarations moved before Range; include that actual prelude in the VM.
let legacy=fs.readFileSync(new URL('./server-integration.mjs',import.meta.url),'utf8');
legacy="import {applyCandidate as applyConditional} from '../BUILD/conditional-range-candidate.mjs';\n"+legacy
 .replace("const out='outputs/team-review-20261002/server-integration/';",`const out='${out}';`)
 .replace("assert.equal(current,expected,'Production must equal exactly the two reviewed changes');","assert.equal(current,applyConditional(expected),'Production must equal the three reviewed changes');")
 .replaceAll('./server-integration-range.generated.mjs','./conditional-legacy-range.generated.mjs')
 .replaceAll('./server-integration-save.generated.mjs','./conditional-legacy-save.generated.mjs');
// JSON literals keep generator quoting explicit and reviewable.
const replaceExpression='declaration=value===source?oldDeclaration:value.slice(value.indexOf('+JSON.stringify("      const _isHtml = ext === '.html';")+'),value.indexOf('+JSON.stringify('      if (range) {')+'))';
const prep='range='+JSON.stringify("import {oldCacheBlock} from '../BUILD/conditional-range-candidate.mjs';\n")+'+range.replace('+JSON.stringify('assert.equal(originalExtract.fallback,candidateExtract.fallback)')+','+JSON.stringify("assert.equal(originalExtract.fallback.replace(oldCacheBlock,''),candidateExtract.fallback)")+').replace('+JSON.stringify('declaration=value===source?oldDeclaration:newDeclaration')+','+JSON.stringify(replaceExpression)+');\n';
legacy=legacy.replace('fs.writeFileSync(rangeGenerated,range);',prep+'fs.writeFileSync(rangeGenerated,range);');
runGenerated('conditional-legacy40',legacy);

// Read and verify the owner's actual synthetic files, then run the same seven
// actual-I/O cases in a new root-owned directory with separate evidence output.
const ownerEvidence=JSON.parse(fs.readFileSync('tools/team-followup-20261001/BALANCE/atomic-file-evidence.json'));
const ownerFixtureBase='tools/team-followup-20261001/BALANCE/atomic-file-fixtures/'+ownerEvidence.output.split('/').at(-1);
for(const file of ownerEvidence.files)assert.equal(sha(fs.readFileSync(ownerFixtureBase+'/'+file.name)),file.sha256);
let atomic=fs.readFileSync(new URL('../BALANCE/atomic-file-test.mjs',import.meta.url),'utf8')
 .replace("const base = fileURLToPath(new URL('./atomic-file-fixtures/',import.meta.url));",`const base = path.join(root,${JSON.stringify(out+'atomic-file-fixtures/')});`)
 .replace("new URL('./atomic-file-evidence.json',import.meta.url)",JSON.stringify(out+'atomic-file-root-evidence.json'));
runGenerated('conditional-atomic-file7',atomic);
for(const [file,h]of Object.entries(owners))assert.equal(sha(fs.readFileSync(file)),h,file);
const report={utc:new Date().toISOString(),serverBeforeSHA:sha(before),serverAfterSHA:sha(fs.readFileSync('server.cjs')),conditionalGroups:31,previousSourceGroups:40,actualOwnedFileGroups:7,totalGroups:78,ownerFilesPreserved:Object.keys(owners).length,limits:'Memory stream/HTTP doubles and real synthetic file IO only; injected write/rename EIO distinguished from OS ENOENT/EEXIST. No HTTP/listen/server/app/runtime/crash/fsync/Windows validation.'};
fs.writeFileSync(out+'acceptance.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
