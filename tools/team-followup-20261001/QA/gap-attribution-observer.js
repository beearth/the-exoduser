// Diagnostic variant: loop/update/draw only + explicit browser entries. CPU sampling is external and recorded separately.
(() => {
  window.__combatTimelineQA?.stop('reinstall');
  const loops=[], spans=[], frames=[], events=[], browserEntries=[], undo=[], observers=[], bindingChecks=[];
  const now=()=>performance.now();
  let current=null, phase=null, nextId=0, raf=0, deadline=0, runningSeen=false;
  const state=()=>({kills:G.kills,hp:P.hp,on:G.on,paused:G.paused,atmos:OPT.atmos,
    fpsCap:OPT.fpsCap,hidden:document.hidden,focus:document.hasFocus(),x:P.x,y:P.y,
    enemies:ens.length,items:worldItems.length,projectiles:projs.length});
  const api=window.__combatTimelineQA={startedAt:now(),inputAt:null,stopped:false,reason:null,
    loops,spans,frames,events,browserEntries,dropped:0,cleanupErrors:[],initial:state(),end:null,
    options:JSON.parse(JSON.stringify(OPT)),finalOptions:null,
    environment:{url:location.href,ua:navigator.userAgent,timeOrigin:performance.timeOrigin,
      viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,canvas:[C.width,C.height],
      useGL:_useGL,useGPU:_useGPU,physicsStep:PHYS_STEP,warm:_headCaptureWarmDone,
      warmMs:_headCaptureWarmMs,profiler:true,profilerMode:'external CDP sampling interval requested 1000us',gpuTiming:false,instrumentation:'loop/update/draw pass-through wrappers; rAF/state; PerformanceObserver; overhead unmeasured'},
    stop(reason='manual'){
      if(api.stopped)return api;
      api.stopped=true;api.reason=reason;api.end={at:now(),...state()};
      api.finalOptions=JSON.parse(JSON.stringify(OPT));
      const attempt=(stage,fn)=>{try{fn()}catch(e){api.cleanupErrors.push({stage,message:String(e?.message||e)})}};
      attempt('cancel-raf',()=>cancelAnimationFrame(raf));attempt('clear-deadline',()=>clearTimeout(deadline));
      for(const o of observers){attempt('take-records',()=>collect(o.takeRecords()));attempt('disconnect',()=>o.disconnect());}
      for(const restore of undo.splice(0).reverse())attempt('restore',restore);
      api.restored={loop:loop===originalLoop,update:update===originalUpdate,draw:draw===originalDraw};
      api.restoredBindings=Object.fromEntries(bindingChecks.map(([name,check])=>[name,check()]));
      return api;
    }
  };
  const originalLoop=loop,originalUpdate=update,originalDraw=draw;
  function append(array,row,limit=12000){if(array.length<limit)array.push(row);else api.dropped++;}
  function collect(entries){for(const e of entries){
    const row=e.toJSON?e.toJSON():{name:e.name,entryType:e.entryType,startTime:e.startTime,duration:e.duration};
    if(e.scripts)row.scripts=Array.from(e.scripts,s=>s.toJSON?s.toJSON():{sourceURL:s.sourceURL,sourceFunctionName:s.sourceFunctionName,invoker:s.invoker,invokerType:s.invokerType,startTime:s.startTime,duration:s.duration,executionStart:s.executionStart,forcedStyleAndLayoutDuration:s.forcedStyleAndLayoutDuration});
    if(e.attribution)row.attribution=Array.from(e.attribution,a=>a.toJSON?a.toJSON():{name:a.name,containerType:a.containerType,containerSrc:a.containerSrc});
    append(browserEntries,row,2000);
  }}
  if(typeof PerformanceObserver==='function'){
    for(const type of ['longtask','long-animation-frame']){
      if(!PerformanceObserver.supportedEntryTypes?.includes(type))continue;
      try{const o=new PerformanceObserver(list=>collect(list.getEntries()));o.observe({type,buffered:false});observers.push(o);}catch(_e){}
    }
  }
  api.environment.performanceEntryTypes=typeof PerformanceObserver==='function'?PerformanceObserver.supportedEntryTypes:[];
  function wrap(name,read,write,always=false){
    const original=read();
    if(typeof original!=='function')return;
    const wrapped=function(...args){
      if(api.stopped)return original.apply(this,args);
      const start=now(), parent=phase, owner=current, kills=G.kills;
      phase=name;
      try{return original.apply(this,args);}
      finally{
        const end=now(),duration=end-start;phase=parent;
        if(owner){const a=owner.calls[name]||(owner.calls[name]={count:0,total:0,max:0});a.count++;a.total+=duration;a.max=Math.max(a.max,duration);}
        if(always||duration>=1||G.kills!==kills)append(spans,{kind:name,start,end,duration,loopId:owner?.id??null,parent,killsBefore:kills,killsAfter:G.kills});
      }
    };
    write(wrapped);undo.push(()=>{if(read()===wrapped)write(original)});bindingChecks.push([name,()=>read()===original]);
  }
  wrap('update',()=>update,v=>{update=v},true);
  wrap('draw',()=>draw,v=>{draw=v},true);
  const wrappedLoop=function(timestamp){
    if(api.stopped)return originalLoop.apply(this,arguments);
    const before=state(),row={id:++nextId,rafTimestamp:timestamp,start:now(),before,
      lastLoopTsBefore:_lastLoopTs,prevTsBefore:_prevTs,accBefore:_acc,calls:{}};
    current=row;phase='loop';
    try{return originalLoop.apply(this,arguments);}
    finally{
      row.end=now();row.duration=row.end-row.start;row.after=state();
      row.lastLoopTsAfter=_lastLoopTs;row.accAfter=_acc;
      row.updateCount=row.calls.update?.count||0;row.drawCount=row.calls.draw?.count||0;
      row.skip=before.fpsCap&&timestamp-row.lastLoopTsBefore<1000/before.fpsCap-1?'fps-cap':
        before.hidden?'hidden':row.drawCount===0?'no-game-draw':null;
      append(loops,row,5000);current=null;phase=null;
      for(const key of ['kills','atmos','fpsCap','on','paused','hidden','focus','items']){
        if(before[key]!==row.after[key])append(events,{kind:key,at:row.end,before:before[key],after:row.after[key],loopId:row.id});
      }
      if(api.inputAt!==null){
        if(G.on)runningSeen=true;
        if(document.hidden||!document.hasFocus())api.stop('background-or-focus-loss');
        else if(P.hp<=0||(runningSeen&&!G.on))api.stop('natural-death-or-game-ended');
        else if(row.end-api.inputAt>=25000)api.stop('25s-after-input');
      }
    }
  };
  loop=wrappedLoop;undo.push(()=>{if(loop===wrappedLoop)loop=originalLoop});
  for(const name of ['keydown','keyup','mousedown','mouseup']){
    const fn=e=>{const at=now();append(events,{kind:name,at,code:e.code||null,button:e.button??null,
      trusted:e.isTrusted,target:e.target?.tagName||null,x:e.clientX??null,y:e.clientY??null});
      if(api.inputAt===null&&e.isTrusted&&G.on&&!G.paused&&((name==='keydown'&&e.code==='KeyW')||(name==='mousedown'&&e.target?.tagName==='CANVAS'))){api.inputAt=at;runningSeen=G.on;api.inputState=state();}
    };
    addEventListener(name,fn,true);undo.push(()=>removeEventListener(name,fn,true));
  }
  for(const name of ['blur','focus','resize','visibilitychange']){
    const target=name==='visibilitychange'?document:window;
    const fn=()=>append(events,{kind:name,at:now(),...state(),viewport:[innerWidth,innerHeight]});
    target.addEventListener(name,fn);undo.push(()=>target.removeEventListener(name,fn));
  }
  function frame(timestamp){if(api.stopped)return;append(frames,{timestamp,at:now()},5000);raf=requestAnimationFrame(frame);}
  raf=requestAnimationFrame(frame);deadline=setTimeout(()=>api.stop('120s-install-deadline'),120000);
  return {installed:true,environment:api.environment,initial:api.initial};
})();
