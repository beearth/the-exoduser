'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
require('./map-scene-core.js');
const K=globalThis.MapSceneCore;
const ready=import(pathToFileURL(path.join(__dirname,'map-scene-object-list.mjs')).href);
const obj=(extra={})=>({id:'a',assetId:'art',name:'그림',x:120,y:200,width:100,height:200,pivotX:.5,pivotY:1,rotation:0,flipX:false,...extra});
const scene=(objects=[obj()],parallax=1)=>({format:'exoduser-map-scene',version:1,world:{cols:200,rows:200,tileSize:40},layers:[{id:'foot',name:'FOOT',visible:true,locked:false,sort:'foot',parallax,objects}]});
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('foot pivot: centres the full image rather than the foot, with a 40px border',async()=>{
 const U=await ready,s=scene(),q=U.frameLayerObjects(s,'foot',['a'],800,600);
 assert.deepEqual(q,{x:120,y:100,zoom:2.6});
 assert.deepEqual(U.focusObjectFoot(s,'foot','a'),{x:120,y:200});
});
test('90-degree rotation and flip use the renderer transform order',async()=>{
 const U=await ready,o=obj({x:400,y:500,width:100,height:200,pivotX:0,pivotY:0,rotation:90,flipX:true});
 const q=U.frameLayerObjects(scene([o]),'foot',['a'],800,600);
 close(q.x,300);close(q.y,450);assert.equal(q.zoom,3);
 // Independently invert the actual core's hit-test transform at the rotated corners.
 for(const [x,y,u,v] of [[400,500,0,0],[400,400,100,0],[200,500,0,200],[200,400,100,200]]){
  const p=K.local(o,x,y);close(p.x,u);close(p.y,v);
  assert.ok(Math.abs((x-q.x)*q.zoom)<=360);assert.ok(Math.abs((y-q.y)*q.zoom)<=260);
 }
});
test('batch union, locked read-only view and off-world placements remain unchanged',async()=>{
 const U=await ready,s=freeze(scene([obj({id:'left',x:-500,y:100}),obj({id:'right',x:9000,y:100})]));
 const before=JSON.stringify(s),q=U.frameLayerObjects(s,'foot',['left','right'],1000,600);
 close(q.x,4250);close(q.y,0);close(q.zoom,920/9600);assert.equal(JSON.stringify(s),before);
 const locked=scene();locked.layers[0].locked=true;assert.ok(U.frameLayerObjects(locked,'foot',['a'],800,600));
});
test('parallax .5 uses the same camera inverse as the actual renderer offset',async()=>{
 const U=await ready,s=scene([obj({x:1000,y:1500,width:200,height:400})],.5),q=U.frameLayerObjects(s,'foot',['a'],800,600);
 assert.deepEqual(q,{x:-2000,y:-1400,zoom:1.3});
 const renderedCentre={x:1000+(q.x-4000)*.5,y:1300+(q.y-4000)*.5};close(renderedCentre.x,q.x);close(renderedCentre.y,q.y);
});
test('tiny object zoom is capped, wide batch can fit below normal wheel minimum',async()=>{
 const U=await ready;assert.equal(U.frameLayerObjects(scene([obj({width:1,height:1})]),'foot',['a'],800,600).zoom,3);
 const q=U.frameLayerObjects(scene([obj({id:'l',x:-40000}),obj({id:'r',x:40000})]),'foot',['l','r'],130,220);
 assert.ok(q.zoom>0&&q.zoom<.025);close(q.zoom,104/80100);
});
test('hidden/zero-parallax cannot frame; invalid selections and transforms are rejected',async()=>{
 const U=await ready,s=scene();s.layers[0].visible=false;assert.equal(U.frameLayerObjects(s,'foot',['a'],800,600),null);
 assert.equal(U.frameLayerObjects(scene([],0),'foot',['a'],800,600),null);
 for(const ids of [[],['a','a'],['missing']])assert.throws(()=>U.frameLayerObjects(scene(),'foot',ids,800,600));
 for(const o of [obj({rotation:NaN}),obj({pivotX:2}),obj({flipX:0})])assert.throws(()=>U.frameLayerObjects(scene([o]),'foot',['a'],800,600));
 for(const v of [0,NaN,Infinity,-1])assert.throws(()=>U.frameLayerObjects(scene(),'foot',['a'],v,600));
});
test('approved Rift scene can frame all residents without altering project bytes',async()=>{
 const U=await ready,bytes=fs.readFileSync(path.join(__dirname,'../assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json'));
 const s=K.validate(JSON.parse(bytes)),before=JSON.stringify(s),q=U.frameLayerObjects(s,'foot',['obj-resident-haran','obj-resident-berin','obj-resident-nessa','obj-resident-dorik'],1000,700);
 assert.ok(q.zoom>0&&q.zoom<=3);assert.equal(JSON.stringify(s),before);
 assert.deepEqual(fs.readFileSync(path.join(__dirname,'../assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json')),bytes);
});

// Extract the actual new action and complete existing key handler; never boot an editor/browser.
function harness(frameFactory){
 const source=fs.readFileSync(path.join(__dirname,'map-scene-editor.js'),'utf8');
 const action=source.slice(source.indexOf('  function frameSelectionUI()'),source.indexOf('  function fit()'));
 const start=source.indexOf("  window.addEventListener('keydown',e=>{if(busy)return;"),end=source.indexOf("  window.addEventListener('keyup'",start);
 assert.ok(action.length>300&&action.length<2200&&end>start&&end-start<5000);
 return new Function('objectFrameFactory',`let busy=false,playing=false,dialogueOpen=false,drag=null,space=false,dirty=false,selected='a',batchLayer=null;
 const batchIds=new Set(),keys=new Set(),size={w:800,h:600};let viewport={x:0,y:0,zoom:.1};
 const project=${JSON.stringify(scene())},history={pending:null};let handler,focuses=0,talks=0,writes=0;
 const nodes=new Map();const $=id=>{if(!nodes.has(id))nodes.set(id,{disabled:false,click(){writes++;}});return nodes.get(id);};
 const canvas={focus(){focuses++;}},window={addEventListener(k,h){handler=h;}},document={querySelector(){return{click(){writes++;}}}};
 const current=()=>project,selectedPair=()=>({l:project.layers[0],o:project.layers[0].objects[0]}),releaseHeld=()=>{keys.clear();space=false;};
 const talk=()=>talks++,toast=()=>{},clearBatch=()=>batchIds.clear(),palette=()=>{},refresh=()=>{},closeDialogue=()=>{};
 ${action}\n${source.slice(start,end)}
 return {action:frameSelected,ui:frameSelectionUI,send:handler,state:()=>({viewport:{...viewport},focuses,talks,writes,dirty,space,scene:JSON.stringify(project),selected,batch:[...batchIds]}),nodes,set(v){for(const [k,x]of Object.entries(v)){if(k==='busy')busy=x;if(k==='playing')playing=x;if(k==='dialogueOpen')dialogueOpen=x;if(k==='drag')drag=x;if(k==='pending')history.pending=x;if(k==='visible')project.layers[0].visible=x;if(k==='parallax')project.layers[0].parallax=x;}}};`)(frameFactory);
}
function key(extra={}){return {key:'F',shiftKey:true,ctrlKey:false,metaKey:false,altKey:false,repeat:false,isComposing:false,prevented:0,preventDefault(){this.prevented++;},target:{tagName:'CANVAS',isContentEditable:false,closest(){return null;},matches(){return false;}},...extra};}
test('actual action changes only the view, keeps scene/selection and clears held input',async()=>{
 const h=harness((await ready).frameLayerObjects),before=h.state();assert.equal(h.action(),true);const q=h.state();
 assert.deepEqual(q.viewport,{x:120,y:100,zoom:2.6});assert.equal(q.scene,before.scene);assert.equal(q.selected,before.selected);assert.deepEqual(q.batch,before.batch);assert.equal(q.writes,0);assert.equal(q.focuses,1);assert.equal(q.dirty,true);
});
test('actual action and button states block busy/play/dialogue/drag/pending/hidden/fixed layer',async()=>{
 for(const block of [{busy:true},{playing:true},{dialogueOpen:true},{drag:{}},{pending:{}},{visible:false},{parallax:0}]){
  const h=harness((await ready).frameLayerObjects);h.set(block);const before=h.state();h.ui();assert.equal(h.nodes.get('frame-selection').disabled,true);assert.equal(h.action(),false);assert.deepEqual(h.state(),before);
 }
 const h=harness(undefined);h.ui();assert.equal(h.nodes.get('frame-selection').disabled,true);assert.equal(h.action(),false);
});
test('actual Shift+F handler honours input/modifier/repeat/composition guards',async()=>{
 const U=await ready;
 for(const extra of [{repeat:true},{isComposing:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:false},{target:{tagName:'INPUT'}},{target:{tagName:'TEXTAREA'}},{target:{tagName:'SELECT'}},{target:{tagName:'DIV',isContentEditable:true}}]){
  const h=harness(U.frameLayerObjects),e=key(extra);h.send(e);assert.equal(h.state().focuses,0);assert.equal(e.prevented,0);
 }
 const h=harness(U.frameLayerObjects),e=key();h.send(e);assert.equal(h.state().focuses,1);assert.equal(e.prevented,1);
});
test('playing F talk and native button Enter/Space are preserved',async()=>{
 const U=await ready,h=harness(U.frameLayerObjects);h.set({playing:true});h.send(key());assert.equal(h.state().talks,1);assert.equal(h.state().focuses,0);
 for(const k of ['Enter',' ']){const h=harness(U.frameLayerObjects),e=key({key:k,shiftKey:false,target:{tagName:'BUTTON',id:'scene-frame-selection',closest(){return null;},matches(){return false;}}});h.send(e);assert.equal(e.prevented,0);assert.equal(h.state().space,false);}
});
test('DOM registration, module loading, and changed classic source parse',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../editor.html'),'utf8'),s=fs.readFileSync(path.join(__dirname,'map-scene-editor.js'),'utf8');
 assert.equal((html.match(/id="scene-frame-selection"/g)||[]).length,1);assert.match(html,/aria-keyshortcuts="Shift\+F"/);assert.match(html,/map-scene-editor\.js\?v=20261008-frame-selection/);
 assert.match(s,/objectFrameFactory=objects\.frameLayerObjects/);assert.match(s,/map-scene-object-list\.mjs\?frame=20261008/);assert.match(s,/\$\('frame-selection'\)\.onclick=frameSelected/);assert.doesNotThrow(()=>new Function(s));
});
