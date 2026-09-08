"""Local browser QA. Requires server.cjs on 3333; uses isolated browser storage."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
out=root/'captures/druid_finale_20260909';out.mkdir(parents=True,exist_ok=True)
source=(root/'game.html').read_text(encoding='utf8')
camera=source[source.index('  // [CAMERA] look-ahead'):source.index('  // [TORCH] 반경 업데이트')]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1280,'height':720})
    errors=[];missing=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status==404 else None)
    page.goto('http://127.0.0.1:3333/game.html?demo&bosstest=3',wait_until='networkidle')
    page.wait_for_function('typeof G!=="undefined"&&G._bossArena&&findBoss()&&document.getElementById("_btPanel")',timeout=60000)
    page.wait_for_timeout(6000)
    page.evaluate('''code=>{G.paused=true;G.shake=0;G.slowMo=0;_dtSp=1;_bossCine.active=false;
      document.getElementById('_btPanel').style.display='none';
      _petBubble.t=0;document.getElementById('petSubtitle').style.opacity=0;
      G._worms=[];G._lavaPools=[];G._druidOrbs=[];projs.length=0;
      window._qaCamera=new Function('sp',code);
    }''',camera)
    cases=[]
    for w,h in [(1280,720),(1600,900),(1920,1080)]:
        page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(100)
        for name,dx,dy in [('south',0,400),('west',-400,0),('north',0,-400),('east',400,0)]:
            result=page.evaluate('''([dx,dy])=>{
              const e=findBoss();e.x=G.mw*T/2;e.y=G.mh*T/2;e.r=44;e.s='idle';e.facing=Math.atan2(dy,dx);
              e._spawnT=0;e._teleDropY=0;e.reviveIframes=0;e._druidTargetLocked=false;P.x=e.x+dx;P.y=e.y+dy;P.vx=P.vy=0;P.iframes=0;
              G.cam.x=P.x;G.cam.y=P.y;G._camZoom=.8;G._camLkX=G._camLkY=0;
              for(let i=0;i<240;i++)_qaCamera(1);draw();
              return {vw:VW,vh:VH,zoom:G._camZoom,head:VH/2+(e.y-24-e.r*14.1*.86-G.cam.y)*G._camZoom,
                playerFoot:VH/2+(P.y+80-G.cam.y)*G._camZoom,cam:{...G.cam}};
            }''',[dx,dy])
            assert result['head']>=89,result
            assert result['playerFoot']<=h-144,result
            cases.append({'position':name,**result})
            page.screenshot(path=str(out/f'camera_{w}_{name}.png'))
        print('CAMERA PASS',w,h,flush=True)
    # Real mouse events: inverse projection and actual aim helper agree with the target.
    pointer=page.evaluate('''()=>{const e=findBoss(),z=G._camZoom;return {x:VW/2+(e.x-G.cam.x)*z,y:VH/2+(e.y-G.cam.y)*z};}''')
    page.mouse.move(pointer['x'],pointer['y'])
    aim=page.evaluate('''()=>{const e=findBoss();return {worldError:Math.hypot(mouse.x-VW/2+G.cam.x-e.x,mouse.y-VH/2+G.cam.y-e.y),angleError:Math.abs(_aimDir()-Math.atan2(e.y-P.y,e.x-P.x))};}''')
    assert aim['worldError']<2 and aim['angleError']<.01,aim
    # Actual movement input under slow: double-tap D uses the starter bladeDash skill.
    dodge_before=page.evaluate('''()=>{const e=findBoss();window._qaUnderBoss=e;window._btGod=false;
      window._qaHits=[];window._qaHurtP=hurtP;hurtP=function(d,...args){_qaHits.push({d,args,state:P.s,boss:e.s,dist:Math.hypot(P.x-e._diveTx,P.y-e._diveTy),stack:new Error().stack});return _qaHurtP(d,...args);};
      P=mkP();applyStats();P.shield=P.mshield;_xbowEquipped=false;G._irisOff=true;OPT.bladeAuto=false;
      projs.length=0;G._lavaPools=[];G._worms=[];P.x=e.x+250;P.y=e.y+150;P.hp=P.mhp;P.iframes=0;P.s='idle';P.kb={x:0,y:0};
      P._freezeSlow=90;P.mp=P.mmp;P.skills.bladeDash=1;_harpGauge=_HARP_GAUGE_MAX;
      e.reviveIframes=0;e.stunned=0;e._hitStun=0;e.s='bossDruidUnder';e.st2=23;e._underMax=45;e._eruptMax=40;e._eruptHit=false;
      e._teleOx=e.x;e._teleOy=e.y;
      e._diveTx=P.x;e._diveTy=P.y;e._druidTargetLocked=true;e._druidRest=96;G.paused=false;
      return {hp:P.hp,x:P.x,y:P.y,bossHp:e.hp,bossShield:e.eShield};
    }''')
    page.keyboard.press('d');page.wait_for_timeout(70);page.keyboard.down('d');page.wait_for_timeout(500);page.keyboard.up('d');page.wait_for_timeout(650)
    dodge=page.evaluate('''before=>{G.paused=true;hurtP=_qaHurtP;return {hpLost:before.hp-P.hp,moved:Math.hypot(P.x-before.x,P.y-before.y),state:_qaUnderBoss.s,gauge:_harpGauge,hits:_qaHits,before,bossHp:_qaUnderBoss.hp,bossAlive:_qaUnderBoss.alive};}''',dodge_before)
    print('SLOWED DODGE',dodge,flush=True)
    assert dodge['hpLost']==0 and dodge['moved']>164 and dodge['bossAlive'] and dodge['state']=='bossDruidRest',dodge
    # Observe the real final-death -> revival wait -> room clear -> victory -> ending path.
    page.evaluate('''()=>{const e=findBoss();G.paused=false;window._btGod=false;e._btFrozen=false;
      e._revPts=0;e._bossRevJudged=false;e.hp=e.mhp*.1;e.eShield=0;e.reviveIframes=0;e._hitStun=0;e.stunned=0;P.iframes=99999;
      hurtE(e,e.mhp*100,0,false,{noPoise:true},EL.P);
    }''')
    pending=page.evaluate('({pending:G._druidFinaleBoss._reviveTimer,victory:!!G._druidVictory})')
    assert pending['pending']>0 and not pending['victory'],pending
    page.wait_for_function('G._druidVictory&&G._druidVictory.t>=40',timeout=15000)
    page.evaluate('G.paused=true;draw()')
    page.screenshot(path=str(out/'victory.png'))
    victory=page.evaluate('({music:BGM._curKey,pools:G._lavaPools.length,hostile:projs.filter(p=>p._druidPoison&&!p.friendly).length,bossAlive:G.bossAlive})')
    assert victory=={'music':'victory','pools':0,'hostile':0,'bossAlive':False},victory
    page.evaluate('''()=>{G.paused=false;const ex=G.exits[0];P.x=(ex.x+.5)*T;P.y=(ex.y+.5)*T;P.kb={x:0,y:0};P.s='idle';}''')
    page.wait_for_function('G.stageCleared',timeout=12000)
    page.locator('#nextBtn').click();page.wait_for_function('document.getElementById("demoEnd").style.display==="flex"')
    page.screenshot(path=str(out/'ending.png'))
    report={'camera':cases,'aim':aim,'slowedDodge':dodge,'pending':pending,'victory':victory,'ending':True,'errors':errors,'missing':missing}
    (out/'presentation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    assert not errors and not missing,(errors,missing)
    print('PASS: 12 camera cases, real mouse aim, final victory and demo ending; errors/404=0',flush=True)
    browser.close()
