// Tripo runtime derivative. Gameplay remains the authoritative worldItems interaction.
export const CHEST_MODEL='assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb?v=tripo-20261102-v2';
export const OPEN_ANGLE=-1.92;
export const CHEST_RENDER_SIZE=64;
export function createChestMotion(opened=false){
 return {phase:opened?'open':'closed',elapsed:opened?1.3:0,lidAngle:opened?OPEN_ANGLE:0};
}
export function requestChestOpen(state){
 if(state.phase!=='closed')return false;
 state.phase='opening';state.elapsed=0;return true;
}
export function stepChestMotion(state,delta,paused=false){
 if(paused||state.phase!=='opening')return state;
 state.elapsed+=Math.max(0,Math.min(Number.isFinite(delta)?delta:0,.05));
 const p=Math.max(0,Math.min(1,(state.elapsed-.4)/.9));
 state.lidAngle=OPEN_ANGLE*(1-Math.pow(1-p,3));
 if(p>=1){state.phase='open';state.lidAngle=OPEN_ANGLE;}
 return state;
}

export const CHEST_MATERIAL_SEPARATION_ID='chest-local-albedo-v1';
export function createChestMaterialSeparation(THREE,model,enabled=true){
 if(THREE.REVISION!=='160')throw new Error('Unsupported chest r160 shader revision');
 const uniform={value:enabled?1:0},originals=new Map();let disposed=false;
 model.traverse(object=>{for(const material of Array.isArray(object.material)?object.material:[object.material]){
  if(!material?.isMeshStandardMaterial||originals.has(material))continue;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  originals.set(material,{compileDescriptor:Object.getOwnPropertyDescriptor(material,'onBeforeCompile'),keyDescriptor:Object.getOwnPropertyDescriptor(material,'customProgramCacheKey')});
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);
   const common='#include <common>',metal='#include <metalnessmap_fragment>';
   if(shader.fragmentShader.split(common).length!==2||shader.fragmentShader.split(metal).length!==2)throw new Error('Unsupported chest r160 shader chunks');
   shader.uniforms.chestLocalAlbedoEnabled=uniform;
   shader.fragmentShader=shader.fragmentShader.replace(common,common+`
// CHEST_LOCAL_ALBEDO_BEGIN
uniform float chestLocalAlbedoEnabled;
// CHEST_LOCAL_ALBEDO_END`).replace(metal,metal+`
// CHEST_LOCAL_ALBEDO_BEGIN
if(chestLocalAlbedoEnabled>0.5){
 float chestMetalMask=0.0;
 #ifdef USE_METALNESSMAP
  chestMetalMask=smoothstep(0.12,0.55,texelMetalness.b);
 #endif
 // Linear albedo only: existing B mask separates warm wood from cool iron.
 // Black stays black; exponential shoulder preserves bounded highlight detail.
 vec3 chestAlbedoGain=mix(vec3(2.4,1.65,1.05),vec3(5.0,5.3,5.8),chestMetalMask);
 diffuseColor.rgb=vec3(1.0)-exp(-diffuseColor.rgb*chestAlbedoGain);
}
// CHEST_LOCAL_ALBEDO_END`);
  };
  // Uniform A/B changes never create shader variants or new programs.
  material.customProgramCacheKey=()=>key+'|'+CHEST_MATERIAL_SEPARATION_ID;
  material.needsUpdate=true;
 }});
 return {
  setEnabled(value){if(disposed)return false;uniform.value=value?1:0;return !!uniform.value;},
  snapshot(){return {id:CHEST_MATERIAL_SEPARATION_ID,enabled:!disposed&&!!uniform.value,materials:originals.size,mask:[.12,.55],woodGain:[2.4,1.65,1.05],metalGain:[5,5.3,5.8]};},
  dispose(){if(disposed)return;disposed=true;uniform.value=0;
   for(const [material,saved]of originals){
    for(const [name,descriptor]of [['onBeforeCompile',saved.compileDescriptor],['customProgramCacheKey',saved.keyDescriptor]]){
     if(descriptor)Object.defineProperty(material,name,descriptor);else delete material[name];
    }
    material.needsUpdate=true;
   }
   originals.clear();
  }
 };
}
export function disposeChestResources(...roots){
 const resources=new Set();
 for(const root of roots)root?.traverse(object=>{
  if(object.geometry)resources.add(object.geometry);
  for(const material of Array.isArray(object.material)?object.material:[object.material])if(material){
   for(const value of Object.values(material))if(value?.isTexture)resources.add(value);
   resources.add(material);
  }
 });
 for(const resource of resources)resource.dispose();
}

export const CHEST_PREPARE_POLL_MS=10;
export const CHEST_PREPARE_TIMEOUT_MS=5000;
export function prepareChestRenderer(renderer,scene,camera,{signal}={}){
 // Pinned r160: compileAsync has an uncancellable timer that rereads disposed properties.
 // Capture only this scene's compiled programs before yielding; own and cancel every poll.
 return new Promise((resolve,reject)=>{
  let timer=null,settled=false,gl=null;const programs=new Set(),started=performance.now();
  function finish(error,status='failed'){
   if(settled)return;settled=true;
   if(timer!==null)clearTimeout(timer);timer=null;
   signal?.removeEventListener('abort',cancel);programs.clear();gl=null;
   renderer=scene=camera=null;
   if(status==='failed')reject(error);else resolve(status);
  }
  function cancel(){finish(null,'cancelled');}
  function check(){
   if(settled)return;timer=null;
   if(signal?.aborted){cancel();return;}
   try{
    if(gl.isContextLost())throw new Error('Chest WebGL context lost during preparation');
    if(performance.now()-started>=CHEST_PREPARE_TIMEOUT_MS)throw new Error('Chest shader preparation timed out');
    let pending=false;
    for(const program of programs){
     if(!program.program)throw new Error('Chest preparation program released');
     if(!program.isReady())pending=true;
    }
    if(settled||signal?.aborted)return;
    if(pending){timer=setTimeout(check,CHEST_PREPARE_POLL_MS);return;}
    // Preserve r160 diagnostics and initialize its cached uniforms/attributes before ready.
    for(const program of programs){if(settled||signal?.aborted)return;program.getUniforms();}
    finish(null,'ready');
   }catch(error){finish(error);}
  }
  if(signal?.aborted){cancel();return;}
  signal?.addEventListener('abort',cancel,{once:true});
  try{
   if(!renderer.extensions.has('KHR_parallel_shader_compile')){finish(null,'unsupported');return;}
   gl=renderer.getContext();
   if(gl.isContextLost())throw new Error('Chest WebGL context lost during preparation');
   const materials=renderer.compile(scene,camera);
   if(settled||signal?.aborted)return;
   for(const material of materials){
    const program=renderer.properties.get(material).currentProgram;
    if(!program?.isReady||!program.getUniforms)throw new Error('Unsupported chest r160 preparation program');
    programs.add(program);
   }
   check();
  }catch(error){finish(error);}
 });
}

export function initChest3D({canvas,getWorld,loadDependencies=()=>Promise.all([import('three'),import('three/addons/loaders/GLTFLoader.js')])}){
 if(!canvas)return null;
 let motion=createChestMotion(),current=null,ready=false,failed=false,loading=false;
 let renderer,scene,camera,root,lid,light,shadow,foot,THREE,last=0,visible=false,frames=0;
 let materialSeparation=null,materialSeparationEnabled=true,modelRoot=null,disposed=false,released=false,raf=0;
 let preparation='idle';const prepareAbort=new AbortController();
 const SIZE=CHEST_RENDER_SIZE;
 const api={
  show(){}, // The existing spawn call is retained; the authoritative item supplies its position.
  open(){requestChestOpen(motion);},
  hide(){visible=false;canvas.style.display='none';},
  setEnvironmentEnabled(){return false;}, // Retired reflection QA hook: never allocates a source or PMREM.
  setMaterialSeparationEnabled(enabled){if(disposed||failed)return false;materialSeparationEnabled=!!enabled;return materialSeparation?.setEnabled(enabled)??materialSeparationEnabled;},
  dispose(){if(disposed)return;disposed=true;ready=false;api.hide();release();},
  get active(){return ready&&visible&&!failed;},
  isShowing(item){return api.active&&item===current;},
  snapshot(){return {ready,failed,loading,visible,phase:motion.phase,lidAngle:motion.lidAngle,
   model:CHEST_MODEL,renderSize:SIZE,frames,disposed,
   preparation:{status:preparation,pollMs:CHEST_PREPARE_POLL_MS,timeoutMs:CHEST_PREPARE_TIMEOUT_MS},
   environment:{enabled:false,prepared:false,intensity:0},
   materialSeparation:materialSeparation?.snapshot()??{id:CHEST_MATERIAL_SEPARATION_ID,enabled:!disposed&&!failed&&materialSeparationEnabled,materials:0},
   resources:{textures:renderer?.info?.memory?.textures??null,geometries:renderer?.info?.memory?.geometries??null,programs:renderer?.info?.programs?.length??null},
   world:current?{x:current.x,y:current.y,opened:current.opened}:null};}
 };
 window._chest3d=api;
 function contextLost(){if(!disposed&&!failed)fail(new Error('Chest WebGL context lost'));}
 function release(){
  if(released)return;released=true;
  cancelAnimationFrame(raf);
  prepareAbort.abort();if(preparation==='preparing'||preparation==='idle')preparation='cancelled';
  canvas.removeEventListener?.('webglcontextlost',contextLost);
  if(scene)scene.environment=null;
  materialSeparation?.dispose();materialSeparation=null;
  disposeChestResources(scene,modelRoot);root?.clear();scene?.clear();
  modelRoot=root=lid=light=shadow=foot=camera=null;
  renderer?.dispose();renderer?.forceContextLoss?.();
 }
 function fail(error){
  failed=true;ready=false;preparation='failed';api.hide();release();
  console.warn('[CHEST3D] Model unavailable; native chest fallback retained:',error?.message??String(error));
 }
 async function load(){
  if(disposed||loading||ready||failed)return;loading=true;
  try{
   const dependencies=await loadDependencies();THREE=dependencies[0];const {GLTFLoader}=dependencies[1];
   if(disposed||failed)return;
   renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
   canvas.addEventListener?.('webglcontextlost',contextLost);
   renderer.debug.checkShaderErrors=true;
   renderer.debug.onShaderError=()=>{throw new Error('Chest shader compilation failed');};
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(SIZE,SIZE);
   renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
   canvas.style.width=canvas.style.height=SIZE+'px';
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(40,1,.01,30);
   camera.position.set(.7,1.75,3.5);camera.lookAt(0,.62,0);camera.updateMatrixWorld();
   foot=new THREE.Vector3(0,0,0).project(camera);
   scene.add(new THREE.HemisphereLight(0xabb9c6,0x181219,2.5));
   const key=new THREE.DirectionalLight(0xe1e7df,3.2);key.position.set(-3,5,4);scene.add(key);
   const fill=new THREE.DirectionalLight(0x73859f,.8);fill.position.set(3,2,-3);scene.add(fill);
   light=new THREE.PointLight(0xe8ad54,0,3);light.position.set(0,.75,.1);scene.add(light);
   root=new THREE.Group();scene.add(root);
   const model=await new GLTFLoader().loadAsync(CHEST_MODEL);
   if(disposed||failed){disposeChestResources(model.scene);return;}
   modelRoot=model.scene;
   lid=model.scene.getObjectByName('ChestLidPivot');
   if(!lid||!model.scene.getObjectByName('ChestBody'))throw new Error('Missing hinged chest geometry');
   const box=new THREE.Box3().setFromObject(model.scene),size=box.getSize(new THREE.Vector3());
   const scale=1.8/size.x;model.scene.scale.setScalar(scale);
   model.scene.position.y=-box.min.y*scale;
   root.add(model.scene);root.rotation.y=-.10;
   // Soft contact footprint; the model base remains fixed to the exact world item anchor.
   const image=document.createElement('canvas');image.width=image.height=64;
   const c=image.getContext('2d'),g=c.createRadialGradient(32,32,4,32,32,31);
   g.addColorStop(0,'rgba(0,0,0,.62)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,64,64);
   const material=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(image),transparent:true,depthWrite:false});
   shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.35),material);
   shadow.rotation.x=-Math.PI/2;shadow.position.y=-.004;scene.add(shadow);
   materialSeparation=createChestMaterialSeparation(THREE,modelRoot,materialSeparationEnabled);
   preparation='preparing';
   const prepared=await prepareChestRenderer(renderer,scene,camera,{signal:prepareAbort.signal});
   if(disposed||failed)return;
   preparation=prepared;ready=true;failed=false;
  }catch(error){
   if(!disposed&&!failed)fail(error);
  }finally{loading=false;}
 }
 function tick(now){
  if(disposed||failed)return;raf=requestAnimationFrame(tick);
  const delta=last?Math.min((now-last)/1000,.05):0;last=now;
  const world=getWorld();
  const next=world?.on?world.items.find(item=>item.type==='chest'&&!item.picked):null;
  if(next!==current){current=next;motion=createChestMotion(!!next?.opened);}
  if(!current||document.hidden){api.hide();return;}
  if(!ready){api.hide();load();return;}
  if(current.opened&&motion.phase==='closed')requestChestOpen(motion);
  stepChestMotion(motion,delta,world.paused);
  lid.rotation.x=motion.lidAngle;
  const rattle=motion.phase==='opening'&&motion.elapsed<.4;
  root.position.x=rattle?Math.sin(motion.elapsed*65)*.012:0;
  root.rotation.z=rattle?Math.sin(motion.elapsed*55)*.009:0;
  light.intensity=motion.phase==='opening'?Math.sin(Math.min(1,motion.elapsed/1.3)*Math.PI)*1.4:0;
  const rect=world.canvas.getBoundingClientRect(),scale=world.canvas.width/rect.width;
  const x=rect.left+(world.canvas.width/2+current.x-world.cam.x)/scale;
  const y=rect.top+(world.canvas.height/2+current.y-world.cam.y)/scale;
  visible=x>-SIZE&&x<innerWidth+SIZE&&y>-SIZE&&y<innerHeight+SIZE;
  canvas.style.display=visible?'block':'none';
  if(!visible)return;
  canvas.style.left=(x-SIZE*(foot.x+1)/2)+'px';
  canvas.style.top=(y-SIZE*(1-foot.y)/2)+'px';
  try{renderer.render(scene,camera);frames++;}catch(error){fail(error);}
 }
 raf=requestAnimationFrame(tick);return api;
}
