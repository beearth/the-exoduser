/* Deterministic title cleanup. No synthesized grain or sharpening. */
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
function removeSpeckles(data,width,height,median,level){
 const n=width*height,out=Buffer.from(data),candidate=new Uint8Array(n),seen=new Uint8Array(n);
 if(!median){median=Buffer.from(data);for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++)for(let c=0;c<3;c++){const a=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)a.push(data[((y+dy)*width+x+dx)*3+c]);a.sort((a,b)=>a-b);median[(y*width+x)*3+c]=a[4];}}
 for(let p=0;p<n;p++){const i=p*3;candidate[p]=(level===undefined?Math.max(data[i]-median[i],data[i+1]-median[i+1],data[i+2]-median[i+2])>7:Math.max(data[i],data[i+1],data[i+2])>level)?1:0;}
 let components=0,pixels=0;const queue=[];
 for(let p=0;p<n;p++)if(candidate[p]&&!seen[p]){
  queue.length=0;queue.push(p);seen[p]=1;let loX=width,hiX=0,loY=height,hiY=0;
  for(let q=0;q<queue.length;q++){const i=queue[q],x=i%width,y=(i/width)|0;loX=Math.min(loX,x);hiX=Math.max(hiX,x);loY=Math.min(loY,y);hiY=Math.max(hiY,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*width+xx;if(xx>=0&&xx<width&&yy>=0&&yy<height&&candidate[j]&&!seen[j]){seen[j]=1;queue.push(j);}}
  }
  if(queue.length<=(level===undefined?160:900)&&hiX-loX<=(level===undefined?19:60)&&hiY-loY<=(level===undefined?19:60)&&(level===undefined||Math.max(hiX-loX+1,hiY-loY+1)/Math.max(1,Math.min(hiX-loX+1,hiY-loY+1))<3.5)){components++;pixels+=queue.length;for(const i of queue)for(let c=0;c<3;c++)out[i*3+c]=median[i*3+c];}
 }
 return {data:out,components,pixels};
}
function videoWeight(x,y){
 const outside=Math.max(2390-x,x-3530,430-y,y-1490,0);return smooth(outside/65);
}
function displacement(x,y,t){
 const phase=2*Math.PI*t/(206/24),box=smooth((x-2390)/90)*smooth((3530-x)/90)*smooth((y-430)/75)*smooth((1490-y)/75);
 // Keep the entire hub, body and descending blade corridor rigid. Only free tips.
 const hair=smooth((x-2830)/350)*(1-smooth((y-880)/90));
 const cape=smooth((x-3060)/220)*smooth((y-890)/90)*(1-smooth((y-1290)/90));
 const amount=box*Math.max(hair,cape);if(!amount)return [0,0];return [2.4*amount*Math.sin(phase+(y-430)/260),1.1*amount*Math.sin(phase+(x-2700)/220)];
}
async function expandWhiteMask(data,width,height,radius=4,feather=1.2){let p=require('sharp')(data,{raw:{width,height,channels:1}}).erode(radius);if(feather)p=p.blur(feather);return p.greyscale().raw().toBuffer();}
module.exports={expandWhiteMask,removeSpeckles,videoWeight,displacement,smooth};
