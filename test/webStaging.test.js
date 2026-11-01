import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,mkdirSync,lstatSync,existsSync,rmSync,linkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,join,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {stageWebRuntimeFile} from '../tools/build-web.mjs';
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
function fixture(t){
 const root=mkdtempSync(join(tmpdir(),'exoduser-stage-file-'));
 t.after(()=>{assert.ok(resolve(root).startsWith(resolve(tmpdir())+sep));rmSync(root,{recursive:true,force:true});});
 const source=join(root,'GLTFLoader.js'),dest=join(root,'staged.js'),bytes=Buffer.from('한글 binary fixture\0'.repeat(200));writeFileSync(source,bytes);
 return {root,source,dest,bytes};
}
const failure=code=>Object.assign(new Error('mock platform link '+code),{code});

test('exFAT regular-file EISDIR link failure copies exact source size and SHA without changing source',t=>{
 const f=fixture(t);let links=0;
 stageWebRuntimeFile(f.source,f.dest,{linkSync(){links++;throw failure('EISDIR');}});
 assert.equal(links,1);assert.equal(lstatSync(f.dest).size,f.bytes.length);
 assert.equal(digest(readFileSync(f.dest)),digest(f.bytes));assert.ok(readFileSync(f.source).equals(f.bytes));
});

test('actual directory source is rejected before link or copy',t=>{
 const f=fixture(t),directory=join(f.root,'directory');mkdirSync(directory);let operations=0;
 assert.throws(()=>stageWebRuntimeFile(directory,f.dest,{linkSync(){operations++;throw failure('EISDIR');},copyFileSync(){operations++;}}),/regular.*file/i);
 assert.equal(operations,0);assert.equal(existsSync(f.dest),false);
});

test('symbolic-link source is rejected using lstat without copying its target',t=>{
 const f=fixture(t);let operations=0;
 assert.throws(()=>stageWebRuntimeFile(f.source,f.dest,{lstatSync(path){return path===f.source?{isFile:()=>false,isSymbolicLink:()=>true}:lstatSync(path);},linkSync(){operations++;throw failure('EISDIR');},copyFileSync(){operations++;}}),/regular.*file/i);
 assert.equal(operations,0);assert.equal(existsSync(f.dest),false);
});

test('permission-denied link errors propagate without copy fallback',t=>{
 for(const code of ['EACCES','EPERM']){const f=fixture(t);let copies=0;const denied=failure(code);
  assert.throws(()=>stageWebRuntimeFile(f.source,f.dest,{linkSync(){throw denied;},copyFileSync(){copies++;}}),error=>error===denied);
  assert.equal(copies,0);assert.equal(existsSync(f.dest),false);
 }
});

test('EISDIR never overwrites an existing destination directory or file',t=>{
 for(const directory of [false,true]){const f=fixture(t);if(directory)mkdirSync(f.dest);else writeFileSync(f.dest,'keep');let copies=0;
  assert.throws(()=>stageWebRuntimeFile(f.source,f.dest,{linkSync(){throw failure('EISDIR');},copyFileSync(){copies++;}}));
  assert.equal(copies,0);if(!directory)assert.equal(readFileSync(f.dest,'utf8'),'keep');
 }
});

test('source turning into a directory after link failure aborts before copy',t=>{
 const f=fixture(t);let checks=0,copies=0;
 assert.throws(()=>stageWebRuntimeFile(f.source,f.dest,{lstatSync(path){if(path===f.source&&++checks>1)return {isFile:()=>false,isSymbolicLink:()=>false};return lstatSync(path);},linkSync(){throw failure('EISDIR');},copyFileSync(){copies++;}}),/regular.*file/i);
 assert.equal(copies,0);
});

test('an existing identical hard link is accepted but another file is preserved',t=>{
 const f=fixture(t);linkSync(f.source,f.dest);stageWebRuntimeFile(f.source,f.dest);assert.equal(digest(readFileSync(f.dest)),digest(f.bytes));
 const g=fixture(t);writeFileSync(g.dest,'keep');assert.throws(()=>stageWebRuntimeFile(g.source,g.dest),{code:'EEXIST'});assert.equal(readFileSync(g.dest,'utf8'),'keep');
 const zero=failure('EEXIST');assert.throws(()=>stageWebRuntimeFile(g.source,g.dest,{linkSync(){throw zero;},lstatSync(){return {isFile:()=>true,isSymbolicLink:()=>false,ino:0,dev:1};}}),error=>error===zero);assert.equal(readFileSync(g.dest,'utf8'),'keep');
});
