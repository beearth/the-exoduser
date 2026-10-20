// CH1-05 stage2-only resource pipeline. Original source functions execute without body edits.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildAreaSnapshot,captureJSON} from './export_ch1_area_source.mjs';
import {rectangles} from './export_ch1_area_resources.mjs';
export function buildStage2Resources(root,{observePhases=true}={}){
root=fs.realpathSync(root);
const raw=buildAreaSnapshot(root,{stage:2});const source=fs.readFileSync(root+'/game.html','utf8'),{parseExpressionAt}=createRequire(root+'/package.json')('acorn');
const symbols={};const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function record(n,a,b){symbols[n]={file:'game.html',line:source.slice(0,a).split('\n').length,end:source.slice(0,b).split('\n').length,sha256:sha(source.slice(a,b))};return source.slice(a,b);}
function expr(n,k){const m=new RegExp('(?:const|var|let)\\s+'+n+'\\s*=').exec(source);let a=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(k!==undefined)a=a.properties.find(p=>String(p.key.value??p.key.name)===String(k)).value;return record(n+(k===undefined?'':'.'+k),a.start,a.end);}
function fn(n){const m=new RegExp('function\\s+'+n+'\\s*\\(').exec(source),a=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return record(n,a.start,a.end);}
const logs=[],math=Object.create(Math);math.random=()=>{throw Error('Unobserved global RNG dependency');};const c=vm.createContext({raw,Math:math,console:{log(...a){logs.push(a.join(' '));}}});const run=(x,opts={})=>vm.runInContext(x,c,{timeout:20000,...opts});
run('var T=40,G={stage:2,_isTileRLE:raw.source_state.is_tile_rle,mw:200,mh:200,map:Array.from({length:200},(_,i)=>raw.tiles.slice(i*200,i*200+200)),rooms:raw.rooms,spawnHoles:raw.spawn_holes_final,exits:raw.exits,bossGate:raw.boss_gate},MAP_OBJS=JSON.parse(JSON.stringify(raw.source_state.initial_map_objects)),SI_TO_HELL=raw.source_state.si_to_hell,SI_TO_FLOOR=raw.source_state.si_to_floor;');
run('const _MAP_COMPOSE={2:'+expr('_MAP_COMPOSE',2)+'};const _OBJ_META=JSON.parse(JSON.stringify(raw.initial_obj_meta)),_CH_DECO={0:raw.ch1_deco_raw};const DECO_FORCE_AUTO='+expr('DECO_FORCE_AUTO')+',_SAME_TYPE_DIST='+expr('_SAME_TYPE_DIST')+';');
const merge=source.match(/_OBJ_META\[d.id\]=Object.assign\(_prev,[^\n]+/);run('for(const d of _CH_DECO[0]){const _prev=_OBJ_META[d.id]||{};'+record('metadata.merge',merge.index,merge.index+merge[0].length)+'}');
const postStart=source.indexOf('{const _dsOccFoot=');run(record('metadata.occ_foot',postStart,source.indexOf(';}\n',postStart)+2));
for(const n of ['_tseed','mkRng','dst','_nearbyTypeCount','initMapObjects','_appendRotatedColParts','_rebuildColObjs','_ensureColObjs','_ch1HillRampAt','_ch1HillBandBlocks','isW','canMv','hasLOS','_soilEdgeA']){const text=fn(n);run(text,{filename:'game.html',lineOffset:symbols[n].line-1});}
run('const _RETIRED_MAP_OBJECT_TYPES='+expr('_RETIRED_MAP_OBJECT_TYPES')+';const _CH1_HILL='+expr('_CH1_HILL')+';const _FDG_RUINED_FOREST_FIRST=false,MAP_ALL_FLOOR=false;var _colObjs=[],_colObjsSrc=null,_colObjsN=-1,_colScaleLogged=false;');
if(observePhases)run(`var observed_pushes=[];const native_push=Array.prototype.push;Array.prototype.push=function(...args){if(this===MAP_OBJS){for(const item of args){native_push.call(observed_pushes,{object:JSON.parse(JSON.stringify(item)),stack:new Error().stack});}}return Reflect.apply(native_push,this,args);};initMapObjects();Array.prototype.push=native_push;`);
else run('var observed_pushes=[];initMapObjects();');
const objects=captureJSON(run('Array.from(MAP_OBJS)'));const pushes=captureJSON(run('observed_pushes'));
run('_ensureColObjs();');const undef=[];const meta=captureJSON(run('Object.fromEntries(MAP_OBJS.map(o=>[o.type,_OBJ_META[o.type]]))'),undef);const retired=captureJSON(run('Array.from(_RETIRED_MAP_OBJECT_TYPES)'));
const payload=JSON.stringify(objects);

const currentMain=execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024});
if(sha(currentMain)!==raw.source.game_sha256)throw Error('Latest main source bytes differ');
const phaseLines={25999:'large',26032:'landmark',26055:'mega',26151:'unique',26188:'provided_floor',26323:'scatter',26364:'normal',26450:'editor'};
const phasePushes=pushes.map(p=>{const lines=[...p.stack.matchAll(/game.html:(\d+):/g)].map(m=>Number(m[1]));const line=lines.find(n=>phaseLines[n]);if(!line)throw Error('Unclassified source push '+p.stack);return {phase:phaseLines[line],source_line:line,object:p.object};});
const phaseCounts=Object.fromEntries(Object.values(phaseLines).map(p=>[p,phasePushes.filter(x=>x.phase===p).length]));
const assets=[],bySource=new Map(),destinations=new Map();
function asset(src){src=src.split('?')[0];if(bySource.has(src))return bySource.get(src);
 const bytes=fs.readFileSync(path.join(root,src));if(bytes.toString('ascii',1,4)!=='PNG')throw Error('Only original PNG assets admitted: '+src);
 const basename=path.basename(src);if(destinations.has(basename)&&destinations.get(basename)!==src)throw Error('Asset name collision');destinations.set(basename,src);
 const a={source:src,texture:'res://assets/map/ch1_si2/'+basename,size:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)],bytes:bytes.length,sha256:sha(bytes)};assets.push(a);bySource.set(src,a);return a;
}
const gt=run('('+expr('_GT_FILES')+')'),floor=asset(gt.gt_soil);
const eyeMatch=/_floorEyeImg.src\s*=\s*'([^']+)'/.exec(source);if(!eyeMatch)throw Error('Floor eye path missing');record('floor_eye.path',eyeMatch.index,eyeMatch.index+eyeMatch[0].length);
const defs=Object.fromEntries(raw.ch1_deco_raw.map(d=>[d.id,d])),retiredSet=new Set(retired);
const props=objects.map((o,index)=>{
 const base={...o,source_index:index};if(retiredSet.has(o.type))return {...base,view:'retired',retired:true};
 if(o.type==='boss_gate_col')return {...base,view:'invisible_system_collider',retired:false};
 if(['lore','breakable'].includes(o.type))return {...base,view:'native_'+o.type+'_marker',interaction_bound:false,retired:false};
 const m=meta[o.type],d=defs[o.type];if(!m||!d)throw Error('Missing live metadata '+o.type);
 const src='assets/map/ch1/'+(d.dir||'floor_objects')+'/'+d.file;
 const eye=['m_eye','m_eye1','m_eye2'].includes(o.type);
 const a=asset(eye?eyeMatch[1]:src),[w,h]=a.size,s=(m.sz||32)*(o.scale||1);
 if(m.filter||m.edgeErase||m.blend||m.srcRect||m.anim||m.rotTree||m.sheet||m.touchAnim||m.trackEye)throw Error('Unported live texture branch '+o.type);
 let dw=s,dh=s,rotation=0,flip=false,branch='square',pivot=[.5,.5];
 // Preserve real renderer order (game52392..52449), including rot-before-keepAR.
 if(m.flip&&!m.keepAR){flip=true;branch='square_flip';}
 else if(m.rot&&m.rot!==180&&m.rot!==270){rotation=m.rot;branch='square_rotation';}
 else if(eye){branch='floor_eye';}
 else if(m.keepAR){const ar=w/h;dw=m.squareDraw?s:s*(ar<1?ar:1);dh=m.squareDraw?s:s*(ar>1?1/ar:1);const moRot=((o.rot||0)%360+360)%360;if(moRot||m.pivotX!=null||m.pivotY!=null){rotation=moRot;pivot=[m.pivotX??.5,m.pivotY??.5];}else if(m.flip)flip=true;branch='keepAR';}
 return {...base,view:'sprite',retired:false,metadata:m,registered_source:src,texture:a.texture,draw_size:[dw,dh],pivot,rotation,flip_h:flip,anchor_bottom:branch==='keepAR'&&!!m.anchorBottom,render_branch:branch,hard_alpha:!!d.hardAlpha,magenta_key:!!d.mega&&!d.hardAlpha,...(eye?{atlas:{cell:[40,40],frames:9,frame_map:[3,4,5,6,7,8,1,2]}}:{})};
});
function f64(values){const b=Buffer.alloc(values.length*8);values.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b.toString('base64');}
const colliders=captureJSON(run(`_colObjs.map(o=>{const m=_OBJ_META[o.type];return {id:o.type,shape:o._colRect?'rect':o._colW?'ellipse':'circle',x:o.x,y:o.y,rx:o._colW||o._colSz,ry:o._colW?o._colH:o._colSz,oy:o._colW?(m.colOy||0):0,rotation:o._colRot||0};})`));
for(const c of colliders)c.f64=f64([c.x,c.y,c.rx,c.ry,c.oy,c.rotation]);
const queries=[];let seed=505202610;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
function query(x,y,r=12){c.x=x;c.y=y;c.r=r;queries.push({x,y,r,f64:f64([x,y,r]),wall:run('isW(x,y)'),move:run('canMv(x,y,r)')});}
for(let i=0;i<6000;i++)query(rand()*8160-80,rand()*8160-80);
for(const o of colliders)for(let i=0;i<16;i++){const t=i*Math.PI/8;for(const d of [.9999,1,1.0001])query(o.x+o.rx*Math.cos(t)*d,o.y+o.oy+o.ry*Math.sin(t)*d);}
for(const p of [[-40,0],[-.1,20],[0,0],[8000,8000],raw.start_world,raw.exit_center_tile.map(v=>(v+.5)*40)])query(...p);
const los=[];for(let i=0;i<400;i++){const a=[rand()*8000,rand()*8000,rand()*8000,rand()*8000];c.q=a;los.push({points:a,f64:f64(a),clear:run('hasLOS(...q)')});}
const alpha=captureJSON(run('G.map.flatMap((row,y)=>row.map((v,x)=>(v===0||v===4||v===2)?Math.round(_soilEdgeA(x,y,200,200,G.map)*255):0))'));
const bundle={schema:'exoduser.ch1-area-resources.v1',stage:2,source:{main_sha:raw.source.main_sha,game_sha256:raw.source.game_sha256,source_snapshot_tile_sha256:raw.runtime_tile_sha256,symbols,init_log:logs,initial_map_objects:raw.source_state.initial_map_objects,global_random_draws:0},
 raw_objects:objects,object_payload:payload,object_sha256:sha(payload),phase_pushes:phasePushes,phase_counts:phaseCounts,retired_types:retired,
 composition_raw:raw.composition_raw,assets,floor:{...floor,tile_size:floor.size[0],alpha,alpha_sha256:sha(Buffer.from(alpha)),mode:'native world-space floor + original edge alpha'},vista:null,
 props,colliders,wall_rects:rectangles(raw.tiles,v=>v===1),scope:{standalone:true,main_bound:false,real_player_bound:false,spawn_holes_bound:false,region_progress_bound:false,transition_bound:false,source_assets_edited:0,metadata_undefined_paths:undef,stage0_hill:false,stage0_baked_chunks:0,analytic_collision:true,physical_prop_shapes:false,observation_seed:20261020,original_init_executed:true,unmodified_functions:true}};
return {bundle,raw,queries,los};
}
export function writeStage2Resources(root,evidencePath){
 const result=buildStage2Resources(root);fs.writeFileSync(path.join(root,'godot/data/ch1_map_source/si2_resources.json'),JSON.stringify(result.bundle)+'\n');
 for(const a of result.bundle.assets){const dest=path.join(root,'godot',a.texture.slice(6));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.source),dest);}
 fs.writeFileSync(evidencePath,JSON.stringify({stage:2,object_sha256:result.bundle.object_sha256,queries:result.queries,los:result.los})+'\n');return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==4)throw Error('Usage: export_ch1_stage2_resources.mjs <root> <external-oracle-json>');const root=fs.realpathSync(process.argv[2]),out=path.resolve(process.argv[3]);if(!path.relative(root,out).startsWith('..'+path.sep)||path.extname(out)!=='.json')throw Error('Oracle must be external JSON');const r=writeStage2Resources(root,out);console.log(JSON.stringify({stage:2,objects:r.bundle.raw_objects.length,object_sha256:r.bundle.object_sha256,phases:r.bundle.phase_counts,assets:r.bundle.assets.length,colliders:r.bundle.colliders.length,wall_rects:r.bundle.wall_rects.length,queries:r.queries.length,los:r.los.length}));}catch(e){console.error(e.stack);process.exitCode=1;}
}
