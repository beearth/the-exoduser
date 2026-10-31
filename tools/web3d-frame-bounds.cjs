const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..');
(async()=>{
 sharp.concurrency(1);const images={},files=[['assets/web3d/sprites/warrior-base.png',96,96],['assets/web3d/sprites/warrior-attack.png',160,160],['assets/web3d/sprites/warrior-dash.png',128,128]];
 for(const d of ['south','south_east','east','north_east','north','north_west','west','south_west'])files.push(['assets/web3d/sprites/enemy-'+d+'.png',512,512],['img/atlas_ch1_8dir_'+d+'.png',256,256],['img/atlas_ch1_8dir_walk_'+d+'.png',256,256]);
 files.push(['img/proj_phys_mouth.png',768,384],['img/proj_elem_orb.png',512,256]);
 for(const [file,fw,fh]of files){
  const bytes=await fs.readFile(path.join(root,file)),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),frames={};
  for(let y0=0;y0+fh<=info.height;y0+=fh)for(let x0=0;x0+fw<=info.width;x0+=fw){
   let left=fw,top=fh,right=-1,bottom=-1;
   for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)if(data[((y+y0)*info.width+x+x0)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
   frames[[x0,y0,fw,fh].join(':')]=right>=left?{x:x0+left,y:y0+top,w:right-left+1,h:bottom-top+1}:{x:x0,y:y0,w:fw,h:fh};
  }
  images[file]={width:info.width,height:info.height,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),frames};
 }
 await fs.writeFile(root+'/assets/web3d/frame-bounds.json',JSON.stringify({alphaThreshold:32,images}));console.log('알파 경계 '+files.length+'개 원본의 정확한 SHA/프레임 기록. 원본 이미지 변경0.');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
