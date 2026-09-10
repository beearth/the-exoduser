import json
from pathlib import Path
from playwright.sync_api import sync_playwright
O=Path('G:/exoduser/output/cinematic/character_identity_nemesis_20260910');O.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    page.add_init_script("""window.__legacyStoryPlays=[];const mediaPlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if((this.currentSrc||this.src||'').includes('intro_voice.mp3'))window.__legacyStoryPlays.push(this.currentSrc||this.src);return mediaPlay.apply(this,args);};""")
    errors=[];writes=[];saved={};load_mode="server";accept_writes=True
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        url=route.request.url
        if '/api/save' in url:
            writes.append(route.request.post_data_json)
            if accept_writes:saved.update(writes[-1]['data'])
            route.fulfill(json={'ok':True,'slot':'검증전사'})
        elif '/api/slots' in url:route.fulfill(json={'ok':True,'slots':[]})
        elif '/api/load/' in url:
            if load_mode=='failure':route.fulfill(status=503,json={'ok':False})
            elif saved:route.fulfill(json={'ok':True,'data':saved})
            else:route.fulfill(status=404,json={'ok':False})
        else:route.continue_()
    page.route('**/api/**',api)
    page.route('**/game.html?*',lambda route:route.fulfill(body='<html><body>Game handoff captured</body></html>',content_type='text/html'))
    page.goto('http://127.0.0.1:3333/index.html?test=1&lobby=1',wait_until='networkidle',timeout=60000)
    page.evaluate("localStorage.setItem('_charIdx','1')")
    page.locator('.char-item-new').click()
    page.locator('#visualCreateBtn').click()
    page.locator('#charName').fill('검증전사')
    page.locator('#createBtn').click()
    page.wait_for_function("document.getElementById('characterStoryVideo')?.currentTime>1",timeout=30000)
    state=page.evaluate("""() => {const v=document.getElementById('characterStoryVideo');return {src:v.currentSrc,time:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,volume:v.volume,paused:v.paused,controls:v.controls,pictureInPictureDisabled:v.disablePictureInPicture,lobbyPaused:lobbyBGM.paused,idlePaused:csIdleVid.paused,audioTracks:v.webkitAudioDecodedByteCount||0,active:ExoduserCharacterStory.active}}""")
    assert state['duration']==96.4 and state['width']==1920 and state['height']==1080,state
    assert not state['muted'] and state['volume']==1 and not state['paused'] and state['lobbyPaused'] and state['idlePaused'],state
    assert len(writes)==1 and writes[0]['data']['charIdx']==0,writes
    assert state['controls'] is False and state['pictureInPictureDisabled'],state
    page.screenshot(path=str(O/'creation_movie_playing.png'))
    skips=[]
    for key,target in [('click',5.5),('Enter',10),('Space',16)]:
        if key=='click':page.locator('#characterStoryOverlay').click(position={'x':640,'y':300})
        else:page.keyboard.press(key)
        page.wait_for_function(f"characterStoryVideo.currentTime>={target} && !characterStoryVideo.seeking")
        clock=page.evaluate('characterStoryVideo.currentTime');assert clock<target+1,clock
        skips.append({'input':key,'target':target,'actual':clock})
    page.keyboard.down('Escape');page.wait_for_timeout(350);page.keyboard.up('Escape')
    assert page.evaluate('ExoduserCharacterStory.active')
    page.wait_for_timeout(1000)
    assert page.evaluate('ExoduserCharacterStory.active')
    page.screenshot(path=str(O/'cinematic_partial_skip.png'))
    page.keyboard.down('Escape')
    page.wait_for_url('**/game.html?**story=warrior-v21',timeout=10000)
    page.keyboard.up('Escape')
    result=dict(status='PASS',creation_writes=len(writes),playback=state,partial_skips=skips,short_hold_cancelled=True,full_hold_ms=1200,skip_destination=page.url,page_errors=errors,save_isolation='API responses mocked only in isolated browser; real media served by project server')
    page.unroute('**/game.html?*')
    page.goto(result['skip_destination'],wait_until='domcontentloaded',timeout=60000)
    def check_nemesis(expected):
        page.wait_for_function("typeof G!=='undefined' && typeof _cutsceneState!=='undefined' && _cutsceneState==='INTRO_CUTSCENE'",timeout=60000)
        state=page.evaluate("({charIdx:_charIdx,sequence:_cutSeq,legacyVoicePlayCalls:window.__legacyStoryPlays.length,voicePaused:_proVoice.paused,gameRunning:G.on})")
        assert state['charIdx']==expected and state['sequence']=='INTRO' and state['legacyVoicePlayCalls']==0 and state['voicePaused'] and not state['gameRunning'],state
        return state
    result['warrior_after_previous_silvertail']=check_nemesis(0)
    page.wait_for_timeout(1200)
    page.screenshot(path=str(O/'nemesis_restored.png'))
    # INTRO keeps the existing per-line advance contract: first press reveals typing, second advances.
    before=page.evaluate('_cutLineIdx')
    page.evaluate('_cutWaitInput=true;_cutsceneAdvance()')
    assert page.evaluate('_cutLineIdx')==before+1
    result['nemesis_partial_skip']=True
    page.evaluate('_cutsceneEnd()')
    page.wait_for_function("G._cutsceneDone && _cutsceneState===null",timeout=10000)
    page.evaluate('dbSave()')
    assert saved.get('charIdx')==0 and saved.get('game',{}).get('cutsceneDone') is True,saved
    result['saved_identity_after_intro']=0
    page.goto(result['skip_destination'].replace('&story=warrior-v21',''),wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof G!=='undefined' && G.on && G._cutsceneDone && _cutsceneState===null",timeout=60000)
    result['completed_character_does_not_repeat_nemesis']=True
    print('PASS warrior creation, Nemesis, save and completed-character re-entry',flush=True)
    # New server metadata must win over both the previous global selection and a stale local slot.
    accept_writes=False
    saved.clear();saved.update({'charIdx':1})
    page.evaluate("localStorage.setItem('_charIdx','0');localStorage.setItem('hellsave_검증전사',JSON.stringify({charIdx:0}))")
    page.goto(result['skip_destination'].replace('&story=warrior-v21',''),wait_until='domcontentloaded',timeout=60000)
    result['silvertail_after_previous_warrior']=check_nemesis(1)
    # If the API is unavailable, the slot's metadata in localStorage still determines the character.
    load_mode='failure'
    page.evaluate("localStorage.setItem('_charIdx','1');localStorage.setItem('hellsave_검증전사',JSON.stringify({charIdx:0}))")
    page.goto(result['skip_destination'].replace('&story=warrior-v21',''),wait_until='domcontentloaded',timeout=60000)
    result['metadata_local_fallback']=check_nemesis(0)
    assert not errors,errors
    (O/'qa.json').write_bytes(json.dumps(result,ensure_ascii=False,indent=2).encode('utf-8'))
    print(json.dumps(result,ensure_ascii=False),flush=True)
    browser.close()
