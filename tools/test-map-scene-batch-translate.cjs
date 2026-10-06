'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const sandbox=vm.createContext({module:{exports:{}}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'map-scene-core.js'),'utf8'),sandbox,{filename:'map-scene-core.js'});
const K=sandbox.module.exports;
const plain=v=>JSON.parse(JSON.stringify(v));
const state=h=>JSON.stringify({project:h.project,undo:h.undoStack,redo:h.redoStack,pending:h.pending});
const root=path.resolve(__dirname,'..');
function freeze(v){if(v&&typeof v==='object'){Object.freeze(v);Object.values(v).forEach(freeze);}return v;}
function objects(){return [{id:'left',x:10.25,y:-20.5},{id:'right',x:27.75,y:13.125},{id:'third',x:-3.5,y:8.75}];}
function scene(){return {format:'exoduser-map-scene',version:1,name:'Group movement',world:{cols:10,rows:10,tileSize:40},
  assets:[{id:'image',name:'Image',src:'assets/map/image.png',width:100,height:100,crop:{x:0,y:0,w:100,h:100}}],
  layers:[{id:'foot',name:'Foot',visible:true,locked:false,sort:'foot',parallax:1,objects:objects().map(o=>({...o,assetId:'image',name:o.id,width:40,height:80,pivotX:.5,pivotY:1,rotation:90,flipX:true,opacity:.7,mask:[[0,0],[1,0],[1,1]]}))}],
  walkable:Array(100).fill(1),start:{x:20,y:380},exit:{x:380,y:20},cameras:[]};}
function apply(p,updates){for(const update of updates){const o=p.layers.flatMap(l=>l.objects).find(o=>o.id===update.objectId);o.x=update.x;o.y=update.y;}}

test('common fractional translation preserves relative distances without individual snapping or clamping',()=>{
  const source=freeze(objects()),before=JSON.stringify(source),out=plain(K.translateObjects(source,40.5,-12.25));
  assert.deepEqual(out,[{objectId:'left',x:50.75,y:-32.75},{objectId:'right',x:68.25,y:.875},{objectId:'third',x:37,y:-3.5}]);
  for(let i=1;i<source.length;i++){assert.equal(out[i].x-out[0].x,source[i].x-source[0].x);assert.equal(out[i].y-out[0].y,source[i].y-source[0].y);}
  assert.equal(JSON.stringify(source),before);
});

test('zero delta returns fresh rows and never aliases the input or a previous result',()=>{
  const source=objects(),out=K.translateObjects(source,0,0),again=K.translateObjects(source,0,0),before=JSON.stringify(source);
  assert.notEqual(out,source);assert.notEqual(out,again);assert.notEqual(out[0],source[0]);assert.notEqual(out[0],again[0]);
  assert.deepEqual(Object.keys(out[0]).sort(),['objectId','x','y']);
  out[0].x=300;out.reverse();assert.equal(JSON.stringify(source),before);assert.deepEqual(plain(again),plain(K.translateObjects(source,0,0)));
});

test('inclusive coordinate and delta bounds allow exact edge-to-edge moves',()=>{
  assert.deepEqual(plain(K.translateObjects([{id:'min',x:-40000,y:-40000}],80000,80000)),[{objectId:'min',x:40000,y:40000}]);
  assert.deepEqual(plain(K.translateObjects([{id:'max',x:40000,y:40000}],-80000,-80000)),[{objectId:'max',x:-40000,y:-40000}]);
  assert.deepEqual(plain(K.translateObjects([{id:'edge',x:40000,y:-40000}],0,0)),[{objectId:'edge',x:40000,y:-40000}]);
});

test('one overflowing object rejects the whole plan and leaves every input unchanged',()=>{
  for(const [source,dx,dy] of [
    [[{id:'safe',x:0,y:0},{id:'edge',x:40000,y:0}],.25,0],
    [[{id:'safe',x:0,y:0},{id:'edge',x:0,y:-40000}],0,-.25]
  ]){const before=JSON.stringify(source);assert.throws(()=>K.translateObjects(source,dx,dy),/결과/);assert.equal(JSON.stringify(source),before);}
});

test('arrays must contain one to two thousand object records',()=>{
  for(const bad of [null,{},'objects',[],[null],[[]],[false],new Array(2),Array.from({length:2001},(_,i)=>({id:String(i),x:0,y:0}))]) assert.throws(()=>K.translateObjects(bad,0,0));
});

test('object IDs are strict nonblank strings and duplicates reject the entire group',()=>{
  for(const id of [undefined,null,1,false,'',' ','x'.repeat(161)]) assert.throws(()=>K.translateObjects([{id,x:0,y:0}],0,0),/ID/);
  const source=[{id:'same',x:0,y:0},{id:'same',x:10,y:10}],before=JSON.stringify(source);
  assert.throws(()=>K.translateObjects(source,0,0),/중복/);assert.equal(JSON.stringify(source),before);
  assert.equal(K.translateObjects([{id:'x'.repeat(160),x:0,y:0}],0,0)[0].objectId.length,160);
});

test('source coordinates reject missing, coerced, nonfinite and out-of-bound numbers',()=>{
  for(const key of ['x','y']) for(const bad of [undefined,null,false,'0',NaN,Infinity,-Infinity,-40000.001,40000.001]){
    const source=[{id:'a',x:0,y:0},{id:'b',x:10,y:10,[key]:bad}],before=JSON.stringify(source);
    assert.throws(()=>K.translateObjects(source,0,0),/객체 [xy]/);assert.equal(JSON.stringify(source),before);
  }
});

test('deltas reject missing, coerced, nonfinite and out-of-bound numbers before any movement',()=>{
  const source=freeze(objects()),before=JSON.stringify(source);
  for(const bad of [undefined,null,false,'0',NaN,Infinity,-Infinity,-80000.001,80000.001]){
    assert.throws(()=>K.translateObjects(source,bad,0),/이동 x/);assert.throws(()=>K.translateObjects(source,0,bad),/이동 y/);
  }
  assert.equal(JSON.stringify(source),before);
});

test('the two-thousand-object boundary preserves input order and shared offsets',()=>{
  const source=Array.from({length:2000},(_,i)=>({id:'o-'+i,x:i+.25,y:i-.125})),before=JSON.stringify(source),out=K.translateObjects(source,.5,-.25);
  assert.equal(out.length,2000);assert.equal(out[0].objectId,'o-0');assert.equal(out[1999].objectId,'o-1999');
  for(let i=0;i<source.length;i++){assert.equal(out[i].x-source[i].x,.5);assert.equal(out[i].y-source[i].y,-.25);}
  assert.equal(JSON.stringify(source),before);
});

test('translation reads only ID and coordinates, ignoring all unrelated fields and scene data',()=>{
  const source=[{id:'a',x:1,y:2},{id:'b',x:3,y:4}];
  const forbidden=()=>{throw new Error('Unrelated field read');};
  for(const o of source)for(const key of ['assetId','width','height','mask','rotation','nav','assets','src','toJSON'])Object.defineProperty(o,key,{get:forbidden});
  assert.deepEqual(plain(K.translateObjects(source,10,20)),[{objectId:'a',x:11,y:22},{objectId:'b',x:13,y:24}]);
});

test('one History edit moves all objects, with exact Undo, Redo and JSON v1 round-trip',()=>{
  const h=new K.History(scene()),original=JSON.stringify(h.project);
  h.change(p=>apply(p,K.translateObjects(p.layers[0].objects,40.5,12.25)));
  const moved=JSON.stringify(h.project);assert.equal(h.undoStack.length,1);
  assert.equal(h.project.version,1);assert.equal(JSON.stringify(K.validate(JSON.parse(moved))),moved);
  assert.equal(h.undo(),true);assert.equal(JSON.stringify(h.project),original);
  assert.equal(h.redo(),true);assert.equal(JSON.stringify(h.project),moved);
});

test('an invalid group move rolls back atomically and preserves the prior redo branch',()=>{
  const h=new K.History(scene());h.change(p=>{p.layers[0].objects[0].x=150;});h.undo();
  const before=state(h);
  assert.throws(()=>h.change(p=>apply(p,K.translateObjects(p.layers[0].objects,40000,0))),/결과/);
  assert.equal(state(h),before);assert.equal(h.redo(),true);assert.equal(h.project.layers[0].objects[0].x,150);
});

test('actual v2 resident group moves preserve image registration, pixels, navigation and all non-coordinate fields',()=>{
  const file=path.join(root,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json'),raw=fs.readFileSync(file),original=JSON.parse(raw),h=new K.History(original);
  assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  h.change(p=>{
    const members=p.layers.find(l=>l.id==='foot').objects.filter(o=>o.id.startsWith('obj-resident-'));
    assert.equal(members.length,4);apply(p,K.translateObjects(members,40,-20));
  });
  const normalized=plain(h.project);
  for(const l of normalized.layers)for(const o of l.objects)if(o.id.startsWith('obj-resident-')){const old=original.layers.find(v=>v.id===l.id).objects.find(v=>v.id===o.id);assert.equal(o.x,old.x+40);assert.equal(o.y,old.y-20);o.x=old.x;o.y=old.y;}
  assert.deepEqual(normalized,original);
  assert.equal(JSON.stringify(h.project.assets),JSON.stringify(original.assets));
  assert.deepEqual(plain(h.project.walkable),original.walkable);
  assert.equal(h.project.walkable.filter(v=>v===1).length,1192);
  h.undo();assert.deepEqual(plain(h.project),original);h.redo();assert.deepEqual(plain(h.project.walkable),original.walkable);
  assert.deepEqual(fs.readFileSync(file),raw);
});
