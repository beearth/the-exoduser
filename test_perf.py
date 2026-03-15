from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})

    errors = []
    logs = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(str(err)))

    page.goto("http://localhost:3333/game.html?test=1&slot=12312344", timeout=15000)
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    # Enable debug perf
    try:
        page.evaluate("_DEBUG_PERF=true")
    except:
        print("WARN: could not set _DEBUG_PERF")

    page.screenshot(path="C:/Users/심도진/Pictures/Screenshots/perf_test1.png")

    # Let game run 5 seconds to collect perf data
    page.wait_for_timeout(5000)

    page.screenshot(path="C:/Users/심도진/Pictures/Screenshots/perf_test2.png")

    # Collect perf data
    try:
        perf = page.evaluate("""(() => {
            return {
                prof_u: typeof _prof!=='undefined' ? _prof.u.toFixed(2) : 'N/A',
                prof_d: typeof _prof!=='undefined' ? _prof.d.toFixed(2) : 'N/A',
                projs: typeof projs!=='undefined' ? projs.length : 'N/A',
                ens_total: typeof ens!=='undefined' ? ens.length : 'N/A',
                projFreeLen: typeof _projFree!=='undefined' ? _projFree.length : 'N/A',
                lightCnt: typeof _lightCnt!=='undefined' ? _lightCnt : 'N/A',
                gameOn: typeof G!=='undefined' ? G.on : 'N/A',
                fps: typeof _fpsCur!=='undefined' ? _fpsCur : 'N/A',
                spawnProj: typeof spawnProj!=='undefined' ? 'function' : 'MISSING',
                recycleProj: typeof _recycleProj!=='undefined' ? 'function' : 'MISSING',
                shDirty: typeof _shDirty!=='undefined' ? _shDirty : 'N/A',
                SHASH_CELL: typeof SHASH_CELL!=='undefined' ? SHASH_CELL : 'N/A',
            }
        })()""")
        print("=== PERF DATA ===")
        for k,v in perf.items():
            print(f"  {k}: {v}")
    except Exception as ex:
        print(f"Perf eval failed: {ex}")

    # Errors
    js_errors = [e for e in errors if 'supabase' not in e.lower() and 'net::' not in e.lower()
                 and 'Failed to fetch' not in e and 'favicon' not in e.lower()]
    print(f"\n=== JS ERRORS ({len(js_errors)}) ===")
    for e in js_errors[:10]:
        print(f"  {e[:300]}")

    # Perf logs
    perf_logs = [l for l in logs if "PERF" in l]
    print(f"\n=== PERF LOGS ({len(perf_logs)}) ===")
    for l in perf_logs[-5:]:
        print(f"  {l}")

    # Interesting logs
    other = [l for l in logs if "PERF" not in l and "error" in l.lower()]
    if other:
        print(f"\n=== ERROR-ISH LOGS ===")
        for l in other[-5:]:
            print(f"  {l}")

    browser.close()
    if js_errors:
        print(f"\nFAILED: {len(js_errors)} JS errors")
    else:
        print("\nNO JS ERRORS")
