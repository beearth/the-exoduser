import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildResources,writeResources} from '../godot/tools/export_ch2_area_resources.mjs';
import {buildAreaSnapshot} from '../godot/tools/export_ch1_area_source.mjs';
import {rectangles} from '../godot/tools/export_ch1_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p)),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const stored=JSON.parse(read('godot/data/ch2_map_source/si4_resources.json'));
const before=Object.fromEntries(['game.html','maps_data.js','godot/data/map.json','godot/data/ch2_map_source/si4.json',
 'godot/scripts/main.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/hud.gd',
 'godot/scripts/native_ch1_area_world.gd','godot/scripts/native_ch1_area_resources.gd','godot/tools/export_ch1_area_resources.mjs',
 ...stored.assets.flatMap(a=>[a.source,'godot/'+a.texture.slice(6)])].map(p=>[p,sha(read(p))]));
const actual=buildResources(root);
// origin/main is a shared ref and can advance during another team's fetch.
// Compare content only after proving BOTH recorded commits contain these exact
// game bytes. Keep the original artifact's extraction provenance unchanged.
function contentAtRecordedMain(value,reference){
 const a=value.source.main_sha,b=reference.source.main_sha;
 for(const ref of new Set([a,b]))assert.equal(sha(execFileSync('git',['show',ref+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),value.source.game_sha256);
 assert.equal(value.source.game_sha256,reference.source.game_sha256);
 const normalized=structuredClone(value);normalized.source.main_sha=b;return normalized;
}
test('same native generator context retains gate collider and runs exact initMapObjects:105 hand+lore+gate',()=>{
 assert.deepEqual(contentAtRecordedMain(actual.bundle,stored),stored);assert.equal(stored.stage,4);
 assert.equal(stored.props.length,107);assert.equal(stored.props.filter(p=>p._hand).length,105);
 assert.deepEqual(stored.source.initial_objects,[{type:'boss_gate_col',x:4020,y:1200}]);
 assert.deepEqual(stored.props.filter(p=>!p._hand).map(p=>p.type).sort(),['boss_gate_col','lore']);
 assert.equal(stored.source.init_random_draws,0);
 assert.equal(stored.source.game_sha256,sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})));
 for(const n of ['initMapObjects','metadata.merge','metadata.occ_foot','_rebuildColObjs','isW','canMv','hasLOS'])assert.match(stored.source.symbols[n].sha256,/^[0-9a-f]{64}$/);
});
test('all105 native nearFloor results preserve source order/roles/rotations;42 authored positions move without input repair',()=>{
 assert.equal(stored.hand_adjustments.length,105);assert.equal(stored.hand_adjustments.filter(h=>h.moved).length,42);
 for(let i=0;i<105;i++){
  const h=actual.raw.hand_props_raw[i],a=stored.hand_adjustments[i];
  assert.equal(h.id,a.id);assert.deepEqual(a.authored,[h.x,h.y]);
  let found;outer:for(let r=0;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   const x=h.x+dx,y=h.y+dy;if(x>=0&&y>=0&&x<200&&y<200&&[0,4].includes(actual.raw.tiles[y*200+x])){found=[x,y];break outer;}}
  assert.deepEqual(a.effective_tile,found);
  const p=stored.props.find(p=>p._hand&&p.type===h.id&&p.x===(found[0]+.5)*40&&p.y===(found[1]+.5)*40&&p.role===h.role);
  assert.ok(p);assert.equal(p.noGrid,1);assert.equal(p.rotation,((h.rot||0)%360+360)%360);
  assert.equal(Object.hasOwn(p,'zone'),false);assert.equal(Object.hasOwn(p,'overlap'),false);assert.equal(Object.hasOwn(p,'scale'),false);
 }
});
test('27 existing texture files consume current source bytes/size/pivot/flip/alpha; no source image is rewritten',()=>{
 assert.equal(stored.assets.length,27);const byId=Object.fromEntries(actual.raw.ch2_deco_raw.map(d=>[d.id,d]));
 for(const a of stored.assets){assert.equal(sha(read(a.source)),a.sha256);assert.equal(sha(read('godot/'+a.texture.slice(6))),a.sha256);assert.equal(read(a.source).length,a.bytes);assert.deepEqual(a.size,[read(a.source).readUInt32BE(16),read(a.source).readUInt32BE(20)]);}
 const modes={};for(const p of stored.props.filter(p=>p._hand)){
  const d=byId[p.type];assert.equal(p.texture,'res://'+path.posix.join('assets/map/ch2',d.dir||'floor_objects',d.file));
  assert.deepEqual(p.pivot,[.5,.5]);assert.equal(p.flip_h,!!d.flip);assert.equal(p.alpha,d.alpha??1);
  assert.equal(p.image_keying,d.hardAlpha?'hard_alpha':d.mega?'magenta':'none');modes[p.image_keying]=(modes[p.image_keying]||0)+1;
 }
 assert.deepEqual(modes,{none:84,magenta:17,hard_alpha:4});
 for(const [p,hash] of Object.entries(before))assert.equal(sha(read(p)),hash,p);
});
test('276 physical rectangles cover precisely all28395 tile1 cells, no overlap, no hill/chunks copied',()=>{
 assert.deepEqual(stored.wall_rects,rectangles(actual.raw.tiles,v=>v===1));assert.equal(stored.wall_rects.length,276);
 const cover=new Uint8Array(40000);for(const [x,y,w,h] of stored.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cover[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(cover[i],actual.raw.tiles[i]===1?1:0,'tile '+i);
 assert.equal(stored.scope.stage0_hill,false);assert.equal(stored.scope.stage0_baked_chunks,0);assert.equal(stored.scope.physical_prop_shapes,false);
 assert.equal(stored.scope.main_bound,false);assert.equal(stored.scope.real_player_bound,false);assert.equal(stored.scope.transition_bound,false);
});
test('52 analytic circles include original invisible gate circle; IEEE754 oracle covers strict boundaries without stubs',()=>{
 assert.equal(stored.colliders.length,52);assert.ok(stored.colliders.every(c=>c.shape==='circle'&&c.rx===c.ry&&c.oy===0));
 assert.deepEqual(stored.colliders.find(c=>c.id==='boss_gate_col'),{id:'boss_gate_col',shape:'circle',x:4020,y:1200,rx:100,ry:100,oy:0});
 assert.equal(actual.queries.length,10998);assert.equal(actual.los.length,400);
 for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.deepEqual([b.readDoubleLE(0),b.readDoubleLE(8),b.readDoubleLE(16)],[q.x,q.y,q.r]);}
 for(const q of actual.los){const b=Buffer.from(q.f64,'base64');assert.deepEqual(q.points,q.points.map((_,i)=>b.readDoubleLE(i*8)));}
 for(const k of ['wall','move']){assert.ok(actual.queries.some(q=>q[k]));assert.ok(actual.queries.some(q=>!q[k]));}
});
test('observer is optional, post-snapshot and private; all existing stage0/1/4 results equal pre-observer pipeline',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-02-Isolated-20261020-baseline-'));
 try{const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','4013102a:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const beforeTool=await import(pathToFileURL(file));
  for(const stage of [0,1,4]){const old=beforeTool.buildAreaSnapshot(root,{stage});assert.deepEqual(contentAtRecordedMain(buildAreaSnapshot(root,{stage}),old),old);}
  let initial;const observed=buildAreaSnapshot(root,{stage:4,observeNative:run=>{initial=JSON.parse(JSON.stringify(run('Array.from(MAP_OBJS)')));run('G.map[0][0]=999;');}});
  assert.deepEqual(initial,[{type:'boss_gate_col',x:4020,y:1200}]);assert.notEqual(observed.tiles[0],999);const ordinary=buildAreaSnapshot(root,{stage:4});assert.deepEqual(contentAtRecordedMain(observed,ordinary),ordinary);
  assert.throws(()=>buildAreaSnapshot(root,{stage:4,observeNative:true}),/Invalid native observer/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('writer only emits new resource JSON/external oracle, rejects inside/symlink/foreign evidence before any file writes',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-02-Isolated-20261020-output-'));
 const resourceFile=path.join(root,'godot/data/ch2_map_source/si4_resources.json'),resourceBefore=fs.readFileSync(resourceFile);
 try{
  const output=path.join(tmp,'oracle.json');const old=read('godot/data/ch2_map_source/si4_resources.json');writeResources(root,output);
  assert.deepEqual(contentAtRecordedMain(JSON.parse(read('godot/data/ch2_map_source/si4_resources.json')),JSON.parse(old)),JSON.parse(old));assert.equal(JSON.parse(fs.readFileSync(output)).schema,'exoduser.ch2-area-oracle.v1');
  assert.throws(()=>writeResources(root,path.join(root,'new-oracle.json')),/outside/);
  const link=path.join(tmp,'link.json');fs.symlinkSync(output,link);assert.throws(()=>writeResources(root,link),/Symlink/);
  const foreign=path.join(tmp,'foreign.json');fs.writeFileSync(foreign,'{"schema":"other"}');assert.throws(()=>writeResources(root,foreign),/foreign/);assert.equal(fs.readFileSync(foreign,'utf8'),'{"schema":"other"}');
  for(const [p,hash] of Object.entries(before))assert.equal(sha(read(p)),hash,p);
 }finally{fs.writeFileSync(resourceFile,resourceBefore);fs.rmSync(tmp,{recursive:true,force:true});}
});
