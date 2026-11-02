import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {mapLookLayout,holeLights,moatLights,effectLights,renderEnergy,presentationRadius,foregroundPose} from './map-look-layout.mjs?v=20261102-round6';
import {applyAffine} from './living-layout.mjs';
import {lightingGLSL} from './lighting-model.mjs?v=20261102-round6';
import {createFrameSampler} from './frame-sampler.mjs';
import {shadowVector,shadowAffine} from './depth-layout.mjs?v=20261102-round4-final';
import {dynamicLights} from './scene-budget.mjs?v=20261102-round4-final';
import {atmosphereGLSL} from './atmosphere-model.mjs?v=20261102-hue1';

// A snapshot of the native environment BEFORE actors/VFX/HUD is the albedo.
// Lighting never substitutes terrain art or recolors an actor sprite.
export function createMapLook(renderer,canvas,shared,data,anchors){
 const plan=mapLookLayout(data,anchors),scene=new THREE.Scene(),camera=new THREE.Camera();
 const frameSampler=createFrameSampler(frame=>{const t=new THREE.Texture(frame);t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;});
 const emissionSampler=createFrameSampler(frame=>{const t=new THREE.Texture(frame);t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;});
 const transparent=document.createElement('canvas');transparent.width=transparent.height=1;
 const lights=Array.from({length:40},()=>new THREE.Vector4(-1e5,-1e5,1,0)),colors=lights.map(()=>new THREE.Vector3());
 const shafts=plan.shafts.map(s=>new THREE.Vector4(...s.position,s.width,s.length));
 const glow=new Float32Array(40),selfGlow=new Float32Array(40);
 const u={...shared,frameArt:{value:null},nativeEmission:{value:null},emissionMix:{value:0},moat:{value:new THREE.Vector4()},moatBand:{value:new THREE.Vector2()},pixel:{value:new THREE.Vector2()},lights:{value:lights},colors:{value:colors},shafts:{value:shafts},ambient:{value:new THREE.Vector3()},flash:{value:0},lightCount:{value:0},glow:{value:glow},selfGlow:{value:selfGlow},lowFog:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms:u,depthTest:false,depthWrite:false,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform sampler2D frameArt,nativeEmission;uniform vec2 pixel,hero,moatBand;uniform vec4 view,moat;uniform vec4 lights[40],shafts[${plan.shafts.length}];uniform vec3 colors[40],ambient;uniform float time,flash,lowFog,glow[40],selfGlow[40],emissionMix;uniform int lightCount;varying vec2 vUv;
   ${lightingGLSL}
   ${atmosphereGLSL}
   float lum(vec2 uv){return dot(texture2D(frameArt,uv).rgb,vec3(.299,.587,.114));}
   void main(){vec4 original=texture2D(frameArt,vUv);vec2 world=view.xy+vec2(vUv.x,1.-vUv.y)*view.zw;
    vec3 normal=paintedNormal(frameArt,vUv,pixel*1.5);
    float cloud=.5+.24*sin(world.x*.002+world.y*.0012-time*.055)+.18*sin(world.y*.003-world.x*.0007-time*.037);
    vec3 added=vec3(.07,.09,.14)*flash,scattering=vec3(0.),selfEmission=vec3(0.);
    for(int i=0;i<40;i++){if(i>=lightCount)break;vec2 delta=lights[i].xy-world;float d=length(delta)/lights[i].z;if(d>=1.)continue;
     float fall=poolFalloff(d);vec3 dir=normalize(vec3(delta.x,-delta.y,lights[i].z*.45));
     float bump=.28+.72*max(0.,dot(normal,dir));float bloom=glow[i]*exp(-d*d*72.)*.13;added+=colors[i]*lights[i].w*(fall*bump+bloom);selfEmission+=colors[i]*lights[i].w*fall*selfGlow[i];}
    for(int i=0;i<${plan.shafts.length};i++){vec2 q=world-shafts[i].xy;float co=.848048,si=-.529919;vec2 p=vec2(co*q.x+si*q.y,-si*q.x+co*q.y);float v=p.y/shafts[i].w+.5;
     float along=smoothstep(0.,.25,v)*( .55+.45*smoothstep(.55,.9,v))*(1.-smoothstep(.9,1.,v));
     float across=pow(1.-smoothstep(0.,1.,abs(p.x)/shafts[i].z*2.),1.6);
     float wisp=.84+.16*sin(p.y*.012+p.x*.005-time*.24+float(i)*1.7);
     float beam=along*across*wisp*(.75+.25*sin(time*.37+float(i)*1.7));
     added+=vec3(.88,.84,.74)*.035*beam;
     scattering=max(scattering,vec3(.012)*beam);}
    // Cold darkness belongs to environment only. Actors/VFX/HUD draw afterwards.
    vec4 emission=texture2D(nativeEmission,vUv);
    float toxicMaterial=smoothstep(.005,.025,original.g-max(original.r,original.b));
    float waterRadius=length((world-moat.xy)/moat.zw);
    float wet=smoothstep(moatBand.x,moatBand.x+.025,waterRadius)*(1.-smoothstep(moatBand.y-.025,moatBand.y,waterRadius));
    vec3 selfLight=emission.rgb*emission.a*emissionMix+(selfEmission+original.rgb*wet*.4)*toxicMaterial;
    vec3 color=shadeEnvironment(original.rgb,ambient*(.88+.12*(1.-smoothstep(.25,.9,cloud))),added,selfLight)+scattering;
    gl_FragColor=vec4(clamp(forestAtmosphere(clamp(color,0.,1.),original.rgb,world,hero,time,lowFog),0.,1.),original.a);
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
   const light=plan.lights.filter(l=>l.shadow&&Math.hypot(x-l.position[0],y-l.position[1])<presentationRadius(l)).sort((a,b)=>Math.hypot(x-a.position[0],y-a.position[1])-Math.hypot(x-b.position[0],y-b.position[1]))[0];
   const [dx,dy]=shadowVector([x,y],light?.position||[s.P.x,s.P.y-20]);
   if(upright){ctx.translate(x,y+h*(1-p.pivot[1]));applyAffine(ctx,...shadowAffine([dx,dy]));ctx.drawImage(c,-w*.5,-h,w,h);}
   else ctx.drawImage(c,x-w*p.pivot[0]+dx*w*.11,y-h*p.pivot[1]+dy*h*.09,w,h);
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
  u.moat.value.set(s.hill.cx*s.tile,s.hill.cy*s.tile,s.hill.rx*s.tile,s.hill.ry*s.tile);u.moatBand.value.set(s.hill.inner,s.hill.outer);
  if(time-lastHoles>.5||lastHoles<0){holeRows=holeLights(data,s.G.spawnHoles);lastHoles=time;}
  const fx=dynamicLights(data,s.projectiles,s.blasts,s.P,view),player={...data.player_light,id:'player',position:[s.P.x,s.P.y-20]};
  const staticRows=[...moatLights(s.hill,s.tile),...plan.lights,...holeRows].filter(l=>visible(...l.position,presentationRadius(l),view));
  const limit=s.budget?.lightLimit||40,reserve=Math.min(4,Math.floor(limit/4));
  const rows=[player,...fx.slice(0,reserve),...staticRows,...fx.slice(reserve)];
  let count=0;for(const l of rows.slice(0,limit)){lights[count].set(...l.position,presentationRadius(l),renderEnergy(l,time));colors[count].set(...l.color);glow[count]=/toxic|altar|hole|glow|heart|camp_fire/.test(l.id)?1:0;selfGlow[count]=l.self_glow||0;count++;}u.lightCount.value=count;u.lowFog.value=s.budget?.level>=2?1:0;
  const idx=(s.P.y/s.tile<(s.G._regMidY||100)?0:2)+(s.P.x/s.tile<(s.G._regMidX||100)?0:1);
  region=region.map((v,i)=>v+(data.region_ambient[idx][i]-v)*Math.min(1,dt*.6));u.ambient.value.set(...region);
  if(idx===data.lightning.region){flashNext-=dt;if(flashNext<=0){flashLeft=data.lightning.duration;flashNext=7+(Math.sin(++flashIndex*127.1)*.5+.5)*9;}}
  flashLeft=Math.max(0,flashLeft-dt);const t=1-flashLeft/data.lightning.duration;
  u.flash.value=flashLeft?Math.max(0,Math.sin(t*Math.PI*4))*(t<.5?1:.6)*data.lightning.strength:0;
  Object.assign(stats,{lights:count,fxLights:rows.slice(0,limit).filter(l=>l.id==='fx').length,holeLights:holeRows.length,region:idx,groundFogLayers:u.lowFog.value?1:2,normalStrength:3.6,softSourceBloom:true});
 }
 function draw(ctx,s,view){
  if(!s.frame||!s.flush)return;update(s,view);s.flush();
  const probe=window._Web3DFrameProbe;
  if(probe&&!probe.input){probe.view={...view};probe.input=s.frame.toDataURL();}
  u.frameArt.value=frameSampler.update(s.frame);u.pixel.value.set(1/s.frame.width,1/s.frame.height);
  // Keep the original 2D self-glow colors. It is a read-only, additive map;
  // neither the cold ambient nor a nearby red pool is allowed to recolor it.
  u.nativeEmission.value=emissionSampler.update(s.colorLight||transparent);u.emissionMix.value=s.colorLight?s.colorLightMix:0;
  shared.view.value.set(view.x,view.y,view.w,view.h);shared.time.value=s.now/1000;
  renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;
  if(probe&&!probe.output)probe.output=canvas.toDataURL();
  ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
 }
 function motes(){stats.particles=0;stats.fireflies=0;}
 return {surface:(ctx,s,v)=>{foreground(ctx,s,v);shadows(ctx,s,v);},draw,motes,uniforms:u,snapshot:()=>({...stats})};
}
