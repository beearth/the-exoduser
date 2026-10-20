// CH2-02: continue the shared native generator context, no Main or asset writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildAreaSnapshot,captureJSON} from './export_ch1_area_source.mjs';
import {rectangles} from './export_ch1_area_resources.mjs';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
export function buildResources(root,{stage=4}={}){
 if(![4,5,7].includes(stage))throw Error('Unsupported CH2 resource stage');
 root=fs.realpathSync(root);const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
 if(sha(execFileSync('git',['show','origin/main:game.html'],{cwd:root,maxBuffer:16*1024*1024}))!==sha(source))throw Error('Latest main source mismatch');
 const {parseExpressionAt}=createRequire(path.join(root,'package.json'))('acorn'),symbols={};
 const record=(n,a,b)=>{symbols[n]={file:'game.html',line:source.slice(0,a).split('\n').length,end:source.slice(0,b).split('\n').length,sha256:sha(source.slice(a,b))};return source.slice(a,b);};
 function expr(n){const m=new RegExp('(?:const|let|var)\\s+'+n+'\\s*=').exec(source);if(!m)throw Error('Missing '+n);const a=parseExpressionAt(source,m.index+m[0].length,{ecmaVersion:'latest'});return record(n,a.start,a.end);}
 function fn(n){const m=new RegExp('function\\s+'+n+'\\s*\\(').exec(source);if(!m)throw Error('Missing '+n);const a=parseExpressionAt(source,m.index,{ecmaVersion:'latest'});return record(n,a.start,a.end);}
 let run,objects,initialObjects,metadata,colliders,metadataUndefined=[];
 const raw=buildAreaSnapshot(root,{stage,seed:20261020,observeNative:evaluate=>{
  run=evaluate;
  initialObjects=captureJSON(run('Array.from(MAP_OBJS)'));
  run('var resourceRandomDraws=0;const sourceRandom=Math.random;Math.random=()=>{resourceRandomDraws++;return sourceRandom();};');
  run('const DECO_FORCE_AUTO='+expr('DECO_FORCE_AUTO')+';');
  if([5,7].includes(stage)){
   run('const _SAME_TYPE_DIST='+expr('_SAME_TYPE_DIST')+';');run(fn('_nearbyTypeCount'));
   const a=source.indexOf('const sz=(_meta?_meta.sz||32:32)*(mo.scale||1);'),b=source.indexOf("if(mo._fdgUpright&&_fdgNativePerspective?.active)_fdgNativePerspective.popBillboard();",a);
   if(a<0||b<0)throw Error('Missing source sprite draw branches');record('render.sprite_branches',a,b);
   const light=source.match(/if\(_meta&&_meta\.light\)\{X\.globalAlpha=[^\n]+/);
   if(!light)throw Error('Missing source light overlay');record('render.light',light.index,light.index+light[0].length);
  }
  const merge=source.match(/_OBJ_META\[d.id\]=Object.assign\(_prev,[^\n]+/);if(!merge)throw Error('Missing native metadata merge');
  run('for(const d of _CH_DECO[1]){const _prev=_OBJ_META[d.id]||{};'+record('metadata.merge',merge.index,merge.index+merge[0].length)+'}');
  const start=source.indexOf('{const _dsOccFoot='),end=source.indexOf(';}\n',start)+2;if(start<0||end<2)throw Error('Missing metadata postprocess');run(record('metadata.occ_foot',start,end));
  for(const n of ['dst','initMapObjects','_appendRotatedColParts','_rebuildColObjs','_ensureColObjs','_ch1HillRampAt','_ch1HillBandBlocks','isW','canMv','hasLOS'])run(fn(n));
  run('const _RETIRED_MAP_OBJECT_TYPES='+expr('_RETIRED_MAP_OBJECT_TYPES')+';const _CH1_HILL='+expr('_CH1_HILL')+';var _colObjs=[],_colObjsSrc=null,_colObjsN=-1,_colScaleLogged=false;initMapObjects();');
  objects=captureJSON(run('Array.from(MAP_OBJS)'));
  metadata=captureJSON(run('Object.fromEntries(MAP_OBJS.map(o=>[o.type,_OBJ_META[o.type]]))'),metadataUndefined);
  run('_ensureColObjs();');
  if(run('_colObjs.some(o=>o._colRect)'))throw Error('Unimplemented analytic rect shape');
  colliders=captureJSON(run('_colObjs.map(o=>{const m=_OBJ_META[o.type];return {id:o.type,shape:o._colW?"ellipse":"circle",x:o.x,y:o.y,rx:o._colW||o._colSz,ry:o._colW?o._colH:o._colSz,oy:o._colW?(m.colOy||0):0};})'));
 }});
 const assets=[],bySource=new Map();
 function asset(src){src=path.posix.normalize(src.split('?')[0]);if(bySource.has(src))return bySource.get(src);
  if(!src.startsWith('assets/map/ch2/')||src.includes('..'))throw Error('Unexpected CH2 asset scope');
  const bytes=fs.readFileSync(path.join(root,src)),native=path.join(root,'godot',src);
  if(!fs.existsSync(native)||sha(fs.readFileSync(native))!==sha(bytes))throw Error('Existing Godot asset bytes mismatch '+src);
  if(bytes.subarray(1,4).toString()!=='PNG')throw Error('Non-PNG CH2 resource');
  const a={source:src,texture:'res://'+src,bytes:bytes.length,sha256:sha(bytes),size:[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]};assets.push(a);bySource.set(src,a);return a;
 }
 const floor=asset(run('('+expr('_GT_FILES')+').gt_ch2'));
 const adjustments=[];
 const props=objects.map(o=>{
  if(!o._hand&&(stage===4||o.type==='boss_gate_col'))return {...o,view:o.type==='lore'?'native_lore_marker':'collision_only',interaction_bound:false};
  const d=raw.ch2_deco_raw.find(d=>d.id===o.type),m=metadata[o.type],a=asset(path.posix.join('assets/map/ch2',d.dir||'floor_objects',d.file));
  if(m.filter||m.edgeErase||m.srcRect||m.anim||m.rotTree||([5,7].includes(stage)&&(m.rot||m.sheet||m.touchAnim||m.trackEye||m.blend)))throw Error('Unsupported texture branch '+o.type);
  const [w,h]=a.size,s=(m.sz||32)*(o.scale||1),ar=w/h,square=m.squareDraw||([5,7].includes(stage)&&!m.keepAR),dw=square?s:s*(ar<1?ar:1),dh=square?s:s*(ar>1?1/ar:1);
  return {...o,metadata:m,texture:a.texture,draw_size:[dw,dh],pivot:[m.pivotX??.5,m.pivotY??.5],rotation:o.rot||0,flip_h:!!m.flip,
   alpha:m.alpha??1,image_keying:d.hardAlpha?'hard_alpha':d.mega?'magenta':'none'};
 });
 // Source y-sort can reorder hands, so join by ID + the same original nearFloor scan.
 for(const h of raw.hand_props_raw??[]){let found=null;outer:for(let r=0;r<10;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  const x=h.x+dx,y=h.y+dy;if(x>=0&&y>=0&&x<200&&y<200&&[0,4].includes(raw.tiles[y*200+x])){found=[x,y];break outer;}}
  if(!found)throw Error('Native hand had no floor '+h.id);
  const p=props.find(p=>p._hand&&p.type===h.id&&p.x===(found[0]+.5)*40&&p.y===(found[1]+.5)*40&&p.role===h.role);
  if(!p)throw Error('Actual native hand missing '+h.id);
  adjustments.push({id:h.id,authored:[h.x,h.y],effective_tile:found,world:[p.x,p.y],moved:found[0]!==h.x||found[1]!==h.y});
 }
 let seed=402202610;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const f64=values=>{const b=Buffer.alloc(values.length*8);values.forEach((v,i)=>b.writeDoubleLE(v,i*8));return b.toString('base64');};
 const queries=[];function query(x,y,r=12){run('globalThis.q='+JSON.stringify([x,y,r])+';');queries.push({x,y,r,f64:f64([x,y,r]),wall:run('isW(q[0],q[1])'),move:run('canMv(q[0],q[1],q[2])')});}
 for(let i=0;i<6000;i++)query(rand()*8160-80,rand()*8160-80);
 for(const c of colliders)for(let i=0;i<32;i++){const t=i*Math.PI/16;for(const d of [.9999,1,1.0001])query(c.x+c.rx*Math.cos(t)*d,c.y+c.oy+c.ry*Math.sin(t)*d);}
 for(const p of [[-40,0],[-.1,20],[0,0],[8000,8000],[4020,7420],[(raw.exit_center_tile[0]+.5)*40,(raw.exit_center_tile[1]+.5)*40]])query(...p);
 const los=[];for(let i=0;i<400;i++){const points=[rand()*8000,rand()*8000,rand()*8000,rand()*8000];run('globalThis.q='+JSON.stringify(points)+';');los.push({points,f64:f64(points),clear:run('hasLOS(...q)')});}
 const bundle={schema:'exoduser.ch2-area-resources.v1',stage,source:{main_sha:raw.source.main_sha,game_sha256:raw.source.game_sha256,source_snapshot_tile_sha256:raw.runtime_tile_sha256,symbols,initial_objects:initialObjects,init_random_draws:run('resourceRandomDraws')},
  assets,floor:{...floor,path_spec:raw.source_path.spec,mode:stage===4?'Godot organic preview; native gameplay tiles unchanged':'Godot continuous si'+stage+' preview; native gameplay tiles unchanged'},props,colliders,wall_rects:rectangles(raw.tiles,v=>v===1),hand_adjustments:adjustments,
  scope:{standalone:true,main_bound:false,real_player_bound:false,spawn_holes_bound:false,region_progress_bound:false,transition_bound:false,source_assets_edited:0,metadata_undefined_paths:metadataUndefined,stage0_hill:false,stage0_baked_chunks:0,analytic_collision:true,physical_prop_shapes:false,visual_source_pixel_identity:false}};
 return {bundle,queries,los,raw};
}
export function writeResources(root,evidence,{stage=4}={}){
 if(![4,5,7].includes(stage))throw Error('Unsupported CH2 resource stage');
 root=fs.realpathSync(root);evidence=path.resolve(evidence);if(!path.relative(root,evidence).startsWith('..'+path.sep))throw Error('Evidence must be outside worktree');
 const dest=path.join(root,`godot/data/ch2_map_source/si${stage}_resources.json`);
 for(const file of [dest,evidence]){
  if(path.extname(file)!=='.json')throw Error('JSON output required');
  for(let p=file;p!==path.dirname(p);p=path.dirname(p))if(fs.existsSync(p)&&fs.lstatSync(p).isSymbolicLink())throw Error('Symlink output rejected');
  if(fs.existsSync(file)){
   const previous=JSON.parse(fs.readFileSync(file,'utf8'));
   if(previous.stage!==stage||previous.schema!==(file===dest?'exoduser.ch2-area-resources.v1':'exoduser.ch2-area-oracle.v1'))throw Error('Existing foreign output rejected');
  }
 }
 const result=buildResources(root,{stage});
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(result.bundle)+'\n');
 fs.writeFileSync(evidence,JSON.stringify({schema:'exoduser.ch2-area-oracle.v1',stage,queries:result.queries,los:result.los})+'\n');return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==4&&!(process.argv.length===6&&process.argv[4]==='--stage'&&['4','5','7'].includes(process.argv[5])))throw Error('Usage: export_ch2_area_resources.mjs <root> <external-oracle-json> [--stage 4|5|7]');const r=writeResources(process.argv[2],process.argv[3],{stage:process.argv.length===6?Number(process.argv[5]):4});console.log(JSON.stringify({objects:r.bundle.props.length,hands:r.bundle.props.filter(p=>p._hand).length,colliders:r.bundle.colliders.length,assets:r.bundle.assets.length,rectangles:r.bundle.wall_rects.length,near_floor_moved:r.bundle.hand_adjustments.filter(a=>a.moved).length,queries:r.queries.length,los:r.los.length}));}catch(e){console.error(e.stack);process.exitCode=1;}
}
