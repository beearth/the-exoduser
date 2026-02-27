"""
Playwright test: Cinematic intro on https://hell-smoky.vercel.app/
Captures screenshots at 3 key moments and checks for skip button.
"""

from playwright.sync_api import sync_playwright
import time

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})

        print("[1] Navigating to https://hell-smoky.vercel.app/ ...")
        page.goto("https://hell-smoky.vercel.app/", wait_until="load", timeout=30000)

        # Small delay to let canvas initialize
        time.sleep(1)

        # Screenshot 1: Right after page load (should show gate close-up zoom)
        page.screenshot(path="/tmp/intro_1.png")
        print("[1] Screenshot saved -> /tmp/intro_1.png  (gate close-up expected)")

        # Wait 3 seconds
        print("[2] Waiting 3 seconds...")
        time.sleep(3)

        # Screenshot 2: Should be zooming out
        page.screenshot(path="/tmp/intro_2.png")
        print("[2] Screenshot saved -> /tmp/intro_2.png  (zoom-out expected)")

        # Wait 5 more seconds
        print("[3] Waiting 5 more seconds...")
        time.sleep(5)

        # Screenshot 3: Should show prologue text
        page.screenshot(path="/tmp/intro_3.png")
        print("[3] Screenshot saved -> /tmp/intro_3.png  (prologue text expected)")

        # Check for skip button visibility
        print("\n--- Skip Button Check ---")

        # Try several possible selectors for the skip button
        skip_found = False
        selectors_tried = []

        # Check by text content
        for sel in [
            "text=스킵",
            "text=skip",
            "text=Skip",
            "text=SKIP",
            "text=건너뛰기",
            "button:has-text('스킵')",
            "button:has-text('skip')",
            "#skipBtn",
            ".skip-btn",
            "[id*='skip']",
            "[class*='skip']",
        ]:
            selectors_tried.append(sel)
            loc = page.locator(sel)
            count = loc.count()
            if count > 0:
                visible = loc.first.is_visible()
                print(f"  Found '{sel}' -> count={count}, visible={visible}")
                if visible:
                    skip_found = True

        if not skip_found:
            print(f"  Skip button NOT found with any of: {selectors_tried}")
            # Also dump all visible buttons/clickable elements for debugging
            buttons = page.locator("button")
            btn_count = buttons.count()
            print(f"  Total <button> elements on page: {btn_count}")
            for i in range(min(btn_count, 10)):
                btn = buttons.nth(i)
                txt = btn.inner_text()
                vis = btn.is_visible()
                print(f"    button[{i}]: text='{txt}', visible={vis}")

            # Check canvas — if everything is drawn on canvas, there's no DOM skip button
            canvases = page.locator("canvas")
            canvas_count = canvases.count()
            print(f"  Total <canvas> elements: {canvas_count}")
            if canvas_count > 0:
                print("  (Skip button may be rendered on canvas, not in DOM)")

        print("\n--- Console Logs ---")
        # Collect any console messages from the page
        # (We need to set this up before navigation for real capture,
        #  but let's at least check for errors)

        print("\nDone. Check /tmp/intro_1.png, /tmp/intro_2.png, /tmp/intro_3.png")
        browser.close()


if __name__ == "__main__":
    main()
