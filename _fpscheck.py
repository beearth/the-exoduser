from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(6000)
    before=pg.evaluate("({showFps:OPT.showFps, ls:localStorage.getItem('hellcave_settings')})")
    print("BEFORE showFps:", before["showFps"])
    print("localStorage hellcave_settings:", (before["ls"] or "")[:200])
    pg.evaluate("OPT.showFps=true")
    pg.wait_for_timeout(1500)
    after=pg.evaluate("({showFps:OPT.showFps,w:C.width,h:C.height})")
    print("AFTER force:", after)
    pg.screenshot(path="G:/hell/_fpscheck.png", clip={"x":1280-260,"y":720/2-50,"width":260,"height":100})
    print("saved _fpscheck.png (right-center crop where FPS draws)")
    b.close()
