from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto("http://localhost:3333/game.html?testchar=1&stage=1", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    # wait for G.on=true (gameplay)
    for _ in range(30):
        pg.wait_for_timeout(1000)
        gon=pg.evaluate("(typeof G!=='undefined')?G.on:false")
        if gon: break
    pg.evaluate("OPT.showFps=true")  # force FPS on
    pg.wait_for_timeout(1500)
    info=pg.evaluate("""()=>{
      let r={gon:G.on, stage:G.stage, lv:(P?P.lv:'no-P'), showFps:OPT.showFps};
      if(P&&G.cam){
        r.px=Math.round(P.x);r.py=Math.round(P.y);
        r.camx=Math.round(G.cam.x);r.camy=Math.round(G.cam.y);
        // player screen pos relative to canvas center
        r.dx_from_cam=Math.round(P.x-G.cam.x);
        r.dy_from_cam=Math.round(P.y-G.cam.y);
        r.canvasW=C.width;r.canvasH=C.height;
      }
      r.fpsCur=(typeof _fpsCur!=='undefined')?_fpsCur:'n/a';
      return r;
    }""")
    print("=== testchar stage1, FPS forced ===")
    for k,v in info.items(): print(f"  {k}: {v}")
    pg.screenshot(path="G:/hell/_finaltest.png")
    print("saved _finaltest.png")
    b.close()
