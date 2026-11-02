import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {createFrameSampler} from './frame-sampler.mjs';
// Same renderer and native pre-prop frame. The texture is a signed scalar field,
// not another painted floor. Native actors, props, water and HUD draw afterwards.
export function createGroundBlendPass(renderer,canvas,shared,dressing){
 let enabled=true;
 const scene=new THREE.Scene(),camera=new THREE.Camera(),mask=document.createElement('canvas'),cx=mask.getContext('2d');
 const frames=createFrameSampler(image=>{const t=new THREE.Texture(image);t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;});
 const masks=createFrameSampler(image=>{const t=new THREE.Texture(image);t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;});
 const uniforms={texel:{value:new THREE.Vector2()},frameArt:{value:null},reliefArt:{value:null}};
 const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,vertexShader:'varying vec2 q;void main(){q=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'uniform sampler2D frameArt,reliefArt;uniform vec2 texel;varying vec2 q;float luminance(vec2 uv){return dot(texture2D(frameArt,uv).rgb,vec3(.299,.587,.114));}void main(){vec4 original=texture2D(frameArt,q),relief=texture2D(reliefArt,q);float surround=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){if(x!=0||y!=0)surround=max(surround,luminance(q+vec2(float(x),float(y))*texel*3.));}float center=dot(original.rgb,vec3(.299,.587,.114));original.rgb*=min(1.,(surround+.006)/max(.001,center));float gain=clamp(relief.r*255./127.-1.,-.045,.045)*relief.a;gl_FragColor=vec4(original.rgb*(1.+gain),original.a);}'});
 scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
 function draw(ctx,s,v){if(!enabled||!s.frame||!s.flush)return;const outputW=Math.max(1,Math.round(v.pw)),outputH=Math.max(1,Math.round(v.ph)),w=Math.min(1024,outputW),h=Math.max(1,Math.round(w*v.h/v.w));if(mask.width!==w||mask.height!==h){mask.width=w;mask.height=h;}cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,w,h);cx.setTransform(w/v.w,0,0,h/v.h,-v.x*w/v.w,-v.y*h/v.h);dressing.draw(cx,s,v);s.flush();uniforms.frameArt.value=frames.update(s.frame);uniforms.texel.value.set(1/s.frame.width,1/s.frame.height);uniforms.reliefArt.value=masks.update(mask);if(canvas.width!==outputW||canvas.height!==outputH)renderer.setSize(outputW,outputH,false);renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;ctx.save();ctx.globalAlpha=1;ctx.drawImage(canvas,v.x,v.y,v.w,v.h);ctx.restore();}
 return {draw,setEnabled:value=>{enabled=!!value;}};
}
