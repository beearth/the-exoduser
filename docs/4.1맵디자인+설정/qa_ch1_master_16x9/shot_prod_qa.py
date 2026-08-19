"""In-game composition QA. Does not add assets."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

OUT = Path(r"G:\exoduser\docs\4.1맵디자인+설정\qa_ch1_master_16x9")
BASE = "http://127.0.0.1:3333/game.html"

def wait_ready(page):
    page.wait_for_function(
        "() => typeof G!=='undefined' && G && G.mw && G.on && typeof P!=='undefined' && P && P.x",
        timeout=90000,
    )
    page.wait_for_timeout(1800)

def meta(page):
    return page.evaluate("""() => {
      let ftAvg=0, ftN=0, ftMax=0;
      if(typeof _frameTimes!=='undefined'){
        for(let i=0;i<_frameTimes.length;i++){
          const v=_frameTimes[i]; if(v>0){ftAvg+=v;ftN++; if(v>ftMax)ftMax=v;}
        }
        if(ftN) ftAvg/=ftN;
      }
      return {
        mw:G.mw, mh:G.mh, T,
        world:[G.mw*T, G.mh*T],
        VW, VH, canvas:[C.width,C.height], window:[innerWidth,innerHeight],
        plate:G._plateSrc||null, native:!!G._plateNative,
        cam:{x:G.cam.x,y:G.cam.y}, player:{x:P.x,y:P.y,r:P.r},
        ens:(typeof ens!=='undefined'?ens.filter(e=>e&&e.alive).length:0),
        fps: typeof _fpsCur==='undefined'?null:_fpsCur,
        fpsMin: typeof _fpsMin==='undefined'?null:_fpsMin,
        ftAvg: Math.round(ftAvg*100)/100,
        ftMax: Math.round(ftMax*100)/100
      };
    }""")

def teleport(page, xf, yf):
    page.evaluate(
        """([xf,yf]) => {
          P.x=G.mw*T*xf; P.y=G.mh*T*yf;
          G.cam.x=P.x; G.cam.y=P.y; P.iframes=999;
        }""",
        [xf, yf],
    )
    page.wait_for_timeout(400)

def shot_suite(page, tag, out, extra_shots=True):
    teleport(page, 0.50, 0.52)
    page.wait_for_timeout(800)
    m = meta(page)
    page.screenshot(path=str(out / f"{tag}_center.png"), full_page=False)
    if extra_shots:
        teleport(page, 0.12, 0.50)
        page.screenshot(path=str(out / f"{tag}_west.png"), full_page=False)
        teleport(page, 0.88, 0.78)
        page.screenshot(path=str(out / f"{tag}_se_edge.png"), full_page=False)
        teleport(page, 0.50, 0.12)
        page.screenshot(path=str(out / f"{tag}_north.png"), full_page=False)
    return m

def run():
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # baseline FIELD_ONE 1920x1080
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(BASE + "?stage=0&plate=fieldone&slot=qaProd&nocache=1", wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        report["fieldone_1920"] = shot_suite(page, "cmp_fieldone_1920", OUT, extra_shots=False)
        page.close()

        # PROD 1920x1080
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(BASE + "?stage=0&slot=qaProd2&nocache=2", wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        report["prod_1920"] = shot_suite(page, "prod_1920", OUT, extra_shots=True)
        page.close()

        # PROD 3440x1440 ultrawide
        page = browser.new_page(viewport={"width": 3440, "height": 1440})
        page.goto(BASE + "?stage=0&slot=qaProd3&nocache=3", wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        teleport(page, 0.50, 0.52)
        page.wait_for_timeout(800)
        report["prod_3440"] = meta(page)
        page.screenshot(path=str(OUT / "prod_3440_center.png"), full_page=False)
        page.close()

        # PROD 5120x1440
        page = browser.new_page(viewport={"width": 5120, "height": 1440})
        page.goto(BASE + "?stage=0&slot=qaProd4&nocache=4", wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        teleport(page, 0.50, 0.52)
        page.wait_for_timeout(800)
        report["prod_5120"] = meta(page)
        page.screenshot(path=str(OUT / "prod_5120_center.png"), full_page=False)
        page.close()

        browser.close()
    (OUT / "ingame_prod_meta.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    run()
