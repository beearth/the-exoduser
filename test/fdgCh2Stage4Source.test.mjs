import {outputSymlink} from './helpers/outputSymlink.mjs';
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
const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
const artifact=JSON.parse(fs.readFileSync(path.join(root,'godot/data/ch2_map_source/si4.json'),'utf8'));
const contract=fs.readFileSync(path.join(root,'godot/port_modules/ch2_map_source/stage4_contract.gd'),'utf8');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const read=p=>fs.readFileSync(path.join(root,p));
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
 return source.slice(n.start,n.end);
}
const rawHand=plain(vm.runInNewContext('('+expression('_CH2S4').text+')'));
const rawDeco=plain(vm.runInNewContext('('+expression('_CH_DECO',1).text+')'));
const rawMeta=plain(vm.runInNewContext('('+expression('_OBJ_META').text+')'));
const protectedPaths=['game.html','maps_data.js','godot/data/map.json','godot/data/ch1_map_source/si0.json',
 'godot/data/ch1_map_source/si1.json','godot/port_modules/ch1_map_source/producer.gd',
 'godot/port_modules/ch1_map_source/stage1_contract.gd','godot/scripts/main.gd','godot/scripts/world.gd',
 'godot/scripts/native_spawn_hole_system.gd','godot/scripts/native_regions.gd',...artifact.asset_refs.map(a=>a.file)];
const hashes=()=>Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))]));
const before=hashes();
let actual;
test('stage4 extracts latest-main source into a readonly CH2 snapshot, without any runtime claim',()=>{
 actual=buildAreaSnapshot(root,{stage:4});
 assert.equal(actual.schema,'exoduser.ch2-area-source.v1');assert.equal(actual.stage,4);
 assert.equal(actual.source.game_sha256,sha(source));
 assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));
 for(const f of ['main_sha','extraction_head'])assert.match(actual.source[f],/^[0-9a-f]{40}$/);
 assert.equal(actual.source.selection,'default empty URL → _getFixedMapForStage(4) → _cloneField11(4) → genFromTemplate');
 assert.equal(actual.scope.runtime_bound,false);assert.equal(actual.scope.visual_verified,false);assert.equal(actual.scope.save_access,0);
 assert.equal(actual.scope.init_map_objects_executed,false);
 for(const k of ['final_map_objects','effective_prop_positions','prop_colliders'])assert.equal(actual.scope[k],'NOT_OBSERVED');
 assert.equal('ch1_deco_raw' in actual,false);assert.equal('source_geometry' in actual,false);
 assert.equal('environment.baked_manifest' in actual.source.symbols,false);
 assert.deepEqual(hashes(),before);
});
test('the entire final grid has exact native hash/counts, gate metadata with zero type3 cells and START',()=>{
 assert.deepEqual(actual.grid,{width:200,height:200,tile_size:40});assert.equal(actual.tiles.length,40000);
 assert.equal(actual.runtime_tile_sha256,'4e965948e59fed49b7de6c2936ca24aa774e858532a7e22780d72519050eb3c8');
 assert.equal(sha(Buffer.from(actual.tiles)),actual.runtime_tile_sha256);
 assert.deepEqual([0,1,2,3,4].map(v=>actual.tiles.filter(t=>t===v).length),[10722,28395,3,0,880]);
 assert.deepEqual(actual.start_tile,[100,185]);assert.deepEqual(actual.start_world,[4020,7420]);
 assert.deepEqual(actual.exit_center_tile,[100,33]);assert.equal(actual.rooms.length,6);
 assert.deepEqual(actual.boss_gate,[{x:99,y:31},{x:100,y:31},{x:101,y:31}]);
 assert.deepEqual(actual.exits,[{x:99,y:33},{x:100,y:33},{x:101,y:33}]);
 assert.equal(actual.tiles[34*200+100],0,'source guard candidate is floor; no actor installed here');
});
test('path22 preserves the repeated dead-end point and the native width30 RLE, not a CH1 polygon or visual rim',()=>{
 const sandbox=vm.createContext({Math,Uint8Array});
 const code=`const _CH2S4=${expression('_CH2S4').text};globalThis.compose=${expression('_MAP_COMPOSE',4).text};`;
 vm.runInContext(code,sandbox);const spec=plain(sandbox.compose.path);
 assert.deepEqual(actual.source_path.spec,spec);assert.equal(spec.w,30);assert.equal(spec.authoredWidth,1);
 assert.equal(spec.pts.length,22);assert.deepEqual(spec.pts[7],spec.pts[9]);
 assert.deepEqual(actual.source_path.empty,plain(sandbox.compose.empty));
 for(const n of ['_rleEncodeGrid','_paintPathDisk','_paintPathSeg','_buildWalkPathRLE'])vm.runInContext(nativeFunction(n),sandbox);
 const rle=Array.from(vm.runInContext('_buildWalkPathRLE(200,200,compose.path,4)',sandbox));
 assert.deepEqual(actual.source_path.editor_tile_rle,rle);assert.equal(rle.length,798);
 assert.equal(actual.source_path.editor_tile_rle_sha256,sha(JSON.stringify(rle)));
 const decoded=[];for(let i=0;i<rle.length;i+=2)decoded.push(...Array(rle[i+1]).fill(rle[i]===1?0:1));
 assert.equal(decoded.length,40000);assert.notDeepEqual(decoded,actual.tiles,'native generator mutates boss/exit after path input');
});
test('all 105 hands match the original IIFE, including absent keys, rotation, overlap, role and zone order',()=>{
 assert.deepEqual(actual.hand_props_raw,rawHand);assert.equal(rawHand.length,105);
 const roles={};for(const h of rawHand)roles[h.role]=(roles[h.role]||0)+1;
 assert.deepEqual(roles,{backfill:9,boundary:50,landmark:18,detail:6,mask:4,filler:12,seam:6});
 assert.equal(new Set(rawHand.map(h=>h.zone)).size,13);
 assert.equal(rawHand.filter(h=>h.overlap!==undefined).length,9);
 assert.equal(rawHand.filter(h=>!Object.hasOwn(h,'rot')).length,78);
 assert.deepEqual(actual.undefined_paths,[]);
 assert.ok(rawHand.every(h=>!['m_c2web','m_c2seamWeb','spider_web','m_web'].includes(h.id)));
});
test('raw catalog47, base77 and all29 image bytes match native references; mega17 are separate from collider51 declarations',()=>{
 assert.deepEqual(actual.ch2_deco_raw,rawDeco);assert.deepEqual(actual.initial_obj_meta,rawMeta);
 assert.equal(rawDeco.length,47);assert.equal(Object.keys(rawMeta).length,77);assert.equal(actual.asset_refs.length,47);
 const byId=Object.fromEntries(rawDeco.map(d=>[d.id,d]));
 assert.equal(rawHand.filter(h=>byId[h.id].mega).length,17);
 assert.equal(rawHand.filter(h=>byId[h.id].col||byId[h.id].collision).length,51);
 assert.equal(new Set(actual.asset_refs.map(a=>a.file)).size,29);
 for(let i=0;i<47;i++){
  const d=rawDeco[i],a=actual.asset_refs[i],file=path.posix.join('assets/map/ch2',d.dir||'floor_objects',d.file);
  assert.equal(a.id,d.id);assert.equal(a.file,file);assert.equal(a.sha256,sha(read(file)));assert.equal(a.bytes,read(file).length);
  assert.equal(a.sha256,sha(read('godot/'+file)));assert.equal(actual.source.files[file],a.sha256);
 }
 assert.deepEqual(actual.environment_refs.map(e=>e.file),['maps_data.js']);assert.equal(Object.keys(actual.source.files).length,31);
});
test('all 11 ordered source holes preserve the 900 budget and four quadrant totals, without stage0 discounts',()=>{
 assert.deepEqual(actual.spawn_holes_final.map(h=>[h.x,h.y,h.size,h.room,h.count]),[
 [3540,6700,.5,1,100],[2780,5860,.3,1,50],[4060,5380,.5,1,100],[5500,5180,.3,1,50],
 [3860,4580,.5,1,100],[3260,3700,.5,1,100],[3940,3300,.3,1,50],[2900,2340,.5,1,100],
 [4260,1700,.8,1,100],[3780,6220,.3,1,50],[4820,1900,.8,1,100]]);
 const totals=[0,0,0,0];for(const h of actual.spawn_holes_final){totals[(h.y<4000?0:2)+(h.x<4000?0:1)]+=h.count;assert.equal(h.alive,0);}
 assert.deepEqual(totals,[250,200,300,150]);assert.deepEqual(actual.region_totals,totals);assert.equal(actual.total_spawned,900);
});
test('seed20261020 records 11 actual draws; changing seed only changes timers and evidence, not layout or population',()=>{
 let state=20261020;const timers=[];
 for(let i=0;i<11;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;timers.push(600+state/4294967296*60);}
 assert.equal(actual.generation.random_draws,11);assert.equal(actual.generation.random_final_state,998000637);
 assert.equal(state,actual.generation.random_final_state);assert.deepEqual(actual.spawn_holes_final.map(h=>h.timer),timers);
 const changed=buildAreaSnapshot(root,{stage:4,seed:1});
 assert.deepEqual(changed.tiles,actual.tiles);assert.deepEqual(changed.spawn_holes_final.map(({timer,...h})=>h),actual.spawn_holes_final.map(({timer,...h})=>h));
 assert.notEqual(changed.spawn_holes_final[0].timer,actual.spawn_holes_final[0].timer);
});
test('every raw contract pin matches independent native data/provenance, not a fabricated consumer fixture',()=>{
 const pin=name=>JSON.parse(new RegExp('^const '+name+' = (.+)$','m').exec(contract)[1]);
 for(const [n,v] of [['HANDS',rawHand],['DECO',rawDeco],['META',rawMeta],['PATH',actual.source_path],['ASSETS',actual.asset_refs],
 ['FILES',actual.source.files],['SYMBOLS',actual.source.symbols],['CHAPTERS',actual.chapter_stages],['ROOMS',actual.rooms]])assert.deepEqual(pin(n),v,n);
 for(const name of ['_CH2S4','_MAP_COMPOSE.4','_CH_DECO.1','_OBJ_META']){
  const [base,key]=name.split('.');const e=expression(base,key),record=actual.source.symbols[name];
  assert.equal(record.sha256,sha(e.text));assert.equal(record.line,source.slice(0,e.node.start).split('\n').length);
  assert.equal(record.end,source.slice(0,e.node.end).split('\n').length);
 }
 for(const n of ['genFromTemplate','_cloneField11','_getFixedMapForStage','_traceCh2AuthoredFloor','_fillPathBg'])assert.equal(actual.source.symbols[n].sha256,sha(nativeFunction(n)));
 for(const [p,hash] of Object.entries(actual.source.files))assert.equal(hash,sha(read(p)),p);
 assert.deepEqual([actual.source.symbols._CH2S4.line,actual.source.symbols._CH2S4.end],[17991,18117]);
});
test('existing stage0/1 pipeline outputs remain deeply identical to admitted CH1-03 before extension',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-01-Isolated-20261020-baseline-'));
 try {
  const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','aada9b28b066cfb1c23487c6c0a8036e18fba3f7:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));
  const old=await import(pathToFileURL(file));
  for(const stage of [0,1])assert.deepEqual(buildAreaSnapshot(root,{stage}),old.buildAreaSnapshot(root,{stage}));
  assert.throws(()=>buildStage0Snapshot(root,{stage:4}),/UNSUPPORTED_STAGE/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('repeated extraction and committed artifact agree while zero protected source/map/asset bytes change',()=>{
 assert.deepEqual(buildAreaSnapshot(root,{stage:4}),actual);
 const normalized=structuredClone(actual);for(const k of ['main_sha','extraction_head'])normalized.source[k]=artifact.source[k];
 assert.deepEqual(normalized,artifact);assert.deepEqual(hashes(),before);
 const mask=[];assert.deepEqual(captureJSON({absentCarrier:undefined,nullValue:null,zero:0,empty:[]},mask),{absentCarrier:null,nullValue:null,zero:0,empty:[]});
 assert.deepEqual(mask,['/absentCarrier']);
});
test('CLI stage4 output cannot replace source, another stage, a foreign schema, a wrong-stage snapshot or a symlink',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-01-Isolated-20261020-cli-'));
 const tool=path.join(root,'godot/tools/export_ch1_area_source.mjs');
 const cli=(output,stage='4',seed='20261020')=>spawnSync(process.execPath,[tool,root,output,'--stage',stage,'--seed',seed],{encoding:'utf8'});
 try {
  const output=path.join(tmp,'si4.json');assert.equal(cli(output).status,0);assert.deepEqual(JSON.parse(fs.readFileSync(output)),actual);
  const saved=fs.readFileSync(output);
  for(const stage of ['-1','2','3','5','6','7','8','9','04','4x']){const p=cli(output,stage);assert.equal(p.status,1);assert.match(p.stderr,/UNSUPPORTED_STAGE/);assert.deepEqual(fs.readFileSync(output),saved);}
  for(const seed of ['-1','NaN','Infinity','1.5','4294967296'])assert.equal(cli(output,'4',seed).status,1);
  for(const stage of [-1,2,3,5,6,7,8,9,'4',4.1])assert.throws(()=>buildAreaSnapshot(root,{stage}),/UNSUPPORTED_STAGE/);
  for(const target of ['godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch1_map_source/si1.json','godot/data/ch2_map_source/si5.json','game.html'])assert.equal(cli(path.join(root,target)).status,1);
  const bad=path.join(tmp,'bad.json');fs.writeFileSync(bad,JSON.stringify({...actual,stage:5}));const badBefore=fs.readFileSync(bad);assert.equal(cli(bad).status,1);assert.deepEqual(fs.readFileSync(bad),badBefore);
  fs.writeFileSync(bad,'{"schema":"exoduser.ch1-area-source.v1","stage":1}');assert.equal(cli(bad).status,1);
  const link=outputSymlink(tmp,output);assert.match(cli(link).stderr,/Symlink output rejected/);
  assert.deepEqual(fs.readFileSync(output),saved);assert.deepEqual(hashes(),before);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
