import SNAPSHOT from '../source_snapshot/snapshot.cjs';
// CH1-04: isolated si1 resources from latest source; never promotes map.json or stage0 assets.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildAreaSnapshot,captureJSON} from './export_ch1_area_source.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
export function rectangles(tiles,accept){
 const out=[],active=new Map();
 for(let y=0;y<200;y++){
  const next=new Map();
  for(let x=0;x<200;){if(!accept(tiles[y*200+x])){x++;continue;}const start=x;while(x<200&&accept(tiles[y*200+x]))x++;
   const key=start+':'+(x-start),prev=active.get(key);
   if(prev){prev[3]++;next.set(key,prev);}else{const r=[start,y,x-start,1];out.push(r);next.set(key,r);}
  }active.clear();for(const [k,r] of next)active.set(k,r);
 }return out;
}
export function buildResources(root){
 root=fs.realpathSync(root);const raw=buildAreaSnapshot(root,{stage:1,seed:20261020});
 const source=SNAPSHOT.readBytes().toString('utf8');
 const mainGame=SNAPSHOT.readBytes();
 if(sha(mainGame)!==sha(source))throw new Error('Source snapshot mismatch');
 const {parseExpressionAt}=createRequire(path.join(root,'package.json'))('acorn'),symbols={};
 function record(n,a,b){symbols[n]={file:'game.html',line:source.slice(0,a).split('\n').length,end:source.slice(0,b).split('\n').length,sha256:sha(source.slice(a,b))};return source.slice(a,b);}
 function expr(n,k){const m=new RegExp('(?:const|var|let)\\s+'+n+'\\s*=').exec(source);if(!m)throw Error('Missing '+n);let a=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});if(k!==undefined)a=a.properties.find(p=>String(p.key.value??p.key.name)===String(k)).value;return record(n+(k===undefined?'':'.'+k),a.start,a.end);}
 function fn(n){const m=new RegExp('function\\s+'+n+'\\s*\\(').exec(source);if(!m)throw Error('Missing '+n);const a=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return record(n,a.start,a.end);}
 const logs=[],math=Object.create(Math);math.random=()=>{throw Error('Unexpected unseeded RNG in stage1 initMapObjects');};
 const c=vm.createContext({raw,Math:math,console:{log(...a){logs.push(a.join(' '));}}});const run=x=>vm.runInContext(x,c,{timeout:20000});
 run('var T=40,G={stage:1,mw:200,mh:200,map:Array.from({length:200},(_,i)=>raw.tiles.slice(i*200,i*200+200)),rooms:raw.rooms,spawnHoles:raw.spawn_holes_final,exits:raw.exits,bossGate:raw.boss_gate},MAP_OBJS=[],SI_TO_HELL=[0,0];');
 // genFromTemplate ignores the sole player_start marker; no prior editor objects on a fresh init.
 const maps=fs.readFileSync(path.join(root,'maps_data.js'),'utf8');const mc=vm.createContext({});vm.runInContext(maps,mc);const inputs=vm.runInContext('FIXED_MAPS[0].objs',mc);
 if(inputs.length!==1||inputs[0].id!=='player_start')throw Error('Fresh editor-object prerequisite changed');
 run('const _CH1S1='+expr('_CH1S1')+';const _MAP_COMPOSE={1:'+expr('_MAP_COMPOSE',1)+'};const _OBJ_META=JSON.parse(JSON.stringify(raw.initial_obj_meta)),_CH_DECO={0:raw.ch1_deco_raw};const DECO_FORCE_AUTO='+expr('DECO_FORCE_AUTO')+';');
 const merge=source.match(/_OBJ_META\[d.id\]=Object.assign\(_prev,[^\n]+/);if(!merge)throw Error('Missing source in-place merge');
 run('for(const d of _CH_DECO[0]){const _prev=_OBJ_META[d.id]||{};'+record('metadata.merge',merge.index,merge.index+merge[0].length)+'}');
 const postStart=source.indexOf('{const _dsOccFoot='),postEnd=source.indexOf('\nfunction ',postStart);if(postStart<0||postEnd<0)throw Error('Missing post metadata block');
 // Only the exact brace block (not later rendering helpers) is evaluated.
 const blockEnd=source.indexOf(';}\n',postStart)+2;
 run(record('metadata.occ_foot',postStart,blockEnd));
 for(const n of ['_tseed','mkRng','dst','initMapObjects','_appendRotatedColParts','_rebuildColObjs','_ensureColObjs','_ch1HillRampAt','_ch1HillBandBlocks','isW','canMv','hasLOS','_soilEdgeA'])run(fn(n));
 run('const _RETIRED_MAP_OBJECT_TYPES='+expr('_RETIRED_MAP_OBJECT_TYPES')+';const _CH1_HILL='+expr('_CH1_HILL')+';const _FDG_RUINED_FOREST_FIRST=false,MAP_ALL_FLOOR=false;var _colObjs=[],_colObjsSrc=null,_colObjsN=-1,_colScaleLogged=false;initMapObjects();');
 const objects=captureJSON(run('Array.from(MAP_OBJS)'));
 run('_ensureColObjs();');
 const metadataUndefined=[];
 const defs=raw.ch1_deco_raw,meta=captureJSON(run('Object.fromEntries(MAP_OBJS.filter(o=>o._hand).map(o=>[o.type,_OBJ_META[o.type]]))'),metadataUndefined);
 const assets=[],assetBySource=new Map();
 function asset(src){src=src.split('?')[0];if(assetBySource.has(src))return assetBySource.get(src);
  const bytes=fs.readFileSync(path.join(root,src)),ext=path.extname(src),name=path.basename(src);
  let size;if(ext==='.png')size=[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  const a={source:src,texture:'res://assets/map/ch1_si1/'+name,sha256:sha(bytes),bytes:bytes.length,...(size?{size}:{})};assets.push(a);assetBySource.set(src,a);return a;
 }
 const gt=run('('+expr('_GT_FILES')+')'),vista=source.match(/_voidVistaImg.src='([^']+)'/);if(!vista)throw Error('No vista');
 record('vista.path',vista.index,vista.index+vista[0].length);const floor=asset(gt.gt_soil),background=asset(vista[1]);
 const props=objects.map(o=>{if(!o._hand)return {...o,view:'native_lore_marker',interaction_bound:false};const m=meta[o.type],d=defs.find(d=>d.id===o.type),a=asset('assets/map/ch1/'+(d.dir||'floor_objects')+'/'+d.file),[w,h]=a.size,s=(m.sz||32)*(o.scale||1),ar=w/h,dw=m.squareDraw?s:s*(ar<1?ar:1),dh=m.squareDraw?s:s*(ar>1?1/ar:1);
  if(m.filter||m.edgeErase||m.srcRect||m.anim||m.rotTree)throw Error('Unsupported current texture branch '+o.type);
  return {...o,metadata:m,texture:a.texture,draw_size:[dw,dh],pivot:[m.pivotX??.5,m.pivotY??.5],rotation:o.rot||0,flip_h:!!m.flip};});
 const colliders=captureJSON(run('_colObjs.map(o=>{const m=_OBJ_META[o.type];return {id:o.type,shape:o._colW?"ellipse":"circle",x:o.x,y:o.y,rx:o._colW||o._colSz,ry:o._colW?o._colH:o._colSz,oy:o._colW?(m.colOy||0):0};})'));
 const queries=[];let seed=404202610;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function f64(values){const b=Buffer.alloc(values.length*8);values.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b.toString("base64");}
 function query(x,y,r=12){c.x=x;c.y=y;c.r=r;queries.push({x,y,r,f64:f64([x,y,r]),wall:run('isW(x,y)'),move:run('canMv(x,y,r)')});}
 for(let i=0;i<6000;i++)query(rand()*8160-80,rand()*8160-80);
 for(const o of colliders)for(let i=0;i<64;i++){const t=i*Math.PI/32;for(const d of [.9999,1,1.0001])query(o.x+o.rx*Math.cos(t)*d,o.y+o.oy+o.ry*Math.sin(t)*d);}
 for(const p of [[-40,0],[-.1,20],[0,0],[8000,8000],[4020,7420],[4020,1340]])query(...p);
 const los=[];for(let i=0;i<400;i++){const a=[rand()*8000,rand()*8000,rand()*8000,rand()*8000];c.q=a;los.push({points:a,f64:f64(a),clear:run('hasLOS(...q)')});}
 const alpha=captureJSON(run('G.map.flatMap((row,y)=>row.map((v,x)=>(v===0||v===4||v===2)?Math.round(_soilEdgeA(x,y,200,200,G.map)*255):0))'));
 const bundle={schema:'exoduser.ch1-area-resources.v1',stage:1,source:{main_sha:raw.source.main_sha,game_sha256:raw.source.game_sha256,source_snapshot_tile_sha256:raw.runtime_tile_sha256,symbols,init_log:logs,fresh_editor_input_count:inputs.length},assets,floor:{...floor,tile_size:floor.size[0],alpha,alpha_sha256:sha(Buffer.from(alpha)),mode:'native filtered mask + world-space tiled texture'},vista:{...background,padding_ratio:.4},props,colliders,wall_rects:rectangles(raw.tiles,v=>v===1),scope:{standalone:true,main_bound:false,real_player_bound:false,spawn_holes_bound:false,region_progress_bound:false,transition_bound:false,source_assets_edited:0,metadata_undefined_paths:metadataUndefined,stage0_hill:false,stage0_baked_chunks:0,analytic_collision:true,physical_prop_shapes:false}};
 return {bundle,queries,los,raw};
}
export function writeResources(root){
 const {bundle,...evidence}=buildResources(root);const out=path.join(root,'godot/data/ch1_map_source/si1_resources.json');
 fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(bundle)+'\n');
 for(const a of bundle.assets){const dest=path.join(root,'godot',a.texture.slice(6));fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(root,a.source),dest);}
 return {bundle,...evidence};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==4)throw Error('Usage: export_ch1_area_resources.mjs <root> <external-evidence-json>');const root=fs.realpathSync(process.argv[2]),out=path.resolve(process.argv[3]);if(!path.relative(root,out).startsWith('..'+path.sep))throw Error('Evidence must be external');const result=writeResources(root);fs.writeFileSync(out,JSON.stringify({queries:result.queries,los:result.los})+'\n');console.log(JSON.stringify({assets:result.bundle.assets.length,props:result.bundle.props.length,colliders:result.bundle.colliders.length,wall_rects:result.bundle.wall_rects.length,queries:result.queries.length,los:result.los.length}));}catch(e){console.error(e.stack);process.exitCode=1;}
}
