from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Capture console logs
    logs = []
    page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))

    # Capture failed requests
    failed = []
    page.on("requestfailed", lambda req: failed.append(f"FAILED: {req.url} - {req.failure}"))

    # Capture successful audio requests
    audio_reqs = []
    page.on("response", lambda res: audio_reqs.append(f"{res.status} {res.url}") if '.mp3' in res.url else None)

    page.goto("http://localhost:3333/game.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(2000)

    # Check if BGM object exists
    bgm_check = page.evaluate("""() => {
        return {
            bgmExists: typeof BGM !== 'undefined',
            curKey: BGM ? BGM._curKey : null,
            vol: BGM ? BGM._vol : null,
            tracksCount: BGM ? Object.keys(BGM.tracks).length : 0,
            tracks: BGM ? Object.keys(BGM.tracks) : []
        }
    }""")

    print("=== BGM Status ===")
    print(json.dumps(bgm_check, indent=2, ensure_ascii=False))

    print("\n=== Audio Requests ===")
    for r in audio_reqs:
        print(r)

    print("\n=== Failed Requests ===")
    for f in failed:
        print(f)

    print("\n=== Console Logs (errors only) ===")
    for l in logs:
        if 'error' in l.lower() or 'fail' in l.lower():
            print(l)

    # Try to play BGM manually and check
    play_result = page.evaluate("""() => {
        try {
            BGM.play('lobby');
            return { success: true, curKey: BGM._curKey, cur: !!BGM._cur };
        } catch(e) {
            return { success: false, error: e.message };
        }
    }""")

    print("\n=== Manual BGM.play('lobby') ===")
    print(json.dumps(play_result, indent=2, ensure_ascii=False))

    page.wait_for_timeout(1000)

    # Check audio requests after play
    print("\n=== Audio Requests After Play ===")
    for r in audio_reqs:
        print(r)

    # Screenshot
    page.screenshot(path="/tmp/bgm_test.png", full_page=False)
    print("\nScreenshot saved to /tmp/bgm_test.png")

    browser.close()
