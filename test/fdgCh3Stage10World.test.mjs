import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildResources,writeResources} from '../godot/tools/export_ch3_area_resources.mjs';
import {buildAreaSnapshot} from '../godot/tools/export_ch1_area_source.mjs';
import {rectangles} from '../godot/tools/export_ch1_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p)),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const stored=JSON.parse(read('godot/data/ch3_map_source/si10_resources.json'));
const before=Object.fromEntries(['game.html','maps_data.js','godot/data/map.json','godot/data/ch3_map_source/si10.json',
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
test('same native generator context runs exact si10 initMapObjects:343 hand+altar+gate',()=>{
 assert.deepEqual(contentAtRecordedMain(actual.bundle,stored),stored);assert.equal(stored.stage,10);
 assert.equal(stored.props.length,345);assert.equal(stored.props.filter(p=>p._hand).length,343);
 assert.deepEqual(stored.source.initial_objects,[{type:'boss_gate_col',x:4020,y:160}]);
 assert.deepEqual(stored.props.filter(p=>!p._hand).map(p=>p.type).sort(),['altar','boss_gate_col']);
 assert.equal(stored.source.init_random_draws,2);
 // Original game25873-25878 draws for altar admission then combat-room index.
 let state=actual.raw.generation.random_final_state;
 const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 assert.ok(next()<.6);const room=actual.raw.rooms.filter(r=>r.type==='combat')[Math.trunc(next()*3)];
 const altar=stored.props.find(p=>p.type==='altar');assert.deepEqual([altar.x,altar.y],[(room.cx+.5)*40,(room.cy+.5)*40]);
 assert.equal(stored.source.game_sha256,sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})));
 for(const n of ['initMapObjects','metadata.merge','metadata.occ_foot','_rebuildColObjs','isW','canMv','hasLOS'])assert.match(stored.source.symbols[n].sha256,/^[0-9a-f]{64}$/);
});
test('all346 authored entries retain343 placed hands,15 source moves and3 exact source nearFloor skips',()=>{
 assert.equal(stored.hand_adjustments.length,346);assert.equal(stored.hand_adjustments.filter(h=>h.moved).length,15);
 assert.deepEqual(stored.hand_adjustments.filter(h=>!h.placed).map(h=>h.index),[163,171,178]);
 for(let i=0;i<346;i++){
  const h=actual.raw.hand_props_raw[i],a=stored.hand_adjustments[i];assert.equal(h.id,a.id);assert.equal(a.index,i);assert.deepEqual(a.authored,[h.x,h.y]);
  let found;outer:for(let r=0;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   const x=(h.x|0)+dx,y=(h.y|0)+dy;if(x>=0&&y>=0&&x<200&&y<200&&[0,4].includes(actual.raw.tiles[y*200+x])){found=[x,y];break outer;}}
  if(!found){assert.equal(a.placed,false);assert.equal(a.reason,'source_near_floor_not_found');continue;}
  assert.equal(a.placed,true);assert.deepEqual(a.effective_tile,found);const p=stored.props[a.prop_index];assert.equal(p.type,h.id);assert.deepEqual([p.x,p.y],[(found[0]+.5)*40,(found[1]+.5)*40]);
  assert.equal(p.noGrid,1);assert.equal(p.rotation,((h.rot||0)%360+360)%360);assert.equal(p.scale??1,h.scale??1);
 }
});
test('22 existing source files,all source crop/pivot/rotation/alpha and declared CSS gaps remain explicit',()=>{
 assert.equal(stored.assets.length,22);
 const raw=JSON.parse(read('godot/data/ch3_map_source/si10.json'));const byId=Object.fromEntries([...raw.ch3_deco_raw,...raw.cross_deco_raw].map(d=>[d.id,d]));
 for(const a of stored.assets){assert.equal(sha(read(a.source)),a.sha256);assert.equal(sha(read('godot/'+a.texture.slice(6))),a.sha256);assert.equal(read(a.source).length,a.bytes);assert.deepEqual(a.size,[read(a.source).readUInt32BE(16),read(a.source).readUInt32BE(20)]);}
 let cropCount=0;
 for(const p of stored.props.filter(p=>p._hand)){
  const d=byId[p.type];assert.equal(p.alpha,d.alpha??1);assert.deepEqual(p.pivot,[d.pivotX??.5,d.pivotY??.5]);
  if(d.srcRect){cropCount++;assert.deepEqual(p.source_rect,d.srcRect);assert.deepEqual(p.source_size,d.sourceSize);assert.deepEqual(p.trim_offset,d.trimOffset);}
  assert.equal(p.source_filter_declared,d.filter??'');assert.equal(p.source_edge_erase_declared,d.edgeErase??0);
 }
 assert.equal(cropCount,87);assert.equal(stored.scope.source_filter_pixel_parity,false);assert.equal(stored.scope.source_edge_erase_pixel_parity,false);
 for(const [p,hash] of Object.entries(before))assert.equal(sha(read(p)),hash,p);
});
test('228 physical rectangles cover precisely all14329 tile1 cells, no overlap, no hill/chunks copied',()=>{
 assert.deepEqual(stored.wall_rects,rectangles(actual.raw.tiles,v=>v===1));assert.equal(stored.wall_rects.length,228);
 const cover=new Uint8Array(40000);for(const [x,y,w,h] of stored.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cover[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(cover[i],actual.raw.tiles[i]===1?1:0,'tile '+i);
 assert.equal(stored.scope.stage0_hill,false);assert.equal(stored.scope.stage0_baked_chunks,0);assert.equal(stored.scope.physical_prop_shapes,false);
 assert.equal(stored.scope.main_bound,false);assert.equal(stored.scope.real_player_bound,false);assert.equal(stored.scope.transition_bound,false);
});
test('105 analytic shapes preserve48 rotated rectangles,5 ellipses,52 circles and IEEE754 strict-boundary source oracles',()=>{
 assert.equal(stored.colliders.length,105);assert.deepEqual(Object.fromEntries(['rect','ellipse','circle'].map(k=>[k,stored.colliders.filter(c=>c.shape===k).length])),{rect:48,ellipse:5,circle:52});
 assert.equal(actual.queries.length,16806);assert.equal(actual.los.length,400);
 for(const c of stored.colliders){const b=Buffer.from(c.f64,'base64');assert.deepEqual([c.x,c.y,c.rx,c.ry,c.oy,c.rotation,c.cos,c.sin],[0,1,2,3,4,5,6,7].map(i=>b.readDoubleLE(i*8)));}
 for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.deepEqual([b.readDoubleLE(0),b.readDoubleLE(8),b.readDoubleLE(16)],[q.x,q.y,q.r]);}
 for(const q of actual.los){const b=Buffer.from(q.f64,'base64');assert.deepEqual(q.points,q.points.map((_,i)=>b.readDoubleLE(i*8)));}
 for(const k of ['wall','move']){assert.ok(actual.queries.some(q=>q[k]));assert.ok(actual.queries.some(q=>!q[k]));}
});
test('observer is optional, post-snapshot and private; all existing stage0/1/4/10 results equal pre-observer pipeline',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-02-Isolated-20261020-baseline-'));
 try{const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','fcd7fcaa:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const beforeTool=await import(pathToFileURL(file));
  for(const stage of [0,1,4,10]){const old=beforeTool.buildAreaSnapshot(root,{stage});assert.deepEqual(contentAtRecordedMain(buildAreaSnapshot(root,{stage}),old),old);}
  let initial;const observed=buildAreaSnapshot(root,{stage:10,observeNative:run=>{initial=JSON.parse(JSON.stringify(run('Array.from(MAP_OBJS)')));run('G.map[0][0]=999;');}});
  assert.deepEqual(initial,[{type:'boss_gate_col',x:4020,y:160}]);assert.notEqual(observed.tiles[0],999);const ordinary=buildAreaSnapshot(root,{stage:10});assert.deepEqual(contentAtRecordedMain(observed,ordinary),ordinary);
  assert.throws(()=>buildAreaSnapshot(root,{stage:10,observeNative:true}),/Invalid native observer/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('writer only emits new resource JSON/external oracle, rejects inside/symlink/foreign evidence before any file writes',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-02-Isolated-20261020-output-'));
 const resourceFile=path.join(root,'godot/data/ch3_map_source/si10_resources.json'),resourceBefore=fs.readFileSync(resourceFile);
 try{
  const output=path.join(tmp,'oracle.json');const old=read('godot/data/ch3_map_source/si10_resources.json');writeResources(root,output);
  assert.deepEqual(contentAtRecordedMain(JSON.parse(read('godot/data/ch3_map_source/si10_resources.json')),JSON.parse(old)),JSON.parse(old));assert.equal(JSON.parse(fs.readFileSync(output)).schema,'exoduser.ch3-area-oracle.v1');
  assert.throws(()=>writeResources(root,path.join(root,'new-oracle.json')),/outside/);
  const link=path.join(tmp,'link.json');fs.symlinkSync(output,link);assert.throws(()=>writeResources(root,link),/Symlink/);
  const foreign=path.join(tmp,'foreign.json');fs.writeFileSync(foreign,'{"schema":"other"}');assert.throws(()=>writeResources(root,foreign),/foreign/);assert.equal(fs.readFileSync(foreign,'utf8'),'{"schema":"other"}');
  for(const [p,hash] of Object.entries(before))assert.equal(sha(read(p)),hash,p);
 }finally{fs.writeFileSync(resourceFile,resourceBefore);fs.rmSync(tmp,{recursive:true,force:true});}
});
