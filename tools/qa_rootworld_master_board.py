"""Whole-map review artifact QA; not a gameplay or visual-quality approval."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
out = root / 'captures/rootworld_master_20260924'
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 1100})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    response = page.goto('http://127.0.0.1:3334/tools/rootworld-master-board.html', wait_until='networkidle')
    assert response.status == 200, 'Whole-map comparison board is missing'
    assert page.locator('svg').count() == 2
    assert page.locator('#current-nav').get_attribute('d').startswith('M')
    assert page.locator('#proposal').get_attribute('data-status') == 'design-only'
    assert page.locator('[data-camera]').count() == 8
    assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete && i.naturalWidth>0)')
    assert not errors, errors
    page.screenshot(path=str(out / 'whole-map-board.png'), full_page=True)
    page.set_viewport_size({'width': 800, 'height': 900})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    print('PASS: reference, current geometry, design proposal, 8 camera evidence images, responsive layout; no runtime acceptance claimed')
    browser.close()
