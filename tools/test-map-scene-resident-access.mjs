import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {inspectResidentAccess,RESIDENT_ACCESS} from './map-scene-resident-access.mjs';
import {residentPaintingProfile,residentDialogueAnchors} from './map-scene-rift-residents.mjs';

const sourceUrl=new URL('../assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json',import.meta.url);
const sourceBytes=fs.readFileSync(sourceUrl), source=JSON.parse(sourceBytes);
const originalUrl=new URL('../assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json',import.meta.url);
const ctx=vm.createContext({module:{exports:{}}});
vm.runInContext(fs.readFileSync(new URL('./map-scene-core.js',import.meta.url),'utf8'),ctx);
const K=ctx.module.exports;
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const walk=(p,x,y,r)=>K.canWalk(p,x,y,r);
const body=(p,key)=>p.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-'+key);
const row=(result,key)=>result.rows.find(r=>r.objectId==='obj-resident-'+key);
const near=(x,y,p)=>Math.abs(x-p.x)<1e-6 && Math.abs(y-p.y)<1e-6;
function openCell(p,x,y) {p.walkable[y*p.world.cols+x]=1;}
function fixture() {
  const p=clone(source);p.walkable.fill(0);p.start={x:20,y:20};
  for(let y=0;y<8;y++) for(let x=0;x<8;x++) openCell(p,x,y);
  for(const [key,x,y] of [['haran',60,60],['berin',180,60],['nessa',60,180],['dorik',180,180]]) Object.assign(body(p,key),{x,y});
  assert.ok(residentPaintingProfile(p));return p;
}
const blockedAt=point=>(p,x,y,r)=>!near(x,y,point) && walk(p,x,y,r);

test('only strict independent profiles produce rows; unsupported scenes, invalid registration and missing query fail closed',()=>{
  assert.deepEqual(inspectResidentAccess(JSON.parse(fs.readFileSync(originalUrl,'utf8')),walk),{mode:'unsupported',rows:[]});
  assert.deepEqual(inspectResidentAccess({},walk),{mode:'unsupported',rows:[]});
  assert.deepEqual(inspectResidentAccess(null,walk),{mode:'unsupported',rows:[]});
  assert.deepEqual(inspectResidentAccess(fixture(),null),{mode:'invalid-query',rows:[]});
  for(const mutate of [p=>p.sourcePins.residentAtlas='bad',p=>body(p,'haran').rotation=1,p=>body(p,'berin').opacity=.99,
    p=>p.layers.find(l=>l.id==='foot').visible=false,p=>p.assets.find(a=>a.id==='resident-nessa').crop.x++]) {
    const p=fixture();mutate(p);assert.deepEqual(inspectResidentAccess(p,walk),{mode:'invalid-profile',rows:[]});
  }
  assert.deepEqual(inspectResidentAccess({residentLayerReview:null},walk),{mode:'invalid-profile',rows:[]});
});

test('preserved real v2 scene has four reachable current feet and strict connected approach suggestions without changing source',()=>{
  assert.equal(hash(sourceBytes),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  const p=clone(source), before=JSON.stringify(p), result=inspectResidentAccess(p,walk), anchors=residentDialogueAnchors(p);
  assert.equal(result.mode,'independent');assert.equal(result.rows.length,4);
  for(const [i,r] of result.rows.entries()) {
    assert.equal(r.npcId,anchors[i].npcId);assert.deepEqual(r.foot,{x:anchors[i].x,y:anchors[i].y});
    assert.equal(r.footWalkable,true);assert.equal(r.startConnected,true);assert.equal(r.status,'ready');
    assert.ok(r.approach.distance>=40 && r.approach.distance<=140);assert.equal(walk(p,r.approach.x,r.approach.y,12),true);
    const n=Math.max(1,Math.ceil(r.approach.distance/20));
    for(let j=0;j<=n;j++) assert.equal(walk(p,r.approach.x+(r.foot.x-r.approach.x)*j/n,r.approach.y+(r.foot.y-r.approach.y)*j/n,12),true);
  }
  assert.equal(JSON.stringify(p),before);assert.equal(hash(fs.readFileSync(sourceUrl)),hash(sourceBytes));
});

test('one blocked resident remains visible as foot-blocked while the other three stay ready',()=>{
  const p=fixture(), point=body(p,'haran'), result=inspectResidentAccess(p,blockedAt(point));
  assert.equal(result.rows.length,4);assert.equal(row(result,'haran').footWalkable,false);
  assert.equal(row(result,'haran').startConnected,false);assert.equal(row(result,'haran').status,'foot-blocked');
  assert.equal(row(result,'haran').approach,null);
  for(const key of ['berin','nessa','dorik']) assert.equal(row(result,key).status,'ready');
});

test('off-centre start must reach its own seed centre through step20 radius12 samples',()=>{
  const p=fixture();p.start={x:38,y:38};const rejected={x:29,y:29}, query=blockedAt(rejected);
  assert.equal(query(p,38,38,12),true);assert.equal(query(p,20,20,12),true);
  const result=inspectResidentAccess(p,query);
  for(const r of result.rows) {assert.equal(r.footWalkable,true);assert.equal(r.startConnected,false);assert.equal(r.status,'start-blocked');assert.equal(r.approach,null);}
});

test('a walkable disconnected island cannot pass from nearby centres or preserve a historical approach',()=>{
  const p=fixture();p.walkable.fill(0);openCell(p,0,0);openCell(p,2,0);Object.assign(body(p,'haran'),{x:100,y:20});
  const r=row(inspectResidentAccess(p,walk),'haran');
  assert.equal(r.footWalkable,true);assert.equal(r.startConnected,false);assert.equal(r.status,'no-route');assert.equal(r.approach,null);
});

test('a connected foot cell centre is insufficient when its exact off-centre foot segment is blocked',()=>{
  const p=fixture();Object.assign(body(p,'haran'),{x:78,y:78});const query=blockedAt({x:69,y:69});
  assert.equal(query(p,78,78,12),true);assert.equal(query(p,60,60,12),true);
  const result=inspectResidentAccess(p,query), r=row(result,'haran');
  assert.equal(r.footWalkable,true);assert.equal(r.startConnected,false);assert.equal(r.status,'no-route');assert.equal(r.approach,null);
  for(const key of ['berin','nessa','dorik']) assert.equal(row(result,key).status,'ready');
});

test('BFS verifies intermediate edge samples rather than connecting two individually clear centres',()=>{
  const p=fixture();p.walkable.fill(0);for(let x=0;x<6;x++) openCell(p,x,0);
  for(const [i,key] of ['haran','berin','nessa','dorik'].entries()) Object.assign(body(p,key),{x:100+i*40,y:20});
  const query=blockedAt({x:40,y:20});assert.equal(query(p,20,20,12),true);assert.equal(query(p,60,20,12),true);
  for(const r of inspectResidentAccess(p,query).rows) {assert.equal(r.status,'no-route');assert.equal(r.startConnected,false);}
});

test('a narrow nav corridor rejects a radius12 foot even though its radius0 centre is allowed',()=>{
  const p=fixture();p.walkable.fill(0);for(let x=0;x<8;x++) openCell(p,x,2);p.start={x:20,y:100};
  Object.assign(body(p,'haran'),{x:100,y:88});for(const [i,key] of ['berin','nessa','dorik'].entries()) Object.assign(body(p,key),{x:180+i*40,y:100});
  assert.equal(walk(p,100,88,0),true);assert.equal(walk(p,100,88,12),false);
  const result=inspectResidentAccess(p,walk);assert.equal(row(result,'haran').status,'foot-blocked');
  for(const key of ['berin','nessa','dorik']) assert.equal(row(result,key).status,'ready');
});

test('Promise, truthy nonbooleans and thrown walk callbacks never pass globally or for a single foot',()=>{
  for(const rejected of [()=>Promise.resolve(true),()=>1,()=>'true',()=>{throw new Error('query failed');}]) {
    const p=fixture(), result=inspectResidentAccess(p,rejected);
    assert.equal(result.mode,'independent');for(const r of result.rows) assert.equal(r.status,'foot-blocked');
    const point=body(p,'haran'), query=(s,x,y,r)=>near(x,y,point)?rejected():walk(s,x,y,r);
    const isolated=inspectResidentAccess(p,query);assert.equal(row(isolated,'haran').status,'foot-blocked');
    for(const key of ['berin','nessa','dorik']) assert.equal(row(isolated,key).status,'ready');
  }
});

test('a connected single tile reports no-approach instead of suggesting the foot itself below distance40',()=>{
  const p=fixture();p.walkable.fill(0);openCell(p,0,0);Object.assign(body(p,'haran'),{x:20,y:20});
  const r=row(inspectResidentAccess(p,walk),'haran');assert.equal(r.footWalkable,true);assert.equal(r.startConnected,true);
  assert.equal(r.status,'no-approach');assert.equal(r.approach,null);
});

test('suggestions follow moved bodies, ignore stale fixed anchors and sort distance then y then x deterministically',()=>{
  const p=fixture(), first=inspectResidentAccess(p,walk), before=row(first,'haran').approach;
  assert.deepEqual(before,{x:60,y:20,distance:40});
  Object.assign(body(p,'haran'),{x:220,y:220});const result=inspectResidentAccess(p,walk), r=row(result,'haran');
  assert.deepEqual(r.foot,{x:220,y:220});assert.deepEqual(r.approach,{x:220,y:180,distance:40});
  assert.notDeepEqual(r.approach,before);assert.notDeepEqual({x:r.approach.x,y:r.approach.y},residentDialogueAnchors(p)[0].approach);
  assert.deepEqual(inspectResidentAccess(p,walk),result);
  assert.deepEqual(RESIDENT_ACCESS,{radius:12,range:140,step:20,minApproachDistance:40,maxCells:40000});
});

test('results are detached and queries leave scene/history exact while bounded world/nav malformations reject',()=>{
  const p=fixture(), history=new K.History(p), before=JSON.stringify(history), identity=history.project;
  const result=inspectResidentAccess(history.project,walk);result.rows[0].foot.x=-1;result.rows[0].approach.y=-1;result.rows.splice(1);
  assert.equal(JSON.stringify(history),before);assert.equal(history.project,identity);
  const again=inspectResidentAccess(history.project,walk);assert.equal(again.rows.length,4);assert.deepEqual(again.rows[0].foot,{x:60,y:60});
  assert.deepEqual(again.rows[0].approach,{x:60,y:20,distance:40});
  for(const mutate of [s=>s.world.cols=201,s=>s.world.rows=0,s=>s.world.cols='200',s=>s.world.tileSize=NaN,
    s=>s.walkable.pop(),s=>s.walkable[0]=2,s=>s.start.x=Infinity,s=>s.format='generic']) {
    const invalid=fixture();mutate(invalid);assert.deepEqual(inspectResidentAccess(invalid,walk),{mode:'invalid-profile',rows:[]});
  }
  assert.equal(hash(fs.readFileSync(sourceUrl)),hash(sourceBytes));
});
