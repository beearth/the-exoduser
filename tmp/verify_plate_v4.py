from playwright.sync_api import sync_playwright
import json, os, time

out_dir = r'G:\exoduser\tmp'
os.makedirs(out_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 900})
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    page.goto('http://localhost:3333/game.html?stage=0', wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(2000)
    page.mouse.click(800, 450)
    page.keyboard.press('Enter')
    page.wait_for_timeout(8000)
    page.mouse.click(800, 450)
    page.wait_for_timeout(2000)
    info = page.evaluate('''() => {
      const g = window.G || {};
      const im = (typeof _vistaImgForStage==='function') ? _vistaImgForStage() : null;
      return {
        mw: g.mw, mh: g.mh, testbed: !!g._testbed, plate: g._plateSrc || null,
        on: !!g.on, stage: g.stage,
        px: window.P ? Math.round(P.x) : null,
        py: window.P ? Math.round(P.y) : null,
        imgW: im ? im.naturalWidth : 0,
        imgH: im ? im.naturalHeight : 0,
        imgSrc: im ? im.src : null,
        want: (typeof _wantPlateTest==='function') ? _wantPlateTest() : null
      };
    }''')
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_start.png'))
    # walk north a bit
    page.keyboard.down('w')
    page.wait_for_timeout(2500)
    page.keyboard.up('w')
    page.wait_for_timeout(400)
    info2 = page.evaluate('''() => {
      const g = window.G || {};
      return {px: window.P ? Math.round(P.x) : null, py: window.P ? Math.round(P.y) : null, on: !!g.on};
    }''')
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_north.png'))
    print('INFO', json.dumps(info, ensure_ascii=False))
    print('AFTER', json.dumps(info2, ensure_ascii=False))
    print('---LOGS---')
    for line in logs:
        if any(k in line.lower() for k in ['map', 'plate', 'error', 'intro']):
            print(line)
    browser.close()
