/* Local, single-writer title compositor. Existing Kling and approved still only.
 * node tools/build-title-cleanup.cjs <ffmpeg.exe> <work-directory> [--preview]
 * Fragment-style inverse sampling is baked once; no runtime CPU pixel loop.
 */
const fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process'),sharp=require('sharp');
const {once}=require('node:events');
const {expandWhiteMask,removeSpeckles,videoWeight,displacement,smooth}=require('./title-cleanup.cjs');
sharp.concurrency(1);
const W=3840,H=1920,FPS=24,N=206,S=3840/2036;
const asset=path.resolve('assets/title-signboard/C2');
const source='I:/EXODUSER-Storage/codex-takeover/title-kling-C2-20261102/close-final/loop.mp4';
const original='G:/exoduser/tmp/design-review/20261102_title_keyframe/close/C2-close-3840x1920.png';
const skyPoints=[[0,0],[1,0],[1,.54],[.91,.52],[.85,.55],[.75,.54],[.65,.51],[.60,.48],[.56,.44],[.54,.41],[.52,.43],[.50,.42],[.46,.38],[.44,.36],[.42,.29],[.40,.33],[.38,.28],[.36,.21],[.34,.25],[.32,.19],[.30,.22],[.28,.17],[.26,.21],[.245,.10],[.23,.17],[.21,.18],[.19,.12],[.17,.19],[.14,.23],[.11,.20],[0,.29]];
const riverPoints=[[0,.845],[.15,.774],[.27,.745],[.39,.637],[.49,.594],[.56,.598],[.60,.631],[.583,.690],[.58,.81],[.51,1],[0,1]];
function inside(x,y,p){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if((p[i][1]>y)!=(p[j][1]>y)&&x<(p[j][0]-p[i][0])*(y-p[i][1])/(p[j][1]-p[i][1])+p[i][0])yes=!yes;return yes;}
async function mask(points){const b=Buffer.alloc(1018*509);for(let y=0;y<509;y++)for(let x=0;x<1018;x++)b[y*1018+x]=inside(x/1018,y/509,points)?255:0;return sharp(b,{raw:{width:1018,height:509,channels:1}}).blur(4).resize(W,H).greyscale().raw().toBuffer();}
function sample(b,w,h,x,y,c,channels=3){x=Math.max(0,Math.min(w-1.001,x));y=Math.max(0,Math.min(h-1.001,y));const xx=x|0,yy=y|0,fx=x-xx,fy=y-yy,i=(yy*w+xx)*channels+c;return (b[i]*(1-fx)+b[i+channels]*fx)*(1-fy)+(b[i+w*channels]*(1-fx)+b[i+(w+1)*channels]*fx)*fy;}
async function cleanStill(input){let b=await sharp(input).removeAlpha().raw().toBuffer();const passes=[];for(let k=0;k<2;k++){const median=await sharp(b,{raw:{width:W,height:H,channels:3}}).median(9).raw().toBuffer();const q=removeSpeckles(b,W,H,median);b=q.data;passes.push({components:q.components,pixels:q.pixels});}
 // Point-shaped rock glints need their full collar removed, not just peak pixels.
 // Confine this wider reconstruction to foreground rock; never hair/armor/sky.
 const m=await sharp(b,{raw:{width:W,height:H,channels:3}}).median(25).raw().toBuffer(),dots=Buffer.alloc(W*H);
 for(const level of [28,40,55,75,100,135,175,210]){const q=removeSpeckles(b,W,H,m,level);for(let p=0;p<dots.length;p++){const x=p%W,y=(p/W)|0;
  const rock=(x>2300&&y>1350)||(x>3500&&y>1010)||(x<1200&&y>1710);
  const feet=x>2420&&x<2920&&y>1270&&y<1445,sword=x>2880&&x<3080&&y>1260&&y<1520;
  if(rock&&!feet&&!sword&&(q.data[p*3]!==b[p*3]||q.data[p*3+1]!==b[p*3+1]||q.data[p*3+2]!==b[p*3+2]))dots[p]=255;
 }}
 const a=await expandWhiteMask(dots,W,H,4,1.2);
 for(let p=0;p<a.length;p++)if(a[p])for(let c=0;c<3;c++)b[p*3+c]=Math.round(b[p*3+c]*(1-a[p]/255)+Math.min(b[p*3+c],m[p*3+c])*a[p]/255);
 passes.push({rockCollar:'median25 only at detected foreground glints, white expansion4, feather1.2; feet/sword excluded'});
 return {data:b,passes};}
async function main(){
 const [ffmpeg,work]=process.argv.slice(2);if(!ffmpeg||!work)throw Error('Absolute ffmpeg and work directory required');await fs.mkdir(work,{recursive:true});
 const preview=process.argv.includes('--preview');
 const still=await cleanStill(process.env.TITLE_STILL_SOURCE||'I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102/C2-close-backblade-moon-3840x1920.png');
 await sharp(still.data,{raw:{width:W,height:H,channels:3}}).png().toFile(work+'/clean-still.png');
 const sky=await mask(skyPoints),water=await mask(riverPoints),weights=new Float32Array(W*H),skyIndices=[],waterIndices=[],personIndices=[];
 // Whole figure + 40px minimum: every pixel has one source, including all cloth.
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=y*W+x,protect=videoWeight(x,y);weights[p]=protect;
  if(sky[p]>0&&protect>0)skyIndices.push(p);
  else if(water[p]>0&&protect>0)waterIndices.push(p);
  if(x>=2390&&x<=3530&&y>=430&&y<=1490)personIndices.push(p);
 }
 const flowMask=Buffer.alloc(W*H);for(let p=0;p<flowMask.length;p++)flowMask[p]=Math.round(sky[p]*weights[p]);await sharp(flowMask,{raw:{width:W,height:H,channels:1}}).resize(2036,1018).png().toFile(work+'/cloud-video-mask.png');
 const restoration=await sharp(asset+'/moon-cloud-restoration.png').ensureAlpha().raw().toBuffer();
 // Moon disc only. Old broad plate is intentionally replaced: no frozen clouds.
 const lunar=await sharp(original).extract({left:1940,top:0,width:760,height:850}).ensureAlpha().raw().toBuffer();
 for(let y=0;y<850;y++)for(let x=0;x<760;x++){const d=Math.hypot((x+1940)/S-1212,y/S-167);lunar[(y*760+x)*4+3]=Math.round(255*(1-smooth((d-80)/26)));}
 const b={left:1933,top:0,width:632,height:868},plate=Buffer.alloc(b.width*b.height*4);
 // Keep the existing virtual plate rectangle; shift source lunar pixels by -60,+268.
 for(let y=0;y<b.height;y++)for(let x=0;x<b.width;x++){const sx=x+b.left+60-1940,sy=y-268;if(sx>=0&&sx<760&&sy>=0&&sy<850)for(let c=0;c<4;c++)plate[(y*b.width+x)*4+c]=lunar[(sy*760+sx)*4+c];}
 await sharp(plate,{raw:{width:b.width,height:b.height,channels:4}}).webp({lossless:true}).toFile(work+'/moon-disc.webp');
 const decode=cp.spawn(ffmpeg,['-v','error','-threads','2','-i',source,'-an','-vf','hqdn3d=1.2:1.0:2:2,scale=3840:1920:flags=lanczos','-pix_fmt','rgb24','-f','rawvideo','-'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
 let decodeErrors='';decode.stderr.on('data',b=>decodeErrors+=b);const decodedExit=once(decode,'close');
 let encoder,encodedExit,encoderErrors='';
 if(!preview){encoder=cp.spawn(ffmpeg,['-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','3840x1920','-r','24','-i','-','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','16','-pix_fmt','yuv420p','-g','48','-movflags','+faststart',work+'/clean-3840.mp4'],{windowsHide:true,stdio:['pipe','ignore','pipe']});encoder.stderr.on('data',b=>encoderErrors+=b);encodedExit=once(encoder,'close');}
 const bytes=W*H*3;let parts=[],available=0,index=0;
 for await(const chunk of decode.stdout){parts.push(chunk);available+=chunk.length;if(available<bytes)continue;let pending=Buffer.concat(parts,available);
  while(pending.length>=bytes){const frame=pending.subarray(0,bytes);pending=pending.subarray(bytes);const t=index/FPS,phase=2*Math.PI*index/N;
   if(!preview||[0,72,168,205].includes(index)){
    const result=Buffer.from(still.data),rowDx=new Float32Array(H),rowDy=new Float32Array(H);
    for(let y=0;y<H;y++){rowDx[y]=28*Math.sin(phase+y/420);rowDy[y]=5*Math.sin(phase+y/530);}
    for(const p of skyIndices){const x=p%W,y=(p/W)|0,sx=x+rowDx[y],sy=y+rowDy[y],a=sky[p]/255*weights[p],rx=sx-1940,ry=sy;
     let patch=0;if(rx>=0&&rx<759&&ry>=0&&ry<849)patch=sample(restoration,760,850,rx,ry,3,4)/255;
     for(let c=0;c<3;c++){const v=sample(frame,W,H,sx,sy,c)*(1-patch)+(patch?sample(restoration,760,850,rx,ry,c,4)*patch:0);result[p*3+c]=Math.round(result[p*3+c]*(1-a)+v*a);}
    }
    for(const p of waterIndices){const a=water[p]/255*weights[p];for(let c=0;c<3;c++)result[p*3+c]=Math.round(result[p*3+c]*(1-a)+frame[p*3+c]*a);}
    // Falls share registered video pixels; their runtime masks add flowing texture.
    for(const [bx,by,bw,bh]of [[862,319,54,241],[1041,381,41,200]])for(let y=Math.round(by*S);y<Math.round((by+bh)*S);y++)for(let x=Math.round(bx*S);x<Math.round((bx+bw)*S);x++){
     const edge=Math.min(x-bx*S,(bx+bw)*S-x,y-by*S,(by+bh)*S-y),a=smooth(edge/12)*.85,p=(y*W+x)*3;for(let c=0;c<3;c++)result[p+c]=Math.round(result[p+c]*(1-a)+frame[p+c]*a);
    }
    for(const p of personIndices){const x=p%W,y=(p/W)|0,[dx,dy]=displacement(x,y,t);if(dx||dy)for(let c=0;c<3;c++)result[p*3+c]=Math.round(sample(still.data,W,H,x+dx,y+dy,c));}
    if([0,72,168,205].includes(index)){
     await sharp(result,{raw:{width:W,height:H,channels:3}}).png().toFile(work+'/B-'+index+'.png');
     const A=Buffer.from(result);for(let y=430;y<1490;y++)for(let x=2390;x<3530;x++)for(let c=0;c<3;c++)A[(y*W+x)*3+c]=frame[(y*W+x)*3+c];
     await sharp(A,{raw:{width:W,height:H,channels:3}}).png().toFile(work+'/A-'+index+'.png');
    }
    if(encoder&&!encoder.stdin.write(result))await once(encoder.stdin,'drain');
   }
   index++;if(index%24===0)console.log('frame '+index+'/'+N);
  }
  parts=pending.length?[pending]:[];available=pending.length;
 }
 const [exit]=await decodedExit;if(exit)throw Error('Decode '+exit+' '+decodeErrors);if(index!==N)throw Error('Incomplete frames '+index);
 if(encoder){encoder.stdin.end();const [exit]=await encodedExit;if(exit)throw Error('Encode '+exit+' '+encoderErrors);}
 const info={frames:index,fps:FPS,seconds:N/FPS,stillCleanup:still.passes,grain:false,sharpen:false,character:'B: all approved still, body/face/feet/sword fixed; continuous inverse displacement only on hair/cloth',protectedBox4K:[2390,430,1140,1060],featherOutside:65,cloudFlow:{source,dx:'28*sin(2*pi*t/(206/24)+y/420)',dy:'5*sin(2*pi*t/(206/24)+y/530)',oldMoon:'existing cloud restoration texture advected by same sky field',moon:'separate still disc only, no cloud plate'}};
 await fs.writeFile(work+'/build-receipt.json',JSON.stringify(info,null,2)+'\n');console.log(JSON.stringify(info));
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={inside,skyPoints,riverPoints};
