// Skill Forge 3D layer — three.js r186 (assets/vendor/three-r186), WebGL2 + PBR + bloom.
// Renders only while the K panel is open (the game is paused then). Positions come from the
// DOM layout (skill-forge.js) in CSS px, so the 3D always sits exactly under the DOM hit areas.
import * as THREE from './assets/vendor/three-r186/build/three.module.js';
import {EffectComposer} from './assets/vendor/three-r186/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './assets/vendor/three-r186/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './assets/vendor/three-r186/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from './assets/vendor/three-r186/examples/jsm/postprocessing/OutputPass.js';
import {RoomEnvironment} from './assets/vendor/three-r186/examples/jsm/environments/RoomEnvironment.js';

const FOV=30;
const BONE=new THREE.Color('#dfd6c2'),FIRE=new THREE.Color('#ec7958'),GOLD=new THREE.Color('#c9a663');

function softSprite(){
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
// Rune circle for the altar disc: concentric rails, ticks and sigils in hairline gold on dark iron.
function runeTexture(){
  const S=1024,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');
  const C=S/2;g.fillStyle='#000';g.fillRect(0,0,S,S);
  g.strokeStyle='#fff';g.lineCap='round';
  const ring=(r,w)=>{g.lineWidth=w;g.beginPath();g.arc(C,C,r,0,Math.PI*2);g.stroke()};
  ring(500,6);ring(470,2);ring(440,3);ring(330,2);ring(300,5);ring(170,2);ring(150,4);
  for(let i=0;i<120;i++){const a=i/120*Math.PI*2,l=i%10===0?28:i%5===0?18:9;g.lineWidth=i%10===0?4:2;
    g.beginPath();g.moveTo(C+Math.cos(a)*(440+2),C+Math.sin(a)*(440+2));g.lineTo(C+Math.cos(a)*(440+2+l),C+Math.sin(a)*(440+2+l));g.stroke();}
  // star polygons
  const star=(r,n,k,w)=>{g.lineWidth=w;g.beginPath();for(let i=0;i<=n;i++){const a=-Math.PI/2+(i*k%n)/n*Math.PI*2;const x=C+Math.cos(a)*r,y=C+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()};
  star(300,7,3,2);star(300,5,2,3);
  // sigils between rails
  g.font='bold 30px serif';g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  const sig='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;g.save();g.translate(C+Math.cos(a)*386,C+Math.sin(a)*386);g.rotate(a+Math.PI/2);g.fillText(sig[i],0,0);g.restore();}
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.13;g.lineWidth=2;g.beginPath();g.arc(C+Math.cos(a)*230,C+Math.sin(a)*230,16,0,Math.PI*2);g.stroke();}
  const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;
}
function ironNoise(){
  const S=512,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),im=g.createImageData(S,S);
  let s=1234567;const rnd=()=>{s=(s*1103515245+12345)>>>0;return s/4294967296};
  for(let i=0;i<S*S;i++){const v=150+rnd()*70;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}
  g.putImageData(im,0,0);g.filter='blur(1.5px)';g.drawImage(c,0,0);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

// Icon disc: fills the ring's inner edge and crops the icon art's own dark rim (UV zoom).
function iconDisc(r,crop){const g=new THREE.CircleGeometry(r,96);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.5+(uv.getX(i)-.5)*crop,.5+(uv.getY(i)-.5)*crop);uv.needsUpdate=true;return g}

export async function createForge3D(container){
  const canvas=document.createElement('canvas');canvas.className='sf-gl';container.appendChild(canvas);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});}
  catch(e){canvas.remove();throw e}
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#0b0809');
  const pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.42;
  const camera=new THREE.PerspectiveCamera(FOV,1,10,20000);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.62,.5,.86);composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const loader=new THREE.TextureLoader();const texCache=new Map();
  const tex=url=>{if(!url)return null;let t=texCache.get(url);if(!t){t=loader.load(url);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;texCache.set(url,t)}return t};
  const glowTex=softSprite(),runeTex=runeTexture(),noiseTex=ironNoise();

  // ── lights ──
  scene.add(new THREE.HemisphereLight(0x8a6f5a,0x120808,.35));
  const key=new THREE.DirectionalLight(0xffe2c0,2.2);key.position.set(-.6,.9,1.2);scene.add(key);
  const rim=new THREE.PointLight(0xff5530,3,0,1.2);scene.add(rim);
  const coreLight=new THREE.PointLight(0xff7a40,2.5,0,1.4);scene.add(coreLight);

  // ── backdrop: smoke + hellfire under the altar ──
  const backMat=new THREE.ShaderMaterial({uniforms:{t:{value:0},alt:{value:new THREE.Vector2(.5,.5)},res:{value:new THREE.Vector2(1,1)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float t;uniform vec2 alt,res;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
      void main(){vec2 p=vUv*res/600.;float s=fbm(p*1.6+vec2(0.,-t*.03))*.7+fbm(p*4.+vec2(t*.02,-t*.05))*.3;
        vec2 d=(vUv-alt)*res/max(res.x,res.y);float r=length(d*vec2(1.,1.25));
        vec3 base=mix(vec3(.010,.007,.008),vec3(.026,.017,.016),s);
        vec3 fire=vec3(.40,.08,.025)*pow(smoothstep(.34,.0,r),1.6)*(.5+.5*s);
        float vig=smoothstep(1.15,.25,length((vUv-.5)*vec2(1.,1.4)));
        gl_FragColor=vec4((base+fire*.45)*vig,1.);}`,depthWrite:false});
  const back=new THREE.Mesh(new THREE.PlaneGeometry(1,1),backMat);scene.add(back);

  // ── shared materials ──
  const iron=new THREE.MeshStandardMaterial({color:0x2a2422,metalness:.92,roughness:.38,roughnessMap:noiseTex,envMapIntensity:1});
  const goldMat=new THREE.MeshStandardMaterial({color:GOLD,metalness:1,roughness:.28,emissive:0x2a1606,emissiveIntensity:.4});
  const glassEmpty=new THREE.MeshPhysicalMaterial({color:0x0a0606,metalness:0,roughness:.3,clearcoat:.4,transparent:true,opacity:.06,envMapIntensity:.25});
  const glass=new THREE.MeshPhysicalMaterial({color:0x140c0c,metalness:0,roughness:.12,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.18,envMapIntensity:.7});

  // ── altar ──
  const altar=new THREE.Group();scene.add(altar);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(1,128),new THREE.MeshStandardMaterial({color:0x1b1514,metalness:.85,roughness:.5,roughnessMap:noiseTex,
    emissive:0xff5a28,emissiveMap:runeTex,emissiveIntensity:.55,map:null}));
  altar.add(disc);
  const discGold=new THREE.Mesh(new THREE.CircleGeometry(1,128),new THREE.MeshStandardMaterial({color:GOLD,metalness:1,roughness:.3,alphaMap:runeTex,transparent:true,opacity:.55,depthWrite:false}));
  discGold.position.z=.5;altar.add(discGold);
  const outer=new THREE.Mesh(new THREE.TorusGeometry(1,.035,24,192),iron);altar.add(outer);
  const outerGold=new THREE.Mesh(new THREE.TorusGeometry(1,.012,12,192),goldMat);altar.add(outerGold);
  const spikeGeo=new THREE.ConeGeometry(.03,.12,6);spikeGeo.rotateZ(-Math.PI/2);spikeGeo.translate(.06,0,0);
  const spikes=new THREE.InstancedMesh(spikeGeo,iron,36);altar.add(spikes);
  const coreGroup=new THREE.Group();scene.add(coreGroup);
  const coreOrb=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),new THREE.MeshPhysicalMaterial({color:0x2a0c08,metalness:.2,roughness:.15,clearcoat:1,
    emissive:0xff5a28,emissiveIntensity:.6,envMapIntensity:1.3}));
  coreGroup.add(coreOrb);
  const coreIcon=new THREE.Mesh(iconDisc(.96,.84),new THREE.MeshBasicMaterial({transparent:true,toneMapped:false}));coreIcon.position.z=1.02;coreGroup.add(coreIcon);
  const coreRing=new THREE.Mesh(new THREE.TorusGeometry(1.08,.07,20,128),goldMat);coreGroup.add(coreRing);
  const coreGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:FIRE,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.9}));coreGlow.scale.setScalar(4);coreGroup.add(coreGlow);

  // ── embers ──
  const EMB=360,embGeo=new THREE.BufferGeometry(),embPos=new Float32Array(EMB*3),embSeed=new Float32Array(EMB);
  for(let i=0;i<EMB;i++){embSeed[i]=Math.random()}
  embGeo.setAttribute('position',new THREE.BufferAttribute(embPos,3));
  const embers=new THREE.Points(embGeo,new THREE.PointsMaterial({map:glowTex,color:0xff8a4a,size:7,sizeAttenuation:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.85}));
  scene.add(embers);
  // burst particles (fusion)
  const BUR=420,burGeo=new THREE.BufferGeometry(),burPos=new Float32Array(BUR*3),burVel=new Float32Array(BUR*3);
  burGeo.setAttribute('position',new THREE.BufferAttribute(burPos,3));
  const burstPts=new THREE.Points(burGeo,new THREE.PointsMaterial({map:glowTex,color:0xffc070,size:14,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));
  scene.add(burstPts);let burstT=-1;

  // ── energy link material ──
  const linkMat=(col)=>new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
    uniforms:{t:{value:0},c:{value:new THREE.Color(col)},a:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`varying vec2 vUv;uniform float t,a;uniform vec3 c;
      float h(float x){return fract(sin(x*91.7)*4375.5);}
      void main(){float edge=1.-abs(vUv.y-.5)*2.;edge=pow(max(edge,0.),2.2);
        float flow=.55+.45*sin(vUv.x*26.-t*7.)*sin(vUv.x*9.+t*3.);
        float fade=smoothstep(0.,.12,vUv.x)*smoothstep(1.,.82,vUv.x);
        gl_FragColor=vec4(c*(.6+flow*.9),edge*fade*a*.9);}`});

  // ── per-object pools ──
  const slotObjs=[],nodeObjs=new Map();
  function makeOrb(){
    const g=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1,.11,24,96),iron);g.add(ring);
    const band=new THREE.Mesh(new THREE.TorusGeometry(1.0,.035,12,96),goldMat);band.position.z=.06;g.add(band);
    const face=new THREE.Mesh(iconDisc(.97,.84),new THREE.MeshStandardMaterial({color:0xffffff,metalness:0,roughness:.6,emissive:0xffffff,emissiveIntensity:.12,transparent:true}));
    face.position.z=.02;g.add(face);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.97,48,24,0,Math.PI*2,0,Math.PI/2),glass);dome.rotation.x=Math.PI/2;dome.scale.z=.35;g.add(dome);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:FIRE,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));glow.scale.setScalar(2.6);glow.position.z=-.3;g.add(glow);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(1.22,.03,8,96),new THREE.MeshBasicMaterial({color:FIRE,transparent:true,opacity:0,toneMapped:false}));g.add(halo);
    g.userData={ring,band,face,glow,halo,dome,cur:new THREE.Vector3(),tgt:new THREE.Vector3(),s:0,ts:1,iconUrl:undefined};
    scene.add(g);return g;
  }
  function setIcon(o,url){
    const u=o.userData;if(u.iconUrl===url)return;u.iconUrl=url;
    const m=u.face.material;m.map=url?tex(url):null;m.emissiveMap=m.map;m.color.set(url?0xffffff:0x241a18);m.emissive.set(url?0xffffff:0x000000);m.needsUpdate=true;
  }
  const links=new Map();
  function link(id,col){let l=links.get(id);if(!l){l=new THREE.Mesh(new THREE.PlaneGeometry(1,1),linkMat(col));scene.add(l);links.set(id,l)}l.material.uniforms.c.value.set(col);return l}

  // ── layout mapping: CSS px → world at depth z (camera straight on) ──
  let W=1,H=1,D=1000;
  const toWorld=(x,y,z,out)=>{const k=(D-z)/D;return out.set((x-W/2)*k,(H/2-y)*k,z)};
  let state=null,hoverV=0,dropFlash=0;
  function setState(s){
    state=s;
    if(Math.abs(s.width-W)>.5||Math.abs(s.height-H)>.5)resize(s.width,s.height);
    // slots
    while(slotObjs.length<s.slots.length)slotObjs.push(makeOrb());
    slotObjs.forEach((o,i)=>{const d=s.slots[i];o.visible=!!d;if(!d)return;const u=o.userData;
      toWorld(d.x,d.y,20,u.tgt);if(!u.s)u.cur.copy(u.tgt);u.ts=d.r*(d.on?1.08:1);u.on=d.on;u.empty=d.empty;u.host=d.host;u.fused=d.fused;setIcon(o,d.icon)});
    // altar
    const a=s.altar;
    toWorld(a.x,a.y,-60,altar.position);const R=Math.max(a.R*1.32,a.R+a.nodeR*1.3)*(D+60)/D;altar.scale.setScalar(R); // 소켓 바깥 가장자리까지 원판 안에
    const pos=altar.position;
    let i=0;const m4=new THREE.Matrix4(),q=new THREE.Quaternion();
    for(let k=0;k<36;k++){const ang=k/36*Math.PI*2;q.setFromAxisAngle(new THREE.Vector3(0,0,1),ang);m4.compose(new THREE.Vector3(Math.cos(ang)*1.02,Math.sin(ang)*1.02,0),q,new THREE.Vector3(1,1,1));spikes.setMatrixAt(k,m4)}
    spikes.instanceMatrix.needsUpdate=true;
    toWorld(a.core.x,a.core.y,40,coreGroup.position);coreGroup.userData.ts=Math.max(26,a.core.r*.95);
    const cIcon=a.core.icon?tex(a.core.icon):null;coreIcon.material.map=cIcon;coreIcon.material.opacity=cIcon?1:0;coreIcon.material.needsUpdate=true;
    coreGroup.userData.ready=a.core.ready;coreGroup.userData.fused=a.core.fused;coreGroup.visible=!a.core.empty;
    const col=new THREE.Color(a.color),col2=new THREE.Color(a.color2);
    coreLight.color.copy(col);coreGlow.material.color.copy(col);disc.material.emissive.copy(col).lerp(FIRE,.5);
    toWorld(a.x,a.y-30,200,rim.position);toWorld(a.x,a.y,120,coreLight.position);
    // nodes
    const seen=new Set();
    for(const n of a.nodes){
      const id=n.id+'|'+n.kind;seen.add(id);let o=nodeObjs.get(id);
      if(!o){o=makeOrb();nodeObjs.set(id,o);toWorld(a.core.x,a.core.y,30,o.userData.cur);o.userData.s=.01}
      const u=o.userData;toWorld(n.x,n.y,30,u.tgt);u.ts=a.nodeR*(n.kind==='ghost'?.86:1);u.kind=n.kind;setIcon(o,n.id==='ghost'?null:n.icon);
      u.col=n.kind==='host'?GOLD:n.kind==='staged'?new THREE.Color('#ffb347'):n.kind==='ghost'?BONE:col2;
      if(n.kind!=='ghost')link(id,n.kind==='staged'?'#ffb347':a.color2);
    }
    for(const [id,o] of nodeObjs)if(!seen.has(id)){scene.remove(o);nodeObjs.delete(id)}
    for(const [id,l] of links)if(!seen.has(id)){scene.remove(l);l.geometry.dispose();l.material.dispose();links.delete(id)}
    // embers spread across the altar area
    for(let k=0;k<EMB;k++){embPos[k*3]=altar.position.x+(Math.random()-.5)*R*2.6;embPos[k*3+1]=altar.position.y+(Math.random()-.5)*R*2.2;embPos[k*3+2]=Math.random()*120}
    embGeo.attributes.position.needsUpdate=true;
    const bu=backMat.uniforms;bu.alt.value.set(a.x/W,1-a.y/H);bu.res.value.set(W,H);
    resume();
  }
  function resize(w,h){
    W=Math.max(2,w);H=Math.max(2,h);D=H/2/Math.tan(THREE.MathUtils.degToRad(FOV/2));
    camera.aspect=W/H;camera.position.set(0,0,D);camera.near=D*.05;camera.far=D*4;camera.updateProjectionMatrix();
    renderer.setSize(W,H,false);composer.setSize(W,H);bloom.setSize(W,H);
    back.position.set(0,0,-400);back.scale.set(W*(D+400)/D,H*(D+400)/D,1);
  }
  // ── loop ──
  let raf=0,last=performance.now(),t=0,running=false;
  const isOpen=()=>{const p=document.getElementById('skillPanel');return!!(p&&p.classList.contains('on'))&&container.isConnected};
  function frame(now){
    raf=0;if(!isOpen()){running=false;return}
    const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
    backMat.uniforms.t.value=t;
    altar.rotation.z+=dt*.05;discGold.rotation.z=-altar.rotation.z*1.6;
    const pulse=.5+.5*Math.sin(t*3.2);
    // core
    const cu=coreGroup.userData;const cs=(cu.ts||40)*(cu.ready?1+.06*pulse:1);coreGroup.scale.lerp(new THREE.Vector3(cs,cs,cs),.18);
    coreOrb.material.emissiveIntensity=(cu.ready?1.6:cu.fused?.9:.5)+.25*pulse+hoverV*.6+dropFlash*2;
    coreGlow.material.opacity=(cu.ready?1:.6)+.2*pulse+dropFlash;coreLight.intensity=2+1.5*pulse*(cu.ready?1:.3)+hoverV+dropFlash*6;
    coreRing.rotation.z-=dt*.6;
    disc.material.emissiveIntensity=.45+.25*pulse+hoverV*.5+(hoverV<0?-.3:0);
    rim.intensity=2.5+hoverV*2;
    // slots
    for(const o of slotObjs){const u=o.userData;if(!o.visible)continue;u.cur.lerp(u.tgt,.25);u.s+=(u.ts-u.s)*.2;o.position.copy(u.cur);
      o.position.z+=u.on?16:0;o.scale.setScalar(u.s);
      u.glow.material.opacity=u.on?.5+.15*pulse:u.fused?.15:0;u.glow.material.color.copy(u.fused&&!u.on?GOLD:FIRE);
      u.halo.material.opacity=u.on?.9:0;u.halo.rotation.z+=dt*.8;
      u.face.material.emissiveIntensity=u.empty?0:u.on?.2:.1;u.dome.material=u.empty?glassEmpty:glass;}
    // nodes + links
    for(const [id,o] of nodeObjs){const u=o.userData;u.cur.lerp(u.tgt,.14);u.s+=(u.ts-u.s)*.14;o.position.copy(u.cur);o.scale.setScalar(Math.max(.01,u.s));
      const ghost=u.kind==='ghost';
      u.ring.visible=!ghost;u.dome.visible=!ghost;
      u.halo.material.color.copy(u.col||FIRE);u.halo.material.opacity=ghost?.35+.45*pulse+Math.max(0,hoverV)*.4:u.kind==='host'?.95:.75;
      u.halo.rotation.z+=dt*(ghost?1.4:.5);
      u.glow.material.color.copy(u.col||FIRE);u.glow.material.opacity=ghost?.08*pulse:u.kind==='staged'?.4+.25*pulse:.32;
            const l=links.get(id);
      if(l){const p0=coreGroup.position,p1=o.position;const dx=p1.x-p0.x,dy=p1.y-p0.y,len=Math.hypot(dx,dy);
        l.position.set((p0.x+p1.x)/2,(p0.y+p1.y)/2,(p0.z+p1.z)/2-6);l.rotation.z=Math.atan2(dy,dx);l.scale.set(len,Math.max(10,u.s*.42),1);
        l.material.uniforms.t.value=t;l.material.uniforms.a.value=u.kind==='staged'?.6+.4*pulse:1;}}
    // embers drift up
    const ep=embGeo.attributes.position.array;
    for(let k=0;k<EMB;k++){ep[k*3+1]+=dt*(18+embSeed[k]*40);ep[k*3]+=Math.sin(t*.8+embSeed[k]*30)*dt*8;
      if(ep[k*3+1]>altar.position.y+altar.scale.x*1.25){ep[k*3+1]=altar.position.y-altar.scale.x*1.1;ep[k*3]=altar.position.x+(embSeed[k]-.5)*altar.scale.x*2.6}}
    embGeo.attributes.position.needsUpdate=true;
    // burst
    if(burstT>=0){burstT+=dt;const bp=burGeo.attributes.position.array;
      for(let k=0;k<BUR;k++){bp[k*3]+=burVel[k*3]*dt;bp[k*3+1]+=burVel[k*3+1]*dt;burVel[k*3]*=.97;burVel[k*3+1]*=.97;burVel[k*3+1]+=25*dt}
      burGeo.attributes.position.needsUpdate=true;burstPts.material.opacity=Math.max(0,1-burstT/1.4);if(burstT>1.5)burstT=-1}
    dropFlash*=Math.pow(.02,dt);
    composer.render(dt);
    raf=requestAnimationFrame(frame);
  }
  function resume(){if(raf)return;running=true;last=performance.now();raf=requestAnimationFrame(frame)}
  function pause(){if(raf)cancelAnimationFrame(raf);raf=0;running=false}
  function burst(g){
    const c=new THREE.Color(g&&g.color||'#ffb070');burstPts.material.color.copy(c);
    const p=coreGroup.position;const bp=burGeo.attributes.position.array;
    for(let k=0;k<BUR;k++){bp[k*3]=p.x;bp[k*3+1]=p.y;bp[k*3+2]=p.z+20;const a=Math.random()*Math.PI*2,s=120+Math.random()*520;burVel[k*3]=Math.cos(a)*s;burVel[k*3+1]=Math.sin(a)*s;burVel[k*3+2]=0}
    burGeo.attributes.position.needsUpdate=true;burstT=0;dropFlash=1.2;resume();
  }
  const ro=new ResizeObserver(()=>{const r=container.getBoundingClientRect();if(r.width&&r.height&&(Math.abs(r.width-W)>.5||Math.abs(r.height-H)>.5)){resize(r.width,r.height);resume()}});
  ro.observe(container);
  const r0=container.getBoundingClientRect();resize(r0.width||800,r0.height||600);
  return{setState,resume,pause,burst,hover(v){hoverV=v;resume()},drop(){dropFlash=1;resume()},
    dispose(){pause();ro.disconnect();renderer.dispose();canvas.remove()},_debug:()=>({W,H,D,nodes:nodeObjs.size,slots:slotObjs.length,running})};
}
