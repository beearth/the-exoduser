from playwright.sync_api import sync_playwright
import json

# Track D regression + Track A LOCK re-check, live game loop (G.on stays true).
#  §7 normal game regression: real combat frames, real stage transitions, no black map,
#     no frame regression, no GL errors, replay/capture intact.
#  Track A: synthetic context loss+restore via WEBGL_lose_context, verify NO
#     "Insufficient buffer size" (GL 0x502) on restore and no crash loop (1728852c LOCK).

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--js-flags=--expose-gc'])
    page = browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; console=[]
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: console.append(m.text) if m.type in ('error','warning') else None)
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0', wait_until='networkidle', timeout=60000)
    page.wait_for_timeout(3000)  # let combat spin up, map build

    # --- baseline live frame state ---
    base = page.evaluate("""() => ({
      on:G.on, useGL:_useGL, stage:G.stage, mapLiveTex:(typeof _texGCQueue!=='undefined'),
      frameT:+(_prof&&_prof.t||0).toFixed(2), enemies:(typeof E!=='undefined'&&E?E.length:-1),
      streamMap:_streamMap, mapCvs:!!_mapCvs, lost:_useGL?GL.isContextLost():false
    })""")

    # let it run ~1.5s of real frames
    page.wait_for_timeout(1500)

    # --- black-map / render sanity: read back center pixels from the GL canvas ---
    px = page.evaluate("""() => {
      if(!_useGL||!GL) return {ok:'no-gl'};
      const w=C.width,h=C.height; const buf=new Uint8Array(4*9); let nz=0;
      // sample a 3x3 grid
      const pts=[[w*0.25,h*0.5],[w*0.5,h*0.5],[w*0.75,h*0.5],[w*0.5,h*0.25],[w*0.5,h*0.75]];
      let samples=[];
      for(const [x,y] of pts){ const b=new Uint8Array(4); GL.readPixels(x|0,y|0,1,1,GL.RGBA,GL.UNSIGNED_BYTE,b);
        samples.push([b[0],b[1],b[2],b[3]]); if(b[0]+b[1]+b[2]>12) nz++; }
      return {nonBlackSamples:nz, samples, glErr:GL.getError()};
    }""")

    # --- real stage transitions on the LIVE loop ---
    trans_errs=[]
    for si in [1,2,0,3,0]:
        page.evaluate("(si)=>{ G.stage=si; initStage(si); buildMapCache(); }", si)
        page.wait_for_timeout(400)  # let RAF render + drain a few frames
        r = page.evaluate("""() => ({stage:G.stage, glErr:_useGL?GL.getError():0, lost:_useGL?GL.isContextLost():false,
             mapCvs:!!_mapCvs, streamMap:_streamMap, qlen:(typeof _texGCQueue!=='undefined'?_texGCQueue.length:-1)})""")
        trans_errs.append(r)
    after_trans_frameT = page.evaluate("()=>+(_prof&&_prof.t||0).toFixed(2)")

    # --- Track A: synthetic context loss + restore ---
    #   stash the extension object BEFORE loss (game nulls GL in its lost handler)
    lose = page.evaluate("""() => {
      window.__lc=GL.getExtension('WEBGL_lose_context');
      if(!window.__lc) return {ext:false};
      window.__lc.loseContext();
      return {ext:true};
    }""")
    page.wait_for_timeout(800)  # loss handler runs, frames become no-op
    lost_mid = page.evaluate("()=>({useGL:_useGL, glNull:(typeof GL==='undefined'||GL===null)})")
    # trigger restore on the stashed extension
    restored = page.evaluate("""() => {
      if(window.__lc&&window.__lc.restoreContext){ window.__lc.restoreContext(); return {restoreCalled:true}; }
      return {restoreCalled:false};
    }""")
    page.wait_for_timeout(2000)  # restore + pipeline rebuild + several frames

    post_restore = page.evaluate("""() => {
      let glErr=0, lost=true, useGL=_useGL;
      try{ lost = _useGL?GL.isContextLost():true; glErr = _useGL?GL.getError():-1; }catch(e){}
      return {useGL, lost, glErr, stage:G.stage, on:G.on, mapCvs:!!_mapCvs};
    }""")
    # run more frames + a transition after restore to force _flush with real batches (Track A path)
    page.evaluate("()=>{ G.stage=0; initStage(0); buildMapCache(); }")
    page.wait_for_timeout(1200)
    post_restore_trans = page.evaluate("""() => ({glErr:_useGL?GL.getError():-1, lost:_useGL?GL.isContextLost():true, on:G.on})""")

    # collect any 0x502 / insufficient-buffer / crash-loop signals from console
    sig = [c for c in console if ('Insufficient buffer' in c or '0x502' in c or 'INVALID_OPERATION' in c or 'LOOP CRASH' in c or 'bindTexture null' in c)]

    print('==== TRACK D REGRESSION + TRACK A ====')
    print(json.dumps({
      'baseline': base,
      'render_sanity': px,
      'live_transitions': trans_errs,
      'frameT_after_trans': after_trans_frameT,
      'context_loss': {'lose':lose, 'lost_mid':lost_mid, 'restored':restored,
                       'post_restore':post_restore, 'post_restore_transition':post_restore_trans},
      'trackA_signals(0x502/crashloop)': sig,
      'pageerrors': errs,
      'console_err_warn_count': len(console),
    }, indent=2))
    browser.close()
