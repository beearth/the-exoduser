"""Verify actual cinematic media binding, audio decoding and synchronized seeks."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/cinematic/warrior_story_bgm_20260910'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    # Minimal host, real project player/media, no account or save access.
    page.route('**/bgm-qa-host',lambda r:r.fulfill(content_type='text/html',body='<button id="start">Start</button><script src="/character-story-player.js"></script><script>start.onclick=()=>ExoduserCharacterStory.play();</script>'))
    page.goto('http://127.0.0.1:3333/bgm-qa-host')
    page.locator('#start').click()
    page.wait_for_function("characterStoryVideo.currentTime>.3",timeout=30000)
    state=page.evaluate("({src:characterStoryVideo.currentSrc,duration:characterStoryVideo.duration,muted:characterStoryVideo.muted,volume:characterStoryVideo.volume,audioBytes:characterStoryVideo.webkitAudioDecodedByteCount,controls:characterStoryVideo.controls})")
    assert 'warrior_story_v22_bgm.mp4' in state['src'],state
    assert state['duration']==96.4 and not state['muted'] and state['volume']==1 and state['audioBytes']>0 and state['controls'] is False,state
    page.evaluate('characterStoryVideo.currentTime=88.5')
    page.wait_for_function('!characterStoryVideo.seeking')
    page.keyboard.press('Enter')
    page.wait_for_function('!characterStoryVideo.seeking && characterStoryVideo.currentTime>=90.33333333333333')
    at=page.evaluate('characterStoryVideo.currentTime');assert at<91,at
    page.screenshot(path=str(OUT/'runtime_ending.png'))
    page.keyboard.down('Escape')
    page.wait_for_function('!ExoduserCharacterStory.active',timeout=5000)
    page.keyboard.up('Escape')
    assert page.locator('video').count()==0 and not errors
    report={'status':'PASS','playback':state,'partial_skip_clock':at,'full_skip_released_media':True,'page_errors':errors,'save_access':False}
    (OUT/'browser_qa.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(report,ensure_ascii=False),flush=True)
    browser.close()
