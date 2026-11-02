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

export const CHEST_ENV_INTENSITY=.65;
export function createChestEnvironmentTexture(THREE){
 // Small linear reflection field; source base color, RM, normals and lights stay untouched.
 const width=128,height=64,data=new Uint8Array(width*height*4);
 const ground=[.018,.012,.009],sky=[.16,.20,.24],warm=[.46,.42,.34],cool=[.10,.14,.18];
 for(let y=0;y<height;y++){
  const up=Math.sin(((y+.5)/height-.5)*Math.PI),ring=Math.sqrt(1-up*up),blend=(up+1)/2;
  for(let x=0;x<width;x++){
   const angle=((x+.5)/width-.5)*Math.PI*2,nx=Math.cos(angle)*ring,nz=Math.sin(angle)*ring;
   const key=Math.pow(Math.max(0,-.6*nx+.55*up+.58*nz),8),fill=Math.pow(Math.max(0,.8*nx+.2*up-.56*nz),12),i=(y*width+x)*4;
   for(let c=0;c<3;c++)data[i+c]=Math.round(255*(ground[c]+(sky[c]-ground[c])*blend+warm[c]*key+cool[c]*fill));
   data[i+3]=255;
  }
 }
 const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.UnsignedByteType);
 texture.name='EXODUSER chest reflection candidate';texture.colorSpace=THREE.LinearSRGBColorSpace;
 texture.mapping=THREE.EquirectangularReflectionMapping;texture.wrapS=THREE.RepeatWrapping;
 texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;return texture;
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

export function initChest3D({canvas,getWorld,loadDependencies=()=>Promise.all([import('three'),import('three/addons/loaders/GLTFLoader.js')])}){
 if(!canvas)return null;
 let motion=createChestMotion(),current=null,ready=false,failed=false,loading=false;
 let renderer,scene,camera,root,lid,light,shadow,foot,THREE,last=0,visible=false,frames=0;
 let environmentTexture=null,environmentEnabled=true,modelRoot=null,disposed=false,released=false,raf=0;
 const originalEnvIntensity=new Map();
 const SIZE=CHEST_RENDER_SIZE;
 const api={
  show(){}, // The existing spawn call is retained; the authoritative item supplies its position.
  open(){requestChestOpen(motion);},
  hide(){visible=false;canvas.style.display='none';},
  setEnvironmentEnabled(enabled){if(disposed)return false;environmentEnabled=!!enabled;applyEnvironment();return environmentEnabled;},
  dispose(){if(disposed)return;disposed=true;ready=false;cancelAnimationFrame(raf);api.hide();release();},
  get active(){return ready&&visible&&!failed;},
  isShowing(item){return api.active&&item===current;},
  snapshot(){return {ready,failed,loading,visible,phase:motion.phase,lidAngle:motion.lidAngle,
   model:CHEST_MODEL,renderSize:SIZE,frames,disposed,
   environment:{enabled:environmentEnabled,prepared:!!environmentTexture,intensity:environmentEnabled?CHEST_ENV_INTENSITY:0},
   resources:{textures:renderer?.info?.memory?.textures??null,geometries:renderer?.info?.memory?.geometries??null,programs:renderer?.info?.programs?.length??null},
   world:current?{x:current.x,y:current.y,opened:current.opened}:null};}
 };
 window._chest3d=api;
 function applyEnvironment(){
  if(scene)scene.environment=environmentEnabled?environmentTexture:null;
  for(const [material,intensity]of originalEnvIntensity)material.envMapIntensity=environmentEnabled?CHEST_ENV_INTENSITY:intensity;
 }
 function release(){
  if(released)return;released=true;
  if(scene)scene.environment=null;
  // r160 releases its cached PMREM target on the source texture's dispose event.
  environmentTexture?.dispose();environmentTexture=null;originalEnvIntensity.clear();
  disposeChestResources(scene,modelRoot);scene?.clear();modelRoot=null;
  renderer?.dispose();renderer?.forceContextLoss?.();
 }
 function fail(error){
  failed=true;ready=false;api.hide();release();
  console.warn('[CHEST3D] Model unavailable; native chest fallback retained:',error.message);
 }
 async function load(){
  if(disposed||loading||ready||failed)return;loading=true;
  try{
   const dependencies=await loadDependencies();THREE=dependencies[0];const {GLTFLoader}=dependencies[1];
   if(disposed)return;
   renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
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
   if(disposed){disposeChestResources(model.scene);return;}
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
   environmentTexture=createChestEnvironmentTexture(THREE);
   modelRoot.traverse(object=>{for(const material of Array.isArray(object.material)?object.material:[object.material])if(material?.isMeshStandardMaterial&&!originalEnvIntensity.has(material))originalEnvIntensity.set(material,material.envMapIntensity);});
   applyEnvironment();ready=true;failed=false;
  }catch(error){
   fail(error);
  }finally{loading=false;}
 }
 function tick(now){
  if(disposed)return;raf=requestAnimationFrame(tick);
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
