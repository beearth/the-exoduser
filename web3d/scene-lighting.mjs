import * as THREE from '../assets/vendor/three-r160/build/three.module.js';
import {nativePropStamp,objectVolume} from './depth-layout.mjs';
import {projectShadow} from './scene-lighting-model.mjs';

const make=(w,h=w)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const texture=c=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.NoColorSpace;t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;return t;};
export function createSceneLighting(anchors){
 const shadow=make(2048),st=texture(shadow),cache=new WeakMap();
 let map,lastReady=-1,roots=[],stats={moonDirection:'NW → SE',shadowCasters:0,heroRimFrames:0,foregroundBranches:0},lastView;
 const uniforms={moonShadow:{value:st}};
 function build(s){const ready=Object.values(s.images).filter(i=>i?.naturalWidth).length;if(map===s.G.map&&ready===lastReady)return;map=s.G.map;lastReady=ready;const x=shadow.getContext('2d');x.clearRect(0,0,2048,2048);const k=2048/12800;
  for(const c of [x])c.setTransform(k,0,0,k,2400*k,2400*k);let count=0;
  for(const o of s.objects){const m=s.meta[o.type],im=s.images[o.type],p=nativePropStamp(o,m,im);if(!p)continue;const v=objectVolume(o,m,im);if(!v||!(/tree|rock|cliff|altar|totem|arch/.test(o.type)))continue;
   const [left,top,w,h]=p.destination,foot=Math.min(top+h,v.foot),height=Math.min(h,850),[tipX,tipY]=projectShadow(o.x,foot,0,height,1.15),dx=(tipX-o.x)/height,dy=(tipY-foot)/height;
   // A single silhouette projection, pinned at the native foot; cached on map load.
   x.save();x.translate(o.x,foot);x.transform(.72,0,-dx,-dy,0,0);x.globalAlpha=.64;x.drawImage(im,...p.source,left-o.x,top-foot,w,h);x.restore();count++;
  }
  const dot=make(64,32),dc=dot.getContext('2d'),g=dc.createRadialGradient(32,16,0,32,16,32);g.addColorStop(0,'rgba(0,0,0,.27)');g.addColorStop(1,'rgba(0,0,0,0)');dc.fillStyle=g;dc.fillRect(0,0,64,32);
  for(const p of roots)x.drawImage(dot,p.x-p.width*.34,p.y-p.height*.02,p.width*.68,Math.max(12,p.height*.19));
  for(const c of [x])c.setTransform(1,0,0,1,0,0);st.needsUpdate=true;stats.shadowCasters=count;stats.rootContacts=roots.length;
 }
 function ground(s,v){lastView=v;build(s);}
 const rims=new Map();
 function heroRim(ctx,sa,anim,flip,dir,dead,alpha){if(dead||!sa?.img||alpha===0)return;const key=[sa.anim,sa.f,dir,flip].join('|');let entry=rims.get(key);if(!entry||entry.image!==sa.img){const body=make(256),b=body.getContext('2d');b.translate(128,128);anim.draw(sa,b,0,0,flip,dir);const c=make(256),x=c.getContext('2d');x.drawImage(body,-2,-1);x.drawImage(body,-1,-2);x.globalCompositeOperation='destination-out';x.drawImage(body,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#c3d5e4';x.fillRect(0,0,256,256);entry={image:sa.img,canvas:c};rims.set(key,entry);if(rims.size>160)rims.delete(rims.keys().next().value);stats.heroRimFrames=rims.size;}
  ctx.save();ctx.globalAlpha=.48*(Number.isFinite(alpha)?alpha:1);ctx.drawImage(entry.canvas,-128,-128);ctx.restore();
 }
 function front(ctx,s){if(!lastView)return;const v=lastView,p=anchors.props.find(p=>p.texture.endsWith('/rotforest_tree_01.png')),im=p&&s.images[p.id];if(!im?.naturalWidth)return;let c=cache.get(im);if(!c){c=make(512);const x=c.getContext('2d');x.filter='blur(2px)';x.drawImage(im,0,0,im.naturalWidth,im.naturalHeight*.55,0,0,512,512);x.filter='none';x.globalCompositeOperation='source-in';x.fillStyle='#06080b';x.fillRect(0,0,512,512);cache.set(im,c);}
  const width=Math.min(760,v.w*.36),height=width*.85,drift=Math.sin(s.G.cam.x/900)*90,lift=Math.sin(s.G.cam.y/1100)*50;
  const paint=x=>{x.save();x.globalAlpha=.86;x.drawImage(c,v.x-width*.40+drift,v.y+v.h-height*.73+lift,width,height);x.save();x.translate(v.x+v.w+width*.4+drift,v.y+v.h-height*.65-lift);x.scale(-1,1);x.rotate(.16);x.drawImage(c,0,0,width*.9,height);x.restore();x.restore();};paint(ctx);
  const probe=window._Web3DFrameProbe;if(probe&&!probe.foreground){const frame=make(v.pw,v.ph),x=frame.getContext('2d');x.setTransform(v.pw/v.w,0,0,v.ph/v.h,-v.x*v.pw/v.w,-v.y*v.ph/v.h);paint(x);probe.foreground=frame.toDataURL();}stats.foregroundBranches=2;
 }
 return {uniforms,ground,heroRim,front,setRoots:r=>{roots=r;map=null;},snapshot:()=>({...stats,sceneLightingR9:true})};
}
