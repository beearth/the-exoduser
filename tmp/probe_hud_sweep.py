from playwright.sync_api import sync_playwright
import json, sys, collections
PORT = sys.argv[1] if len(sys.argv)>1 else '3333'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; console=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.on('console',lambda m: console.append((m.type,m.text)) if m.type in('error','warning') else None)
    page.goto(f'http://127.0.0.1:{PORT}/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        if page.evaluate("()=>G.on"): on=True; break

    def stat_sanity(tag):
        return page.evaluate("""(tag)=>{
          const bad=[]; const chk=(n,v)=>{ if(typeof v!=='number'||!isFinite(v)) bad.push(n+'='+v); };
          chk('hp',P.hp);chk('mhp',P.mhp);chk('mp',P.mp);chk('mmp',P.mmp);chk('st',P.st);chk('mst',P.mst);
          chk('lv',P.lv);chk('exp',P.exp);chk('atk',P.baseAtk);
          // HUD DOM values (if present)
          const hud={};
          for(const id of ['hpText','mpText','stText','lvText','fps']){ const e=document.getElementById(id); if(e) hud[id]=(e.textContent||'').slice(0,20); }
          return {tag, bad, hp:P.hp|0, mhp:P.mhp|0, mp:P.mp|0, lv:P.lv, hud};
        }""",tag)

    snaps=[stat_sanity('spawn')]
    # move
    for k in ['KeyD','KeyW','KeyA','KeyS']:
        page.keyboard.down(k); page.wait_for_timeout(200); page.keyboard.up(k)
    # attacks + skills
    page.mouse.move(900,360); page.mouse.down(button='left'); page.wait_for_timeout(400); page.mouse.up(button='left')
    page.mouse.down(button='right'); page.wait_for_timeout(400); page.mouse.up(button='right')
    for k in ['Digit1','Digit2','Digit3','Digit4','KeyE','KeyQ','KeyF','Space','ShiftLeft','KeyZ','KeyX']:
        page.keyboard.press(k); page.wait_for_timeout(200)
    snaps.append(stat_sanity('after_skills'))
    # transitions x3
    trans=[]
    for si in [1,2,3,0,4]:
        r=page.evaluate("""(si)=>{try{G.stage=si;initStage(si);buildMapCache();return{si,ok:true};}catch(e){return{si,ok:false,e:String(e)};}}""",si)
        page.wait_for_timeout(400); trans.append(r)
    snaps.append(stat_sanity('after_trans'))
    # open settings + close (UI regression)
    settingsOpen = page.evaluate("""()=>{ try{ if(typeof openSettings==='function'){openSettings();return 'openSettings';} const b=document.getElementById('optAutoPot'); return b?'panel-exists':'no-panel'; }catch(e){return 'err:'+e;} }""")

    cat=collections.Counter([t for t,_ in console])
    interesting=[]
    seen=set()
    for typ,txt in console:
        if typ=='error':
            k=txt[:100]
            if k in seen: continue
            seen.add(k)
            if not any(s in txt for s in ['404','Failed to load resource','net::ERR','favicon']):
                interesting.append(txt[:200])

    print('==== HUD SWEEP (port '+PORT+') ====')
    print(json.dumps({'reached_gameplay':on,'snaps':snaps,'transitions':trans,'settings':settingsOpen,
      'console_counts':dict(cat),'interesting_errors':interesting[:20],'pageerrors':errs[:10]}, indent=2, ensure_ascii=False))
    browser.close()
