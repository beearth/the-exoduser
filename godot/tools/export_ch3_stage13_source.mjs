// CH3-05: stage-local adapter over the admitted native VM. Shared files unchanged.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildAreaSnapshot,captureJSON} from './export_ch1_area_source.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export function buildStage13Snapshot(sourceRoot,{seed=20261020,observeNative}={}){
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff)throw Error('Invalid uint32 seed');
 if(observeNative!==undefined&&typeof observeNative!=='function')throw Error('Invalid native observer');
 const root=fs.realpathSync(sourceRoot),source=fs.readFileSync(path.join(root,'game.html'),'utf8');
 if(sha(source)!==sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024})))throw Error('Latest main source mismatch');
 const {parseExpressionAt}=createRequire(path.join(root,'package.json'))('acorn'),symbols={};
 const record=(name,n)=>{const text=source.slice(n.start,n.end);symbols[name]={file:'game.html',line:source.slice(0,n.start).split('\n').length,end:source.slice(0,n.end).split('\n').length,sha256:sha(text)};return text;};
 function expr(name,key){const m=new RegExp('(?:const|var|let)\\s+'+name+'\\s*=').exec(source);if(!m)throw Error('Missing '+name);let n=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(key!==undefined)n=n.properties.find(p=>String(p.key.value??p.key.name)===String(key))?.value;if(!n)throw Error('Missing '+name+'.'+key);return record(name+(key===undefined?'':'.'+key),n);}
 let target,run,draws=0,state=seed;const undefinedPaths=[];
 // Bootstrap only supplies original declarations/functions. Reset ALL target
 // generator inputs and the dedicated observation RNG before selecting si13.
 const bootstrap=buildAreaSnapshot(root,{stage:11,seed,observeNative:evaluate=>{
  run=evaluate;
  // The native VM already uses this exact seeded Math.random observation policy.
  // Install the target observation policy through a dedicated VM function.
  run('globalThis.stage13ResetSeed='+seed+';');
  run('var stage13RandomState=stage13ResetSeed,stage13RandomDraws=0;Math.random=()=>{stage13RandomDraws++;stage13RandomState=(Math.imul(stage13RandomState,1664525)+1013904223)>>>0;return stage13RandomState/4294967296;};');
  run('const _ICE13='+expr('_ICE13')+';_MAP_COMPOSE[13]='+expr('_MAP_COMPOSE',13)+';');
  run('G={stage:13,_zones:null};MAP_OBJS=[];P={};_exitCX=0;_exitCY=0;globalThis.stage13Template=_getFixedMapForStage(13);genFromTemplate(stage13Template,13);');
  const at=source.indexOf('const st=G.rooms.find',source.indexOf('function initStage('));
  const match=/P\.x=\(_spX\+\.5\)\*T;P\.y=\(_spY\+\.5\)\*T;/.exec(source.slice(at));
  if(at<0||!match)throw Error('Missing native START block');
  run('{'+source.slice(at,at+match.index+match[0].length)+'}');run('_regionInit(13);');
  target=captureJSON(run(`({tiles:G.map.flat(),rooms:G.rooms,exits:G.exits,boss_gate:G.bossGate,
   start_tile:[P.x/T-.5,P.y/T-.5],start_world:[P.x,P.y],hand_props_raw:_MAP_COMPOSE[13].handProps,
   region_details:G._regions,spawn_holes_final:G.spawnHoles.map(h=>({...h,count:_spawnHoleCount(h.size,13)})),
   total_spawned:G._totalSpawned,exit_center_tile:[_exitCX,_exitCY],
   source_floor:{editor_tile_rle:stage13Template.tileRLE},compose_raw:_MAP_COMPOSE[13],
   selector_evidence:{dungeon_spec:_DUNGEON_SPEC[13],is_dungeon:_isDungeonMap(13),is_face:_isFaceMap(13),base_present:!!FIXED_MAPS[0],selected_size:[stage13Template.mw,stage13Template.mh]},
   stage_descriptor:STG[13],guard_evidence:{candidate_tile:[G._bossCx,G._gateY+3],actual_tile:G.map[G._gateY+3][G._bossCx],required_tile:0,predicate_met:G.map[G._gateY+3][G._bossCx]===0}})`),undefinedPaths);
  // Observe the separate arena in the original VM; never replace the field.
  const fm=/function\s+genBossArena\s*\(/.exec(source);
  if(!fm)throw Error('Missing genBossArena');
  const arenaNode=parseExpressionAt(source,fm.index,{ecmaVersion:'latest'});
  run(record('genBossArena',arenaNode));run('var stage13Arena=genBossArena(13);');
  const openStart=source.indexOf('if(G._bossArena&&G._bossArenaExit){',source.indexOf('function genBossArena'));
  const openEnd=source.indexOf('        buildMapCache();',openStart);
  if(openStart<0||openEnd<0)throw Error('Missing arena exit geometry');
  const opening=source.slice(openStart,openEnd)+'}';
  symbols.arena_exit_open_geometry={file:'game.html',line:source.slice(0,openStart).split('\n').length,end:source.slice(0,openEnd).split('\n').length,sha256:sha(source.slice(openStart,openEnd))};
  target.boss_arena_source=captureJSON(run('({width:stage13Arena.mw,height:stage13Arena.mh,rooms:stage13Arena.rooms,entry:[stage13Arena.entryX,stage13Arena.entryY],boss:[stage13Arena.bossX,stage13Arena.bossY],exit:[stage13Arena.exitX,stage13Arena.exitY],tiles_before:stage13Arena.map.flat()})'));
  // Only the original geometry branch is observed. Kill/factory/cache/VFX owners
  // are deliberately not invoked or claimed; restore field G immediately.
  run('{const field=G;try{G={map:stage13Arena.map,mw:stage13Arena.mw,mh:stage13Arena.mh,_bossArena:true,_bossArenaExit:{x:stage13Arena.exitX,y:stage13Arena.exitY},exits:[]};'+opening+'stage13Arena.openedExits=G.exits;}finally{G=field;}}');
  target.boss_arena_source.tiles_after=captureJSON(run('stage13Arena.map.flat()'));
  target.boss_arena_source.opened_exits=captureJSON(run('stage13Arena.openedExits'));
  target.boss_arena_source.before_sha256=sha(Buffer.from(target.boss_arena_source.tiles_before));
  target.boss_arena_source.after_sha256=sha(Buffer.from(target.boss_arena_source.tiles_after));
  target.boss_arena_source.scope='original arena + isolated exit geometry only; no boss kill, transition or product binding';
  draws=run('stage13RandomDraws');state=run('stage13RandomState');
  // Independent arithmetic cross-check of the target observation policy.
  let verify=seed;for(let i=0;i<draws;i++)verify=(Math.imul(verify,1664525)+1013904223)>>>0;
  if(state!==verify)throw Error('Target RNG observation mismatch');
 }});
 if(target.tiles.length!==40000)throw Error('Incomplete target native grid');
 const ids=new Set(target.hand_props_raw.map(h=>h.id)),chapterIds=new Set(bootstrap.ch3_deco_raw.map(d=>d.id));
 const cross=captureJSON(run('('+expr('_CH_DECO',0)+')')).filter(d=>ids.has(d.id)&&!chapterIds.has(d.id));
 if(cross.length)throw Error('Unadmitted cross-chapter si13 assets');
 target.source_floor.editor_tile_rle_sha256=sha(JSON.stringify(target.source_floor.editor_tile_rle));
 const snapshot={...bootstrap,stage:13,source:{...bootstrap.source,selection:'default empty URL → _getFixedMapForStage(13) → _cloneField11(13) → genFromTemplate',symbols:{...bootstrap.source.symbols,...symbols}},
  ...target,cross_deco_raw:cross,runtime_tile_sha256:sha(Buffer.from(target.tiles)),region_totals:target.region_details.map(r=>r.total),undefined_paths:undefinedPaths,
  generation:{...bootstrap.generation,seed,random_draws:draws,random_final_state:state},
  pipeline:{bootstrap_stage:11,target_stage:13,bootstrap_result_used_as_target:false,target_inputs_and_rng_reset:true,shared_files_edited:0}};
 if(observeNative)observeNative(run);
 return snapshot;
}
export function writeStage13Snapshot(root,output,{seed=20261020}={}){
 root=fs.realpathSync(root);output=path.resolve(output);
 const relative=path.relative(root,output);
 if(!relative.startsWith('..'+path.sep)&&relative!=='godot/data/ch3_map_source/si13.json')throw Error('Only matching si13 snapshot inside source root');
 for(let p=output;p!==path.dirname(p);p=path.dirname(p))if(fs.lstatSync(p,{throwIfNoEntry:false})?.isSymbolicLink())throw Error('Symlink output rejected');
 if(path.extname(output)!=='.json')throw Error('JSON output required');
 if(fs.existsSync(output)){const old=JSON.parse(fs.readFileSync(output,'utf8'));if(old.schema!=='exoduser.ch3-area-source.v1'||old.stage!==13)throw Error('Existing foreign output rejected');}
 const raw=buildStage13Snapshot(root,{seed});fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(raw)+'\n','utf8');return raw;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const args=process.argv.slice(2);if(args.length!==2&&!(args.length===4&&args[2]==='--seed'&&/^\d+$/.test(args[3])))throw Error('Usage: export_ch3_stage13_source.mjs <root> <json> [--seed uint32]');const r=writeStage13Snapshot(args[0],args[1],{seed:args.length===4?Number(args[3]):20261020});console.log(JSON.stringify({stage:r.stage,hands:r.hand_props_raw.length,holes:r.spawn_holes_final.length,total:r.total_spawned,regions:r.region_totals,draws:r.generation.random_draws,tile_sha256:r.runtime_tile_sha256}));}catch(e){console.error(e.stack);process.exitCode=1;}
}
