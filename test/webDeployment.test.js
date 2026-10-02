import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
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
