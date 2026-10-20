import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildResources,writeResources} from '../godot/tools/export_ch2_area_resources.mjs';
import {rectangles} from '../godot/tools/export_ch1_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p)),sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const stored=JSON.parse(read('godot/data/ch2_map_source/si5_resources.json'));
const actual=buildResources(root,{stage:5});
const guarded=['game.html','maps_data.js','godot/data/map.json','godot/data/ch2_map_source/si4.json','godot/data/ch2_map_source/si5.json','godot/data/ch2_map_source/si4_resources.json',
 'godot/scripts/main.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/hud.gd','godot/scripts/native_ch1_area_world.gd','godot/scripts/native_ch2_area_world.gd',
 'godot/tools/export_ch1_area_source.mjs',...stored.assets.flatMap(a=>[a.source,'godot/'+a.texture.slice(6)])];
const before=Object.fromEntries(guarded.map(p=>[p,sha(read(p))]));
function sameProvenance(value,reference){
 for(const ref of new Set([value.source.main_sha,reference.source.main_sha]))assert.equal(sha(execFileSync('git',['show',ref+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),value.source.game_sha256);
 assert.equal(value.source.game_sha256,reference.source.game_sha256);
 const v=structuredClone(value);v.source.main_sha=reference.source.main_sha;return v;
}
test('native stage5 generator context + complete initMapObjects gives 271 auto sprites and invisible gate, not invented lore/eyes',()=>{
 assert.deepEqual(sameProvenance(actual.bundle,stored),stored);
 assert.equal(stored.stage,5);assert.equal(stored.props.length,272);
 assert.deepEqual(stored.source.initial_objects,[{type:'boss_gate_col',x:4020,y:160}]);
 assert.equal(stored.props.filter(p=>p.view==='collision_only').length,1);
 assert.ok(stored.props.every(p=>!p._hand));assert.equal(actual.raw.hand_props_raw,null);
 assert.deepEqual(stored.hand_adjustments,[]);assert.equal(stored.floor.path_spec,null);
 for(const type of ['lore','breakable','altar','m_eye','m_eye1','m_eye2'])assert.equal(stored.props.filter(p=>p.type===type).length,0,type);
 assert.equal(stored.source.init_random_draws,1);
 assert.equal(sha(read('godot/data/ch2_map_source/si5.json')),'18bdcdbbe1ec4060fcdb10c00e7c0c9c95c2a2f5e78564efb67456145e6af246');
});
test('all native function/helper/render branch source ranges and hashes are current original bytes',()=>{
 const lines=read('game.html').toString().split('\n');
 for(const key of ['_SAME_TYPE_DIST','_nearbyTypeCount','initMapObjects','metadata.merge','metadata.occ_foot','_rebuildColObjs','isW','canMv','hasLOS','render.sprite_branches','render.light']){
  const s=stored.source.symbols[key];assert.ok(s,key);assert.equal(s.file,'game.html');assert.ok(s.line>0&&s.end>=s.line);assert.match(s.sha256,/^[0-9a-f]{64}$/);
  if(key==='render.sprite_branches')assert.ok(lines.slice(s.line-1,s.end).join('\n').includes('else if(_meta&&_meta.keepAR)'));
 }
 assert.equal(stored.source.game_sha256,sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})));
});
test('12 existing assets retain source bytes; native branches draw 234 squares and 37 keepAR with original scale/pivot/alpha',()=>{
 assert.equal(stored.assets.length,12);let square=0,keep=0;
 for(const a of stored.assets){assert.equal(sha(read(a.source)),a.sha256);assert.equal(sha(read('godot/'+a.texture.slice(6))),a.sha256);assert.equal(read(a.source).length,a.bytes);assert.deepEqual(a.size,[read(a.source).readUInt32BE(16),read(a.source).readUInt32BE(20)]);}
 for(const p of stored.props.filter(p=>p.texture)){
  const a=stored.assets.find(a=>a.texture===p.texture),m=p.metadata,s=(m.sz||32)*(p.scale||1),ar=a.size[0]/a.size[1];
  if(m.keepAR){keep++;assert.deepEqual(p.draw_size,[s*(ar<1?ar:1),s*(ar>1?1/ar:1)]);}
  else{square++;assert.deepEqual(p.draw_size,[s,s]);}
  assert.deepEqual(p.pivot,[.5,.5]);assert.equal(p.rotation,0);assert.equal(p.flip_h,!!m.flip);assert.equal(p.alpha,m.alpha??1);assert.equal(p.image_keying,'none');
 }
 assert.equal(square,234);assert.equal(keep,37);
 assert.equal(stored.props.filter(p=>p.metadata?.light).length,156);
 const typeCounts={};for(const p of stored.props)typeCounts[p.type]=(typeCounts[p.type]||0)+1;
 assert.equal(typeCounts.m_c2mush,141);assert.equal(typeCounts.m_c2p1,4);assert.equal(typeCounts.m_c2pit,4);
 // Full extraction equality above includes native sorted array order and source grid coordinates.
 assert.ok(stored.props.every(p=>p.x%40===20));
 assert.ok(stored.props.filter(p=>p.texture).every(p=>p.y%40===20));
});
test('four exact Physics tile rectangles cover 36 cells; 42 original analytic circles include gate at y160',()=>{
 assert.deepEqual(stored.wall_rects,rectangles(actual.raw.tiles,v=>v===1));assert.equal(stored.wall_rects.length,4);
 const cover=new Uint8Array(40000);for(const [x,y,w,h] of stored.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)cover[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(cover[i],actual.raw.tiles[i]===1?1:0,'tile '+i);
 assert.equal(cover.reduce((a,b)=>a+b,0),36);assert.equal(stored.colliders.length,42);
 assert.ok(stored.colliders.every(c=>c.shape==='circle'&&c.rx===c.ry&&c.oy===0));
 assert.deepEqual(stored.colliders.find(c=>c.id==='boss_gate_col'),{id:'boss_gate_col',shape:'circle',x:4020,y:160,rx:100,ry:100,oy:0});
 assert.equal(stored.scope.physical_prop_shapes,false);assert.equal(stored.scope.stage0_hill,false);assert.equal(stored.scope.stage0_baked_chunks,0);
 for(const k of ['main_bound','real_player_bound','spawn_holes_bound','region_progress_bound','transition_bound','visual_source_pixel_identity'])assert.equal(stored.scope[k],false);
});
test('native IEEE754 oracle preserves 10038 boundary inputs each for isW/canMv and 400 LOS',()=>{
 assert.equal(actual.queries.length,10038);assert.equal(actual.los.length,400);
 for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.deepEqual([b.readDoubleLE(0),b.readDoubleLE(8),b.readDoubleLE(16)],[q.x,q.y,q.r]);}
 for(const q of actual.los){const b=Buffer.from(q.f64,'base64');assert.deepEqual(q.points,q.points.map((_,i)=>b.readDoubleLE(i*8)));}
 for(const k of ['wall','move']){assert.ok(actual.queries.some(q=>q[k]));assert.ok(actual.queries.some(q=>!q[k]));}
 assert.deepEqual(actual.raw.start_world,[4020,7420]);assert.deepEqual(actual.raw.exit_center_tile,[100,7]);
 assert.equal(actual.raw.total_spawned,900);assert.deepEqual(actual.raw.region_totals,[250,300,250,100]);
});
test('default stage4 output equals previous shared exporter without altering pinned si4 artifact',async()=>{
 const tmp=fs.mkdtempSync(path.join(root,'godot/tools/.ch2-04-baseline-'));
 try{
  const file=path.join(tmp,'before.mjs');
  // Relative imports stay in the same tools directory, in a temporary UTF-8 module.
  fs.writeFileSync(file,execFileSync('git',['show','f918b9a9:godot/tools/export_ch2_area_resources.mjs'],{cwd:root}).toString().replaceAll("from './","from '../"));
  const old=await import(pathToFileURL(file));const previous=old.buildResources(root),current=buildResources(root);
  assert.deepEqual(current,previous);assert.deepEqual(sameProvenance(current.bundle,JSON.parse(read('godot/data/ch2_map_source/si4_resources.json'))),JSON.parse(read('godot/data/ch2_map_source/si4_resources.json')));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('writer rejects wrong stage, in-worktree, symlink, cross-stage and foreign evidence without contaminating source',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-04-Isolated-20261020-'));
 const resourceFile=path.join(root,'godot/data/ch2_map_source/si5_resources.json'),bytes=fs.readFileSync(resourceFile);
 try{
  assert.throws(()=>buildResources(root,{stage:6}),/Unsupported/);assert.throws(()=>writeResources(root,path.join(tmp,'x.json'),{stage:6}),/Unsupported/);
  assert.throws(()=>writeResources(root,path.join(root,'new-oracle.json'),{stage:5}),/outside/);
  const oracle=path.join(tmp,'oracle.json');writeResources(root,oracle,{stage:5});assert.deepEqual(sameProvenance(JSON.parse(fs.readFileSync(resourceFile)),stored),stored);
  assert.equal(JSON.parse(fs.readFileSync(oracle)).stage,5);
  const link=path.join(tmp,'link.json');fs.symlinkSync(oracle,link);assert.throws(()=>writeResources(root,link,{stage:5}),/Symlink/);
  const cross=path.join(tmp,'cross.json');fs.writeFileSync(cross,'{"schema":"exoduser.ch2-area-oracle.v1","stage":4}');assert.throws(()=>writeResources(root,cross,{stage:5}),/foreign/);
  const foreign=path.join(tmp,'foreign.json');fs.writeFileSync(foreign,'{"schema":"other"}');assert.throws(()=>writeResources(root,foreign,{stage:5}),/foreign/);assert.equal(fs.readFileSync(foreign,'utf8'),'{"schema":"other"}');
  for(const [p,hash] of Object.entries(before))assert.equal(sha(read(p)),hash,p);
 }finally{fs.writeFileSync(resourceFile,bytes);fs.rmSync(tmp,{recursive:true,force:true});}
});
