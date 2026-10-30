// 레퍼런스는 I: 비교 자료에만 사용한다. 게임 납품/저장소에는 넣지 않는다.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('G:/exoduser/node_modules/sharp');
const root='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2',reference='G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rows=JSON.parse(fs.readFileSync(root+'/source/모듈명세.json','utf8'));
const labels={RF_Ancient_Rotten_Tree:'썩은 거목과 판근',RF_Rotten_Wood_Bridge:'썩은 나무다리',RF_Fallen_Log:'쓰러진 고목',RF_Hanging_Moss:'부패 수염이끼',RF_Fungal_Colony:'목재 부후균·균사',RF_Foreground_Roots:'전경 뿌리',RF_River_Stake_Cluster:'강가 썩은 말뚝',RF_Bridge_Torch_Holder:'횃불 받침',RF_Withered_Shrub:'시든 덤불',RF_Corroded_Riverbank:'강가 부식 암반',RF_Foam_Bank:'강가 거품',RF_Forest_Vista_Card:'먼 숲 카드',RF_Riverbed:'수면 아래 강바닥 형태',RF_Broken_Stone_Bridge:'별도 보조 석조다리'};
const crops={RF_Ancient_Rotten_Tree:[0,0,570,670],RF_Rotten_Wood_Bridge:[390,260,650,450],RF_Fallen_Log:[1270,100,394,500],RF_Hanging_Moss:[0,70,430,520],RF_Fungal_Colony:[940,310,240,230],RF_Foreground_Roots:[0,600,760,336],RF_River_Stake_Cluster:[1040,50,400,360],RF_Bridge_Torch_Holder:[410,460,180,230],RF_Withered_Shrub:[670,180,380,200],RF_Corroded_Riverbank:[1010,530,400,300],RF_Foam_Bank:[1070,520,300,300],RF_Forest_Vista_Card:[950,0,600,300]};
Object.assign(labels,{RF_Fractured_Stump:'낮은 파단 그루터기',RF_Gnarled_Split_Trunk:'옆으로 휜 분기 고목',RF_Foreground_Branch_Frame:'전경 가지 프레임'});Object.assign(crops,{RF_Fractured_Stump:[940,310,300,320],RF_Gnarled_Split_Trunk:[0,0,570,670],RF_Foreground_Branch_Frame:[0,600,760,336]});
const header=(w,h,t,s)=>Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#10161d"/><text x="22" y="36" font-family="Malgun Gothic" font-size="25" fill="#eee4d2">${t}</text><text x="22" y="72" font-family="Malgun Gothic" font-size="19" fill="#b4c1cb">${s}</text></svg>`);
(async()=>{
 fs.mkdirSync(root+'/compare',{recursive:true});const pieces=[];
 for(let i=0;i<rows.length;i++){
  const id=rows[i].id,c=crops[id];let ref=sharp(reference);
  if(c)ref=ref.extract({left:c[0],top:c[1],width:c[2],height:c[3]});
  else if(id==='RF_Broken_Stone_Bridge')ref=sharp('G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 091256.png');
  ref=await ref.resize(1600,1000,{fit:'contain',background:'#10161d'}).png().toBuffer();
  const png=root+'/renders/'+id+'.png';
  await sharp({create:{width:3200,height:1100,channels:3,background:'#10161d'}}).composite([{input:header(3200,100,'기준 부분 | '+labels[id]+' — 실제 납품 메시·PBR Blender52도','부분을 같은 패널에 맞춤. 기준은 원화 또는 노레위 게임 / 우측은 중립광 정적 렌더. 카메라·노출·배경 차이 있음.'),top:0,left:0},{input:ref,top:100,left:0},{input:png,top:100,left:1600}]).png().toFile(root+'/compare/'+id+'_비교.png');
  const nr=await sharp('G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 '+(/Tree|Log|Moss|Fungal|Shrub|Vista|Roots/.test(id)?'091218':/Wood_Bridge|Torch/.test(id)?'091234':'091244')+'.png').resize(1600,1000,{fit:'contain',background:'#10161d'}).png().toBuffer();
  await sharp({create:{width:3200,height:1100,channels:3,background:'#10161d'}}).composite([{input:header(3200,100,'노레위 실제 게임 | '+labels[id]+' — Blender52도','같은 패널 크기. 대상 점유율·배경·노출·투영 차이가 있으며 실게임 합격 근거가 아님.'),top:0,left:0},{input:nr,top:100,left:0},{input:png,top:100,left:1600}]).png().toFile(root+'/compare/'+id+'_노레위비교.png');
  pieces.push({input:await sharp(png).resize(480,300).png().toBuffer(),left:i%4*480,top:100+Math.floor(i/4)*370});pieces.push({input:header(480,70,labels[id],''),left:i%4*480,top:400+Math.floor(i/4)*370});
 }
 await sharp({create:{width:1920,height:100+Math.ceil(rows.length/4)*370,channels:3,background:'#10161d'}}).composite([{input:header(1920,100,'승인 나무다리 기준 환경 모듈','목록용 축소. 기술검사·1x 원본·실게임 판정 별도.'),top:0,left:0},...pieces]).png().toFile(root+'/모듈보드.png');
 const scene=root+'/승인구도_최종.png';
 await sharp({create:{width:3840,height:1180,channels:3,background:'#10161d'}}).composite([{input:header(3840,100,'승인 원화 | Blender 조립 후보','각1920×1080. 우측은 환경 키트 검수 시연: 영웅·게임·탄막 없음. 독액면·불·안개·토양은 색/접지 확인용 비납품 대리물.'),top:0,left:0},{input:await sharp(reference).resize(1920,1080).png().toBuffer(),top:100,left:0},{input:scene,top:100,left:1920}]).png().toFile(root+'/compare/승인원화_나란히.png');
 const m=await sharp(scene).metadata();
 for(const [id,left,top,width,height] of [['다리접합',530,510,600,420],['왼쪽거목',0,80,610,700],['오른쪽강가',1210,490,650,500],['후경',620,0,800,410]])if(left+width<=m.width&&top+height<=m.height)await sharp(scene).extract({left,top,width,height}).png().toFile(root+'/compare/1x_'+id+'.png');
 fs.writeFileSync(root+'/참조-렌더영수증.json',JSON.stringify({시각:new Date().toISOString(),승인원화:{경로:reference,sha256:sha(reference)},조립:{경로:scene,sha256:sha(scene)},모듈수:rows.length,독립렌더:rows.length*2,Unity실행:0,판정:'직접 열람 후 REPORT에 확정. 자동 PASS 아님'},null,2));console.log('동일패널 모듈비교·전체비교·1x 생성',rows.length);
})().catch(e=>{console.error(e);process.exitCode=1});
