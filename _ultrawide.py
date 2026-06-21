from playwright.sync_api import sync_playwright

def run(b, W, H, tag):
    pg=b.new_context(viewport={"width":W,"height":H},device_scale_factor=1.25).new_page()
    pg.goto("http://localhost:3333/game.html?testchar=1&stage=1", wait_until="domcontentloaded")
    try: pg.wait_for_load_state("networkidle", timeout=20000)
    except: pass
    for _ in range(30):
        pg.wait_for_timeout(1000)
        if pg.evaluate("(typeof G!=='undefined')?G.on:false"): break
    pg.evaluate("OPT.showFps=true")
    pg.wait_for_timeout(1000)
    info=pg.evaluate("""()=>{
      let r={inner:innerWidth+'x'+innerHeight, dpr:window.devicePixelRatio, _dpr:_dpr,
             canvas:C.width+'x'+C.height, resScale:OPT.resScale, gon:G.on};
      if(P&&G.cam){
        r.dx_from_cam=Math.round(P.x-G.cam.x);
        r.dy_from_cam=Math.round(P.y-G.cam.y);
        // FOV in world units = canvas backing width (engine renders at scale 1)
        r.fov_w=C.width; r.fov_h=C.height;
      }
      r.camZoom=G._camZoom; r.ez=(typeof _ez!=='undefined')?_ez:'n/a';
      return r;
    }""")
    print(f"=== {tag} ({W}x{H}) ===")
    for k,v in info.items(): print(f"  {k}: {v}")
    pg.screenshot(path=f"G:/hell/_uw_{tag}.png")
    return info

with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    run(b, 1280, 720, "16x9")
    run(b, 3440, 1440, "ultrawide")
    b.close()
print("done")
