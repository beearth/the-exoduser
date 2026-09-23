const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),source=path.join(root,'output/warrior_swing_weight_20260915');
const scale=.098,cell=80,footY=58;
const dirs=['s','se','e','ne','n','nw','w','sw'];
const mirrors={nw:'ne',w:'e',sw:'se'};
async function main(){
 const {findPoseBoxes}=await import('./pack-silvertail-remake.mjs');
 const layers=[],report=[];
 for(let row=0;row<dirs.length;row++){
  const dir=dirs[row],src=mirrors[dir]||dir,im=sharp(path.join(source,src+'.png'));
  const full=await im.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const boxes=findPoseBoxes(full.data,full.info.width,full.info.height);
  for(let f=0;f<9;f++){
   // Neutral endpoints share exactly the same source pose.
   const n=f===8?0:f;
   const box=boxes[n],cw=box.right-box.left,ch=box.bottom-box.top;
   const fw=full.info.width,fh=full.info.height,mask=new Uint8Array(fw*fh),queue=new Int32Array(fw*fh);
   let seed=-1;
   for(let yy=box.top;yy<box.bottom&&seed<0;yy++)for(let xx=box.left;xx<box.right;xx++)if(full.data[(yy*fw+xx)*4+3]>=80){seed=yy*fw+xx;break;}
   let head=0,tail=1;queue[0]=seed;mask[seed]=1;
   while(head<tail){const p=queue[head++],px=p%fw,py=Math.floor(p/fw);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=px+dx,yy=py+dy;if(xx<0||yy<0||xx>=fw||yy>=fh)continue;const q=yy*fw+xx;if(!mask[q]&&full.data[q*4+3]>=80){mask[q]=1;queue[tail++]=q;}}}
   // Isolate the connected silhouette: blades may cross nominal grid boundaries.
   const data=Buffer.alloc(cw*ch*4),info={width:cw,height:ch,channels:4};
   for(let yy=0;yy<ch;yy++)for(let xx=0;xx<cw;xx++){const p=(yy+box.top)*fw+xx+box.left;if(mask[p])full.data.copy(data,(yy*cw+xx)*4,p*4,p*4+4);}
   const boot=[];
   for(let y=Math.floor(ch*.6);y<ch;y++){
    const xs=[];
    for(let x=Math.floor(cw*.12);x<cw*.88;x++){
     const i=(y*cw+x)*4,r=data[i],g=data[i+1],b=data[i+2];
     if(data[i+3]>200&&Math.max(r,g,b)<145&&g>r*.48)xs.push(x);
    }
    if(xs.length>=12)boot.push({y,xs});
   }
   if(!boot.length)throw Error('No planted feet '+dir+f);
   const bottom=boot.at(-1).y,feet=boot.filter(r=>r.y>bottom-16).flatMap(r=>r.xs);
   const anchor=(Math.min(...feet)+Math.max(...feet))/2;
   const width=Math.round(cw*scale),height=Math.round(ch*scale);
   let png=await sharp(data,{raw:info}).resize(width,height,{kernel:'lanczos3'}).png().toBuffer();
   let x=Math.round(40-anchor*scale),y=Math.round(footY-bottom*scale);
   if(mirrors[dir]){png=await sharp(png).flop().png().toBuffer();x=cell-x-width;}
   if(x<0||y<0||x+width>cell||y+height>cell)throw Error('Clipped cell '+dir+f);
   layers.push({input:png,left:f*cell+x,top:row*cell+y});
   report.push({dir,frame:f,source:src,sourceFrame:n,mirror:!!mirrors[dir],anchor,bottom,x,y,scale});
  }
 }
 await sharp({create:{width:720,height:640,channels:4,background:'#00000000'}}).composite(layers).png().toFile(path.join(root,'img/exoduser_warrior/attack-bat-v1.png'));
 fs.writeFileSync(path.join(source,'packing.json'),JSON.stringify({cell,scale,footY,frames:report},null,2)+'\n');
 console.log('Packed 8 directions × 9 poses with shared scale and planted-foot anchors');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
