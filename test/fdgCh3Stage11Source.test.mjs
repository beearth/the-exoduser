import test from 'node:test';
import {outputSymlink} from './helpers/outputSymlink.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import vm from 'node:vm';
import crypto from 'node:crypto';import {execFileSync,spawnSync} from 'node:child_process';
import {parseExpressionAt} from 'acorn';import {fileURLToPath,pathToFileURL} from 'node:url';
import {buildAreaSnapshot,buildStage0Snapshot,captureJSON} from '../godot/tools/export_ch1_area_source.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p)),source=read('game.html').toString();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const stored=JSON.parse(read('godot/data/ch3_map_source/si11.json'));
function expr(name,key){const m=new RegExp('(?:const|var|let)\\s+'+name+'\\s*=').exec(source);assert.ok(m,name);let n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(key!==undefined)n=n.properties.find(p=>String(p.key.value??p.key.name)===String(key)).value;return {text:source.slice(n.start,n.end),node:n};}
function fn(name){const m=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);assert.ok(m,name);const n=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return {text:source.slice(n.start,n.end),node:n};}
const protectedPaths=['game.html','maps_data.js','godot/data/map.json','godot/data/ch1_map_source/si0.json','godot/data/ch1_map_source/si1.json','godot/data/ch2_map_source/si4.json','godot/data/ch3_map_source/si10.json','godot/data/ch3_map_source/si10_resources.json',...['main','world','player','hud','native_source_new_run_state','native_spawn_hole_system','native_regions'].map(n=>'godot/scripts/'+n+'.gd'),...stored.asset_refs.map(a=>a.file),stored.ground_asset.file];
const hashes=()=>Object.fromEntries(protectedPaths.map(p=>[p,sha(read(p))])),before=hashes();
const actual=buildAreaSnapshot(root,{stage:11});
function sameContent(value,reference){const a=structuredClone(value);for(const s of [a.source,reference.source])assert.equal(sha(execFileSync('git',['show',s.main_sha+':game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));a.source.main_sha=reference.source.main_sha;if('extraction_head' in reference.source)a.source.extraction_head=reference.source.extraction_head;return a;}
test('si11 native selector is default200 field with unready dungeon, source-only Frost Knight descriptor',()=>{
 assert.equal(actual.stage,11);assert.equal(actual.schema,'exoduser.ch3-area-source.v1');assert.equal(actual.source.game_sha256,sha(source));
 assert.equal(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})),sha(source));
 const c=vm.createContext({Uint8Array,Set});for(const n of ['EL','CHAPTER_STAGES','TOTAL_STAGES','HELL_THEMES','HELL_BOSSES'])vm.runInContext('const '+n+'='+expr(n).text+';',c);
 const at=source.indexOf('const STG=[];'),end=source.indexOf('\nlet G=',at);vm.runInContext(source.slice(at,end)+';globalThis.descriptor=STG[11];',c);
 assert.deepEqual(actual.stage_descriptor,plain(c.descriptor));assert.equal(actual.stage_descriptor.bn,'서리의 기사');assert.deepEqual([actual.stage_descriptor.hell,actual.stage_descriptor.hellFloor,actual.stage_descriptor.monLv,actual.stage_descriptor.isHellBoss],[2,1,300,false]);
 const dungeon=expr('_DUNGEON_SPEC',11);assert.deepEqual(actual.selector_evidence,{dungeon_spec:plain(vm.runInNewContext('('+dungeon.text+')')),is_dungeon:false,is_face:false,base_present:true,selected_size:[200,200]});
 assert.equal(actual.scope.runtime_bound,false);assert.equal(actual.scope.visual_verified,false);assert.equal(actual.scope.save_access,0);assert.equal(actual.scope.init_map_objects_executed,false);
 for(const k of ['final_map_objects','effective_prop_positions','prop_colliders'])assert.equal(actual.scope[k],'NOT_OBSERVED');
 assert.equal('source_basin' in actual,false);assert.equal('source_path' in actual,false);assert.deepEqual(hashes(),before);
});
test('old admitted generator VM independently runs si11 and equals every final tile, room, hole and gate observation',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-03-Isolated-20261020-native-'));
 try{const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','dbaf1647:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const old=await import(pathToFileURL(file));let observed;
  old.buildAreaSnapshot(root,{stage:10,observeNative:run=>{
   for(const n of ['_iceC','_iceB'])run(fn(n).text);run('const _ICE11='+expr('_ICE11').text+';_MAP_COMPOSE[11]='+expr('_MAP_COMPOSE',11).text+';');
   run('G={stage:11,_zones:null};MAP_OBJS=[];P={};var independentState=20261020;Math.random=()=>{independentState=(Math.imul(independentState,1664525)+1013904223)>>>0;return independentState/4294967296;};globalThis.template11=_getFixedMapForStage(11);genFromTemplate(template11,11);');
   const at=source.indexOf('const st=G.rooms.find',source.indexOf('function initStage(')),m=/P\.x=\(_spX\+\.5\)\*T;P\.y=\(_spY\+\.5\)\*T;/.exec(source.slice(at));run('{'+source.slice(at,at+m.index+m[0].length)+'}');run('_regionInit(11);');
   observed=captureJSON(run('({tiles:G.map.flat(),rooms:G.rooms,holes:G.spawnHoles.map(h=>({...h,count:_spawnHoleCount(h.size,11)})),regions:G._regions,start:[P.x,P.y],gate:G.bossGate,exits:G.exits,initialRLE:template11.tileRLE})'));
  }});
  assert.deepEqual(actual.tiles,observed.tiles);assert.deepEqual(actual.rooms,observed.rooms);assert.deepEqual(actual.spawn_holes_final,observed.holes);assert.deepEqual(actual.region_details,observed.regions);assert.deepEqual(actual.start_world,observed.start);assert.deepEqual(actual.boss_gate,observed.gate);assert.deepEqual(actual.exits,observed.exits);assert.deepEqual(observed.initialRLE,[1,40000]);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
 assert.deepEqual(actual.grid,{width:200,height:200,tile_size:40});assert.equal(actual.tiles.length,40000);assert.deepEqual([0,1,2,3,4].map(v=>actual.tiles.filter(t=>t===v).length),[38986,36,3,0,975]);assert.equal(sha(Buffer.from(actual.tiles)),'5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e');
 assert.deepEqual(actual.start_tile,[100,185]);assert.deepEqual(actual.start_world,[4020,7420]);assert.deepEqual(actual.exit_center_tile,[100,7]);
 for(const [k,y] of [['boss_gate',5],['exits',7]])assert.deepEqual(actual[k],[99,100,101].map(x=>({x,y})));
 assert.deepEqual(actual.guard_evidence,{candidate_tile:[100,8],actual_tile:4,required_tile:0,predicate_met:false});assert.equal(actual.tiles[8*200+100],4);assert.equal(actual.tiles.filter(v=>v===3).length,0);
});
test('all18 raw hands equal original ice helpers including nine local seeded scatter entries and absent scale/rotation keys',()=>{
 const c=vm.createContext({Math});for(const n of ['mkRng','_iceC','_iceB'])vm.runInContext(fn(n).text,c);const hands=plain(vm.runInContext(expr('_ICE11').text,c));assert.deepEqual(actual.hand_props_raw,hands);assert.equal(hands.length,18);
 vm.runInContext('const _ICE11='+expr('_ICE11').text+';globalThis.compose='+expr('_MAP_COMPOSE',11).text+';',c);assert.deepEqual(actual.compose_raw,plain(c.compose));assert.equal(actual.compose_raw.hand,1);assert.equal(actual.compose_raw.dense,1);
 assert.equal(hands.filter(h=>!Object.hasOwn(h,'scale')).length,9);assert.equal(hands.filter(h=>Object.hasOwn(h,'rot')).length,0);assert.deepEqual(actual.undefined_paths,[]);assert.equal(actual.cross_deco_raw.length,0);
 assert.deepEqual(actual.source_floor,{editor_tile_rle:[1,40000],editor_tile_rle_sha256:sha(JSON.stringify([1,40000]))});
});
test('catalog61/base77 and35 existing source image files plus ground are byte references only',()=>{
 assert.deepEqual(actual.ch3_deco_raw,plain(vm.runInNewContext('('+expr('_CH_DECO',2).text+')')));assert.deepEqual(actual.initial_obj_meta,plain(vm.runInNewContext('('+expr('_OBJ_META').text+')')));
 assert.equal(actual.asset_refs.length,61);assert.equal(new Set(actual.asset_refs.map(a=>a.file)).size,35);assert.equal(Object.keys(actual.source.files).length,38);
 for(const a of [...actual.asset_refs,actual.ground_asset]){assert.equal(a.bytes,read(a.file).length);assert.equal(a.sha256,sha(read(a.file)));assert.equal(a.sha256,sha(read('godot/'+a.file)));assert.equal(actual.source.files[a.file],a.sha256);}
 assert.deepEqual(hashes(),before);
});
test('native clone jitter, ordered13 timers and1050 regional budget are exact without browser RNG or fabricated gate actor',()=>{
 const c=vm.createContext({Math,Set,Uint8Array,Uint16Array});vm.runInContext(read('maps_data.js').toString(),c);vm.runInContext(fn('mkRng').text,c);const jitter=plain(vm.runInContext('(()=>{const rng=mkRng(11*7919+17);return FIXED_MAPS[0].spawnHoles.map(h=>({...h,x:Math.max(18,Math.min(182,~~(h.x+(rng()-.5)*36))),y:Math.max(18,Math.min(182,~~(h.y+(rng()-.5)*36)))}))})()',c));
 assert.equal(jitter.length,9);assert.deepEqual(actual.spawn_holes_final.slice(0,9).map(h=>[h.x,h.y]),jitter.map(h=>[(h.x+.5)*40,(h.y+.5)*40]));
 assert.equal(actual.total_spawned,1050);assert.deepEqual(actual.region_totals,[350,300,250,150]);assert.equal(actual.spawn_holes_final.length,13);assert.equal(actual.generation.random_draws,13);
 let state=20261020;const totals=[0,0,0,0];for(const h of actual.spawn_holes_final){state=(Math.imul(state,1664525)+1013904223)>>>0;assert.equal(h.timer,600+state/4294967296*60);assert.equal(h.alive,0);assert.equal(h.count,h.size<=.3?50:100);totals[(h.y<4000?0:2)+(h.x<4000?0:1)]+=h.count;}
 assert.equal(actual.generation.random_final_state,state);assert.equal(state,2962398007);assert.deepEqual(totals,actual.region_totals);assert.ok(actual.region_details.every(r=>r.cleared===false&&r.fbIdx===-1));assert.equal(actual.spawn_holes_final[12].room,-1);
 for(const seed of [0,4294967295]){const v=buildAreaSnapshot(root,{stage:11,seed});assert.deepEqual(v.tiles,actual.tiles);assert.deepEqual(v.hand_props_raw,actual.hand_props_raw);assert.deepEqual(v.spawn_holes_final.map(({timer,...h})=>h),actual.spawn_holes_final.map(({timer,...h})=>h));assert.notEqual(v.spawn_holes_final[0].timer,actual.spawn_holes_final[0].timer);}
});
test('source records pin exact original AST and every original file; guard predicate is evidence only',()=>{
 for(const [n,k] of [['_ICE11',undefined],['_MAP_COMPOSE',11],['_CH_DECO',2],['_OBJ_META',undefined]]){const e=expr(n,k),p=actual.source.symbols[n+(k===undefined?'':'.'+k)];assert.equal(p.sha256,sha(e.text));assert.equal(p.line,source.slice(0,e.node.start).split('\n').length);assert.equal(p.end,source.slice(0,e.node.end).split('\n').length);}
 for(const n of ['_iceC','_iceB','mkRng','_cloneField11','_getFixedMapForStage','genFromTemplate','_regionInit'])assert.equal(actual.source.symbols[n].sha256,sha(fn(n).text));
 const g=actual.source.symbols['initStage.guard_predicate'],fragment=source.slice(source.indexOf('const _ggTx='),source.indexOf('const gg=mkEn',source.indexOf('const _ggTx=')));assert.equal(g.sha256,sha(fragment));assert.match(fragment,/G\.map\[_ggTy\]\[_ggTx\]===0/);assert.equal(fragment.includes('const gg=mkEn'),false);
 for(const [p,h] of Object.entries(actual.source.files))assert.equal(sha(read(p)),h,p);assert.equal(actual.source.symbols._ICE11.line,17952);assert.equal(actual.source.symbols._ICE11.end,17956);
});
test('existing stage0/1/4/10 pipelines remain deeply equal to admitted CH3-02, including optional native observer',async()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-03-Isolated-20261020-old-'));
 try{const file=path.join(tmp,'before.mjs');fs.writeFileSync(file,execFileSync('git',['show','dbaf1647:godot/tools/export_ch1_area_source.mjs'],{cwd:root}));const old=await import(pathToFileURL(file));for(const stage of [0,1,4,10])assert.deepEqual(buildAreaSnapshot(root,{stage}),old.buildAreaSnapshot(root,{stage}));
  const observed=buildAreaSnapshot(root,{stage:11,observeNative:run=>run('G.map[0][0]=999;')});assert.deepEqual(observed,actual);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
test('repeated extraction and admitted si11 content agree, with recorded commit bytes proven before provenance normalization',()=>{
 assert.deepEqual(buildAreaSnapshot(root,{stage:11}),actual);assert.deepEqual(sameContent(actual,stored),stored);assert.deepEqual(hashes(),before);assert.throws(()=>buildStage0Snapshot(root,{stage:11}),/UNSUPPORTED_STAGE/);
 const mask=[];assert.deepEqual(captureJSON({u:undefined,n:null,z:0},mask),{u:null,n:null,z:0});assert.deepEqual(mask,['/u']);
});
test('CLI only writes matching si11 snapshot and rejects unsupported values, cross-stage destinations, foreign or symlink files before writes',()=>{
 const tmp=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch3-03-Isolated-20261020-cli-')),tool=path.join(root,'godot/tools/export_ch1_area_source.mjs');const cli=(out,stage='11',seed='20261020')=>spawnSync(process.execPath,[tool,root,out,'--stage',stage,'--seed',seed],{encoding:'utf8'});
 try{const out=path.join(tmp,'si11.json');assert.equal(cli(out).status,0);assert.deepEqual(JSON.parse(fs.readFileSync(out)),actual);const saved=fs.readFileSync(out);
  for(const stage of ['-1','2','3','5','9','12','13','011','11x'])assert.equal(cli(out,stage).status,1);
  for(const stage of [-1,2,3,5,9,12,13,'11',11.1])assert.throws(()=>buildAreaSnapshot(root,{stage}),/UNSUPPORTED_STAGE/);
  for(const seed of ['-1','NaN','Infinity','1.5','4294967296'])assert.equal(cli(out,'11',seed).status,1);
  for(const p of ['game.html','godot/data/map.json','godot/data/ch3_map_source/si10.json','godot/data/ch2_map_source/si4.json'])assert.equal(cli(path.join(root,p)).status,1);
  const foreign=path.join(tmp,'foreign.json');for(const v of [{schema:stored.schema,stage:10},{schema:'foreign',stage:11}]){fs.writeFileSync(foreign,JSON.stringify(v));const b=fs.readFileSync(foreign);assert.equal(cli(foreign).status,1);assert.deepEqual(fs.readFileSync(foreign),b);}
  const normal=path.join(tmp,'normal-link');fs.mkdirSync(normal);const link=outputSymlink(normal,out);assert.match(cli(link).stderr,/Symlink output rejected/);const target=path.join(tmp,'absent.json'),missing=path.join(tmp,'missing-link');fs.mkdirSync(missing);const dangling=outputSymlink(missing,target);assert.match(cli(dangling).stderr,/Symlink output rejected/);assert.equal(fs.existsSync(target),false);
  assert.deepEqual(fs.readFileSync(out),saved);assert.deepEqual(hashes(),before);
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
