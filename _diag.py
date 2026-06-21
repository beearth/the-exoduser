from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    errs=[]
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.goto("http://localhost:3333/game.html?slot=411", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout=getattr(pg,'wait_for_timeout')
    pg.wait_for_timeout(6000)
    info=pg.evaluate("""()=>({
      showFps: (typeof OPT!=='undefined')?OPT.showFps:'no-OPT',
      resScale:(typeof OPT!=='undefined')?OPT.resScale:'n/a',
      lv: (typeof P!=='undefined'&&P)?P.lv:'no-P',
      stage:(typeof G!=='undefined')?G.stage:'n/a',
      gon:(typeof G!=='undefined')?G.on:'n/a',
      dpr: window.devicePixelRatio,
      _dpr:(typeof _dpr!=='undefined')?_dpr:'n/a',
      canvas:(typeof C!=='undefined')?(C.width+'x'+C.height):'no-C',
      inner: innerWidth+'x'+innerHeight,
      ls:(localStorage.getItem('hellcave_settings')||'EMPTY').slice(0,300)
    })""")
    print("=== LOCAL slot=411 ===")
    for k,v in info.items(): print(f"  {k}: {v}")
    print("=== errors:", [e[:80] for e in errs])
    pg.screenshot(path="G:/hell/_diag411.png")
    print("saved _diag411.png")
    b.close()
