const fs=require('fs'),path=require('path'),sharp=require('G:/exoduser/node_modules/sharp');
const root='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1',render=root+'/renders',dir=root+'/compare';fs.mkdirSync(dir,{recursive:true});
const labels={RF_Ancient_Rotten_Tree:'썩은 거목·스캔 뿌리',RF_Fallen_Log:'쓰러진 고목',RF_Hanging_Moss:'늘어진 이끼',RF_Fungal_Colony:'부후균·균사',RF_Withered_Shrub:'시든 덤불',RF_Corroded_Riverbank:'부식된 강가 암반',RF_Riverbed:'독액 강바닥 형상',RF_Foam_Bank:'강가의 탁한 거품',RF_Rotten_Wood_Bridge:'썩은 나무다리',RF_Broken_Stone_Bridge:'무너진 돌다리',RF_Forest_Vista_Card:'먼 숲 투명 카드'};
const svg=(w,h,title,sub='')=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#111821"/><text x="24" y="38" fill="#eee5d4" font-family="Malgun Gothic" font-size="26">${title}</text><text x="24" y="${Math.min(73,h-10)}" fill="#aebac5" font-family="Malgun Gothic" font-size="19">${sub}</text></svg>`);
(async()=>{
 const files=fs.readdirSync(render).filter(x=>/^RF_.*(?<!_side)(?<!_shape)\.png$/.test(x));
 const thumbs=[];
 for(let i=0;i<files.length;i++){
  const f=files[i],id=f.slice(0,-4),isRuin=/Ruin|Chain|Vista/.test(id);
  const rp='G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 '+(/Tree|Log|Moss|Fungal|Shrub|Vista/.test(id)?'091218':/Wood_Bridge/.test(id)?'091234':/Stone_Bridge/.test(id)?'091256':'091244')+'.png';
  const ref=await sharp(rp).resize(1600,1000,{fit:'contain',background:'#111821'}).png().toBuffer();
  await sharp({create:{width:3200,height:1120,channels:3,background:'#111821'}}).composite([
   {input:svg(3200,120,'레퍼런스: 노레위 실제 게임 화면 | 제작 후보: '+labels[id], '같은 패널 크기. 우측은 Blender 독립 렌더 52°·중립 조명·AgX. 장소·대상 크기·노출이 다르며 Unity 실게임 합격 근거가 아님.'),top:0,left:0},
   {input:ref,top:120,left:0},{input:render+'/'+f,top:120,left:1600}
  ]).png().toFile(dir+'/'+id+'_비교.png');
  const thumb=await sharp(render+'/'+f).resize(550,344).png().toBuffer();
  thumbs.push({input:thumb,left:i%4*550,top:100+Math.floor(i/4)*414});
  thumbs.push({input:svg(550,70,labels[id],id),left:i%4*550,top:444+Math.floor(i/4)*414});
 }
 await sharp({create:{width:2200,height:100+Math.ceil(files.length/4)*414,channels:3,background:'#111821'}}).composite([{input:svg(2200,100,'CH1-1 썩은 숲·강가·다리 · Blender 독립 검수','52° 동일 카메라·동일 조명. 섬네일은 목록이며 개별 원본 1600×1000 / 1x 세부 검수는 별도.'),top:0,left:0},...thumbs]).png().toFile(root+'/숲-모듈보드.png');
 console.log('개별 비교',files.length,'전체보드1장');
})().catch(e=>{console.error(e);process.exitCode=1});
