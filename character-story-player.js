/* New-character warrior story. The movie contains narration, score and subtitles. */
(function(root){
  const CUES=Object.freeze([1,5.5,10,16,22.5,28,33.5,39,42.24,46.5,51,53.48,56.019999999999996,59.5,59.98,65,70.67,76,81.5,88,90.33333333333333,92.9]);
  const HOLD_MS=1200;
  let activePromise=null,finishCurrent=null,nextCurrent=null,holdCurrent=null;
  root.ExoduserCharacterStory={
    CUES,HOLD_MS,
    get active(){return !!activePromise;},
    skip(){if(finishCurrent)finishCurrent(true);},
    next(){if(nextCurrent)nextCurrent();},
    setSkipHeld(held,source='gamepad'){if(holdCurrent)holdCurrent(held,source);},
    play({skipLabel='건너뛰기',language='ko'}={}){
      if(activePromise)return activePromise;
      const previousFocus=document.activeElement;
      const overlay=document.createElement('div');overlay.id='characterStoryOverlay';
      overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Warrior story');
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center';
      const video=document.createElement('video');video.id='characterStoryVideo';
      video.src='video/warrior_story_v22_bgm.mp4';video.preload='auto';video.playsInline=true;video.controls=false;
      video.disablePictureInPicture=true;video.disableRemotePlayback=true;video.tabIndex=-1;
      video.muted=false;video.volume=1;video.style.cssText='width:100%;height:100%;object-fit:contain;pointer-events:none';
      const ui=document.createElement('div');ui.id='characterStoryHints';ui.style.cssText='position:absolute;right:3%;bottom:3%;display:flex;gap:22px;align-items:center;color:#c9b795;font:13px serif;letter-spacing:.06em;transition:opacity .4s ease,visibility 0s linear .4s';
      const buttonStyle='position:relative;color:inherit;background:transparent;border:0;padding:10px 0;font:inherit;cursor:pointer;touch-action:none;text-shadow:0 2px 5px #000';
      const next=document.createElement('button');next.id='characterStoryNext';next.textContent=(language==='ko'?'다음 대사':'Next line')+' · A / Enter';next.style.cssText=buttonStyle;
      const skip=document.createElement('button');skip.id='characterStorySkip';skip.style.cssText=buttonStyle;
      const label=document.createElement('span');label.textContent=skipLabel+' · '+(language==='ko'?'Esc / B 길게':'hold Esc / B');
      const progress=document.createElement('span');progress.style.cssText='position:absolute;left:0;bottom:0;height:2px;width:0;background:#ccb789';
      skip.append(label,progress);ui.append(next,skip);overlay.append(video,ui);document.body.append(overlay);
      overlay.tabIndex=-1;
      let resolve,done=false,needsGesture=false,hintsHidden=false,holdTimer=null,holdStart=0;
      const heldSources=new Set();
      activePromise=new Promise(r=>{resolve=r;});const result=activePromise;
      function finish(seen){
        if(done)return;done=true;
        document.removeEventListener('keydown',key,true);
        document.removeEventListener('keyup',keyUp,true);
        document.removeEventListener('pointerup',pointerUp,true);
        document.removeEventListener('visibilitychange',cancelHold);
        if(typeof window!=='undefined')window.removeEventListener('blur',cancelHold);
        cancelHold();
        video.pause();video.removeAttribute('src');video.load();overlay.remove();
        finishCurrent=null;nextCurrent=null;holdCurrent=null;activePromise=null;
        if(previousFocus&&previousFocus.focus)previousFocus.focus();
        resolve(seen);
      }
      function cancelHold(){heldSources.clear();if(holdTimer!==null)clearInterval(holdTimer);holdTimer=null;progress.style.width='0';}
      function setHeld(held,source){
        if(done)return;
        if(held)heldSources.add(source);else heldSources.delete(source);
        if(!heldSources.size){cancelHold();return;}
        if(holdTimer!==null)return;
        holdStart=Date.now();holdTimer=setInterval(()=>{
          const fraction=Math.min(1,(Date.now()-holdStart)/HOLD_MS);
          progress.style.width=(fraction*100)+'%';if(fraction===1)finish(true);
        },16);
      }
      function resume(){
        const playback=video.play();
        if(playback&&playback.catch)playback.then(()=>{needsGesture=false;next.textContent=(language==='ko'?'다음 대사':'Next line')+' · A / Enter';}).catch(error=>{
          if(done)return;
          if(error.name==='NotAllowedError'){
            needsGesture=true;next.textContent=language==='ko'?'클릭하여 계속':'Click to continue';
          }else finish(false);
        });
      }
      function advance(){
        if(done)return;
        if(needsGesture){resume();return;}
        const at=CUES.find(t=>t>video.currentTime+.05);
        if(at===undefined){finish(true);return;}
        video.currentTime=at;if(video.paused)resume();
      }
      function key(e){
        e.stopPropagation();
        if(e.key==='Escape'){e.preventDefault();if(!e.repeat)setHeld(true,'keyboard');}
        else if(['Enter',' ','ArrowRight'].includes(e.key)){e.preventDefault();if(!e.repeat)advance();}
        else if(e.key==='Tab'){e.preventDefault();(hintsHidden?overlay:next).focus();}
      }
      function keyUp(e){if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setHeld(false,'keyboard');}}
      function pointerUp(){setHeld(false,'pointer');}
      finishCurrent=finish;nextCurrent=advance;holdCurrent=setHeld;
      document.addEventListener('keydown',key,true);
      document.addEventListener('keyup',keyUp,true);
      document.addEventListener('pointerup',pointerUp,true);
      document.addEventListener('visibilitychange',cancelHold);
      if(typeof window!=='undefined')window.addEventListener('blur',cancelHold);
      overlay.addEventListener('click',advance);
      overlay.addEventListener('contextmenu',e=>e.preventDefault());
      next.addEventListener('click',e=>{e.stopPropagation();advance();});
      skip.addEventListener('click',e=>e.stopPropagation());
      skip.addEventListener('pointerdown',e=>{e.preventDefault();setHeld(true,'pointer');});
      skip.addEventListener('pointerleave',pointerUp);skip.addEventListener('pointercancel',pointerUp);
      video.addEventListener('timeupdate',()=>{
        if(hintsHidden||video.currentTime<3)return;
        hintsHidden=true;ui.style.opacity='0';ui.style.visibility='hidden';ui.style.pointerEvents='none';
        if(document.activeElement===next||document.activeElement===skip)overlay.focus();
      });
      video.addEventListener('ended',()=>finish(true));
      video.addEventListener('error',()=>finish(false));
      overlay.focus();resume();
      return result;
    }
  };
})(globalThis);
