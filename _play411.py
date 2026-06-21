from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto("http://localhost:3333/game.html?slot=411", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    pg.wait_for_timeout(12000)
    info=pg.evaluate("""()=>{
      let r={};
      r.lv=(typeof P!=='undefined'&&P)?P.lv:'no-P';
      r.gon=(typeof G!=='undefined')?G.on:'n/a';
      r.stage=(typeof G!=='undefined')?G.stage:'n/a';
      r.rage=(typeof P!=='undefined'&&P)?P.rage:'n/a';
      r.maxRage=(typeof P!=='undefined'&&P)?(P.maxRage||P.rageMax||'?'):'n/a';
      if(typeof P!=='undefined'&&P&&typeof G!=='undefined'&&G.cam){
        r.px=Math.round(P.x); r.py=Math.round(P.y);
        r.camx=Math.round(G.cam.x); r.camy=Math.round(G.cam.y);
        r.dx=Math.round(P.x-G.cam.x); r.dy=Math.round(P.y-G.cam.y);
      }
      return r;
    }""")
    print("=== slot=411 after 12s ===")
    for k,v in info.items(): print(f"  {k}: {v}")
    pg.screenshot(path="G:/hell/_play411.png")
    print("saved _play411.png")
    b.close()
