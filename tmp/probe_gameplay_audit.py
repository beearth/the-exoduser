from playwright.sync_api import sync_playwright
import json, collections

# Gameplay audit: drive a real play session and capture ALL console errors / pageerrors /
# thrown exceptions across movement, skills, combat, enemy spawn, stage transition, boss.
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--js-flags=--expose-gc'])
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; console=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.on('console',lambda m: console.append((m.type,m.text)) if m.type in ('error','warning') else None)
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)

    # wait for gameplay
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        st=page.evaluate("()=>({on:G.on, useGL:_useGL, stage:G.stage})")
        if st['on']: on=True; break

    log=[]
    def snap(tag):
        s=page.evaluate("""(tag)=>{
          let err='';
          try{ return {tag, stage:G.stage, hp:(P&&P.hp)|0, mhp:(P&&P.mhp)|0, enemies:(typeof E!=='undefined'&&E?E.length:-1),
             lv:(P&&P.lv)|0, x:(P?P.x|0:0), y:(P?P.y|0:0), on:G.on, ename:(typeof E!=='undefined'&&E&&E[0]?E[0].etype:null)};
          }catch(e){ return {tag, error:String(e)}; }
        }""",tag); log.append(s); return s

    snap('spawn')
    # movement (WASD)
    for k in ['KeyD','KeyS','KeyA','KeyW']:
        page.keyboard.down(k); page.wait_for_timeout(300); page.keyboard.up(k)
    snap('after_move')

    # cast skills: number keys + mouse buttons + skill keys
    for k in ['Digit1','Digit2','Digit3','Digit4','KeyE','KeyQ','KeyR','KeyF','Space','ShiftLeft']:
        try:
            page.keyboard.press(k); page.wait_for_timeout(250)
        except Exception as e:
            log.append({'tag':'key_'+k,'error':str(e)})
    # mouse attacks
    page.mouse.move(900,360); page.mouse.down(button='left'); page.wait_for_timeout(400); page.mouse.up(button='left')
    page.mouse.down(button='right'); page.wait_for_timeout(400); page.mouse.up(button='right')
    snap('after_skills')

    # force-spawn enemies if a debug hook exists, else just let stage populate
    page.evaluate("""()=>{ try{ if(typeof spawnWave==='function') spawnWave(); }catch(e){} }""")
    page.wait_for_timeout(800)
    snap('after_combat')

    # stage transitions across several stages (real path)
    trans=[]
    for si in [1,2,3,4,5]:
        r=page.evaluate("""(si)=>{ try{ G.stage=si; initStage(si); buildMapCache(); return {stage:si, ok:true}; }
          catch(e){ return {stage:si, ok:false, error:String(e)}; } }""",si)
        page.wait_for_timeout(500); trans.append(r); snap('trans_'+str(si))

    # boss stage attempt (boss encounters usually at chapter ends)
    boss=page.evaluate("""()=>{ try{
      // try to find a boss stage index / trigger
      let info={bossVars:[]};
      for(const k of ['B','BOSS','_boss','curBoss','G.boss']){ try{ if(eval('typeof '+k)!=='undefined') info.bossVars.push(k);}catch(e){} }
      return info;
    }catch(e){return {error:String(e)}}}""")

    # categorize console
    cat=collections.Counter()
    uniq=collections.OrderedDict()
    for typ,txt in console:
        key=txt[:120]
        cat[typ]+=1
        if key not in uniq: uniq[key]=(typ,txt[:300])
    # filter likely-real errors (exclude asset 404 warns, GL swiftshader noise)
    interesting=[v for k,v in uniq.items() if v[0]=='error' and not any(s in v[1] for s in ['404','Failed to load resource','net::ERR'])]

    print('==== GAMEPLAY AUDIT ====')
    print(json.dumps({
      'reached_gameplay':on,
      'snapshots':log,
      'transitions':trans,
      'boss_probe':boss,
      'pageerrors':errs,
      'console_counts':dict(cat),
      'interesting_errors':interesting[:30],
    }, indent=2, ensure_ascii=False))
    browser.close()
