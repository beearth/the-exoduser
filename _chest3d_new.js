(function(){
'use strict';
const CVS=document.getElementById('chest3dCvs');
if(!CVS||typeof THREE==='undefined')return;

const SZ=120;
const R=new THREE.WebGLRenderer({canvas:CVS,alpha:true,antialias:true,powerPreference:'high-performance'});
R.setSize(SZ,SZ);R.setPixelRatio(Math.min(devicePixelRatio,2));
CVS.style.width=CVS.style.height=SZ+'px';
R.setClearColor(0,0);R.outputColorSpace=THREE.SRGBColorSpace;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.4;

const SC=new THREE.Scene();
SC.fog=new THREE.FogExp2(0x010000,0.15);

const CAM=new THREE.PerspectiveCamera(38,1,0.01,30);
CAM.position.set(0.4,2.0,3.6);CAM.lookAt(0,0.55,0);

// env
const cubeRT=new THREE.WebGLCubeRenderTarget(64,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
const cubeCam=new THREE.CubeCamera(0.1,30,cubeRT);
const envS=new THREE.Scene();
envS.add(new THREE.HemisphereLight(0x3a0a02,0x0e0200,2.0));
const eD1=new THREE.DirectionalLight(0x7a3010,3.5);eD1.position.set(1,3,2);envS.add(eD1);
cubeCam.update(R,envS);SC.environment=cubeRT.texture;

// 조명
const keyL=new THREE.DirectionalLight(0xc07840,2.8);
keyL.position.set(-1.5,6,3);keyL.castShadow=true;
keyL.shadow.mapSize.set(512,512);
keyL.shadow.camera.near=0.1;keyL.shadow.camera.far=18;
keyL.shadow.camera.left=keyL.shadow.camera.bottom=-2.5;
keyL.shadow.camera.right=keyL.shadow.camera.top=2.5;
keyL.shadow.bias=-0.001;SC.add(keyL);
const sideL=new THREE.DirectionalLight(0x80300a,2.0);sideL.position.set(2.5,2,-2);SC.add(sideL);
SC.add(new THREE.HemisphereLight(0x180302,0x040100,0.6));
const iL1=new THREE.PointLight(0xff3300,0,4);iL1.position.set(0,1.1,0.3);SC.add(iL1);
const iL2=new THREE.PointLight(0xff6600,0,8);iL2.position.set(0,3,0);SC.add(iL2);

// 재질
const mWood=new THREE.MeshStandardMaterial({color:0x1e0e06,roughness:0.92,metalness:0.0,envMapIntensity:0.15});
const mWoodDk=new THREE.MeshStandardMaterial({color:0x130904,roughness:0.95,metalness:0.0,envMapIntensity:0.1});
const mIron=new THREE.MeshStandardMaterial({color:0x1a1210,roughness:0.62,metalness:0.55,envMapIntensity:1.2});
const mStone=new THREE.MeshStandardMaterial({color:0x1c1612,roughness:0.94,metalness:0.0,envMapIntensity:0.1});
const mGlow=new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});

const ROOT=new THREE.Group();SC.add(ROOT);ROOT.rotation.y=-0.18;

// === 돌 받침대 ===
const slab=new THREE.Mesh(new THREE.BoxGeometry(2.20,0.18,1.50),mStone);
slab.position.set(0,0.09,0);slab.receiveShadow=true;ROOT.add(slab);
// 받침대 앞 계단 디테일
const step=new THREE.Mesh(new THREE.BoxGeometry(2.10,0.08,0.20),mStone);
step.position.set(0,0.04,0.75);ROOT.add(step);
// 받침대 모서리 석재 볼
[[-1.05,0.20,0.70],[1.05,0.20,0.70],[-1.05,0.20,-0.70],[1.05,0.20,-0.70]].forEach(cp=>{
  const c=new THREE.Mesh(new THREE.SphereGeometry(0.10,8,7),mStone);
  c.position.set(cp[0],cp[1],cp[2]);ROOT.add(c);
});

// === 본체 (나무 + 철 밴드) ===
// 나무 판재 4단
const slotH=0.22;
for(let i=0;i<4;i++){
  const pl=new THREE.Mesh(new THREE.BoxGeometry(1.90,slotH-0.015,1.30),i%2===0?mWood:mWoodDk);
  pl.position.set(0,0.22+i*slotH+slotH/2,0);pl.castShadow=true;pl.receiveShadow=true;ROOT.add(pl);
}

// 내부 (열릴 때 보임)
const ins=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.72,1.02),new THREE.MeshStandardMaterial({color:0x060100,roughness:1,metalness:0}));
ins.position.set(0,0.62,0);ROOT.add(ins);
const glowFloor=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.95),mGlow);
glowFloor.position.set(0,1.11,0);glowFloor.rotation.x=-Math.PI/2;ROOT.add(glowFloor);

// 수평 철 밴드 3줄
[0.30,0.54,0.78].forEach(by=>{
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.92,0.072,1.32),mIron);
  b.position.set(0,by,0);ROOT.add(b);
  // 밴드 상단 하이라이트선
  const hi=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.016,1.34),new THREE.MeshStandardMaterial({color:0x3a2a1e,roughness:0.4,metalness:0.7,envMapIntensity:1.5}));
  hi.position.set(0,by+0.042,0);ROOT.add(hi);
});
// 수직 철 기둥 (앞면)
[-0.75,0,0.75].forEach(bx=>{
  const vb=new THREE.Mesh(new THREE.BoxGeometry(0.068,0.90,0.055),mIron);
  vb.position.set(bx,0.62,0.665);ROOT.add(vb);
});

// 코너 철 기둥 (두꺼운)
[[-0.93,0.64],[0.93,0.64],[-0.93,-0.64],[0.93,-0.64]].forEach(co=>{
  const col=new THREE.Mesh(new THREE.BoxGeometry(0.11,0.94,0.11),mIron);
  col.position.set(co[0],0.65,co[1]);ROOT.add(col);
  // 기둥 상단 캡
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.04,10),mIron);
  cap.position.set(co[0],1.12,co[1]);ROOT.add(cap);
});

// 앞면 자물쇠 판
const lkPlate=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.52,0.055),mIron);
lkPlate.position.set(0,0.62,0.678);ROOT.add(lkPlate);
// 자물쇠 몸체 (육각형처럼)
const lkBody=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.10,0.10,6),mIron);
lkBody.position.set(0,0.68,0.698);lkBody.rotation.x=Math.PI/2;ROOT.add(lkBody);
// 자물쇠 고리
const lkArc=new THREE.Mesh(new THREE.TorusGeometry(0.065,0.022,8,18,Math.PI),mIron);
lkArc.position.set(0,0.76,0.698);lkArc.rotation.z=Math.PI;ROOT.add(lkArc);
// 자물쇠 키홀
const kh=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.035,10),new THREE.MeshStandardMaterial({color:0x040100,roughness:1,metalness:0}));
kh.position.set(0,0.62,0.710);kh.rotation.x=Math.PI/2;ROOT.add(kh);
// 자물쇠 양옆 링 핸들
[-0.52,0.52].forEach(rx=>{
  const rh=new THREE.Mesh(new THREE.TorusGeometry(0.065,0.018,8,18),mIron);
  rh.position.set(rx,0.62,0.680);ROOT.add(rh);
});

// 리벳
const rvG=new THREE.SphereGeometry(0.030,8,6);
[-0.88,0.88].forEach(bx=>[0.30,0.54,0.78].forEach(by=>{
  [-0.59,0.59].forEach(bz=>{
    const rv=new THREE.Mesh(rvG,mIron);rv.position.set(bx,by+0.040,bz);ROOT.add(rv);
  });
  const rvf=new THREE.Mesh(rvG,mIron);rvf.position.set(bx,by+0.040,0.67);ROOT.add(rvf);
}));

// === 뚜껑 (아치형 배럴 lid) ===
const LID=new THREE.Group();LID.position.set(0,1.12,-0.65);ROOT.add(LID);

// 뚜껑 기본 플랫
const lidBase=new THREE.Mesh(new THREE.BoxGeometry(1.92,0.12,1.32),mWood);
lidBase.position.set(0,0.06,0.66);lidBase.castShadow=true;LID.add(lidBase);

// 아치형 배럴 곡면 (반원 실린더)
const archG=new THREE.CylinderGeometry(0.26,0.26,1.90,20,1,true,0,Math.PI);
const archM=new THREE.Mesh(archG,mWoodDk);
archM.rotation.z=-Math.PI/2;archM.position.set(0,0.20,0.66);archM.castShadow=true;LID.add(archM);

// 뚜껑 상단 철 밴드 2줄
[0.12,0.32].forEach(by=>{
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.92,0.060,1.32),mIron);
  b.position.set(0,by,0.66);LID.add(b);
  const arc2=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.27,1.92,20,1,true,0,Math.PI),mIron);
  arc2.rotation.z=-Math.PI/2;arc2.position.set(0,by+0.015,0.66);LID.add(arc2);
});
// 뚜껑 능선 파이프
const lidRidge=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.92,10),mIron);
lidRidge.rotation.z=Math.PI/2;lidRidge.position.set(0,0.46,0.66);LID.add(lidRidge);

// 뚜껑 앞 테두리
const lidFront=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.50,0.06),mIron);
lidFront.position.set(0,0.22,1.35);LID.add(lidFront);

// 뚜껑 코너 볼 장식
[[-0.95,0.66],[0.95,0.66],[-0.95,0],[0.95,0]].forEach(co=>{
  const cb=new THREE.Mesh(new THREE.SphereGeometry(0.07,10,8),mIron);
  cb.position.set(co[0],0.10,co[1]);LID.add(cb);
});

// 힌지
[-0.60,0.60].forEach(hx=>{
  const hg=new THREE.Mesh(new THREE.CylinderGeometry(0.038,0.038,0.20,10),mIron);
  hg.rotation.z=Math.PI/2;hg.position.set(hx,0.06,-0.01);LID.add(hg);
  const hb=new THREE.Mesh(new THREE.CylinderGeometry(0.038,0.038,0.20,10),mIron);
  hb.rotation.z=Math.PI/2;hb.position.set(hx,0.08,-0.65);ROOT.add(hb);
});

// 뚜껑 뿔 장식 (고딕)
[[-0.60,0.66],[0,0.66],[0.60,0.66]].forEach((hp,i)=>{
  const horn=new THREE.Mesh(new THREE.ConeGeometry(0.045,0.22+i*0.04,8),mIron);
  horn.position.set(hp[0],0.56+i*0.04,hp[1]);LID.add(horn);
});

// 그림자 바닥
const flr=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({color:0,transparent:true,opacity:0,roughness:1}));
flr.rotation.x=-Math.PI/2;flr.position.y=-0.005;flr.receiveShadow=true;SC.add(flr);

// 파티클
const parts=[];
for(let i=0;i<14;i++){
  const pm=new THREE.MeshBasicMaterial({
    color:new THREE.Color().setHSL(0.03+Math.random()*0.05,1.0,0.55+Math.random()*0.2),
    transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
  });
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1,1),pm);
  const sz=0.04+Math.random()*0.06;p.scale.setScalar(sz);
  p.userData={angle:Math.random()*Math.PI*2,r:0.45+Math.random()*0.75,
    yOff:Math.random()*1.1,ySpd:0.10+Math.random()*0.20,
    aSpd:(0.18+Math.random()*0.26)*(Math.random()<0.5?1:-1),phase:Math.random()*Math.PI*2};
  p.visible=false;SC.add(p);parts.push(p);
}

let _st='hidden',_timer=0,_wx=0,_wy=0;
function _reset(){
  LID.rotation.x=0;ROOT.position.set(0,0,0);ROOT.rotation.set(0,-0.18,0);
  iL1.intensity=0;iL2.intensity=0;mGlow.opacity=0;
  parts.forEach(p=>{p.visible=false;p.material.opacity=0;});
}
window._chest3d={
  show(wx,wy){_wx=wx;_wy=wy;_st='idle';_timer=0;_reset();CVS.style.display='block';},
  open(){if(_st==='idle'||_st==='rattling'){_st='rattling';_timer=0;}},
  hide(){_st='hidden';CVS.style.display='none';},
  get active(){return _st!=='hidden';}
};

function updatePos(){
  const c=document.getElementById('c');
  if(!c||typeof G==='undefined'||!G.on)return;
  const sc=(typeof _dpr!=='undefined'?_dpr:devicePixelRatio)*((typeof OPT!=='undefined'&&OPT.resScale)?OPT.resScale/100:1);
  const cssX=(c.width/2+(_wx-G.cam.x))/sc;
  const cssY=(c.height/2+(_wy-G.cam.y))/sc;
  if(cssX<-200||cssX>innerWidth+200||cssY<-200||cssY>innerHeight+200){CVS.style.opacity='0';return;}
  CVS.style.opacity='1';
  CVS.style.left=(cssX-SZ/2)+'px';
  CVS.style.top=(cssY-SZ*.82)+'px';
}

const CLK=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  if(_st==='hidden')return;
  const dt=Math.min(CLK.getDelta(),0.05);_timer+=dt;
  updatePos();
  parts.forEach(p=>{
    const u=p.userData;
    if(_st==='idle'||_st==='rattling'){
      p.visible=true;u.angle+=dt*u.aSpd;
      const y0=0.05+((u.yOff+_timer*u.ySpd)%1.2);
      p.position.set(Math.cos(u.angle)*u.r,y0,Math.sin(u.angle)*u.r*0.45);
      p.lookAt(CAM.position);
      p.material.opacity=(_st==='rattling'?0.75:0.35)+Math.sin(_timer*1.8+u.phase)*0.14;
    }else if(_st==='opening'&&_timer<0.5){
      p.visible=true;p.material.opacity=Math.max(0,(0.5-_timer)*1.8);
    }else{p.visible=false;}
  });

  if(_st==='idle'){
    ROOT.position.y=Math.sin(_timer*1.3)*0.022;
    ROOT.rotation.y=-0.18+Math.sin(_timer*0.44)*0.035;
  }else if(_st==='rattling'){
    const rp=Math.min(1,_timer*2.4);
    ROOT.position.x=Math.sin(_timer*48)*0.040*rp;
    ROOT.position.y=Math.abs(Math.sin(_timer*43))*0.022*rp;
    ROOT.rotation.z=Math.sin(_timer*45)*0.020*rp;ROOT.rotation.y=-0.18;
    iL1.intensity=Math.min(1,_timer*2)*1.2;
    if(_timer>.50){_st='opening';_timer=0;if(typeof shake==='function')shake(14);}
  }else if(_st==='opening'){
    const t=Math.min(1,_timer/1.0),ease=1-(1-t)*(1-t)*(1-t);
    LID.rotation.x=-Math.PI*.82*ease;
    ROOT.position.x=0;ROOT.rotation.z=0;ROOT.rotation.y=-0.18;
    const bst=Math.min(1,_timer/.35),fad=_timer>.5?1-Math.min(1,(_timer-.5)/1.0):1;
    iL1.intensity=bst*fad*12;iL2.intensity=bst*fad*6;
    mGlow.opacity=bst*fad*0.9;
    if(_timer>=1.35){_st='open';_timer=0;LID.rotation.x=-Math.PI*.82;}
  }else if(_st==='open'){
    ROOT.position.y=Math.sin(_timer*0.9)*0.012;ROOT.rotation.y=-0.18;
    iL1.intensity=Math.max(0,4.5-_timer*1.6);
    iL2.intensity=Math.max(0,2.2-_timer*1.1);
    mGlow.opacity=Math.max(0,.50-_timer*.22);
    if(_timer>5.2){_st='hidden';CVS.style.display='none';}
  }
  R.render(SC,CAM);
}
tick();
console.log('[CHEST3D] GOW v7 barrel-chest');
})();
