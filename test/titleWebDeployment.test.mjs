import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selectWebRuntimeFiles} from '../tools/web-runtime-manifest.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('C2 close variants ship together and every active lossless mapping has a selected source',()=>{
 const tracked=execFileSync('git',['ls-files','-z'],{cwd:root,windowsHide:true,maxBuffer:16*1024*1024}).toString().split('\0').filter(Boolean);
 const nw=read('build-nwjs.mjs');
 const files=[...nw.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
 const selected=new Set(selectWebRuntimeFiles(tracked,files,read).map(p=>p.normalize('NFC')));
 for(const width of [1920,2560,3840])assert.ok(selected.has('video/title_motion_C2_close_'+width+'_20261102.mp4'));
 for(const asset of ['still.webp','fall-near.png','fall-far.png','cloud-flow.webp','moon-static.webp'])assert.ok(selected.has('assets/title-signboard/C2/'+asset));
 const manifest=JSON.parse(read('assets/web-derived/20261101/manifest.json'));
 for(const row of manifest.assets)assert.ok(selected.has(row.source_path.normalize('NFC')),'orphan derivative: '+row.source_path);
 const before=JSON.parse(execFileSync('git',['show','923deedfc55017fa4d44dc24843d2b035b583700:assets/web-derived/20261101/manifest.json'],{cwd:root,windowsHide:true,maxBuffer:2*1024*1024}).toString());
 const retired='assets/title-signboard/A/master-7680x2160.png';
 assert.deepEqual(manifest.assets,before.assets.filter(row=>row.source_path!==retired),'all other mappings retain their identities and ordering');
 for(const row of before.assets.filter(row=>row.source_path===retired)){
  assert.ok(existsSync(new URL('../'+row.source_path,import.meta.url)),'original A master preserved');
  assert.ok(existsSync(new URL('../'+row.derivative_path,import.meta.url)),'original A derivative preserved');
 }
 assert.equal(read('game.html'),execFileSync('git',['show','923deedfc55017fa4d44dc24843d2b035b583700:game.html'],{cwd:root,windowsHide:true,maxBuffer:8*1024*1024}).toString(),'chest, rewards, AI and combat source unchanged');
});
