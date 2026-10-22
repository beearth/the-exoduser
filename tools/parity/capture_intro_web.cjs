// Source-only web reference, fixed presentation clock. Separate from input-only E2E.
const fs=require('node:fs'),{spawn}=require('node:child_process'),{chromium}=require('playwright');
const out=process.env.PARITY_OUT,src=fs.readFileSync('godot/source_snapshot/game.html','utf8');
function fn(name){const start=src.indexOf('function '+name+'(');const next=src.indexOf('\nfunction ',start+10);return src.slice(start,next>0?next:undefined).split('\n// ═')[0];}
const server=spawn(process.execPath,['server.cjs'],{env:{...process.env,PORT:'3497',HOST:'127.0.0.1',EXODUSER_SAVE_DIR:out+'/websave'},stdio:'ignore'});
(async()=>{let browser;try{for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:3497/index.html')).ok)break}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});await page.goto('http://127.0.0.1:3497/index.html?test=1');
 await page.setContent('<body style="margin:0;background:#000"><canvas id="c" width="1920" height="1080"></canvas></body>');
 await page.addScriptTag({url:'http://127.0.0.1:3497/localization-runtime.js'});await page.addScriptTag({url:'http://127.0.0.1:3497/localization-data.js'});
 await page.addStyleTag({content:'@font-face{font-family:"Noto Sans KR";src:url("http://127.0.0.1:3497/godot/assets/fonts/NotoSansKR.ttf")}'});await page.evaluate(()=>document.fonts.load('20px "Noto Sans KR"'));
 const sourceData=JSON.parse(fs.readFileSync('godot/data/parity_intro_source.json'));
 const helpers=src.slice(src.indexOf('function _cutVignette('),src.indexOf('const _forceCutscene='));
 const render=src.slice(src.indexOf('function _renderIntroCutscene(){'),src.indexOf('// ═══ 1랩 시작 인트로'));
 await page.evaluate(({sourceData,helpers,render})=>{
 const code=`var OPT={lang:'ko'},C=document.getElementById('c'),_cutC=C,_cutX=C.getContext('2d'),_cutsceneState='INTRO_CUTSCENE',_cutSkipHolding=false,_cutSkipHold=0,_cutSkipLastT=0,_CUT_SKIP_DUR=2000,_cutLineIdx=0,_cutLineStartMs=0,_cutWaitInput=false,_cutsceneIdx=-1,_cutVibDone=false,_cutSeq='INTRO';var INTRO_CUTSCENE_LINES=${JSON.stringify(sourceData.lines)};var CUTSCENE_SPEAKER_STYLES={GODDESS:{color:'#c084fc',label:{ko:'네메시아'}},DIROY:{color:'#e8d4b8',label:{ko:'디로이'}},HECTOR:{color:'#fb923c',label:{ko:'핵터'}}};var _ease={linear:t=>t,in:t=>t*t,out:t=>1-(1-t)*(1-t),inout:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};var _imgs={};function _cutsceneGetLines(){return INTRO_CUTSCENE_LINES.ko}function _playSfxSafe(){}function _playVoiceSafe(){}function _T(s){return s}function _cutsceneEnd(){}function _getCutsceneImg(f){return _imgs[f]}`;
 (0,eval)(code+helpers+render);
 window.captureCue=async(i,ms)=>{for(const cue of sourceData.lines.ko){if(!cue.img||_imgs[cue.img])continue;let im=new Image();im.src='http://127.0.0.1:3497/assets/cutscene/images/'+cue.img;await im.decode();_imgs[cue.img]=im;}_cutLineIdx=i;_cutLineStartMs=performance.now()-ms;_cutWaitInput=false;_cutsceneIdx=i;_renderIntroCutscene();};
 },{sourceData,helpers,render});
 for(const [name,index,ms] of [['entry_start',0,1200],['entry_goddess',2,1800],['entry_diroy',10,1800]]){await page.evaluate(([i,ms])=>captureCue(i,ms),[index,ms]);await page.screenshot({path:out+'/captures/'+name+'_web.png'});}
 // Source HTML video element + native WebVTT renderer, at matching still clocks.
 const videos=JSON.parse(fs.readFileSync('godot/data/parity_video_source.json'));
 for(const [name,key,t] of [['lobby_start','world',1],['lobby_middle','world',56.34],['character','warrior',5.55]]){
 const g=videos[key];await page.setContent('<body style="margin:0;background:black"><video id="v" style="width:1920px;height:1080px;object-fit:contain"></video></body>');
 await page.evaluate(async({g,t,key})=>{const v=document.getElementById('v');v.src='http://127.0.0.1:3497/'+g.movie;await new Promise(r=>v.onloadedmetadata=r);const track=v.addTextTrack('subtitles','ko','ko');for(const cue of g.subtitles.ko){const c=new VTTCue(cue.start,cue.end,cue.text);if(key==='world'){c.size=84;c.line=-3;c.position=50;c.positionAlign='center';}track.addCue(c);}track.mode='showing';v.currentTime=t;await new Promise(r=>v.onseeked=r);},{g,t,key});await page.screenshot({path:out+'/captures/'+name+'_web.png'});}
 console.log('source canvas/video captures 6');
 }finally{if(browser)await browser.close();server.kill();await new Promise(r=>server.on('exit',r));}})().catch(e=>{console.error(e);process.exitCode=1;});
