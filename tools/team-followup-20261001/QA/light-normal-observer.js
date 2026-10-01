// Single-run normal-play observation. No game-state/input/GPU/CPU-profiler writes.
(() => {
  window.__lightNormalQA?.stop('reinstall');
  const clone = x => JSON.parse(JSON.stringify(x));
  const options = () => Object.fromEntries(['quality','resScale','ssaa','fpsCap','parts','diff','atmos','bloom','lighting','postfx','fog','grain'].map(k=>[k,OPT[k]]));
  const state = () => ({at:performance.now(),on:G.on,paused:G.paused,kills:G.kills,hp:P.hp,lv:P.lv,x:P.x,y:P.y,
    enemies:ens.filter(e=>e.alive).length,hidden:document.hidden,focus:document.hasFocus(),gl:_useGL,gpu:_useGPU});
  const originalDraw=draw, undo=[];
  let raf=0, timer=0, lastOptions=JSON.stringify(options());
  const api=window.__lightNormalQA={schema:'light-normal-v1',at:new Date().toISOString(),start:performance.now(),
    rows:[],draws:[],inputs:[],events:[],dropped:0,stopped:false,reason:null,firstInput:null,firstKill:null,
    initial:state(),initialOptions:options(),end:null,finalOptions:null,cleanupErrors:[],
    environment:{url:location.href,ua:navigator.userAgent,timeOrigin:performance.timeOrigin,
      viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,canvas:[C.width,C.height],profiler:false,gpuTiming:false,
      instrumentation:'one pass-through draw wrapper + rAF state/options snapshots; no update/Canvas/WebGL wrappers; overhead not independently measured'},
    stop(reason='manual'){
      if(api.stopped)return api;
      api.stopped=true;api.reason=reason;api.end=state();api.finalOptions=options();
      for(const fn of [()=>cancelAnimationFrame(raf),()=>clearTimeout(timer),...undo.reverse()]){
        try{fn()}catch(e){api.cleanupErrors.push(String(e))}
      }
      api.restored={draw:draw===originalDraw,listeners:api.cleanupErrors.length===0};
      return api;
    }
  };
  function add(array,row,limit=6000){if(array.length<limit)array.push(row);else api.dropped++;}
  const wrappedDraw=function(...args){
    const at=performance.now();
    try{return originalDraw.apply(this,args)}
    finally{if(!api.stopped)add(api.draws,{at,end:performance.now()});}
  };
  draw=wrappedDraw;undo.push(()=>{if(draw===wrappedDraw)draw=originalDraw});
  for(const kind of ['keydown','keyup','mousedown','mouseup']){
    const fn=e=>{
      const s=state();
      const row={kind,...s,trusted:e.isTrusted,code:e.code||null,button:e.button??null,target:e.target?.tagName||null};
      add(api.inputs,row,1000);
      if(api.firstInput===null&&s.on&&!s.paused&&e.isTrusted&&
        ((kind==='keydown'&&e.code==='KeyW')||(kind==='mousedown'&&e.target?.tagName==='CANVAS')))api.firstInput=row;
    };
    addEventListener(kind,fn,true);undo.push(()=>removeEventListener(kind,fn,true));
  }
  for(const kind of ['blur','focus','resize','visibilitychange']){
    const target=kind==='visibilitychange'?document:window;
    const fn=()=>{
      add(api.events,{kind,...state()},1000);
      if(api.firstInput&&(document.hidden||!document.hasFocus()))api.stop('background-or-focus-loss');
    };
    target.addEventListener(kind,fn);undo.push(()=>target.removeEventListener(kind,fn));
  }
  function frame(timestamp){
    if(api.stopped)return;
    try{
      const row={timestamp,...state()};add(api.rows,row);
      const opt=options(), serialized=JSON.stringify(opt);
      if(serialized!==lastOptions){add(api.events,{kind:'options',at:row.at,options:opt},1000);lastOptions=serialized;}
      if(api.firstKill===null&&row.kills>api.initial.kills)api.firstKill=clone(row);
      if(api.firstInput){
        if(row.hidden||!row.focus){api.stop('background-or-focus-loss');return;}
        if(row.hp<=0||!row.on){api.stop('natural-death-or-ended');return;}
        if(row.at-api.firstInput.at>=25000){api.stop('25s-after-input');return;}
      }
    }catch(e){add(api.events,{kind:'observer-error',at:performance.now(),message:String(e)},1000);api.stop('observer-error');return;}
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);timer=setTimeout(()=>api.stop('120s-install-deadline'),120000);
  return {installed:true,initial:api.initial,environment:api.environment};
})();
