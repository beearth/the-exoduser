/* Only the permitted skull-waterfall masks. Does not modify or encode the video. */
const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const frame=process.argv[2];
if(!frame)throw Error('Usage: node tools/build-title-final-falls.cjs <final-main/t_1.png>');
const falls=[{"id":"near","box":[860,320,60,253],"mouth":[877,328],"contact":[895,560],"speed":100},{"id":"far","box":[1043,385,44,203],"mouth":[1056,392],"contact":[1066,579],"speed":75}];
(async()=>{
 const image=sharp(frame),meta=await image.metadata();
 if(meta.width!==2036||meta.height!==1016)throw Error('Expected final video coordinates 2036x1016');
 const rgb=await image.removeAlpha().raw().toBuffer(),out=path.join(root,'assets/title-signboard/C2');
 for(const [index,f]of falls.entries()){
  const [bx,by,w,h]=f.box,raw=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const yy=by+y,xx=bx+x,t=Math.max(0,Math.min(1,(yy-f.mouth[1])/(f.contact[1]-f.mouth[1])));
   const center=f.mouth[0]+(f.contact[0]-f.mouth[0])*t,half=index===0?10+3*t:7.5;
   const edge=Math.max(0,Math.min(1,(half-Math.abs(xx-center))/3));
   const top=Math.max(0,Math.min(1,(yy-f.mouth[1])/5)),bottom=Math.max(0,Math.min(1,(f.contact[1]-yy)/12));
   const i=(yy*2036+xx)*3,r=rgb[i],g=rgb[i+1],b=rgb[i+2];
   const red=Math.max(0,Math.min(1,(r-Math.max(g,b)*1.3-7)/27));
   const cover=index===1&&yy>=493&&yy<=515?0:index===1&&yy>515?.28:1,k=(y*w+x)*4;
   raw[k]=raw[k+1]=raw[k+2]=255;raw[k+3]=Math.round(255*edge*top*bottom*red*cover);
  }
  await sharp(raw,{raw:{width:w,height:h,channels:4}}).blur(.6).png().toFile(out+'/fall-'+f.id+'.png');
 }
 console.log('Final-video waterfall masks written; video untouched.');
})().catch(e=>{console.error(e);process.exitCode=1;});
