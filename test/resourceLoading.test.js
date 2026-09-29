import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function sourceFunction(name){
 const start=html.indexOf('function '+name+'(');assert.ok(start>=0,name+' exists');
 const open=html.indexOf('{',start);let depth=0;
 for(let i=open;i<html.length;i++){if(html[i]==='{')depth++;else if(html[i]==='}'&&!--depth)return html.slice(start,i+1);}
 assert.fail(name+' has a complete body');
}

test('ultimate render initialization requests only the currently used black texture',()=>{
 const start=html.indexOf('  if(!G._ultImg)');const end=html.indexOf('  // 블랙 — 시전 중 소용돌이',start);
 assert.ok(start>=0&&end>start);const requests=[];
 class Image{constructor(){this.complete=false;this.naturalWidth=0;}set src(value){requests.push(value);}}
 const ctx=vm.createContext({G:{},Image});const initialize=html.slice(start,end);
 vm.runInContext(initialize,ctx);vm.runInContext(initialize,ctx);
 assert.deepEqual(requests,['assets/vfx/boss/ult_black_c.png']);
 assert.deepEqual(Object.keys(ctx.G._ultImg),['black']);
});

function bossHarness(){
 const requests=[],pending=[],disposed=[],actions=[],warnings=[],mixerEvents=[];let maxPending=0;
 const texture={isTexture:true,dispose(){disposed.push('texture');}};
 const makeScene=()=>{const mesh={isMesh:true,geometry:{dispose(){disposed.push('geometry');}},material:{map:texture,dispose(){disposed.push('material');}}};return{scale:{setScalar(){}},position:{y:0,sub(){}},traverse(fn){fn(mesh);}};};
 const clip=()=>({name:'original',clone(){return clip();}});
 class Vector3{constructor(){this.x=1;this.y=2;this.z=3;}}
 class Box3{setFromObject(){return this;}getSize(v){return v;}getCenter(v){return v;}}
 class Group{constructor(){this.children=[];}add(v){this.children.push(v);}}
 class AnimationMixer{stopAllAction(){mixerEvents.push('stop');}uncacheRoot(scene){mixerEvents.push({uncache:scene});}clipAction(c){const action={clip:c,play(){return this;}};actions.push(action);return action;}}
 const anims={idle:{src:'idle.glb'}};
 for(const state of ['walk','aggro','run','hit','chargeWind','charge','multiDashWind','multiDash','spinWind','spin','slamWind','slam'])anims[state]={src:state==='walk'?'walk.glb':'shared.glb'};
 const ctx=vm.createContext({console:{log(){},warn(...args){warnings.push(args);}},window:{},THREE:{Vector3,Box3,Group,AnimationMixer,DoubleSide:2},
 _b3flash:{dispose(){disposed.push('shared flash');}},_b3curHell:-1,_b3ready:false,_b3loadGeneration:0,_B3_MODELS:{0:anims},_B3_DEFAULT:anims,_B3_ANIMS:null,
 _b3anchor:null,_b3mixer:null,_b3model:null,_b3pivot:null,_b3meshes:[],_b3origMats:[],_b3actions:{},_b3state:'idle',_b3size:new Vector3(),
 _b3s:{remove(){},add(){}},_b3loader:{load(src,ok,progress,error){requests.push(src);pending.push({src,ok,error});maxPending=Math.max(maxPending,pending.length);}}});
 const helper=html.includes('function _b3loadActions(')?sourceFunction('_b3loadActions'):'';
 const release=html.includes('function _b3releaseModel(')?sourceFunction('_b3releaseModel'):'';
 vm.runInContext(sourceFunction('_b3disposeGltf')+'\n'+helper+'\n'+sourceFunction('_b3applyFlash')+'\n'+release+'\n'+sourceFunction('_b3loadModel'),ctx);
 return{ctx,requests,pending,disposed,actions,warnings,mixerEvents,peak:()=>maxPending,complete(index=0){const p=pending.splice(index,1)[0];assert.ok(p);p.ok({scene:makeScene(),animations:[clip()]});},fail(index=0){const p=pending.splice(index,1)[0];assert.ok(p);p.error(new Error('resource limit'));},drain(){while(pending.length)this.complete();}};
}

test('boss animation states sharing a GLB parse that file once',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();
 assert.deepEqual(h.requests.sort(),['idle.glb','shared.glb','walk.glb']);
 assert.equal(Object.keys(h.ctx._b3actions).length,13);
 assert.equal(new Set(h.actions.map(a=>a.clip)).size,13,'each state owns an independent animation clip');
});
test('boss animation loading has at most two requests in flight',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();assert.ok(h.peak()<=2,'observed '+h.peak()+' concurrent GLB requests');
});
test('temporary animation model geometry and textures are released after clip extraction',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();
 assert.deepEqual(h.disposed.sort(),['geometry','geometry','material','material','texture','texture'].sort());
});
test('failed animation requests release their slot and allow later requests to finish',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.complete();h.fail();h.drain();
 assert.equal(h.pending.length,0);assert.equal(h.warnings.length,1);assert.ok(h.ctx._b3actions.idle);assert.ok(h.ctx._b3actions.aggro);
});
test('stale animation generations dispose their GLB and never attach actions',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.complete();h.ctx._b3loadGeneration++;h.drain();
 assert.deepEqual(Object.keys(h.ctx._b3actions),['idle']);assert.ok(h.disposed.includes('texture'));
});

function fogHarness(){
 const events=new Map(),resizes=[],warnings=[],renderers=[];let lost=false,renderFailure=null,renders=0;
 const canvas={width:0,height:0,style:{},addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn);}};
 class Vector{constructor(...values){this.values=values;}set(...values){this.values=values;}}
 class WebGLRenderer{constructor(){renderers.push(this);}getContext(){return{isContextLost:()=>lost};}setSize(){}setClearColor(){}render(){renders++;if(renderFailure){if(renderFailure.contextLoss)lost=true;throw renderFailure.error;}}}
 class Scene{add(){}}
 class ShaderMaterial{constructor(options){this.uniforms=options.uniforms;}}
 const ctx=vm.createContext({_fogGLR:false,_fogGLTime:0,_fogThree:null,_FOG_COLORS:[[.1,.18,.08]],SI_TO_HELL:[0],G:{stage:0},
 console:{log(){},warn(...args){warnings.push(args);}},
 document:{getElementById:()=>canvas,createElement:()=>({getContext:()=>({})})},
 window:{innerWidth:1280,innerHeight:720,addEventListener(name,fn){resizes.push({name,fn});}},
 THREE:{WebGLRenderer,Scene,ShaderMaterial,Vector2:Vector,Vector3:Vector,OrthographicCamera:class{},PlaneGeometry:class{},Mesh:class{}}});
 vm.runInContext(sourceFunction('_fogGLInit')+'\n'+sourceFunction('_fogGLRender'),ctx);ctx._fogGLInit();
 return{ctx,canvas,renderers,warnings,resizes,renders:()=>renders,setLost(value){lost=value;},fail(error,contextLoss=false){renderFailure={error,contextLoss};},fire(name){const event={prevented:false,preventDefault(){this.prevented=true;}};for(const fn of events.get(name)||[])fn(event);return event;}};
}

test('fog skips rendering and preserves time when the context is already lost',()=>{
 const h=fogHarness();h.setLost(true);h.ctx._fogGLRender();assert.equal(h.renders(),0);assert.equal(h.ctx._fogGLTime,0);assert.equal(h.ctx._fogGLR,false);
});
test('fog context loss allows restoration and disables the layer until restored',()=>{
 const h=fogHarness();h.setLost(true);const event=h.fire('webglcontextlost');assert.equal(event.prevented,true);assert.equal(h.ctx._fogGLR,false);h.ctx._fogGLRender();assert.equal(h.renders(),0);
});
test('fog restores the existing renderer and material without changing dimensions',()=>{
 const h=fogHarness(),renderer=h.ctx._fogThree.renderer,material=h.ctx._fogThree.mat;
 h.setLost(true);h.fire('webglcontextlost');assert.equal(h.ctx._fogGLR,false);h.setLost(false);h.fire('webglcontextrestored');h.ctx._fogGLRender();
 assert.equal(h.ctx._fogGLR,true);assert.equal(h.renders(),1);assert.equal(h.ctx._fogThree.renderer,renderer);assert.equal(h.ctx._fogThree.mat,material);assert.equal(h.renderers.length,1);assert.deepEqual([h.canvas.width,h.canvas.height],[1280,720]);
});
test('fog initialization does not allocate another renderer while the existing context is lost',()=>{
 const h=fogHarness();h.setLost(true);h.fire('webglcontextlost');h.ctx._fogGLR=false;h.ctx._fogGLInit();assert.equal(h.renderers.length,1);assert.equal(h.resizes.length,1);
});
test('fog contains a context loss occurring during renderer.render',()=>{
 const h=fogHarness();h.fail(new TypeError('shader source is null'),true);assert.doesNotThrow(()=>h.ctx._fogGLRender());assert.equal(h.ctx._fogGLR,false);
});
test('fog propagates render failures unrelated to context loss',()=>{
 const h=fogHarness(),error=new Error('unexpected shader error');h.fail(error);assert.throws(()=>h.ctx._fogGLRender(),e=>e===error);assert.equal(h.ctx._fogGLR,true);
});


test('boss model replacement releases the displayed model and mixer bindings',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();const model=h.ctx._b3model;h.disposed.length=0;h.ctx._b3loadModel(1);
 assert.deepEqual(h.disposed.sort(),['geometry','material','texture']);assert.equal(h.mixerEvents[0],'stop');assert.equal(h.mixerEvents[1]?.uncache,model);assert.equal(h.ctx.window._b3dbg,null);assert.equal(h.ctx._b3model,null);assert.equal(h.ctx._b3ready,false);
});
test('replacing a flashing boss releases its original materials and preserves the shared flash material',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();h.ctx._b3applyFlash(true);h.disposed.length=0;h.ctx._b3loadModel(1);
 assert.deepEqual(h.disposed.sort(),['geometry','material','texture']);assert.ok(!h.disposed.includes('shared flash'));
});
test('requesting an already ready boss model preserves its resources and mixer',()=>{
 const h=bossHarness();h.ctx._b3loadModel(0);h.drain();const model=h.ctx._b3model;h.disposed.length=0;h.ctx._b3loadModel(0);
 assert.equal(h.ctx._b3model,model);assert.deepEqual(h.disposed,[]);assert.deepEqual(h.mixerEvents,[]);
});
test('discarded GLTF resources are released once despite shared mesh materials and texture slots',()=>{
 const disposed=[];class ImageBitmap{close(){disposed.push('bitmap');}}
 const image=new ImageBitmap(),texture={isTexture:true,image,dispose(){disposed.push('texture');}},geometry={dispose(){disposed.push('geometry');}},skeleton={dispose(){disposed.push('skeleton');}};
 const material={map:texture,emissiveMap:texture,dispose(){disposed.push('material');}};
 const gltf={scene:{traverse(fn){for(let i=0;i<2;i++)fn({isMesh:true,geometry,material:[material,material],skeleton});}}};
 const ctx=vm.createContext({ImageBitmap});vm.runInContext(sourceFunction('_b3disposeGltf'),ctx);ctx._b3disposeGltf(gltf);
 assert.deepEqual(disposed.sort(),['bitmap','geometry','material','skeleton','texture'].sort());
});


test('Three runtime coalesces repeated startup and exposes the same module namespace after loading',async()=>{
 const source=readFileSync(new URL('../three-runtime.js',import.meta.url),'utf8').replace('import(', '__load(');let resolveCore,loads=0;const pending=new Promise(resolve=>{resolveCore=resolve;});const core={REVISION:'160'},ctx=vm.createContext({window:{},console:{warn(){}},__load(){loads++;return pending;}});
 vm.runInContext(source,ctx);vm.runInContext(source,ctx);assert.equal(loads,1);assert.equal(ctx.window.THREE,undefined);resolveCore(core);assert.equal(await ctx.window._threeReady,core);assert.equal(ctx.window.THREE,core);
});
test('Three runtime failure resolves disabled GPU layers without an unhandled rejection',async()=>{
 const source=readFileSync(new URL('../three-runtime.js',import.meta.url),'utf8').replace('import(', '__load('),warnings=[];
 const ctx=vm.createContext({window:{gameOn:true},console:{warn(...args){warnings.push(args);}},__load(){return Promise.reject(new Error('offline module failure'));}});vm.runInContext(source,ctx);
 assert.equal(await ctx.window._threeReady,null);assert.equal(ctx.window.THREE,undefined);assert.equal(ctx.window.gameOn,true);assert.equal(warnings.length,1);
});
test('fog startup waits for the shared runtime and skips initialization after load failure',async()=>{
 let resolveCore;const pending=new Promise(resolve=>{resolveCore=resolve;}),calls=[];const ctx=vm.createContext({window:{_threeReady:pending},_fogGLInit(){calls.push('init');}});vm.runInContext(sourceFunction('_fogGLStart'),ctx);
 const started=ctx._fogGLStart();assert.deepEqual(calls,[]);resolveCore({REVISION:'160'});await started;assert.deepEqual(calls,['init']);ctx.window._threeReady=Promise.resolve(null);await ctx._fogGLStart();assert.equal(calls.length,1);
});
test('legacy VFX colors retain their original numeric channels under the shared r160 core',async()=>{
 const THREE=await import('../assets/vendor/three-r160/build/three.module.js');const ctx=vm.createContext({THREE});vm.runInContext(sourceFunction('_v3legacyColor'),ctx);
 const string=ctx._v3legacyColor('#cc88ff'),number=ctx._v3legacyColor(0xcc88ff);for(const color of [string,number])assert.deepEqual([color.r,color.g,color.b],[204/255,136/255,1]);
 const supplied=new THREE.Color().setRGB(.2,.3,.4);assert.deepEqual(ctx._v3legacyColor(supplied).toArray(),supplied.toArray());assert.equal(THREE.REVISION,'160');
});
test('both game entries resolve Three and every loader dependency to the same local packaged module',async()=>{
 const {parse}=await import('acorn');const path=await import('node:path');const base=new URL('../',import.meta.url),runtime=readFileSync(new URL('../three-runtime.js',import.meta.url),'utf8');
 const load=parse(runtime,{ecmaVersion:'latest'}).body[0];assert.ok(load);const runtimeCore=runtime.match(/import\(['"]([^'"]+)['"]\)/)[1];
 for(const entry of ['game.html','game-easy-test.html']){
  const entryHTML=readFileSync(new URL('../'+entry,import.meta.url),'utf8'),imports=JSON.parse(entryHTML.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  assert.equal(new URL(imports.three,base).href,new URL(runtimeCore,base).href);assert.ok(!entryHTML.includes('<script src="three.min.js">'));
  const visited=new Set();function visit(url){if(visited.has(url.href))return;visited.add(url.href);assert.ok(url.href.startsWith(new URL('../assets/vendor/three-r160/',import.meta.url).href));const code=readFileSync(url,'utf8'),ast=parse(code,{ecmaVersion:'latest',sourceType:'module'});
   for(const statement of ast.body)if(statement.type==='ImportDeclaration'){const spec=statement.source.value;const next=spec==='three'?new URL(imports.three,base):new URL(spec,url);visit(next);}}
  visit(new URL(imports['three/addons/']+'loaders/GLTFLoader.js',base));assert.equal(visited.size,3);
 }
});
