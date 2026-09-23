import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DIRECTIONS} from './pack-silvertail-remake.mjs';

// Median of the longest dark armor run in the upper torso; bright hair is excluded.
export function torsoAnchor(data,width,b){
 const centers=[],height=b.bottom-b.top;
 for(let y=Math.floor(b.top+height*.25);y<Math.ceil(b.top+height*.38);y++){
  let start=-1,best=0,center=0;
  for(let x=b.left;x<=b.right;x++){
   const i=(y*width+x)*4,armor=x<b.right&&data[i+3]>=200&&Math.max(data[i],data[i+1],data[i+2])<135;
   if(armor&&start<0)start=x;
   if(!armor&&start>=0){if(x-start>best){best=x-start;center=(start+x)/2;}start=-1;}
  }
  if(best>1)centers.push(center);
 }
 if(!centers.length)throw Error('No torso anchor');
 centers.sort((a,b)=>a-b);return centers[Math.floor(centers.length/2)];
}
function bounds(data,width,x0,y0,w,h){
 let left=x0+w,right=x0,top=y0+h,bottom=y0;
 for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)if(data[(y*width+x)*4+3]>=80){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}
 if(right<=left)throw Error('Empty walk pose');return {left,right,top,bottom};
}
export async function packWalk(source,base,destination){
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cw=Math.floor(info.width/2),ch=Math.floor(info.height/2);
 const boxes=Array.from({length:4},(_,i)=>bounds(data,info.width,i%2*cw,Math.floor(i/2)*ch,cw,ch));
 const anchors=boxes.map(b=>torsoAnchor(data,info.width,b));
 const old=await sharp(base).ensureAlpha().raw().toBuffer();
 const idle=bounds(old,480,0,0,48,48),target=torsoAnchor(old,480,idle);
 const bodyHeight=idle.bottom-idle.top;
 const scale=Math.min(bodyHeight/Math.max(...boxes.map(b=>b.bottom-b.top)),...boxes.map((b,i)=>Math.min((target-1)/(anchors[i]-b.left+2),(47-target)/(b.right-anchors[i]+2))));
 const frames=[];
 for(let f=0;f<4;f++){
  const b=boxes[f],left=Math.max(0,b.left-2),top=Math.max(0,b.top-2),w=Math.min(info.width,b.right+2)-left,h=Math.min(info.height,b.bottom+2)-top;
  const rw=Math.round(w*scale),rh=Math.round(h*scale),x=Math.round(target-(anchors[f]-left)*scale),y=47-rh;
  if(x<0||x+rw>48||y<0)throw Error('Walk clipping '+f);
  const sprite=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width:w,height:h}).resize(rw,rh,{kernel:'lanczos3'}).png().toBuffer();
  const cell=await sharp({create:{width:48,height:48,channels:4,background:'#00000000'}}).composite([{input:sprite,left:x,top:y}]).raw().toBuffer();
  for(let row=0;row<48;row++)cell.copy(old,(row*480+(f+2)*48)*4,row*48*4,(row+1)*48*4);
  frames.push({frame:f,box:b,anchor:anchors[f],target,x,y,width:rw,height:rh});
 }
 await sharp(old,{raw:{width:480,height:48,channels:4}}).png().toFile(destination);
 return {source,base,destination,scale,bodyHeight,frames};
}
async function main(){
 const dir='output/silvertail_walk_fix_20260915',out=dir+'/packed';await mkdir(out,{recursive:true});const report=[];
 for(const [d,clock,alias] of DIRECTIONS){
  const r=await packWalk(dir+'/'+d+'.png','img/exoduser_silvertail/'+clock+'.png',out+'/'+clock+'.png');
  await writeFile(out+'/'+alias+'.png',await readFile(out+'/'+clock+'.png'));report.push({direction:d,...r});console.log(d,r.scale.toFixed(4));
 }
 await writeFile(out+'/manifest.json',JSON.stringify(report,null,2)+'\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
