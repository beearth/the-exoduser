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
function exportCompatibleLobby(){
 const src='assets/lobby/lobby_varkan_crypt_loop_v2.mp4',original=read(src),sourceSha256=hash(original),dir=qa+'/lobby-compatibility/'+sourceSha256,source=dir+'/source.mp4',encoded=dir+'/lobby_varkan_crypt_loop_v2_unity.mp4',receiptPath=dir+'/receipt.json';
 fs.mkdirSync(dir,{recursive:true});write(source,original);
 const ffmpeg=process.env.LOCALAPPDATA+'/Microsoft/WinGet/Links/ffmpeg.exe',ffprobe=process.env.LOCALAPPDATA+'/Microsoft/WinGet/Links/ffprobe.exe';
 const run=(exe,args,label)=>{const r=cp.spawnSync(exe,args,{windowsHide:true,encoding:'utf8',timeout:600000,maxBuffer:8*1024*1024});write(dir+'/'+label+'.log',Buffer.from((r.stdout||'')+'\n'+(r.stderr||'')));if(r.status!==0)throw Error(label+': '+r.status+' '+r.stderr);return r;};
 const probe=file=>JSON.parse(run(ffprobe,['-v','error','-count_frames','-show_streams','-show_format','-of','json',file],file===source?'source-probe':'runtime-probe').stdout);
 const encodeArgs=['-hide_banner','-loglevel','error','-y','-i',source,'-map','0:v:0','-vf','setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709','-c:v','libx264','-crf','14','-preset','medium','-pix_fmt','yuv420p','-bf','0','-x264-params','colorprim=bt709:transfer=bt709:colormatrix=bt709','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart','-an',encoded];
 let cached=null;if(fs.existsSync(receiptPath)&&fs.existsSync(encoded)){const old=JSON.parse(fs.readFileSync(receiptPath));if(old.sourceSha256===sourceSha256&&old.sha256===hash(fs.readFileSync(encoded))&&JSON.stringify(old.encodeArgs)===JSON.stringify(encodeArgs))cached=old;}
 if(!cached)run(ffmpeg,encodeArgs,'encode');
 const sourceInfo=probe(source),runtimeInfo=probe(encoded),a=sourceInfo.streams.find(x=>x.codec_type==='video'),b=runtimeInfo.streams.find(x=>x.codec_type==='video');
 if(!a||!b||b.codec_name!=='h264'||b.pix_fmt!=='yuv420p'||b.color_primaries!=='bt709'||b.color_transfer!=='bt709'||b.color_space!=='bt709'||b.has_b_frames!==0||a.width!==b.width||a.height!==b.height||a.avg_frame_rate!==b.avg_frame_rate||a.r_frame_rate!==b.r_frame_rate||a.nb_read_frames!==b.nb_read_frames||Math.abs(Number(a.duration)-Number(b.duration))>.000001)throw Error('Lobby compatibility metadata changed source timing/size');
 run(ffmpeg,['-hide_banner','-v','error','-i',source,'-map','0:v:0','-f','null','-'],'source-full-decode');
 run(ffmpeg,['-hide_banner','-v','error','-i',encoded,'-map','0:v:0','-f','null','-'],'runtime-full-decode');
 const compare=run(ffmpeg,['-hide_banner','-i',source,'-i',encoded,'-filter_complex','[0:v]format=yuv420p[ref];[ref][1:v]ssim','-an','-f','null','-'],'ssim-source420-reference'),ssim=/All:([0-9.]+)/.exec(compare.stderr)?.[1];if(!ssim)throw Error('SSIM summary missing');
 const data=fs.readFileSync(encoded),sha256=hash(data);if(hash(read(src))!==sourceSha256)throw Error('Source drift after lobby conversion');
 const row={source:src,destination:'StreamingAssets/Lobby/lobby_varkan_crypt_loop_v2_unity.mp4',bytes:data.length,sourceSha256,sha256,transform:'mechanical libx264 CRF14 presetmedium yuv420p Bframes0 bt709 faststart noaudio; original width/height/fps/duration/framecount retained; unsupported sourceHigh444 preserved on I',sourceVideo:a,runtimeVideo:b,ssimVsSourceConverted420:Number(ssim)};
 write(project+'/Assets/'+row.destination,data);rows.push(row);write(receiptPath,Buffer.from(JSON.stringify({...row,encodeArgs,sourceInfo,runtimeInfo,sourcePreserved:source,fullDecodeSource:true,fullDecodeRuntime:true},null,2)));console.log(JSON.stringify({lobbyCompatibility:{bytes:row.bytes,sourceSha256,sha256,ssim:Number(ssim),receipt:receiptPath}}));
}
async function main(){
 for(const f of ['fdg_intro.mp4','intro.mp4','title_motion_hd_20260929.mp4','title_motion_20260929.mp4'])copy('video/'+f,'StreamingAssets/Lobby/'+f);
 copy('output/cinematic/a04_demonic_remaster_20261016/world_intro_v22b_paint_en.mp4','StreamingAssets/Lobby/world_intro_v22b_paint_en.mp4');
 exportCompatibleLobby();
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
 const browser=await chromium.launch({headless:true});let brand,panel,disabledEntry;
 try{const page=await browser.newPage();const png=await page.evaluate(async markup=>{
  const img=new Image(),url=URL.createObjectURL(new Blob([markup],{type:'image/svg+xml'}));
  try{img.src=url;await img.decode();const c=document.createElement('canvas');c.width=1983;c.height=793;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/png').split(',')[1];}finally{URL.revokeObjectURL(url);}
 },svg);brand=Buffer.from(png,'base64');
 const disabledPng=await page.evaluate(async base64=>{const image=new Image();image.src='data:image/png;base64,'+base64;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d');context.filter='grayscale(1) brightness(.45)';context.drawImage(image,0,0);return canvas.toDataURL('image/png').split(',')[1];},read('assets/lobby/lobby_enter_btn.png').toString('base64'));disabledEntry=Buffer.from(disabledPng,'base64');
 const embedded=p=>'url("data:image/png;base64,'+read(p).toString('base64')+'")';
 const panelCss='html,body{margin:0;width:560px;height:1080px;background:transparent}.lobby-right{position:relative;width:560px;height:1080px;isolation:isolate;background:#100d0e}.lobby-right::before{content:"";position:absolute;inset:22px;background:linear-gradient(#141315de,#09090af2),'+embedded('img/ui/blackiron/sigil.png')+' center -90px/620px 620px no-repeat,'+embedded('img/ui/hell_gothic/iron.png')+' center/320px;clip-path:polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,0 calc(100% - 12px),0 12px);pointer-events:none;z-index:-1}.lobby-right::after{content:"";position:absolute;inset:0;border:48px solid transparent;border-image:'+embedded('img/ui/hell_gothic/frame.png')+' 22% / 48px / 0 stretch;pointer-events:none;z-index:2}';
 await page.setViewportSize({width:560,height:1080});await page.setContent('<style>'+panelCss+'</style><div class="lobby-right"></div>');
 panel=await page.screenshot({omitBackground:true});write(qa+'/source-art/lobby-panel-source.css',Buffer.from(panelCss));
 for(const p of ['img/ui/blackiron/sigil.png','img/ui/hell_gothic/iron.png','img/ui/hell_gothic/frame.png'])write(qa+'/source-art/'+p.replaceAll('/','_'),read(p));
 }finally{await browser.close();}
 derived('assets/lobby/lobby_enter_btn.png','Exoduser/Resources/Art/lobby/lobby_enter_disabled.png',disabledEntry,'source ui-refinement.css grayscale(1) brightness(.45); Chromium canvas exact CSS filter; original dimensions');
 derived('ui-refinement.css','Exoduser/Resources/Art/lobby/lobby_panel.png',panel,'source ui-foundation.css inherited hell_gothic frame 22% slice/48px; ui-refinement.css inset22 gradient/sigil/iron; Chromium560x1080 no content raster');
 derived('index.html','Exoduser/Resources/Art/lobby/splash_brand.png',brand,'original splashTitleBrand SVG; Chromium canvas preserves textLength/lengthAdjust/letter spacing; embedded clean plate; raster1983x793; Georgia system font');
 const ffmpeg=process.env.LOCALAPPDATA+'/Microsoft/WinGet/Links/ffmpeg.exe',gate=qa+'/gate-first-frame.png';
 const f=cp.spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',live+'/video/intro.mp4','-frames:v','1',gate],{windowsHide:true,encoding:'utf8',timeout:60000});if(f.status!==0)throw Error(f.stderr);
 derived('video/intro.mp4','Exoduser/Resources/Art/lobby/gate_poster.png',fs.readFileSync(gate),'ffmpeg decode frame0 to PNG; no crop or resize');
 for(const name of ['prologue_theme','prologue_theme_abyssal_fracture','prologue_theme_rebirth_gate_1','prologue_theme_rebirth_gate_2'])copy('bgm/cutscene/'+name+'.mp3','Exoduser/Resources/Audio/Lobby/'+name+'.mp3');
 copy('bgm/공통/lobby.mp3','Exoduser/Resources/Audio/Lobby/lobby.mp3');
 const sourceFiles=['index.html','cin-logo-art.js','world-intro-player.js','world-intro-subtitles.js','world-intro-subtitles-data.js','lobby-ancestor-sprite.js','lobby-ancestor-art.css','ui-foundation.css','ui-refinement.css','img/ui/blackiron/sigil.png','img/ui/hell_gothic/iron.png','img/ui/hell_gothic/frame.png'];
 const sources=sourceFiles.map(src=>{const b=read(src);write(qa+'/source-snapshot/'+src,b);return{path:src,sha256:hash(b),bytes:b.length};});
 const report={schema:'exoduser.unity.lobby-assets.v1',sourceRoot:live,sources,assetCount:rows.length,bytes:rows.reduce((s,r)=>s+r.bytes,0),assets:rows};
 const frontend=fs.readFileSync(project+'/Tools/lobby-oracle/oracle.json');write(res+'/Data/lobby_frontend.json',frontend);
 write(project+'/Tools/Fixtures/lobby-assets.json',Buffer.from(JSON.stringify(report,null,2)));console.log(JSON.stringify({...report,assets:undefined,sources:undefined}));
}
main().catch(e=>{console.error(e);process.exitCode=1});
