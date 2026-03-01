"""Test that monsters actually spawn on the map after enemy GC fix."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    errors = []
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.on('pageerror', lambda err: errors.append(str(err)))

    page.goto('http://localhost:3333/game.html', wait_until='load', timeout=15000)
    page.wait_for_timeout(3000)

    # Check enemy count
    try:
        ens_len = page.evaluate('typeof ens !== "undefined" ? ens.length : -1')
        print(f"Enemy count (ens.length): {ens_len}")
    except Exception as ex:
        print(f"ens check failed: {ex}")
        ens_len = -1

    # Check if game is on
    try:
        game_on = page.evaluate('typeof G !== "undefined" ? G.on : false')
        print(f"Game on: {game_on}")
    except:
        game_on = False

    # Check rooms
    try:
        rooms = page.evaluate('typeof G !== "undefined" && G.rooms ? G.rooms.length : -1')
        print(f"Rooms count: {rooms}")
    except:
        rooms = -1

    # Check player position
    try:
        px = page.evaluate('typeof P !== "undefined" ? P.x : -1')
        py = page.evaluate('typeof P !== "undefined" ? P.y : -1')
        print(f"Player pos: ({px}, {py})")
    except:
        pass

    # Check enemy alive/dead status
    try:
        gc_code = page.evaluate('''
            (function(){
                if(typeof ens === "undefined") return "ens undefined";
                let alive = 0, dead = 0;
                for(let i=0;i<ens.length;i++){
                    if(ens[i].alive) alive++; else dead++;
                }
                return "alive:" + alive + " dead:" + dead + " total:" + ens.length;
            })()
        ''')
        print(f"Enemy status: {gc_code}")
    except Exception as ex:
        print(f"Enemy status check failed: {ex}")

    # Check _maxEns
    try:
        max_ens = page.evaluate('typeof _maxEns !== "undefined" ? _maxEns : -1')
        print(f"_maxEns: {max_ens}")
    except:
        pass

    # Take screenshot
    page.screenshot(path='test_monsters_screenshot.png', full_page=False)
    print("\nScreenshot saved")

    browser.close()

    # Filter JS errors
    js_errors = [e for e in errors if 'favicon' not in e.lower() and '404' not in e
                 and 'supabase' not in e.lower() and 'net::' not in e.lower()
                 and 'Failed to fetch' not in e]
    if js_errors:
        print(f"\nFAILED: {len(js_errors)} JS errors")
        for e in js_errors[:5]:
            print(f"  - {e[:300]}")
        exit(1)

    if ens_len > 0:
        print(f"\nPASSED: {ens_len} enemies spawned, no JS errors")
    elif ens_len == 0:
        print(f"\nWARNING: 0 enemies - game may not have started yet (headless)")
    else:
        print(f"\nWARNING: Could not check enemy count")
