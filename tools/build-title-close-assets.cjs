/* 승인 close 원화의 정지판·폭포·구름 마스크. 새 이미지 생성 없음. */
const fs=require('node:fs/promises'),path=require('node:path');
const sharp=require('sharp');
const source=process.argv[2]||"G:/exoduser/tmp/design-review/20261102_title_keyframe/close/C2-close-3840x1920.png";
const out=path.resolve('assets/title-signboard/C2');
const falls=[{"id":"near","box":[862,319,54,241],"mouth":[876,329],"contact":[893,551],"speed":100},{"id":"far","box":[1041,381,41,200],"mouth":[1053,389],"contact":[1063,575],"speed":75}];
(async()=>{
 await fs.mkdir(out,{recursive:true});
 await sharp(source).webp({quality:97,effort:4}).toFile(out+'/still.webp');
 const virtual=await sharp(source).resize(2036,1018).removeAlpha().raw().toBuffer();
 for(const [index,f]of falls.entries()){
  const [bx,by,w,h]=f.box,raw=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const yy=by+y,xx=bx+x,t=Math.max(0,Math.min(1,(yy-f.mouth[1])/(f.contact[1]-f.mouth[1])));
   const center=f.mouth[0]+(f.contact[0]-f.mouth[0])*t,half=index===0?10+3*t:7.5;
   const edge=Math.max(0,Math.min(1,(half-Math.abs(xx-center))/3));
   const top=Math.max(0,Math.min(1,(yy-f.mouth[1])/5)),bottom=Math.max(0,Math.min(1,(f.contact[1]-yy)/12));
   const i=(yy*2036+xx)*3,r=virtual[i],g=virtual[i+1],b=virtual[i+2];
   const red=Math.max(0,Math.min(1,(r-Math.max(g,b)*1.3-7)/27));
   const cover=index===1&&yy>=479&&yy<=506?0:index===1&&yy>506?.28:1,k=(y*w+x)*4;
   raw[k]=raw[k+1]=raw[k+2]=255;raw[k+3]=Math.round(255*edge*top*bottom*red*cover);
  }
  await sharp(raw,{raw:{width:w,height:h,channels:4}}).blur(.6).png().toFile(out+'/fall-'+f.id+'.png');
 }
 const cloud=Buffer.alloc(2036*1018*4);
 for(let y=0;y<1018;y++)for(let x=0;x<2036;x++){
  const u=x/2036,v=y/1018;let a=0;
  for(const [mx,my,rx,ry]of [[.52,.285,.075,.065],[.72,.16,.14,.13],[.865,.285,.075,.07]]){
   const d=((u-mx)/rx)**2+((v-my)/ry)**2;a=Math.max(a,Math.max(0,1-d)**2);
  }
  const moon=((u-.595)/.077)**2+((v-.166)/.135)**2;
  if(moon<1)a*=Math.max(0,(moon-.75)/.25);
  const q=(y*2036+x)*3,i=(y*2036+x)*4,bright=Math.max(virtual[q],virtual[q+1],virtual[q+2]);
  a*=Math.max(0,Math.min(1,(bright-43)/24));
  cloud[i]=virtual[q];cloud[i+1]=virtual[q+1];cloud[i+2]=virtual[q+2];cloud[i+3]=Math.round(a*255);
 }
 await sharp(cloud,{raw:{width:2036,height:1018,channels:4}}).webp({quality:95,alphaQuality:100,effort:4}).toFile(out+'/cloud-flow.webp');
})().catch(e=>{console.error(e);process.exitCode=1;});
