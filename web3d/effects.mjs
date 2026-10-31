const canvases=new WeakMap();
const corpseTimes=new WeakMap();
const full=im=>({x:0,y:0,w:im.naturalWidth||im.width,h:im.naturalHeight||im.height});
const valid=im=>im&&(im.naturalWidth||im.width)>0;

// Only presentation records are consumed. This module never advances a native timer.
export function drawEffects(s,{sprite,viewFacing}){
  const show=(key,img,frame,x,y,scale,alpha=.6,extra={})=>{
    if(!valid(img)||alpha<=0)return;
    sprite(key,img,frame,x,y,scale,{unlit:true,center:true,shadow:false,trim:false,alpha,depthWrite:false,lift:.2,...extra});
  };
  for(const v of s.vfx||[]){const sh=s.sheets[v.id];if(!valid(sh?.img)||v.frame>=v.maxFrames)continue;
    const f=v.frame,alpha=(v.baseAlpha>0?v.baseAlpha:1)*(1-f/v.maxFrames*.3);
    show(v,sh.img,{x:f%sh.cols*sh.fw,y:Math.floor(f/sh.cols)*sh.fh,w:sh.fw,h:sh.fh},v.x,v.y,v.scale,Math.min(.58,alpha),{rotation:-(v.ang||0)});
  }
  for(const im of s.impacts||[]){if(im.t>=im.ml)continue;const source=s.impactSource(im);if(!valid(source.img))continue;
    const f=Math.min(source.frames-1,Math.floor(im.t/im.ml*source.frames)),w=Math.floor(source.img.naturalWidth/source.frames);
    show(im,source.img,{x:f*w,y:0,w,h:w},im.x,im.y,(im.sz||1)*(.8+im.t/im.ml*.6),.5*(1-im.t/im.ml));
  }
  const pool=(list,image,cols,rows,scale=.45)=>{if(!valid(image))return;const w=(image.naturalWidth||image.width)/cols,h=(image.naturalHeight||image.height)/rows;
    for(const v of list||[])if(v.active)show(v,image,{x:v.frame%cols*w,y:Math.floor(v.frame/cols)*h,w,h},v.x,v.y,v.scale,scale,{rotation:-(v.ang||0)});};
  pool(s.hitPool,s.hitImage,9,1);pool(s.elecPool,s.elecImage,3,3);pool(s.darkPool,s.darkImage,5,4);pool(s.lightningPool,s.lightningImage,12,1);
  for(const v of s.mmPool||[])if(v.active&&valid(s.mmImages[v.frame]))show(v,s.mmImages[v.frame],full(s.mmImages[v.frame]),v.x,v.y,v.scale,.45);
  for(const v of s.fire||[])if(valid(s.fireImages[v.frame]))show(v,s.fireImages[v.frame],full(s.fireImages[v.frame]),v.x,v.y,v.scale,.4);
  for(const v of s.tvfx2||[])if(v.delay<=0&&valid(v.img)&&!v.radial){const f=v.frame,p=v.t/(v.total*v.spd);
    show(v,v.img,{x:f%v.cols*v.fw,y:Math.floor(f/v.cols)*v.fh,w:v.fw,h:v.fh},v.x,v.y,v.sc*(1+p*.4),Math.min(.48,(v.alphaMax||.7)*Math.min(1,(1-p)*3)));}
  for(const v of s.tvfxActive||[])if(valid(v.img))show(v,v.img,full(v.img),v.x,v.y,v.sc,Math.min(.45,(v.maxT-v.t)/30));
  for(const v of s.worldItems||[]){if(v.picked)continue;const source=s.itemSource?.(v);if(source?.image)show(v,source.image,full(source.image),v.x,v.y,source.scale,1,{center:false,depthWrite:true});}
  for(const c of s.corpses||[])if(c.active&&valid(c.c)){
    const previous=corpseTimes.get(c),dynamic=previous===undefined||c.t>previous;
    show(c,c.c,full(c.c),c.x,c.y,c.sz/(c.c.width||128),Math.min(1,c.t/(c.mt*.4)),{ground:true,lift:.035,rotation:-c.r,dynamic});corpseTimes.set(c,c.t);
  }
  // Q/E state comes from Core; its disc shares the exact foot anchor and range.
  if(s.qRadius>0){
    let c=canvases.get(s.P);if(!c){c=document.createElement('canvas');c.width=c.height=256;canvases.set(s.P,c);}
    const x=c.getContext('2d');x.clearRect(0,0,256,256);x.lineWidth=2;x.strokeStyle='#bfe8ff';x.globalAlpha=.75;
    x.beginPath();x.arc(128,128,110,0,Math.PI*2);x.stroke();
    show(c,c,full(c),s.P.x,s.P.y,s.qRadius*2/220,.55,{ground:true,lift:.04,dynamic:true});
    if(s.qAura&&['sBlock','peaceShield'].includes(s.P.s))show(s.qAura.image,s.qAura.image,s.qAura.frame,s.P.x,s.P.y,s.qRadius*1.875/s.qAura.frame.w,.42,{ground:true,lift:.035});
  }
}

export function createParticles(THREE,scene){
  const max=1000,geometry=new THREE.BufferGeometry(),pos=new Float32Array(max*3),color=new Float32Array(max*3),size=new Float32Array(max),alpha=new Float32Array(max),kind=new Float32Array(max);
  for(const [name,array,n]of [['position',pos,3],['color',color,3],['size',size,1],['alpha',alpha,1],['kind',kind,1]])geometry.setAttribute(name,new THREE.BufferAttribute(array,n).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{scale:{value:1}},
    vertexShader:`attribute vec3 color;attribute float size,alpha,kind;varying vec3 vColor;varying float vAlpha,vKind;uniform float scale;void main(){vColor=color;vAlpha=alpha;vKind=kind;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=max(1.,size*scale);}`,
    fragmentShader:`varying vec3 vColor;varying float vAlpha,vKind;void main(){vec2 p=gl_PointCoord*2.-1.;float d=length(p),a=1.;if(vKind>.5&&vKind<1.5)a=1.-smoothstep(.65,1.,d);if(vKind>1.5&&vKind<2.5)a=1.-smoothstep(.1,.4,abs(p.x-p.y));if(vKind>2.5)a=(1.-smoothstep(.88,1.,d))*smoothstep(.64,.78,d);gl_FragColor=vec4(vColor,a*vAlpha);}`});
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.renderOrder=1;scene.add(points);const colors=new Map();
  return function update(s,height,camera){
    let n=0;for(let i=0;i<Math.min(max,s.particleCount||0);i++){const p=s.particles[i];if(p.life<=0)continue;
      if(!colors.has(p.col))colors.set(p.col,new THREE.Color(p.col));const c=colors.get(p.col),k=n*3;
      pos[k]=p.x/100;pos[k+1]=height(p.x,p.y)+.12;pos[k+2]=p.y/100;color[k]=c.r;color[k+1]=c.g;color[k+2]=c.b;
      size[n]=p.sz/100*(p.tp===2?3:1);alpha[n]=Math.min(.55,p.life/(p.ml||1)*.55);kind[n]=p.tp||0;n++;
    }
    geometry.setDrawRange(0,n);for(const a of Object.values(geometry.attributes))a.needsUpdate=true;
    material.uniforms.scale.value=s.height/(camera.top-camera.bottom);points.visible=n>0;
  };
}
