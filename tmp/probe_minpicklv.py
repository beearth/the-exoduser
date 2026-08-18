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

    # 1. threshold helper values
    thr = page.evaluate("""() => { const out={}; for(const t of [0,1,2,4,6,7]){ OPT.minPickLvTier=t; out[t]=_minPickLvThr(); } OPT.minPickLvTier=0; return out; }""")

    # 2. real rollDrop path: at a given P.lv, reqLv = max(0, floor(lv/10)*10 - 10).
    #    force many drops on a mock enemy; count how many world items slip past filter (should honor reqLv>=thr).
    def drop_run(plv, tier):
        return page.evaluate("""([plv,tier]) => {
          P.lv=plv; OPT.minPickLvTier=tier;
          // clear world items
          if(typeof worldItems!=='undefined') worldItems.length=0;
          const e={x:200,y:200,etype:1,ib:false,elite:0,dropTier:4, id:1};
          let added=0, minReq=1e9, maxReq=-1, below=0;
          const thr=_minPickLvThr();
          for(let i=0;i<300;i++){ try{ rollDrop(e); }catch(err){ return {error:String(err)}; } }
          for(const w of worldItems){ if(w.type==='item'&&w.item){ added++; const r=w.item.reqLv||0; minReq=Math.min(minReq,r); maxReq=Math.max(maxReq,r); if(r<thr)below++; } }
          const expectedReq=Math.max(0,Math.floor(plv/10)*10-10);
          worldItems.length=0;
          return {plv, tier, thr, expectedReq, added, minReq:(added?minReq:null), maxReq:(added?maxReq:null), belowThreshold:below};
        }""", [plv, tier])

    # low-level char (reqLv=40): with tier filter 2 (thr=100) -> all filtered; tier 0 -> all kept
    r_low_off  = drop_run(50, 0)   # reqLv40, off -> items drop
    r_low_t2   = drop_run(50, 2)   # reqLv40 < thr100 -> filtered (added ~0)
    # high-level char (reqLv=490): tier 2 (thr100) keeps; tier 6 (thr500) filters
    r_hi_t2    = drop_run(500, 2)  # reqLv490 >= 100 -> kept
    r_hi_t6    = drop_run(500, 6)  # reqLv490 < 500 -> filtered
    page.evaluate("()=>{ OPT.minPickLvTier=0; P.lv=500; if(typeof worldItems!=='undefined')worldItems.length=0; }")

    # 3. regression: stage transitions
    trans = page.evaluate("""() => { let r=[]; for(const si of [1,2,3,0]){ try{G.stage=si;initStage(si);buildMapCache();r.push({si,ok:true});}catch(e){r.push({si,ok:false,e:String(e)});} } return r; }""")

    print('==== MINPICKLV VERIFY (port '+PORT+') ====')
    print(json.dumps({
      'reached_gameplay':on,
      'threshold_values':thr,
      'drop_low_off':r_low_off, 'drop_low_tier2':r_low_t2,
      'drop_high_tier2':r_hi_t2, 'drop_high_tier6':r_hi_t6,
      'transitions':trans, 'pageerrors':errs, 'console_errors':console[:8],
    }, indent=2, ensure_ascii=False))
    browser.close()
