"""Isolated browser: production revival resolution, retry, act cues and real input combat."""
import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('captures/druid_finale_v04');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1600,'height':900})
    errors=[];missing=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status==404 else None)
    page.goto('http://127.0.0.1:3333/game.html?demo&bosstest=3',wait_until='networkidle')
    page.wait_for_function('typeof G!=="undefined"&&G._bossArena&&findBoss()&&document.getElementById("_btPanel")',timeout=60000)
    page.wait_for_timeout(6000)
    page.evaluate('''()=>{G.paused=true;document.getElementById('_btPanel').style.display='none';
      window._btGod=false;P=mkP();P.lv=30;STATS={str:0,dex:0,int:0,vit:0,lck:0};
      PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);UPGRADES={hp:0,atk:0,def:0,mp:0,st:0,spd:0};_grit=0;
      for(const sl in INV.equipped)INV.equipped[sl]=null;
      const rand=Math.random;let seed=909;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      try{for(const it of defaultItems())INV.equipped[it.slot]=mkItem(it.slot,0,EL.P,1,it.wtype);}finally{Math.random=rand;}
      _eqAffixCache=null;_eqStatCache=null;recalcSt();applyStats();_refillRespawnResources();
      _enterBossArena(true);G.paused=true;P.exp=1000;
      window._qaBackup=_preArenaBackup;window._qaOldBoss=findBoss();
    }''')
    # Click the actual retry UI: one EXP penalty, fresh boss, correct resources, same field backup.
    page.evaluate("G.on=false;P.s='dead';P.hp=0;P.mp=0;P.st=0;_harpGauge=0;BGM.play('death');document.getElementById('death').classList.add('on')")
    page.locator('#retryBtn').click()
    retry=page.evaluate('''()=>{G.paused=true;const e=findBoss();return {exp:P.exp,full:P.hp===P.mhp&&P.mp===P.mmp&&P.st===P.mst&&P.shield===P.mshield&&_harpGauge===_HARP_GAUGE_MAX,
      fresh:e!==_qaOldBoss,backup:_preArenaBackup===_qaBackup,arena:G._bossArena,dist:Math.hypot(P.x-e.x,P.y-e.y),hp:e.mhp,pts:e._revPts,retry:e._druidRetry,music:BGM._curKey};}''')
    assert retry['exp']==700 and retry['full'] and retry['fresh'] and retry['backup'] and retry['arena'] and retry['retry'],retry
    assert 450<=retry['dist']<=550,retry
    assert retry['music']=='boss',retry
    page.evaluate('G.paused=false')
    page.wait_for_timeout(250)
    intro=page.evaluate('({maxT:_bossCine.maxT,fill:_bossCine._introFill})')
    assert intro['maxT']==60 and intro['fill']==1,intro
    page.screenshot(path=str(out/'retry.png'))
    print('RETRY',retry,intro,flush=True)
    # Exercise the actual lethal hit + countdown. Control the RNG, not revival state.
    page.evaluate('''()=>{G.paused=true;const e=findBoss();window._qaBoss=e;
      P.iframes=99999;e.hp=e.mhp*.1;e.eShield=0;e.reviveIframes=0;e._bossRevJudged=false;
      const rand=Math.random;Math.random=()=>0;
      try{hurtE(e,e.mhp*100,0,false,{noPoise:true},EL.P);}finally{Math.random=rand;}
      G.paused=false;
    }''')
    pending=page.evaluate('({alive:_qaBoss.alive,timer:_qaBoss._reviveTimer,chance:_qaBoss._bossRevChance,roll:_qaBoss._bossRevRoll})')
    assert not pending['alive'] and pending['timer']>0 and pending['roll']==0,pending
    page.wait_for_function('_qaBoss.alive&&_qaBoss._druidLastStand',timeout=15000)
    stand=page.evaluate('''()=>{G.paused=true;return {hp:_qaBoss.hp/_qaBoss.mhp,pts:_qaBoss._revPts,phase:_qaBoss._bossPhase,alive:_qaBoss.alive,r:_qaBoss.r,deaths:_qaBoss.deaths};}''')
    assert .349<=stand['hp']<=.351 and stand['pts']==0 and stand['phase']==3 and stand['r']==44,stand
    page.evaluate('G._druidActCue.t=25;draw()')
    page.screenshot(path=str(out/'last_stand.png'))
    page.evaluate('''()=>{const e=_qaBoss;e.hp=e.mhp*.1;e.reviveIframes=0;e._hitStun=0;hurtE(e,e.mhp*100,0,false,{noPoise:true},EL.P);G.paused=false;}''')
    page.wait_for_function('G._druidVictory&&G._druidVictory.t>=30',timeout=15000)
    victory=page.evaluate('({deaths:_qaBoss.deaths,alive:_qaBoss.alive,bossAlive:G.bossAlive,music:BGM._curKey})')
    assert victory['deaths']==2 and not victory['alive'] and not victory['bossAlive'] and victory['music']=='victory',victory
    print('LAST STAND',pending,stand,victory,flush=True)
    # Reproduce act cues with the actual phase transition, and inspect the associated BGM.
    page.evaluate('_enterBossArena(true);_refillRespawnResources();P.iframes=99999;G.paused=false')
    acts=[]
    for phase,hp in [(2,.59),(4,.19)]:
        page.evaluate('''hp=>{const e=findBoss();e.hp=e.mhp*hp;e.eShield=0;e.reviveIframes=0;_bossPhaseCheck(e,1);}''',hp)
        page.wait_for_timeout(400)
        state=page.evaluate('''()=>{G.paused=true;const e=findBoss();return {phase:e._bossPhase,atk:e.atk,base:e._druidBaseAtk,music:BGM._curKey,cue:G._druidActCue.act,title:document.getElementById('bossName').textContent};}''')
        assert state['phase']==phase,state
        assert state['atk']==int(state['base']*(1.6 if phase==4 else 1.25)),state
        assert state['music']==('finalboss' if phase==4 else 'boss'),state
        page.screenshot(path=str(out/f'act_{phase}.png'));acts.append(state)
        page.evaluate('G.paused=false')
    # One real-input attempt with no god mode, injected damage, healing or boss pinning.
    start=page.evaluate('''()=>{P.lv=30;recalcSt();applyStats();_enterBossArena(true);_refillRespawnResources();P.iframes=90;_bossCine.active=false;G.paused=false;G.on=true;
      window._qaBoss=findBoss();return {hp:P.mhp,mp:P.mmp,st:P.mst,lv:P.lv,bossHp:_qaBoss.mhp,shield:_qaBoss.eShield,antiRevive:_eqAffix('antiRevive')};}''')
    held=set();trace=[];began=time.monotonic();next_trace=0;last_dodge=0
    while time.monotonic()-began<180:
        s=page.evaluate('''()=>{const e=_qaBoss,z=G._camZoom||1;return {on:G.on,won:!!G._druidVictory,hp:P.hp,mhp:P.mhp,mp:P.mp,st:P.st,px:P.x,py:P.y,
          ex:e.x,ey:e.y,r:e.r,alive:e.alive,bhp:e.hp,shield:e.eShield,phase:e._bossPhase,state:e.s,deaths:e.deaths,
          tx:VW/2+(e.x-G.cam.x)*z,ty:VH/2+(e.y-G.cam.y)*z,under:e._druidTargetLocked,gauge:_harpGauge};}''')
        now=time.monotonic()-began
        if now>=next_trace:trace.append({'t':round(now,2),**s});next_trace+=5
        if not s['on'] or s['won']:break
        page.mouse.move(max(1,min(1599,s['tx'])),max(1,min(899,s['ty'])))
        dx=s['ex']-s['px'];dy=s['ey']-s['py'];distance=(dx*dx+dy*dy)**.5
        desired=set()
        danger=s['state'] in ('bossChargeWind','bossCharge','bossDruidUnder','bossDruidErupt')
        volley=s['state'] in ('bossDruidVolleyWind','bossDruidVolley')
        if volley:desired.add('q')
        if danger:
            # Move perpendicular to the charge / burrow line, using the normal dodge input.
            direction='d' if dy>=0 else 'a'
            if now-last_dodge>1.4:
                for k in held:page.keyboard.up(k)
                held=set();page.keyboard.press(direction);page.wait_for_timeout(70)
                last_dodge=now
            desired.add(direction)
        elif distance>115 and s['alive']:
            if abs(dx)>45:desired.add('d' if dx>0 else 'a')
            if abs(dy)>45:desired.add('s' if dy>0 else 'w')
        for k in held-desired:page.keyboard.up(k)
        for k in desired-held:page.keyboard.down(k)
        held=desired
        if s['alive'] and not volley and not danger:page.mouse.down()
        else:page.mouse.up()
        page.wait_for_timeout(80)
    for k in held:page.keyboard.up(k)
    page.mouse.up()
    attempt={'seconds':round(time.monotonic()-began,2),'start':start,'end':s,'trace':trace,
      'method':'Lv30 T0 magic gear, seed909, default skills, no passive/upgrade investment. Actual mouse/WASD/Q/double tap; no god mode, healing, damage injection or boss pinning during this attempt. Automated policy is not a human playtest.'}
    page.screenshot(path=str(out/'attempt_end.png'))
    report={'retry':retry,'intro':intro,'pending':pending,'lastStand':stand,'victory':victory,'acts':acts,'attempt':attempt,'errors':errors,'missing':missing}
    (out/'pacing.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
    print('ATTEMPT',attempt['seconds'],s,flush=True)
    assert not errors and not missing,(errors,missing)
    browser.close()
