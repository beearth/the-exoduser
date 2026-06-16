from playwright.sync_api import sync_playwright

URL = "https://the-exoduser.vercel.app/game.html?test=1&slot=t11"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1280,"height":720})
    page.goto(URL, wait_until="domcontentloaded")
    # site password gate
    page.wait_for_timeout(2000)
    try:
        # Vercel password protection form
        if page.locator("input[type=password]").count() > 0:
            page.fill("input[type=password]", "fdg2026!")
            page.keyboard.press("Enter")
            page.wait_for_timeout(3000)
            page.goto(URL, wait_until="domcontentloaded")
    except Exception as e:
        print("pw step:", e)
    try: page.wait_for_load_state("networkidle", timeout=25000)
    except: pass
    page.wait_for_timeout(6000)
    try:
        info = page.evaluate("({dpr:devicePixelRatio,win:innerWidth+'x'+innerHeight,canvas:(typeof C!=='undefined'?C.width+'x'+C.height:'no-C'),resScale:(typeof OPT!=='undefined'?OPT.resScale:'no-OPT'),renderRes:(typeof _renderRes!=='undefined'?JSON.stringify(_renderRes):'n/a'),title:document.title})")
        print("DEPLOYED:", info)
    except Exception as e:
        print("eval err:", e, "| title=", page.title())
    browser.close()
