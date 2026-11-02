// Authored visual-only low silhouettes; source map and gameplay arrays stay untouched.
export function dressingLayout(data){return data.regions.flatMap(region=>region.placements.map(row=>({...row,region:region.id}))).filter(r=>!data.exclusions.some(z=>{const [x0,y0,x1,y1]=z.rect;return r.x+r.width/2>x0&&r.x-r.width/2<x1&&r.y+r.height/2>y0&&r.y-r.height/2<y1;}));}
export function visibleDressing(r,v){return r.x+r.width/2>v.x&&r.x-r.width/2<v.x+v.w&&r.y+r.height/2>v.y&&r.y-r.height/2<v.y+v.h;}
export async function dressingImages(data){
 const images=new Map();
 await Promise.all(Object.entries(data.assets).map(async([key,url])=>{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('ground asset '+key));image.src=url;});images.set(key,image);}));
 // Selected leaf/wood excerpts from adopted source art, feathered once at load.
 // They lie below the root masses and do not replace or rewrite the map PNG.
 for(const [key,spec]of Object.entries(data.slices||{})){
  const source=images.get(spec.source),[x,y,w,h]=spec.rect,c=document.createElement('canvas');c.width=Math.round(source.width*w);c.height=Math.round(source.height*h);const cx=c.getContext('2d');cx.drawImage(source,source.width*x,source.height*y,source.width*w,source.height*h,0,0,c.width,c.height);
  cx.globalCompositeOperation='destination-in';
  for(const axis of ['x','y']){const end=axis==='x'?c.width:c.height,g=cx.createLinearGradient(0,0,axis==='x'?end:0,axis==='y'?end:0);g.addColorStop(0,'transparent');g.addColorStop(spec.feather,'white');g.addColorStop(1-spec.feather,'white');g.addColorStop(1,'transparent');cx.fillStyle=g;cx.fillRect(0,0,c.width,c.height);}images.set(key,c);
 }
 return images;
}
export async function createGroundDressing(){
 const response=await fetch('./web3d/ground-dressing-ch1.json?v=20261102-dress4');if(!response.ok)throw Error('ground dressing '+response.status);
 const data=await response.json(),rows=dressingLayout(data),images=await dressingImages(data);
 const shadow=document.createElement('canvas');shadow.width=128;shadow.height=64;const sx=shadow.getContext('2d'),g=sx.createRadialGradient(64,32,0,64,32,64);g.addColorStop(0,'rgba(5,4,6,.34)');g.addColorStop(1,'rgba(5,4,6,0)');sx.fillStyle=g;sx.fillRect(0,0,128,64);
 const debug=new URLSearchParams(location.search).get('r3dFoliageDebug')==='1';
 let visible=0;
 function draw(ctx,s,v){visible=0;ctx.save();for(const r of rows){if(!visibleDressing(r,v))continue;const image=images.get(r.asset);
  if(!r.groundOnly){ctx.globalAlpha=.72;ctx.drawImage(shadow,r.x-r.width*.475,r.y+r.height*.13,r.width*.95,r.height*.42);}
  ctx.save();ctx.translate(r.x,r.y);ctx.scale(r.flip?-1:1,1);ctx.globalAlpha=r.alpha;ctx.drawImage(image,-r.width/2,-r.height/2,r.width,r.height);ctx.restore();if(debug){ctx.globalAlpha=.6;ctx.strokeStyle='#cba676';ctx.lineWidth=2;ctx.strokeRect(r.x-r.width/2,r.y-r.height/2,r.width,r.height);}visible++;
 }ctx.restore();}
 return {draw,snapshot:()=>({dressingTotal:rows.length,dressingVisible:visible,dressingRegions:data.regions.length})};
}
