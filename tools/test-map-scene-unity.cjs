'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
// This checkout is type:module; execute the UMD CommonJS branch explicitly,
// matching a CJS host without relying on Node's require(ESM) namespace.
const unityModule = {exports:{}};
const U = vm.runInThisContext('(function(module){\n' +
  fs.readFileSync(path.join(__dirname,'map-scene-unity.js'),'utf8') +
  '\nreturn module.exports;\n})',{filename:'map-scene-unity.js'})(unityModule);
const context = vm.createContext({ module: { exports: {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname,'map-scene-core.js'),'utf8'),context);
const K = context.module.exports;
const plain = v => JSON.parse(JSON.stringify(v));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const root = path.resolve(__dirname,'..');
const existingMeta = path.join(root,'assets/vfx_impact/_unity_preview/Assets/Ultimate Impact Fx/UI/button.png.meta');
const existingPng = existingMeta.slice(0,-5);
function meta(fields = {}, extras = '') {
  const values = {textureType:8,spriteMode:1,spritePixelsToUnits:100,alignment:0,...fields};
  return 'fileFormatVersion: 2\nguid: 0123456789abcdef0123456789abcdef\nTextureImporter:\n' +
    Object.entries(values).filter(([,v])=>v!==undefined).map(([k,v])=>'  '+k+': '+v+'\n').join('') + extras;
}
function rejected(text, label = '') { assert.throws(()=>U.parseMeta(text),/Unity 메타:.*[가-힣]/,label); }
function asset(info = U.parseMeta(meta()), width = 122, height = 69, unit = 40) {
  return {id:'unity-image',name:'Unity source image',src:'assets/map/unity-fixture.png',width,height,crop:{x:0,y:0,w:width,h:height},
    unitySprite:{kind:'unity-single-sprite-v1',...info,worldPixelsPerUnit:unit}};
}
function scene(a = asset()) {
  const placement = K.unityPlacement(a);
  return {format:'exoduser-map-scene',version:1,name:'Unity import contract fixture',world:{cols:10,rows:10,tileSize:40},assets:[a],
    layers:[{id:'ground',name:'Ground',visible:true,locked:false,sort:'foot',parallax:1,objects:[{
      id:'placed-sprite',assetId:a.id,name:'Placed',x:100,y:100,...placement,rotation:0,opacity:1,flipX:false
    }]}],walkable:Array(100).fill(1),start:{x:20,y:380},exit:{x:380,y:20},cameras:[]};
}
const state = h => JSON.stringify({project:h.project,undo:h.undoStack,redo:h.redoStack,pending:h.pending});

test('UMD exposes the same pure parser in Node and a browser without DOM or YAML dependencies', () => {
  const browser = vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'map-scene-unity.js'),'utf8'),browser);
  assert.equal(typeof browser.MapSceneUnity.parseMeta,'function');
  assert.deepEqual(plain(browser.MapSceneUnity.parseMeta(meta())),U.parseMeta(meta()));
  const result = U.parseMeta(meta()); result.pixelsPerUnit = 1;
  assert.equal(U.parseMeta(meta()).pixelsPerUnit,100);
  assert.deepEqual(Object.keys(U),['parseMeta']);
});

test('existing Unity single-sprite metadata and PNG retain exact pins and full bitmap dimensions', () => {
  const bytes = fs.readFileSync(existingMeta), png = fs.readFileSync(existingPng);
  assert.equal(bytes.length,2082); assert.equal(sha(bytes),'3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c');
  assert.equal(sha(png),'9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec');
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]); assert.equal(png.toString('ascii',12,16),'IHDR');
  assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[122,69]);
  assert.deepEqual(U.parseMeta(bytes.toString('utf8')),{pixelsPerUnit:100,pivotX:.5,pivotY:.5});
});

test('Unity fixed alignment enums override a supplied custom pivot and map to downward-positive coordinates', () => {
  const expected = [[.5,.5],[0,0],[.5,0],[1,0],[0,.5],[1,.5],[0,1],[.5,1],[1,1]];
  for (let alignment=0;alignment<9;alignment++) {
    const result = U.parseMeta(meta({alignment,spritePivot:'{x: .17, y: .83}'}));
    assert.deepEqual([result.pivotX,result.pivotY],expected[alignment]);
    assert.deepEqual(U.parseMeta(meta({alignment})),result);
  }
});

test('custom pivots invert Unity y and accept BOM, CRLF, spacing, comments and scientific notation', () => {
  const text = '\uFEFF# Unity image\r\nfileFormatVersion : 2  # version\r\nTextureImporter :\r\n' +
    '  textureType : +8\r\n  spriteMode: 1\r\n  spritePixelsToUnits : 2.5e+2\r\n  alignment: 9\r\n' +
    '  spritePivot: { y : 2.5e-1 , x : .75 }  # custom\r\n  spriteBorder: {w: 0e2,z: -0,y: +0,x: 0.0}\r\n  textureShape: 1\r\n';
  assert.deepEqual(U.parseMeta(text),{pixelsPerUnit:250,pivotX:.75,pivotY:.75});
  for (const [x,y] of [[0,0],[1,1],[0,1],[1,0]]) assert.deepEqual(U.parseMeta(meta({alignment:9,spritePivot:`{x:${x},y:${y}}`})),{pixelsPerUnit:100,pivotX:x,pivotY:1-y});
});

test('UTF-8 limit counts bytes exactly rather than code units and malformed inputs reject clearly', () => {
  const base = meta()+'# ', available = 256000-Buffer.byteLength(base);
  const exact = base+'가'.repeat(Math.floor(available/3))+'x'.repeat(available%3);
  assert.equal(Buffer.byteLength(exact),256000); assert.deepEqual(U.parseMeta(exact),U.parseMeta(meta()));
  rejected(exact+'x','one byte over'); rejected(base+'😀'.repeat(Math.floor(available/4)+1),'four-byte Unicode');
  for (const bad of [null,undefined,{},Buffer.from(meta()),'',meta()+'\u0000',meta()+'\uFEFF']) rejected(bad);
});

test('file version and one actual root TextureImporter are required; other importers or documents never fall back', () => {
  for (const text of [
    meta().replace('fileFormatVersion: 2\n',''),meta().replace('fileFormatVersion: 2','fileFormatVersion: 1'),
    meta().replace('fileFormatVersion: 2','fileFormatVersion: 3'),meta()+'fileFormatVersion: 2\n',
    meta()+'TextureImporter:\n',meta().replace('TextureImporter:','TextureImporter: {}'),
    meta().replace('TextureImporter:','NativeFormatImporter:'),meta().replace('TextureImporter:','MonoImporter:'),
    'fileFormatVersion: 2\nguid: abc\n',meta()+'PrefabImporter: {}\n','%YAML 1.1\n'+meta(),'---\n'+meta(),meta()+'...\n'
  ]) rejected(text);
});

test('required fields cannot be omitted, duplicated or smuggled from nested mappings or list entries', () => {
  for (const key of ['textureType','spriteMode','spritePixelsToUnits','alignment']) {
    rejected(meta({[key]:undefined}),key+' missing');
    const valid = {textureType:8,spriteMode:1,spritePixelsToUnits:100,alignment:0}[key];
    rejected(meta({},'  '+key+': '+valid+'\n'),key+' duplicate');
    rejected(meta({[key]:undefined},'  spriteSheet:\n    '+key+': '+valid+'\n'),key+' nested fake');
    rejected(meta({[key]:undefined},'  - '+key+': '+valid+'\n'),key+' list fake');
    rejected(meta().replace('  '+key+':',' '+key+':'),key+' wrong indent');
    rejected(meta().replace('  '+key+':','\t'+key+':'),key+' tab indent');
    rejected(meta({},'  spriteSheet:\n    '+key+': '+valid+'\n'),key+' extra nested fake');
  }
  for (const extra of ['  TextureImporter:\n','  fileFormatVersion: 2\n','  textureShape: 1\n  textureShape: 1\n','  userData: a\n  userData: b\n']) rejected(meta({},extra));
});

test('only single Sprite type8, 2D shape1 and zero inline 9-slice border are supported', () => {
  for (const type of [0,1,2,7,9,'8x','"8"']) rejected(meta({textureType:type}),'textureType '+type);
  for (const mode of [0,2,3,'1x']) rejected(meta({spriteMode:mode}),'spriteMode '+mode);
  for (const shape of [0,2,3,4,'1x']) rejected(meta({textureShape:shape}),'textureShape '+shape);
  assert.deepEqual(U.parseMeta(meta({textureShape:1,spriteBorder:'{x:0,y:0,z:0,w:0}'})),U.parseMeta(meta()));
  for (const border of ['{x:1,y:0,z:0,w:0}','{x:0,y:0,z:0}','{x:0,y:0,z:0,w:0,w:0}','{x:0,y:0,z:0,w:0,q:0}','[]','', '{x:0,y:0,z:0,w:NaN}']) rejected(meta({spriteBorder:border}));
});

test('PPU and alignment use strict finite numeric syntax and inclusive supported bounds', () => {
  for (const ppu of ['.001','1e6','+1e2','100.']) assert.equal(U.parseMeta(meta({spritePixelsToUnits:ppu})).pixelsPerUnit,Number(ppu));
  for (const ppu of [0,-1,'.000999','1000001','1e999','NaN','Infinity','.inf','"100"','0x64','100px','1/100','null','']) rejected(meta({spritePixelsToUnits:ppu}));
  for (const alignment of [-1,10,1.5,'NaN','"0"','0tail']) rejected(meta({alignment}));
});

test('custom pivot requires exact inline xy values, with no duplicates, missing coordinates or nonfinite values', () => {
  rejected(meta({alignment:9}));
  for (const pivot of ['', '{}','{x:.5}','{x:.5,y:.5,z:0}','{x:.5,x:.5,y:.5}','{x:-.01,y:.5}','{x:.5,y:1.01}','{x:Infinity,y:.5}','{x:".5",y:.5}','[.5,.5]']) rejected(meta({alignment:9,spritePivot:pivot}));
  rejected(meta({spritePivot:'{x:2,y:2}'}),'Provided noncustom pivot still needs valid metadata syntax');
  rejected(meta({alignment:9,spritePivot:'{x:.5,y:.5}'},'  spritePivot: {x:0,y:0}\n'));
  rejected(meta({alignment:9,spritePivot:undefined},'  spriteSheet:\n    spritePivot: {x:.5,y:.5}\n'));
});

test('anchors, aliases, tags and YAML merges never execute; quoted unrelated strings and comments stay inert', () => {
  for (const extra of ['  userData: &ref hello\n','  userData: *ref\n','  userData: !!str text\n','  userData: !custom text\n','  <<: {alignment: 9}\n','  spriteSheet:\n    userData: &nested value\n']) rejected(meta({},extra));
  rejected(meta().replace('TextureImporter:','TextureImporter: &importer'));
  const inert = meta({},'  userData: "&ref !custom *alias # text"\n  assetBundleName: \'not !a &tag\'\n# &anchor !!tag\n');
  assert.deepEqual(U.parseMeta(inert),U.parseMeta(meta()));
});

test('unknown plain scalars keep apostrophes and interior quotes while genuine quoted and flow values stay protected', () => {
  for (const value of ["player's sprite",'authored "rough sprite','art, "unfinished','asset [rough " sketch']) {
    assert.deepEqual(U.parseMeta(meta({},'  userData: '+value+'\n')),U.parseMeta(meta()),value);
  }
  const quoted = '  userData: "player\'s \\"sprite\\" # &inert !tag *alias" # &comment\n' +
    '  assetBundleName: \'player\'\'s # &inert\'\n' +
    '  spriteSheet:\n    labels: ["# &inert !tag", {key: \'*inert\'}]\n    names:\n      - "# &inert !tag"\n';
  assert.deepEqual(U.parseMeta(meta({},quoted)),U.parseMeta(meta()));
  assert.deepEqual(U.parseMeta(meta({},"  userData: player's # &comment !tag\n")),U.parseMeta(meta()));
  for (const extra of [
    '  userData: "unfinished\n',"  userData: 'unfinished\n",
    '  userData: ["unfinished]\n','  userData: {key: &ref value}\n',
    '  userData: [*ref]\n','  userData: [!custom value]\n',
    "  userData: player's sprite &ref\n",'  userData: plain "text &ref\n'
  ]) rejected(meta({},extra));
});

test('core places full sprites in world units from PPU, preserving normalized pivot and caller data', () => {
  const a = asset(U.parseMeta(meta({alignment:9,spritePivot:'{x:.25,y:.8}'}))), before = JSON.stringify(a);
  assert.deepEqual(plain(K.unityPlacement(a)),{width:122/100*40,height:69/100*40,pivotX:.25,pivotY:1-.8});
  assert.equal(JSON.stringify(a),before);
  const ordinary = plain(a); delete ordinary.unitySprite; assert.equal(K.unityPlacement(ordinary),null);
  const p = scene(a); assert.deepEqual(plain(K.validate(p)),p);
  assert.equal(p.layers[0].objects[0].height,69/100*40);
});

test('core size limits include both image dimensions, world unit bounds and computed width and height', () => {
  for (const [w,h,ppu,unit,expected] of [[1,1,1,1,1],[8192,8192,8192,32000,32000],[1,1,.001,1,1000],[8192,8192,1e6,1000,8.192]]) {
    const a = asset({pixelsPerUnit:ppu,pivotX:0,pivotY:1},w,h,unit), result = K.unityPlacement(a);
    assert.ok(Math.abs(result.width-expected)<1e-12); assert.ok(Math.abs(result.height-expected)<1e-12);
  }
  for (const [w,h,ppu,unit] of [[0,69,100,40],[8193,69,100,40],[122,0,100,40],[122,8193,100,40],[122,69,100,0],[122,69,100,32001],[1,1,1e6,1],[8192,8192,.001,32000],[100,1,100,1],[1,100,100,1]]) {
    assert.throws(()=>K.unityPlacement(asset({pixelsPerUnit:ppu,pivotX:.5,pivotY:1},w,h,unit)),/Unity/);
  }
});

test('core rejects malformed Unity metadata and partial crops on direct placement and scene import', () => {
  const changes = [
    a=>{a.unitySprite=null;},a=>{a.unitySprite=[];},a=>{a.unitySprite={};},a=>{a.unitySprite.kind='unity-multiple';},
    a=>{a.unitySprite.pixelsPerUnit='100';},a=>{a.unitySprite.pixelsPerUnit=.0001;},a=>{a.unitySprite.pixelsPerUnit=Infinity;},
    a=>{a.unitySprite.worldPixelsPerUnit='40';},a=>{a.unitySprite.pivotX=-.01;},a=>{a.unitySprite.pivotY=1.01;},
    a=>{delete a.unitySprite.pivotY;},a=>{a.crop.x=1;a.crop.w-=1;},a=>{a.crop.y=1;a.crop.h-=1;},a=>{a.crop.w-=1;},a=>{a.crop.h-=1;}
  ];
  for (const mutate of changes) {
    const p = scene(), a = p.assets[0]; mutate(a); const before = JSON.stringify(p);
    assert.throws(()=>K.unityPlacement(a),/Unity/); assert.throws(()=>K.validate(p),/Unity/);
    assert.equal(JSON.stringify(p),before);
  }
});

test('valid Unity source metadata survives JSON/history and malformed restore is atomic without losing redo', () => {
  const original = scene(), history = new K.History(original), nav = JSON.stringify(original.walkable), startExit = JSON.stringify([original.start,original.exit]);
  const imported = scene(asset(U.parseMeta(meta({alignment:9,spritePivot:'{x:.2,y:.3}',spritePixelsToUnits:200})),122,69,80));
  history.import(imported); const current = plain(history.project);
  assert.deepEqual(plain(K.validate(JSON.parse(JSON.stringify(current)))),current);
  imported.assets[0].unitySprite.pixelsPerUnit=50; assert.deepEqual(plain(history.project),current);
  assert.equal(history.undo(),true); assert.deepEqual(plain(history.project),original);
  const before = state(history), identity = history.project;
  for (const edit of [p=>{p.assets[0].unitySprite.pixelsPerUnit=0;},p=>{p.assets[0].unitySprite.pivotY=2;},p=>{p.assets[0].crop.h-=1;}]) {
    const bad = plain(current); edit(bad); assert.throws(()=>history.import(bad),/Unity/);
    assert.equal(state(history),before); assert.equal(history.project,identity);
  }
  assert.throws(()=>history.change(p=>{p.assets[0].unitySprite.worldPixelsPerUnit=0;}),/Unity/); assert.equal(state(history),before);
  assert.equal(history.redo(),true); assert.deepEqual(plain(history.project),current);
  assert.equal(JSON.stringify(history.project.walkable),nav); assert.equal(JSON.stringify([history.project.start,history.project.exit]),startExit);
  assert.equal(sha(fs.readFileSync(existingMeta)),'3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c');
  assert.equal(sha(fs.readFileSync(existingPng)),'9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec');
});
