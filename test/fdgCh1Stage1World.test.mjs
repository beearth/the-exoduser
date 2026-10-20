import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {buildResources,rectangles} from '../godot/tools/export_ch1_area_resources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>fs.readFileSync(path.join(root,p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const stored=JSON.parse(read('godot/data/ch1_map_source/si1_resources.json'));
const paths=['godot/data/map.json','godot/scripts/main.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/hud.gd','godot/data/ch1_map_source/si1.json','engine/fdg/map-source-adapter.js','godot/tools/export_world.mjs'];
const before=Object.fromEntries(paths.map(p=>[p,sha(read(p))]));
const actual=buildResources(root);
test('latest main original full initMapObjects executes with no unseeded RNG; 12 hands plus separate lore',()=>{
 assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),actual.bundle.source.game_sha256);
 // A moving main ref is extraction provenance; prove both commits have the same
 // original bytes before comparing every native content field unchanged.
 assert.equal(actual.bundle.source.game_sha256,stored.source.game_sha256);
 for(const ref of new Set([actual.bundle.source.main_sha,stored.source.main_sha])){
  assert.match(ref,/^[a-f0-9]{40}$/);
  assert.equal(sha(execFileSync('git',['show',ref+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),stored.source.game_sha256);
 }
 const content=structuredClone(actual.bundle);content.source.main_sha=stored.source.main_sha;
 assert.deepEqual(content,stored);
 assert.equal(actual.bundle.props.length,13);assert.equal(actual.bundle.props.filter(p=>p._hand).length,12);
 assert.equal(actual.bundle.props.filter(p=>p.type==='lore').length,1);assert.equal(actual.bundle.props.filter(p=>p.type==='breakable').length,0);
 assert.equal(Object.keys(actual.raw.initial_obj_meta).length,77);
 for(const [p,h] of Object.entries(before))assert.equal(sha(read(p)),h,p+' untouched');
});
test('each actual hand uses source nearFloor, scale1, role/region and current CH1 texture bytes',()=>{
 const raw=actual.raw;for(const h of raw.hand_props_raw){const p=stored.props.find(p=>p.type===h.id&&p.x===(h.x+.5)*40&&p.y===(h.y+.5)*40);assert.ok(p,h.id);assert.equal(p.role,h.role);assert.equal(p.region,h.region);assert.equal(p.scale,undefined);assert.deepEqual(p.pivot,[.5,.5]);assert.equal(p.rotation,0);assert.equal(p.flip_h,false);const asset=stored.assets.find(a=>a.texture===p.texture);assert.ok(asset);assert.equal(sha(read('godot/'+asset.texture.slice(6))),sha(read(asset.source)));assert.equal(sha(read(asset.source)),asset.sha256);}
 assert.equal(stored.props.filter(p=>p.role==='LANDMARK').length,5);assert.equal(stored.props.filter(p=>p.role==='GAMEPLAY').length,7);
});
test('313 rectangles are an exact non-overlapping union of all 25590 source tile1 cells',()=>{
 assert.deepEqual(stored.wall_rects,rectangles(actual.raw.tiles,v=>v===1));
 const coverage=new Uint8Array(40000);for(const [x,y,w,h] of stored.wall_rects)for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)coverage[yy*200+xx]++;
 for(let i=0;i<40000;i++)assert.equal(coverage[i],actual.raw.tiles[i]===1?1:0,'tile '+i);
 assert.equal(stored.wall_rects.length,313);
});
test('source collision meta produces only five analytic colliders; no stage0 hill or copied chunks',()=>{
 assert.deepEqual(stored.colliders.map(c=>[c.id,c.rx,c.ry,c.oy]),[['m_c1tree',380,230,0],['m_c1altar',95,95,0],['m_c1camp',130,80,0],['m_c1cocoon',80,80,0],['m_c1pool',85,85,0]]);
 assert.equal(stored.scope.stage0_hill,false);assert.equal(stored.scope.stage0_baked_chunks,0);assert.equal(stored.scope.spawn_holes_bound,false);assert.equal(stored.scope.transition_bound,false);
 assert.equal(stored.assets.length,10);assert.equal(stored.floor.alpha.length,40000);assert.equal(sha(Buffer.from(stored.floor.alpha)),stored.floor.alpha_sha256);
 assert.match(stored.vista.source,/void_vista.jpg$/);assert.match(stored.floor.source,/ground_dark_soil.png$/);
});
test('native isW/canMv/LOS observations cover inside/outside/strict prop boundaries without stubbed source functions',()=>{
 assert.equal(actual.queries.length,6966);assert.equal(actual.los.length,400);
 for(const q of actual.queries){const b=Buffer.from(q.f64,'base64');assert.equal(b.length,24);assert.equal(b.readDoubleLE(0),q.x);assert.equal(b.readDoubleLE(8),q.y);assert.equal(b.readDoubleLE(16),q.r);}
 for(const q of actual.los){const b=Buffer.from(q.f64,'base64');assert.equal(b.length,32);q.points.forEach((v,i)=>assert.equal(b.readDoubleLE(i*8),v));}
 assert.ok(actual.queries.some(q=>q.wall));assert.ok(actual.queries.some(q=>!q.wall));assert.ok(actual.queries.some(q=>!q.move));assert.ok(actual.queries.some(q=>q.move));assert.ok(actual.los.some(q=>q.clear));assert.ok(actual.los.some(q=>!q.clear));
 for(const name of ['initMapObjects','isW','canMv','hasLOS','_rebuildColObjs','metadata.merge'])assert.match(stored.source.symbols[name].sha256,/^[a-f0-9]{64}$/);
});
