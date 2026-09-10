"""Measure one real double-tap through the running game update loop; no save writes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def api(route):
        if '/api/load/' in route.request.url:route.fulfill(json={'ok':True,'data':{'charIdx':0}})
        elif route.request.method!='GET':route.fulfill(json={'ok':True})
        else:route.continue_()
    page.route('**/api/**',api)
    page.goto('http://127.0.0.1:3333/game.html?test=1&slot=blade-dash-distance-qa',wait_until='domcontentloaded',timeout=60000)
    page.wait_for_function("typeof P!=='undefined'&&P&&G.map&&typeof _tickBladeDash==='function'",timeout=60000)
    page.mouse.click(500,350)
    key=page.evaluate('''()=>{
      window._btFramePause=false;_cutsceneState=null;_cutC.style.display='none';G._intro=false;
      G._cutsceneDone=true;G.on=true;G.paused=false;G._bonfire=null;BGM.stop();
      for(const id of ['intro','introDiff','introKeys','tutorial','loading','bootLoading']){const el=document.getElementById(id);if(el)el.style.display='none';}
      P.hp=P.mhp;P.s='idle';P.skills.bladeDash=1;P.mp=P.mmp;_harpGauge=_HARP_GAUGE_MAX;
      ens.length=0;projs.length=0;pProjs.length=0;G.spawnHoles.length=0;G._fireZones=[];
      window.dashQA={activations:[],ticks:[],distance:0};
      const activate=activateBladeDash,tick=_tickBladeDash;
      activateBladeDash=function(dir){const mp=P.mp,gauge=_harpGauge;activate(dir);dashQA.activations.push({mpSpent:mp-P.mp,gaugeSpent:gauge-_harpGauge,moveTime:P._bdMoveT});};
      _tickBladeDash=function(sp){const x=P.x,y=P.y;tick(sp);const d=Math.hypot(P.x-x,P.y-y);dashQA.distance+=d;dashQA.ticks.push({sp,d,remaining:P._bdMoveT});};
      return BINDS.up;
    }''')
    # Deliver both taps inside 250ms even when software rendering stalls CDP calls.
    page.evaluate('''code=>{P._bdLastDir=-1;P._bdLastT=0;
      for(let i=0;i<2;i++){window.dispatchEvent(new KeyboardEvent('keydown',{code,key:'w',bubbles:true}));window.dispatchEvent(new KeyboardEvent('keyup',{code,key:'w',bubbles:true}));}
    }''',key)
    try:page.wait_for_function('dashQA.activations.length>0 && !(P._bdMoveT>0)',timeout=10000)
    except Exception:
        print(page.evaluate('({key:BINDS.up,paused:G.paused,on:G.on,state:P.s,hp:P.hp,mp:P.mp,gauge:_harpGauge,lastDir:P._bdLastDir,trigger:P._bdTrigger,qa:dashQA})'))
        raise
    page.wait_for_timeout(120)
    report=page.evaluate('({ ...dashQA, landings:(G._fireZones||[]).filter(z=>z.type==="shockField").length })')
    assert len(report['activations'])==1,report
    assert report['activations'][0]=={'mpSpent':7,'gaugeSpent':31.5,'moveTime':6},report
    assert abs(report['distance']-250)<1e-6,report
    assert report['landings']==1 and not errors,(report,errors)
    report.update(status='PASS',page_errors=errors,real_save_writes=False)
    out=ROOT/'output/qa/blade_dash_distance_20260910.json';out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report));browser.close()
