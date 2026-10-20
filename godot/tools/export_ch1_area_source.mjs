// CH1-01/03 and CH2-01/CH3-01: native stage0/1/4/10 source snapshots, never map.json/PNG.
// Stage0 base 284d7faf / stage1 main e556b617; unchanged game SHA 4d911cdd...; exact ranges below.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const SCHEMA = 'exoduser.ch1-area-source.v1';
export const CH2_SCHEMA = 'exoduser.ch2-area-source.v1';
export const CH3_SCHEMA = 'exoduser.ch3-area-source.v1';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

// Undefined remains a present null carrier PLUS its explicit path, not JSON null.
export function captureJSON(value, undefinedPaths = [], at = '', active = new Set()) {
  if (value === undefined) { undefinedPaths.push(at); return null; }
  if (value === null || ['string', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || active.has(value)) throw new Error('Unsupported source JSON at '+at);
  active.add(value);
  const result = Array.isArray(value) ? [] : {};
  for (const key of Object.keys(value)) {
    if (['__proto__','constructor','prototype'].includes(key)) throw new Error('Unsafe key at '+at);
    result[key] = captureJSON(value[key], undefinedPaths, at+'/'+key.replaceAll('~','~0').replaceAll('/','~1'), active);
  }
  active.delete(value);
  return result;
}

export function buildAreaSnapshot(sourceRoot, {stage = 0, seed = 20261020} = {}) {
  if (![0,1,4,10].includes(stage)) throw new Error('UNSUPPORTED_STAGE: only stages 0, 1, 4 and 10 are supported');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Invalid uint32 seed');
  const root = fs.realpathSync(sourceRoot);
  const {parseExpressionAt} = createRequire(path.join(root, 'package.json'))('acorn');
  const source = fs.readFileSync(path.join(root, 'game.html'), 'utf8');
  const files = {'game.html': sha(source)}, symbols = {};
  const line = offset => source.slice(0, offset).split('\n').length;
  function fragment(name, start, end) {
    const text = source.slice(start, end);
    symbols[name] = {file:'game.html', line:line(start), end:line(end), sha256:sha(text)};
    return text;
  }
  function expression(name, key) {
    const match = new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);
    if (!match) throw new Error('Missing source expression '+name);
    let node = parseExpressionAt(source, match.index+match[0].length, {ecmaVersion:'latest'});
    if (key !== undefined) {
      node = node.properties.find(p => String(p.key.value??p.key.name) === String(key))?.value;
      if (!node) throw new Error('Missing source property '+name+'.'+key);
    }
    return fragment(name+(key === undefined ? '' : '.'+key), node.start, node.end);
  }
  function nativeFunction(name) {
    const match = new RegExp('function\\s+'+name+'\\s*\\(').exec(source);
    if (!match) throw new Error('Missing source function '+name);
    const node = parseExpressionAt(source, match.index, {ecmaVersion:'latest'});
    return fragment(name, node.start, node.end);
  }
  function block(name, startMark, endMark) {
    const start = source.indexOf(startMark), end = source.indexOf(endMark, start);
    if (start < 0 || end < 0) throw new Error('Missing source block '+name);
    return fragment(name, start, end);
  }
  function read(relative) {
    const text = fs.readFileSync(path.join(root,relative), 'utf8');
    files[relative] = sha(text); return text;
  }
  const context = vm.createContext({console:{log(){},warn(){}}, Math:Object.create(Math),
    Uint8Array,Uint16Array,Int32Array,Set,Map,window:{location:{search:''}},location:{search:''},URLSearchParams});
  let rng = seed, randomDraws = 0;
  context.Math.random = () => { ++randomDraws; rng=(Math.imul(rng,1664525)+1013904223)>>>0; return rng/4294967296; };
  const evaluate = text => vm.runInContext(text,context,{timeout:15000});
  evaluate(read('maps_data.js'));
  if (stage === 0 || stage === 1) evaluate(read('assets/map/ch1/production_finish/layout.js'));
  if (stage === 1) evaluate(read('assets/map/ch1/geometry/ch1_si1_geometry.js'));
  for (const name of ['T','TOTAL_STAGES','CHAPTER_STAGES','_stageTestReq','_mapTestReq','_classicMap',
    '_MAP_QA_MODE','_DIABLO_FIELD_QA','_fdgProjectiveTextureGate','_FDG_RUINED_FOREST_FIRST','MAP_ALL_FLOOR','SPAWN_HOLE','_REG_DIRS_KO','_REG_DIRS_EN','_REG_CH1_KO','_REG_CH1_EN','_REG_FB_TO_REG']) {
    evaluate('const '+name+'='+expression(name)+';');
  }
  evaluate(block('stage_index_arrays','const SI_TO_HELL=','// 대표맵='));
  evaluate(block('stage_face_dungeon','const _FIELD_FACE=','function _isFaceMap('));
  evaluate('var G={stage:'+stage+',_zones:null},MAP_OBJS=[],P={},_exitCX=0,_exitCY=0;');
  if (stage === 1) evaluate('const _CH1S1='+expression('_CH1S1')+';');
  if (stage === 4) evaluate('const _CH2S4='+expression('_CH2S4')+';');
  if (stage === 10) evaluate('const _HELLWINTER10='+expression('_HELLWINTER10')+';');
  evaluate('const _MAP_COMPOSE={'+stage+':'+expression('_MAP_COMPOSE',stage)+'};');
  const chapter = stage === 10 ? 2 : stage === 4 ? 1 : 0;
  evaluate('const _OBJ_META='+expression('_OBJ_META')+';const _CH_DECO={'+chapter+':'+expression('_CH_DECO',chapter)+'};');
  for (const name of ['_wantPlateTest','_isFaceMap','_isDungeonMap','mkRng','_rleEncodeGrid',
    '_buildCh1StartForestRLE','_paintPathDisk','_paintPathSeg','_buildWalkPathRLE','_buildBasinRLE','_buildColRectRLE',
    '_cloneField11','_getFixedMapForStage','_tCarveCircle','_tCarveEllipse','_tCarveRect','_tCarveCross',
    '_tCarveCorridor','_tCaveSmooth','_tBossDistMap','_tseed','_applyCh1StartNorthGate','_applyHellWinterNorthGate',
    '_spawnHoleCount','_cacheExitCenter','genFromTemplate','_regionFbAlive','_regionIdxAt','_regionInit']) evaluate(nativeFunction(name));
  if (evaluate('_wantPlateTest()||_isDungeonMap('+stage+')||_FDG_RUINED_FOREST_FIRST||_DIABLO_FIELD_QA||MAP_ALL_FLOOR')) {
    throw new Error('Ordinary production source gates required');
  }
  evaluate('globalThis.template=_getFixedMapForStage('+stage+');genFromTemplate(template,'+stage+');');
  // game.html:31564-31566 exact start-room fallback and (tile+.5)*T assignments.
  const initStart = source.indexOf('function initStage(');
  const startAt = source.indexOf('const st=G.rooms.find', initStart);
  const endMatch = /P\.x=\(_spX\+\.5\)\*T;P\.y=\(_spY\+\.5\)\*T;/.exec(source.slice(startAt));
  if (startAt < 0 || !endMatch) throw new Error('Missing exact initStage start-position block');
  evaluate(fragment('initStage.start_position', startAt, startAt+endMatch.index+endMatch[0].length));
  // Source game.html:60697-60718; writes exist only in the isolated VM. No Godot owner is bound.
  evaluate('_regionInit('+stage+');');
  const generated = evaluate(`({tiles:G.map.flat(),rooms:G.rooms,exits:G.exits,boss_gate:G.bossGate,
    start_tile:[_spX,_spY],start_world:[P.x,P.y],hand_props_raw:_MAP_COMPOSE[${stage}].handProps,
    initial_obj_meta:_OBJ_META,${stage === 10 ? 'ch3_deco_raw:_CH_DECO[2],region_details:G._regions' : stage === 4 ? 'ch2_deco_raw:_CH_DECO[1]' : 'ch1_deco_raw:_CH_DECO[0]'},chapter_stages:CHAPTER_STAGES,
    spawn_holes_final:G.spawnHoles.map(h=>({...h,count:_spawnHoleCount(h.size,${stage})})),
    total_spawned:G._totalSpawned,exit_center_tile:[_exitCX,_exitCY]})`);
  const undefinedPaths = [], data = captureJSON(generated,undefinedPaths);
  if (data.tiles.length !== 40000) throw new Error('Incomplete native tile grid');
  const totals = captureJSON(evaluate('G._regions.map(r=>r.total)'));
  const environmentRefs = [];
  for (const match of source.matchAll(/<script src="([^"]+)"[^>]*>/g)) {
    const relative = match[1].split('?')[0];
    if (relative === 'maps_data.js' || ((stage === 0 || stage === 1) && (relative.startsWith('assets/map/ch1/') || /^ch1-[\w-]+\.js$/.test(relative)))) {
      read(relative); environmentRefs.push({src:match[1],file:relative,line:line(match.index),sha256:files[relative]});
    }
  }
  if (stage === 0 || stage === 1) {
    const bakedVersion = source.match(/const _CH1_START_ROOT=[^\n]+\n[^\n]+/)?.[0];
    if (!bakedVersion) throw new Error('Missing baked environment source reference');
    fragment('environment.baked_manifest',source.indexOf(bakedVersion),source.indexOf(bakedVersion)+bakedVersion.length);
  }
  const ch2 = {};
  if (stage === 4) {
    ch2.source_path = captureJSON(evaluate('({spec:_MAP_COMPOSE[4].path,empty:_MAP_COMPOSE[4].empty,editor_tile_rle:template.tileRLE})'));
    ch2.source_path.editor_tile_rle_sha256 = sha(JSON.stringify(ch2.source_path.editor_tile_rle));
    // Preserve image references/bytes only; do not initialize images or objects.
    ch2.asset_refs = data.ch2_deco_raw.map(d => {
      const relative = path.posix.join('assets/map/ch2', d.dir || 'floor_objects', d.file);
      const bytes = fs.readFileSync(path.join(root,relative));
      files[relative] = sha(bytes);
      return {id:d.id,file:relative,bytes:bytes.length,sha256:files[relative]};
    });
    for (const name of ['_traceCh2AuthoredFloor','_paintCh2OrganicFloorDetail','_traceCh2OrganicFloorSide',
      '_paintCh2OrganicCollisionRim','_paintCh2OrganicFloorHalo','_fillPathBg']) nativeFunction(name);
  }
  const ch3 = {};
  if (stage === 10) {
    ch3.source_basin = captureJSON(evaluate('({spec:_MAP_COMPOSE[10].basin,empty:_MAP_COMPOSE[10].empty,editor_tile_rle:template.tileRLE})'));
    ch3.source_basin.editor_tile_rle_sha256 = sha(JSON.stringify(ch3.source_basin.editor_tile_rle));
    const ids = new Set(data.hand_props_raw.map(h => h.id));
    const chapterIds = new Set(data.ch3_deco_raw.map(d => d.id));
    ch3.cross_deco_raw = captureJSON(evaluate(expression('_CH_DECO',0))).filter(d => ids.has(d.id) && !chapterIds.has(d.id));
    if (ch3.cross_deco_raw.length !== [...ids].filter(id => !chapterIds.has(id)).length) throw new Error('Missing cross-chapter source metadata');
    // Reference original bytes only. No Image, media transformation or product copying.
    const reference = (id, relative) => {
      const bytes = fs.readFileSync(path.join(root,relative));
      files[relative] = sha(bytes);
      return {id,file:relative,bytes:bytes.length,sha256:files[relative]};
    };
    ch3.asset_refs = [...data.ch3_deco_raw.map(d => [d,3]), ...ch3.cross_deco_raw.map(d => [d,1])]
      .map(([d,ch]) => reference(d.id,path.posix.join('assets/map/ch'+ch,d.dir || 'floor_objects',d.file)));
    ch3.ground_asset = reference('gt_hellwinter','assets/map/ch3/ground_hellwinter.png');
    for (const name of ['_appendRotatedColParts','_rebuildColObjs','_nearFloor','isW','canMv']) nativeFunction(name);
  }
  const geometry = stage === 1 ? captureJSON(evaluate(`({stage:CH1_SI1_GEOMETRY.stage,size:CH1_SI1_GEOMETRY.size,
    regions:CH1_SI1_GEOMETRY.regions,landmarks:CH1_SI1_GEOMETRY.landmarks,spine:CH1_SI1_GEOMETRY.spine,
    widthSamples:CH1_SI1_GEOMETRY.widthSamples,bypassPaths:CH1_SI1_GEOMETRY.bypassPaths,routeAnchors:CH1_SI1_GEOMETRY.routeAnchors,
    treeBlockRadius:CH1_SI1_GEOMETRY.treeBlockRadius,treeBypasses:CH1_SI1_GEOMETRY.treeBypasses,
    mask:Array.from(CH1_SI1_GEOMETRY.buildMask()),editor_tile_rle:template.tileRLE})`)) : null;
  if (geometry) {
    geometry.mask_sha256=sha(Buffer.from(geometry.mask));
    geometry.editor_tile_rle_sha256=sha(JSON.stringify(geometry.editor_tile_rle));
  }
  return {schema:stage === 10 ? CH3_SCHEMA : stage === 4 ? CH2_SCHEMA : SCHEMA,stage,source:{main_sha:execFileSync('git',['rev-parse',stage === 0 ? 'HEAD' : 'origin/main'],{cwd:root,encoding:'utf8'}).trim(),
    ...(stage !== 0 ? {extraction_head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()} : {}),
    game_sha256:files['game.html'],files,symbols,selection:`default empty URL → _getFixedMapForStage(${stage}) → _cloneField11(${stage}) → genFromTemplate`},
    grid:{width:200,height:200,tile_size:40},...data,...ch2,...ch3,...(geometry ? {source_geometry:geometry} : {}),runtime_tile_sha256:sha(Buffer.from(data.tiles)),
    region_totals:totals,environment_refs:environmentRefs,undefined_paths:undefinedPaths,
    generation:{seed,random_draws:randomDraws,random_final_state:rng,random_algorithm:'LCG uint32: imul(1664525)+1013904223; /4294967296',
      timer_basis:'seeded source VM observation only; not browser boot RNG'},
    scope:{runtime_bound:false,visual_verified:false,save_access:0,init_map_objects_executed:false,
      final_map_objects:'NOT_OBSERVED',effective_prop_positions:'NOT_OBSERVED',prop_colliders:'NOT_OBSERVED',
      region_projection:'original _regionInit in isolated VM; no runtime owner bound'}};
}

export function buildStage0Snapshot(sourceRoot, options = {}) {
  if ((options.stage === undefined ? 0 : options.stage) !== 0) throw new Error('UNSUPPORTED_STAGE: stage0 helper only');
  return buildAreaSnapshot(sourceRoot, {...options,stage:0});
}

export function main(args) {
  if (args.length !== 6 || args[2] !== '--stage' || args[4] !== '--seed' || !['0','1','4','10'].includes(args[3])) {
    throw new Error('Usage: export_ch1_area_source.mjs <source-root> <output-json> --stage <0|1|4|10> --seed <uint32>; UNSUPPORTED_STAGE otherwise');
  }
  const root=fs.realpathSync(args[0]), output=path.resolve(args[1]);
  const relative=path.relative(root,output);
  const chapter = args[3] === '10' ? 3 : args[3] === '4' ? 2 : 1;
  if (!relative.startsWith('..'+path.sep) && relative !== 'godot/data/ch'+chapter+'_map_source/si'+args[3]+'.json') {
    throw new Error('Output inside source root must be the matching new si snapshot JSON');
  }
  // Never overwrite a symlink (including one pointing at a shared map/asset).
  let ancestor=output;
  while (ancestor !== path.dirname(ancestor)) {
    if ((chapter === 3 ? fs.lstatSync(ancestor,{throwIfNoEntry:false})?.isSymbolicLink() : fs.existsSync(ancestor) && fs.lstatSync(ancestor).isSymbolicLink())) throw new Error('Symlink output rejected');
    ancestor=path.dirname(ancestor);
  }
  if (path.extname(output) !== '.json') throw new Error('Output must be a new source snapshot JSON');
  if (fs.existsSync(output)) {
    let previous;
    try { previous=JSON.parse(fs.readFileSync(output,'utf8')); } catch {}
    if (previous?.schema !== (chapter === 3 ? CH3_SCHEMA : chapter === 2 ? CH2_SCHEMA : SCHEMA) || (chapter >= 2 && previous.stage !== Number(args[3]))) throw new Error('Existing non-snapshot output rejected');
  }
  if (!/^\d+$/.test(args[5])) throw new Error('Invalid uint32 seed');
  const result=buildAreaSnapshot(root,{stage:Number(args[3]),seed:Number(args[5])});
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(result)+'\n');
  console.log(JSON.stringify({schema:result.schema,stage:result.stage,tiles:result.tiles.length,hand_props:result.hand_props_raw.length,
    base_meta:Object.keys(result.initial_obj_meta).length,...(chapter === 3 ? {ch3_deco:result.ch3_deco_raw.length} : chapter === 2 ? {ch2_deco:result.ch2_deco_raw.length} : {ch1_deco:result.ch1_deco_raw.length}),
    holes:result.spawn_holes_final.length,total:result.total_spawned,region_totals:result.region_totals,
    tile_sha256:result.runtime_tile_sha256,output}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); } catch(error) { console.error(error.message); process.exitCode=1; }
}
