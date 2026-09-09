"""Brief map introduction: current authored environments, free camera, no combat."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright,TimeoutError as PlaywrightTimeout
import recapture_trailer_voice_20260909 as capture

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tmp/map_intro_20260909'
SHOTS=[
 dict(name='forest_tree',stage=0,landmark='m_c1tree',offset=[0,-220],move=[140,-90],duration=4),
 dict(name='hive_carapace',stage=4,landmark='m_c2hiveWall',offset=[360,-40],move=[-170,-100],duration=3.5),
 dict(name='hive_deep',stage=4,landmark='m_c2deepHive',offset=[220,-70],move=[160,-100],duration=3.5),
 dict(name='hive_gate',stage=4,landmark='m_c2exitFrame',offset=[0,-70],move=[90,-150],duration=3.5),
 dict(name='winter_carcass',stage=10,landmark='m_c3hellcarcass',offset=[140,-90],move=[-180,-60],duration=4),
 dict(name='winter_ritual',stage=10,landmark='m_c3hellritual',offset=[-80,-70],move=[150,-90],duration=4),
 dict(name='winter_gate',stage=10,landmark='m_c3wall_gate',offset=[0,-70],move=[0,-150],duration=4),
]

def boot(browser,stage,errors,missing):
    context=browser.new_context(viewport={'width':1920,'height':1080})
    page=context.new_page()
    page.add_init_script("localStorage.setItem('_charIdx','1')")
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status==404 else None)
    # stage=0 opts into the separate plate experiment; omit it for the live CH1 map.
    stage_query=f'&stage={stage}' if stage else ''
    page.goto(f'http://localhost:3333/game.html?testchar=1{stage_query}',wait_until='domcontentloaded',timeout=120000)
    page.wait_for_function("typeof G!=='undefined'&&G.on&&P.lv===500",timeout=180000)
    page.evaluate("G.on=true;G.paused=true;_dbReady=false;_charId=null;BGM.stop();OPT.bgmVol=0;OPT.sfxVol=0;OPT.fpsCap=60;OPT.lang='en';")
    try:page.wait_for_load_state('networkidle',timeout=30000)
    except PlaywrightTimeout:pass # Visible sprite readiness below is the capture gate.
    page.evaluate("async()=>{if(typeof _waitObjSprites==='function')await _waitObjSprites(12000);await actx().resume();}")
    page.evaluate(capture.INSTALL)
    page.evaluate("""()=>{
      ens.length=0;projs.length=0;pProjs.length=0;worldItems.length=0;
      G.spawnHoles=[];G.rifts=[];G.pets=null;G._fieldBosses=[];G._fieldBoss=null;G._fireDevils=[];
      G._irisOff=true;G._intro=false;G._flashT=0;G.shake=0;G.txts=[];G._fireZones=[];
      _vfxAnims.length=0;_fireExps.length=0;_corpses.forEach(c=>c.active=false);
      P.x=-10000;P.y=-10000;_prevPx=P.x;_prevPy=P.y;P.iframes=0;P.s='idle';P.skills.holyDome=0;P._hdT=0;mouse.x=-100;mouse.y=-100;
      for(const name of ['fillText','strokeText'])X[name]=()=>{};
      window.__mapCam=null;
      const original=draw;
      draw=function(){
        const s=window.__mapCam;
        if(s){let f=__rt.active?Math.min(1,(performance.now()-__rt.start)/1000/__rt.seconds):0;f=f*f*(3-2*f);G.cam.x=s[0]+(s[2]-s[0])*f;G.cam.y=s[1]+(s[3]-s[1])*f;}
        return original.apply(this,arguments);
      };
      return true;
    }""")
    return context,page

def frame(page,path):
    # Same game layers as the final capture; DOM HUD is intentionally outside the frame.
    import base64
    data=page.evaluate("""()=>{const c=__rt.canvas,x=__rt.ctx;x.fillStyle='#000';x.fillRect(0,0,1920,1080);for(const id of ['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs']){const a=document.getElementById(id);if(a&&a.width&&a.height&&getComputedStyle(a).display!=='none')x.drawImage(a,0,0,1920,1080);}return c.toDataURL('image/png').split(',')[1]}""")
    path.write_bytes(base64.b64decode(data))

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--preview',action='store_true');ap.add_argument('--only',nargs='*');args=ap.parse_args()
    OUT.mkdir(parents=True,exist_ok=True);capture.OUT=OUT
    errors=[];missing=[];results=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True,args=['--autoplay-policy=no-user-gesture-required','--ignore-gpu-blocklist'])
        try:
            for stage in sorted({s['stage'] for s in SHOTS if not args.only or s['name'] in args.only}):
                context,page=boot(browser,stage,errors,missing)
                try:
                    for s in SHOTS:
                        if s['stage']!=stage or (args.only and s['name'] not in args.only):continue
                        result=page.evaluate("""s=>{
                          const candidates=MAP_OBJS.filter(o=>o.type===s.landmark).sort((a,b)=>a.y-b.y);
                          const o=candidates[0];if(!o)throw Error('Missing authored landmark '+s.landmark);
                          const x=o.x+s.offset[0],y=o.y+s.offset[1];__mapCam=[x,y,x+s.move[0],y+s.move[1]];
                          G.cam.x=x;G.cam.y=y;
                          return {stage:G.stage,landmark:s.landmark,anchor:[o.x,o.y],camera:__mapCam,objects:MAP_OBJS.length};
                        }""",s)
                        page.wait_for_function("id=>{const s=_OBJ_SPR[id];return s&&(s.width>0||s.naturalWidth>0)}",arg=s['landmark'],timeout=60000)
                        page.wait_for_timeout(2200)
                        frame(page,OUT/(s['name']+'_preview.png'))
                        if not args.preview:
                            result['recording']=capture.record(page,s['name'],6,protect=False)
                            frame(page,OUT/(s['name']+'_end.png'))
                        results.append(dict(name=s['name'],**result))
                        print(json.dumps(results[-1]),flush=True)
                finally:context.close()
        finally:browser.close()
    report=dict(shots=results,pageErrors=errors,missing404=sorted(set(missing)))
    (OUT/('preview_report.json' if args.preview else 'capture_report.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    if errors or missing:raise RuntimeError(report)

if __name__=='__main__':main()
