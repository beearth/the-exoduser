from playwright.sync_api import sync_playwright

# Track D: map-transition GPU texture lifecycle — measure create/overlap + GC-eligibility.
# Windows/AMD cannot repro Mac context-loss, but the JS-side lifecycle (create count,
# transient overlap, GC finalization) is platform-independent and IS what governs the
# Mac transient VRAM peak. Uses --expose-gc + FinalizationRegistry.

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--js-flags=--expose-gc'])
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror',lambda e: errs.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    page.wait_for_timeout(2500)

    # 1. context attributes + limits
    ctx=page.evaluate("""() => {
      const a=GL.getContextAttributes?GL.getContextAttributes():{};
      return {preserveDrawingBuffer:a.preserveDrawingBuffer, alpha:a.alpha, powerPreference:a.powerPreference,
              antialias:a.antialias, depth:a.depth, stencil:a.stencil,
              MAX_TEXTURE_SIZE:GL.getParameter(GL.MAX_TEXTURE_SIZE), useGL:_useGL, useGPU:_useGPU,
              DPR:window.devicePixelRatio, C_w:C.width, C_h:C.height};
    }""")

    # 2. install texture-lifecycle instrumentation (wrap createTexture; FinalizationRegistry)
    page.evaluate("""() => {
      window.__tl={created:0, finalized:0, deleted:0, _reg:new FinalizationRegistry(()=>{window.__tl.finalized++})};
      const oCreate=GL.createTexture.bind(GL);
      GL.createTexture=function(){const t=oCreate(); if(t){window.__tl.created++; try{window.__tl._reg.register(t,1)}catch(e){}} return t;};
      const oDelete=GL.deleteTexture?GL.deleteTexture.bind(GL):null;
      if(oDelete){GL.deleteTexture=function(){window.__tl.deleted++;return oDelete.apply(GL,arguments);};}
    }""")

    # 3. per-stage map texture size + stream mode (drive real buildMapCache)
    def build_stage(si):
        return page.evaluate("""(si) => {
          G.stage=si; initStage(si); buildMapCache();
          let guard=0; while(!_bmcDone && guard++<200000){_tickBuildMapCache()}
          while(_streamMap && _streamBuildQCount>0 && guard++<200000){_tickStreamChunkBuild(64,64)}
          // force upload of the single-map canvas (non-stream) to trigger createTexture
          let uploaded=false;
          if(!_streamMap && _mapCvs && _useGL){ try{_uploadCanvasTex(_mapCvs); uploaded=true;}catch(e){} }
          const mw=G.mw,mh=G.mh, pxW=(_mapCvs?_mapCvs.width:0), pxH=(_mapCvs?_mapCvs.height:0);
          const bytes=_streamMap?0:(pxW*pxH*4);
          let chunkCnt=_mapChunks?_mapChunks.length:0;
          return {stage:si, mw, mh, streamMap:_streamMap, pxW, pxH, texMB:+(bytes/1048576).toFixed(1),
                  chunkCnt, streamChunkCnt:_streamChunkCnt, created:window.__tl.created, uploaded};
        }""", si)

    per_stage=[build_stage(si) for si in [0,1,2,3,4,5,10,20,33]]

    # 4. overlap + GC test: transition between two 8000x8000 single-texture stages repeatedly
    #    without gc, then force gc and see finalization.
    def snap():
        return page.evaluate("() => ({created:window.__tl.created, finalized:window.__tl.finalized, deleted:window.__tl.deleted, live:window.__tl.created-window.__tl.finalized})")
    def gc_cycle():
        return page.evaluate("""() => new Promise(res=>{
          for(let i=0;i<3;i++){ if(window.gc) window.gc(); }
          setTimeout(()=>{ if(window.gc) window.gc(); setTimeout(()=>res({created:window.__tl.created,finalized:window.__tl.finalized,deleted:window.__tl.deleted,live:window.__tl.created-window.__tl.finalized}),300); },300);
        })""")

    before_overlap=snap()
    # 6 rapid transitions between stage 0 and 1 (both 8000x8000 non-stream), NO gc between
    for k in range(6):
        build_stage(0 if k%2==0 else 1)
    after_transitions=snap()
    after_gc=gc_cycle()

    print({'ctx':ctx,'per_stage':per_stage,
           'overlap':{'before':before_overlap,'after_6_transitions_no_gc':after_transitions,'after_forced_gc':after_gc},
           'pageerrors':errs})
    browser.close()
