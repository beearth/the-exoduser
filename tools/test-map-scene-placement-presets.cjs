'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const sandbox = vm.createContext({ module: { exports: {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), sandbox, { filename: 'map-scene-core.js' });
const K = sandbox.module.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const state = h => JSON.stringify({ project:h.project, undo:h.undoStack, redo:h.redoStack, pending:h.pending });
const preset = () => ({ kind:'world-placement-v1', width:125.25, height:80.5, pivotX:.3, pivotY:.95 });
const values = p => ({ width:p.width, height:p.height, pivotX:p.pivotX, pivotY:p.pivotY });
function asset(unity = false) {
  const a = { id:'image', name:'Image', src:'assets/map/image.png', width:122, height:69, crop:{x:0,y:0,w:122,h:69} };
  if(unity) a.unitySprite = { kind:'unity-single-sprite-v1', pixelsPerUnit:100, worldPixelsPerUnit:40, pivotX:.5, pivotY:.5 };
  return a;
}
function object() {
  return { id:'object', name:'Object', assetId:'image', x:100, y:100, width:125.25, height:80.5, pivotX:.3, pivotY:.95, rotation:-137, flipX:true, opacity:.7, mask:[[0,0],[1,0],[1,1]] };
}
function scene(unity = false) {
  return { format:'exoduser-map-scene', version:1, name:'Placement transaction', world:{cols:10,rows:10,tileSize:40},
    assets:[asset(unity)], layers:[{id:'ground',name:'Ground',visible:true,locked:false,sort:'foot',parallax:1,objects:[object()]}],
    walkable:Array(100).fill(1), start:{x:20,y:380}, exit:{x:380,y:20}, cameras:[] };
}
function freeze(value) {
  if(value && typeof value==='object') { Object.freeze(value); Object.values(value).forEach(freeze); }
  return value;
}

test('ordinary assets with no preset retain null fallback without altering their source', () => {
  const a = freeze(asset()), before = JSON.stringify(a);
  assert.equal(K.placementDefaults(a), null);
  assert.equal(K.unityPlacement(a), null);
  assert.equal(JSON.stringify(a), before);
});

test('capture copies only world size and pivots, preserving all source and object fields', () => {
  const a = freeze(asset()), o = freeze(object()), before = JSON.stringify({a,o});
  const captured = K.capturePlacement(a,o);
  assert.deepEqual(plain(captured), preset());
  assert.deepEqual(Object.keys(captured).sort(), ['height','kind','pivotX','pivotY','width']);
  captured.width=500; captured.pivotY=0;
  assert.equal(JSON.stringify({a,o}), before);
  assert.equal('placementPreset' in a, false);
  assert.deepEqual(plain(K.capturePlacement(a,o)), preset());
});

test('placement defaults accept inclusive bounds and fractional values without rounding or clamping', () => {
  for(const p of [preset(),{kind:'world-placement-v1',width:1,height:32000,pivotX:0,pivotY:1},{kind:'world-placement-v1',width:32000,height:1,pivotX:1,pivotY:0}]) {
    const a=freeze({...asset(),placementPreset:p}), before=JSON.stringify(a);
    const first=K.placementDefaults(a), second=K.placementDefaults(a);
    assert.deepEqual(plain(first), values(p));
    assert.notEqual(first,second);
    first.width=9; first.pivotX=.8;
    assert.deepEqual(plain(second),values(p));
    assert.equal(JSON.stringify(a),before);
  }
});

test('null, arrays, scalar presets and unknown kinds are rejected directly and on scene import', () => {
  for(const p of [null,[],[preset()],false,1,'world-placement-v1',{}, {...preset(),kind:'other'}, {...preset(),kind:undefined}]) {
    const a={...asset(),placementPreset:p}, s=scene(); s.assets[0]=a;
    assert.throws(()=>K.placementDefaults(a),/배치 규격/);
    assert.throws(()=>K.validate(s),/배치 규격/);
  }
});

test('all preset numeric fields reject missing, nonnumeric, nonfinite and out-of-range values', () => {
  for(const key of ['width','height','pivotX','pivotY']) {
    const bad=[undefined,null,false,'1',NaN,Infinity,-Infinity,-.01];
    bad.push(key==='width'||key==='height' ? 0 : 1.001);
    if(key==='width'||key==='height') bad.push(32000.01);
    for(const value of bad) {
      const a={...asset(),placementPreset:{...preset(),[key]:value}}, s=scene(); s.assets[0]=a;
      assert.throws(()=>K.placementDefaults(a),/배치 규격/);
      assert.throws(()=>K.validate(s),/배치 규격/);
    }
  }
});

test('capture rejects identity and numeric errors atomically', () => {
  const a=asset(), o=object(), before=JSON.stringify({a,o});
  for(const bad of [null,[],false,{...o,assetId:'different'},{...o,assetId:undefined}]) assert.throws(()=>K.capturePlacement(a,bad),/불일치/);
  assert.throws(()=>K.capturePlacement({...a,id:undefined},{...o,assetId:undefined}),/에셋 ID/);
  for(const key of ['width','height','pivotX','pivotY']) {
    for(const value of [null,'1',NaN,Infinity,-1,key==='width'||key==='height'?32001:1.1]) {
      assert.throws(()=>K.capturePlacement(a,{...o,[key]:value}),/배치 규격/);
    }
  }
  assert.equal(JSON.stringify({a,o}),before);
});

test('valid Unity placement is overridden by a preset and restored by deleting only the optional field', () => {
  const a=asset(true), original=JSON.stringify(a), base=plain(K.unityPlacement(a));
  assert.deepEqual(base,{width:48.8,height:27.599999999999998,pivotX:.5,pivotY:.5});
  a.placementPreset=K.capturePlacement(a,object());
  assert.deepEqual(plain(K.placementDefaults(a)),values(preset()));
  assert.deepEqual(plain(K.unityPlacement(a)),base);
  delete a.placementPreset;
  assert.deepEqual(plain(K.placementDefaults(a)),base);
  assert.equal(JSON.stringify(a),original);
});

test('a valid preset or capture cannot hide malformed Unity metadata or full-crop requirements', () => {
  const changes=[a=>{a.unitySprite=null;},a=>{a.unitySprite.kind='other';},a=>{a.unitySprite.pixelsPerUnit=0;},a=>{a.unitySprite.worldPixelsPerUnit=NaN;},a=>{a.crop.w=121;},a=>{a.unitySprite.pivotY=2;}];
  for(const mutate of changes) {
    const a=asset(true); a.placementPreset=preset(); mutate(a);
    const before=JSON.stringify(a), s=scene(true); s.assets[0]=a;
    assert.throws(()=>K.placementDefaults(a),/Unity/);
    assert.throws(()=>K.capturePlacement(a,object()),/Unity/);
    assert.throws(()=>K.validate(s),/Unity/);
    assert.equal(JSON.stringify(a),before);
  }
});

test('JSON v1 validation round-trips presets and Unity metadata as detached data', () => {
  for(const unity of [false,true]) {
    const s=scene(unity), originalObject=JSON.stringify(s.layers[0].objects), source=plain(s.assets[0]);
    s.assets[0].placementPreset=K.capturePlacement(s.assets[0],s.layers[0].objects[0]);
    const bytes=JSON.stringify(s), imported=K.validate(JSON.parse(bytes));
    assert.equal(JSON.stringify(imported),bytes);
    assert.equal(imported.version,1);
    assert.equal(JSON.stringify(imported.layers[0].objects),originalObject);
    const {placementPreset:ignored,...importedSource}=plain(imported.assets[0]);
    assert.deepEqual(importedSource,source);
    imported.assets[0].placementPreset.width=200;
    assert.equal(JSON.stringify(s),bytes);
  }
});

test('capturing a placement preset is one History edit with exact undo and redo', () => {
  const h=new K.History(scene(true)), original=JSON.stringify(h.project);
  assert.equal(h.change(p=>{p.assets[0].placementPreset=K.capturePlacement(p.assets[0],p.layers[0].objects[0]);}),true);
  const saved=JSON.stringify(h.project);
  assert.equal(h.undoStack.length,1);
  assert.deepEqual(plain(K.placementDefaults(h.project.assets[0])),values(preset()));
  assert.equal(h.undo(),true); assert.equal(JSON.stringify(h.project),original);
  assert.equal(h.redo(),true); assert.equal(JSON.stringify(h.project),saved);
});

test('restoring ordinary and Unity defaults is a reversible optional-field deletion', () => {
  for(const unity of [false,true]) {
    const s=scene(unity); s.assets[0].placementPreset=preset();
    const h=new K.History(s), captured=JSON.stringify(h.project);
    h.change(p=>{delete p.assets[0].placementPreset;});
    const restored=JSON.stringify(h.project);
    assert.equal('placementPreset' in h.project.assets[0],false);
    assert.deepEqual(plain(K.placementDefaults(h.project.assets[0])),unity?{width:48.8,height:27.599999999999998,pivotX:.5,pivotY:.5}:null);
    h.undo(); assert.equal(JSON.stringify(h.project),captured);
    h.redo(); assert.equal(JSON.stringify(h.project),restored);
  }
});

test('invalid preset edits roll back while keeping the existing redo branch', () => {
  const h=new K.History(scene());
  h.change(p=>{p.layers[0].objects[0].x=120;}); h.undo();
  const before=state(h);
  assert.throws(()=>h.change(p=>{p.assets[0].placementPreset={...preset(),width:0};}),/배치 규격/);
  assert.equal(state(h),before);
  assert.equal(h.redo(),true); assert.equal(h.project.layers[0].objects[0].x,120);
});

test('malformed preset imports preserve current project identity and an active pending transaction', () => {
  const h=new K.History(scene());
  h.change(p=>{p.layers[0].objects[0].x=120;}); h.undo();
  h.begin(); h.project.layers[0].objects[0].height=90;
  const before=state(h), identity=h.project;
  for(const invalid of [null,{...preset(),height:0},{...preset(),pivotX:'0.5'}]) {
    const incoming=scene(); incoming.assets[0].placementPreset=invalid;
    assert.throws(()=>h.import(incoming),/배치 규격/);
    assert.equal(state(h),before); assert.equal(h.project,identity);
  }
});

test('presets leave the actual resident scene registration, bodies, source pins and navigation unchanged', async () => {
  const filename=path.join(root,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
  const source=fs.readFileSync(filename), original=JSON.parse(source), h=new K.History(original);
  const {residentPaintingProfile}=await import(pathToFileURL(path.join(__dirname,'map-scene-rift-residents.mjs')).href);
  assert.ok(residentPaintingProfile(h.project));
  h.change(p=>{
    const o=p.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-haran');
    const a=p.assets.find(a=>a.id===o.assetId);
    a.placementPreset=K.capturePlacement(a,o);
  });
  const validated=K.validate(JSON.parse(JSON.stringify(h.project)));
  for(const key of ['layers','world','walkable','start','exit','sourcePins','residentLayerReview']) assert.deepEqual(plain(validated[key]),original[key]);
  const withoutPreset=plain(validated); withoutPreset.assets.forEach(a=>{delete a.placementPreset;});
  assert.deepEqual(withoutPreset,original);
  assert.ok(residentPaintingProfile(validated));
  assert.equal(K.route(validated).pass,true);
  assert.deepEqual(fs.readFileSync(filename),source);
});
