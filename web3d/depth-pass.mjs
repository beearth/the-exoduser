import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {objectVolume,occlusion,compareDepth} from './depth-layout.mjs?v=20261102-round4-final';
import {lightingGLSL} from './lighting-model.mjs?v=20261102-hue1';
import {createFrameSampler} from './frame-sampler.mjs';
import {atmosphereGLSL} from './atmosphere-model.mjs?v=20261102-hue1';

// Each native prop is rasterised by the original painter exactly once. The GPU
// orders those images by their roots, preserves foreground actor pixels, and
// lights only prop pixels. No actor painter is called again.
export function createDepthPass(renderer,canvas,shared,lighting){
 const scene=new THREE.Scene(),camera=new THREE.Camera(),cache=new Map();
 const texture=im=>{const t=new THREE.Texture(im);t.needsUpdate=true;t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;};
 const bgSampler=createFrameSampler(texture),fgSampler=createFrameSampler(texture);let bgTex,fgTex;
 const stats={depthObjects:0,depthFaded:0,depthOrder:[]};let rows=[],byObject=new Map(),view;
 function prepare(s,v){
  view=v;rows=[];byObject.clear();const actors=[{...s.P,_web3dHero:true},...s.enemies];
  for(const object of s.objects){const volume=objectVolume(object,s.meta[object.type],s.images[object.type]);
   if(!volume||volume.right<v.x||volume.left>v.x+v.w||volume.bottom<v.y||volume.top>v.y+v.h||!s.images[object.type]?.naturalWidth)continue;
   const row={...volume,...occlusion(volume,actors)};rows.push(row);byObject.set(object,row);
  }rows.sort(compareDepth);stats.depthObjects=rows.length;stats.depthFaded=rows.filter(r=>r.alpha<1).length;stats.depthOrder=rows.map(r=>({type:r.object.type,foot:r.foot,alpha:r.alpha}));
 }
 function capture(s){
  if(!rows.length)return;s.flush?.();
  rows=rows.filter(r=>r.claimed);stats.depthObjects=rows.length;stats.depthFaded=rows.filter(r=>r.alpha<1).length;stats.depthOrder=rows.map(r=>({type:r.object.type,foot:r.foot,alpha:r.alpha}));
  bgTex=bgSampler.update(s.frame);renderer.initTexture(bgTex);
 }
 const vertex=`uniform vec4 view,bounds;varying vec2 vUv,world,screenUv;void main(){vUv=uv;world=bounds.xy+vec2(uv.x,1.-uv.y)*bounds.zw;screenUv=vec2((world.x-view.x)/view.z,1.-(world.y-view.y)/view.w);gl_Position=vec4(screenUv*2.-1.,0.,1.);}`;
 const fragment=`uniform sampler2D art,frontMask,beforeActors,afterActors,nativeEmission;uniform vec4 lights[40];uniform vec3 colors[40],ambient;uniform int lightCount;uniform float opacity,time,flash,lowFog,glow[40],selfGlow[40],emissionMix;uniform vec2 texel,hero;varying vec2 vUv,world,screenUv;
 ${lightingGLSL}
 ${atmosphereGLSL}
 float lum(vec2 p){return dot(texture2D(art,p).rgb,vec3(.299,.587,.114));}
 void main(){vec4 c=texture2D(art,vUv);if(c.a<.008)discard;
  vec2 mask=texture2D(frontMask,vUv).rg;
  float changed=length(texture2D(afterActors,screenUv).rgb-texture2D(beforeActors,screenUv).rgb);
  // Every new native pixel outside an actor body is a protected world item,
  // projectile, telegraph or VFX pixel. Only a body behind the prop can occlude.
  if(changed>.012&&(mask.r>.5||mask.g<.5))discard;
  vec3 normal=paintedNormal(art,vUv,texel);
  vec3 added=vec3(.07,.09,.14)*flash,selfEmission=vec3(0.);
  for(int i=0;i<40;i++){if(i>=lightCount)break;vec2 d=lights[i].xy-world;float r=length(d)/lights[i].z;if(r>=1.)continue;float bump=.28+.72*max(0.,dot(normal,normalize(vec3(d.x,-d.y,lights[i].z*.45))));added+=colors[i]*lights[i].w*(poolFalloff(r)*bump+glow[i]*exp(-r*r*72.)*.13);selfEmission+=colors[i]*lights[i].w*poolFalloff(r)*selfGlow[i];}
  vec4 emission=texture2D(nativeEmission,screenUv);
  float toxicMaterial=smoothstep(.005,.025,c.g-max(c.r,c.b));
  vec3 selfLight=emission.rgb*emission.a*emissionMix+selfEmission*toxicMaterial;
  gl_FragColor=vec4(clamp(forestAtmosphere(shadeEnvironment(c.rgb,ambient,added,selfLight),c.rgb+selfLight,world,hero,time,lowFog),0.,1.),c.a*opacity);
 }`;
 function entry(row){
  let item=cache.get(row.object);if(item)return item;
  const image=document.createElement('canvas'),mask=document.createElement('canvas');mask.width=mask.height=128;
  const art=texture(image),frontMask=texture(mask),u={...shared,...lighting,art:{value:art},frontMask:{value:frontMask},beforeActors:{value:bgTex},afterActors:{value:fgTex},bounds:{value:new THREE.Vector4()},opacity:{value:1},texel:{value:new THREE.Vector2()}};
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:u,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false}));mesh.frustumCulled=false;scene.add(mesh);
  item={image,mask,art,frontMask,u,mesh};cache.set(row.object,item);return item;
 }
 function draw(ctx,s,paint){
  for(const [object,item]of cache)if(!byObject.has(object)){scene.remove(item.mesh);item.mesh.geometry.dispose();item.mesh.material.dispose();item.art.dispose();item.frontMask.dispose();cache.delete(object);}
  if(!rows.length)return;s.flush?.();fgTex=fgSampler.update(s.frame);renderer.initTexture(fgTex);
  for(const item of cache.values())item.mesh.visible=false;
  for(let i=0;i<rows.length;i++){
   const r=rows[i],item=entry(r),w=r.right-r.left,h=r.bottom-r.top,scale=Math.min(1,(s.quality==='low'||s.budget?.level>=2?768:1536)/Math.max(w,h));
   const pw=Math.ceil(w*scale),ph=Math.ceil(h*scale);
   if(item.image.width!==pw||item.image.height!==ph){item.art.dispose();item.image.width=pw;item.image.height=ph;item.art=texture(item.image);item.u.art.value=item.art;}
   const x=item.image.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,pw,ph);x.setTransform(scale,0,0,scale,-r.left*scale,-r.top*scale);paint(x,r.object);item.art.needsUpdate=true;
   const m=item.mask.getContext('2d');m.fillStyle='#000';m.fillRect(0,0,128,128);m.fillStyle='#00ff00';
   for(const b of r.bodies)m.fillRect((b.left-r.left)*128/w,(b.top-r.top)*128/h,(b.right-b.left)*128/w,(b.bottom-b.top)*128/h);
   m.fillStyle='#ffff00';
   for(const b of r.front)m.fillRect((b.left-r.left)*128/w,(b.top-r.top)*128/h,(b.right-b.left)*128/w,(b.bottom-b.top)*128/h);
   // Native projectiles and danger glyphs remain readable in front of scenery.
   m.fillStyle='#ff0000';for(const p of s.projectiles){if(!p||!Number.isFinite(p.x))continue;const radius=Math.max(18,p.sz||p.r||18);m.beginPath();m.ellipse((p.x-r.left)*128/w,(p.y-r.top)*128/h,radius*128/w,radius*128/h,0,0,Math.PI*2);m.fill();}
   item.frontMask.needsUpdate=true;item.u.beforeActors.value=bgTex;item.u.afterActors.value=fgTex;item.u.bounds.value.set(r.left,r.top,w,h);item.u.opacity.value=r.alpha;item.u.texel.value.set(1/pw,1/ph);item.mesh.renderOrder=i;item.mesh.visible=true;
  }
  renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
 }
 return {prepare,capture,draw,defer:object=>{const row=byObject.get(object);if(!row)return false;row.claimed=true;return true;},snapshot:()=>({...stats})};
}
