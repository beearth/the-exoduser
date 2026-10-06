const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const repo = path.resolve(__dirname,'..');
const sourcePath = path.join(repo,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const sourceBytes = fs.readFileSync(sourcePath), source = JSON.parse(sourceBytes);
const original = JSON.parse(fs.readFileSync(path.join(repo,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json'),'utf8'));
const coreContext = vm.createContext({module:{exports:{}}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'map-scene-core.js'),'utf8'),coreContext);
const K = coreContext.module.exports;
const ids = [
  ['haran','rift-rest-haran'],['berin','rift-gift-berin'],
  ['nessa','rift-request-nessa'],['dorik','rift-prepare-dorik']
];
const clone = value => JSON.parse(JSON.stringify(value));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const walk = (p,x,y,r) => K.canWalk(p,x,y,r);
const body = (p,key) => p.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-'+key);
const row = (result,key) => result.report.rows.find(r=>r.objectId==='obj-resident-'+key);
const near = (x,y,p) => Math.abs(x-p.x)<1e-6 && Math.abs(y-p.y)<1e-6;
function openCell(p,x,y) {p.walkable[y*p.world.cols+x]=1;}
function fixture() {
  const p=clone(source);p.walkable.fill(0);p.start={x:20,y:20};
  for(let y=0;y<8;y++) for(let x=0;x<8;x++) openCell(p,x,y);
  for(const [key,x,y] of [['haran',60,60],['berin',180,60],['nessa',60,180],['dorik',180,180]]) Object.assign(body(p,key),{x,y});
  return p;
}
const blockedAt = point => (p,x,y,r) => !near(x,y,point) && walk(p,x,y,r);
function assertRejected(result,mode,status,key='haran') {
  assert.equal(result.ready,false);assert.match(result.reason,/[가-힣]/);
  assert.equal('player' in result,false);assert.equal('foot' in result,false);
  if(mode) assert.equal(result.report.mode,mode);
  if(status) assert.equal(row(result,key).status,status);
}
function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {Object.freeze(value);for(const v of Object.values(value)) freeze(v);}
  return value;
}
let prepareResidentPreview;
test.before(async()=>({prepareResidentPreview}=await import('./map-scene-resident-preview.mjs')));

test('real v2 four NPCs prepare exact fresh approach poses within the existing distance and radius contract',()=>{
  const p=clone(source), before=JSON.stringify(p), reports=[];
  for(const [key,npcId] of ids) {
    const result=prepareResidentPreview(p,npcId,walk), r=row(result,key), o=body(p,key);
    assert.equal(result.ready,true);assert.equal(result.npcId,npcId);assert.equal(result.objectId,o.id);
    assert.equal(result.report.mode,'independent');assert.equal(result.report.rows.length,4);
    assert.equal(r.status,'ready');assert.equal(r.footWalkable,true);assert.equal(r.startConnected,true);
    assert.deepEqual(result.player,{x:r.approach.x,y:r.approach.y});assert.deepEqual(result.foot,{x:o.x,y:o.y});
    assert.ok(r.approach.distance>=40 && r.approach.distance<=140);assert.equal(walk(p,result.player.x,result.player.y,12),true);
    assert.notStrictEqual(result.player,r.approach);assert.notStrictEqual(result.foot,r.foot);reports.push(result.report);
  }
  assert.equal(new Set(reports).size,4);assert.equal(JSON.stringify(p),before);
});

test('moving a current body recomputes the entry pose rather than reusing a cached or historical approach',()=>{
  const p=fixture(), first=prepareResidentPreview(p,ids[0][1],walk);
  assert.deepEqual(first.player,{x:60,y:20});Object.assign(body(p,'haran'),{x:220,y:220});
  const fresh=prepareResidentPreview(p,ids[0][1],walk);
  assert.equal(fresh.ready,true);assert.deepEqual(fresh.foot,{x:220,y:220});assert.deepEqual(fresh.player,{x:220,y:180});
  assert.notStrictEqual(fresh.report,first.report);assert.deepEqual(first.player,{x:60,y:20});
  assert.notDeepEqual(fresh.player,{x:4660,y:6700});
});

test('a blocked target refuses entry with a fresh four-row report while the other three still pass',()=>{
  const p=fixture(), query=blockedAt(body(p,'haran'));
  const rejected=prepareResidentPreview(p,ids[0][1],query);assertRejected(rejected,'independent','foot-blocked');
  assert.equal(rejected.report.rows.length,4);
  for(const [key,npcId] of ids.slice(1)) {assert.equal(row(rejected,key).status,'ready');assert.equal(prepareResidentPreview(p,npcId,query).ready,true);}
});

test('unknown, spoofed and non-string NPC IDs fail before querying the scene or navigation',()=>{
  let calls=0;const query=()=>{calls++;return true;};
  for(const npcId of [null,undefined,1,{},new String(ids[0][1]),'',ids[0][1]+'-spoof','obj-resident-haran']) {
    const result=prepareResidentPreview(null,npcId,query);assertRejected(result);assert.equal(result.report,null);
  }
  assert.equal(calls,0);
});

test('baked and generic scenes stay unsupported and malformed independent registration never falls back',()=>{
  for(const p of [original,{},null]) assertRejected(prepareResidentPreview(p,ids[0][1],walk),'unsupported');
  for(const mutate of [p=>p.sourcePins.residentAtlas='bad',p=>body(p,'haran').rotation=1,
    p=>p.assets.find(a=>a.id==='resident-haran').crop.x++,p=>p.layers.find(l=>l.id==='foot').visible=false]) {
    const p=fixture();mutate(p);assertRejected(prepareResidentPreview(p,ids[0][1],walk),'invalid-profile');
  }
});

test('missing and non-function navigation queries retain the invalid-query diagnostic',()=>{
  for(const query of [undefined,null,true,1,'true',{}]) assertRejected(prepareResidentPreview(fixture(),ids[0][1],query),'invalid-query');
});

test('Promise, truthy and throwing callbacks never create a pose globally or for one affected NPC',()=>{
  for(const rejected of [()=>Promise.resolve(true),()=>1,()=>'true',()=>{throw new Error('query failed');}]) {
    const p=fixture();assertRejected(prepareResidentPreview(p,ids[0][1],rejected),'independent','foot-blocked');
    const point=body(p,'haran'), query=(s,x,y,r)=>near(x,y,point)?rejected():walk(s,x,y,r);
    assertRejected(prepareResidentPreview(p,ids[0][1],query),'independent','foot-blocked');
    assert.equal(prepareResidentPreview(p,ids[1][1],query).ready,true);
  }
});

test('blocked starts and a blocked off-centre start-to-seed segment reject otherwise clear feet',()=>{
  const p=fixture();assertRejected(prepareResidentPreview(p,ids[0][1],blockedAt(p.start)),'independent','start-blocked');
  p.start={x:38,y:38};const query=blockedAt({x:29,y:29});
  assert.equal(query(p,38,38,12),true);assert.equal(query(p,20,20,12),true);
  const result=prepareResidentPreview(p,ids[0][1],query);assertRejected(result,'independent','start-blocked');
  assert.equal(row(result,'haran').footWalkable,true);assert.equal(row(result,'haran').startConnected,false);
});

test('walkable disconnected islands cannot be used as teleport entry points',()=>{
  const p=fixture();p.walkable.fill(0);openCell(p,0,0);openCell(p,2,0);Object.assign(body(p,'haran'),{x:100,y:20});
  const result=prepareResidentPreview(p,ids[0][1],walk);assertRejected(result,'independent','no-route');
  assert.equal(row(result,'haran').footWalkable,true);assert.equal(row(result,'haran').startConnected,false);assert.equal(row(result,'haran').approach,null);
});

test('a connected foot with no valid distance40-to140 approach refuses entry without a guessed fallback',()=>{
  const p=fixture();p.walkable.fill(0);openCell(p,0,0);Object.assign(body(p,'haran'),{x:20,y:20});
  const result=prepareResidentPreview(p,ids[0][1],walk);assertRejected(result,'independent','no-approach');
  assert.equal(row(result,'haran').footWalkable,true);assert.equal(row(result,'haran').startConnected,true);
});

test('throwing getters and malformed source contracts fail closed rather than escaping to the UI',()=>{
  const p=fixture();Object.defineProperty(p,'start',{get(){throw new Error('unreadable start');}});
  const result=prepareResidentPreview(p,ids[0][1],walk);assertRejected(result);assert.equal(result.report,null);
  const proxy=new Proxy({}, {has(){throw new Error('unreadable registration');}});
  assertRejected(prepareResidentPreview(proxy,ids[0][1],walk));
  for(const mutate of [s=>s.world.cols=201,s=>s.walkable.pop(),s=>s.start.x=Infinity]) {
    const invalid=fixture();mutate(invalid);assertRejected(prepareResidentPreview(invalid,ids[0][1],walk),'invalid-profile');
  }
});

test('returned poses and reports are detached while frozen source, start, feet, navigation and History remain exact',()=>{
  const p=freeze(clone(source)), before=JSON.stringify(p);
  assert.equal(prepareResidentPreview(p,ids[0][1],walk).ready,true);assert.equal(JSON.stringify(p),before);
  const history=new K.History(fixture()), originalHistory=JSON.stringify(history), identity=history.project;
  const result=prepareResidentPreview(history.project,ids[0][1],walk);
  result.player.x=-1;result.foot.y=-1;result.report.rows[0].foot.x=-2;result.report.rows[0].approach.y=-2;result.report.rows.splice(1);
  assert.equal(JSON.stringify(history),originalHistory);assert.strictEqual(history.project,identity);
  const fresh=prepareResidentPreview(history.project,ids[0][1],walk);assert.equal(fresh.ready,true);
  assert.equal(fresh.report.rows.length,4);assert.deepEqual(fresh.player,{x:60,y:20});assert.deepEqual(fresh.foot,{x:60,y:60});
  assert.equal(hash(sourceBytes),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');
  assert.equal(hash(fs.readFileSync(sourcePath)),hash(sourceBytes));
});
