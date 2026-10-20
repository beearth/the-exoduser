import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import vm from 'node:vm';
import crypto from 'node:crypto';import {execFileSync,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';import {parseExpressionAt} from 'acorn';
import {buildAreaSnapshot,buildStage0Snapshot,captureJSON} from '../godot/tools/export_ch1_area_source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const source=read('game.html').toString(),stored=JSON.parse(read('godot/data/ch2_map_source/si5.json'));
const contract=read('godot/port_modules/ch2_map_source/stage5_contract.gd').toString();
const snapshot=buildAreaSnapshot(root,{stage:5});
function expression(name,key){const m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);let node=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(key!==undefined)node=node.properties.find(p=>String(p.key.value??p.key.name)===String(key))?.value;return node?{node,text:source.slice(node.start,node.end)}:null;}
function nativeFunction(name){const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source),node=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return {node,text:source.slice(node.start,node.end)};}
function normalized(value,reference){const out=structuredClone(value);for(const k of ['main_sha','extraction_head']){
 if(!Object.hasOwn(value.source,k)&&!Object.hasOwn(reference.source,k))continue;
 for(const ref of new Set([value.source[k],reference.source[k]]))assert.equal(sha(execFileSync('git',['show',ref+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),value.source.game_sha256);
 out.source[k]=reference.source[k];}return out;}
const protect=['game.html','maps_data.js','godot/data/map.json','godot/scripts/main.gd','godot/scripts/world.gd','godot/scripts/player.gd','godot/scripts/hud.gd',
 'godot/scripts/native_spawn_hole_system.gd','godot/scripts/native_regions.gd','godot/data/ch2_map_source/si4.json',...Object.keys(stored.source.files)];
const before=Object.fromEntries(protect.map(p=>[p,sha(read(p))]));
const HOLES=[[2820,6380,.5,1,100],[5060,5900,.3,1,50],[2020,4900,.5,1,100],[3660,3980,.5,1,100],[5860,2780,.5,1,100],[2300,2180,.3,1,50],[5220,1260,.5,1,100],[3780,6220,.3,1,50],[3060,3420,.55,1,100],[4820,1900,.8,1,100],[4020,5540,.3,-1,50]];

test('si5 extracts latest main bytes through original generator, source only and no protected writes',()=>{
 assert.equal(snapshot.stage,5);assert.equal(snapshot.schema,'exoduser.ch2-area-source.v1');assert.deepEqual(normalized(snapshot,stored),stored);
 assert.equal(snapshot.source.game_sha256,sha(source));assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));
 assert.equal(snapshot.scope.runtime_bound,false);assert.equal(snapshot.scope.visual_verified,false);assert.equal(snapshot.scope.init_map_objects_executed,false);assert.equal(snapshot.scope.save_access,0);
 for(const k of ['final_map_objects','effective_prop_positions','prop_colliders'])assert.equal(snapshot.scope[k],'NOT_OBSERVED');
 for(const [p,h] of Object.entries(before))assert.equal(sha(read(p)),h,p);
});
test('compose5/hand/path are originally undefined, not an empty hand table or si4 path',()=>{
 const parent=expression('_MAP_COMPOSE');assert.equal(expression('_MAP_COMPOSE',5),null);
 assert.deepEqual(parent.node.properties.map(p=>Number(p.key.value??p.key.name)),[0,1,2,3,4,10,11,12,13]);
 assert.equal(snapshot.compose_raw,null);assert.equal(snapshot.hand_props_raw,null);assert.equal(snapshot.source_path.spec,null);assert.equal(snapshot.source_path.empty,null);
 assert.deepEqual(snapshot.undefined_paths,['/hand_props_raw','/source_path/spec','/source_path/empty','/compose_raw']);
 assert.deepEqual(snapshot.source_path.editor_tile_rle,[1,40000]);assert.equal(snapshot.source_path.editor_tile_rle_sha256,sha('[1,40000]'));
 assert.equal(snapshot.source.symbols['_MAP_COMPOSE.absent.5'].sha256,sha(parent.text));assert.equal('_CH2S4' in snapshot.source.symbols,false);
 assert.equal('source_geometry' in snapshot,false);assert.equal('ch1_deco_raw' in snapshot,false);
});
test('entire generated grid, gate and destination differ from si4 while exact START remains',()=>{
 assert.deepEqual(snapshot.grid,{width:200,height:200,tile_size:40});assert.equal(snapshot.tiles.length,40000);
 assert.equal(sha(Buffer.from(snapshot.tiles)),'5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e');
 assert.deepEqual([0,1,2,3,4].map(v=>snapshot.tiles.filter(x=>x===v).length),[38986,36,3,0,975]);
 assert.deepEqual(snapshot.start_world,[4020,7420]);assert.deepEqual(snapshot.start_tile,[100,185]);assert.deepEqual(snapshot.exit_center_tile,[100,7]);
 assert.deepEqual(snapshot.boss_gate,[99,100,101].map(x=>({x,y:5})));assert.deepEqual(snapshot.exits,[99,100,101].map(x=>({x,y:7})));
 const previous=JSON.parse(read('godot/data/ch2_map_source/si4.json'));assert.notEqual(snapshot.runtime_tile_sha256,previous.runtime_tile_sha256);assert.notDeepEqual(snapshot.spawn_holes_final,previous.spawn_holes_final);
});
test('stage descriptor is produced by original STG construction:WORM NEST2/점액 괴수,not hell boss',()=>{
 const start=source.indexOf('const STG=[];'),end=source.indexOf('\nlet G=',start),sandbox=vm.createContext({});
 const code=['EL','CHAPTER_STAGES','HELL_THEMES','HELL_BOSSES'].map(n=>'const '+n+'='+expression(n).text+';');
 code.push(source.slice(start,end),'globalThis.result=STG[5];');vm.runInContext(code.join('\n'),sandbox);
 assert.deepEqual(snapshot.stage_descriptor,JSON.parse(JSON.stringify(sandbox.result)));
 assert.equal(snapshot.stage_descriptor.bn,'점액 괴수');assert.equal(snapshot.stage_descriptor.kr,'벌레굴 2구역');assert.equal(snapshot.stage_descriptor.hellFloor,1);assert.equal(snapshot.stage_descriptor.monLv,200);assert.equal(snapshot.stage_descriptor.isHellBoss,false);
});
test('11 ordered holes preserve budget900 and NW/NE/SW/SE250/300/250/100 without source repair',()=>{
 assert.deepEqual(snapshot.spawn_holes_final.map(h=>[h.x,h.y,h.size,h.room,h.count]),HOLES);
 const totals=[0,0,0,0];for(const h of snapshot.spawn_holes_final){assert.equal(h.alive,0);totals[(h.y<4000?0:2)+(h.x<4000?0:1)]+=h.count;}
 assert.deepEqual(totals,[250,300,250,100]);assert.deepEqual(snapshot.region_totals,totals);assert.equal(snapshot.total_spawned,900);
});
test('original mkRng repositions9 template holes, generator consumes12 draws and culls draw8',()=>{
 const ctx=vm.createContext({Math});vm.runInContext(nativeFunction('mkRng').text,ctx);const rng=vm.runInContext('mkRng(5*7919+17)',ctx);
 const maps=vm.createContext({});vm.runInContext(read('maps_data.js').toString()+'\nglobalThis.base=FIXED_MAPS[0];',maps);
 const repositioned=JSON.parse(JSON.stringify(maps.base.spawnHoles)).map(h=>({...h,x:Math.max(18,Math.min(182,~~(h.x+(rng()-.5)*36))),y:Math.max(18,Math.min(182,~~(h.y+(rng()-.5)*36)))}));
 const accepted=[];
 for(const h of repositioned){const p=[(h.x+.5)*40,(h.y+.5)*40];if(accepted.every(a=>Math.hypot(a[0]-p[0],a[1]-p[1])>=500))accepted.push(p);}
 assert.equal(accepted.length,8,'one jittered manual candidate is rejected before timer allocation');
 assert.deepEqual(accepted.slice(0,7),HOLES.slice(0,7).map(h=>h.slice(0,2)));
 const [cx,cy]=accepted[7].map(v=>Math.trunc(v/40));let floors=0;
 for(let y=cy-5;y<=cy+5;y++)for(let x=cx-5;x<=cx+5;x++)if(x>=0&&x<200&&y>=0&&y<200&&snapshot.tiles[y*200+x]===0)floors++;
 assert.ok(floors<30,'the timer8 candidate fails original nearby floor-space validation');
 let state=20261020;const timers=[];for(let i=0;i<12;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;timers.push(600+state/4294967296*60);}
 assert.equal(snapshot.generation.random_draws,12);assert.equal(snapshot.generation.random_final_state,3458361656);
 assert.deepEqual(snapshot.spawn_holes_final.map(h=>h.timer),[1,2,3,4,5,6,7,9,10,11,12].map(i=>timers[i-1]));assert.ok(!snapshot.spawn_holes_final.some(h=>h.timer===timers[7]));
 const changed=buildAreaSnapshot(root,{stage:5,seed:1});assert.deepEqual(changed.tiles,snapshot.tiles);assert.deepEqual(changed.spawn_holes_final.map(({timer,...h})=>h),snapshot.spawn_holes_final.map(({timer,...h})=>h));assert.notEqual(changed.spawn_holes_final[0].timer,snapshot.spawn_holes_final[0].timer);
});
test('shared47catalog/77meta and29 original PNG references remain byte identical, no load/init object claims',()=>{
 for(const [field,name,key] of [['ch2_deco_raw','_CH_DECO',1],['initial_obj_meta','_OBJ_META',undefined]])assert.deepEqual(snapshot[field],JSON.parse(JSON.stringify(vm.runInNewContext('('+expression(name,key).text+')'))));
 assert.equal(snapshot.asset_refs.length,47);assert.equal(new Set(snapshot.asset_refs.map(a=>a.file)).size,29);assert.equal(Object.keys(snapshot.source.files).length,31);
 const old=JSON.parse(read('godot/data/ch2_map_source/si4.json'));for(const k of ['asset_refs','ch2_deco_raw','initial_obj_meta','rooms','chapter_stages'])assert.deepEqual(snapshot[k],old[k],k);
 for(const a of snapshot.asset_refs){assert.equal(sha(read(a.file)),a.sha256);assert.equal(read(a.file).length,a.bytes);}
});
test('all native records/contract pins match independent AST row/hash data',()=>{
 const pin=n=>JSON.parse(new RegExp('^const '+n+' = (.+)$','m').exec(contract)[1]);
 for(const [n,v] of [['SYMBOLS',snapshot.source.symbols],['PATH',snapshot.source_path],['DESCRIPTOR',snapshot.stage_descriptor],['UNDEFINED_PATHS',snapshot.undefined_paths],['FIELDS',Object.keys(snapshot)]])assert.deepEqual(pin(n),v,n);
 assert.deepEqual(pin('HOLES'),HOLES.map((h,i)=>[...h,[1,2,3,4,5,6,7,9,10,11,12][i]]));
 for(const [name,r] of Object.entries(snapshot.source.symbols)){
  let code;if(name==='_MAP_COMPOSE.absent.5')code=expression('_MAP_COMPOSE').text;
  else if(name==='STG.construction')code=source.slice(source.indexOf('const STG=[];'),source.indexOf('\nlet G=',source.indexOf('const STG=[];')));
  else code=source.split('\n').slice(r.line-1,r.end).join('\n');
  // Function and initializer slices need AST columns, not whole source lines.
  if(!['STG.construction','_MAP_COMPOSE.absent.5','stage_index_arrays','stage_face_dungeon','initStage.start_position'].includes(name)){
   const [base,key]=name.split('.');code=/function\s/.test(source.slice(Math.max(0,source.indexOf('function '+base)),source.indexOf('function '+base)+20))&&source.includes('function '+base+'(')?nativeFunction(base).text:expression(base,key).text;
  }
  if(['stage_index_arrays','stage_face_dungeon','initStage.start_position'].includes(name))continue;
  assert.equal(sha(code),r.sha256,name);
 }
});
test('unchanged0/1/4 re-extraction matches the complete prior shared pipeline, not just selected fields',async()=>{
 const dir=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-03-Isolated-20261020-before-'));
 try{const file=path.join(dir,'prior.mjs');fs.writeFileSync(file,execFileSync('git',['show','26c050a99:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const old=await import(pathToFileURL(file));for(const stage of [0,1,4]){const previous=old.buildAreaSnapshot(root,{stage});assert.deepEqual(normalized(buildAreaSnapshot(root,{stage}),previous),previous);}
 assert.throws(()=>buildStage0Snapshot(root,{stage:5}),/UNSUPPORTED_STAGE/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('CLI accepts only exact stage5 output and rejects cross-stage,foreign,symlink and invalid inputs before writing',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch2-03-Isolated-20261020-cli-'));
 const tool=path.join(root,'godot/tools/export_ch1_area_source.mjs'),cli=(out,stage='5',seed='20261020')=>spawnSync(process.execPath,[tool,root,out,'--stage',stage,'--seed',seed],{encoding:'utf8'});
 try{const out=path.join(tmp,'si5.json');assert.equal(cli(out).status,0);assert.deepEqual(normalized(JSON.parse(fs.readFileSync(out)),stored),stored);const bytes=fs.readFileSync(out);
  for(const stage of ['-1','2','3','6','7','8','9','10','05','5x']){assert.equal(cli(out,stage).status,1);assert.deepEqual(fs.readFileSync(out),bytes);}
  for(const seed of ['-1','NaN','Infinity','1.5','4294967296'])assert.equal(cli(out,'5',seed).status,1);
  for(const p of ['game.html','godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch2_map_source/si4.json','godot/data/ch2_map_source/si6.json'])assert.equal(cli(path.join(root,p)).status,1);
  assert.equal(cli(out,'4').status,1);const bad=path.join(tmp,'bad.json');fs.writeFileSync(bad,JSON.stringify({...stored,stage:4}));assert.equal(cli(bad).status,1);
  const link=path.join(tmp,'link.json');fs.symlinkSync(out,link);assert.match(cli(link).stderr,/Symlink output rejected/);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 for(const [p,h] of Object.entries(before))assert.equal(sha(read(p)),h,p);
});
