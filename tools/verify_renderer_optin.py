"""Windows Chromium boot evidence; explicitly NOT Mac/Safari device certification."""
import json,platform
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('captures/renderer_optin_20260910');out.mkdir(parents=True,exist_ok=True)
reports=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,channel='chrome')
    for query in ['', '&webgpu=0']:
        context=browser.new_context(viewport={'width':1280,'height':720})
        page=context.new_page();logs=[];errors=[]
        page.on('console',lambda m:logs.append(m.text) if m.text.startswith('[GPU]') else None)
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:3333/game.html?renderercheck=20260910'+query,wait_until='domcontentloaded',timeout=60000)
        page.wait_for_function("typeof _useGL!=='undefined'&&(_useGL||_useGPU)",timeout=60000)
        page.wait_for_timeout(1000)
        state=page.evaluate("()=>({gl:_useGL,gpu:_useGPU,version:GL&&GL.getParameter(GL.VERSION),renderer:_hwGPU,ua:navigator.userAgent,platform:navigator.platform,hasGPU:typeof navigator.gpu!=='undefined'})")
        assert state['gl'] and not state['gpu'],state
        assert 'WebGL 2.0' in state['version'],state
        assert any('[GPU] WebGL2 |' in x and 'policy=url-opt-in-20260910' in x for x in logs),logs
        assert not errors,errors
        reports.append({'query':query or '(default)','host':platform.system(),'macDeviceTest':False,'state':state,'logs':logs,'pageErrors':errors})
        context.close()
    browser.close()
(out/'boot-report.json').write_bytes((json.dumps(reports,ensure_ascii=False,indent=2)+'\n').encode())
print(json.dumps(reports,ensure_ascii=False))
