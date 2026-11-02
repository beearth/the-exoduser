import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import * as chest from '../chest3d.mjs';
import {readFileSync} from 'node:fs';

function requireCandidate(){assert.equal(typeof chest.createChestMaterialSeparation,'function','candidate needs local material separation');assert.equal(typeof chest.disposeChestResources,'function','owned resources need an explicit teardown');}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(t,{failLoad=false,failRender=false,failShader=false,defer=false,preparation=null}={}){
 requireCandidate();t.mock.method(console,'warn',()=>{});
 const saved=new Map(['window','document','requestAnimationFrame','cancelAnimationFrame','devicePixelRatio','innerWidth','innerHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 t.after(()=>{for(const [k,value]of saved)value?Object.defineProperty(globalThis,k,value):delete globalThis[k];});
 const jobs=new Map();let next=0,resolveModel,rejectModel;
 const counts={render:0,rendererDispose:0,contextLoss:0,loads:0,geometryDispose:0,materialDispose:0};
 const tex=new THREE.DataTexture(new Uint8Array([24,16,12,255]),1,1,THREE.RGBAFormat);tex.colorSpace=THREE.SRGBColorSpace;
 const rm=new THREE.Texture(),normal=new THREE.Texture();const material=new THREE.MeshStandardMaterial({map:tex,normalMap:normal,metalnessMap:rm,roughnessMap:rm,metalness:.25,roughness:.7});
 const geometry=new THREE.BoxGeometry(1,.5,.6);geometry.addEventListener('dispose',()=>counts.geometryDispose++);material.addEventListener('dispose',()=>counts.materialDispose++);
 const model=new THREE.Group(),body=new THREE.Mesh(geometry,material),pivot=new THREE.Group();body.name='ChestBody';pivot.name='ChestLidPivot';model.add(body,pivot);
 let renderer,lastScene;
 class Renderer{
  constructor(){renderer=this;this.debug={checkShaderErrors:true,onShaderError:null};this.extensions=preparation?.renderer.extensions??{has:()=>false};this.properties=preparation?.renderer.properties;}
  compile(scene,camera){return preparation.renderer.compile(scene,camera);}
  getContext(){return preparation?.renderer.getContext();}
  setPixelRatio(){}setSize(){}setClearColor(){}
  render(scene){counts.render++;lastScene=scene;if(failShader)this.debug.onShaderError();if(failRender)throw Error('injected render failure');}
  dispose(){counts.rendererDispose++;preparation?.destroy();}forceContextLoss(){counts.contextLoss++;}
 }
 const module={GLTFLoader:class{async loadAsync(){counts.loads++;if(failLoad)throw Error('injected model failure');if(defer)return await new Promise((resolve,reject)=>{resolveModel=()=>resolve({scene:model});rejectModel=reject;});return {scene:model};}}};
 const canvas=Object.assign(new EventTarget(),{style:{}}),world={on:true,paused:false,items:[{type:'chest',x:0,y:0}],cam:{x:0,y:0},canvas:{width:1920,height:1080,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080})}};
 Object.assign(globalThis,{window:{},document:{hidden:false,createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})},devicePixelRatio:1,innerWidth:1920,innerHeight:1080,requestAnimationFrame:fn=>{jobs.set(++next,fn);return next;},cancelAnimationFrame:id=>jobs.delete(id)});
 const api=chest.initChest3D({canvas,getWorld:()=>world,loadDependencies:async()=>[{...THREE,WebGLRenderer:Renderer,DataTexture:class{constructor(){throw Error('environment allocation forbidden');}},PMREMGenerator:class{constructor(){throw Error('PMREM allocation forbidden');}}},module]});
 const tick=now=>{if(!jobs.size)return;const [id,fn]=jobs.entries().next().value;jobs.delete(id);fn(now);};
 const settled=async()=>{for(let n=0;n<12&&api.snapshot().loading;n++)await flush();};
 return {api,counts,material,geometry,tex,model,world,jobs,canvas,tick,settled,resolveModel:()=>resolveModel(),rejectModel:()=>rejectModel(Error('late model reject')),get renderer(){return renderer;},get scene(){return lastScene;}};
}

test('r160 shader keeps original PBR pipeline and toggles a bounded local albedo branch without recompiles',()=>{
 requireCandidate();const material=new THREE.MeshStandardMaterial(),model=new THREE.Group();model.add(new THREE.Mesh(new THREE.BoxGeometry(),material));
 const before={compile:material.onBeforeCompile,key:material.customProgramCacheKey(),version:material.version};
 const control=chest.createChestMaterialSeparation(THREE,model);const shader={uniforms:{},fragmentShader:THREE.ShaderLib.standard.fragmentShader};material.onBeforeCompile(shader,{});
 assert.equal(shader.uniforms.chestLocalAlbedoEnabled.value,1);
 assert.ok(shader.fragmentShader.includes('texelMetalness.b'),'reuse existing metalness sample');
 assert.ok(shader.fragmentShader.includes('#include <normal_fragment_maps>'));assert.ok(shader.fragmentShader.includes('#include <roughnessmap_fragment>'));
 assert.ok(shader.fragmentShader.includes('#include <colorspace_fragment>'));assert.ok(shader.fragmentShader.includes('#include <premultiplied_alpha_fragment>'));
 assert.equal(shader.fragmentShader.replace(/\n\/\/ CHEST_LOCAL_ALBEDO_BEGIN[\s\S]*?\/\/ CHEST_LOCAL_ALBEDO_END/g,''),THREE.ShaderLib.standard.fragmentShader,'only the declared uniform and local branch differ');
 const key=material.customProgramCacheKey(),version=material.version,hook=material.onBeforeCompile;
 for(let n=0;n<1000;n++){control.setEnabled(n%2===0);assert.equal(shader.uniforms.chestLocalAlbedoEnabled.value,n%2===0?1:0);assert.equal(material.customProgramCacheKey(),key);assert.equal(material.version,version);assert.equal(material.onBeforeCompile,hook);}
 assert.equal(control.snapshot().enabled,false);assert.equal(control.snapshot().materials,1);
 control.dispose();control.dispose();assert.equal(material.onBeforeCompile,before.compile);assert.equal(material.customProgramCacheKey(),before.key);assert.equal(control.snapshot().materials,0);assert.equal(control.setEnabled(true),false);chest.disposeChestResources(model);
});

test('shared real Three geometries, textures and materials are disposed once per teardown',()=>{
 requireCandidate();const geometry=new THREE.BoxGeometry(),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture,normalMap:texture}),scene=new THREE.Scene();
 const calls={geometry:0,texture:0,material:0};for(const [key,value]of Object.entries({geometry,texture,material}))value.addEventListener('dispose',()=>calls[key]++);
 scene.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));chest.disposeChestResources(scene,scene);
 assert.deepEqual(calls,{geometry:1,texture:1,material:1});
});

test('default path allocates no environment and same model A/B retains every original PBR input',async t=>{
 const f=fixture(t);const material=f.material;const before={map:material.map,normalMap:material.normalMap,metalnessMap:material.metalnessMap,roughnessMap:material.roughnessMap,color:material.color.toArray(),normalScale:material.normalScale.toArray(),metalness:material.metalness,roughness:material.roughness,envMapIntensity:material.envMapIntensity,emissive:material.emissive.toArray(),opacity:material.opacity,transparent:material.transparent,alphaTest:material.alphaTest,side:material.side};
 f.tick(1);await f.settled();assert.equal(f.api.snapshot().ready,true);f.tick(17);
 assert.equal(f.scene.environment,null);assert.deepEqual(f.api.snapshot().environment,{enabled:false,prepared:false,intensity:0});assert.equal(f.api.setEnvironmentEnabled(true),false);
 assert.equal(f.api.snapshot().materialSeparation.enabled,true);assert.equal(f.api.setMaterialSeparationEnabled(false),false);
 assert.deepEqual({map:material.map,normalMap:material.normalMap,metalnessMap:material.metalnessMap,roughnessMap:material.roughnessMap,color:material.color.toArray(),normalScale:material.normalScale.toArray(),metalness:material.metalness,roughness:material.roughness,envMapIntensity:material.envMapIntensity,emissive:material.emissive.toArray(),opacity:material.opacity,transparent:material.transparent,alphaTest:material.alphaTest,side:material.side},before);
 const shader={uniforms:{},fragmentShader:THREE.ShaderLib.standard.fragmentShader};material.onBeforeCompile(shader,{});assert.equal(shader.uniforms.chestLocalAlbedoEnabled.value,0,'A skips all local albedo arithmetic');
 f.api.setMaterialSeparationEnabled(true);assert.equal(shader.uniforms.chestLocalAlbedoEnabled.value,1);assert.equal(f.scene.environment,null);
 assert.equal(f.renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(f.renderer.toneMappingExposure,1.25);assert.equal(f.api.snapshot().renderSize,64);
 f.api.dispose();f.api.dispose();assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.contextLoss,1);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.jobs.size,0);assert.equal(f.api.active,false);assert.equal(f.api.snapshot().ready,false);assert.equal(f.model.parent,null);assert.equal(f.api.snapshot().materialSeparation.materials,0);
});

test('asset failure releases renderer and retains the native fallback without retries',async t=>{
 const f=fixture(t,{failLoad:true});f.tick(1);await f.settled();assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.active,false);assert.equal(f.canvas.style.display,'none');assert.equal(f.counts.rendererDispose,1);f.tick(17);await flush();assert.equal(f.counts.loads,1);f.api.dispose();
});

test('first render failure releases the shader candidate and falls back once',async t=>{
 const f=fixture(t,{failRender:true});f.tick(1);await f.settled();f.tick(17);assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.active,false);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.contextLoss,1);f.tick(33);assert.equal(f.counts.render,1);f.api.dispose();
});

test('dispose while the GLB is pending also releases the late model',async t=>{
 const f=fixture(t,{defer:true});f.tick(1);await flush();assert.equal(f.api.snapshot().loading,true);f.api.dispose();f.resolveModel();await f.settled();assert.equal(f.api.snapshot().ready,false);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.jobs.size,0);
});

test('baseline can be selected before load, and shader schema mismatch is explicit',async t=>{
 const f=fixture(t);assert.equal(f.api.setMaterialSeparationEnabled(false),false);f.tick(1);await f.settled();f.tick(17);assert.equal(f.api.snapshot().materialSeparation.enabled,false);assert.equal(f.scene.environment,null);
 assert.throws(()=>f.material.onBeforeCompile({uniforms:{},fragmentShader:'void main(){}'},{}),/r160 shader/);f.api.dispose();assert.equal(f.api.setMaterialSeparationEnabled(true),false);
});

test('shader-link callback failure takes the native fallback and releases once',async t=>{
 const f=fixture(t,{failShader:true});f.tick(1);await f.settled();assert.equal(f.renderer.debug.checkShaderErrors,true);assert.equal(typeof f.renderer.debug.onShaderError,'function');assert.throws(()=>f.renderer.debug.onShaderError(),/Chest shader compilation failed/);f.tick(17);assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.active,false);assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.geometryDispose,1);assert.equal(f.model.parent,null);f.tick(33);assert.equal(f.counts.render,1);f.api.dispose();
});

// Execute the installed r160 JS control flow, never a GPU or a browser context.
const vendorSource=readFileSync(new URL('../assets/vendor/three-r160/build/three.module.js',import.meta.url),'utf8');
const propertiesSource=vendorSource.slice(vendorSource.indexOf('function WebGLProperties()'),vendorSource.indexOf('function painterSortStable('));
const makeProperties=new Function('return '+propertiesSource)();
const asyncSource=vendorSource.slice(vendorSource.indexOf('this.compileAsync ='),vendorSource.indexOf('// Animation Loop',vendorSource.indexOf('this.compileAsync =')));
const readySource=vendorSource.slice(vendorSource.indexOf('this.isReady ='),vendorSource.indexOf('// free resource',vendorSource.indexOf('this.isReady =')));
function preparationHarness(t,{supported=true}={}){
 let now=0,id=0,destroyed=false;
 const timers=new Map(),history=[],trace=[],flags={ready:false,lost:false,compileError:false,pollError:false,uniformError:false};
 t.mock.method(globalThis,'setTimeout',(fn,ms)=>{const key=++id;timers.set(key,{fn,at:now+ms});history.push(fn);return key;});
 t.mock.method(globalThis,'clearTimeout',key=>timers.delete(key));
 t.mock.method(performance,'now',()=>now);
 const properties=makeProperties(),material={},otherMaterial={};
 const gl={isContextLost(){assert.equal(destroyed,false,'no context access after release');return flags.lost;},getProgramParameter(program,pname){assert.equal(destroyed,false,'no readiness query after release');assert.equal(pname,0x91B1);trace.push('ready');if(flags.pollError)throw Error('poll rejected');return flags.ready;}};
 const program={program:{},getUniforms(){assert.equal(destroyed,false,'no first-use after release');trace.push('uniforms');if(flags.uniformError)throw Error('link rejected');return {};}};
 // The exact r160 isReady closure caches completion. GL responses are controlled CPU data.
 new Function('gl','program','COMPLETION_STATUS_KHR','let programReady=false;'+readySource).call(program,gl,program.program,0x91B1);
 const renderer={extensions:{has(name){assert.equal(name,'KHR_parallel_shader_compile');return supported;}},properties,getContext:()=>gl,
  compile(){trace.push('compile');if(flags.compileError)throw Error('compile rejected');properties.get(material).currentProgram=program;properties.get(otherMaterial).currentProgram=program;return new Set([material,otherMaterial]);}};
 return {renderer,flags,trace,program,timers,history,properties,
  destroy(){destroyed=true;properties.dispose();program.program=undefined;},
  advance(ms){const end=now+ms;while(true){const next=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;},
  fireLate(){for(const fn of history)fn();}
 };
}

test('installed r160 compileAsync can throw in its late poll after properties disposal',t=>{
 const h=preparationHarness(t),target={compile:()=>h.renderer.compile()};
 const nativeAsync=new Function('properties','extensions','setTimeout',asyncSource+'return this.compileAsync;').call(target,h.properties,{get:()=>({})},setTimeout);
 nativeAsync.call(target,{},{});assert.equal(h.timers.size,1);h.properties.dispose();
 assert.throws(()=>h.advance(10),/isReady/);assert.equal(h.timers.size,0);
});

test('owned preparation waits for KHR then initializes each unique program before ready',async t=>{
 const h=preparationHarness(t);assert.equal(typeof chest.prepareChestRenderer,'function');
 let result;const pending=chest.prepareChestRenderer(h.renderer,{},{}).then(value=>{result=value;});
 await flush();assert.equal(result,undefined);assert.deepEqual(h.trace,['compile','ready']);assert.equal(h.timers.size,1);
 h.flags.ready=true;h.advance(10);await pending;assert.equal(result,'ready');assert.deepEqual(h.trace,['compile','ready','ready','uniforms']);assert.equal(h.timers.size,0);
});

test('abort clears owned poll before properties/program teardown and ignores already queued callbacks',async t=>{
 const h=preparationHarness(t),abort=new AbortController();assert.equal(typeof chest.prepareChestRenderer,'function');
 const pending=chest.prepareChestRenderer(h.renderer,{},{},{signal:abort.signal});abort.abort();assert.equal(h.timers.size,0);
 h.destroy();h.fireLate();assert.equal(await pending,'cancelled');assert.deepEqual(h.trace,['compile','ready']);
});

test('already aborted and unsupported preparation do not compile, poll or touch released properties',async t=>{
 const h=preparationHarness(t,{supported:false}),abort=new AbortController();assert.equal(typeof chest.prepareChestRenderer,'function');
 assert.equal(await chest.prepareChestRenderer(h.renderer,{},{}),'unsupported');assert.deepEqual(h.trace,[]);
 abort.abort();h.destroy();assert.equal(await chest.prepareChestRenderer(h.renderer,{},{},{signal:abort.signal}),'cancelled');assert.equal(h.timers.size,0);
});

test('native fallback stays visible while one preparation gates ready and first product render',async t=>{
 const h=preparationHarness(t),f=fixture(t,{preparation:h});f.tick(1);await f.settled();
 assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().loading,true);assert.equal(f.api.snapshot().preparation.status,'preparing');assert.equal(f.api.active,false);assert.equal(f.api.isShowing(f.world.items[0]),false);assert.equal(f.canvas.style.display,'none');
 for(let i=0;i<5;i++)f.tick(17+i*16);assert.equal(f.counts.loads,1);assert.equal(h.trace.filter(x=>x==='compile').length,1);assert.equal(f.counts.render,0);
 h.flags.ready=true;h.advance(10);await f.settled();assert.equal(f.api.snapshot().ready,true);assert.equal(f.api.snapshot().preparation.status,'ready');assert.equal(f.counts.render,0);
 f.tick(120);assert.equal(f.counts.render,1);f.api.dispose();assert.equal(h.timers.size,0);assert.equal(f.jobs.size,0);
});

for(const outcome of ['pending','resolved','rejected'])test('dispose wins '+outcome+' preparation continuation without late access or rejection',async t=>{
 const h=preparationHarness(t),f=fixture(t,{preparation:h}),unhandled=[];const listener=e=>unhandled.push(e);process.on('unhandledRejection',listener);t.after(()=>process.off('unhandledRejection',listener));
 f.tick(1);await f.settled();assert.equal(f.api.snapshot().ready,false);
 if(outcome!=='pending'){h.flags.ready=true;h.flags.uniformError=outcome==='rejected';h.advance(10);}
 f.api.dispose();f.api.dispose();assert.equal(h.timers.size,0);assert.equal(f.jobs.size,0);h.fireLate();await f.settled();await flush();
 assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().failed,false);assert.equal(f.api.snapshot().loading,false);assert.equal(f.api.snapshot().preparation.status,'cancelled');assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.model.parent,null);assert.deepEqual(unhandled,[]);
});

for(const failure of ['compile','poll','uniform','lost','timeout','deleted-program'])test('preparation '+failure+' failure releases once and retains fallback',async t=>{
 const h=preparationHarness(t);if(failure==='compile')h.flags.compileError=true;const f=fixture(t,{preparation:h});f.tick(1);await f.settled();
 if(failure!=='compile'){
  if(failure==='poll')h.flags.pollError=true;if(failure==='uniform'){h.flags.ready=true;h.flags.uniformError=true;}if(failure==='lost')h.flags.lost=true;if(failure==='deleted-program')h.program.program=undefined;
  h.advance(failure==='timeout'?5000:10);await f.settled();
 }
 assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.snapshot().preparation.status,'failed');assert.equal(f.canvas.style.display,'none');assert.equal(f.counts.loads,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(h.timers.size,0);assert.equal(f.jobs.size,0,'failed overlay stops its owned RAF');h.fireLate();f.tick(100);assert.equal(f.counts.loads,1);f.api.dispose();assert.equal(f.jobs.size,0);
});

test('contextlost during preparation cancels poll before releasing resources',async t=>{
 const h=preparationHarness(t),f=fixture(t,{preparation:h});f.tick(1);await f.settled();f.canvas.dispatchEvent(new Event('webglcontextlost'));
 assert.equal(h.timers.size,0);h.fireLate();await f.settled();assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.snapshot().ready,false);assert.equal(f.counts.rendererDispose,1);f.api.dispose();assert.equal(f.jobs.size,0);
});

test('disposed late GLB resolution or rejection cannot start preparation or fail twice',async t=>{
 const h=preparationHarness(t),f=fixture(t,{defer:true,preparation:h});f.tick(1);await flush();f.api.dispose();f.rejectModel();await f.settled();
 assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().failed,false);assert.equal(f.counts.rendererDispose,1);assert.deepEqual(h.trace,[]);assert.equal(h.timers.size,0);assert.equal(f.jobs.size,0);
});

test('prepared first product render still catches errors and unsupported path keeps existing behavior',async t=>{
 const h=preparationHarness(t);h.flags.ready=true;const f=fixture(t,{preparation:h,failRender:true});f.tick(1);await f.settled();assert.equal(f.api.snapshot().ready,true);assert.equal(h.timers.size,0);
 f.tick(17);assert.equal(f.api.snapshot().failed,true);assert.equal(f.counts.render,1);assert.equal(f.counts.rendererDispose,1);f.api.dispose();
});

test('cancellation reentered during readiness cannot schedule a new timer',async t=>{
 const h=preparationHarness(t),abort=new AbortController();assert.equal(typeof chest.prepareChestRenderer,'function');
 h.program.isReady=()=>{abort.abort();return false;};
 assert.equal(await chest.prepareChestRenderer(h.renderer,{},{},{signal:abort.signal}),'cancelled');assert.equal(h.timers.size,0);h.destroy();h.fireLate();
});

test('context loss during delayed GLB releases the late model and cannot resurrect the overlay',async t=>{
 const h=preparationHarness(t),f=fixture(t,{defer:true,preparation:h});f.tick(1);await flush();f.canvas.dispatchEvent(new Event('webglcontextlost'));
 assert.equal(f.api.snapshot().failed,true);f.resolveModel();await f.settled();assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().loading,false);assert.equal(f.model.parent,null);assert.deepEqual(h.trace,[]);assert.equal(f.jobs.size,0);assert.equal(h.timers.size,0);f.api.dispose();
});

test('a falsey preparation rejection remains a failure without an unhandled rejection',async t=>{
 const h=preparationHarness(t);h.renderer.compile=()=>{throw null;};const f=fixture(t,{preparation:h}),unhandled=[];
 const listener=e=>unhandled.push(e);process.on('unhandledRejection',listener);t.after(()=>process.off('unhandledRejection',listener));
 f.tick(1);await f.settled();await flush();assert.equal(f.api.snapshot().ready,false);assert.equal(f.api.snapshot().failed,true);assert.equal(f.counts.rendererDispose,1);assert.equal(f.jobs.size,0);assert.equal(h.timers.size,0);assert.deepEqual(unhandled,[]);f.api.dispose();
});
