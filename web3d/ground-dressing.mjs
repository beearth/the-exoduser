import {createMaterialCleanup} from './material-cleanup.mjs?v=20261102-round6';
// Display-only ground connections. Native map pixels and gameplay stay immutable.
export function dressingLayout(data){return data.regions.flatMap(region=>region.placements.map(row=>({...row,region:region.id}))).filter(r=>!data.exclusions.some(z=>{const [x0,y0,x1,y1]=z.rect;return r.x+r.width/2>x0&&r.x-r.width/2<x1&&r.y+r.height/2>y0&&r.y-r.height/2<y1;}));}
export function visibleDressing(r,v){return r.x+r.width/2>v.x&&r.x-r.width/2<v.x+v.w&&r.y+r.height/2>v.y&&r.y-r.height/2<v.y+v.h;}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Distance to the actual alpha silhouette, in world pixels. Broad coherent
// modulation changes feather width, never individual pixels or color grain.
export function featherGroundAlpha(rgba,w,h,worldW,worldH){
 const d=new Float32Array(w*h),dx=worldW/w,dy=worldH/h,diag=Math.hypot(dx,dy);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;d[i]=x===0||y===0||x===w-1||y===h-1||rgba[i*4+3]<96?0:1e6;}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;d[i]=Math.min(d[i],x?d[i-1]+dx:0,y?d[i-w]+dy:0,x&&y?d[i-w-1]+diag:1e6,x<w-1&&y?d[i-w+1]+diag:1e6);}
 for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;d[i]=Math.min(d[i],x<w-1?d[i+1]+dx:0,y<h-1?d[i+w]+dy:0,x<w-1&&y<h-1?d[i+w+1]+diag:1e6,x&&y<h-1?d[i+w-1]+diag:1e6);}
 return d.map((v,i)=>{const x=i%w/w,y=Math.floor(i/w)/h,feather=60+12*Math.sin(x*9+y*5)+8*Math.sin(y*11-x*4);return smooth((v-Math.min(dx,dy))/feather);});
}
export function blendGroundPixel(base,detail,groundOnly){const gain=1+Math.max(-1,Math.min(1,detail))*(groundOnly?.045:.045);return base.map(v=>v*gain);}
export async function dressingImages(data){
 const images=new Map(),clean=createMaterialCleanup();
 await Promise.all(Object.entries(data.assets).map(async([key,url])=>{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('ground asset '+key));image.src=url;});images.set(key,clean(image));}));
 for(const [key,spec]of Object.entries(data.slices||{})){const source=images.get(spec.source),[x,y,w,h]=spec.rect,c=document.createElement('canvas');c.width=Math.round(source.width*w);c.height=Math.round(source.height*h);c.getContext('2d').drawImage(source,source.width*x,source.height*y,source.width*w,source.height*h,0,0,c.width,c.height);images.set(key,c);}
 return images;
}
export async function createGroundDressing(){
 const response=await fetch('./web3d/ground-dressing-ch1.json?v=20261102-round7-relief');if(!response.ok)throw Error('ground dressing '+response.status);
 const data=await response.json(),rows=dressingLayout(data),images=await dressingImages(data),cache=new Map();
 const debug=new URLSearchParams(location.search).get('r3dFoliageDebug')==='1';let visible=0;
 function prepare(r){const source=images.get(r.asset),w=Math.min(512,Math.ceil(r.width*.65)),h=Math.min(256,Math.ceil(r.height*.65)),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.save();if(r.flip){cx.translate(w,0);cx.scale(-1,1);}cx.drawImage(source,0,0,w,h);cx.restore();const p=cx.getImageData(0,0,w,h),a=featherGroundAlpha(p.data,w,h,r.width,r.height),lum=new Float32Array(w*h);let sum=0,weight=0;
  for(let i=0;i<lum.length;i++){lum[i]=p.data[i*4]*.299+p.data[i*4+1]*.587+p.data[i*4+2]*.114;sum+=lum[i]*a[i];weight+=a[i];}const mean=sum/Math.max(1,weight);
  // Only bounded scalar relief survives. No source-art RGB is painted onto the
  // map; the GPU samples the actual native floor independently at every pixel.
  for(let i=0;i<lum.length;i++){const detail=Math.max(-1,Math.min(1,(lum[i]-mean)/Math.max(10,mean))),encoded=Math.round((1+detail*.045)*127);p.data[i*4]=p.data[i*4+1]=p.data[i*4+2]=encoded;p.data[i*4+3]=Math.round(p.data[i*4+3]*a[i]);}cx.putImageData(p,0,0);return c;
 }
 function draw(ctx,s,v){visible=0;let built=0;ctx.save();for(const r of rows){if(!visibleDressing(r,v))continue;let image=cache.get(r.id);if(!image&&built<2){image=prepare(r);cache.set(r.id,image);built++;}if(!image)continue;ctx.globalAlpha=r.alpha;ctx.drawImage(image,r.x-r.width/2,r.y-r.height/2,r.width,r.height);if(debug){ctx.globalAlpha=.6;ctx.strokeStyle='#808080';ctx.lineWidth=2;ctx.strokeRect(r.x-r.width/2,r.y-r.height/2,r.width,r.height);}visible++;}ctx.restore();}
 return {draw,snapshot:()=>({dressingTotal:rows.length,dressingVisible:visible,dressingReady:cache.size,dressingRegions:data.regions.length,groundBlend:'native-pixel-scalar-relief',groundFeather:[40,80],groundGainLimit:.045})};
}
