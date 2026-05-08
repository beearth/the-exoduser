(function(){
'use strict';
var CVS=document.getElementById('chest3dCvs');
if(!CVS||typeof THREE==='undefined')return;

// === 프로시저럴 텍스처 ===
function mkTex(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}

var wTex=mkTex(512,512,function(ctx,w,h){
  ctx.fillStyle='#150800';ctx.fillRect(0,0,w,h);
  for(var i=0;i<90;i++){
    var y=Math.random()*h,al=0.04+Math.random()*0.20;
    var r=60+~~(Math.random()*35),g=22+~~(Math.random()*16);
    ctx.strokeStyle='rgba('+r+','+g+',3,'+al+')';
    ctx.lineWidth=Math.random()<0.1?2.5:1;ctx.beginPath();ctx.moveTo(0,y);
    for(var x=0;x<w;x+=4)ctx.lineTo(x,y+Math.sin(x*.044+i*.9)*5.5+Math.sin(x*.13+i*.4)*2.5);
    ctx.stroke();
  }
  for(var i=0;i<22;i++){
    ctx.strokeStyle='rgba(115,48,8,0.055)';ctx.lineWidth=5+Math.random()*4;
    ctx.beginPath();var y=Math.random()*h;ctx.moveTo(0,y);
    for(var x=0;x<w;x+=8)ctx.lineTo(x,y+Math.sin(x*.022+i*.55)*8);ctx.stroke();
  }
  for(var i=0;i<3;i++){
    var kx=80+Math.random()*352,ky=80+Math.random()*352;
    ctx.strokeStyle='rgba(18,5,0,0.45)';ctx.lineWidth=1.2;
    for(var r=3;r<24;r+=4){ctx.beginPath();ctx.ellipse(kx,ky,r,r*.48+Math.random()*2.5,Math.random()*.7,0,Math.PI*2);ctx.stroke();}
  }
});

var iTex=mkTex(512,512,function(ctx,w,h){
  ctx.fillStyle='#0e0d0b';ctx.fillRect(0,0,w,h);
  for(var i=0;i<350;i++){
    var y=Math.random()*h,b=30+~~(Math.random()*65);
    ctx.strokeStyle='rgba('+b+','+(b-5)+','+(b-9)+',0.10)';
    ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(0,y+(Math.random()-.5)*1.2);ctx.lineTo(w,y+(Math.random()-.5)*1.2);ctx.stroke();
  }
  for(var i=0;i<30;i++){
    var sx=Math.random()*w,sy=Math.random()*h,ln=15+Math.random()*130;
    ctx.strokeStyle='rgba(105,88,65,0.22)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+ln*(Math.random()-.5)*.35,sy+ln*(Math.random()-.5)*.1);ctx.stroke();
  }
});

var gTex=mkTex(256,256,function(ctx,w,h){
  var g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,'#c8a008');g.addColorStop(.18,'#f5c41c');g.addColorStop(.42,'#b88000');
  g.addColorStop(.72,'#7c5200');g.addColorStop(1,'#b08012');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(var i=0;i<55;i++){ctx.strokeStyle='rgba(255,235,95,0.08)';ctx.lineWidth=1;var y=Math.random()*h;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y+(Math.random()-.5)*5);ctx.stroke();}
  ctx.strokeStyle='rgba(30,10,0,0.5)';ctx.lineWidth=1.5;
  for(var i=0;i<7;i++){var y=i*35+15;ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(248,y);ctx.stroke();}
  var eg=ctx.createRadialGradient(w/2,h/2,w*.25,w/2,h/2,w*.72);
  eg.addColorStop(0,'rgba(0,0,0,0)');eg.addColorStop(1,'rgba(0,0,0,0.35)');
  ctx.fillStyle=eg;ctx.fillRect(0,0,w,h);
});

var rTex=mkTex(256,256,function(ctx,w,h){
  ctx.fillStyle='#000000';ctx.fillRect(0,0,w,h);
  ctx.lineCap='round';ctx.lineJoin='round';
  ctx.strokeStyle='rgba(80,130,255,0.7)';ctx.lineWidth=2.5;ctx.strokeRect(8,8,240,240);
  ctx.strokeStyle='rgba(55,90,220,0.45)';ctx.lineWidth=1.5;ctx.strokeRect(14,14,228,228);
  ctx.strokeStyle='rgba(100,165,255,0.95)';ctx.lineWidth=6;
  var segs=[[128,32,128,224],[128,32,175,82],[128,32,81,82],[128,106,172,60],[128,106,84,60],[62,128,194,128],[78,176,178,176],[86,84,86,180],[170,84,170,180],[86,132,128,106],[170,132,128,106]];
  segs.forEach(function(s){ctx.beginPath();ctx.moveTo(s[0],s[1]);ctx.lineTo(s[2],s[3]);ctx.stroke();});
  ctx.strokeStyle='rgba(60,100,210,0.7)';ctx.lineWidth=2.5;
  [[30,30],[226,30],[30,226],[226,226]].forEach(function(p){
    ctx.beginPath();ctx.moveTo(p[0],p[1]-11);ctx.lineTo(p[0],p[1]+11);ctx.moveTo(p[0]-11,p[1]);ctx.lineTo(p[0]+11,p[1]);ctx.stroke();
    ctx.beginPath();ctx.moveTo(p[0]-8,p[1]-8);ctx.lineTo(p[0]+8,p[1]+8);ctx.moveTo(p[0]+8,p[1]-8);ctx.lineTo(p[0]-8,p[1]+8);ctx.stroke();
  });
});

// === 렌더러 ===
var SZ=420;
var R=new THREE.WebGLRenderer({canvas:CVS,alpha:true,antialias:true,powerPreference:'high-performance'});
R.setSize(SZ,SZ);R.setPixelRatio(Math.min(devicePixelRatio,2));
CVS.style.width=CVS.style.height=SZ+'px';
R.setClearColor(0,0);R.outputColorSpace=THREE.SRGBColorSpace;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.75;

// === 환경맵 ===
var cubeRT=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
var cubeCamera=new THREE.CubeCamera(0.1,50,cubeRT);
var envS=new THREE.Scene();
envS.add(new THREE.HemisphereLight(0xff9944,0x0a0820,3.5));
var eD1=new THREE.DirectionalLight(0xffcc88,6);eD1.position.set(2,3,1);envS.add(eD1);
var eD2=new THREE.DirectionalLight(0x3366dd,2.5);eD2.position.set(-2,1,-2);envS.add(eD2);
cubeCamera.update(R,envS);
var SC=new THREE.Scene();
SC.environment=cubeRT.texture;
var CAM=new THREE.PerspectiveCamera(38,1,0.01,100);
CAM.position.set(0.28,1.9,3.2);CAM.lookAt(0,0.44,0);

// === 조명 ===
var keyL=new THREE.DirectionalLight(0xffd055,3.8);
keyL.position.set(3.5,8,5);keyL.castShadow=true;
keyL.shadow.mapSize.set(1024,1024);
keyL.shadow.camera.near=0.1;keyL.shadow.camera.far=30;
keyL.shadow.camera.left=keyL.shadow.camera.bottom=-4;
keyL.shadow.camera.right=keyL.shadow.camera.top=4;
keyL.shadow.bias=-0.0004;SC.add(keyL);
var rimL=new THREE.DirectionalLight(0x2255ff,2.2);rimL.position.set(-1.5,3,-5);SC.add(rimL);
var filL=new THREE.DirectionalLight(0xff9944,0.7);filL.position.set(-3,0.4,2);SC.add(filL);
SC.add(new THREE.HemisphereLight(0x180c04,0x030408,0.75));
var iL1=new THREE.PointLight(0xff8822,0,6);iL1.position.set(0,0.9,0.22);SC.add(iL1);
var iL2=new THREE.PointLight(0xffffff,0,12);iL2.position.set(0,3.5,0);SC.add(iL2);
var iL3=new THREE.PointLight(0xffcc44,0,4);iL3.position.set(0,0.65,-0.18);SC.add(iL3);

// === 재질 ===
var mWood=new THREE.MeshStandardMaterial({map:wTex,color:0x3d1904,roughness:0.87,metalness:0.02,envMapIntensity:0.08});
var mIron=new THREE.MeshStandardMaterial({map:iTex,color:0x24180e,roughness:0.32,metalness:0.98,envMapIntensity:1.1});
var mGold=new THREE.MeshStandardMaterial({map:gTex,color:0xcc9500,roughness:0.07,metalness:1.0,emissive:new THREE.Color(0x3e2000),emissiveIntensity:0.8,envMapIntensity:2.2});
var mLock=new THREE.MeshStandardMaterial({map:gTex,color:0xeebb00,roughness:0.04,metalness:1.0,emissive:new THREE.Color(0x4e2c00),emissiveIntensity:1.4,envMapIntensity:2.8});
var mRune=new THREE.MeshStandardMaterial({map:rTex,color:0x040410,roughness:0.38,metalness:0.06,emissive:new THREE.Color(0xffffff),emissiveIntensity:2.8,emissiveMap:rTex});
var mInside=new THREE.MeshStandardMaterial({color:0x040200,roughness:1.0,metalness:0.0});
var mGlow=new THREE.MeshBasicMaterial({color:0xff9922,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});

// === 상자 ===
var ROOT=new THREE.Group();SC.add(ROOT);
var bdy=new THREE.Mesh(new THREE.BoxGeometry(1.9,0.88,1.2),mWood);
bdy.position.y=0.44;bdy.castShadow=bdy.receiveShadow=true;ROOT.add(bdy);
var ins=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.72,0.98),mInside);
ins.position.set(0,0.49,0);ROOT.add(ins);
var glowMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.9),mGlow);
glowMesh.position.set(0,0.878,0);glowMesh.rotation.x=-Math.PI/2;ROOT.add(glowMesh);

var LID=new THREE.Group();LID.position.set(0,0.88,-0.6);ROOT.add(LID);
var lidBase=new THREE.Mesh(new THREE.BoxGeometry(1.92,0.34,1.22),mWood);
lidBase.position.set(0,0.17,0.61);lidBase.castShadow=true;LID.add(lidBase);
var archG=new THREE.CylinderGeometry(0.14,0.14,1.94,18,1,true,0,Math.PI);
var archM=new THREE.Mesh(archG,mWood);
archM.rotation.z=-Math.PI/2;archM.position.set(0,0.31,0.61);LID.add(archM);
var lidMold=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.075,1.24),mGold);
lidMold.position.set(0,0.36,0.61);LID.add(lidMold);
var lidFE=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.38,0.055),mGold);
lidFE.position.set(0,0.17,1.235);LID.add(lidFE);
var archRidge=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.96,10),mGold);
archRidge.rotation.z=Math.PI/2;archRidge.position.set(0,0.44,0.61);LID.add(archRidge);

[0.15,0.44,0.73].forEach(function(by){
  var bnd=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.078,1.24),mIron);bnd.position.set(0,by,0);ROOT.add(bnd);
  var st=new THREE.Mesh(new THREE.BoxGeometry(1.96,0.028,1.26),mGold);st.position.set(0,by+0.046,0);ROOT.add(st);
  [-0.88,0,0.88].forEach(function(bx){[-0.56,0,0.56].forEach(function(bz){
    var rv=new THREE.Mesh(new THREE.SphereGeometry(0.046,10,8),mGold);rv.position.set(bx,by+0.046,bz);ROOT.add(rv);
  });});
});
[0.055,0.27].forEach(function(by){
  var bm=new THREE.Mesh(new THREE.BoxGeometry(1.94,0.072,1.24),mIron);bm.position.set(0,by,0.61);LID.add(bm);
  var st=new THREE.Mesh(new THREE.BoxGeometry(1.96,0.026,1.26),mGold);st.position.set(0,by+0.044,0.61);LID.add(st);
});

var fFrm=new THREE.Mesh(new THREE.BoxGeometry(1.48,0.66,0.045),mIron);fFrm.position.set(0,0.44,0.623);ROOT.add(fFrm);
var fInn=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.52,0.038),mWood);fInn.position.set(0,0.44,0.620);ROOT.add(fInn);
var rPlt=new THREE.Mesh(new THREE.BoxGeometry(0.68,0.42,0.055),mIron);rPlt.position.set(0,0.44,0.635);ROOT.add(rPlt);
var rGfx=new THREE.Mesh(new THREE.PlaneGeometry(0.60,0.36),mRune);rGfx.position.set(0,0.44,0.664);ROOT.add(rGfx);

var lBk=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.42,0.07),mIron);lBk.position.set(0,0.82,0.624);ROOT.add(lBk);
var lHs=new THREE.Mesh(new THREE.BoxGeometry(0.20,0.16,0.11),mGold);lHs.position.set(0,0.78,0.638);ROOT.add(lHs);
var lArc=new THREE.Mesh(new THREE.TorusGeometry(0.078,0.026,14,28,Math.PI),mGold);lArc.position.set(0,0.888,0.638);lArc.rotation.z=Math.PI;ROOT.add(lArc);
var lKey=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.032,0.12,14),mLock);lKey.position.set(0,0.768,0.652);lKey.rotation.x=Math.PI/2;ROOT.add(lKey);
var lSlt=new THREE.Mesh(new THREE.BoxGeometry(0.026,0.055,0.12),mLock);lSlt.position.set(0,0.735,0.652);ROOT.add(lSlt);

[[-0.93,0.6],[0.93,0.6],[-0.93,-0.6],[0.93,-0.6]].forEach(function(co){
  var cl=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.06),mIron);cl.position.set(co[0],0.45,co[1]);ROOT.add(cl);
  [0.12,0.44,0.76].forEach(function(cy){var cb=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.14,0.1),mGold);cb.position.set(co[0],cy,co[1]);ROOT.add(cb);});
});

var flr=new THREE.Mesh(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({color:0,transparent:true,opacity:0,roughness:1}));
flr.rotation.x=-Math.PI/2;flr.position.y=-0.005;flr.receiveShadow=true;SC.add(flr);

// === 상태 기계 ===
var _st='hidden',_timer=0,_lidAng=0,_rotY=-0.32,_wx=0,_wy=0;
function _reset(){LID.rotation.x=0;ROOT.rotation.y=_rotY;ROOT.position.set(0,0,0);ROOT.rotation.z=0;mRune.emissiveIntensity=2.8;mLock.emissiveIntensity=1.4;mGold.emissiveIntensity=0.8;mGlow.opacity=0;iL1.intensity=0;iL2.intensity=0;iL3.intensity=0;}
window._chest3d={
  show:function(wx,wy){_wx=wx;_wy=wy;_st='idle';_timer=0;_lidAng=0;_rotY=-0.32;_reset();CVS.style.display='block';},
  open:function(){if(_st==='idle'||_st==='rattling'){_st='rattling';_timer=0;}},
  hide:function(){_st='hidden';CVS.style.display='none';},
  get active(){return _st!=='hidden';}
};

function updatePos(){
  var c=document.getElementById('c');
  if(!c||typeof G==='undefined'||!G.on)return;
  var sc=(typeof _dpr!=='undefined'?_dpr:devicePixelRatio)*((typeof OPT!=='undefined'&&OPT.resScale)?OPT.resScale/100:1);
  var cssX=(c.width/2+(_wx-G.cam.x))/sc;
  var cssY=(c.height/2+(_wy-G.cam.y))/sc;
  if(cssX<-450||cssX>innerWidth+450||cssY<-500||cssY>innerHeight+450){CVS.style.opacity='0';return;}
  CVS.style.opacity='1';
  CVS.style.left=(cssX-SZ/2)+'px';
  CVS.style.top=(cssY-SZ*.84)+'px';
}

var CLK=new THREE.Clock();
function tick(){
  requestAnimationFrame(tick);
  if(_st==='hidden')return;
  var dt=Math.min(CLK.getDelta(),0.05);_timer+=dt;
  updatePos();
  if(_st==='idle'){
    ROOT.position.y=Math.sin(_timer*1.55)*0.025;_rotY+=dt*0.18;ROOT.rotation.y=_rotY;
    mRune.emissiveIntensity=2.8+Math.sin(_timer*2.9)*0.9;mLock.emissiveIntensity=1.2+Math.sin(_timer*2.3+1)*0.6;mGold.emissiveIntensity=0.75+Math.sin(_timer*1.7)*.18;
  }else if(_st==='rattling'){
    var rp=Math.min(1,_timer*2.3);ROOT.position.x=Math.sin(_timer*44)*0.042*rp;ROOT.position.y=Math.abs(Math.sin(_timer*40))*0.026*rp;ROOT.rotation.z=Math.sin(_timer*42)*0.025*rp;
    var lk=Math.min(1,_timer*2.0);iL1.intensity=lk*1.2;iL3.intensity=lk*0.6;mLock.emissiveIntensity=1.4+lk*3.5;mGold.emissiveIntensity=0.8+lk*2.0;mGlow.opacity=lk*0.22;
    if(_timer>.55){_st='opening';_timer=0;if(typeof shake==='function')shake(14);}
  }else if(_st==='opening'){
    var t=Math.min(1,_timer/1.2),ease=1-(1-t)*(1-t)*(1-t);
    _lidAng=-Math.PI*.82*ease;LID.rotation.x=_lidAng;ROOT.position.x=0;ROOT.rotation.z=0;_rotY+=dt*.12;ROOT.rotation.y=_rotY;
    var bst=Math.min(1,_timer/.5),fad=_timer>.65?1-Math.min(1,(_timer-.65)/.85):1;
    iL1.intensity=bst*fad*12;iL2.intensity=bst*fad*6;iL3.intensity=bst*fad*5;mGlow.opacity=bst*fad*1.0;
    mRune.emissiveIntensity=2.8+bst*5.0*fad;mLock.emissiveIntensity=5.0*bst*fad+0.5;mGold.emissiveIntensity=0.8+bst*4.0*fad;
    if(_timer>=1.45){_st='open';_timer=0;LID.rotation.x=-Math.PI*.82;}
  }else if(_st==='open'){
    _rotY+=dt*.17;ROOT.rotation.y=_rotY;
    iL1.intensity=Math.max(0,4.5-_timer*1.6);iL2.intensity=Math.max(0,2.2-_timer*1.1);iL3.intensity=Math.max(0,2.5-_timer*1.4);
    mGlow.opacity=Math.max(0,.5-_timer*.22);mRune.emissiveIntensity=2.6+Math.sin(_timer*2.4)*.5;mLock.emissiveIntensity=.9;mGold.emissiveIntensity=.75+Math.sin(_timer*1.5)*.15;
    if(_timer>5.0){_st='hidden';CVS.style.display='none';}
  }
  R.render(SC,CAM);
}
tick();
console.log('[CHEST3D] GOW v2 textured+envmap');
})();
