from playwright.sync_api import sync_playwright
import json, time

def probe(page, label):
    out = {"label": label}
    try:
        out["devicePixelRatio"] = page.evaluate("window.devicePixelRatio")
        out["innerW"] = page.evaluate("window.innerWidth")
        out["innerH"] = page.evaluate("window.innerHeight")
        # canvas resolution
        out["canvas"] = page.evaluate("""() => {
            const c = (typeof C!=='undefined'&&C) || document.querySelector('canvas');
            return c ? (c.width+'x'+c.height+' css='+c.clientWidth+'x'+c.clientHeight) : 'no-canvas';
        }""")
        out["OPT_resScale"] = page.evaluate("(typeof OPT!=='undefined'&&OPT)?OPT.resScale:'no-OPT'")
        out["OPT_showFps"]  = page.evaluate("(typeof OPT!=='undefined'&&OPT)?OPT.showFps:'no-OPT'")
        out["OPT_quality"]  = page.evaluate("(typeof OPT!=='undefined'&&OPT)?OPT.quality:'no-OPT'")
        out["ls_settings"]  = page.evaluate("localStorage.getItem('hellcave_settings')")
        out["useWebGPU"]    = page.evaluate("(typeof _useWebGPU!=='undefined')?_useWebGPU:'n/a'")
    except Exception as e:
        out["error"] = str(e)
    return out

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width":1280,"height":720})
    logs=[]
    page.on("console", lambda m: logs.append(m.text[:200]))
    page.goto("http://localhost:3333/game.html?test=1&slot=t11", wait_until="domcontentloaded")
    try:
        page.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    page.wait_for_timeout(6000)
    r = probe(page, "localhost:3333")
    print(json.dumps(r, ensure_ascii=False, indent=2))
    page.screenshot(path="G:/hell/_diag_3333.png")
    browser.close()
