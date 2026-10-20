import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import vm from 'node:vm';
import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';import {parseExpressionAt} from 'acorn';
import {buildStage12Snapshot,writeStage12Snapshot} from '../godot/tools/export_ch3_stage12_source.mjs';
import {buildResources,writeResources} from '../godot/tools/export_ch3_stage12_resources.mjs';
import {buildAreaSnapshot} from '../godot/tools/export_ch1_area_source.mjs';
import {outputSymlink} from './helpers/outputSymlink.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),source=read('game.html').toString();
const stored=JSON.parse(read('godot/data/ch3_map_source/si12.json')),manifest=JSON.parse(read('godot/data/ch3_map_source/si12_resources.json'));
const protectedPaths=['game.html','maps_data.js','godot/data/map.json',...['si10.json','si11.json','si10_resources.json'].map(p=>'godot/data/ch3_map_source/'+p),...['main','world','player','hud','native_source_new_run_state','native_spawn_hole_system','native_regions','native_ch3_area_world','native_ch3_area_resources'].map(p=>'godot/scripts/'+p+'.gd'),'godot/tools/export_ch1_area_source.mjs','godot/tools/export_ch3_area_resources.mjs',...manifest.assets.flatMap(a=>[a.source,'godot/'+a.texture.slice(6)])];
const hashes=()=>Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))])),before=hashes();
const raw=buildStage12Snapshot(root),actual=buildResources(root);
function normalize(value,ref){const a=structuredClone(value);for(const x of [a.source,ref.source])assert.equal(sha(execFileSync('git',['show',x.main_sha+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),x.game_sha256);a.source.main_sha=ref.source.main_sha;if(ref.source.extraction_head)a.source.extraction_head=ref.source.extraction_head;return a;}
function expr(name,key){const m=new RegExp('(?:const|var|let)\\s+'+name+'\\s*=').exec(source);let n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(key!==undefined)n=n.properties.find(p=>String(p.key.value??p.key.name)===String(key)).value;return {text:source.slice(n.start,n.end),node:n};}
function fn(name){const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);const n=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return source.slice(n.start,n.end);}
test('si12 source exact21/14/1100, absent dungeon spec, native Frost Watcher and unchanged default200 floor',()=>{
 assert.deepEqual(normalize(raw,stored),stored);assert.equal(raw.stage,12);assert.deepEqual(raw.grid,{width:200,height:200,tile_size:40});assert.equal(raw.tiles.length,40000);assert.deepEqual([0,1,2,3,4].map(v=>raw.tiles.filter(t=>t===v).length),[38986,36,3,0,975]);assert.equal(raw.runtime_tile_sha256,sha(Buffer.from(raw.tiles)));
 assert.equal(raw.stage_descriptor.bn,'얼어붙은 감시자');assert.deepEqual([raw.stage_descriptor.hell,raw.stage_descriptor.hellFloor,raw.stage_descriptor.monLv,raw.stage_descriptor.isHellBoss],[2,2,300,false]);
 assert.equal(raw.selector_evidence.dungeon_spec,null);assert.equal(raw.selector_evidence.is_dungeon,false);assert.deepEqual(raw.undefined_paths,['/selector_evidence/dungeon_spec']);assert.deepEqual(raw.source_floor.editor_tile_rle,[1,40000]);assert.equal('source_basin' in raw,false);
 assert.deepEqual(raw.start_world,[4020,7420]);assert.deepEqual(raw.exit_center_tile,[100,7]);assert.deepEqual(raw.guard_evidence,{candidate_tile:[100,8],actual_tile:4,required_tile:0,predicate_met:false});
 const c=vm.createContext({Math});for(const name of ['mkRng','_iceC','_iceB'])vm.runInContext(fn(name),c);assert.deepEqual(raw.hand_props_raw,JSON.parse(JSON.stringify(vm.runInContext(expr('_ICE12').text,c))));assert.equal(raw.hand_props_raw.length,21);assert.equal(raw.spawn_holes_final.length,14);assert.equal(raw.total_spawned,1100);assert.deepEqual(raw.region_totals,[250,300,350,200]);
 let state=20261020;for(const h of raw.spawn_holes_final){state=(Math.imul(state,1664525)+1013904223)>>>0;assert.equal(h.timer,600+state/4294967296*60);}assert.equal(raw.generation.random_draws,14);assert.equal(raw.generation.random_final_state,state);assert.equal(state,3323445034);
 for(const seed of [0,4294967295]){const a=buildStage12Snapshot(root,{seed});assert.deepEqual(a.tiles,raw.tiles);assert.deepEqual(a.hand_props_raw,raw.hand_props_raw);assert.notEqual(a.spawn_holes_final[0].timer,raw.spawn_holes_final[0].timer);}
 assert.equal(raw.scope.runtime_bound,false);assert.equal(raw.scope.init_map_objects_executed,false);assert.equal(raw.pipeline.shared_files_edited,0);assert.deepEqual(hashes(),before);
});
test('fresh native si12 VM without bootstrap matches source and full resource/query results',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-04-Isolated-20261020-reference-'));
 try{
  // Independent reference: same frozen original generator, selected DIRECTLY at
  // stage12. Only its tool admission/selected expression indices are adapted.
  // No native game function body, source data or expected value is patched.
  let s=execFileSync('git',['show','8366ba8d:godot/tools/export_ch1_area_source.mjs'],{cwd:root}).toString();
  assert.ok(s.includes('[0,1,4,10,11].includes(stage)'));s=s.replace('[0,1,4,10,11].includes(stage)','[0,1,4,10,12].includes(stage)').replaceAll('stage === 11','stage === 12').replaceAll('_ICE11','_ICE12').replaceAll('_MAP_COMPOSE[11]','_MAP_COMPOSE[12]').replaceAll('_DUNGEON_SPEC[11]','_DUNGEON_SPEC[12]').replaceAll('STG[11]','STG[12]');
  const direct=path.join(tmp,'direct-source.mjs');fs.writeFileSync(direct,s,'utf8');const reference=await import(pathToFileURL(direct));const expected=reference.buildAreaSnapshot(root,{stage:12});
  for(const key of ['tiles','rooms','exits','boss_gate','start_tile','start_world','hand_props_raw','region_details','spawn_holes_final','total_spawned','exit_center_tile','source_floor','compose_raw','selector_evidence','stage_descriptor','guard_evidence','cross_deco_raw','asset_refs','ground_asset','generation','scope'])assert.deepEqual(raw[key],expected[key],key+' direct native VM');
  s=execFileSync('git',['show','8366ba8d:godot/tools/export_ch3_area_resources.mjs'],{cwd:root}).toString();s=s.replace("'./export_ch1_area_source.mjs'",JSON.stringify(pathToFileURL(direct).href)).replace("'./export_ch1_area_resources.mjs'",JSON.stringify(pathToFileURL(path.join(root,'godot/tools/export_ch1_area_resources.mjs')).href)).replaceAll('stage:10','stage:12').replaceAll('si10.json','si12.json').replace('basin_spec:raw.source_basin.spec','source_floor:raw.source_floor');
  const resources=path.join(tmp,'direct-resources.mjs');fs.writeFileSync(resources,s,'utf8');const refResources=await import(pathToFileURL(resources));const e=refResources.buildResources(root);assert.deepEqual(normalize(actual.bundle,e.bundle),e.bundle);assert.deepEqual(actual.queries,e.queries);assert.deepEqual(actual.los,e.los);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('native init has21 effective hands plus hidden gate, eight shapes and zero invented altar or source movements',()=>{
 assert.deepEqual(normalize(actual.bundle,manifest),manifest);assert.equal(manifest.props.length,22);assert.equal(manifest.props.filter(p=>p._hand).length,21);assert.deepEqual(manifest.props.filter(p=>!p._hand).map(p=>p.type),['boss_gate_col']);
 assert.equal(manifest.source.init_random_draws,2);assert.deepEqual(manifest.source.initial_objects,[{type:'boss_gate_col',x:4020,y:160}]);assert.equal(manifest.hand_adjustments.length,21);assert.ok(manifest.hand_adjustments.every(h=>h.placed&&!h.moved));
 assert.deepEqual(Object.fromEntries(['circle','ellipse','rect'].map(shape=>[shape,manifest.colliders.filter(c=>c.shape===shape).length])),{circle:7,ellipse:1,rect:0});
 assert.equal(manifest.scope.physical_prop_shapes,false);assert.equal(manifest.scope.main_bound,false);assert.equal(manifest.scope.transition_bound,false);assert.equal(manifest.scope.region_progress_bound,false);
});
test('raw61 refs/35 source files and11 consumed textures preserve original byte identity, size and exact render metadata',()=>{
 assert.equal(raw.asset_refs.length,61);assert.equal(new Set(raw.asset_refs.map(a=>a.file)).size,35);assert.equal(manifest.assets.length,11);
 for(const a of manifest.assets){const bytes=read(a.source);assert.equal(bytes.length,a.bytes);assert.equal(sha(bytes),a.sha256);assert.equal(sha(read('godot/'+a.texture.slice(6))),a.sha256);assert.deepEqual(a.size,[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]);}
 const defs=Object.fromEntries(raw.ch3_deco_raw.map(d=>[d.id,d]));for(const p of manifest.props.filter(p=>p._hand)){const d=defs[p.type];assert.equal(p.alpha,d.alpha??1);assert.deepEqual(p.pivot,[d.pivotX??.5,d.pivotY??.5]);assert.equal(p.rotation,0);assert.equal(p.flip_h,!!d.flip);assert.deepEqual(p.source_rect,[0,0,...manifest.assets.find(a=>a.texture===p.texture).size]);}
 assert.deepEqual(hashes(),before);
});
test('four Physics rectangles cover all36 tile1 cells; exact native isW/canMv/LOS observations retain IEEE754 inputs',()=>{
 const coverage=new Uint8Array(40000);assert.equal(manifest.wall_rects.length,4);for(const [x,y,w,h] of manifest.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)coverage[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(coverage[i],raw.tiles[i]===1?1:0);
 assert.equal(actual.queries.length,6774);assert.equal(actual.los.length,400);for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.deepEqual([q.x,q.y,q.r],[0,1,2].map(i=>b.readDoubleLE(i*8)));}
 for(const c of manifest.colliders){const b=Buffer.from(c.f64,'base64');assert.deepEqual([c.x,c.y,c.rx,c.ry,c.oy,c.rotation,c.cos,c.sin],[0,1,2,3,4,5,6,7].map(i=>b.readDoubleLE(i*8)));}
 for(const key of ['wall','move']){assert.ok(actual.queries.some(q=>q[key]));assert.ok(actual.queries.some(q=>!q[key]));}
});
test('shared0/1/4/10/11 pipeline remains byte-identical and target observer cannot mutate source snapshot',async()=>{
 const original=execFileSync('git',['show','8366ba8d:godot/tools/export_ch1_area_source.mjs'],{cwd:root});assert.equal(sha(read('godot/tools/export_ch1_area_source.mjs')),sha(original));
 const observed=buildStage12Snapshot(root,{observeNative:run=>run('G.map[0][0]=999;')});assert.deepEqual(observed,raw);assert.notEqual(observed.tiles[0],999);
 for(const stage of [0,1,4,10,11]){const a=buildAreaSnapshot(root,{stage});assert.equal(a.stage,stage);assert.equal(a.scope.runtime_bound,false);}
 assert.deepEqual(hashes(),before);
});
test('stage-local writers only admit si12 JSON/external evidence; protected paths, foreign outputs and symlink ancestors are rejected',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-04-Isolated-20261020-output-')),saved=read('godot/data/ch3_map_source/si12_resources.json');
 try{const sourceOut=path.join(tmp,'si12.json'),oracle=path.join(tmp,'oracle.json');assert.deepEqual(writeStage12Snapshot(root,sourceOut),raw);writeResources(root,oracle);assert.equal(JSON.parse(fs.readFileSync(oracle)).stage,12);
  for(const p of ['game.html','godot/data/map.json','godot/data/ch3_map_source/si11.json'])assert.throws(()=>writeStage12Snapshot(root,path.join(root,p)),/Only matching/);
  assert.throws(()=>writeResources(root,path.join(root,'oracle.json')),/outside/);assert.throws(()=>buildStage12Snapshot(root,{seed:-1}),/uint32/);assert.throws(()=>buildStage12Snapshot(root,{observeNative:1}),/observer/);
  const foreign=path.join(tmp,'foreign.json');fs.writeFileSync(foreign,'{"schema":"other","stage":12}');assert.throws(()=>writeStage12Snapshot(root,foreign),/foreign/);assert.throws(()=>writeResources(root,foreign),/foreign/);
  for(const target of [sourceOut,path.join(tmp,'absent.json')]){const dir=fs.mkdtempSync(path.join(tmp,'link-'));const link=outputSymlink(dir,target);assert.throws(()=>writeStage12Snapshot(root,link),/Symlink/);assert.throws(()=>writeResources(root,link),/Symlink/);}
  assert.deepEqual(hashes(),before);
 }finally{fs.writeFileSync(path.join(root,'godot/data/ch3_map_source/si12_resources.json'),saved);fs.rmSync(tmp,{recursive:true,force:true});}
});
