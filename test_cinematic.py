from playwright.sync_api import sync_playwright

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        # 1. Go to URL, wait 2s, screenshot
        print("[Step 1] Navigating to https://hell-smoky.vercel.app/ ...")
        page.goto("https://hell-smoky.vercel.app/", wait_until="load")
        page.wait_for_timeout(2000)
        page.screenshot(path="/tmp/cin_1.png")
        print("  -> Screenshot saved to /tmp/cin_1.png")

        # 2. Click #skipBtn via JS (in case overlay blocks it)
        print("[Step 2] Clicking #skipBtn via page.evaluate ...")
        page.evaluate("document.querySelector('#skipBtn')?.click()")
        print("  -> Clicked")

        # 3. Wait 1s, screenshot
        print("[Step 3] Waiting 1s then taking screenshot ...")
        page.wait_for_timeout(1000)
        page.screenshot(path="/tmp/cin_2.png")
        print("  -> Screenshot saved to /tmp/cin_2.png")

        # 4. Check if cin-door-scene has class "show" (should NOT)
        door_scene_classes = page.evaluate(
            "document.getElementById('cin-door-scene')?.className || 'ELEMENT NOT FOUND'"
        )
        door_has_show = "show" in door_scene_classes.split()
        print(f"[Step 4] #cin-door-scene classes: '{door_scene_classes}'")
        if door_has_show:
            print("  -> FAIL: cin-door-scene HAS class 'show' (expected it NOT to)")
        else:
            print("  -> PASS: cin-door-scene does NOT have class 'show'")

        # 5. Check if cinUI has class "show" (should have it)
        cinui_classes = page.evaluate(
            "document.getElementById('cinUI')?.className || 'ELEMENT NOT FOUND'"
        )
        cinui_has_show = "show" in cinui_classes.split()
        print(f"[Step 5] #cinUI classes: '{cinui_classes}'")
        if cinui_has_show:
            print("  -> PASS: cinUI HAS class 'show'")
        else:
            print("  -> FAIL: cinUI does NOT have class 'show' (expected it to)")

        # Summary
        print("\n=== SUMMARY ===")
        print(f"  cin-door-scene has 'show': {door_has_show}  (expected: False) -> {'PASS' if not door_has_show else 'FAIL'}")
        print(f"  cinUI has 'show':          {cinui_has_show}  (expected: True)  -> {'PASS' if cinui_has_show else 'FAIL'}")

        browser.close()

if __name__ == "__main__":
    main()
