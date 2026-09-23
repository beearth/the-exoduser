import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const DIRECTIONS=[['s','6','south'],['se','5','south-east'],['e','3','east'],['ne','1','north-east'],['n','12','north'],['nw','11','north-west'],['w','9','west'],['sw','7','south-west']];

// Connected silhouettes, not fixed cuts: a sword can extend beyond its nominal grid cell.
export function findPoseBoxes(data,width,height){
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height),parts=[];
 for(let seed=0;seed<seen.length;seed++){
  if(seen[seed]||data[seed*4+3]<80)continue;
  let head=0,tail=1;queue[0]=seed;seen[seed]=1;
  let left=width,right=0,top=height,bottom=0;
  while(head<tail){
   const p=queue[head++],x=p%width,y=Math.floor(p/width);
   left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;
    const q=ny*width+nx;if(!seen[q]&&data[q*4+3]>=80){seen[q]=1;queue[tail++]=q;}
   }
  }
  parts.push({left,right,top,bottom,area:tail});
 }
 const minArea=width*height*.001;
 const big=parts.filter(p=>p.area>minArea).sort((a,b)=>b.area-a.area);
 if(big.length!==9)throw Error('Expected 9 separate poses, found '+big.length+'; inspect master sheet');
 // Order by row then by x; feet/weapon extents may vary, use body bounding-box centres.
 big.sort((a,b)=>(a.top+a.bottom)-(b.top+b.bottom));
 const ordered=[];for(let r=0;r<3;r++)ordered.push(...big.slice(r*3,r*3+3).sort((a,b)=>(a.left+a.right)-(b.left+b.right)));
 return ordered;
}

export function makeFramePlan(boxes,cell=48){
 if(boxes.length!==9)throw Error('Expected 9 poses');
 const maxWidth=Math.max(...boxes.map(b=>b.right-b.left)),maxHeight=Math.max(...boxes.map(b=>b.bottom-b.top));
 const scale=Math.min((cell-2)/maxWidth,(cell-2)/maxHeight);
 const body=boxes.slice(0,5),idleHeight=boxes[0].bottom-boxes[0].top;
 const bodyScale=Math.min(45/idleHeight,(cell-2)/Math.max(...body.map(b=>b.right-b.left)),(cell-2)/Math.max(...body.map(b=>b.bottom-b.top)));
 return {scale,bodyScale,cell,sourceFrames:[0,0,1,2,3,4,5,6,7,8]};
}

export async function packDirection(source,destination){
 const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const boxes=findPoseBoxes(data,info.width,info.height);
 // Preserve antialiasing fringe using a two-pixel transparent margin around each silhouette.
 const crops=boxes.map(b=>({left:Math.max(0,b.left-2),top:Math.max(0,b.top-2),right:Math.min(info.width,b.right+2),bottom:Math.min(info.height,b.bottom+2)}));
 const plan=makeFramePlan(crops),cells=[],metrics=[];
 for(let i=0;i<9;i++){
  const b=crops[i],w=b.right-b.left,h=b.bottom-b.top;
  const scale=i<5?plan.bodyScale:plan.scale;
  const width=Math.max(1,Math.round(w*scale)),height=Math.max(1,Math.round(h*scale));
  const sprite=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left:b.left,top:b.top,width:w,height:h}).resize(width,height,{kernel:'lanczos3'}).png().toBuffer();
  const cell=await sharp({create:{width:48,height:48,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:sprite,left:Math.floor((48-width)/2),top:47-height}]).png().toBuffer();
  cells.push(cell);metrics.push({source:i,crop:b,width,height});
 }
 const png=await sharp({create:{width:480,height:48,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(plan.sourceFrames.map((f,i)=>({input:cells[f],left:i*48,top:0}))).png().toBuffer();
 await writeFile(destination,png);
 return {source,destination,sourceSize:[info.width,info.height],...plan,frames:metrics,bytes:png.length};
}

async function main(){
 const root=resolve(fileURLToPath(new URL('..',import.meta.url))),output=resolve(process.argv[2]||join(root,'output/silvertail_sprites_20260915/packed'));
 await mkdir(output,{recursive:true});const results=[];
 for(const [d,clock,alias] of DIRECTIONS){
  const src=join(root,'assets/sprites/player/silvertail_v2',d+'.png'),dest=join(output,clock+'.png');
  const result=await packDirection(src,dest);await writeFile(join(output,alias+'.png'),await readFile(dest));results.push({direction:d,clock,...result});
  console.log(d, result.bytes+' bytes','scale '+result.scale.toFixed(4));
 }
 await writeFile(join(output,'manifest.json'),JSON.stringify(results,null,2)+'\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
