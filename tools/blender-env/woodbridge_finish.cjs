// 원 베이크를 별도로 보존하고 넓은 AO·곡률만 합성한다. 점 노이즈 생성 없음.
const fs=require('fs'),sharp=require('G:/exoduser/node_modules/sharp'),crypto=require('crypto');
const root='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2',tx=root+'/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures';
const changed=['RF_Ancient_Rotten_Tree','RF_Rotten_Wood_Bridge','RF_Fallen_Log','RF_Hanging_Moss','RF_Fungal_Colony','RF_Foreground_Roots','RF_River_Stake_Cluster','RF_Bridge_Torch_Holder','RF_Fractured_Stump','RF_Gnarled_Split_Trunk','RF_Foreground_Branch_Frame','RF_Withered_Shrub','RF_Corroded_Riverbank'];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 const stats=[];fs.mkdirSync(root+'/source/원베이크',{recursive:true});
 const bakeTime=fs.statSync(root+'/source/베이크완료.json').mtimeMs,statePath=root+'/source/톤입력.json';
 const previous=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):null;
 const newBake=!previous||previous.베이크시각!==bakeTime;
 const history=root+'/source/원베이크이력/'+new Date().toISOString().replace(/[:.]/g,'-');
 for(const id of changed){
  if(id==='RF_Hanging_Moss'&&fs.existsSync(root+'/source/이끼알파완료.json'))continue;
  if(id==='RF_Withered_Shrub'&&fs.existsSync(root+'/source/덤불알파완료.json'))continue;
  const p=tx+'/'+id+'_BaseColor.png',backup=root+'/source/원베이크/'+id+'_BaseColor.png';
  if(!fs.existsSync(p))continue;
  if(newBake||!fs.existsSync(backup)||process.argv.slice(2).includes(id)){if(fs.existsSync(backup)){fs.mkdirSync(history,{recursive:true});fs.copyFileSync(backup,history+'/'+id+'_BaseColor.png');}fs.copyFileSync(p,backup);}
  const base=await sharp(backup).removeAlpha().blur(.55).raw().toBuffer({resolveWithObject:true});
  const ao=await sharp(tx+'/'+id+'_AO.png').greyscale().blur(1).raw().toBuffer(),cur=await sharp(tx+'/'+id+'_Curvature.png').greyscale().blur(2).raw().toBuffer();
  const rough=await sharp(tx+'/'+id+'_Roughness.png').greyscale().raw().toBuffer(),metal=await sharp(tx+'/'+id+'_Metallic.png').greyscale().raw().toBuffer(),out=Buffer.alloc(base.data.length),packed=Buffer.alloc(rough.length*4);
  for(let i=0;i<rough.length;i++){
   const gain=.91+.09*ao[i]/255+Math.max(-.035,Math.min(.045,(cur[i]/255-.5)*.24));
   for(let c=0;c<3;c++)out[i*3+c]=Math.max(0,Math.min(255,Math.round(base.data[i*3+c]*gain)));
   rough[i]=Math.max(rough[i],id.includes('Moss')?235:205);packed[i*4]=metal[i];packed[i*4+3]=255-rough[i];
  }
  const raw={width:base.info.width,height:base.info.height};
  await sharp(out,{raw:{...raw,channels:3}}).png().toFile(p+'.tmp.png');fs.renameSync(p+'.tmp.png',p);
  await sharp(rough,{raw:{...raw,channels:1}}).png().toFile(tx+'/'+id+'_Roughness.png.tmp.png');fs.renameSync(tx+'/'+id+'_Roughness.png.tmp.png',tx+'/'+id+'_Roughness.png');
  await sharp(packed,{raw:{...raw,channels:4}}).png().toFile(tx+'/'+id+'_MetallicSmoothness.png');
  stats.push({id,원베이크SHA:sha(backup),최종SHA:sha(p),채널:(await sharp(p).stats()).channels.map(c=>({최소:c.min,최대:c.max,표준편차:c.stdev}))});
 }
 await sharp('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1/pbr-source/burned_ground_01_Diffuse.jpg').blur(3).jpeg({quality:95}).toFile(root+'/source/검수_저주파토양.jpg');
 fs.writeFileSync(root+'/베이크-픽셀검사.json',JSON.stringify(stats,null,2));fs.writeFileSync(statePath,JSON.stringify({베이크시각:bakeTime,원본:stats.map(x=>({id:x.id,sha256:x.원베이크SHA}))},null,2));console.log('원베이크보존·곡률/AO 톤·R금속A평활 패킹',stats.length);
})().catch(e=>{console.error(e);process.exitCode=1});
