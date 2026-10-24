// Deterministic native media import. Existing originals are never overwritten.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return path.resolve(i<0?d:process.argv[i+1]);};
const live=arg('--live-root','G:/exoduser'),project=arg('--project','./unity'),qa=arg('--out','I:/EXODUSER-Storage/qa/unity-lobby-20261024');
const sharp=require(require.resolve('sharp',{paths:[live]}));
const res=project+'/Assets/Exoduser/Resources',stream=project+'/Assets/StreamingAssets/Lobby',rows=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(qa,{recursive:true});fs.mkdirSync(stream,{recursive:true});
function write(dest,b){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,b);if(hash(fs.readFileSync(dest))!==hash(b))throw Error(dest);}
function read(src){const file=live+'/'+src,b=fs.readFileSync(file);if(hash(fs.readFileSync(file))!==hash(b))throw Error('Source drift '+src);return b;}
function copy(src,dest){const b=read(src);write(project+'/Assets/'+dest,b);rows.push({source:src,destination:dest,bytes:b.length,sourceSha256:hash(b),sha256:hash(b),transform:'byte_exact'});}
function derived(src,dest,b,transform){const original=read(src);write(project+'/Assets/'+dest,b);write(qa+'/source-art/'+path.basename(src),original);rows.push({source:src,destination:dest,bytes:b.length,sourceSha256:hash(original),sha256:hash(b),transform});}
async function main(){
 for(const f of ['fdg_intro.mp4','intro.mp4','world_intro_v17_blood_en.mp4','title_motion_hd_20260929.mp4','title_motion_20260929.mp4'])copy('video/'+f,'StreamingAssets/Lobby/'+f);
 copy('assets/lobby/lobby_varkan_crypt_loop_v2.mp4','StreamingAssets/Lobby/lobby_varkan_crypt_loop_v2.mp4');
 const images={'img/logo_exoduser.png':'brand_logo','assets/lobby/lobby_enter_btn.png':'lobby_enter','assets/lobby/lobby_banner_btn.png':'lobby_banner','img/fdg_intro/fdg_reference.png':'fdg_poster','img/fdg_wolf/fdg_wolf_emblem.png':'fdg_emblem','img/title_clean_plate_20260929.png':'splash_title','assets/lobby/varkan_idle_v3.png':'varkan_idle','assets/lobby/varkan_idle_first_v3.png':'varkan_first'};
 for(const [src,name]of Object.entries(images))copy(src,'Exoduser/Resources/Art/lobby/'+name+'.png');
 for(const [src,name]of [['output/imagegen/exoduser-hell-lord-logo-api-v1.png','title_logo'],['output/imagegen/enter-gothic-api-v1.png','enter_art']]){
  const raw=await sharp(read(src)).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let i=0;i<raw.data.length;i+=4)raw.data[i+3]=Math.round(255*Math.max(0,Math.min(1,(Math.max(raw.data[i],raw.data[i+1],raw.data[i+2])-8)/24)));
  const out=await sharp(raw.data,{raw:{width:raw.info.width,height:raw.info.height,channels:4}}).png().toBuffer();derived(src,'Exoduser/Resources/Art/lobby/'+name+'.png',out,'cin-logo-art.js exact alpha=round(255*clamp((maxRGB-8)/24)); RGB unchanged');
 }
 const poster='assets/lobby/lobby_varkan_crypt_poster_v2.webp';derived(poster,'Exoduser/Resources/Art/lobby/lobby_poster.png',await sharp(read(poster)).png().toBuffer(),'lossless WebP decode to PNG; original dimensions/pixels');
 const index=read('index.html').toString('utf8');let svg=/<svg id="splashTitleBrand"[\s\S]*?<\/svg>/.exec(index)?.[0];if(!svg)throw Error('Missing original splash SVG');
 svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1983" height="793" ').replace('href="img/title_clean_plate_20260929.png"','href="data:image/png;base64,'+read('img/title_clean_plate_20260929.png').toString('base64')+'"');
 // Chromium preserves the source SVG textLength/lengthAdjust and letter spacing.
 // librsvg rasterization compresses the title around the central cross.
 write(qa+'/source-art/splash-brand.svg',Buffer.from(svg));
 const {chromium}=require(require.resolve('playwright',{paths:[live]}));
 const browser=await chromium.launch({headless:true});let brand;
 try{const page=await browser.newPage();const png=await page.evaluate(async markup=>{
  const img=new Image(),url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml'}));
  try{img.src=url;await img.decode();const c=document.createElement('canvas');c.width=1983;c.height=793;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png').split(',')[1];}finally{URL.revokeObjectURL(url);}
 },svg);brand=Buffer.from(png,'base64');}finally{await browser.close();}
 derived('index.html','Exoduser/Resources/Art/lobby/splash_brand.png',brand,'original splashTitleBrand SVG; Chromium canvas preserves textLength/lengthAdjust/letter spacing; embedded clean plate; raster1983x793; Georgia system font');
 const ffmpeg=process.env.LOCALAPPDATA+'/Microsoft/WinGet/Links/ffmpeg.exe',gate=qa+'/gate-first-frame.png';
 const f=cp.spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',live+'/video/intro.mp4','-frames:v','1',gate],{windowsHide:true,encoding:'utf8',timeout:60000});if(f.status!==0)throw Error(f.stderr);
 derived('video/intro.mp4','Exoduser/Resources/Art/lobby/gate_poster.png',fs.readFileSync(gate),'ffmpeg decode frame0 to PNG; no crop or resize');
 for(const name of ['prologue_theme','prologue_theme_abyssal_fracture','prologue_theme_rebirth_gate_1','prologue_theme_rebirth_gate_2'])copy('bgm/cutscene/'+name+'.mp3','Exoduser/Resources/Audio/Lobby/'+name+'.mp3');
 copy('bgm/공통/lobby.mp3','Exoduser/Resources/Audio/Lobby/lobby.mp3');
 const sourceFiles=['index.html','cin-logo-art.js','world-intro-player.js','world-intro-subtitles.js','world-intro-subtitles-data.js','lobby-ancestor-sprite.js','lobby-ancestor-art.css'];
 const sources=sourceFiles.map(src=>{const b=read(src);write(qa+'/source-snapshot/'+src,b);return{path:src,sha256:hash(b),bytes:b.length};});
 const report={schema:'exoduser.unity.lobby-assets.v1',sourceRoot:live,sources,assetCount:rows.length,bytes:rows.reduce((s,r)=>s+r.bytes,0),assets:rows};
 const frontend=fs.readFileSync(project+'/Tools/lobby-oracle/oracle.json');write(res+'/Data/lobby_frontend.json',frontend);
 write(project+'/Tools/Fixtures/lobby-assets.json',Buffer.from(JSON.stringify(report,null,2)));console.log(JSON.stringify({...report,assets:undefined,sources:undefined}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
