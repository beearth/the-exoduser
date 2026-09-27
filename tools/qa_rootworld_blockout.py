"""Fixed-viewport camera audit for the isolated CH1 field QA map."""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

candidate = '--candidate' in sys.argv
out = Path(__file__).resolve().parents[1] / ('captures/rootworld_candidate_20260924' if candidate else 'captures/rootworld_blockout_20260924')
out.mkdir(parents=True, exist_ok=True)
errors, failed, boards = [], [], []
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('response', lambda response: failed.append({'status': response.status, 'url': response.url}) if response.status >= 400 else None)
    url = 'http://127.0.0.1:3334/game.html?test=1&testchar=1&stage=0&classic=1&mapqa=1&fieldrebuild=1&fieldart=candidate' if candidate else 'http://127.0.0.1:3334/map/field'
    page.goto(url, wait_until='domcontentloaded', timeout=90000)
    page.wait_for_function("typeof G!=='undefined' && G._fieldRebuildQA && G.map && typeof P!=='undefined'", timeout=90000)
    page.wait_for_function("_cutsceneState==='INTRO_CUTSCENE' || __ch1StartOuterQA().stats.requests>0", timeout=30000)
    for _ in range(3):
        if not page.evaluate("_cutsceneState==='INTRO_CUTSCENE'"):
            break
        page.keyboard.press('Escape')
        page.wait_for_timeout(250)
    try:
        page.locator('#ikSkip').wait_for(state='visible', timeout=5000)
        page.locator('#ikSkip').click()
    except PlaywrightTimeout:
        pass
    try:
        page.wait_for_load_state('networkidle', timeout=10000)
    except PlaywrightTimeout:
        print('Continuous requests: using rendered chunk readiness', flush=True)
    page.screenshot(path=str(out / 'entry.png'))
    print(page.evaluate("()=>({on:G.on,intro:G._intro,cut:_cutsceneState,outer:__ch1StartOuterQA(),errors:document.querySelector('#charCreateScreen')?.innerText})"), flush=True)
    page.wait_for_function("typeof __ch1StartOuterQA==='function' && __ch1StartOuterQA().stats.drawnIds.length>0", timeout=30000)
    assert page.evaluate('G.map[112][102]') == 1, 'central root mass must remain solid after genFromTemplate'
    assert page.evaluate('G.map[7][100]') == 2, 'exit must stay at the north gate'
    for name, tx, ty in [('01_START',100,181),('02_EARLY',86,165),('03_ARENA',62,126),('04_SIDE_L',40,122),('05_SIDE_R',155,115),('06_LANDMARK',124,113),('07_LATE',80,49),('08_EXIT',100,15)]:
        state = page.evaluate("""([tx,ty])=>{
          P.x=(tx+.5)*T;P.y=(ty+.5)*T;P.iframes=9999;
          G.cam.x=P.x;G.cam.y=P.y;
          return {tile:G.map[ty]?.[tx],x:P.x,y:P.y,stage:G.stage};
        }""", [tx,ty])
        assert state['tile'] == 0, (name, state)
        page.wait_for_timeout(1800)
        page.screenshot(path=str(out / f'{name}.png'))
        boards.append({'name':name,'requestedTile':[tx,ty],**state,'outer':page.evaluate('__ch1StartOuterQA()')})
    report={'viewport':[1280,720],'deviceScaleFactor':1,'errors':errors,'httpErrors':failed,'cameras':boards}
    (out/'runtime.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'errors':errors,'httpErrors':failed,'cameras':len(boards),'root':boards[0]['outer']['root'],'captureDir':str(out)},ensure_ascii=False))
    browser.close()
