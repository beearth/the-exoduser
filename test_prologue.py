"""
Playwright test: Prologue cinematic at https://hell-smoky.vercel.app/

Captures screenshots at 8s, 15s, and 35s after page load to verify
that prologue text appears during the cinematic sequence.

Cinematic phases:
  0-6s   Gate zoom-out animation
  ~6s    Prologue Part 1 text starts (war story, one line at a time)
  ~35s   Transition gap between parts
  ~38s+  Prologue Part 2 text ("너는 왜 지옥에 왔느냐?")

Uses: Python Playwright sync API, headless Chromium, 1280x720 viewport.
"""

from playwright.sync_api import sync_playwright
import time
import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

URL = "https://hell-smoky.vercel.app/"
VIEWPORT = {"width": 1280, "height": 720}

SCREENSHOTS = [
    {"delay": 8,  "path": "/tmp/prologue_1.png", "label": "8s - Prologue Part 1 (early text)"},
    {"delay": 15, "path": "/tmp/prologue_2.png", "label": "15s - Prologue Part 1 (more text)"},
    {"delay": 35, "path": "/tmp/prologue_3.png", "label": "35s - Near end of Part 1 / start of Part 2"},
]


def get_prologue_state(page):
    """Extract current prologue text and element state from the DOM."""
    return page.evaluate("""() => {
        const result = {};

        // Main text container
        const cinText = document.getElementById('cinText');
        result.prologue_text = cinText ? cinText.innerText?.trim() : '(no cinText element)';

        // Individual visible lines
        const lines = document.querySelectorAll('.cin-line.show');
        result.visible_lines = Array.from(lines).map(l => ({
            text: l.textContent?.trim(),
            opacity: window.getComputedStyle(l).opacity,
            classes: l.className
        }));

        // Prompt text
        const prompt = document.querySelector('.cin-prompt');
        result.prompt_text = prompt ? prompt.textContent?.trim() : '';
        result.prompt_opacity = prompt ? window.getComputedStyle(prompt).opacity : '0';

        // Skip button
        const skip = document.getElementById('skipBtn');
        result.skip_visible = skip ? skip.classList.contains('show') : false;

        // Enter button
        const enter = document.getElementById('enterBtn');
        result.enter_visible = enter ? window.getComputedStyle(enter).display !== 'none' : false;

        // cinScene overall
        const scene = document.getElementById('cinScene');
        result.scene_visible = scene ? window.getComputedStyle(scene).display !== 'none' : false;

        return result;
    }""")


def main():
    results = {"url": URL, "viewport": VIEWPORT, "screenshots": []}

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=2)
        page = context.new_page()

        print(f"[INFO] Navigating to {URL}")
        page.goto(URL, wait_until="load", timeout=30000)
        load_time = time.time()
        print(f"[INFO] Page loaded. Cinematic auto-playing.")

        for shot in SCREENSHOTS:
            target = shot["delay"]
            elapsed = time.time() - load_time
            wait = max(0, target - elapsed)
            if wait > 0:
                time.sleep(wait)

            state = get_prologue_state(page)
            page.screenshot(path=shot["path"], full_page=False)

            entry = {
                "time": f"t={target}s",
                "label": shot["label"],
                "file": shot["path"],
                "state": state,
            }
            results["screenshots"].append(entry)

            print(f"\n[SCREENSHOT] {shot['label']}")
            print(f"  File: {shot['path']}")
            print(f"  Prologue text: \"{state['prologue_text']}\"")
            print(f"  Visible lines: {len(state['visible_lines'])}")
            for i, line in enumerate(state['visible_lines']):
                print(f"    [{i}] \"{line['text']}\" (opacity={line['opacity']})")
            print(f"  Prompt: \"{state['prompt_text']}\" (opacity={state['prompt_opacity']})")
            print(f"  Skip btn visible: {state['skip_visible']}")
            print(f"  Enter btn visible: {state['enter_visible']}")
            print(f"  Scene visible: {state['scene_visible']}")

        browser.close()

    # Summary
    print("\n" + "=" * 60)
    print("PROLOGUE TEST SUMMARY")
    print("=" * 60)

    all_ok = True
    for entry in results["screenshots"]:
        s = entry["state"]
        has_text = bool(s["prologue_text"]) and s["prologue_text"] != "(no cinText element)"
        has_lines = len(s["visible_lines"]) > 0
        scene_up = s["scene_visible"]

        status = "PASS" if (scene_up and (has_text or has_lines)) else "WARN"
        if status == "WARN" and entry["time"] == "t=35s":
            # At 35s there may be a gap between parts - this is expected
            status = "OK (transition gap expected)"

        if status == "WARN":
            all_ok = False

        print(f"  {entry['time']:8s} | {status:30s} | text=\"{s['prologue_text'][:50]}\"")

    print("=" * 60)
    if all_ok:
        print("RESULT: All prologue checkpoints verified successfully.")
    else:
        print("RESULT: Some checkpoints had warnings. Check screenshots.")

    print(f"\nScreenshot files:")
    for shot in SCREENSHOTS:
        print(f"  {shot['path']}")


if __name__ == "__main__":
    main()
