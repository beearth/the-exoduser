"""In-game camera screenshots. Does not modify game.html."""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(r"G:\exoduser\docs\4.1맵디자인+설정\qa_ch1_master_16x9")
URL = "http://127.0.0.1:3333/game.html?stage=0&slot=qa16x9&nocache=1"

def wait_ready(page):
    page.wait_for_function(
        "() => typeof G!=='undefined' && G && G.mw && G.on && typeof P!=='undefined' && P && P.x",
        timeout=90000,
    )
    page.wait_for_timeout(1500)

def info(page):
    return page.evaluate("""() => ({
      mw: G.mw, mh: G.mh, T: typeof T==='undefined'?null:T,
      VW, VH, cam: {x:G.cam.x,y:G.cam.y},
      player: {x:P.x,y:P.y},
      plate: G._plateSrc||null,
      kit: !!G._kitField, testbed: !!G._testbed,
      canvas: {w: C.width, h: C.height},
      window: {w: innerWidth, h: innerHeight}
    })""")

def teleport(page, xf, yf):
    page.evaluate(
        """([xf,yf]) => {
          P.x = G.mw*T*xf; P.y = G.mh*T*yf;
          G.cam.x = P.x; G.cam.y = P.y;
          P.iframes = 999;
        }""",
        [xf, yf],
    )
    page.wait_for_timeout(500)

def hide_hud(page, hide):
    page.evaluate(
        """(hide) => {
          ['hud','hudTop','hudCorner','mmWrap','skBar','mmLvl','globeHP','globeMP'].forEach(id=>{
            const e=document.getElementById(id); if(e) e.classList.toggle('on', !hide);
          });
        }""",
        hide,
    )
    page.wait_for_timeout(200)

def main(tag):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(URL, wait_until="domcontentloaded", timeout=60000)
        wait_ready(page)
        meta = info(page)
        (OUT / f"ingame_{tag}_meta.txt").write_text(str(meta), encoding="utf-8")
        print("META", meta)

        # real player view with HUD — start/south, then center
        teleport(page, 0.50, 0.82)
        page.screenshot(path=str(OUT / f"ingame_{tag}_south_hud.png"), full_page=False)
        teleport(page, 0.50, 0.52)
        page.screenshot(path=str(OUT / f"ingame_{tag}_center_hud.png"), full_page=False)

        hide_hud(page, True)
        teleport(page, 0.50, 0.52)
        page.screenshot(path=str(OUT / f"ingame_{tag}_center.png"), full_page=False)
        teleport(page, 0.78, 0.28)
        page.screenshot(path=str(OUT / f"ingame_{tag}_ne_shrine.png"), full_page=False)
        teleport(page, 0.22, 0.28)
        page.screenshot(path=str(OUT / f"ingame_{tag}_nw_bridge.png"), full_page=False)
        teleport(page, 0.78, 0.78)
        page.screenshot(path=str(OUT / f"ingame_{tag}_se_swamp.png"), full_page=False)
        teleport(page, 0.22, 0.78)
        page.screenshot(path=str(OUT / f"ingame_{tag}_sw_swamp.png"), full_page=False)
        hide_hud(page, False)
        browser.close()

if __name__ == "__main__":
    import sys
    main(sys.argv[1] if len(sys.argv) > 1 else "cur")
