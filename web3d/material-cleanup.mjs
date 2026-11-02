// Display-only opening removes bright micro-islands from adopted soil albedo.
// Source pixels, alpha, broad dark fissures and gameplay data remain immutable.
function extrema(input,w,h,r,minimum,horizontal){
 const output=new Float32Array(input.length),length=horizontal?w:h,lines=horizontal?h:w;
 for(let line=0;line<lines;line++){
  const queue=new Int32Array(length),at=i=>horizontal?line*w+i:i*w+line;let head=0,tail=0,next=0;
  for(let p=0;p<length;p++){
   const end=Math.min(length-1,p+r);
   while(next<=end){const value=input[at(next)];while(tail>head&&(minimum?input[at(queue[tail-1])]>=value:input[at(queue[tail-1])]<=value))tail--;queue[tail++]=next++;}
   while(tail>head&&queue[head]<p-r)head++;
   output[at(p)]=input[at(queue[head])];
  }
 }return output;
}
export function despeckleMaterial(rgba,w,h,radius=6){
 const luma=new Float32Array(w*h);for(let p=0;p<luma.length;p++)luma[p]=rgba[p*4]*.299+rgba[p*4+1]*.587+rgba[p*4+2]*.114;
 let opened=luma;for(const minimum of [true,false])for(const horizontal of [true,false])opened=extrema(opened,w,h,radius,minimum,horizontal);
 // Smooth opening plateaus without blurring the source's dark structural seams.
 for(const horizontal of [true,false]){const smooth=new Float32Array(opened.length);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let k=-2;k<=2;k++){const xx=horizontal?Math.max(0,Math.min(w-1,x+k)):x,yy=horizontal?y:Math.max(0,Math.min(h-1,y+k));v+=opened[yy*w+xx]*[1,4,6,4,1][k+2];}smooth[y*w+x]=v/16;}opened=smooth;}
 const out=new Uint8ClampedArray(rgba);
 for(let p=0;p<luma.length;p++){const ratio=luma[p]>0?Math.min(1,opened[p]/luma[p]):1;for(let c=0;c<3;c++)out[p*4+c]=rgba[p*4+c]*ratio;}
 return out;
}
export function createMaterialCleanup(){
 const cache=new WeakMap();
 return image=>{
  if(!image)return image;if(cache.has(image))return cache.get(image);
  const canvas=document.createElement('canvas');canvas.width=image.width||image.naturalWidth;canvas.height=image.height||image.naturalHeight;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);pixels.data.set(despeckleMaterial(pixels.data,canvas.width,canvas.height));ctx.putImageData(pixels,0,0);cache.set(image,canvas);return canvas;
 };
}

// Display-only foliage: retain coherent stems/leaves and suppress keying flecks.
export function despeckleFoliage(rgba,w,h){
 const out=despeckleMaterial(rgba,w,h,4),visited=new Uint8Array(w*h),queue=new Int32Array(w*h);
 for(let seed=0;seed<w*h;seed++){if(visited[seed]||out[seed*4+3]<48)continue;let head=0,tail=1;queue[0]=seed;visited[seed]=1;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);for(let yy=Math.max(0,y-1);yy<=Math.min(h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(w-1,x+1);xx++){const n=yy*w+xx;if(visited[n]||out[n*4+3]<48)continue;visited[n]=1;queue[tail++]=n;}}
  if(tail<48)for(let n=0;n<tail;n++)out[queue[n]*4+3]=0;
 }
 for(let p=0;p<w*h;p++){const i=p*4,y=out[i]*.299+out[i+1]*.587+out[i+2]*.114;out[i]=y;out[i+1]=y*.96;out[i+2]=y*.90;if(out[i+3]<48)out[i+3]=0;}return out;
}
export function createFoliageCleanup(){return image=>{const c=document.createElement('canvas');c.width=image.width||image.naturalWidth;c.height=image.height||image.naturalHeight;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);const p=x.getImageData(0,0,c.width,c.height);p.data.set(despeckleFoliage(p.data,c.width,c.height));x.putImageData(p,0,0);return c;};}
