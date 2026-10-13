// Time-zero CH1-1 encounter extraction; original source functions execute in an isolated VM.
// Existing map.json geometry and enemy.json fixture are never rewritten by this exporter.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const sourceRoot=process.argv[2]||'/Users/fordeargamers/Projects/exoduser-migration-20261001';
const outRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=process.argv[3]||'/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/encounter-factory-next';
const initialSeed=Number(process.argv[4]||477069883)>>>0;
const acorn=createRequire(path.join(sourceRoot,'package.json'))('acorn');
const source=fs.readFileSync(path.join(sourceRoot,'game.html'),'utf8');
const sourceHashBefore=crypto.createHash('sha256').update(source).digest('hex');
const map=JSON.parse(fs.readFileSync(path.join(outRoot,'data/map.json'),'utf8'));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const lineAt=p=>source.slice(0,p).split('\n').length;
const functions=[],expressions=[],sections=[],randomDraws=[],calls=[],collisionQueries=[],assets=[];
let rngState=initialSeed,phase='setup';
const nativeMath=Object.create(Math);
nativeMath.random=()=>{
  const before=rngState;
  rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;
  const value=rngState/4294967296;
  randomDraws.push({index:randomDraws.length,phase,state_before:before,state_after:rngState,value});
  return value;
};
const context=vm.createContext({console:{log(){},warn(){}},Math:nativeMath,Set,Map,Uint8Array,Uint16Array,Int32Array});
const run=(text,lineOffset=0)=>vm.runInContext(text,context,{timeout:5000,lineOffset,filename:path.join(sourceRoot,'game.html')});
function expression(name){
  const match=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source)||new RegExp(',\\s*'+name+'\\s*=').exec(source);
  if(!match)throw new Error('Missing native expression '+name);
  const node=acorn.parseExpressionAt(source,match.index+match[0].length,{ecmaVersion:'latest'});
  const text=source.slice(node.start,node.end);
  expressions.push({name,line:lineAt(match.index),sha256:digest(text)});
  run('var '+name+'=('+text+');');
}
function nativeFunction(name){
  const match=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);
  if(!match)throw new Error('Missing native function '+name);
  const node=acorn.parseExpressionAt(source,match.index,{ecmaVersion:'latest'});
  const text=source.slice(node.start,node.end);
  functions.push({name,line:lineAt(node.start),sha256:digest(text)});
  run(text,lineAt(node.start)-1);return node;
}
function clone(value){return JSON.parse(JSON.stringify(value));}
context.recordFactory=(args,result,before,after,stack)=>{
  const caller=String(stack).split('\n').find(line=>/game\.html:(?:32185|32283|32298|32310):/.test(line))?.trim()||String(stack);
  calls.push({factory_order:calls.length,native_arguments:clone(args),native_call_site:caller,rng_begin:before,rng_end:after,native_factory:clone(result)});
};
context.rngIndex=()=>randomDraws.length;
context.recordCollision=(x,y,r,pass)=>collisionQueries.push({phase,x,y,r,pass,rng_index:randomDraws.length});
run('var window=globalThis,T=40,OPT={diff:5},P={x:4020,y:7420,lv:1,hp:350,mhp:350},ens=[],_useGPU=false,_useGL=false,_ESPRITES={},_skinSeqIdx=0;var G={stage:0,_stageDiffOff:0,_boneWalls:[],_gateGuard:null};var _colObjs=[],_colObjsSrc=null,_colObjsN=-1,_colScaleLogged=false;');
for(const name of ['EL','ELC','DIFF_MUL','DIFF_LV_OFF','ETYPE_HP','ETYPE_ATK','_ETYPE_SPD_RAW','ETYPE_SPD','ETYPE_R','ETYPE_POISE','ETYPE_ERES','ETYPE_COL','ETYPE_RANGE','RARE_ETYPE','TOTAL_STAGES','SI_TO_HELL','ELITE_TIERS','ELITE_PROB','MOD_DEFS','AURA_DEFS','HELL_SPAWN','HELL_EL','_RANGED_ET','_CH1_OPENING_EXCLUDED_ET','_MOB8_TOTAL','_MOB8_COLS','_CH1_START_MEDIUM_SPAWNS','_CH1_HILL','_OBJ_META','_RETIRED_MAP_OBJECT_TYPES','CHAPTER_STAGES','HELL_THEMES','HELL_BOSSES'])expression(name);
// STG[0] values consumed by the original factory/guardian branch, not a new balance table.
const stageTableStart=source.indexOf('const STG=[];'),stageTableEnd=source.indexOf('\nlet G=',stageTableStart);
if(stageTableStart<0||stageTableEnd<0)throw new Error('Native stage table builder missing');
const stageTable=source.slice(stageTableStart,stageTableEnd);
run(stageTable,lineAt(stageTableStart)-1);
sections.push({name:'factory-stage-table',line:lineAt(stageTableStart),end_line:lineAt(stageTableEnd),sha256:digest(stageTable)});
for(const name of ['_appendRotatedColParts','_rebuildColObjs','_ensureColObjs','_ch1HillRampAt','_ch1HillBandBlocks','isW','canMv','safePt','isRareEtype','rollElite','rollMods','rollAura','rollEtype','rollEl','_enemyHpPacing','_assignMobSkin','mkEn','_spawnCh1StartMediumEyeMasses'])nativeFunction(name);
const init=nativeFunction('initStage');
// Hydrate the already-exported complete geometry. No carving/generation/nav mutation or save access.
context.mapInput=clone(map);
run('G.map=Array.from({length:mapInput.height},(_,y)=>mapInput.tiles.slice(y*mapInput.width,(y+1)*mapInput.width));G.mw=mapInput.width;G.mh=mapInput.height;G.rooms=mapInput.rooms;G.bossGate=mapInput.boss_gate;G._bossCx=100;G._gateY=5;G._isTileRLE=true;P.x=mapInput.start_position[0];P.y=mapInput.start_position[1];var MAP_OBJS=[{type:"boss_gate_col",x:(G._bossCx+.5)*T,y:(G._gateY-1)*T}];');
// Canonical FIXED_MAPS[0].objs must contain only the skipped player_start marker at this phase.
run(fs.readFileSync(path.join(sourceRoot,'maps_data.js'),'utf8')+';globalThis.nativeInitialObjects=FIXED_MAPS[0].objs;');
const nonMarkerObjects=clone(context.nativeInitialObjects).filter(o=>!['player_start','boss_pos','exit','boss_gate','boss_exit','bonfire','lore','trap','altar','forge','floor_eye'].includes(o.id));
if(nonMarkerObjects.length)throw new Error('Initial native object hydration requires an explicit source consumer: '+JSON.stringify(nonMarkerObjects));
run('var nativeCanMv=canMv;canMv=function(x,y,r){const pass=nativeCanMv(x,y,r);recordCollision(x,y,r,pass);return pass};var nativeMkEn=mkEn;mkEn=function(...args){const before=rngIndex(),result=nativeMkEn(...args);recordFactory(args,result,before,rngIndex(),new Error().stack);return result};');
const statements=init.body.body;
const medium=statements.find(n=>source.slice(n.start,n.end).includes('if(si===0)_spawnCh1StartMediumEyeMasses(si)'));
const gate=statements.find(n=>n.type==='IfStatement'&&source.slice(n.test.start,n.test.end).includes('G.bossGate&&G.bossGate.length>0&&G._gateY!=null'));
if(!medium||!gate)throw new Error('Native initial encounter sections missing');
run('var si=0;');
for(const [name,node] of [['start-medium',medium],['gate-guardian-and-groups',gate]]){
  phase=name;const text=source.slice(node.start,node.end);
  const before=randomDraws.length;run(text,lineAt(node.start)-1);
  sections.push({name,line:lineAt(node.start),end_line:lineAt(node.end),sha256:digest(text),rng_begin:before,rng_end:randomDraws.length});
}
const final=run('ens.map(e=>e?JSON.parse(JSON.stringify(e)):null)');
if(final.some(e=>e===null))throw new Error('Native initial list contains null; preserve and resolve consumer contract before export');
const baseMeta=JSON.parse(fs.readFileSync(path.join(sourceRoot,'img/atlas_ch1_8dir.json'),'utf8'));
const walkMeta=JSON.parse(fs.readFileSync(path.join(sourceRoot,'img/atlas_ch1_8dir_walk.json'),'utf8'));
const assetRef=relative=>'res://assets/enemy/'+path.basename(relative);
const knownTypes=clone(run('HELL_SPAWN[0].filter(([et])=>!_CH1_OPENING_EXCLUDED_ET.has(et)).map(([et])=>et)'));
const elementNames=['physical','fire','ice','dark','lightning','holy','energy'];
function animation(e){
  if(e._ch1StartMedium)return {kind:'native-medium-sheet',texture:'res://assets/enemy/ch1_1_eye_slime_8dir_4frame_clean.png',columns:4,rows:8,cell_size:[256,256],native_direction_rows:[2,3,4,5,6,7,0,1],idle_column:0,attack_column:1,walk_columns:[2,3],walk_frame_ms:120,draw_height:Math.max(240,e.r*7),native_pivot:[.5,.5]};
  const entry=Object.entries(baseMeta.mobs).find(([,m])=>m.col===e._mob8Col&&m.row===e._mob8Row);
  if(!entry)throw new Error('Native assigned skin not in canonical atlas metadata');
  const [skin]=entry,walk=walkMeta.mobs[skin];
  return {kind:'native-ch1-eight-direction-atlas',skin,resources_copied:false,cell_size:[baseMeta.cell,baseMeta.cell],atlas_columns:baseMeta.cols,atlas_rows:baseMeta.rows,column:e._mob8Col,row:e._mob8Row,draw_height:Math.max(e.r*7,80),native_pivot:[.5,.5],base_textures:Object.fromEntries(baseMeta.directions.map(d=>[d,assetRef('img/atlas_ch1_8dir_'+d.replaceAll('-','_')+'.png')])),source_relative_base_textures:Object.fromEntries(baseMeta.directions.map(d=>[d,'img/atlas_ch1_8dir_'+d.replaceAll('-','_')+'.png'])),walk_supported:!!walk,walk_frames:walkMeta.framesPerMob,walk_pixels_per_frame:128,walk_textures:walk?Object.fromEntries(baseMeta.directions.map(d=>[d,assetRef('img/atlas_ch1_8dir_walk_'+d.replaceAll('-','_')+'.png')])):{}};
}
const records=final.map((e,order)=>{
  const call=calls[order];if(!call||!call.native_factory)throw new Error('Factory/final order mismatch');
  const group=e._ch1StartMedium?'start-medium':e._isGateGuard?'gate-guardian':call.native_call_site.includes(':32298:')?'gate-escort':'gate-wave';
  const medium=!!e._ch1StartMedium;
  const type4=e.etype===4;
  const record={id:medium?'ch1_start_eye_mass_'+String(order+1).padStart(2,'0'):'ch1_initial_'+String(order+1).padStart(3,'0'),order,spawn_group:group,name:medium?'다안 육괴':'native etype '+e.etype,stage:0,level:e.lv,difficulty:'NORMAL',etype:e.etype,element:elementNames[e.el],element_id:e.el,spawn_position:[e.x,e.y],requested_spawn_position:call.native_arguments.slice(0,2),hp:e.hp,attack:e.atk,radius:e.r,speed_pixels_per_tick:e.speed,native_tick_rate:60,poise:e.poise,max_poise:e.maxPoise,poise_regen_ticks:200,poise_regen_fraction:.15,initial_idle_ticks:e.st2,initial_projectile_ticks:e.projT,projectile_cooldown_ticks:e.projCd,initial_facing:e.facing,elite:e.elite,mods:e.mods,aura:e.aura,initial_spawn_fade_ticks:e._spawnT,initial_timers:Object.fromEntries(Object.entries(e).filter(([key,value])=>typeof value==='number'&&/(?:T|Cd|st2|poiseR)$/.test(key))),aggro_range:800,pursuit_stop_distance:30,idle_movement_multiplier:1.6,contact_extra_radius:8,contact_damage_multiplier:.8,contact_cooldown_min_ticks:40,contact_cooldown_random_ticks:20,hit_stun_ticks:8,projectile_charge_ticks:60,projectile_range:run('ETYPE_RANGE['+e.etype+']'),windup_ticks:null,attack_ticks:8,recovery_ticks:35,animation:animation(e),factory_random_seed:randomDraws[call.rng_begin]?.state_before??initialSeed,native_arguments:call.native_arguments,native_call_site:call.native_call_site,native_factory:call.native_factory,native_final:e,rng_begin:call.rng_begin,rng_end:call.rng_end,support:{native_type_known:knownTypes.includes(e.etype),runtime_supported:type4&&medium&&e.el===3,ai_profile:type4&&medium&&e.el===3?'native_medium_dark_v1':'not-ported',ai_family:type4?'existing-tank':'not-ported',reason:type4&&medium&&e.el===3?'Existing native medium-sheet / Tank / dark projectile consumer':'Preserved source record; type-specific AI, skin, element, elite/modifier support must be admitted explicitly',full_native_enemy_system:false}};
  record.runtime=record.support.runtime_supported?{...record,animation:record.animation,facing:e.facing,native_flags:{_ch1StartMedium:e._ch1StartMedium,_ch1StartMediumName:e._ch1StartMediumName,_firstShot:e._firstShot,_mob8dir:e._mob8dir,_mobCh:e._mobCh,_mob8Col:e._mob8Col,_mob8Row:e._mob8Row},projectile:{element:'dark',parry_class:'magic',native_birth_position:'actor-center',base_damage:e.atk*2,contact_damage:Math.floor(e.atk*2*1.3),size:3.2,contact_margin:13.6,life_ticks:120,life_decay_per_tick:.667,speed_pixels_per_second:[500,600],homing_radians_per_tick:.00655,homing_until_life:30}}:null;
  return record;
});
// Only type4 consumers need additional existing atlas PNGs; no raster generation or crop writes.
const type4Atlas=records.some(e=>e.support.runtime_supported&&!e.native_final._ch1StartMedium);
const relatives=type4Atlas?baseMeta.directions.flatMap(d=>['img/atlas_ch1_8dir_'+d.replaceAll('-','_')+'.png','img/atlas_ch1_8dir_walk_'+d.replaceAll('-','_')+'.png']):[];
fs.mkdirSync(evidence,{recursive:true});
const output=path.join(outRoot,'data/encounters.json');
if(fs.existsSync(output)){const backup=path.join(evidence,'backup','encounters-before-export.json');fs.mkdirSync(path.dirname(backup),{recursive:true});fs.copyFileSync(output,backup);}
for(const relative of relatives){const from=path.join(sourceRoot,relative),to=path.join(outRoot,'assets/enemy',path.basename(relative));if(fs.existsSync(to))throw new Error('Existing additional asset requires its own backup before overwrite: '+to);const bytes=fs.readFileSync(from);fs.mkdirSync(path.dirname(to),{recursive:true});fs.writeFileSync(to,bytes);assets.push({source:from,destination:to,bytes:bytes.length,sha256:digest(bytes)});}
const sourceHashAfter=digest(fs.readFileSync(path.join(sourceRoot,'game.html')));
if(sourceHashBefore!==sourceHashAfter)throw new Error('Native source changed during extraction; output not accepted');
const guardianCall=calls.find(c=>c.native_call_site.includes(':32283:'));
const escortCalls=calls.filter(c=>c.native_call_site.includes(':32298:'));
const initialGroupCounts={start_medium:2,gate_guardian:1,escort_candidates:4+Math.trunc(randomDraws[guardianCall.rng_end].value*3),escort_factory:escortCalls.length,wave_candidates:8+Math.trunc(randomDraws[escortCalls.at(-1).rng_end].value*5),wave_factory:records.filter(r=>r.spawn_group==='gate-wave').length,rejected_outer_candidates:collisionQueries.filter(q=>!q.pass).length};
const data={schema:'exoduser.godot.ch1-native-encounters.v1',stage:0,time_ticks:0,initial_count:records.length,record_count:records.length,records,source:{root:sourceRoot,game_bytes:Buffer.byteLength(source),game_sha256_before:sourceHashBefore,game_sha256_after:sourceHashAfter,source_stable:true,known_etypes:knownTypes,initial_group_counts:initialGroupCounts,map_generation_seed:20261013,encounter_seed:initialSeed,encounter_rng_end:rngState,random_draw_count:randomDraws.length,map_geometry_reused:true,geometry_edits:0,source_edits:0,source_png_edits:0,save_access:0,source_phase:'After canonical map generation; original initStage medium + complete guardian/escort/wave sections before frame update',initial_collision_phase:'Original boss_gate_col only; initMapObjects handProps occur later',vm_dependencies:{P:{lv:1,hp:350,mhp:350,x:map.start_position[0],y:map.start_position[1]},OPT:{diff:5},G:{stage:0,stageDiffOff:0,bossCx:100,gateY:5,isTileRLE:true},STG0:{monLv:100,be:run('STG[0].be')},graphics_warmup_disabled:true,clock_callbacks_dom_gpu:false},functions,expressions,sections},scope:{unsupported_types:records.filter(r=>!r.support.runtime_supported).map(r=>({id:r.id,etype:r.etype,element:r.element,reason:r.support.reason})),tile_rle_room_corridor_fill_skipped:true,spawn_holes_frame_update:false,field_boss_frame_update:false,boss_arena_entry:false,full_native_encounter_system:false,full_native_ai:false,current_human_app_unchanged:true}};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output+'.next',JSON.stringify(data));fs.renameSync(output+'.next',output);
fs.writeFileSync(path.join(evidence,'source-extraction-receipt.json'),JSON.stringify({schema:data.schema,source:data.source,initial_count:data.initial_count,orders:records.map(r=>({id:r.id,order:r.order,group:r.spawn_group,etype:r.etype,element:r.element,hp:r.hp,attack:r.attack,position:r.spawn_position,skin:r.animation.skin??r.animation.kind,support:r.support})),native_factory_calls:calls,collision_queries:collisionQueries,random_draws:randomDraws,assets,output:{path:output,bytes:fs.statSync(output).size,sha256:digest(fs.readFileSync(output))},limitations:['Deterministic encounter seed begins after map generation; not a replay of the whole browser boot RNG stream.','No update ticks, spawn-hole bursts, field bosses, arena bosses or revival are executed.','Unported types retain records and are not silently replaced or instantiated by this exporter.','Complete initial data is not a full gameplay, visual or performance acceptance.']},null,2));
console.log(JSON.stringify({initial_count:records.length,groups:records.reduce((a,r)=>(a[r.spawn_group]=(a[r.spawn_group]||0)+1,a),{}),type4_records:records.filter(r=>r.etype===4).map(r=>({id:r.id,element:r.element,medium:!!r.native_final._ch1StartMedium,support:r.support.runtime_supported})),random_draw_count:randomDraws.length,assets:assets.length,output}));
