import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';

const toolURL=new URL('../tools/steamdeck-package.mjs',import.meta.url);
async function implementation(){
  assert.ok(fs.existsSync(toolURL),'Steam Deck package builder must exist');
  return import(toolURL);
}
function bootstrap(source,initial={}){
  const storage=new Map(Object.entries(initial));let target;
  vm.runInNewContext(source,{localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},location:{replace:p=>{target=p;}}});
  return {storage,target};
}
test('fresh Deck profile uses medium graphics at native resolution without changing gameplay',async()=>{
  const {bootstrapSource}=await implementation();
  const {storage,target}=bootstrap(bootstrapSource());
  const data=JSON.parse(storage.get('hellcave_settings'));
  assert.equal(data.opt.fpsCap,60);assert.equal(data.opt.resScale,100);assert.equal(data.opt.ssaa,1);
  assert.equal(data.opt.parts,20);assert.equal(data.opt.bloom,false);assert.equal(data.opt.showFps,true);
  assert.equal('diff' in data.opt,false);assert.equal('binds' in data,false);
  assert.equal(data.opt.diffV2,1,'fresh graphics settings must not trigger legacy difficulty +5 migration');
  assert.equal(target,'index.html');
});
test('Deck launcher preserves existing settings and language on every later launch',async()=>{
  const {bootstrapSource}=await implementation();
  const saved=JSON.stringify({opt:{fpsCap:40,lang:'en',parts:30},binds:{shield:'KeyV'}});
  const {storage,target}=bootstrap(bootstrapSource(),{hellcave_settings:saved,hellLang:'en'});
  assert.equal(storage.get('hellcave_settings'),saved);assert.equal(storage.get('hellLang'),'en');
  assert.equal(target,'index.html');
  const corrupt=bootstrap(bootstrapSource(),{hellcave_settings:'{broken'});
  assert.equal(corrupt.storage.get('hellcave_settings'),'{broken');assert.equal(corrupt.target,'index.html');
});
test('package uses current source assets including untracked additions, excludes backups and refuses reuse',async()=>{
  const {planPackage}=await implementation();
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'exoduser-deck-test-'));
  const write=(p,s='fixture')=>{fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});fs.writeFileSync(path.join(root,p),s);};
  try{
    write('build-nwjs.mjs',"const FILES = ['index.html','game.html'];\nconst DIRS = ['assets'];");
    for(const p of ['index.html','game.html','node-main.js','assets/new-skill.png','assets/new-skill.png.bak','assets/source.zip','atlas_player.png','atlas_player.png.bak','lang_ko.js'])write(p);
    const runtime=path.join(root,'runtime');write('runtime/EXODUSER.exe');write('runtime/nw.dll');write('runtime/userdata/Cookies');write('runtime/package.nw/stale.html');
    const output=path.join(root,'out/deck');
    const plan=planPackage(root,runtime,output);
    assert.ok(plan.sourceFiles.includes('assets/new-skill.png'));
    assert.ok(plan.sourceFiles.includes('node-main.js'));
    assert.ok(!plan.sourceFiles.some(p=>p.endsWith('.bak')||p.endsWith('.zip')));
    assert.deepEqual(plan.runtimeFiles.sort(),['EXODUSER.exe','nw.dll']);
    assert.throws(()=>planPackage(root,runtime,root),/output/i);
    assert.throws(()=>planPackage(root,runtime,path.resolve(root,'../outside')),/output/i);
    fs.mkdirSync(output,{recursive:true});assert.throws(()=>planPackage(root,runtime,output),/exist/i);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('Deck manifest selects 1280x800 and preserves required native bootstrap',async()=>{
  const {deckManifest}=await implementation();
  const base=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  const manifest=deckManifest(base);
  assert.equal(manifest.main,'http://localhost:3333/deck-start.html');
  assert.equal(manifest.window.width,1280);assert.equal(manifest.window.height,800);
  assert.equal(manifest['node-main'],'node-main.js');
  assert.equal(manifest.window.fullscreen,true);
  assert.ok(!manifest.dependencies);assert.ok(!manifest.type);
});
test('desktop manifest optional absent directories are reported while required entrypoints must exist',async()=>{
  const {planPackage}=await implementation();
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'exoduser-deck-optional-'));
  try{
    fs.writeFileSync(path.join(root,'build-nwjs.mjs'),"const FILES = ['index.html','game.html'];\nconst DIRS = ['old-art'];");
    for(const p of ['index.html','game.html','node-main.js'])fs.writeFileSync(path.join(root,p),'fixture');
    fs.mkdirSync(path.join(root,'runtime'));for(const p of ['EXODUSER.exe','nw.dll'])fs.writeFileSync(path.join(root,'runtime',p),'fixture');
    const plan=planPackage(root,path.join(root,'runtime'),path.join(root,'out/deck'));
    assert.deepEqual(plan.missingDirectories,['old-art']);
    fs.unlinkSync(path.join(root,'game.html'));
    assert.throws(()=>planPackage(root,path.join(root,'runtime'),path.join(root,'out/deck')),/Missing runtime file: game.html/);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
