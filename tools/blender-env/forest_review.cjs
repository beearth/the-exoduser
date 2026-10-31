const fs=require('fs'),path=require('path'),sharp=require('G:/exoduser/node_modules/sharp'),crypto=require('crypto');
const r='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1';
const svg=(w,h,title,sub)=>Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="100%" height="100%" fill="#111821"/><text x="24" y="37" fill="#eee5d4" font-family="Malgun Gothic" font-size="26">'+title+'</text><text x="24" y="74" fill="#b3bfc7" font-family="Malgun Gothic" font-size="20">'+sub+'</text></svg>');
(async()=>{
 const target='G:/exoduser/tmp/design-review/20261030_keyframe/keyframe_A2.png';
 const a=await sharp(target).resize(1920,1080,{fit:'contain',background:'#111821'}).png().toBuffer();
 await sharp({create:{width:3840,height:1180,channels:3,background:'#111821'}}).composite([{input:svg(3840,100,'정적 목표 A2 | Blender 모듈 조립 시연','오른쪽은 독액 수면·인물·게임 HUD 미포함. 카메라·노출·장면 규모 차이 있음. Unity/실게임 PASS 근거가 아님.'),top:0,left:0},{input:a,top:100,left:0},{input:r+'/숲-다리-조립52도.png',top:100,left:1920}]).png().toFile(r+'/compare/A2-조립_비교.png');
 for(const [id,crop] of [['RF_Ancient_Rotten_Tree',{left:550,top:300,width:600,height:600}],['RF_Rotten_Wood_Bridge',{left:500,top:260,width:600,height:600}],['RF_Hanging_Moss',{left:480,top:220,width:600,height:600}],['RF_Broken_Stone_Bridge',{left:450,top:250,width:600,height:600}]])await sharp(r+'/renders/'+id+'.png').extract(crop).png().toFile(r+'/compare/'+id+'_1x.png');
 const old=JSON.parse(fs.readFileSync(r+'/source/미변경-렌더입력.json','utf8'));const check=[];
 for(const [id,files] of Object.entries(old))for(const f of files){const hash=crypto.createHash('sha256').update(fs.readFileSync(f.경로)).digest('hex');if(hash!==f.sha256)throw Error('미변경 렌더 입력이 달라짐 '+id+' '+f.경로);check.push({id,경로:f.경로,sha256:hash});}
 fs.writeFileSync(r+'/동일입력-렌더재사용.json',JSON.stringify({시각:new Date().toISOString(),모듈:Object.keys(old),대조파일:check,판정:'5종 메시·7맵 byte 동일. 동일52도/조명 원본 정면·측면 재사용'},null,2));
 fs.writeFileSync(r+'/A2-참조영수증.json',JSON.stringify({파일:target,sha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex'),확인:'현재 세션에서 원본 직접 열람. 정적 시안 RETOUCH·승인 대기, 게임 적용 없음'},null,2));
 console.log('A2 비교·변형 없는1x크롭4장·미변경5종 입력40파일 대조 PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
