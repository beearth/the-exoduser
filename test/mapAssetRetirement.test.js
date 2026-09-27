import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('rejected tomb and root originals are isolated from active asset and editor paths',()=>{
 const manifest=JSON.parse(read('archive/retired-map-assets/20260927-low-quality/manifest.json'));
 assert.equal(manifest.status,'REJECTED_LOW_QUALITY');assert.equal(manifest.reuseAllowed,false);assert.equal(manifest.files.length,6);
 for(const entry of manifest.files){assert.equal(fs.existsSync(new URL('../'+entry.original,import.meta.url)),false);assert.ok(fs.existsSync(new URL('../'+entry.archived,import.meta.url)));assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+entry.archived,import.meta.url))).digest('hex'),entry.sha256);}
 for(const file of ['game.html','game-easy-test.html']){
  const s=read(file);assert.doesNotMatch(s,/{id:'(?:m_tomb|m_root|m_c5tomb|m_c7tomb)'/);
  assert.ok(!s.includes('tombstone.png'));assert.ok(!s.includes('exposed_root.png'));
  const ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);
  for(const id of ['m_tomb','m_root','m_c5tomb','m_c7tomb','tombstone'])assert.equal(ctx.policy.has(id),true);
  assert.equal(ctx.policy.has('m_c1sroot'),false);
  assert.ok(s.includes('if(_RETIRED_MAP_OBJECT_TYPES.has(mo.type))continue;'));
 }
 for(const file of ['editor.html','docs/4.1맵디자인+설정/tilemap-editor.html'])assert.doesNotMatch(read(file),/{id:'(?:tombstone|m_tomb)'/);
});

test('legacy weapon pile is quarantined without retiring the larger sword pile',()=>{
 const manifest=JSON.parse(read('archive/retired-map-assets/20260927-weapon-pile/manifest.json'));
 assert.equal(manifest.status,'REJECTED_LOW_QUALITY');assert.equal(manifest.reuseAllowed,false);assert.equal(manifest.files.length,4);
 for(const e of manifest.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f);assert.ok(!s.includes('weapon_pile.png'));assert.ok(!s.includes("{id:'m_wpile'"));assert.ok(!s.includes("{id:'m_c5wpile'"));const ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);for(const id of ['weapon_pile','m_wpile','m_c5wpile'])assert.ok(ctx.policy.has(id));assert.equal(ctx.policy.has('m_sword_pile'),false);assert.ok(s.includes("file:'sword_pile.png'"));}
 for(const f of ['editor.html','docs/4.1맵디자인+설정/tilemap-editor.html'])assert.ok(!read(f).includes('weapon_pile.png'));
 assert.ok(!read('ch1-living-detail.js').includes("o.type==='m_wpile'"));
});

test('retired tree and pillar cannot leave invisible collision, even with old metadata',()=>{
 const manifest=JSON.parse(read('archive/retired-map-assets/20260927-tree-pillar/manifest.json'));assert.equal(manifest.files.length,7);assert.equal(manifest.reuseAllowed,false);
 for(const e of manifest.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f);assert.ok(!s.includes('rotten_tree.png'));assert.ok(!s.includes('vine_pillar.png'));const lines=s.split(String.fromCharCode(10)),ids=['m_rotten_tree','m_vine_pillar','m_c7vine','rotten_tree','vine_pillar','m_rtree','m_vpillar'];
 const ctx={MAP_OBJS:[...ids.map(type=>({type,x:0,y:0})),{type:'m_bone_arch',x:20,y:20}],_OBJ_META:Object.fromEntries([...ids,'m_bone_arch'].map(id=>[id,{col:1,colSz:60}])),_colObjs:[],_colScaleLogged:true};vm.runInNewContext(lines.find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+lines.find(l=>l.startsWith('function _rebuildColObjs()'))+';_rebuildColObjs();',ctx);assert.deepEqual(Array.from(ctx._colObjs,o=>o.type),['m_bone_arch']);
 }
 for(const f of ['editor.html','docs/4.1맵디자인+설정/tilemap-editor.html']){assert.ok(!read(f).includes('rotten_tree.png'));assert.ok(!read(f).includes('vine_pillar.png'));}
 assert.ok(!read('ch1-living-detail.js').includes('m_rotten_tree'));assert.ok(!read('ch1-living-detail.js').includes('m_vine_pillar'));
});

test('rejected raised ground decals leave no loaders or placements and preserve combat crack VFX',()=>{
 const manifest=JSON.parse(read('archive/retired-map-assets/20260927-ground-decals/manifest.json'));assert.equal(manifest.files.length,4);assert.equal(manifest.reuseAllowed,false);for(const e of manifest.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f),ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);for(const id of ['m_moss','m_ash','m_mud','m_crack']){assert.ok(ctx.policy.has(id));assert.ok(!s.includes("{id:'"+id+"'"));}for(const file of ['moss_patch.png','ash_pile.png','mud_stain.png','ground_crack.png'])assert.ok(!s.includes(file));assert.ok(s.includes('assets/vfx/ground_crack_sheet.png'));assert.ok(s.includes("{id:'m_fbones'"));const pool=s.split(String.fromCharCode(10)).find(l=>l.includes('const _decoPool='));for(const id of ['m_moss','m_ash','m_mud','m_crack'])assert.ok(!pool.includes(id));}
});

test('small decorative organic art is retired while real poison and chapter two web pillars remain',()=>{
 const manifest=JSON.parse(read('archive/retired-map-assets/20260927-small-organic/manifest.json'));assert.equal(manifest.files.length,11);assert.equal(manifest.reuseAllowed,false);for(const e of manifest.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f),ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);for(const id of ['m_acid','m_puddle','m_flesh','m_meat','m_c6flesh','m_c6meat']){assert.ok(ctx.policy.has(id));assert.ok(!s.includes("{id:'"+id+"'"));}for(const file of ['acid_pool.png','poison_puddle.png','flesh_pile.png','meat_stake.png'])assert.ok(!s.includes(file));for(const id of ['pit_poison','m_c1gtoxicf','m_c1pool','m_c2webp'])assert.equal(ctx.policy.has(id),false);assert.ok(s.includes("file:'prop_webp.png'"));assert.ok(s.includes("file:'poison_pool.png'"));}
});

test('legacy web copies and four CH2 decorative seams are retired, structural pillars stay',()=>{
 const m=JSON.parse(read('archive/retired-map-assets/20260927-web/manifest.json'));assert.equal(m.files.length,4);assert.equal(m.reuseAllowed,false);for(const e of m.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f);assert.ok(!s.includes('spider_web.png'));assert.ok(!s.includes("['m_c2seamWeb',"));assert.ok(s.includes("{id:'m_c2webp',file:'prop_webp.png'"));assert.ok(s.includes("{id:'m_c2webpf',file:'prop_webp.png'"));const ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);for(const id of ['spider_web','m_web','m_c2web','m_c2seamWeb'])assert.ok(ctx.policy.has(id));assert.equal(ctx.policy.has('m_c2webp'),false);}
});

test('detached leaf heap is retired while shared bones and real swamp art remain',()=>{
 const m=JSON.parse(read('archive/retired-map-assets/20260927-leaf-pile/manifest.json'));assert.equal(m.files.length,1);assert.equal(m.reuseAllowed,false);for(const e of m.files){assert.equal(fs.existsSync(new URL('../'+e.original,import.meta.url)),false);assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+e.archived,import.meta.url))).digest('hex'),e.sha256);}
 for(const f of ['game.html','game-easy-test.html']){const s=read(f);assert.ok(!s.includes('leaf_pile.png'));assert.ok(!s.includes("{id:'m_leaf'"));assert.ok(s.includes("const _decoPool=['m_fbones','m_poison'];"));const ctx={};vm.runInNewContext(s.split(String.fromCharCode(10)).find(l=>l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='))+';globalThis.policy=_RETIRED_MAP_OBJECT_TYPES',ctx);assert.ok(ctx.policy.has('m_leaf'));for(const id of ['corpse','bones','m_fbones','m_c3bones','m_c3fbones','m_c5bones','m_c6corpse','m_c1gtoxicf'])assert.equal(ctx.policy.has(id),false);}
});
