// Tripo runtime derivative. Gameplay remains the authoritative worldItems interaction.
export const CHEST_MODEL='assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb?v=tripo-20261102-v2';
export const OPEN_ANGLE=-1.92;
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

export function initChest3D({canvas,getWorld}){
 if(!canvas)return null;
 let motion=createChestMotion(),current=null,ready=false,failed=false,loading=false;
 let renderer,scene,camera,root,lid,light,shadow,foot,THREE,last=0,visible=false,frames=0;
 const SIZE=160;
 const api={
  show(){}, // The existing spawn call is retained; the authoritative item supplies its position.
  open(){requestChestOpen(motion);},
  hide(){visible=false;canvas.style.display='none';},
  get active(){return ready&&visible&&!failed;},
  isShowing(item){return api.active&&item===current;},
  snapshot(){return {ready,failed,loading,visible,phase:motion.phase,lidAngle:motion.lidAngle,
   model:CHEST_MODEL,frames,world:current?{x:current.x,y:current.y,opened:current.opened}:null};}
 };
 window._chest3d=api;
 async function load(){
  if(loading||ready||failed)return;loading=true;
  try{
   THREE=await import('three');const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
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
   ready=true;failed=false;
  }catch(error){
   failed=true;ready=false;canvas.style.display='none';renderer?.dispose();
   console.warn('[CHEST3D] Model unavailable; native chest fallback retained:',error.message);
  }finally{loading=false;}
 }
 function tick(now){
  requestAnimationFrame(tick);
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
  renderer.render(scene,camera);frames++;
 }
 requestAnimationFrame(tick);return api;
}
