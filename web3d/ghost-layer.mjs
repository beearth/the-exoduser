import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {ghostPose} from './ghost-layout.mjs?v=20261031-ghost3';
export function createGhosts(renderer,canvas,shared,data){
 let enabled=true;
 const scene=new THREE.Scene(),camera=new THREE.Camera(),trees=new Map(),souls=[];
 const make=(row,art,soul=false)=>{
  const geo=new THREE.PlaneGeometry(row.width,row.height,8,16);geo.translate(0,row.height*.5,0);
  const u={...shared,art:{value:art},anchor:{value:new THREE.Vector2(row.x,row.y)},phase:{value:row.phase},opacity:{value:0},soul:{value:soul?1:0},height:{value:row.height}};
  const mat=new THREE.ShaderMaterial({uniforms:u,transparent:true,depthTest:false,depthWrite:false,
   vertexShader:`uniform vec4 view;uniform float time,phase,height,soul,bend;uniform vec2 anchor;varying vec2 vUv;
   void main(){vUv=uv;float h=uv.y;vec2 p=position.xy;p.x+=sin(time*.6+phase+h*2.)*h*h*8.*bend;
    if(soul>.5)p+=vec2(sin(time*.22+phase)*16.,sin(time*.31+phase)*7.);
    vec2 world=anchor+vec2(p.x,-p.y);gl_Position=vec4((world.x-view.x)/view.z*2.-1.,1.-(world.y-view.y)/view.w*2.,0.,1.);}`,
   fragmentShader:`uniform sampler2D art;uniform float time,phase,opacity,soul;varying vec2 vUv;
   void main(){vec2 p=vUv;float a;
    if(soul<.5){vec4 c=texture2D(art,p);float lum=dot(c.rgb,vec3(.3,.59,.11));a=c.a*(.65+.35*lum)*smoothstep(0.,.10,p.y);}
    else{vec2 q=(p-vec2(.5,.62))*vec2(2.8,1.9);float head=exp(-dot((p-vec2(.5,.83))*vec2(8.,8.),(p-vec2(.5,.83))*vec2(8.,8.)));
     float body=exp(-q.x*q.x*4.)*smoothstep(0.,.48,p.y)*(1.-smoothstep(.58,.8,p.y));a=max(head,body*.65);}
    float haze=.80+.20*sin(p.y*19.+time*.4+phase);gl_FragColor=vec4(vec3(.57,.60,.62),a*opacity*haze);}`});
  const mesh=new THREE.Mesh(geo,mat);mesh.frustumCulled=false;scene.add(mesh);return {row,mesh,u};
 };
 const fallback=new THREE.DataTexture(new Uint8Array([255,255,255,255]),1,1);fallback.needsUpdate=true;
 for(const row of data.souls)souls.push(make(row,fallback,true));
 const stats={ghostTrees:data.trees.length,souls:data.souls.length,ghostVisible:0};
 function draw(ctx,s,view){
  if(!enabled)return;
  for(const row of data.trees){if(trees.has(row.id))continue;const image=s.images[row.type];if(!image?.naturalWidth)continue;
   const texture=new THREE.Texture(image);texture.needsUpdate=true;texture.colorSpace=THREE.NoColorSpace;trees.set(row.id,make(row,texture));}
  let n=0;for(const item of [...trees.values(),...souls]){const p=item.row;item.mesh.visible=p.x+p.width>view.x&&p.x-p.width<view.x+view.w&&p.y>view.y&&p.y-p.height<view.y+view.h;
   if(!item.mesh.visible)continue;const pose=ghostPose(p,s.P,s.now/1000);item.u.opacity.value=pose.alpha;if(pose.alpha>.005)n++;}
  shared.view.value.set(view.x,view.y,view.w,view.h);shared.time.value=s.now/1000;shared.bend.value=s.quality==='low'?0:1;
  renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();stats.ghostVisible=n;stats.ghostLoaded=trees.size;
 }
 return {draw,setEnabled:value=>{enabled=!!value;},snapshot:()=>({...stats})};
}
