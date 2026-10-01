// Read-only identity diagnostic. Does not enqueue, warm, drain or alter any game state.
(() => {
  window.__warmIdentityQA?.stop('reinstall');
  const calls=[],inputs=[],undo=[];
  let timer=0;
  const now=()=>performance.now();
  const originals={next:_warmupNext,image:_warmImageGpu,admit:_texPrewarmSrc};
  const snapshot=img=>{
    const url=img&&typeof img.src==='string'?img.src:null;
    const cached=url&&_texBySrc?_texBySrc.get(url):null;
    return {at:now(),url,type:img?.constructor?.name||typeof img,width:img?.width||0,height:img?.height||0,
      naturalWidth:img?.naturalWidth||0,naturalHeight:img?.naturalHeight||0,complete:img?.complete??null,
      index:_wqIdx,length:_wqLen,on:G.on,paused:G.paused,kills:G.kills,hp:P.hp,focus:document.hasFocus(),hidden:document.hidden,
      gl:_useGL,gpu:_useGPU,budgetUsed:_texPrePx,budgetMax:_TEXHOT_BUDGET_PX,
      busy:_texPreBusy,uploadQueue:_texPreQ.length,waiting:_texPreWait.length,
      seen:!!(url&&_texPreSeen.has(url)),waitingIndex:url?_texPreWait.indexOf(url):-1,
      decoded:!!(url&&_texPreQ.some(j=>j.src===url)),cached:cached?{w:cached.w,h:cached.h}:null};
  };
  const api=window.__warmIdentityQA={schema:'warm-image-identity-v1',calls,inputs,dropped:0,stopped:false,inputAt:null,
    initial:snapshot(null),options:JSON.parse(JSON.stringify(OPT)),environment:{url:location.href,timeOrigin:performance.timeOrigin,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,profiler:false,gpuTiming:false,wrappers:3},
    stop(reason='manual'){
      if(api.stopped)return api;api.stopped=true;api.reason=reason;api.end=snapshot(null);api.finalOptions=JSON.parse(JSON.stringify(OPT));
      clearTimeout(timer);for(const fn of undo.reverse())fn();
      api.restored={next:_warmupNext===originals.next,image:_warmImageGpu===originals.image,admit:_texPrewarmSrc===originals.admit};return api;
    }
  };
  const add=(a,r)=>{if(a.length<300)a.push(r);else api.dropped++};
  function wrap(name,original,read,write,imageArg){
    const fn=function(...args){if(api.stopped)return original.apply(this,args);const before=snapshot(imageArg?args[0]:_wqBuf[_wqIdx]);
      const start=now();try{return original.apply(this,args)}finally{const end=now();add(calls,{name,start,end,duration:end-start,before,after:snapshot(imageArg?args[0]:null),request:name==='admit'?{url:args[0],pixels:args[1]}:null});}};
    write(fn);undo.push(()=>{if(read()===fn)write(original)});
  }
  wrap('next',originals.next,()=>_warmupNext,v=>{_warmupNext=v},false);
  wrap('image',originals.image,()=>_warmImageGpu,v=>{_warmImageGpu=v},true);
  wrap('admit',originals.admit,()=>_texPrewarmSrc,v=>{_texPrewarmSrc=v},true);
  for(const kind of ['keydown','mousedown']){
    const fn=e=>{const row={kind,at:now(),code:e.code||null,button:e.button??null,trusted:e.isTrusted,target:e.target?.tagName||null};add(inputs,row);
      if(api.inputAt===null&&G.on&&!G.paused&&e.isTrusted&&((kind==='keydown'&&e.code==='KeyW')||(kind==='mousedown'&&row.target==='CANVAS'))){api.inputAt=row.at;clearTimeout(timer);timer=setTimeout(()=>api.stop('12s-after-input'),12000);}};
    addEventListener(kind,fn,true);undo.push(()=>removeEventListener(kind,fn,true));
  }
  const blur=()=>api.stop('focus-loss');addEventListener('blur',blur);undo.push(()=>removeEventListener('blur',blur));
  timer=setTimeout(()=>api.stop('120s-install-deadline'),120000);
  return {installed:true,initial:api.initial,environment:api.environment};
})();
