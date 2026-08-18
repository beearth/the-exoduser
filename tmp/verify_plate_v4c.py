from playwright.sync_api import sync_playwright
import json, os

out_dir = r'G:\exoduser\tmp'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1600, 'height': 900})
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    page.goto('http://localhost:3333/game.html?mapTest=v4', wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(8500)
    page.mouse.click(800, 450)
    page.evaluate('''() => {
      ['stageTransition','tutorial','introText','introKeys','introDiff','introCurtainTop','introCurtainBot'].forEach(id=>{
        const el=document.getElementById(id); if(el){el.style.display='none';el.style.opacity='0';el.style.pointerEvents='none';}
      });
    }''')
    page.wait_for_timeout(600)
    info = page.evaluate('''() => {
      const src = (typeof _vistaImgForStage==='function') ? _vistaImgForStage() : null;
      return {
        want: typeof _wantPlateTest==='function' ? _wantPlateTest() : null,
        img: src ? [src.naturalWidth, src.naturalHeight, (src.src||'').split('/').pop()] : null
      };
    }''')
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_play.png'))
    page.keyboard.down('w')
    page.wait_for_timeout(3500)
    page.keyboard.up('w')
    page.wait_for_timeout(300)
    page.screenshot(path=os.path.join(out_dir, 'plate_v4_walk.png'))
    print('INFO', json.dumps(info, ensure_ascii=False))
    for line in logs:
        if any(k in line.lower() for k in ['map', 'plate', 'error', 'intro', 'cutscene']):
            print(line)
    browser.close()
