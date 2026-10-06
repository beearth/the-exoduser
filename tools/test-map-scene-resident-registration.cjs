const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'..');
const scenePath=path.join(repo,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const sceneBytes=fs.readFileSync(scenePath), original=JSON.parse(sceneBytes);
const clone=value=>JSON.parse(JSON.stringify(value));
const asset=(p,id)=>p.assets.find(a=>a.id===id);
const layer=(p,id)=>p.layers.find(l=>l.id===id);
const body=(p,key)=>layer(p,'foot').objects.find(o=>o.id==='obj-resident-'+key);
const ground=p=>layer(p,'west').objects.find(o=>o.id==='obj-west-0');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let inspectResidentPaintingRegistration,residentPaintingProfile,RESIDENT_PREVIEW;
test.before(async()=>({inspectResidentPaintingRegistration,residentPaintingProfile,RESIDENT_PREVIEW}=await import('./map-scene-rift-residents.mjs')));
function rejected(p,target,field,expected) {
  const result=inspectResidentPaintingRegistration(p);
  assert.equal(result.valid,false);assert.equal(result.profile,null);assert.equal(residentPaintingProfile(p),null);
  assert.equal(result.issue.target,target);assert.equal(result.issue.field,field);
  if(expected!==undefined) assert.deepEqual(result.issue.expected,expected);
  assert.doesNotThrow(()=>JSON.stringify(result));return result;
}
function freeze(value) {if(value && typeof value==='object' && !Object.isFrozen(value)){Object.freeze(value);for(const v of Object.values(value))freeze(v);}return value;}

test('real independent v2 keeps the exact original profile and never queries navigation or start',()=>{
  const p=clone(original), expected={src:RESIDENT_PREVIEW.cleanPlate,size:1254,worldPerSourcePixel:8000/1254};
  let queries=0;for(const key of ['walkable','start','world'])Object.defineProperty(p,key,{get(){queries++;throw new Error('not registration data');}});
  const r=inspectResidentPaintingRegistration(p);assert.equal(r.supported,true);assert.equal(r.valid,true);assert.equal(r.issue,null);
  assert.deepEqual(r.profile,expected);assert.deepEqual(residentPaintingProfile(p),expected);assert.equal(queries,0);
});

test('unregistered kinds stay unsupported, including baked source, while null reads yield safe issues',()=>{
  for(const p of [{}, {residentLayerReview:{kind:'other'}},JSON.parse(fs.readFileSync(path.join(repo,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json'),'utf8'))]) {
    const r=rejected(p,'scene','residentLayerReview.kind',RESIDENT_PREVIEW.kind);assert.equal(r.supported,false);
  }
  const r=rejected(null,'scene','read','검사 가능한 주민 등록');assert.equal(r.supported,false);assert.equal(r.issue.actual,'읽기 실패');
});

test('lineage diagnoses the first exact global metadata or source pin field',()=>{
  for(const [key,expected] of [['notAdopted',true],['originalPaintingSha256',RESIDENT_PREVIEW.originalPaintingSha256]]) {
    const p=clone(original);p.residentLayerReview[key]='bad';const r=rejected(p,'scene','residentLayerReview.'+key,expected);assert.equal(r.supported,true);assert.equal(r.issue.actual,'bad');
  }
  for(const [key,expected] of [['painting',RESIDENT_PREVIEW.originalPaintingSha256],['cleanPlate',RESIDENT_PREVIEW.cleanPlateSha256],['residentAtlas',RESIDENT_PREVIEW.atlasSha256]]) {
    const p=clone(original);p.sourcePins[key]='bad';rejected(p,'scene','sourcePins.'+key,expected);
  }
  const p=clone(original);p.sourcePins.painting='first';p.sourcePins.cleanPlate='later';rejected(p,'scene','sourcePins.painting',RESIDENT_PREVIEW.originalPaintingSha256);
});

test('review source and dimensions retain cleanPlate then atlas and src/pin/width/height ordering',()=>{
  for(const key of ['cleanPlate','atlas']) for(const field of ['src','sha256','width','height']) {
    const p=clone(original), expected=p.residentLayerReview[key][field];p.residentLayerReview[key][field]='bad';rejected(p,'scene','residentLayerReview.'+key+'.'+field,expected);
  }
  const p=clone(original);p.residentLayerReview.cleanPlate.height=0;p.residentLayerReview.atlas.src='later';rejected(p,'scene','residentLayerReview.cleanPlate.height',1254);
});

test('background assets report exact identity, source and dimensions before object transforms',()=>{
  for(const field of ['src','width','height']) {
    const p=clone(original), a=asset(p,'west-0'), expected=a[field];a[field]='bad';rejected(p,'asset:west-0',field,expected);
  }
  const p=clone(original);p.assets=p.assets.filter(a=>a.id!=='west-0');rejected(p,'asset:west-0','present',true);
});

test('background layer and object failures retain first field order and accurate targets',()=>{
  const cases=[['assetId','bad','west-0'],['pivotX',.1,0],['pivotY',.1,0],['rotation',1,0],['flipX',true,false],['opacity',.9,1],['mask',[[0,0],[1,0],[1,1]],'undefined']];
  for(const [field,value,expected] of cases) {const p=clone(original);ground(p)[field]=value;rejected(p,'object:obj-west-0',field,expected);}
  const hidden=clone(original);layer(hidden,'west').visible=false;rejected(hidden,'layer:west','visible',true);
  const missing=clone(original);layer(missing,'west').objects=layer(missing,'west').objects.filter(o=>o.id!=='obj-west-0');rejected(missing,'object:obj-west-0','present',true);
  const p=clone(original);ground(p).pivotY=.5;ground(p).rotation=1;rejected(p,'object:obj-west-0','pivotY',0);
});

test('eight near registration fields preserve tolerance1e-6, full read order and first-failure indexing',()=>{
  for(const field of ['x','y','w','h']) {
    const p=clone(original), a=asset(p,'west-0'), needed=a.crop[field];a.crop[field]+=1e-5;rejected(p,'asset:west-0','crop.'+field,{value:needed,tolerance:1e-6});
  }
  const worldExpected={x:0,y:0,width:641*25/6,height:961*25/6};
  for(const field of ['x','y','width','height']) {
    const p=clone(original), o=ground(p), needed=worldExpected[field];o[field]+=1e-5;rejected(p,'object:obj-west-0',field,{value:needed,tolerance:1e-6});
  }
  const inside=clone(original);asset(inside,'west-0').crop.x=1e-6;assert.equal(inspectResidentPaintingRegistration(inside).valid,true);
  const outside=clone(original);asset(outside,'west-0').crop.x=1.001e-6;rejected(outside,'asset:west-0','crop.x',{value:0,tolerance:1e-6});
  const p=clone(original);asset(p,'west-0').crop.x=1;ground(p).y=1;rejected(p,'asset:west-0','crop.x',{value:0,tolerance:1e-6});
  const badRead=clone(original);asset(badRead,'west-0').crop.x=1;Object.defineProperty(ground(badRead),'height',{get(){throw new Error('later near read');}});rejected(badRead,'scene','read','검사 가능한 주민 등록');
});

test('foot layer visibility, sorting and parallax retain their precise contract and order',()=>{
  for(const [field,value,expected] of [['visible',false,true],['sort','flat','foot'],['parallax',.99,1]]) {const p=clone(original);layer(p,'foot')[field]=value;rejected(p,'layer:foot',field,expected);}
  const p=clone(original);p.layers=p.layers.filter(l=>l.id!=='foot');rejected(p,'layer:foot','visible',true);
});

test('all four body asset and object fields identify the correct current failure without enforcing standing80',()=>{
  for(const key of ['haran','berin','nessa','dorik']) {
    for(const field of ['src','width','height']) {const p=clone(original),a=asset(p,'resident-'+key),expected=a[field];a[field]='bad';rejected(p,'asset:'+a.id,field,expected);}
    for(const [field,value,expected] of [['assetId','bad','resident-'+key],['mask',[], 'undefined'],['rotation',1,0],['flipX',true,false],['opacity',.5,1],['pivotX',0,.5],['pivotY',.8,1]]) {
      const p=clone(original),o=body(p,key);o[field]=value;rejected(p,'object:'+o.id,field,expected);
    }
  }
  const missing=clone(original);layer(missing,'foot').objects=layer(missing,'foot').objects.filter(o=>o.id!=='obj-resident-nessa');rejected(missing,'object:obj-resident-nessa','present',true);
});

test('body source crops require exact values even when the background permits near tolerance',()=>{
  for(const field of ['x','y','w','h']) {const p=clone(original),a=asset(p,'resident-haran'),needed=a.crop[field];a.crop[field]+=1e-7;rejected(p,'asset:resident-haran','crop.'+field,needed);}
});

test('body aspect ratio retains near1e-6 and precedes finite foot and height bounds',()=>{
  const ratio=350/578,inside=clone(original);Object.assign(body(inside,'haran'),{height:1,width:ratio+.999e-6});assert.equal(inspectResidentPaintingRegistration(inside).valid,true);
  const outside=clone(original);Object.assign(body(outside,'haran'),{height:1,width:ratio+1.001e-6});rejected(outside,'object:obj-resident-haran','width/height',{value:ratio,tolerance:1e-6});
  const p=clone(original);body(p,'haran').width=1;body(p,'haran').x=NaN;rejected(p,'object:obj-resident-haran','width/height',{value:ratio,tolerance:1e-6});
});

test('finite feet and editable height boundaries match the original profile acceptance',()=>{
  for(const [field,value] of [['x',NaN],['y',Infinity],['x',-1],['y',-1],['x',8000],['y',8000]]) {
    const p=clone(original);body(p,'haran')[field]=value;rejected(p,'object:obj-resident-haran',field,{min:0,maxExclusive:8000,finite:true});
  }
  for(const height of [1,123,32000]) {
    const p=clone(original),o=body(p,'haran');o.height=height;o.width=height*350/578;o.x=o.y=0;assert.equal(inspectResidentPaintingRegistration(p).valid,true);
  }
  for(const height of [.5,32001]) {const p=clone(original),o=body(p,'haran');o.height=height;o.width=height*350/578;rejected(p,'object:obj-resident-haran','height',{min:1,max:32000});}
  const stringHeight=clone(original);body(stringHeight,'haran').height='80';assert.equal(inspectResidentPaintingRegistration(stringHeight).valid,true);
});

test('find uses the first matching record and does not add unrelated schema or truthiness restrictions',()=>{
  const p=clone(original);p.assets.push({...asset(p,'resident-haran'),src:'later bad duplicate'});layer(p,'foot').objects.push({...body(p,'haran'),rotation:1});assert.equal(inspectResidentPaintingRegistration(p).valid,true);
  p.assets.unshift({...asset(p,'resident-haran'),src:'first bad duplicate'});rejected(p,'asset:resident-haran','src',RESIDENT_PREVIEW.atlas);
  const first=clone(original);ground(first).opacity=.5;body(first,'haran').rotation=1;rejected(first,'object:obj-west-0','opacity',1);
  const truthy=clone(original);layer(truthy,'west').visible=1;ground(truthy).flipX=undefined;body(truthy,'haran').flipX=0;assert.equal(inspectResidentPaintingRegistration(truthy).valid,true);
});

test('issues are detached JSON-safe data, getter failures are safe, and frozen scene/source remain unchanged',()=>{
  const p=freeze(clone(original)),before=JSON.stringify(p),result=inspectResidentPaintingRegistration(p);result.profile.size=-1;assert.equal(JSON.stringify(p),before);assert.equal(residentPaintingProfile(p).size,1254);
  const bad=clone(original),mask=[[0,0],[1,0],[1,1]];body(bad,'haran').mask=mask;const issue=rejected(bad,'object:obj-resident-haran','mask','undefined').issue;issue.actual[0][0]=99;assert.equal(mask[0][0],0);
  for(const value of [NaN,Infinity,-Infinity,1n,Symbol('bad'),()=>{}]) {const q=clone(original);body(q,'haran').rotation=value;const r=rejected(q,'object:obj-resident-haran','rotation',0);assert.deepEqual(JSON.parse(JSON.stringify(r)),r);}
  const circular=clone(original),object={};object.self=object;body(circular,'haran').mask=object;assert.doesNotThrow(()=>JSON.stringify(inspectResidentPaintingRegistration(circular)));
  const getter=clone(original);Object.defineProperty(body(getter,'haran'),'pivotY',{get(){throw new Error('private failure detail');}});const r=rejected(getter,'scene','read','검사 가능한 주민 등록');assert.equal(JSON.stringify(r).includes('private failure detail'),false);
  assert.equal(sha(sceneBytes),'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');assert.equal(sha(fs.readFileSync(scenePath)),sha(sceneBytes));
});
