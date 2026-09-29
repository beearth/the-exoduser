import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkStaticOutput} from '../tools/check-vercel-output.mjs';
import {isMapAuthoringSource} from '../tools/web-runtime-manifest.mjs';
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
test('web staging excludes CH1 master and retouch sources while retaining playable chunks',()=>{
 for(const name of ['CH1_1_PRODUCTION_MASTER.png','outer66_sources/outer_patch66.png','outer71_sources/reuse.json','skin65_sources/ground_layer_skin65.png','floor87_sources/floor87_patch.png','floor87_sources/skin_material_generated.png','floor87_sources/prep.json']){
  assert.equal(isMapAuthoringSource('assets/map/ch1/production_finish/'+name),true,name);
 }
 for(const name of ['chunk_0_1.png','layout.js','composition.json','retouch-layers.json']){
  assert.equal(isMapAuthoringSource('assets/map/ch1/production_finish/'+name),false,name);
 }
 assert.equal(isMapAuthoringSource('assets/monsters/outer66_sources/sprite.png'),false);
});
test('runtime manifest includes every root stylesheet and script used by the lobby and game',()=>{
 const build=readFileSync(new URL('../build-nwjs.mjs',import.meta.url),'utf8');
 const files=new Set([...build.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]));
 for(const entry of ['index.html','game.html']){
  const html=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
  for(const [tag] of html.matchAll(/<link\b[^>]*>/g)){
   if(!/rel=["']stylesheet["']/.test(tag))continue;
   const path=tag.match(/href=["']([^"']+)/)?.[1].split('?')[0];
   if(path&&!path.includes('/'))assert.ok(files.has(path),entry+' stylesheet omitted: '+path);
  }
  for(const [,src] of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)/g)){
   const path=src.split('?')[0];
   if(path&&!path.includes('/')&&!path.startsWith('lang_')&&!path.includes('${'))assert.ok(files.has(path),entry+' script omitted: '+path);
  }
 }
});
