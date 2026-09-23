(function(){
  const fs=require('fs'),path=require('path');
  const out=process.env.EXODUSER_QA_OUTPUT||'G:/exoduser/output/steam_review_20260916';
  const smoke=process.env.EXODUSER_QA_SMOKE==='1';
  const reportPath=out+(smoke?'/runtime-smoke.json':'/runtime.json');
  const locales=()=>smoke?['ko','en','fr','ja']:ExoduserI18n.languages;
  fs.appendFileSync(out+'/probe-start.log',new Date().toISOString()+' '+location.href+' '+document.readyState+'\n');
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const errors=[];addEventListener('error',e=>{errors.push(String(e.message));fs.appendFileSync(out+'/page-errors.log',location.href+' '+e.message+'\n');});addEventListener('unhandledrejection',e=>{errors.push(String(e.reason));fs.appendFileSync(out+'/page-errors.log',location.href+' '+e.reason+'\n');});
  const read=()=>fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath,'utf8')):{languages:[],phase:'lobby'};
  const save=r=>fs.writeFileSync(reportPath,JSON.stringify(r,null,2));
  const select=(id,code)=>{const el=document.getElementById(id);el.value=code;el.dispatchEvent(new Event('change',{bubbles:true}));};
  const text=id=>document.getElementById(id)?.textContent.trim();
  async function showLogin(){
    for(let i=0;i<3;i++){document.getElementById('splashOverlay')?.click();await wait(600);}
    await wait(1000);_goLogin();await wait(600);
  }
  async function capture(name){fs.appendFileSync(out+'/probe-steps.log',new Date().toISOString()+' '+name+'\n');await until(()=>{const cover=document.getElementById('stageTransition');return !cover||Number(getComputedStyle(cover).opacity)<.01;});await wait(500);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Screenshot timeout '+name)),10000);nw.Window.get().capturePage(data=>{clearTimeout(timer);fs.writeFileSync(out+'/'+name+'.png',Buffer.from(data.split(',')[1],'base64'));resolve();},{format:'png',datatype:'datauri'});});}
  async function until(fn){for(let i=0;i<180;i++){try{if(fn())return;}catch{}await wait(250);}throw Error('Initialization timeout '+location.href);}
  async function verifyStory(r){
    await until(()=>typeof ExoduserCharacterStory!=='undefined');
    r.storyTracks=[];
    for(const code of locales()){
      const completion=ExoduserCharacterStory.play({language:code});
      const video=document.getElementById('characterStoryVideo');
      await until(()=>video.readyState>=2&&video.textTracks[0]?.cues?.length===22);
      video.pause();const track=video.textTracks[0];
      const expected=fs.readFileSync(path.join(process.env.EXODUSER_QA_PACKAGE||'G:/exoduser/out/EXODUSER-win64','package.nw/video/subtitles/warrior_story_v23_'+code+'.vtt'),'utf8').split(String.fromCharCode(13)).join('').trim().split(/\n\s*\n/).slice(1).map(block=>block.split('\n').slice(block.split('\n').findIndex(line=>line.includes('-->'))+1).join('\n'));
      const actual=Array.from(track.cues,c=>c.text);
      if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Decoded subtitle text differs '+code);
      let active=0;
      for(const cue of Array.from(track.cues)){
        await new Promise((resolve,reject)=>{
          const finish=()=>{clearTimeout(timer);resolve();};
          const timer=setTimeout(()=>{video.removeEventListener('seeked',finish);reject(Error('Subtitle seek timeout '+code));},10000);
          video.addEventListener('seeked',finish,{once:true});video.currentTime=(cue.startTime+cue.endTime)/2;
        });
        await until(()=>!video.seeking&&Array.from(track.activeCues||[]).some(c=>c.text===cue.text));active++;
      }
      r.storyTracks.push({code,cues:actual.length,activeCuesVerified:active,mode:track.mode,duration:video.duration,videoWidth:video.videoWidth,videoHeight:video.videoHeight});
      if(['en','ar','ja'].includes(code))await capture('story-'+code);
      ExoduserCharacterStory.skip();await completion;save(r);
    }
    const complete=ExoduserCharacterStory.play({language:'en'});
    const movie=document.getElementById('characterStoryVideo');let ended=false;
    movie.addEventListener('ended',()=>{ended=true;},{once:true,capture:true});
    const began=Date.now();let frames=0,audioBytes=0,maxTime=0;
    const sample=setInterval(()=>{frames=Math.max(frames,movie.getVideoPlaybackQuality?.().totalVideoFrames||0);audioBytes=Math.max(audioBytes,movie.webkitAudioDecodedByteCount||0);maxTime=Math.max(maxTime,movie.currentTime);},250);
    let timer;
    try{const seen=await Promise.race([complete,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Full movie playback timeout')),180000);})]);
      r.storyPlayback={seen,ended,elapsedMs:Date.now()-began,maxTime,frames,audioBytes};
      if(!seen||!ended||frames<100||maxTime<90||audioBytes<=0)throw Error('Movie decode/playback incomplete '+JSON.stringify(r.storyPlayback));
    }finally{clearInterval(sample);clearTimeout(timer);ExoduserCharacterStory.skip();}
    save(r);
  }
  async function run(){
    let r=read();
    try{
      nw.Window.get().leaveFullscreen();nw.Window.get().resizeTo(1280,720);if(process.env.EXODUSER_QA_HIDDEN!=='1')nw.Window.get().show();
      r.runtime={nw:process.versions.nw,chromium:process.versions.chrome,appData:process.env.APPDATA,profile:nw.App.dataPath,url:location.href};
      const profileRoot=path.resolve(out,'profiles')+path.sep;
      if(!path.resolve(r.runtime.appData).startsWith(profileRoot))throw Error('Save isolation not active');
      if(location.pathname.endsWith('index.html')){
        await until(()=>typeof getCurrentLanguage==='function'&&typeof _worldIntroSubtitles!=='undefined');
        await wait(1500);await showLogin();
        if(r.phase==='restart-matrix'){
          r.restartMatrix=r.restartMatrix||[];
          if(r.matrixPending){
            const result={code:r.matrixPending,actual:getCurrentLanguage(),stored:localStorage.getItem('hellLang'),label:text('offlineBtn')};
            if(result.actual!==result.code||result.stored!==result.code)throw Error('Restart persistence '+JSON.stringify(result));
            await capture('relaunch-'+result.code);r.restartMatrix.push(result);
          }
          const next=ExoduserI18n.languages[r.restartMatrix.length];
          if(next){select('loginLangSelect',next);r.matrixPending=next;r.matrixCompletedLaunch=(r.matrixCompletedLaunch||0)+1;}
          else{r.phase='detail-game';save(r);location.href='/game.html?test=1&testchar=0';return;}
          save(r);nw.App.quit();return;
        }
        if(r.phase==='restart'){
          r.restart={expected:r.restartExpected,actual:getCurrentLanguage(),stored:localStorage.getItem('hellLang'),title:text('offlineBtn'),processRestart:true};
          await capture('restart-'+r.restartExpected);r.phase='complete';r.errors=(r.errors||[]).concat(errors);save(r);nw.App.quit();return;
        }
        r.freshSettings=localStorage.getItem('hellcave_settings');
        if(!smoke&&!r.storyPlayback)await verifyStory(r);
        r.lobby=[];
        for(const code of locales()){
          select('loginLangSelect',code);await wait(40);
          r.lobby.push({code,actual:getCurrentLanguage(),stored:localStorage.getItem('hellLang'),offline:text('offlineBtn'),create:text('createBtn'),heading:document.querySelector('#loginSection h2')?.textContent,selectors:['loginLangSelect','langSelect','lobbyLangSelect','cinLang'].map(id=>document.getElementById(id).value)});
          await capture('lobby-'+code);
          openVisualSelect();r.lobby[r.lobby.length-1].character=document.getElementById('charVisualPop').innerText;await capture('character-'+code);document.getElementById('visualCancelBtn').click();
        }
        select('loginLangSelect','fr');
        r.phase='fresh-game';save(r);location.href='/game.html?test=1&testchar=0';return;
      }
      if(location.pathname.endsWith('game.html')){
        await until(()=>typeof OPT!=='undefined'&&typeof G!=='undefined'&&typeof P!=='undefined'&&P&&typeof openPanel==='function');
        await until(()=>_cutsceneState||_introGuide||G._cutsceneDone);
        await wait(500);
        r.bootLanguage={expected:r.phase==='fresh-game'?'fr':'ja',actual:OPT.lang,stored:localStorage.getItem('hellLang')};
        if(_cutsceneState){_cutSeq='INTRO';_cutsceneEnd();await wait(500);}
        if(_introGuide){
          if(r.phase!=='detail-game')r.tutorials=[];
          if(r.phase!=='detail-game')for(const code of locales()){select('optLang',code);await wait(80);r.tutorials.push({code,text:document.getElementById('introKeys').innerText});await capture('tutorial-'+code);}
          document.getElementById('ikSkip').click();await wait(1200);
          if(typeof _parryLesson!=='undefined'&&_parryLesson.active)_parryLesson.skipAll();
          await wait(500);
          select('optLang',r.bootLanguage.actual);
        }
        if(r.phase==='detail-game'){
          r.details=[];
          for(const code of locales()){
            select('optLang',code);openPanel('invPanel');
            const equipped=Array.from(document.getElementById('invEqGrid').children).find(e=>typeof e.onmouseover==='function');
            if(!equipped)throw Error('No equipped item detail available');
            equipped.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));
            const detail={code,item:document.getElementById('invRight').innerText};
            if(!detail.item)throw Error('Empty item detail '+code);
            await capture('item-'+code);closeAllPanels();G.paused=true;
            detail.hud=document.getElementById('hudCorner').innerText;await capture('hud-'+code);r.details.push(detail);
          }
          r.resourceErrors=performance.getEntriesByType('resource').filter(e=>e.responseStatus>=400).map(e=>({name:e.name,status:e.responseStatus}));
          r.errors=(r.errors||[]).concat(errors);r.phase='complete';save(r);nw.App.quit();return;
        }
        if(r.phase==='fresh-game'){
          r.freshGame=r.bootLanguage;
          openPanel('settings');await capture('fresh-game-fr');
          r.languages=[];
          for(const code of locales()){
            select('optLang',code);await wait(40);
            const row={code,actual:OPT.lang,stored:localStorage.getItem('hellLang'),settings:document.querySelector('#settings .ptitle')?.textContent,close:text('setClose'),death:[text('deathTitle'),text('deathSub'),text('retryBtn')],hud:text('qsESC'),sampleItem:_T('낡은 검'),sampleSkill:_L('악의기둥','Dark Pillar'),direction:document.documentElement.dir};
            row.pet={source:_petBubble.sourceTxt,display:text('petBubbleTxt'),expected:_petBubble.sourceTxt?_T(_petBubble.sourceTxt):null};
            if(row.actual!==code||row.stored!==code)throw Error('Language selection failed '+code);
            row.settingsText=document.getElementById('settings').innerText;
            row.overflow=Array.from(document.querySelectorAll('#settings button,#settings .set-name')).filter(e=>e.offsetWidth&&e.scrollWidth>e.clientWidth+2).map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth}));
            await capture('settings-'+code);
            openPanel('invPanel');row.inventory=document.getElementById('invPanel').innerText;await capture('inventory-'+code);
            openPanel('skillPanel');row.skills=document.getElementById('skillPanel').innerText;await capture('skills-'+code);
            openPanel('statPanel');row.growth=document.getElementById('statPanel').innerText;await capture('growth-'+code);
            openPanel('settings');
            r.languages.push(row);save(r);
          }
          select('optLang','ko');r.phase='existing-lobby';save(r);location.href='/index.html';return;
        }
        if(r.phase==='existing-game'){
          r.existingGame=r.bootLanguage;openPanel('settings');await capture('existing-game-ja');
          closeAllPanels();G.paused=true;P._fallenCanRevive=false;_fallenResolve();
          await until(()=>document.getElementById('death').classList.contains('on'));
          r.deathScreens=[];
          for(const code of locales()){select('optLang',code);await wait(250);r.deathScreens.push({code,title:text('deathTitle'),subtitle:text('deathSub'),retry:text('retryBtn')});await capture('death-'+code);}
          select('optLang','ja');
          r.restartExpected='ja';r.phase='restart';r.errors=(r.errors||[]).concat(errors);save(r);nw.App.quit();return;
        }
      }
    }catch(e){r.failure=String(e.stack||e);r.errors=(r.errors||[]).concat(errors);save(r);nw.App.quit();}
  }
  // The second lobby visit intentionally conflicts with existing Korean settings.
  async function start(){const r=read();if(r.phase==='existing-lobby'&&location.pathname.endsWith('index.html')){
    try{await until(()=>typeof setUserLanguage==='function'&&typeof _worldIntroSubtitles!=='undefined');await wait(1000);await showLogin();select('loginLangSelect','ja');await capture('existing-lobby-ja');r.phase='existing-game';save(r);location.href='/game.html?test=1&testchar=0';}catch(e){r.failure=String(e.stack||e);save(r);nw.App.quit();}
  }else await run();}
  setTimeout(start,1000);
})();
