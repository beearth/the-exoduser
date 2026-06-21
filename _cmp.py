from playwright.sync_api import sync_playwright

def probe(pg):
    return pg.evaluate("""()=>({
      dpr: window.devicePixelRatio,
      _dpr:(typeof _dpr!=='undefined')?_dpr:'n/a',
      showFps:(typeof OPT!=='undefined')?OPT.showFps:'no-OPT',
      resScale:(typeof OPT!=='undefined')?OPT.resScale:'n/a',
      canvas:(typeof C!=='undefined'&&C)?(C.width+'x'+C.height):'no-C',
      cssCanvas:(typeof C!=='undefined'&&C)?(C.style.width+' x '+C.style.height):'n/a',
      inner: innerWidth+'x'+innerHeight,
      stage:(typeof G!=='undefined')?G.stage:'n/a',
      gon:(typeof G!=='undefined')?G.on:'n/a',
      lv:(typeof P!=='undefined'&&P)?P.lv:'no-P',
      camZoom:(typeof G!=='undefined'&&G)?(G._camZoom):'n/a',
      useGPU:(typeof _useGPU!=='undefined')?_useGPU:'n/a'
    })""")

with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    VP={"width":1280,"height":720}

    # LOCAL
    pg=b.new_context(viewport=VP).new_page()
    pg.goto("http://localhost:3333/game.html?slot=411", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(8000)
    print("=== LOCAL (slot=411) ===")
    for k,v in probe(pg).items(): print(f"  {k}: {v}")
    pg.screenshot(path="G:/hell/_cmp_local.png")

    # WEB
    pg2=b.new_context(viewport=VP).new_page()
    pg2.goto("https://the-exoduser.vercel.app/game.html?char=e63386c3-3cd4-40b3-bf8c-5444d2a109ea&slot=11000", wait_until="domcontentloaded")
    pg2.wait_for_timeout(1500)
    if pg2.locator("input[type=password]").count()>0:
        pg2.fill("input[type=password]","fdg2026!"); pg2.keyboard.press("Enter"); pg2.wait_for_timeout(3500)
    try: pg2.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg2.wait_for_timeout(8000)
    print("=== WEB (char=e63386) ===")
    for k,v in probe(pg2).items(): print(f"  {k}: {v}")
    pg2.screenshot(path="G:/hell/_cmp_web.png")
    b.close()
print("saved _cmp_local.png / _cmp_web.png")
