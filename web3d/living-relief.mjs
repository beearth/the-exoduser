import {objectRelief,applyAffine} from './living-layout.mjs?v=20261031-layer2';

// Sample original chunks for vegetation integration, never rewrite the images.
export function createRelief(renderer,canvas,uniforms,read,mapLook){
 const samples=new Map(),probe=document.createElement('canvas');probe.width=probe.height=128;
 const probeCtx=probe.getContext('2d',{willReadFrequently:true});let mapRef;
 const stats={heightObjects:0,terrainChunks:0};
 function sampleTerrain(s){
  if(mapRef!==s.G.map){mapRef=s.G.map;samples.clear();}
  for(const [id,e]of Object.entries(s.ground||{})){
   if(e.status!=='ready'||samples.has(id))continue;
   probeCtx.clearRect(0,0,128,128);probeCtx.drawImage(e.img,1,1,1024,1024,0,0,128,128);
   samples.set(id,probeCtx.getImageData(0,0,128,128).data);
  }stats.terrainChunks=samples.size;
 }
 function groundColor(x,y,s){
  const size=s.G.mw*s.tile/8,cx=Math.floor(x/size),cy=Math.floor(y/size),data=samples.get(cx+','+cy);if(!data)return null;
  const px=Math.max(0,Math.min(127,Math.floor((x/size-cx)*128))),py=Math.max(0,Math.min(127,Math.floor((y/size-cy)*128))),i=(py*128+px)*4;
  return [data[i]/255,data[i+1]/255,data[i+2]/255];
 }
 function surface(ctx,s,view){sampleTerrain(s);stats.heightObjects=0;mapLook.surface(ctx,s,view);}
 function beginObject(ctx,o,m,s){
  const pose=objectRelief(o,m,s.P,s.now/1000);if(!pose)return false;
  ctx.save();ctx.translate(o.x,pose.foot);applyAffine(ctx,1,0,pose.shear,pose.lift);ctx.translate(-o.x,-pose.foot);stats.heightObjects++;return true;
 }
 return {surface,beginObject,motes:mapLook.motes,groundColor,snapshot:()=>({...stats,...mapLook.snapshot()}),sampleTerrain};
}
