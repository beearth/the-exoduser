// QA-only observation. Install before normal combat; never invokes death functions.
(() => {
  window.__corpseCaptureQA?.stop('reinstall');
  const records = [], frames = [], inputs = [], transitions = [], undo = [];
  const ids = new WeakMap(), contexts = new WeakMap(), uses = new WeakMap();
  const stack = []; let nextId = 0, callId = 0, raf = 0, deadline = 0, lastFrame = null;
  let firstKillAt = null, lastKills = G.kills, lastAtmos = OPT.atmos;
  const identity = object => {
    if (!object || typeof object !== 'object') return null;
    if (!ids.has(object)) ids.set(object, ++nextId);
    return ids.get(object);
  };
  function describe(object) {
    if (!object) return null;
    let name = object === _gibC ? '_gibC' : object === _atlasE ? '_atlasE' : null;
    if (!name) {
      const split = _splits.findIndex(s => s.c === object), corpse = _corpses.findIndex(s => s.c === object);
      if (split >= 0) name = '_splits[' + split + '].c';
      else if (corpse >= 0) name = '_corpses[' + corpse + '].c';
    }
    return { id: identity(object), name, kind: object.constructor?.name || null,
      width: object.width, height: object.height, url: object.currentSrc || object.src || null,
      complete: object.complete ?? null, naturalWidth: object.naturalWidth ?? null,
      gpuWarmSet: _wqGpuImages.has(object) };
  }
  function contextInfo(ctx) {
    if (!contexts.has(ctx)) contexts.set(ctx, {
      canvas: describe(ctx.canvas), attributes: ctx.getContextAttributes?.() || null,
      smoothing: ctx.imageSmoothingEnabled, smoothingQuality: ctx.imageSmoothingQuality
    });
    return contexts.get(ctx);
  }
  const state = () => ({ at: performance.now(), kills: G.kills, on: G.on, paused: G.paused,
    hp: P.hp, x: P.x, y: P.y, lv: P.lv, atmos: OPT.atmos, fpsCap: OPT.fpsCap,
    hidden: document.hidden, focus: document.hasFocus(), useGL: _useGL, useGPU: _useGPU,
    boot: _bootLoadActive, warm: _ensWarmDone });
  const api = window.__corpseCaptureQA = {
    startedAt: performance.now(), inputAt: null, stopped: false, reason: null, dropped: 0,
    records, frames, inputs, transitions, initial: state(), end: null,
    initialOptions: JSON.parse(JSON.stringify(OPT)), finalOptions: null,
    environment: { url: location.href, viewport: [innerWidth,innerHeight], dpr:devicePixelRatio,
      canvas:[C.width,C.height], ua:navigator.userAgent,
      activeHeadUsesSplits: Function.prototype.toString.call(_addHeadGib).includes('_splits'),
      activeHeadUses48x14: Function.prototype.toString.call(_addHeadGib).includes('_gibC,0,0,48,14'),
      scratch: contextInfo(_gibX), splitContexts:_splits.map(s=>contextInfo(s.ctx)) },
    stop(reason='manual') {
      if (api.stopped) return api;
      api.stopped=true; api.reason=reason; api.end=state(); api.finalOptions=JSON.parse(JSON.stringify(OPT));
      cancelAnimationFrame(raf); clearTimeout(deadline);
      for (const restore of undo.splice(0).reverse()) restore();
      return api;
    }
  };
  function push(row) { if(records.length<8000)records.push(row); else api.dropped++; }
  function wrapFunction(name,read,write) {
    const original=read();
    const wrapped=function(...args) {
      const e=args[0], parent=stack.at(-1);
      const row={id:++callId,kind:name,parentId:parent?.id||null,
        enemy:e?{id:identity(e),etype:e.etype,mobCh:e._mobCh,col:e._mob8Col,row:e._mob8Row,
          fm:e._fmKind||null,boss:!!e.ib,hp:e.hp,alive:e.alive}:null,childMs:0};
      stack.push(row);row.at=performance.now();
      try { return original.apply(this,args); }
      finally { row.ms=performance.now()-row.at;stack.pop();
        row.selfMs=Math.max(0,row.ms-row.childMs);row.kills=G.kills;row.atmos=OPT.atmos;
        if(parent)parent.childMs+=row.ms;push(row); }
    };
    write(wrapped);undo.push(()=>{if(read()===wrapped)write(original)});
  }
  wrapFunction('_addCorpse',()=>_addCorpse,v=>{_addCorpse=v});
  wrapFunction('_addHeadGib',()=>_addHeadGib,v=>{_addHeadGib=v});
  for(const name of ['drawImage','clearRect','getImageData','putImageData']) {
    const proto=CanvasRenderingContext2D.prototype, original=proto[name];
    const wrapped=function(...args) {
      const parent=stack.at(-1);
      if(!parent && this!==_gibX)return original.apply(this,args);
      const source=name==='drawImage'?args[0]:null;
      let sourceUse=null;
      if(source && typeof source==='object') {sourceUse=(uses.get(source)||0)+1;uses.set(source,sourceUse);}
      const row={id:++callId,kind:'2d.'+name,parentId:parent?.id||null,parent:parent?.kind||null,
        source:describe(source),target:contextInfo(this),sourceObservedDraw:sourceUse,
        args:args.slice(name==='drawImage'?1:0).filter(v=>typeof v==='number')};
      row.at=performance.now();
      try { return original.apply(this,args); }
      finally { row.ms=performance.now()-row.at;if(parent)parent.childMs+=row.ms;push(row); }
    };
    proto[name]=wrapped;undo.push(()=>{if(proto[name]===wrapped)proto[name]=original});
  }
  for(const name of ['keydown','keyup','mousedown','mouseup']) {
    const listener=e=>{
      const at=performance.now();
      inputs.push({at,kind:name,code:e.code||null,button:e.button??null,x:e.clientX??null,y:e.clientY??null,
        trusted:e.isTrusted,target:e.target?.tagName||null});
      if(api.inputAt===null&&((name==='keydown'&&e.code==='KeyW')||(name==='mousedown'&&e.target?.tagName==='CANVAS')))api.inputAt=at;
    };
    addEventListener(name,listener,true);undo.push(()=>removeEventListener(name,listener,true));
  }
  for(const name of ['blur','focus','resize','visibilitychange']) {
    const target=name==='visibilitychange'?document:window;
    const listener=()=>transitions.push({kind:name,...state()});
    target.addEventListener(name,listener);undo.push(()=>target.removeEventListener(name,listener));
  }
  function frame(at) {
    if(api.stopped)return;
    if(api.inputAt!==null)frames.push({at,dt:lastFrame===null?null:at-lastFrame,kills:G.kills,atmos:OPT.atmos});
    lastFrame=at;
    if(G.kills!==lastKills){transitions.push({kind:'kills',...state()});if(firstKillAt===null)firstKillAt=performance.now();lastKills=G.kills;}
    if(OPT.atmos!==lastAtmos){transitions.push({kind:'atmos',...state()});lastAtmos=OPT.atmos;}
    if(firstKillAt!==null && (G.kills>=8 || performance.now()-firstKillAt>=10000)){api.stop('8-kills-or-10s-after-first');return;}
    if(api.inputAt!==null&&performance.now()-api.inputAt>=25000){api.stop('25s-after-input');return;}
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);deadline=setTimeout(()=>api.stop('120s-install-deadline'),120000);
  return {installed:true,environment:api.environment,initial:api.initial};
})();
