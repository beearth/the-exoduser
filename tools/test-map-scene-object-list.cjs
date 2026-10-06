'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const moduleReady=import(pathToFileURL(path.join(__dirname,'map-scene-object-list.mjs')).href);
const copy=value=>JSON.parse(JSON.stringify(value));
const root=path.resolve(__dirname,'..');
const sceneFile=path.join(root,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
function object(id,y=100) {return {id,assetId:'atlas-'+id,name:'주민 '+id,x:120,y,width:40,height:80};}
function layer(id='active',objects=[object('first'),object('second')],sort='flat') {
  return {id,name:'레이어 '+id,visible:true,locked:false,parallax:1,sort,objects};
}
function scene(l=layer()) {
  return {format:'exoduser-map-scene',version:1,world:{cols:100,rows:60,tileSize:40},layers:[l,layer('other',[object('inactive')])]};
}
function freeze(value) {if(value&&typeof value==='object'){Object.freeze(value);Object.values(value).forEach(freeze);}return value;}

test('flat listing uses reverse draw order and only the requested active layer',async()=>{
  const U=await moduleReady,s=scene(layer('active',[object('a'),object('b'),object('c')]));
  const r=U.inspectLayerObjects(s,'active');
  assert.equal(U.OBJECT_LIST_PAGE_SIZE,50);
  assert.deepEqual(r.rows.map(o=>o.objectId),['c','b','a']);
  assert.deepEqual({...r,rows:[]},{layerId:'active',layerName:'레이어 active',locked:false,visible:true,total:3,matched:3,page:0,pages:1,rows:[]});
  assert.equal(r.rows.some(o=>o.objectId==='inactive'),false);
});

test('foot listing reverses stable y draw order, selecting later insertions first on a tie',async()=>{
  const U=await moduleReady,s=scene(layer('active',[object('early',100),object('tie-a',200),object('low',50),object('tie-b',200)],'foot'));
  const before=JSON.stringify(s);
  assert.deepEqual(U.inspectLayerObjects(s,'active').rows.map(o=>o.objectId),['tie-b','tie-a','early','low']);
  assert.equal(JSON.stringify(s),before);
});

test('search trims and lowercases name, object ID and asset ID without leaking inactive matches',async()=>{
  const U=await moduleReady,s=scene(layer('active',[
    {...object('Alpha'),name:'Haran Resident'}, {...object('Beta'),assetId:'Resident-Atlas'}, {...object('Gamma'),name:'망자 네사'}
  ]));
  assert.deepEqual(U.inspectLayerObjects(s,'active','  hArAn  ').rows.map(o=>o.objectId),['Alpha']);
  assert.deepEqual(U.inspectLayerObjects(s,'active','BETA').rows.map(o=>o.objectId),['Beta']);
  assert.deepEqual(U.inspectLayerObjects(s,'active',' ATLAS ').rows.map(o=>o.objectId),['Gamma','Beta','Alpha']);
  assert.deepEqual(U.inspectLayerObjects(s,'active','네사').rows.map(o=>o.objectId),['Gamma']);
  assert.equal(U.inspectLayerObjects(s,'active','inactive').matched,0);
});

test('fifty-row pages preserve order and clamp overflow to the final partial page',async()=>{
  const U=await moduleReady,s=scene(layer('active',Array.from({length:125},(_,i)=>object('o-'+i))));
  const first=U.inspectLayerObjects(s,'active'),second=U.inspectLayerObjects(s,'active','',1),last=U.inspectLayerObjects(s,'active','',1000000);
  assert.equal(first.rows.length,50);assert.equal(first.rows[0].objectId,'o-124');assert.equal(first.rows[49].objectId,'o-75');
  assert.equal(second.rows.length,50);assert.equal(second.rows[0].objectId,'o-74');
  assert.equal(last.page,2);assert.equal(last.pages,3);assert.equal(last.matched,125);assert.equal(last.rows.length,25);assert.equal(last.rows[24].objectId,'o-0');
});

test('no matches and empty layers return page zero and zero pages',async()=>{
  const U=await moduleReady;
  for(const s of [scene(),scene(layer('active',[]))]) {
    const r=U.inspectLayerObjects(s,'active','nothing-matches',1000);
    assert.equal(r.page,0);assert.equal(r.pages,0);assert.equal(r.matched,0);assert.deepEqual(r.rows,[]);
  }
  assert.equal(U.inspectLayerObjects(scene(layer('active',[])),'active').total,0);
});

test('rows and results are detached fresh values and frozen scene objects are never mutated',async()=>{
  const U=await moduleReady,s=freeze(scene()),before=JSON.stringify(s);
  const r=U.inspectLayerObjects(s,'active'),again=U.inspectLayerObjects(s,'active');
  assert.notEqual(r,again);assert.notEqual(r.rows,again.rows);assert.notEqual(r.rows[0],again.rows[0]);
  assert.deepEqual(Object.keys(r.rows[0]).sort(),['assetId','height','name','objectId','width','x','y']);
  r.rows[0].x=999;r.rows[0].name='Changed';r.rows.reverse();r.visible=false;
  assert.equal(JSON.stringify(s),before);assert.deepEqual(U.inspectLayerObjects(s,'active'),again);
});

test('queries do not clone the scene or read assets, bitmap data, navigation or inactive object arrays',async()=>{
  const U=await moduleReady,s=scene();
  const forbidden=()=>{throw new Error('Unrelated large data accessed');};
  for(const key of ['assets','walkable','toJSON']) Object.defineProperty(s,key,{get:forbidden});
  Object.defineProperty(s.layers[1],'objects',{get:forbidden});
  assert.equal(U.inspectLayerObjects(s,'active').total,2);
  assert.deepEqual(U.focusObjectFoot(s,'active','first'),{x:120,y:100});
});

test('unknown and malformed layer structures, duplicates and the 2000-object cap fail without mutation',async()=>{
  const U=await moduleReady;
  const mutations=[s=>{s.layers=[];},s=>{s.layers=null;},s=>{s.layers.push(copy(s.layers[0]));},s=>{s.layers[0].objects=null;},s=>{s.layers[0].objects.push(copy(s.layers[0].objects[0]));},s=>{s.layers[0].objects=Array.from({length:2001},(_,i)=>object('o-'+i));},s=>{s.layers[0].sort='depth';},s=>{s.layers[0].visible=1;},s=>{s.layers[0].locked='false';},s=>{s.layers[0].name=' ';}];
  for(const mutate of mutations) {const s=scene();mutate(s);const before=JSON.stringify(s);assert.throws(()=>U.inspectLayerObjects(s,'active'));assert.equal(JSON.stringify(s),before);}
  assert.equal(U.inspectLayerObjects(scene(layer('active',Array.from({length:2000},(_,i)=>object('o-'+i)))),'active').total,2000);
  assert.throws(()=>U.inspectLayerObjects(scene(),'missing'),/레이어/);
  assert.throws(()=>U.inspectLayerObjects(null,'active'),/씬/);
});

test('required object identifiers, names, size and coordinates are strictly validated',async()=>{
  const U=await moduleReady;
  for(const key of ['id','assetId','name']) for(const bad of [null,[],1,'',' ','a'.repeat(161)]) {
    const s=scene();s.layers[0].objects[0][key]=bad;assert.throws(()=>U.inspectLayerObjects(s,'active'));
  }
  for(const key of ['x','y','width','height']) for(const bad of [null,'1',NaN,Infinity,-Infinity,key==='x'||key==='y'?40000.1:0]) {
    const s=scene();s.layers[0].objects[0][key]=bad;const before=JSON.stringify(s);assert.throws(()=>U.inspectLayerObjects(s,'active'));assert.equal(JSON.stringify(s),before);
  }
  for(const p of [null,'1',NaN,Infinity,-.001,1.001]) {const s=scene();s.layers[0].parallax=p;assert.throws(()=>U.inspectLayerObjects(s,'active'));}
});

test('invalid query and page inputs are rejected atomically instead of coerced',async()=>{
  const U=await moduleReady,s=freeze(scene()),before=JSON.stringify(s);
  for(const q of [null,[],{},true,1,'x'.repeat(161)]) assert.throws(()=>U.inspectLayerObjects(s,'active',q),/검색어/);
  for(const p of [null,'1',NaN,Infinity,-1,.5,1000001]) assert.throws(()=>U.inspectLayerObjects(s,'active','',p),/페이지/);
  assert.equal(JSON.stringify(s),before);
});

test('foot focus solves parallax one and one-half without clamping, and zero returns null',async()=>{
  const U=await moduleReady,s=scene(layer('active',[{...object('body'),x:1000,y:1500}])),l=s.layers[0];
  assert.deepEqual(U.focusObjectFoot(s,'active','body'),{x:1000,y:1500});
  l.parallax=.5;assert.deepEqual(U.focusObjectFoot(s,'active','body'),{x:0,y:1800});
  l.visible=false;l.locked=true;assert.deepEqual(U.focusObjectFoot(s,'active','body'),{x:0,y:1800},'visibility and lock guards belong to UI');
  l.parallax=0;assert.equal(U.focusObjectFoot(s,'active','body'),null);
  l.parallax=.5;l.objects[0].x=-40000;assert.equal(U.focusObjectFoot(s,'active','body').x,-82000,'caller applies viewport bounds');
});

test('focus rejects unknown identities, invalid world bounds and nonfinite camera solves',async()=>{
  const U=await moduleReady;
  for(const mutate of [s=>{s.world=null;},s=>{s.world.cols=9;},s=>{s.world.rows=301;},s=>{s.world.cols=10.5;},s=>{s.world.tileSize='40';},s=>{s.world.tileSize=7.99;},s=>{s.world.tileSize=128.01;}]) {
    const s=scene();mutate(s);const before=JSON.stringify(s);assert.throws(()=>U.focusObjectFoot(s,'active','first'),/월드/);assert.equal(JSON.stringify(s),before);
  }
  assert.throws(()=>U.focusObjectFoot(scene(),'active','unknown'),/객체/);
  const tiny=scene();tiny.layers[0].parallax=1e-320;assert.throws(()=>U.focusObjectFoot(tiny,'active','first'),/카메라/);
});

test('actual v2 foot listing locates all four residents behind the foreground without profile dependencies',async()=>{
  const U=await moduleReady,s=JSON.parse(fs.readFileSync(sceneFile,'utf8')),before=JSON.stringify(s);
  assert.deepEqual(U.inspectLayerObjects(s,'foot').rows.map(o=>o.objectId),[
    'obj-south-root','obj-resident-haran','obj-resident-berin','obj-west-root','obj-resident-nessa','obj-east-horn','obj-resident-dorik'
  ]);
  const r=U.inspectLayerObjects(s,'foot','obj-resident-');
  assert.equal(r.total,7);assert.equal(r.matched,4);assert.deepEqual(r.rows.map(o=>o.objectId),['obj-resident-haran','obj-resident-berin','obj-resident-nessa','obj-resident-dorik']);
  assert.equal(JSON.stringify(s),before);
});

test('actual resident focus is fresh, preserves all scene fields and never changes the immutable file',async()=>{
  const U=await moduleReady,source=fs.readFileSync(sceneFile),s=JSON.parse(source),before=JSON.stringify(s);
  assert.equal(crypto.createHash('sha256').update(source).digest('hex'),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  for(const [id,x,y] of [['haran',4660,6660],['berin',6020,5580],['nessa',6300,5020],['dorik',5220,2500]]) {
    const point=U.focusObjectFoot(s,'foot','obj-resident-'+id);assert.deepEqual(point,{x,y});
    point.x=-100;assert.deepEqual(U.focusObjectFoot(s,'foot','obj-resident-'+id),{x,y});
  }
  assert.equal(JSON.stringify(s),before);assert.deepEqual(fs.readFileSync(sceneFile),source);
});
