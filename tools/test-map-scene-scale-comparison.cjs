/* Only the new read-only scale comparison suite runs; no editor/server or former suite. */
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const moduleReady=import('./map-scene-scale-comparison.mjs'), clone=v=>JSON.parse(JSON.stringify(v));
const sceneFile=path.join(__dirname,'../assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const sceneBytes=fs.readFileSync(sceneFile), scene=JSON.parse(sceneBytes);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const input=()=>({object:{width:50,height:80},asset:{crop:{w:350,h:578}},options:{zoom:1,rasterScale:1}});
const freeze=v=>{if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;};
const approximate=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-12,actual+' != '+expected);

test('basic comparison preserves exact world/source/CSS values and 80/72 constants',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,{object,asset,options}=input(),r=I(object,asset,options);
  assert.deepEqual(r,{valid:true,referenceHeight:80,heightRatio:1,world:{width:50,height:80},sourceCrop:{width:350,height:578},css:{width:50,height:80},resolution:{status:'reduced',scaleX:50/350,scaleY:80/578,maxScale:50/350},bars:{maxHeight:72,reference:72,object:72}});
});
test('actual four resident crops expose standing and seated heights without changing registration',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,foot=scene.layers.find(l=>l.id==='foot');
  for(const key of ['haran','berin','nessa','dorik']){const o=foot.objects.find(o=>o.id==='obj-resident-'+key),a=scene.assets.find(a=>a.id===o.assetId),r=I(o,a,{zoom:1,rasterScale:2});assert.equal(r.valid,true);assert.equal(r.heightRatio,o.height/80);assert.equal(r.world.width,o.width);assert.equal(r.sourceCrop.height,a.crop.h);assert.equal(r.resolution.status,'reduced');}
  const seated=foot.objects.find(o=>o.id==='obj-resident-berin');approximate(I(seated,scene.assets.find(a=>a.id===seated.assetId),{zoom:1,rasterScale:2}).heightRatio,352/578);
});
test('native means the maximum axis is exactly one even when the other remains reduced',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,r=I({width:50,height:80},{crop:{w:100,h:320}},{zoom:1,rasterScale:2});
  assert.deepEqual(r.resolution,{status:'native',scaleX:1,scaleY:.5,maxScale:1});
});
test('classification uses exact unrounded boundaries around one',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,a={crop:{w:1,h:1}},opts={zoom:1,rasterScale:1};
  assert.equal(I({width:1,height:1},a,opts).resolution.status,'native');
  assert.equal(I({width:1+Number.EPSILON,height:.5},a,opts).resolution.status,'enlarged');
  assert.equal(I({width:1-Number.EPSILON,height:.5},a,opts).resolution.status,'reduced');
});
test('a single enlarged axis warns for wide and tall objects alike',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,a={crop:{w:100,h:100}},opts={zoom:1,rasterScale:1};
  const wide=I({width:150,height:50},a,opts),tall=I({width:50,height:150},a,opts);
  assert.deepEqual(wide.resolution,{status:'enlarged',scaleX:1.5,scaleY:.5,maxScale:1.5});
  assert.deepEqual(tall.resolution,{status:'enlarged',scaleX:.5,scaleY:1.5,maxScale:1.5});
});
test('fractional zoom and actual raster ratio are neither capped nor rounded',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,o={width:123.456,height:78.901},a={crop:{w:300.25,h:150.75}},r=I(o,a,{zoom:.375,rasterScale:3.25});
  assert.equal(r.css.width,o.width*.375);assert.equal(r.css.height,o.height*.375);
  assert.equal(r.resolution.scaleX,o.width*.375*3.25/a.crop.w);assert.equal(r.resolution.scaleY,o.height*.375*3.25/a.crop.h);
  const high=I({width:50,height:50},{crop:{w:100,h:100}},{zoom:1,rasterScale:4});assert.equal(high.resolution.maxScale,2);assert.equal(high.resolution.status,'enlarged');
});
test('CSS size excludes rasterScale while transforms and foot fields are never read',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,o={width:50,height:80};
  for(const key of ['rotation','flipX','x','y','pivotX','pivotY','assetId','name','collision'])Object.defineProperty(o,key,{get(){throw new Error('unrelated field read: '+key);}});
  const a={crop:{w:350,h:578}},first=I(o,a,{zoom:2,rasterScale:1}),second=I(o,a,{zoom:2,rasterScale:3});
  assert.equal(first.valid,true);assert.deepEqual(first.css,second.css);approximate(second.resolution.scaleY,first.resolution.scaleY*3);assert.equal(first.heightRatio,second.heightRatio);
});
test('array masks keep height comparison but suppress misleading original-crop resolution ratios',async()=>{
  const {inspectScaleComparison:I}=await moduleReady;
  for(const mask of [[],[[0,0],[1,0],[1,1]]]){const o={width:500,height:160,mask},r=I(o,{crop:{w:100,h:100}},{zoom:3,rasterScale:4});assert.equal(r.valid,true);assert.equal(r.heightRatio,2);assert.deepEqual(r.css,{width:1500,height:480});assert.deepEqual(r.resolution,{status:'masked',scaleX:null,scaleY:null,maxScale:null});assert.deepEqual(r.bars,{maxHeight:72,reference:36,object:72});}
});
test('all six numeric inputs reject zero, negative, coerced, missing and nonfinite values',async()=>{
  const {inspectScaleComparison:I}=await moduleReady;
  for(const where of ['width','height','crop.w','crop.h','zoom','rasterScale'])for(const bad of [0,-1,NaN,Infinity,-Infinity,'1',true,false,null,undefined]){
    const {object,asset,options}=input();if(where.startsWith('crop.'))asset.crop[where.slice(5)]=bad;else if(where==='zoom'||where==='rasterScale')options[where]=bad;else object[where]=bad;
    const r=I(object,asset,options);assert.equal(r.valid,false,where+' accepted '+String(bad));assert.equal(r.resolution.status,'invalid');assert.equal(r.resolution.maxScale,null);
  }
});
test('arithmetic overflow returns invalid instead of infinite sizes or source scales',async()=>{
  const {inspectScaleComparison:I}=await moduleReady;
  const cases=[[{width:Number.MAX_VALUE,height:80},{crop:{w:1,h:1}},{zoom:2,rasterScale:1}],[{width:80,height:Number.MAX_VALUE},{crop:{w:1,h:1}},{zoom:2,rasterScale:1}],[{width:1e308,height:80},{crop:{w:1,h:1}},{zoom:1,rasterScale:2}],[{width:80,height:80},{crop:{w:Number.MIN_VALUE,h:1}},{zoom:1,rasterScale:1}],[{width:Number.MAX_VALUE,height:80,mask:[]},{crop:{w:1,h:1}},{zoom:2,rasterScale:1}]];
  for(const args of cases){const r=I(...args);assert.equal(r.valid,false);assert.equal(r.resolution.status,'invalid');assert.match(r.reason,/범위 초과/);}
});
test('comparison bars share one scale and never apply a minimum display height',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,a={crop:{w:100,h:100}},opts={zoom:1,rasterScale:1};
  for(const h of [1,40,80,160,32000,Number.MAX_VALUE]){const r=I({width:1,height:h},a,opts);assert.equal(r.valid,true);assert.ok(r.bars.reference>=0&&r.bars.reference<=72);assert.ok(r.bars.object>=0&&r.bars.object<=72);if(h===1)assert.equal(r.bars.object,.9);if(h===160)assert.deepEqual(r.bars,{maxHeight:72,reference:36,object:72});if(h!==Number.MAX_VALUE)approximate(r.bars.object/r.bars.reference,h/80);}
});
test('malformed records and throwing required getters return detached invalid diagnostics',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,{object,asset,options}=input();
  for(const args of [[null,asset,options],[[],asset,options],[object,null,options],[object,[],options],[object,{crop:null},options],[object,{crop:[]},options],[object,asset,null],[object,asset,[]],[]])assert.equal(I(...args).valid,false);
  const bad={get width(){throw new Error('unreadable input');},height:80};assert.equal(I(bad,asset,options).valid,false);
  const first=I(null,asset,options);first.resolution.status='changed';assert.equal(I(null,asset,options).resolution.status,'invalid');
});
test('every result is fresh and output mutation never changes frozen input or later inspection',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,args=freeze(input()),before=JSON.stringify(args),first=I(args.object,args.asset,args.options);
  first.world.width=-1;first.sourceCrop.height=-1;first.css.width=-1;first.resolution.scaleX=-1;first.bars.reference=-1;first.heightRatio=-1;
  const next=I(args.object,args.asset,args.options);assert.equal(next.world.width,50);assert.equal(next.sourceCrop.height,578);assert.equal(next.css.width,50);assert.equal(next.resolution.scaleX,50/350);assert.equal(next.bars.reference,72);assert.equal(next.heightRatio,1);assert.equal(JSON.stringify(args),before);
});
test('inspecting real residents leaves exact scene bytes, nav, assets and every body foot unchanged',async()=>{
  const {inspectScaleComparison:I}=await moduleReady,s=clone(scene),before=JSON.stringify(s),foot=s.layers.find(l=>l.id==='foot'),baselineHash=sha(sceneBytes);
  for(const o of foot.objects){const a=s.assets.find(a=>a.id===o.assetId);I(o,a,{zoom:1.5,rasterScale:2.75});}
  assert.equal(JSON.stringify(s),before);assert.equal(s.walkable.reduce((n,v)=>n+v,0),1192);assert.equal(baselineHash,'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a');assert.equal(sha(fs.readFileSync(sceneFile)),baselineHash);
});
