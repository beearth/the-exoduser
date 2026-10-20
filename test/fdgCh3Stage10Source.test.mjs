import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {parseExpressionAt} from 'acorn';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildAreaSnapshot,buildStage0Snapshot,captureJSON} from '../godot/tools/export_ch1_area_source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p));
const source=read('game.html').toString();
const artifact=JSON.parse(read('godot/data/ch3_map_source/si10.json'));
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const plain=v=>JSON.parse(JSON.stringify(v));
function expression(name,key) {
 const m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);
 let n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});
 if(key!==undefined)n=n.properties.find(p=>String(p.key.value??p.key.name)===String(key)).value;
 return {text:source.slice(n.start,n.end),node:n};
}
function nativeFunction(name) {
 const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);
 const n=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});
 return {text:source.slice(n.start,n.end),node:n};
}
const rawHand=plain(vm.runInNewContext('('+expression('_HELLWINTER10').text+')'));
const rawDeco=plain(vm.runInNewContext('('+expression('_CH_DECO',2).text+')'));
const rawMeta=plain(vm.runInNewContext('('+expression('_OBJ_META').text+')'));
const cross=plain(vm.runInNewContext('('+expression('_CH_DECO',0).text+')')).filter(d=>rawHand.some(h=>h.id===d.id)&&!rawDeco.some(c=>c.id===d.id));
const protectedPaths=['game.html','maps_data.js','godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch1_map_source/si1.json','godot/data/ch2_map_source/si4.json',
 'godot/scripts/main.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/hud.gd','godot/scripts/native_source_new_run_state.gd','godot/scripts/native_spawn_hole_system.gd','godot/scripts/native_regions.gd',...artifact.asset_refs.map(a=>a.file),artifact.ground_asset.file];
const hashes=()=>Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))]));
const before=hashes();let actual;
// A recorded commit ID is extraction provenance, not gameplay content. Prove
// both recorded commits contain the exact pinned source BEFORE normalizing it.
function withRecordedProvenance(value,reference){
 assert.equal(value.source.game_sha256,reference.source.game_sha256);
 for(const ref of new Set([value.source.main_sha,reference.source.main_sha])){
  const bytes=execFileSync('git',['show',ref+':game.html'],{cwd:root,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
  assert.equal(sha(bytes),reference.source.game_sha256,'recorded main source bytes');
 }
 const normalized=structuredClone(value);
 normalized.source.main_sha=reference.source.main_sha;
 normalized.source.extraction_head=reference.source.extraction_head;
 return normalized;
}

test('si10 extracts latest-main source, never claims actual World or visual readiness',()=>{
 actual=buildAreaSnapshot(root,{stage:10});assert.equal(actual.schema,'exoduser.ch3-area-source.v1');assert.equal(actual.stage,10);
 assert.equal(actual.source.game_sha256,sha(source));assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));
 assert.equal(actual.scope.runtime_bound,false);assert.equal(actual.scope.visual_verified,false);assert.equal(actual.scope.save_access,0);assert.equal(actual.scope.init_map_objects_executed,false);
 for(const field of ['final_map_objects','effective_prop_positions','prop_colliders'])assert.equal(actual.scope[field],'NOT_OBSERVED');
 for(const field of ['ch1_deco_raw','ch2_deco_raw','source_geometry'])assert.equal(field in actual,false);
 assert.equal('environment.baked_manifest' in actual.source.symbols,false);assert.deepEqual(hashes(),before);
});
test('entire final native grid, START and physically painted north gate differ from CH2 metadata-only gates',()=>{
 assert.deepEqual(actual.grid,{width:200,height:200,tile_size:40});assert.equal(actual.tiles.length,40000);
 assert.equal(actual.runtime_tile_sha256,'1a585fa2fe597e1413c370d55bd1f300134f3428f8008eec2aaaf538c0d74cee');assert.equal(sha(Buffer.from(actual.tiles)),actual.runtime_tile_sha256);
 assert.deepEqual([0,1,2,3,4].map(v=>actual.tiles.filter(t=>t===v).length),[25364,14329,3,3,301]);
 assert.deepEqual(actual.start_tile,[100,185]);assert.deepEqual(actual.start_world,[4020,7420]);assert.deepEqual(actual.exit_center_tile,[100,7]);
 for(const [field,y,tile] of [['boss_gate',5,3],['exits',7,2]]){
  assert.deepEqual(actual[field],[99,100,101].map(x=>({x,y})));for(const x of [99,100,101])assert.equal(actual.tiles[y*200+x],tile);
 }
 assert.equal(actual.tiles[8*200+100],0,'guard candidate floor is not a spawned actor');assert.equal(actual.rooms.length,6);
});
test('original basin and initial RLE are independently evaluated, before the native north-gate rewrite',()=>{
 const sandbox=vm.createContext({Math,Uint8Array});vm.runInContext(`const _HELLWINTER10=${expression('_HELLWINTER10').text};globalThis.compose=${expression('_MAP_COMPOSE',10).text};`,sandbox);
 const spec=plain(sandbox.compose.basin);assert.deepEqual(spec,{cx:100,cy:100,rx:90,ry:88,gateX:100,gateY:5,gateW:12});assert.deepEqual(actual.source_basin.spec,spec);assert.deepEqual(actual.source_basin.empty,plain(sandbox.compose.empty));
 for(const name of ['_rleEncodeGrid','_buildBasinRLE'])vm.runInContext(nativeFunction(name).text,sandbox);
 const rle=Array.from(vm.runInContext('_buildBasinRLE(200,200,compose.basin)',sandbox));assert.deepEqual(actual.source_basin.editor_tile_rle,rle);assert.equal(rle.length,738);assert.equal(actual.source_basin.editor_tile_rle_sha256,sha(JSON.stringify(rle)));
 const decoded=[];for(let i=0;i<rle.length;i+=2)decoded.push(...Array(rle[i+1]).fill(rle[i]===1?0:1));assert.equal(decoded.length,40000);assert.notDeepEqual(decoded,actual.tiles);
});
test('all346 original authored props and their absent keys/scale/quarter turns survive in order',()=>{
 assert.deepEqual(actual.hand_props_raw,rawHand);assert.equal(rawHand.length,346);
 const counts=Object.fromEntries([...new Set(rawHand.map(p=>p.id))].map(id=>[id,rawHand.filter(p=>p.id===id).length]));
 for(const [id,n] of Object.entries({m_c3wall_i:36,m_c3wall_l:2,m_c3wall_end:4,m_c3wall_gate:2,m_c3hellritual:1}))assert.equal(counts[id],n);
 assert.deepEqual(rawHand.filter(h=>h.id==='m_c3wall_i').map(h=>h.rot),[...Array(9).fill(0),...Array(9).fill(90),...Array(9).fill(180),...Array(9).fill(270)]);
 assert.ok(rawHand.filter(h=>h.id==='m_c3wall_i').every(h=>!Object.hasOwn(h,'scale')));assert.equal(rawHand[0].scale,4.7);assert.deepEqual(actual.undefined_paths,[]);
});
test('catalog61/base77/cross5 preserve collision parts, source crop/pivot and inherited col',()=>{
 assert.deepEqual(actual.ch3_deco_raw,rawDeco);assert.deepEqual(actual.initial_obj_meta,rawMeta);assert.deepEqual(actual.cross_deco_raw,cross);
 assert.equal(rawDeco.length,61);assert.equal(Object.keys(rawMeta).length,77);assert.equal(cross.length,5);
 const meta={...rawMeta,...Object.fromEntries(rawDeco.map(d=>[d.id,d]))};assert.equal(rawHand.filter(h=>meta[h.id].col||meta[h.id].collision).length,102);
 const gate=meta.m_c3wall_gate;assert.equal(gate.colParts.length,2);assert.deepEqual([gate.pivotX,gate.pivotY,gate.squareDraw],[.5,.36,1]);assert.equal(meta.m_c3wall_l.pivotX,.27);
 for(const d of cross){assert.equal('col' in d,false);assert.equal(rawMeta[d.id].col,1,'merge must retain initial collision');}
});
test('66 asset references,40 distinct source images and ground are byte references with no load/conversion',()=>{
 assert.equal(actual.asset_refs.length,66);assert.equal(new Set(actual.asset_refs.map(a=>a.file)).size,40);assert.equal(Object.keys(actual.source.files).length,43);
 for(const a of [...actual.asset_refs,actual.ground_asset]){assert.equal(a.bytes,read(a.file).length);assert.equal(a.sha256,sha(read(a.file)));assert.equal(a.sha256,sha(read('godot/'+a.file)));assert.equal(actual.source.files[a.file],a.sha256);}
 assert.equal(actual.ground_asset.id,'gt_hellwinter');assert.equal(actual.ground_asset.bytes,3562028);assert.deepEqual(actual.environment_refs.map(e=>e.file),['maps_data.js']);assert.deepEqual(hashes(),before);
});
test('seven source holes retain650 budget, timer draw order, and the initially empty/cleared southwest region',()=>{
 assert.equal(actual.spawn_holes_final.length,7);assert.equal(actual.total_spawned,650);assert.deepEqual(actual.region_totals,[100,300,0,250]);
 let state=20261020;const regions=[0,0,0,0];
 for(const h of actual.spawn_holes_final){assert.equal(h.count,h.size<=.3?50:100);state=(Math.imul(state,1664525)+1013904223)>>>0;assert.equal(h.timer,600+state/4294967296*60);assert.equal(h.alive,0);regions[(h.y<4000?0:2)+(h.x<4000?0:1)]+=h.count;}
 assert.deepEqual(regions,actual.region_totals);assert.equal(actual.generation.random_draws,7);assert.equal(actual.generation.random_final_state,state);
 assert.deepEqual(actual.region_details.map(r=>r.cleared),[false,false,true,false]);assert.ok(actual.region_details.every(r=>r.fbIdx===-1));
});
test('source AST hashes/line ranges and every input file checksum are independently checked',()=>{
 const e=expression('_HELLWINTER10');assert.deepEqual([actual.source.symbols._HELLWINTER10.line,actual.source.symbols._HELLWINTER10.end],[17816,17950]);
 for(const [name,key] of [['_HELLWINTER10',undefined],['_MAP_COMPOSE',10],['_CH_DECO',2],['_CH_DECO',0],['_OBJ_META',undefined]]){
  const e=expression(name,key),record=actual.source.symbols[name+(key===undefined?'':'.'+key)];assert.equal(record.sha256,sha(e.text));assert.equal(record.line,source.slice(0,e.node.start).split('\n').length);assert.equal(record.end,source.slice(0,e.node.end).split('\n').length);
 }
 for(const name of ['genFromTemplate','_getFixedMapForStage','_cloneField11','_buildBasinRLE','_applyHellWinterNorthGate','_regionInit','_appendRotatedColParts','_rebuildColObjs','_nearFloor','isW','canMv'])assert.equal(actual.source.symbols[name].sha256,sha(nativeFunction(name).text));
 for(const [p,hash] of Object.entries(actual.source.files))assert.equal(hash,sha(read(p)),p);
});
test('existing stage0/1/4 extraction stays deeply identical to the admitted CH2-01 tool',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-01-Isolated-20261020-baseline-'));
 try{const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','4013102a82c9ddc3bd7d0f75ba0159438f86d93f:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const old=await import(pathToFileURL(file));for(const stage of [0,1,4])assert.deepEqual(buildAreaSnapshot(root,{stage}),old.buildAreaSnapshot(root,{stage}));assert.throws(()=>buildStage0Snapshot(root,{stage:10}),/UNSUPPORTED_STAGE/);}finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('replay and committed snapshot agree; absent undefined/null/zero remain separate and protected bytes unchanged',()=>{
 assert.deepEqual(buildAreaSnapshot(root,{stage:10}),actual);assert.deepEqual(withRecordedProvenance(actual,artifact),artifact);assert.deepEqual(hashes(),before);
 const mask=[];assert.deepEqual(captureJSON({u:undefined,n:null,z:0,a:[]},mask),{u:null,n:null,z:0,a:[]});assert.deepEqual(mask,['/u']);
});
test('provenance normalization rejects a false source hash and preserves all gameplay content differences',()=>{
 const wrong=structuredClone(actual);wrong.source.game_sha256='0'.repeat(64);assert.throws(()=>withRecordedProvenance(wrong,artifact));
 const falsePin=structuredClone(actual),falseReference=structuredClone(artifact);falsePin.source.game_sha256='0'.repeat(64);falseReference.source.game_sha256='0'.repeat(64);assert.throws(()=>withRecordedProvenance(falsePin,falseReference));
 const changed=structuredClone(actual);changed.tiles[0]=changed.tiles[0]===0?1:0;assert.notDeepEqual(withRecordedProvenance(changed,artifact),artifact);assert.deepEqual(hashes(),before);
});
test('CLI guards every unsupported stage/seed, foreign snapshot, protected output and symlink before writes',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-01-Isolated-20261020-cli-'));const tool=path.join(root,'godot/tools/export_ch1_area_source.mjs');
 const cli=(output,stage='10',seed='20261020')=>spawnSync(process.execPath,[tool,root,output,'--stage',stage,'--seed',seed],{encoding:'utf8'});
 try{const output=path.join(tmp,'si10.json');assert.equal(cli(output).status,0);assert.deepEqual(JSON.parse(fs.readFileSync(output)),actual);const saved=fs.readFileSync(output);
  for(const stage of ['-1','2','3','5','9','12','13','14','010','10x']){assert.equal(cli(output,stage).status,1);assert.deepEqual(fs.readFileSync(output),saved);}
  for(const seed of ['-1','NaN','Infinity','1.5','4294967296'])assert.equal(cli(output,'10',seed).status,1);
  for(const stage of [-1,2,3,5,9,12,13,14,'10',10.1])assert.throws(()=>buildAreaSnapshot(root,{stage}),/UNSUPPORTED_STAGE/);
  for(const target of ['godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch2_map_source/si4.json','godot/data/ch3_map_source/si11.json','game.html'])assert.equal(cli(path.join(root,target)).status,1);
  const bad=path.join(tmp,'bad.json');for(const v of [{...actual,stage:11},{schema:'exoduser.ch2-area-source.v1',stage:4}]){fs.writeFileSync(bad,JSON.stringify(v));const bytes=fs.readFileSync(bad);assert.equal(cli(bad).status,1);assert.deepEqual(fs.readFileSync(bad),bytes);}
  const link=path.join(tmp,'link.json');fs.symlinkSync(output,link);assert.match(cli(link).stderr,/Symlink output rejected/);
  const missing=path.join(tmp,'missing.json'),dangling=path.join(tmp,'dangling.json');fs.symlinkSync(missing,dangling);assert.match(cli(dangling).stderr,/Symlink output rejected/);assert.equal(fs.existsSync(missing),false);
  assert.deepEqual(fs.readFileSync(output),saved);assert.deepEqual(hashes(),before);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
