import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkStaticOutput} from '../tools/check-vercel-output.mjs';
function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'exoduser-upload-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 for(const n of ['index.html','game.html','parry-lesson.js','resource-practice.js'])writeFileSync(join(dir,n),'ok');
 return dir;
}
test('upload audit counts nested files and preserves their contents',t=>{
 const dir=fixture(t);mkdirSync(join(dir,'assets'));writeFileSync(join(dir,'assets','sprite'),'12345');
 const r=checkStaticOutput(dir);assert.equal(r.files,5);assert.equal(r.bytes,13);assert.equal(r.largest[0].bytes,5);
 assert.equal(readFileSync(join(dir,'assets','sprite'),'utf8'),'12345');
});
test('upload audit rejects missing entries and file/count limits before network upload',t=>{
 const dir=fixture(t);
 assert.throws(()=>checkStaticOutput(dir,{maxFileBytes:1}),/exceed/);
 assert.throws(()=>checkStaticOutput(dir,{maxFiles:4}),/file count/);
 assert.equal(checkStaticOutput(dir,{maxFiles:5,maxFileBytes:2}).files,4);
 rmSync(join(dir,'game.html'));assert.throws(()=>checkStaticOutput(dir),/Missing runtime entry: game.html/);
});
test('workflow audits prebuilt output then uses individual uploads and pinned CLI',()=>{
 const s=readFileSync(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8');
 assert.match(s,/vercel@59\.16\.0/);assert.doesNotMatch(s,/--archive|vercel@latest/);
 assert.ok(s.indexOf('node tools/check-vercel-output.mjs')<s.indexOf('vercel deploy --prebuilt'));
 assert.match(s,/vercel deploy --prebuilt --prod --logs/);
});
