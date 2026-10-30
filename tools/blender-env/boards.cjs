const fs=require('fs'),path=require('path'),sharp=require('G:/exoduser/node_modules/sharp');
const root='I:/EXODUSER-Storage/demo-art/blender-env',render=root+'/renders',dir=root+'/compare';fs.mkdirSync(dir,{recursive:true});
const labels={HE_Cliff_Mass_A:'큰 절리 암반',HE_Cliff_Drop_B:'내려가는 절벽 끝',HE_Rock_Connector:'암반 접합',HE_Deadwood_Hollow:'부패 고목·비대칭 뿌리',HE_Root_Fallen:'쓰러진 뿌리',HE_Ruin_Wall:'무너진 석벽',HE_Ruin_Pillar:'부러진 석주',HE_Bone_Heap:'갈비뼈·두개골',HE_Chain_Drape:'교차 타원 쇠사슬',HE_Ash_Gravel:'재·자갈 퇴적',HE_Vista_Ruined_Arch:'심연 너머 폐허'};
const svg=(w,h,title,sub='')=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#111821"/><text x="24" y="38" fill="#eee5d4" font-family="Malgun Gothic" font-size="26">${title}</text><text x="24" y="${Math.min(73,h-10)}" fill="#aebac5" font-family="Malgun Gothic" font-size="19">${sub}</text></svg>`);
(async()=>{
 const files=fs.readdirSync(render).filter(x=>/^HE_.*(?<!_side)\.png$/.test(x));
 const thumbs=[];
 for(let i=0;i<files.length;i++){
  const f=files[i],id=f.slice(0,-4),isRuin=/Ruin|Chain|Vista/.test(id);
  const rp='G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 '+(/Deadwood|Root/.test(id)?'091218':isRuin?'091256':'091244')+'.png';
  const ref=await sharp(rp).resize(1600,1000,{fit:'contain',background:'#111821'}).png().toBuffer();
  await sharp({create:{width:3200,height:1120,channels:3,background:'#111821'}}).composite([
   {input:svg(3200,120,'레퍼런스: 노레위 실제 게임 화면 | 제작 후보: '+labels[id], '같은 패널 크기. 우측은 Blender 독립 렌더 52°·중립 조명·AgX. 장소·대상 크기·노출이 다르며 Unity 실게임 합격 근거가 아님.'),top:0,left:0},
   {input:ref,top:120,left:0},{input:render+'/'+f,top:120,left:1600}
  ]).png().toFile(dir+'/'+id+'_비교.png');
  const thumb=await sharp(render+'/'+f).resize(550,344).png().toBuffer();
  thumbs.push({input:thumb,left:i%4*550,top:100+Math.floor(i/4)*414});
  thumbs.push({input:svg(550,70,labels[id],id),left:i%4*550,top:444+Math.floor(i/4)*414});
 }
 await sharp({create:{width:2200,height:100+Math.ceil(files.length/4)*414,channels:3,background:'#111821'}}).composite([{input:svg(2200,100,'CH1-1 환경 모듈 · Blender 독립 형태 검수','52° 동일 카메라·동일 조명. 섬네일은 목록이며 개별 원본 1600×1000 / 1x 세부 검수는 별도.'),top:0,left:0},...thumbs]).png().toFile(root+'/모듈-전체보드.png');
 console.log('개별 비교',files.length,'전체보드1장');
})().catch(e=>{console.error(e);process.exitCode=1});
