import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseExpressionAt} from 'acorn';
import {synchronize,scopedMap,sha,TREE_IDS} from '../godot/tools/sync_ch1_stage0_assets.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'game.html'),'utf8');
const map=JSON.parse(fs.readFileSync(path.join(root,'godot/data/map.json'),'utf8'));
// Accepted P3-001 map, before CH1-02: an independent historical product input.
const baseline=JSON.parse(execFileSync('git',['show','677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152:godot/data/map.json'],{cwd:root,encoding:'utf8'}));
const hashFile=p=>sha(fs.readFileSync(path.join(root,p)));
const update=map.source.asset_updates.find(p=>p.task==='CH1-02');
let candidate;
function nativeDeco() {
 const match=/const\s+_CH_DECO\s*=/.exec(source),node=parseExpressionAt(source,match.index+match[0].length,{ecmaVersion:'latest'});
 const prop=node.properties.find(p=>String(p.key.value??p.key.name)==='0');
 return JSON.parse(JSON.stringify(vm.runInNewContext('('+source.slice(prop.value.start,prop.value.end)+')')));
}
function changes(a,b,p='') {
 if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>changes(a[k],b[k],p+'/'+k));
 return a===b?[]:[p];
}
test('native AST tree files are consumed by all four actual product map texture/file pairs',()=>{
 const deco=nativeDeco();
 assert.deepEqual(TREE_IDS.map(id=>deco.find(d=>d.id===id).file),['rotforest_tree_05.png','rotforest_tree_11.png','rotforest_tree_06.png','rotforest_tree_07.png']);
 for(const id of TREE_IDS) {
  const raw=deco.find(d=>d.id===id),prop=map.props.find(p=>p.id===id);
  assert.equal(prop.metadata.file,raw.file);assert.equal(prop.texture,'res://assets/map/props/'+raw.file);
  assert.equal(hashFile('assets/map/ch1/'+raw.dir+'/'+raw.file),hashFile('godot/'+prop.texture.slice(6)));
 }
});
test('all 92 exporter PNG references equal original bytes and scoped history records exactly 42+4 changes',()=>{
 assert.equal(update.assets.length,92);
 for(const asset of update.assets) {
  assert.equal(hashFile(asset.source),asset.sha256,asset.source);
  assert.equal(hashFile(asset.target),asset.sha256,asset.target);
 }
 const changed=update.assets.filter(a=>a.before_sha256!==a.sha256);
 assert.equal(changed.length,46);assert.equal(changed.filter(a=>a.target.includes('/production_finish/')).length,42);
 assert.equal(changed.filter(a=>a.before_sha256===null).length,4);
 for(const chunk of map.chunks) {
  const bytes=fs.readFileSync(path.join(root,'godot/'+chunk.texture.slice(6)));
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[1026,1026]);
  assert.deepEqual(chunk.source_rect,[1,1,1024,1024]);assert.deepEqual(chunk.world_rect,[chunk.x*1000,chunk.y*1000,1000,1000]);
 }
});
test('complete JSON diff contains exactly eight native tree fields and one scoped provenance addition',()=>{
 const noReceipt=structuredClone(map);delete noReceipt.source.asset_updates;
 const expected=TREE_IDS.flatMap(id=>{const i=baseline.props.findIndex(p=>p.id===id);return ['/props/'+i+'/texture','/props/'+i+'/metadata/file'];}).sort();
 assert.deepEqual(changes(baseline,noReceipt).sort(),expected);
 assert.deepEqual(noReceipt.source,baseline.source);
 assert.equal(update.before_map_sha256,sha(execFileSync('git',['show','677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152:godot/data/map.json'],{cwd:root})));
 assert.equal(update.game_sha256,sha(source));assert.equal(update.exporter_sha256,hashFile('godot/tools/export_world.mjs'));
 assert.deepEqual(Object.values(update.source_lines),[17551,17552,17553,17554]);
 assert.deepEqual(baseline.source.collider_updates,map.source.collider_updates);
});
test('full regeneration through unchanged exporter is idempotent and writes only external evidence in check mode',()=>{
 const evidence=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'EXODUSER-ch1-02-Isolated-20261020-'));
 const before=hashFile('godot/data/map.json'),pngBefore=update.assets.map(a=>hashFile(a.target));
 try {
  const result=synchronize(root,evidence);
  assert.equal(result.apply,false);assert.equal(result.changed_png_count,0);assert.equal(result.png_count,92);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(evidence,'map.candidate.json'),'utf8')),map);
  candidate=JSON.parse(fs.readFileSync(path.join(evidence,'reextract/data/map.json'),'utf8'));
  assert.equal(sha(fs.readFileSync(path.join(evidence,'reextract/tools/export_world.mjs'))),hashFile('godot/tools/export_world.mjs'));
  assert.equal(hashFile('godot/data/map.json'),before);assert.deepEqual(update.assets.map(a=>hashFile(a.target)),pngBefore);
 }finally{fs.rmSync(evidence,{recursive:true,force:true});}
});
test('scope contract rejects any tile, collider, authored position, scale/pivot or unrelated metadata changes before promotion',()=>{
 for(const mutate of [c=>c.tiles[0]=99,c=>c.collision_rects[0][0]+=40,c=>c.prop_colliders[0].radii[0]+=1,
  c=>c.props[4].position[0]+=1,c=>c.props[4].draw_size[0]+=1,c=>c.props[4].pivot[0]+=.1,
  c=>c.props[4].metadata.colSz=999,c=>c.props.reverse()]) {
  const bad=structuredClone(candidate);mutate(bad);assert.throws(()=>scopedMap(baseline,bad),/OUT_OF_SCOPE|Tree order/);
 }
 assert.throws(()=>scopedMap({...baseline,stage:1},{...candidate,stage:1}),/UNSUPPORTED_STAGE/);
 const before=JSON.stringify(baseline),after=scopedMap(baseline,candidate);
 assert.equal(JSON.stringify(baseline),before);assert.equal(after.props[4].metadata.file,'rotforest_tree_05.png');
});
test('pit contract, source tile SHA and every geometry/placement field remain equal to admitted P3-001 input',()=>{
 assert.equal(map.tiles.length,40000);assert.equal(sha(Buffer.from(map.tiles)),'655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa');
 assert.deepEqual([map.collision_rects.length,map.prop_colliders.length,map.props.length,map.chunks.length],[292,19,36,64]);
 for(const key of ['tiles','collision_rects','prop_colliders','hill','rooms','exits','boss_gate','boundary','regions','start_position','exit_position'])assert.deepEqual(map[key],baseline[key]);
 assert.deepEqual(map.prop_colliders.find(p=>p.id==='pit_poison'),{id:'pit_poison',position:[6500,5587],kind:'ellipse',radii:[80,58]});
});
