from playwright.sync_api import sync_playwright

# Decisive class-A(leak) vs class-B(GC-deferred transient) test on an orphaned map texture.
# Game loop frozen (G.on=false) to prevent auto-navigation. WeakRef stashed on window.

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--js-flags=--expose-gc'])
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror',lambda e: errs.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    page.wait_for_timeout(2500)

    page.evaluate("() => { G.on=false; }")  # freeze gameplay/navigation

    setup=page.evaluate("""() => {
      const buildStage=(si)=>{ G.stage=si; initStage(si); buildMapCache();
        let g=0; while(!_bmcDone && g++<200000){_tickBuildMapCache()}
        while(_streamMap && _streamBuildQCount>0 && g++<200000){_tickStreamChunkBuild(64,64)} };
      buildStage(0);
      const cvs0=_mapCvs;
      _getTex(cvs0);
      let tex0=_getTex(cvs0);
      const isTexObj=(tex0 && typeof tex0==='object');
      window.__wr=new WeakRef(tex0);
      window.__same=[];
      tex0=null;
      // orphan tex0: transition on the reused singleton canvas (glVer bump -> new tex overwrites cache)
      buildStage(1); window.__same.push(_mapCvs===cvs0); if(!_streamMap&&_mapCvs)_getTex(_mapCvs);
      for(let k=0;k<3;k++){ buildStage(k%2); window.__same.push(_mapCvs===cvs0); if(!_streamMap&&_mapCvs)_getTex(_mapCvs); }
      return {isTexObj, same:window.__same, aliveBeforeGC: (window.__wr.deref()!==undefined),
              created:window.__tl?window.__tl.created:'n/a'};
    }""")

    # aggressive GC across separate calls (no long in-page async)
    for _ in range(6):
        page.evaluate("() => { for(let i=0;i<3;i++) if(window.gc) window.gc(); }")
        page.wait_for_timeout(150)
    final=page.evaluate("""() => {
      if(window.gc){for(let i=0;i<3;i++)window.gc();}
      const alive=(window.__wr.deref()!==undefined);
      return {orphanTexAliveAfterGC:alive, verdict: alive?'CLASS_A_STRONG_REF_LEAK':'CLASS_B_GC_DEFERRED_TRANSIENT'};
    }""")
    print({'setup':setup,'final':final,'pageerrors':errs})
    browser.close()
