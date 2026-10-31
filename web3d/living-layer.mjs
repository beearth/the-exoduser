import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {foliageLayout,seeded,waterAt,plantHabitat} from './living-layout.mjs?v=20261031-layer2';
import {createRelief} from './living-relief.mjs?v=20261031-layer2';
import {createMapLook} from './map-look-pass.mjs?v=20261031-maplook1';

// The native map is the color source. This canvas contains ONLY added vegetation
// and water highlights; actors, VFX, camera, lighting and HUD use their original pass.
export async function install(read){
  const canvas=document.createElement('canvas');
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',premultipliedAlpha:true});
  renderer.setClearColor(0,0);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
  const gl=renderer.getContext(),gpu=gl.getExtension('WEBGL_debug_renderer_info');
  const proxy=/swiftshader|llvmpipe|microsoft basic|software/i.test(gpu?gl.getParameter(gpu.UNMASKED_RENDERER_WEBGL):'');
  const scene=new THREE.Scene(),camera=new THREE.Camera();
  const uniforms={view:{value:new THREE.Vector4()},time:{value:0},hero:{value:new THREE.Vector2(-1e5,-1e5)},bend:{value:1},impulse:{value:new THREE.Vector3(-1e5,-1e5,0)}};
  const source=await new THREE.TextureLoader().loadAsync('./assets/web3d/living/rotten-underbrush-atlas.png');
  source.colorSpace=THREE.NoColorSpace;source.minFilter=THREE.LinearFilter;source.magFilter=THREE.LinearFilter;
  const [lookData,lookAnchors]=await Promise.all(['map-look-ch1.json','map-look-anchors.json'].map(async file=>{const r=await fetch('./assets/web3d/'+file);if(!r.ok)throw Error(file+' '+r.status);return r.json();}));
  const mapLook=createMapLook(renderer,canvas,uniforms,lookData,lookAnchors);
  const relief=createRelief(renderer,canvas,uniforms,read,mapLook);
  const vs=`uniform vec4 view;uniform float time,bend;uniform vec2 hero;uniform vec3 impulse;attribute vec4 anchor;attribute float phase;attribute vec4 habitat;varying vec2 vUv;varying float light;varying vec2 localUV;varying vec3 tint;
  void main(){float variant=habitat.w;localUV=uv;vUv=(uv+vec2(mod(variant,2.),1.-floor(variant/2.)))*.5;vec2 p=position.xy*anchor.z;float h=max(0.,p.y)/100.;vec2 d=anchor.xy-hero;tint=habitat.rgb;
    float near=exp(-dot(d,d)/3600.);float wave=sin(time*.85+anchor.x*.002+anchor.y*.0015)+.22*sin(time*2.7+phase);
    vec2 blast=anchor.xy-impulse.xy;float push=exp(-dot(blast,blast)/30000.)*impulse.z;
    p.x+=(wave*4.2+near*sign(d.x)*12.+push*sign(blast.x)*18.)*h*h*bend;
    p.y-=near*h*8.*bend;vec2 w=anchor.xy+vec2(p.x,-p.y);
    gl_Position=vec4((w.x-view.x)/view.z*2.-1.,1.-(w.y-view.y)/view.w*2.,0.,1.);light=anchor.w;
  }`;
  const material=new THREE.ShaderMaterial({uniforms:{...uniforms,art:{value:source}},vertexShader:vs,fragmentShader:`uniform sampler2D art;varying vec2 vUv;varying float light;varying vec2 localUV;varying vec3 tint;void main(){vec4 c=texture2D(art,vUv);if(c.a<.08)discard;float gray=dot(c.rgb,vec3(.3,.59,.11));float root=mix(.35,1.,smoothstep(.02,.42,localUV.y));vec3 color=mix(mix(c.rgb,vec3(gray),.25),tint*.95,.42)*light*root;gl_FragColor=vec4(color,c.a*.94);}`,transparent:true,depthTest:false,depthWrite:false,side:THREE.DoubleSide});
  // Four genuinely transparent clumps. Subdivision lets tips bend, with roots fixed.
  const card=new THREE.PlaneGeometry(112,100,4,12);card.translate(0,50,0);
  const geometry=new THREE.InstancedBufferGeometry();geometry.index=card.index;geometry.attributes.position=card.attributes.position;geometry.attributes.uv=card.attributes.uv;
  const capacity=1600,anchors=new Float32Array(capacity*4),phases=new Float32Array(capacity),habitats=new Float32Array(capacity*4);
  geometry.setAttribute('anchor',new THREE.InstancedBufferAttribute(anchors,4).setUsage(THREE.DynamicDrawUsage));geometry.setAttribute('phase',new THREE.InstancedBufferAttribute(phases,1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('habitat',new THREE.InstancedBufferAttribute(habitats,4).setUsage(THREE.DynamicDrawUsage));
  const foliage=new THREE.Mesh(geometry,material);foliage.frustumCulled=false;foliage.renderOrder=1;scene.add(foliage);
  // One additional instanced draw for soft contact shadows; roots are pinned.
  const rootGeometry=new THREE.InstancedBufferGeometry();const rootCard=new THREE.PlaneGeometry(72,18);
  rootGeometry.index=rootCard.index;rootGeometry.attributes.position=rootCard.attributes.position;rootGeometry.attributes.uv=rootCard.attributes.uv;rootGeometry.setAttribute('anchor',geometry.attributes.anchor);
  const rootMat=new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,vertexShader:`uniform vec4 view;attribute vec4 anchor;varying vec2 q;void main(){q=uv*2.-1.;vec2 w=anchor.xy+position.xy*anchor.z;gl_Position=vec4((w.x-view.x)/view.z*2.-1.,1.-(w.y-view.y)/view.w*2.,0.,1.);}`,fragmentShader:`varying vec2 q;void main(){float a=exp(-dot(q,q)*3.)*.28*(1.-smoothstep(.6,1.,length(q)));gl_FragColor=vec4(.035,.033,.026,a);}`});
  const roots=new THREE.Mesh(rootGeometry,rootMat);roots.frustumCulled=false;scene.add(roots);
  const waterUniforms={...uniforms,center:{value:new THREE.Vector2()},radii:{value:new THREE.Vector2()},band:{value:new THREE.Vector2()},ramp:{value:new THREE.Vector4()},rampHalf:{value:new THREE.Vector2()},mode:{value:0},liquid:{value:null},flip:{value:1},actors:{value:Array.from({length:8},()=>new THREE.Vector4(-1e5,-1e5,0,0))},hits:{value:Array.from({length:8},()=>new THREE.Vector4(-1e5,-1e5,0,0))}};
  const waterMaterial=new THREE.ShaderMaterial({uniforms:waterUniforms,transparent:true,depthTest:false,depthWrite:false,vertexShader:`uniform vec4 view;varying vec2 world;varying vec2 vUv;void main(){world=position.xy;vUv=uv;gl_Position=vec4((world.x-view.x)/view.z*2.-1.,1.-(world.y-view.y)/view.w*2.,0.,1.);}`,fragmentShader:`
    uniform float time;uniform vec2 center,radii,band,rampHalf;uniform vec4 ramp;uniform int mode;uniform sampler2D liquid;uniform float flip;uniform vec4 actors[8],hits[8];varying vec2 world;varying vec2 vUv;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    void main(){vec2 p=(world-center)/radii;float r=length(p),a=atan(p.y,p.x),edge,flow;
      if(mode==0){float wob=.006*sin(a*3.+1.3)+.004*sin(a*7.-.4)+.002*sin(a*13.+2.1);edge=min(r-band.x-.018-wob,band.y-.018+wob-r);if(edge<0.)discard;
        float rt=clamp((world.x-ramp.x)/(ramp.y-ramp.x),0.,1.);if(world.x>ramp.x&&world.x<ramp.y&&abs(world.y-ramp.z)<mix(rampHalf.x,rampHalf.y,rt)+5.)discard;
        flow=a*6.+sin(a*3.)*.22;}
      else{vec2 q=vec2(flip<0.?1.-vUv.x:vUv.x,1.-vUv.y);vec4 c=texture2D(liquid,q);float l=max(c.r,max(c.g,c.b));float wet=smoothstep(.012,.05,c.g-c.r)* (1.-smoothstep(.20,.34,l))*c.a;if(wet<.2||r>.83)discard;edge=(.83-r)*.12;flow=p.x*3.+p.y*1.4;}
      float edgeFade=smoothstep(0.,.024,edge);float width=.20+sin(a*3.)*.04;float speed=.24/width;
      vec2 drift=vec2(flow-time*speed,p.y*16.+sin(flow*2.-time*.4)*.5);float streak=pow(.5+.5*sin(drift.x*20.+sin(drift.y)*2.),20.);
      float sheen=pow(.5+.5*sin(drift.y*2.+drift.x*4.),16.);
      float bank=exp(-edge*180.)*(.4+.6*pow(.5+.5*sin(flow*67.-time*1.2),4.));
      vec2 cell=floor((world+vec2(time*1.3,time*.7))/34.);vec2 local=fract((world+vec2(time*1.3,time*.7))/34.)-.5;float seed=hash(cell);float age=fract(time*.19+seed);float bubble=0.;if(seed>.82){float br=.045+age*.18;float bd=abs(length(local*vec2(1.,1.45))-br);bubble=(1.-smoothstep(.01,.035,bd))*sin(age*3.14159)*.35;}
      float ripple=0.;for(int i=0;i<8;i++){vec2 d=world-actors[i].xy;float ageA=mod(time+actors[i].z,1.6);float rr=length(d*vec2(1.,1.6));ripple+=exp(-pow((rr-ageA*40.)/2.6,2.))*(1.-ageA/1.6)*actors[i].w*.3;
        vec2 h=world-hits[i].xy;float ageH=time-hits[i].z;float hr=length(h*vec2(1.,1.4));if(ageH>0.&&ageH<1.2)ripple+=exp(-pow((hr-ageH*75.)/3.,2.))*(1.-ageH/1.2)*hits[i].w*.45;}
      float mist=pow(.5+.5*sin(p.x*8.+sin(p.y*5.+time*.14)+time*.11),5.)*.025;
      float alpha=(streak*.075+sheen*.055+bank*.13+bubble+ripple+mist)*edgeFade;
      gl_FragColor=vec4(vec3(.48,.48,.30),min(.38,alpha));
    }`});
  const waters=new THREE.Group();scene.add(waters);let waterMeshes=[],layout=[],mapRef=null,frame=0,lastTime=0,ema=16.7,density=1,enabled=true;
  const waterTextures=new Map(),seenProjectiles=new WeakMap(),seenBlasts=new WeakSet(),previousActors=new WeakMap(),hitPool=Array.from({length:8},()=>new THREE.Vector4(-1e5,-1e5,-100,0));let hitIndex=0;
  const stats={frame:0,foliage:0,total:0,water:0,cpuMs:0,density:1,proxy,drawCalls:0,interactions:0};
  function plane(cx,cy,w,h){const g=new THREE.PlaneGeometry(w,h);const p=g.attributes.position;for(let i=0;i<p.count;i++){p.setXYZ(i,p.getX(i)+cx,cy-p.getY(i),0);}return g;}
  function build(s){
    mapRef=s.G.map;layout=foliageLayout(mapRef,s.tile,(s.G.seed||s.G._seed||0)^s.G.mw*73856093^s.G.mh*19349663);
    const random=seeded(s.G.mw*31+s.G.mh);
    for(const o of s.objects){if(!/tree|root|stump|rock/.test(o.type)||!o._hand)continue;
      for(let j=0;j<7;j++){const a=random()*6.283,r=45+random()*85;layout.push({x:o.x+Math.cos(a)*r,y:o.y+Math.sin(a)*r*.45,scale:.45+random()*.6,phase:random()*6.283,variant:j%4});}}
    const h=s.hill,t=s.tile;
    // Reeds follow both authored banks, including the entire 32:9 view.
    if(h)for(let i=0;i<140;i++){const a=(i+random()*.7)/140*6.283,d=(i%2?h.outer+.055:h.inner-.055)+(random()-.5)*.04,x=(h.cx+h.rx*d*Math.cos(a))*t,y=(h.cy+h.ry*d*Math.sin(a))*t;if(x<h.cx*t&&Math.abs(y-h.rampY*t)<130)continue;layout.push({x,y,scale:.44+random()*.55,phase:random()*6.283,variant:0});}
    for(const m of waterMeshes){waters.remove(m.mesh);m.mesh.geometry.dispose();}waterMeshes=[];
    const add=(x,y,w,h,descriptor)=>{const mesh=new THREE.Mesh(plane(x,y,w,h),waterMaterial);mesh.frustumCulled=false;waters.add(mesh);waterMeshes.push({mesh,x,y,w,h,...descriptor});};
    if(h)add(h.cx*t,h.cy*t,h.rx*t*2.2,h.ry*t*2.2,{mode:0});
    for(const o of s.objects)if(o.type==='m_c1pool'||o.type==='m_c1gtoxic'||o.type==='m_c1gtoxicf'){
      const image=s.images[o.type],meta=s.meta[o.type];if(!image?.naturalWidth)continue;
      let texture=waterTextures.get(image);if(!texture){texture=new THREE.Texture(image);texture.needsUpdate=true;waterTextures.set(image,texture);}
      const size=(meta?.sz||300)*(o.scale||1),ar=image.naturalWidth/image.naturalHeight,w=size*Math.min(1,ar),hh=size/Math.max(1,ar);
      add(o.x,o.y,w,hh,{mode:1,texture,flip:meta?.flip?-1:1});
    }
    // Use the same original-alpha water mask for isolated puddles as for flow.
    const maskCanvas=document.createElement('canvas');maskCanvas.width=maskCanvas.height=64;const maskCtx=maskCanvas.getContext('2d',{willReadFrequently:true});
    for(const water of waterMeshes)if(water.mode===1){maskCtx.clearRect(0,0,64,64);maskCtx.drawImage(water.texture.image,0,0,64,64);water.mask=maskCtx.getImageData(0,0,64,64).data;}
    let wet=0;for(const p of layout){const habitat=plantHabitat(p.x,p.y,h,t);let shore=habitat.shore;
      for(const w of waterMeshes)if(w.mode===1&&Math.abs(p.x-w.x)<w.w*.48&&Math.abs(p.y-w.y)<w.h*.48){let u=(p.x-w.x)/w.w+.5,v=(p.y-w.y)/w.h+.5;if(w.flip<0)u=1-u;const i=(Math.min(63,Math.max(0,Math.floor(v*64)))*64+Math.min(63,Math.max(0,Math.floor(u*64))))*4,d=w.mask;if(d[i+1]-d[i]>4&&Math.max(d[i],d[i+1],d[i+2])<87&&d[i+3]>50)shore=true;}
      if(shore){p.variant=0;p.scale*=.76;p.wet=true;wet++;}p.variant??=Math.floor(p.phase*11)%4;
    }stats.total=layout.length;stats.aquatic=wet;
  }
  function draw(ctx,s,view){
    if(!enabled||s.G.stage!==0||s.G._bossArena||!s.G.map)return;
    const start=performance.now();if(mapRef!==s.G.map)build(s);
    const now=s.now/1000,dt=lastTime?Math.min(100,(now-lastTime)*1000):16.7;lastTime=now;ema=ema*.97+dt*.03;
    if(++frame%120===0){if(ema>24)density=Math.max(.3,density-.15);else if(ema<18)density=Math.min(1,density+.05);}
    const low=proxy||s.quality==='low',limit=low?160:Math.floor(800*density),step=low?3:1;
    const w=Math.max(1,Math.round(view.pw*(low?.65:1))),h=Math.max(1,Math.round(view.ph*(low?.65:1)));
    if(canvas.width!==w||canvas.height!==h)renderer.setSize(w,h,false);
    uniforms.view.value.set(view.x,view.y,view.w,view.h);uniforms.time.value=now;uniforms.hero.value.set(s.P.x,s.P.y);uniforms.bend.value=low?0:1;
    uniforms.impulse.value.z*=Math.exp(-dt*.004);
    const attack=/Swing|slam|Slam|Recover/.test(s.P.s||'');if(attack&&s.P.s!==api.lastAttack){uniforms.impulse.value.set(s.P.x,s.P.y,1);api.lastAttack=s.P.s;}if(!attack)api.lastAttack='';
    for(const b of s.blasts){if(!b||seenBlasts.has(b)||!Number.isFinite(b.x)||!Number.isFinite(b.y))continue;seenBlasts.add(b);uniforms.impulse.value.set(b.x,b.y,.75);if(waterAt(b.x,b.y,s.hill,s.tile)){hitPool[hitIndex++%8].set(b.x,b.y,now,1);stats.interactions++;}}
    let count=0;
    for(let i=0;i<layout.length&&count<limit;i+=step){const p=layout[i];if(p.x<view.x-100||p.x>view.x+view.w+100||p.y<view.y-20||p.y>view.y+view.h+120)continue;
      const tint=relief.groundColor(p.x,p.y,s)||[.18,.17,.14];
      anchors.set([p.x,p.y,p.scale,.95+.05*Math.sin(p.phase)],count*4);phases[count]=p.phase;habitats.set([...tint,p.variant],count*4);count++;}
    geometry.instanceCount=count;rootGeometry.instanceCount=count;geometry.attributes.anchor.needsUpdate=true;geometry.attributes.phase.needsUpdate=true;geometry.attributes.habitat.needsUpdate=true;
    let ai=0;for(const actor of [s.P,...s.enemies]){if(!actor||actor.alive===false||ai>=8)continue;const previous=previousActors.get(actor);const moved=previous&&Math.hypot(actor.x-previous.x,actor.y-previous.y)>.4;previousActors.set(actor,{x:actor.x,y:actor.y});waterUniforms.actors.value[ai].set(actor.x,actor.y,ai*.21,moved?1:0);ai++;}
    for(let i=ai;i<8;i++)waterUniforms.actors.value[i].w=0;
    for(const p of s.projectiles){const wet=waterAt(p.x,p.y,s.hill,s.tile);if(wet&&!seenProjectiles.get(p)){hitPool[hitIndex++%8].set(p.x,p.y,now,1);stats.interactions++;}seenProjectiles.set(p,wet);}
    waterUniforms.hits.value=hitPool;
    const hill=s.hill,t=s.tile;waterUniforms.ramp.value.set(hill.rampX0*t,hill.rampX1*t,hill.rampY*t,0);waterUniforms.rampHalf.value.set(hill.rampHalf0*t,hill.rampHalf1*t);waterUniforms.band.value.set(hill.inner,hill.outer);
    let visibleWater=0;for(const water of waterMeshes){const visible=water.x+water.w/2>view.x&&water.x-water.w/2<view.x+view.w&&water.y+water.h/2>view.y&&water.y-water.h/2<view.y+view.h;water.mesh.visible=visible;if(visible)visibleWater++;water.mesh.onBeforeRender=()=>{waterUniforms.mode.value=water.mode;waterUniforms.center.value.set(water.x,water.y);waterUniforms.radii.value.set(water.mode===0?hill.rx*t:water.w/2,water.mode===0?hill.ry*t:water.h/2);waterUniforms.liquid.value=water.texture||source;waterUniforms.flip.value=water.flip||1;waterMaterial.uniformsNeedUpdate=true;};}
    mapLook.draw(ctx,s,view);
    renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;
    ctx.save();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
    relief.motes(ctx,s,view,low);
    Object.assign(stats,{frame,foliage:count,water:visibleWater,cpuMs:performance.now()-start,density,drawCalls:renderer.info.render.calls});
  }
  let currentState;
  const active=s=>enabled&&s.G.stage===0&&!s.G._bossArena;
  const api={draw:(ctx,view)=>{try{draw(ctx,read(),view);}catch(error){enabled=false;api.error=error.message;console.error('[WEB3D living layer]',error);}},
    surface:(ctx,view)=>{const s=currentState=read();if(!active(s))return;try{const low=proxy||s.quality==='low',w=Math.max(1,Math.round(view.pw*(low?.65:1))),h=Math.max(1,Math.round(view.ph*(low?.65:1)));if(canvas.width!==w||canvas.height!==h)renderer.setSize(w,h,false);relief.surface(ctx,s,view);}catch(error){enabled=false;api.error=error.message;console.error('[WEB3D surface]',error);}},
    beginObject:(ctx,o,m)=>{const s=currentState||read();return active(s)?relief.beginObject(ctx,o,m,s):false;},
    snapshot:()=>({...stats,...relief.snapshot(),enabled,error:api.error||null}),setEnabled:value=>{enabled=!!value;},canvas};
  return api;
}
