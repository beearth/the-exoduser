/* World intro: gate and metal title, English VO, external captions, continuous score. */
(function(root){
  'use strict';
  const CUTS=Object.freeze([0,4.041667,12.75,17.291667,27.791667,46.291667,56.291667,69.291667,76.291667,78.041667,80.291667,84.791667,87.791667,90.791667,95.791667,102.791667,109.291667]);
  function create({video,getMusic,onEnded=()=>{},onError=()=>{},onState=()=>{}}){
    let active=true,started=false,playing=false,music=null,voiceGain=1,musicGain=.22;
    let fadeTimer=null,mixStarted=false;
    const listeners=[];
    const listen=(event,fn)=>{video.addEventListener(event,fn);listeners.push([event,fn]);};
    function clearFade(){
      if(fadeTimer!==null){clearInterval(fadeTimer);fadeTimer=null;}
    }
    function duckMusic(){
      if(mixStarted||!music)return;
      mixStarted=true;
      const from=music.volume,began=Date.now();
      if(from===musicGain)return;
      fadeTimer=setInterval(()=>{
        const progress=Math.min(1,(Date.now()-began)/1000);
        music.volume=progress===1?musicGain:from+(musicGain-from)*progress;
        if(progress===1)clearFade();
      },50);
    }
    function pauseMusic(){playing=false;if(music)music.pause();}
    function playMusic(){
      if(!active)return;
      playing=true;duckMusic();onState('playing');
      if(music&&music.paused)Promise.resolve(music.play()).then(()=>{
        if(!active||!playing)music.pause();
      }).catch(error=>{if(active&&playing)onError(error,'music');});
    }
    function stop(){
      if(!active)return;
      active=false;playing=false;clearFade();
      listeners.forEach(([event,fn])=>video.removeEventListener(event,fn));
      video.pause();if(music)music.pause();
    }
    function finish(){if(!active)return;stop();onEnded();}
    async function resume(){
      if(!active)return false;
      try{await video.play();if(!active){video.pause();return false;}return true;}
      catch(error){if(active){pauseMusic();onError(error,'video');}return false;}
    }
    listen('playing',playMusic);
    listen('pause',()=>{pauseMusic();if(active)onState('paused');});
    // The score belongs to the whole cinematic, not the movie's seek clock.
    listen('waiting',()=>{if(active)onState('waiting');});
    listen('seeked',()=>{if(!video.paused)playMusic();});
    listen('ended',finish);
    listen('error',()=>{pauseMusic();if(active)onError(video.error,'video');});
    return {
      async start(){
        if(!active)return false;
        if(!started){
          started=true;music=getMusic();
          video.muted=false;video.volume=voiceGain;video.currentTime=0;
          if(music){music.loop=true;music.muted=false;playing=!music.paused;}
        }
        else if(!video.paused){playMusic();return true;}
        if(video.error)video.load();
        return resume();
      },
      stop,
      next(){
        if(!active||!started)return;
        const next=CUTS.find(t=>t>video.currentTime+.05);
        if(next===undefined){finish();return;}
        video.currentTime=next;
      },
      toggle(){
        if(!active)return;
        if(video.paused)return resume();
        video.pause();
      },
      setVolumes(voice,bgm){
        if(Number.isFinite(voice))voiceGain=Math.max(0,Math.min(1,voice));
        if(Number.isFinite(bgm)){clearFade();mixStarted=true;musicGain=Math.max(0,Math.min(1,bgm));}
        video.volume=voiceGain;if(music)music.volume=musicGain;
      }
    };
  }
  root.WorldIntroPlayer=Object.freeze({create,CUTS});
})(globalThis);
