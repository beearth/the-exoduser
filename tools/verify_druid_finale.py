import json
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('captures/druid_finale_20260908')
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1600,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?demo&test=1&testchar=1&stage=3&classic=1&bosstest=3',wait_until='networkidle')
    page.wait_for_function('typeof G!=="undefined" && G._bossArena && findBoss() && window._btActive',timeout=60000)
    print(json.dumps(page.evaluate('''() => {const e=findBoss();return {demo:_DEMO_MODE,stage:G.stage,finale:_isDruidFinale(e),s:e.s,hp:e.hp,atk:e.atk,player:{lv:P.lv,hp:P.hp,atk:P.atk},buttons:[...document.querySelectorAll('button')].filter(x=>x.offsetParent).map(x=>({text:x.innerText,id:x.id})).slice(-30)}}'''),ensure_ascii=False))
    page.screenshot(path=str(out/'initial.png'))
    result=page.evaluate('''() => {
      const e=findBoss();window._btGod=true;G.paused=false;
      e.hp=e.mhp;e._bossPhase=0;e._btFrozen=false;e.s='idle';e.bossPatT=0;e.reviveIframes=0;e._spawnT=0;
      P.x=e.x+250;P.y=e.y+200;P.iframes=999999;
      window._finaleTrace=[];window._finaleLast='';
      window._finaleTimer=setInterval(()=>{
        const b=findBoss();if(!b)return;
        const key=b.s+':'+b._bossPhase;
        if(key!==window._finaleLast){window._finaleTrace.push({t:performance.now(),s:b.s,phase:b._bossPhase,st:b.st2,step:b._druidStep,d:Math.hypot(P.x-b.x,P.y-b.y),orbs:(G._druidOrbs||[]).length});window._finaleLast=key;}
      },30);
      return {x:e.x,y:e.y};
    }''')
    page.wait_for_timeout(12000)
    page.screenshot(path=str(out/'act1.png'))
    print('TRACE1',json.dumps(page.evaluate('window._finaleTrace'),ensure_ascii=False))
    page.evaluate('''() => {const e=findBoss();e.hp=e.mhp*.59;P.x=e.x+260;P.y=e.y+150;}''')
    page.wait_for_timeout(16000)
    page.screenshot(path=str(out/'act2.png'))
    page.evaluate('''() => {const e=findBoss();e.hp=e.mhp*.19;P.x=e.x+260;P.y=e.y+150;}''')
    page.wait_for_timeout(16000)
    page.screenshot(path=str(out/'act3.png'))
    trace=page.evaluate('window._finaleTrace')
    assert {0,2,4}.issubset({x['phase'] for x in trace}),trace
    assert {'bossDruidVolleyWind','bossCharge','bossDruidUnder','bossDruidErupt','bossDruidRest'}.issubset({x['s'] for x in trace}),trace
    assert all(x['orbs']==0 for x in trace),trace
    assert not errors,errors
    print('PASS: three acts, signature moves, recovery, ORB=0, pageerrors=0; transitions=',len(trace))
    (out/'trace.json').write_text(json.dumps({'trace':trace,'errors':errors},ensure_ascii=False,indent=2),encoding='utf8')
    browser.close()
