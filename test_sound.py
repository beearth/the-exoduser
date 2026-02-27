import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    failed = []
    page.on("requestfailed", lambda req: failed.append(f"FAILED: {req.url}"))

    page.goto("http://localhost:3333/index.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)

    # Just move mouse (no click needed)
    page.mouse.move(400, 300)
    page.wait_for_timeout(1500)

    bgm = page.evaluate("""() => ({
        started: bgmStarted,
        paused: lobbyBGM.paused,
        time: lobbyBGM.currentTime,
        ready: lobbyBGM.readyState
    })""")
    print("=== After mouse move only ===")
    print(f"  started: {bgm['started']}")
    print(f"  paused: {bgm['paused']}")
    print(f"  currentTime: {bgm['time']:.2f}s")
    print(f"  readyState: {bgm['ready']}")

    if bgm['paused']:
        print("\nStill paused - trying scroll...")
        page.mouse.wheel(0, 100)
        page.wait_for_timeout(1000)
        bgm2 = page.evaluate("() => ({started:bgmStarted,paused:lobbyBGM.paused,time:lobbyBGM.currentTime})")
        print(f"  After scroll: started={bgm2['started']}, paused={bgm2['paused']}, time={bgm2['time']:.2f}")

    print(f"\n=== Failed: {len(failed)} ===")
    for f in failed:
        print(f"  {f}")

    browser.close()
    print("\nDONE")
