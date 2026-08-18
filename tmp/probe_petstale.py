from playwright.sync_api import sync_playwright
import json, sys
PORT = sys.argv[1] if len(sys.argv)>1 else '3333'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; console=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.on('console',lambda m: console.append(m.text) if m.type=='error' else None)
    page.goto(f'http://127.0.0.1:{PORT}/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        if page.evaluate("()=>G.on"): on=True; break

    # 1. start-screen survival card body — no auto-collect claim
    card = page.evaluate("""() => {
      try{ const c=_INTRO_KEY_STEPS.find(s=>s.title==='생존'); const html=c.body();
        return {html_has_autocollect: /자동\\s*수거|auto-?collect/i.test(html), html_has_R_pickup: html.indexOf('아이템 줍기')>=0, snippet: html.replace(/<[^>]+>/g,' ').replace(/\\s+/g,' ').trim().slice(0,160)};
      }catch(e){ return {error:String(e)}; }
    }""")
    # 2. loading tips — no auto-collect, has new R tip
    tips = page.evaluate("""() => {
      const ko=(typeof _LOAD_TIPS!=='undefined')?_LOAD_TIPS:[]; const en=(typeof _LOAD_TIPS_EN!=='undefined')?_LOAD_TIPS_EN:[];
      const bad=[...ko,...en].filter(t=>/자동으로\\s*주워|auto-?collect/i.test(t));
      const koRtip=ko.find(t=>t.indexOf('R키로 아이템을 수거')>=0)||null;
      const enRtip=en.find(t=>t.indexOf('Press R to collect')>=0)||null;
      return {autocollect_tips:bad, ko_R_tip:koRtip, en_R_tip:enRtip};
    }""")
    # 3. pets still don't auto-collect (regression)
    petcol = page.evaluate("""() => {
      if(!G.pets) updatePet();
      if(typeof worldItems!=='undefined') worldItems.length=0;
      for(let i=0;i<5;i++){ const it=mkItem('boots',2,0,0); _wiPush({x:P.x+(i-2)*10,y:P.y+8,type:'item',item:it,picked:false}); }
      let everFetch=false;
      for(let f=0;f<600;f++){ updatePet(); for(const k in G.pets) if(G.pets[k].s==='fetch') everFetch=true; }
      const picked=worldItems.filter(w=>w.type==='item'&&w.picked).length;
      const ground=worldItems.filter(w=>w.type==='item'&&!w.picked).length;
      return {itemsPicked:picked, itemsOnGround:ground, everFetch};
    }""")

    # 4. R-key still collects items (drop 1 item at feet, press R, check picked)
    page.evaluate("""() => { if(typeof worldItems!=='undefined') worldItems.length=0; const it=mkItem('boots',2,0,0); _wiPush({x:P.x,y:P.y,type:'item',item:it,picked:false}); window.__rtest=worldItems[worldItems.length-1]; }""")
    page.keyboard.down('KeyR'); page.wait_for_timeout(500); page.keyboard.up('KeyR')
    page.wait_for_timeout(300)
    rkey = page.evaluate("""() => ({ picked: !!(window.__rtest && window.__rtest.picked) })""")

    # 5. transitions + errors
    trans = page.evaluate("""() => { let r=[]; for(const si of [1,2,3,0]){ try{G.stage=si;initStage(si);buildMapCache();r.push({si,ok:true});}catch(e){r.push({si,ok:false});} } return r; }""")

    print('==== PET-STALE VERIFY (port '+PORT+') ====')
    print(json.dumps({'reached_gameplay':on,'start_card':card,'loading_tips':tips,'pet_autocollect':petcol,'r_key_pickup':rkey,'transitions':trans,'pageerrors':errs,'console_errors':console[:8]}, indent=2, ensure_ascii=False))
    browser.close()
