/* New-character warrior story. The movie contains its own narration and subtitles. */
(function(root){
  let activePromise=null,finishCurrent=null;
  root.ExoduserCharacterStory={
    get active(){return !!activePromise;},
    skip(){if(finishCurrent)finishCurrent(true);},
    play({skipLabel='Skip'}={}){
      if(activePromise)return activePromise;
      const previousFocus=document.activeElement;
      const overlay=document.createElement('div');overlay.id='characterStoryOverlay';
      overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Warrior story');
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center';
      const video=document.createElement('video');video.id='characterStoryVideo';
      video.src='video/warrior_story_v21.mp4';video.preload='auto';video.playsInline=true;video.controls=true;
      video.muted=false;video.volume=1;video.style.cssText='width:100%;height:100%;object-fit:contain';
      const skip=document.createElement('button');skip.id='characterStorySkip';skip.textContent=skipLabel+' · Esc';
      skip.style.cssText='position:absolute;right:24px;top:24px;color:#eee;background:#151515cc;border:1px solid #777;padding:12px 18px;font:inherit;cursor:pointer';
      overlay.append(video,skip);document.body.append(overlay);
      let resolve,done=false;
      activePromise=new Promise(r=>{resolve=r;});const result=activePromise;
      function finish(seen){
        if(done)return;done=true;
        document.removeEventListener('keydown',key,true);
        video.pause();video.removeAttribute('src');video.load();overlay.remove();
        finishCurrent=null;activePromise=null;
        if(previousFocus&&previousFocus.focus)previousFocus.focus();
        resolve(seen);
      }
      function key(e){
        if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(true);}
        else if(e.key!=='Tab')e.stopPropagation();
      }
      finishCurrent=finish;
      document.addEventListener('keydown',key,true);
      skip.addEventListener('click',()=>finish(true));
      video.addEventListener('ended',()=>finish(true));
      video.addEventListener('error',()=>finish(false));
      skip.focus();
      const playback=video.play();
      if(playback&&playback.catch)playback.catch(error=>{
        // Browser autoplay policy: native controls allow one click to start with sound.
        if(error.name==='NotAllowedError')video.focus();else finish(false);
      });
      return result;
    }
  };
})(globalThis);
