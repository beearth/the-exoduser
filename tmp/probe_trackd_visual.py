from playwright.sync_api import sync_playwright
import json

# Visual confirmation: reach live gameplay, verify map renders (non-black), screenshot,
# then do transitions and confirm still non-black + no GL error (no black-map/flicker).
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=['--js-flags=--expose-gc'])
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)

    # poll until gameplay is live and map built (max ~15s)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        st=page.evaluate("()=>({on:G.on, mapCvs:!!_mapCvs, useGL:_useGL, stream:_streamMap})")
        if st['on'] and (st['mapCvs'] or st['stream']):
            on=True; break

    def sanity():
        return page.evaluate("""() => {
          if(!_useGL||!GL) return {ok:'no-gl'};
          const w=C.width,h=C.height; let nz=0, samples=[];
          const pts=[[w*0.5,h*0.5],[w*0.3,h*0.4],[w*0.7,h*0.6],[w*0.5,h*0.3],[w*0.4,h*0.7]];
          for(const [x,y] of pts){const b=new Uint8Array(4);GL.readPixels(x|0,y|0,1,1,GL.RGBA,GL.UNSIGNED_BYTE,b);
            samples.push([b[0],b[1],b[2],b[3]]); if(b[0]+b[1]+b[2]>16)nz++;}
          return {nonBlack:nz, samples, glErr:GL.getError(), lost:GL.isContextLost(), stage:G.stage};
        }""")

    s0=sanity()
    page.screenshot(path='tmp/_trackd_visual_stage0.png')
    # transitions, check non-black each
    seq=[]
    for si in [1,2,3,0]:
        page.evaluate("(si)=>{G.stage=si;initStage(si);buildMapCache();}",si)
        page.wait_for_timeout(600)
        seq.append(sanity())
    page.screenshot(path='tmp/_trackd_visual_after.png')

    print('==== TRACK D VISUAL ====')
    print(json.dumps({'reached_gameplay':on,'stage0':s0,'transitions':seq,'pageerrors':errs},indent=2))
    browser.close()
