"""Test game loads without JS errors after performance optimization changes."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    errors = []
    console_msgs = []
    page.on('console', lambda msg: (errors.append(msg.text) if msg.type == 'error' else console_msgs.append(f"[{msg.type}] {msg.text[:200]}")))
    page.on('pageerror', lambda err: errors.append(f"PAGE_ERROR: {str(err)[:500]}"))

    # Go directly to game.html
    page.goto('http://localhost:3333/game.html', wait_until='load', timeout=15000)
    page.wait_for_timeout(3000)

    print("=== ALL ERRORS ===")
    for e in errors:
        print(f"  {e[:500]}")

    print(f"\n=== CONSOLE ({len(console_msgs)} messages) ===")
    for m in console_msgs[:5]:
        print(f"  {m}")

    # Try to evaluate basic canvas check
    try:
        has_canvas = page.evaluate('!!document.getElementById("c")')
        print(f"\nCanvas exists: {has_canvas}")
    except Exception as ex:
        print(f"\nEval failed: {ex}")

    # Try to check for WebGL
    try:
        result = page.evaluate('typeof GL')
        print(f"GL type: {result}")
    except Exception as ex:
        print(f"GL check failed: {ex}")

    # Try to check _maxEns
    try:
        result = page.evaluate('typeof _maxEns')
        print(f"_maxEns type: {result}")
    except Exception as ex:
        print(f"_maxEns check failed: {ex}")

    # Take screenshot
    page.screenshot(path='test_perf_screenshot.png', full_page=False)
    print("\nScreenshot saved")

    browser.close()

    js_errors = [e for e in errors if 'supabase' not in e.lower() and 'net::' not in e.lower()
                 and 'Failed to fetch' not in e and 'favicon' not in e.lower() and '404' not in e]
    if js_errors:
        print(f"\nFAILED: {len(js_errors)} relevant JS errors")
        exit(1)
    print("\nPASSED")
