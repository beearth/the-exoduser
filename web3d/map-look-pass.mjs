import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {mapLookLayout,holeLights,effectLights,renderEnergy,foregroundPose} from './map-look-layout.mjs';
import {seeded,applyAffine} from './living-layout.mjs';

// A snapshot of the native environment BEFORE actors/VFX/HUD is the albedo.
// Lighting never substitutes terrain art or recolors an actor sprite.
export function createMapLook(renderer,canvas,shared,data,anchors){
 const plan=mapLookLayout(data,anchors),scene=new THREE.Scene(),camera=new THREE.Camera();
 const frameTexture=new THREE.Texture();frameTexture.colorSpace=THREE.NoColorSpace;
 frameTexture.minFilter=frameTexture.magFilter=THREE.LinearFilter;frameTexture.generateMipmaps=false;
 const lights=Array.from({length:40},()=>new THREE.Vector4(-1e5,-1e5,1,0)),colors=lights.map(()=>new THREE.Vector3());
 const shafts=plan.shafts.map(s=>new THREE.Vector4(...s.position,s.width,s.length));
 const u={...shared,frameArt:{value:frameTexture},pixel:{value:new THREE.Vector2()},lights:{value:lights},colors:{value:colors},shafts:{value:shafts},ambient:{value:new THREE.Vector3()},flash:{value:0},lightCount:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms:u,depthTest:false,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D frameArt;uniform vec2 pixel;uniform vec4 view;uniform vec4 lights[40],shafts[8];uniform vec3 colors[40],ambient;uniform float time,flash;uniform int lightCount;varying vec2 vUv;
   float lum(vec2 uv){return dot(texture2D(frameArt,uv).rgb,vec3(.299,.587,.114));}
   void main(){vec4 original=texture2D(frameArt,vUv);vec2 world=view.xy+vec2(vUv.x,1.-vUv.y)*view.zw;
    vec2 e=pixel*1.5;vec3 normal=normalize(vec3((lum(vUv-vec2(e.x,0.))-lum(vUv+vec2(e.x,0.)))*2.8,(lum(vUv-vec2(0.,e.y))-lum(vUv+vec2(0.,e.y)))*2.8,1.));
    float cloud=.5+.24*sin(world.x*.002+world.y*.0012-time*.055)+.18*sin(world.y*.003-world.x*.0007-time*.037);
    vec3 added=ambient*(.55+.45*(1.-smoothstep(.25,.9,cloud)))+vec3(.07,.09,.14)*flash;
    for(int i=0;i<40;i++){if(i>=lightCount)break;vec2 delta=lights[i].xy-world;float d=length(delta)/lights[i].z;if(d>=1.)continue;
     float fall=pow(max(0.,1.-d*d),2.);vec3 dir=normalize(vec3(delta.x,-delta.y,lights[i].z*.45));
     float bump=.28+.72*max(0.,dot(normal,dir));added+=colors[i]*lights[i].w*fall*bump;}
    for(int i=0;i<8;i++){vec2 q=world-shafts[i].xy;float co=.848048,si=-.529919;vec2 p=vec2(co*q.x+si*q.y,-si*q.x+co*q.y);float v=p.y/shafts[i].w+.5;
     float along=smoothstep(0.,.25,v)*( .55+.45*smoothstep(.55,.9,v))*(1.-smoothstep(.9,1.,v));
     float across=pow(1.-smoothstep(0.,1.,abs(p.x)/shafts[i].z*2.),1.6);
     added+=vec3(.88,.84,.74)*.17*along*across*(.75+.25*sin(time*.37+float(i)*1.7));}
    // Additive reflectance with the original image underneath; no ambient dimmer.
    vec3 albedo=max(original.rgb,vec3(.035));vec3 color=original.rgb+added*(.10+albedo*.95);
    gl_FragColor=vec4(clamp(color,0.,1.),original.a);
   }`});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 const silhouettes=new Map(),shadowStamps=new Map(),dot=document.createElement('canvas');dot.width=dot.height=32;
 const dc=dot.getContext('2d'),dg=dc.createRadialGradient(16,16,0,16,16,16);dg.addColorStop(0,'rgba(255,255,255,1)');dg.addColorStop(.4,'rgba(255,255,255,.45)');dg.addColorStop(1,'rgba(255,255,255,0)');dc.fillStyle=dg;dc.fillRect(0,0,32,32);
 const darkDot=document.createElement('canvas');darkDot.width=darkDot.height=32;const dx=darkDot.getContext('2d');dx.drawImage(dot,0,0);dx.globalCompositeOperation='source-in';dx.fillStyle='#020204';dx.fillRect(0,0,32,32);
 let holeRows=[],lastHoles=-1,region=[...data.ambient],lastTime=0,flashNext=8,flashLeft=0,flashIndex=0;
 const stats={mapLook:true,authoredLights:plan.lights.length+1,authoredShadows:plan.shadows.length,foregroundTotal:plan.foreground.length,shaftTotal:plan.shafts.length,occluders:plan.occluders.length,fxLights:0,holeLights:0};
 const visible=(x,y,r,v)=>x+r>v.x&&x-r<v.x+v.w&&y+r>v.y&&y-r<v.y+v.h;
 const imageFor=(name,s)=>{const p=anchors.props.find(p=>p.texture.endsWith('/'+name));return p?s.images[p.id]:null;};
 function stamp(im,blur,tint,cache){
  if(cache.has(im))return cache.get(im);const c=document.createElement('canvas');c.width=c.height=384;const x=c.getContext('2d');
  x.filter=`blur(${blur*384/800}px)`;x.drawImage(im,16,16,352,352);x.filter='none';x.globalCompositeOperation='source-in';x.fillStyle=tint;x.fillRect(0,0,384,384);cache.set(im,c);return c;
 }
 function foreground(ctx,s,view){
  let n=0;ctx.save();
  for(const row of plan.foreground){const pose=foregroundPose(row,s.G.cam,s.P,false,data.foreground.parallax),[x,y]=pose.position;
   if(!visible(x,y,row.size,view))continue;const im=imageFor(row.texture,s);if(!im?.naturalWidth)continue;
   const walk=s.G.map[Math.floor(y/s.tile)]?.[Math.floor(x/s.tile)]===0;
   ctx.save();ctx.translate(x,y);ctx.rotate(row.rotation);ctx.scale(row.flip?-1:1,1);ctx.globalAlpha=walk?pose.alpha*.35:pose.alpha;
   ctx.drawImage(stamp(im,data.foreground.blur_px,'#060609',silhouettes),-row.size/2,-row.size/2,row.size,row.size);ctx.restore();n++;
  }ctx.restore();stats.foreground=n;
 }
 function shadows(ctx,s,view){
  let n=0;ctx.save();
  for(const p of plan.shadows){const [x,y]=p.position,[w,h]=p.draw_size;if(!visible(x,y,Math.max(w,h),view))continue;const im=s.images[p.id];if(!im?.naturalWidth)continue;
   const c=stamp(im,data.prop_shadow.blur_px,'#030305',shadowStamps),upright=data.prop_shadow.upright_textures.includes(p.texture.split('/').pop());
   ctx.save();ctx.globalAlpha=data.prop_shadow.tint[3]*.7;
   if(upright){ctx.translate(x+w*.05,y+h*.5);applyAffine(ctx,1,0,.62,-.42);ctx.drawImage(c,-w*.5,-h*.5,w,h);}
   else ctx.drawImage(c,x-w*p.pivot[0]+w*.08,y-h*p.pivot[1]+h*.06,w,h);
   ctx.restore();n++;
  }
  // Root occlusion follows the nearest shadow-casting player/camp light.
  for(const o of plan.occluders){const [x,y]=o.position,[rx,ry]=o.radii;if(!visible(x,y,300,view))continue;
   const camp=plan.lights.find(l=>l.id==='camp_fire'),source=camp&&Math.hypot(x-camp.position[0],y-camp.position[1])<640?camp.position:[s.P.x,s.P.y-20];
   const angle=Math.atan2(y-source[1],x-source[0]);ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=.19;ctx.drawImage(darkDot,-rx*.5,-ry,rx*3,ry*2);ctx.restore();
  }ctx.restore();stats.shadows=n;
 }
 function update(s,view){
  const time=s.now/1000,dt=lastTime?Math.max(0,Math.min(.1,time-lastTime)):1/60;lastTime=time;
  if(time-lastHoles>.5||lastHoles<0){holeRows=holeLights(data,s.G.spawnHoles);lastHoles=time;}
  const fx=effectLights(data,s.projectiles,s.blasts),player={...data.player_light,id:'player',position:[s.P.x,s.P.y-20]};
  const rows=[player,...fx,...plan.lights,...holeRows].filter(l=>visible(...l.position,l.radius,view));
  let count=0;for(const l of rows.slice(0,40)){lights[count].set(...l.position,l.radius,renderEnergy(l,time));colors[count].set(...l.color);count++;}u.lightCount.value=count;
  const idx=(s.P.y/s.tile<(s.G._regMidY||100)?0:2)+(s.P.x/s.tile<(s.G._regMidX||100)?0:1);
  region=region.map((v,i)=>v+(data.region_ambient[idx][i]-v)*Math.min(1,dt*.6));u.ambient.value.set(...region.map(v=>v*.018));
  if(idx===data.lightning.region){flashNext-=dt;if(flashNext<=0){flashLeft=data.lightning.duration;flashNext=7+(Math.sin(++flashIndex*127.1)*.5+.5)*9;}}
  flashLeft=Math.max(0,flashLeft-dt);const t=1-flashLeft/data.lightning.duration;
  u.flash.value=flashLeft?Math.max(0,Math.sin(t*Math.PI*4))*(t<.5?1:.6)*data.lightning.strength:0;
  Object.assign(stats,{lights:count,fxLights:fx.length,holeLights:holeRows.length,region:idx});
 }
 function draw(ctx,s,view){
  if(!s.frame||!s.flush)return;update(s,view);s.flush();
  frameTexture.image=s.frame;frameTexture.needsUpdate=true;u.pixel.value.set(1/s.frame.width,1/s.frame.height);
  shared.view.value.set(view.x,view.y,view.w,view.h);shared.time.value=s.now/1000;
  renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;
  ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
 }
 function motes(ctx,s,view,low){
  const rnd=seeded(20261020),time=s.now/1000;let count=0;
  const drawDot=(x,y,size,color,alpha)=>{ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,size,size*.7,0,0,Math.PI*2);ctx.fill();ctx.restore();count++;};
  // A world-anchored tiled field: panning never attaches particles to the camera.
  for(let i=0;i<(low?18:data.spores.amount);i++){
   const phase=rnd()*Math.PI*2,bx=rnd()*2320,by=rnd()*1360,r=data.spores.size[0]+rnd()*(data.spores.size[1]-data.spores.size[0]);
   for(let cy=Math.floor(view.y/1360)-1;cy<=Math.floor((view.y+view.h)/1360);cy++)for(let cx=Math.floor(view.x/2320)-1;cx<=Math.floor((view.x+view.w)/2320);cx++){
    const x=cx*2320+(bx+time*5+Math.sin(time*.3+phase)*10)%2320,y=cy*1360+((by-time*7)%1360+1360)%1360;if(visible(x,y,r,view))drawDot(x,y,r*.22,'#b1b89a',.06+.10*(.5+.5*Math.sin(time*.6+phase)));
   }
  }
  const camp=plan.lights.find(l=>l.id==='camp_fire');
  if(visible(...camp.position,250,view))for(let i=0;i<(low?12:data.embers.amount);i++){
   const phase=i*.618,age=(time/data.embers.lifetime+phase)%1,x=camp.position[0]+Math.sin(i*37)*46+Math.sin(time+i)*age*20,y=camp.position[1]-16-age*170;
   drawDot(x,y,1+Math.sin(i*17)**2,'#df9d60',Math.sin(age*Math.PI)*.55);
  }
  for(const sh of plan.shafts){if(!visible(...sh.position,sh.length,view))continue;
   for(let i=0;i<(low?4:data.light_shafts.dust);i++){const age=(time*.035+i*.618)%1,a=Math.sin(i*23)*sh.width*.3,b=(age-.5)*sh.length*.72,co=Math.cos(sh.angle),si=Math.sin(sh.angle);
    drawDot(sh.position[0]+a*co-b*si,sh.position[1]+a*si+b*co,1.1,'#d5ceb5',Math.sin(age*Math.PI)*.19);}
  }stats.particles=count;
 }
 return {surface:(ctx,s,v)=>{foreground(ctx,s,v);shadows(ctx,s,v);},draw,motes,snapshot:()=>({...stats})};
}
