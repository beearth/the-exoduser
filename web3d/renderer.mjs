import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import { GLTFLoader } from '../assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from '../assets/vendor/three-r160/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../assets/vendor/three-r160/examples/jsm/postprocessing/RenderPass.js';
import { SSAOPass } from '../assets/vendor/three-r160/examples/jsm/postprocessing/SSAOPass.js';
import { ShaderPass } from '../assets/vendor/three-r160/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from '../assets/vendor/three-r160/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../assets/vendor/three-r160/examples/jsm/postprocessing/OutputPass.js';
import { trialEnabled } from './core.mjs';
import { riverMaterial,addForestDepth } from './river.mjs';
import { drawEffects,createParticles } from './effects.mjs';
import { presentationActors } from './presentation.mjs';
import { loadRemasters,remasterFrame,normalTextureSize } from './remaster.mjs';
import { textureView } from './texture-views.mjs';
import { bankGeometry,shoreline } from './banks.mjs';

const q=new URLSearchParams(location.search);
const bridgeScene=q.get('r3dScene')==='bridge';
const U=100,angle=52*Math.PI/180,yaw=.49;
const FocusGrade={
  uniforms:{tDiffuse:{value:null},tDepth:{value:null},resolution:{value:new THREE.Vector2()},focusDepth:{value:.5}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform sampler2D tDiffuse,tDepth;uniform vec2 resolution;uniform float focusDepth;uniform vec2 actors[4];varying vec2 vUv;
  void main(){float d=texture2D(tDepth,vUv).r;
    float coc=smoothstep(.035,.15,abs(d-focusDepth));
    float tilt=smoothstep(.24,.49,abs(vUv.y-.48));
    vec2 r=(.15+max(coc*.7,tilt)*2.8)/resolution;
    vec3 c=texture2D(tDiffuse,vUv).rgb*.28;
    c+=(texture2D(tDiffuse,vUv+vec2(r.x,0.)).rgb+texture2D(tDiffuse,vUv-vec2(r.x,0.)).rgb)*.12;
    c+=(texture2D(tDiffuse,vUv+vec2(0.,r.y)).rgb+texture2D(tDiffuse,vUv-vec2(0.,r.y)).rgb)*.12;
    c+=(texture2D(tDiffuse,vUv+r).rgb+texture2D(tDiffuse,vUv-r).rgb)*.12;
    float actorMask=0.;for(int i=0;i<4;i++){vec2 a=actors[i]*.5+.5;actorMask=max(actorMask,1.-smoothstep(.5,1.,length((vUv-a)/vec2(.04,.09))));}
    c=mix(c,texture2D(tDiffuse,vUv).rgb,actorMask);
    float lum=dot(c,vec3(.2126,.7152,.0722));
    c=mix(vec3(lum),c,.88);c*=vec3(.98,1.01,1.035);
    vec2 p=vUv*2.-1.;c*=1.-.21*pow(dot(p,p)*.5,1.5);
    gl_FragColor=vec4(c,1.);
  }`
};

export async function install(read){
  if(!trialEnabled(location.search))return null;
  const native=document.getElementById('c');
  const canvas=document.createElement('canvas');canvas.id='web3dWorld';
  canvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;display:none';
  document.body.append(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.info.autoReset=false;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#182029');
  // The orthographic camera is 55m away. Exponential fog would wash out even the hero.
  scene.fog=new THREE.Fog('#29343b',48,105);
  const camera=new THREE.OrthographicCamera(-15,15,8.4375,-8.4375,.1,150);
  const moon=new THREE.DirectionalLight('#9ebbd1',2.7);
  moon.position.set(-10,22,-12);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);
  Object.assign(moon.shadow.camera,{left:-28,right:28,top:28,bottom:-28,near:.5,far:85});
  moon.shadow.bias=-.0003;moon.shadow.normalBias=.045;scene.add(moon);scene.add(moon.target);
  moon.shadow.radius=3;
  scene.add(new THREE.HemisphereLight('#b2bcc4','#322818',1.25));
  const rim=new THREE.DirectionalLight('#8298b3',.65);rim.position.set(15,8,-22);scene.add(rim);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const ssao=new SSAOPass(scene,camera,innerWidth,innerHeight,16);
  ssao.ssaoMaterial.defines.PERSPECTIVE_CAMERA=0;
  const normalRender=ssao.renderOverride.bind(ssao);
  ssao.renderOverride=(r,material,...args)=>{
    const hidden=[];
    if(material===ssao.normalMaterial)scene.traverse(o=>{
      if(o.isMesh&&o.visible&&(o.material.transparent||o.material.alphaTest>0)){hidden.push(o);o.visible=false;}
    });
    try{return normalRender(r,material,...args);}finally{for(const o of hidden)o.visible=true;}
  };
  ssao.kernelRadius=.9;ssao.minDistance=.0003;ssao.maxDistance=.012;composer.addPass(ssao);
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.24,.5,1.05);composer.addPass(bloom);
  const grade=new ShaderPass(FocusGrade);grade.uniforms.tDepth.value=ssao.normalRenderTarget.depthTexture;
  grade.uniforms.resolution.value.set(innerWidth,innerHeight);composer.addPass(grade);composer.addPass(new OutputPass());
  const loader=new THREE.TextureLoader(),textureCache=new Map();
  const loadTexture=(url,color=false)=>{
    if(textureCache.has(url))return textureCache.get(url);
    const p=loader.loadAsync(url).then(t=>{t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;});
    textureCache.set(url,p);return p;
  };
  const [gltf,meta,map]=await Promise.all([
    new GLTFLoader().loadAsync('./assets/web3d/forest-assembly.glb?v=20261031-r3'),
    fetch('./assets/web3d/scene.json').then(r=>r.json()),
    fetch('./assets/web3d/bridge-map.json?v=20261031-r3').then(r=>r.json())
  ]);
  const remasters=await loadRemasters().catch(error=>{console.warn('[WEB3D] 2x art unavailable, native sprite fallback',error.message);return new Map();});
  const actorScreens=Array.from({length:4},()=>new THREE.Vector2(10,10));
  grade.uniforms.actors={value:actorScreens};
  const occlusionUniforms={uActors:{value:actorScreens},uOcclusionEnabled:{value:1}};
  const isOccluder=id=>/Ancient_Tree|Foreground_Branch|Fallen_Log|Hanging_Moss|Withered_Shrub/.test(id);
  const materials=new Map();
  await Promise.all(meta.modules.map(async id=>{
    const [base,normal,orm]=await Promise.all([
      loadTexture('./assets/web3d/textures/'+id+'_BaseColor.webp',true),
      loadTexture('./assets/web3d/textures/'+id+'_Normal.webp'),
      loadTexture('./assets/web3d/textures/'+id+'_ORM.webp')]);
    base.flipY=normal.flipY=orm.flipY=false;
    const alpha=/Moss|Shrub|Leaf|Vista/.test(id)&&!/Rock/.test(id);
    const m=new THREE.MeshStandardMaterial({map:base,normalMap:normal,roughnessMap:orm,metalnessMap:orm,
      aoMap:orm,aoMapIntensity:.7,roughness:1,metalness:1,normalScale:new THREE.Vector2(.55,.55),
      side:alpha?THREE.DoubleSide:THREE.FrontSide,alphaTest:alpha?.32:0});
    // Baked plant alpha, including the silhouette card, stays clipped in the depth and shadow passes.
    if(/Dead_Leaf/.test(id))m.color.set('#89837c');
    if(/Moss_(Cushion|Rock)/.test(id))m.color.set('#6d7865');
    m.name=id;materials.set(id,m);
    if(isOccluder(id)){
      m.transparent=true;m.depthWrite=false;
      m.customProgramCacheKey=()=> 'web3d-local-actor-occlusion-v1';
      m.onBeforeCompile=shader=>{
        Object.assign(shader.uniforms,occlusionUniforms);
        shader.vertexShader='attribute float instanceFade;varying float vFade;varying vec4 vActorClip;\n'+shader.vertexShader
          .replace('#include <begin_vertex>','#include <begin_vertex>\nvFade=instanceFade;')
          .replace('#include <project_vertex>','#include <project_vertex>\nvActorClip=gl_Position;');
        shader.fragmentShader='uniform vec2 uActors[4];uniform float uOcclusionEnabled;varying float vFade;varying vec4 vActorClip;\n'+shader.fragmentShader
          .replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
            float actorMask=0.;vec2 actorUv=vActorClip.xy/vActorClip.w;
            for(int k=0;k<4;k++){float d=length((actorUv-uActors[k])/vec2(.065,.18));actorMask=max(actorMask,1.-smoothstep(.6,1.,d));}
            diffuseColor.a*=mix(1.,vFade,actorMask*uOcclusionEnabled);`);
      };
    }
  }));
  const environment=new THREE.Group(),nativeWorld=new THREE.Group();scene.add(environment,nativeWorld);
  gltf.scene.position.set(40,0,60);gltf.scene.updateMatrixWorld(true);
  const treeTransforms=new Map();
  gltf.scene.traverse(o=>{if(!o.isMesh)return;const id=o.userData.web3dModule||o.parent?.userData.web3dModule;if(!/Ancient_Tree/.test(id))return;
    const old=o.matrixWorld.clone(),position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();old.decompose(position,rotation,scale);const anchor=position.clone();
    const close=position.z>53;scale.multiplyScalar(close?.60:.42);if(close){position.x+=position.x<40?-2:2;position.y-=.6;}else if(position.x>33&&position.x<47)position.x+=position.x<40?-5:5;
    const matrix=new THREE.Matrix4().compose(position,rotation,scale);treeTransforms.set(o.uuid,{anchor,matrix,delta:matrix.clone().multiply(old.clone().invert())});
  });
  const bank=materials.get('RF3_Continuous_Bank_Terrain');
  const soil=await loadTexture('./assets/map/ch1/ground_dark_soil.png',true);soil.wrapS=soil.wrapT=THREE.RepeatWrapping;
  bank.map=soil;bank.normalMap=null;bank.aoMap=null;bank.roughnessMap=null;bank.metalnessMap=null;bank.roughness=.94;bank.metalness=0;bank.color.setRGB(1.8,1.55,1.28);
  bank.bumpMap=soil.clone();bank.bumpMap.colorSpace=THREE.NoColorSpace;bank.bumpMap.needsUpdate=true;bank.bumpScale=.065;
  const groups=new Map(),pick=[];const nativePrototypes=new Map();
  gltf.scene.traverse(o=>{
    if(!o.isMesh)return;
    const id=o.userData.web3dModule||o.parent?.userData.web3dModule;
    const material=materials.get(id);if(!material)throw Error('Unknown R3 module: '+o.name);
    if(/Continuous_Bank/.test(id))return;
    if(!nativePrototypes.has(id))nativePrototypes.set(id,{geometry:o.geometry,material,matrix:o.matrixWorld.clone()});
    // Rebuild the large silhouette before adding detail: keep the bridge and banks exact.
    const position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3();o.matrixWorld.decompose(position,rotation,scale);
    if(treeTransforms.has(o.uuid))o.matrixWorld.copy(treeTransforms.get(o.uuid).matrix);
    if(/Hanging_Moss|Fungal_Colony/.test(id)){
      const nearest=[...treeTransforms.values()].sort((a,b)=>a.anchor.distanceToSquared(position)-b.anchor.distanceToSquared(position))[0];
      if(nearest&&Math.hypot(position.x-nearest.anchor.x,position.z-nearest.anchor.z)<4.5)o.matrixWorld.premultiply(nearest.delta);
    }
    if(/Continuous_Bank/.test(id)){const vertices=o.geometry.attributes.position,uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,vertices.getX(i)*.28,vertices.getZ(i)*.28);uv.needsUpdate=true;}
    if(/Foreground_Branch/.test(id)){scale.multiplyScalar(.43);position.x+=position.x<40?-3.5:3.5;position.z+=2;o.matrixWorld.compose(position,rotation,scale);}
    if(/Dead_Leaf/.test(id)&&(Math.abs(position.z-53.5)>1.3&&Math.abs(position.z-66.6)>1.3||Math.abs(Math.sin(position.x*71.1+position.z*37.7))<.88))return;
    if(/Withered_Shrub/.test(id)){if(Math.abs(Math.sin(position.x*13.7+position.z*28.1))<.94)return;scale.multiplyScalar(1.4);o.matrixWorld.compose(position,rotation,scale);}
    const key=o.geometry.uuid+id;if(!groups.has(key))groups.set(key,{geometry:o.geometry,material,id,matrices:[]});
    groups.get(key).matrices.push(o.matrixWorld.clone());
    if(/Continuous_Bank|Rotten_Wood_Bridge/.test(id)){
      const surface=new THREE.Mesh(o.geometry,material);surface.matrixAutoUpdate=false;surface.matrix.copy(o.matrixWorld);
      surface.updateMatrixWorld(true);pick.push(surface);
    }
  });
  const occluders=[];
  for(const {geometry,material,id,matrices} of groups.values()){
    const fading=isOccluder(id),drawGeometry=fading?geometry.clone():geometry;
    if(fading){drawGeometry.computeBoundingBox();drawGeometry.setAttribute('instanceFade',new THREE.InstancedBufferAttribute(new Float32Array(matrices.length).fill(1),1));}
    const mesh=new THREE.InstancedMesh(drawGeometry,material,matrices.length);
    matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=!/Leaf|Moss_Cushion|Vista/.test(id);mesh.receiveShadow=true;
    mesh.userData.module=id;mesh.computeBoundingSphere();environment.add(mesh);
    if(fading){mesh.renderOrder=3;occluders.push({mesh,matrices,box:drawGeometry.boundingBox.clone(),fade:drawGeometry.getAttribute('instanceFade')});}
  }
  for(const south of [false,true]){
    const surface=new THREE.Mesh(bankGeometry(south,height),bank);surface.receiveShadow=true;surface.userData.module='RF3_Connected_Bank_'+(south?'South':'North');environment.add(surface);surface.updateMatrixWorld();pick.push(surface);
  }
  environment.visible=bridgeScene;
  const reflectionCamera=new THREE.OrthographicCamera(),reflectionTarget=new THREE.WebGLRenderTarget(960,540,{type:THREE.HalfFloatType});
  const reflectUniforms={uReflect:{value:reflectionTarget.texture},uReflectMatrix:{value:new THREE.Matrix4()}};
  const waterMaterial=riverMaterial(map,reflectUniforms),waterUniforms=waterMaterial.uniforms;
  const forestDepth=addForestDepth(scene,nativePrototypes);forestDepth.group.visible=bridgeScene;
  const water=new THREE.Mesh(new THREE.PlaneGeometry(180,180),waterMaterial);water.rotation.x=-Math.PI/2;
  water.position.set(40,.23,60);water.receiveShadow=false;scene.add(water);
  // Two local torch pools and river bounce; no global green floodlight.
  const torches=[];
  const flameGeo=new THREE.PlaneGeometry(.3,.9);
  const flameMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{time:{value:0}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float time;void main(){float x=(vUv.x-.5)*2.+sin(vUv.y*10.-time*7.)*.09;
      float a=smoothstep(1.,.1,abs(x)/(1.-vUv.y*.85))*smoothstep(0.,.12,vUv.y)*smoothstep(1.,.55,vUv.y);
      gl_FragColor=vec4(mix(vec3(5.,.55,.04),vec3(6.,3.,.7),smoothstep(.4,0.,abs(x))),a);}`});
  if(bridgeScene)for(const p of meta.torches.slice(0,2)){
    const light=new THREE.PointLight('#ff9b40',60,10,2);light.position.set(p[0]+40,p[2],60-p[1]);scene.add(light);
    const flame=new THREE.Mesh(flameGeo,flameMaterial);flame.position.copy(light.position);scene.add(flame);torches.push({light,flame});
  }
  const poison=new THREE.PointLight('#637b62',4,9,2);poison.position.set(45,1,60);scene.add(poison);
  // Height fog ribbons use world coordinates; distant layers lose contrast before the foreground.
  const fogMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{time:{value:0},tint:{value:new THREE.Color('#7b8b87')}},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec2 vUv;uniform float time;uniform vec3 tint;void main(){float edge=sin(vUv.x*3.14159)*sin(vUv.y*3.14159);
      float f=.55+.25*sin(vUv.x*10.+sin(vUv.y*8.)+time*.09);gl_FragColor=vec4(tint,pow(edge,1.4)*f*.12);}`});
  const fogs=[];for(let i=0;i<8;i++){
    const f=new THREE.Mesh(new THREE.PlaneGeometry(45,9),fogMaterial);f.rotation.x=-Math.PI/2;
    f.position.set(40+(i%2)*5,.35+i*.13,39+i*4.4);scene.add(f);fogs.push(f);
  }
  const dustGeo=new THREE.BufferGeometry(),dust=new Float32Array(140*3);
  for(let i=0;i<140;i++){dust[i*3]=28+(i*7.731%28);dust[i*3+1]=.7+(i*.173%5);dust[i*3+2]=38+(i*3.347%34);}
  dustGeo.setAttribute('position',new THREE.BufferAttribute(dust,3));
  const motes=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:'#c7bf7e',size:.028,transparent:true,opacity:.5,depthWrite:false}));scene.add(motes);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),target=new THREE.Vector3(),up=new THREE.Vector3();
  const scratch=document.createElement('canvas');const sx=scratch.getContext('2d',{willReadFrequently:true});
  const overlay=document.createElement('canvas');overlay.id='web3dLabels';
  overlay.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:2;display:none';document.body.append(overlay);
  const labels=overlay.getContext('2d');
  const frameBounds=new WeakMap(),imageTextures=new WeakMap(),sprites=new Map(),shadows=new Map();
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;
  const sh=shadowCanvas.getContext('2d'),gradient=sh.createRadialGradient(32,32,3,32,32,32);
  gradient.addColorStop(0,'rgba(0,0,0,.58)');gradient.addColorStop(1,'rgba(0,0,0,0)');sh.fillStyle=gradient;sh.fillRect(0,0,64,64);
  const shadowMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const unitPlane=new THREE.PlaneGeometry(1,1);
  const groundSize=1024;
  const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=groundSize;
  const groundContext=groundCanvas.getContext('2d',{willReadFrequently:true});
  let groundDraws=0;
  const groundMethods=new Map(),pixelMethods=new Set(['fill','stroke','fillRect','strokeRect','drawImage','fillText','strokeText','putImageData']);
  const groundProxy=new Proxy(groundContext,{get(target,key){const value=Reflect.get(target,key,target);if(typeof value!=='function')return value;
    if(!groundMethods.has(key))groundMethods.set(key,(...args)=>{if(pixelMethods.has(key))groundDraws++;return value.apply(target,args);});return groundMethods.get(key);},set(target,key,value){Reflect.set(target,key,value,target);return true;}});
  const groundTexture=new THREE.CanvasTexture(groundCanvas);groundTexture.colorSpace=THREE.SRGBColorSpace;groundTexture.generateMipmaps=false;
  const groundGeometry=new THREE.PlaneGeometry(48,48,64,64);groundGeometry.rotateX(-Math.PI/2);
  const nativeEffects=new THREE.Mesh(groundGeometry,new THREE.MeshBasicMaterial({map:groundTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,side:THREE.DoubleSide}));
  nativeEffects.frustumCulled=false;nativeEffects.name='native-ground-effects';scene.add(nativeEffects);
  let groundCenter='';
  const updateParticles=createParticles(THREE,scene);
  function renderGroundEffects(state){
    if(!state.drawGround)return;
    groundContext.setTransform(1,0,0,1,0,0);groundContext.clearRect(0,0,groundSize,groundSize);
    groundContext.setTransform(groundSize/4800,0,0,groundSize/4800,groundSize/2-state.G.cam.x*groundSize/4800,groundSize/2-state.G.cam.y*groundSize/4800);
    groundDraws=0;state.drawGround(groundProxy);nativeEffects.visible=groundDraws>0;
    if(!groundDraws)return;
    groundTexture.needsUpdate=true;
    const x=state.G.cam.x/U,z=state.G.cam.y/U,key=x+':'+z;
    nativeEffects.position.set(x,0,z);
    if(key!==groundCenter){const positions=groundGeometry.attributes.position;for(let i=0;i<positions.count;i++)positions.setY(i,height((positions.getX(i)+x)*U,(positions.getZ(i)+z)*U)+.025);positions.needsUpdate=true;groundCenter=key;}
  }
  function sourceTexture(image){
    if(imageTextures.has(image))return imageTextures.get(image);
    const texture=new THREE.Texture(image);texture.needsUpdate=true;texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=texture.minFilter=THREE.NearestFilter;texture.generateMipmaps=false;imageTextures.set(image,texture);return texture;
  }
  const normalTextures=new WeakMap();
  const importedNormals=new WeakMap();
  function importedNormal(image){
    if(!importedNormals.has(image)){const t=new THREE.Texture(image);t.colorSpace=THREE.NoColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;importedNormals.set(image,t);}
    return textureView(importedNormals.get(image));
  }
  function normalTexture(image){
    if(normalTextures.has(image))return textureView(normalTextures.get(image));
    const dimensions=normalTextureSize(image.naturalWidth||image.width,image.naturalHeight||image.height),c=document.createElement('canvas');c.width=dimensions.width;c.height=dimensions.height;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,c.width,c.height);const d=ctx.getImageData(0,0,c.width,c.height),src=d.data,out=new Uint8Array(src.length);
    const value=(x,y)=>{const k=(Math.max(0,Math.min(c.height-1,y))*c.width+Math.max(0,Math.min(c.width-1,x)))*4;return src[k+3]/255*(.6+(src[k]+src[k+1]+src[k+2])/1912);};
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const k=(y*c.width+x)*4,dx=(value(x-1,y)-value(x+1,y))*.85,dy=(value(x,y+1)-value(x,y-1))*.85,l=Math.hypot(dx,dy,1);out[k]=128+127*dx/l;out[k+1]=128+127*dy/l;out[k+2]=128+127/l;out[k+3]=255;}
    const tex=new THREE.DataTexture(out,c.width,c.height);tex.flipY=true;tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.needsUpdate=true;normalTextures.set(image,tex);return textureView(tex);
  }
  function bounds(image,frame){
    if(!frameBounds.has(image))frameBounds.set(image,new Map());
    const cache=frameBounds.get(image),key=[frame.x,frame.y,frame.w,frame.h].join(':');if(cache.has(key))return cache.get(key);
    scratch.width=frame.w;scratch.height=frame.h;sx.clearRect(0,0,frame.w,frame.h);
    sx.drawImage(image,frame.x,frame.y,frame.w,frame.h,0,0,frame.w,frame.h);
    const pixels=sx.getImageData(0,0,frame.w,frame.h).data;let l=frame.w,t=frame.h,r=0,b=0;
    for(let y=0;y<frame.h;y++)for(let x=0;x<frame.w;x++)if(pixels[(y*frame.w+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    const box=r>=l?{x:frame.x+l,y:frame.y+t,w:r-l+1,h:b-t+1}:frame;cache.set(key,box);return box;
  }
  function height(x,y){
    if(!bridgeScene)return 0;
    const cx=x/40-.5,cy=y/40-.5,ix=Math.floor(cx),iy=Math.floor(cy),fx=cx-ix,fy=cy-iy;
    const h=(a,b)=>map.heights[Math.max(0,Math.min(map.template.mh-1,b))*map.template.mw+Math.max(0,Math.min(map.template.mw-1,a))];
    const bankLand=y/U<shoreline(x/U,false)||y/U>shoreline(x/U,true);
    return Math.max(bankLand?.45:.29,(h(ix,iy)*(1-fx)+h(ix+1,iy)*fx)*(1-fy)+(h(ix,iy+1)*(1-fx)+h(ix+1,iy+1)*fx)*fy);
  }
  for(const art of remasters.values()){
    if(art.image)renderer.initTexture(sourceTexture(art.image));
    if(art.normal){const temporary=importedNormal(art.normal);temporary.dispose();renderer.initTexture(importedNormals.get(art.normal));}
  }
  let frameId=0,current=null,ready=true,lastNativeMap=null,lastSize='',hidden=false,lastRenderMs=0,lastDrawCalls=0,lastFadeTime=performance.now();
  const occlusionBox=new THREE.Box3(),occlusionCenter=new THREE.Vector3(),occlusionDirection=new THREE.Vector3(),occlusionCorner=new THREE.Vector3();
  function updateOcclusion(state){
    if(!bridgeScene)return;
    const now=performance.now(),lerp=1-Math.exp(-Math.min(.05,(now-lastFadeTime)/1000)*12);lastFadeTime=now;
    const actors=[state.P,...state.ens.filter(e=>e.alive&&Math.hypot(e.x-state.P.x,e.y-state.P.y)<600).sort((a,b)=>Math.hypot(a.x-state.P.x,a.y-state.P.y)-Math.hypot(b.x-state.P.x,b.y-state.P.y)).slice(0,3)];
    const bodyPoints=actors.map(a=>new THREE.Vector3(a.x/U,height(a.x,a.y)+.75,a.y/U));
    actorScreens.forEach((v,i)=>{if(bodyPoints[i]){const p=bodyPoints[i].clone().project(camera);v.set(p.x,p.y);}else v.set(10,10);});
    for(const o of occluders){let changed=false;
      for(let i=0;i<o.matrices.length;i++){
        occlusionBox.copy(o.box).applyMatrix4(o.matrices[i]);occlusionBox.getCenter(occlusionCenter);
        let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
        for(let k=0;k<8;k++){
          occlusionCorner.set(k&1?occlusionBox.max.x:occlusionBox.min.x,k&2?occlusionBox.max.y:occlusionBox.min.y,k&4?occlusionBox.max.z:occlusionBox.min.z).project(camera);
          minX=Math.min(minX,occlusionCorner.x);maxX=Math.max(maxX,occlusionCorner.x);minY=Math.min(minY,occlusionCorner.y);maxY=Math.max(maxY,occlusionCorner.y);
        }
        const blocks=bodyPoints.some((p,j)=>{
          const s=actorScreens[j];if(s.x<minX-.065||s.x>maxX+.065||s.y<minY-.18||s.y>maxY+.18)return false;
          occlusionDirection.copy(camera.position).sub(p).normalize();return occlusionCorner.copy(occlusionCenter).sub(p).dot(occlusionDirection)>0;
        });
        const target=blocks?.12:1,current=o.fade.getX(i),next=current+(target-current)*lerp;
        if(Math.abs(next-current)>.0001){o.fade.setX(i,next);changed=true;}
      }
      if(changed)o.fade.needsUpdate=true;
    }
  }
  function sprite(key,image,frame,x,y,scale,options={}){
    if(!image||!(image.width||image.naturalWidth)||!frame)return;
    const b=options.trim===false?frame:bounds(image,frame),iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height;
    const source=sourceTexture(image);let mesh=sprites.get(key);
    if(!mesh){
      const tex=textureView(source);
      const settings={map:tex,transparent:true,alphaTest:.08,depthWrite:true,side:THREE.DoubleSide};
      const material=options.unlit?new THREE.MeshBasicMaterial(settings):new THREE.MeshStandardMaterial({...settings,
        roughness:.9,metalness:0,emissive:'#8f9baf',emissiveIntensity:.13});
      if(!options.unlit){
        const uniforms={uSpriteTexel:{value:new THREE.Vector2(1/iw,1/ih)},uSpriteRim:{value:options.hero?.8:.12}};
        material.userData.rim=uniforms;material.customProgramCacheKey=()=> 'web3d-actor-rim-v1';
        material.onBeforeCompile=shader=>{
          Object.assign(shader.uniforms,uniforms);
          shader.fragmentShader='uniform vec2 uSpriteTexel;uniform float uSpriteRim;\n'+shader.fragmentShader;
          shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
            float edge=1.-min(min(texture2D(map,vMapUv+vec2(uSpriteTexel.x,0.)).a,texture2D(map,vMapUv-vec2(uSpriteTexel.x,0.)).a),min(texture2D(map,vMapUv+vec2(0.,uSpriteTexel.y)).a,texture2D(map,vMapUv-vec2(0.,uSpriteTexel.y)).a));
            totalEmissiveRadiance+=vec3(.26,.40,.50)*edge*uSpriteRim;`);
        };
      }
      mesh=new THREE.Mesh(unitPlane,material);
      scene.add(mesh);sprites.set(key,mesh);
    }
    const views=mesh.userData.views||(mesh.userData.views=new Map());
    if(mesh.userData.source!==source){
      if(mesh.userData.source)views.set(mesh.userData.source,{map:mesh.material.map,normal:mesh.material.normalMap});
      else mesh.material.map.dispose();
      const cached=views.get(source);mesh.material.map=cached?.map||textureView(source);mesh.material.normalMap=cached?.normal||null;mesh.userData.source=source;
    }
    if(!options.unlit&&!mesh.material.normalMap){mesh.material.normalMap=options.normalImage?importedNormal(options.normalImage):normalTexture(image);mesh.material.normalScale=new THREE.Vector2(.65,.65);mesh.material.needsUpdate=true;}
    if(mesh.material.emissive){mesh.material.emissiveMap=mesh.material.map;mesh.material.userData.rim?.uSpriteTexel.value.set(1/iw,1/ih);}
    if(mesh.material.normalMap){const n=mesh.material.normalMap;n.repeat.set(b.w/iw,b.h/ih);n.offset.set(b.x/iw,1-(b.y+b.h)/ih);}
    const tex=mesh.material.map;tex.repeat.set(b.w/iw,b.h/ih);tex.offset.set(b.x/iw,1-(b.y+b.h)/ih);
    if(options.dynamic)tex.needsUpdate=true;
    const w=b.w*scale/U,h=b.h*scale/U;
    mesh.material.opacity=options.alpha??1;
    mesh.renderOrder=options.order||0;
    mesh.material.depthWrite=options.depthWrite!==false;
    mesh.material.blending=options.additive?THREE.AdditiveBlending:THREE.NormalBlending;
    mesh.scale.set(w,h,1);
    if(options.ground){mesh.rotation.set(-Math.PI/2,0,0);}else mesh.quaternion.copy(camera.quaternion);
    if(options.rotation)mesh.rotateZ(options.rotation);
    mesh.position.set(x/U,height(x,y)+(options.lift||0),y/U);if(!options.center&&!options.ground)mesh.position.addScaledVector(up,h/2);
    if(mesh.material.emissive){mesh.material.emissiveIntensity=options.flash?1.1:options.hero?.34:.18;mesh.material.emissive.set(options.flash?'#ffffff':options.hero?'#b0c4d4':'#8f9baf');}
    mesh.material.color.set(options.tint||'#ffffff');
    mesh.visible=true;mesh.userData.frame=frameId;mesh.userData.core={x,y};
    if(options.shadow!==false){
      let shadow=shadows.get(key);if(!shadow){shadow=new THREE.Mesh(unitPlane,shadowMaterial);shadow.rotation.x=-Math.PI/2;scene.add(shadow);shadows.set(key,shadow);}
      shadow.position.set(x/U,height(x,y)+.015,y/U);shadow.scale.set(Math.min(w*.7,.75),Math.min(w*.42,.45),1);shadow.visible=true;shadow.userData.frame=frameId;
    }
  }
  function nativeTerrain(state){
    nativeWorld.clear();const vertices=[],uvs=[];const tile=state.tile/U;
    for(let y=0;y<state.G.mh;y++)for(let x=0;x<state.G.mw;x++)if(state.G.map[y][x]===0){
      const l=x*tile,r=l+tile,t=y*tile,b=t+tile;
      vertices.push(l,0,t,l,0,b,r,0,t,r,0,t,l,0,b,r,0,b);uvs.push(l,t,l,b,r,t,r,t,l,b,r,b);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.computeVertexNormals();
    const mat=new THREE.MeshStandardMaterial({color:'#665d51',roughness:.96});
    loadTexture('./assets/map/ch1/ground_dark_soil.png',true).then(t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.45,.45);mat.map=t;mat.needsUpdate=true;});
    const floor=new THREE.Mesh(geo,mat);floor.receiveShadow=true;nativeWorld.add(floor);pick.length=0;pick.push(floor);
    water.position.y=-.25;lastNativeMap=state.G.map;
  }
  function inversePointer(x,y){
    if(!current||!ready||hidden)return null;
    pointer.set(x/current.width*2-1,1-y/current.height*2);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(pick,false).find(h=>h.face.normal.clone().transformDirection(h.object.matrixWorld).y>.35);
    if(!hit)return null;
    let distance=hit.distance;
    for(let i=0;i<8;i++){
      const point=raycaster.ray.at(distance,target.clone()),error=point.y-height(point.x*U,point.z*U);
      if(Math.abs(error)<1e-7)break;distance-=error/raycaster.ray.direction.y;
    }
    const point=raycaster.ray.at(distance,target.clone());return {x:point.x*U,y:point.z*U};
  }
  const timeSeed=t=>t*.041;
  function render(){
    const renderStarted=performance.now();renderer.info.reset();
    const raw=read(),state={...raw,ens:presentationActors(raw.ens)};current=state;
    const active=state.G.on&&state.G.stage===0&&!state.G._bossArena;
    nativeEffects.visible=active;
    hidden=!active;canvas.style.display=active?'block':'none';native.style.opacity=active?'0':'';
    overlay.style.display=active?'block':'none';
    for(const id of ['ct','fogGL','burstCvs'])document.getElementById(id).style.opacity=active?'0':'';
    if(!active)return false;
    frameId++;
    if(!bridgeScene&&lastNativeMap!==state.G.map)nativeTerrain(state);
    const size=state.width+':'+state.height;if(size!==lastSize){
      renderer.setSize(state.width,state.height);composer.setSize(state.width,state.height);
      overlay.width=state.width;overlay.height=state.height;
      grade.uniforms.resolution.value.set(state.width,state.height);lastSize=size;
    }
    const zoom=(bridgeScene?.47:.72)*(state.G._camZoom||1),half=state.width/(2*U*zoom);
    camera.left=-half;camera.right=half;camera.top=half*state.height/state.width;camera.bottom=-camera.top;camera.updateProjectionMatrix();
    ssao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
    ssao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
    const px=state.G.cam.x/U,pz=state.G.cam.y/U;
    const ground=height(state.P.x,state.P.y);
    const shake=state.G.shake||0;
    target.set(px+Math.sin(timeSeed(state.now))*shake*.004,ground,pz-4.2+Math.cos(timeSeed(state.now)*1.3)*shake*.004);
    camera.position.copy(target).add(new THREE.Vector3(Math.sin(yaw)*Math.cos(angle)*55,Math.sin(angle)*55,Math.cos(yaw)*Math.cos(angle)*55));
    camera.lookAt(target);camera.updateMatrixWorld(true);up.set(0,1,0).applyQuaternion(camera.quaternion);
    updateOcclusion(state);
    state.syncMouse?.();
    moon.position.set(px-14,ground+25,pz-17);moon.target.position.set(px,ground,pz);moon.target.updateMatrixWorld();
    if(!bridgeScene){for(const f of fogs){f.position.x=px;f.position.z=pz-12+(fogs.indexOf(f))*4;}poison.position.set(px+7,.5,pz);}
    const time=state.now/1000;waterUniforms.uTime.value=time;forestDepth.update(time);flameMaterial.uniforms.time.value=time;fogMaterial.uniforms.time.value=time;
    renderGroundEffects(state);
    for(const {light,flame}of torches){light.intensity=60*(1+Math.sin(time*11)*.07);flame.quaternion.copy(camera.quaternion);}
    const viewFacing=f=>Math.atan2(Math.sin(f+yaw)*Math.sin(angle),Math.cos(f+yaw));
    if(state.P._sa){
      const sa=state.P._sa,dir=state.P._web3DDir||state.direction(viewFacing(state.playerFacing));
      const frames=sa.fm[sa.anim+'_'+dir]||sa.fm[sa.anim]||sa.fm['idle_'+dir]||sa.fm.idle;
      if(frames?.length){const frame=frames[Math.min(sa.f,frames.length-1)],mapped=remasterFrame(frame,state.charIndex),art=mapped&&remasters.get(mapped.id);
        sprite(state.P,art?.image||sa.img,art?mapped.frame:frame,state.P.x,state.P.y,7.5*(state.charIndex===1?.65:1)/(art?2:1),{hero:true,normalImage:art?.normal,flash:state.P.iframes>0&&state.P.iframes<30});}
    }
    for(const e of state.ens){
      if(!e.alive||e.hp<=0)continue;
      if(Math.abs(e.x-state.G.cam.x)>2200||Math.abs(e.y-state.G.cam.y)>2200)continue;
      const atlas=state.enemyAtlas,dir=state.mobDirection(viewFacing(e.facing||0));
      let entry=atlas?.dirs?.[dir]||atlas?.dirs?.south;
      if(!entry?.ready)continue;
      const cell=atlas.meta?.cell||256,col=e._mob8Col||0,row=e._mob8Row||0,sz=Math.max(e.r*7,80);
      const remaster=remasters.get('enemy-'+dir.replaceAll('-','_'));
      let image=remaster?.image||entry.img,frame={x:col*cell*(remaster?2:1),y:row*cell*(remaster?2:1),w:cell*(remaster?2:1),h:cell*(remaster?2:1)},normalImage=remaster?.normal,frameScale=remaster?2:1;
      const idx=row*state.mobCols+col,walk=atlas.walkDirs?.[dir];
      if(e._isMoving&&walk?.ready&&atlas.walkMeta?._idxSet?.has(idx)){
        const n=atlas.walkMeta.framesPerMob||4,f=Math.floor((e._walkDist||0)/128)%n;
        image=walk.img;frame={x:(col*n+f)*cell,y:row*cell,w:cell,h:cell};normalImage=remasters.get('enemy-walk-'+dir.replaceAll('-','_'))?.normal;frameScale=1;
      }
      sprite(e,image,frame,e.x,e.y,sz/cell*1.8/frameScale,{normalImage,flash:e._hitFlash>0});
    }
    for(const p of [...state.projs,...state.pProjs]){
      if(p.alive===false||p.life<=0)continue;
      const source=state.projectile(p);
      if(source){const a=Math.atan2(p.vy||0,p.vx||0);
        sprite(p,source.image,source.frame,p.x,p.y,source.scale,{shadow:false,lift:.18,center:true,unlit:true,order:p.friendly?1:5,depthWrite:false,
          trim:!source.dynamic,dynamic:source.dynamic,ground:source.ground,rotation:source.ground?0:(source.dynamic?a:0)-viewFacing(a)});
      }
    }
    // Native objects remain at native Core anchors in the non-fixture route.
    if(!bridgeScene)for(const o of state.objects){
      if(Math.abs(o.x-state.G.cam.x)>2300||Math.abs(o.y-state.G.cam.y)>2300)continue;
      const im=state.objectImages[o.type];if(!im?.width)continue;
      const sz=(state.objectMeta[o.type]?.sz||100)*(o.scale||1);
      sprite(o,im,{x:0,y:0,w:im.width,h:im.height},o.x,o.y,sz/im.width,{shadow:false});
    }
    drawEffects(state,{sprite,viewFacing,project,height,THREE,scene,camera});
    updateParticles(state,height,camera);
    for(const [key,m]of sprites){if(m.userData.frame!==frameId){m.visible=false;if(!state.ens.includes(key)&&!state.projs.includes(key)&&!state.pProjs.includes(key)&&key!==state.P&&!state.objects.includes(key)){
      scene.remove(m);const textures=new Set([m.material.map,m.material.normalMap]);for(const v of m.userData.views?.values()||[]){textures.add(v.map);textures.add(v.normal);}for(const t of textures)t?.dispose();m.material.dispose();sprites.delete(key);const sh=shadows.get(key);if(sh)scene.remove(sh);shadows.delete(key);
    }}}
    for(const m of shadows.values())if(m.userData.frame!==frameId)m.visible=false;
    // Reflect only the upper world. Clipping removes the submerged bank undersides.
    if(frameId%3===1){
      reflectionCamera.copy(camera);reflectionCamera.position.y=water.position.y*2-camera.position.y;
      const rt=target.clone();rt.y=water.position.y*2-target.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(rt);reflectionCamera.updateMatrixWorld();
      reflectUniforms.uReflectMatrix.value.multiplyMatrices(reflectionCamera.projectionMatrix,reflectionCamera.matrixWorldInverse);
      water.visible=false;renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),-water.position.y)];
      occlusionUniforms.uOcclusionEnabled.value=0;
      renderer.setRenderTarget(reflectionTarget);renderer.render(scene,reflectionCamera);renderer.setRenderTarget(null);renderer.clippingPlanes=[];water.visible=true;
      occlusionUniforms.uOcclusionEnabled.value=1;
    }
    const focus=target.clone().project(camera);grade.uniforms.focusDepth.value=focus.z*.5+.5;
    composer.render();
    labels.clearRect(0,0,state.width,state.height);
    labels.textAlign='center';labels.font='bold 16px serif';labels.lineWidth=3;labels.strokeStyle='#111314';
    for(const e of state.ens)if(e.alive&&e.hp>0&&e.hp<e.mhp){
      const p=project(e.x,e.y);const y=p.y-100;
      labels.fillStyle='#111314';labels.fillRect(p.x-25,y,50,5);labels.fillStyle='#9d3430';labels.fillRect(p.x-24,y+1,48*e.hp/e.mhp,3);
    }
    for(const t of state.G.txts||[]){
      if(t.life<=0)continue;
      const p=project(t.x,t.y);labels.globalAlpha=Math.min(1,(t.life||t.l||30)/15);
      if(state.drawLabel)state.drawLabel(labels,t,p.x,p.y-38);
      else{labels.strokeText(t.t||t.text||'',p.x,p.y-38);labels.fillStyle=t.c||t.col||'#e8ddbd';labels.fillText(t.t||t.text||'',p.x,p.y-38);}
    }
    labels.globalAlpha=1;
    lastRenderMs=performance.now()-renderStarted;lastDrawCalls=renderer.info.render.calls;return true;
  }
  function project(x,y){const p=new THREE.Vector3(x/U,height(x,y),y/U).project(camera);return {x:(p.x*.5+.5)*current.width,y:(-.5*p.y+.5)*current.height};}
  function snapshot(){return {ready,bridgeScene,frame:frameId,camera:{angle:52,yaw,zoom:bridgeScene?.47:.72},
    environment:{instances:environment.children.reduce((n,m)=>n+(m.count||0),0),meshes:groups.size,materials:materials.size},renderer:{memory:{...renderer.info.memory},programs:renderer.info.programs.length,drawCalls:lastDrawCalls,cpuDispatchMs:lastRenderMs},
    player:current?{core:{x:current.P.x,y:current.P.y},screen:project(current.P.x,current.P.y),height:height(current.P.x,current.P.y)}:null,
    activeSprites:[...sprites.values()].filter(m=>m.visible).length};}
  function safeRender(){
    if(!ready)return false;
    try{return render();}catch(error){
      ready=false;hidden=true;canvas.style.display=overlay.style.display='none';native.style.opacity='';
      for(const id of ['ct','fogGL','burstCvs'])document.getElementById(id).style.opacity='';
      window._Web3DTrialError=error.message;window._Web3DTrialErrorStack=error.stack;console.error('[WEB3D] native fallback',error);return false;
    }
  }
  const api={render:safeRender,inversePointer,project,snapshot,canvas,camera,viewFacing:f=>Math.atan2(Math.sin(f+yaw)*Math.sin(angle),Math.cos(f+yaw)),get active(){return ready&&!hidden;}};
  if(q.get('r3dDebug')==='1')api.debug={renderer,scene,camera,materials,ssao,bloom,grade,moon,water,environment};
  window._Web3DTrial=api;
  return api;
}
