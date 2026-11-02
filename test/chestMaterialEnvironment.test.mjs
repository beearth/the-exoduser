import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import * as chest from '../chest3d.mjs';

function requireCandidate(){assert.equal(typeof chest.createChestMaterialSeparation,'function','candidate needs local material separation');assert.equal(typeof chest.disposeChestResources,'function','owned resources need an explicit teardown');}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(t,{failLoad=false,failRender=false,failShader=false,defer=false}={}){
 requireCandidate();t.mock.method(console,'warn',()=>{});
 const saved=new Map(['window','document','requestAnimationFrame','cancelAnimationFrame','devicePixelRatio','innerWidth','innerHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 t.after(()=>{for(const [k,value]of saved)value?Object.defineProperty(globalThis,k,value):delete globalThis[k];});
 const jobs=new Map();let next=0,resolveModel;
 const counts={render:0,rendererDispose:0,contextLoss:0,loads:0,geometryDispose:0,materialDispose:0};
 const tex=new THREE.DataTexture(new Uint8Array([24,16,12,255]),1,1,THREE.RGBAFormat);tex.colorSpace=THREE.SRGBColorSpace;
 const rm=new THREE.Texture(),normal=new THREE.Texture();const material=new THREE.MeshStandardMaterial({map:tex,normalMap:normal,metalnessMap:rm,roughnessMap:rm,metalness:.25,roughness:.7});
 const geometry=new THREE.BoxGeometry(1,.5,.6);geometry.addEventListener('dispose',()=>counts.geometryDispose++);material.addEventListener('dispose',()=>counts.materialDispose++);
 const model=new THREE.Group(),body=new THREE.Mesh(geometry,material),pivot=new THREE.Group();body.name='ChestBody';pivot.name='ChestLidPivot';model.add(body,pivot);
 let renderer,lastScene;
 class Renderer{
  constructor(){renderer=this;this.debug={checkShaderErrors:true,onShaderError:null};}
  setPixelRatio(){}setSize(){}setClearColor(){}
  render(scene){counts.render++;lastScene=scene;if(failShader)this.debug.onShaderError();if(failRender)throw Error('injected render failure');}
  dispose(){counts.rendererDispose++;}forceContextLoss(){counts.contextLoss++;}
 }
 const module={GLTFLoader:class{async loadAsync(){counts.loads++;if(failLoad)throw Error('injected model failure');if(defer)return await new Promise(resolve=>{resolveModel=()=>resolve({scene:model});});return {scene:model};}}};
 const canvas={style:{}},world={on:true,paused:false,items:[{type:'chest',x:0,y:0}],cam:{x:0,y:0},canvas:{width:1920,height:1080,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080})}};
 Object.assign(globalThis,{window:{},document:{hidden:false,createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})},devicePixelRatio:1,innerWidth:1920,innerHeight:1080,requestAnimationFrame:fn=>{jobs.set(++next,fn);return next;},cancelAnimationFrame:id=>jobs.delete(id)});
 const api=chest.initChest3D({canvas,getWorld:()=>world,loadDependencies:async()=>[{...THREE,WebGLRenderer:Renderer,DataTexture:class{constructor(){throw Error('environment allocation forbidden');}},PMREMGenerator:class{constructor(){throw Error('PMREM allocation forbidden');}}},module]});
 const tick=now=>{const [id,fn]=jobs.entries().next().value;jobs.delete(id);fn(now);};
 const settled=async()=>{for(let n=0;n<12&&api.snapshot().loading;n++)await flush();};
 return {api,counts,material,geometry,tex,model,world,jobs,canvas,tick,settled,resolveModel:()=>resolveModel(),get renderer(){return renderer;},get scene(){return lastScene;}};
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
