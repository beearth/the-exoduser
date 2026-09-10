"""Check the real update loop and capture the existing level-up sound for the preview."""
import base64,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'output/vfx/level_up_gold_20260910'
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=level-up-live-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof P!=='undefined'&&P&&G.map&&typeof _levelUpVfx!=='undefined'",timeout=60000)
    page.mouse.click(500,350)
    page.evaluate('''()=>{
      window._btFramePause=false;_cutsceneState=null;_cutC.style.display='none';G._intro=false;
      G._cutsceneDone=true;G.on=true;G.paused=true;G._bonfire=null;BGM.stop();
      P.hp=P.mhp;P.s='idle';ens.length=0;projs.length=0;pProjs.length=0;
      G.spawnHoles.length=0;G._fireZones=[];_levelUpVfx.trigger(P,G.stage,1);
    }''')
    page.wait_for_timeout(250)
    paused=page.evaluate('({age:_levelUpVfx.age,active:_levelUpVfx.active})')
    assert paused=={'age':0,'active':True},paused
    page.evaluate('G.paused=false')
    page.wait_for_function('!_levelUpVfx.active',timeout=10000)
    live=page.evaluate('({age:_levelUpVfx.age,active:_levelUpVfx.active,hp:P.hp})')
    assert live['age']>=1.45 and live['hp']>0,live
    sound=page.evaluate('''async()=>{
      G.paused=true;OPT.sfxVol=60;await actx().resume();mbus();
      const dest=actx().createMediaStreamDestination();_comp.connect(dest);
      const chunks=[],rec=new MediaRecorder(dest.stream,{mimeType:'audio/webm;codecs=opus'});
      const done=new Promise(resolve=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};rec.onstop=resolve;});
      rec.start();SFX.levelup();await new Promise(r=>setTimeout(r,1800));rec.stop();await done;_comp.disconnect(dest);
      const data=new Uint8Array(await new Blob(chunks).arrayBuffer());let binary='';
      for(const b of data)binary+=String.fromCharCode(b);return btoa(binary);
    }''')
    (OUT/'existing_levelup_sound.webm').write_bytes(base64.b64decode(sound))
    assert not errors,errors
    report={'status':'PASS','paused':paused,'live_expiry':live,'page_errors':errors,'sound':'existing SFX.levelup, unchanged','real_save_writes':False}
    (OUT/'live_qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report));browser.close()
