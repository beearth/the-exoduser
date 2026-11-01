import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {execFileSync,spawnSync} from 'node:child_process';
import {join,resolve,sep} from 'node:path';
import * as manifest from '../tools/web-runtime-manifest.mjs';
import {checkStaticOutput} from '../tools/check-vercel-output.mjs';

function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'exoduser-web-deploy-'));
  t.after(()=>{assert.ok(resolve(dir).startsWith(resolve(tmpdir())+sep));rmSync(dir,{recursive:true,force:true});});
  for(const name of ['index.html','game.html','parry-lesson.js','resource-practice.js'])writeFileSync(join(dir,name),'ok');
  return dir;
}

test('rejects an aggregate upload even when each file is below the individual limit',t=>{
  const dir=fixture(t);
  assert.throws(()=>checkStaticOutput(dir,{maxTotalBytes:7}),/Total upload bytes/);
  assert.equal(checkStaticOutput(dir,{maxTotalBytes:8}).bytes,8);
});

test('web selection retains referenced sound and dynamic chunks while excluding unused media and authoring files',()=>{
  assert.equal(typeof manifest.selectWebRuntimeFiles,'function','Web-specific selection is required');
  const paths=['index.html','game.html','img/hero.png','img/projectile_fire.png','video/current.mp4','video/old.mp4','bgm/공통/used.wav','bgm/공통/unused.wav','assets/map/ch1/production_finish/chunk_0_0.png','assets/map/ch1/production_finish/layout.js','assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png','assets/map/ch1/production_finish/outer77_sources/original.png','assets/video-tests/input.png','sfx/death/random_1.mp3','lang_es.js','atlas_enemy.json','atlas_enemy.png'];
  const source={'index.html':`<img src="img/hero.png"><video src="video/current.mp4"></video><style>.mask{filter:url(#mask)}</style>`,'game.html':`const music='bgm/공통/used.wav';const root='assets/map/ch1/production_finish';img.src=root+'/chunk_'+x+'_'+y+'.png';projectile.src='img/projectile_'+element+'.png';`};
  const selected=manifest.selectWebRuntimeFiles(paths,['index.html','game.html'],p=>source[p]||'');
  for(const p of ['img/hero.png','video/current.mp4','bgm/공통/used.wav','assets/map/ch1/production_finish/chunk_0_0.png','assets/map/ch1/production_finish/layout.js','sfx/death/random_1.mp3','lang_es.js','atlas_enemy.png'])assert.ok(selected.includes(p),p);
  assert.ok(selected.includes('img/projectile_fire.png'));
  for(const p of ['video/old.mp4','bgm/공통/unused.wav','assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png','assets/map/ch1/production_finish/outer77_sources/original.png','assets/video-tests/input.png'])assert.ok(!selected.includes(p),p);
});

test('CH1 dynamic map prefix excludes source paintovers while retaining runtime chunks',()=>{
  const sources=[
    'assets/map/ch1/rottenwood_field_rootworld_master_v2.png',
    'assets/map/ch1/rottenwood_poison_master_higgsfield_v2_wide.png',
    'assets/map/ch1/rottenwood_poison_tree_detail_v3_source.png',
  ];
  const paths=['game.html','assets/map/ch1/runtime_chunk.png',...sources];
  const selected=manifest.selectWebRuntimeFiles(paths,['game.html'],()=>"const root='assets/map/ch1/'; image.src=root+chunk;");
  assert.ok(selected.includes('assets/map/ch1/runtime_chunk.png'));
  for(const source of sources)assert.ok(!selected.includes(source),source);
});

test('web selection omits retired cutscene and map build inputs without losing live dynamic assets',()=>{
  const wide=Array.from({length:35},(_,id)=>['16','21','32'].map(ratio=>`img/lording/wide/${id+1}-${ratio}.webp`)).flat();
  const retired=[
    'assets/cutscene/prologue/_old_20260727/p01.png',
    'assets/map/ch1/baked_spike/south_visual_pass/CH1_SOUTH_BASE.png',
    'assets/map/ch1/boss_room_bg_old.png',
    'assets/map/ch1/ground_dark_soil_backup.png'
  ];
  const live=[
    'assets/cutscene/prologue/p01.jpg',
    'assets/map/ch1/baked_spike/south_visual_pass/chunk_0_5.png',
    'img/logo_exoduser_solid.png',
    'bgm/1장_썩은숲/current.wav',
    'sfx/death/random_1.mp3',
    'lang_es.js'
  ];
  const paths=['index.html','game.html','loading-art.css',...retired,...live,...wide];
  const source={
    'index.html':`<img src="img/logo_exoduser_solid.png"><script>const prologueRoot='assets/cutscene/prologue/';const wideRoot='img/lording/wide/';</script>`,
    'game.html':`const chunkRoot='assets/map/ch1/baked_spike/south_visual_pass';const music='bgm/1장_썩은숲/current.wav';`,
    'loading-art.css':`.loading{background:url(img/lording/wide/1-16.webp)}`
  };
  const select=()=>manifest.selectWebRuntimeFiles(paths,['index.html','game.html','loading-art.css'],p=>source[p]||'');
  const selected=select();
  for(const path of live)assert.ok(selected.includes(path),path);
  assert.equal(wide.filter(path=>selected.includes(path)).length,105,'all 35 three-ratio loading images stay selected');
  for(const path of retired)assert.ok(!selected.includes(path),path);
  source['game.html']+=`const fallback='assets/map/ch1/boss_room_bg_old.png';`;
  source['index.html']+=`<img src="assets/cutscene/prologue/_old_20260727/p01.png">`;
  const withCallers=select();
  assert.ok(withCallers.includes('assets/map/ch1/boss_room_bg_old.png'),'a new exact runtime caller must keep the file');
  assert.ok(withCallers.includes('assets/cutscene/prologue/_old_20260727/p01.png'),'a new exact cutscene caller must keep the file');
});

test('loading manifest closes the dynamic directory over its 35 source and wide variants',()=>{
  const images=Array.from({length:35},(_,i)=>({
    source:`img/lording/${i+1}.png`,
    variants:['16','21','32'].map(ratio=>({file:`img/lording/wide/${i+1}-${ratio}.webp`}))
  }));
  const declared=images.flatMap(image=>[image.source,...image.variants.map(variant=>variant.file)]);
  const manifestPath='img/lording/wide/manifest.json';
  const extra='img/lording/retired-source.png';
  const paths=['index.html',manifestPath,...declared,extra];
  const source={'index.html':`const loadingRoot='img/lording/';`,[manifestPath]:JSON.stringify({images})};
  const select=()=>manifest.selectWebRuntimeFiles(paths,['index.html'],path=>source[path]||'');
  const selected=select();
  for(const path of [manifestPath,...declared])assert.ok(selected.includes(path),path);
  assert.ok(!selected.includes(extra),'unlisted old source must not ship from a broad dynamic prefix');
  source['index.html']+=`const explicit='${extra}';`;
  assert.ok(select().includes(extra),'a future exact runtime caller must retain the source');
});

test('fullscreen manifest dependencies are selected even when only JSON names the asset',()=>{
  const manifestPath='assets/fullscreen-wide/20261031/manifest.json';
  const original='img/원본.jpg',onDiskOriginal=original.normalize('NFD'),wide='assets/fullscreen-wide/20261031/title-32.webp';
  const paths=['fullscreen-art.js',manifestPath,onDiskOriginal,wide];
  const source={'fullscreen-art.js':`fetch('${manifestPath}')`,[manifestPath]:JSON.stringify({assets:[{source:original,outputs:[{path:wide}]}]})};
  const select=()=>manifest.selectWebRuntimeFiles(paths,['fullscreen-art.js'],path=>source[path]||'');
  assert.ok(select().includes(onDiskOriginal),'NFC manifest source must retain its NFD filesystem path');
  assert.ok(select().includes(wide),'manifest-only wide output is required');
  source[manifestPath]=JSON.stringify({assets:[{source:original,outputs:[{path:'assets/fullscreen-wide/20261031/missing.webp'}]}]});
  assert.throws(select,/Missing manifest asset/,'a broken manifest path must fail the package selection');
  const excluded='assets/map/ch1/production_finish/CH1_1_PRODUCTION_MASTER.png';
  paths.push(excluded);
  source[manifestPath]=JSON.stringify({assets:[{source:excluded,outputs:[{path:wide}]}]});
  assert.throws(select,/Manifest asset excluded/,'an existing authoring file cannot silently satisfy a runtime manifest');
});

test('ASCII upload aliases preserve Korean public URLs and collapse identical NFC/NFD files',async t=>{
  const dir=fixture(t),staticDir=join(dir,'static');mkdirSync(staticDir);
  writeFileSync(join(dir,'config.json'),JSON.stringify({version:3}));
  const publicPath='bgm/공통/lobby.mp3';
  for(const name of [publicPath,publicPath.normalize('NFD')]){mkdirSync(join(staticDir,'bgm',name.split('/')[1]),{recursive:true});writeFileSync(join(staticDir,name),'same music');}
  const normalizer=await import('../tools/prepare-vercel-output.mjs').catch(()=>null);
  assert.equal(typeof normalizer?.prepareVercelOutput,'function','Portable upload normalization is required');
  const report=normalizer.prepareVercelOutput(staticDir);
  assert.equal(report.aliases,1);
  const config=JSON.parse(readFileSync(join(dir,'config.json')));
  const [alias,entry]=Object.entries(config.overrides)[0];
  assert.match(alias,/^_unicode\/[a-f0-9]+\.mp3$/);
  assert.equal(entry.path,publicPath);
  assert.equal(readFileSync(join(staticDir,alias),'utf8'),'same music');
});

test('normalization rejects different bytes at a canonical path before changing either file',async t=>{
  const dir=fixture(t),staticDir=join(dir,'static');mkdirSync(staticDir);writeFileSync(join(dir,'config.json'),'{"version":3}');
  const p='img/한글.png';for(const [name,value] of [[p,'one'],[p.normalize('NFD'),'two']]){mkdirSync(join(staticDir,name.split('/')[0]),{recursive:true});writeFileSync(join(staticDir,name),value);}
  const normalizer=await import('../tools/prepare-vercel-output.mjs').catch(()=>null);
  assert.equal(typeof normalizer?.prepareVercelOutput,'function');
  assert.throws(()=>normalizer.prepareVercelOutput(staticDir),/Different bytes/);
  assert.equal(readFileSync(join(staticDir,p),'utf8'),'one');assert.equal(readFileSync(join(staticDir,p.normalize('NFD')),'utf8'),'two');
});

test('the production workflow targets the existing project explicitly and serializes pushes',()=>{
  const workflow=readFileSync(new URL('../.github/workflows/deploy.yml',import.meta.url),'utf8');
  assert.match(workflow,/VERCEL_PROJECT_ID: prj_JlXzqv8nqoud3MGZ3eDnxNmFCKhL/);
  assert.match(workflow,/VERCEL_ORG_ID: team_2BOa3cZFRrB3zZbZXIIdKhsf/);
  assert.match(workflow,/group: exoduser-vercel-production\s+cancel-in-progress: true/);
  assert.ok(workflow.indexOf('node tools/prepare-vercel-output.mjs')<workflow.indexOf('node tools/check-vercel-output.mjs'));
});

function runtimeBuildFixture(t,{missing}={}) {
  const dir=fixture(t);
  const entries=['index.html','game.html','stat-panel-ui.js','localization-runtime.js','three-runtime.js',
    'assets/vendor/three-r160/build/three.module.js',
    'assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js',
    'assets/vendor/three-r160/examples/jsm/utils/BufferGeometryUtils.js'];
  const media=['video/fdg_intro.mp4','video/world_intro_v22b_steam.mp4','video/warrior_story_v23_clean.mp4'];
  mkdirSync(join(dir,'tools'));
  for(const name of ['build-web.mjs','web-runtime-manifest.mjs','web-derived-assets.mjs'])copyFileSync(new URL('../tools/'+name,import.meta.url),join(dir,'tools',name));
  writeFileSync(join(dir,'build-nwjs.mjs'),'const FILES = ['+entries.map(name=>"'"+name+"'").join(',')+'];');
  for(const path of [...entries,...media]) {
    if(path===missing)continue;
    mkdirSync(join(dir,...path.split('/').slice(0,-1)),{recursive:true});
    writeFileSync(join(dir,path),path==='index.html'?'<source src="video/fdg_intro.mp4"><video src="video/world_intro_v22b_steam.mp4?rev=current"></video>':path==='game.html'?"const story='video/warrior_story_v23_clean.mp4';":'fixture');
  }
  if(missing)rmSync(join(dir,missing),{force:true});
  execFileSync('git',['init','--quiet'],{cwd:dir,windowsHide:true});
  execFileSync('git',['add','--','build-nwjs.mjs','tools','index.html','game.html','stat-panel-ui.js','localization-runtime.js','three-runtime.js','assets','video'].filter(path=>path!==missing),{cwd:dir,windowsHide:true});
  return spawnSync(process.execPath,[join(dir,'tools/build-web.mjs'),'web-dist'],{cwd:dir,encoding:'utf8',windowsHide:true});
}

test('current web build succeeds without the unreferenced legacy title video',t=>{
  const run=runtimeBuildFixture(t);
  assert.equal(run.status,0,run.stderr);
  assert.equal(JSON.parse(run.stdout).files,11);
});

test('current web build rejects a missing required entry',t=>{
  const run=runtimeBuildFixture(t,{missing:'stat-panel-ui.js'});
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/Missing required runtime file: stat-panel-ui.js/);
});

test('current web build rejects a missing video actually referenced by runtime HTML or JS',t=>{
  for(const video of ['video/fdg_intro.mp4','video/world_intro_v22b_steam.mp4','video/warrior_story_v23_clean.mp4']){
    const run=runtimeBuildFixture(t,{missing:video});
    assert.notEqual(run.status,0);
    assert.ok(run.stderr.includes('Missing required runtime file: '+video),run.stderr);
  }
});
