"""
Playwright test for https://hell-smoky.vercel.app/
Tests intro page, skip button, and game.html with console error logging.
"""

import sys
import io
import time
from playwright.sync_api import sync_playwright

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


def main():
    console_errors_intro = []
    console_errors_game = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})

        # ==============================
        # TEST 1: Intro page
        # ==============================
        page = context.new_page()

        # Collect console errors
        page.on("console", lambda msg: console_errors_intro.append(
            f"[{msg.type}] {msg.text}"
        ) if msg.type == "error" else None)

        page.on("pageerror", lambda err: console_errors_intro.append(
            f"[pageerror] {err.message}"
        ))

        print("=" * 60)
        print("TEST 1: Navigate to https://hell-smoky.vercel.app/")
        print("=" * 60)

        page.goto("https://hell-smoky.vercel.app/", wait_until="load", timeout=30000)
        print(f"  Page title: {page.title()}")
        print(f"  URL: {page.url}")

        # Wait 2 seconds then take screenshot
        time.sleep(2)
        page.screenshot(path="/tmp/test_1_intro.png", full_page=False)
        print("  Screenshot saved: /tmp/test_1_intro.png")

        # ==============================
        # TEST 2: Click skip button
        # ==============================
        print()
        print("=" * 60)
        print("TEST 2: Click #skipBtn to skip cinematic")
        print("=" * 60)

        skip_btn = page.query_selector("#skipBtn")
        if skip_btn:
            visible = skip_btn.is_visible()
            print(f"  #skipBtn found, visible: {visible}")
            # Use JS click to bypass video overlay intercepting pointer events
            page.evaluate("document.getElementById('skipBtn').click()")
            print("  Clicked #skipBtn via JS (bypassing video overlay)")
        else:
            print("  #skipBtn NOT found on page!")
            # List all buttons for debugging
            buttons = page.query_selector_all("button")
            print(f"  Found {len(buttons)} button(s) on page:")
            for btn in buttons:
                btn_id = btn.get_attribute("id") or "(no id)"
                btn_text = btn.inner_text()[:50]
                print(f"    - id={btn_id}, text='{btn_text}'")

        # Wait a moment for transition
        time.sleep(1)
        page.screenshot(path="/tmp/test_2_gate.png", full_page=False)
        print("  Screenshot saved: /tmp/test_2_gate.png")

        # ==============================
        # Console errors for intro page
        # ==============================
        print()
        print("=" * 60)
        print("CONSOLE ERRORS (intro page):")
        print("=" * 60)
        if console_errors_intro:
            for err in console_errors_intro:
                print(f"  {err}")
        else:
            print("  No console errors found.")

        page.close()

        # ==============================
        # TEST 3: game.html
        # ==============================
        page2 = context.new_page()

        page2.on("console", lambda msg: console_errors_game.append(
            f"[{msg.type}] {msg.text}"
        ) if msg.type == "error" else None)

        page2.on("pageerror", lambda err: console_errors_game.append(
            f"[pageerror] {err.message}"
        ))

        print()
        print("=" * 60)
        print("TEST 3: Navigate to https://hell-smoky.vercel.app/game.html")
        print("=" * 60)

        try:
            response = page2.goto(
                "https://hell-smoky.vercel.app/game.html",
                wait_until="load",
                timeout=30000
            )
            print(f"  Page title: {page2.title()}")
            print(f"  URL: {page2.url}")
            print(f"  HTTP status: {response.status if response else 'N/A'}")

            # Wait 3 seconds then take screenshot
            time.sleep(3)
            page2.screenshot(path="/tmp/test_3_game.png", full_page=False)
            print("  Screenshot saved: /tmp/test_3_game.png")

        except Exception as e:
            print(f"  Error navigating to game.html: {e}")
            # Take screenshot of error state
            page2.screenshot(path="/tmp/test_3_game.png", full_page=False)
            print("  Screenshot saved (error state): /tmp/test_3_game.png")

        # ==============================
        # Console errors for game.html
        # ==============================
        print()
        print("=" * 60)
        print("CONSOLE ERRORS (game.html):")
        print("=" * 60)
        if console_errors_game:
            for err in console_errors_game:
                print(f"  {err}")
        else:
            print("  No console errors found.")

        page2.close()
        browser.close()

    # ==============================
    # SUMMARY
    # ==============================
    print()
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"  Intro page console errors: {len(console_errors_intro)}")
    print(f"  game.html console errors:  {len(console_errors_game)}")
    print(f"  Total console errors:      {len(console_errors_intro) + len(console_errors_game)}")
    print()
    print("  Screenshots:")
    print("    /tmp/test_1_intro.png  - Intro page (2s after load)")
    print("    /tmp/test_2_gate.png   - After skip button click")
    print("    /tmp/test_3_game.png   - game.html (3s after load)")


if __name__ == "__main__":
    main()
