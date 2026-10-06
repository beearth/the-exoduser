/* New static-lighting contract checks. No application/server or previously accepted suite is run. */
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'), file=path.join(root,'assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json');
const bytes=fs.readFileSync(file), original=JSON.parse(bytes), hash=raw=>crypto.createHash('sha256').update(raw).digest('hex'), clone=v=>JSON.parse(JSON.stringify(v));
const imports=import('./map-scene-resident-lighting.mjs');
const atlas='assets/map/hell_rift/resident_layers_20261006/resident-atlas-v1.png';
function resident(scene,key='haran') { return {o:scene.layers.find(l=>l.id==='foot').objects.find(o=>o.id==='obj-resident-'+key),a:scene.assets.find(a=>a.id==='resident-'+key)}; }
function image(extra={}) { return {src:atlas,naturalWidth:1254,naturalHeight:1254,complete:true,...extra}; }
function mockFactory(throwsAt=null) {
  const made=[];
  const make=()=>{
    if(throwsAt==='factory') throw new Error('factory failure');
    const calls=[], ctx={imageSmoothingEnabled:true,globalAlpha:.2,globalCompositeOperation:'xor',fillStyle:'old',depth:0};let saved;
    ctx.save=()=>{calls.push(['save']);saved={imageSmoothingEnabled:ctx.imageSmoothingEnabled,globalAlpha:ctx.globalAlpha,globalCompositeOperation:ctx.globalCompositeOperation,fillStyle:ctx.fillStyle};ctx.depth++;};
    ctx.restore=()=>{calls.push(['restore']);Object.assign(ctx,saved);ctx.depth--;if(throwsAt==='restore')throw new Error('restore failure');};
    ctx.drawImage=(...args)=>{calls.push(['drawImage',args,{smoothing:ctx.imageSmoothingEnabled,alpha:ctx.globalAlpha,composite:ctx.globalCompositeOperation}]);if(throwsAt==='drawImage')throw new Error('draw failure');};
    ctx.createLinearGradient=(...args)=>{calls.push(['gradient',args]);if(throwsAt==='gradient')throw new Error('gradient failure');return {addColorStop:(...stop)=>{calls.push(['stop',stop]);if(throwsAt==='stop')throw new Error('stop failure');}};};
    ctx.fillRect=(...args)=>{calls.push(['fillRect',args,{composite:ctx.globalCompositeOperation}]);if(throwsAt==='fillRect')throw new Error('fill failure');};
    const canvas={width:0,height:0,ctx,calls,getContext:(...args)=>{calls.push(['context',args]);return throwsAt==='context'?null:ctx;}};made.push(canvas);return canvas;
  };return {make,made};
}

test('frozen material contract exposes exact three alpha stops and four-cache bound',async()=>{
  const {RESIDENT_LIGHTING:C}=await imports;
  assert.deepEqual(C,{sourceSize:1254,maxCache:4,composite:'source-atop',stops:[{offset:0,color:'rgba(116,126,130,0.14)'},{offset:.55,color:'rgba(116,126,130,0)'},{offset:1,color:'rgba(206,120,92,0.16)'}]});
  assert.ok(Object.isFrozen(C)&&Object.isFrozen(C.stops)&&C.stops.every(Object.isFrozen));
});
test('actual v2 admits exactly four canonical resident crops at source resolution',async()=>{
  const {createResidentLighting}=await imports, f=mockFactory(), c=createResidentLighting(f.make), s=clone(original), im=image();
  assert.equal(c.prepare(s),true);
  for(const key of ['haran','berin','nessa','dorik']) {const {o,a}=resident(s,key), p=c.picture(o,a,im);assert.equal(p.width,a.crop.w);assert.equal(p.height,a.crop.h);}
  assert.deepEqual({...c.snapshot(),entries:[]},{enabled:true,profileAdmitted:true,eligible:4,cacheSize:4,builds:4,hits:0,failed:0,entries:[]});assert.equal(f.made.length,4);
});
test('same-ID clones, prefix spoofs and duplicate canonical records are never graded',async()=>{
  const {createResidentLighting}=await imports, f=mockFactory(), c=createResidentLighting(f.make), s=clone(original), {o,a}=resident(s), im=image();c.prepare(s);
  assert.equal(c.picture({...o},a,im),null);assert.equal(c.picture(o,{...a},im),null);assert.equal(c.picture({...o,id:o.id+'-extra'},a,im),null);
  assert.equal(c.picture(s.layers[0].objects[0],s.assets[0],im),null);assert.equal(f.made.length,0);
  const duplicate=clone(s);duplicate.layers.find(l=>l.id==='foot').objects.push({...resident(duplicate).o});assert.equal(c.prepare(duplicate),false);
  const duplicateAsset=clone(s);duplicateAsset.assets.push({...resident(duplicateAsset).a});assert.equal(c.prepare(duplicateAsset),false);
});
test('unknown pins, noncanonical crops, transformed bodies and hidden foot fail closed and clear crops',async()=>{
  const {createResidentLighting}=await imports;
  const edits=[s=>s.sourcePins.residentAtlas='bad',s=>resident(s).a.crop.x++,s=>resident(s).o.rotation=1,s=>resident(s).o.flipX=true,s=>resident(s).o.pivotY=.99,s=>resident(s).o.opacity=.99,s=>resident(s).o.width++,s=>resident(s).o.mask=[[0,0],[1,0],[1,1]],s=>resident(s).o.sourceParallax=1,s=>s.layers.find(l=>l.id==='foot').visible=false,s=>s.layers.find(l=>l.id==='foot').parallax=.9,s=>s.layers.find(l=>l.id==='east').objects[0].x++];
  for(const edit of edits){const f=mockFactory(),c=createResidentLighting(f.make),s=clone(original);c.prepare(s);const {o,a}=resident(s);c.picture(o,a,image());edit(s);assert.equal(c.prepare(s),false);assert.equal(c.picture(o,a,image()),null);assert.equal(c.snapshot().cacheSize,0);}
});
test('current target mutation is checked between prepare and picture while valid move/resize reuse source crop',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s),im=image();c.prepare(s);const first=c.picture(o,a,im);
  o.x+=40;o.y-=20;o.width*=1.5;o.height*=1.5;assert.equal(c.prepare(s),true);assert.equal(c.picture(o,a,im),first);assert.equal(f.made.length,1);
  o.rotation=90;assert.equal(c.picture(o,a,im),null);assert.equal(c.snapshot().cacheSize,0);o.rotation=0;c.prepare(s);assert.notEqual(c.picture(o,a,im),first);
});
test('image identity, dimensions, completion and loaded source invalidate cached material',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s);c.prepare(s);const im=image(),first=c.picture(o,a,im);assert.equal(c.picture(o,a,im),first);
  const other=image();assert.notEqual(c.picture(o,a,other),first);assert.equal(f.made.length,2);
  for(const edit of [im=>im.naturalWidth=1253,im=>im.naturalHeight=0,im=>im.complete=false,im=>im.src='assets/objects/tree_dead_01.png',im=>im.currentSrc='https://other.example/'+atlas]) {const bad=image();edit(bad);assert.equal(c.picture(o,a,bad),null);assert.equal(c.snapshot().cacheSize,0);}
  assert.ok(c.picture(o,a,im));assert.equal(f.made.length,3);
});
test('same prepared scene does not allocate on cache hits, reload clears reference admission and public clear resets stats',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s),im=image();c.prepare(s);const first=c.picture(o,a,im);
  for(let i=0;i<10;i++){c.prepare(s);assert.equal(c.picture(o,a,im),first);}assert.equal(f.made.length,1);assert.equal(c.snapshot().hits,10);
  const next=clone(s);c.prepare(next);assert.equal(c.snapshot().cacheSize,0);assert.equal(c.picture(o,a,im),null);const newer=resident(next);assert.notEqual(c.picture(newer.o,newer.a,im),first);
  c.clear();assert.deepEqual(c.snapshot(),{enabled:false,profileAdmitted:false,eligible:0,cacheSize:0,builds:0,hits:0,failed:0,entries:[]});assert.equal(c.picture(newer.o,newer.a,im),null);
});
test('prepare and material builds leave immutable scene, loaded image and source PNG bytes unchanged',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),before=JSON.stringify(s),im=Object.freeze(image());
  const png=path.join(root,atlas),beforePng=hash(fs.readFileSync(png));c.prepare(s);for(const key of ['haran','berin','nessa','dorik']){const {o,a}=resident(s,key);c.picture(o,a,im);}c.clear();
  assert.equal(JSON.stringify(s),before);assert.equal(hash(fs.readFileSync(file)),hash(bytes));assert.equal(beforePng,'ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38');assert.equal(hash(fs.readFileSync(png)),beforePng);
});
test('build uses exact crop once, unsmoothed source-over then alpha-confined gradient, with balanced context',async()=>{
  const {createResidentLighting,RESIDENT_LIGHTING:C}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s),im=image();c.prepare(s);const p=c.picture(o,a,im);
  assert.deepEqual(p.calls.find(c=>c[0]==='context')[1],['2d',{willReadFrequently:true}]);
  assert.deepEqual(p.calls.find(c=>c[0]==='drawImage'),['drawImage',[im,169,27,350,578,0,0,350,578],{smoothing:false,alpha:1,composite:'source-over'}]);
  assert.deepEqual(p.calls.find(c=>c[0]==='gradient')[1],[0,0,0,578]);assert.deepEqual(p.calls.filter(c=>c[0]==='stop').map(c=>c[1]),C.stops.map(s=>[s.offset,s.color]));
  assert.deepEqual(p.calls.find(c=>c[0]==='fillRect'),['fillRect',[0,0,350,578],{composite:'source-atop'}]);assert.equal(p.ctx.depth,0);assert.equal(p.ctx.globalCompositeOperation,'xor');assert.equal(p.ctx.imageSmoothingEnabled,true);assert.equal(p.ctx.globalAlpha,.2);
});
test('build errors return null, restore after saved context, and failed keys do not retry every frame',async()=>{
  const {createResidentLighting}=await imports;
  for(const stage of ['factory','context','drawImage','gradient','stop','fillRect','restore']){const f=mockFactory(stage),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s),im=image();c.prepare(s);assert.equal(c.picture(o,a,im),null);assert.equal(c.picture(o,a,im),null);assert.equal(c.snapshot().builds,1);assert.equal(c.snapshot().failed,1);assert.equal(c.snapshot().cacheSize,1);if(!['factory','context'].includes(stage)){assert.equal(f.made[0].ctx.depth,0);assert.equal(f.made[0].calls.filter(c=>c[0]==='restore').length,1);}}
});
test('all four cache slots stay bounded through image replacement and impostor churn',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original);c.prepare(s);
  for(let i=0;i<5;i++){const im=image();for(const key of ['haran','berin','nessa','dorik']){const {o,a}=resident(s,key);assert.ok(c.picture(o,a,im));assert.ok(c.snapshot().cacheSize<=4);assert.ok(f.made.filter(c=>c.width>0&&c.height>0).length<=4);}for(let j=0;j<20;j++)assert.equal(c.picture({id:'obj-resident-'+j},s.assets[0],im),null);}
  assert.equal(c.snapshot().cacheSize,4);assert.equal(c.snapshot().builds,20);assert.equal(c.snapshot().failed,0);
});
test('snapshot contains fresh diagnostics without editable object, image or canvas references',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s);c.prepare(s);c.picture(o,a,image());const snap=c.snapshot();
  snap.entries[0].crop.x=-1;snap.entries[0].src='bad';snap.entries.push({});snap.enabled=false;const current=c.snapshot();assert.equal(current.entries.length,1);assert.equal(current.entries[0].crop.x,169);assert.equal(current.enabled,true);assert.equal(a.crop.x,169);assert.ok(!('canvas' in current.entries[0])&&!('image' in current.entries[0])&&!('object' in current.entries[0]));
});
test('original baked and generic scenes never allocate material and unsupported import drops prior cache',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s);c.prepare(s);c.picture(o,a,image());
  const baked=JSON.parse(fs.readFileSync(path.join(root,'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json')));
  for(const unsupported of [baked,{},null,{assets:[],layers:[]},clone({...original,residentLayerReview:undefined})]){assert.equal(c.prepare(unsupported),false);assert.equal(c.picture(o,a,image()),null);assert.equal(c.snapshot().cacheSize,0);}
  assert.equal(f.made.length,1);
});
test('browser absolute Image.src must match the current document base, not another origin or suffix',async()=>{
  const {createResidentLighting}=await imports,f=mockFactory(),c=createResidentLighting(f.make),s=clone(original),{o,a}=resident(s),before=global.document;
  try{global.document={baseURI:'http://127.0.0.1:3387/editor.html',createElement:tag=>{assert.equal(tag,'canvas');return f.make();}};c.prepare(s);assert.ok(c.picture(o,a,image({src:'http://127.0.0.1:3387/'+atlas})));assert.equal(c.picture(o,a,image({src:'http://unrelated.test/'+atlas})),null);assert.equal(c.picture(o,a,image({src:'http://127.0.0.1:3387/prefix/'+atlas})),null);const defaultC=createResidentLighting();defaultC.prepare(s);assert.ok(defaultC.picture(o,a,image()));}
  finally{if(before===undefined)delete global.document;else global.document=before;}
});
