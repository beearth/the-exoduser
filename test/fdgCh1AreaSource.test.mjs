import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {buildStage0Snapshot, captureJSON} from '../godot/tools/export_ch1_area_source.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {parseExpressionAt}=createRequire(path.join(root,'package.json'))('acorn');
const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
const artifact=JSON.parse(fs.readFileSync(path.join(root,'godot/data/ch1_map_source/si0.json'),'utf8'));
const existing=JSON.parse(fs.readFileSync(path.join(root,'godot/data/map.json'),'utf8'));
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
function expression(name,key){
  const match=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(source);
  let node=parseExpressionAt(source,match.index+match[0].length,{ecmaVersion:'latest'});
  if(key!==undefined)node=node.properties.find(p=>String(p.key.value??p.key.name)===String(key)).value;
  return source.slice(node.start,node.end);
}
const literal=(name,key)=>JSON.parse(JSON.stringify(vm.runInNewContext('('+expression(name,key)+')')));
const protectedFiles=[...new Set([
  'game.html','maps_data.js','godot/data/map.json','engine/fdg/map-source-adapter.js','godot/tools/export_world.mjs',
  'assets/map/ch1/production_finish/layout.js',
  ...existing.chunks.map(p=>'godot/'+p.texture.replace('res://','')),
  ...existing.props.map(p=>'godot/'+p.texture.replace('res://','')),
  ...artifact.ch1_deco_raw.map(p=>'assets/map/ch1/'+(p.dir||'floor_objects')+'/'+p.file),
])].filter(p=>fs.existsSync(path.join(root,p)));
const hashes=()=>Object.fromEntries(protectedFiles.map(p=>[p,sha(fs.readFileSync(path.join(root,p)))]));
const before=hashes();
let actual;

// Expected data below comes from the original selectors/generator and the approved map,
// not from the Godot validator's constants or output.
test('latest source builds the complete stage0 source-only snapshot without changing shared files or PNG bytes',()=>{
  actual=buildStage0Snapshot(root);
  assert.equal(actual.schema,'exoduser.ch1-area-source.v1');
  assert.equal(actual.stage,0);
  assert.equal(actual.source.game_sha256,sha(source));
  assert.match(actual.source.main_sha,/^[0-9a-f]{40}$/);
  assert.deepEqual(actual.grid,{width:200,height:200,tile_size:40});
  assert.equal(actual.scope.runtime_bound,false);assert.equal(actual.scope.visual_verified,false);
  assert.equal(actual.scope.save_access,0);assert.equal(actual.scope.init_map_objects_executed,false);
  for(const field of ['prop_colliders','effective_prop_positions','final_map_objects'])assert.equal(actual.scope[field],'NOT_OBSERVED');
  assert.deepEqual(hashes(),before);
});

test('native source tiles equal the admitted map byte for byte with exact dimensions and north gate',()=>{
  assert.equal(actual.tiles.length,40000);
  assert.deepEqual(actual.tiles,existing.tiles);
  assert.equal(sha(Buffer.from(actual.tiles)),'655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa');
  assert.equal(actual.runtime_tile_sha256,sha(Buffer.from(actual.tiles)));
  const counts=Array.from({length:5},(_,code)=>actual.tiles.filter(t=>t===code).length);
  assert.deepEqual(counts,[19958,19755,3,3,281]);
  assert.deepEqual(actual.boss_gate,[{x:99,y:5},{x:100,y:5},{x:101,y:5}]);
  assert.deepEqual(actual.exits,[{x:99,y:7},{x:100,y:7},{x:101,y:7}]);
  assert.deepEqual(actual.start_tile,[100,185]);assert.deepEqual(actual.start_world,[4020,7420]);
  assert.deepEqual(actual.exit_center_tile,[100,7]);assert.equal(actual.rooms.length,6);
});

test('all raw metadata and hand placements match original AST literals; no merged metadata or asset rewrite',()=>{
  assert.deepEqual(actual.initial_obj_meta,literal('_OBJ_META'));
  assert.deepEqual(actual.ch1_deco_raw,literal('_CH_DECO',0));
  assert.deepEqual(actual.hand_props_raw,literal('_MAP_COMPOSE',0).handProps);
  assert.equal(Object.keys(actual.initial_obj_meta).length,77);
  assert.equal(actual.ch1_deco_raw.length,110);assert.equal(actual.hand_props_raw.length,36);
  assert.deepEqual(actual.initial_obj_meta.pit_poison,{sz:200,collision:true,colW:80,colH:58,colOy:7});
  assert.deepEqual(actual.hand_props_raw.find(p=>p.id==='pit_poison'),{id:'pit_poison',x:162,y:139});
  assert.equal(actual.initial_obj_meta.m_ctree13,undefined,'CH_DECO raw registration is not initial meta');
  assert.deepEqual(actual.ch1_deco_raw.filter(p=>['m_ctree17','m_ctree18','m_ctree19','m_ctree20'].includes(p.id)).map(p=>p.file),
    ['rotforest_tree_05.png','rotforest_tree_11.png','rotforest_tree_06.png','rotforest_tree_07.png']);
  assert.deepEqual(actual.chapter_stages.map(c=>c.stages),[4,6,4,7,5,6,3]);
});

test('native hole order, source count formula, original region totals and seeded timer scope remain exact',()=>{
  const tuples=actual.spawn_holes_final.map(h=>[h.x,h.y,h.size,h.room,h.count]);
  assert.deepEqual(tuples,[[2980,6740,.5,1,15],[5620,6420,.3,1,8],[2220,5620,.5,1,15],[5620,5220,.3,1,8],
    [3220,4220,.5,1,15],[5220,3220,.5,1,15],[2420,2420,.3,1,8],[5620,1820,.5,1,15],[4020,1020,.8,1,15],
    [3780,6220,.3,1,8],[3060,3420,.55,1,15],[4820,1900,.8,1,15],[4020,5540,.3,-1,8],[4020,4140,.3,-1,8]]);
  assert.equal(actual.total_spawned,168);assert.deepEqual(actual.region_totals,[23,60,53,32]);
  assert.equal(actual.spawn_holes_final.reduce((n,h)=>n+h.count,0),168);
  assert.equal(actual.generation.seed,20261020);assert.equal(actual.generation.random_draws,14);
  assert.equal(actual.generation.random_final_state,3323445034);
  for(const hole of actual.spawn_holes_final)assert.ok(hole.timer>=600&&hole.timer<660);
});

test('function/initializer provenance points to exact unchanged native AST fragments and original source files',()=>{
  for(const [file,digest]of Object.entries(actual.source.files))assert.equal(digest,sha(fs.readFileSync(path.join(root,file))));
  for(const name of ['genFromTemplate','_cloneField11','_getFixedMapForStage','_cacheExitCenter','_spawnHoleCount','_regionInit']){
    const match=new RegExp('function\\s+'+name+'\\s*\\(').exec(source);
    const node=parseExpressionAt(source,match.index,{ecmaVersion:'latest'}),record=actual.source.symbols[name];
    assert.equal(record.line,source.slice(0,node.start).split('\n').length);
    assert.equal(record.end,source.slice(0,node.end).split('\n').length);
    assert.equal(record.sha256,sha(source.slice(node.start,node.end)));
  }
  assert.equal(actual.source.symbols.genFromTemplate.line,30218);
  assert.equal(actual.source.symbols['initStage.start_position'].line,31564);
  assert.equal(actual.environment_refs.length,10);
  assert.deepEqual(actual.undefined_paths,[]);
});

test('two extractions are identical and the checked-in snapshot differs only in optional commit provenance',()=>{
  const second=buildStage0Snapshot(root);
  assert.deepEqual(second,actual);
  const normalized=structuredClone(actual);normalized.source.main_sha=artifact.source.main_sha;
  assert.deepEqual(normalized,artifact);
  const changed=buildStage0Snapshot(root,{seed:1});
  assert.deepEqual(changed.tiles,actual.tiles);
  assert.deepEqual(changed.spawn_holes_final.map(({timer,...h})=>h),actual.spawn_holes_final.map(({timer,...h})=>h));
  assert.notEqual(changed.spawn_holes_final[0].timer,actual.spawn_holes_final[0].timer);
  assert.deepEqual(hashes(),before);
});

test('present undefined is explicitly masked, while absent and explicit null stay distinct',()=>{
  const paths=[],raw={present:undefined,explicit_null:null,nested:[undefined]};
  const captured=captureJSON(raw,paths);
  assert.deepEqual(captured,{present:null,explicit_null:null,nested:[null]});
  assert.deepEqual(paths,['/present','/nested/0']);
  assert.equal(Object.hasOwn(captured,'absent'),false);assert.equal(raw.present,undefined);
  const circular={};circular.self=circular;
  assert.throws(()=>captureJSON(circular),/Unsupported source JSON/);
});

test('unsupported stages/seeds fail before writes; shared source/map/asset destinations cannot be outputs',()=>{
  const directory=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch1-01-Isolated-20261020-'));
  const tool=path.join(root,'godot/tools/export_ch1_area_source.mjs'),destination=path.join(directory,'sentinel.json');
  const cli=(args)=>spawnSync(process.execPath,[tool,...args],{encoding:'utf8'});
  try{
    fs.writeFileSync(destination,'preserve');
    for(const stage of ['5']){
      const r=cli([root,destination,'--stage',stage,'--seed','20261020']);
      assert.equal(r.status,1);assert.match(r.stderr,/UNSUPPORTED_STAGE/);assert.equal(fs.readFileSync(destination,'utf8'),'preserve');
    }
    for(const seed of ['-1','NaN','4294967296'])assert.equal(cli([root,destination,'--stage','0','--seed',seed]).status,1);
    for(const shared of ['game.html','godot/data/map.json','godot/data/enemy.json','assets/map/ch1/collision/pit_poison.png']){
      const r=cli([root,path.join(root,shared),'--stage','0','--seed','20261020']);assert.equal(r.status,1);assert.match(r.stderr,/Output inside source root/);
    }
    const link=path.join(directory,'linked.json');fs.symlinkSync(path.join(root,'godot/data/map.json'),link);
    assert.match(cli([root,link,'--stage','0','--seed','20261020']).stderr,/Symlink output rejected/);
    assert.match(cli([root,destination,'--stage','0','--seed','20261020']).stderr,/Existing non-snapshot output rejected/);
    const externalMap=path.join(directory,'map.json');fs.copyFileSync(path.join(root,'godot/data/map.json'),externalMap);
    const mapBefore=fs.readFileSync(externalMap,'utf8');
    assert.match(cli([root,externalMap,'--stage','0','--seed','20261020']).stderr,/Existing non-snapshot output rejected/);
    assert.equal(fs.readFileSync(externalMap,'utf8'),mapBefore);
    assert.equal(fs.readFileSync(destination,'utf8'),'preserve');assert.deepEqual(hashes(),before);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

test('explicit external CLI snapshot succeeds without touching original data or PNG files',()=>{
  const directory=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch1-01-Isolated-20261020-'));
  try{
    const output=path.join(directory,'si0.json');
    const r=spawnSync(process.execPath,[path.join(root,'godot/tools/export_ch1_area_source.mjs'),root,output,'--stage','0','--seed','20261020'],{encoding:'utf8'});
    assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).total,168);
    assert.deepEqual(JSON.parse(fs.readFileSync(output,'utf8')),actual);assert.deepEqual(hashes(),before);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
