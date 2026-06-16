from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    # device_scale_factor simulates monitor at 100% (dpr=1.0)
    pg = b.new_page(viewport={"width":1280,"height":720}, device_scale_factor=1.0)
    pg.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(6000)
    info = pg.evaluate("({realDpr:window.devicePixelRatio,used_dpr:(typeof _dpr!=='undefined'?_dpr:'n/a'),canvas:C.width+'x'+C.height,inner:innerWidth+'x'+innerHeight})")
    print("FORCED-DPR(monitor100%):", info)
    b.close()
