import json
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('captures/druid_finale_20260908')
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1600,'height':900})
    errors=[];missing=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status==404 else None)
    page.goto('http://127.0.0.1:3333/game.html?demo&test=1&testchar=1&stage=3&classic=1&bosstest=3',wait_until='networkidle')
    page.wait_for_function('typeof G!=="undefined" && G._bossArena && findBoss() && document.getElementById("_btPanel")',timeout=60000)
    def snap(name):
        page.evaluate('draw()')
        page.screenshot(path=str(out/name))
    print('BOOT',page.evaluate('''() => ({stage:G.stage,finale:_isDruidFinale(findBoss()),skills:Object.keys(P.skills||{}),arrays:Object.keys(G).filter(k=>Array.isArray(G[k])&&G[k].length).map(k=>[k,G[k].length])})'''),flush=True)
    result=page.evaluate('''() => {
      G.paused=true;window._btGod=false;document.getElementById('_btPanel').style.display='none';
      const e=findBoss();ens=ens.filter(x=>x.ib);P.skills={};P.passives={};P.hp=P.mhp=9999;P.iframes=0;P.s='idle';P.kb={x:0,y:0};
      e._btFrozen=false;e._spawnT=0;e.stunned=0;e._hitStun=0;e.reviveIframes=0;e.iframes=0;e.hp=e.mhp;e._bossPhase=0;e.kb={x:0,y:0};
      projs.length=0;G._druidOrbs=[];G._lavaPools=[];G._worms=[];
      P.x=e.x+260;P.y=e.y+220;G.cam.x=(P.x+e.x)/2;G.cam.y=(P.y+e.y)/2;
      const shots=[];_druidFinaleVolley(e);for(const shot of projs)shots.push({poison:shot._druidPoison,parry:shot.parryClass,life:shot.life,r:shot.r,el:shot.el});
      return {shots};
    }''')
    assert len(result['shots'])==5 and all(s['parry']=='magic' and s['poison'] and s['life']==90 for s in result['shots']),result
    snap('volley.png')
    phase=page.evaluate('''() => {
      const e=findBoss();projs.length=0;const before={x:e.x,y:e.y,hp:P.hp};e.hp=e.mhp*.59;_bossPhaseCheck(e,1);
      return {stationary:before.x===e.x&&before.y===e.y,playerSafe:before.hp===P.hp,shots:projs.length,state:e.s,phase:e._bossPhase};
    }''')
    assert phase['stationary'] and phase['playerSafe'] and phase['shots']==0,phase
    page.evaluate('''() => {const e=findBoss();e.reviveIframes=0;e.s='idle';_bossStartPattern(e,BOSS_MOVES.find(m=>m.id==='charge'),300,2,0);}''')
    snap('charge_warning.png')
    charge=page.evaluate('''() => {
      const e=findBoss();e.st2=16;const angle=e.facing;P.x=e.x-300;P.y=e.y;updateE(e,1);
      return {locked:angle===e.facing,st:e.st2};
    }''')
    assert charge['locked'],charge
    page.evaluate('''() => {
      const e=findBoss();P.x=e.x+300;P.y=e.y+200;e.iframes=0;e.reviveIframes=0;e._hitStun=0;e.stunned=0;
      _bossStartPattern(e,BOSS_MOVES.find(m=>m.id==='burrowStrike'),350,2,0);
      e.s='bossDruidUnder';e.st2=23;e._underMax=45;e._diveTx=P.x;e._diveTy=P.y;
      updateE(e,1);window._lockedDruidPoint={x:e._diveTx,y:e._diveTy};
    }''')
    snap('burrow_locked.png')
    burrow=page.evaluate('''() => {
      const e=findBoss(),point=window._lockedDruidPoint;P.x=point.x+250;P.y=point.y;P.iframes=0;P.s='idle';
      const hp=P.hp;let locked=true;
      for(let i=0;i<100;i++){updateE(e,1);if(e._diveTx!==point.x||e._diveTy!==point.y)locked=false;if(e.s==='bossDruidRest')break;}
      return {locked,dodged:P.hp===hp,state:e.s,rest:e.st2,immune:e.iframes};
    }''')
    assert burrow['locked'] and burrow['dodged'] and burrow['state']=='bossDruidRest' and burrow['rest']==96,burrow
    punish=page.evaluate('''() => {
      const e=findBoss();
      const hp=e.hp,shield=e.eShield||0,immune=e.reviveIframes;hurtE(e,100,0,false,{noPoise:true},EL.P);
      return {damage:hp-e.hp,shieldDamage:shield-(e.eShield||0),immune,state:e.s};
    }''')
    assert punish['damage']+punish['shieldDamage']>0,punish
    page.evaluate('''() => {
      const e=findBoss();G._lavaPools=[];P.x=e.x+250;P.y=e.y+150;
      _bossStartPattern(e,BOSS_MOVES.find(m=>m.id==='lavaPools'),300,2,0);
      for(const lp of G._lavaPools)lp.t=110;
    }''')
    snap('poison_pools.png')
    # Real input: release the pause, use the normal Q key, and observe the player state.
    page.evaluate('''() => {const e=findBoss();e.s='idle';e._btFrozen=true;G.paused=false;G._lavaPools=[];P.s='idle';P.st=P.mst;P.iframes=0;}''')
    page.keyboard.down('q');page.wait_for_timeout(120)
    q=page.evaluate('({state:P.s,shield:P.shield,bank:P.parryBank||0})')
    page.keyboard.up('q');page.wait_for_timeout(100)
    # The read uses the actual player input path; only incoming projectile placement is controlled.
    page.evaluate('''() => {P.iframes=0;const e=findBoss();_spawnBossProjectile(e,{x:P.x,y:P.y,vx:1,vy:0,dmg:1,el:EL.F,fireMagic:true,sz:2,r:10,life:90,_druidParryVolley:true});}''')
    page.keyboard.down('q');page.wait_for_timeout(70);page.keyboard.up('q');page.wait_for_timeout(150)
    q_after=page.evaluate('({state:P.s,bank:P.parryBank||0,reflected:projs.filter(p=>p.friendly).length})')
    assert q['state']=='sBlock' and q_after['bank']>0 and q_after['reflected']>0,(q,q_after)
    death=page.evaluate('''() => {
      const e=findBoss();G.paused=false;e._btFrozen=false;e._revPts=0;e._bossRevJudged=false;
      e.hp=e.mhp*.1;e.eShield=0;e.reviveIframes=0;e._hitStun=0;e.stunned=0;P.iframes=9999;
      hurtE(e,e.mhp*100,0,false,{noPoise:true},EL.P);
      return {alive:e.alive,hp:e.hp,pending:e._reviveTimer||0,bossAlive:G.bossAlive};
    }''')
    page.wait_for_function('!G.bossAlive',timeout=12000)
    page.evaluate('''() => {const ex=G.exits[0];P.x=(ex.x+.5)*T;P.y=(ex.y+.5)*T;P.kb={x:0,y:0};P.s='idle';}''')
    page.wait_for_function('G.stageCleared',timeout=12000)
    page.locator('#nextBtn').click()
    page.wait_for_function('document.getElementById("demoEnd").style.display==="flex"')
    snap('demo_end.png')
    report={'projectiles':result,'phase':phase,'charge':charge,'burrow':burrow,'punish':punish,'qInput':q,'qAfter':q_after,'death':death,'demoEnd':True,'pageerrors':errors,'missing':missing}
    (out/'controls.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps(report,ensure_ascii=False),flush=True)
    assert not errors,errors
    browser.close()
