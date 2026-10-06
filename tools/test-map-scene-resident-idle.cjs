const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..');
const sourcePath=path.join(repo,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const sourceBytes=fs.readFileSync(sourcePath),source=JSON.parse(sourceBytes);
const original=JSON.parse(fs.readFileSync(path.join(repo,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json'),'utf8'));
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const keys=['haran','berin','nessa','dorik'];
const body=(p,key)=>p.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-'+key);
const expected=(time,index)=>1+.014*Math.sin(((time/2600+index*.137)%1)*Math.PI*2);
const near=(a,b)=>assert.ok(Math.abs(a-b)<=1e-12,`${a} != ${b}`);
const inactive=(idle,p)=>{assert.deepEqual(idle.snapshot(),{enabled:false,entries:[]});for(const key of keys)assert.equal(idle.scaleFor(body(p,key)),1);};
function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.freeze(value);for(const v of Object.values(value))freeze(v);}return value;}
let createResidentIdle;
test.before(async()=>({createResidentIdle}=await import('./map-scene-resident-idle.mjs')));

test('strict real v2 admits exactly four current first body references with the canonical phase order',()=>{
  const p=clone(source),idle=createResidentIdle();idle.prepare(p,650,true);
  const snapshot=idle.snapshot();assert.equal(snapshot.enabled,true);assert.equal(snapshot.entries.length,4);
  for(const [i,key] of keys.entries()){const o=body(p,key);assert.equal(snapshot.entries[i].objectId,o.id);near(snapshot.entries[i].scaleY,expected(650,i));near(idle.scaleFor(o),expected(650,i));}
  assert.equal(idle.scaleFor(null),1);assert.equal(idle.scaleFor({}),1);
});

test('period2600 and amplitude014 produce bounded desynchronised scales for finite times',()=>{
  const p=clone(source),idle=createResidentIdle();
  for(let t=-2600;t<=5200;t+=130){idle.prepare(p,t,true);for(const [i,key] of keys.entries()){const scale=idle.scaleFor(body(p,key));assert.ok(scale>=.986-1e-12&&scale<=1.014+1e-12);near(scale,expected(t,i));}}
  idle.prepare(p,325,true);const first=idle.snapshot();idle.prepare(p,2925,true);const next=idle.snapshot();for(let i=0;i<4;i++)near(first.entries[i].scaleY,next.entries[i].scaleY);
  idle.prepare(p,Number.MAX_VALUE,true);assert.equal(idle.snapshot().enabled,true);for(const e of idle.snapshot().entries)assert.ok(Number.isFinite(e.scaleY));
});

test('vertical breathing about the existing foot origin preserves world feet and horizontal body positions',()=>{
  const p=clone(source),before=JSON.stringify(p),idle=createResidentIdle();idle.prepare(p,650,true);
  for(const key of keys){const o=body(p,key),s=idle.scaleFor(o);
    const point=(u,v)=>({x:o.x+(u-o.pivotX)*o.width,y:o.y+(v-o.pivotY)*o.height*s});
    assert.deepEqual(point(.5,1),{x:o.x,y:o.y});near(point(0,0).x,o.x-o.width*.5);near(point(1,0).x,o.x+o.width*.5);
  }
  assert.equal(JSON.stringify(p),before);
});

test('one invalid registered source, crop, transform or layer disables all bodies without fallback',()=>{
  const mutations=[p=>p.sourcePins.residentAtlas='bad',p=>p.assets.find(a=>a.id==='resident-haran').crop.x++,p=>body(p,'haran').rotation=1,
    p=>body(p,'berin').pivotY=.8,p=>body(p,'nessa').mask=[],p=>body(p,'dorik').width++,p=>p.layers.find(l=>l.id==='foot').visible=false,
    p=>p.layers.find(l=>l.id==='foot').sort='flat',p=>p.layers.find(l=>l.id==='west').objects[0].opacity=.9];
  for(const mutate of mutations){const p=clone(source),idle=createResidentIdle();idle.prepare(p,650,true);mutate(p);idle.prepare(p,700,true);inactive(idle,p);}
});

test('prefix spoofs, same-ID clones and later duplicate records are never animated',()=>{
  const p=clone(source),first=body(p,'haran'),duplicate={...first},spoof={...body(p,'berin'),id:'obj-resident-berin-spoof'};
  p.layers.find(l=>l.id==='foot').objects.push(duplicate,spoof);const idle=createResidentIdle();idle.prepare(p,650,true);
  near(idle.scaleFor(first),1.014);assert.equal(idle.scaleFor(duplicate),1);assert.equal(idle.scaleFor(spoof),1);assert.equal(idle.scaleFor({...first}),1);
  assert.equal(idle.snapshot().entries.length,4);
  const foot=p.layers.find(l=>l.id==='foot');foot.objects=foot.objects.filter(o=>o!==first);duplicate.rotation=1;idle.prepare(p,700,true);inactive(idle,p);
});

test('selected and batch exclusions freeze only those IDs and release without changing object properties',()=>{
  const p=clone(source),before=JSON.stringify(p),idle=createResidentIdle();const excluded=['obj-resident-haran','obj-resident-nessa'];
  idle.prepare(p,650,true,excluded);assert.equal(idle.snapshot().enabled,true);
  for(const [i,key] of keys.entries())near(idle.scaleFor(body(p,key)),excluded.includes('obj-resident-'+key)?1:expected(650,i));
  idle.prepare(p,650,true,keys.map(key=>'obj-resident-'+key));for(const key of keys)assert.equal(idle.scaleFor(body(p,key)),1);
  idle.prepare(p,650,true,[]);near(idle.scaleFor(body(p,'haran')),1.014);assert.equal(JSON.stringify(p),before);assert.deepEqual(excluded,['obj-resident-haran','obj-resident-nessa']);
});

test('disabled, nonboolean enable flags and invalid times always clear previously prepared references',()=>{
  const p=clone(source),idle=createResidentIdle();
  for(const on of [false,undefined,null,0,1,'true']){idle.prepare(p,650,true);idle.prepare(p,650,on);inactive(idle,p);}
  for(const time of [undefined,null,'650',NaN,Infinity,-Infinity]){idle.prepare(p,650,true);idle.prepare(p,time,true);inactive(idle,p);}
  idle.prepare(p,650,true);idle.prepare(p,650,true,null);inactive(idle,p);
});

test('unsupported, unreadable profiles and exclusion accessors fail closed without scene or navigation callbacks',()=>{
  const p=clone(source),idle=createResidentIdle();
  for(const invalid of [original,{},null]){idle.prepare(p,650,true);idle.prepare(invalid,650,true);inactive(idle,p);}
  const unreadable=clone(source);Object.defineProperty(body(unreadable,'haran'),'pivotY',{get(){throw new Error('unreadable');}});idle.prepare(unreadable,650,true);inactive(idle,p);
  let query=0;for(const key of ['walkable','start','world'])Object.defineProperty(p,key,{get(){query++;throw new Error('not idle data');}});
  idle.prepare(p,650,true);assert.equal(idle.snapshot().enabled,true);assert.equal(query,0);
  const excluded=[];Object.defineProperty(excluded,0,{get(){throw new Error('unreadable exclusion');}});idle.prepare(p,650,true,excluded);inactive(idle,p);
});

test('snapshot is detached read-only metadata and exposes no references, mutation hooks or timers',()=>{
  const p=clone(source),idle=createResidentIdle();assert.ok(Object.isFrozen(idle));assert.deepEqual(Object.keys(idle),['prepare','scaleFor','snapshot']);
  idle.prepare(p,650,true);const one=idle.snapshot(),two=idle.snapshot();assert.notStrictEqual(one,two);assert.notStrictEqual(one.entries,two.entries);
  one.entries[0].scaleY=100;one.entries[1].objectId='spoof';one.entries.splice(2);one.enabled=false;
  const fresh=idle.snapshot();assert.equal(fresh.enabled,true);assert.equal(fresh.entries.length,4);near(fresh.entries[0].scaleY,1.014);assert.equal(fresh.entries[1].objectId,'obj-resident-berin');
  assert.deepEqual(Object.keys(fresh),['enabled','entries']);for(const e of fresh.entries)assert.deepEqual(Object.keys(e),['objectId','scaleY']);
});

test('scene reload replaces the identity map and frozen source assets, feet and navigation remain exact',()=>{
  const first=freeze(clone(source)),next=clone(source),before=JSON.stringify(first),idle=createResidentIdle();
  idle.prepare(first,650,true);const old=body(first,'haran');idle.prepare(next,650,true);assert.equal(idle.scaleFor(old),1);near(idle.scaleFor(body(next,'haran')),1.014);
  const o=body(next,'haran');o.x+=40;o.height=100;o.width=100*350/578;const edited=JSON.stringify(next);idle.prepare(next,700,true);assert.equal(idle.snapshot().enabled,true);assert.equal(JSON.stringify(next),edited);
  assert.equal(JSON.stringify(first),before);assert.equal(hash(sourceBytes),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');assert.equal(hash(fs.readFileSync(sourcePath)),hash(sourceBytes));
});
