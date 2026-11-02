import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import * as chest from '../chest3d.mjs';

function requireCandidate(){assert.equal(typeof chest.createChestEnvironmentTexture,'function','candidate needs a scoped reflection environment');assert.equal(typeof chest.disposeChestResources,'function','owned resources need an explicit teardown');}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function fixture(t,{failLoad=false,failRender=false,defer=false}={}){
 requireCandidate();t.mock.method(console,'warn',()=>{});
 const saved=new Map(['window','document','requestAnimationFrame','cancelAnimationFrame','devicePixelRatio','innerWidth','innerHeight'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 t.after(()=>{for(const [k,value]of saved)value?Object.defineProperty(globalThis,k,value):delete globalThis[k];});
 const jobs=new Map();let next=0,resolveModel;
 const counts={render:0,rendererDispose:0,contextLoss:0,loads:0,geometryDispose:0,materialDispose:0};
 const tex=new THREE.DataTexture(new Uint8Array([24,16,12,255]),1,1,THREE.RGBAFormat);tex.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map:tex,metalness:.25,roughness:.7});
 const geometry=new THREE.BoxGeometry(1,.5,.6);geometry.addEventListener('dispose',()=>counts.geometryDispose++);material.addEventListener('dispose',()=>counts.materialDispose++);
 const model=new THREE.Group(),body=new THREE.Mesh(geometry,material),pivot=new THREE.Group();body.name='ChestBody';pivot.name='ChestLidPivot';model.add(body,pivot);
 let renderer,lastScene;
 class Renderer{
  constructor(){renderer=this;}
  setPixelRatio(){}setSize(){}setClearColor(){}
  render(scene){counts.render++;lastScene=scene;if(failRender)throw Error('injected render failure');}
  dispose(){counts.rendererDispose++;}forceContextLoss(){counts.contextLoss++;}
 }
 const module={GLTFLoader:class{async loadAsync(){counts.loads++;if(failLoad)throw Error('injected model failure');if(defer)return await new Promise(resolve=>{resolveModel=()=>resolve({scene:model});});return {scene:model};}}};
 const canvas={style:{}},world={on:true,paused:false,items:[{type:'chest',x:0,y:0}],cam:{x:0,y:0},canvas:{width:1920,height:1080,getBoundingClientRect:()=>({left:0,top:0,width:1920,height:1080})}};
 Object.assign(globalThis,{window:{},document:{hidden:false,createElement:()=>({getContext:()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}})})},devicePixelRatio:1,innerWidth:1920,innerHeight:1080,requestAnimationFrame:fn=>{jobs.set(++next,fn);return next;},cancelAnimationFrame:id=>jobs.delete(id)});
 const api=chest.initChest3D({canvas,getWorld:()=>world,loadDependencies:async()=>[{...THREE,WebGLRenderer:Renderer},module]});
 const tick=now=>{const [id,fn]=jobs.entries().next().value;jobs.delete(id);fn(now);};
 const settled=async()=>{for(let n=0;n<12&&api.snapshot().loading;n++)await flush();};
 return {api,counts,material,geometry,tex,world,jobs,canvas,tick,settled,resolveModel:()=>resolveModel(),get renderer(){return renderer;},get scene(){return lastScene;}};
}

test('scoped reflection data is small, opaque, linear and has colored soft contrast',()=>{
 requireCandidate();const texture=chest.createChestEnvironmentTexture(THREE);
 assert.equal(texture.colorSpace,THREE.LinearSRGBColorSpace);assert.equal(texture.mapping,THREE.EquirectangularReflectionMapping);
 assert.equal(texture.image.width,128);assert.equal(texture.image.height,64);assert.equal(texture.image.data.byteLength,32768);
 let low=255,high=0;for(let i=0;i<texture.image.data.length;i+=4){assert.equal(texture.image.data[i+3],255);for(let c=0;c<3;c++){low=Math.min(low,texture.image.data[i+c]);high=Math.max(high,texture.image.data[i+c]);}}
 assert.ok(high-low>32);assert.ok(high<224,'reflection source must not be a white exposure wash');texture.dispose();
});

test('shared real Three geometries, textures and materials are disposed once per teardown',()=>{
 requireCandidate();const geometry=new THREE.BoxGeometry(),texture=new THREE.Texture(),material=new THREE.MeshStandardMaterial({map:texture,normalMap:texture}),scene=new THREE.Scene();
 const calls={geometry:0,texture:0,material:0};for(const [key,value]of Object.entries({geometry,texture,material}))value.addEventListener('dispose',()=>calls[key]++);
 scene.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));chest.disposeChestResources(scene,scene);
 assert.deepEqual(calls,{geometry:1,texture:1,material:1});
});

test('same loaded model can switch baseline and candidate without altering original PBR inputs',async t=>{
 const f=fixture(t);f.tick(1);await f.settled();assert.equal(f.api.snapshot().ready,true);f.tick(17);
 const probe=f.scene.environment;assert.ok(probe?.isTexture);let probeDisposed=0;probe.addEventListener('dispose',()=>probeDisposed++);
 assert.equal(f.material.envMapIntensity,.65);assert.equal(f.material.map,f.tex);assert.equal(f.material.map.colorSpace,THREE.SRGBColorSpace);assert.equal(f.material.metalness,.25);assert.equal(f.material.roughness,.7);assert.equal(f.material.emissive.getHex(),0);assert.equal(f.material.opacity,1);
 assert.equal(f.renderer.toneMapping,THREE.ACESFilmicToneMapping);assert.equal(f.renderer.toneMappingExposure,1.25);assert.equal(f.api.snapshot().renderSize,64);
 f.api.setEnvironmentEnabled(false);assert.equal(f.scene.environment,null);assert.equal(f.material.envMapIntensity,1);
 f.api.setEnvironmentEnabled(true);assert.equal(f.scene.environment,probe);assert.equal(f.material.envMapIntensity,.65);
 f.api.dispose();f.api.dispose();assert.equal(probeDisposed,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.contextLoss,1);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.jobs.size,0);assert.equal(f.api.active,false);assert.equal(f.api.snapshot().ready,false);
});

test('asset failure releases renderer and retains the native fallback without retries',async t=>{
 const f=fixture(t,{failLoad:true});f.tick(1);await f.settled();assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.active,false);assert.equal(f.canvas.style.display,'none');assert.equal(f.counts.rendererDispose,1);f.tick(17);await flush();assert.equal(f.counts.loads,1);f.api.dispose();
});

test('first render failure releases the new environment and falls back once',async t=>{
 const f=fixture(t,{failRender:true});f.tick(1);await f.settled();f.tick(17);assert.equal(f.api.snapshot().failed,true);assert.equal(f.api.active,false);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.counts.contextLoss,1);f.tick(33);assert.equal(f.counts.render,1);f.api.dispose();
});

test('dispose while the GLB is pending also releases the late model',async t=>{
 const f=fixture(t,{defer:true});f.tick(1);await flush();assert.equal(f.api.snapshot().loading,true);f.api.dispose();f.resolveModel();await f.settled();assert.equal(f.api.snapshot().ready,false);assert.equal(f.counts.geometryDispose,1);assert.equal(f.counts.materialDispose,1);assert.equal(f.counts.rendererDispose,1);assert.equal(f.jobs.size,0);
});
