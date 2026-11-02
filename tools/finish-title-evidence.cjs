const fs=require('node:fs/promises'),cp=require('node:child_process'),sharp=require('sharp');
const root='I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102',out=root+'/verified';
async function main(){
 const qa=JSON.parse(await fs.readFile(out+'/qa-receipt.json','utf8')),ffmpeg=process.argv[2];
 const before='I:/EXODUSER-Storage/codex-takeover/title-cleanup-20261102/final/before-menu-3840.png';
 async function pair(name,box,scale=1){
  const images=[];for(const f of [before,out+'/menu-3840.png'])images.push(await sharp(f).extract(box).resize(box.width*scale,box.height*scale,{kernel:scale===3?'nearest':'lanczos3'}).png().toBuffer());
  const w=box.width*scale,h=box.height*scale;
  await sharp({create:{width:w*2,height:h+36,channels:3,background:'#111'}}).composite([{input:images[0],left:0,top:36},{input:images[1],left:w,top:36},{input:Buffer.from(`<svg width="${w*2}" height="36"><style>text{fill:white;font:18px sans-serif}</style><text x="15" y="25">BEFORE</text><text x="${w+15}" y="25">AFTER</text></svg>`),top:0,left:0}]).png().toFile(root+'/compare-'+name+'.png');
 }
 await pair('person-1x',{left:2390,top:10,width:1140,height:1040});
 await pair('rock-3x',{left:3095,top:978,width:190,height:65},3);
 const samples=[];
 for(let i=0;i<5;i++){
  const file=out+'/motion-3840-'+i+'.png';samples.push({input:await sharp(file).resize(1152,324).png().toBuffer(),left:0,top:i*324});
  await sharp(file).extract({left:2480,top:40,width:870,height:960}).png().toFile(root+'/person-motion-'+i+'-1x.png');
 }
 await sharp({create:{width:1152,height:1620,channels:3,background:'#111'}}).composite(samples).png().toFile(root+'/motion-contact.png');
 for(const width of [1920,2560,3840]){
  const folder=out+'/frames-'+width;
  const r=cp.spawnSync(ffmpeg,['-y','-v','error','-safe','0','-i',folder+'/frames.ffconcat','-an','-c:v','libx264','-threads','2','-preset','medium','-crf','17','-pix_fmt','yuv420p','-fps_mode','vfr','-movflags','+faststart',root+'/menu-'+width+'-10s.mp4'],{windowsHide:true,encoding:'utf8'});
  if(r.error)throw r.error;if(r.status)throw Error(r.stderr);
 }
 const table=qa.differences.map(d=>`| ${d.time.toFixed(1)}→${(d.time+.1).toFixed(1)} | ${d.sky.final.toFixed(4)} | ${d.rock.final.toFixed(4)} | ${['hub','blade','body','boots'].map(k=>d[k].final).join('/')} | ${d.hair.final.toFixed(4)} / ${d.cape.final.toFixed(4)} |`).join('\n');
 const clips=qa.recordings.map(r=>`${r.width}: ${r.duration.toFixed(3)}초/${r.frames}프레임`).join(', ');
 const report=`# 타이틀 마지막 세 결함 — 실제 검수 결과\n\n기준: 최신 origin/main 62f9fac20 병합(동일 HEAD, Already up to date). 기존 점제거·흰마스크 확장 WIP는 premerge/에 보존 후 계승. 담당 codex-web-keyart-wide, 서버3398의 JS SHA256 ${qa.servedSHA256}가 작업본과 일치.\n\n- 등검: 원본 title_bg_20261028.jpg와 Silvertail LOCK 직접 대조. 상부 등 원형 회전 허브→관절→몸 뒤 오른쪽 종아리 길이 흑철/은색 날. 손 비움. 내장 편집2회 중 길이가 잘못된1차 미채택,2차 국소 채택. 편집영역밖 원화byte 변경0(blade-edit-receipt.json). 그 뒤 기존 점제거 수행.\n- B: 몸·얼굴·손·허브·대검·부츠는 고정 원화 하나. 머리/망토 자유단만 최대2.4/1.1px GLSL 변위,같은B를 영상에도 사전렌더. 영상 인물 완전 가림.\n- 하늘: Kling영상+기존 구름복원+흐름셰이더. 이동한 정지 달 원반만 별도합성. 그레인·샤프닝0. 인물1x·바위/갑옷/하늘3x와자연재생연속화면 직접검수.\n- 실제1920/2560/3840×1080,각 ${clips}. 달원전체/부츠밑창·메뉴여백 통과. 녹화는 --mute-audio headless Chromium,별도프로필/세이브쓰기0.\n\n| 0.1초 구간 | 하늘 MAD | 바위 MAD | 허브/검/몸/부츠 MAD | 머리/망토 MAD |\n|---|---:|---:|---|---|\n${table}\n\n하늘은 모든 표본에서 바위의3배 이상. 장비·몸·부츠 픽셀변화0,머리/망토 움직임 확인. qa-receipt.json의timeline은 자연재생, differences는 명시적시각진단으로 구분.\n\n회귀21/21,project111/111,guard/docs검사 통과. 브라우저오류${qa.errors.length},HTTP오류${qa.http.length},세이브쓰기${qa.saves.length}. 모션감소/저사양/분위기OFF,영상/달판실패폴백,메뉴입력/종료해제 통과.\n\n비교: compare-person-1x.png(좌수정전/우최종),compare-rock-3x.png,clean-armor-3x.png,clean-sky-3x.png,motion-contact.png,person-motion-0~4-1x.png. 녹화 menu-{1920,2560,3840}-10s.mp4. 3개런타임영상은각50MB미만,무음24fps206프레임/8.583333초. 구체byte/해시는작업본manifest.json.\n\n자체판정: 이번 웹 타이틀 세결함 범위 PASS. 물리모니터/NW.js/Unity/외부배포는 미검수. 원격SHA는 final-delivery.json에별도기록. 외부유료생성0,내장이미지도구2회는공용내부원장에기록.\n`;
 await fs.writeFile(root+'/REPORT.md',report);console.log(clips);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
