const fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const {once}=require('node:events');const sharp=require('sharp');
const store='I:/EXODUSER-Storage/web3d-main-20261031',out='G:/exoduser/tmp/design-review/20261031_web3d_main';
const reference='G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png';
const ffmpeg='C:/Users/심도진/AppData/Local/ms-playwright/ffmpeg-1011/ffmpeg-win64.exe';
const header=(w,h,left,right)=>Buffer.from(`<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="#141a1d"/><text x="24" y="37" fill="#d9d1bf" font-family="Malgun Gothic" font-size="24">${left}</text><text x="${w/2+24}" y="37" fill="#d9d1bf" font-family="Malgun Gothic" font-size="24">${right}</text></svg>`);
async function boards(){
 const ref=await sharp(reference).resize(1920,1080).png().toBuffer();
 for(const [id,file]of [['exploration','exploration-1920x1080.png'],['combat','combat-1920x1080.png']]){
  const actual=await fs.readFile(out+'/'+file),buffer=await sharp({create:{width:3840,height:1136,channels:3,background:'#141a1d'}}).composite([
   {input:ref,left:0,top:56},{input:actual,left:1920,top:56},{input:header(3840,56,'승인 A2 · 1664×936 원화를 1920으로 표시','웹 3D 실제 Core · 1920×1080'),left:0,top:0}]).png().toBuffer();
  await fs.writeFile(out+'/comparison-'+id+'-1920.png',buffer);await sharp(buffer).resize(1920,568).png().toFile(out+'/comparison-'+id+'-preview.png');
 }
 const refInfo=await sharp(reference).metadata();
 const crops=[['bridge',{left:520,top:280,width:512,height:512},{left:680,top:280,width:512,height:512}],['water',{left:960,top:400,width:512,height:512},{left:1260,top:400,width:512,height:512}],['forest',{left:240,top:0,width:512,height:512},{left:240,top:0,width:512,height:512}]];
 for(const [id,a,b]of crops){const left=await sharp(reference).extract(a).png().toBuffer(),right=await sharp(out+'/exploration-1920x1080.png').extract(b).png().toBuffer();
  await sharp({create:{width:1024,height:568,channels:3,background:'#141a1d'}}).composite([{input:left,left:0,top:56},{input:right,left:512,top:56},{input:header(1024,56,'A2 원본 · 확대0 · 1x','실행 화면 · 확대0 · 1x'),left:0,top:0}]).png().toFile(out+'/crop-1x-'+id+'.png');
 }
 return {reference,referenceDimensions:[refInfo.width,refInfo.height],wholeReferenceScale:1920/refInfo.width,crops:'원본 픽셀 1:1. 같은 시야/좌표의 A/B가 아닌 대응 소재 구간. 카메라 차이 보존.'};
}
async function video(){
 const events=JSON.parse(await fs.readFile(out+'/video-frame-events.json','utf8'));if(events.length<2||events.at(-1).timestamp-events[0].timestamp<10)throw Error('10초 실제 프레임 부족');
 const start=events.at(-1).timestamp-10,selected=[];let cursor=0;
 for(let i=0;i<300;i++){const t=start+i/30;while(cursor+1<events.length&&events[cursor+1].timestamp<=t)cursor++;selected.push(events[cursor]);}
 const log=await fs.open(store+'/main-video-encode.log','w'),file=out+'/web3d-main-10s.webm';
 const child=cp.spawn(ffmpeg,['-hide_banner','-y','-f','image2pipe','-vcodec','mjpeg','-r','30','-i','pipe:0','-an','-c:v','libvpx','-b:v','6500k','-deadline','realtime','-cpu-used','4','-threads','2','-pix_fmt','yuv420p','-frames:v','300',file],{windowsHide:true,stdio:['pipe','ignore',log.fd]});
 const done=once(child,'close');let pipeError;child.stdin.on('error',e=>pipeError=e);
 try{for(const frame of selected){if(pipeError)throw pipeError;if(!child.stdin.write(await fs.readFile(store+'/frames/'+frame.file)))await once(child.stdin,'drain');}child.stdin.end();const [exit]=await done;if(exit!==0)throw Error('ffmpeg '+exit);}finally{await log.close();}
 const verify=cp.spawnSync(ffmpeg,['-hide_banner','-i',file,'-frames:v','1','-y',store+'/video-decoded.png'],{windowsHide:true,encoding:'utf8'});
 if(verify.status!==0)throw Error('video decode '+verify.stderr);
 const timing={durationSeconds:10,frames:300,fps:30,audio:false,source:'실제 CDP JPEG90 프레임, timestamp 기준 직전 프레임 유지',captured:events.length,captureSeconds:events.at(-1).timestamp-events[0].timestamp,decodeExit:verify.status,ffmpeg:verify.stderr};
 await fs.writeFile(out+'/video-verification.json',JSON.stringify(timing,null,2));return timing;
}
(async()=>{
 sharp.concurrency(2);await fs.mkdir(out,{recursive:true});const comparison=await boards();const timing=process.argv.includes('--boards-only')?null:await video();
 await fs.writeFile(out+'/comparison-contract.json',JSON.stringify(comparison,null,2));
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>EXODUSER 웹 3D 목교 검수</title><style>body{margin:0;background:#101719;color:#ded7c9;font:17px/1.7 'Malgun Gothic',sans-serif}main{max-width:1500px;margin:auto;padding:40px 24px}h1{font:36px Georgia,serif}a{color:#c9bb96}img,video{display:block;max-width:100%;margin:24px 0}nav{display:flex;gap:24px;flex-wrap:wrap}.crops{display:flex;gap:16px}.crops a{width:33.333%}small{color:#93a1a4}</style><main><small>EXODUSER · 2026-10-31 · 실제 Core / 선택형 3D / 기본 OFF</small><h1>목교 구역 · 렌더·환경·전투 표현</h1><nav><a href="/game.html?classic=1&r3d=1&r3dScene=bridge&tutorial=0&resourceTutorial=0">목교 실행</a><a href="REPORT.md">한국어 결과</a><a href="qa-receipt.json">실행·FPS 영수증</a><a href="final-delivery.json">소스·원격 영수증</a></nav><p>표현·기술·실제 플레이 검증 범위와 남은 결함은 REPORT를 따릅니다. A2 원화는 1664×936에서 1920×1080으로 표시했습니다. 아래 세부 비교는 양쪽 원본 픽셀 1:1이며 카메라·장면 좌표가 다릅니다.</p><a href="comparison-exploration-1920.png"><img src="comparison-exploration-preview.png" alt="승인 A2와 실제 탐험 화면"></a><video src="web3d-main-10s.webm" controls muted loop></video><a href="comparison-combat-1920.png"><img src="comparison-combat-preview.png" alt="승인 A2와 실제 교전 화면"></a><div class="crops">${['bridge','water','forest'].map(id=>`<a href="crop-1x-${id}.png"><img src="crop-1x-${id}.png" alt="${id} 원본 1x"></a>`).join('')}</div><p>영상은 자동 키보드·마우스 입력의 실제 게임입니다. 64적·96탄 이미지는 강제 배치·정지 렌더 fixture이며 자연 플레이와 구분합니다.</p><a href="dense-fixture-1920x1080.png"><img src="dense-fixture-1920x1080.png" alt="64적 96탄 렌더 fixture"></a></main></html>`;
 await fs.writeFile(out+'/index.html',html);
 const names=['comparison-exploration-1920.png','comparison-combat-1920.png','crop-1x-bridge.png','crop-1x-water.png','crop-1x-forest.png','exploration-1920x1080.png','combat-1920x1080.png','dense-fixture-1920x1080.png','web3d-main-10s.webm'];const files=[];
 for(const name of names){try{const b=await fs.readFile(out+'/'+name);files.push({name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}catch(e){if(e.code!=='ENOENT')throw e;}}
 await fs.writeFile(out+'/artifact-manifest.json',JSON.stringify({comparison,timing,files},null,2));console.log(timing?'비교판·1x크롭·실제10초 영상·디코드 검증 완료':'비교판·1x크롭 생성 완료(영상 제외)');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
