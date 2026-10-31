const fs=require('node:fs/promises'),path=require('node:path'),cp=require('node:child_process');
const crypto=require('node:crypto');
const sharp=require('sharp');
const out='I:/EXODUSER-Storage/web3d-layer1-20261031/final';
const ffmpeg='C:/Users/심도진/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe';
const label=(w,left,right)=>Buffer.from(`<svg width="${w*2}" height="42"><rect width="100%" height="100%" fill="#090d0d"/><g font-family="Malgun Gothic" font-size="22" fill="#eee4cc"><text x="20" y="29">${left}</text><text x="${w+20}" y="29">${right}</text></g></svg>`);
(async()=>{
 if(process.argv.includes('--receipt')){
  const root=path.resolve(__dirname,'..'),qa=JSON.parse(await fs.readFile(out+'/qa-receipt.json','utf8')),http=[];
  for(const [file,sha]of Object.entries(qa.source)){const local=await fs.readFile(root+'/'+file),response=await fetch('http://127.0.0.1:3377/'+file+'?verify='+Date.now());const bytes=Buffer.from(await response.arrayBuffer()),digest=crypto.createHash('sha256').update(bytes).digest('hex');if(!response.ok||digest!==sha||!local.equals(bytes))throw Error('검수/디스크/HTTP byte 불일치 '+file);http.push({file,status:response.status,sha256:digest,bytes:bytes.length});}
  const artifacts=[];for(const file of await fs.readdir(out))if(/\.(png|mp4|json)$/.test(file)&&file!=='final-manifest.json'){const bytes=await fs.readFile(out+'/'+file);artifacts.push({file,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
  const head=cp.execFileSync('C:/Program Files/Git/cmd/git.exe',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();await fs.writeFile(out+'/final-manifest.json',JSON.stringify({head,time:new Date().toISOString(),http,artifacts},null,2));console.log(JSON.stringify({head,httpVerified:http.length,artifacts:artifacts.length}));return;
 }
 for(const width of [1920,3840]){
  const off=await fs.readFile(out+`/moat-off-${width}.png`),on=await fs.readFile(out+`/moat-on-${width}.png`);
  await sharp({create:{width:width*2,height:1122,channels:4,background:'#090d0d'}}).composite([{input:label(width,'OFF · 기존 1-1','ON · 같은 맵 + 수풀·물 흐름'),left:0,top:0},{input:off,left:0,top:42},{input:on,left:width,top:42}]).png().toFile(out+`/comparison-${width}-1x.png`);
  const rect=width===1920?{left:660,top:300,width:720,height:320}:{left:1500,top:300,width:720,height:320};
  const a=await sharp(off).extract(rect).png().toBuffer(),b=await sharp(on).extract(rect).png().toBuffer();
  await sharp({create:{width:1440,height:362,channels:4,background:'#090d0d'}}).composite([{input:label(720,'OFF · 1x 물가','ON · 1x 물가'),left:0,top:0},{input:a,left:0,top:42},{input:b,left:720,top:42}]).png().toFile(out+`/crop-${width}-1x.png`);
 }
 for(const name of ['1920-off','1920-on','3840-off','3840-on','input']){
  const events=JSON.parse(await fs.readFile(out+`/frames-${name}.json`,'utf8'));const lines=[];
  for(let i=0;i<events.length;i++){const file=(out+`/frames-${name}/${String(i).padStart(5,'0')}.jpg`).replaceAll('\\','/');lines.push(`file '${file}'`,`duration ${Math.max(.001,Math.min(1,i+1<events.length?events[i+1]-events[i]:1/30))}`);}
  await fs.writeFile(out+`/video-${name}.concat`,lines.join('\n'));
  const r=cp.spawnSync(ffmpeg,['-y','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',out+`/video-${name}.concat`,'-an','-vf','fps=30','-t','10','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',out+`/video-${name}-10s.mp4`],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(name+': '+r.stderr+' '+r.error);console.log(name+' 10초 영상 완료');
 }
 for(const width of [1920,3840]){
  const r=cp.spawnSync(ffmpeg,['-y','-hide_banner','-loglevel','error','-i',out+`/video-${width}-off-10s.mp4`,'-i',out+`/video-${width}-on-10s.mp4`,'-filter_complex','[0:v][1:v]hstack=inputs=2[v]','-map','[v]','-an','-t','10','-c:v','libx264','-preset','fast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',out+`/comparison-${width}-10s.mp4`],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw Error(r.stderr+' '+r.error);console.log(width+' OFF/ON 비교영상 완료');
 }
 // Native-size motion board for direct inspection, sampled from the delivered video.
 for(const name of ['1920-off','1920-on']){const frames=JSON.parse(await fs.readFile(out+`/frames-${name}.json`,'utf8'));const inputs=[];for(let j=0;j<4;j++){const target=frames[0]+j*3;const i=frames.reduce((best,t,k)=>Math.abs(t-target)<Math.abs(frames[best]-target)?k:best,0);inputs.push({input:await sharp(out+`/frames-${name}/${String(i).padStart(5,'0')}.jpg`).extract({left:790,top:380,width:380,height:220}).png().toBuffer(),left:j*380,top:42});}await sharp({create:{width:1520,height:262,channels:4,background:'#090d0d'}}).composite([{input:Buffer.from(`<svg width="1520" height="42"><rect width="100%" height="100%" fill="#090d0d"/><text x="16" y="28" font-family="Malgun Gothic" font-size="20" fill="#eee4cc">${name} · 0 / 3 / 6 / 9초 · 1x</text></svg>`),left:0,top:0},...inputs]).png().toFile(out+`/motion-${name}-1x.png`);}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
