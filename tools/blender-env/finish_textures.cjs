// 베이크 원본을 보존하고 곡률·AO의 넓은 명암으로 표면을 정리한다. 점/그레인 생성 없음.
const fs=require('fs'),sharp=require('G:/exoduser/node_modules/sharp');
const root='I:/EXODUSER-Storage/demo-art/blender-env',tx=root+'/delivery/Assets/Exoduser/Art/Environment/CH1_1/Textures',backup=root+'/source/최종원베이크';
const changed=new Set(['HE_Cliff_Mass_A','HE_Cliff_Drop_B','HE_Rock_Connector','HE_Ruin_Wall','HE_Ruin_Pillar','HE_Ash_Gravel']);
fs.mkdirSync(backup,{recursive:true});
(async()=>{
 const rows=JSON.parse(fs.readFileSync(root+'/source/모듈명세.json','utf8')).filter(r=>!process.argv[2]||r.id===process.argv[2]);const stats=[];
 for(const r of rows){
  const id=r.id,p=tx+'/'+id+'_BaseColor.png';
  if(!fs.existsSync(backup+'/'+id+'_BaseColor.png'))fs.copyFileSync(!changed.has(id)&&fs.existsSync(root+'/source/원베이크/'+id+'_BaseColor.png')?root+'/source/원베이크/'+id+'_BaseColor.png':p,backup+'/'+id+'_BaseColor.png');
  const base=await sharp(backup+'/'+id+'_BaseColor.png').removeAlpha().blur(.65).raw().toBuffer({resolveWithObject:true});
  const cur=await sharp(tx+'/'+id+'_Curvature.png').greyscale().blur(2).raw().toBuffer();
  const ao=await sharp(tx+'/'+id+'_AO.png').greyscale().blur(.6).raw().toBuffer();
  const rough=await sharp(tx+'/'+id+'_Roughness.png').greyscale().raw().toBuffer();
  const metal=await sharp(tx+'/'+id+'_Metallic.png').greyscale().raw().toBuffer();
  const out=Buffer.alloc(base.data.length),packed=Buffer.alloc(rough.length*4);
  for(let i=0;i<rough.length;i++){
   const curve=Math.max(-.08,Math.min(.09,(cur[i]/255-.5)*.5));
   const gain=(.86+.14*ao[i]/255)+curve;
   for(let c=0;c<3;c++)out[i*3+c]=Math.round(Math.max(0,Math.min(255,base.data[i*3+c]*gain)));
   packed[i*4]=metal[i];packed[i*4+1]=0;packed[i*4+2]=0;packed[i*4+3]=255-rough[i];
  }
  await sharp(out,{raw:{width:base.info.width,height:base.info.height,channels:3}}).png().toFile(p+'.tmp.png');fs.renameSync(p+'.tmp.png',p);
  await sharp(packed,{raw:{width:base.info.width,height:base.info.height,channels:4}}).png().toFile(tx+'/'+id+'_MetallicSmoothness.png');
  for(const k of ['BaseColor','Normal','AO','Curvature']){const s=await sharp(tx+'/'+id+'_'+k+'.png').stats();stats.push({id,맵:k,채널:s.channels.map(c=>({min:c.min,max:c.max,stdev:c.stdev}))});}
 }
 fs.writeFileSync(root+'/베이크-픽셀검사.json',JSON.stringify(stats,null,2));console.log('회화풍 명암·금속평활 맵',rows.length);
})().catch(e=>{console.error(e);process.exitCode=1});
