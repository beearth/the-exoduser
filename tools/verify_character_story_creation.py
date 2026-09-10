import json
from pathlib import Path
from playwright.sync_api import sync_playwright
O=Path('G:/exoduser/output/cinematic/legacy_story_disabled_20260910');O.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    page.add_init_script("""window.__legacyStoryPlays=[];const mediaPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if((this.currentSrc||this.src||'').includes('intro_voice.mp3'))window.__legacyStoryPlays.push(this.currentSrc||this.src);return mediaPlay.apply(this,args);};""")
    errors=[];writes=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        url=route.request.url
        if '/api/save' in url:
            writes.append(route.request.post_data_json);route.fulfill(json={'ok':True,'slot':'검증전사'})
        elif '/api/slots' in url:route.fulfill(json={'ok':True,'slots':[]})
        elif '/api/load/' in url:route.fulfill(status=404,json={'ok':False})
        else:route.continue_()
    page.route('**/api/**',api)
    page.route('**/game.html?*',lambda route:route.fulfill(body='<html><body>Game handoff captured</body></html>',content_type='text/html'))
    page.goto('http://127.0.0.1:3333/index.html?test=1&lobby=1',wait_until='networkidle',timeout=60000)
    page.locator('.char-item-new').click()
    page.locator('#visualCreateBtn').click()
    page.locator('#charName').fill('검증전사')
    page.locator('#createBtn').click()
    page.wait_for_function("document.getElementById('characterStoryVideo')?.currentTime>1",timeout=30000)
    state=page.evaluate("""() => {const v=document.getElementById('characterStoryVideo');return {src:v.currentSrc,time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,volume:v.volume,paused:v.paused,lobbyPaused:lobbyBGM.paused,idlePaused:csIdleVid.paused,audioTracks:v.webkitAudioDecodedByteCount||0,active:ExoduserCharacterStory.active}}""")
    assert state['duration']==96.4 and state['width']==1920 and state['height']==1080,state
    assert not state['muted'] and state['volume']==1 and not state['paused'] and state['lobbyPaused'] and state['idlePaused'],state
    assert len(writes)==1 and writes[0]['data']['charIdx']==0,writes
    page.screenshot(path=str(O/'creation_movie_playing.png'))
    page.locator('#characterStorySkip').click()
    page.wait_for_url('**/game.html?**story=warrior-v21',timeout=10000)
    result=dict(status='PASS',creation_writes=len(writes),playback=state,skip_destination=page.url,page_errors=errors,save_isolation='API responses mocked only in isolated browser; real media served by project server')
    page.unroute('**/game.html?*')
    page.goto(result['skip_destination'],wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof G!=='undefined' && G.on && G._cutsceneDone && _cutsceneState===null",timeout=60000)
    result['game_handoff']=page.evaluate("({cutscene:_cutsceneState,oldVoicePaused:_proVoice.paused,charIdx:_charIdx,stage:G.stage,gameRunning:G.on,wakeupIntro:!!G._intro})")
    assert result['game_handoff']['oldVoicePaused'] and result['game_handoff']['charIdx']==0 and not result['game_handoff']['wakeupIntro'],result
    page.screenshot(path=str(O/'game_direct_play.png'))
    page.goto(result['skip_destination'].replace('&story=warrior-v21',''),wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof G!=='undefined' && G.on && G._cutsceneDone && _cutsceneState===null",timeout=60000)
    result['ordinary_warrior_entry_no_legacy_intro']=True
    assert page.evaluate('window.__legacyStoryPlays.length')==0
    page.evaluate("localStorage.setItem('_charIdx','1')")
    page.goto(result['skip_destination'].replace('&story=warrior-v21',''),wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof G!=='undefined' && G.on && G._cutsceneDone && _cutsceneState===null && _charIdx===1",timeout=60000)
    result['silvertail_entry']=page.evaluate("({charIdx:_charIdx,cutscene:_cutsceneState,gameRunning:G.on,legacyVoicePlayCalls:window.__legacyStoryPlays.length,voicePaused:_proVoice.paused})")
    assert result['silvertail_entry']['legacyVoicePlayCalls']==0 and result['silvertail_entry']['voicePaused'],result
    page.screenshot(path=str(O/'silvertail_no_legacy_story.png'))
    assert not errors,errors
    (O/'qa.json').write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode('utf-8'))
    print(json.dumps(result,ensure_ascii=False),flush=True)
    browser.close()
