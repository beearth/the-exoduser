import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname,resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {prepareVercelOutput} from '../tools/prepare-vercel-output.mjs';
import * as derived from '../tools/web-derived-assets.mjs';
import {selectWebRuntimeFiles} from '../tools/web-runtime-manifest.mjs';

const manifestPath='assets/web-derived/20261101/manifest.json';
const hash=(value,algorithm='sha256')=>createHash(algorithm).update(value).digest('hex');
function fixture(t) {
 const root=mkdtempSync(join(tmpdir(),'exoduser-web-derived-'));
 t.after(()=>{assert.ok(resolve(root).startsWith(resolve(tmpdir())+sep));rmSync(root,{recursive:true,force:true});});
 const source=Buffer.from('original pcm'),media=Buffer.from('fLaCderived pcm');
 const sourcePath='bgm/공통/current.wav',target='assets/web-derived/20261101/current.flac';
 for(const [path,bytes] of [[sourcePath,source],[target,media]]){mkdirSync(dirname(join(root,path)),{recursive:true});writeFileSync(join(root,path),bytes);}
 const record={source_path:sourcePath,source_git_blob:hash(Buffer.concat([Buffer.from('blob '+source.length+'\0'),source]),'sha1'),source_sha256:hash(source),source_bytes:source.length,derivative_path:target,sha256:hash(media),bytes:media.length,mime:'audio/flac'};
 const selected=[sourcePath],tracked=[sourcePath,target,manifestPath];
 function save(assets=[record]){writeFileSync(join(root,manifestPath),JSON.stringify({version:1,assets}));}
 save();return {root,source,media,record,selected,tracked,save,plan:options=>derived.planWebDerivedAssets({root,selected,tracked,...options})};
}

test('derived media replaces a selected source once and keeps its canonical public URL with real MIME',t=>{
 const f=fixture(t),plan=f.plan();
 assert.equal(plan.entries.length,1);assert.equal(plan.bytes,f.media.length+Buffer.byteLength(plan.sidecar));
 assert.equal(plan.entries[0].sourcePath,f.record.derivative_path);
 assert.match(plan.entries[0].outputPath,/^_web_derived\/[a-f0-9]+\.flac$/);
 const map=JSON.parse(plan.sidecar).assets[0];assert.equal(map.public_path,f.record.source_path);assert.equal(map.mime,'audio/flac');
 assert.equal(readFileSync(join(f.root,f.record.source_path)).equals(f.source),true);
});

test('derived catalog is excluded from broad runtime prefixes and does not duplicate original assets',()=>{
 const paths=['index.html','assets/runtime.png',manifestPath,'assets/web-derived/20261101/current.webp'];
 const selected=selectWebRuntimeFiles(paths,['index.html'],()=>"const root='assets/web-derived/';const image='assets/runtime.png';");
 assert.deepEqual(selected,['index.html','assets/runtime.png']);
});

test('source and derivative bytes, hashes, Git blob, MIME signature and tracked presence fail closed',t=>{
 for(const [field,value] of [['source_sha256','0'.repeat(64)],['source_git_blob','0'.repeat(40)],['source_bytes',1],['sha256','0'.repeat(64)],['bytes',1],['mime','image/png']]){
  const f=fixture(t);f.save([{...f.record,[field]:value}]);assert.throws(()=>f.plan(),/source|derivative|MIME|format/i,field);
 }
 const f=fixture(t);writeFileSync(join(f.root,f.record.derivative_path),Buffer.alloc(f.media.length));assert.throws(()=>f.plan(),/derivative/);
 const g=fixture(t);g.tracked.splice(g.tracked.indexOf(g.record.derivative_path),1);assert.throws(()=>g.plan(),/tracked/);
 const h=fixture(t),invalid=Buffer.alloc(h.media.length);writeFileSync(join(h.root,h.record.derivative_path),invalid);h.save([{...h.record,sha256:hash(invalid)}]);assert.throws(()=>h.plan(),/format\/MIME/,'matching SHA cannot disguise a wrong codec signature');
 const missing=fixture(t);rmSync(join(missing.root,missing.record.derivative_path));assert.throws(()=>missing.plan(),/ENOENT/);
 const missingManifest=fixture(t);rmSync(join(missingManifest.root,manifestPath));assert.throws(()=>missingManifest.plan(),/Missing tracked derivative manifest/);
});

test('unsafe, duplicate and unselected mappings fail before any output is written',t=>{
 for(const path of ['../outside.flac','/absolute.flac','assets/web-derived/20261101/../escape.flac','assets/web-derived/20261101/a%2fflac']){const f=fixture(t);f.save([{...f.record,derivative_path:path}]);assert.throws(()=>f.plan(),/path/);}
 const f=fixture(t);f.save([f.record,{...f.record,source_path:f.record.source_path.normalize('NFD'),sha256:'0'.repeat(64)}]);assert.throws(()=>f.plan(),/Duplicate|identity/);
 const g=fixture(t);g.selected.length=0;assert.throws(()=>g.plan(),/selected/);
});

test('normalized source byte conflicts and unchanged upload limits fail closed',t=>{
 const f=fixture(t);const alias=f.record.source_path.normalize('NFD');mkdirSync(dirname(join(f.root,alias)),{recursive:true});writeFileSync(join(f.root,alias),'different');f.selected.push(alias);f.tracked.push(alias);assert.throws(()=>f.plan(),/normalized|source/);
 const g=fixture(t);assert.throws(()=>g.plan({maxFileBytes:1}),/exceeds/);assert.throws(()=>g.plan({maxTotalBytes:1}),/exceeds/);assert.throws(()=>g.plan({maxFiles:1}),/exceeds/);
});

test('prepare maps derivative native extension to original Unicode URL and records actual contentType',t=>{
 const f=fixture(t),plan=f.plan(),staticDir=join(f.root,'output/static');mkdirSync(staticDir,{recursive:true});writeFileSync(join(f.root,'output/config.json'),JSON.stringify({version:3}));
 for(const entry of plan.entries){const dest=join(staticDir,entry.outputPath);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(f.root,entry.sourcePath),dest);}
 writeFileSync(join(staticDir,'__web-derived-output.json'),plan.sidecar);
 const report=prepareVercelOutput(staticDir),config=JSON.parse(readFileSync(join(f.root,'output/config.json')));
 assert.equal(report.derived,1);assert.deepEqual(config.overrides[plan.entries[0].outputPath],{path:f.record.source_path,contentType:'audio/flac'});
 assert.equal(existsSync(join(staticDir,f.record.source_path)),false);
 assert.equal(existsSync(join(staticDir,'__web-derived-output.json')),false);
 assert.equal(existsSync(join(f.root,'output/web-derived-output.json')),true);
});

function stagedFixture(f) {
 const plan=f.plan(),staticDir=join(f.root,'output/static');mkdirSync(staticDir,{recursive:true});writeFileSync(join(f.root,'output/config.json'),JSON.stringify({version:3}));
 for(const entry of plan.entries){const dest=join(staticDir,entry.outputPath);mkdirSync(dirname(dest),{recursive:true});copyFileSync(join(f.root,entry.sourcePath),dest);}
 writeFileSync(join(staticDir,'__web-derived-output.json'),plan.sidecar);return {plan,staticDir};
}

test('prebuilt tampering, duplicated original and conflicting URL override fail before mutation',t=>{
 for(const mode of ['bytes','original','override']){
  const f=fixture(t),{plan,staticDir}=stagedFixture(f),configPath=join(f.root,'output/config.json');
  if(mode==='bytes')writeFileSync(join(staticDir,plan.entries[0].outputPath),'corrupt');
  if(mode==='original'){mkdirSync(dirname(join(staticDir,f.record.source_path)),{recursive:true});writeFileSync(join(staticDir,f.record.source_path),f.source);}
  if(mode==='override')writeFileSync(configPath,JSON.stringify({version:3,overrides:{elsewhere:{path:f.record.source_path}}}));
  const before=readFileSync(configPath);assert.throws(()=>prepareVercelOutput(staticDir),/derivative|both staged|Conflicting/);
  assert.ok(readFileSync(configPath).equals(before));assert.ok(existsSync(join(staticDir,'__web-derived-output.json')));
 }
});

test('actual small build stages a mapped source only as native-format derivative and prepare preserves its URL',t=>{
 const f=fixture(t);mkdirSync(join(f.root,'tools'));
 for(const name of ['build-web.mjs','web-runtime-manifest.mjs','web-derived-assets.mjs','prepare-vercel-output.mjs'])copyFileSync(new URL('../tools/'+name,import.meta.url),join(f.root,'tools',name));
 const entries=['index.html','game.html','stat-panel-ui.js','localization-runtime.js','three-runtime.js','assets/vendor/three-r160/build/three.module.js','assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js','assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js'];
 for(const entry of entries){mkdirSync(dirname(join(f.root,entry)),{recursive:true});writeFileSync(join(f.root,entry),entry==='index.html'?'<audio src="bgm/공통/current.wav"></audio>':'fixture');}
 writeFileSync(join(f.root,'build-nwjs.mjs'),'const FILES = ['+entries.map(name=>"'"+name+"'").join(',')+'];');
 execFileSync('git',['init','--quiet'],{cwd:f.root,windowsHide:true});
 execFileSync('git',['add','--',...entries,'build-nwjs.mjs','tools','bgm','assets/web-derived'],{cwd:f.root,windowsHide:true});
 const run=spawnSync(process.execPath,[join(f.root,'tools/build-web.mjs'),'output/static'],{cwd:f.root,encoding:'utf8',windowsHide:true});
 assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(run.stdout).derived,1);
 const staticDir=join(f.root,'output/static'),sidecar=JSON.parse(readFileSync(join(staticDir,'__web-derived-output.json'))),alias=sidecar.assets[0].staged_path;
 assert.ok(readFileSync(join(staticDir,alias)).equals(f.media));assert.equal(existsSync(join(staticDir,f.record.source_path)),false);
 assert.equal(existsSync(join(staticDir,f.record.derivative_path)),false,'catalog prefix is not exported a second time');
 writeFileSync(join(f.root,'output/config.json'),JSON.stringify({version:3}));prepareVercelOutput(staticDir);
 const config=JSON.parse(readFileSync(join(f.root,'output/config.json')));assert.equal(config.overrides[alias].path,f.record.source_path);assert.equal(config.overrides[alias].contentType,'audio/flac');
});

test('identical NFC and NFD logical source rows share one verified physical derivative alias',t=>{
 const f=fixture(t),nfd=f.record.source_path.normalize('NFD'),targetNfd='assets/web-derived/20261101/파생.flac'.normalize('NFD'),targetNfc=targetNfd.normalize('NFC');
 mkdirSync(dirname(join(f.root,nfd)),{recursive:true});writeFileSync(join(f.root,nfd),f.source);
 writeFileSync(join(f.root,targetNfd),f.media);writeFileSync(join(f.root,targetNfc),f.media);
 const first={...f.record,derivative_path:targetNfc},second={...first,source_path:nfd,derivative_path:targetNfd};
 f.selected.push(nfd);f.tracked.push(nfd,targetNfc,targetNfd);f.save([first,second]);
 const plan=f.plan(),sidecar=JSON.parse(plan.sidecar);
 assert.equal(plan.entries.length,1);assert.equal(plan.derived,1);assert.equal(plan.logicalDerived,2);
 assert.equal(sidecar.logical_assets,2);assert.deepEqual(sidecar.assets[0].source_aliases,[first.source_path,second.source_path]);
 const {staticDir}=stagedFixture(f);assert.equal(prepareVercelOutput(staticDir).derived,1);
});

test('different bytes at NFC and NFD derivative paths cannot satisfy one canonical mapping',t=>{
 const f=fixture(t),nfc='assets/web-derived/20261101/그림.flac',nfd=nfc.normalize('NFD');
 writeFileSync(join(f.root,nfc),f.media);writeFileSync(join(f.root,nfd),'different derivative');
 f.tracked.push(nfc,nfd);f.save([{...f.record,derivative_path:nfc}]);
 assert.throws(()=>f.plan(),/Different bytes at normalized source\/derivative/);
});
