import json
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
OUT=R/'output/audio/bisqo_magic_hit_20260910/outgoing_qa.json'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=outgoing-sound-qa',wait_until='domcontentloaded')
    page.mouse.click(400,300)
    page.wait_for_function("typeof _audioBuffers!=='undefined'&&_audioBuffers.bullet_hit&&_audioBuffers.bean_hit&&_audioBuffers.player_projectile_impact",timeout=60000)
    result=page.evaluate('''async()=>{
      await actx().resume();BGM.stop();G.on=false;
      _sfxQueue.length=0;
      const keys=['bullet_hit','bean_hit'];const reference=_audioBuffers.player_projectile_impact.getChannelData(0);
      const played=[];const real=_playSampleNow;
      _playSampleNow=function(...args){const node=real(...args);if(keys.includes(args[0]))played.push({key:args[0],started:!!node,priority:_sfxPri(args[0]),volume:args[1]});return node;};
      const buffers=keys.map(key=>{const b=_audioBuffers[key],data=b.getChannelData(0);let same=data.length===reference.length;for(let i=0;same&&i<data.length;i++)same=data[i]===reference[i];return {key,url:_sampleFiles[key],duration:b.duration,sameAsPlayerImpact:same,priority:_sfxPri(key)};});
      playSampleAt('bullet_hit',.15,1,P.x,P.y);playSample('bean_hit',.1,1);_sfxFrameReset();
      return {buffers,played,audioState:actx().state};
    }''')
    assert all(b['sameAsPlayerImpact'] and b['priority']==1 and abs(b['duration']-.42)<.0001 for b in result['buffers']),result
    assert len(result['played'])==2 and all(n['started'] and n['priority']==1 for n in result['played']),result
    assert result['audioState']=='running' and not errors,(result,errors)
    OUT.write_bytes(json.dumps({'status':'PASS','runtime':result,'page_errors':errors,'real_save_writes':False},ensure_ascii=False,indent=2).encode('utf-8'))
    print(json.dumps(result,ensure_ascii=False));browser.close()
