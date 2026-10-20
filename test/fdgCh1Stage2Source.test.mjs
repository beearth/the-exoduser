import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseExpressionAt} from 'acorn';
import {buildAreaSnapshot,buildStage0Snapshot} from '../godot/tools/export_ch1_area_source.mjs';
import {buildStage2Resources} from '../godot/tools/export_ch1_stage2_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),source=read('game.html').toString();
const raw=JSON.parse(read('godot/data/ch1_map_source/si2.json')),stored=JSON.parse(read('godot/data/ch1_map_source/si2_resources.json'));
const protectedPaths=['godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch1_map_source/si1.json','godot/data/ch1_map_source/si1_resources.json','godot/scripts/main.gd','godot/scripts/hud.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/native_spawn_hole_system.gd','godot/scripts/native_regions.gd','engine/fdg/map-source-adapter.js','godot/tools/export_world.mjs'];
const before=Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))]));
const actual=buildStage2Resources(root),bundle=actual.bundle;
test('stage2 snapshot uses latest main default clone/RLE and native final map order without protected writes',()=>{
 assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),raw.source.game_sha256);
 const now=buildAreaSnapshot(root,{stage:2});now.source.extraction_head=raw.source.extraction_head;now.source.main_sha=raw.source.main_sha;assert.deepEqual(now,raw);
 assert.deepEqual(raw.template_tile_rle,[1,40000]);assert.equal(raw.stage,2);assert.equal(raw.tiles.length,40000);
 assert.equal(sha(Buffer.from(raw.tiles)),'5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e');
 assert.deepEqual([0,1,2,3,4].map(v=>raw.tiles.filter(t=>t===v).length),[38986,36,3,0,975]);
 assert.deepEqual(raw.start_world,[4020,7420]);assert.deepEqual(raw.boss_gate,[{x:99,y:5},{x:100,y:5},{x:101,y:5}]);assert.deepEqual(raw.exit_center_tile,[100,7]);
 assert.equal(raw.hand_props_raw,null);assert.deepEqual(raw.undefined_paths,['/hand_props_raw']);assert.equal(raw.source_state.is_tile_rle,true);assert.deepEqual(raw.source_state.initial_map_objects,[{type:'boss_gate_col',x:4020,y:160}]);
 for(const [p,h] of Object.entries(before))assert.equal(sha(read(p)),h,p);
});
test('exact native compose has three landmarks, one mega, three groves and empty spaces, no invented maze',()=>{
 const m=/const\s+_MAP_COMPOSE\s*=/.exec(source),node=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'}),n=node.properties.find(p=>String(p.key.value??p.key.name)==='2').value;
 const expected=JSON.parse(JSON.stringify(vm.runInNewContext('('+source.slice(n.start,n.end)+')')));assert.deepEqual(raw.composition_raw,expected);assert.deepEqual(bundle.composition_raw,expected);
 assert.deepEqual(expected.lm.map(x=>[x.id,x.x,x.y,x.sz]),[['m_penta_circle',.72,.38,400],['m_eye_tree',.74,.42,380],['m_flesh_ball',.5,.62,520]]);
 assert.deepEqual(expected.mega,[{id:'m_mega_head',x:.28,y:.35,sz:980}]);assert.deepEqual(expected.groves,[{x:.28,y:.35,r:900},{x:.72,y:.38,r:900},{x:.5,y:.62,r:800}]);assert.deepEqual(expected.empty,[{x:.5,y:.88,r:420},{x:.5,y:.14,r:380},{x:.5,y:.48,r:700}]);
});
test('new unmodified full initMapObjects observation pins 292 final objects, hash and source phase insertion order',()=>{
 const expected=structuredClone(stored);expected.source.main_sha=bundle.source.main_sha;assert.equal(bundle.source.game_sha256,stored.source.game_sha256);
 assert.deepEqual(bundle,expected);assert.equal(bundle.raw_objects.length,292);assert.equal(sha(bundle.object_payload),'6a65accc4f2a42fa2bd55ed7844a61f497b360ca16dc69f453a4e832a9be4278');assert.deepEqual(JSON.parse(bundle.object_payload),bundle.raw_objects);
 assert.deepEqual(bundle.phase_counts,{large:37,landmark:3,mega:1,unique:5,provided_floor:16,scatter:89,normal:140,editor:1});
 const unobserved=buildStage2Resources(root,{observePhases:false});assert.deepEqual(unobserved.bundle.raw_objects,bundle.raw_objects);assert.equal(unobserved.bundle.object_sha256,bundle.object_sha256);assert.deepEqual(unobserved.bundle.colliders,bundle.colliders);
 const phaseOrder=['large','landmark','mega','unique','provided_floor','scatter','normal','editor'];assert.deepEqual([...new Set(bundle.phase_pushes.map(p=>p.phase))],phaseOrder);
 const metadata=Object.fromEntries(bundle.props.map(p=>[p.type,p.metadata||{}]));const sorted=bundle.phase_pushes.map((p,i)=>({object:p.object,i})).sort((a,b)=>(metadata[a.object.type]._renderLayer||0)-(metadata[b.object.type]._renderLayer||0)||a.object.y-b.object.y||a.i-b.i).map(p=>p.object);assert.deepEqual(sorted,bundle.raw_objects);
 assert.equal(bundle.source.global_random_draws,0);assert.equal(bundle.source.initial_map_objects.length,1);
});
test('P3 source budget and thirteen final holes remain exact, stage0 owners remain unbound',()=>{
 assert.equal(raw.spawn_holes_final.length,13);assert.equal(raw.spawn_holes_final.reduce((a,h)=>a+h.count,0),1000);assert.equal(raw.total_spawned,1000);assert.deepEqual(raw.region_totals,[250,300,250,200]);assert.deepEqual(raw.spawn_holes_final.slice(-2).map(h=>[h.x,h.y,h.room,h.count]),[[4020,5540,-1,50],[4020,4140,-1,50]]);
 assert.equal(raw.generation.random_draws,14);for(const k of ['main_bound','real_player_bound','spawn_holes_bound','region_progress_bound','transition_bound','stage0_hill','physical_prop_shapes'])assert.equal(bundle.scope[k],false);assert.equal(bundle.scope.stage0_baked_chunks,0);
 assert.throws(()=>buildStage0Snapshot(root,{stage:2}),/UNSUPPORTED_STAGE/);assert.throws(()=>buildAreaSnapshot(root,{stage:5}),/UNSUPPORTED_STAGE/);
});
test('retired ID Set is preserved exactly, not a prefix filter; all 291 live views and 47 colliders respect it',()=>{
 const m=/const\s+_RETIRED_MAP_OBJECT_TYPES\s*=/.exec(source),n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});const expected=Array.from(vm.runInNewContext(source.slice(n.start,n.end)));assert.deepEqual(bundle.retired_types,expected);
 assert.ok(expected.includes('m_flesh'));assert.ok(!expected.includes('m_flesh_ball'));assert.equal(bundle.props.filter(p=>p.retired).length,0);assert.equal(bundle.props.filter(p=>p.view==='sprite').length,291);assert.equal(bundle.props[0].view,'invisible_system_collider');assert.equal(bundle.colliders.length,47);assert.ok(bundle.colliders.some(c=>c.id==='m_flesh_ball'));assert.ok(bundle.colliders.every(c=>!expected.includes(c.id)));
 for(const c of bundle.colliders){const b=Buffer.from(c.f64,'base64');['x','y','rx','ry','oy','rotation'].forEach((k,i)=>assert.equal(b.readDoubleLE(i*8),c[k]));}
});
test('actual resource paths use unchanged original bytes, renderer branch order and live floor-eye atlas',()=>{
 assert.equal(bundle.assets.length,51);assert.equal(bundle.assets.reduce((n,a)=>n+a.bytes,0),34729509);
 for(const a of bundle.assets){assert.equal(sha(read(a.source)),a.sha256);assert.equal(sha(read('godot/'+a.texture.slice(6))),a.sha256);}
 const eye=bundle.props.find(p=>p.type==='m_eye');assert.match(eye.texture,/eye_bloodshot_8dir.png$/);assert.deepEqual(eye.atlas.cell,[40,40]);
 assert.equal(bundle.props.find(p=>p.type==='m_c1grootr').render_branch,'square_rotation');assert.deepEqual(bundle.props.find(p=>p.type==='m_c1grootr').draw_size,[600,600]);assert.equal(bundle.props.find(p=>p.type==='m_c1grootr').rotation,-7);
 assert.ok(bundle.props.some(p=>p.anchor_bottom));assert.ok(bundle.props.some(p=>p.hard_alpha));assert.equal(bundle.props.filter(p=>p.magenta_key).length,1);assert.equal(bundle.vista,null);
});
test('source tile1 union and IEEE754 query carriers are lossless',()=>{
 const coverage=new Uint8Array(40000);for(const [x,y,w,h] of bundle.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)coverage[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(coverage[i],raw.tiles[i]===1?1:0);assert.equal(bundle.wall_rects.length,4);
 assert.equal(actual.queries.length,8262);assert.equal(actual.los.length,400);for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.equal(b.readDoubleLE(0),q.x);assert.equal(b.readDoubleLE(8),q.y);assert.equal(b.readDoubleLE(16),q.r);}
 for(const q of actual.los){const b=Buffer.from(q.f64,'base64');q.points.forEach((n,i)=>assert.equal(b.readDoubleLE(i*8),n));}
});
test('stage2 CLI writes only matching snapshot; later stages/shared map/mismatched output still reject',()=>{
 const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch1-05-Isolated-20261020-'));try{const out=path.join(dir,'si2.json'),tool=path.join(root,'godot/tools/export_ch1_area_source.mjs'),cli=(output,stage)=>spawnSync(process.execPath,[tool,root,output,'--stage',stage,'--seed','20261020'],{encoding:'utf8'});
 assert.equal(cli(out,'2').status,0);assert.equal(JSON.parse(fs.readFileSync(out)).stage,2);const h=sha(fs.readFileSync(out));assert.equal(cli(out,'5').status,1);assert.equal(sha(fs.readFileSync(out)),h);assert.equal(cli(path.join(root,'godot/data/map.json'),'2').status,1);assert.equal(cli(path.join(root,'godot/data/ch1_map_source/si1.json'),'2').status,1);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
