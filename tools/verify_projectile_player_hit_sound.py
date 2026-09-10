import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[1]/'output/audio/projectile_player_hit_20260910'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=projectile-hit-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof _cutsceneState!=='undefined' && _cutsceneState==='INTRO_CUTSCENE'",timeout=60000)
    page.mouse.click(400,300)
    page.wait_for_function("_audioBuffers.player_projectile_impact",timeout=30000)
    result=page.evaluate('''() => {
      BGM.stop();_cutsceneState=null;G.on=false;G._cutsceneDone=true;
      _harpActive=false;_dashActive=false;_eqAffix=()=>0;_eqStat=()=>0;_lvB=()=>0;
      _isFocusState=()=>true;STATS.dex=0;P._sbParryT=0;P._ioActive=false;P._gwActive=false;
      P.s='idle';P.hp=1000;P.mhp=1000;P.shield=0;P.mshield=0;P.iframes=0;
      _sfxQueue.length=0;_projectileHitSfxAt=-Infinity;
      const played=[];const realPlay=_playSampleNow;
      _playSampleNow=function(...args){const node=realPlay(...args);if(args[0]==='player_projectile_impact')played.push({started:!!node,volume:args[1],rate:args[2],priority:_sfxPri(args[0])});return node;};
      const before=P.hp;
      _hurtProjectilePlayer({_druidPoison:false},10,{dtype:'magic',projHit:true});
      _sfxFrameReset();const after=P.hp;
      const accepted=played.length;
      P.iframes=10;_projectileHitSfxAt=-Infinity;
      _hurtProjectilePlayer({_druidPoison:false},10,{dtype:'magic',projHit:true});_sfxFrameReset();
      const immune=played.length;
      P.iframes=0;_projectileHitSfxAt=-Infinity;
      for(let i=0;i<8;i++)_hurtProjectilePlayer({_druidPoison:false},1,{dtype:'magic',projHit:true});
      _sfxFrameReset();
      return {before,after,accepted,immune,denseBurstSounds:played.length-immune,played,bufferDuration:_audioBuffers.player_projectile_impact.duration,sampleRate:actx().sampleRate,audioState:actx().state};
    }''')
    assert result['after']<result['before'] and result['accepted']==1 and result['immune']==1,result
    assert result['denseBurstSounds']==1 and all(h['started'] and h['priority']==8 for h in result['played']),result
    assert abs(result['bufferDuration']-.18)<=1/result['sampleRate'] and result['audioState']=='running' and not errors,result
    report={'status':'PASS','runtime':result,'page_errors':errors,'real_save_writes':False,'scope':'isolated real damage and Web Audio pipeline; combat modifiers neutralized for deterministic QA'}
    (OUT/'browser_qa.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    print(json.dumps(report),flush=True)
    browser.close()
