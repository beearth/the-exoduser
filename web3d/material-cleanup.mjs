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
