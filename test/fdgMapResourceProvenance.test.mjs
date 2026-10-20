import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {writeResources} from '../godot/tools/export_ch2_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rel='godot/data/ch2_map_source/si4_resources.json';
const admitted=fs.readFileSync(path.join(root,rel));
const manifest=JSON.parse(admitted);
const raw=JSON.parse(fs.readFileSync(path.join(root,'godot/data/ch2_map_source/si4.json'),'utf8'));
const pin=/const RESOURCE_SHA := "([a-f0-9]{64})"/.exec(fs.readFileSync(path.join(root,'godot/scripts/native_ch2_area_resources.gd'),'utf8'))[1];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function fixture(){
 const parent=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch-map-pin-Isolated-20261020-'));
 const dir=path.join(parent,'source');fs.mkdirSync(dir);
 const copy=p=>{const out=path.join(dir,p);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,p),out,fs.constants.COPYFILE_FICLONE);};
 try{
  const inputs=new Set(['game.html','maps_data.js','package.json',rel,...raw.asset_refs.map(a=>a.file),...manifest.assets.flatMap(a=>[a.source,'godot/'+a.texture.slice(6)])]);
  for(const p of inputs)copy(p);
  // Read-only git show/rev-parse works in a fixture without symlinks or a second checkout.
  const gitdir=execFileSync('git',['rev-parse','--absolute-git-dir'],{cwd:root,encoding:'utf8'}).trim();
  fs.writeFileSync(path.join(dir,'.git'),'gitdir: '+gitdir.replaceAll('\\','/')+'\n');
  const acorn=path.dirname(createRequire(path.join(root,'package.json')).resolve('acorn/package.json'));
  fs.mkdirSync(path.join(dir,'node_modules'),{recursive:true});fs.cpSync(acorn,path.join(dir,'node_modules/acorn'),{recursive:true,dereference:true});
  return {dir,parent,file:path.join(dir,rel),oracle:path.join(parent,'oracle.json'),close:()=>fs.rmSync(parent,{recursive:true,force:true})};
 }catch(error){fs.rmSync(parent,{recursive:true,force:true});throw error;}
}
test('unchanged native re-extraction keeps admitted manifest bytes, SHA pin and recorded main provenance',()=>{
 const f=fixture();try{
  assert.equal(sha(admitted),pin);
  const result=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),admitted);
  assert.equal(sha(fs.readFileSync(f.file)),pin);
  assert.deepEqual(result.bundle,manifest);
  const oracle=JSON.parse(fs.readFileSync(f.oracle,'utf8'));
  assert.equal(oracle.schema,'exoduser.ch2-area-oracle.v1');assert.equal(oracle.stage,4);
  assert.equal(oracle.queries.length,10998);assert.equal(oracle.los.length,400);
 }finally{f.close();}
});
test('matching payload cannot retain an unresolvable recorded source commit or emit an oracle',()=>{
 const f=fixture();try{
  const invalid=structuredClone(manifest);invalid.source.main_sha='0'.repeat(40);
  const bytes=Buffer.from(JSON.stringify(invalid)+'\n');fs.writeFileSync(f.file,bytes);
  assert.throws(()=>writeResources(f.dir,f.oracle),/recorded source commit/i);
  assert.deepEqual(fs.readFileSync(f.file),bytes);assert.equal(fs.existsSync(f.oracle),false);
 }finally{f.close();}
});
test('a corrupted working collider is regenerated from native source rather than retained with its provenance',()=>{
 const f=fixture();try{
  const changed=structuredClone(manifest);changed.colliders[0].rx+=1;
  fs.writeFileSync(f.file,JSON.stringify(changed)+'\n');
  const result=writeResources(f.dir,f.oracle),written=JSON.parse(fs.readFileSync(f.file,'utf8'));
  assert.deepEqual(written,result.bundle);assert.deepEqual(written.colliders,manifest.colliders);
  assert.notDeepEqual(written.colliders,changed.colliders);
  assert.equal(written.source.main_sha,manifest.source.main_sha);
  assert.equal(sha(execFileSync('git',['show',written.source.main_sha+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),written.source.game_sha256);
  assert.equal(sha(fs.readFileSync(f.file)),pin,'native content still matches the admitted artifact exactly');
 }finally{f.close();}
});
test('a prior CLI provenance-only rewrite is repaired to the committed admitted bytes without repinning',()=>{
 const f=fixture();try{
  const changed=structuredClone(manifest);
  changed.source.main_sha=execFileSync('git',['rev-parse','origin/main'],{cwd:root,encoding:'utf8'}).trim();
  fs.writeFileSync(f.file,JSON.stringify(changed)+'\n');assert.notEqual(sha(fs.readFileSync(f.file)),pin);
  const result=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),admitted);assert.deepEqual(result.bundle,manifest);
  assert.equal(sha(fs.readFileSync(f.file)),pin);assert.equal(JSON.parse(fs.readFileSync(f.oracle)).queries.length,10998);
 }finally{f.close();}
});
