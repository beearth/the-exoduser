import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {parseExpressionAt} from 'acorn';
import {fileURLToPath} from 'node:url';
import {buildAreaSnapshot,buildStage0Snapshot} from '../godot/tools/export_ch1_area_source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
const artifact=JSON.parse(fs.readFileSync(path.join(root,'godot/data/ch1_map_source/si1.json'),'utf8'));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
const protectedPaths=['game.html','maps_data.js','assets/map/ch1/geometry/ch1_si1_geometry.js',
 'godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/scripts/native_spawn_hole_system.gd',
 'godot/scripts/native_regions.gd','godot/scripts/world.gd','godot/scripts/main.gd'];
const hashes=()=>Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))]));
const before=hashes();
const expression=name=>{
 const m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);
 const n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});
 return {text:source.slice(n.start,n.end),node:n};
};
const plain=v=>JSON.parse(JSON.stringify(v));
let actual;
test('stage1 uses latest main native source closure without source/P3/shared map writes or runtime binding',()=>{
 actual=buildAreaSnapshot(root,{stage:1});
 assert.equal(actual.stage,1);assert.equal(actual.schema,'exoduser.ch1-area-source.v1');
 assert.equal(actual.source.game_sha256,sha(source));
 assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));
 assert.match(actual.source.main_sha,/^[0-9a-f]{40}$/);assert.match(actual.source.extraction_head,/^[0-9a-f]{40}$/);
 assert.equal(actual.scope.runtime_bound,false);assert.equal(actual.scope.visual_verified,false);assert.equal(actual.scope.save_access,0);
 assert.equal(actual.scope.init_map_objects_executed,false);
 for(const field of ['final_map_objects','effective_prop_positions','prop_colliders'])assert.equal(actual.scope[field],'NOT_OBSERVED');
 assert.deepEqual(hashes(),before);
});
test('all 40000 final tiles have the native stage1 SHA/counts and exact source gate/exit/start metadata',()=>{
 assert.deepEqual(actual.grid,{width:200,height:200,tile_size:40});
 assert.equal(actual.tiles.length,40000);
 assert.equal(sha(Buffer.from(actual.tiles)),'c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1');
 assert.equal(actual.runtime_tile_sha256,sha(Buffer.from(actual.tiles)));
 assert.deepEqual([0,1,2,3,4].map(v=>actual.tiles.filter(t=>t===v).length),[13588,25590,3,0,819]);
 assert.deepEqual(actual.start_world,[4020,7420]);assert.deepEqual(actual.start_tile,[100,185]);
 assert.deepEqual(actual.boss_gate,[{x:99,y:31},{x:100,y:31},{x:101,y:31}]);
 assert.deepEqual(actual.exits,[{x:99,y:33},{x:100,y:33},{x:101,y:33}]);
 assert.deepEqual(actual.exit_center_tile,[100,33]);assert.equal(actual.rooms.length,6);
});
test('native geometry module metadata, mask and editor RLE match independently evaluated original bytes',()=>{
 const sandbox=vm.createContext({Uint8Array,Math});vm.runInContext(read('assets/map/ch1/geometry/ch1_si1_geometry.js').toString(),sandbox);
 const geometry=sandbox.CH1_SI1_GEOMETRY,raw=actual.source_geometry;
 for(const key of ['stage','size','regions','landmarks','spine','widthSamples','bypassPaths','routeAnchors','treeBlockRadius','treeBypasses'])assert.deepEqual(raw[key],plain(geometry[key]),key);
 assert.deepEqual(raw.mask,Array.from(geometry.buildMask()));assert.deepEqual(raw.editor_tile_rle,Array.from(geometry.buildRLE()));
 assert.equal(raw.regions.length,7);assert.equal(raw.spine.length,15);assert.equal(raw.widthSamples.length,5);
 assert.equal(raw.editor_tile_rle.length,930);assert.equal(raw.mask.length,40000);
 assert.equal(raw.mask_sha256,sha(Buffer.from(raw.mask)));assert.equal(raw.editor_tile_rle_sha256,sha(JSON.stringify(raw.editor_tile_rle)));
 const decoded=[];
 for(let i=0;i<raw.editor_tile_rle.length;i+=2)decoded.push(...Array(raw.editor_tile_rle[i+1]).fill(raw.editor_tile_rle[i]));
 assert.deepEqual(decoded,raw.mask.map(v=>v?1:2));
 assert.notDeepEqual(decoded.map(v=>v===1?0:1),actual.tiles,'final generator adds boss/exit and other source mutations');
});
test('all 12 raw hands preserve original IIFE order, 5 landmark/7 gameplay roles and 7 region names',()=>{
 const expected=plain(vm.runInNewContext('('+expression('_CH1S1').text+')'));
 assert.deepEqual(actual.hand_props_raw,expected);assert.equal(expected.length,12);
 assert.equal(expected.filter(h=>h.role==='LANDMARK').length,5);assert.equal(expected.filter(h=>h.role==='GAMEPLAY').length,7);
 assert.equal(new Set(expected.map(h=>h.region)).size,7);
 assert.deepEqual(expected.map(h=>[h.id,h.x,h.y]),[
 ['m_c1tree',83,80],['m_c1camp',49,122],['m_c1altar',151,91],['m_c1pool',49,151],['m_c1cocoon',151,136],
 ['m_c1sroot',91,180],['m_c1sbone',85,162],['m_c1spod',138,158],['m_c1sroot',129,128],['m_c1sbone',79,109],['m_c1spod',128,83],['m_c1sbone',116,43]]);
 assert.deepEqual(actual.initial_obj_meta,plain(vm.runInNewContext('('+expression('_OBJ_META').text+')')));
 assert.equal(Object.keys(actual.initial_obj_meta).length,77);assert.equal(actual.ch1_deco_raw.length,110);
 assert.deepEqual(actual.undefined_paths,[]);
});
test('final ordered holes/1000 read-only budget and quadrant totals match original stage1 source observations',()=>{
 assert.deepEqual(actual.spawn_holes_final.map(h=>[h.x,h.y,h.size,h.room,h.count]),[
 [3380,6740,.5,1,100],[5460,6060,.3,1,50],[1780,6060,.5,1,100],[5820,5700,.3,1,50],
 [2780,3820,.5,1,100],[4580,2580,.5,1,100],[2380,2780,.3,1,50],[4860,3860,.5,1,100],
 [3780,6220,.3,1,50],[3380,3420,.55,1,100],[4820,1900,.8,1,100],[4020,5540,.3,-1,50],[4020,4140,.3,-1,50]]);
 assert.equal(actual.total_spawned,1000);assert.deepEqual(actual.region_totals,[250,300,250,200]);
 const sums=[0,0,0,0];for(const h of actual.spawn_holes_final)sums[(h.y<4000?0:2)+(h.x<4000?0:1)]+=h.count;
 assert.deepEqual(sums,actual.region_totals);assert.equal(actual.spawn_holes_final.reduce((n,h)=>n+h.count,0),1000);
});
test('14 seeded source draws precede final13 holes; removed candidate slot8 is not fabricated as a live hole',()=>{
 let state=20261020;const timers=[];
 for(let i=0;i<14;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;timers.push(600+state/4294967296*60);}
 assert.equal(actual.generation.random_draws,14);assert.equal(actual.generation.random_final_state,state);
 assert.deepEqual(actual.spawn_holes_final.map(h=>h.timer),timers.filter((_,i)=>i!==8));
 const changed=buildAreaSnapshot(root,{stage:1,seed:1});
 assert.deepEqual(changed.tiles,actual.tiles);assert.deepEqual(changed.spawn_holes_final.map(({timer,...h})=>h),actual.spawn_holes_final.map(({timer,...h})=>h));
 assert.notEqual(changed.spawn_holes_final[0].timer,actual.spawn_holes_final[0].timer);
});
test('function/expression/file provenance refers to exact main source ranges and unmodified geometry module',()=>{
 for(const [name,record] of Object.entries(actual.source.symbols)) {
  assert.equal(record.file,'game.html');assert.ok(record.line>=1&&record.end>=record.line);assert.match(record.sha256,/^[0-9a-f]{64}$/);
 }
 for(const name of ['_CH1S1']) {
  const e=expression(name),record=actual.source.symbols[name];assert.equal(record.sha256,sha(e.text));assert.equal(record.line,source.slice(0,e.node.start).split('\n').length);
 }
 assert.deepEqual([actual.source.symbols._CH1S1.line,actual.source.symbols._CH1S1.end],[17972,17987]);
 assert.deepEqual([actual.source.symbols['_MAP_COMPOSE.1'].line,actual.source.symbols['_MAP_COMPOSE.1'].end],[18172,18177]);
 for(const [file,hash] of Object.entries(actual.source.files))assert.equal(hash,sha(read(file)),file);
 assert.equal(actual.environment_refs.length,10);
});
test('repeated extraction is deterministic, admitted artifact agrees, and stage0 producer remains stage0-only',()=>{
 assert.deepEqual(buildAreaSnapshot(root,{stage:1}),actual);
 const normalized=structuredClone(actual);normalized.source.main_sha=artifact.source.main_sha;normalized.source.extraction_head=artifact.source.extraction_head;
 assert.deepEqual(normalized,artifact);
 assert.throws(()=>buildStage0Snapshot(root,{stage:1}),/UNSUPPORTED_STAGE/);
 for(const stage of [-1,2,3])assert.throws(()=>buildAreaSnapshot(root,{stage}),/UNSUPPORTED_STAGE/);
 assert.deepEqual(hashes(),before);
});
test('CLI permits only matching new snapshot outputs; unsupported stages/seeds fail before writes',()=>{
 const directory=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch1-03-Isolated-20261020-'));
 const tool=path.join(root,'godot/tools/export_ch1_area_source.mjs');
 const cli=(output,stage='1',seed='20261020')=>spawnSync(process.execPath,[tool,root,output,'--stage',stage,'--seed',seed],{encoding:'utf8'});
 try {
  const output=path.join(directory,'si1.json');const success=cli(output);assert.equal(success.status,0,success.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),actual);
  for(const stage of ['2','3','-1']){const result=cli(output,stage);assert.equal(result.status,1);assert.match(result.stderr,/UNSUPPORTED_STAGE/);}
  for(const seed of ['-1','NaN','4294967296'])assert.equal(cli(output,'1',seed).status,1);
  for(const target of ['godot/data/map.json','godot/data/ch1_map_source/si0.json','game.html'])assert.equal(cli(path.join(root,target)).status,1);
  assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),actual);assert.deepEqual(hashes(),before);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
