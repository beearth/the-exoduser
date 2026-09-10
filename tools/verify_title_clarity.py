"""Verify real title playback, native text, HiDPI sizing and media failure exits."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--baseline',action='store_true');args=parser.parse_args()
out=Path('captures/title_clarity_20260910');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    reports=[]
    for width,height,dpr,mode in [(5120,1440,1,'video'),(1920,1080,2,'video'),(1920,1080,1,'fallback'),(1920,1080,1,'plate-failure'),(1920,1080,1,'sd-fallback'),(1920,1080,1,'skip')]:
        if args.baseline and mode!='video':continue
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=dpr)
        page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.route('**/api/slots**',lambda r:r.fulfill(status=200,content_type='application/json',body='[]'))
        if mode=='fallback':page.route('**/video/title_motion*.mp4*',lambda r:r.abort())
        if mode=='sd-fallback':page.route('**/video/title_motion_hd.mp4*',lambda r:r.abort())
        if mode=='plate-failure':page.route('**/img/title_clean_plate_20260910.png*',lambda r:r.abort())
        page.goto('http://127.0.0.1:3333/index.html'+('?lobby=1' if mode=='skip' else ''),wait_until='domcontentloaded')
        if mode=='skip':
            page.wait_for_function("getComputedStyle(document.getElementById('splashOverlay')).display==='none'")
            assert not page.locator('#splashOverlay').is_visible()
            assert not page.locator('#splashTitleVideo').get_attribute('src')
            assert not errors,errors
            reports.append({'mode':mode,'errors':errors});context.close();continue
        page.wait_for_function("getComputedStyle(document.getElementById('fdgScreen')).display==='none'",timeout=20000)
        if mode!='fallback':
            page.wait_for_function("document.getElementById('splashTitleVideo').readyState>=2",timeout=20000)
        page.wait_for_timeout(1800)
        if not args.baseline:
            assert page.locator('#splashTitlePrompt').is_visible()
            assert page.locator('#splashTitlePrompt').inner_text()
            assert page.locator('#splashTitleBrand').is_visible()==(mode!='plate-failure')
            if mode!='plate-failure':assert 'EX' in page.locator('#splashTitleBrand').text_content()
        data=page.evaluate('''()=>{const c=document.getElementById('splashCanvas'),v=document.getElementById('splashTitleVideo'),p=document.getElementById('splashTitlePrompt');return {canvas:[c.width,c.height],css:[c.clientWidth,c.clientHeight],video:[v.videoWidth,v.videoHeight],time:v.currentTime,muted:v.muted,loop:v.loop,prompt:p?{font:getComputedStyle(p).fontSize,opacity:getComputedStyle(p).opacity}:null}}''')
        assert data['canvas']==[width*dpr,height*dpr]
        if not args.baseline and mode!='fallback':assert data['video']==([1920,768] if mode=='sd-fallback' else [3840,1536])
        if mode=='sd-fallback':assert page.locator('#splashTitleVideo').evaluate('v=>v.dataset.sdFallback==="1"')
        if mode=='video':
            assert data['muted'] and data['loop']
            page.wait_for_timeout(4000)
            assert page.locator('#splashOverlay').is_visible()
            assert page.locator('#splashTitleVideo').evaluate('v=>!v.paused&&v.currentTime!==0')
        label=('before' if args.baseline else 'after')+f'_{width}_{dpr}_{mode}'
        page.screenshot(path=str(out/(label+'.png')))
        page.keyboard.press('Enter')
        page.wait_for_function("getComputedStyle(document.getElementById('splashOverlay')).display==='none'")
        assert page.locator('#splashTitleVideo').evaluate('v=>v.paused&&!v.getAttribute("src")')
        assert not errors,errors
        reports.append({'mode':mode,'width':width,'dpr':dpr,**data,'errors':errors})
        context.close()
    (out/('before.json' if args.baseline else 'report.json')).write_text(json.dumps(reports,indent=2),encoding='utf8')
    print(json.dumps({'cases':len(reports),'status':'PASS'}))
    browser.close()
