import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {forestLayout} from './environment-layout.mjs';
import {forestLightingGLSL} from './forest-lighting.mjs';

export async function createForest(renderer,canvas,shared,data,anchors){
 const plan=forestLayout(data,anchors),scene=new THREE.Scene(),camera=new THREE.Camera(),groups=[];
 const mask=document.createElement('canvas');mask.width=mask.height=1024;const mx=mask.getContext('2d');
 const origin=-2400,span=12800,k=1024/span;
 mx.fillStyle='white';mx.fillRect(0,0,1024,1024);mx.globalCompositeOperation='destination-out';mx.beginPath();
 anchors.boundary.forEach(([x,y],i)=>mx[i?'lineTo':'moveTo']((x*anchors.tile_size-origin)*k,(y*anchors.tile_size-origin)*k));mx.closePath();mx.filter='blur(5px)';mx.fill();mx.filter='none';
 const maskTex=new THREE.CanvasTexture(mask);maskTex.minFilter=maskTex.magFilter=THREE.LinearFilter;
 // BACK mass: dim wood through cold haze, including alpha gaps under the roots.
 // It is outside the walkable polygon and reuses the existing forest painting.
 const backMaterial=new THREE.ShaderMaterial({uniforms:{...shared,art:{value:null},forestMask:{value:maskTex}},depthTest:false,depthWrite:false,transparent:true,
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
  fragmentShader:`uniform vec4 view;uniform sampler2D art,forestMask;varying vec2 vUv;void main(){vec2 w=view.xy+vec2(vUv.x,1.-vUv.y)*view.zw;float outside=texture2D(forestMask,vec2((w.x+2400.)/12800.,1.-(w.y+2400.)/12800.)).a;if(outside<.005)discard;vec4 wood=texture2D(art,fract(w/vec2(1450.,2100.)));float haze=.92+.08*sin(w.x*.0013+w.y*.0008);vec3 c=(vec3(.028,.037,.049)+wood.rgb*wood.a*vec3(.07,.08,.09))*haze;gl_FragColor=vec4(c,outside*.96);}`});
 const back=new THREE.Mesh(new THREE.PlaneGeometry(2,2),backMaterial);back.frustumCulled=false;back.renderOrder=-10;scene.add(back);
 const vertex=`uniform vec4 view;uniform float time,bend;attribute vec4 placement,detail;varying vec2 vUv,world;varying vec4 info;
 void main(){vUv=uv;info=detail;vec2 p=position.xy*placement.zw;float top=uv.y;
 p.x+=sin(time*.42+detail.w)*top*top*3.*bend*step(.5,detail.z);
 world=placement.xy+vec2(p.x,-p.y);gl_Position=vec4((world.x-view.x)/view.z*2.-1.,1.-(world.y-view.y)/view.w*2.,0.,1.);}`;
 const fragment=`uniform sampler2D art,forestMask;varying vec2 vUv,world;varying vec4 info;
 ${forestLightingGLSL}
 void main(){vec2 uv=vec2(info.y>.5?1.-vUv.x:vUv.x,vUv.y);vec4 c=texture2D(art,uv);if(c.a<.03)discard;
 float outside=texture2D(forestMask,vec2((world.x+2400.)/12800.,1.-(world.y+2400.)/12800.)).a;
 float root=smoothstep(0.,.13,vUv.y),depth=clamp(info.z/3.,0.,1.);
 float rim=max(0.,c.a-texture2D(art,uv+vec2(.003,.002)).a);
 vec3 color=forestRadiance(c.rgb,depth,rim);
 gl_FragColor=vec4(color*.62,c.a*info.x*root*outside);}`;
 for(const [name,url]of Object.entries(data.textures)){
  const art=await new THREE.TextureLoader().loadAsync('./'+url);art.colorSpace=THREE.NoColorSpace;
  if(name==='forest_stand')backMaterial.uniforms.art.value=art;
  art.minFilter=art.magFilter=THREE.LinearFilter;
  for(const layer of [3,2,1,0]){
   const rows=[...plan.trees,...plan.low].filter(p=>p.texture===name&&p.layer===layer);if(!rows.length)continue;
   const card=new THREE.PlaneGeometry(1,1,2,8);card.translate(0,.34,0);
   const geo=new THREE.InstancedBufferGeometry();geo.index=card.index;geo.attributes.position=card.attributes.position;geo.attributes.uv=card.attributes.uv;
   const a=new Float32Array(rows.length*4),b=new Float32Array(rows.length*4);
   geo.setAttribute('placement',new THREE.InstancedBufferAttribute(a,4).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('detail',new THREE.InstancedBufferAttribute(b,4).setUsage(THREE.DynamicDrawUsage));
   const mat=new THREE.ShaderMaterial({uniforms:{...shared,art:{value:art},forestMask:{value:maskTex}},vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false});
   const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;mesh.renderOrder=4-layer;scene.add(mesh);groups.push({rows,geo,a,b});
  }
 }
 const stats={forestLow:plan.low.length,forestTrees:plan.trees.length,forestVisible:0,forestDrawCalls:0};
 function draw(ctx,s,view){
  let visible=0;for(const g of groups){let n=0;for(const p of g.rows){
   if(p.x+p.width*.6<view.x||p.x-p.width*.6>view.x+view.w||p.y+p.height*.2<view.y||p.y-p.height*.9>view.y+view.h)continue;
   g.a.set([p.x,p.y,p.width,p.height],n*4);g.b.set([p.alpha,p.flip?1:0,p.layer,p.phase],n*4);n++;
  }g.geo.instanceCount=n;g.geo.attributes.placement.needsUpdate=true;g.geo.attributes.detail.needsUpdate=true;visible+=n;}
  shared.view.value.set(view.x,view.y,view.w,view.h);shared.time.value=s.now/1000;
  shared.bend.value=s.quality==='low'?0:1;renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;
  ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
  stats.forestVisible=visible;stats.forestDrawCalls=renderer.info.render.calls;
 }
 return {draw,snapshot:()=>({...stats}),plan};
}
