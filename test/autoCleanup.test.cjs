const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {runOnce}=require('../tools/auto-cleanup.cjs');
const base=path.resolve(__dirname,'../tmp/auto-cleanup-tests');fs.mkdirSync(base,{recursive:true});
function fixture(){
 const root=fs.mkdtempSync(path.join(base,'repo-'));
 const git=(...args)=>cp.execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']});
 git('init');git('config','user.name','Auto Cleanup Test');git('config','user.email','test@example.invalid');git('config','commit.gpgsign','false');
 fs.writeFileSync(path.join(root,'.gitignore'),'tmp/\n');git('add','.gitignore');git('commit','-m','initial');
 const write=(p,s)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,s);};
 return {root,git,write};
}
test('49 changes stay visible; 50 stable changes commit locally after one minute',()=>{
 const f=fixture();for(let i=0;i<49;i++)f.write(`docs/change-${i}.md`,'change\n');
 assert.equal(runOnce({root:f.root,now:1000}).status,'below-threshold');
 f.write('docs/change-49.md','change\n');
 assert.equal(runOnce({root:f.root,now:1000}).status,'waiting-for-idle');
 assert.equal(runOnce({root:f.root,now:60999}).status,'waiting-for-idle');
 const result=runOnce({root:f.root,now:61000});assert.equal(result.status,'committed',result.reason);assert.equal(result.remaining,0);
 assert.equal(f.git('status','--porcelain').trim(),'');assert.equal(f.git('rev-list','--count','HEAD').trim(),'2');
});
test('another session staged work is preserved without a commit',()=>{
 const f=fixture();f.write('file.txt','user work');f.git('add','file.txt');
 const index=f.git('diff','--cached');
 assert.equal(runOnce({root:f.root,threshold:1,now:1000}).status,'staged-work');assert.equal(f.git('diff','--cached'),index);
});
test('missing docs and broken JavaScript block auto-commit and preserve the index',()=>{
 const f=fixture();f.write('feature.js','function broken( {');
 runOnce({root:f.root,threshold:1,now:1000});
 assert.match(runOnce({root:f.root,threshold:1,now:61000}).reason,/docs/);
 f.write('docs/feature.md','Updated\n');f.write('docs/CHANGELOG_SYNC.md','Updated\n');
 runOnce({root:f.root,threshold:1,now:62000});
 const r=runOnce({root:f.root,threshold:1,now:122000});assert.equal(r.status,'blocked');assert.match(r.reason,/Unexpected/);
 assert.equal(f.git('diff','--cached').trim(),'');assert.equal(f.git('rev-list','--count','HEAD').trim(),'1');
});
test('a changed file during validation is retained without staging it',()=>{
 const f=fixture();f.write('docs/test.md','before');
 runOnce({root:f.root,threshold:1,now:1000});
 const r=runOnce({root:f.root,threshold:1,now:61000,validate:()=>f.write('docs/test.md','updated during checks')});
 assert.equal(r.status,'changed-during-check');assert.equal(f.git('diff','--cached').trim(),'');
});
test('an existing Git lock remains untouched',()=>{
 const f=fixture();f.write('docs/test.md','before');runOnce({root:f.root,threshold:1,now:1000});
 fs.writeFileSync(path.join(f.root,'.git/index.lock'),'other session');
 const r=runOnce({root:f.root,threshold:1,now:61000});assert.equal(r.status,'git-busy');
 assert.equal(fs.readFileSync(path.join(f.root,'.git/index.lock'),'utf8'),'other session');
});
test('a rejected commit preserves HEAD, user files and the shared index',()=>{
 const f=fixture();f.write('docs/test.md','keep this');
 f.write('.git/hooks/pre-commit','#!/bin/sh\nexit 1\n');
 runOnce({root:f.root,threshold:1,now:1000});
 const head=f.git('rev-parse','HEAD'),index=fs.readFileSync(path.join(f.root,'.git/index'));
 const r=runOnce({root:f.root,threshold:1,now:61000});assert.equal(r.status,'blocked');
 assert.equal(f.git('rev-parse','HEAD'),head);assert.deepEqual(fs.readFileSync(path.join(f.root,'.git/index')),index);
 assert.equal(fs.readFileSync(path.join(f.root,'docs/test.md'),'utf8'),'keep this');assert.ok(!fs.existsSync(path.join(f.root,'.git/index.lock')));
});
