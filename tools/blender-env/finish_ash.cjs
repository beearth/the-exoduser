const fs=require('fs'),sharp=require('G:/exoduser/node_modules/sharp');
const root='I:/EXODUSER-Storage/demo-art/blender-env',dir=root+'/delivery/Assets/Exoduser/Art/Environment/CH1_1/Textures',id='HE_Ash_Gravel';
(async()=>{
 for(const k of ['BaseColor','Normal']){
  const p=dir+'/'+id+'_'+k+'.png',original=root+'/source/재-마감전-'+k+'.png';
  if(!fs.existsSync(original))fs.copyFileSync(p,original);
  const meta=await sharp(original).metadata();
  await sharp(original).resize(256,256,{kernel:'lanczos3'}).blur(1).resize(meta.width,meta.height,{kernel:'cubic'}).png().toFile(p+'.tmp.png');fs.renameSync(p+'.tmp.png',p);
 }
 fs.writeFileSync(root+'/재-노이즈수정.json',JSON.stringify({대상:id,수정:'CC0 재 원본의 흰 미세입자가 렌더에서 점무늬로 읽혀, albedo/normal을 256 저주파로 정리. 새 점/노이즈 생성 없음.',접지:'피벗 높이를 지면에 두고 음수 하부를 묻음'},null,2));
 console.log('재 표면 미세 점무늬 정리 완료');
})().catch(e=>{console.error(e);process.exitCode=1});
