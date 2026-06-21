from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.on("console", lambda m: errs.append(m.text) if m.type=="error" else None)
    pg.on("pageerror", lambda e: errs.append("PAGEERROR: "+str(e)))
    pg.goto("http://localhost:3333/game.html?test=1&slot=t1", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(4000)
    dup=[e for e in errs if "already been declared" in e or "Multiple instances" in e]
    print("=== already-declared / duplicate errors:", len(dup))
    for e in dup[:10]: print("  ", e[:120])
    print("=== total console errors:", len(errs))
    for e in errs[:15]: print("  -", e[:120])
    b.close()
