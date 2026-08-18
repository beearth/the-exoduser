from playwright.sync_api import sync_playwright
import json, os

out_dir = r'G:\exoduser\tmp'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 900})
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    page.goto('http://localhost:3333/game.html?mapTest=v4', wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(7000)
    for _ in range(8):
        page.mouse.click(800, 450)
        page.keyboard.press('Escape')
        page.keyboard.press('Enter')
        page.wait_for_timeout(400)
    page.evaluate('''() => {
      const t = document.getElementById('tutorial');
      if(t){t.style.display='none';t.style.opacity='0';t.style.pointerEvents='none';}
      if(window.G){G.on=true;}
    }''')
    page.wait_for_timeout(800)
    info = page.evaluate('''() => {
      const src = (typeof _vistaImgForStage==='function') ? _vistaImgForStage() : null;
      const c = document.querySelector('canvas');
      return {
        want: typeof _wantPlateTest==='function' ? _wantPlateTest() : null,
        img: src ? [src.naturalWidth, src.naturalHeight, src.src.split('/').pop()] : null,
        canvas: c ? [c.width, c.height] : null
      };
    }''')
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_play.png'))
    page.keyboard.down('w')
    page.wait_for_timeout(3000)
    page.keyboard.up('w')
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_walk.png'))
    print('INFO', json.dumps(info, ensure_ascii=False))
    for line in logs:
        if any(k in line.lower() for k in ['map', 'plate', 'error']):
            print(line)
    browser.close()
