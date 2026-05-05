// ═══ Dark Fantasy Fog Background (Three.js, no external textures) ═══
// 프로시저럴 안개 텍스처 생성 + 3레이어 + FogExp2
(function(){
'use strict';

let _fogCanvas,_fogRenderer,_fogScene,_fogCamera,_fogLayers=[],_fogClock;
let _fogActive=false,_fogRAF=0;

// ── 프로시저럴 안개 텍스처 생성 (Canvas 2D) ──
function _genFogTex(w,h,seed,density){
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,w,h);
  // 다중 원형 그라디언트 = 연기 느낌
  const rng=(s)=>{s=Math.sin(s)*43758.5453;return s-Math.floor(s)};
  const blobs=12+~~(density*20);
  for(let i=0;i<blobs;i++){
    const bx=rng(seed+i*7.1)*w;
    const by=rng(seed+i*13.3)*h;
    const br=40+rng(seed+i*3.7)*Math.min(w,h)*0.4;
    const ba=0.03+rng(seed+i*17.9)*0.08;
    const g=x.createRadialGradient(bx,by,0,bx,by,br);
    g.addColorStop(0,'rgba(180,160,140,'+ba+')');
    g.addColorStop(0.4,'rgba(120,110,100,'+(ba*0.6)+')');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(0,0,w,h);
  }
  // 수평 와이프 (좌우 끊김 방지)
  const fadeW=w*0.15;
  const lg=x.createLinearGradient(0,0,fadeW,0);
  lg.addColorStop(0,'rgba(0,0,0,1)');lg.addColorStop(1,'rgba(0,0,0,0)');
  x.globalCompositeOperation='destination-in';
  // 실은 destination-out으로 가장자리 페이드
  x.globalCompositeOperation='destination-out';
  const edgeFade=x.createLinearGradient(0,0,fadeW,0);
  edgeFade.addColorStop(0,'rgba(0,0,0,0.8)');edgeFade.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=edgeFade;x.fillRect(0,0,fadeW,h);
  const edgeFade2=x.createLinearGradient(w,0,w-fadeW,0);
  edgeFade2.addColorStop(0,'rgba(0,0,0,0.8)');edgeFade2.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=edgeFade2;x.fillRect(w-fadeW,0,fadeW,h);
  x.globalCompositeOperation='source-over';
  return c;
}

function initFog3D(containerEl){
  if(_fogActive)return;
  if(typeof THREE==='undefined'){
    // Three.js CDN 로드
    const s=document.createElement('script');
    s.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    s.onload=()=>_setupFog(containerEl);
    document.head.appendChild(s);
  }else{_setupFog(containerEl)}
}

function _setupFog(containerEl){
  _fogCanvas=document.createElement('canvas');
  _fogCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none';
  containerEl.insertBefore(_fogCanvas,containerEl.firstChild);

  _fogRenderer=new THREE.WebGLRenderer({canvas:_fogCanvas,alpha:true,antialias:false});
  _fogRenderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  _fogRenderer.setSize(containerEl.clientWidth,containerEl.clientHeight);
  _fogRenderer.setClearColor(0x0a0a0a,1);

  _fogScene=new THREE.Scene();
  _fogScene.fog=new THREE.FogExp2(0x0a0a0a,0.035);

  _fogCamera=new THREE.PerspectiveCamera(65,containerEl.clientWidth/containerEl.clientHeight,0.1,100);
  _fogCamera.position.set(0,0,5);

  _fogClock=new THREE.Clock();

  // ── 3개 안개 레이어 ──
  const layerConfigs=[
    {z:-2, speed:0.08, opacity:0.25, scale:12, blend:'normal',  seed:1.0, density:0.8},
    {z:-4, speed:0.05, opacity:0.15, scale:18, blend:'additive',seed:5.0, density:0.6},
    {z:-6, speed:0.03, opacity:0.10, scale:24, blend:'normal',  seed:9.0, density:0.4},
  ];

  for(const cfg of layerConfigs){
    const texCanvas=_genFogTex(512,256,cfg.seed,cfg.density);
    const tex=new THREE.CanvasTexture(texCanvas);
    tex.wrapS=THREE.RepeatWrapping;
    tex.wrapT=THREE.RepeatWrapping;
    tex.minFilter=THREE.LinearFilter;
    tex.magFilter=THREE.LinearFilter;

    const mat=new THREE.MeshBasicMaterial({
      map:tex,
      transparent:true,
      opacity:cfg.opacity,
      depthWrite:false,
      blending:cfg.blend==='additive'?THREE.AdditiveBlending:THREE.NormalBlending,
    });

    const geo=new THREE.PlaneGeometry(cfg.scale,cfg.scale*0.5);
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.set(0,-0.5,cfg.z);
    _fogScene.add(mesh);

    _fogLayers.push({mesh,tex,speed:cfg.speed,offsetX:0});
  }

  // ── 수직 그라디언트 오버레이 (위쪽 더 어둡게) ──
  const gradGeo=new THREE.PlaneGeometry(30,15);
  const gradMat=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,
    uniforms:{},
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader:`varying vec2 vUv;void main(){float a=smoothstep(0.7,0.0,vUv.y)*0.4;gl_FragColor=vec4(0.0,0.0,0.0,a);}`
  });
  const gradMesh=new THREE.Mesh(gradGeo,gradMat);
  gradMesh.position.set(0,0,-1);
  _fogScene.add(gradMesh);

  // ── 미세 파티클 (먼지) ──
  const pCount=80;
  const pGeo=new THREE.BufferGeometry();
  const pPos=new Float32Array(pCount*3);
  for(let i=0;i<pCount;i++){
    pPos[i*3]=(Math.random()-0.5)*20;
    pPos[i*3+1]=(Math.random()-0.5)*10;
    pPos[i*3+2]=-1-Math.random()*8;
  }
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  const pMat=new THREE.PointsMaterial({color:0x887766,size:0.03,transparent:true,opacity:0.3,depthWrite:false,blending:THREE.AdditiveBlending});
  const particles=new THREE.Points(pGeo,pMat);
  _fogScene.add(particles);
  _fogLayers._particles=particles;
  _fogLayers._pPos=pPos;
  _fogLayers._pCount=pCount;

  _fogActive=true;

  // 리사이즈
  const _onResize=()=>{
    if(!containerEl.clientWidth)return;
    _fogCamera.aspect=containerEl.clientWidth/containerEl.clientHeight;
    _fogCamera.updateProjectionMatrix();
    _fogRenderer.setSize(containerEl.clientWidth,containerEl.clientHeight);
  };
  window.addEventListener('resize',_onResize);

  _fogAnimate();
}

function _fogAnimate(){
  if(!_fogActive)return;
  _fogRAF=requestAnimationFrame(_fogAnimate);
  const dt=_fogClock.getDelta();

  // 안개 레이어 스크롤
  for(const layer of _fogLayers){
    if(!layer.tex)continue;
    layer.offsetX+=layer.speed*dt;
    layer.tex.offset.x=layer.offsetX;
    // 미세 수직 움직임
    layer.mesh.position.y=-0.5+Math.sin(layer.offsetX*0.5)*0.15;
  }

  // 파티클 느린 드리프트
  if(_fogLayers._pPos){
    const pp=_fogLayers._pPos;
    for(let i=0;i<_fogLayers._pCount;i++){
      pp[i*3]+=dt*0.02*(Math.sin(i)*0.5+0.5);
      pp[i*3+1]+=dt*0.01*Math.cos(i*0.7);
      if(pp[i*3]>10)pp[i*3]=-10;
      if(pp[i*3+1]>5)pp[i*3+1]=-5;
    }
    _fogLayers._particles.geometry.attributes.position.needsUpdate=true;
  }

  _fogRenderer.render(_fogScene,_fogCamera);
}

function destroyFog3D(){
  _fogActive=false;
  cancelAnimationFrame(_fogRAF);
  if(_fogRenderer){_fogRenderer.dispose();_fogRenderer.forceContextLoss()}
  _fogLayers=[];
  if(_fogCanvas&&_fogCanvas.parentNode)_fogCanvas.parentNode.removeChild(_fogCanvas);
  _fogCanvas=null;_fogRenderer=null;_fogScene=null;_fogCamera=null;
}

window.initFog3D=initFog3D;
window.destroyFog3D=destroyFog3D;
})();
