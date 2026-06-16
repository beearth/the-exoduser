from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1280,"height":720})
    page.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try: page.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    page.wait_for_timeout(5000)
    # force FPS on
    page.evaluate("OPT.showFps=true")
    page.wait_for_timeout(1500)
    info = page.evaluate("({w:C.width,h:C.height,dpr:window.devicePixelRatio,rs:OPT.resScale,show:OPT.showFps})")
    print("canvas", info)
    # full screenshot
    page.screenshot(path="G:/hell/_fps_full.png")
    # crop right-center where FPS lives (right edge, vertical middle)
    cw, ch = page.viewport_size["width"], page.viewport_size["height"]
    page.screenshot(path="G:/hell/_fps_crop.png", clip={"x":cw-220,"y":ch/2-40,"width":220,"height":90})
    browser.close()
    print("saved _fps_full.png + _fps_crop.png")
