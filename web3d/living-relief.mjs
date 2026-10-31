import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {objectRelief,seeded} from './living-layout.mjs?v=20261031-layer2';

// The floor image is sampled, never rewritten. All resources belong to this
// optional layer and reuse its single WebGL renderer.
export function createRelief(renderer,canvas,uniforms,read){
  const scene=new THREE.Scene(),camera=new THREE.Camera(),samples=new Map(),shadows=new WeakMap();
  const normalCanvas=document.createElement('canvas');normalCanvas.width=normalCanvas.height=1024;
  const normalCtx=normalCanvas.getContext('2d',{willReadFrequently:true});
  const normalTexture=new THREE.CanvasTexture(normalCanvas);normalTexture.colorSpace=THREE.NoColorSpace;
  const probe=document.createElement('canvas');probe.width=probe.height=128;
  const probeCtx=probe.getContext('2d',{willReadFrequently:true});
  const lights=Array.from({length:10},()=>new THREE.Vector4(-1e5,-1e5,1,0));
  const colors=Array.from({length:10},()=>new THREE.Vector3());
  const u={...uniforms,terrain:{value:normalTexture},worldSize:{value:8000},lights:{value:lights},colors:{value:colors}};
  const mat=new THREE.ShaderMaterial({uniforms:u,depthTest:false,depthWrite:false,transparent:true,blending:THREE.AdditiveBlending,
    vertexShader:`uniform vec4 view;varying vec2 world;void main(){world=view.xy+(position.xy*.5+.5)*view.zw;gl_Position=vec4(position.x,-position.y,0.,1.);}`,
    fragmentShader:`uniform sampler2D terrain;uniform float worldSize,time;uniform vec4 lights[10];uniform vec3 colors[10];varying vec2 world;
    float lum(vec2 uv){return dot(texture2D(terrain,uv).rgb,vec3(.3,.59,.11));}
    void main(){vec2 uv=vec2(world.x/worldSize,1.-world.y/worldSize),e=vec2(1./1024.,0.);
      vec3 normal=normalize(vec3((lum(uv-e)-lum(uv+e))*4.,(lum(uv-e.yx)-lum(uv+e.yx))*4.,.7));
      float cloud=.5+.24*sin(world.x*.002+world.y*.0012-time*.055)+.18*sin(world.y*.003-world.x*.0007-time*.037);
      // A cloud is a moving loss of the added skylight, never a global dimmer.
      vec3 light=vec3(.008,.009,.011)*(.35+.65*(1.-smoothstep(.25,.9,cloud)));
      for(int i=0;i<10;i++){vec2 delta=lights[i].xy-world;float d=length(delta)/lights[i].z;float fall=pow(max(0.,1.-d*d),2.);
        float diffuse=.62+.38*max(0.,dot(normal,normalize(vec3(delta*.006,1.))));light+=colors[i]*lights[i].w*fall*diffuse;}
      gl_FragColor=vec4(light,1.);
    }`});
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
  const glow=document.createElement('canvas');glow.width=glow.height=128;
  const gx=glow.getContext('2d'),g=gx.createRadialGradient(64,64,2,64,64,63);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(.38,'rgba(0,0,0,.3)');g.addColorStop(1,'rgba(0,0,0,0)');gx.fillStyle=g;gx.fillRect(0,0,128,128);
  let stats={lights:0,shadows:0,particles:0,heightObjects:0,terrainChunks:0},mapRef;
  function sampleTerrain(s){
    if(mapRef!==s.G.map){mapRef=s.G.map;samples.clear();normalCtx.clearRect(0,0,1024,1024);}
    let changed=false;
    for(const [id,e]of Object.entries(s.ground||{})){
      if(e.status!=='ready'||samples.has(id))continue;
      probeCtx.clearRect(0,0,128,128);probeCtx.drawImage(e.img,1,1,1024,1024,0,0,128,128);
      const rgba=probeCtx.getImageData(0,0,128,128).data;samples.set(id,rgba);
      const [x,y]=id.split(',').map(Number);normalCtx.drawImage(probe,x*128,y*128);changed=true;
    }
    if(changed)normalTexture.needsUpdate=true;stats.terrainChunks=samples.size;
  }
  function groundColor(x,y,s){
    const size=s.G.mw*s.tile/8,cx=Math.floor(x/size),cy=Math.floor(y/size),data=samples.get(cx+','+cy);
    if(!data)return null;
    const px=Math.max(0,Math.min(127,Math.floor((x/size-cx)*128))),py=Math.max(0,Math.min(127,Math.floor((y/size-cy)*128))),i=(py*128+px)*4;
    return [data[i]/255,data[i+1]/255,data[i+2]/255];
  }
  function updateLights(s,view){
    let count=0;
    const put=(x,y,r,power,rgb)=>{if(count===10||x+r<view.x||x-r>view.x+view.w||y+r<view.y||y-r>view.y+view.h)return;
      lights[count].set(x,y,r,power);colors[count].set(...rgb);count++;};
    put(s.P.x,s.P.y,240,.075,[.73,.64,.46]);
    const time=s.now/1000;
    for(const o of s.objects){if(!(s.meta[o.type]?.light||/torch|lantern/.test(o.type)||(o.type==='bonfire'&&o.lit)))continue;
      const flicker=1+.07*Math.sin(time*8.3+o.x)+.035*Math.sin(time*13.7+o.y);put(o.x,o.y-16,260,.14*flicker,[1,.52,.19]);}
    for(const b of s.blasts){if(!b||!Number.isFinite(b.x))continue;put(b.x,b.y,200,.18,[1,.47,.18]);}
    for(const p of s.projectiles){if(!p||p.friendly===false||!(p.friendly||p.el!==undefined))continue;
      const rgb=p.el===1?[.36,.64,1]:p.el===2?[.66,.64,1]:p.el===3?[.62,.32,.76]:[1,.45,.16];put(p.x,p.y,155,.09,rgb);}
    for(let i=count;i<10;i++)lights[i].w=0;stats.lights=count;
  }
  function shadow(ctx,o,m,s,view){
    const pose=objectRelief(o,m,s.P,s.now/1000),im=s.images[o.type];if(!pose||!im?.naturalWidth)return false;
    const size=(m.sz||32)*(o.scale||1);if(o.x+size<view.x||o.x-size>view.x+view.w||pose.foot<view.y||o.y-size>view.y+view.h)return false;
    let stamp=shadows.get(im);if(!stamp){stamp=document.createElement('canvas');stamp.width=stamp.height=192;const x=stamp.getContext('2d');x.drawImage(im,0,0,192,192);x.globalCompositeOperation='source-in';x.fillStyle='#080909';x.fillRect(0,0,192,192);shadows.set(im,stamp);}
    ctx.save();ctx.globalAlpha=.12;ctx.translate(o.x,pose.foot);ctx.transform(1,0,-.55,-.26,0,0);ctx.drawImage(stamp,-size*.5,-size*.88,size,size);ctx.restore();
    ctx.save();ctx.globalAlpha=.2;ctx.drawImage(glow,o.x-size*.22,pose.foot-size*.045,size*.44,size*.09);ctx.restore();return true;
  }
  function surface(ctx,s,view){
    sampleTerrain(s);updateLights(s,view);stats.heightObjects=0;
    uniforms.view.value.set(view.x,view.y,view.w,view.h);uniforms.time.value=s.now/1000;u.worldSize.value=s.G.mw*s.tile;
    renderer.render(scene,camera);canvas._glVer=(canvas._glVer||0)+1;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;ctx.drawImage(canvas,view.x,view.y,view.w,view.h);ctx.restore();
    let count=0;for(const o of s.objects){if(count>=18)break;if(shadow(ctx,o,s.meta[o.type],s,view))count++;}stats.shadows=count;
  }
  function beginObject(ctx,o,m,s){
    const pose=objectRelief(o,m,s.P,s.now/1000);if(!pose)return false;
    ctx.save();ctx.translate(o.x,pose.foot);ctx.transform(1,0,pose.shear,pose.lift,0,0);ctx.translate(-o.x,-pose.foot);stats.heightObjects++;return true;
  }
  // Sparse drifting ash/spores; rendered before native actors and danger markers.
  function motes(ctx,s,view,low){
    const rnd=seeded(173),time=s.now/1000,w=s.G.mw*s.tile,h=s.G.mh*s.tile;let n=0;
    ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<(low?55:180);i++){
      const phase=rnd()*6.283,x=(rnd()*w+time*5.5+Math.sin(time*.3+phase)*8)%w,y=(rnd()*h-time*2.3+Math.cos(time*.23+phase)*6+h)%h;
      const r=1+rnd()*1.2;if(x<view.x||x>view.x+view.w||y<view.y||y>view.y+view.h)continue;
      ctx.globalAlpha=.10+.15*(.5+.5*Math.sin(time*.6+phase));ctx.fillStyle=i%3?'#a59a76':'#827965';ctx.beginPath();ctx.ellipse(x,y,r,r*.65,phase,0,6.283);ctx.fill();n++;
    }ctx.restore();stats.particles=n;
  }
  return {surface,beginObject,motes,groundColor,snapshot:()=>({...stats}),sampleTerrain};
}
