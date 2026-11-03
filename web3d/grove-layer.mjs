import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {groveLayout} from './grove-layout.mjs';
import {despeckleMaterial} from './material-cleanup.mjs';
import {rootContact} from './scene-lighting-model.mjs';
export async function createGroves(renderer,canvas,shared){
 const response=await fetch('./assets/web3d/groves-ch1.json?v=20261103-r8');if(!response.ok)throw Error('groves '+response.status);
 const data=await response.json(),rows=groveLayout(data),groups=[],scene=new THREE.Scene(),camera=new THREE.Camera();let enabled=true;
 for(const [name,url]of Object.entries(data.assets)){
  const list=rows.filter(p=>p.asset===name);if(!list.length)continue;
  const art=await new THREE.TextureLoader().loadAsync('./'+url),c=document.createElement('canvas'),im=art.image,rect=name.startsWith('base')?[0,im.height*.76,im.width,im.height*.24]:[0,0,im.width,im.height],k=Math.min(1,768/Math.max(rect[2],rect[3]));c.width=Math.round(rect[2]*k);c.height=Math.round(rect[3]*k);const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(im,...rect,0,0,c.width,c.height);const pixels=cx.getImageData(0,0,c.width,c.height);pixels.data.set(despeckleMaterial(pixels.data,c.width,c.height,1));cx.putImageData(pixels,0,0);art.image=c;art.needsUpdate=true;art.colorSpace=THREE.NoColorSpace;art.minFilter=THREE.LinearMipmapLinearFilter;
  const contactPixels=cx.getImageData(0,0,c.width,c.height);contactPixels.data.set(rootContact(contactPixels.data,c.width,c.height));cx.putImageData(contactPixels,0,0);
  const card=new THREE.PlaneGeometry(1,1,4,8),geo=new THREE.InstancedBufferGeometry();card.translate(0,.32,0);geo.index=card.index;geo.attributes.position=card.attributes.position;geo.attributes.uv=card.attributes.uv;
  const a=new Float32Array(list.length*4),b=new Float32Array(list.length*4);geo.setAttribute('placement',new THREE.InstancedBufferAttribute(a,4).setUsage(THREE.DynamicDrawUsage));geo.setAttribute('detail',new THREE.InstancedBufferAttribute(b,4).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.ShaderMaterial({uniforms:{...shared,art:{value:art}},transparent:true,depthTest:false,depthWrite:false,
   vertexShader:`uniform vec4 view;uniform float time,bend;attribute vec4 placement,detail;varying vec2 vUv,world;varying vec4 info;
   void main(){vUv=uv;info=detail;vec2 p=position.xy*placement.zw;float h=uv.y;p.x+=sin(time*1.15+detail.y+h*2.)*h*h*detail.z*bend;world=placement.xy+vec2(p.x,-p.y);gl_Position=vec4((world.x-view.x)/view.z*2.-1.,1.-(world.y-view.y)/view.w*2.,0.,1.);}`,
   fragmentShader:`uniform sampler2D art;uniform vec2 hero;varying vec2 vUv,world;varying vec4 info;
   void main(){vec2 uv=vec2(info.x>.5?1.-vUv.x:vUv.x,vUv.y);vec4 c=texture2D(art,uv);if(c.a<.12)discard;float root=smoothstep(0.,.14,vUv.y)*(1.-smoothstep(.70,1.,vUv.y));float near=smoothstep(65.,170.,length(world-hero));gl_FragColor=vec4(c.rgb*.80,c.a*root*mix(.23,1.,near));}`});
  const mesh=new THREE.Mesh(geo,material);mesh.frustumCulled=false;mesh.renderOrder=-2;scene.add(mesh);groups.push({list,a,b,geo,mesh});
 }
 let visible=0;
 function prepare(s,v){visible=0;for(const g of groups){let n=0;for(const p of g.list){if(p.x+p.width*.6<v.x||p.x-p.width*.6>v.x+v.w||p.y+p.height*.2<v.y||p.y-p.height*.9>v.y+v.h)continue;g.a.set([p.x,p.y,p.width,p.height],n*4);g.b.set([p.flip?1:0,p.phase,p.sway,0],n*4);n++;}g.geo.instanceCount=n;g.geo.attributes.placement.needsUpdate=true;g.geo.attributes.detail.needsUpdate=true;visible+=n;}}
 function draw(ctx,s,v){if(!enabled)return;prepare(s,v);shared.view.value.set(v.x,v.y,v.w,v.h);shared.time.value=s.now/1000;shared.hero.value.set(s.P.x,s.P.y);shared.bend.value=s.budget?.sway===false?0:1;renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,v.x,v.y,v.w,v.h);ctx.restore();}
 return {draw,setEnabled:v=>{enabled=!!v;},snapshot:()=>({groves:rows.length,grovesVisible:visible,groveDrawCalls:groups.filter(g=>g.geo.instanceCount).length}),rows};
}
