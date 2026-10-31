const fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process');
const {once}=require('node:events');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const store='I:/EXODUSER-Storage/web3d-trial-20261031';
const out='G:/exoduser/tmp/design-review/20261031_web3d';
const unity='G:/exoduser/tmp/design-review/20261031_hd2d';
const ffmpeg='C:/Users/심도진/AppData/Local/ms-playwright/ffmpeg-1011/ffmpeg-win64.exe';
const exists=async f=>fs.access(f).then(()=>true,()=>false);
function svg(width,height,text,subtitle=''){
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#151b1c"/><text x="50%" y="47%" text-anchor="middle" fill="#e6d8b9" font-family="Malgun Gothic" font-size="${Math.max(22,width*.028)}">${text}</text><text x="50%" y="57%" text-anchor="middle" fill="#a7afb0" font-family="Malgun Gothic" font-size="${Math.max(16,width*.017)}">${subtitle}</text></svg>`);
}
async function board(scene){
  const unityFile=unity+(scene==='exploration'?'/01-exploration.png':'/02-combat.png');
  const unityReady=await exists(unityFile);
  const inputs=[await fs.readFile('G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png'),
    await fs.readFile(out+'/web-original-1920x1080.png'),
    unityReady?await fs.readFile(unityFile):svg(1920,1080,'Unity HD-2D 실제 출력 미도착','기존 예약·별도 writer 대기 / 이 열의 시각·성능 비교는 미검증'),
    await fs.readFile(scene==='exploration'?out+'/exploration-1920x1080.png':
      await exists(out+'/combat-action-frame.png')?out+'/combat-action-frame.png':out+'/combat-1920x1080.png')];
  const labels=['승인 A2 · 1664×936 원본을 1080p로 표시','기존 웹 · 원래 1-1 / native Core',
    unityReady?'Unity HD-2D · 별도 담당 Editor 연출':'Unity HD-2D · 촬영 대기 (빈 출력 대체 금지)','웹 3D · native Core 목교 비교 장면'];
  const panels=await Promise.all(inputs.map(b=>sharp(b).resize(1920,1080,{fit:'contain',background:'#111717'}).png().toBuffer()));
  const header=Buffer.from(`<svg width="7680" height="72"><rect width="100%" height="100%" fill="#111717"/>${labels.map((s,i)=>`<text x="${i*1920+32}" y="48" fill="#e4decd" font-family="Malgun Gothic" font-size="30">${s}</text>`).join('')}</svg>`);
  const image=await sharp({create:{width:7680,height:1152,channels:3,background:'#111717'}})
    .composite([...panels.map((b,i)=>({input:b,left:i*1920,top:72})),{input:header,left:0,top:0}]).png().toBuffer();
  await fs.writeFile(out+'/comparison-'+scene+'-4col-1x.png',image);
  await sharp(image).resize(3840,576).png().toFile(out+'/comparison-'+scene+'-4col.png');
  return {panels,labels,unityReady,unityFile};
}
async function encode(file,producer,width,height){
  const log=await fs.open(store+'/'+path.basename(file)+'.encode.log','w');
  const child=cp.spawn(ffmpeg,['-hide_banner','-y','-f','image2pipe','-vcodec','mjpeg','-r','30','-i','pipe:0',
    '-an','-c:v','libvpx','-b:v','6500k','-deadline','realtime','-cpu-used','4','-threads','2',
    '-pix_fmt','yuv420p','-frames:v','300',file],{windowsHide:true,stdio:['pipe','ignore',log.fd]});
  const completed=once(child,'close');let pipeError=null;child.stdin.on('error',e=>{pipeError=e;});
  try{for(let i=0;i<300;i++){if(pipeError)throw pipeError;const buffer=await producer(i);if(!child.stdin.write(buffer))await once(child.stdin,'drain');}
    child.stdin.end();const [code]=await completed;if(code!==0)throw Error('ffmpeg exit '+code);
  }finally{await log.close();}
  console.log(file+' / '+width+'×'+height+' / 300f / 30fps / 10s / audio0');
}
(async()=>{
  sharp.concurrency(2);const exploration=await board('exploration');await board('combat');
  const events=JSON.parse(await fs.readFile(out+'/video-frame-events.json','utf8'));
  if(events.length<2||events.at(-1).timestamp-events[0].timestamp<9.95)throw Error('10초에 부족한 실제 촬영 구간');
  const start=events.at(-1).timestamp-10;let cursor=0;
  const frames=[];for(let i=0;i<300;i++){const t=start+i/30;while(cursor+1<events.length&&events[cursor+1].timestamp<=t)cursor++;frames.push(events[cursor]);}
  await fs.writeFile(out+'/video-timing.json',JSON.stringify({duration:10,fps:30,frames:300,
    captured:events.length,captureSeconds:events.at(-1).timestamp-events[0].timestamp,startTimestamp:start,
    resampling:'실제 CDP timestamp에서 직전 프레임 선택',unityReady:exploration.unityReady},null,2));
  if(!process.argv.includes('--comparison-only'))await encode(out+'/web3d-10s.webm',i=>fs.readFile(store+'/frames/'+frames[i].file),1920,1080);
  const base=await sharp({create:{width:1920,height:330,channels:3,background:'#111717'}}).composite([
    ...await Promise.all(exploration.panels.slice(0,3).map(async(b,i)=>({input:await sharp(b).resize(480,270).png().toBuffer(),left:i*480,top:60}))),
    {input:Buffer.from(`<svg width="1920" height="60"><rect width="100%" height="100%" fill="#111717"/>${['승인 A2 원화','기존 웹 (별도 원래 맵)',exploration.unityReady?'Unity HD-2D · Core 없는 연출':'Unity HD-2D 촬영 대기','웹 3D 실제 이동·전투'].map((s,i)=>`<text x="${i*480+16}" y="36" fill="#e4decd" font-family="Malgun Gothic" font-size="20">${s}</text>`).join('')}</svg>`),left:0,top:0}]).png().toBuffer();
  await encode(out+'/comparison-4col-10s.webm',async i=>{const layers=[{input:await sharp(await fs.readFile(store+'/frames/'+frames[i].file)).resize(480,270).toBuffer(),left:1440,top:60}]; if(exploration.unityReady)layers.push({input:await sharp(await fs.readFile(unity+'/frames/'+String(i).padStart(4,'0')+'.png')).resize(480,270).toBuffer(),left:960,top:60}); return sharp(base).composite(layers).jpeg({quality:92}).toBuffer();},1920,330);
  const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>EXODUSER 웹 3D 목교 시험</title><style>body{margin:0;background:#111717;color:#e4decd;font:17px/1.7 Georgia,'Malgun Gothic',serif}main{max-width:1560px;margin:auto;padding:48px 32px}h1{font-size:40px;font-weight:400;margin-bottom:12px}a{color:#d9bb79}img,video{max-width:100%;display:block;margin:24px 0;border:1px solid #394342}p{max-width:1000px}.links{display:flex;gap:32px;flex-wrap:wrap}small{color:#a4a9a5}</style><main><small>EXODUSER / 2026-10-31 / codex/web3d-trial-20261031</small><h1>웹 Core 위의 3D 목교 시험</h1><p>실제 웹 전투·저장 규칙을 유지한 선택형 렌더 시험입니다. 목교는 별도 native Core 비교 맵입니다. Unity HD-2D 실제 출력은 ${exploration.unityReady?'확보':'촬영 대기'} 상태입니다. 시각 판정과 남은 작업은 REPORT를 확인하세요.</p><div class="links"><a href="http://127.0.0.1:3377/game.html?classic=1&r3d=1&r3dScene=bridge&amp;tutorial=0&amp;resourceTutorial=0">목교 실행</a><a href="http://127.0.0.1:3377/game.html?classic=1&r3d=1&amp;tutorial=0&amp;resourceTutorial=0">기존 맵 3D 실행</a><a href="REPORT.md">상세 REPORT</a><a href="qa-receipt.json">검수 영수증</a></div><a href="comparison-exploration-4col-1x.png"><img src="comparison-exploration-4col.png" alt="승인 원화, 원본 웹, Unity 대기, 웹 3D 탐험 네 열 비교"></a><p>비교판을 클릭하면 각 결과를 1920×1080으로 놓은 원본을 엽니다. A2 원화는 1664×936에서 확대 표시했습니다. 원본 웹과 목교 비교 맵은 서로 다른 지형입니다.</p><video controls muted loop src="web3d-10s.webm"></video><video controls muted loop src="comparison-4col-10s.webm"></video><a href="comparison-combat-4col-1x.png"><img src="comparison-combat-4col.png" alt="전투 네 열 비교"></a><p>영상은 실제 키보드·마우스 입력입니다. 웹 열은 실제 입력이고 Unity 열은 Core 없는 고정시간 연출입니다. 전투 비교 PNG는 실제 영상 JPEG90 프레임을 PNG로 보존했습니다. 원본 지형 fingerprint 검사용 강제 정지와 분리했으며, 1-1 자연 완주나 본편 맵 채택을 증명하지 않습니다.</p></main></html>`;
  await fs.writeFile(out+'/index.html',html);console.log('비교판·두 영상·검수 페이지 완료');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
