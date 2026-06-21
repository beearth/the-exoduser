from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(6000)
    info=pg.evaluate("({dpr:(typeof _dpr!=='undefined'?_dpr:'n/a'),rs:(typeof OPT!=='undefined'?OPT.resScale:'n/a'),canvas:(typeof C!=='undefined'?C.width+'x'+C.height:'no-C'),inner:innerWidth+'x'+innerHeight,useGPU:(typeof _useGPU!=='undefined'?_useGPU:'n/a')})")
    print("3333:",info)
    pg.screenshot(path="G:/hell/_shot3333.png")
    print("saved _shot3333.png")
    b.close()
