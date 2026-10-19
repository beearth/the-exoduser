// Export the approved CH1-1 native template. No browser boot, source or save writes.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const sourceRoot=process.argv[2]||'/Users/fordeargamers/Projects/exoduser-migration-20261001';
const outRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=process.argv[3]||'/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/world';
const require=createRequire(path.join(sourceRoot,'package.json'));
const acorn=require('acorn');
const source=fs.readFileSync(path.join(sourceRoot,'game.html'),'utf8');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const records=[];
const context=vm.createContext({console:{log(){},warn(){}},Math:Object.create(Math),Uint8Array,Uint16Array,Int32Array,Set,Map});
// This seed fixes the native factory's permitted random choices for this exported instance.
let seed=20261013;context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function expression(name){
  const match=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);
  if(!match)throw new Error('Missing native expression '+name);
  const start=match.index+match[0].length,node=acorn.parseExpressionAt(source,start,{ecmaVersion:'latest'});
  return {node,start,text:source.slice(node.start,node.end)};
}
function property(name,key){const e=expression(name),p=e.node.properties.find(p=>String(p.key.value??p.key.name)===String(key));if(!p)throw new Error(name+'.'+key);return source.slice(p.value.start,p.value.end);}
function nativeFunction(name){
  const match=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);if(!match)throw new Error('Missing '+name);
  const n=acorn.parseExpressionAt(source,match.index,{ecmaVersion:'latest'});
  records.push({function:name,line:source.slice(0,match.index).split('\n').length,sha256:digest(source.slice(n.start,n.end))});
  return source.slice(n.start,n.end);
}
function evaluate(text){return vm.runInContext(text,context,{timeout:5000});}
const maps=fs.readFileSync(path.join(sourceRoot,'maps_data.js'),'utf8');
evaluate(maps+';globalThis.nativeTemplate=JSON.parse(JSON.stringify(FIXED_MAPS[0]));');
const layoutText=fs.readFileSync(path.join(sourceRoot,'assets/map/ch1/production_finish/layout.js'),'utf8');evaluate(layoutText);
evaluate('var G={stage:0,_zones:null},MAP_OBJS=[],T=40,SI_TO_HELL=[0],MAP_ALL_FLOOR=false,_DIABLO_FIELD_QA=false;var _MAP_COMPOSE={0:'+property('_MAP_COMPOSE',0)+'};');
for(const name of ['_tCarveCircle','_tCarveEllipse','_tCarveRect','_tCarveCross','_tCarveCorridor','_tCaveSmooth','_tBossDistMap','_tseed','_applyCh1StartNorthGate','_applyHellWinterNorthGate','genFromTemplate'])evaluate(nativeFunction(name));
// These consumers calculate encounter counts/exit caches only; they do not touch tile geometry.
evaluate('function _spawnHoleCount(){return 0} function _cacheExitCenter(){}');
evaluate('nativeTemplate.tileRLE=CH1_1_PRODUCTION.buildRLE(200,200);for(const h of nativeTemplate.spawnHoles)if(h.x===70&&h.y===170){h.x=74;h.y=168;}genFromTemplate(nativeTemplate,0);');
const generated=evaluate('JSON.parse(JSON.stringify({tiles:G.map,rooms:G.rooms,exits:G.exits,gate:G.bossGate,props:_MAP_COMPOSE[0].handProps,layout:{boundary:CH1_1_PRODUCTION.boundary,regions:CH1_1_PRODUCTION.regions},template:nativeTemplate}))');
if(generated.tiles.length!==200||generated.tiles.some(r=>r.length!==200))throw new Error('Native geometry incomplete');
const tiles=generated.tiles.flat();
const wallRects=[];
// Merge identical horizontal runs vertically, preserving every native wall tile exactly.
let active=new Map();
for(let y=0;y<200;y++){
  const next=new Map();let x=0;
  while(x<200){if(tiles[y*200+x]!==1){x++;continue;}const start=x;while(x<200&&tiles[y*200+x]===1)x++;const key=start+':'+x;
    let rect=active.get(key);if(rect)rect[3]+=40;else{rect=[start*40,y*40,(x-start)*40,40];wallRects.push(rect);}next.set(key,rect);}
  active=next;
}
const meta=evaluate('('+expression('_OBJ_META').text+')');
const deco=evaluate('('+property('_CH_DECO',0)+')');
const spritePaths=evaluate('var _FO="assets/map/ch1/floor_objects/",_CO="assets/map/ch1/collision/";('+expression('_OBJ_SPR_MAP').text+')');
for(const d of deco){meta[d.id]={...(meta[d.id]||{}),...d};spritePaths[d.id]='assets/map/ch1/'+(d.dir||'floor_objects')+'/'+d.file;}
const copied=[];
function copy(sourceRelative,destinationRelative){
  const from=path.join(sourceRoot,sourceRelative),to=path.join(outRoot,destinationRelative),bytes=fs.readFileSync(from);
  if(fs.existsSync(to)&&digest(fs.readFileSync(to))!==digest(bytes)){
    const backup=path.join(evidence,'backup',destinationRelative);fs.mkdirSync(path.dirname(backup),{recursive:true});fs.copyFileSync(to,backup);
  }
  fs.mkdirSync(path.dirname(to),{recursive:true});fs.writeFileSync(to,bytes);
  copied.push({source:from,destination:to,bytes:bytes.length,sha256:digest(bytes)});return 'res://'+destinationRelative;
}
function imageSize(relative){const b=fs.readFileSync(path.join(sourceRoot,relative));if(b.toString('ascii',1,4)!=='PNG')throw new Error('PNG expected '+relative);return [b.readUInt32BE(16),b.readUInt32BE(20)];}
const chunks=[];for(let y=0;y<8;y++)for(let x=0;x<8;x++){const relative='assets/map/ch1/production_finish/chunk_'+x+'_'+y+'.png';chunks.push({x,y,texture:copy(relative,'assets/map/production_finish/chunk_'+x+'_'+y+'.png'),source_rect:[1,1,1024,1024],world_rect:[x*1000,y*1000,1000,1000]});}
const sourcePathCache=new Map(),props=[],colliders=[];
function nearFloor(x,y){if(tiles[y*200+x]===0||tiles[y*200+x]===4)return[x,y];for(let r=1;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<200&&yy<200&&(tiles[yy*200+xx]===0||tiles[yy*200+xx]===4))return[xx,yy];}throw new Error('No native floor for authored prop');}
for(const h of generated.props){
  const m=meta[h.id];if(!m)throw new Error('Missing native prop meta '+h.id);
  const relative=spritePaths[h.id];if(!relative)throw new Error('Missing native image '+h.id);
  let texture=sourcePathCache.get(relative);if(!texture){texture=copy(relative,'assets/map/props/'+path.basename(relative));sourcePathCache.set(relative,texture);}
  const at=nearFloor(h.x|0,h.y|0),scale=h.scale||1,sz=(m.sz||64)*scale,[iw,ih]=m.sourceSize||imageSize(relative),ar=iw/ih;
  let dw=m.keepAR&&!m.squareDraw?sz*(ar<1?ar:1):sz,dh=m.keepAR&&!m.squareDraw?sz*(ar>1?1/ar:1):sz;
  let pivot=[m.pivotX??.5,m.pivotY??.5];if(h.id==='m_c1tree'){dw*=.72;dh*=.72;pivot=[.5,.72];}
  const p={id:h.id,position:[(at[0]+.5)*40,(at[1]+.5)*40],authored_tile:[h.x,h.y],texture,draw_size:[dw,dh],pivot,rotation_degrees:h.rot||0,flip_h:!!m.flip,alpha:m.alpha??1,ground:!!m.ground||!!m.renderLayer&&m.renderLayer<0,metadata:m};props.push(p);
  if(m.collision||m.col){const rx=(m.colW||0)*scale,ry=(m.colH||m.colW||0)*scale;colliders.push({id:h.id,position:[p.position[0],p.position[1]+(m.colOy||0)],kind:rx?'ellipse':'circle',radii:rx?[rx,ry]:[(m.colSz||(m.sz||64)*.4)*scale,(m.colSz||(m.sz||64)*.4)*scale]});}
}
const hill=evaluate('('+expression('_CH1_HILL').text+')');
const start=[4020,7420],exit=[4020,300],factorySeed=seed;
const nativeSpeed=Math.max(.2,.14*1.3);const random=()=>context.Math.random();
const speed=(nativeSpeed+random()*.08)*1.5,radius=(16+random()*2)*2;
const hp=Math.floor((.4+199+100)*2.925),attack=Math.floor((50+1.95)*.6);
const enemy={id:'ch1_start_eye_mass_01',name:'다안 육괴',etype:4,element:'dark',stage:0,level:1,difficulty:'NORMAL',spawn_position:[3500,6700],native_start_offset:[-13,-18],hp,attack,radius,speed_pixels_per_tick:speed,native_tick_rate:60,poise:hp,poise_regen_ticks:200,poise_regen_fraction:.15,initial_idle_ticks:30+random()*50,aggro_range:800,pursuit_stop_distance:30,idle_movement_multiplier:1.6,contact_extra_radius:8,contact_damage_multiplier:.8,contact_cooldown_min_ticks:40,contact_cooldown_random_ticks:20,hit_stun_ticks:8,projectile_cooldown_ticks:240,initial_projectile_ticks:180+random()*120,projectile_charge_ticks:60,projectile_range:400,windup_ticks:null,attack_ticks:8,recovery_ticks:35,animation:{texture:copy('img/ch1_1_eye_slime_8dir_4frame_clean.png','assets/enemy/ch1_1_eye_slime_8dir_4frame_clean.png'),columns:4,rows:8,cell_size:[256,256],native_direction_rows:[2,3,4,5,6,7,0,1],idle_column:0,attack_column:1,walk_columns:[2,3],walk_frame_ms:120,draw_height:Math.max(240,radius*7),native_pivot:[.5,.5]},scope:{canonical_authored_pair_count:2,ported_instances:1,attack_tickets:false,forced_single_hit:false,revival:false,full_native_enemy_system:false},factory_random_seed:factorySeed};
enemy.projectile={element:'dark',parry_class:'magic',native_birth_position:'actor-center',base_damage:attack*2,contact_damage:Math.floor(attack*2*1.3),size:3.2,contact_margin:13.6,life_ticks:120,life_decay_per_tick:.667,speed_pixels_per_second:[500,600],homing_radians_per_tick:.00655,homing_until_life:30};
const map={schema:'exoduser.godot.ch1-native-first.v1',stage:0,name:'CH1-1 썩은 숲',width:200,height:200,tile_size:40,world_size:[8000,8000],start_position:start,exit_position:exit,tiles,collision_rects:wallRects,prop_colliders:colliders,hill,props,chunks,rooms:generated.rooms,exits:generated.exits,boss_gate:generated.gate,boundary:generated.layout.boundary,regions:generated.layout.regions,source:{root:sourceRoot,game_sha256:digest(source),layout_sha256:digest(layoutText),maps_data_sha256:digest(maps),native_tile_sha256:digest(Buffer.from(tiles)),native_generation:'CH1_1_PRODUCTION.buildRLE → unmodified genFromTemplate',deterministic_seed:20261013,geometry_edits:0,source_png_edits:0,save_access:0},scope:{enemy_instances:1,full_encounter_system:false,boss_gate_progression:false,exit_is_destination_only:true,render_dynamic_living_modules:false,physical_polygon_segments:128,analytic_collision_query:true,physics_full_parity:false}};
fs.mkdirSync(path.join(outRoot,'data'),{recursive:true});fs.mkdirSync(evidence,{recursive:true});
for(const [name,data]of [['map.json',map],['enemy.json',enemy]]){const destination=path.join(outRoot,'data',name);fs.writeFileSync(destination,JSON.stringify(data));}
fs.writeFileSync(path.join(evidence,'export-receipt.json'),JSON.stringify({source:map.source,functions:records,assets:copied,wall_rectangles:wallRects.length,prop_colliders:colliders.length,props:props.length,start,exit,enemy,limitations:['Ellipse/ramp analytic data preserved; Godot physics polygon discretization recorded by world.gd.','One canonical member of two authored medium monsters; no full stage encounter/boss/save port.','Original four-frame enemy sheet; no claim of 24 unique frames.']},null,2));
console.log(JSON.stringify({width:200,height:200,tiles:tiles.length,wallRects:wallRects.length,propColliders:colliders.length,props:props.length,chunks:chunks.length,start,exit,enemy:{hp,attack,speed,radius,position:enemy.spawn_position},nativeTileSHA:map.source.native_tile_sha256}));
