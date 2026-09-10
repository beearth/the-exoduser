import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[1]/'output/cinematic/nemesis_theme_20260910'
OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=nemesis-theme-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof BGM!=='undefined' && BGM._curKey==='cutscene_nemesis' && BGM._cur",timeout=60000)
    page.mouse.click(640,360)
    page.wait_for_function("BGM._cur && !BGM._cur.paused && BGM._cur.currentTime>.2",timeout=15000)
    result=page.evaluate("({sequence:_cutSeq,key:BGM._curKey,src:decodeURI(BGM._cur.currentSrc),time:BGM._cur.currentTime,volume:BGM._cur.volume,paused:BGM._cur.paused,readyState:BGM._cur.readyState,legacyVoicePaused:_proVoice.paused})")
    assert result['sequence']=='INTRO' and result['src'].endswith('/bgm/공통/네메시아의 강림 V3.mp3') and result['legacyVoicePaused'] and result['volume']>0,result
    before=page.evaluate('BGM._cur.currentTime')
    page.evaluate('_cutWaitInput=true;_cutsceneAdvance()')
    page.wait_for_timeout(150)
    assert page.evaluate("BGM._curKey==='cutscene_nemesis' && BGM._cur.currentTime")>=before
    page.evaluate('_cutsceneEnd()')
    page.wait_for_function("BGM._curKey!== 'cutscene_nemesis'",timeout=5000)
    assert not errors,errors
    report={'status':'PASS','playback':result,'partial_skip_keeps_music':True,'end_releases_theme':True,'page_errors':errors,'real_save_writes':False}
    (OUT/'qa.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(report,ensure_ascii=False),flush=True)
    browser.close()
