/* One black-frame boundary for menus, decoded movies and page navigation. */
(function(root){
  'use strict';
  const html=document.documentElement,KEY='exoduser:screen-transfer:v1';
  const reduce=()=>root.matchMedia('(prefers-reduced-motion: reduce)').matches||!!root.ScreenTransition.reduceMotion;
  const duration=ms=>reduce()?80:ms;
  let executing=false,active=null,loadingTimer=null,loadingSince=0,animation=null,covered=false,fadeSeq=0;
  let incoming=0;
  try{incoming=Number(sessionStorage.getItem(KEY))||0;sessionStorage.removeItem(KEY);}catch{}
  if(incoming&&Date.now()-incoming>15000)incoming=0;
  const boot=/game(?:demo)?\.html$/i.test(location.pathname);
  if(incoming||boot){html.dataset.screenCover='1';covered=true;}
  const element=()=>document.getElementById('screenTransition');
  const paint=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  function loading(on,since=Date.now()){
    clearTimeout(loadingTimer);loadingTimer=null;loadingSince=on?since:0;
    html.removeAttribute('data-screen-loading');
    if(on)loadingTimer=setTimeout(()=>{if(loadingSince)html.dataset.screenLoading='1';},Math.max(0,300-(Date.now()-since)));
  }
  function audio(value,ms){root.DecisionSound?.setTransitionGain?.(value,ms);}
  async function fade(to,ms,keepLoading=false){
    const seq=++fadeSeq;
    const el=element();if(!el)return;
    if(animation){animation.cancel();animation=null;}
    const from=Number(getComputedStyle(el).opacity),time=duration(ms);
    if(to===1){covered=true;html.dataset.screenCover='1';}
    audio(1-to,time);root.dispatchEvent(new CustomEvent('screen-transition-gain',{detail:{value:1-to,ms:time}}));
    el.style.opacity=String(to);
    if(el.animate){animation=el.animate([{opacity:from},{opacity:to}],{duration:time,easing:'ease-in-out'});await animation.finished.catch(()=>{});animation=null;}
    else await new Promise(r=>setTimeout(r,time));
    if(seq!==fadeSeq)return;
    if(to===0){covered=false;html.removeAttribute('data-screen-cover');if(!keepLoading)loading(false);}
  }
  function fadeOut(){return fade(1,500);}
  function fadeIn(options={}){return fade(0,600,options.keepLoading);}
  function withLoading(work){
    if(active)return active;
    active=(async()=>{if(!covered)await fadeOut();loading(true);try{executing=true;return await (typeof work==='function'?work():work);}finally{executing=false;loading(false);await paint();await fadeIn();}})().finally(()=>{active=null;});
    return active;
  }
  function navigate(url,isCurrent=()=>true){
    if(active)return active;
    active=(async()=>{if(!covered)await fadeOut();if(!isCurrent()){await fadeIn();active=null;return;}const since=Date.now();loading(true,since);try{sessionStorage.setItem(KEY,String(since));}catch{}try{location.assign(url);}catch(error){await fadeIn();active=null;throw error;}})();
    return active;
  }
  function imageReady(img){
    if(!img)return Promise.resolve();
    if(img.complete)return img.decode?img.decode().catch(()=>{}):Promise.resolve();
    return new Promise(resolve=>{const done=()=>{clearTimeout(timer);img.removeEventListener('load',done);img.removeEventListener('error',done);resolve();};const timer=setTimeout(done,8000);img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});});
  }
  function videoReady(video){
    return new Promise((resolve,reject)=>{
      const done=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',fail);resolve();};
      const fail=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',ready);video.removeEventListener('error',fail);reject(video.error||new Error('Video decode failed'));};
      const ready=()=>{if(video.readyState<2)return;if(video.requestVideoFrameCallback&&!video.paused){video.requestVideoFrameCallback(done);}else done();};
      const timer=setTimeout(fail,12000);video.addEventListener('loadeddata',ready);video.addEventListener('error',fail);ready();
    });
  }
  // Native input is blocked only while the black boundary is active; focus is retained.
  for(const type of ['click','pointerdown','keydown'])document.addEventListener(type,e=>{if(active){e.preventDefault();e.stopImmediatePropagation();}},true);
  root.ScreenTransition={fadeOut,fadeIn,withLoading,navigate,imageReady,videoReady,loading,paint,reduceMotion:false,get busy(){return !!active;},get executing(){return executing;}};
  if(incoming||boot)loading(true,incoming||Date.now());
  root.addEventListener('pageshow',e=>{if(e.persisted){active=null;fadeIn();}});
})(globalThis);
