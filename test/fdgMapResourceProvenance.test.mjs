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
const git=(dir,args,input)=>execFileSync('git',args,{cwd:dir,input,encoding:'utf8',maxBuffer:16*1024*1024,
 env:{...process.env,GIT_AUTHOR_NAME:'Provenance fixture',GIT_AUTHOR_EMAIL:'fixture@example.invalid',GIT_COMMITTER_NAME:'Provenance fixture',GIT_COMMITTER_EMAIL:'fixture@example.invalid',GIT_AUTHOR_DATE:'2026-10-20T00:00:00Z',GIT_COMMITTER_DATE:'2026-10-20T00:00:00Z'}}).trim();
// Admission is a recorded JSON blob, not a mutable CLI output or the commit
// selected by git log. Read all three versioned records from the same snapshot.
const recorded=p=>execFileSync('git',['show','HEAD:'+p],{cwd:root,maxBuffer:16*1024*1024});
const admitted=recorded(rel);
const manifest=JSON.parse(admitted);
const raw=JSON.parse(recorded('godot/data/ch2_map_source/si4.json'));
const pin=/const RESOURCE_SHA := "([a-f0-9]{64})"/.exec(recorded('godot/scripts/native_ch2_area_resources.gd').toString('utf8'))[1];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function fixture({newCase=false}={}){
 const prefix=newCase?'EXODUSER-ch-map-pin-2-Isolated-20261020-':'EXODUSER-ch-map-pin-Isolated-20261020-';
 const parent=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),prefix));
 const dir=path.join(parent,'source');fs.mkdirSync(dir);
 const copy=p=>{const out=path.join(dir,p);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(path.join(root,p),out,fs.constants.COPYFILE_FICLONE);};
 try{
  const inputs=new Set(['game.html','maps_data.js','package.json',rel,...raw.asset_refs.map(a=>a.file),...manifest.assets.flatMap(a=>[a.source,'godot/'+a.texture.slice(6)])]);
  for(const p of inputs)copy(p);
  // Own refs/index: neither a merge nor a dirty output in the caller's worktree
  // may silently replace this fixture's admitted JSON. Existing recorded source
  // objects are read-only alternates; no symlink, hook or root-repository write.
  git(dir,['init','--quiet']);
  git(dir,['config','core.autocrlf','false']);
  const common=git(root,['rev-parse','--path-format=absolute','--git-common-dir']);
  fs.writeFileSync(path.join(dir,'.git/objects/info/alternates'),path.join(common,'objects').replaceAll('\\','/')+'\n');
  const file=path.join(dir,rel);
  for(const p of ['game.html','maps_data.js','package.json'])fs.writeFileSync(path.join(dir,p),recorded(p));
  fs.writeFileSync(file,admitted);
  const commit=(parents=[],files=['game.html',rel])=>{
   git(dir,['add','--',...files]);const tree=git(dir,['write-tree']);
   return git(dir,['commit-tree',tree,...parents.flatMap(p=>['-p',p]),'-m','Isolated provenance fixture']);
  };
  const initial=commit();
  git(dir,['update-ref','HEAD',initial]);git(dir,['update-ref','refs/remotes/origin/main',initial]);
  const acorn=path.dirname(createRequire(path.join(root,'package.json')).resolve('acorn/package.json'));
  fs.mkdirSync(path.join(dir,'node_modules'),{recursive:true});fs.cpSync(acorn,path.join(dir,'node_modules/acorn'),{recursive:true,dereference:true});
  return {dir,parent,file,initial,commit,oracle:path.join(parent,'oracle.json'),close:()=>fs.rmSync(parent,{recursive:true,force:true})};
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
  assert.equal(sha(execFileSync('git',['show',written.source.main_sha+':game.html'],{cwd:f.dir,maxBuffer:16*1024*1024})),written.source.game_sha256);
  assert.equal(sha(fs.readFileSync(f.file)),pin,'native content still matches the admitted artifact exactly');
 }finally{f.close();}
});
test('a prior CLI provenance-only rewrite is repaired to the committed admitted bytes without repinning',()=>{
 const f=fixture();try{
  const changed=structuredClone(manifest);
  changed.source.main_sha=f.initial;
  fs.writeFileSync(f.file,JSON.stringify(changed)+'\n');assert.notEqual(sha(fs.readFileSync(f.file)),pin);
  const result=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),admitted);assert.deepEqual(result.bundle,manifest);
  assert.equal(sha(fs.readFileSync(f.file)),pin);assert.equal(JSON.parse(fs.readFileSync(f.oracle)).queries.length,10998);
 }finally{f.close();}
});
test('a metadata-only merge cannot replace the recorded provenance or admitted byte pin',()=>{
 const f=fixture({newCase:true});try{
  const metadata='godot/data/map_look_ch1.json';
  fs.writeFileSync(path.join(f.dir,metadata),JSON.stringify({schema:'UNIT metadata only'})+'\n');
  const side=f.commit([f.initial],[metadata]);
  const merged=f.commit([f.initial,side]);git(f.dir,['update-ref','HEAD',merged]);git(f.dir,['update-ref','refs/remotes/origin/main',merged]);
  assert.notEqual(merged,manifest.source.main_sha);
  assert.equal(git(f.dir,['rev-list','--parents','-n','1','HEAD']).split(' ').length,3,'exercise a real two-parent merge');
  const result=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),admitted);assert.deepEqual(result.bundle,manifest);assert.equal(sha(fs.readFileSync(f.file)),pin);
 }finally{f.close();}
});
test('another admitted provenance JSON with the same original bytes retains its own exact hash through repair',()=>{
 const f=fixture({newCase:true});try{
  const variant=structuredClone(manifest);variant.source.main_sha=f.initial;
  const bytes=Buffer.from(JSON.stringify(variant)+'\n'),variantPin=sha(bytes);
  fs.writeFileSync(f.file,bytes);const recordedHead=f.commit([f.initial]);git(f.dir,['update-ref','HEAD',recordedHead]);git(f.dir,['update-ref','refs/remotes/origin/main',recordedHead]);
  assert.notEqual(variantPin,pin,'same native content can have a distinct recorded provenance byte hash');
  assert.equal(sha(execFileSync('git',['show',variant.source.main_sha+':game.html'],{cwd:f.dir,maxBuffer:16*1024*1024})),variant.source.game_sha256);
  const native=structuredClone(variant);native.source.main_sha=manifest.source.main_sha;assert.deepEqual(native,manifest,'only recorded main provenance differs');
  const corrupted=structuredClone(variant);corrupted.colliders[0].rx+=1;fs.writeFileSync(f.file,JSON.stringify(corrupted)+'\n');
  const result=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),bytes);assert.deepEqual(result.bundle,variant);assert.equal(sha(fs.readFileSync(f.file)),variantPin);
  const rewritten=structuredClone(variant);rewritten.source.main_sha=recordedHead;fs.writeFileSync(f.file,JSON.stringify(rewritten)+'\n');
  const repaired=writeResources(f.dir,f.oracle);
  assert.deepEqual(fs.readFileSync(f.file),bytes);assert.deepEqual(repaired.bundle,variant);assert.equal(sha(fs.readFileSync(f.file)),variantPin);
 }finally{f.close();}
});
test('a resolvable recorded commit with different original bytes is rejected without output',()=>{
 const f=fixture({newCase:true});try{
  const source=fs.readFileSync(path.join(f.dir,'game.html'));
  fs.appendFileSync(path.join(f.dir,'game.html'),'\n<!-- UNIT different source bytes -->\n');
  const wrong=f.commit([f.initial],['game.html']);fs.writeFileSync(path.join(f.dir,'game.html'),source);
  const changed=structuredClone(manifest);changed.source.main_sha=wrong;
  const bytes=Buffer.from(JSON.stringify(changed)+'\n');fs.writeFileSync(f.file,bytes);
  assert.throws(()=>writeResources(f.dir,f.oracle),/recorded source commit bytes mismatch/i);
  assert.deepEqual(fs.readFileSync(f.file),bytes);assert.equal(fs.existsSync(f.oracle),false);
 }finally{f.close();}
});
