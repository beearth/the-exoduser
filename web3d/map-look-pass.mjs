import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {mapLookLayout,holeLights,moatLights,effectLights,renderEnergy,presentationRadius} from './map-look-layout.mjs?v=20261102-round6';

import {lightingGLSL} from './lighting-model.mjs?v=20261102-round6';
import {createFrameSampler} from './frame-sampler.mjs';

import {dynamicLights} from './scene-budget.mjs?v=20261102-round4-final';
import {atmosphereGLSL} from './atmosphere-model.mjs?v=20261102-hue1';
import {sceneLightingGLSL} from './scene-lighting-model.mjs';

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
   uniform sampler2D moonShadow;
   ${lightingGLSL}
   ${sceneLightingGLSL}
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
    vec2 shadowUV=vec2((world.x+2400.)/12800.,1.-(world.y+2400.)/12800.);
    float shade=texture2D(moonShadow,shadowUV).a;
    // One NW moon, broken by canopy openings; the long axis follows its SE rays.
    float diagonal=world.x*.78+world.y*.62,across=world.x*.62-world.y*.78;
    float canopy=pow(.5+.5*sin(across*.0038+sin(diagonal*.0007)*1.6),2.);
    float moon=smoothstep(.10,.90,canopy)*(.82+.18*sin(diagonal*.0011));
    float camp=exp(-dot((world-vec2(1820.,4020.))/vec2(440.,340.),(world-vec2(1820.,4020.))/vec2(440.,340.))*1.8);
    float road=exp(-pow((world.x-(3970.+sin(world.y*.0014)*110.))/130.,2.))*smoothstep(4700.,5100.,world.y)*(1.-smoothstep(6800.,7300.,world.y));
    float warm=max(camp,road*.42),heroPool=exp(-dot(world-hero,world-hero)/85000.);
    float contact=exp(-dot((world-hero-vec2(0.,36.))/vec2(24.,8.),(world-hero-vec2(0.,36.))/vec2(24.,8.))*2.5);
    vec3 base=original.rgb;
    // Spatial light uses equal-channel increments, so area-average hue does
    // not drift merely because differently colored patches receive more light.
    vec3 lit=color*sceneExposure(moon,warm,shade,heroPool)*(1.-.40*contact);
    lit+=vec3(.014,.022,.035)*moon+vec3(.10,.043,.006)*warm;
    lit=boundHue(base,lit,10.);
    // Environment-only depth softness: actors and danger marks draw later.
    float edge=smoothstep(.24,.49,abs(vUv.x-.5))*smoothstep(.15,.40,abs(vUv.y-.5));
    float protect=1.-exp(-dot(world-hero,world-hero)/160000.);
    vec3 soft=(texture2D(frameArt,vUv+pixel*2.).rgb+texture2D(frameArt,vUv-pixel*2.).rgb)*.5;
    lit=mix(lit,lit*(dot(soft,vec3(.299,.587,.114))+.01)/(dot(original.rgb,vec3(.299,.587,.114))+.01),edge*protect*.15);
    gl_FragColor=vec4(relightPaint(base,dot(lit,vec3(.299,.587,.114))),original.a);
   }`});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 let holeRows=[],lastHoles=-1,region=[...data.ambient],lastTime=0,flashNext=8,flashLeft=0,flashIndex=0;
 const stats={mapLook:true,authoredLights:plan.lights.length+1,authoredShadows:plan.shadows.length,foregroundTotal:plan.foreground.length,shaftTotal:plan.shafts.length,occluders:plan.occluders.length,fxLights:0,holeLights:0};
 const visible=(x,y,r,v)=>x+r>v.x&&x-r<v.x+v.w&&y+r>v.y&&y-r<v.y+v.h;
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
 return {surface:()=>{},draw,motes,uniforms:u,snapshot:()=>({...stats})};
}
