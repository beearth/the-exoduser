from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('tmp/direction-browser')
OUT.mkdir(parents=True, exist_ok=True)

DIRECTIONS = {
    '12': (640, 120), '1': (890, 170), '3': (1080, 360), '5': (890, 550),
    '6': (640, 600), '7': (390, 550), '9': (200, 360), '11': (390, 170),
}

def wait_for_atlas(page):
    page.wait_for_function("() => typeof P !== 'undefined' && typeof G !== 'undefined' && _atlasMask && _atlasMask.complete")

def capture_character(page, char_index, name):
    page.evaluate("idx => _loadCharAtlas(idx)", char_index)
    page.wait_for_timeout(1000)
    wait_for_atlas(page)
    results = {}
    for clock, (x, y) in DIRECTIONS.items():
        page.mouse.move(x, y)
        page.wait_for_timeout(150)
        page.keyboard.down('KeyD')
        page.wait_for_timeout(100)
        state = page.evaluate("""() => ({
            facing: P.facing,
            facingDir: _facingDir8(P.facing),
            state: P.s,
            charIdx: _charIdx,
            mouseFacing: _mouseFacing,
            gamepad: _gpActive
        })""")
        page.keyboard.up('KeyD')
        page.wait_for_timeout(100)
        page.screenshot(path=str(OUT / f'{name}-{clock}.png'))
        results[clock] = state
    return results

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    logs = []
    page.on('console', lambda msg: logs.append(f'{msg.type}: {msg.text}'))
    page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1&slot=direction-browser', wait_until='networkidle')
    wait_for_atlas(page)
    result = {
        'warrior': capture_character(page, 0, 'warrior'),
        'silvertail': capture_character(page, 1, 'silvertail'),
        'consoleErrors': [line for line in logs if line.startswith('error:')],
    }
    (OUT / 'result.json').write_text(__import__('json').dumps(result, indent=2), encoding='utf-8')
    print(__import__('json').dumps(result, indent=2))
    browser.close()
