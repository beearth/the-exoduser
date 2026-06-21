from playwright.sync_api import sync_playwright
errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    pg.on("console", lambda m: errs.append("CONSOLE-ERR:"+m.text[:300]) if m.type=="error" else None)
    pg.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout=getattr(pg,"wait_for_timeout"); pg.wait_for_timeout(5000)
    info=pg.evaluate("({dpr:(typeof _dpr!=='undefined'?_dpr:'n/a'),useGPU:(typeof _useGPU!=='undefined'?_useGPU:'n/a'),canvas:(typeof C!=='undefined'?C.width+'x'+C.height:'no-C'),lastTex:(typeof _lastGpuTex!=='undefined'?'declared':'MISSING')})")
    print("LOAD-OK:",info)
    print("ERRORS:",[e for e in errs if 'favicon' not in e.lower()][:10])
    b.close()
