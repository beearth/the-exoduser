"""Compare normal/QA canvases and resize the live map hub without reloading it."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    for width,height,dpr in [(1280,720,1),(1920,1080,2)]:
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=dpr)
        page=context.new_page()
        pairs=[]
        for suffix in ['', '&mapqa=1&fieldrebuild=1']:
            page.goto('http://127.0.0.1:3334/game.html?test=1&testchar=1&stage=0&classic=1'+suffix,wait_until='domcontentloaded')
            page.wait_for_function("()=>{try{return typeof rz==='function' && !!OPT && !!C}catch{return false}}",timeout=60000)
            pairs.append(page.evaluate("""()=>[100,75].map(scale=>{
              OPT.resScale=scale;rz();return {scale,logical:[VW,VH],backing:[C.width,C.height],css:[C.style.width,C.style.height],ssaa:_ssaa};
            })"""))
        assert pairs[0]==pairs[1],pairs
        results.append({'viewport':[width,height],'dpr':dpr,'normal':pairs[0],'qa':pairs[1]})
        context.close()
    page=browser.new_page(viewport={'width':1280,'height':720})
    page.goto('http://127.0.0.1:3334/map-test.html',wait_until='domcontentloaded')
    src=page.locator('#game').get_attribute('src')
    for width,height in [(1280,720),(1920,1080),(2560,900)]:
        page.set_viewport_size({'width':width,'height':height})
        page.wait_for_function('([w,h])=>{const f=document.querySelector("#game");return f.clientWidth===w&&f.clientHeight===h}',arg=[width,height])
        assert page.locator('#game').get_attribute('src')==src
        results.append({'hubViewport':[width,height],'frameMatches':True,'reloaded':False})
    browser.close()
out=Path('captures/map_resolution_20260924')
out.mkdir(parents=True,exist_ok=True)
(out/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False))
