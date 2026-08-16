from playwright.sync_api import sync_playwright
import json, sys

# Track D fix verification: deterministic map-texture lifetime.
# Drives real buildMapCache transitions, simulating the render frame boundary
# (_glFlush -> _drainTexGCQueue) after each. Measures createTexture/deleteTexture
# balance, peak concurrently-live textures, GL errors, context loss, use-after-delete.
# Works with OR without the fix (detects typeof _drainTexGCQueue) so BEFORE/AFTER
# run under identical harness. --js-flags=--expose-gc for parity with prior probes.

N_NORMAL = 20   # normal transitions (drain each "frame")
N_FAST   = 50   # fast burst transitions

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--js-flags=--expose-gc'])
    page = browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror', lambda e: errs.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0', wait_until='networkidle', timeout=60000)
    page.wait_for_timeout(2500)

    # freeze the RAF loop so ONLY our explicit frame-boundary drives create/drain (deterministic)
    page.evaluate("() => { G.on=false; }")

    fix_present = page.evaluate("() => (typeof _drainTexGCQueue==='function')")

    # install create/delete counters + MAP-texture isolation via _getTex tagging.
    #   __mapLive = Set of currently-live MAP WebGLTextures (added on map-create, removed on delete).
    page.evaluate("""() => {
      window.__tl={created:0, deleted:0, mapCreated:0, mapDeleted:0, mapPeak:0};
      window.__mapLive=new Set();
      const oC=GL.createTexture.bind(GL); GL.createTexture=function(){window.__tl.created++;return oC();};
      const oD=GL.deleteTexture?GL.deleteTexture.bind(GL):null;
      if(oD){GL.deleteTexture=function(tex){window.__tl.deleted++;
        if(window.__mapLive.has(tex)){window.__mapLive.delete(tex);window.__tl.mapDeleted++;}
        return oD(tex);};}
      const oG=_getTex;
      _getTex=function(src,hint){const b=window.__tl.created;const t=oG(src,hint);
        if(src&&src._mapTex&&window.__tl.created>b&&t){window.__tl.mapCreated++;window.__mapLive.add(t);
          if(window.__mapLive.size>window.__tl.mapPeak)window.__tl.mapPeak=window.__mapLive.size;}
        return t;};
      window.__ctx={
        MAX_TEXTURE_SIZE:GL.getParameter(GL.MAX_TEXTURE_SIZE),
        preserveDrawingBuffer:GL.getContextAttributes().preserveDrawingBuffer,
        depth:GL.getContextAttributes().depth
      };
    }""")

    # one transition + simulated frame boundary; returns snapshot
    def transition(si, drain=True):
        return page.evaluate("""([si,drain]) => {
          G.stage=si; initStage(si); buildMapCache();
          let g=0; while(!_bmcDone && g++<200000){_tickBuildMapCache()}
          while(_streamMap && _streamBuildQCount>0 && g++<200000){_tickStreamChunkBuild(64,64)}
          // create the new map texture (mirrors render's _getTex(_mapCvs))
          if(!_streamMap && _mapCvs && _useGL){ try{_uploadCanvasTex(_mapCvs);}catch(e){} }
          // --- simulate frame boundary: final flush then deterministic delete ---
          if(_useGL){ try{_glFlush();}catch(e){} }
          if(drain && typeof _drainTexGCQueue==='function'){ _drainTexGCQueue(); }
          const live=window.__tl.created-window.__tl.deleted;
          const pxW=(_mapCvs?_mapCvs.width:0), pxH=(_mapCvs?_mapCvs.height:0);
          const mb=_streamMap?0:+((pxW*pxH*4)/1048576).toFixed(1);
          const glErr=_useGL?GL.getError():0;
          const lost=_useGL?GL.isContextLost():false;
          return {stage:si, created:window.__tl.created, deleted:window.__tl.deleted, live,
                  mapCreated:window.__tl.mapCreated, mapDeleted:window.__tl.mapDeleted,
                  mapLive:window.__mapLive.size, mapPeak:window.__tl.mapPeak, mapMB:+(window.__mapLive.size*mb).toFixed(1),
                  stream:_streamMap, texMB:mb, pxW, pxH, glErr, lost,
                  qlen:(typeof _texGCQueue!=='undefined'?_texGCQueue.length:-1)};
        }""", [si, drain])

    base = page.evaluate("() => ({created:window.__tl.created, deleted:window.__tl.deleted, mapCreated:window.__tl.mapCreated, mapDeleted:window.__tl.mapDeleted})")

    # ---- Phase 1: 20 normal transitions between two 8000x8000 single-tex stages, drain each ----
    normal=[]; peak_live=0; map_peak=0
    for k in range(N_NORMAL):
        snap = transition(0 if k%2==0 else 1, drain=True)
        normal.append(snap); peak_live=max(peak_live, snap['live']); map_peak=max(map_peak, snap['mapLive'])
    after_normal = page.evaluate("() => ({created:window.__tl.created, deleted:window.__tl.deleted, mapCreated:window.__tl.mapCreated, mapDeleted:window.__tl.mapDeleted})")

    # ---- Phase 2: 50 FAST transitions (still draining each 'frame' boundary) ----
    fast_peak_live=0; fast_map_peak=0; fast_glErr=0; fast_lost=False
    for k in range(N_FAST):
        snap = transition(0 if k%2==0 else 1, drain=True)
        fast_peak_live=max(fast_peak_live, snap['live']); fast_map_peak=max(fast_map_peak, snap['mapLive'])
        if snap['glErr']: fast_glErr=snap['glErr']
        if snap['lost']: fast_lost=True
    after_fast = page.evaluate("() => ({created:window.__tl.created, deleted:window.__tl.deleted, mapCreated:window.__tl.mapCreated, mapDeleted:window.__tl.mapDeleted})")

    # ---- Phase 3: use-after-delete check — draw the map again, expect no GL error / no loss ----
    uad = page.evaluate("""() => {
      let err=0, lost=false;
      if(_useGL && !_streamMap && _mapCvs){
        try{ _uploadCanvasTex(_mapCvs); _glFlush(); }catch(e){}
        err=GL.getError(); lost=GL.isContextLost();
      }
      return {glErrAfterRedraw:err, contextLost:lost};
    }""")

    # ---- Phase 4: forced GC (does anything remain that GC would need to collect?) ----
    gc_snap = page.evaluate("""() => new Promise(res=>{
      for(let i=0;i<3;i++) if(window.gc) window.gc();
      setTimeout(()=>res({created:window.__tl.created, deleted:window.__tl.deleted, live:window.__tl.created-window.__tl.deleted}),300);
    })""")

    result = {
      'fix_present': fix_present,
      'ctx': page.evaluate("() => window.__ctx"),
      'base': base,
      'normal_20': {
        'created_delta': after_normal['created']-base['created'],
        'deleted_delta': after_normal['deleted']-base['deleted'],
        'map_created_delta': after_normal['mapCreated']-base['mapCreated'],
        'map_deleted_delta': after_normal['mapDeleted']-base['mapDeleted'],
        'map_live_final': normal[-1]['mapLive'],
        'map_peak_concurrent': map_peak,
        'map_peak_MB': round(map_peak*244.1,1),
        'peak_live_all': peak_live,
        'sample_first': normal[0], 'sample_last': normal[-1],
      },
      'fast_50': {
        'created_delta': after_fast['created']-after_normal['created'],
        'deleted_delta': after_fast['deleted']-after_normal['deleted'],
        'map_created_delta': after_fast['mapCreated']-after_normal['mapCreated'],
        'map_deleted_delta': after_fast['mapDeleted']-after_normal['mapDeleted'],
        'map_peak_concurrent': fast_map_peak,
        'map_peak_MB': round(fast_map_peak*244.1,1),
        'peak_live_all': fast_peak_live,
        'glErr': fast_glErr, 'lost': fast_lost,
      },
      'use_after_delete': uad,
      'after_forced_gc': gc_snap,
      'pageerrors': errs,
    }
    tag = 'AFTER_FIX' if fix_present else 'BEFORE_FIX'
    print('==== TRACK D '+tag+' ====')
    print(json.dumps(result, indent=2))
    browser.close()
