from playwright.sync_api import sync_playwright
import json, sys
PORT = sys.argv[1] if len(sys.argv)>1 else '3333'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.goto(f'http://127.0.0.1:{PORT}/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        if page.evaluate("()=>G.on"): on=True; break

    # Drop items right next to the player, then run many update ticks. If pet auto-collects,
    # items get picked / pet enters 'fetch'. If removed, items stay on ground.
    res = page.evaluate("""() => {
      // ensure pets exist
      if(!G.pets) updatePet();
      // spawn 5 world items at player's feet
      if(typeof worldItems!=='undefined') worldItems.length=0;
      for(let i=0;i<5;i++){ const it=mkItem('boots',2,0,0); _wiPush({x:P.x+(i-2)*10,y:P.y+8,type:'item',item:it,picked:false}); }
      const before=worldItems.filter(w=>w.type==='item'&&!w.picked).length;
      // run update ticks (pets update inside update()/updatePet)
      let everFetch=false;
      for(let f=0;f<600;f++){
        try{ updatePet(); }catch(e){ return {error:String(e)}; }
        for(const k in G.pets){ if(G.pets[k].s==='fetch') everFetch=true; }
      }
      const afterUnpicked=worldItems.filter(w=>w.type==='item'&&!w.picked).length;
      const picked=worldItems.filter(w=>w.type==='item'&&w.picked).length;
      const petStates={}; for(const k in G.pets) petStates[k]=G.pets[k].s;
      return {itemsBefore:before, itemsStillOnGround:afterUnpicked, itemsPicked:picked, everEnteredFetch:everFetch, petStates};
    }""")

    # also report the player-facing strings that claim auto-collect
    strings = page.evaluate("""() => ({
      startScreen_hasAutoCollect: (typeof _T==='function')? (_T('(펫이 자동 수거)')!=='') : null,
    })""")

    print('==== PET COLLECT AUDIT (port '+PORT+') ====')
    print(json.dumps({'reached_gameplay':on,'runtime':res,'strings':strings,'pageerrors':errs}, indent=2, ensure_ascii=False))
    browser.close()
