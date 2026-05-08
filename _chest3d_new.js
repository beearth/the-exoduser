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
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.6;

const SC=new THREE.Scene();
SC.fog=new THREE.FogExp2(0x000005,0.20);

// 카메라
const CAM=new THREE.PerspectiveCamera(40,1,0.01,30);
CAM.position.set(0,1.9,3.8);CAM.lookAt(0,0.4,0);

// 환경맵 — 냉색 (고딕)
const cubeRT=new THREE.WebGLCubeRenderTarget(64,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
const cubeCam=new THREE.CubeCamera(0.1,30,cubeRT);
const envS=new THREE.Scene();
envS.add(new THREE.HemisphereLight(0x8899cc,0x110808,2.5));
const eD1=new THREE.DirectionalLight(0xaabbdd,5.0);eD1.position.set(-2,4,2);envS.add(eD1);
const eD2=new THREE.DirectionalLight(0x330011,2.5);eD2.position.set(2,-1,-3);envS.add(eD2);
cubeCam.update(R,envS);
SC.environment=cubeRT.texture;

// 조명 — 냉색 키, 크림슨 림
const keyL=new THREE.DirectionalLight(0xaaccff,4.0);
keyL.position.set(-1.5,6,3);keyL.castShadow=true;
keyL.shadow.mapSize.set(512,512);
keyL.shadow.camera.near=0.1;keyL.shadow.camera.far=18;
keyL.shadow.camera.left=keyL.shadow.camera.bottom=-3;
keyL.shadow.camera.right=keyL.shadow.camera.top=3;
keyL.shadow.bias=-0.001;SC.add(keyL);
const rimL=new THREE.DirectionalLight(0xcc0033,3.5);rimL.position.set(2,1,-3);SC.add(rimL);
const topL=new THREE.DirectionalLight(0x6688aa,1.2);topL.position.set(0,5,0);SC.add(topL);
SC.add(new THREE.HemisphereLight(0x0a1020,0x080204,0.8));
// 개봉용 포인트라이트
const iL1=new THREE.PointLight(0xff3300,0,4);iL1.position.set(0,0.9,0.3);SC.add(iL1);
const iL2=new THREE.PointLight(0xff6600,0,8);iL2.position.set(0,3,0);SC.add(iL2);
// 룬 주변광 (크림슨)
const runeL=new THREE.PointLight(0xcc1100,1.2,2.5);runeL.position.set(0,0.42,0.85);SC.add(runeL);

// ===== 재질 — 고딕 에이지드 철/석재 (은색 금지) =====
const mStone=new THREE.MeshStandardMaterial({color:0x1a1c1e,roughness:0.94,metalness:0.0,envMapIntensity:0.1});
const mIron=new THREE.MeshStandardMaterial({color:0x191614,roughness:0.75,metalness:0.40,envMapIntensity:0.6});
const mPewter=new THREE.MeshStandardMaterial({color:0x252220,roughness:0.65,metalness:0.50,envMapIntensity:0.7});
const mAccent=new THREE.MeshStandardMaterial({color:0x1e1a10,roughness:0.80,metalness:0.30,envMapIntensity:0.4,emissive:new THREE.Color(0x080402),emissiveIntensity:0.5});
const mInside=new THREE.MeshStandardMaterial({color:0x0a0200,roughness:1.0,metalness:0.0});
const mGlow=new THREE.MeshBasicMaterial({color:0xff2200,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});

// 크림슨 룬 텍스처 (Vegvisir)
const runeC=document.createElement('canvas');runeC.width=runeC.height=128;
const rc=runeC.getContext('2d');
rc.fillStyle='#000';rc.fillRect(0,0,128,128);
rc.strokeStyle='#fff';rc.lineCap='round';rc.lineJoin='round';
rc.lineWidth=2.5;rc.beginPath();rc.arc(64,64,60,0,Math.PI*2);rc.stroke();
rc.lineWidth=1.2;rc.beginPath();rc.arc(64,64,56,0,Math.PI*2);rc.stroke();
rc.lineWidth=1.8;rc.beginPath();rc.arc(64,64,34,0,Math.PI*2);rc.stroke();
rc.lineWidth=1.2;rc.beginPath();rc.arc(64,64,14,0,Math.PI*2);rc.stroke();
rc.lineWidth=3.0;
for(let i=0;i<8;i++){
  const a=i*Math.PI/4-Math.PI/2;
  rc.beginPath();rc.moveTo(64+Math.cos(a)*16,64+Math.sin(a)*16);
  rc.lineTo(64+Math.cos(a)*56,64+Math.sin(a)*56);rc.stroke();
  const bx=64+Math.cos(a)*42,by=64+Math.sin(a)*42;
  const px=Math.cos(a+Math.PI/2)*5.5,py=Math.sin(a+Math.PI/2)*5.5;
  rc.lineWidth=1.8;rc.beginPath();rc.moveTo(bx-px,by-py);rc.lineTo(bx+px,by+py);rc.stroke();
  if(i%2===0){rc.beginPath();rc.moveTo(bx,by);rc.lineTo(bx+Math.cos(a)*7,by+Math.sin(a)*7);rc.stroke();}
  rc.lineWidth=3.0;
}
rc.lineWidth=2;
for(let i=0;i<6;i++){const a=i*Math.PI/3,a2=a+Math.PI/3;rc.beginPath();rc.moveTo(64+Math.cos(a)*12,64+Math.sin(a)*12);rc.lineTo(64+Math.cos(a2)*12,64+Math.sin(a2)*12);rc.stroke();}
const runeTex=new THREE.CanvasTexture(runeC);
// MeshBasicMaterial — 크림슨 glow
const mRune=new THREE.MeshBasicMaterial({
  map:runeTex,color:new THREE.Color(0xff2200),
  transparent:true,alphaMap:runeTex,
  blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
});
let _runeOp=0.9;

// ===== 지오메트리 =====
const ROOT=new THREE.Group();SC.add(ROOT);ROOT.rotation.y=-0.2;

// === 본체 (다크 석재) ===
const bodyM=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.88,1.3),mStone);
bodyM.position.y=0.44;bodyM.castShadow=true;bodyM.receiveShadow=true;ROOT.add(bodyM);

// 내부
const ins=new THREE.Mesh(new THREE.BoxGeometry(1.65,0.72,1.0),mInside);
ins.position.set(0,0.49,0);ROOT.add(ins);
const glowMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.9),mGlow);
glowMesh.position.set(0,0.875,0);glowMesh.rotation.x=-Math.PI/2;ROOT.add(glowMesh);

// === 원기둥 코너 기둥 (직각 없앰) ===
const colH=0.94,colR=0.10;
[[-0.98,0.63],[0.98,0.63],[-0.98,-0.63],[0.98,-0.63]].forEach(co=>{
  const col=new THREE.Mesh(new THREE.CylinderGeometry(colR,colR,colH,12),mIron);
  col.position.set(co[0],0.47,co[1]);col.castShadow=true;ROOT.add(col);
  // 상단 캡 (구체)
  const cap=new THREE.Mesh(new THREE.SphereGeometry(colR,12,8),mPewter);
  cap.position.set(co[0],colH,co[1]);ROOT.add(cap);
  // 하단 베이스
  const base=new THREE.Mesh(new THREE.CylinderGeometry(colR+0.02,colR+0.04,0.06,12),mPewter);
  base.position.set(co[0],0.03,co[1]);ROOT.add(base);
});

// 수평 철 밴드 3줄
[0.14,0.44,0.74].forEach(by=>{
  const b=new THREE.Mesh(new THREE.BoxGeometry(1.98,0.065,1.32),mIron);
  b.position.set(0,by,0);ROOT.add(b);
  // 밴드 위 얇은 하이라이트
  const h=new THREE.Mesh(new THREE.BoxGeometry(2.0,0.018,1.34),mPewter);
  h.position.set(0,by+0.038,0);ROOT.add(h);
});

// 앞면 장식판 (어두운 철)
const fPlate=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.62,0.04),mIron);
fPlate.position.set(0,0.44,0.665);ROOT.add(fPlate);
// 장식판 테두리 (pewter)
const fBorder=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.72,0.025),mPewter);
fBorder.position.set(0,0.44,0.658);ROOT.add(fBorder);
// 음각 배경 (더 어두움)
const fInner=new THREE.Mesh(new THREE.BoxGeometry(1.08,0.50,0.032),new THREE.MeshStandardMaterial({color:0x050608,roughness:0.9,metalness:0.1}));
fInner.position.set(0,0.44,0.667);ROOT.add(fInner);
// 룬 패널
const rGfx=new THREE.Mesh(new THREE.PlaneGeometry(0.88,0.48),mRune);
rGfx.position.set(0,0.44,0.695);ROOT.add(rGfx);

// 자물쇠 (원통형 → 덜 직각)
const lkBody=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.32,12),mIron);
lkBody.position.set(0,0.91,0.67);lkBody.rotation.x=Math.PI/2;ROOT.add(lkBody);
const lkRing=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.022,8,20,Math.PI),mPewter);
lkRing.position.set(0,1.02,0.67);lkRing.rotation.z=Math.PI;ROOT.add(lkRing);
const lkKeyH=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.08,10),mAccent);
lkKeyH.position.set(0,0.91,0.69);lkKeyH.rotation.x=Math.PI/2;ROOT.add(lkKeyH);

// 리벳 (원형)
const rivG=new THREE.SphereGeometry(0.032,8,6);
[-0.88,0.88].forEach(bx=>[0.14,0.44,0.74].forEach(by=>{
  [-0.60,0.60].forEach(bz=>{
    const rv=new THREE.Mesh(rivG,mPewter);rv.position.set(bx,by+0.038,bz);ROOT.add(rv);
  });
  const rvf=new THREE.Mesh(rivG,mPewter);rvf.position.set(bx,by+0.038,0.67);ROOT.add(rvf);
}));

// 바닥 베이스 (조금 더 넓게)
const baseM=new THREE.Mesh(new THREE.BoxGeometry(2.06,0.06,1.36),mPewter);
baseM.position.set(0,0.03,0);ROOT.add(baseM);

// === LID — A프레임 피라미드형 뚜껑 ===
const LID=new THREE.Group();LID.position.set(0,0.88,-0.65);ROOT.add(LID);

// 뚜껑 플랫 베이스
const lidFlat=new THREE.Mesh(new THREE.BoxGeometry(2.02,0.10,1.32),mStone);
lidFlat.position.set(0,0.05,0.66);lidFlat.castShadow=true;LID.add(lidFlat);

// A프레임 왼쪽 패널
const lPanel=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.06,1.30),mStone);
lPanel.position.set(-0.50,0.16,0.66);
lPanel.rotation.z=Math.PI/5.5; // ~33도
lPanel.castShadow=true;LID.add(lPanel);

// A프레임 오른쪽 패널
const rPanel=new THREE.Mesh(new THREE.BoxGeometry(1.05,0.06,1.30),mStone);
rPanel.position.set(0.50,0.16,0.66);
rPanel.rotation.z=-Math.PI/5.5;
rPanel.castShadow=true;LID.add(rPanel);

// 능선 (ridge) — 피라미드 꼭대기
const ridge=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.32,10),mPewter);
ridge.rotation.x=Math.PI/2;ridge.position.set(0,0.31,0.66);LID.add(ridge);

// 뚜껑 앞면 삼각 마감
const triShape=new THREE.Shape();
triShape.moveTo(-1.0,0);triShape.lineTo(1.0,0);triShape.lineTo(0,0.30);triShape.closePath();
const triGeo=new THREE.ShapeGeometry(triShape);
const triMesh=new THREE.Mesh(triGeo,mStone);
triMesh.position.set(0,0.06,1.32);LID.add(triMesh);
const triMesh2=triMesh.clone();triMesh2.position.set(0,0.06,0);triMesh2.rotation.y=Math.PI;LID.add(triMesh2);

// 뚜껑 앞 테두리 (pewter)
const lidFront=new THREE.Mesh(new THREE.BoxGeometry(2.04,0.11,0.05),mPewter);
lidFront.position.set(0,0.05,1.33);LID.add(lidFront);

// 뚜껑 코너 캡
[[-1.0,0.66],[1.0,0.66],[-1.0,0],[1.0,0]].forEach(co=>{
  const c=new THREE.Mesh(new THREE.SphereGeometry(0.065,10,8),mPewter);
  c.position.set(co[0],0.06,co[1]);LID.add(c);
});

// 힌지 (원통형)
[-0.65,0.65].forEach(hx=>{
  const hg=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.22,10),mIron);
  hg.rotation.z=Math.PI/2;hg.position.set(hx,0.06,-0.01);LID.add(hg);
  const hb=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.045,0.22,10),mIron);
  hb.rotation.z=Math.PI/2;hb.position.set(hx,0.87,-0.65,);ROOT.add(hb);
});

// 그림자 바닥
const flr=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({color:0,transparent:true,opacity:0,roughness:1}));
flr.rotation.x=-Math.PI/2;flr.position.y=-0.005;flr.receiveShadow=true;SC.add(flr);

// 파티클 (크림슨)
const parts=[];
for(let i=0;i<16;i++){
  const pm=new THREE.MeshBasicMaterial({
    color:new THREE.Color().setHSL(0.02+Math.random()*0.05,1.0,0.55+Math.random()*0.2),
    transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
  });
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1,1),pm);
  const sz=0.04+Math.random()*0.06;p.scale.setScalar(sz);
  p.userData={angle:Math.random()*Math.PI*2,r:0.5+Math.random()*0.8,
    yOff:Math.random()*1.0,ySpd:0.10+Math.random()*0.20,
    aSpd:(0.20+Math.random()*0.28)*(Math.random()<0.5?1:-1),phase:Math.random()*Math.PI*2};
  p.visible=false;SC.add(p);parts.push(p);
}

// 상태 기계
let _st='hidden',_timer=0,_lidAng=0,_wx=0,_wy=0;
function _reset(){
  LID.rotation.x=0;ROOT.position.set(0,0,0);ROOT.rotation.set(0,-0.2,0);
  mRune.opacity=_runeOp=0.9;mGlow.opacity=0;
  iL1.intensity=0;iL2.intensity=0;runeL.intensity=0.3;
  parts.forEach(p=>{p.visible=false;p.material.opacity=0;});
}
window._chest3d={
  show(wx,wy){_wx=wx;_wy=wy;_st='idle';_timer=0;_lidAng=0;_reset();CVS.style.display='block';},
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
  parts.forEach((p,i)=>{
    const u=p.userData;
    if(_st==='idle'||_st==='rattling'){
      p.visible=true;u.angle+=dt*u.aSpd;
      const y0=0.05+((u.yOff+_timer*u.ySpd)%1.1);
      p.position.set(Math.cos(u.angle)*u.r,y0,Math.sin(u.angle)*u.r*0.4);
      p.lookAt(CAM.position);
      p.material.opacity=(_st==='rattling'?0.8:0.4)+Math.sin(_timer*1.8+u.phase)*0.15;
    }else if(_st==='opening'&&_timer<0.5){
      p.visible=true;p.material.opacity=Math.max(0,(0.5-_timer)*1.8);
    }else{p.visible=false;}
  });

  if(_st==='idle'){
    ROOT.position.y=Math.sin(_timer*1.4)*0.025;
    ROOT.rotation.y=-0.2+Math.sin(_timer*0.5)*0.035;
    _runeOp=0.75+Math.sin(_timer*2.4)*0.22;mRune.opacity=_runeOp;
    runeL.intensity=0.3+Math.sin(_timer*2.4)*0.18;
  }else if(_st==='rattling'){
    const rp=Math.min(1,_timer*2.2);
    ROOT.position.x=Math.sin(_timer*46)*0.04*rp;
    ROOT.position.y=Math.abs(Math.sin(_timer*42))*0.025*rp;
    ROOT.rotation.z=Math.sin(_timer*44)*0.022*rp;ROOT.rotation.y=-0.2;
    const lk=Math.min(1,_timer*1.8);
    iL1.intensity=lk*1.5;mGlow.opacity=lk*0.28;
    mRune.opacity=0.9+lk*0.1;runeL.intensity=0.3+lk*1.5;
    if(_timer>.55){_st='opening';_timer=0;if(typeof shake==='function')shake(14);}
  }else if(_st==='opening'){
    const t=Math.min(1,_timer/1.1),ease=1-(1-t)*(1-t)*(1-t);
    _lidAng=-Math.PI*.82*ease;LID.rotation.x=_lidAng;
    ROOT.position.x=0;ROOT.rotation.z=0;ROOT.rotation.y=-0.2;
    const bst=Math.min(1,_timer/.35),fad=_timer>.5?1-Math.min(1,(_timer-.5)/1.0):1;
    iL1.intensity=bst*fad*14;iL2.intensity=bst*fad*7;
    mGlow.opacity=bst*fad*1.1;mRune.opacity=0.9+bst*0.1;
    runeL.intensity=0.3+bst*2.5*fad;
    if(_timer>=1.4){_st='open';_timer=0;LID.rotation.x=-Math.PI*.82;}
  }else if(_st==='open'){
    ROOT.position.y=Math.sin(_timer*1.0)*0.012;ROOT.rotation.y=-0.2;
    iL1.intensity=Math.max(0,5.0-_timer*1.8);
    iL2.intensity=Math.max(0,2.5-_timer*1.2);
    mGlow.opacity=Math.max(0,.55-_timer*.25);
    mRune.opacity=0.75+Math.sin(_timer*2.0)*0.18;
    runeL.intensity=Math.max(0,0.3-_timer*0.08);
    if(_timer>5.0){_st='hidden';CVS.style.display='none';}
  }
  R.render(SC,CAM);
}
tick();
console.log('[CHEST3D] GOW v5 gothic-iron');
})();
